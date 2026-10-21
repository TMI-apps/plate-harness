import type { AppTask } from "@/features/tasks/types/appTask.types";

export const TASK_STATUS_OPTIONS: AppTask["status"][] = ["to-do", "in-progress", "done"];

export const TASK_STATUS_LABEL: Record<AppTask["status"], string> = {
  "to-do": "To do",
  "in-progress": "Active",
  done: "Done",
};

/**
 * Min width for the small outlined status Select.
 * Fits "Active" without ellipsis (`.MuiSelect-select` scrollWidth ≈ 95px at 16px root).
 */
export const TASK_STATUS_SELECT_MIN_WIDTH = "6rem";

export const TASK_STATUS_COLOR: Record<AppTask["status"], string> = {
  "to-do": "text.secondary",
  "in-progress": "warning.main",
  done: "success.main",
};
