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
    selectionBegin: null,
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
     * カレンダーの初期化
     */
    init() {
      this.updateLayout();
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
      } else {
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
      let w = Math.max(rectDay.width + 2, rectPopup.width);
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
      if (this.findTimedEventAtElement($event.target)) {
      } else if (this.updateAllDayEventBegin($event)) {
      } else {
        this.updateSelectionBegin($event);
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
      if (this.draggingAllDayEvent || this.selectionBegin) {
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
     * @param el {HTMLElement} 要素
     * @returns {null|string} 終日予定のキー
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
     * @param el {HTMLElement} 要素
     * @returns {null|string} 終日予定のキー
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
          if (elDay) {
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
     * 日付の選択範囲を取得する
     * @returns {Array} 日付の選択範囲
     */
    getSelection() {
      return [this.selectionBegin, this.selectionEnd].sort();
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
    updateSelectionBegin($event) {
      const date = this.findDateAtElement($event.target);
      if (date) {
        this.selectionBegin = this.selectionEnd = date;
      }
    },
    /**
     * 移動時の選択処理
     * @param $event {MouseEvent} イベント
     */
    updateSelectionMove($event) {
      const date = this.findDateAtPoint($event.x, $event.y);
      if (this.selectionBegin) {
        this.selectionEnd = date;
        this.updateSelection(this.selectionBegin, this.selectionEnd);
      }
    },
    /**
     * 選択を終了
     * @param $event {MouseEvent} イベント
     */
    updateSelectionEnd($event) {
      const date = this.findDateAtPoint($event.x, $event.y);
      if (this.selectionBegin) {
        this.selectionBegin = this.selectionEnd = null;
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
    updateAllDayEventBegin($event) {
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
        this.updateAllDayEventPreview(this.grabbedDate);
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
        const date = this.findDateAtPoint($event.x, $event.y);
        if (date) {
        }
        this.setAllDayEventDragging(this.draggingAllDayEvent.dataset.key, false);
        this.removeAllDayEventPreview();
        this.draggingAllDayEvent = null;
        return true;
      }
      return false;
    },
    /**
     * ドラッグ中の終日予定のプレビューを更新する
     * @param date {string} マウスの位置の日付
     */
    updateAllDayEventPreview(date) {
      const diffDays = this.diffDays(this.grabbedDate, date);
      const eventStart = this.addDays(this.draggingAllDayEvent.dataset.start, this.grabbedStart ? diffDays : 0);
      const eventEnd = this.addDays(this.draggingAllDayEvent.dataset.end, this.grabbedEnd ? diffDays : 0);
      this.removeAllDayEventPreview();
      this.createAllDayEventPreview(this.draggingAllDayEvent, eventStart, eventEnd);
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
      });
    },
    /**
     * 週の開始日・終了日を取得
     * @param elWeek {HTMLElement} 週のDOM要素
     * @returns {Array} 週の開始日・終了日
     */
    getWeekPeriod(elWeek) {
      return [elWeek.querySelector(".gc-day:first-child").dataset.date, elWeek.querySelector(".gc-day:last-child").dataset.date];
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
     * 日付に日数を加算
     * @param date {string} 日付
     * @param days {number} 日数
     * @returns {string} 加算後の日付
     */
    addDays(date, days) {
      return new Date(Date.parse(date) + days * 24 * 60 * 60 * 1e3).toLocaleDateString("sv-SE");
    },
    /**
     * 日付と日付の差の日数を求める
     * @param date1 {string} 日付1
     * @param date2 {string} 日付2
     * @returns {number} 日数
     */
    diffDays(date1, date2) {
      return (Date.parse(date2) - Date.parse(date1)) / (24 * 60 * 60 * 1e3);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL2RheS1ncmlkLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkYXlHcmlkKGNvbXBvbmVudFBhcmFtZXRlcnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFEXHUzMEUzXHUzMEMzXHUzMEI3XHUzMEU1XHUzMDU1XHUzMDhDXHUzMDVGXHU4ODY4XHU3OTNBXHU2NTcwXG4gICAgICAgICAqL1xuICAgICAgICBjYWNoZWRWaXNpYmxlQ291bnQ6IG51bGwsXG5cbiAgICAgICAgLyoqMVxuICAgICAgICAgKiBcdTMwQURcdTMwRTNcdTMwQzNcdTMwQjdcdTMwRTVcdTMwNTVcdTMwOENcdTMwNUZcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgICAgICovXG4gICAgICAgIGNhY2hlZERheVRvcEhlaWdodDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFEXHUzMEUzXHUzMEMzXHUzMEI3XHUzMEU1XHUzMDU1XHUzMDhDXHUzMDVGXHU0RTg4XHU1QjlBXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBjYWNoZWRFdmVudEhlaWdodDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERCXHUzMEQwXHUzMEZDXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBob3ZlckFsbERheUV2ZW50S2V5OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIHNlbGVjdGlvbkJlZ2luOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIHNlbGVjdGlvbkVuZDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqL1xuICAgICAgICBkcmFnZ2luZ1RpbWVkRXZlbnQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgZHJhZ2dpbmdBbGxEYXlFdmVudDogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICBncmFiYmVkRGF0ZTogbnVsbCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBncmFiYmVkU3RhcnQ6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTRGNERcdTdGNkVcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIGdyYWJiZWRFbmQ6IGZhbHNlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUxheW91dCgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBNlx1MzBBM1x1MzBGM1x1MzBDOVx1MzBBNlx1MzA2RVx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvblJlc2l6ZSgkZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTGF5b3V0KClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHUzMEVDXHUzMEE0XHUzMEEyXHUzMEE2XHUzMEM4XHUzMDkyXHU1MThEXHU4QTA4XHU3Qjk3XG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgXHU1RjM3XHU1MjM2XHU3Njg0XHUzMDZCXHU1MThEXHU4QTA4XHU3Qjk3XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVMYXlvdXQoZm9yY2UgPSBmYWxzZSkge1xuICAgICAgICAgICAgLy8gXHU4ODY4XHU3OTNBXHU2NTcwXHUzMDRDXHU1OTA5XHUzMDhGXHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDZBXHUzMDQ0XHU1ODM0XHU1NDA4XHUzMDZGXHU0RjU1XHUzMDgyXHUzMDU3XHUzMDZBXHUzMDQ0XG4gICAgICAgICAgICBjb25zdCB2aXNpYmxlQ291bnQgPSB0aGlzLmdldFZpc2libGVDb3VudCgpXG4gICAgICAgICAgICBpZiAodGhpcy5jYWNoZWRWaXNpYmxlQ291bnQgIT09IHZpc2libGVDb3VudCB8fCBmb3JjZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVkVmlzaWJsZUNvdW50ID0gdmlzaWJsZUNvdW50XG4gICAgICAgICAgICAgICAgdGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLXdlZWsgLmdjLWRheScpLmZvckVhY2goZWxEYXkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZURheShlbERheSwgdmlzaWJsZUNvdW50KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgICAgICovXG4gICAgICAgIGdldERheUhlaWdodCgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuZ2Mtd2VlayAuZ2MtZGF5Jykub2Zmc2V0SGVpZ2h0XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NTQwNFx1NjVFNVx1MzA2RVx1NjVFNVx1NEVEOFx1ODg2OFx1NzkzQVx1MzA2RVx1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgICAgICovXG4gICAgICAgIGdldERheVRvcEhlaWdodCgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNhY2hlZERheVRvcEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlZERheVRvcEhlaWdodFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWREYXlUb3BIZWlnaHQgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LXRvcCcpLm9mZnNldEhlaWdodFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTU0MDRcdTY1RTVcdTMwNkVcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHU2NzJDXHU0RjUzXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICAgICAqL1xuICAgICAgICBnZXREYXlCb2R5SGVpZ2h0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF5SGVpZ2h0KCkgLSB0aGlzLmdldERheVRvcEhlaWdodCgpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgICAgICovXG4gICAgICAgIGdldEV2ZW50SGVpZ2h0KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuY2FjaGVkRXZlbnRIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRFdmVudEhlaWdodFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRFdmVudEhlaWdodCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYy10aW1lZC1ldmVudHMgPiAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXIsIC5nYy10aW1lZC1ldmVudHMgPiAuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJykub2Zmc2V0SGVpZ2h0XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTg4NjhcdTc5M0FcdTMwNjdcdTMwNERcdTMwOEJcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIGdldFZpc2libGVDb3VudCgpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLmZsb29yKHRoaXMuZ2V0RGF5Qm9keUhlaWdodCgpIC8gdGhpcy5nZXRFdmVudEhlaWdodCgpKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHJldHVybnMge251bWJlcn0gXHU0RTg4XHU1QjlBXHU2NTcwXG4gICAgICAgICAqL1xuICAgICAgICBnZXRFdmVudENvdW50KGVsRGF5KSB7XG4gICAgICAgICAgICByZXR1cm4gZWxEYXkucXVlcnlTZWxlY3RvckFsbCgnLmdjLXRpbWVkLWV2ZW50cyA+IC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lciwgLmdjLXRpbWVkLWV2ZW50cyA+IC5nYy10aW1lZC1ldmVudC1jb250YWluZXInKS5sZW5ndGhcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVxuICAgICAgICAgKiBAcGFyYW0gaGVpZ2h0IHtudW1iZXJ9IFx1OUFEOFx1MzA1NVxuICAgICAgICAgKi9cbiAgICAgICAgc2V0VGltZWRFdmVudHNIZWlnaHQoZWxEYXksIGhlaWdodCkge1xuICAgICAgICAgICAgZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLXRpbWVkLWV2ZW50cycpLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEZCXHU5NzVFXHU4ODY4XHU3OTNBXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0gdmlzaWJsZUV2ZW50cyB7bnVtYmVyfSBcdTg4NjhcdTc5M0FcdTUzRUZcdTgwRkRcdTMwNkFcdTRFODhcdTVCOUFcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIHNldEFsbERheUV2ZW50c1Zpc2liaWxpdHkoZWxEYXksIHZpc2libGVFdmVudHMpIHtcbiAgICAgICAgICAgIGVsRGF5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKS5mb3JFYWNoKChlbEV2ZW50LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA8PSB2aXNpYmxlRXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsRXZlbnQuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbEV2ZW50LmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0gcmVtYWluaW5nQ291bnQge251bWJlcn0gXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXG4gICAgICAgICAqL1xuICAgICAgICBzZXRSZW1haW5pbmdDb3VudChlbERheSwgcmVtYWluaW5nQ291bnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsUmVtYWluaW5nID0gZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLXJlbWFpbmluZy1jb250YWluZXInKVxuICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0NvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgIGVsUmVtYWluaW5nLmNoaWxkcmVuWzBdLmlubmVyVGV4dCA9IGNvbXBvbmVudFBhcmFtZXRlcnMucmVtYWluaW5nLnJlcGxhY2UoJzpjb3VudCcsIHJlbWFpbmluZ0NvdW50KVxuICAgICAgICAgICAgICAgIGVsUmVtYWluaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsUmVtYWluaW5nLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1ODg2OFx1NzkzQVx1MzA1OVx1MzA4Qlx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1NjZGNFx1NjVCMFxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIHZpc2libGVDb3VudCB7bnVtYmVyfSBcdTg4NjhcdTc5M0FcdTMwNjdcdTMwNERcdTMwOEJcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZURheShlbERheSwgdmlzaWJsZUNvdW50KSB7XG4gICAgICAgICAgICBjb25zdCBldmVudENvdW50ID0gdGhpcy5nZXRFdmVudENvdW50KGVsRGF5KVxuICAgICAgICAgICAgY29uc3QgbGltaXRDb3VudCA9IGV2ZW50Q291bnQgPCB2aXNpYmxlQ291bnQgPyBldmVudENvdW50IDogdmlzaWJsZUNvdW50IC0gMVxuICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nQ291bnQgPSBldmVudENvdW50IC0gbGltaXRDb3VudFxuICAgICAgICAgICAgdGhpcy5zZXRUaW1lZEV2ZW50c0hlaWdodChlbERheSwgdGhpcy5nZXRFdmVudEhlaWdodCgpICogbGltaXRDb3VudClcbiAgICAgICAgICAgIHRoaXMuc2V0QWxsRGF5RXZlbnRzVmlzaWJpbGl0eShlbERheSwgbGltaXRDb3VudCAtIChyZW1haW5pbmdDb3VudCA/IDEgOiAwKSlcbiAgICAgICAgICAgIHRoaXMuc2V0UmVtYWluaW5nQ291bnQoZWxEYXksIHJlbWFpbmluZ0NvdW50KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RXZlbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25DbGljaygkZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsRGF5ID0gJGV2ZW50LnRhcmdldC5jbG9zZXN0KCcuZ2MtZGF5JylcbiAgICAgICAgICAgIGlmICh0aGlzLmhpdFJlbWFpbmluZygkZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3BlblBvcHVwKGVsRGF5KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlUG9wdXAoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIGhpdFJlbWFpbmluZyhlbCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsLmNsb3Nlc3QoJy5nYy1yZW1haW5pbmctY29udGFpbmVyJykgIT09IG51bGwgJiYgdGhpcy4kZWwuY29udGFpbnMoZWwpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTU4Qlx1MzA0RlxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIG9wZW5Qb3B1cChlbERheSkge1xuICAgICAgICAgICAgdGhpcy5idWlsZFBvcHVwKGVsRGF5KVxuICAgICAgICAgICAgdGhpcy5sYXlvdXRQb3B1cChlbERheSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NTg5XHUzMDU4XHUzMDhCXG4gICAgICAgICAqL1xuICAgICAgICBjbG9zZVBvcHVwKCkge1xuICAgICAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktZ3JpZC1wb3B1cCcpXG4gICAgICAgICAgICBlbFBvcHVwLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1NjlDQlx1N0JDOVxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGJ1aWxkUG9wdXAoZWxEYXkpIHtcbiAgICAgICAgICAgIC8vIERPTVx1MzA5Mlx1NjlDQlx1N0JDOVxuICAgICAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktZ3JpZC1wb3B1cCcpXG4gICAgICAgICAgICBjb25zdCBlbERheUJvZHkgPSBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWJvZHknKS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgICAgICAgIGNvbnN0IGVsRGF5Qm9keU9yaWcgPSBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktYm9keScpXG4gICAgICAgICAgICB0aGlzLnJlcGxhY2VBbGxEYXlFdmVudHMoZWxEYXlCb2R5LCB0aGlzLmdldEFsbERheUV2ZW50S2V5cyhlbERheUJvZHkpKVxuICAgICAgICAgICAgZWxEYXlCb2R5T3JpZy5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbERheUJvZHksIGVsRGF5Qm9keU9yaWcpXG4gICAgICAgICAgICB0aGlzLmFkanVzdFBvcHVwKGVsUG9wdXApXG5cbiAgICAgICAgICAgIC8vIFx1NjVFNVx1NEVEOFx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF0ZScpLmlubmVyVGV4dCA9IGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXRlJykuaW5uZXJUZXh0XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RWtleVx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGdldEFsbERheUV2ZW50S2V5cyhlbERheSkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZWxEYXkucXVlcnlTZWxlY3RvckFsbCgnLmdjLXRpbWVkLWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXldJykpXG4gICAgICAgICAgICAgICAgLm1hcChlbCA9PiBlbC5kYXRhc2V0LmtleSkuZmlsdGVyKGtleSA9PiBrZXkgIT09ICcnKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQjlcdTMwREFcdTMwRkNcdTMwQjVcdTMwRkNcdTMwOTJcdTUxNjhcdTMwNjZcdTUyNEFcdTk2NjRcbiAgICAgICAgICogQHBhcmFtIGVsRGF5Qm9keSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0ga2V5cyB7QXJyYXl9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RWtleVxuICAgICAgICAgKi9cbiAgICAgICAgcmVwbGFjZUFsbERheUV2ZW50cyhlbERheUJvZHksIGtleXMpIHtcbiAgICAgICAgICAgIC8vIFx1NjVFMlx1MzA2Qlx1NTE2NVx1MzA2M1x1MzA2Nlx1MzA0NFx1MzA4Qlx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTI0QVx1OTY2NFx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgQXJyYXkuZnJvbShlbERheUJvZHkucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJykpLmZvckVhY2goZWwgPT4gZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbCkpXG5cbiAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFxuICAgICAgICAgICAgY29uc3QgZWxBbGxEYXlFdmVudHMgPSBlbERheUJvZHkucXVlcnlTZWxlY3RvcignLmdjLWFsbC1kYXktZXZlbnRzJylcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLWFsbC1kYXktZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJykuY2xvbmVOb2RlKHRydWUpXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc3RhcnQnLCAnZ2MtZW5kJylcbiAgICAgICAgICAgICAgICBlbEFsbERheUV2ZW50cy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1NTE4NVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NUZBRVx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZWxQb3B1cCB7SFRNTEVsZW1lbnR9IFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKi9cbiAgICAgICAgYWRqdXN0UG9wdXAoZWxQb3B1cCkge1xuICAgICAgICAgICAgLy8gXHU4ODY4XHU3OTNBXHUzMDU5XHUzMDhCXG4gICAgICAgICAgICBlbFBvcHVwLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpXG5cbiAgICAgICAgICAgIC8vIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RVx1NTkyN1x1MzA0RFx1MzA1NVx1MzA5Mlx1ODFFQVx1NTJENVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9ICdhdXRvJ1xuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS5oZWlnaHQgPSAnYXV0bydcblxuICAgICAgICAgICAgLy8gXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU4MUVBXHU1MkQ1XHUzMDZCXHUzMDU5XHUzMDhCXG4gICAgICAgICAgICBjb25zdCBlbFRpbWVkRXZlbnRzID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJylcbiAgICAgICAgICAgIGVsVGltZWRFdmVudHMuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nXG5cbiAgICAgICAgICAgIC8vIFx1NEVENlx1MjZBQVx1RkUwRVx1NEVGNlx1MzA5Mlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgY29uc3QgZWxSZW1haW5pbmcgPSBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1yZW1haW5pbmctY29udGFpbmVyJylcbiAgICAgICAgICAgIGVsUmVtYWluaW5nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxSZW1haW5pbmcpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RVx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFx1MzA5Mlx1NjZGNFx1NjVCMFxuICAgICAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGxheW91dFBvcHVwKGVsRGF5KSB7XG4gICAgICAgICAgICBjb25zdCBlbFBvcHVwID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLWRheS1ncmlkLXBvcHVwJylcbiAgICAgICAgICAgIGNvbnN0IHJlY3RQb3B1cCA9IGVsUG9wdXAuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgIGNvbnN0IHJlY3REYXkgPSBlbERheS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICAgICAgbGV0IHggPSByZWN0RGF5LmxlZnQgLSAxICsgd2luZG93LnNjcm9sbFhcbiAgICAgICAgICAgIGxldCB5ID0gcmVjdERheS50b3AgLSAxICsgd2luZG93LnNjcm9sbFlcbiAgICAgICAgICAgIGxldCB3ID0gTWF0aC5tYXgocmVjdERheS53aWR0aCArIDIsIHJlY3RQb3B1cC53aWR0aClcbiAgICAgICAgICAgIGxldCBoID0gTWF0aC5tYXgocmVjdERheS5oZWlnaHQsIHJlY3RQb3B1cC5oZWlnaHQpXG4gICAgICAgICAgICBpZiAoeCArIHcgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xuICAgICAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5ICsgaCA+IHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBoXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbFBvcHVwLnN0eWxlLmxlZnQgPSB4ICsgJ3B4J1xuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS50b3AgPSB5ICsgJ3B4J1xuICAgICAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9IHcgKyAncHgnXG4gICAgICAgICAgICBlbFBvcHVwLnN0eWxlLmhlaWdodCA9IGggKyAncHgnXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA0Q1x1NjJCQ1x1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIG9uTW91c2VEb3duKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZmluZFRpbWVkRXZlbnRBdEVsZW1lbnQoJGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNjdcdTMwMDFcdTMwREVcdTMwQTZcdTMwQjlcdTMwQzBcdTMwQTZcdTMwRjNcdTMwNTdcdTMwNUZcdTU4MzRcdTU0MDhcdTMwNkZcdTRGNTVcdTMwODJcdTMwNTdcdTMwNkFcdTMwNDRcdTMwMDJvbkRyYWdTdGFydFx1MzA2N1x1NTFFNlx1NzQwNlx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnVwZGF0ZUFsbERheUV2ZW50QmVnaW4oJGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbkJlZ2luKCRldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy51cGRhdGVBbGxEYXlFdmVudE1vdmUoJGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbk1vdmUoJGV2ZW50KVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNENcdTk2RTJcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBvbk1vdXNlVXAoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy51cGRhdGVBbGxEYXlFdmVudEVuZCgkZXZlbnQpKSB7XG4gICAgICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uRW5kKCRldmVudClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDRDXHU4OTgxXHU3RDIwXHUzMDZCXHU0RTU3XHUzMDYzXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Nb3VzZU92ZXIoJGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUhvdmVyQWxsRGF5RXZlbnQoJGV2ZW50KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwREVcdTMwQTZcdTMwQjlcdTMwREJcdTMwRDBcdTMwRkNcdTUxRTZcdTc0MDZcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlSG92ZXJBbGxEYXlFdmVudCgkZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQgfHwgdGhpcy5zZWxlY3Rpb25CZWdpbikge1xuICAgICAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLmZpbmRBbGxEYXlFdmVudEF0RWxlbWVudCgkZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGxcbiAgICAgICAgICAgIGlmIChrZXkgIT09IHRoaXMuaG92ZXJBbGxEYXlFdmVudEtleSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLmhvdmVyQWxsRGF5RXZlbnRLZXksIGZhbHNlKVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLmhvdmVyQWxsRGF5RXZlbnRLZXkgPSBrZXksIHRydWUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge251bGx8c3RyaW5nfSBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIGZpbmRUaW1lZEV2ZW50QXRFbGVtZW50KGVsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3QoJy5nYy1kYXktZ3JpZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtudWxsfHN0cmluZ30gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFEXHUzMEZDXG4gICAgICAgICAqL1xuICAgICAgICBmaW5kQWxsRGF5RXZlbnRBdEVsZW1lbnQoZWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLiRlbC5jb250YWlucyhlbCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWwuY2xvc2VzdCgnLmdjLWRheS1ncmlkJykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsLmNsb3Nlc3QoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBrZXkge3N0cmluZ30gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFEXHUzMEZDXG4gICAgICAgICAqIEBwYXJhbSBob3ZlciB7Ym9vbGVhbn0gXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBzZXRIb3ZlckFsbERheUV2ZW50KGtleSwgaG92ZXIpIHtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NjVFNVx1NEVEOFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge251bGx8c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgICAgICovXG4gICAgICAgIGZpbmREYXRlQXRFbGVtZW50KGVsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy4kZWwuY29udGFpbnMoZWwpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLmNsb3Nlc3QoJy5nYy1kYXktZ3JpZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsRGF5ID0gZWwuY2xvc2VzdCgnLmdjLWRheScpXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbERheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsRGF5LmRhdGFzZXQuZGF0ZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU0RjREXHU3RjZFXHUzMDZCXHUzMDQyXHUzMDhCXHU2NUU1XHU0RUQ4XHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSB4IHtudW1iZXJ9IFhcdTVFQTdcdTZBMTlcbiAgICAgICAgICogQHBhcmFtIHkge251bWJlcn0gWVx1NUVBN1x1NkExOVxuICAgICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTMwNkVcdTg5ODFcdTdEMjBcbiAgICAgICAgICovXG4gICAgICAgIGZpbmREYXRlQXRQb2ludCh4LCB5KSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IEFycmF5LmZyb20odGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWRheS1ncmlkIC5nYy1kYXknKSkuZmlsdGVyKGVsID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdC5sZWZ0IDw9IHggJiYgeCA8PSByZWN0LnJpZ2h0ICYmIHJlY3QudG9wIDw9IHkgJiYgeSA8PSByZWN0LmJvdHRvbVxuICAgICAgICAgICAgfSkuYXQoMClcbiAgICAgICAgICAgIHJldHVybiBlbCA/IGVsLmRhdGFzZXQuZGF0ZSA6IG51bGxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXG4gICAgICAgICAqL1xuICAgICAgICBnZXRTZWxlY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gW3RoaXMuc2VsZWN0aW9uQmVnaW4sIHRoaXMuc2VsZWN0aW9uRW5kXS5zb3J0KClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVTZWxlY3Rpb24oYmVnaW4sIGVuZCkge1xuICAgICAgICAgICAgaWYgKGJlZ2luID4gZW5kKSB7XG4gICAgICAgICAgICAgICAgW2JlZ2luLCBlbmRdID0gW2VuZCwgYmVnaW5dXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZGF5LWdyaWQgLmdjLWRheScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSBlbC5kYXRhc2V0LmRhdGVcbiAgICAgICAgICAgICAgICBpZiAoYmVnaW4gJiYgZW5kICYmIGJlZ2luIDw9IGRhdGUgJiYgZGF0ZSA8PSBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTMwOTJcdTk1OEJcdTU5Q0JcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlU2VsZWN0aW9uQmVnaW4oJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5maW5kRGF0ZUF0RWxlbWVudCgkZXZlbnQudGFyZ2V0KVxuICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbkJlZ2luID0gdGhpcy5zZWxlY3Rpb25FbmQgPSBkYXRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NzlGQlx1NTJENVx1NjY0Mlx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZVNlbGVjdGlvbk1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uQmVnaW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbkVuZCA9IGRhdGVcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbih0aGlzLnNlbGVjdGlvbkJlZ2luLCB0aGlzLnNlbGVjdGlvbkVuZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU5MDc4XHU2MjlFXHUzMDkyXHU3RDQyXHU0RTg2XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnQge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgdXBkYXRlU2VsZWN0aW9uRW5kKCRldmVudCkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbkJlZ2luKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25CZWdpbiA9IHRoaXMuc2VsZWN0aW9uRW5kID0gbnVsbFxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uKG51bGwsIG51bGwpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25EcmFnU3RhcnQoJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9ICRldmVudC50YXJnZXQuY2xvc2VzdCgnLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdnaW5nVGltZWRFdmVudCA9IGVsXG4gICAgICAgICAgICAgICAgJGV2ZW50LmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnXG4gICAgICAgICAgICAgICAgJGV2ZW50LmRhdGFUcmFuc2Zlci5zZXREYXRhKCd0ZXh0L3BsYWluJywgZWwuZGF0YXNldC5rZXkpXG4gICAgICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDRDXHU4OTgxXHU3RDIwXHUzMDZCXHU0RTU3XHUzMDYzXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEBwYXJhbSAkZXZlbnRcbiAgICAgICAgICovXG4gICAgICAgIG9uRHJhZ092ZXIoJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVNlbGVjdGlvbihkYXRlLCBkYXRlKVxuICAgICAgICAgICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFRFx1MzBDM1x1MzBEN1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgb25Ecm9wKCRldmVudCkge1xuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHU1MUU2XHU3NDA2XHUzMDkyXHU1QjlGXHU4ODRDXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5maW5kRGF0ZUF0UG9pbnQoJGV2ZW50LngsICRldmVudC55KVxuICAgICAgICAgICAgY29uc3Qga2V5ID0gJGV2ZW50LmRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXh0L3BsYWluJylcbiAgICAgICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA0Q1x1ODk4MVx1N0QyMFx1MzA0Qlx1MzA4OVx1NTkxNlx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50XG4gICAgICAgICAqL1xuICAgICAgICBvbkRyYWdFbmQoJGV2ZW50KSB7XG4gICAgICAgICAgICAvLyBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTg5RTNcdTk2NjRcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VsZWN0aW9uKG51bGwsIG51bGwpXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE0M1x1MzA2Qlx1NjIzQlx1MzA1OVxuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZ1RpbWVkRXZlbnQuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdUaW1lZEV2ZW50ID0gbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIHNldEFsbERheUV2ZW50RHJhZ2dpbmcoa2V5LCBkcmFnZ2luZykge1xuICAgICAgICAgICAgdGhpcy4kZWwucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFsbERheUV2ZW50QmVnaW4oJGV2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IHRoaXMuZmluZEFsbERheUV2ZW50QXRFbGVtZW50KCRldmVudC50YXJnZXQpXG4gICAgICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTU5MDlcdTVGNjJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRTdGFydCA9IHRoaXMuZ3JhYmJlZEVuZCA9IHRydWVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oaXRIZWFkKCRldmVudC50YXJnZXQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRFbmQgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5oaXRUYWlsKCRldmVudC50YXJnZXQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdyYWJiZWRTdGFydCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICAgICAgICAgICAgdGhpcy5ncmFiYmVkRGF0ZSA9IHRoaXMuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcblxuICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudCA9IGVsXG5cbiAgICAgICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdUZGMDhcdTg4NjhcdTc5M0FcdTMwOTJcdTZEODhcdTMwNTlcdUZGMDlcbiAgICAgICAgICAgICAgICB0aGlzLnNldEFsbERheUV2ZW50RHJhZ2dpbmcodGhpcy5kcmFnZ2luZ0FsbERheUV2ZW50LmRhdGFzZXQua2V5LCB0cnVlKVxuXG4gICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVBbGxEYXlFdmVudFByZXZpZXcodGhpcy5ncmFiYmVkRGF0ZSlcblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NTIyNFx1NUI5QVx1MzA1OVx1MzA4Qlx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICAgICAqL1xuICAgICAgICBoaXRIZWFkKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gISFlbC5jbG9zZXN0KCcuZ2MtaGVhZCcpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgaGl0VGFpbChlbCkge1xuICAgICAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLXRhaWwnKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcbiAgICAgICAgICogQHBhcmFtICRldmVudCB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICB1cGRhdGVBbGxEYXlFdmVudE1vdmUoJGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZ2luZ0FsbERheUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZmluZERhdGVBdFBvaW50KCRldmVudC54LCAkZXZlbnQueSlcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUFsbERheUV2ZW50UHJldmlldyhkYXRlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAgICAgKiBAcGFyYW0gJGV2ZW50IHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFsbERheUV2ZW50RW5kKCRldmVudCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLmZpbmREYXRlQXRQb2ludCgkZXZlbnQueCwgJGV2ZW50LnkpXG4gICAgICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBbGxEYXlFdmVudERyYWdnaW5nKHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudC5kYXRhc2V0LmtleSwgZmFsc2UpXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBbGxEYXlFdmVudFByZXZpZXcoKVxuICAgICAgICAgICAgICAgIHRoaXMuZHJhZ2dpbmdBbGxEYXlFdmVudCA9IG51bGxcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgICAgICovXG4gICAgICAgIHVwZGF0ZUFsbERheUV2ZW50UHJldmlldyhkYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBkaWZmRGF5cyA9IHRoaXMuZGlmZkRheXModGhpcy5ncmFiYmVkRGF0ZSwgZGF0ZSlcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U3RhcnQgPSB0aGlzLmFkZERheXModGhpcy5kcmFnZ2luZ0FsbERheUV2ZW50LmRhdGFzZXQuc3RhcnQsIHRoaXMuZ3JhYmJlZFN0YXJ0ID8gZGlmZkRheXMgOiAwKVxuICAgICAgICAgICAgY29uc3QgZXZlbnRFbmQgPSB0aGlzLmFkZERheXModGhpcy5kcmFnZ2luZ0FsbERheUV2ZW50LmRhdGFzZXQuZW5kLCB0aGlzLmdyYWJiZWRFbmQgPyBkaWZmRGF5cyA6IDApXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFsbERheUV2ZW50UHJldmlldygpXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUFsbERheUV2ZW50UHJldmlldyh0aGlzLmRyYWdnaW5nQWxsRGF5RXZlbnQsIGV2ZW50U3RhcnQsIGV2ZW50RW5kKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHBhcmFtIGV2ZW50U3RhcnQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIGNyZWF0ZUFsbERheUV2ZW50UHJldmlldyhlbEV2ZW50LCBldmVudFN0YXJ0LCBldmVudEVuZCkge1xuICAgICAgICAgICAgLy8gXHU1NDA0XHU5MDMxXHUzMDU0XHUzMDY4XHUzMDZCXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy13ZWVrJykpLmZvckVhY2goZWxXZWVrID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBbd2Vla1N0YXJ0LCB3ZWVrRW5kXSA9IHRoaXMuZ2V0V2Vla1BlcmlvZChlbFdlZWspXG4gICAgICAgICAgICAgICAgY29uc3QgW3BlcmlvZFN0YXJ0LCBwZXJpb2RFbmRdID0gdGhpcy5vdmVybGFwUGVyaW9kKGV2ZW50U3RhcnQsIGV2ZW50RW5kLCB3ZWVrU3RhcnQsIHdlZWtFbmQpXG4gICAgICAgICAgICAgICAgaWYgKHBlcmlvZFN0YXJ0ICYmIHBlcmlvZEVuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbFByZXZpZXcgPSBlbFdlZWsucXVlcnlTZWxlY3RvcignLmdjLWRheVtkYXRhLWRhdGU9XCInICsgcGVyaW9kU3RhcnQgKyAnXCJdIC5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKVxuICAgICAgICAgICAgICAgICAgICBpZiAod2Vla1N0YXJ0IDw9IHRoaXMuZ3JhYmJlZERhdGUgJiYgdGhpcy5ncmFiYmVkRGF0ZSA8PSB3ZWVrRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTkwMzFcdTMwNjdcdTMwNkZcdTMwMDFcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRGNERcdTdGNkVcdTMwOTJcdTgwMDNcdTYxNkVcdTMwNTdcdTMwNjZcdTdBN0FcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdThGRkRcdTUyQTBcdTMwNTlcdTMwOEJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3LCB0aGlzLmdldEluZGV4SW5QYXJlbnQoZWxFdmVudCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBlbEV2ZW50LmNsb25lTm9kZSh0cnVlKVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlzID0gdGhpcy5kaWZmRGF5cyhwZXJpb2RTdGFydCwgcGVyaW9kRW5kKSArIDFcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RBbGxEYXlFdmVudEZvclByZXZpZXcoZWwsIGRheXMsIHBlcmlvZFN0YXJ0ID09PSBldmVudFN0YXJ0LCBwZXJpb2RFbmQgPT09IGV2ZW50RW5kKVxuICAgICAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU5MDMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XHUzMEZCXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICAgICAqIEBwYXJhbSBlbFdlZWsge0hUTUxFbGVtZW50fSBcdTkwMzFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICovXG4gICAgICAgIGdldFdlZWtQZXJpb2QoZWxXZWVrKSB7XG4gICAgICAgICAgICByZXR1cm4gW2VsV2Vlay5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5OmZpcnN0LWNoaWxkJykuZGF0YXNldC5kYXRlLCBlbFdlZWsucXVlcnlTZWxlY3RvcignLmdjLWRheTpsYXN0LWNoaWxkJykuZGF0YXNldC5kYXRlXVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY3MUZcdTk1OTNcdTMwNkVcdTkxQ0RcdTMwNkFcdTMwOEFcdTMwOTJcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgICAgICogQHBhcmFtIHN0YXJ0MSB7c3RyaW5nfSBcdTY3MUZcdTk1OTMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICogQHBhcmFtIHN0YXJ0MiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICAgICAqIEBwYXJhbSBlbmQyIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzJcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAgICAgICAgICovXG4gICAgICAgIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpIHtcbiAgICAgICAgICAgIHJldHVybiBbc3RhcnQxIDw9IGVuZDIgJiYgc3RhcnQyIDw9IGVuZDEgPyAoc3RhcnQxIDwgc3RhcnQyID8gc3RhcnQyIDogc3RhcnQxKSA6IG51bGwsIHN0YXJ0MSA8PSBlbmQyICYmIHN0YXJ0MiA8PSBlbmQxID8gKGVuZDEgPCBlbmQyID8gZW5kMSA6IGVuZDIpIDogbnVsbF1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY1RTVcdTY1NzBcbiAgICAgICAgICogQHBhcmFtIGlzU3RhcnQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1OTU4Qlx1NTlDQlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKiBAcGFyYW0gaXNFbmQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1N0Q0Mlx1NEU4Nlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAgICAgKi9cbiAgICAgICAgYWRqdXN0QWxsRGF5RXZlbnRGb3JQcmV2aWV3KGVsLCBkYXlzLCBpc1N0YXJ0LCBpc0VuZCkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc3RhcnQnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZW5kJylcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDc7IGkrKykge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLScgKyBpICsgJ2RheXMnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtJyArIGRheXMgKyAnZGF5cycpXG4gICAgICAgICAgICBpZiAoaXNTdGFydCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXN0YXJ0JylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWVuZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWxcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZCXHU2NUU1XHU2NTcwXHUzMDkyXHU1MkEwXHU3Qjk3XG4gICAgICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICAgICAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgICAgICogQHJldHVybnMge3N0cmluZ30gXHU1MkEwXHU3Qjk3XHU1RjhDXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICAgICAqL1xuICAgICAgICBhZGREYXlzKGRhdGUsIGRheXMpIHtcbiAgICAgICAgICAgIHJldHVybiAobmV3IERhdGUoRGF0ZS5wYXJzZShkYXRlKSArIGRheXMgKiAyNCAqIDYwICogNjAgKiAxMDAwKSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdzdi1TRScpXG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA2RVx1NjVFNVx1NjU3MFx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAgICAgKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICAgICAgICAgKiBAcGFyYW0gZGF0ZTIge3N0cmluZ30gXHU2NUU1XHU0RUQ4MlxuICAgICAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgICAgICovXG4gICAgICAgIGRpZmZEYXlzKGRhdGUxLCBkYXRlMikge1xuICAgICAgICAgICAgcmV0dXJuIChEYXRlLnBhcnNlKGRhdGUyKSAtIERhdGUucGFyc2UoZGF0ZTEpKSAvICgyNCAqIDYwICogNjAgKiAxMDAwKVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZET01cdTg5ODFcdTdEMjBcdTMwNENcdTUxNDRcdTVGMUZcdTMwNkVcdTRFMkRcdTMwNjdcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1MzBBNFx1MzBGM1x1MzBDN1x1MzBDM1x1MzBBRlx1MzBCOVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0SW5kZXhJblBhcmVudChlbCkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZWwucGFyZW50Tm9kZS5jaGlsZHJlbikuaW5kZXhPZihlbClcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGXHU2NTcwXHUzMDYwXHUzMDUxXHU3QTdBXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXHUzMDU5XHUzMDhCXG4gICAgICAgICAqL1xuICAgICAgICBhZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXcsIGNvdW50KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgICAgIGVsUHJldmlldy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU1MjRBXHU5NjY0XG4gICAgICAgICAqL1xuICAgICAgICByZW1vdmVBbGxEYXlFdmVudFByZXZpZXcoKSB7XG4gICAgICAgICAgICBBcnJheS5mcm9tKHRoaXMuJGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKSlcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbCA9PiBlbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbC5jbG9uZU5vZGUoZmFsc2UpLCBlbCkpXG4gICAgICAgIH0sXG4gICAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBZSxTQUFSLFFBQXlCLHFCQUFxQjtBQUNqRCxTQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJSCxvQkFBb0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtwQixvQkFBb0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtwQixtQkFBbUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtuQixxQkFBcUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtyQixnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtoQixjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxvQkFBb0I7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtwQixxQkFBcUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtyQixhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLYixjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLWixPQUFPO0FBQ0gsV0FBSyxhQUFhO0FBQUEsSUFDdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsU0FBUyxRQUFRO0FBQ2IsV0FBSyxhQUFhO0FBQUEsSUFDdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBTUEsYUFBYSxRQUFRLE9BQU87QUFFeEIsWUFBTSxlQUFlLEtBQUssZ0JBQWdCO0FBQzFDLFVBQUksS0FBSyx1QkFBdUIsZ0JBQWdCLE9BQU87QUFDbkQsYUFBSyxxQkFBcUI7QUFDMUIsYUFBSyxJQUFJLGlCQUFpQixrQkFBa0IsRUFBRSxRQUFRLFdBQVM7QUFDM0QsZUFBSyxVQUFVLE9BQU8sWUFBWTtBQUFBLFFBQ3RDLENBQUM7QUFBQSxNQUNMO0FBQUEsSUFDSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNQSxlQUFlO0FBQ1gsYUFBTyxLQUFLLElBQUksY0FBYyxrQkFBa0IsRUFBRTtBQUFBLElB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
