import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyPendingRowEdit,
  orderArchiveNewestFirst,
  serializeTasksBaseline,
  tasksMatchBaseline,
} from "@/features/tasks/services/appTasksDomain";
import {
  archiveActiveTaskAtIndex,
  fetchActiveTasks,
  fetchArchiveTasks,
  replaceActiveTasks,
  restoreArchiveTask,
} from "@/features/tasks/services/appTasksApiService";
import type {
  ActiveTaskStatus,
  AppTask,
  SaveFeedback,
  TextAutosaveStatus,
} from "@/features/tasks/types/appTask.types";

const TEXT_SAVE_DEBOUNCE_MS = 1000;
const AUTOSAVE_SAVED_MS = 2000;

type TasksView = "active" | "archive";

type PersistOptions = {
  successFeedback?: SaveFeedback;
  /** Text autosave — no blocking snackbar; uses textAutosaveStatus instead. */
  silent?: boolean;
};

export const useAppTasksBacklog = (enabled: boolean) => {
  const [view, setView] = useState<TasksView>("active");
  const [activeTasks, setActiveTasks] = useState<AppTask[]>([]);
  const [archiveTasks, setArchiveTasks] = useState<AppTask[]>([]);
  const [feedback, setFeedback] = useState<SaveFeedback>("idle");
  const [textAutosaveStatus, setTextAutosaveStatus] = useState<TextAutosaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeBaselineRef = useRef("");
  const activeTasksRef = useRef<AppTask[]>([]);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingActiveRef = useRef<AppTask[] | null>(null);
  const autosaveSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistChainRef = useRef<Promise<boolean>>(Promise.resolve(true));

  useEffect(() => {
    activeTasksRef.current = activeTasks;
  }, [activeTasks]);

  const cancelTextSaveTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const readActiveTasksSnapshot = useCallback(
    (): AppTask[] => pendingActiveRef.current ?? activeTasksRef.current,
    []
  );

  const setFeedbackTimed = useCallback((next: SaveFeedback) => {
    setFeedback(next);
    if (next === "saved" || next === "archived" || next === "restored") {
      window.setTimeout(() => setFeedback("idle"), 2000);
    }
  }, []);

  const markTextAutosaved = useCallback(() => {
    if (autosaveSavedTimerRef.current) {
      clearTimeout(autosaveSavedTimerRef.current);
    }
    setTextAutosaveStatus("saved");
    autosaveSavedTimerRef.current = setTimeout(() => {
      setTextAutosaveStatus("idle");
      autosaveSavedTimerRef.current = null;
    }, AUTOSAVE_SAVED_MS);
  }, []);

  const loadActive = useCallback(async () => {
    const tasks = await fetchActiveTasks();
    setActiveTasks(tasks);
    activeTasksRef.current = tasks;
    activeBaselineRef.current = serializeTasksBaseline(tasks);
    pendingActiveRef.current = null;
    return tasks;
  }, []);

  const loadArchive = useCallback(async () => {
    const tasks = await fetchArchiveTasks();
    setArchiveTasks(tasks);
    return tasks;
  }, []);

  const reloadForView = useCallback(async () => {
    if (!enabled) return;
    setErrorMessage(null);
    try {
      if (view === "active") {
        await loadActive();
      } else {
        await loadArchive();
      }
    } catch (error) {
      setFeedback("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to load tasks.");
    }
  }, [enabled, view, loadActive, loadArchive]);

  useEffect(() => {
    if (!enabled) return;
    void reloadForView();
  }, [enabled, reloadForView]);

  useEffect(() => {
    if (!enabled) return;
    const onFocus = () => {
      if (pendingActiveRef.current) return;
      void reloadForView();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enabled, reloadForView]);

  useEffect(
    () => () => {
      if (autosaveSavedTimerRef.current) {
        clearTimeout(autosaveSavedTimerRef.current);
      }
    },
    []
  );

  const assertNoConflict = useCallback(async (): Promise<boolean> => {
    const disk = await fetchActiveTasks();
    if (!tasksMatchBaseline(disk, activeBaselineRef.current)) {
      setActiveTasks(disk);
      activeTasksRef.current = disk;
      activeBaselineRef.current = serializeTasksBaseline(disk);
      pendingActiveRef.current = null;
      setTextAutosaveStatus("idle");
      setFeedback("error");
      setErrorMessage("Backlog changed on disk. Reloaded — retry your edit.");
      return false;
    }
    return true;
  }, []);

  const applyPersistResult = useCallback((saved: AppTask[], sentTasks: AppTask[]): boolean => {
    const savedSerialized = serializeTasksBaseline(saved);
    const sentSerialized = serializeTasksBaseline(sentTasks);
    const pendingNow = pendingActiveRef.current;

    activeBaselineRef.current = savedSerialized;

    if (pendingNow === null || serializeTasksBaseline(pendingNow) === sentSerialized) {
      setActiveTasks(saved);
      activeTasksRef.current = saved;
      pendingActiveRef.current = null;
      return false;
    }

    return true;
  }, []);

  const persistActive = useCallback(
    (tasks: AppTask[], options?: PersistOptions): Promise<boolean> => {
      const { successFeedback = "saved", silent = false } = options ?? {};

      const run = async (): Promise<boolean> => {
        if (!enabled) return false;
        if (silent) {
          setTextAutosaveStatus("pending");
        } else {
          setFeedback("saving");
        }
        setErrorMessage(null);
        const ok = await assertNoConflict();
        if (!ok) return false;
        try {
          const saved = await replaceActiveTasks(tasks);
          const hasNewerEdits = applyPersistResult(saved, tasks);

          if (!silent) {
            setFeedbackTimed(successFeedback);
          } else if (hasNewerEdits) {
            setTextAutosaveStatus("pending");
          } else {
            markTextAutosaved();
          }

          if (hasNewerEdits && pendingActiveRef.current) {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
              const pending = pendingActiveRef.current;
              if (pending) {
                void persistActive(pending, { silent: true });
              }
            }, TEXT_SAVE_DEBOUNCE_MS);
          }

          return true;
        } catch (error) {
          setTextAutosaveStatus("idle");
          setFeedback("error");
          setErrorMessage(error instanceof Error ? error.message : String(error));
          await loadActive();
          return false;
        }
      };

      persistChainRef.current = persistChainRef.current.then(() => run());
      return persistChainRef.current;
    },
    [enabled, assertNoConflict, applyPersistResult, loadActive, setFeedbackTimed, markTextAutosaved]
  );

  const flushDebounced = useCallback(async () => {
    cancelTextSaveTimer();
    const pending = pendingActiveRef.current;
    if (!pending) return;
    await persistActive(pending, { silent: true });
  }, [cancelTextSaveTimer, persistActive]);

  const scheduleTextSave = useCallback(
    (tasks: AppTask[]) => {
      pendingActiveRef.current = tasks;
      setTextAutosaveStatus("pending");
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const pending = pendingActiveRef.current;
        if (pending) {
          void persistActive(pending, { silent: true });
        }
      }, TEXT_SAVE_DEBOUNCE_MS);
    },
    [persistActive]
  );

  const updateRowText = useCallback(
    (rowIndex: number, patch: Partial<Pick<AppTask, "title" | "description">>) => {
      const base = pendingActiveRef.current ?? activeTasksRef.current;
      const next = applyPendingRowEdit(base, rowIndex, patch);
      scheduleTextSave(next);
    },
    [scheduleTextSave]
  );

  const flushRowText = useCallback(
    async (rowIndex: number, patch: Partial<Pick<AppTask, "title" | "description">>) => {
      const snapshot = applyPendingRowEdit(
        pendingActiveRef.current ?? activeTasksRef.current,
        rowIndex,
        patch
      );
      pendingActiveRef.current = snapshot;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      await persistActive(snapshot, { silent: true });
    },
    [persistActive]
  );

  const changeView = useCallback(
    async (next: TasksView) => {
      await flushDebounced();
      setView(next);
      setErrorMessage(null);
      if (!enabled) return;
      if (next === "active") {
        await loadActive();
      } else {
        await loadArchive();
      }
    },
    [enabled, flushDebounced, loadActive, loadArchive]
  );

  const setStatusAt = useCallback(
    async (index: number, status: AppTask["status"]) => {
      await flushDebounced();
      if (status === "done") {
        setFeedback("saving");
        setErrorMessage(null);
        const ok = await assertNoConflict();
        if (!ok) return;
        try {
          const result = await archiveActiveTaskAtIndex(index);
          setActiveTasks(result.active);
          activeBaselineRef.current = serializeTasksBaseline(result.active);
          setFeedbackTimed("archived");
        } catch (error) {
          setFeedback("error");
          setErrorMessage(error instanceof Error ? error.message : String(error));
          await loadActive();
        }
        return;
      }
      const next = activeTasksRef.current.map((task, i) =>
        i === index ? { ...task, status } : task
      );
      await persistActive(next);
    },
    [assertNoConflict, flushDebounced, loadActive, persistActive, setFeedbackTimed]
  );

  const reorderActive = useCallback(
    async (fromIndex: number, toIndex: number) => {
      await flushDebounced();
      const next = [...activeTasksRef.current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      await persistActive(next);
    },
    [flushDebounced, persistActive]
  );

  const deleteActiveAt = useCallback(
    async (index: number) => {
      cancelTextSaveTimer();
      const base = readActiveTasksSnapshot();
      if (index < 0 || index >= base.length) {
        return;
      }
      const next = base.filter((_, i) => i !== index);
      pendingActiveRef.current = null;
      await persistActive(next);
    },
    [cancelTextSaveTimer, persistActive, readActiveTasksSnapshot]
  );

  const addTask = useCallback(async () => {
    cancelTextSaveTimer();
    const base = readActiveTasksSnapshot();
    pendingActiveRef.current = null;
    const next: AppTask[] = [...base, { title: "New task", description: "", status: "to-do" }];
    await persistActive(next);
  }, [cancelTextSaveTimer, persistActive, readActiveTasksSnapshot]);

  const restoreAt = useCallback(
    async (displayIndex: number, status: ActiveTaskStatus) => {
      setFeedback("saving");
      setErrorMessage(null);
      try {
        const result = await restoreArchiveTask(displayIndex, status);
        setActiveTasks(result.active);
        activeBaselineRef.current = serializeTasksBaseline(result.active);
        setArchiveTasks(orderArchiveNewestFirst(result.archive));
        setFeedbackTimed("restored");
      } catch (error) {
        setFeedback("error");
        setErrorMessage(error instanceof Error ? error.message : String(error));
        await loadArchive();
      }
    },
    [loadArchive, setFeedbackTimed]
  );

  const clearFeedback = useCallback(() => {
    setFeedback("idle");
    setErrorMessage(null);
  }, []);

  return {
    view,
    activeTasks,
    archiveTasks,
    feedback,
    textAutosaveStatus,
    errorMessage,
    clearFeedback,
    changeView,
    updateRowText,
    flushRowText,
    setStatusAt,
    reorderActive,
    deleteActiveAt,
    addTask,
    restoreAt,
    reloadForView,
  };
};
