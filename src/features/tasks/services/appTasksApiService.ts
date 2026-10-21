import type { ActiveTaskStatus, AppTask } from "@/features/tasks/types/appTask.types";
import { parseActiveTasks, parseArchiveTasks } from "@/features/tasks/services/appTasksDomain";

const ACTIVE_URL = "/__dev/tasks";
const ARCHIVE_URL = "/__dev/tasks/archive";
const RESTORE_URL = "/__dev/tasks/restore";

interface TaskListsSnapshot {
  active: AppTask[];
  archive: AppTask[];
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : `Request failed (${response.status})`
    );
  }
  return data;
}

export const fetchActiveTasks = async (): Promise<AppTask[]> => {
  const data = await parseJson<{ tasks: unknown }>(await fetch(ACTIVE_URL));
  return parseActiveTasks(data.tasks);
};

export const fetchArchiveTasks = async (): Promise<AppTask[]> => {
  const data = await parseJson<{ tasks: unknown }>(await fetch(ARCHIVE_URL));
  return parseArchiveTasks(data.tasks);
};

export const replaceActiveTasks = async (tasks: AppTask[]): Promise<AppTask[]> => {
  const data = await parseJson<{ tasks: unknown }>(
    await fetch(ACTIVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    })
  );
  return parseActiveTasks(data.tasks);
};

export const archiveActiveTaskAtIndex = async (index: number): Promise<TaskListsSnapshot> => {
  const data = await parseJson<{ active: unknown; archive: unknown }>(
    await fetch(ARCHIVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    })
  );
  return {
    active: parseActiveTasks(data.active),
    archive: parseArchiveTasks(data.archive),
  };
};

export const restoreArchiveTask = async (
  displayIndex: number,
  status: ActiveTaskStatus
): Promise<TaskListsSnapshot> => {
  const data = await parseJson<{ active: unknown; archive: unknown }>(
    await fetch(RESTORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayIndex, status }),
    })
  );
  return {
    active: parseActiveTasks(data.active),
    archive: parseArchiveTasks(data.archive),
  };
};
