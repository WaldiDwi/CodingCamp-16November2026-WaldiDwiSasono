# Requirements Document

## Introduction

A single-page To-Do Lists Dashboard website built with HTML, CSS, and Vanilla JavaScript. The page displays four widgets simultaneously: a Greeting widget with current date/time, a Pomodoro Focus Timer, a To-Do List manager, and a Quick Links launcher. Data is persisted via browser Local Storage. The visual style is minimal and flat with a clean white/grey palette, subtle borders, and support for light/dark mode toggling.

## Glossary

- **Dashboard**: The single HTML page that hosts all four widgets.
- **Greeting_Widget**: The widget displaying the user's name, current date/time, and a time-based greeting message.
- **Timer_Widget**: The Pomodoro-style countdown timer widget.
- **Todo_Widget**: The task management widget for adding, editing, completing, and deleting tasks.
- **Links_Widget**: The quick-links widget for storing and launching favorite website shortcuts.
- **Local_Storage**: The browser's `localStorage` API used for persisting user data across sessions.
- **Pomodoro_Duration**: The configurable countdown duration for the Focus Timer, defaulting to 25 minutes.
- **Task**: A single to-do item with a text label and a completion state.
- **Quick_Link**: A user-defined shortcut consisting of a label and a URL.
- **Theme**: The visual color scheme of the Dashboard, either light or dark.

## Requirements

### Requirement 1: Page Layout and Technical Stack

**User Story:** As a user, I want all four widgets visible at once on a single page, so that I can access every feature without scrolling or navigation.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
2. THE Dashboard SHALL include exactly one CSS file located at `css/style.css` and exactly one JavaScript file located at `js/app.js`.
3. THE Dashboard SHALL render all four widgets — Greeting_Widget, Timer_Widget, Todo_Widget, and Links_Widget — simultaneously on a single page without requiring navigation.
4. THE Dashboard SHALL function correctly in modern versions of Chrome, Firefox, Edge, and Safari.

---

### Requirement 2: Greeting Widget

**User Story:** As a user, I want to see my name, the current date and time, and a greeting appropriate to the time of day, so that the page feels personal and contextually aware.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 16 November 2026").
2. THE Greeting_Widget SHALL display the current time, updated every second.
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local hour is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local hour is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. THE Greeting_Widget SHALL display a user-configurable name alongside the greeting.
8. WHEN the user submits a new name via the name input field, THE Greeting_Widget SHALL update the displayed name immediately and persist the name to Local_Storage.
9. WHEN the Dashboard loads and Local_Storage contains a saved name, THE Greeting_Widget SHALL display the saved name.
10. WHEN the Dashboard loads and Local_Storage does not contain a saved name, THE Greeting_Widget SHALL display the placeholder name "Friend".

---

### Requirement 3: Focus Timer Widget

**User Story:** As a user, I want a Pomodoro countdown timer with start, stop, and reset controls and an adjustable duration, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Timer_Widget SHALL display a countdown in MM:SS format.
2. WHEN the Dashboard loads, THE Timer_Widget SHALL initialize the countdown to the saved Pomodoro_Duration, defaulting to 25 minutes when no saved value exists in Local_Storage.
3. WHEN the user presses the Start button and the timer is not running, THE Timer_Widget SHALL begin counting down one second per second.
4. WHEN the user presses the Stop button and the timer is running, THE Timer_Widget SHALL pause the countdown at the current remaining time.
5. WHEN the user presses the Reset button, THE Timer_Widget SHALL stop any running countdown and restore the display to the current Pomodoro_Duration.
6. WHEN the countdown reaches 00:00, THE Timer_Widget SHALL stop automatically and play an audible alert or display a visual notification.
7. THE Timer_Widget SHALL provide an input field that allows the user to set a custom Pomodoro_Duration in whole minutes between 1 and 60.
8. WHEN the user saves a new Pomodoro_Duration, THE Timer_Widget SHALL persist the value to Local_Storage and reset the countdown to the new duration.

---

### Requirement 4: To-Do List Widget

**User Story:** As a user, I want to add, edit, mark as done, and delete tasks, with changes saved automatically, so that my task list persists across browser sessions.

#### Acceptance Criteria

1. THE Todo_Widget SHALL provide an input field and a submit control for adding a new Task.
2. WHEN the user submits a non-empty task label, THE Todo_Widget SHALL add the Task to the list and persist all tasks to Local_Storage.
3. IF the user submits an empty or whitespace-only task label, THEN THE Todo_Widget SHALL reject the submission and display an inline validation message.
4. THE Todo_Widget SHALL display each Task with its label, a completion toggle, an edit control, and a delete control.
5. WHEN the user activates the completion toggle for a Task, THE Todo_Widget SHALL update the Task's completion state, apply a visual struck-through style to completed tasks, and persist the updated list to Local_Storage.
6. WHEN the user activates the edit control for a Task, THE Todo_Widget SHALL replace the Task label with an editable inline input pre-filled with the current label.
7. WHEN the user confirms an inline edit with a non-empty value, THE Todo_Widget SHALL update the Task label and persist the updated list to Local_Storage.
8. IF the user confirms an inline edit with an empty or whitespace-only value, THEN THE Todo_Widget SHALL retain the original Task label and cancel the edit.
9. WHEN the user activates the delete control for a Task, THE Todo_Widget SHALL remove the Task from the list and persist the updated list to Local_Storage.
10. WHEN the Dashboard loads and Local_Storage contains saved tasks, THE Todo_Widget SHALL restore and display all saved tasks with their saved completion states.

---

### Requirement 5: Quick Links Widget

**User Story:** As a user, I want to save favorite website shortcuts and open them with one click, so that I can reach frequently used sites quickly from the dashboard.

#### Acceptance Criteria

1. THE Links_Widget SHALL provide input fields for a link label and a URL, and a submit control for adding a new Quick_Link.
2. WHEN the user submits a Quick_Link with a non-empty label and a valid URL, THE Links_Widget SHALL add the Quick_Link as a clickable button and persist all Quick_Links to Local_Storage.
3. IF the user submits a Quick_Link with an empty label or an invalid URL, THEN THE Links_Widget SHALL reject the submission and display an inline validation message.
4. WHEN the user clicks a Quick_Link button, THE Links_Widget SHALL open the associated URL in a new browser tab.
5. THE Links_Widget SHALL provide a delete control for each Quick_Link that removes it from the list and persists the updated list to Local_Storage.
6. WHEN the Dashboard loads and Local_Storage contains saved Quick_Links, THE Links_Widget SHALL restore and display all saved Quick_Links.

---

### Requirement 6: Light/Dark Mode

**User Story:** As a user, I want to toggle between a light and dark visual theme, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control to switch between the light Theme and the dark Theme.
2. WHEN the user activates the theme toggle, THE Dashboard SHALL switch the active Theme immediately by applying a CSS class to the root element.
3. WHEN the Dashboard loads and Local_Storage contains a saved Theme preference, THE Dashboard SHALL apply the saved Theme on load.
4. WHEN the Dashboard loads and no Theme preference is saved, THE Dashboard SHALL apply the light Theme by default.
5. WHEN the user changes the Theme, THE Dashboard SHALL persist the new Theme preference to Local_Storage.

---

### Requirement 7: Data Persistence

**User Story:** As a user, I want all my settings and data saved automatically, so that nothing is lost when I close or refresh the browser.

#### Acceptance Criteria

1. THE Dashboard SHALL use Local_Storage as the sole mechanism for persisting user data, requiring no server or external database.
2. WHEN any user data changes (task list, Quick_Links, name, Pomodoro_Duration, or Theme), THE Dashboard SHALL write the updated data to Local_Storage before the next user interaction.
3. WHEN the Dashboard loads, THE Dashboard SHALL read all persisted data from Local_Storage and restore the application state before rendering any widget.
