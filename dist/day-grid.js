// resources/js/modules/day-grid-popup.js
function dayGridPopup($el, componentParameters) {
  return {
    $el,
    componentParameters,
    /**
     * キャッシュされた表示数
     */
    cachedVisibleCount: null,
    /**
     * キャッシュされた日の日付表示の部分の高さ
     */
    cachedDayTopHeight: null,
    /**
     * キャッシュされた予定部分の高さ
     */
    cachedEventHeight: null,
    /**
     * カレンダーのレイアウトを再計算
     * @param {boolean} force 強制的に再計算するかどうか
     */
    updateLayout(force = false) {
      const visibleCount = this.getVisibleCount();
      if (this.cachedVisibleCount !== visibleCount || force) {
        this.cachedVisibleCount = visibleCount;
        this.$el.querySelectorAll(".gc-week .gc-day").forEach((elDay) => {
          this.updateDay(elDay, visibleCount);
        });
      }
    },
    /**
     * カレンダーの日の高さを取得
     * @returns {number} 日の高さ
     */
    getDayHeight() {
      return this.$el.querySelector(".gc-week .gc-day").offsetHeight;
    },
    /**
     * カレンダーの各日の日付表示の部分の高さを取得
     * @returns {number} 日付表示の部分の高さ
     */
    getDayTopHeight() {
      if (this.cachedDayTopHeight) {
        return this.cachedDayTopHeight;
      } else {
        return this.cachedDayTopHeight = this.$el.querySelector(".gc-day-top").offsetHeight;
      }
    },
    /**
     * カレンダーの各日の本体部分の高さを取得
     * @returns {number} 本体部分の高さ
     */
    getDayBodyHeight() {
      return this.getDayHeight() - this.getDayTopHeight();
    },
    /**
     * 予定の高さを取得
     * @returns {number} 予定の高さ
     */
    getEventHeight() {
      if (this.cachedEventHeight) {
        return this.cachedEventHeight;
      } else {
        return this.cachedEventHeight = this.$el.querySelector(".gc-timed-events > .gc-all-day-event-container, .gc-timed-events > .gc-timed-event-container").offsetHeight;
      }
    },
    /**
     * 表示できる数を取得
     * @returns {number} 表示できる数
     */
    getVisibleCount() {
      return Math.floor(this.getDayBodyHeight() / this.getEventHeight());
    },
    /**
     * カレンダーの日の予定数を取得
     * @returns {number} 予定数
     */
    getEventCount(elDay) {
      return elDay.querySelectorAll(".gc-timed-events > .gc-all-day-event-container, .gc-timed-events > .gc-timed-event-container").length;
    },
    /**
     * 時間指定の予定の高さを設定
     * @param elDay {HTMLElement} カレンダーの日
     * @param height {number} 高さ
     */
    setTimedEventsHeight(elDay, height) {
      elDay.querySelector(".gc-timed-events").style.height = height + "px";
    },
    /**
     * 終日予定の表示・非表示を設定
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     * @param visibleEvents {number} 表示可能な予定数
     */
    setAllDayEventsVisibility(elDay, visibleEvents) {
      elDay.querySelectorAll(".gc-all-day-events .gc-all-day-event-container").forEach((elEvent, index) => {
        if (index <= visibleEvents) {
          elEvent.classList.remove("gc-hidden");
        } else {
          elEvent.classList.add("gc-hidden");
        }
      });
    },
    /**
     * 残りの予定数を設定
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     * @param remainingCount {number} 残りの予定数
     */
    setRemainingCount(elDay, remainingCount) {
      const elRemaining = elDay.querySelector(".gc-remaining-container");
      if (remainingCount > 0) {
        elRemaining.children[0].innerText = componentParameters.remaining.replace(":count", remainingCount);
        elRemaining.classList.remove("gc-hidden");
      } else {
        elRemaining.classList.add("gc-hidden");
      }
    },
    /**
     * 表示する予定数を更新
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     * @param visibleCount {number} 表示できる数
     */
    updateDay(elDay, visibleCount) {
      const eventCount = this.getEventCount(elDay);
      const limitCount = eventCount < visibleCount ? eventCount : visibleCount - 1;
      const remainingCount = eventCount - limitCount;
      this.setTimedEventsHeight(elDay, this.getEventHeight() * limitCount);
      this.setAllDayEventsVisibility(elDay, limitCount - (remainingCount ? 1 : 0));
      this.setRemainingCount(elDay, remainingCount);
    },
    /**
     * 残りの予定をクリックしたかどうか
     * @param el {HTMLElement} クリックされた要素
     * @returns {boolean} 残りの予定をクリックしたかどうか
     */
    hitRemaining(el) {
      return el.closest(".gc-remaining-container") !== null && this.$el.contains(el);
    },
    /**
     * ポップアップを開く
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     */
    openPopup(elDay) {
      this.buildPopup(elDay);
      this.layoutPopup(elDay);
    },
    /**
     * ポップアップを閉じる
     */
    closePopup() {
      const elPopup = this.$el.querySelector(".gc-day-grid-popup");
      elPopup.classList.add("gc-hidden");
    },
    /**
     * ポップアップを構築
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     */
    buildPopup(elDay) {
      const elPopup = this.$el.querySelector(".gc-day-grid-popup");
      const elDayBody = elDay.querySelector(".gc-day-body").cloneNode(true);
      const elDayBodyOrig = elPopup.querySelector(".gc-day-body");
      this.replaceAllDayEvents(elDayBody, this.getAllDayEventKeys(elDayBody));
      elDayBodyOrig.parentNode.replaceChild(elDayBody, elDayBodyOrig);
      this.adjustPopup(elPopup);
      elPopup.querySelector(".gc-date").innerText = elDay.querySelector(".gc-date").innerText;
    },
    /**
     * 終日予定のkeyを全て取得
     * @param elDay {HTMLElement} カレンダーの日の本体部分のDOM要素
     */
    getAllDayEventKeys(elDay) {
      return Array.from(elDay.querySelectorAll(".gc-timed-events .gc-all-day-event-container[data-key]")).map((el) => el.dataset.key).filter((key) => key !== "");
    },
    /**
     * 時間指定の予定の中の終日予定のスペーサーを全て削除
     * @param elDayBody {HTMLElement} カレンダーの日の本体部分のDOM要素
     * @param keys {Array} 終日予定のkey
     */
    replaceAllDayEvents(elDayBody, keys) {
      Array.from(elDayBody.querySelectorAll(".gc-all-day-event-container")).forEach((el) => el.parentNode.removeChild(el));
      const elAllDayEvents = elDayBody.querySelector(".gc-all-day-events");
      keys.forEach((key) => {
        const el = this.$el.querySelector('.gc-all-day-events .gc-all-day-event-container[data-key="' + key + '"]').cloneNode(true);
        el.classList.add("gc-start", "gc-end");
        el.classList.remove("gc-hidden");
        elAllDayEvents.appendChild(el);
      });
    },
    /**
     * ポップアップ内の要素の表示を微調節する
     * @param elPopup {HTMLElement} ポップアップのDOM要素
     */
    adjustPopup(elPopup) {
      elPopup.classList.remove("gc-hidden");
      elPopup.style.width = "auto";
      elPopup.style.height = "auto";
      const elTimedEvents = elPopup.querySelector(".gc-timed-events");
      elTimedEvents.style.height = "auto";
      const elRemaining = elPopup.querySelector(".gc-remaining-container");
      elRemaining.parentNode.removeChild(elRemaining);
    },
    /**
     * ポップアップのレイアウトを更新
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     */
    layoutPopup(elDay) {
      const elPopup = this.$el.querySelector(".gc-day-grid-popup");
      const rectPopup = elPopup.getBoundingClientRect();
      const rectDay = elDay.getBoundingClientRect();
      let x = rectDay.left - 1 + window.scrollX;
      let y = rectDay.top - 1 + window.scrollY;
      let w = Math.max(rectDay.width * 1.1, rectPopup.width);
      let h = Math.max(rectDay.height, rectPopup.height);
      if (x + w > window.innerWidth) {
        x = window.innerWidth - w;
      }
      if (y + h > window.innerHeight) {
        x = window.innerHeight - h;
      }
      elPopup.style.left = x + "px";
      elPopup.style.top = y + "px";
      elPopup.style.width = w + "px";
      elPopup.style.height = h + "px";
    }
  };
}

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
function addDays(date, days) {
  return Date.parse(date) + days * millisecondsPerDay;
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

// resources/js/modules/day-grid-timed-event.js
function dayGridTimedEvent($el, rootSelector) {
  return {
    $el,
    /**
     * 日付選択
     */
    dateSelector: selector($el, rootSelector, ".gc-day", "date"),
    /**
     * ドラッグ中の時間指定の予定のDOM要素
     */
    draggingTimedEvent: null,
    /**
     * 予定をクリックした時の処理
     */
    onEvent: null,
    /**
     * 予定を移動した時の処理
     */
    onMove: null,
    /**
     * クリックイベント
     *
     * @param $event {MouseEvent} クリックイベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    onClick($event) {
      const key = this.findEventKeyAtElement($event.target);
      if (key) {
        if (this.onEvent) {
          this.onEvent(key);
        }
        return true;
      }
      return false;
    },
    /**
     * ドラッグイベント
     * @param $event {DragEvent} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    onDragStart($event) {
      const el = $event.target.closest(".gc-timed-event-container");
      if (el) {
        this.draggingTimedEvent = el;
        $event.dataTransfer.effectAllowed = "move";
        $event.dataTransfer.setData("text/plain", el.dataset.key);
        return true;
      }
    },
    /**
     * ドラッグ中の要素が要素に乗った時のイベント
     * @param $event {DragEvent} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    onDragOver($event) {
      const date = this.dateSelector.findDateAtPoint($event.x, $event.y);
      if (date) {
        this.dateSelector.updateSelection(date, date);
        $event.preventDefault();
      }
    },
    /**
     * ドロップイベント
     * @param $event {DragEvent} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    onDrop($event) {
      const date = this.dateSelector.findDateAtPoint($event.x, $event.y);
      const key = $event.dataTransfer.getData("text/plain");
      if (date) {
        const days = diffDays(this.draggingTimedEvent.dataset.start, date);
        if (days !== 0) {
          const start = toDateTimeString(addDays(this.draggingTimedEvent.dataset.start, days));
          const end = toDateTimeString(addDays(this.draggingTimedEvent.dataset.end, days));
          this.draggingTimedEvent = null;
          if (this.onMove) {
            this.onMove(key, start, end);
          }
        }
      }
    },
    /**
     * ドラッグ中の要素が要素から外れた時のイベント
     * @param $event {DragEvent} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    onDragEnd($event) {
      this.dateSelector.updateSelection(null, null);
      if (this.draggingTimedEvent) {
        this.draggingTimedEvent.classList.remove("gc-dragging");
        this.draggingTimedEvent = null;
      }
    },
    /**
     * 指定したDOM要素の近くの予定のキーを取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|string} 予定のDOM要素またはnull
     */
    findEventKeyAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(".gc-day-grid, .gc-day-grid-popup")) {
          const elEvent = el.closest(".gc-timed-event-container");
          if (elEvent) {
            return elEvent.dataset.key;
          }
        }
      }
      return null;
    },
    /**
     * ドラッグ中の要素をドラッグ中の状態にする
     *
     * @returns {void}
     */
    addDraggingClass() {
      if (this.draggingTimedEvent) {
        this.draggingTimedEvent.classList.add("gc-dragging");
      }
    }
  };
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

// resources/js/day-grid.js
function dayGrid(componentParameters) {
  return {
    /**
     * ポップアップに関する処理
     */
    popup: dayGridPopup(this.$el, componentParameters),
    /**
     * 日付のセレクター
     */
    dateSelector: selector(this.$el, ".gc-day-grid", ".gc-day", "date"),
    /**
     * 時間指定の予定に関する処理
     */
    timedEvent: dayGridTimedEvent(this.$el, ".gc-day-grid"),
    /**
     * 終日の予定に関する処理
     */
    allDayEvent: allDayEvent(this.$el, ".gc-day-grid"),
    /**
     * カレンダーの初期化
     */
    init() {
      this.popup.updateLayout();
      this.dateSelector.onSelect = (start, end) => {
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59");
      };
      this.timedEvent.onEvent = (key) => {
        this.$wire.onEvent(key);
      };
      this.timedEvent.onMove = (key, start, end) => {
        this.$wire.onMove(key, start, end);
      };
      this.allDayEvent.init();
      this.allDayEvent.onEvent = (key) => {
        this.$wire.onEvent(key);
      };
      this.allDayEvent.onMove = (key, start, end) => {
        this.$wire.onMove(key, start, end);
      };
      Livewire.on("refreshCalendar", () => {
        this.$nextTick(() => this.popup.updateLayout(true));
      });
    },
    /**
     * ウィンドウのリサイズイベント
     * @param $event {Event} イベント
     */
    onResize($event) {
      this.popup.updateLayout();
    },
    /**
     * クリックイベント
     * @param $event {Event} クリックイベント
     */
    onClick($event) {
      const elDay = $event.target.closest(".gc-day");
      if (this.popup.hitRemaining($event.target)) {
        this.popup.openPopup(elDay);
      } else if (elDay && elDay.classList.contains("gc-disabled")) {
      } else if (this.timedEvent.onClick($event)) {
      } else {
        this.popup.closePopup();
      }
    },
    /**
     * マウスが押された時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseDown($event) {
      if (this.popup.hitRemaining($event.target)) {
      } else if (this.timedEvent.findEventKeyAtElement($event.target)) {
      } else if (this.allDayEvent.onMouseDown($event)) {
      } else {
        this.dateSelector.onMouseDown($event);
      }
    },
    /**
     * マウスが移動した時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseMove($event) {
      if (this.allDayEvent.onMouseMove($event)) {
      } else if (this.dateSelector.onMouseMove($event)) {
      }
    },
    /**
     * マウスが離された時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseUp($event) {
      if (this.allDayEvent.onMouseUp($event)) {
      } else if (this.dateSelector.onMouseUp($event)) {
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
     * ドラッグイベント
     * @param $event {DragEvent} イベント
     */
    onDragStart($event) {
      if (this.timedEvent.onDragStart($event)) {
        this.$nextTick(() => this.timedEvent.addDraggingClass());
      }
    },
    /**
     * ドラッグ中の要素が要素に乗った時のイベント
     * @param $event
     */
    onDragOver($event) {
      this.timedEvent.onDragOver($event);
    },
    /**
     * ドロップイベント
     * @param $event {DragEvent} イベント
     */
    onDrop($event) {
      this.timedEvent.onDrop($event);
    },
    /**
     * ドラッグ中の要素が要素から外れた時のイベント
     * @param $event
     */
    onDragEnd($event) {
      this.timedEvent.onDragEnd($event);
    }
  };
}
export {
  dayGrid as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvZGF5LWdyaWQtcG9wdXAuanMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvc2VsZWN0b3IuanMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvZGF0ZS11dGlscy5qcyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9kYXktZ3JpZC10aW1lZC1ldmVudC5qcyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9yZXNpemVyLmpzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL2FsbC1kYXktZXZlbnQuanMiLCAiLi4vcmVzb3VyY2VzL2pzL2RheS1ncmlkLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkYXlHcmlkUG9wdXAoJGVsLCBjb21wb25lbnRQYXJhbWV0ZXJzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJGVsLFxuICAgICAgICBjb21wb25lbnRQYXJhbWV0ZXJzLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQURcdTMwRTNcdTMwQzNcdTMwQjdcdTMwRTVcdTMwNTVcdTMwOENcdTMwNUZcdTg4NjhcdTc5M0FcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIGNhY2hlZFZpc2libGVDb3VudDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFEXHUzMEUzXHUzMEMzXHUzMEI3XHUzMEU1XHUzMDU1XHUzMDhDXHUzMDVGXHU2NUU1XHUzMDZFXHU2NUU1XHU0RUQ4XHU4ODY4XHU3OTNBXHUzMDZFXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBjYWNoZWREYXlUb3BIZWlnaHQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBRFx1MzBFM1x1MzBDM1x1MzBCN1x1MzBFNVx1MzA1NVx1MzA4Q1x1MzA1Rlx1NEU4OFx1NUI5QVx1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAgICAgKi9cbiAgICAgICAgY2FjaGVkRXZlbnRIZWlnaHQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFx1MzA5Mlx1NTE4RFx1OEEwOFx1N0I5N1xuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIFx1NUYzN1x1NTIzNlx1NzY4NFx1MzA2Qlx1NTE4RFx1OEEwOFx1N0I5N1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlTGF5b3V0KGZvcmNlID0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vIFx1ODg2OFx1NzkzQVx1NjU3MFx1MzA0Q1x1NTkwOVx1MzA4Rlx1MzA2M1x1MzA2Nlx1MzA0NFx1MzA2QVx1MzA0NFx1NTgzNFx1NTQwOFx1MzA2Rlx1NEY1NVx1MzA4Mlx1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICAgICAgY29uc3QgdmlzaWJsZUNvdW50ID0gdGhpcy5nZXRWaXNpYmxlQ291bnQoKVxuICAgICAgICAgICAgaWYgKHRoaXMuY2FjaGVkVmlzaWJsZUNvdW50ICE9PSB2aXNpYmxlQ291bnQgfHwgZm9yY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhY2hlZFZpc2libGVDb3VudCA9IHZpc2libGVDb3VudFxuICAgICAgICAgICAgICAgIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy13ZWVrIC5nYy1kYXknKS5mb3JFYWNoKGVsRGF5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYXkoZWxEYXksIHZpc2libGVDb3VudClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBnZXREYXlIZWlnaHQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLXdlZWsgLmdjLWRheScpLm9mZnNldEhlaWdodFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTU0MDRcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHU0RUQ4XHU4ODY4XHU3OTNBXHUzMDZFXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBnZXREYXlUb3BIZWlnaHQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jYWNoZWREYXlUb3BIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWREYXlUb3BIZWlnaHRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkRGF5VG9wSGVpZ2h0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLWRheS10b3AnKS5vZmZzZXRIZWlnaHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU1NDA0XHU2NUU1XHUzMDZFXHU2NzJDXHU0RjUzXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RGF5Qm9keUhlaWdodCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERheUhlaWdodCgpIC0gdGhpcy5nZXREYXlUb3BIZWlnaHQoKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHU0RTg4XHU1QjlBXHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBnZXRFdmVudEhlaWdodCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNhY2hlZEV2ZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkRXZlbnRIZWlnaHRcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkRXZlbnRIZWlnaHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzID4gLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyLCAuZ2MtdGltZWQtZXZlbnRzID4gLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lcicpLm9mZnNldEhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTg4NjhcdTc5M0FcdTMwNjdcdTMwNERcdTMwOEJcdTY1NzBcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXG4gICAgICAgICAqL1xuICAgICAgICBnZXRWaXNpYmxlQ291bnQoKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih0aGlzLmdldERheUJvZHlIZWlnaHQoKSAvIHRoaXMuZ2V0RXZlbnRIZWlnaHQoKSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RXZlbnRDb3VudChlbERheSkge1xuICAgICAgICAgICAgcmV0dXJuIGVsRGF5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy10aW1lZC1ldmVudHMgPiAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXIsIC5nYy10aW1lZC1ldmVudHMgPiAuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJykubGVuZ3RoXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcbiAgICAgICAgICogQHBhcmFtIGhlaWdodCB7bnVtYmVyfSBcdTlBRDhcdTMwNTVcbiAgICAgICAgICovXG4gICAgICAgIHNldFRpbWVkRXZlbnRzSGVpZ2h0KGVsRGF5LCBoZWlnaHQpIHtcbiAgICAgICAgICAgIGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy10aW1lZC1ldmVudHMnKS5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODg2OFx1NzkzQVx1MzBGQlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIHZpc2libGVFdmVudHMge251bWJlcn0gXHU4ODY4XHU3OTNBXHU1M0VGXHU4MEZEXHUzMDZBXHU0RTg4XHU1QjlBXHU2NTcwXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBbGxEYXlFdmVudHNWaXNpYmlsaXR5KGVsRGF5LCB2aXNpYmxlRXZlbnRzKSB7XG4gICAgICAgICAgICBlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudHMgLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJykuZm9yRWFjaCgoZWxFdmVudCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPD0gdmlzaWJsZUV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICBlbEV2ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWxFdmVudC5jbGFzc0xpc3QuYWRkKCdnYy1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIHJlbWFpbmluZ0NvdW50IHtudW1iZXJ9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAgICAgKi9cbiAgICAgICAgc2V0UmVtYWluaW5nQ291bnQoZWxEYXksIHJlbWFpbmluZ0NvdW50KSB7XG4gICAgICAgICAgICBjb25zdCBlbFJlbWFpbmluZyA9IGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1yZW1haW5pbmctY29udGFpbmVyJylcbiAgICAgICAgICAgIGlmIChyZW1haW5pbmdDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICBlbFJlbWFpbmluZy5jaGlsZHJlblswXS5pbm5lclRleHQgPSBjb21wb25lbnRQYXJhbWV0ZXJzLnJlbWFpbmluZy5yZXBsYWNlKCc6Y291bnQnLCByZW1haW5pbmdDb3VudClcbiAgICAgICAgICAgICAgICBlbFJlbWFpbmluZy5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbFJlbWFpbmluZy5jbGFzc0xpc3QuYWRkKCdnYy1oaWRkZW4nKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTg4NjhcdTc5M0FcdTMwNTlcdTMwOEJcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTY2RjRcdTY1QjBcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEBwYXJhbSB2aXNpYmxlQ291bnQge251bWJlcn0gXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVEYXkoZWxEYXksIHZpc2libGVDb3VudCkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRDb3VudCA9IHRoaXMuZ2V0RXZlbnRDb3VudChlbERheSlcbiAgICAgICAgICAgIGNvbnN0IGxpbWl0Q291bnQgPSBldmVudENvdW50IDwgdmlzaWJsZUNvdW50ID8gZXZlbnRDb3VudCA6IHZpc2libGVDb3VudCAtIDFcbiAgICAgICAgICAgIGNvbnN0IHJlbWFpbmluZ0NvdW50ID0gZXZlbnRDb3VudCAtIGxpbWl0Q291bnRcbiAgICAgICAgICAgIHRoaXMuc2V0VGltZWRFdmVudHNIZWlnaHQoZWxEYXksIHRoaXMuZ2V0RXZlbnRIZWlnaHQoKSAqIGxpbWl0Q291bnQpXG4gICAgICAgICAgICB0aGlzLnNldEFsbERheUV2ZW50c1Zpc2liaWxpdHkoZWxEYXksIGxpbWl0Q291bnQgLSAocmVtYWluaW5nQ291bnQgPyAxIDogMCkpXG4gICAgICAgICAgICB0aGlzLnNldFJlbWFpbmluZ0NvdW50KGVsRGF5LCByZW1haW5pbmdDb3VudClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBoaXRSZW1haW5pbmcoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtcmVtYWluaW5nLWNvbnRhaW5lcicpICE9PSBudWxsICYmIHRoaXMuJGVsLmNvbnRhaW5zKGVsKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk1OEJcdTMwNEZcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBvcGVuUG9wdXAoZWxEYXkpIHtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRQb3B1cChlbERheSlcbiAgICAgICAgICAgIHRoaXMubGF5b3V0UG9wdXAoZWxEYXkpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTU4OVx1MzA1OFx1MzA4QlxuICAgICAgICAgKi9cbiAgICAgICAgY2xvc2VQb3B1cCgpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsUG9wdXAgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWdyaWQtcG9wdXAnKVxuICAgICAgICAgICAgZWxQb3B1cC5jbGFzc0xpc3QuYWRkKCdnYy1oaWRkZW4nKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTY5Q0JcdTdCQzlcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBidWlsZFBvcHVwKGVsRGF5KSB7XG4gICAgICAgICAgICAvLyBET01cdTMwOTJcdTY5Q0JcdTdCQzlcbiAgICAgICAgICAgIGNvbnN0IGVsUG9wdXAgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWdyaWQtcG9wdXAnKVxuICAgICAgICAgICAgY29uc3QgZWxEYXlCb2R5ID0gZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLWRheS1ib2R5JykuY2xvbmVOb2RlKHRydWUpXG4gICAgICAgICAgICBjb25zdCBlbERheUJvZHlPcmlnID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWJvZHknKVxuICAgICAgICAgICAgdGhpcy5yZXBsYWNlQWxsRGF5RXZlbnRzKGVsRGF5Qm9keSwgdGhpcy5nZXRBbGxEYXlFdmVudEtleXMoZWxEYXlCb2R5KSlcbiAgICAgICAgICAgIGVsRGF5Qm9keU9yaWcucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWxEYXlCb2R5LCBlbERheUJvZHlPcmlnKVxuICAgICAgICAgICAgdGhpcy5hZGp1c3RQb3B1cChlbFBvcHVwKVxuXG4gICAgICAgICAgICAvLyBcdTY1RTVcdTRFRDhcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgIGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLWRhdGUnKS5pbm5lclRleHQgPSBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF0ZScpLmlubmVyVGV4dFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVrZXlcdTMwOTJcdTUxNjhcdTMwNjZcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU2NzJDXHU0RjUzXHU5MEU4XHU1MjA2XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBnZXRBbGxEYXlFdmVudEtleXMoZWxEYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKGVsRGF5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy10aW1lZC1ldmVudHMgLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5XScpKVxuICAgICAgICAgICAgICAgIC5tYXAoZWwgPT4gZWwuZGF0YXNldC5rZXkpLmZpbHRlcihrZXkgPT4ga2V5ICE9PSAnJylcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEI5XHUzMERBXHUzMEZDXHUzMEI1XHUzMEZDXHUzMDkyXHU1MTY4XHUzMDY2XHU1MjRBXHU5NjY0XG4gICAgICAgICAqIEBwYXJhbSBlbERheUJvZHkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIGtleXMge0FycmF5fSBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVrZXlcbiAgICAgICAgICovXG4gICAgICAgIHJlcGxhY2VBbGxEYXlFdmVudHMoZWxEYXlCb2R5LCBrZXlzKSB7XG4gICAgICAgICAgICAvLyBcdTY1RTJcdTMwNkJcdTUxNjVcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTUyNEFcdTk2NjRcdTMwNTlcdTMwOEJcbiAgICAgICAgICAgIEFycmF5LmZyb20oZWxEYXlCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpKS5mb3JFYWNoKGVsID0+IGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpKVxuXG4gICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdThGRkRcdTUyQTBcbiAgICAgICAgICAgIGNvbnN0IGVsQWxsRGF5RXZlbnRzID0gZWxEYXlCb2R5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cycpXG4gICAgICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpLmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXN0YXJ0JywgJ2djLWVuZCcpXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgICAgICBlbEFsbERheUV2ZW50cy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1NTE4NVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NUZBRVx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZWxQb3B1cCB7SFRNTEVsZW1lbnR9IFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgYWRqdXN0UG9wdXAoZWxQb3B1cCkge1xuICAgICAgICAgICAgLy8gXHU4ODY4XHU3OTNBXHUzMDU5XHUzMDhCXG4gICAgICAgICAgICBlbFBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpXG5cbiAgICAgICAgICAgIC8vIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RVx1NTkyN1x1MzA0RFx1MzA1NVx1MzA5Mlx1ODFFQVx1NTJENVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9ICdhdXRvJ1xuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS5oZWlnaHQgPSAnYXV0bydcblxuICAgICAgICAgICAgLy8gXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU4MUVBXHU1MkQ1XHUzMDZCXHUzMDU5XHUzMDhCXG4gICAgICAgICAgICBjb25zdCBlbFRpbWVkRXZlbnRzID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJylcbiAgICAgICAgICAgIGVsVGltZWRFdmVudHMuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nXG5cbiAgICAgICAgICAgIC8vIFx1NEVENlx1MjZBQVx1RkUwRVx1NEVGNlx1MzA5Mlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgY29uc3QgZWxSZW1haW5pbmcgPSBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1yZW1haW5pbmctY29udGFpbmVyJylcbiAgICAgICAgICAgIGVsUmVtYWluaW5nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxSZW1haW5pbmcpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RVx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFx1MzA5Mlx1NjZGNFx1NjVCMFxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGxheW91dFBvcHVwKGVsRGF5KSB7XG4gICAgICAgICAgICBjb25zdCBlbFBvcHVwID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLWRheS1ncmlkLXBvcHVwJylcbiAgICAgICAgICAgIGNvbnN0IHJlY3RQb3B1cCA9IGVsUG9wdXAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGNvbnN0IHJlY3REYXkgPSBlbERheS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgbGV0IHggPSByZWN0RGF5LmxlZnQgLSAxICsgd2luZG93LnNjcm9sbFhcbiAgICAgICAgICAgIGxldCB5ID0gcmVjdERheS50b3AgLSAxICsgd2luZG93LnNjcm9sbFlcbiAgICAgICAgICAgIGxldCB3ID0gTWF0aC5tYXgocmVjdERheS53aWR0aCAqIDEuMSwgcmVjdFBvcHVwLndpZHRoKVxuICAgICAgICAgICAgbGV0IGggPSBNYXRoLm1heChyZWN0RGF5LmhlaWdodCwgcmVjdFBvcHVwLmhlaWdodClcbiAgICAgICAgICAgIGlmICh4ICsgdyA+IHdpbmRvdy5pbm5lcldpZHRoKSB7XG4gICAgICAgICAgICAgICAgeCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gd1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHkgKyBoID4gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgeCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIGhcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsUG9wdXAuc3R5bGUubGVmdCA9IHggKyAncHgnXG4gICAgICAgICAgICBlbFBvcHVwLnN0eWxlLnRvcCA9IHkgKyAncHgnXG4gICAgICAgICAgICBlbFBvcHVwLnN0eWxlLndpZHRoID0gdyArICdweCdcbiAgICAgICAgICAgIGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gaCArICdweCdcbiAgICAgICAgfSxcbiAgICB9XG59IiwgImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNlbGVjdG9yKCRlbCwgcm9vdFNlbGVjdG9yLCB0YXJnZXRTZWxlY3RvciwgcHJvcGVydHlOYW1lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgJGVsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgICAgICovXG4gICAgICAgIHJvb3RTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU5MDc4XHU2MjlFXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICAgICAqL1xuICAgICAgICB0YXJnZXRTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXG4gICAgICAgICAqL1xuICAgICAgICBwcm9wZXJ0eU5hbWUsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAgICAgKi9cbiAgICAgICAgc2VsZWN0aW9uU3RhcnQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAgICAgKi9cbiAgICAgICAgc2VsZWN0aW9uRW5kOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgICAgICovXG4gICAgICAgIG9uU2VsZWN0OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtudWxsfHN0cmluZ30gXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICBmaW5kRGF0ZUF0RWxlbWVudChlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGVsLmNvbnRhaW5zKGVsKSkge1xuICAgICAgICAgICAgICAgIGlmIChlbC5jbG9zZXN0KHRoaXMucm9vdFNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbERheSA9IGVsLmNsb3Nlc3QodGhpcy50YXJnZXRTZWxlY3RvcilcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsRGF5ICYmICFlbERheS5jbGFzc0xpc3QuY29udGFpbnMoJ2djLWRpc2FibGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbERheS5kYXRhc2V0W3RoaXMucHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU0RjREXHU3RjZFXHUzMDZCXHUzMDQyXHUzMDhCXHU2NUU1XHU0RUQ4XHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSB4IHtudW1iZXJ9IFhcdTVFQTdcdTZBMTlcbiAgICAgICAgICogQHBhcmFtIHkge251bWJlcn0gWVx1NUVBN1x1NkExOVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgICAgICovXG4gICAgICAgIGZpbmREYXRlQXRQb2ludCh4LCB5KSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IEFycmF5LmZyb20odGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCh0aGlzLnJvb3RTZWxlY3RvciArICcgJyArIHRoaXMudGFyZ2V0U2VsZWN0b3IpKS5maWx0ZXIoZWwgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgICAgIHJldHVybiByZWN0LmxlZnQgPD0geCAmJiB4IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0geSAmJiB5IDw9IHJlY3QuYm90dG9tXG4gICAgICAgICAgICB9KS5hdCgwKVxuICAgICAgICAgICAgcmV0dXJuIGVsID8gZWwuZGF0YXNldFt0aGlzLnByb3BlcnR5TmFtZV0gOiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBcdTY1RTVcdTRFRDhcdTMwNkVcdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGZpbmRFbGVtZW50QnlEYXRlKGRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKHRoaXMucm9vdFNlbGVjdG9yICsgJyAnICsgdGhpcy50YXJnZXRTZWxlY3RvciArICdbZGF0YS0nICsgdGhpcy5wcm9wZXJ0eU5hbWUgKyAnPVwiJyArIGRhdGUgKyAnXCJdJylcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTZWxlY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgICAgICAgaWYgKGJlZ2luID4gZW5kKSB7XG4gICAgICAgICAgICAgICAgW2JlZ2luLCBlbmRdID0gW2VuZCwgYmVnaW5dXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMucm9vdFNlbGVjdG9yICsgJyAnICsgdGhpcy50YXJnZXRTZWxlY3RvcikuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZSA9IGVsLmRhdGFzZXRbdGhpcy5wcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgaWYgKGJlZ2luICYmIGVuZCAmJiBiZWdpbiA8PSBkYXRlICYmIGRhdGUgPD0gZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1zZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU5MDc4XHU2MjlFXHUzMDkyXHU5NThCXHU1OUNCXG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdEVsZW1lbnQoJGV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25TdGFydCA9IHRoaXMuc2VsZWN0aW9uRW5kID0gZGF0ZVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3OUZCXHU1MkQ1XHU2NjQyXHUzMDZFXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uU3RhcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbkVuZCA9IGRhdGVcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbih0aGlzLnNlbGVjdGlvblN0YXJ0LCB0aGlzLnNlbGVjdGlvbkVuZClcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtIG9uU2VsZWN0IHtmdW5jdGlvbn0gXHU5MDc4XHU2MjlFXHU2NjQyXHUzMDZFXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlVXAoJGV2ZW50LCBvblNlbGVjdCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gW3RoaXMuc2VsZWN0aW9uU3RhcnQsIGRhdGVdLnNvcnQoKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TZWxlY3Qoc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25TdGFydCA9IHRoaXMuc2VsZWN0aW9uRW5kID0gbnVsbFxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uKG51bGwsIG51bGwpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9LFxuICAgIH1cbn0iLCAiY29uc3QgbWlsbGlzZWNvbmRzUGVyRGF5ID0gMjQgKiA2MCAqIDYwICogMTAwMFxuXG4vKipcbiAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvRGF0ZVN0cmluZyhkKSB7XG4gICAgcmV0dXJuIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdzdi1TRScpXG59XG5cbi8qKlxuICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU2NjQyXHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9EYXRlVGltZVN0cmluZyhkKSB7XG4gICAgcmV0dXJuIHRvRGF0ZVN0cmluZyhkKSArICcgJyArIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVUaW1lU3RyaW5nKFwiZW4tR0JcIilcbn1cblxuLyoqXG4gKiBcdTY1RTVcdTRFRDhcdTMwNkJcdTY1RTVcdTY1NzBcdTMwOTJcdTUyQTBcdTdCOTdcbiAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICogQHBhcmFtIGRheXMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBcdTUyQTBcdTdCOTdcdTVGOENcdTMwNkVcdTY1RTVcdTRFRDgoXHUzMERGXHUzMEVBXHU3OUQyKVxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGF5cyhkYXRlLCBkYXlzKSB7XG4gICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZSkgKyBkYXlzICogbWlsbGlzZWNvbmRzUGVyRGF5XG59XG5cbi8qKlxuICogXHU2NUU1XHU0RUQ4XHUzMDY4XHU2NUU1XHU0RUQ4XHUzMDZFXHU1REVFXHUzMDZFXHU2NUU1XHU2NTcwXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZkRheXMoZGF0ZTEsIGRhdGUyKSB7XG4gICAgbGV0IGQxID0gbmV3IERhdGUoZGF0ZTEpXG4gICAgbGV0IGQyID0gbmV3IERhdGUoZGF0ZTIpXG4gICAgZDEuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgICBkMi5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgIHJldHVybiBNYXRoLmZsb29yKChkMi5nZXRUaW1lKCkgLSBkMS5nZXRUaW1lKCkpIC8gbWlsbGlzZWNvbmRzUGVyRGF5KVxufVxuXG4vKipcbiAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA5Mm1zXHUzMDY3XHU2QzQyXHUzMDgxXHUzMDhCXG4gKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlmZkluTWlsbGlzZWNvbmRzKGRhdGUxLCBkYXRlMikge1xuICAgIGxldCBkMSA9IG5ldyBEYXRlKGRhdGUxKVxuICAgIGxldCBkMiA9IG5ldyBEYXRlKGRhdGUyKVxuICAgIHJldHVybiBkMiAtIGQxXG59XG5cbi8qKlxuICogXHU2NzFGXHU5NTkzXHUzMDZFXHU5MUNEXHUzMDZBXHUzMDhBXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gKiBAcGFyYW0gc3RhcnQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAqIEBwYXJhbSBzdGFydDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICogQHBhcmFtIGVuZDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpIHtcbiAgICBjb25zdCBzdGFydCA9IHN0YXJ0MSA8PSBzdGFydDIgPyBzdGFydDIgOiBzdGFydDFcbiAgICBjb25zdCBlbmQgPSBlbmQxIDw9IGVuZDIgPyBlbmQxIDogZW5kMlxuICAgIHJldHVybiBzdGFydCA8PSBlbmQgPyBbc3RhcnQsIGVuZF0gOiBbbnVsbCwgbnVsbF1cbn0iLCAiaW1wb3J0IHNlbGVjdG9yIGZyb20gJy4vc2VsZWN0b3InXG5pbXBvcnQge2FkZERheXMsIGRpZmZEYXlzLCB0b0RhdGVUaW1lU3RyaW5nfSBmcm9tICcuL2RhdGUtdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRheUdyaWRUaW1lZEV2ZW50KCRlbCwgcm9vdFNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJGVsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY1RTVcdTRFRDhcdTkwNzhcdTYyOUVcbiAgICAgICAgICovXG4gICAgICAgIGRhdGVTZWxlY3Rvcjogc2VsZWN0b3IoJGVsLCByb290U2VsZWN0b3IsICcuZ2MtZGF5JywgJ2RhdGUnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZ1RpbWVkRXZlbnQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgb25FdmVudDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdmU6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25DbGljaygkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZmluZEV2ZW50S2V5QXRFbGVtZW50KCRldmVudC50YXJnZXQpXG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgLy8gXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU1ODM0XHU1NDA4XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBvbkRyYWdTdGFydCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gJGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50ID0gZWxcbiAgICAgICAgICAgICAgICAkZXZlbnQuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSdcbiAgICAgICAgICAgICAgICAkZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvcGxhaW4nLCBlbC5kYXRhc2V0LmtleSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNENcdTg5ODFcdTdEMjBcdTMwNkJcdTRFNTdcdTMwNjNcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RHJhZ0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25EcmFnT3ZlcigkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLmRhdGVTZWxlY3Rvci5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3Rvci51cGRhdGVTZWxlY3Rpb24oZGF0ZSwgZGF0ZSlcbiAgICAgICAgICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRURcdTMwQzNcdTMwRDdcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RHJhZ0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Ecm9wKCRldmVudCkge1xuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHU1MUU2XHU3NDA2XHUzMDkyXHU1QjlGXHU4ODRDXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5kYXRlU2VsZWN0b3IuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcbiAgICAgICAgICAgIGNvbnN0IGtleSA9ICRldmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpXG4gICAgICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRheXMgPSBkaWZmRGF5cyh0aGlzLmRyYWdnaW5nVGltZWRFdmVudC5kYXRhc2V0LnN0YXJ0LCBkYXRlKVxuICAgICAgICAgICAgICAgIGlmIChkYXlzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gdG9EYXRlVGltZVN0cmluZyhhZGREYXlzKHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50LmRhdGFzZXQuc3RhcnQsIGRheXMpKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSB0b0RhdGVUaW1lU3RyaW5nKGFkZERheXModGhpcy5kcmFnZ2luZ1RpbWVkRXZlbnQuZGF0YXNldC5lbmQsIGRheXMpKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nVGltZWRFdmVudCA9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA0Q1x1ODk4MVx1N0QyMFx1MzA0Qlx1MzA4OVx1NTkxNlx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBvbkRyYWdFbmQoJGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTg5RTNcdTk2NjRcbiAgICAgICAgICAgIHRoaXMuZGF0ZVNlbGVjdG9yLnVwZGF0ZVNlbGVjdGlvbihudWxsLCBudWxsKVxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNDNcdTMwNkJcdTYyM0JcdTMwNTlcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nVGltZWRFdmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nVGltZWRFdmVudCA9IG51bGxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDZFXHU4RkQxXHUzMDRGXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFEXHUzMEZDXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgICAgICovXG4gICAgICAgIGZpbmRFdmVudEtleUF0RWxlbWVudChlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGVsLmNvbnRhaW5zKGVsKSkge1xuICAgICAgICAgICAgICAgIGlmIChlbC5jbG9zZXN0KCcuZ2MtZGF5LWdyaWQsIC5nYy1kYXktZ3JpZC1wb3B1cCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsRXZlbnQgPSBlbC5jbG9zZXN0KCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbEV2ZW50LmRhdGFzZXQua2V5XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTcyQjZcdTYxNEJcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgICpcbiAgICAgICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICAgICAqL1xuICAgICAgICBhZGREcmFnZ2luZ0NsYXNzKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1RpbWVkRXZlbnQuY2xhc3NMaXN0LmFkZCgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH1cbn0iLCAiaW1wb3J0IHthZGREYXlzLCBkaWZmRGF5cywgdG9EYXRlU3RyaW5nLCB0b0RhdGVUaW1lU3RyaW5nLCBkaWZmSW5NaWxsaXNlY29uZHN9IGZyb20gXCIuL2RhdGUtdXRpbHMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVzaXplKCRlbCwgcm9vdFNlbGVjdG9yLCBldmVudFNlbGVjdG9yLCBzZWxlY3Rvcikge1xuICAgIHJldHVybiB7XG4gICAgICAgICRlbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICAgICAqL1xuICAgICAgICByb290U2VsZWN0b3IsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NEU4OFx1NUI5QVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAgICAgKi9cbiAgICAgICAgZXZlbnRTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXHUzMEZCXHU2NjQyXHU5NTkzXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAqL1xuICAgICAgICBzZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEQ4XHUzMEMzXHUzMEMwXHUzMEZDXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICAgICAqL1xuICAgICAgICBoZWFkQ3Vyc29yOiAnZ2MtY3Vyc29yLXctcmVzaXplJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM2XHUzMEZDXHUzMEVCXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICAgICAqL1xuICAgICAgICB0YWlsQ3Vyc29yOiAnZ2MtY3Vyc29yLWUtcmVzaXplJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZzogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZCXHUzMDAxXHU1MjREXHU1NkRFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDVGXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZ1ByZXZEYXRlOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcbiAgICAgICAgICovXG4gICAgICAgIGRyYWdnaW5nQ291bnQ6IDAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFxuICAgICAgICAgKi9cbiAgICAgICAgZ3JhYmJlZERhdGU6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgZ3JhYmJlZFN0YXJ0OiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBncmFiYmVkRW5kOiBmYWxzZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvbkV2ZW50OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgICAgICovXG4gICAgICAgIG9uTW92ZTogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU3NTFGXHU2MjEwXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvblByZXZpZXc6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZURvd24oJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuZmluZEV2ZW50QXRFbGVtZW50KCRldmVudC50YXJnZXQpXG4gICAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTU5MDlcdTVGNjJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRTdGFydCA9IHRoaXMuZ3JhYmJlZEVuZCA9IHRydWVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oaXRIZWFkKCRldmVudC50YXJnZXQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRFbmQgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oaXRUYWlsKCRldmVudC50YXJnZXQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRTdGFydCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFiYmVkRGF0ZSA9IHRoaXMuc2VsZWN0b3IuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcblxuICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBlbFxuXG4gICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHVGRjA4XHU4ODY4XHU3OTNBXHUzMDkyXHU2RDg4XHUzMDU5XHVGRjA5XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZyh0aGlzLmRyYWdnaW5nLmRhdGFzZXQua2V5LCB0cnVlKVxuXG4gICAgICAgICAgICAgICAgLy8gXHU3M0ZFXHU1NzI4XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1ByZXZEYXRlID0gbnVsbFxuXG4gICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3KHRoaXMuZ3JhYmJlZERhdGUpXG5cbiAgICAgICAgICAgICAgICAvLyBcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUN1cnNvcigpXG5cbiAgICAgICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nQ291bnQgPSAwXG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLnNlbGVjdG9yLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3KGRhdGUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdDb3VudCsrXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VVcCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5kcmFnZ2luZy5kYXRhc2V0LmtleVxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLnNlbGVjdG9yLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUgJiYgdGhpcy5ncmFiYmVkRGF0ZSAhPT0gZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldENoYW5nZWRQZXJpb2QoZGF0ZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZHJhZ2dpbmdDb3VudCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblByZXZpZXcodGhpcy5kcmFnZ2luZywgbnVsbCwgbnVsbClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldERyYWdnaW5nKGtleSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsXG4gICAgICAgICAgICAgICAgdGhpcy5ncmFiYmVkU3RhcnQgPSB0aGlzLmdyYWJiZWRFbmQgPSBudWxsXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAgICAgKi9cbiAgICAgICAgZmluZEV2ZW50QXRFbGVtZW50KGVsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3Qocm9vdFNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwuY2xvc2VzdChldmVudFNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgaGl0SGVhZChlbCkge1xuICAgICAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLWhlYWQnKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIGhpdFRhaWwoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy10YWlsJylcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICAgICAqL1xuICAgICAgICBzZXREcmFnZ2luZyhrZXksIGRyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuZXZlbnRTZWxlY3RvciArICdbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgICAgICovXG4gICAgICAgIGdldENoYW5nZWRQZXJpb2QoZGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZGlmZiA9IGRpZmZJbk1pbGxpc2Vjb25kcyh0aGlzLmdyYWJiZWREYXRlLCBkYXRlKVxuICAgICAgICAgICAgbGV0IHN0YXJ0ID0gdG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuZHJhZ2dpbmcuZGF0YXNldC5zdGFydCkgKyAodGhpcy5ncmFiYmVkU3RhcnQgPyBkaWZmIDogMCkpXG4gICAgICAgICAgICBsZXQgZW5kID0gdG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuZHJhZ2dpbmcuZGF0YXNldC5lbmQpICsgKHRoaXMuZ3JhYmJlZEVuZCA/IGRpZmYgOiAwKSlcbiAgICAgICAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKDAsIHRoaXMuZ3JhYmJlZERhdGUubGVuZ3RoKVxuICAgICAgICAgICAgZW5kID0gZW5kLnN1YnN0cmluZygwLCB0aGlzLmdyYWJiZWREYXRlLmxlbmd0aClcbiAgICAgICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyYWJiZWRTdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IGVuZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncmFiYmVkRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUN1cnNvcigpIHtcbiAgICAgICAgICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5yZW1vdmUodGhpcy5oZWFkQ3Vyc29yLCB0aGlzLnRhaWxDdXJzb3IpXG4gICAgICAgICAgICBpZiAodGhpcy5ncmFiYmVkU3RhcnQgJiYgdGhpcy5ncmFiYmVkRW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwuY2xhc3NMaXN0LmFkZCgnZ2MtY3Vyc29yLW1vdmUnKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdyYWJiZWRTdGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQodGhpcy5oZWFkQ3Vyc29yKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmdyYWJiZWRFbmQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKHRoaXMudGFpbEN1cnNvcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlUHJldmlldyhkYXRlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1ByZXZEYXRlICE9PSBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRDaGFuZ2VkUGVyaW9kKGRhdGUpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub25QcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25QcmV2aWV3KHRoaXMuZHJhZ2dpbmcsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdQcmV2RGF0ZSA9IGRhdGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9XG59IiwgImltcG9ydCBzZWxlY3RvciBmcm9tIFwiLi9zZWxlY3Rvci5qc1wiO1xuaW1wb3J0IHJlc2l6ZXIgZnJvbSBcIi4vcmVzaXplci5qc1wiO1xuaW1wb3J0IHthZGREYXlzLCBkaWZmRGF5cywgb3ZlcmxhcFBlcmlvZCwgdG9EYXRlU3RyaW5nfSBmcm9tIFwiLi9kYXRlLXV0aWxzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFsbERheUV2ZW50KCRlbCwgcm9vdFNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgJGVsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgICAgICovXG4gICAgICAgIHJvb3RTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHU5MDc4XHU2MjlFXG4gICAgICAgICAqL1xuICAgICAgICBkYXRlU2VsZWN0b3I6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1xuICAgICAgICAgKi9cbiAgICAgICAgcmVzaXplcjogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERCXHUzMEQwXHUzMEZDXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBob3ZlcjogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBvbkV2ZW50OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgICAgICovXG4gICAgICAgIG9uTW92ZTogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAqL1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5kYXRlU2VsZWN0b3IgPSBzZWxlY3Rvcih0aGlzLiRlbCwgdGhpcy5yb290U2VsZWN0b3IsICcuZ2MtZGF5JywgJ2RhdGUnKVxuICAgICAgICAgICAgdGhpcy5yZXNpemVyID0gcmVzaXplcih0aGlzLiRlbCwgdGhpcy5yb290U2VsZWN0b3IsICcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInLCB0aGlzLmRhdGVTZWxlY3RvcilcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5oZWFkQ3Vyc29yID0gJ2djLWN1cnNvci13LXJlc2l6ZSdcbiAgICAgICAgICAgIHRoaXMucmVzaXplci50YWlsQ3Vyc29yID0gJ2djLWN1cnNvci1lLXJlc2l6ZSdcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5vbkV2ZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlc2l6ZXIub25Nb3ZlID0gKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZXNpemVyLm9uUHJldmlldyA9IChlbCwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJldmlldygpXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVByZXZpZXcoZWwsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzaXplci5vbk1vdXNlRG93bigkZXZlbnQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVyLm9uTW91c2VNb3ZlKCRldmVudClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlVXAoJGV2ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXNpemVyLm9uTW91c2VVcCgkZXZlbnQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzBERVx1MzBBNlx1MzBCOVx1MzBEQlx1MzBEMFx1MzBGQ1x1NTFFNlx1NzQwNlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VPdmVyKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVzaXplci5kcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmZpbmRBbGxEYXlFdmVudEF0RWxlbWVudCgkZXZlbnQudGFyZ2V0LCB0cnVlKVxuICAgICAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGxcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHRoaXMuaG92ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5ob3ZlciwgZmFsc2UpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuaG92ZXIgPSBrZXksIHRydWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIHdpdGhvdXRQb3B1cCB7Ym9vbGVhbn0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NjY0XHU1OTE2XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICAgICAqL1xuICAgICAgICBmaW5kQWxsRGF5RXZlbnRBdEVsZW1lbnQoZWwsIHdpdGhvdXRQb3B1cCA9IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3Qocm9vdFNlbGVjdG9yICsgKHdpdGhvdXRQb3B1cCA/ICcnIDogJywgLmdjLWRheS1ncmlkLXBvcHVwJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0ga2V5IHtzdHJpbmd9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1xuICAgICAgICAgKiBAcGFyYW0gaG92ZXIge2Jvb2xlYW59IFx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0SG92ZXJBbGxEYXlFdmVudChrZXksIGhvdmVyKSB7XG4gICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIGV2ZW50U3RhcnQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZVByZXZpZXcoZWxFdmVudCwgZXZlbnRTdGFydCwgZXZlbnRFbmQpIHtcbiAgICAgICAgICAgIC8vIFx1NTQwNFx1OTAzMVx1MzA1NFx1MzA2OFx1MzA2Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgQXJyYXkuZnJvbSh0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtd2VlaywgLmdjLWFsbC1kYXktc2VjdGlvbicpKS5mb3JFYWNoKGVsV2VlayA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3dlZWtTdGFydCwgd2Vla0VuZF0gPSB0aGlzLmdldFdlZWtQZXJpb2QoZWxXZWVrKVxuICAgICAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgJiYgd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbcGVyaW9kU3RhcnQsIHBlcmlvZEVuZF0gPSBvdmVybGFwUGVyaW9kKGV2ZW50U3RhcnQsIGV2ZW50RW5kLCB3ZWVrU3RhcnQsIHdlZWtFbmQpXG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJpb2RTdGFydCAmJiBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsUHJldmlldyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5W2RhdGEtZGF0ZT1cIicgKyBwZXJpb2RTdGFydCArICdcIl0gLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod2Vla1N0YXJ0IDw9IHRoaXMucmVzaXplci5ncmFiYmVkRGF0ZSAmJiB0aGlzLnJlc2l6ZXIuZ3JhYmJlZERhdGUgPD0gd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1OTAzMVx1MzA2N1x1MzA2Rlx1MzAwMVx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEY0RFx1N0Y2RVx1MzA5Mlx1ODAwM1x1NjE2RVx1MzA1N1x1MzA2Nlx1N0E3QVx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3LCB0aGlzLmdldEluZGV4SW5QYXJlbnQoZWxFdmVudCkpXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGVsRXZlbnQuY2xvbmVOb2RlKHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlzID0gZGlmZkRheXMocGVyaW9kU3RhcnQsIHBlcmlvZEVuZCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkanVzdEFsbERheUV2ZW50Rm9yUHJldmlldyhlbCwgZGF5cywgcGVyaW9kU3RhcnQgPT09IGV2ZW50U3RhcnQsIHBlcmlvZEVuZCA9PT0gZXZlbnRFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsV2VlayB7SFRNTEVsZW1lbnR9IFx1OTAzMVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1OTAzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzBGQlx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0V2Vla1BlcmlvZChlbFdlZWspIHtcbiAgICAgICAgICAgIGNvbnN0IGVsRGF5cyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZGF5Om5vdCguZ2MtZGlzYWJsZWQpJylcbiAgICAgICAgICAgIGlmIChlbERheXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbZWxEYXlzWzBdLmRhdGFzZXQuZGF0ZSwgZWxEYXlzW2VsRGF5cy5sZW5ndGggLSAxXS5kYXRhc2V0LmRhdGVdXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBbbnVsbCwgbnVsbF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY1RTVcdTY1NzBcbiAgICAgICAgICogQHBhcmFtIGlzU3RhcnQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1OTU4Qlx1NTlDQlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKiBAcGFyYW0gaXNFbmQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1N0Q0Mlx1NEU4Nlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgYWRqdXN0QWxsRGF5RXZlbnRGb3JQcmV2aWV3KGVsLCBkYXlzLCBpc1N0YXJ0LCBpc0VuZCkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc3RhcnQnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZW5kJylcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDc7IGkrKykge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLScgKyBpICsgJ2RheXMnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtJyArIGRheXMgKyAnZGF5cycpXG4gICAgICAgICAgICBpZiAoaXNTdGFydCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXN0YXJ0JylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWVuZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDRDXHU1MTQ0XHU1RjFGXHUzMDZFXHU0RTJEXHUzMDY3XHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTMwQTRcdTMwRjNcdTMwQzdcdTMwQzNcdTMwQUZcdTMwQjlcbiAgICAgICAgICovXG4gICAgICAgIGdldEluZGV4SW5QYXJlbnQoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YoZWwpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1Rlx1NjU3MFx1MzA2MFx1MzA1MVx1N0E3QVx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFx1MzA1OVx1MzA4QlxuICAgICAgICAgKi9cbiAgICAgICAgYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3LCBjb3VudCkge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NTI0QVx1OTY2NFxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlUHJldmlldygpIHtcbiAgICAgICAgICAgIEFycmF5LmZyb20odGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsID0+IGVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsLmNsb25lTm9kZShmYWxzZSksIGVsKSlcbiAgICAgICAgfSxcbiAgICB9XG59IiwgImltcG9ydCBwb3B1cCBmcm9tICcuL21vZHVsZXMvZGF5LWdyaWQtcG9wdXAnXG5pbXBvcnQgc2VsZWN0b3IgZnJvbSAnLi9tb2R1bGVzL3NlbGVjdG9yJ1xuaW1wb3J0IHRpbWVkRXZlbnQgZnJvbSAnLi9tb2R1bGVzL2RheS1ncmlkLXRpbWVkLWV2ZW50J1xuaW1wb3J0IGFsbERheUV2ZW50IGZyb20gJy4vbW9kdWxlcy9hbGwtZGF5LWV2ZW50J1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkYXlHcmlkKGNvbXBvbmVudFBhcmFtZXRlcnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBwb3B1cDogcG9wdXAodGhpcy4kZWwsIGNvbXBvbmVudFBhcmFtZXRlcnMpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIGRhdGVTZWxlY3Rvcjogc2VsZWN0b3IodGhpcy4kZWwsICcuZ2MtZGF5LWdyaWQnLCAnLmdjLWRheScsICdkYXRlJyksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWRFdmVudDogdGltZWRFdmVudCh0aGlzLiRlbCwgJy5nYy1kYXktZ3JpZCcpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICovXG4gICAgICAgIGFsbERheUV2ZW50OiBhbGxEYXlFdmVudCh0aGlzLiRlbCwgJy5nYy1kYXktZ3JpZCcpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLnBvcHVwLnVwZGF0ZUxheW91dCgpXG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3Rvci5vblNlbGVjdCA9IChzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkRhdGUoc3RhcnQgKyAnIDAwOjAwOjAwJywgZW5kICsgJyAyMzo1OTo1OScpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgICAgLy90aGlzLnRpbWVkRXZlbnQuaW5pdCgpXG4gICAgICAgICAgICB0aGlzLnRpbWVkRXZlbnQub25FdmVudCA9IChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50Lm9uTW92ZSA9IChrZXksIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5pbml0KClcbiAgICAgICAgICAgIHRoaXMuYWxsRGF5RXZlbnQub25FdmVudCA9IChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5vbk1vdmUgPSAoa2V5LCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTMwQTZcdTMwQTNcdTMwRjNcdTMwQzlcdTMwQTZcdTMwNkVcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICAgIExpdmV3aXJlLm9uKCdyZWZyZXNoQ2FsZW5kYXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy5wb3B1cC51cGRhdGVMYXlvdXQodHJ1ZSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQTZcdTMwQTNcdTMwRjNcdTMwQzlcdTMwQTZcdTMwNkVcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25SZXNpemUoJGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnBvcHVwLnVwZGF0ZUxheW91dCgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtFdmVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbkNsaWNrKCRldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZWxEYXkgPSAkZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5nYy1kYXknKVxuICAgICAgICAgICAgaWYgKHRoaXMucG9wdXAuaGl0UmVtYWluaW5nKCRldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1cC5vcGVuUG9wdXAoZWxEYXkpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsRGF5ICYmIGVsRGF5LmNsYXNzTGlzdC5jb250YWlucygnZ2MtZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgIC8vIFx1NzEyMVx1NTJCOVx1MzA2QVx1NjVFNVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NTgzNFx1NTQwOFxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRpbWVkRXZlbnQub25DbGljaygkZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU1ODM0XHU1NDA4XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFx1MzA1RFx1MzA2RVx1NEVENlx1MzA2RVx1NTgzNFx1NTQwOFxuICAgICAgICAgICAgICAgIHRoaXMucG9wdXAuY2xvc2VQb3B1cCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA0Q1x1NjJCQ1x1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucG9wdXAuaGl0UmVtYWluaW5nKCRldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudGltZWRFdmVudC5maW5kRXZlbnRLZXlBdEVsZW1lbnQoJGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbGxEYXlFdmVudC5vbk1vdXNlRG93bigkZXZlbnQpKSB7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZVNlbGVjdG9yLm9uTW91c2VEb3duKCRldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hbGxEYXlFdmVudC5vbk1vdXNlTW92ZSgkZXZlbnQpKSB7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGF0ZVNlbGVjdG9yLm9uTW91c2VNb3ZlKCRldmVudCkpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU5NkUyXHUzMDU1XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZVVwKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWxsRGF5RXZlbnQub25Nb3VzZVVwKCRldmVudCkpIHtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5kYXRlU2VsZWN0b3Iub25Nb3VzZVVwKCRldmVudCkpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU4OTgxXHU3RDIwXHUzMDZCXHU0RTU3XHUzMDYzXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU92ZXIoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGF0ZVNlbGVjdG9yLnNlbGVjdGlvblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5vbk1vdXNlT3ZlcigkZXZlbnQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25EcmFnU3RhcnQoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lZEV2ZW50Lm9uRHJhZ1N0YXJ0KCRldmVudCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB0aGlzLnRpbWVkRXZlbnQuYWRkRHJhZ2dpbmdDbGFzcygpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNENcdTg5ODFcdTdEMjBcdTMwNkJcdTRFNTdcdTMwNjNcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudFxuICAgICAgICAgKi9cbiAgICAgICAgb25EcmFnT3ZlcigkZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMudGltZWRFdmVudC5vbkRyYWdPdmVyKCRldmVudClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbkRyb3AoJGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVkRXZlbnQub25Ecm9wKCRldmVudClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDRDXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHU1OTE2XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnRcbiAgICAgICAgICovXG4gICAgICAgIG9uRHJhZ0VuZCgkZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMudGltZWRFdmVudC5vbkRyYWdFbmQoJGV2ZW50KVxuICAgICAgICB9LFxuICAgIH1cbn0iXSwKICAibWFwcGluZ3MiOiAi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
