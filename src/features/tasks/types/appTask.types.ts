/**
 * In-repo dev backlog SSOT (coding agents + /tasks UI):
 * - Active: src/config/app-tasks.json (to-do | in-progress only)
 * - Archive: src/config/app-tasks-archive.json (status done only)
 */

export type ActiveTaskStatus = "to-do" | "in-progress";
export type TaskStatus = ActiveTaskStatus | "done";

export interface AppTask {
  title: string;
  description: string;
  status: TaskStatus;
}

export type SaveFeedback = "idle" | "saving" | "saved" | "archived" | "restored" | "error";

/** Background text autosave — subtle UI only (not the main snackbar). */
export type TextAutosaveStatus = "idle" | "pending" | "saved";
