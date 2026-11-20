'use strict';

/* =========================================================
   Storage utility  — full implementation in task 3
   ========================================================= */
// TODO: Storage - task 3
const Storage = {
  get(key, fallback) {
    if (fallback === undefined) fallback = null;
    try {
      var raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/* Storage keys */
var KEYS = {
  NAME:             'td_name',
  THEME:            'td_theme',
  POMODORO_DURATION:'td_pomodoro_duration',
  TASKS:            'td_tasks',
  LINKS:            'td_links'
};

/* =========================================================
   GreetingWidget
   ========================================================= */
var GreetingWidget = {

  /* ---- Pure formatting helpers (task 5.1) ---- */

  /**
   * Format a Date as "Weekday, D Month YYYY"
   * e.g. "Monday, 16 November 2026"
   * Matches /[A-Za-z]+,\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/
   */
  formatDate: function (date) {
    var weekdays = [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday',
      'Thursday', 'Friday', 'Saturday'
    ];
    var months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    var weekday = weekdays[date.getDay()];
    var day     = date.getDate();
    var month   = months[date.getMonth()];
    var year    = date.getFullYear();
    return weekday + ', ' + day + ' ' + month + ' ' + year;
  },

  /**
   * Format a Date as "HH:MM:SS" (always two digits each)
   * e.g. "14:05:32"
   * Matches /^\d{2}:\d{2}:\d{2}$/
   */
  formatTime: function (date) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(date.getHours()) + ':' +
           pad(date.getMinutes()) + ':' +
           pad(date.getSeconds());
  },

  /**
   * Map an integer hour [0–23] to a greeting string.
   * 05–11 → "Good Morning"
   * 12–17 → "Good Afternoon"
   * 18–20 → "Good Evening"
   * 21–23 and 00–04 → "Good Night"
   */
  getGreeting: function (hour) {
    if (hour >= 5 && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 17) return 'Good Afternoon';
    if (hour >= 18 && hour <= 20) return 'Good Evening';
    return 'Good Night';   // 21–23 and 0–4
  },

  /* ---- init(), saveName(), tick() — task 5.6 ---- */

  init: function () {
    this.name = Storage.get(KEYS.NAME, 'Friend');
    document.getElementById('name-save-btn').addEventListener('click', function () {
      var val = document.getElementById('name-input').value;
      GreetingWidget.saveName(val);
    });
    setInterval(function () { GreetingWidget.tick(); }, 1000);
    this.render();
  },

  render: function () {
    var now  = new Date();
    var hour = now.getHours();
    document.getElementById('greeting-text').textContent =
      this.getGreeting(hour) + ',';
    document.getElementById('greeting-name').textContent =
      this.name + '!';
    document.getElementById('datetime-display').textContent =
      this.formatDate(now) + ' \u2014 ' + this.formatTime(now);
  },

  tick: function () {
    this.render();
  },

  saveName: function (name) {
    var trimmed = name.trim();
    if (trimmed) {
      this.name = trimmed;
      Storage.set(KEYS.NAME, trimmed);
    }
    this.render();
  }
};

/* =========================================================
   TimerWidget  — implemented in tasks 7.1 / 7.3
   ========================================================= */
var TimerWidget = {

  duration:   25,     // minutes, loaded from storage
  remaining:  1500,   // seconds
  intervalId: null,

  /* ---- formatSeconds (task 7.1) ---- */

  /**
   * Convert total seconds to "MM:SS" with zero-padding.
   * e.g. formatSeconds(90) → "01:30", formatSeconds(0) → "00:00"
   * Matches /^\d{2}:\d{2}$/
   */
  formatSeconds: function (s) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  },

  /* ---- start (task 7.1) ---- */

  start: function () {
    if (this.intervalId !== null) return;   // already running
    var self = this;
    this.intervalId = setInterval(function () {
      self.remaining -= 1;
      var display = document.getElementById('timer-display');
      if (display) {
        display.textContent = self.formatSeconds(self.remaining);
      }
      if (self.remaining <= 0) {
        self.onComplete();
      }
    }, 1000);
  },

  /* ---- stop (task 7.1) ---- */

  stop: function () {
    clearInterval(this.intervalId);
    this.intervalId = null;
  },

  /* ---- reset (task 7.1) ---- */

  reset: function () {
    this.stop();
    this.remaining = this.duration * 60;
    var display = document.getElementById('timer-display');
    if (display) {
      display.textContent = this.formatSeconds(this.remaining);
      display.classList.remove('timer-complete');
    }
  },

  /* ---- onComplete (task 7.1) ---- */

  onComplete: function () {
    this.stop();
    var display = document.getElementById('timer-display');
    if (display) {
      display.classList.add('timer-complete');
    }
    // Optional AudioContext beep
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {
      // AudioContext unavailable — silent fallback
    }
  },

  /* ---- init and saveDuration — task 7.3 ---- */

  init: function () {
    // Load duration from storage, default 25
    this.duration  = Storage.get(KEYS.POMODORO_DURATION, 25);
    this.remaining = this.duration * 60;

    // Render initial display
    var display = document.getElementById('timer-display');
    if (display) {
      display.textContent = this.formatSeconds(this.remaining);
    }

    // Set the duration input to reflect the loaded value
    var durationInput = document.getElementById('duration-input');
    if (durationInput) {
      durationInput.value = this.duration;
    }

    // Wire mode tabs (Pomodoro / Short Break / Long Break)
    var self = this;
    var tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        // Update active state
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        // Set duration from data attribute and reset
        var minutes = parseInt(tab.dataset.minutes, 10);
        self.duration  = minutes;
        self.remaining = minutes * 60;
        self.stop();
        var disp = document.getElementById('timer-display');
        if (disp) {
          disp.textContent = self.formatSeconds(self.remaining);
          disp.classList.remove('timer-complete');
        }
        // Sync the custom input field too
        var inp = document.getElementById('duration-input');
        if (inp) inp.value = minutes;
      });
    });

    // Wire Start / Stop / Reset buttons
    document.getElementById('timer-start').addEventListener('click', function () {
      self.start();
    });
    document.getElementById('timer-stop').addEventListener('click', function () {
      self.stop();
    });
    document.getElementById('timer-reset').addEventListener('click', function () {
      self.reset();
    });

    // Wire duration save button
    document.getElementById('duration-save-btn').addEventListener('click', function () {
      var val = parseInt(document.getElementById('duration-input').value, 10);
      self.saveDuration(val);
      // Clear active tab since user set a custom value
      tabs.forEach(function (t) { t.classList.remove('active'); });
    });
  },

  saveDuration: function (minutes) {
    // Validate range [1, 60]
    if (isNaN(minutes) || minutes < 1 || minutes > 60) {
      return;   // silently ignore out-of-range values
    }
    this.duration = minutes;
    Storage.set(KEYS.POMODORO_DURATION, minutes);
    this.reset();   // reset restores remaining = duration * 60 and updates display
  }
};

/* =========================================================
   TodoWidget  — implemented in tasks 8.1 / 8.6 / 8.9
   ========================================================= */
var TodoWidget = {

  tasks: [],

  /* ---- addTask (task 8.1) ---- */

  addTask: function (label) {
    var trimmed = label.trim();
    var err = document.getElementById('task-error');
    if (!trimmed) {
      err.textContent = 'Task cannot be empty.';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    var task = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : Date.now().toString(),
      label: trimmed,
      done: false
    };
    this.tasks.push(task);
    Storage.set(KEYS.TASKS, this.tasks);
    this.renderList();
  },

  /* ---- deleteTask (task 8.1) ---- */

  deleteTask: function (id) {
    this.tasks = this.tasks.filter(function (t) { return t.id !== id; });
    Storage.set(KEYS.TASKS, this.tasks);
    this.renderList();
  },

  /* ---- toggleTask (task 8.1) ---- */

  toggleTask: function (id) {
    this.tasks = this.tasks.filter(function (t) { return t.id !== id; });
    Storage.set(KEYS.TASKS, this.tasks);
    this.renderList();
  },

  /* ---- renderList (task 8.1) ---- */

  renderList: function () {
    var ul = document.getElementById('task-list');
    ul.innerHTML = '';
    var self = this;
    this.tasks.forEach(function (task) {
      var li = document.createElement('li');
      li.setAttribute('data-id', task.id);
      if (task.done) li.classList.add('done');

      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'toggle-btn';
      toggleBtn.setAttribute('aria-label', 'Toggle done');
      toggleBtn.textContent = '\u2713';
      toggleBtn.addEventListener('click', function () { self.toggleTask(task.id); });

      var labelSpan = document.createElement('span');
      labelSpan.className = 'task-label';
      labelSpan.textContent = task.label;

      var editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.setAttribute('aria-label', 'Edit');
      editBtn.textContent = '\u270e';
      editBtn.addEventListener('click', function () {
        self.beginEdit(task.id);
      });

      var deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.setAttribute('aria-label', 'Delete');
      deleteBtn.textContent = '\u00d7';
      deleteBtn.addEventListener('click', function () { self.deleteTask(task.id); });

      li.appendChild(toggleBtn);
      li.appendChild(labelSpan);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      ul.appendChild(li);
    });
  },

  /* ---- beginEdit (task 8.6) ---- */

  beginEdit: function (id) {
    var task = this.tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    var li = document.querySelector('#task-list li[data-id="' + id + '"]');
    if (!li) return;
    var labelSpan = li.querySelector('.task-label');
    if (!labelSpan) return;

    var self = this;
    var input = document.createElement('input');
    input.type = 'text';
    input.value = task.label;
    input.className = 'edit-input';

    // Replace span with input
    li.replaceChild(input, labelSpan);
    input.focus();
    input.select();

    var committed = false;
    function commit() {
      if (committed) return;
      committed = true;
      self.confirmEdit(id, input.value);
    }
    function cancel() {
      if (committed) return;
      committed = true;
      self.cancelEdit(id);
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter')  commit();
      if (e.key === 'Escape') cancel();
    });
    input.addEventListener('blur', commit);
  },

  /* ---- confirmEdit (task 8.6) ---- */

  confirmEdit: function (id, newLabel) {
    var task = this.tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    var trimmed = newLabel.trim();
    if (trimmed) {
      task.label = trimmed;
      Storage.set(KEYS.TASKS, this.tasks);
    }
    // Re-render always restores the span (with original label if trimmed was empty)
    this.renderList();
  },

  /* ---- cancelEdit (task 8.6) ---- */

  cancelEdit: function (id) {
    // Re-render restores the original label span without saving
    this.renderList();
  },

  /* ---- init (task 8.6 / 8.9) ---- */

  init: function () {
    this.tasks = Storage.get(KEYS.TASKS, []);
    this.renderList();

    var self = this;

    document.getElementById('task-add-btn').addEventListener('click', function () {
      self.addTask(document.getElementById('task-input').value);
      document.getElementById('task-input').value = '';
    });

    document.getElementById('task-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        self.addTask(document.getElementById('task-input').value);
        document.getElementById('task-input').value = '';
      }
    });
  }

};

/* =========================================================
   LinksWidget  — implemented in tasks 10.1 / 10.5
   ========================================================= */
var LinksWidget = {

  links: [],

  /* ---- validateUrl (task 10.1) ---- */

  validateUrl: function (url) {
    try { new URL(url); return true; }
    catch (e) { return false; }
  },

  /* ---- addLink (task 10.1) ---- */

  addLink: function (label, url) {
    var trimmedLabel = label.trim();
    var err = document.getElementById('link-error');
    if (!trimmedLabel) {
      err.textContent = 'Label cannot be empty.';
      err.hidden = false;
      return;
    }
    if (!this.validateUrl(url)) {
      err.textContent = 'Please enter a valid URL.';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    var link = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : Date.now().toString(),
      label: trimmedLabel,
      url: url
    };
    this.links.push(link);
    Storage.set(KEYS.LINKS, this.links);
    this.renderLinks();
  },

  /* ---- deleteLink (task 10.1) ---- */

  deleteLink: function (id) {
    this.links = this.links.filter(function (l) { return l.id !== id; });
    Storage.set(KEYS.LINKS, this.links);
    this.renderLinks();
  },

  /* ---- renderLinks (task 10.1) ---- */

  renderLinks: function () {
    var container = document.getElementById('links-container');
    container.innerHTML = '';
    var self = this;
    this.links.forEach(function (link) {
      var wrapper = document.createElement('div');
      wrapper.className = 'link-item';

      var btn = document.createElement('button');
      btn.className = 'link-btn';
      btn.textContent = link.label;
      btn.addEventListener('click', function () {
        window.open(link.url, '_blank');
      });

      var delBtn = document.createElement('button');
      delBtn.className = 'delete-btn';
      delBtn.textContent = '\u00d7';
      delBtn.setAttribute('aria-label', 'Delete link');
      delBtn.addEventListener('click', function () {
        self.deleteLink(link.id);
      });

      wrapper.appendChild(btn);
      wrapper.appendChild(delBtn);
      container.appendChild(wrapper);
    });
  },

  /* ---- init (task 10.5) ---- */

  init: function () {
    // Load links from storage, default to empty array
    this.links = Storage.get(KEYS.LINKS, []);
    // Render initial state
    this.renderLinks();

    var self = this;
    document.getElementById('link-add-btn').addEventListener('click', function () {
      var labelInput = document.getElementById('link-label-input');
      var urlInput   = document.getElementById('link-url-input');
      var labelBefore = labelInput.value;
      var urlBefore   = urlInput.value;
      var errEl = document.getElementById('link-error');
      self.addLink(labelBefore, urlBefore);
      // Only clear inputs when the add succeeded (no error showing)
      if (errEl.hidden) {
        labelInput.value = '';
        urlInput.value   = '';
      }
    });
  }

};

/* =========================================================
   ThemeManager  — implemented in task 4
   ========================================================= */
var ThemeManager = {

  init: function () {
    var theme = Storage.get(KEYS.THEME, 'light');
    this.apply(theme);
    var self = this;
    document.getElementById('theme-toggle').addEventListener('click', function () {
      self.toggle();
    });
  },

  apply: function (theme) {
    document.documentElement.dataset.theme = theme;
  },

  toggle: function () {
    var current = document.documentElement.dataset.theme;
    var next = current === 'dark' ? 'light' : 'dark';
    this.apply(next);
    Storage.set(KEYS.THEME, next);
  }

};

/* =========================================================
   Entry point  — implemented in task 11.1
   ========================================================= */
function init() {
  ThemeManager.init && ThemeManager.init();
  GreetingWidget.init && GreetingWidget.init();
  TimerWidget.init && TimerWidget.init();
  TodoWidget.init && TodoWidget.init();
  LinksWidget.init && LinksWidget.init();
}

document.addEventListener('DOMContentLoaded', init);
