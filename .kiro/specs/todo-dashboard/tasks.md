# Implementation Plan: To-Do Dashboard

## Overview

Build a single-page dashboard using plain HTML, CSS, and Vanilla JavaScript. The page hosts four widgets — Greeting, Focus Timer, To-Do List, and Quick Links — all wired together through a single `app.js` file using the module pattern described in the design. Data is persisted entirely via `localStorage`.

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` with the full HTML structure from the design: `<html data-theme="light">`, `<header>` with the theme toggle button, and the four `<section>` widgets inside `<main class="dashboard-grid">`
  - Create the empty files `css/style.css` and `js/app.js` to satisfy the one-file-per-type constraint
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement the CSS stylesheet
  - [x] 2.1 Define CSS custom properties and theming
    - Write `:root` / `[data-theme="light"]` and `[data-theme="dark"]` variable blocks with the color tokens from the design (`--bg-page`, `--bg-widget`, `--text-primary`, `--text-muted`, `--border`, `--accent`)
    - Add base reset styles and typography
    - _Requirements: 1.1, 6.1, 6.2_

  - [x] 2.2 Style the dashboard grid and widgets
    - Implement `.dashboard-grid` with CSS Grid: 4 equal columns on wide screens, 2 columns on medium (`@media`), 1 column on mobile
    - Add `.widget` card styles (background, border, padding, border-radius)
    - _Requirements: 1.3, 1.4_

  - [x] 2.3 Style widget-specific UI elements
    - Style the timer display (large font), task list items (layout, struck-through completed tasks), link buttons, form inputs, error messages, and the theme-toggle button
    - _Requirements: 3.1, 4.4, 4.5, 5.4_

- [x] 3. Implement the `Storage` utility in `app.js`
  - Write the `Storage` object with `get(key, fallback)` and `set(key, value)` methods, wrapping `localStorage` with JSON serialization and a `try/catch`
  - Define all five storage keys as constants: `td_name`, `td_theme`, `td_pomodoro_duration`, `td_tasks`, `td_links`
  - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 3.1 Write property test for Storage round-trip (name)
    - **Property 5: Name round-trip persistence**
    - **Validates: Requirements 2.8, 2.9**

  - [ ]* 3.2 Write property test for Storage round-trip (tasks)
    - **Property 14: Task list round-trip persistence**
    - **Validates: Requirements 4.10, 7.2**

  - [ ]* 3.3 Write property test for Storage round-trip (links)
    - **Property 18: Links list round-trip persistence**
    - **Validates: Requirements 5.6, 7.2**

  - [ ]* 3.4 Write property test for Storage round-trip (theme)
    - **Property 20: Theme round-trip persistence**
    - **Validates: Requirements 6.3, 6.5**

  - [ ]* 3.5 Write property test for Storage round-trip (Pomodoro duration)
    - **Property 7: Pomodoro duration round-trip persistence**
    - **Validates: Requirements 3.2, 3.8**

- [x] 4. Implement `ThemeManager`
  - Write the `ThemeManager` object with `init()`, `toggle()`, and `apply(theme)` methods
  - `init()` reads `td_theme` from Storage (defaulting to `"light"`), applies the theme, and wires the `#theme-toggle` button click to `toggle()`
  - `apply(theme)` sets `document.documentElement.dataset.theme`
  - `toggle()` flips the current theme, calls `apply`, and persists via Storage
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 4.1 Write property test for theme toggle idempotence
    - **Property 19: Theme toggle is its own inverse**
    - **Validates: Requirements 6.2**

- [x] 5. Implement `GreetingWidget`
  - [x] 5.1 Implement date/time formatting and greeting logic
    - Write `formatDate(date)` returning a string matching `/[A-Za-z]+,\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/`
    - Write `formatTime(date)` returning a string matching `/^\d{2}:\d{2}:\d{2}$/`
    - Write `getGreeting(hour)` mapping hour [0–23] to exactly one of the four greeting strings per the design table
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 5.2 Write property test for date formatting completeness
    - **Property 1: Date formatting completeness**
    - **Validates: Requirements 2.1**

  - [ ]* 5.3 Write property test for time formatting correctness
    - **Property 2: Time formatting correctness**
    - **Validates: Requirements 2.2**

  - [ ]* 5.4 Write property test for greeting exhaustiveness
    - **Property 3: Greeting covers all hours exhaustively**
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.6**

  - [ ]* 5.5 Write property test for greeting partition consistency
    - **Property 4: Greeting partitions hours without overlap**
    - **Validates: Requirements 2.3, 2.4, 2.5, 2.6**

  - [x] 5.6 Implement `GreetingWidget.init()`, `saveName()`, and `tick()`
    - `init()` loads `td_name` (defaulting to `"Friend"`), starts a `setInterval` tick at 1000 ms, and renders the greeting text and date/time
    - `saveName(name)` persists via Storage and re-renders the greeting
    - Wire `#name-save-btn` click to call `saveName` with the value of `#name-input`
    - _Requirements: 2.7, 2.8, 2.9, 2.10_

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement `TimerWidget`
  - [x] 7.1 Implement timer formatting and core countdown logic
    - Write `formatSeconds(s)` returning a string matching `/^\d{2}:\d{2}$/`
    - Implement `start()` using `setInterval` to decrement `remaining` each second and update `#timer-display`; call `onComplete()` when `remaining` reaches 0
    - Implement `stop()` via `clearInterval`
    - Implement `reset()` calling `stop()` and restoring `remaining` to `duration * 60`
    - Implement `onComplete()` stopping the timer and triggering a visual alert (and optionally `AudioContext` beep)
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 7.2 Write property test for timer display formatting
    - **Property 6: Timer display formatting**
    - **Validates: Requirements 3.1**

  - [x] 7.3 Implement `TimerWidget.init()` and custom duration saving
    - `init()` loads `td_pomodoro_duration` (defaulting to 25), sets `duration` and `remaining`, renders the display, and wires the three control buttons
    - `saveDuration(minutes)` validates the value is in [1, 60], persists via Storage, and calls `reset()`
    - Wire `#duration-save-btn` click to call `saveDuration` with `#duration-input` value
    - _Requirements: 3.2, 3.7, 3.8_

- [x] 8. Implement `TodoWidget`
  - [x] 8.1 Implement task CRUD and rendering
    - Write `addTask(label)`: trim, reject empty/whitespace (show `#task-error`), generate id via `crypto.randomUUID()`, push `{ id, label, done: false }`, persist, re-render
    - Write `deleteTask(id)`: filter, persist, re-render
    - Write `toggleTask(id)`: flip `done`, persist, re-render
    - Write `renderList()`: clear `#task-list`, map each task to an `<li>` with toggle, label span, edit, and delete buttons per the design's HTML structure; apply a CSS class for completed tasks
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.9_

  - [ ]* 8.2 Write property test for task addition
    - **Property 8: Task addition grows the list**
    - **Validates: Requirements 4.2**

  - [ ]* 8.3 Write property test for whitespace label rejection
    - **Property 9: Whitespace task labels are always rejected**
    - **Validates: Requirements 4.3**

  - [ ]* 8.4 Write property test for completion toggle idempotence
    - **Property 10: Completion toggle is its own inverse**
    - **Validates: Requirements 4.5**

  - [ ]* 8.5 Write property test for task deletion
    - **Property 13: Task deletion removes exactly the target**
    - **Validates: Requirements 4.9**

  - [x] 8.6 Implement inline task editing
    - Write `beginEdit(id)`: replace the label `<span>` with an `<input>` pre-filled with current label
    - Write `confirmEdit(id, newLabel)`: trim; if empty restore original label (Requirement 4.8), else update and persist
    - Write `cancelEdit(id)`: restore the original label span without saving
    - Wire `#task-add-btn` click and Enter key on `#task-input` to `addTask`
    - _Requirements: 4.6, 4.7, 4.8_

  - [ ]* 8.7 Write property test for edit with non-empty label
    - **Property 11: Edit with non-empty label updates label**
    - **Validates: Requirements 4.7**

  - [ ]* 8.8 Write property test for edit with whitespace label
    - **Property 12: Edit with whitespace label preserves original**
    - **Validates: Requirements 4.8**

  - [x] 8.9 Implement `TodoWidget.init()`
    - Load `td_tasks` from Storage (defaulting to `[]`), assign to `this.tasks`, call `renderList()`
    - _Requirements: 4.10_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement `LinksWidget`
  - [x] 10.1 Implement URL validation, link CRUD, and rendering
    - Write `validateUrl(url)`: attempt `new URL(url)`, return `true`/`false`
    - Write `addLink(label, url)`: trim label, reject empty label or invalid URL (show `#link-error`), generate id, push `{ id, label, url }`, persist, re-render
    - Write `deleteLink(id)`: filter, persist, re-render
    - Write `renderLinks()`: clear `#links-container`, map each link to an `<a>` or `<button>` that opens `url` in a new tab via `window.open`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 10.2 Write property test for link addition
    - **Property 15: Quick Link addition grows the list**
    - **Validates: Requirements 5.2**

  - [ ]* 10.3 Write property test for invalid URL rejection
    - **Property 16: Invalid URL is always rejected**
    - **Validates: Requirements 5.3**

  - [ ]* 10.4 Write property test for link deletion
    - **Property 17: Link deletion removes exactly the target**
    - **Validates: Requirements 5.5**

  - [x] 10.5 Implement `LinksWidget.init()`
    - Load `td_links` from Storage (defaulting to `[]`), assign to `this.links`, call `renderLinks()`
    - Wire `#link-add-btn` click to `addLink`
    - _Requirements: 5.6_

- [x] 11. Wire everything together in `init()`
  - [x] 11.1 Write the `init()` entry point and boot all modules
    - Define the top-level `init()` function that calls `ThemeManager.init()`, `GreetingWidget.init()`, `TimerWidget.init()`, `TodoWidget.init()`, and `LinksWidget.init()` in order
    - Attach `init` to `document.addEventListener('DOMContentLoaded', init)`
    - Verify data loads from Storage on page load and all widgets render correctly
    - _Requirements: 7.3, 1.3_

  - [ ]* 11.2 Write integration tests for page load state restoration
    - Seed `localStorage` with known values for all five keys, load the page, and assert each widget displays the seeded data
    - _Requirements: 7.3, 2.9, 3.2, 4.10, 5.6, 6.3_

- [x] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at logical milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- The entire JavaScript surface must remain in `js/app.js`; no additional JS files are permitted
- The entire CSS must remain in `css/style.css`; no additional CSS files are permitted

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3"] },
    { "id": 2, "tasks": ["2.2", "3.1", "3.2", "3.3", "3.4", "3.5", "4"] },
    { "id": 3, "tasks": ["2.3", "4.1", "5.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6", "7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 7, "tasks": ["8.7", "8.8", "8.9", "10.1"] },
    { "id": 8, "tasks": ["10.2", "10.3", "10.4", "10.5"] },
    { "id": 9, "tasks": ["11.1"] },
    { "id": 10, "tasks": ["11.2"] }
  ]
}
```
