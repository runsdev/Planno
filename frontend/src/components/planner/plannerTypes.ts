export type Priority = "Tinggi" | "Sedang" | "Rendah";
export type Category = "Akademik" | "Kerja" | "Personal" | "Lainnya";
export type FilterType =
  | "Semua"
  | "Belum Selesai"
  | "Selesai"
  | "Akademik"
  | "Kerja"
  | "Personal"
  | "Lainnya";

export interface Task {
  id: string;
  title: string;
  deadline: string;
  deadlineColor?: string;
  duration: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  // Waktu aktual dari focus session (detik), diisi saat Tandai Selesai
  actualSeconds?: number;
}

// ... sisanya tidak berubah
export interface CalendarEvent {
  id: number;
  title: string;
  startHour: number;
  endHour: number;
  dayIndex: number;
  color: "red" | "blue" | "gray" | "green";
  deadline?: string;
  hasAI?: boolean;
}

export const FILTERS: FilterType[] = [
  "Semua",
  "Belum Selesai",
  "Selesai",
  "Akademik",
  "Kerja",
  "Personal",
  "Lainnya",
];

export const CAL_START = 7;
export const CAL_END = 22;
export const HOUR_H = 64;
export const GRID_TOP = 20;
export const TIME_COL_W = 56;
