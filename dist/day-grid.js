// resources/js/day-grid.js
function dayGrid(componentParameters) {
  return {
    /**
     * キャッシュされた表示数
     */
    cachedVisibleCount: null,
    /**1
     * キャッシュされた日の日付表示の部分の高さ
     */
    cachedDayTopHeight: null,
    /**
     * キャッシュされた予定部分の高さ
     */
    cachedEventHeight: null,
    /**
     * ホバー中の終日予定の要素
     */
    hoverAllDayEventKey: null,
    /**
     * 選択開始日
     */
    selectionStart: null,
    /**
     * 選択終了日
     */
    selectionEnd: null,
    /**
     * ドラッグ中の時間指定の予定のDOM要素
     */
    draggingTimedEvent: null,
    /**
     * ドラッグ中の終日予定のDOM要素
     */
    draggingAllDayEvent: null,
    /**
     * 終日予定をドラッグ中に、前回ホバーした日付
     */
    draggingAllDayEventPrevDate: null,
    /**
     * 終日予定のドラッグ中の移動量
     */
    draggingAllDayEventCount: 0,
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
     * 1日のミリ秒数
     */
    millisecondsPerDay: 24 * 60 * 60 * 1e3,
    /**
     * カレンダーの初期化
     */
    init() {
      this.updateLayout();
      Livewire.on("refreshCalendar", () => {
        this.$nextTick(() => this.updateLayout(true));
      });
    },
    /**
     * ウィンドウのリサイズイベント
     * @param $event {Event} イベント
     */
    onResize($event) {
      this.updateLayout();
    },
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
     * クリックイベント
     * @param $event {Event} クリックイベント
     */
    onClick($event) {
      const elDay = $event.target.closest(".gc-day");
      if (this.hitRemaining($event.target)) {
        this.openPopup(elDay);
      } else if (elDay.classList.contains("gc-disabled")) {
      } else {
        const key = this.findEventKeyAtElement($event.target);
        if (key) {
          this.$wire.onEvent(key);
        }
        this.closePopup();
      }
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
    },
    /**
     * マウスが押された時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseDown($event) {
      if (this.hitRemaining($event.target)) {
      } else if (this.findTimedEventAtElement($event.target)) {
      } else if (this.updateAllDayEventStart($event)) {
      } else {
        this.updateSelectionStart($event);
      }
    },
    /**
     * マウスが移動した時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseMove($event) {
      if (this.updateAllDayEventMove($event)) {
      } else {
        this.updateSelectionMove($event);
      }
    },
    /**
     * マウスが離された時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseUp($event) {
      if (this.updateAllDayEventEnd($event)) {
      } else {
        this.updateSelectionEnd($event);
      }
    },
    /**
     * マウスが要素に乗った時のイベント
     * @param $event {MouseEvent} イベント
     */
    onMouseOver($event) {
      this.updateHoverAllDayEvent($event);
    },
    /**
     * 終日イベントのマウスホバー処理
     * @param $event {Event} イベント
     */
    updateHoverAllDayEvent($event) {
      if (this.draggingAllDayEvent || this.selectionStart) {
        return;
      }
      const el = this.findAllDayEventAtElement($event.target);
      const key = el ? el.dataset.key : null;
      if (key !== this.hoverAllDayEventKey) {
        this.setHoverAllDayEvent(this.hoverAllDayEventKey, false);
        this.setHoverAllDayEvent(this.hoverAllDayEventKey = key, true);
      }
    },
    /**
     * 時間指定の予定を取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    findTimedEventAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(".gc-day-grid")) {
          return el.closest(".gc-timed-event-container");
        }
      }
      return null;
    },
    /**
     * 終日予定を取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    findAllDayEventAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(".gc-day-grid")) {
          return el.closest(".gc-all-day-event-container");
        }
      }
      return null;
    },
    /**
     * 指定したDOM要素の近くの予定のキーを取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|string} 予定のDOM要素またはnull
     */
    findEventKeyAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(".gc-day-grid")) {
          const elEvent = el.closest(".gc-timed-event-container, .gc-all-day-event-container");
          if (elEvent) {
            return elEvent.dataset.key;
          }
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
     * カレンダーの日の日付を取得
     * @param el {HTMLElement} 要素
     * @returns {null|string} 日付
     */
    findDateAtElement(el) {
      if (this.$el.contains(el)) {
        if (el.closest(".gc-day-grid")) {
          const elDay = el.closest(".gc-day");
          if (elDay && !elDay.classList.contains("gc-disabled")) {
            return elDay.dataset.date;
          }
        }
      }
      return null;
    },
    /**
     * 指定された位置にある日付の要素を取得
     * @param x {number} X座標
     * @param y {number} Y座標
     * @returns {string} 日付の要素
     */
    findDateAtPoint(x, y) {
      const el = Array.from(this.$el.querySelectorAll(".gc-day-grid .gc-day")).filter((el2) => {
        const rect = el2.getBoundingClientRect();
        return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
      }).at(0);
      return el ? el.dataset.date : null;
    },
    /**
     * 日付の選択範囲を設定
     */
    updateSelection(begin, end) {
      if (begin > end) {
        [begin, end] = [end, begin];
      }
      this.$el.querySelectorAll(".gc-day-grid .gc-day").forEach((el) => {
        const date = el.dataset.date;
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
    updateSelectionStart($event) {
      const date = this.findDateAtElement($event.target);
      if (date) {
        this.selectionStart = this.selectionEnd = date;
      }
    },
    /**
     * 移動時の選択処理
     * @param $event {MouseEvent} イベント
     */
    updateSelectionMove($event) {
      const date = this.findDateAtPoint($event.x, $event.y);
      if (this.selectionStart) {
        this.selectionEnd = date;
        this.updateSelection(this.selectionStart, this.selectionEnd);
      }
    },
    /**
     * 選択を終了
     * @param $event {MouseEvent} イベント
     */
    updateSelectionEnd($event) {
      const date = this.findDateAtPoint($event.x, $event.y);
      if (this.selectionStart) {
        const [start, end] = [this.selectionStart, date].sort();
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59");
        this.selectionStart = this.selectionEnd = null;
        this.updateSelection(null, null);
      }
    },
    /**
     * ドラッグイベント
     * @param $event {DragEvent} イベント
     */
    onDragStart($event) {
      const el = $event.target.closest(".gc-timed-event-container");
      if (el) {
        this.draggingTimedEvent = el;
        $event.dataTransfer.effectAllowed = "move";
        $event.dataTransfer.setData("text/plain", el.dataset.key);
        this.$nextTick(() => {
          el.classList.add("gc-dragging");
        });
      }
    },
    /**
     * ドラッグ中の要素が要素に乗った時のイベント
     * @param $event
     */
    onDragOver($event) {
      const date = this.findDateAtPoint($event.x, $event.y);
      if (date) {
        this.updateSelection(date, date);
        $event.preventDefault();
      }
    },
    /**
     * ドロップイベント
     * @param $event {DragEvent} イベント
     */
    onDrop($event) {
      const date = this.findDateAtPoint($event.x, $event.y);
      const key = $event.dataTransfer.getData("text/plain");
      if (date) {
        const diffDays = this.diffDays(this.draggingTimedEvent.dataset.start, date);
        if (diffDays !== 0) {
          const start = this.toDateTimeString(this.addDays(this.draggingTimedEvent.dataset.start, diffDays));
          const end = this.toDateTimeString(this.addDays(this.draggingTimedEvent.dataset.end, diffDays));
          this.$wire.onMove(key, start, end);
          this.draggingTimedEvent = null;
        }
      }
    },
    /**
     * ドラッグ中の要素が要素から外れた時のイベント
     * @param $event
     */
    onDragEnd($event) {
      this.updateSelection(null, null);
      if (this.draggingTimedEvent) {
        this.draggingTimedEvent.classList.remove("gc-dragging");
        this.draggingTimedEvent = null;
      }
    },
    /**
     * ドラッグ中のクラスを設定する
     */
    setAllDayEventDragging(key, dragging) {
      this.$el.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]').forEach((el) => {
        if (dragging) {
          el.classList.add("gc-dragging");
        } else {
          el.classList.remove("gc-dragging");
        }
      });
    },
    /**
     * 終日予定の移動を開始
     * @param $event {MouseEvent} イベント
     * @returns {boolean} 移動を開始したかどうか
     */
    updateAllDayEventStart($event) {
      const el = this.findAllDayEventAtElement($event.target);
      if (el) {
        this.grabbedStart = this.grabbedEnd = true;
        if (this.hitHead($event.target)) {
          this.grabbedEnd = false;
        }
        if (this.hitTail($event.target)) {
          this.grabbedStart = false;
        }
        this.grabbedDate = this.findDateAtPoint($event.x, $event.y);
        this.draggingAllDayEvent = el;
        this.setAllDayEventDragging(this.draggingAllDayEvent.dataset.key, true);
        this.draggingAllDayEventPrevDate = null;
        this.updateAllDayEventPreview(this.grabbedDate);
        this.updateAllDayEventCursor();
        this.draggingAllDayEventCount = 0;
        return true;
      }
      return false;
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
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     */
    updateAllDayEventMove($event) {
      if (this.draggingAllDayEvent) {
        const date = this.findDateAtPoint($event.x, $event.y);
        if (date) {
          this.updateAllDayEventPreview(date);
        }
        this.draggingAllDayEventCount++;
        return true;
      }
      return false;
    },
    /**
     * 終日予定の移動を終了
     * @param $event {MouseEvent} イベント
     */
    updateAllDayEventEnd($event) {
      if (this.draggingAllDayEvent) {
        const key = this.draggingAllDayEvent.dataset.key;
        const date = this.findDateAtPoint($event.x, $event.y);
        if (date && this.grabbedDate !== date) {
          const [start, end] = this.getChangedAllDayEventPeriod(date);
          this.$wire.onMove(key, start, end);
        } else if (this.draggingAllDayEventCount < 2) {
          this.$wire.onEvent(key);
        } else {
          this.removeAllDayEventPreview();
          this.setAllDayEventDragging(key, false);
        }
        this.draggingAllDayEvent = null;
        this.grabbedStart = this.grabbedEnd = null;
        this.updateAllDayEventCursor();
        return true;
      }
      return false;
    },
    /**
     * ドラッグ中の終日予定のプレビューを更新する
     * @param date {string} マウスの位置の日付
     */
    updateAllDayEventPreview(date) {
      if (this.draggingAllDayEventPrevDate !== date) {
        const [start, end] = this.getChangedAllDayEventPeriod(date);
        this.removeAllDayEventPreview();
        this.createAllDayEventPreview(this.draggingAllDayEvent, start, end);
        this.draggingAllDayEventPrevDate = date;
      }
    },
    /**
     * 終日予定をドラッグ中のカーソルを更新する
     */
    updateAllDayEventCursor() {
      this.$el.classList.remove("gc-day-grid-cursor-w-resize", "gc-day-grid-cursor-e-resize");
      if (this.grabbedStart) {
        this.$el.classList.add("gc-day-grid-cursor-w-resize");
      }
      if (this.grabbedEnd) {
        this.$el.classList.add("gc-day-grid-cursor-e-resize");
      }
    },
    /**
     * 変更後の終日予定の期間を取得する
     * @param date {string} マウスの位置の日付
     */
    getChangedAllDayEventPeriod(date) {
      const diffDays = this.diffDays(this.grabbedDate, date);
      let start = this.toDateString(this.addDays(this.draggingAllDayEvent.dataset.start, this.grabbedStart ? diffDays : 0));
      let end = this.toDateString(this.addDays(this.draggingAllDayEvent.dataset.end, this.grabbedEnd ? diffDays : 0));
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
     * ドラッグ中の終日予定のプレビューを表示
     * @param elEvent {HTMLElement} 予定のDOM要素
     * @param eventStart {string} 予定の開始日
     * @param eventEnd {string} 予定の終了日
     */
    createAllDayEventPreview(elEvent, eventStart, eventEnd) {
      Array.from(this.$el.querySelectorAll(".gc-week")).forEach((elWeek) => {
        const [weekStart, weekEnd] = this.getWeekPeriod(elWeek);
        if (weekStart && weekEnd) {
          const [periodStart, periodEnd] = this.overlapPeriod(eventStart, eventEnd, weekStart, weekEnd);
          if (periodStart && periodEnd) {
            const elPreview = elWeek.querySelector('.gc-day[data-date="' + periodStart + '"] .gc-all-day-event-preview');
            if (weekStart <= this.grabbedDate && this.grabbedDate <= weekEnd) {
              this.addEmptyAllDayEvents(elPreview, this.getIndexInParent(elEvent));
            }
            const el = elEvent.cloneNode(true);
            const days = this.diffDays(periodStart, periodEnd) + 1;
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
     * 期間の重なりを求める
     * @param start1 {string} 期間1の開始日
     * @param end1 {string} 期間1の終了日
     * @param start2 {string} 期間2の開始日
     * @param end2 {string} 期間2の終了日
     * @returns {Array} 重なっている期間
     */
    overlapPeriod(start1, end1, start2, end2) {
      return [start1 <= end2 && start2 <= end1 ? start1 < start2 ? start2 : start1 : null, start1 <= end2 && start2 <= end1 ? end1 < end2 ? end1 : end2 : null];
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
     * ミリ秒を日付文字列に変換する
     * @param d {number} ミリ秒
     * @returns {string} 日付文字列
     */
    toDateString(d) {
      return new Date(d).toLocaleDateString("sv-SE");
    },
    /**
     * ミリ秒を日時文字列に変換する
     * @param d {number} ミリ秒
     * @returns {string} 日付文字列
     */
    toDateTimeString(d) {
      return this.toDateString(d) + " " + new Date(d).toLocaleTimeString("en-GB");
    },
    /**
     * 日付に日数を加算
     * @param date {string} 日付
     * @param days {number} 日数
     * @returns {number} 加算後の日付(ミリ秒)
     */
    addDays(date, days) {
      return Date.parse(date) + days * this.millisecondsPerDay;
    },
    /**
     * 日付と日付の差の日数を求める
     * @param date1 {string} 日付1
     * @param date2 {string} 日付2
     * @returns {number} 日数
     */
    diffDays(date1, date2) {
      let d1 = new Date(date1);
      let d2 = new Date(date2);
      d1.setHours(0, 0, 0, 0);
      d2.setHours(0, 0, 0, 0);
      return Math.floor((d2.getTime() - d1.getTime()) / this.millisecondsPerDay);
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
    removeAllDayEventPreview() {
      Array.from(this.$el.querySelectorAll(".gc-all-day-event-preview")).forEach((el) => el.parentNode.replaceChild(el.cloneNode(false), el));
    }
  };
}
export {
  dayGrid as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL2RheS1ncmlkLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkYXlHcmlkKGNvbXBvbmVudFBhcmFtZXRlcnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFEXHUzMEUzXHUzMEMzXHUzMEI3XHUzMEU1XHUzMDU1XHUzMDhDXHUzMDVGXHU4ODY4XHU3OTNBXHU2NTcwXG4gICAgICAgICAqL1xuICAgICAgICBjYWNoZWRWaXNpYmxlQ291bnQ6IG51bGwsXG5cbiAgICAgICAgLyoqMVxuICAgICAgICAgKiBcdTMwQURcdTMwRTNcdTMwQzNcdTMwQjdcdTMwRTVcdTMwNTVcdTMwOENcdTMwNUZcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgICAgICovXG4gICAgICAgIGNhY2hlZERheVRvcEhlaWdodDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFEXHUzMEUzXHUzMEMzXHUzMEI3XHUzMEU1XHUzMDU1XHUzMDhDXHUzMDVGXHU0RTg4XHU1QjlBXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBjYWNoZWRFdmVudEhlaWdodDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERCXHUzMEQwXHUzMEZDXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBob3ZlckFsbERheUV2ZW50S2V5OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIHNlbGVjdGlvblN0YXJ0OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIHNlbGVjdGlvbkVuZDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZ1RpbWVkRXZlbnQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgZHJhZ2dpbmdBbGxEYXlFdmVudDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZCXHUzMDAxXHU1MjREXHU1NkRFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDVGXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZ0FsbERheUV2ZW50UHJldkRhdGU6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NzlGQlx1NTJENVx1OTFDRlxuICAgICAgICAgKi9cbiAgICAgICAgZHJhZ2dpbmdBbGxEYXlFdmVudENvdW50OiAwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcbiAgICAgICAgICovXG4gICAgICAgIGdyYWJiZWREYXRlOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIGdyYWJiZWRTdGFydDogZmFsc2UsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgZ3JhYmJlZEVuZDogZmFsc2UsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIDFcdTY1RTVcdTMwNkVcdTMwREZcdTMwRUFcdTc5RDJcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIG1pbGxpc2Vjb25kc1BlckRheTogKDI0ICogNjAgKiA2MCAqIDEwMDApLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxheW91dCgpXG4gICAgICAgICAgICBMaXZld2lyZS5vbigncmVmcmVzaENhbGVuZGFyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHRoaXMudXBkYXRlTGF5b3V0KHRydWUpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEE2XHUzMEEzXHUzMEYzXHUzMEM5XHUzMEE2XHUzMDZFXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEJBXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIG9uUmVzaXplKCRldmVudCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVMYXlvdXQoKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwOTJcdTUxOERcdThBMDhcdTdCOTdcbiAgICAgICAgICogQHBhcmFtIHtib29sZWFufSBmb3JjZSBcdTVGMzdcdTUyMzZcdTc2ODRcdTMwNkJcdTUxOERcdThBMDhcdTdCOTdcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUxheW91dChmb3JjZSA9IGZhbHNlKSB7XG4gICAgICAgICAgICAvLyBcdTg4NjhcdTc5M0FcdTY1NzBcdTMwNENcdTU5MDlcdTMwOEZcdTMwNjNcdTMwNjZcdTMwNDRcdTMwNkFcdTMwNDRcdTU4MzRcdTU0MDhcdTMwNkZcdTRGNTVcdTMwODJcdTMwNTdcdTMwNkFcdTMwNDRcbiAgICAgICAgICAgIGNvbnN0IHZpc2libGVDb3VudCA9IHRoaXMuZ2V0VmlzaWJsZUNvdW50KClcbiAgICAgICAgICAgIGlmICh0aGlzLmNhY2hlZFZpc2libGVDb3VudCAhPT0gdmlzaWJsZUNvdW50IHx8IGZvcmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWNoZWRWaXNpYmxlQ291bnQgPSB2aXNpYmxlQ291bnRcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtd2VlayAuZ2MtZGF5JykuZm9yRWFjaChlbERheSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGF5KGVsRGF5LCB2aXNpYmxlQ291bnQpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RGF5SGVpZ2h0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYy13ZWVrIC5nYy1kYXknKS5vZmZzZXRIZWlnaHRcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU1NDA0XHU2NUU1XHUzMDZFXHU2NUU1XHU0RUQ4XHU4ODY4XHU3OTNBXHUzMDZFXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NEVEOFx1ODg2OFx1NzkzQVx1MzA2RVx1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RGF5VG9wSGVpZ2h0KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FjaGVkRGF5VG9wSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkRGF5VG9wSGVpZ2h0XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZERheVRvcEhlaWdodCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktdG9wJykub2Zmc2V0SGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NTQwNFx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgICAgICovXG4gICAgICAgIGdldERheUJvZHlIZWlnaHQoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXlIZWlnaHQoKSAtIHRoaXMuZ2V0RGF5VG9wSGVpZ2h0KClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU0RTg4XHU1QjlBXHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RXZlbnRIZWlnaHQoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jYWNoZWRFdmVudEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZEV2ZW50SGVpZ2h0XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZEV2ZW50SGVpZ2h0ID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLXRpbWVkLWV2ZW50cyA+IC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lciwgLmdjLXRpbWVkLWV2ZW50cyA+IC5nYy10aW1lZC1ldmVudC1jb250YWluZXInKS5vZmZzZXRIZWlnaHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0VmlzaWJsZUNvdW50KCkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXREYXlCb2R5SGVpZ2h0KCkgLyB0aGlzLmdldEV2ZW50SGVpZ2h0KCkpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTRFODhcdTVCOUFcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIGdldEV2ZW50Q291bnQoZWxEYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnRzID4gLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyLCAuZ2MtdGltZWQtZXZlbnRzID4gLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lcicpLmxlbmd0aFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBoZWlnaHQge251bWJlcn0gXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBzZXRUaW1lZEV2ZW50c0hlaWdodChlbERheSwgaGVpZ2h0KSB7XG4gICAgICAgICAgICBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJykuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTg4NjhcdTc5M0FcdTMwRkJcdTk3NUVcdTg4NjhcdTc5M0FcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEBwYXJhbSB2aXNpYmxlRXZlbnRzIHtudW1iZXJ9IFx1ODg2OFx1NzkzQVx1NTNFRlx1ODBGRFx1MzA2QVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWxsRGF5RXZlbnRzVmlzaWJpbGl0eShlbERheSwgdmlzaWJsZUV2ZW50cykge1xuICAgICAgICAgICAgZWxEYXkucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpLmZvckVhY2goKGVsRXZlbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IDw9IHZpc2libGVFdmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxFdmVudC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsRXZlbnQuY2xhc3NMaXN0LmFkZCgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEBwYXJhbSByZW1haW5pbmdDb3VudCB7bnVtYmVyfSBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIHNldFJlbWFpbmluZ0NvdW50KGVsRGF5LCByZW1haW5pbmdDb3VudCkge1xuICAgICAgICAgICAgY29uc3QgZWxSZW1haW5pbmcgPSBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtcmVtYWluaW5nLWNvbnRhaW5lcicpXG4gICAgICAgICAgICBpZiAocmVtYWluaW5nQ291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgZWxSZW1haW5pbmcuY2hpbGRyZW5bMF0uaW5uZXJUZXh0ID0gY29tcG9uZW50UGFyYW1ldGVycy5yZW1haW5pbmcucmVwbGFjZSgnOmNvdW50JywgcmVtYWluaW5nQ291bnQpXG4gICAgICAgICAgICAgICAgZWxSZW1haW5pbmcuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWxSZW1haW5pbmcuY2xhc3NMaXN0LmFkZCgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU4ODY4XHU3OTNBXHUzMDU5XHUzMDhCXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHU2NkY0XHU2NUIwXG4gICAgICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0gdmlzaWJsZUNvdW50IHtudW1iZXJ9IFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlRGF5KGVsRGF5LCB2aXNpYmxlQ291bnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50Q291bnQgPSB0aGlzLmdldEV2ZW50Q291bnQoZWxEYXkpXG4gICAgICAgICAgICBjb25zdCBsaW1pdENvdW50ID0gZXZlbnRDb3VudCA8IHZpc2libGVDb3VudCA/IGV2ZW50Q291bnQgOiB2aXNpYmxlQ291bnQgLSAxXG4gICAgICAgICAgICBjb25zdCByZW1haW5pbmdDb3VudCA9IGV2ZW50Q291bnQgLSBsaW1pdENvdW50XG4gICAgICAgICAgICB0aGlzLnNldFRpbWVkRXZlbnRzSGVpZ2h0KGVsRGF5LCB0aGlzLmdldEV2ZW50SGVpZ2h0KCkgKiBsaW1pdENvdW50KVxuICAgICAgICAgICAgdGhpcy5zZXRBbGxEYXlFdmVudHNWaXNpYmlsaXR5KGVsRGF5LCBsaW1pdENvdW50IC0gKHJlbWFpbmluZ0NvdW50ID8gMSA6IDApKVxuICAgICAgICAgICAgdGhpcy5zZXRSZW1haW5pbmdDb3VudChlbERheSwgcmVtYWluaW5nQ291bnQpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtFdmVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbkNsaWNrKCRldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZWxEYXkgPSAkZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJy5nYy1kYXknKVxuICAgICAgICAgICAgaWYgKHRoaXMuaGl0UmVtYWluaW5nKCRldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuUG9wdXAoZWxEYXkpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsRGF5LmNsYXNzTGlzdC5jb250YWlucygnZ2MtZGlzYWJsZWQnKSkge1xuICAgICAgICAgICAgICAgIC8vIFx1NzEyMVx1NTJCOVx1MzA2QVx1NjVFNVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NTgzNFx1NTQwOFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLmZpbmRFdmVudEtleUF0RWxlbWVudCgkZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU1ODM0XHU1NDA4XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VQb3B1cCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgaGl0UmVtYWluaW5nKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwuY2xvc2VzdCgnLmdjLXJlbWFpbmluZy1jb250YWluZXInKSAhPT0gbnVsbCAmJiB0aGlzLiRlbC5jb250YWlucyhlbClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NThCXHUzMDRGXG4gICAgICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgb3BlblBvcHVwKGVsRGF5KSB7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkUG9wdXAoZWxEYXkpXG4gICAgICAgICAgICB0aGlzLmxheW91dFBvcHVwKGVsRGF5KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk1ODlcdTMwNThcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIGNsb3NlUG9wdXAoKSB7XG4gICAgICAgICAgICBjb25zdCBlbFBvcHVwID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLWRheS1ncmlkLXBvcHVwJylcbiAgICAgICAgICAgIGVsUG9wdXAuY2xhc3NMaXN0LmFkZCgnZ2MtaGlkZGVuJylcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU2OUNCXHU3QkM5XG4gICAgICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgYnVpbGRQb3B1cChlbERheSkge1xuICAgICAgICAgICAgLy8gRE9NXHUzMDkyXHU2OUNCXHU3QkM5XG4gICAgICAgICAgICBjb25zdCBlbFBvcHVwID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLWRheS1ncmlkLXBvcHVwJylcbiAgICAgICAgICAgIGNvbnN0IGVsRGF5Qm9keSA9IGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktYm9keScpLmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgY29uc3QgZWxEYXlCb2R5T3JpZyA9IGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLWRheS1ib2R5JylcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZUFsbERheUV2ZW50cyhlbERheUJvZHksIHRoaXMuZ2V0QWxsRGF5RXZlbnRLZXlzKGVsRGF5Qm9keSkpXG4gICAgICAgICAgICBlbERheUJvZHlPcmlnLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsRGF5Qm9keSwgZWxEYXlCb2R5T3JpZylcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0UG9wdXAoZWxQb3B1cClcblxuICAgICAgICAgICAgLy8gXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAgICBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXRlJykuaW5uZXJUZXh0ID0gZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLWRhdGUnKS5pbm5lclRleHRcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFa2V5XHUzMDkyXHU1MTY4XHUzMDY2XHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0QWxsRGF5RXZlbnRLZXlzKGVsRGF5KSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleV0nKSlcbiAgICAgICAgICAgICAgICAubWFwKGVsID0+IGVsLmRhdGFzZXQua2V5KS5maWx0ZXIoa2V5ID0+IGtleSAhPT0gJycpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCOVx1MzBEQVx1MzBGQ1x1MzBCNVx1MzBGQ1x1MzA5Mlx1NTE2OFx1MzA2Nlx1NTI0QVx1OTY2NFxuICAgICAgICAgKiBAcGFyYW0gZWxEYXlCb2R5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU2NzJDXHU0RjUzXHU5MEU4XHU1MjA2XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEBwYXJhbSBrZXlzIHtBcnJheX0gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFa2V5XG4gICAgICAgICAqL1xuICAgICAgICByZXBsYWNlQWxsRGF5RXZlbnRzKGVsRGF5Qm9keSwga2V5cykge1xuICAgICAgICAgICAgLy8gXHU2NUUyXHUzMDZCXHU1MTY1XHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1MjRBXHU5NjY0XHUzMDU5XHUzMDhCXG4gICAgICAgICAgICBBcnJheS5mcm9tKGVsRGF5Qm9keS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKSkuZm9yRWFjaChlbCA9PiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKSlcblxuICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXG4gICAgICAgICAgICBjb25zdCBlbEFsbERheUV2ZW50cyA9IGVsRGF5Qm9keS5xdWVyeVNlbGVjdG9yKCcuZ2MtYWxsLWRheS1ldmVudHMnKVxuICAgICAgICAgICAga2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuZ2MtYWxsLWRheS1ldmVudHMgLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcsICdnYy1lbmQnKVxuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgZWxBbGxEYXlFdmVudHMuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTUxODVcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTg4NjhcdTc5M0FcdTMwOTJcdTVGQUVcdThBQkZcdTdCQzBcdTMwNTlcdTMwOEJcbiAgICAgICAgICogQHBhcmFtIGVsUG9wdXAge0hUTUxFbGVtZW50fSBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGFkanVzdFBvcHVwKGVsUG9wdXApIHtcbiAgICAgICAgICAgIC8vIFx1ODg2OFx1NzkzQVx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgZWxQb3B1cC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKVxuXG4gICAgICAgICAgICAvLyBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkVcdTU5MjdcdTMwNERcdTMwNTVcdTMwOTJcdTgxRUFcdTUyRDVcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgICAgIGVsUG9wdXAuc3R5bGUud2lkdGggPSAnYXV0bydcbiAgICAgICAgICAgIGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nXG5cbiAgICAgICAgICAgIC8vIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1ODFFQVx1NTJENVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgY29uc3QgZWxUaW1lZEV2ZW50cyA9IGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLXRpbWVkLWV2ZW50cycpXG4gICAgICAgICAgICBlbFRpbWVkRXZlbnRzLnN0eWxlLmhlaWdodCA9ICdhdXRvJ1xuXG4gICAgICAgICAgICAvLyBcdTRFRDZcdTI2QUFcdUZFMEVcdTRFRjZcdTMwOTJcdTk3NUVcdTg4NjhcdTc5M0FcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgICAgIGNvbnN0IGVsUmVtYWluaW5nID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtcmVtYWluaW5nLWNvbnRhaW5lcicpXG4gICAgICAgICAgICBlbFJlbWFpbmluZy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsUmVtYWluaW5nKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwOTJcdTY2RjRcdTY1QjBcbiAgICAgICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBsYXlvdXRQb3B1cChlbERheSkge1xuICAgICAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktZ3JpZC1wb3B1cCcpXG4gICAgICAgICAgICBjb25zdCByZWN0UG9wdXAgPSBlbFBvcHVwLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICBjb25zdCByZWN0RGF5ID0gZWxEYXkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGxldCB4ID0gcmVjdERheS5sZWZ0IC0gMSArIHdpbmRvdy5zY3JvbGxYXG4gICAgICAgICAgICBsZXQgeSA9IHJlY3REYXkudG9wIC0gMSArIHdpbmRvdy5zY3JvbGxZXG4gICAgICAgICAgICBsZXQgdyA9IE1hdGgubWF4KHJlY3REYXkud2lkdGggKiAxLjEsIHJlY3RQb3B1cC53aWR0aClcbiAgICAgICAgICAgIGxldCBoID0gTWF0aC5tYXgocmVjdERheS5oZWlnaHQsIHJlY3RQb3B1cC5oZWlnaHQpXG4gICAgICAgICAgICBpZiAoeCArIHcgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xuICAgICAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5ICsgaCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBoXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbFBvcHVwLnN0eWxlLmxlZnQgPSB4ICsgJ3B4J1xuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS50b3AgPSB5ICsgJ3B4J1xuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9IHcgKyAncHgnXG4gICAgICAgICAgICBlbFBvcHVwLnN0eWxlLmhlaWdodCA9IGggKyAncHgnXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA0Q1x1NjJCQ1x1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaGl0UmVtYWluaW5nKCRldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU1ODM0XHU1NDA4XHUzMDZGXHU0RjU1XHUzMDgyXHUzMDU3XHUzMDZBXHUzMDQ0XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmluZFRpbWVkRXZlbnRBdEVsZW1lbnQoJGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNjdcdTMwMDFcdTMwREVcdTMwQTZcdTMwQjlcdTMwQzBcdTMwQTZcdTMwRjNcdTMwNTdcdTMwNUZcdTU4MzRcdTU0MDhcdTMwNkZcdTRGNTVcdTMwODJcdTMwNTdcdTMwNkFcdTMwNDRcdTMwMDJvbkRyYWdTdGFydFx1MzA2N1x1NTFFNlx1NzQwNlx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnVwZGF0ZUFsbERheUV2ZW50U3RhcnQoJGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvblN0YXJ0KCRldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy51cGRhdGVBbGxEYXlFdmVudE1vdmUoJGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbk1vdmUoJGV2ZW50KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNENcdTk2RTJcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlVXAoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy51cGRhdGVBbGxEYXlFdmVudEVuZCgkZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uRW5kKCRldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU4OTgxXHU3RDIwXHUzMDZCXHU0RTU3XHUzMDYzXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU92ZXIoJGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUhvdmVyQWxsRGF5RXZlbnQoJGV2ZW50KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwREVcdTMwQTZcdTMwQjlcdTMwREJcdTMwRDBcdTMwRkNcdTUxRTZcdTc0MDZcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlSG92ZXJBbGxEYXlFdmVudCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQgfHwgdGhpcy5zZWxlY3Rpb25TdGFydCkge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmZpbmRBbGxEYXlFdmVudEF0RWxlbWVudCgkZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGxcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHRoaXMuaG92ZXJBbGxEYXlFdmVudEtleSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLmhvdmVyQWxsRGF5RXZlbnRLZXksIGZhbHNlKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLmhvdmVyQWxsRGF5RXZlbnRLZXkgPSBrZXksIHRydWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge251bGx8SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgICAgICovXG4gICAgICAgIGZpbmRUaW1lZEV2ZW50QXRFbGVtZW50KGVsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3QoJy5nYy1kYXktZ3JpZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICAgICAqL1xuICAgICAgICBmaW5kQWxsRGF5RXZlbnRBdEVsZW1lbnQoZWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLiRlbC5jb250YWlucyhlbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWwuY2xvc2VzdCgnLmdjLWRheS1ncmlkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsLmNsb3Nlc3QoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDZFXHU4RkQxXHUzMDRGXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFEXHUzMEZDXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgICAgICovXG4gICAgICAgIGZpbmRFdmVudEtleUF0RWxlbWVudChlbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuJGVsLmNvbnRhaW5zKGVsKSkge1xuICAgICAgICAgICAgICAgIGlmIChlbC5jbG9zZXN0KCcuZ2MtZGF5LWdyaWQnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbEV2ZW50ID0gZWwuY2xvc2VzdCgnLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lciwgLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbEV2ZW50LmRhdGFzZXQua2V5XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwREJcdTMwRDBcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgICAgICogQHBhcmFtIGtleSB7c3RyaW5nfSBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcbiAgICAgICAgICogQHBhcmFtIGhvdmVyIHtib29sZWFufSBcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIHNldEhvdmVyQWxsRGF5RXZlbnQoa2V5LCBob3Zlcikge1xuICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob3Zlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtaG92ZXInKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaG92ZXInKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7bnVsbHxzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICAgICAgICAgKi9cbiAgICAgICAgZmluZERhdGVBdEVsZW1lbnQoZWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLiRlbC5jb250YWlucyhlbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWwuY2xvc2VzdCgnLmdjLWRheS1ncmlkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxEYXkgPSBlbC5jbG9zZXN0KCcuZ2MtZGF5JylcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsRGF5ICYmICFlbERheS5jbGFzc0xpc3QuY29udGFpbnMoJ2djLWRpc2FibGVkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBlbERheS5kYXRhc2V0LmRhdGVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1NEY0RFx1N0Y2RVx1MzA2Qlx1MzA0Mlx1MzA4Qlx1NjVFNVx1NEVEOFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0geCB7bnVtYmVyfSBYXHU1RUE3XHU2QTE5XG4gICAgICAgICAqIEBwYXJhbSB5IHtudW1iZXJ9IFlcdTVFQTdcdTZBMTlcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBmaW5kRGF0ZUF0UG9pbnQoeCwgeSkge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1kYXktZ3JpZCAuZ2MtZGF5JykpLmZpbHRlcihlbCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY3QubGVmdCA8PSB4ICYmIHggPD0gcmVjdC5yaWdodCAmJiByZWN0LnRvcCA8PSB5ICYmIHkgPD0gcmVjdC5ib3R0b21cbiAgICAgICAgICAgIH0pLmF0KDApXG4gICAgICAgICAgICByZXR1cm4gZWwgPyBlbC5kYXRhc2V0LmRhdGUgOiBudWxsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlU2VsZWN0aW9uKGJlZ2luLCBlbmQpIHtcbiAgICAgICAgICAgIGlmIChiZWdpbiA+IGVuZCkge1xuICAgICAgICAgICAgICAgIFtiZWdpbiwgZW5kXSA9IFtlbmQsIGJlZ2luXVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWRheS1ncmlkIC5nYy1kYXknKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gZWwuZGF0YXNldC5kYXRlXG4gICAgICAgICAgICAgICAgaWYgKGJlZ2luICYmIGVuZCAmJiBiZWdpbiA8PSBkYXRlICYmIGRhdGUgPD0gZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1zZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU5MDc4XHU2MjlFXHUzMDkyXHU5NThCXHU1OUNCXG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZVNlbGVjdGlvblN0YXJ0KCRldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdEVsZW1lbnQoJGV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25TdGFydCA9IHRoaXMuc2VsZWN0aW9uRW5kID0gZGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTc5RkJcdTUyRDVcdTY2NDJcdTMwNkVcdTkwNzhcdTYyOUVcdTUxRTZcdTc0MDZcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTZWxlY3Rpb25Nb3ZlKCRldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGlvblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25FbmQgPSBkYXRlXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3Rpb24odGhpcy5zZWxlY3Rpb25TdGFydCwgdGhpcy5zZWxlY3Rpb25FbmQpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZVNlbGVjdGlvbkVuZCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb25TdGFydCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IFt0aGlzLnNlbGVjdGlvblN0YXJ0LCBkYXRlXS5zb3J0KClcbiAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRGF0ZShzdGFydCArICcgMDA6MDA6MDAnLCBlbmQgKyAnIDIzOjU5OjU5JylcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvblN0YXJ0ID0gdGhpcy5zZWxlY3Rpb25FbmQgPSBudWxsXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3Rpb24obnVsbCwgbnVsbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbkRyYWdTdGFydCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gJGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50ID0gZWxcbiAgICAgICAgICAgICAgICAkZXZlbnQuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSdcbiAgICAgICAgICAgICAgICAkZXZlbnQuZGF0YVRyYW5zZmVyLnNldERhdGEoJ3RleHQvcGxhaW4nLCBlbC5kYXRhc2V0LmtleSlcbiAgICAgICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNENcdTg5ODFcdTdEMjBcdTMwNkJcdTRFNTdcdTMwNjNcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudFxuICAgICAgICAgKi9cbiAgICAgICAgb25EcmFnT3ZlcigkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uKGRhdGUsIGRhdGUpXG4gICAgICAgICAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbkRyb3AoJGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRURcdTMwQzNcdTMwRDdcdTUxRTZcdTc0MDZcdTMwOTJcdTVCOUZcdTg4NENcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICBjb25zdCBrZXkgPSAkZXZlbnQuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKVxuICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkaWZmRGF5cyA9IHRoaXMuZGlmZkRheXModGhpcy5kcmFnZ2luZ1RpbWVkRXZlbnQuZGF0YXNldC5zdGFydCwgZGF0ZSlcbiAgICAgICAgICAgICAgICBpZiAoZGlmZkRheXMgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLnRvRGF0ZVRpbWVTdHJpbmcodGhpcy5hZGREYXlzKHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50LmRhdGFzZXQuc3RhcnQsIGRpZmZEYXlzKSlcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5kID0gdGhpcy50b0RhdGVUaW1lU3RyaW5nKHRoaXMuYWRkRGF5cyh0aGlzLmRyYWdnaW5nVGltZWRFdmVudC5kYXRhc2V0LmVuZCwgZGlmZkRheXMpKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50ID0gbnVsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDRDXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHU1OTE2XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnRcbiAgICAgICAgICovXG4gICAgICAgIG9uRHJhZ0VuZCgkZXZlbnQpIHtcbiAgICAgICAgICAgIC8vIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1ODlFM1x1OTY2NFxuICAgICAgICAgICAgdGhpcy51cGRhdGVTZWxlY3Rpb24obnVsbCwgbnVsbClcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTQzXHUzMDZCXHU2MjNCXHUzMDU5XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ1RpbWVkRXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nVGltZWRFdmVudC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1RpbWVkRXZlbnQgPSBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAgICAgKi9cbiAgICAgICAgc2V0QWxsRGF5RXZlbnREcmFnZ2luZyhrZXksIGRyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlQWxsRGF5RXZlbnRTdGFydCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy5maW5kQWxsRGF5RXZlbnRBdEVsZW1lbnQoJGV2ZW50LnRhcmdldClcbiAgICAgICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTkwOVx1NUY2Mlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgICAgIHRoaXMuZ3JhYmJlZFN0YXJ0ID0gdGhpcy5ncmFiYmVkRW5kID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhpdEhlYWQoJGV2ZW50LnRhcmdldCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhYmJlZEVuZCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhpdFRhaWwoJGV2ZW50LnRhcmdldCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU5NThCXHU1OUNCXHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JhYmJlZFN0YXJ0ID0gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcbiAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWREYXRlID0gdGhpcy5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuXG4gICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ0FsbERheUV2ZW50ID0gZWxcblxuICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1RkYwOFx1ODg2OFx1NzkzQVx1MzA5Mlx1NkQ4OFx1MzA1OVx1RkYwOVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0QWxsRGF5RXZlbnREcmFnZ2luZyh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQuZGF0YXNldC5rZXksIHRydWUpXG5cbiAgICAgICAgICAgICAgICAvLyBcdTczRkVcdTU3MjhcdTMwNkVcdTY1RTVcdTRFRDhcdTMwOTJcdThBMThcdTkzMzJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnRQcmV2RGF0ZSA9IG51bGxcblxuICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1ODg2OFx1NzkzQVxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQWxsRGF5RXZlbnRQcmV2aWV3KHRoaXMuZ3JhYmJlZERhdGUpXG5cbiAgICAgICAgICAgICAgICAvLyBcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUFsbERheUV2ZW50Q3Vyc29yKClcblxuICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1OTFDRlx1MzA5Mlx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudENvdW50ID0gMFxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIGhpdEhlYWQoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy1oZWFkJylcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NTIyNFx1NUI5QVx1MzA1OVx1MzA4Qlx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBoaXRUYWlsKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gISFlbC5jbG9zZXN0KCcuZ2MtdGFpbCcpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFsbERheUV2ZW50TW92ZSgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuICAgICAgICAgICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQWxsRGF5RXZlbnRQcmV2aWV3KGRhdGUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudENvdW50KytcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFsbERheUV2ZW50RW5kKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudC5kYXRhc2V0LmtleVxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUgJiYgdGhpcy5ncmFiYmVkRGF0ZSAhPT0gZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldENoYW5nZWRBbGxEYXlFdmVudFBlcmlvZChkYXRlKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnRDb3VudCA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFsbERheUV2ZW50UHJldmlldygpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QWxsRGF5RXZlbnREcmFnZ2luZyhrZXksIGZhbHNlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQgPSBudWxsXG4gICAgICAgICAgICAgICAgdGhpcy5ncmFiYmVkU3RhcnQgPSB0aGlzLmdyYWJiZWRFbmQgPSBudWxsXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVBbGxEYXlFdmVudEN1cnNvcigpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgICAgICogQHBhcmFtIGRhdGUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVBbGxEYXlFdmVudFByZXZpZXcoZGF0ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudFByZXZEYXRlICE9PSBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRDaGFuZ2VkQWxsRGF5RXZlbnRQZXJpb2QoZGF0ZSlcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUFsbERheUV2ZW50UHJldmlldygpXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVBbGxEYXlFdmVudFByZXZpZXcodGhpcy5kcmFnZ2luZ0FsbERheUV2ZW50LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudFByZXZEYXRlID0gZGF0ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFsbERheUV2ZW50Q3Vyc29yKCkge1xuICAgICAgICAgICAgdGhpcy4kZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZGF5LWdyaWQtY3Vyc29yLXctcmVzaXplJywgJ2djLWRheS1ncmlkLWN1cnNvci1lLXJlc2l6ZScpXG4gICAgICAgICAgICBpZiAodGhpcy5ncmFiYmVkU3RhcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5jbGFzc0xpc3QuYWRkKCdnYy1kYXktZ3JpZC1jdXJzb3Itdy1yZXNpemUnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuZ3JhYmJlZEVuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsLmNsYXNzTGlzdC5hZGQoJ2djLWRheS1ncmlkLWN1cnNvci1lLXJlc2l6ZScpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgICAgICovXG4gICAgICAgIGdldENoYW5nZWRBbGxEYXlFdmVudFBlcmlvZChkYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBkaWZmRGF5cyA9IHRoaXMuZGlmZkRheXModGhpcy5ncmFiYmVkRGF0ZSwgZGF0ZSlcbiAgICAgICAgICAgIGxldCBzdGFydCA9IHRoaXMudG9EYXRlU3RyaW5nKHRoaXMuYWRkRGF5cyh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQuZGF0YXNldC5zdGFydCwgdGhpcy5ncmFiYmVkU3RhcnQgPyBkaWZmRGF5cyA6IDApKVxuICAgICAgICAgICAgbGV0IGVuZCA9IHRoaXMudG9EYXRlU3RyaW5nKHRoaXMuYWRkRGF5cyh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQuZGF0YXNldC5lbmQsIHRoaXMuZ3JhYmJlZEVuZCA/IGRpZmZEYXlzIDogMCkpXG4gICAgICAgICAgICBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ncmFiYmVkU3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQgPSBlbmRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JhYmJlZEVuZCkge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBzdGFydFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbc3RhcnQsIGVuZF1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAqIEBwYXJhbSBlbEV2ZW50IHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEBwYXJhbSBldmVudFN0YXJ0IHtzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAgICAgKiBAcGFyYW0gZXZlbnRFbmQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICAgICAqL1xuICAgICAgICBjcmVhdGVBbGxEYXlFdmVudFByZXZpZXcoZWxFdmVudCwgZXZlbnRTdGFydCwgZXZlbnRFbmQpIHtcbiAgICAgICAgICAgIC8vIFx1NTQwNFx1OTAzMVx1MzA1NFx1MzA2OFx1MzA2Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgQXJyYXkuZnJvbSh0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtd2VlaycpKS5mb3JFYWNoKGVsV2VlayA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3dlZWtTdGFydCwgd2Vla0VuZF0gPSB0aGlzLmdldFdlZWtQZXJpb2QoZWxXZWVrKVxuICAgICAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgJiYgd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbcGVyaW9kU3RhcnQsIHBlcmlvZEVuZF0gPSB0aGlzLm92ZXJsYXBQZXJpb2QoZXZlbnRTdGFydCwgZXZlbnRFbmQsIHdlZWtTdGFydCwgd2Vla0VuZClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcmlvZFN0YXJ0ICYmIHBlcmlvZEVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxQcmV2aWV3ID0gZWxXZWVrLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXlbZGF0YS1kYXRlPVwiJyArIHBlcmlvZFN0YXJ0ICsgJ1wiXSAuZ2MtYWxsLWRheS1ldmVudC1wcmV2aWV3JylcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgPD0gdGhpcy5ncmFiYmVkRGF0ZSAmJiB0aGlzLmdyYWJiZWREYXRlIDw9IHdlZWtFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTkwMzFcdTMwNjdcdTMwNkZcdTMwMDFcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRGNERcdTdGNkVcdTMwOTJcdTgwMDNcdTYxNkVcdTMwNTdcdTMwNjZcdTdBN0FcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdThGRkRcdTUyQTBcdTMwNTlcdTMwOEJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEVtcHR5QWxsRGF5RXZlbnRzKGVsUHJldmlldywgdGhpcy5nZXRJbmRleEluUGFyZW50KGVsRXZlbnQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBlbEV2ZW50LmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF5cyA9IHRoaXMuZGlmZkRheXMocGVyaW9kU3RhcnQsIHBlcmlvZEVuZCkgKyAxXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkanVzdEFsbERheUV2ZW50Rm9yUHJldmlldyhlbCwgZGF5cywgcGVyaW9kU3RhcnQgPT09IGV2ZW50U3RhcnQsIHBlcmlvZEVuZCA9PT0gZXZlbnRFbmQpXG4gICAgICAgICAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsV2VlayB7SFRNTEVsZW1lbnR9IFx1OTAzMVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1OTAzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzBGQlx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0V2Vla1BlcmlvZChlbFdlZWspIHtcbiAgICAgICAgICAgIGNvbnN0IGVsRGF5cyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZGF5Om5vdCguZ2MtZGlzYWJsZWQpJylcbiAgICAgICAgICAgIGlmIChlbERheXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbZWxEYXlzWzBdLmRhdGFzZXQuZGF0ZSwgZWxEYXlzW2VsRGF5cy5sZW5ndGggLSAxXS5kYXRhc2V0LmRhdGVdXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBbbnVsbCwgbnVsbF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NzFGXHU5NTkzXHUzMDZFXHU5MUNEXHUzMDZBXHUzMDhBXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBzdGFydDEge3N0cmluZ30gXHU2NzFGXHU5NTkzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAgICAgKiBAcGFyYW0gZW5kMSB7c3RyaW5nfSBcdTY3MUZcdTk1OTMxXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBzdGFydDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAgICAgKiBAcGFyYW0gZW5kMiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU5MUNEXHUzMDZBXHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU2NzFGXHU5NTkzXG4gICAgICAgICAqL1xuICAgICAgICBvdmVybGFwUGVyaW9kKHN0YXJ0MSwgZW5kMSwgc3RhcnQyLCBlbmQyKSB7XG4gICAgICAgICAgICByZXR1cm4gW3N0YXJ0MSA8PSBlbmQyICYmIHN0YXJ0MiA8PSBlbmQxID8gKHN0YXJ0MSA8IHN0YXJ0MiA/IHN0YXJ0MiA6IHN0YXJ0MSkgOiBudWxsLCBzdGFydDEgPD0gZW5kMiAmJiBzdGFydDIgPD0gZW5kMSA/IChlbmQxIDwgZW5kMiA/IGVuZDEgOiBlbmQyKSA6IG51bGxdXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA2Qlx1NTQwOFx1MzA4Rlx1MzA1Qlx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIGRheXMge251bWJlcn0gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NUU1XHU2NTcwXG4gICAgICAgICAqIEBwYXJhbSBpc1N0YXJ0IHtib29sZWFufSBcdTkwMzFcdTUxODVcdTMwNkJcdTk1OEJcdTU5Q0JcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICogQHBhcmFtIGlzRW5kIHtib29sZWFufSBcdTkwMzFcdTUxODVcdTMwNkJcdTdENDJcdTRFODZcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIGFkanVzdEFsbERheUV2ZW50Rm9yUHJldmlldyhlbCwgZGF5cywgaXNTdGFydCwgaXNFbmQpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLXN0YXJ0JylcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWVuZCcpXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA3OyBpKyspIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy0nICsgaSArICdkYXlzJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLScgKyBkYXlzICsgJ2RheXMnKVxuICAgICAgICAgICAgaWYgKGlzU3RhcnQpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1lbmQnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICAgICAqL1xuICAgICAgICB0b0RhdGVTdHJpbmcoZCkge1xuICAgICAgICAgICAgcmV0dXJuIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdzdi1TRScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NjY0Mlx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICAgICAqL1xuICAgICAgICB0b0RhdGVUaW1lU3RyaW5nKGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvRGF0ZVN0cmluZyhkKSArICcgJyArIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVUaW1lU3RyaW5nKFwiZW4tR0JcIilcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZCXHU2NUU1XHU2NTcwXHUzMDkyXHU1MkEwXHU3Qjk3XG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICAgICAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHU1MkEwXHU3Qjk3XHU1RjhDXHUzMDZFXHU2NUU1XHU0RUQ4KFx1MzBERlx1MzBFQVx1NzlEMilcbiAgICAgICAgICovXG4gICAgICAgIGFkZERheXMoZGF0ZSwgZGF5cykge1xuICAgICAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZSkgKyBkYXlzICogdGhpcy5taWxsaXNlY29uZHNQZXJEYXlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDY4XHU2NUU1XHU0RUQ4XHUzMDZFXHU1REVFXHUzMDZFXHU2NUU1XHU2NTcwXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICAgICAqIEBwYXJhbSBkYXRlMiB7c3RyaW5nfSBcdTY1RTVcdTRFRDgyXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAgICAgKi9cbiAgICAgICAgZGlmZkRheXMoZGF0ZTEsIGRhdGUyKSB7XG4gICAgICAgICAgICBsZXQgZDEgPSBuZXcgRGF0ZShkYXRlMSlcbiAgICAgICAgICAgIGxldCBkMiA9IG5ldyBEYXRlKGRhdGUyKVxuICAgICAgICAgICAgZDEuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgICAgICAgICAgIGQyLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoZDIuZ2V0VGltZSgpIC0gZDEuZ2V0VGltZSgpKSAvIHRoaXMubWlsbGlzZWNvbmRzUGVyRGF5KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZET01cdTg5ODFcdTdEMjBcdTMwNENcdTUxNDRcdTVGMUZcdTMwNkVcdTRFMkRcdTMwNjdcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1MzBBNFx1MzBGM1x1MzBDN1x1MzBDM1x1MzBBRlx1MzBCOVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0SW5kZXhJblBhcmVudChlbCkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZWwucGFyZW50Tm9kZS5jaGlsZHJlbikuaW5kZXhPZihlbClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGXHU2NTcwXHUzMDYwXHUzMDUxXHU3QTdBXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXHUzMDU5XHUzMDhCXG4gICAgICAgICAqL1xuICAgICAgICBhZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXcsIGNvdW50KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgICAgIGVsUHJldmlldy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU1MjRBXHU5NjY0XG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmVBbGxEYXlFdmVudFByZXZpZXcoKSB7XG4gICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKSlcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbCA9PiBlbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbC5jbG9uZU5vZGUoZmFsc2UpLCBlbCkpXG4gICAgICAgIH0sXG4gICAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBZSxTQUFSLFFBQXlCLHFCQUFxQjtBQUNqRCxTQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJSCxvQkFBb0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtwQixvQkFBb0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtwQixtQkFBbUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtuQixxQkFBcUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtyQixnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtoQixjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxvQkFBb0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtwQixxQkFBcUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtyQiw2QkFBNkI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUs3QiwwQkFBMEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUsxQixhQUFhO0FBQUE7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
