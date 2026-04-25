export type Priority = "Tinggi" | "Sedang" | "Rendah";
export type Category = "Akademik" | "Kerja" | "Personal" | "Lainnya";
export type FilterType =
  | "Semua" | "Belum Selesai" | "Selesai"
  | "Akademik" | "Kerja" | "Personal" | "Lainnya";

export interface Task {
  id: number;
  title: string;
  deadline: string;
  deadlineColor?: string;
  duration: string;
  category: Category;
  priority: Priority;
  completed: boolean;
}

export interface CalendarEvent {
  id: number;
  title: string;
  startHour: number;
  endHour: number;
  /** 0 = Mon … 6 = Sun of the *current* week */
  dayIndex: number;
  color: "red" | "blue" | "gray" | "green";
  deadline?: string;
  hasAI?: boolean;
}

export const FILTERS: FilterType[] = [
  "Semua", "Belum Selesai", "Selesai",
  "Akademik", "Kerja", "Personal", "Lainnya",
];

export const CAL_START   = 7;
export const CAL_END     = 22;
export const HOUR_H      = 64;   // px per hour
export const GRID_TOP    = 20;   // px top padding in grid
export const TIME_COL_W  = 56;   // px width of time label column