// resources/js/modules/selector.js
function selector($el, rootSelector, targetSelector, propertyName) {
  return {
    /**
     * カレンダーのルート要素
     */
    $el,
    /**
     * カレンダーのルート要素のセレクタ
     */
    rootSelector,
    /**
     * カレンダーの日付を選択する要素のセレクタ
     */
    targetSelector,
    /**
     * プロパティ名
     */
    propertyName,
    /**
     * 選択開始日
     */
    selectionStart: null,
    /**
     * 選択終了日
     */
    selectionEnd: null,
    /**
     * 選択時のコールバック
     */
    onSelect: null,
    /**
     * カレンダーの日の日付を取得
     * @param el {HTMLElement} 要素
     * @returns {null|string} 日付
     */
    findDateAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(this.rootSelector)) {
          const elDay = el.closest(this.targetSelector);
          if (elDay && !elDay.classList.contains("gc-disabled")) {
            return elDay.dataset[this.propertyName];
          }
        }
      }
      return null;
    },
    /**
     * 指定された位置にある日付の要素を取得
     * @param x {number} X座標
     * @param y {number} Y座標
     * @returns {string} 日付
     */
    findDateAtPoint(x, y) {
      const el = Array.from(this.$el.querySelectorAll(this.rootSelector + " " + this.targetSelector)).filter((el2) => {
        const rect = el2.getBoundingClientRect();
        return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
      }).at(0);
      return el ? el.dataset[this.propertyName] : null;
    },
    /**
     * 日付の要素を取得
     *
     * @param date {string} 日付
     * @returns {HTMLElement} 日付の要素
     */
    findElementByDate(date) {
      return this.$el.querySelector(this.rootSelector + " " + this.targetSelector + "[data-" + this.propertyName + '="' + date + '"]');
    },
    /**
     * 日付の選択範囲を設定
     */
    updateSelection(begin, end) {
      if (begin > end) {
        [begin, end] = [end, begin];
      }
      this.$el.querySelectorAll(this.rootSelector + " " + this.targetSelector).forEach((el) => {
        const date = el.dataset[this.propertyName];
        if (begin && end && begin <= date && date <= end) {
          el.classList.add("gc-selected");
        } else {
          el.classList.remove("gc-selected");
        }
      });
    },
    /**
     * 選択を開始
     * @param $event {Event} イベント
     */
    onMouseDown($event) {
      const date = this.findDateAtElement($event.target);
      if (date) {
        this.selectionStart = this.selectionEnd = date;
        return true;
      }
      return false;
    },
    /**
     * 移動時の選択処理
     * @param $event {MouseEvent} イベント
     */
    onMouseMove($event) {
      const date = this.findDateAtPoint($event.x, $event.y);
      if (this.selectionStart) {
        this.selectionEnd = date;
        this.updateSelection(this.selectionStart, this.selectionEnd);
        return true;
      }
      return false;
    },
    /**
     * 選択を終了
     * @param $event {MouseEvent} イベント
     * @param onSelect {function} 選択時のコールバック
     */
    onMouseUp($event, onSelect) {
      const date = this.findDateAtPoint($event.x, $event.y);
      if (this.selectionStart) {
        const [start, end] = [this.selectionStart, date].sort();
        if (this.onSelect) {
          this.onSelect(start, end);
        }
        this.selectionStart = this.selectionEnd = null;
        this.updateSelection(null, null);
        return true;
      }
      return false;
    }
  };
}

// resources/js/modules/date-utils.js
var millisecondsPerDay = 24 * 60 * 60 * 1e3;
function toDateString(d) {
  return new Date(d).toLocaleDateString("sv-SE");
}
function toDateTimeString(d) {
  return toDateString(d) + " " + new Date(d).toLocaleTimeString("en-GB");
}
function diffDays(date1, date2) {
  let d1 = new Date(date1);
  let d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2.getTime() - d1.getTime()) / millisecondsPerDay);
}
function diffInMilliseconds(date1, date2) {
  let d1 = new Date(date1);
  let d2 = new Date(date2);
  return d2 - d1;
}
function overlapPeriod(start1, end1, start2, end2) {
  const start = start1 <= start2 ? start2 : start1;
  const end = end1 <= end2 ? end1 : end2;
  return start <= end ? [start, end] : [null, null];
}

// resources/js/modules/resizer.js
function resize($el, rootSelector, eventSelector, selector2) {
  return {
    $el,
    /**
     * ルートセレクタ
     */
    rootSelector,
    /**
     * 予定セレクタ
     */
    eventSelector,
    /**
     * 日付セレクター・時間セレクター
     */
    selector: selector2,
    /**
     * ヘッダーカーソル
     */
    headCursor: "gc-cursor-w-resize",
    /**
     * テールカーソル
     */
    tailCursor: "gc-cursor-e-resize",
    /**
     * ドラッグ中の終日予定のDOM要素
     */
    dragging: null,
    /**
     * 終日予定をドラッグ中に、前回ホバーした日付
     */
    draggingPrevDate: null,
    /**
     * 終日予定のドラッグ中の移動量
     */
    draggingCount: 0,
    /**
     * ドラッグ中の終日予定の掴んだ日付
     */
    grabbedDate: null,
    /**
     * 終日予定の開始位置を掴んでいるかどうか
     */
    grabbedStart: false,
    /**
     * 終日予定の終了位置を掴んでいるかどうか
     */
    grabbedEnd: false,
    /**
     * 終日予定をクリックした時の処理
     */
    onEvent: null,
    /**
     * 終日予定を移動した時の処理
     */
    onMove: null,
    /**
     * プレビューを生成する処理
     */
    onPreview: null,
    /**
     * 終日予定の移動を開始
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を開始したかどうか
     */
    onMouseDown($event) {
      const el = this.findEventAtElement($event.target);
      if (el) {
        this.grabbedStart = this.grabbedEnd = true;
        if (this.hitHead($event.target)) {
          this.grabbedEnd = false;
        }
        if (this.hitTail($event.target)) {
          this.grabbedStart = false;
        }
        this.grabbedDate = this.selector.findDateAtPoint($event.x, $event.y);
        this.dragging = el;
        this.setDragging(this.dragging.dataset.key, true);
        this.draggingPrevDate = null;
        this.updatePreview(this.grabbedDate);
        this.updateCursor();
        this.draggingCount = 0;
        return true;
      }
      return false;
    },
    /**
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    onMouseMove($event) {
      if (this.dragging) {
        const date = this.selector.findDateAtPoint($event.x, $event.y);
        if (date) {
          this.updatePreview(date);
        }
        this.draggingCount++;
        return true;
      }
      return false;
    },
    /**
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    onMouseUp($event) {
      if (this.dragging) {
        const key = this.dragging.dataset.key;
        const date = this.selector.findDateAtPoint($event.x, $event.y);
        if (date && this.grabbedDate !== date) {
          const [start, end] = this.getChangedPeriod(date);
          if (this.onMove) {
            this.onMove(key, start, end);
          }
        } else if (this.draggingCount < 3) {
          if (this.onEvent) {
            this.onEvent(key);
          }
        } else {
          if (this.onPreview) {
            this.onPreview(this.dragging, null, null);
          }
          this.setDragging(key, false);
        }
        this.dragging = null;
        this.grabbedStart = this.grabbedEnd = null;
        this.updateCursor();
        return true;
      }
      return false;
    },
    /**
     * 予定を取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    findEventAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(rootSelector)) {
          return el.closest(eventSelector);
        }
      }
      return null;
    },
    /**
     * 終日予定の先頭部分に当たったかどうか
     * @param el {HTMLElement} 判定する要素
     * @returns {boolean} 先頭部分に当たったかどうか
     */
    hitHead(el) {
      return !!el.closest(".gc-head");
    },
    /**
     * 終日予定の末尾部分に当たったかどうか
     * @param el {HTMLElement} 判定する要素
     * @returns {boolean} 末尾部分に当たったかどうか
     */
    hitTail(el) {
      return !!el.closest(".gc-tail");
    },
    /**
     * ドラッグ中のクラスを設定する
     */
    setDragging(key, dragging) {
      this.$el.querySelectorAll(this.eventSelector + '[data-key="' + key + '"]').forEach((el) => {
        if (dragging) {
          el.classList.add("gc-dragging");
        } else {
          el.classList.remove("gc-dragging");
        }
      });
    },
    /**
     * 変更後の終日予定の期間を取得する
     * @param date {string} マウスの位置の日付
     * @returns {Array} 変更後の終日予定の期間
     */
    getChangedPeriod(date) {
      const diff = diffInMilliseconds(this.grabbedDate, date);
      let start = toDateTimeString(Date.parse(this.dragging.dataset.start) + (this.grabbedStart ? diff : 0));
      let end = toDateTimeString(Date.parse(this.dragging.dataset.end) + (this.grabbedEnd ? diff : 0));
      start = start.substring(0, this.grabbedDate.length);
      end = end.substring(0, this.grabbedDate.length);
      if (start > end) {
        if (this.grabbedStart) {
          start = end;
        }
        if (this.grabbedEnd) {
          end = start;
        }
      }
      return [start, end];
    },
    /**
     * 終日予定をドラッグ中のカーソルを更新する
     */
    updateCursor() {
      this.$el.classList.remove(this.headCursor, this.tailCursor);
      if (this.grabbedStart && this.grabbedEnd) {
        this.$el.classList.add("gc-cursor-move");
      } else if (this.grabbedStart) {
        this.$el.classList.add(this.headCursor);
      } else if (this.grabbedEnd) {
        this.$el.classList.add(this.tailCursor);
      }
    },
    /**
     * ドラッグ中の終日予定のプレビューを更新する
     * @param date {string} マウスの位置の日付
     */
    updatePreview(date) {
      if (this.draggingPrevDate !== date) {
        const [start, end] = this.getChangedPeriod(date);
        if (this.onPreview) {
          this.onPreview(this.dragging, start, end);
        }
        this.draggingPrevDate = date;
      }
    }
  };
}

// resources/js/modules/all-day-event.js
function allDayEvent($el, rootSelector) {
  return {
    $el,
    /**
     * ルートセレクタ
     */
    rootSelector,
    /**
     * 日付選択
     */
    dateSelector: null,
    /**
     * リサイザー
     */
    resizer: null,
    /**
     * ホバー中の終日予定の要素
     */
    hover: null,
    /**
     * 終日予定をクリックした時の処理
     */
    onEvent: null,
    /**
     * 終日予定を移動した時の処理
     */
    onMove: null,
    /**
     * 初期化
     */
    init() {
      this.dateSelector = selector(this.$el, this.rootSelector, ".gc-day", "date");
      this.resizer = resize(this.$el, this.rootSelector, ".gc-all-day-event-container", this.dateSelector);
      this.resizer.headCursor = "gc-cursor-w-resize";
      this.resizer.tailCursor = "gc-cursor-e-resize";
      this.resizer.onEvent = (key) => {
        if (this.onEvent) {
          this.onEvent(key);
        }
      };
      this.resizer.onMove = (key, start, end) => {
        if (this.onMove) {
          this.onMove(key, start, end);
        }
      };
      this.resizer.onPreview = (el, start, end) => {
        this.removePreview();
        if (start && end) {
          this.createPreview(el, start, end);
        }
      };
    },
    /**
     * 終日予定の移動を開始
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を開始したかどうか
     */
    onMouseDown($event) {
      return this.resizer.onMouseDown($event);
    },
    /**
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    onMouseMove($event) {
      return this.resizer.onMouseMove($event);
    },
    /**
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    onMouseUp($event) {
      return this.resizer.onMouseUp($event);
    },
    /**
     * 終日イベントのマウスホバー処理
     * @param $event {Event} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    onMouseOver($event) {
      if (this.resizer.dragging) {
        return;
      }
      const el = this.findAllDayEventAtElement($event.target, true);
      const key = el ? el.dataset.key : null;
      if (key !== this.hover) {
        this.setHoverAllDayEvent(this.hover, false);
        this.setHoverAllDayEvent(this.hover = key, true);
      }
    },
    /**
     * 終日予定を取得
     * @param el {HTMLElement} DOM要素
     * @param withoutPopup {boolean} ポップアップを除外するかどうか
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    findAllDayEventAtElement(el, withoutPopup = false) {
      if (this.$el.contains(el)) {
        if (el.closest(rootSelector + (withoutPopup ? "" : ", .gc-day-grid-popup"))) {
          return el.closest(".gc-all-day-event-container");
        }
      }
      return null;
    },
    /**
     * 指定された終日予定のホバーを設定する
     * @param key {string} 終日予定のキー
     * @param hover {boolean} ホバーするかどうか
     */
    setHoverAllDayEvent(key, hover) {
      if (key) {
        this.$el.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]').forEach((el) => {
          if (hover) {
            el.classList.add("gc-hover");
          } else {
            el.classList.remove("gc-hover");
          }
        });
      }
    },
    /**
     * ドラッグ中の終日予定のプレビューを表示
     * @param elEvent {HTMLElement} 予定のDOM要素
     * @param eventStart {string} 予定の開始日
     * @param eventEnd {string} 予定の終了日
     */
    createPreview(elEvent, eventStart, eventEnd) {
      Array.from(this.$el.querySelectorAll(".gc-week, .gc-all-day-section")).forEach((elWeek) => {
        const [weekStart, weekEnd] = this.getWeekPeriod(elWeek);
        if (weekStart && weekEnd) {
          const [periodStart, periodEnd] = overlapPeriod(eventStart, eventEnd, weekStart, weekEnd);
          if (periodStart && periodEnd) {
            const elPreview = elWeek.querySelector('.gc-day[data-date="' + periodStart + '"] .gc-all-day-event-preview');
            if (weekStart <= this.resizer.grabbedDate && this.resizer.grabbedDate <= weekEnd) {
              this.addEmptyAllDayEvents(elPreview, this.getIndexInParent(elEvent));
            }
            const el = elEvent.cloneNode(true);
            const days = diffDays(periodStart, periodEnd) + 1;
            this.adjustAllDayEventForPreview(el, days, periodStart === eventStart, periodEnd === eventEnd);
            elPreview.appendChild(el);
          }
        }
      });
    },
    /**
     * 週の開始日・終了日を取得
     * @param elWeek {HTMLElement} 週のDOM要素
     * @returns {Array} 週の開始日・終了日
     */
    getWeekPeriod(elWeek) {
      const elDays = elWeek.querySelectorAll(".gc-day:not(.gc-disabled)");
      if (elDays.length > 0) {
        return [elDays[0].dataset.date, elDays[elDays.length - 1].dataset.date];
      } else {
        return [null, null];
      }
    },
    /**
     * ドラッグ中の終日予定をプレビューに合わせる
     * @param el {HTMLElement} 予定のDOM要素
     * @param days {number} ドラッグ中の終日予定の日数
     * @param isStart {boolean} 週内に開始するかどうか
     * @param isEnd {boolean} 週内に終了するかどうか
     */
    adjustAllDayEventForPreview(el, days, isStart, isEnd) {
      el.classList.remove("gc-dragging");
      el.classList.remove("gc-start");
      el.classList.remove("gc-end");
      for (let i = 1; i <= 7; i++) {
        el.classList.remove("gc-" + i + "days");
      }
      el.classList.add("gc-" + days + "days");
      if (isStart) {
        el.classList.add("gc-start");
      }
      if (isEnd) {
        el.classList.add("gc-end");
      }
      return el;
    },
    /**
     * 指定したDOM要素が兄弟の中で何番目かを取得
     * @param el {HTMLElement} DOM要素
     * @returns {number} インデックス
     */
    getIndexInParent(el) {
      return Array.from(el.parentNode.children).indexOf(el);
    },
    /**
     * 指定した数だけ空の終日予定を追加する
     */
    addEmptyAllDayEvents(elPreview, count) {
      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.classList.add("gc-all-day-event-container");
        elPreview.appendChild(el);
      }
    },
    /**
     * 終日予定のプレビューを削除
     */
    removePreview() {
      Array.from(this.$el.querySelectorAll(".gc-all-day-event-preview")).forEach((el) => el.parentNode.replaceChild(el.cloneNode(false), el));
    }
  };
}

// resources/js/modules/time-grid-timed-event.js
function timeGridTimedEvent($el, rootSelector) {
  return {
    $el,
    /**
     * ルートセレクタ
     */
    rootSelector,
    /**
     * 日付選択
     */
    timeSelector: null,
    /**
     * リサイザー
     */
    resizer: null,
    /**
     * ホバー中の終日予定の要素
     */
    hover: null,
    /**
     * 終日予定をクリックした時の処理
     */
    onEvent: null,
    /**
     * 終日予定を移動した時の処理
     */
    onMove: null,
    /**
     * 初期化
     */
    init() {
      this.timeSelector = selector(this.$el, this.rootSelector, ".gc-slot", "time");
      this.resizer = resize(this.$el, this.rootSelector, ".gc-timed-event-container", this.timeSelector);
      this.resizer.headCursor = "gc-cursor-n-resize";
      this.resizer.tailCursor = "gc-cursor-s-resize";
      this.resizer.onEvent = (key) => {
        if (this.onEvent) {
          this.onEvent(key);
        }
      };
      this.resizer.onMove = (key, start, end) => {
        if (this.onMove) {
          this.onMove(key, start, end);
        }
      };
      this.resizer.onPreview = (el, start, end) => {
        this.removePreview();
        if (start && end) {
          this.createPreview(el, start, end);
        }
      };
    },
    /**
     * 終日予定の移動を開始
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を開始したかどうか
     */
    onMouseDown($event) {
      return this.resizer.onMouseDown($event);
    },
    /**
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    onMouseMove($event) {
      return this.resizer.onMouseMove($event);
    },
    /**
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    onMouseUp($event) {
      return this.resizer.onMouseUp($event);
    },
    /**
     * 終日イベントのマウスホバー処理
     * @param $event {Event} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    onMouseOver($event) {
      if (this.resizer.dragging) {
        return;
      }
      const el = this.findAllDayEventAtElement($event.target, true);
      const key = el ? el.dataset.key : null;
      if (key !== this.hover) {
        this.setHoverAllDayEvent(this.hover, false);
        this.setHoverAllDayEvent(this.hover = key, true);
      }
    },
    /**
     * 終日予定を取得
     * @param el {HTMLElement} DOM要素
     * @param withoutPopup {boolean} ポップアップを除外するかどうか
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    findAllDayEventAtElement(el, withoutPopup = false) {
      if (this.$el.contains(el)) {
        if (el.closest(rootSelector + (withoutPopup ? "" : ", .gc-day-grid-popup"))) {
          return el.closest(".gc-all-day-event-container");
        }
      }
      return null;
    },
    /**
     * 指定された終日予定のホバーを設定する
     * @param key {string} 終日予定のキー
     * @param hover {boolean} ホバーするかどうか
     */
    setHoverAllDayEvent(key, hover) {
      if (key) {
        this.$el.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]').forEach((el) => {
          if (hover) {
            el.classList.add("gc-hover");
          } else {
            el.classList.remove("gc-hover");
          }
        });
      }
    },
    /**
     * ドラッグ中の終日予定のプレビューを表示
     * @param elEvent {HTMLElement} 予定のDOM要素
     * @param eventStart {string} 予定の開始日
     * @param eventEnd {string} 予定の終了日
     */
    createPreview(elEvent, eventStart, eventEnd) {
      const resourceId = elEvent.dataset.resourceId;
      Array.from(this.$el.querySelectorAll('.gc-timed-section .gc-day[data-resource-id="' + resourceId + '"]')).forEach((elDay) => {
        const [dayStart, dayEnd] = this.getDayPeriod(elDay);
        if (dayStart && dayEnd) {
          const [periodStart, periodEnd] = overlapPeriod(eventStart, eventEnd, dayStart, dayEnd);
          if (periodStart && periodEnd) {
            const elPreview = elDay.querySelector('.gc-slot[data-time="' + periodStart + '"] .gc-timed-event-preview');
            const el = elEvent.cloneNode(true);
            const slots = elDay.querySelectorAll(".gc-slot");
            let s = 0, e = slots.length;
            for (let i = 0; i < slots.length; i++) {
              if (slots[i].dataset.time === periodStart) {
                s = i;
              }
              if (slots[i].dataset.time === periodEnd) {
                e = i;
              }
            }
            const h = e - s;
            this.adjustTimedEventForPreview(el, h);
            elPreview.appendChild(el);
          }
        }
      });
    },
    /**
     * 日の開始時間・終了時間を取得
     * @param elDay {HTMLElement} 週のDOM要素
     * @returns {Array} 日の開始時間・終了時間
     */
    getDayPeriod(elDay) {
      return [elDay.dataset.startTime, elDay.dataset.endTime];
    },
    /**
     * ドラッグ中の終日予定をプレビューに合わせる
     * @param el {HTMLElement} 予定のDOM要素
     * @param h {number} スロット数
     */
    adjustTimedEventForPreview(el, h) {
      el.classList.remove("gc-dragging");
      el.style.setProperty("--gc-timed-event-height", h * 100 + "%");
      return el;
    },
    /**
     * 指定したDOM要素が兄弟の中で何番目かを取得
     * @param el {HTMLElement} DOM要素
     * @returns {number} インデックス
     */
    getIndexInParent(el) {
      return Array.from(el.parentNode.children).indexOf(el);
    },
    /**
     * 終日予定のプレビューを削除
     */
    removePreview() {
      Array.from(this.$el.querySelectorAll(".gc-timed-event-preview")).forEach((el) => el.parentNode.replaceChild(el.cloneNode(false), el));
    }
  };
}

// resources/js/time-grid.js
function timeGrid() {
  return {
    /**
     * 日付のセレクター
     */
    dateSelector: selector(this.$el, ".gc-time-grid", ".gc-day", "date"),
    /**
     * 時間のセレクター
     */
    timeSelector: selector(this.$el, ".gc-time-grid", ".gc-slot", "time"),
    /**
     * 終日予定
     */
    allDayEvent: allDayEvent(this.$el, ".gc-time-grid"),
    /**
     * 時間指定の予定
     */
    timedEvent: timeGridTimedEvent(this.$el, ".gc-time-grid"),
    /**
     * カレンダーの初期化
     */
    init() {
      this.dateSelector.onSelect = (start, end) => {
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59");
      };
      this.timeSelector.onSelect = (start, end) => {
        this.$wire.onDate(start, this.timeSelector.findElementByDate(end).dataset.timeEnd);
      };
      this.allDayEvent.init();
      this.allDayEvent.onEvent = (key) => {
        this.$wire.onEvent(key);
      };
      this.allDayEvent.onMove = (key, start, end) => {
        this.$wire.onMove(key, start, end);
      };
      this.timedEvent.init();
      this.timedEvent.onEvent = (key) => {
        this.$wire.onEvent(key);
      };
      this.timedEvent.onMove = (key, start, end) => {
        this.$wire.onMove(key, start, end);
      };
    },
    /**
     * クリックイベント
     * @param $event {Event} クリックイベント
     */
    onClick($event) {
      const key = this.findEventKeyAtElement($event.target);
      if (key) {
        this.$wire.onEvent(key);
      }
    },
    /**
     * マウスが押された時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseDown($event) {
      if (this.allDayEvent.onMouseDown($event)) {
      } else if (this.timedEvent.onMouseDown($event)) {
      } else if (this.dateSelector.onMouseDown($event)) {
      } else if (this.timeSelector.onMouseDown($event)) {
      }
    },
    /**
     * マウスが移動した時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseMove($event) {
      if (this.allDayEvent.onMouseMove($event)) {
      } else if (this.timedEvent.onMouseMove($event)) {
      } else if (this.dateSelector.onMouseMove($event)) {
      } else if (this.timeSelector.onMouseMove($event)) {
      }
    },
    /**
     * マウスが離された時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseUp($event) {
      if (this.allDayEvent.onMouseUp($event)) {
      } else if (this.timedEvent.onMouseUp($event)) {
      } else if (this.dateSelector.onMouseUp($event)) {
      } else if (this.timeSelector.onMouseUp($event)) {
      }
    },
    /**
     * マウスが要素に乗った時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseOver($event) {
      if (!this.dateSelector.selectionStart) {
        this.allDayEvent.onMouseOver($event);
      }
    },
    /**
     * 指定したDOM要素の近くの予定のキーを取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|string} 予定のDOM要素またはnull
     */
    findEventKeyAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(".gc-time-grid")) {
          const elEvent = el.closest(".gc-timed-event-container, .gc-all-day-event-container");
          if (elEvent) {
            return elEvent.dataset.key;
          }
        }
      }
      return null;
    }
  };
}
export {
  timeGrid as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvc2VsZWN0b3IuanMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvZGF0ZS11dGlscy5qcyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9yZXNpemVyLmpzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL2FsbC1kYXktZXZlbnQuanMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvdGltZS1ncmlkLXRpbWVkLWV2ZW50LmpzIiwgIi4uL3Jlc291cmNlcy9qcy90aW1lLWdyaWQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNlbGVjdG9yKCRlbCwgcm9vdFNlbGVjdG9yLCB0YXJnZXRTZWxlY3RvciwgcHJvcGVydHlOYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgJGVsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgICAgICovXG4gICAgICAgIHJvb3RTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU5MDc4XHU2MjlFXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICAgICAqL1xuICAgICAgICB0YXJnZXRTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXG4gICAgICAgICAqL1xuICAgICAgICBwcm9wZXJ0eU5hbWUsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAgICAgKi9cbiAgICAgICAgc2VsZWN0aW9uU3RhcnQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAgICAgKi9cbiAgICAgICAgc2VsZWN0aW9uRW5kOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgICAgICovXG4gICAgICAgIG9uU2VsZWN0OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtudWxsfHN0cmluZ30gXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICBmaW5kRGF0ZUF0RWxlbWVudChlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGVsLmNvbnRhaW5zKGVsKSkge1xuICAgICAgICAgICAgICAgIGlmIChlbC5jbG9zZXN0KHRoaXMucm9vdFNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbERheSA9IGVsLmNsb3Nlc3QodGhpcy50YXJnZXRTZWxlY3RvcilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsRGF5ICYmICFlbERheS5jbGFzc0xpc3QuY29udGFpbnMoJ2djLWRpc2FibGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbERheS5kYXRhc2V0W3RoaXMucHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU0RjREXHU3RjZFXHUzMDZCXHUzMDQyXHUzMDhCXHU2NUU1XHU0RUQ4XHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSB4IHtudW1iZXJ9IFhcdTVFQTdcdTZBMTlcbiAgICAgICAgICogQHBhcmFtIHkge251bWJlcn0gWVx1NUVBN1x1NkExOVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgICAgICovXG4gICAgICAgIGZpbmREYXRlQXRQb2ludCh4LCB5KSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IEFycmF5LmZyb20odGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCh0aGlzLnJvb3RTZWxlY3RvciArICcgJyArIHRoaXMudGFyZ2V0U2VsZWN0b3IpKS5maWx0ZXIoZWwgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgICAgIHJldHVybiByZWN0LmxlZnQgPD0geCAmJiB4IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0geSAmJiB5IDw9IHJlY3QuYm90dG9tXG4gICAgICAgICAgICB9KS5hdCgwKVxuICAgICAgICAgICAgcmV0dXJuIGVsID8gZWwuZGF0YXNldFt0aGlzLnByb3BlcnR5TmFtZV0gOiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBcdTY1RTVcdTRFRDhcdTMwNkVcdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGZpbmRFbGVtZW50QnlEYXRlKGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKHRoaXMucm9vdFNlbGVjdG9yICsgJyAnICsgdGhpcy50YXJnZXRTZWxlY3RvciArICdbZGF0YS0nICsgdGhpcy5wcm9wZXJ0eU5hbWUgKyAnPVwiJyArIGRhdGUgKyAnXCJdJylcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTZWxlY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgICAgICAgaWYgKGJlZ2luID4gZW5kKSB7XG4gICAgICAgICAgICAgICAgW2JlZ2luLCBlbmRdID0gW2VuZCwgYmVnaW5dXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMucm9vdFNlbGVjdG9yICsgJyAnICsgdGhpcy50YXJnZXRTZWxlY3RvcikuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZSA9IGVsLmRhdGFzZXRbdGhpcy5wcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgaWYgKGJlZ2luICYmIGVuZCAmJiBiZWdpbiA8PSBkYXRlICYmIGRhdGUgPD0gZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1zZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU5MDc4XHU2MjlFXHUzMDkyXHU5NThCXHU1OUNCXG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdEVsZW1lbnQoJGV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25TdGFydCA9IHRoaXMuc2VsZWN0aW9uRW5kID0gZGF0ZVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3OUZCXHU1MkQ1XHU2NjQyXHUzMDZFXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uU3RhcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbkVuZCA9IGRhdGVcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbih0aGlzLnNlbGVjdGlvblN0YXJ0LCB0aGlzLnNlbGVjdGlvbkVuZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtIG9uU2VsZWN0IHtmdW5jdGlvbn0gXHU5MDc4XHU2MjlFXHU2NjQyXHUzMDZFXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlVXAoJGV2ZW50LCBvblNlbGVjdCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gW3RoaXMuc2VsZWN0aW9uU3RhcnQsIGRhdGVdLnNvcnQoKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TZWxlY3Qoc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25TdGFydCA9IHRoaXMuc2VsZWN0aW9uRW5kID0gbnVsbFxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uKG51bGwsIG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9LFxuICAgIH1cbn0iLCAiY29uc3QgbWlsbGlzZWNvbmRzUGVyRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMFxuXG4vKipcbiAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvRGF0ZVN0cmluZyhkKSB7XG4gICAgcmV0dXJuIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdzdi1TRScpXG59XG5cbi8qKlxuICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU2NjQyXHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9EYXRlVGltZVN0cmluZyhkKSB7XG4gICAgcmV0dXJuIHRvRGF0ZVN0cmluZyhkKSArICcgJyArIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVUaW1lU3RyaW5nKFwiZW4tR0JcIilcbn1cblxuLyoqXG4gKiBcdTY1RTVcdTRFRDhcdTMwNkJcdTY1RTVcdTY1NzBcdTMwOTJcdTUyQTBcdTdCOTdcbiAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICogQHBhcmFtIGRheXMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBcdTUyQTBcdTdCOTdcdTVGOENcdTMwNkVcdTY1RTVcdTRFRDgoXHUzMERGXHUzMEVBXHU3OUQyKVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGF5cyhkYXRlLCBkYXlzKSB7XG4gICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZSkgKyBkYXlzICogbWlsbGlzZWNvbmRzUGVyRGF5XG59XG5cbi8qKlxuICogXHU2NUU1XHU0RUQ4XHUzMDY4XHU2NUU1XHU0RUQ4XHUzMDZFXHU1REVFXHUzMDZFXHU2NUU1XHU2NTcwXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZkRheXMoZGF0ZTEsIGRhdGUyKSB7XG4gICAgbGV0IGQxID0gbmV3IERhdGUoZGF0ZTEpXG4gICAgbGV0IGQyID0gbmV3IERhdGUoZGF0ZTIpXG4gICAgZDEuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgICBkMi5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgIHJldHVybiBNYXRoLmZsb29yKChkMi5nZXRUaW1lKCkgLSBkMS5nZXRUaW1lKCkpIC8gbWlsbGlzZWNvbmRzUGVyRGF5KVxufVxuXG4vKipcbiAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA5Mm1zXHUzMDY3XHU2QzQyXHUzMDgxXHUzMDhCXG4gKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZkluTWlsbGlzZWNvbmRzKGRhdGUxLCBkYXRlMikge1xuICAgIGxldCBkMSA9IG5ldyBEYXRlKGRhdGUxKVxuICAgIGxldCBkMiA9IG5ldyBEYXRlKGRhdGUyKVxuICAgIHJldHVybiBkMiAtIGQxXG59XG5cbi8qKlxuICogXHU2NzFGXHU5NTkzXHUzMDZFXHU5MUNEXHUzMDZBXHUzMDhBXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gKiBAcGFyYW0gc3RhcnQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAqIEBwYXJhbSBzdGFydDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICogQHBhcmFtIGVuZDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpIHtcbiAgICBjb25zdCBzdGFydCA9IHN0YXJ0MSA8PSBzdGFydDIgPyBzdGFydDIgOiBzdGFydDFcbiAgICBjb25zdCBlbmQgPSBlbmQxIDw9IGVuZDIgPyBlbmQxIDogZW5kMlxuICAgIHJldHVybiBzdGFydCA8PSBlbmQgPyBbc3RhcnQsIGVuZF0gOiBbbnVsbCwgbnVsbF1cbn0iLCAiaW1wb3J0IHthZGREYXlzLCBkaWZmRGF5cywgdG9EYXRlU3RyaW5nLCB0b0RhdGVUaW1lU3RyaW5nLCBkaWZmSW5NaWxsaXNlY29uZHN9IGZyb20gXCIuL2RhdGUtdXRpbHMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVzaXplKCRlbCwgcm9vdFNlbGVjdG9yLCBldmVudFNlbGVjdG9yLCBzZWxlY3Rvcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICRlbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICAgICAqL1xuICAgICAgICByb290U2VsZWN0b3IsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NEU4OFx1NUI5QVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAgICAgKi9cbiAgICAgICAgZXZlbnRTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXHUzMEZCXHU2NjQyXHU5NTkzXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAqL1xuICAgICAgICBzZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEQ4XHUzMEMzXHUzMEMwXHUzMEZDXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICAgICAqL1xuICAgICAgICBoZWFkQ3Vyc29yOiAnZ2MtY3Vyc29yLXctcmVzaXplJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM2XHUzMEZDXHUzMEVCXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICAgICAqL1xuICAgICAgICB0YWlsQ3Vyc29yOiAnZ2MtY3Vyc29yLWUtcmVzaXplJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZzogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZCXHUzMDAxXHU1MjREXHU1NkRFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDVGXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZ1ByZXZEYXRlOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcbiAgICAgICAgICovXG4gICAgICAgIGRyYWdnaW5nQ291bnQ6IDAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFxuICAgICAgICAgKi9cbiAgICAgICAgZ3JhYmJlZERhdGU6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgZ3JhYmJlZFN0YXJ0OiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBncmFiYmVkRW5kOiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvbkV2ZW50OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgICAgICovXG4gICAgICAgIG9uTW92ZTogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU3NTFGXHU2MjEwXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvblByZXZpZXc6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZURvd24oJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuZmluZEV2ZW50QXRFbGVtZW50KCRldmVudC50YXJnZXQpXG4gICAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTU5MDlcdTVGNjJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRTdGFydCA9IHRoaXMuZ3JhYmJlZEVuZCA9IHRydWVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oaXRIZWFkKCRldmVudC50YXJnZXQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRFbmQgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oaXRUYWlsKCRldmVudC50YXJnZXQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRTdGFydCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFiYmVkRGF0ZSA9IHRoaXMuc2VsZWN0b3IuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcblxuICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBlbFxuXG4gICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHVGRjA4XHU4ODY4XHU3OTNBXHUzMDkyXHU2RDg4XHUzMDU5XHVGRjA5XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZyh0aGlzLmRyYWdnaW5nLmRhdGFzZXQua2V5LCB0cnVlKVxuXG4gICAgICAgICAgICAgICAgLy8gXHU3M0ZFXHU1NzI4XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1ByZXZEYXRlID0gbnVsbFxuXG4gICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3KHRoaXMuZ3JhYmJlZERhdGUpXG5cbiAgICAgICAgICAgICAgICAvLyBcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUN1cnNvcigpXG5cbiAgICAgICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nQ291bnQgPSAwXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLnNlbGVjdG9yLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3KGRhdGUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdDb3VudCsrXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VVcCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5kcmFnZ2luZy5kYXRhc2V0LmtleVxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLnNlbGVjdG9yLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUgJiYgdGhpcy5ncmFiYmVkRGF0ZSAhPT0gZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldENoYW5nZWRQZXJpb2QoZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZHJhZ2dpbmdDb3VudCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblByZXZpZXcodGhpcy5kcmFnZ2luZywgbnVsbCwgbnVsbClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldERyYWdnaW5nKGtleSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsXG4gICAgICAgICAgICAgICAgdGhpcy5ncmFiYmVkU3RhcnQgPSB0aGlzLmdyYWJiZWRFbmQgPSBudWxsXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAgICAgKi9cbiAgICAgICAgZmluZEV2ZW50QXRFbGVtZW50KGVsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3Qocm9vdFNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuY2xvc2VzdChldmVudFNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgaGl0SGVhZChlbCkge1xuICAgICAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLWhlYWQnKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIGhpdFRhaWwoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy10YWlsJylcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICAgICAqL1xuICAgICAgICBzZXREcmFnZ2luZyhrZXksIGRyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuZXZlbnRTZWxlY3RvciArICdbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgICAgICovXG4gICAgICAgIGdldENoYW5nZWRQZXJpb2QoZGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZGlmZiA9IGRpZmZJbk1pbGxpc2Vjb25kcyh0aGlzLmdyYWJiZWREYXRlLCBkYXRlKVxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gdG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuZHJhZ2dpbmcuZGF0YXNldC5zdGFydCkgKyAodGhpcy5ncmFiYmVkU3RhcnQgPyBkaWZmIDogMCkpXG4gICAgICAgICAgICBsZXQgZW5kID0gdG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuZHJhZ2dpbmcuZGF0YXNldC5lbmQpICsgKHRoaXMuZ3JhYmJlZEVuZCA/IGRpZmYgOiAwKSlcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKDAsIHRoaXMuZ3JhYmJlZERhdGUubGVuZ3RoKVxuICAgICAgICAgICAgZW5kID0gZW5kLnN1YnN0cmluZygwLCB0aGlzLmdyYWJiZWREYXRlLmxlbmd0aClcbiAgICAgICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyYWJiZWRTdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGVuZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncmFiYmVkRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUN1cnNvcigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5oZWFkQ3Vyc29yLCB0aGlzLnRhaWxDdXJzb3IpXG4gICAgICAgICAgICBpZiAodGhpcy5ncmFiYmVkU3RhcnQgJiYgdGhpcy5ncmFiYmVkRW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuY2xhc3NMaXN0LmFkZCgnZ2MtY3Vyc29yLW1vdmUnKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdyYWJiZWRTdGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQodGhpcy5oZWFkQ3Vyc29yKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdyYWJiZWRFbmQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKHRoaXMudGFpbEN1cnNvcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlUHJldmlldyhkYXRlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1ByZXZEYXRlICE9PSBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRDaGFuZ2VkUGVyaW9kKGRhdGUpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25QcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25QcmV2aWV3KHRoaXMuZHJhZ2dpbmcsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQcmV2RGF0ZSA9IGRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9XG59IiwgImltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi9zZWxlY3Rvci5qc1wiO1xuaW1wb3J0IHJlc2l6ZXIgZnJvbSBcIi4vcmVzaXplci5qc1wiO1xuaW1wb3J0IHthZGREYXlzLCBkaWZmRGF5cywgb3ZlcmxhcFBlcmlvZCwgdG9EYXRlU3RyaW5nfSBmcm9tIFwiLi9kYXRlLXV0aWxzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFsbERheUV2ZW50KCRlbCwgcm9vdFNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJGVsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgICAgICovXG4gICAgICAgIHJvb3RTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHU5MDc4XHU2MjlFXG4gICAgICAgICAqL1xuICAgICAgICBkYXRlU2VsZWN0b3I6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1xuICAgICAgICAgKi9cbiAgICAgICAgcmVzaXplcjogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERCXHUzMEQwXHUzMEZDXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBob3ZlcjogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvbkV2ZW50OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgICAgICovXG4gICAgICAgIG9uTW92ZTogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAqL1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5kYXRlU2VsZWN0b3IgPSBzZWxlY3Rvcih0aGlzLiRlbCwgdGhpcy5yb290U2VsZWN0b3IsICcuZ2MtZGF5JywgJ2RhdGUnKVxuICAgICAgICAgICAgdGhpcy5yZXNpemVyID0gcmVzaXplcih0aGlzLiRlbCwgdGhpcy5yb290U2VsZWN0b3IsICcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInLCB0aGlzLmRhdGVTZWxlY3RvcilcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5oZWFkQ3Vyc29yID0gJ2djLWN1cnNvci13LXJlc2l6ZSdcbiAgICAgICAgICAgIHRoaXMucmVzaXplci50YWlsQ3Vyc29yID0gJ2djLWN1cnNvci1lLXJlc2l6ZSdcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5vbkV2ZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZXIub25Nb3ZlID0gKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZXNpemVyLm9uUHJldmlldyA9IChlbCwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJldmlldygpXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVByZXZpZXcoZWwsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzaXplci5vbk1vdXNlRG93bigkZXZlbnQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVyLm9uTW91c2VNb3ZlKCRldmVudClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlVXAoJGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVyLm9uTW91c2VVcCgkZXZlbnQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzBERVx1MzBBNlx1MzBCOVx1MzBEQlx1MzBEMFx1MzBGQ1x1NTFFNlx1NzQwNlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VPdmVyKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVzaXplci5kcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmZpbmRBbGxEYXlFdmVudEF0RWxlbWVudCgkZXZlbnQudGFyZ2V0LCB0cnVlKVxuICAgICAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGxcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHRoaXMuaG92ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5ob3ZlciwgZmFsc2UpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuaG92ZXIgPSBrZXksIHRydWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIHdpdGhvdXRQb3B1cCB7Ym9vbGVhbn0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NjY0XHU1OTE2XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICAgICAqL1xuICAgICAgICBmaW5kQWxsRGF5RXZlbnRBdEVsZW1lbnQoZWwsIHdpdGhvdXRQb3B1cCA9IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3Qocm9vdFNlbGVjdG9yICsgKHdpdGhvdXRQb3B1cCA/ICcnIDogJywgLmdjLWRheS1ncmlkLXBvcHVwJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0ga2V5IHtzdHJpbmd9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1xuICAgICAgICAgKiBAcGFyYW0gaG92ZXIge2Jvb2xlYW59IFx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0SG92ZXJBbGxEYXlFdmVudChrZXksIGhvdmVyKSB7XG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIGV2ZW50U3RhcnQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVByZXZpZXcoZWxFdmVudCwgZXZlbnRTdGFydCwgZXZlbnRFbmQpIHtcbiAgICAgICAgICAgIC8vIFx1NTQwNFx1OTAzMVx1MzA1NFx1MzA2OFx1MzA2Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgQXJyYXkuZnJvbSh0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtd2VlaywgLmdjLWFsbC1kYXktc2VjdGlvbicpKS5mb3JFYWNoKGVsV2VlayA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3dlZWtTdGFydCwgd2Vla0VuZF0gPSB0aGlzLmdldFdlZWtQZXJpb2QoZWxXZWVrKVxuICAgICAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgJiYgd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbcGVyaW9kU3RhcnQsIHBlcmlvZEVuZF0gPSBvdmVybGFwUGVyaW9kKGV2ZW50U3RhcnQsIGV2ZW50RW5kLCB3ZWVrU3RhcnQsIHdlZWtFbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJpb2RTdGFydCAmJiBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsUHJldmlldyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5W2RhdGEtZGF0ZT1cIicgKyBwZXJpb2RTdGFydCArICdcIl0gLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2Vla1N0YXJ0IDw9IHRoaXMucmVzaXplci5ncmFiYmVkRGF0ZSAmJiB0aGlzLnJlc2l6ZXIuZ3JhYmJlZERhdGUgPD0gd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1OTAzMVx1MzA2N1x1MzA2Rlx1MzAwMVx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEY0RFx1N0Y2RVx1MzA5Mlx1ODAwM1x1NjE2RVx1MzA1N1x1MzA2Nlx1N0E3QVx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3LCB0aGlzLmdldEluZGV4SW5QYXJlbnQoZWxFdmVudCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGVsRXZlbnQuY2xvbmVOb2RlKHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlzID0gZGlmZkRheXMocGVyaW9kU3RhcnQsIHBlcmlvZEVuZCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkanVzdEFsbERheUV2ZW50Rm9yUHJldmlldyhlbCwgZGF5cywgcGVyaW9kU3RhcnQgPT09IGV2ZW50U3RhcnQsIHBlcmlvZEVuZCA9PT0gZXZlbnRFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsV2VlayB7SFRNTEVsZW1lbnR9IFx1OTAzMVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1OTAzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzBGQlx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0V2Vla1BlcmlvZChlbFdlZWspIHtcbiAgICAgICAgICAgIGNvbnN0IGVsRGF5cyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZGF5Om5vdCguZ2MtZGlzYWJsZWQpJylcbiAgICAgICAgICAgIGlmIChlbERheXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbZWxEYXlzWzBdLmRhdGFzZXQuZGF0ZSwgZWxEYXlzW2VsRGF5cy5sZW5ndGggLSAxXS5kYXRhc2V0LmRhdGVdXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBbbnVsbCwgbnVsbF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY1RTVcdTY1NzBcbiAgICAgICAgICogQHBhcmFtIGlzU3RhcnQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1OTU4Qlx1NTlDQlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKiBAcGFyYW0gaXNFbmQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1N0Q0Mlx1NEU4Nlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgYWRqdXN0QWxsRGF5RXZlbnRGb3JQcmV2aWV3KGVsLCBkYXlzLCBpc1N0YXJ0LCBpc0VuZCkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc3RhcnQnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZW5kJylcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDc7IGkrKykge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLScgKyBpICsgJ2RheXMnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtJyArIGRheXMgKyAnZGF5cycpXG4gICAgICAgICAgICBpZiAoaXNTdGFydCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXN0YXJ0JylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWVuZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDRDXHU1MTQ0XHU1RjFGXHUzMDZFXHU0RTJEXHUzMDY3XHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTMwQTRcdTMwRjNcdTMwQzdcdTMwQzNcdTMwQUZcdTMwQjlcbiAgICAgICAgICovXG4gICAgICAgIGdldEluZGV4SW5QYXJlbnQoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YoZWwpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1Rlx1NjU3MFx1MzA2MFx1MzA1MVx1N0E3QVx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFx1MzA1OVx1MzA4QlxuICAgICAgICAgKi9cbiAgICAgICAgYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3LCBjb3VudCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NTI0QVx1OTY2NFxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlUHJldmlldygpIHtcbiAgICAgICAgICAgIEFycmF5LmZyb20odGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsID0+IGVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsLmNsb25lTm9kZShmYWxzZSksIGVsKSlcbiAgICAgICAgfSxcbiAgICB9XG59IiwgImltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi9zZWxlY3Rvci5qc1wiO1xuaW1wb3J0IHJlc2l6ZXIgZnJvbSBcIi4vcmVzaXplci5qc1wiO1xuaW1wb3J0IHthZGREYXlzLCBkaWZmRGF5cywgb3ZlcmxhcFBlcmlvZCwgdG9EYXRlU3RyaW5nfSBmcm9tIFwiLi9kYXRlLXV0aWxzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpbWVHcmlkVGltZWRFdmVudCgkZWwsIHJvb3RTZWxlY3Rvcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICRlbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICAgICAqL1xuICAgICAgICByb290U2VsZWN0b3IsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjVFNVx1NEVEOFx1OTA3OFx1NjI5RVxuICAgICAgICAgKi9cbiAgICAgICAgdGltZVNlbGVjdG9yOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQjZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIHJlc2l6ZXI6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBEQlx1MzBEMFx1MzBGQ1x1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgaG92ZXI6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgb25FdmVudDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdmU6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgKi9cbiAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgIHRoaXMudGltZVNlbGVjdG9yID0gc2VsZWN0b3IodGhpcy4kZWwsIHRoaXMucm9vdFNlbGVjdG9yLCAnLmdjLXNsb3QnLCAndGltZScpXG4gICAgICAgICAgICB0aGlzLnJlc2l6ZXIgPSByZXNpemVyKHRoaXMuJGVsLCB0aGlzLnJvb3RTZWxlY3RvciwgJy5nYy10aW1lZC1ldmVudC1jb250YWluZXInLCB0aGlzLnRpbWVTZWxlY3RvcilcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5oZWFkQ3Vyc29yID0gJ2djLWN1cnNvci1uLXJlc2l6ZSdcbiAgICAgICAgICAgIHRoaXMucmVzaXplci50YWlsQ3Vyc29yID0gJ2djLWN1cnNvci1zLXJlc2l6ZSdcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5vbkV2ZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZXIub25Nb3ZlID0gKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZXNpemVyLm9uUHJldmlldyA9IChlbCwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJldmlldygpXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVByZXZpZXcoZWwsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzaXplci5vbk1vdXNlRG93bigkZXZlbnQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVyLm9uTW91c2VNb3ZlKCRldmVudClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlVXAoJGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVyLm9uTW91c2VVcCgkZXZlbnQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzBERVx1MzBBNlx1MzBCOVx1MzBEQlx1MzBEMFx1MzBGQ1x1NTFFNlx1NzQwNlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VPdmVyKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVzaXplci5kcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmZpbmRBbGxEYXlFdmVudEF0RWxlbWVudCgkZXZlbnQudGFyZ2V0LCB0cnVlKVxuICAgICAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGxcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHRoaXMuaG92ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5ob3ZlciwgZmFsc2UpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuaG92ZXIgPSBrZXksIHRydWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIHdpdGhvdXRQb3B1cCB7Ym9vbGVhbn0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NjY0XHU1OTE2XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICAgICAqL1xuICAgICAgICBmaW5kQWxsRGF5RXZlbnRBdEVsZW1lbnQoZWwsIHdpdGhvdXRQb3B1cCA9IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3Qocm9vdFNlbGVjdG9yICsgKHdpdGhvdXRQb3B1cCA/ICcnIDogJywgLmdjLWRheS1ncmlkLXBvcHVwJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0ga2V5IHtzdHJpbmd9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1xuICAgICAgICAgKiBAcGFyYW0gaG92ZXIge2Jvb2xlYW59IFx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0SG92ZXJBbGxEYXlFdmVudChrZXksIGhvdmVyKSB7XG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIGV2ZW50U3RhcnQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVByZXZpZXcoZWxFdmVudCwgZXZlbnRTdGFydCwgZXZlbnRFbmQpIHtcbiAgICAgICAgICAgIC8vIFx1NTQwNFx1OTAzMVx1MzA1NFx1MzA2OFx1MzA2Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgY29uc3QgcmVzb3VyY2VJZCA9IGVsRXZlbnQuZGF0YXNldC5yZXNvdXJjZUlkXG4gICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy10aW1lZC1zZWN0aW9uIC5nYy1kYXlbZGF0YS1yZXNvdXJjZS1pZD1cIicgKyByZXNvdXJjZUlkICsgJ1wiXScpKS5mb3JFYWNoKGVsRGF5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBbZGF5U3RhcnQsIGRheUVuZF0gPSB0aGlzLmdldERheVBlcmlvZChlbERheSlcbiAgICAgICAgICAgICAgICBpZiAoZGF5U3RhcnQgJiYgZGF5RW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtwZXJpb2RTdGFydCwgcGVyaW9kRW5kXSA9IG92ZXJsYXBQZXJpb2QoZXZlbnRTdGFydCwgZXZlbnRFbmQsIGRheVN0YXJ0LCBkYXlFbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJpb2RTdGFydCAmJiBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsUHJldmlldyA9IGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1zbG90W2RhdGEtdGltZT1cIicgKyBwZXJpb2RTdGFydCArICdcIl0gLmdjLXRpbWVkLWV2ZW50LXByZXZpZXcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBlbEV2ZW50LmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2xvdHMgPSBlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtc2xvdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcyA9IDAsIGUgPSBzbG90cy5sZW5ndGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xvdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2xvdHNbaV0uZGF0YXNldC50aW1lID09PSBwZXJpb2RTdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzID0gaVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2xvdHNbaV0uZGF0YXNldC50aW1lID09PSBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZSA9IGlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoID0gZSAtIHNcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0VGltZWRFdmVudEZvclByZXZpZXcoZWwsIGgpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY1RTVcdTMwNkVcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcdTMwRkJcdTdENDJcdTRFODZcdTY2NDJcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHU5MDMxXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU2NUU1XHUzMDZFXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXHUzMEZCXHU3RDQyXHU0RTg2XHU2NjQyXHU5NTkzXG4gICAgICAgICAqL1xuICAgICAgICBnZXREYXlQZXJpb2QoZWxEYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBbZWxEYXkuZGF0YXNldC5zdGFydFRpbWUsIGVsRGF5LmRhdGFzZXQuZW5kVGltZV1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0gaCB7bnVtYmVyfSBcdTMwQjlcdTMwRURcdTMwQzNcdTMwQzhcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIGFkanVzdFRpbWVkRXZlbnRGb3JQcmV2aWV3KGVsLCBoKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1nYy10aW1lZC1ldmVudC1oZWlnaHQnLCAoaCAqIDEwMCkgKyAnJScpO1xuICAgICAgICAgICAgcmV0dXJuIGVsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1RkRPTVx1ODk4MVx1N0QyMFx1MzA0Q1x1NTE0NFx1NUYxRlx1MzA2RVx1NEUyRFx1MzA2N1x1NEY1NVx1NzU2QVx1NzZFRVx1MzA0Qlx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHUzMEE0XHUzMEYzXHUzMEM3XHUzMEMzXHUzMEFGXHUzMEI5XG4gICAgICAgICAqL1xuICAgICAgICBnZXRJbmRleEluUGFyZW50KGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbC5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKGVsKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTUyNEFcdTk2NjRcbiAgICAgICAgICovXG4gICAgICAgIHJlbW92ZVByZXZpZXcoKSB7XG4gICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy10aW1lZC1ldmVudC1wcmV2aWV3JykpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goZWwgPT4gZWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWwuY2xvbmVOb2RlKGZhbHNlKSwgZWwpKVxuICAgICAgICB9LFxuICAgIH1cbn0iLCAiaW1wb3J0IHNlbGVjdG9yIGZyb20gJy4vbW9kdWxlcy9zZWxlY3RvcidcbmltcG9ydCBhbGxEYXlFdmVudCBmcm9tICcuL21vZHVsZXMvYWxsLWRheS1ldmVudCdcbmltcG9ydCB0aW1lZEV2ZW50IGZyb20gJy4vbW9kdWxlcy90aW1lLWdyaWQtdGltZWQtZXZlbnQnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpbWVHcmlkKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIGRhdGVTZWxlY3Rvcjogc2VsZWN0b3IodGhpcy4kZWwsICcuZ2MtdGltZS1ncmlkJywgJy5nYy1kYXknLCAnZGF0ZScpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY2NDJcdTk1OTNcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIHRpbWVTZWxlY3Rvcjogc2VsZWN0b3IodGhpcy4kZWwsICcuZ2MtdGltZS1ncmlkJywgJy5nYy1zbG90JywgJ3RpbWUnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICBhbGxEYXlFdmVudDogYWxsRGF5RXZlbnQodGhpcy4kZWwsICcuZ2MtdGltZS1ncmlkJyksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWRFdmVudDogdGltZWRFdmVudCh0aGlzLiRlbCwgJy5nYy10aW1lLWdyaWQnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAqL1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5kYXRlU2VsZWN0b3Iub25TZWxlY3QgPSAoc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25EYXRlKHN0YXJ0ICsgJyAwMDowMDowMCcsIGVuZCArICcgMjM6NTk6NTknKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL3RoaXMudGltZVNlbGVjdG9yLmluaXQoKVxuICAgICAgICAgICAgdGhpcy50aW1lU2VsZWN0b3Iub25TZWxlY3QgPSAoc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25EYXRlKHN0YXJ0LCB0aGlzLnRpbWVTZWxlY3Rvci5maW5kRWxlbWVudEJ5RGF0ZShlbmQpLmRhdGFzZXQudGltZUVuZClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAgICB0aGlzLmFsbERheUV2ZW50LmluaXQoKVxuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5vbkV2ZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmFsbERheUV2ZW50Lm9uTW92ZSA9IChrZXksIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50LmluaXQoKVxuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50Lm9uRXZlbnQgPSAoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZWRFdmVudC5vbk1vdmUgPSAoa2V5LCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RXZlbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25DbGljaygkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZmluZEV2ZW50S2V5QXRFbGVtZW50KCRldmVudC50YXJnZXQpXG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgLy8gXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU1ODM0XHU1NDA4XG4gICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU2MkJDXHUzMDU1XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZURvd24oJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hbGxEYXlFdmVudC5vbk1vdXNlRG93bigkZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU5NThCXHU1OUNCXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudGltZWRFdmVudC5vbk1vdXNlRG93bigkZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU5NThCXHU1OUNCXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGF0ZVNlbGVjdG9yLm9uTW91c2VEb3duKCRldmVudCkpIHtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50aW1lU2VsZWN0b3Iub25Nb3VzZURvd24oJGV2ZW50KSkge1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNENcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlTW92ZSgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFsbERheUV2ZW50Lm9uTW91c2VNb3ZlKCRldmVudCkpIHtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50aW1lZEV2ZW50Lm9uTW91c2VNb3ZlKCRldmVudCkpIHtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kYXRlU2VsZWN0b3Iub25Nb3VzZU1vdmUoJGV2ZW50KSkge1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRpbWVTZWxlY3Rvci5vbk1vdXNlTW92ZSgkZXZlbnQpKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA0Q1x1OTZFMlx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VVcCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFsbERheUV2ZW50Lm9uTW91c2VVcCgkZXZlbnQpKSB7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudGltZWRFdmVudC5vbk1vdXNlVXAoJGV2ZW50KSkge1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRhdGVTZWxlY3Rvci5vbk1vdXNlVXAoJGV2ZW50KSkge1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRpbWVTZWxlY3Rvci5vbk1vdXNlVXAoJGV2ZW50KSkge1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNENcdTg5ODFcdTdEMjBcdTMwNkJcdTRFNTdcdTMwNjNcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlT3ZlcigkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5kYXRlU2VsZWN0b3Iuc2VsZWN0aW9uU3RhcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFsbERheUV2ZW50Lm9uTW91c2VPdmVyKCRldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDZFXHU4RkQxXHUzMDRGXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFEXHUzMEZDXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgICAgICovXG4gICAgICAgIGZpbmRFdmVudEtleUF0RWxlbWVudChlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGVsLmNvbnRhaW5zKGVsKSkge1xuICAgICAgICAgICAgICAgIGlmIChlbC5jbG9zZXN0KCcuZ2MtdGltZS1ncmlkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxFdmVudCA9IGVsLmNsb3Nlc3QoJy5nYy10aW1lZC1ldmVudC1jb250YWluZXIsIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxFdmVudC5kYXRhc2V0LmtleVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSxcbiAgICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFlLFNBQVIsU0FBMEIsS0FBSyxjQUFjLGdCQUFnQixjQUFjO0FBQzlFLFNBQU87QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlIO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0E7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLQSxnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtoQixjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxVQUFVO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBT1Ysa0JBQWtCLElBQUk7QUFDbEIsVUFBSSxLQUFLLElBQUksU0FBUyxFQUFFLEdBQUc7QUFDdkIsWUFBSSxHQUFHLFFBQVEsS0FBSyxZQUFZLEdBQUc7QUFDL0IsZ0JBQU0sUUFBUSxHQUFHLFFBQVEsS0FBSyxjQUFjO0FBQzVDLGNBQUksU0FBUyxDQUFDLE1BQU0sVUFBVSxTQUFTLGFBQWEsR0FBRztBQUNuRCxtQkFBTyxNQUFNLFFBQVEsS0FBSyxZQUFZO0FBQUEsVUFDMUM7QUFBQSxRQUNKO0FBQUEsTUFDSjtBQUNBLGFBQU87QUFBQSxJQUNYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFRQSxnQkFBZ0IsR0FBRyxHQUFHO0FBQ2xCLFlBQU0sS0FBSyxNQUFNLEtBQUssS0FBSyxJQUFJLGlCQUFpQixLQUFLLGVBQWUsTUFBTSxLQUFLLGNBQWMsQ0FBQyxFQUFFLE9BQU8sQ0FBQUEsUUFBTTtBQUN6RyxjQUFNLE9BQU9BLElBQUcsc0JBQXNCO0FBQ3RDLGVB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QUFRLEdBQUc7QUFBQSxNQUMxQjtBQUNBLFdBQUssV0FBVyxTQUFTLENBQUMsS0FBSyxPQUFPLFFBQVE7QUFDMUMsYUFBSyxNQUFNLE9BQU8sS0FBSyxPQUFPLEdBQUc7QUFBQSxNQUNyQztBQUFBLElBQ0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsUUFBUSxRQUFRO0FBQ1osWUFBTSxNQUFNLEtBQUssc0JBQXNCLE9BQU8sTUFBTTtBQUNwRCxVQUFJLEtBQUs7QUFFTCxhQUFLLE1BQU0sUUFBUSxHQUFHO0FBQUEsTUFDMUI7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQU1BLFlBQVksUUFBUTtBQUNoQixVQUFJLEtBQUssWUFBWSxZQUFZLE1BQU0sR0FBRztBQUFBLE1BRTFDLFdBQVcsS0FBSyxXQUFXLFlBQVksTUFBTSxHQUFHO0FBQUEsTUFFaEQsV0FBVyxLQUFLLGFBQWEsWUFBWSxNQUFNLEdBQUc7QUFBQSxNQUNsRCxXQUFXLEtBQUssYUFBYSxZQUFZLE1BQU0sR0FBRztBQUFBLE1BQ2xEO0FBQUEsSUFDSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNQSxZQUFZLFFBQVE7QUFDaEIsVUFBSSxLQUFLLFlBQVksWUFBWSxNQUFNLEdBQUc7QUFBQSxNQUMxQyxXQUFXLEtBQUssV0FBVyxZQUFZLE1BQU0sR0FBRztBQUFBLE1BQ2hELFdBQVcsS0FBSyxhQUFhLFlBQVksTUFBTSxHQUFHO0FBQUEsTUFDbEQsV0FBVyxLQUFLLGFBQWEsWUFBWSxNQUFNLEdBQUc7QUFBQSxNQUNsRDtBQUFBLElBQ0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsVUFBVSxRQUFRO0FBQ2QsVUFBSSxLQUFLLFlBQVksVUFBVSxNQUFNLEdBQUc7QUFBQSxNQUN4QyxXQUFXLEtBQUssV0FBVyxVQUFVLE1BQU0sR0FBRztBQUFBLE1BQzlDLFdBQVcsS0FBSyxhQUFhLFVBQVUsTUFBTSxHQUFHO0FBQUEsTUFDaEQsV0FBVyxLQUFLLGFBQWEsVUFBVSxNQUFNLEdBQUc7QUFBQSxNQUNoRDtBQUFBLElBQ0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsWUFBWSxRQUFRO0FBQ2hCLFVBQUksQ0FBQyxLQUFLLGFBQWEsZ0JBQWdCO0FBQ25DLGFBQUssWUFBWSxZQUFZLE1BQU07QUFBQSxNQUN2QztBQUFBLElBQ0o7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFPQSxzQkFBc0IsSUFBSTtBQUN0QixVQUFJLEtBQUssSUFBSSxTQUFTLEVBQUUsR0FBRztBQUN2QixZQUFJLEdBQUcsUUFBUSxlQUFlLEdBQUc7QUFDN0IsZ0JBQU0sVUFBVSxHQUFHLFFBQVEsd0RBQXdEO0FBQ25GLGNBQUksU0FBUztBQUNULG1CQUFPLFFBQVEsUUFBUTtBQUFBLFVBQzNCO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFDSjsiLAogICJuYW1lcyI6IFsiZWwiLCAic2VsZWN0b3IiXQp9Cg==
