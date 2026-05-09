const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Task Parser ───────────────────────────────────────────────────────────────

export interface ParseTaskResponse {
  success: boolean;
  raw_input?: string;
  title?: string | null;
  deadline?: string | null;
  duration_minutes?: number | null;
  category?: string | null;
  error?: string | null;
}

export interface ScoreTaskResponse {
  priority_score: number;
  quadrant: string;
  urgency: string;
  importance: string;
}

// ── Onboarding ────────────────────────────────────────────────────────────────

export interface OnboardingConfig {
  energy_pattern: Record<string, number>;
  work_start: string;
  work_end: string;
  focus_duration_minutes: number;
  break_interval_minutes: number;
  procrastination_threshold: number;
  work_style: string;
  task_type: string;
  briefing_tone: string;
}

// ── Briefing ──────────────────────────────────────────────────────────────────

export interface BriefingTask {
  title: string;
  deadline?: string | null;
  priority_score?: number | null;
  category?: string | null;
}

export interface BriefingResponse {
  success: boolean;
  briefing_text?: string | null;
  top_tasks?: BriefingTask[] | null;
  peak_hours?: string[] | null;
  generated_at?: string | null;
  error?: string | null;
}

// ── API object ────────────────────────────────────────────────────────────────

export const api = {
  parseTask: (rawInput: string) =>
    post<ParseTaskResponse>("/api/tasks/parse", { raw_input: rawInput }),

  scoreTask: (data: {
    deadline?: string | null;
    importance: string;
    duration_minutes?: number | null;
    reschedule_count?: number;
  }) => post<ScoreTaskResponse>("/api/tasks/score", data),

  parseOnboarding: (prefs: {
    focusTime: string;
    workStyle: string;
    workHours: { start: string; end: string };
    focusDuration: string;
    taskType: string;
  }) => post<OnboardingConfig>("/api/onboarding/parse", prefs),

  generateBriefing: (data: {
    user_name: string;
    top_tasks: BriefingTask[];
    peak_hours: string[];
    procrastination_flags?: BriefingTask[];
    completion_rate?: number;
  }) => post<BriefingResponse>("/api/briefing/generate", data),

  simpleBriefing: (data: { user_name: string; top_tasks: BriefingTask[] }) =>
    post<{ briefing_text: string }>("/api/briefing/simple", data),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get peak hours (top-3 most energetic) from a stored AI config. */
export function getPeakHoursFromConfig(config: OnboardingConfig): string[] {
  const pattern = config.energy_pattern ?? {};
  return Object.entries(pattern)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([h]) => `${h}:00`);
}

/** Load stored AI config from localStorage (returns null if missing). */
export function loadAIConfig(): OnboardingConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("planno_ai_config");
    return raw ? (JSON.parse(raw) as OnboardingConfig) : null;
  } catch {
    return null;
  }
}
