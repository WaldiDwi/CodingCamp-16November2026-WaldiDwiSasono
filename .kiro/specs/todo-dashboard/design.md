# Design Document

## Overview

The To-Do Dashboard is a single-page application built with plain HTML, CSS, and Vanilla JavaScript. All four widgets (Greeting, Focus Timer, To-Do List, Quick Links) are always visible on screen. User data is persisted entirely via `localStorage`. The visual design is minimal/flat with a white/grey palette and a CSS-class-based dark-mode system.

The entire JavaScript surface lives in one file (`js/app.js`), organized into isolated modules via immediately-invoked function expressions (IIFEs) or plain object literals — one per widget — plus a shared `Storage` utility and a `ThemeManager`. There are no build tools, bundlers, or transpilers.

---

## Architecture

```
index.html
├── css/
│   └── style.css        ← single stylesheet; CSS custom properties for theming
└── js/
    └── app.js           ← single script; module pattern, no globals except one entry point
```

### Module Breakdown (inside `app.js`)

| Module | Responsibility |
|---|---|
| `Storage` | Thin wrappers around `localStorage.getItem` / `setItem` with JSON serialization |
| `ThemeManager` | Toggle CSS class on `<html>`, persist theme choice |
| `GreetingWidget` | Date/time display, name input, time-based greeting |
| `TimerWidget` | Pomodoro countdown, Start/Stop/Reset, custom duration |
| `TodoWidget` | Task CRUD, inline editing, completion toggle |
| `LinksWidget` | Quick Links CRUD, URL validation, new-tab launch |
| `init()` | Entry point called on `DOMContentLoaded`; boots all modules |

---

## Component Design

### `Storage` utility

```javascript
const Storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
```

Storage keys:
- `td_name` — string
- `td_theme` — `"light"` | `"dark"`
- `td_pomodoro_duration` — integer (minutes)
- `td_tasks` — array of `{ id, label, done }`
- `td_links` — array of `{ id, label, url }`

### `ThemeManager`

```javascript
const ThemeManager = {
  init() { /* read td_theme, apply class to <html>, wire toggle button */ },
  toggle() { /* flip class, persist */ },
  apply(theme) { document.documentElement.dataset.theme = theme; }
};
```

A single `data-theme` attribute on `<html>` drives all color tokens defined as CSS custom properties.

### `GreetingWidget`

```javascript
const GreetingWidget = {
  init() { /* load name, start clock tick */ },
  formatDate(date) { /* → "Monday, 16 November 2026" */ },
  formatTime(date) { /* → "14:05:32" */ },
  getGreeting(hour) { /* → one of four greeting strings */ },
  saveName(name) { /* persist, re-render */ },
  tick() { /* update date/time display every 1000 ms via setInterval */ }
};
```

Greeting hour ranges:

| Hour range | Greeting |
|---|---|
| 05 – 11 | Good Morning |
| 12 – 17 | Good Afternoon |
| 18 – 20 | Good Evening |
| 21 – 04 | Good Night |

### `TimerWidget`

```javascript
const TimerWidget = {
  duration: 25,          // minutes, loaded from storage
  remaining: 1500,       // seconds
  intervalId: null,
  init() { /* load duration, render display */ },
  formatSeconds(s) { /* → "MM:SS" */ },
  start() { /* set intervalId, decrement remaining each second */ },
  stop() { /* clearInterval */ },
  reset() { /* stop + restore remaining to duration * 60 */ },
  onComplete() { /* stop + visual/audio alert */ },
  saveDuration(minutes) { /* validate [1,60], persist, reset */ }
};
```

### `TodoWidget`

Each task object: `{ id: string, label: string, done: boolean }`

```javascript
const TodoWidget = {
  tasks: [],
  init() { /* load tasks, render list */ },
  addTask(label) { /* validate, push, persist, render */ },
  deleteTask(id) { /* filter, persist, render */ },
  toggleTask(id) { /* flip done, persist, render */ },
  beginEdit(id) { /* replace label span with input */ },
  confirmEdit(id, newLabel) { /* validate non-empty, update, persist, render */ },
  cancelEdit(id) { /* restore original label */ },
  renderList() { /* clear ul, map tasks to li elements */ }
};
```

A task `li` element structure:
```html
<li data-id="...">
  <button class="toggle-btn" aria-label="Toggle done">✓</button>
  <span class="task-label">...</span>
  <button class="edit-btn" aria-label="Edit">✎</button>
  <button class="delete-btn" aria-label="Delete">✕</button>
</li>
```

### `LinksWidget`

Each link object: `{ id: string, label: string, url: string }`

```javascript
const LinksWidget = {
  links: [],
  init() { /* load links, render */ },
  validateUrl(url) { /* attempt new URL(url), return boolean */ },
  addLink(label, url) { /* validate both fields, push, persist, render */ },
  deleteLink(id) { /* filter, persist, render */ },
  renderLinks() { /* clear container, map links to anchor buttons */ }
};
```

---

## Components and Interfaces

### Module Interfaces

#### `Storage`

| Method | Signature | Description |
|---|---|---|
| `get` | `(key: string, fallback?: any) → any` | Read and JSON-parse a value from `localStorage`; return `fallback` on miss or parse error |
| `set` | `(key: string, value: any) → void` | JSON-stringify and write a value to `localStorage` |

#### `ThemeManager`

| Method | Signature | Description |
|---|---|---|
| `init` | `() → void` | Load saved theme, apply to DOM, wire toggle button |
| `toggle` | `() → void` | Flip current theme, persist, apply |
| `apply` | `(theme: "light" \| "dark") → void` | Set `document.documentElement.dataset.theme` |

#### `GreetingWidget`

| Method | Signature | Description |
|---|---|---|
| `init` | `() → void` | Load saved name, start clock interval, render |
| `formatDate` | `(date: Date) → string` | Produce human-readable date string |
| `formatTime` | `(date: Date) → string` | Produce `HH:MM:SS` string |
| `getGreeting` | `(hour: number) → string` | Map hour [0–23] to greeting phrase |
| `saveName` | `(name: string) → void` | Persist and display the user's name |
| `tick` | `() → void` | Re-render date/time (called every second by `setInterval`) |

#### `TimerWidget`

| Method | Signature | Description |
|---|---|---|
| `init` | `() → void` | Load duration from storage, render display |
| `formatSeconds` | `(s: number) → string` | Produce `MM:SS` string from total seconds |
| `start` | `() → void` | Begin countdown via `setInterval` |
| `stop` | `() → void` | Pause countdown via `clearInterval` |
| `reset` | `() → void` | Stop and restore `remaining` to `duration * 60` |
| `onComplete` | `() → void` | Stop timer, trigger visual/audio alert |
| `saveDuration` | `(minutes: number) → void` | Validate [1–60], persist, reset countdown |

#### `TodoWidget`

| Method | Signature | Description |
|---|---|---|
| `init` | `() → void` | Load tasks from storage, render list |
| `addTask` | `(label: string) → void` | Validate non-empty, create task, persist, render |
| `deleteTask` | `(id: string) → void` | Remove task by id, persist, render |
| `toggleTask` | `(id: string) → void` | Flip `done` flag, persist, render |
| `beginEdit` | `(id: string) → void` | Replace label span with inline input |
| `confirmEdit` | `(id: string, newLabel: string) → void` | Validate non-empty, update label, persist, render |
| `cancelEdit` | `(id: string) → void` | Discard edit, restore original label span |
| `renderList` | `() → void` | Re-render the full task `<ul>` |

#### `LinksWidget`

| Method | Signature | Description |
|---|---|---|
| `init` | `() → void` | Load links from storage, render |
| `validateUrl` | `(url: string) → boolean` | Return `true` if `new URL(url)` succeeds |
| `addLink` | `(label: string, url: string) → void` | Validate both fields, create link, persist, render |
| `deleteLink` | `(id: string) → void` | Remove link by id, persist, render |
| `renderLinks` | `() → void` | Re-render the links container |

---

## Data Models

### Task

```javascript
{
  id: string,       // crypto.randomUUID() or Date.now().toString()
  label: string,    // non-empty, trimmed
  done: boolean     // false on creation
}
```

### Quick Link

```javascript
{
  id: string,       // crypto.randomUUID() or Date.now().toString()
  label: string,    // non-empty, trimmed
  url: string       // passes `new URL(url)` without throwing
}
```

---

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>To-Do Dashboard</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <header>
    <button id="theme-toggle" aria-label="Toggle theme">☀ / ☽</button>
  </header>

  <main class="dashboard-grid">

    <!-- Widget 1 -->
    <section id="greeting-widget" class="widget">
      <div id="greeting-text"></div>
      <div id="datetime-display"></div>
      <input id="name-input" type="text" placeholder="Enter your name">
      <button id="name-save-btn">Save</button>
    </section>

    <!-- Widget 2 -->
    <section id="timer-widget" class="widget">
      <div id="timer-display">25:00</div>
      <div class="timer-controls">
        <button id="timer-start">Start</button>
        <button id="timer-stop">Stop</button>
        <button id="timer-reset">Reset</button>
      </div>
      <input id="duration-input" type="number" min="1" max="60" value="25">
      <button id="duration-save-btn">Set</button>
    </section>

    <!-- Widget 3 -->
    <section id="todo-widget" class="widget">
      <input id="task-input" type="text" placeholder="New task...">
      <button id="task-add-btn">Add</button>
      <p id="task-error" class="error-msg" hidden></p>
      <ul id="task-list"></ul>
    </section>

    <!-- Widget 4 -->
    <section id="links-widget" class="widget">
      <input id="link-label-input" type="text" placeholder="Label">
      <input id="link-url-input" type="url" placeholder="https://...">
      <button id="link-add-btn">Add</button>
      <p id="link-error" class="error-msg" hidden></p>
      <div id="links-container"></div>
    </section>

  </main>

  <script src="js/app.js"></script>
</body>
</html>
```

---

## CSS Architecture

`style.css` uses CSS custom properties scoped to `[data-theme]` selectors:

```css
:root, [data-theme="light"] {
  --bg-page:      #f5f5f5;
  --bg-widget:    #ffffff;
  --text-primary: #1a1a1a;
  --text-muted:   #6b7280;
  --border:       #e5e7eb;
  --accent:       #3b82f6;
}

[data-theme="dark"] {
  --bg-page:      #111827;
  --bg-widget:    #1f2937;
  --text-primary: #f9fafb;
  --text-muted:   #9ca3af;
  --border:       #374151;
  --accent:       #60a5fa;
}
```

The `.dashboard-grid` uses CSS Grid with four equal columns on wide screens, collapsing to two columns on medium screens and one column on mobile via `@media` queries.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `localStorage` unavailable or full | `Storage.set` silently catches the error; data is not persisted but the UI still functions for the session |
| Invalid URL in Quick Links | `new URL(url)` throws; `validateUrl` returns `false`; inline error shown |
| Empty/whitespace task label | `label.trim() === ''` check; inline error shown; task not added |
| Empty/whitespace edit label | Same check; original label restored silently |
| Timer duration out of range | Clamped or rejected with inline error before persisting |
| JSON parse failure in Storage.get | `try/catch` returns the fallback value |

---

## Testing Strategy

**Dual testing approach:**

- **Unit / example-based tests** cover specific scenarios: DOM structure checks (all four widgets present, task `li` controls present), state machine transitions (Start sets running, Stop pauses, Reset restores), and the Quick Link click-to-new-tab behavior via a mocked `window.open`.
- **Property-based tests** (minimum 100 iterations per property) cover all pure functions and storage round-trips: date/time formatting, greeting hour mapping, timer formatting, name/theme/duration/tasks/links persistence, task and link CRUD invariants, and idempotence of toggle operations.

Each property test references its design property by number (e.g., `Property 3: Greeting covers all hours exhaustively`).

Edge cases handled by property generators: empty strings, whitespace-only strings, strings with special characters, seconds at boundary (0 and 5940), hour values at partition boundaries (5, 12, 18, 21, 0), and task/link lists at length 0 and length N.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Date formatting completeness

*For any* valid `Date` object, `GreetingWidget.formatDate(date)` SHALL return a non-empty string containing the full weekday name, the numeric day, the full month name, and the four-digit year — matching the pattern `/[A-Za-z]+,\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/`.

**Validates: Requirements 2.1**

---

### Property 2: Time formatting correctness

*For any* valid `Date` object, `GreetingWidget.formatTime(date)` SHALL return a string that matches `/^\d{2}:\d{2}:\d{2}$/` — always two-digit hours, minutes, and seconds with colon separators.

**Validates: Requirements 2.2**

---

### Property 3: Greeting covers all hours exhaustively

*For any* integer hour in the range [0, 23], `GreetingWidget.getGreeting(hour)` SHALL return exactly one of the four strings — "Good Morning", "Good Afternoon", "Good Evening", or "Good Night" — with no hour producing an undefined or fallback value.

**Validates: Requirements 2.3, 2.4, 2.5, 2.6**

---

### Property 4: Greeting partitions hours without overlap

*For any* two distinct hours `h1` and `h2` that map to different greeting strings, the mapping SHALL be consistent: the same hour always produces the same greeting. The four greeting strings partition the 24 hours with no hour belonging to two partitions simultaneously.

**Validates: Requirements 2.3, 2.4, 2.5, 2.6**

---

### Property 5: Name round-trip persistence

*For any* non-empty string `name`, calling `Storage.set('td_name', name)` followed by `Storage.get('td_name')` SHALL return a value equal to `name`.

**Validates: Requirements 2.8, 2.9**

---

### Property 6: Timer display formatting

*For any* integer number of seconds `s` in [0, 5940] (0 to 99 minutes), `TimerWidget.formatSeconds(s)` SHALL return a string that matches `/^\d{2}:\d{2}$/` where the first part equals `Math.floor(s / 60)` zero-padded to two digits and the second part equals `s % 60` zero-padded to two digits.

**Validates: Requirements 3.1**

---

### Property 7: Pomodoro duration round-trip persistence

*For any* integer duration `d` in [1, 60], calling `Storage.set('td_pomodoro_duration', d)` followed by `Storage.get('td_pomodoro_duration')` SHALL return a value equal to `d`.

**Validates: Requirements 3.2, 3.8**

---

### Property 8: Task addition grows the list

*For any* task list state and *any* non-empty, non-whitespace string `label`, calling `TodoWidget.addTask(label)` SHALL result in `TodoWidget.tasks` having exactly one more element than before, and that element SHALL have a `label` equal to `label.trim()` and `done` equal to `false`.

**Validates: Requirements 4.2**

---

### Property 9: Whitespace task labels are always rejected

*For any* string `s` where `s.trim() === ''`, calling `TodoWidget.addTask(s)` SHALL leave `TodoWidget.tasks` unchanged (same length, same elements).

**Validates: Requirements 4.3**

---

### Property 10: Completion toggle is its own inverse

*For any* task with id `id` currently in `TodoWidget.tasks`, calling `TodoWidget.toggleTask(id)` twice in succession SHALL result in a task with the same `done` value as before the first toggle.

**Validates: Requirements 4.5**

---

### Property 11: Edit with non-empty label updates label

*For any* task with id `id` and *any* non-empty, non-whitespace string `newLabel`, calling `TodoWidget.confirmEdit(id, newLabel)` SHALL result in the task's `label` being equal to `newLabel.trim()`, with `id` and `done` unchanged.

**Validates: Requirements 4.7**

---

### Property 12: Edit with whitespace label preserves original

*For any* task with id `id` and label `originalLabel`, calling `TodoWidget.confirmEdit(id, s)` with any string `s` where `s.trim() === ''` SHALL leave the task's `label` equal to `originalLabel`.

**Validates: Requirements 4.8**

---

### Property 13: Task deletion removes exactly the target

*For any* task list and *any* task id `id` present in that list, calling `TodoWidget.deleteTask(id)` SHALL result in a list that contains no task with id `id` and whose length is exactly one less than before.

**Validates: Requirements 4.9**

---

### Property 14: Task list round-trip persistence

*For any* array of task objects `tasks` (each with valid `id`, `label`, `done`), calling `Storage.set('td_tasks', tasks)` followed by `Storage.get('td_tasks')` SHALL return an array where each element has the same `id`, `label`, and `done` as the corresponding element in `tasks`.

**Validates: Requirements 4.10, 7.2**

---

### Property 15: Quick Link addition grows the list

*For any* links list state, *any* non-empty string `label`, and *any* URL string `url` that passes `validateUrl`, calling `LinksWidget.addLink(label, url)` SHALL result in `LinksWidget.links` having exactly one more element, with `label` equal to `label.trim()` and `url` equal to `url`.

**Validates: Requirements 5.2**

---

### Property 16: Invalid URL is always rejected

*For any* string `url` that causes `new URL(url)` to throw, `LinksWidget.validateUrl(url)` SHALL return `false` and `LinksWidget.addLink(anyLabel, url)` SHALL leave `LinksWidget.links` unchanged.

**Validates: Requirements 5.3**

---

### Property 17: Link deletion removes exactly the target

*For any* links list and *any* link id `id` present in that list, calling `LinksWidget.deleteLink(id)` SHALL result in a list that contains no link with id `id` and whose length is exactly one less than before.

**Validates: Requirements 5.5**

---

### Property 18: Links list round-trip persistence

*For any* array of link objects `links` (each with valid `id`, `label`, `url`), calling `Storage.set('td_links', links)` followed by `Storage.get('td_links')` SHALL return an array where each element has the same `id`, `label`, and `url`.

**Validates: Requirements 5.6, 7.2**

---

### Property 19: Theme toggle is its own inverse

*For any* current theme value `t` in `{ "light", "dark" }`, calling `ThemeManager.toggle()` twice in succession SHALL result in `document.documentElement.dataset.theme` equaling `t` — the same value as before the first toggle.

**Validates: Requirements 6.2**

---

### Property 20: Theme round-trip persistence

*For any* theme value `t` in `{ "light", "dark" }`, calling `Storage.set('td_theme', t)` followed by `Storage.get('td_theme')` SHALL return `t`.

**Validates: Requirements 6.3, 6.5**
