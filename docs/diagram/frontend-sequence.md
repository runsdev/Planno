# Frontend Sequence Diagrams

## 1. Authentication Flow (Google OAuth)

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant Middleware as Next.js Middleware
    participant NextAuth as NextAuth.js (/api/auth)
    participant Google as Google OAuth
    participant Prisma as Prisma (MongoDB)
    participant JWT as JWT Session

    Browser->>Middleware: GET /planner (unauthenticated)
    Middleware->>Middleware: check session (auth())
    Middleware-->>Browser: 302 redirect /auth/login?callbackUrl=/planner
    Browser->>Browser: render LoginPage
    Browser->>NextAuth: signIn("google")
    NextAuth->>Google: OAuth2 authorization redirect
    Google-->>Browser: consent screen
    Browser->>Google: user grants consent
    Google-->>NextAuth: authorization code + user info
    NextAuth->>Prisma: upsert User record
    Prisma-->>NextAuth: user {id, name, email}
    NextAuth->>Prisma: check UserPreferences (onboardingCompleted)
    Prisma-->>NextAuth: preferences record (or null)
    NextAuth->>JWT: sign JWT {id, onboardingCompleted}
    JWT-->>Browser: Set-Cookie: session token
    Browser->>Middleware: GET /planner (authenticated)
    Middleware->>Middleware: decode JWT → onboardingCompleted=false?
    Middleware-->>Browser: 302 redirect /onboarding
```

## 2. Onboarding Flow

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant OnboardingPage as OnboardingPage
    participant ProfileAPI as /api/profile (Next.js)
    participant BackendAPI as FastAPI Backend
    participant Prisma as Prisma (MongoDB)
    participant LocalStorage as localStorage

    Browser->>OnboardingPage: render /onboarding
    OnboardingPage->>OnboardingPage: user fills 5 preference questions<br/>(focusTime, workStyle, workHours,<br/>focusDuration, taskType)
    OnboardingPage->>OnboardingPage: handleSubmit() — validate isComplete
    OnboardingPage->>ProfileAPI: PATCH /api/profile<br/>{preferences: {...}}
    ProfileAPI->>Prisma: userPreferences.upsert(userId, prefs)
    Prisma-->>ProfileAPI: saved UserPreferences
    ProfileAPI-->>OnboardingPage: 200 OK
    OnboardingPage->>BackendAPI: POST /api/onboarding/parse<br/>{focusTime, workStyle, workHours,<br/>focusDuration, taskType}
    BackendAPI-->>OnboardingPage: OnboardingConfig<br/>{energy_pattern, focus_duration_minutes,<br/>break_interval_minutes, ...}
    OnboardingPage->>LocalStorage: setItem("planno_preferences", prefs)
    OnboardingPage->>LocalStorage: setItem("planno_ai_config", config)
    OnboardingPage->>OnboardingPage: updateSession() — refresh JWT
    Note over OnboardingPage: JWT now has onboardingCompleted=true
    OnboardingPage->>Browser: router.push("/planner")
```

## 3. Add Task Flow (AI Parse + Score)

```mermaid
sequenceDiagram
    participant User as User
    participant Modal as AddTaskModal
    participant BackendAPI as FastAPI Backend
    participant NextAPI as /api/tasks (Next.js)
    participant Prisma as Prisma (MongoDB)
    participant PlannerPage as PlannerPage

    User->>Modal: open Add Task modal
    Modal->>Modal: render TaskInputStep
    User->>Modal: type natural-language task description
    Modal->>Modal: parseWithAI(input)
    Modal->>BackendAPI: POST /api/tasks/parse<br/>{raw_input, client_now}
    BackendAPI-->>Modal: ParseTaskResponse<br/>{title, type, deadline, duration_minutes, category}
    Modal->>BackendAPI: POST /api/tasks/score<br/>{deadline, importance, duration_minutes,<br/>reschedule_count, type, client_now}
    BackendAPI-->>Modal: ScoreTaskResponse<br/>{priority_score, quadrant, urgency, importance}
    Modal->>Modal: map quadrant → ParsedPriority (Tinggi/Sedang/Rendah)
    Modal->>Modal: render TaskPreviewStep with parsed result
    User->>Modal: confirm task (click "Tambah Task")
    Modal->>PlannerPage: onTaskConfirmed(ParsedResult)
    PlannerPage->>NextAPI: POST /api/tasks<br/>{title, deadline, duration, category, priority}
    NextAPI->>Prisma: task.create({userId, title, deadline, ...})
    Prisma-->>NextAPI: saved Task record
    NextAPI-->>PlannerPage: 201 {task}
    PlannerPage->>PlannerPage: setTasks([...tasks, newTask])
    PlannerPage-->>User: task appears in Kanban/Calendar view
```

## 4. Planner Page Load Flow

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant PlannerPage as PlannerPage
    participant NextAPI as /api/tasks (Next.js)
    participant Prisma as Prisma (MongoDB)
    participant BackendAPI as FastAPI Backend
    participant LocalStorage as localStorage

    Browser->>PlannerPage: navigate to /planner
    PlannerPage->>NextAPI: GET /api/tasks
    NextAPI->>Prisma: task.findMany({userId, orderBy: createdAt desc})
    Prisma-->>NextAPI: Task[]
    NextAPI-->>PlannerPage: Task[]
    PlannerPage->>PlannerPage: setTasks(data)
    PlannerPage->>LocalStorage: loadAIConfig() → planno_ai_config
    LocalStorage-->>PlannerPage: OnboardingConfig (energy_pattern, peak_hours)
    PlannerPage->>BackendAPI: POST /api/briefing/generate<br/>{user_name, top_tasks, peak_hours, ...}
    BackendAPI-->>PlannerPage: BriefingResponse {briefing_text}
    PlannerPage->>PlannerPage: render RightSidebar with AI briefing
    PlannerPage->>PlannerPage: render KanbanView / CalendarView with tasks
```

## 5. Task Update / Delete Flow

```mermaid
sequenceDiagram
    participant User as User
    participant PlannerPage as PlannerPage
    participant NextAPI as /api/tasks/:id (Next.js)
    participant Prisma as Prisma (MongoDB)

    User->>PlannerPage: toggle task completed checkbox
    PlannerPage->>PlannerPage: optimistic setTasks update
    PlannerPage->>NextAPI: PATCH /api/tasks/:id<br/>{completed: true, completedAt: now}
    NextAPI->>Prisma: task.findUnique({id}) — verify ownership
    Prisma-->>NextAPI: existing task
    NextAPI->>Prisma: task.update({completed, completedAt})
    Prisma-->>NextAPI: updated Task
    NextAPI-->>PlannerPage: 200 updated Task

    User->>PlannerPage: delete task
    PlannerPage->>NextAPI: DELETE /api/tasks/:id
    NextAPI->>Prisma: task.findUnique({id}) — verify ownership
    Prisma-->>NextAPI: existing task
    NextAPI->>Prisma: task.delete({id})
    Prisma-->>NextAPI: deleted
    NextAPI-->>PlannerPage: 200 {success: true}
    PlannerPage->>PlannerPage: setTasks(tasks.filter(t => t.id !== id))
```

## 6. Focus Session Flow

```mermaid
sequenceDiagram
    participant User as User
    participant FocusModal as FocusModal
    participant PlannerPage as PlannerPage
    participant NextAPI as /api/tasks/:id (Next.js)
    participant Prisma as Prisma (MongoDB)

    User->>FocusModal: open Focus modal, select preset (25/50/90 min)
    FocusModal->>FocusModal: render FocusTaskSearch — user picks task
    User->>FocusModal: start timer
    FocusModal->>FocusModal: FocusTimer countdown loop (focus phase)
    Note over FocusModal: every tick → currentSessionSeconds++
    FocusModal->>FocusModal: timer expires → switch to break phase
    FocusModal->>PlannerPage: onSessionFinished(taskId, addedSeconds)
    PlannerPage->>PlannerPage: update taskProgress state (completedSessions++)
    PlannerPage->>NextAPI: PATCH /api/tasks/:id<br/>{actualSeconds: totalFocusSeconds}
    NextAPI->>Prisma: task.update({actualSeconds})
    Prisma-->>NextAPI: updated Task
    User->>FocusModal: click "Selesai" (Mark Complete)
    FocusModal->>PlannerPage: onMarkComplete(taskId, totalSeconds)
    PlannerPage->>NextAPI: PATCH /api/tasks/:id<br/>{completed: true, actualSeconds: totalSeconds}
    NextAPI->>Prisma: task.update({completed: true, completedAt, actualSeconds})
    Prisma-->>NextAPI: updated Task
    NextAPI-->>PlannerPage: 200 updated Task
    PlannerPage->>PlannerPage: setTasks — mark task completed
```

## 7. Settings / Profile Update Flow

```mermaid
sequenceDiagram
    participant User as User
    participant SettingsPage as SettingsPage (/settings)
    participant ProfileAPI as /api/profile (Next.js)
    participant Prisma as Prisma (MongoDB)
    participant LocalStorage as localStorage

    User->>SettingsPage: open settings page
    SettingsPage->>ProfileAPI: GET /api/profile
    ProfileAPI->>Prisma: user.findUnique + userPreferences.findUnique
    Prisma-->>ProfileAPI: {name, email, image, preferences}
    ProfileAPI-->>SettingsPage: profile data
    SettingsPage->>SettingsPage: render SettingsForm with current values
    User->>SettingsPage: update name or preferences, click Save
    SettingsPage->>ProfileAPI: PATCH /api/profile<br/>{name?, preferences?}
    ProfileAPI->>Prisma: user.update({name}) if name changed
    ProfileAPI->>Prisma: userPreferences.upsert(userId, prefs)
    Prisma-->>ProfileAPI: updated records
    ProfileAPI-->>SettingsPage: 200 OK
    SettingsPage->>LocalStorage: update planno_preferences
```
