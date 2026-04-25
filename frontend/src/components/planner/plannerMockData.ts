import type { Task, CalendarEvent } from "./plannerTypes";

export const INITIAL_TASKS: Task[] = [
  { id: 1, title: "Kerjakan Laporan Capstone",  deadline: "hari ini 23:59", deadlineColor: "text-[#e07b72]", duration: "2 jam",  category: "Akademik", priority: "Tinggi", completed: false },
  { id: 2, title: "Belajar Statistik UTS",       deadline: "besok",          duration: "3 jam",  category: "Akademik", priority: "Tinggi", completed: false },
  { id: 3, title: "Presentasi Seminar KP",       deadline: "3 hari lagi",    duration: "2 jam",  category: "Akademik", priority: "Tinggi", completed: false },
  { id: 4, title: "Meeting Tim KKN",             deadline: "Senin",          duration: "1 jam",  category: "Kerja",    priority: "Sedang", completed: false },
  { id: 5, title: "Review kode teman",           deadline: "Selasa",         duration: "45 mnt", category: "Kerja",    priority: "Sedang", completed: true  },
  { id: 6, title: "Telepon mama",                deadline: "minggu ini",     duration: "30 mnt", category: "Personal", priority: "Rendah", completed: false },
  { id: 7, title: "Beli perlengkapan tugas",     deadline: "pekan ini",      duration: "1 jam",  category: "Lainnya",  priority: "Rendah", completed: false },
];

/** dayIndex = offset from Monday of the CURRENT week (0=Mon…6=Sun) */
export const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 1,  title: "Kerjakan Laporan Capstone", startHour: 7,     endHour: 10,    dayIndex: 0, color: "red",   deadline: "hari ini 23:59", hasAI: true  },
  { id: 2,  title: "Kuliah MKWK",               startHour: 10.75, endHour: 13.5,  dayIndex: 0, color: "blue"                                            },
  { id: 3,  title: "Belajar Statistik",          startHour: 14,    endHour: 17.5,  dayIndex: 0, color: "red",   hasAI: true                               },
  { id: 4,  title: "Senior Project",             startHour: 8.5,   endHour: 14.25, dayIndex: 1, color: "blue"                                            },
  { id: 5,  title: "Review Kode Teman",          startHour: 9,     endHour: 10,    dayIndex: 2, color: "green"                                            },
  { id: 6,  title: "Meeting Tim KKN",            startHour: 10,    endHour: 11.5,  dayIndex: 2, color: "green"                                            },
  { id: 7,  title: "Presentasi Seminar KP",      startHour: 13,    endHour: 15,    dayIndex: 3, color: "red",   hasAI: true                               },
  { id: 8,  title: "Beli Perlengkapan Tugas",    startHour: 16,    endHour: 18.25, dayIndex: 4, color: "gray",  hasAI: true                               },
  { id: 9,  title: "Reuni SMA",                  startHour: 18,    endHour: 21,    dayIndex: 5, color: "green"                                            },
  { id: 10, title: "Review Mingguan",             startHour: 9,     endHour: 11,    dayIndex: 6, color: "gray"                                             },
];

export const STREAK_DAYS: { label: string; active: boolean; current?: boolean }[] = [
  { label: "S", active: true  },
  { label: "M", active: true  },
  { label: "S", active: true  },
  { label: "R", active: false },
  { label: "K", active: false, current: true },
  { label: "J", active: false },
  { label: "S", active: false },
];