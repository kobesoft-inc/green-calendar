var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// resources/js/modules/DayGridLimit.ts
var _DayGridLimit = class _DayGridLimit {
  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   */
  constructor(root) {
    /**
     * ルート要素
     * @private
     */
    __publicField(this, "_root");
    /**
     * 表示できる数のキャッシュ
     * @private
     */
    __publicField(this, "_visibleCount", 0);
    /**
     * カレンダーの日の高さ
     * @private
     */
    __publicField(this, "_dayTopHeight", null);
    /**
     * 予定１件辺りの高さ
     * @private
     */
    __publicField(this, "_eventHeight", null);
    /**
     * 残りの予定数の表示テキスト
     * @private
     */
    __publicField(this, "_localizedRemainingText", "+ :count more");
    /**
     * 残りの予定数をクリックした時の処理
     */
    __publicField(this, "_onRemainingTextClick");
    this._root = root;
    this.init();
  }
  /**
   * 初期化
   */
  init() {
    this.updateLayout();
    window.addEventListener("resize", this._onResize.bind(this));
    this._root.addEventListener("click", this._onClick.bind(this));
    this._root.addEventListener("mousedown", this._onMouseDown.bind(this));
  }
  /**
   * 残りの予定数の表示テキストを設定
   * @param localizedRemainingText
   */
  setLocalizedRemainingText(localizedRemainingText) {
    this._localizedRemainingText = localizedRemainingText;
    return this;
  }
  /**
   * 残りの予定数をクリックした時の処理を設定
   * @param onRemainingTextClick
   */
  onRemainingTextClick(onRemainingTextClick) {
    this._onRemainingTextClick = onRemainingTextClick;
    return this;
  }
  /**
   * リサイズ時の処理
   */
  _onResize() {
    this.updateLayout();
  }
  /**
   * クリック時の処理
   * @param e
   */
  _onClick(e) {
    if (this.isRemainingTextElement(e.target)) {
      if (this._onRemainingTextClick) {
        this._onRemainingTextClick(this.pickDay(e.target));
      }
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスを押した時の処理
   * @param e
   */
  _onMouseDown(e) {
    if (this.isRemainingTextElement(e.target)) {
      e.stopImmediatePropagation();
    }
  }
  /**
   * カレンダーのレイアウトを再計算
   * @param {boolean} force 強制的に再計算するかどうか
   */
  updateLayout(force = false) {
    const visibleCount = this.getVisibleCount();
    if (this._visibleCount !== visibleCount || force) {
      this._visibleCount = visibleCount;
      this._root.querySelectorAll(_DayGridLimit.DAY_SELECTOR).forEach((day) => {
        this.updateDay(day, visibleCount);
      });
    }
  }
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
    this.limitAllDayEvents(elDay, limitCount - (remainingCount ? 1 : 0));
    this.setRemainingCount(elDay, remainingCount);
  }
  /**
   * カレンダーの日の予定数を取得
   * @param elDay {HTMLElement} カレンダーの日
   * @returns {number} 予定数
   */
  getEventCount(elDay) {
    return elDay.querySelectorAll(_DayGridLimit.ANY_EVENT_SELECTOR).length;
  }
  /**
   * 予定の高さを取得
   * @returns {number} 予定の高さ
   */
  getEventHeight() {
    if (this._eventHeight === null) {
      this._eventHeight = this.getElementHeight(_DayGridLimit.ANY_EVENT_SELECTOR);
    }
    return this._eventHeight;
  }
  /**
   * 時間指定の予定の高さを設定
   * @param elDay {HTMLElement} カレンダーの日
   * @param height {number} 高さ
   */
  setTimedEventsHeight(elDay, height) {
    elDay.querySelector(".gc-timed-events").style.height = height + "px";
  }
  /**
   * カレンダーの日の高さを取得
   * @returns {number} 日の高さ
   */
  getDayHeight() {
    return this.getElementHeight(_DayGridLimit.DAY_SELECTOR);
  }
  /**
   * カレンダーの各日の日付表示の部分の高さを取得
   * @returns {number} 日付表示の部分の高さ
   */
  getDayTopHeight() {
    if (this._dayTopHeight === null) {
      this._dayTopHeight = this.getElementHeight(_DayGridLimit.DAY_TOP_SELECTOR);
    }
    return this._dayTopHeight;
  }
  /**
   * 指定したセレクタの要素の高さを取得
   */
  getElementHeight(selector) {
    return this._root.querySelector(selector).offsetHeight;
  }
  /**
   * カレンダーの各日の本体部分の高さを取得
   * @returns {number} 本体部分の高さ
   */
  getDayBodyHeight() {
    return this.getDayHeight() - this.getDayTopHeight();
  }
  /**
   * 表示できる数を取得
   * @returns {number} 表示できる数
   */
  getVisibleCount() {
    return Math.floor(this.getDayBodyHeight() / this.getEventHeight());
  }
  /**
   * 終日予定の表示・非表示を設定
   * @param elDay {HTMLElement} カレンダーの日のDOM要素
   * @param limit {number} 表示可能な予定数
   */
  limitAllDayEvents(elDay, limit) {
    elDay.querySelectorAll(".gc-all-day-events .gc-all-day-event-container").forEach((elEvent, index) => {
      if (index <= limit) {
        elEvent.classList.remove("gc-hidden");
      } else {
        elEvent.classList.add("gc-hidden");
      }
    });
  }
  /**
   * 残りの予定数を設定
   * @param elDay {HTMLElement} カレンダーの日のDOM要素
   * @param remainingCount {number} 残りの予定数
   */
  setRemainingCount(elDay, remainingCount) {
    const elRemaining = elDay.querySelector(".gc-remaining-container");
    if (remainingCount > 0) {
      elRemaining.children[0].innerText = this.makeRemainingText(remainingCount);
      elRemaining.classList.remove("gc-hidden");
    } else {
      elRemaining.classList.add("gc-hidden");
    }
  }
  /**
   * 残りの予定数の表示テキストを作成
   * @param remainingCount {number} 残りの予定数
   * @returns {string} 残りの予定数の表示テキスト
   */
  makeRemainingText(remainingCount) {
    return this._localizedRemainingText.replace(":count", String(remainingCount));
  }
  /**
   * 残りの予定をクリックしたかどうか
   * @param el {Element} クリックされた要素
   * @returns {boolean} 残りの予定をクリックしたかどうか
   */
  isRemainingTextElement(el) {
    return el.closest(".gc-remaining-container") && this._root.contains(el);
  }
  /**
   * カレンダーの日のDOM要素を取得
   * @param el {Element} クリックされた要素
   * @returns {HTMLElement} カレンダーの日のDOM要素
   */
  pickDay(el) {
    return el.closest(".gc-day");
  }
};
/**
 * カレンダーの日のセレクタ
 */
__publicField(_DayGridLimit, "DAY_SELECTOR", ".gc-days .gc-day");
/**
 * カレンダーの日の上部のセレクタ
 */
__publicField(_DayGridLimit, "DAY_TOP_SELECTOR", ".gc-day-top");
/**
 * カレンダーの予定のセレクタ
 * .gc-all-day-eventsには、開始日にだけデータが入っているのだが、
 * .gc-timed-eventsには、全日予定を含めて、全ての日にデータが入っている。
 */
__publicField(_DayGridLimit, "ANY_EVENT_SELECTOR", ".gc-timed-events > .gc-timed-event-container, .gc-timed-events > .gc-all-day-event-container");
var DayGridLimit = _DayGridLimit;

// resources/js/modules/DateTimeSelector.ts
var DateTimeSelector = class {
  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   */
  constructor(root) {
    /**
     * ルート要素
     * @private
     */
    __publicField(this, "_root");
    /**
     * 選択対象の要素を全て含むセレクタ
     * @private
     */
    __publicField(this, "_containerSelector", null);
    /**
     * 選択対象の要素のセレクタ
     * @private
     */
    __publicField(this, "_elementSelector", null);
    /**
     * 選択対象の要素の日付・時間を持つプロパティ名
     * @private
     */
    __publicField(this, "_propertyName", null);
    /**
     * 選択範囲の開始位置
     * @private
     */
    __publicField(this, "_selectionStart", null);
    /**
     * 選択範囲の終了位置
     * @private
     */
    __publicField(this, "_selectionEnd", null);
    /**
     * 選択範囲が変更された時のコールバック
     * @private
     */
    __publicField(this, "_onSelect", null);
    this._root = root;
  }
  /**
   * コールバックを登録する
   */
  registerCallbacks() {
    this._root.addEventListener("mousedown", this._mouseDown.bind(this));
    this._root.addEventListener("mousemove", this._mouseMove.bind(this));
    this._root.addEventListener("mouseup", this._mouseUp.bind(this));
  }
  /**
   * 選択対象の要素を全て含むセレクタを設定する。
   * @param containerSelector
   */
  setContainerSelector(containerSelector) {
    this._containerSelector = containerSelector;
    return this;
  }
  /**
   * 選択対象の要素のセレクタを設定する。
   * @param elementSelector
   */
  setElementSelector(elementSelector) {
    this._elementSelector = elementSelector;
    return this;
  }
  /**
   * 選択対象の要素の日付・時間を持つプロパティ名を設定する。(data-dateなら、date)
   * @param propertyName
   */
  setPropertyName(propertyName) {
    this._propertyName = propertyName;
    return this;
  }
  /**
   * 選択範囲が変更された時のコールバックを設定する。
   * @param onSelect
   */
  onSelect(onSelect) {
    this._onSelect = onSelect;
    return this;
  }
  /**
   * 選択範囲の開始位置を設定する。
   * @param dateTime 日付・時間
   */
  select(dateTime) {
    this._selectionStart = this._selectionEnd = dateTime;
    this.update();
    return this;
  }
  /**
   * 選択範囲の終了位置を設定する。
   * @param dateTime 日付・時間
   */
  selectEnd(dateTime) {
    this._selectionEnd = dateTime;
    this.update();
    return this;
  }
  /**
   * 選択範囲を解除する。
   */
  deselect() {
    this.select(null);
  }
  /**
   * 選択範囲を取得する。
   * @returns {string[]} 日付・時間
   */
  getSelection() {
    return [this._selectionStart, this._selectionEnd].sort();
  }
  /**
   * 現在、選択中かどうかを取得する。
   * @returns {boolean}
   */
  isSelected() {
    return this._selectionStart !== null && this._selectionEnd !== null;
  }
  /**
   * マウスを押した時の処理
   * @param e
   */
  _mouseDown(e) {
    const dateTime = this.pickDateTime(e.target);
    if (dateTime) {
      this.select(dateTime);
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスを動かした時の処理
   * @param e
   */
  _mouseMove(e) {
    const dateTime = this.pickDateTimeByPosition(e.x, e.y);
    if (dateTime) {
      this.selectEnd(dateTime);
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスを離した時の処理
   * @param e
   */
  _mouseUp(e) {
    if (this.isSelected()) {
      const dateTime = this.pickDateTimeByPosition(e.x, e.y);
      if (dateTime) {
        if (this._onSelect) {
          const [start, end] = this.getSelection();
          this._onSelect(start, end);
        }
        this.deselect();
      }
      e.stopImmediatePropagation();
    }
  }
  /**
   * 指定された要素から、選択対象の要素を探す。
   * @param el 要素
   * @returns {string} 日付・時間
   */
  pickDateTime(el) {
    return this._root.contains(el) && el.closest(this._containerSelector) ? el.closest(this._elementSelector + ":not(.disabled)")?.dataset[this._propertyName] : null;
  }
  /**
   * 指定された座標から、選択対象の要素を探す。
   * @param x X座標
   * @param y Y座標
   * @returns {string} 日付・時間
   */
  pickDateTimeByPosition(x, y) {
    return Array.from(this._root.querySelectorAll(this._containerSelector + " " + this._elementSelector)).filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
    }).at(0)?.dataset[this._propertyName];
  }
  /**
   * 指定された日付・時間の要素を探す。
   * @param dateTime 日付・時間
   * @returns {HTMLElement} 要素
   */
  getElementByDateTime(dateTime) {
    return this._root.querySelector(
      this._containerSelector + " " + this._elementSelector + "[data-" + this._propertyName + '="' + dateTime + '"]'
    );
  }
  /**
   * 日時の選択範囲の表示を更新する。
   */
  update() {
    let [begin, end] = [this._selectionStart, this._selectionEnd].sort();
    this._root.querySelectorAll(this._containerSelector + " " + this._elementSelector).forEach((el) => {
      const dateTime = el.dataset[this._propertyName];
      if (begin <= dateTime && dateTime <= end) {
        el.classList.add("gc-selected");
      } else {
        el.classList.remove("gc-selected");
      }
    });
  }
};

// resources/js/modules/DayGridPopup.ts
var DayGridPopup = class {
  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   */
  constructor(root) {
    /**
     * ルート要素
     * @private
     */
    __publicField(this, "_root");
    this._root = root;
  }
  /**
   * リスナーイベントを登録する
   */
  registerCallbacks() {
    window.addEventListener("click", () => this.close());
  }
  /**
   * ポップアップを開く
   * @param elDay {HTMLElement} カレンダーの日のDOM要素
   */
  open(elDay) {
    this.buildPopup(elDay);
    this.layoutPopup(elDay);
  }
  /**
   * ポップアップを閉じる
   */
  close() {
    this.findPopupElement().classList.add("gc-hidden");
  }
  /**
   * ポップアップのDOM要素を取得
   * @returns {HTMLElement} ポップアップのDOM要素
   */
  findPopupElement() {
    return this._root.querySelector(".gc-day-grid-popup");
  }
  /**
   * ポップアップを構築
   * @param elDay {HTMLElement} カレンダーの日のDOM要素
   */
  buildPopup(elDay) {
    const elPopup = this.findPopupElement();
    const elDayBody = elDay.querySelector(".gc-day-body").cloneNode(true);
    const elDayBodyOrig = elPopup.querySelector(".gc-day-body");
    this.replaceAllDayEvents(elDayBody, this.getAllDayEventKeys(elDayBody));
    elDayBodyOrig.parentNode.replaceChild(elDayBody, elDayBodyOrig);
    this.adjustPopup(elPopup);
    elPopup.querySelector(".gc-date").innerText = elDay.querySelector(".gc-date").innerText;
  }
  /**
   * 終日予定のkeyを全て取得
   * @param elDay {HTMLElement} カレンダーの日の本体部分のDOM要素
   */
  getAllDayEventKeys(elDay) {
    return Array.from(elDay.querySelectorAll(".gc-timed-events .gc-all-day-event-container[data-key]")).map((el) => el.dataset.key).filter((key) => key !== "");
  }
  /**
   * 時間指定の予定の中の終日予定のスペーサーを全て削除
   * @param elDayBody {HTMLElement} カレンダーの日の本体部分のDOM要素
   * @param keys {Array} 終日予定のkey
   */
  replaceAllDayEvents(elDayBody, keys) {
    Array.from(elDayBody.querySelectorAll(".gc-all-day-event-container")).forEach((el) => el.parentNode.removeChild(el));
    const elAllDayEvents = elDayBody.querySelector(".gc-all-day-events");
    keys.forEach((key) => {
      const el = this._root.querySelector('.gc-all-day-events .gc-all-day-event-container[data-key="' + key + '"]').cloneNode(true);
      el.classList.add("gc-start", "gc-end");
      el.classList.remove("gc-hidden");
      elAllDayEvents.appendChild(el);
    });
  }
  /**
   * ポップアップ内の要素の表示を微調節する
   * @param elPopup {HTMLElement} ポップアップのDOM要素
   */
  adjustPopup(elPopup) {
    elPopup.classList.remove("gc-hidden");
    elPopup.style.width = elPopup.style.height = "auto";
    const elTimedEvents = elPopup.querySelector(".gc-timed-events");
    elTimedEvents.style.height = "auto";
    const elRemaining = elPopup.querySelector(".gc-remaining-container");
    elRemaining.parentNode.removeChild(elRemaining);
  }
  /**
   * ポップアップのレイアウトを更新
   * @param elDay {HTMLElement} カレンダーの日のDOM要素
   */
  layoutPopup(elDay) {
    const elPopup = this.findPopupElement();
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

// resources/js/modules/DateUtils.ts
var _DateUtils = class _DateUtils {
  /**
   * ミリ秒を日付文字列に変換する
   * @param d {number} ミリ秒
   * @returns {string} 日付文字列
   */
  static toDateString(d) {
    return new Date(d).toLocaleDateString("sv-SE");
  }
  /**
   * ミリ秒を日時文字列に変換する
   * @param d {number} ミリ秒
   * @returns {string} 日付文字列
   */
  static toDateTimeString(d) {
    return _DateUtils.toDateString(d) + " " + new Date(d).toLocaleTimeString("en-GB");
  }
  /**
   * 日付に日数を加算
   * @param date {string} 日付
   * @param days {number} 日数
   * @returns {number} 加算後の日付(ミリ秒)
   */
  static addDays(date, days) {
    return Date.parse(date) + days * _DateUtils.MILLISECONDS_PER_DAY;
  }
  /**
   * 日付と日付の差の日数を求める
   * @param date1 {string} 日付1
   * @param date2 {string} 日付2
   * @returns {number} 日数
   */
  static diffDays(date1, date2) {
    let d1 = new Date(date1);
    let d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return Math.floor((d2.getTime() - d1.getTime()) / _DateUtils.MILLISECONDS_PER_DAY);
  }
  /**
   * 日付と日付の差をmsで求める
   * @param date1 {string} 日付1
   * @param date2 {string} 日付2
   * @returns {number} 日数
   */
  static diffInMilliseconds(date1, date2) {
    return Date.parse(date2) - Date.parse(date1);
  }
  /**
   * 期間の重なりを求める
   * @param start1 {string} 期間1の開始日
   * @param end1 {string} 期間1の終了日
   * @param start2 {string} 期間2の開始日
   * @param end2 {string} 期間2の終了日
   * @returns {Array} 重なっている期間
   */
  static overlapPeriod(start1, end1, start2, end2) {
    const start = start1 <= start2 ? start2 : start1;
    const end = end1 <= end2 ? end1 : end2;
    return start <= end ? [start, end] : [null, null];
  }
};
/**
 * 1日のミリ秒
 */
__publicField(_DateUtils, "MILLISECONDS_PER_DAY", 24 * 60 * 60 * 1e3);
var DateUtils = _DateUtils;

// resources/js/modules/Resizer.ts
var Resizer = class {
  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   * @param selector
   */
  constructor(root, selector) {
    /**
     * ルート要素
     * @protected
     */
    __publicField(this, "_root");
    /**
     * 選択対象の要素を全て含むセレクタ
     * @protected
     */
    __publicField(this, "_containerSelector", null);
    /**
     * リサイズ対象の予定のセレクター
     */
    __publicField(this, "_eventSelector", null);
    /**
     * 日付セレクター・時間セレクター
     */
    __publicField(this, "_selector", null);
    /**
     * ヘッダーカーソル
     */
    __publicField(this, "_headCursor", "gc-cursor-w-resize");
    /**
     * テールカーソル
     */
    __publicField(this, "_tailCursor", "gc-cursor-e-resize");
    /**
     * ドラッグ中の終日予定のDOM要素
     */
    __publicField(this, "_dragging", null);
    /**
     * 終日予定をドラッグ中に、前回ホバーした日付
     */
    __publicField(this, "_draggingPrevDate", null);
    /**
     * 終日予定のドラッグ中の移動量
     */
    __publicField(this, "_draggingCount", 0);
    /**
     * ドラッグ中の終日予定の掴んだ日付
     */
    __publicField(this, "_grabbedDate");
    /**
     * 終日予定の開始位置を掴んでいるかどうか
     */
    __publicField(this, "_grabbedStart", false);
    /**
     * 終日予定の終了位置を掴んでいるかどうか
     */
    __publicField(this, "_grabbedEnd", false);
    /**
     * 終日予定をクリックした時の処理
     */
    __publicField(this, "_onEvent", null);
    /**
     * 終日予定を移動した時の処理
     */
    __publicField(this, "_onMove", null);
    /**
     * プレビューを生成する処理
     */
    __publicField(this, "_onPreview", null);
    this._root = root;
    this._selector = selector;
  }
  /**
   * コールバックを登録する
   */
  registerCallbacks() {
    this._root.addEventListener("mousedown", this._onMouseDown.bind(this));
    this._root.addEventListener("mousemove", this._onMouseMove.bind(this));
    this._root.addEventListener("mouseup", this._onMouseUp.bind(this));
  }
  /**
   * 終日予定の移動を開始
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を開始したかどうか
   */
  _onMouseDown(e) {
    const el = this.pickEvent(e.target);
    if (el) {
      this._grabbedStart = this._grabbedEnd = true;
      if (this.hitHead(e.target)) {
        this._grabbedEnd = false;
      }
      if (this.hitTail(e.target)) {
        this._grabbedStart = false;
      }
      this._grabbedDate = this._selector.pickDateTimeByPosition(e.x, e.y);
      this._dragging = el;
      this.setDragging(this._dragging.dataset.key, true);
      this._draggingPrevDate = null;
      this.updatePreview(this._grabbedDate);
      this.updateCursor();
      this._draggingCount = 0;
      e.stopImmediatePropagation();
    }
  }
  /**
   * 終日予定の移動を終了
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を終了したかどうか
   */
  _onMouseMove(e) {
    if (this._dragging) {
      const date = this._selector.pickDateTimeByPosition(e.x, e.y);
      if (date) {
        this.updatePreview(date);
      }
      this._draggingCount++;
      e.stopImmediatePropagation();
    }
  }
  /**
   * 終日予定の移動を終了
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を終了したかどうか
   */
  _onMouseUp(e) {
    if (this._dragging) {
      const key = this._dragging.dataset.key;
      const date = this._selector.pickDateTimeByPosition(e.x, e.y);
      if (date && this._grabbedDate !== date) {
        const [start, end] = this.getChangedPeriod(date);
        if (this._onMove) {
          this._onMove(key, start, end);
        }
      } else if (this._draggingCount < 3) {
        if (this._onEvent) {
          this._onEvent(key);
        }
      } else {
        if (this._onPreview) {
          this._onPreview(this._dragging, null, null);
        }
        this.setDragging(key, false);
      }
      this._dragging = null;
      this._grabbedStart = this._grabbedEnd = null;
      this.updateCursor();
      e.stopImmediatePropagation();
    }
  }
  /**
   * 選択対象の要素を全て含むセレクタを設定
   * @param selector
   */
  setContainerSelector(selector) {
    this._containerSelector = selector;
    return this;
  }
  /**
   * リサイズ対象の予定のセレクターを設定
   * @param selector
   */
  setEventSelector(selector) {
    this._eventSelector = selector;
    return this;
  }
  /**
   * 頭部分を掴んでいる時のカーソルを設定
   * @param cursor
   */
  setHeadCursor(cursor) {
    this._headCursor = cursor;
    return this;
  }
  /**
   * 末尾部分を掴んでいる時のカーソルを設定
   * @param cursor
   */
  setTailCursor(cursor) {
    this._tailCursor = cursor;
    return this;
  }
  /**
   * 予定をクリックした時の処理を設定
   * @param callback
   */
  onEvent(callback) {
    this._onEvent = callback;
    return this;
  }
  /**
   * 予定を移動した時の処理を設定
   * @param callback
   */
  onMove(callback) {
    this._onMove = callback;
    return this;
  }
  /**
   * プレビューを生成する処理を設定
   * @param callback
   */
  onPreview(callback) {
    this._onPreview = callback;
    return this;
  }
  /**
   * ドラッグ中かどうか
   * @returns {boolean} ドラッグ中かどうか
   */
  isDragging() {
    return this._dragging !== null;
  }
  /**
   * 掴んだ日付を取得
   */
  getGrabbedDate() {
    return this._grabbedDate;
  }
  /**
   * 予定を取得
   * @param el {HTMLElement} DOM要素
   * @returns {null|HTMLElement} 予定のDOM要素またはnull
   */
  pickEvent(el) {
    return this._root.contains(el) && el.closest(this._containerSelector) ? el.closest(this._eventSelector) : null;
  }
  /**
   * 終日予定の先頭部分に当たったかどうか
   * @param el {HTMLElement} 判定する要素
   * @returns {boolean} 先頭部分に当たったかどうか
   */
  hitHead(el) {
    return !!el.closest(".gc-head");
  }
  /**
   * 終日予定の末尾部分に当たったかどうか
   * @param el {HTMLElement} 判定する要素
   * @returns {boolean} 末尾部分に当たったかどうか
   */
  hitTail(el) {
    return !!el.closest(".gc-tail");
  }
  /**
   * ドラッグ中のクラスを設定する
   */
  setDragging(key, dragging) {
    this._root.querySelectorAll(this._eventSelector + '[data-key="' + key + '"]').forEach((el) => {
      if (dragging) {
        el.classList.add("gc-dragging");
      } else {
        el.classList.remove("gc-dragging");
      }
    });
  }
  /**
   * 変更後の終日予定の期間を取得する
   * @param date {string} マウスの位置の日付
   * @returns {Array} 変更後の終日予定の期間
   */
  getChangedPeriod(date) {
    const diff = DateUtils.diffInMilliseconds(this._grabbedDate, date);
    let start = DateUtils.toDateTimeString(Date.parse(this._dragging.dataset.start) + (this._grabbedStart ? diff : 0));
    let end = DateUtils.toDateTimeString(Date.parse(this._dragging.dataset.end) + (this._grabbedEnd ? diff : 0));
    start = start.substring(0, this._grabbedDate.length);
    end = end.substring(0, this._grabbedDate.length);
    if (start > end) {
      if (this._grabbedStart) {
        start = end;
      }
      if (this._grabbedEnd) {
        end = start;
      }
    }
    return [start, end];
  }
  /**
   * 終日予定をドラッグ中のカーソルを更新する
   */
  updateCursor() {
    this._root.classList.remove(this._headCursor, this._tailCursor);
    if (this._grabbedStart && this._grabbedEnd) {
      this._root.classList.add("gc-cursor-move");
    } else if (this._grabbedStart) {
      this._root.classList.add(this._headCursor);
    } else if (this._grabbedEnd) {
      this._root.classList.add(this._tailCursor);
    }
  }
  /**
   * ドラッグ中の終日予定のプレビューを更新する
   * @param date {string} マウスの位置の日付
   */
  updatePreview(date) {
    if (this._draggingPrevDate !== date) {
      const [start, end] = this.getChangedPeriod(date);
      if (this._onPreview) {
        this._onPreview(this._dragging, start, end);
      }
      this._draggingPrevDate = date;
    }
  }
};

// resources/js/modules/AllDayEvent.ts
var AllDayEvent = class {
  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   * @param dateSelector
   */
  constructor(root, dateSelector) {
    /**
     * ルート要素
     * @private
     */
    __publicField(this, "_root");
    /**
     * 選択対象の要素を全て含むセレクタ
     * @private
     */
    __publicField(this, "_containerSelector", null);
    /**
     * 日付セレクター
     */
    __publicField(this, "_dateSelector", null);
    /**
     * リサイザー
     */
    __publicField(this, "_resizer", null);
    /**
     * ホバー中の終日予定の要素
     */
    __publicField(this, "_hover", null);
    /**
     * 終日予定をクリックした時の処理
     */
    __publicField(this, "_onEvent", null);
    /**
     * 終日予定を移動した時の処理
     */
    __publicField(this, "_onMove", null);
    this._root = root;
    this._dateSelector = dateSelector;
    this.init();
  }
  /**
   * 初期化
   */
  init() {
    this._resizer = new Resizer(this._root, this._dateSelector).setEventSelector(".gc-all-day-event-container").setHeadCursor("gc-cursor-w-resize").setTailCursor("gc-cursor-e-resize").onEvent((key) => {
      if (this._onEvent) {
        this._onEvent(key);
      }
    }).onMove((key, start, end) => {
      if (this._onMove) {
        this._onMove(key, start, end);
      }
    }).onPreview((el, start, end) => {
      this.removePreview();
      if (start && end) {
        this.createPreview(el, start, end);
      }
    });
  }
  /**
   * コールバックを登録
   */
  registerCallbacks() {
    this._resizer.registerCallbacks();
    this._root.addEventListener("mouseover", this._onMouseOver.bind(this));
  }
  /**
   * 終日イベントのマウスホバー処理
   * @param e {Event} イベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  _onMouseOver(e) {
    if (this._resizer.isDragging()) {
      return;
    }
    const el = this.pickAllDayEvent(e.target, true);
    const key = el ? el.dataset.key : null;
    if (key !== this._hover) {
      this.setHoverAllDayEvent(this._hover, false);
      this.setHoverAllDayEvent(this._hover = key, true);
    }
  }
  /**
   * 選択対象の要素を全て含むセレクタを設定する。
   * @param containerSelector
   */
  setContainerSelector(containerSelector) {
    this._resizer.setContainerSelector(containerSelector);
    this._containerSelector = containerSelector;
    return this;
  }
  /**
   * 終日予定をクリックした時の処理を設定
   * @param callback {Function} コールバック
   * @returns {AllDayEvent} 自身
   */
  onEvent(callback) {
    this._onEvent = callback;
    return this;
  }
  /**
   * 終日予定を移動した時の処理を設定
   * @param callback {Function} コールバック
   * @returns {AllDayEvent} 自身
   */
  onMove(callback) {
    this._onMove = callback;
    return this;
  }
  /**
   * 終日予定を取得
   * @param el {HTMLElement} DOM要素
   * @param withoutPopup {boolean} ポップアップを除外するかどうか
   * @returns {null|HTMLElement} 予定のDOM要素またはnull
   */
  pickAllDayEvent(el, withoutPopup = false) {
    return this._root.contains(el) && el.closest(this._containerSelector + (withoutPopup ? "" : ", .gc-day-grid-popup")) ? el.closest(".gc-all-day-event-container") : null;
  }
  /**
   * 指定された終日予定のホバーを設定する
   * @param key {string} 終日予定のキー
   * @param hover {boolean} ホバーするかどうか
   */
  setHoverAllDayEvent(key, hover) {
    if (key) {
      this._root.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]').forEach((el) => {
        if (hover) {
          el.classList.add("gc-hover");
        } else {
          el.classList.remove("gc-hover");
        }
      });
    }
  }
  /**
   * ドラッグ中の終日予定のプレビューを表示
   * @param elEvent {HTMLElement} 予定のDOM要素
   * @param eventStart {string} 予定の開始日
   * @param eventEnd {string} 予定の終了日
   */
  createPreview(elEvent, eventStart, eventEnd) {
    Array.from(this._root.querySelectorAll(".gc-week, .gc-all-day-section")).forEach((elWeek) => {
      const [weekStart, weekEnd] = this.getWeekPeriod(elWeek);
      if (weekStart && weekEnd) {
        const [periodStart, periodEnd] = DateUtils.overlapPeriod(eventStart, eventEnd, weekStart, weekEnd);
        if (periodStart && periodEnd) {
          const elPreview = elWeek.querySelector('.gc-day[data-date="' + periodStart + '"] .gc-all-day-event-preview');
          if (weekStart <= this._resizer.getGrabbedDate() && this._resizer.getGrabbedDate() <= weekEnd) {
            this.addEmptyAllDayEvents(elPreview, this.getIndexInParent(elEvent));
          }
          const el = elEvent.cloneNode(true);
          const days = DateUtils.diffDays(periodStart, periodEnd) + 1;
          this.adjustPreview(el, days, periodStart === eventStart, periodEnd === eventEnd);
          elPreview.appendChild(el);
        }
      }
    });
  }
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
  }
  /**
   * ドラッグ中の終日予定をプレビューに合わせる
   * @param el {HTMLElement} 予定のDOM要素
   * @param days {number} ドラッグ中の終日予定の日数
   * @param isStart {boolean} 週内に開始するかどうか
   * @param isEnd {boolean} 週内に終了するかどうか
   */
  adjustPreview(el, days, isStart, isEnd) {
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
  }
  /**
   * 指定したDOM要素が兄弟の中で何番目かを取得
   * @param el {HTMLElement} DOM要素
   * @returns {number} インデックス
   */
  getIndexInParent(el) {
    return Array.from(el.parentNode.children).indexOf(el);
  }
  /**
   * 指定した数だけ空の終日予定を追加する
   */
  addEmptyAllDayEvents(elPreview, count) {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.classList.add("gc-all-day-event-container");
      elPreview.appendChild(el);
    }
  }
  /**
   * 終日予定のプレビューを削除
   */
  removePreview() {
    Array.from(this._root.querySelectorAll(".gc-all-day-event-preview")).forEach((el) => el.parentNode.replaceChild(el.cloneNode(false), el));
  }
};

// resources/js/modules/DayGridTimedEvent.ts
var DayGridTimedEvent = class {
  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   * @param dateSelector
   * @param alpine
   */
  constructor(root, dateSelector, alpine) {
    /**
     * ルート要素
     * @private
     */
    __publicField(this, "_root");
    /**
     * 日付のセレクター
     */
    __publicField(this, "_dateSelector");
    /**
     * Alpine.jsのインスタンス
     */
    __publicField(this, "_alpine");
    /**
     * ドラッグ中の時間指定の予定のDOM要素
     */
    __publicField(this, "_dragging", null);
    /**
     * 予定をクリックした時の処理
     */
    __publicField(this, "_onEvent");
    /**
     * 予定を移動した時の処理
     */
    __publicField(this, "_onMove");
    this._root = root;
    this._dateSelector = dateSelector;
    this._alpine = alpine;
  }
  /**
   * コールバックを登録する
   */
  registerCallbacks() {
    this._root.addEventListener("click", this._onClick.bind(this));
    this._root.addEventListener("mousedown", this._onMouseDown.bind(this));
    this._root.addEventListener("dragstart", this._onDragStart.bind(this));
    this._root.addEventListener("dragover", this._onDragOver.bind(this));
    this._root.addEventListener("drop", this._onDrop.bind(this));
    this._root.addEventListener("dragend", this._onDragEnd.bind(this));
  }
  /**
   * 予定をクリックした時の処理
   *
   * @param onEvent {Function} クリックイベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  onEvent(onEvent) {
    this._onEvent = onEvent;
    return this;
  }
  /**
   * 予定を移動した時の処理
   *
   * @param onMove {Function} 予定を移動した時の処理
   * @returns {DayGridTimedEvent} インスタンス
   */
  onMove(onMove) {
    this._onMove = onMove;
    return this;
  }
  /**
   * クリックイベント
   *
   * @param e {MouseEvent} クリックイベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  _onClick(e) {
    const key = this.pickEvent(e.target)?.dataset.key;
    if (key) {
      if (this._onEvent) {
        this._onEvent(key);
      }
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスを押した時の処理
   * @param e
   * @private
   */
  _onMouseDown(e) {
    if (this.pickEvent(e.target)) {
      e.stopImmediatePropagation();
    }
  }
  /**
   * ドラッグイベント
   * @param e {DragEvent} イベント
   */
  _onDragStart(e) {
    const el = this.pickEvent(e.target);
    if (el) {
      this._dragging = el;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", el.dataset.key);
      this._alpine.$nextTick(() => {
        this.addDraggingClass();
      });
    }
  }
  /**
   * ドラッグ中の要素が要素に乗った時のイベント
   * @param e {DragEvent} イベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  _onDragOver(e) {
    const date = this._dateSelector.pickDateTimeByPosition(e.x, e.y);
    if (date) {
      this._dateSelector.select(date);
      e.preventDefault();
    }
  }
  /**
   * ドロップイベント
   * @param e {DragEvent} イベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  _onDrop(e) {
    const date = this._dateSelector.pickDateTimeByPosition(e.x, e.y);
    const key = e.dataTransfer.getData("text/plain");
    if (date) {
      const days = DateUtils.diffDays(this._dragging.dataset.start, date);
      if (days !== 0) {
        const start = DateUtils.toDateTimeString(DateUtils.addDays(this._dragging.dataset.start, days));
        const end = DateUtils.toDateTimeString(DateUtils.addDays(this._dragging.dataset.end, days));
        this._dragging = null;
        if (this._onMove) {
          this._onMove(key, start, end);
        }
      }
    }
  }
  /**
   * ドラッグ中の要素が要素から外れた時のイベント
   * @param e {DragEvent} イベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  _onDragEnd(e) {
    this._dateSelector.deselect();
    if (this._dragging) {
      this._dragging.classList.remove("gc-dragging");
      this._dragging = null;
    }
  }
  /**
   * 指定したDOM要素の近くの予定のキーを取得
   * @param el {HTMLElement} DOM要素
   * @returns {HTMLElement} 予定のDOM要素
   */
  pickEvent(el) {
    return this._root.contains(el) && el.closest(".gc-day-grid, .gc-day-grid-popup") ? el.closest(".gc-timed-event-container") : null;
  }
  /**
   * ドラッグ中の要素をドラッグ中の状態にする
   *
   * @returns {void}
   */
  addDraggingClass() {
    if (this._dragging) {
      this._dragging.classList.add("gc-dragging");
    }
  }
};

// resources/js/day-grid.js
function dayGrid(componentParameters) {
  return {
    /**
     * 表示件数を制限するコンポーネント
     */
    dayGridLimit: DayGridLimit,
    /**
     * ポップアップに関するコンポーネント
     */
    dayGridPopup: DayGridPopup,
    /**
     * 日付のセレクター
     */
    dateSelector: DateTimeSelector,
    /**
     * 時間指定の予定に関する処理
     */
    timedEvent: DayGridTimedEvent,
    /**
     * 終日の予定に関する処理
     */
    allDayEvent: AllDayEvent,
    /**
     * カレンダーの初期化
     */
    init() {
      this.dayGridPopup = new DayGridPopup(this.$el);
      this.dayGridLimit = new DayGridLimit(this.$el).setLocalizedRemainingText(componentParameters.remaining).onRemainingTextClick((elDay) => this.dayGridPopup.open(elDay));
      this.dateSelector = new DateTimeSelector(this.$el).setContainerSelector(".gc-day-grid").setElementSelector(".gc-day").setPropertyName("date").onSelect((start, end) => {
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59");
      });
      this.allDayEvent = new AllDayEvent(this.$el, this.dateSelector).setContainerSelector(".gc-day-grid").onMove((key, start, end) => {
        this.$wire.onMove(key, start, end);
      }).onEvent((key) => {
        this.$wire.onEvent(key);
      });
      this.timedEvent = new DayGridTimedEvent(this.$el, this.dateSelector, this).onEvent((key) => {
        this.$wire.onEvent(key);
      }).onMove((key, start, end) => {
        this.$wire.onMove(key, start, end);
      });
      this.dayGridPopup.registerCallbacks();
      this.allDayEvent.registerCallbacks();
      this.timedEvent.registerCallbacks();
      this.dateSelector.registerCallbacks();
      Livewire.on("refreshCalendar", () => {
        this.$nextTick(() => this.dayGridLimit.updateLayout(true));
      });
    }
  };
}
export {
  dayGrid as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF5R3JpZExpbWl0LnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL0RhdGVUaW1lU2VsZWN0b3IudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF5R3JpZFBvcHVwLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL0RhdGVVdGlscy50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9SZXNpemVyLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL0FsbERheUV2ZW50LnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL0RheUdyaWRUaW1lZEV2ZW50LnRzIiwgIi4uL3Jlc291cmNlcy9qcy9kYXktZ3JpZC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF5R3JpZExpbWl0IHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXHUzMDZFXHUzMEFEXHUzMEUzXHUzMEMzXHUzMEI3XHUzMEU1XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF92aXNpYmxlQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2RheVRvcEhlaWdodDogbnVtYmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1RkYxMVx1NEVGNlx1OEZCQVx1MzA4QVx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZXZlbnRIZWlnaHQ6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwNkVcdTg4NjhcdTc5M0FcdTMwQzZcdTMwQURcdTMwQjlcdTMwQzhcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2xvY2FsaXplZFJlbWFpbmluZ1RleHQ6IHN0cmluZyA9ICcrIDpjb3VudCBtb3JlJztcblxuICAgIC8qKlxuICAgICAqIFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uUmVtYWluaW5nVGV4dENsaWNrOiAoZWxEYXk6IEhUTUxFbGVtZW50KSA9PiB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IERBWV9TRUxFQ1RPUiA9ICcuZ2MtZGF5cyAuZ2MtZGF5JztcblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NEUwQVx1OTBFOFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBEQVlfVE9QX1NFTEVDVE9SID0gJy5nYy1kYXktdG9wJztcblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIC5nYy1hbGwtZGF5LWV2ZW50c1x1MzA2Qlx1MzA2Rlx1MzAwMVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzA2Qlx1MzA2MFx1MzA1MVx1MzBDN1x1MzBGQ1x1MzBCRlx1MzA0Q1x1NTE2NVx1MzA2M1x1MzA2Nlx1MzA0NFx1MzA4Qlx1MzA2RVx1MzA2MFx1MzA0Q1x1MzAwMVxuICAgICAqIC5nYy10aW1lZC1ldmVudHNcdTMwNkJcdTMwNkZcdTMwMDFcdTUxNjhcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTU0MkJcdTMwODFcdTMwNjZcdTMwMDFcdTUxNjhcdTMwNjZcdTMwNkVcdTY1RTVcdTMwNkJcdTMwQzdcdTMwRkNcdTMwQkZcdTMwNENcdTUxNjVcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTMwMDJcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgQU5ZX0VWRU5UX1NFTEVDVE9SID0gJy5nYy10aW1lZC1ldmVudHMgPiAuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyLCAuZ2MtdGltZWQtZXZlbnRzID4gLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJztcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgKi9cbiAgICBwdWJsaWMgaW5pdCgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMYXlvdXQoKVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fb25SZXNpemUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA2RVx1ODg2OFx1NzkzQVx1MzBDNlx1MzBBRFx1MzBCOVx1MzBDOFx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBsb2NhbGl6ZWRSZW1haW5pbmdUZXh0XG4gICAgICovXG4gICAgcHVibGljIHNldExvY2FsaXplZFJlbWFpbmluZ1RleHQobG9jYWxpemVkUmVtYWluaW5nVGV4dDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2xvY2FsaXplZFJlbWFpbmluZ1RleHQgPSBsb2NhbGl6ZWRSZW1haW5pbmdUZXh0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gb25SZW1haW5pbmdUZXh0Q2xpY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25SZW1haW5pbmdUZXh0Q2xpY2sob25SZW1haW5pbmdUZXh0Q2xpY2s6IChlbERheTogSFRNTEVsZW1lbnQpID0+IHZvaWQpIHtcbiAgICAgICAgdGhpcy5fb25SZW1haW5pbmdUZXh0Q2xpY2sgPSBvblJlbWFpbmluZ1RleHRDbGljaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEJBXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25SZXNpemUoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTGF5b3V0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSZW1haW5pbmdUZXh0RWxlbWVudChlLnRhcmdldCBhcyBFbGVtZW50KSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX29uUmVtYWluaW5nVGV4dENsaWNrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25SZW1haW5pbmdUZXh0Q2xpY2sodGhpcy5waWNrRGF5KGUudGFyZ2V0IGFzIEVsZW1lbnQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTYyQkNcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uTW91c2VEb3duKGU6IE1vdXNlRXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSZW1haW5pbmdUZXh0RWxlbWVudChlLnRhcmdldCBhcyBFbGVtZW50KSkge1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFx1MzA5Mlx1NTE4RFx1OEEwOFx1N0I5N1xuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZm9yY2UgXHU1RjM3XHU1MjM2XHU3Njg0XHUzMDZCXHU1MThEXHU4QTA4XHU3Qjk3XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVMYXlvdXQoZm9yY2U6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICBjb25zdCB2aXNpYmxlQ291bnQgPSB0aGlzLmdldFZpc2libGVDb3VudCgpO1xuICAgICAgICBpZiAodGhpcy5fdmlzaWJsZUNvdW50ICE9PSB2aXNpYmxlQ291bnQgfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIHRoaXMuX3Zpc2libGVDb3VudCA9IHZpc2libGVDb3VudDtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbChEYXlHcmlkTGltaXQuREFZX1NFTEVDVE9SKS5mb3JFYWNoKGRheSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVEYXkoZGF5IGFzIEhUTUxFbGVtZW50LCB2aXNpYmxlQ291bnQpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1ODg2OFx1NzkzQVx1MzA1OVx1MzA4Qlx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1NjZGNFx1NjVCMFxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSB2aXNpYmxlQ291bnQge251bWJlcn0gXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGVEYXkoZWxEYXk6IEhUTUxFbGVtZW50LCB2aXNpYmxlQ291bnQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCBldmVudENvdW50ID0gdGhpcy5nZXRFdmVudENvdW50KGVsRGF5KTtcbiAgICAgICAgY29uc3QgbGltaXRDb3VudCA9IGV2ZW50Q291bnQgPCB2aXNpYmxlQ291bnQgPyBldmVudENvdW50IDogdmlzaWJsZUNvdW50IC0gMTtcbiAgICAgICAgY29uc3QgcmVtYWluaW5nQ291bnQgPSBldmVudENvdW50IC0gbGltaXRDb3VudDtcbiAgICAgICAgdGhpcy5zZXRUaW1lZEV2ZW50c0hlaWdodChlbERheSwgdGhpcy5nZXRFdmVudEhlaWdodCgpICogbGltaXRDb3VudCk7XG4gICAgICAgIHRoaXMubGltaXRBbGxEYXlFdmVudHMoZWxEYXksIGxpbWl0Q291bnQgLSAocmVtYWluaW5nQ291bnQgPyAxIDogMCkpO1xuICAgICAgICB0aGlzLnNldFJlbWFpbmluZ0NvdW50KGVsRGF5LCByZW1haW5pbmdDb3VudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU0RTg4XHU1QjlBXHU2NTcwXG4gICAgICovXG4gICAgcHVibGljIGdldEV2ZW50Q291bnQoZWxEYXk6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIGVsRGF5LnF1ZXJ5U2VsZWN0b3JBbGwoRGF5R3JpZExpbWl0LkFOWV9FVkVOVF9TRUxFQ1RPUikubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RXZlbnRIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50SGVpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudEhlaWdodCA9IHRoaXMuZ2V0RWxlbWVudEhlaWdodChEYXlHcmlkTGltaXQuQU5ZX0VWRU5UX1NFTEVDVE9SKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fZXZlbnRIZWlnaHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XG4gICAgICogQHBhcmFtIGhlaWdodCB7bnVtYmVyfSBcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldFRpbWVkRXZlbnRzSGVpZ2h0KGVsRGF5OiBIVE1MRWxlbWVudCwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgKGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy10aW1lZC1ldmVudHMnKSBhcyBIVE1MRWxlbWVudCkuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4JztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldERheUhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50SGVpZ2h0KERheUdyaWRMaW1pdC5EQVlfU0VMRUNUT1IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NTQwNFx1NjVFNVx1MzA2RVx1NjVFNVx1NEVEOFx1ODg2OFx1NzkzQVx1MzA2RVx1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NEVEOFx1ODg2OFx1NzkzQVx1MzA2RVx1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RGF5VG9wSGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9kYXlUb3BIZWlnaHQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX2RheVRvcEhlaWdodCA9IHRoaXMuZ2V0RWxlbWVudEhlaWdodChEYXlHcmlkTGltaXQuREFZX1RPUF9TRUxFQ1RPUik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RheVRvcEhlaWdodFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1Rlx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RWxlbWVudEhlaWdodChzZWxlY3Rvcjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIGFzIEhUTUxFbGVtZW50KS5vZmZzZXRIZWlnaHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU1NDA0XHU2NUU1XHUzMDZFXHU2NzJDXHU0RjUzXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NzJDXHU0RjUzXHU5MEU4XHU1MjA2XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXREYXlCb2R5SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldERheUhlaWdodCgpIC0gdGhpcy5nZXREYXlUb3BIZWlnaHQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTg4NjhcdTc5M0FcdTMwNjdcdTMwNERcdTMwOEJcdTY1NzBcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTg4NjhcdTc5M0FcdTMwNjdcdTMwNERcdTMwOEJcdTY1NzBcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFZpc2libGVDb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih0aGlzLmdldERheUJvZHlIZWlnaHQoKSAvIHRoaXMuZ2V0RXZlbnRIZWlnaHQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEZCXHU5NzVFXHU4ODY4XHU3OTNBXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIGxpbWl0IHtudW1iZXJ9IFx1ODg2OFx1NzkzQVx1NTNFRlx1ODBGRFx1MzA2QVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgbGltaXRBbGxEYXlFdmVudHMoZWxEYXk6IEhUTUxFbGVtZW50LCBsaW1pdDogbnVtYmVyKSB7XG4gICAgICAgIGVsRGF5XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWxFdmVudCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPD0gbGltaXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWxFdmVudC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsRXZlbnQuY2xhc3NMaXN0LmFkZCgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gcmVtYWluaW5nQ291bnQge251bWJlcn0gXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRSZW1haW5pbmdDb3VudChlbERheTogSFRNTEVsZW1lbnQsIHJlbWFpbmluZ0NvdW50OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZWxSZW1haW5pbmcgPSBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtcmVtYWluaW5nLWNvbnRhaW5lcicpO1xuICAgICAgICBpZiAocmVtYWluaW5nQ291bnQgPiAwKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBlbFJlbWFpbmluZy5jaGlsZHJlblswXS5pbm5lclRleHQgPSB0aGlzLm1ha2VSZW1haW5pbmdUZXh0KHJlbWFpbmluZ0NvdW50KTtcbiAgICAgICAgICAgIGVsUmVtYWluaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxSZW1haW5pbmcuY2xhc3NMaXN0LmFkZCgnZ2MtaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwNkVcdTg4NjhcdTc5M0FcdTMwQzZcdTMwQURcdTMwQjlcdTMwQzhcdTMwOTJcdTRGNUNcdTYyMTBcbiAgICAgKiBAcGFyYW0gcmVtYWluaW5nQ291bnQge251bWJlcn0gXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEM2XHUzMEFEXHUzMEI5XHUzMEM4XG4gICAgICovXG4gICAgcHJpdmF0ZSBtYWtlUmVtYWluaW5nVGV4dChyZW1haW5pbmdDb3VudDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvY2FsaXplZFJlbWFpbmluZ1RleHQucmVwbGFjZSgnOmNvdW50JywgU3RyaW5nKHJlbWFpbmluZ0NvdW50KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtFbGVtZW50fSBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJpdmF0ZSBpc1JlbWFpbmluZ1RleHRFbGVtZW50KGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtcmVtYWluaW5nLWNvbnRhaW5lcicpICYmIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7RWxlbWVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcml2YXRlIHBpY2tEYXkoZWw6IEVsZW1lbnQpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiBlbC5jbG9zZXN0KCcuZ2MtZGF5JykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgfVxufSIsICIvKipcbiAqIERhdGVUaW1lU2VsZWN0b3JcbiAqXG4gKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwNkVcdTkwNzhcdTYyOUVcdTZBNUZcdTgwRkRcdTMwOTJcdTYzRDBcdTRGOUJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkJcdTMwMDFcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTY0Q0RcdTRGNUNcdTMwNkJcdTMwODhcdTMwOEJcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTYzMDdcdTVCOUFcdTMwOTJcdTg4NENcdTMwNDZcdTMwMDJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0ZVRpbWVTZWxlY3RvciB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2VsZW1lbnRTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA5Mlx1NjMwMVx1MzA2NFx1MzBEN1x1MzBFRFx1MzBEMVx1MzBDNlx1MzBBM1x1NTQwRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcHJvcGVydHlOYW1lOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3Rpb25TdGFydDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2VsZWN0aW9uRW5kOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDRDXHU1OTA5XHU2NkY0XHUzMDU1XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vblNlbGVjdDogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9tb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fbW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9tb3VzZVVwLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBjb250YWluZXJTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcjogc3RyaW5nKTogRGF0ZVRpbWVTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbGVtZW50U2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RWxlbWVudFNlbGVjdG9yKGVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nKTogRGF0ZVRpbWVTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRTZWxlY3RvciA9IGVsZW1lbnRTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyKGRhdGEtZGF0ZVx1MzA2QVx1MzA4OVx1MzAwMWRhdGUpXG4gICAgICogQHBhcmFtIHByb3BlcnR5TmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eU5hbWUocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBEYXRlVGltZVNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fcHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNENcdTU5MDlcdTY2RjRcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gb25TZWxlY3RcbiAgICAgKi9cbiAgICBwdWJsaWMgb25TZWxlY3Qob25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IERhdGVUaW1lU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9vblNlbGVjdCA9IG9uU2VsZWN0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gZGF0ZVRpbWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHNlbGVjdChkYXRlVGltZTogc3RyaW5nKTogRGF0ZVRpbWVTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGlvblN0YXJ0ID0gdGhpcy5fc2VsZWN0aW9uRW5kID0gZGF0ZVRpbWU7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBkYXRlVGltZSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2VsZWN0RW5kKGRhdGVUaW1lOiBzdHJpbmcpOiBEYXRlVGltZVNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uRW5kID0gZGF0ZVRpbWU7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1ODlFM1x1OTY2NFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3QobnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2VsZWN0aW9uKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLl9zZWxlY3Rpb25TdGFydCwgdGhpcy5fc2VsZWN0aW9uRW5kXS5zb3J0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3M0ZFXHU1NzI4XHUzMDAxXHU5MDc4XHU2MjlFXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25TdGFydCAhPT0gbnVsbCAmJiB0aGlzLl9zZWxlY3Rpb25FbmQgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU2MkJDXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBkYXRlVGltZSA9IHRoaXMucGlja0RhdGVUaW1lKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgaWYgKGRhdGVUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdChkYXRlVGltZSk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU1MkQ1XHUzMDRCXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBkYXRlVGltZSA9IHRoaXMucGlja0RhdGVUaW1lQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgIGlmIChkYXRlVGltZSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RFbmQoZGF0ZVRpbWUpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1OTZFMlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbW91c2VVcChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZVRpbWUgPSB0aGlzLnBpY2tEYXRlVGltZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICAgICAgaWYgKGRhdGVUaW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uU2VsZWN0KHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHUzMDAxXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIGVsIFx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrRGF0ZVRpbWUoZWw6IEVsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCh0aGlzLl9lbGVtZW50U2VsZWN0b3IgKyAnOm5vdCguZGlzYWJsZWQpJykgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgID8uZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU1RUE3XHU2QTE5XHUzMDRCXHUzMDg5XHUzMDAxXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIHggWFx1NUVBN1x1NkExOVxuICAgICAqIEBwYXJhbSB5IFlcdTVFQTdcdTZBMTlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgcGlja0RhdGVUaW1lQnlQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgJyAnICsgdGhpcy5fZWxlbWVudFNlbGVjdG9yKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGVsOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdC5sZWZ0IDw9IHggJiYgeCA8PSByZWN0LnJpZ2h0ICYmIHJlY3QudG9wIDw9IHkgJiYgeSA8PSByZWN0LmJvdHRvbTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYXQoMCk/LmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gZGF0ZVRpbWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBcdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RWxlbWVudEJ5RGF0ZVRpbWUoZGF0ZVRpbWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3Rvcih0aGlzLl9jb250YWluZXJTZWxlY3RvciArICcgJyArIHRoaXMuX2VsZW1lbnRTZWxlY3RvciArXG4gICAgICAgICAgICAnW2RhdGEtJyArIHRoaXMuX3Byb3BlcnR5TmFtZSArICc9XCInICsgZGF0ZVRpbWUgKyAnXCJdJ1xuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1MzA2RVx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlKCkge1xuICAgICAgICBsZXQgW2JlZ2luLCBlbmRdID0gW3RoaXMuX3NlbGVjdGlvblN0YXJ0LCB0aGlzLl9zZWxlY3Rpb25FbmRdLnNvcnQoKTtcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgJyAnICsgdGhpcy5fZWxlbWVudFNlbGVjdG9yKVxuICAgICAgICAgICAgLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRlVGltZSA9IGVsLmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgICAgIGlmIChiZWdpbiA8PSBkYXRlVGltZSAmJiBkYXRlVGltZSA8PSBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59IiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERheUdyaWRQb3B1cCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCOVx1MzBDQVx1MzBGQ1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTU4Qlx1MzA0RlxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHB1YmxpYyBvcGVuKGVsRGF5OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmJ1aWxkUG9wdXAoZWxEYXkpO1xuICAgICAgICB0aGlzLmxheW91dFBvcHVwKGVsRGF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk1ODlcdTMwNThcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuZmluZFBvcHVwRWxlbWVudCgpLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBmaW5kUG9wdXBFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvcignLmdjLWRheS1ncmlkLXBvcHVwJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU2OUNCXHU3QkM5XG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBidWlsZFBvcHVwKGVsRGF5OiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBET01cdTMwOTJcdTY5Q0JcdTdCQzlcbiAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuZmluZFBvcHVwRWxlbWVudCgpO1xuICAgICAgICBjb25zdCBlbERheUJvZHkgPSBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWJvZHknKS5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGVsRGF5Qm9keU9yaWcgPSBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktYm9keScpO1xuICAgICAgICB0aGlzLnJlcGxhY2VBbGxEYXlFdmVudHMoZWxEYXlCb2R5LCB0aGlzLmdldEFsbERheUV2ZW50S2V5cyhlbERheUJvZHkpKTtcbiAgICAgICAgZWxEYXlCb2R5T3JpZy5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbERheUJvZHksIGVsRGF5Qm9keU9yaWcpO1xuICAgICAgICB0aGlzLmFkanVzdFBvcHVwKGVsUG9wdXApO1xuXG4gICAgICAgIC8vIFx1NjVFNVx1NEVEOFx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAoZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF0ZScpIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHRcbiAgICAgICAgICAgID0gKGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXRlJykgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVrZXlcdTMwOTJcdTUxNjhcdTMwNjZcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEFsbERheUV2ZW50S2V5cyhlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleV0nKSlcbiAgICAgICAgICAgIC5tYXAoKGVsOiBIVE1MRWxlbWVudCkgPT4gZWwuZGF0YXNldC5rZXkpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXk6IHN0cmluZykgPT4ga2V5ICE9PSAnJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEI5XHUzMERBXHUzMEZDXHUzMEI1XHUzMEZDXHUzMDkyXHU1MTY4XHUzMDY2XHU1MjRBXHU5NjY0XG4gICAgICogQHBhcmFtIGVsRGF5Qm9keSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBrZXlzIHtBcnJheX0gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFa2V5XG4gICAgICovXG4gICAgcHJpdmF0ZSByZXBsYWNlQWxsRGF5RXZlbnRzKGVsRGF5Qm9keTogSFRNTEVsZW1lbnQsIGtleXM6IEFycmF5PGFueT4pIHtcbiAgICAgICAgLy8gXHU2NUUyXHUzMDZCXHU1MTY1XHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1MjRBXHU5NjY0XHUzMDU5XHUzMDhCXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbShlbERheUJvZHkucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJykpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWw6IEhUTUxFbGVtZW50KSA9PiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKSk7XG5cbiAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXG4gICAgICAgIGNvbnN0IGVsQWxsRGF5RXZlbnRzID0gZWxEYXlCb2R5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cycpO1xuICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID1cbiAgICAgICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcsICdnYy1lbmQnKTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpO1xuICAgICAgICAgICAgZWxBbGxEYXlFdmVudHMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1NTE4NVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NUZBRVx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBlbFBvcHVwIHtIVE1MRWxlbWVudH0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGp1c3RQb3B1cChlbFBvcHVwOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBcdTg4NjhcdTc5M0FcdTMwNTlcdTMwOEJcbiAgICAgICAgZWxQb3B1cC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKTtcblxuICAgICAgICAvLyBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkVcdTU5MjdcdTMwNERcdTMwNTVcdTMwOTJcdTgxRUFcdTUyRDVcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9IGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXG4gICAgICAgIC8vIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1ODFFQVx1NTJENVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICBjb25zdCBlbFRpbWVkRXZlbnRzID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGVsVGltZWRFdmVudHMuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXG4gICAgICAgIC8vIFx1NEVENlx1MjZBQVx1RkUwRVx1NEVGNlx1MzA5Mlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICBjb25zdCBlbFJlbWFpbmluZyA9IGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLXJlbWFpbmluZy1jb250YWluZXInKTtcbiAgICAgICAgZWxSZW1haW5pbmcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbFJlbWFpbmluZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFXHUzMEVDXHUzMEE0XHUzMEEyXHUzMEE2XHUzMEM4XHUzMDkyXHU2NkY0XHU2NUIwXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBsYXlvdXRQb3B1cChlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuZmluZFBvcHVwRWxlbWVudCgpO1xuICAgICAgICBjb25zdCByZWN0UG9wdXAgPSBlbFBvcHVwLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCByZWN0RGF5ID0gZWxEYXkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCB4ID0gcmVjdERheS5sZWZ0IC0gMSArIHdpbmRvdy5zY3JvbGxYO1xuICAgICAgICBsZXQgeSA9IHJlY3REYXkudG9wIC0gMSArIHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICBsZXQgdyA9IE1hdGgubWF4KHJlY3REYXkud2lkdGggKiAxLjEsIHJlY3RQb3B1cC53aWR0aCk7XG4gICAgICAgIGxldCBoID0gTWF0aC5tYXgocmVjdERheS5oZWlnaHQsIHJlY3RQb3B1cC5oZWlnaHQpO1xuICAgICAgICBpZiAoeCArIHcgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xuICAgICAgICAgICAgeCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gdztcbiAgICAgICAgfVxuICAgICAgICBpZiAoeSArIGggPiB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBoO1xuICAgICAgICB9XG4gICAgICAgIGVsUG9wdXAuc3R5bGUubGVmdCA9IHggKyAncHgnO1xuICAgICAgICBlbFBvcHVwLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuICAgICAgICBlbFBvcHVwLnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgICAgIGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gaCArICdweCc7XG4gICAgfVxufSIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRlVXRpbHMge1xuICAgIC8qKlxuICAgICAqIDFcdTY1RTVcdTMwNkVcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgTUlMTElTRUNPTkRTX1BFUl9EQVkgPSAyNCAqIDYwICogNjAgKiAxMDAwXG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVN0cmluZyhkOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gKG5ldyBEYXRlKGQpKS50b0xvY2FsZURhdGVTdHJpbmcoJ3N2LVNFJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTY2NDJcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVRpbWVTdHJpbmcoZCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBEYXRlVXRpbHMudG9EYXRlU3RyaW5nKGQpICsgJyAnICsgKG5ldyBEYXRlKGQpKS50b0xvY2FsZVRpbWVTdHJpbmcoXCJlbi1HQlwiKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2Qlx1NjVFNVx1NjU3MFx1MzA5Mlx1NTJBMFx1N0I5N1xuICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICAgICAqIEBwYXJhbSBkYXlzIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NTJBMFx1N0I5N1x1NUY4Q1x1MzA2RVx1NjVFNVx1NEVEOChcdTMwREZcdTMwRUFcdTc5RDIpXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhZGREYXlzKGRhdGU6IHN0cmluZywgZGF5czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZSkgKyBkYXlzICogRGF0ZVV0aWxzLk1JTExJU0VDT05EU19QRVJfREFZXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMDY4XHU2NUU1XHU0RUQ4XHUzMDZFXHU1REVFXHUzMDZFXHU2NUU1XHU2NTcwXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICogQHBhcmFtIGRhdGUxIHtzdHJpbmd9IFx1NjVFNVx1NEVEODFcbiAgICAgKiBAcGFyYW0gZGF0ZTIge3N0cmluZ30gXHU2NUU1XHU0RUQ4MlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGlmZkRheXMoZGF0ZTE6IHN0cmluZywgZGF0ZTI6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGxldCBkMSA9IG5ldyBEYXRlKGRhdGUxKVxuICAgICAgICBsZXQgZDIgPSBuZXcgRGF0ZShkYXRlMilcbiAgICAgICAgZDEuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgICAgICAgZDIuc2V0SG91cnMoMCwgMCwgMCwgMClcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKGQyLmdldFRpbWUoKSAtIGQxLmdldFRpbWUoKSkgLyBEYXRlVXRpbHMuTUlMTElTRUNPTkRTX1BFUl9EQVkpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMDY4XHU2NUU1XHU0RUQ4XHUzMDZFXHU1REVFXHUzMDkybXNcdTMwNjdcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICAgICAqIEBwYXJhbSBkYXRlMiB7c3RyaW5nfSBcdTY1RTVcdTRFRDgyXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBkaWZmSW5NaWxsaXNlY29uZHMoZGF0ZTE6IHN0cmluZywgZGF0ZTI6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBEYXRlLnBhcnNlKGRhdGUyKSAtIERhdGUucGFyc2UoZGF0ZTEpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzFGXHU5NTkzXHUzMDZFXHU5MUNEXHUzMDZBXHUzMDhBXHUzMDkyXHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICogQHBhcmFtIHN0YXJ0MSB7c3RyaW5nfSBcdTY3MUZcdTk1OTMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICogQHBhcmFtIGVuZDEge3N0cmluZ30gXHU2NzFGXHU5NTkzMVx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqIEBwYXJhbSBzdGFydDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBlbmQyIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzJcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1OTFDRFx1MzA2QVx1MzA2M1x1MzA2Nlx1MzA0NFx1MzA4Qlx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgb3ZlcmxhcFBlcmlvZChzdGFydDEsIGVuZDEsIHN0YXJ0MiwgZW5kMik6IEFycmF5PHN0cmluZz4ge1xuICAgICAgICBjb25zdCBzdGFydCA9IHN0YXJ0MSA8PSBzdGFydDIgPyBzdGFydDIgOiBzdGFydDFcbiAgICAgICAgY29uc3QgZW5kID0gZW5kMSA8PSBlbmQyID8gZW5kMSA6IGVuZDJcbiAgICAgICAgcmV0dXJuIHN0YXJ0IDw9IGVuZCA/IFtzdGFydCwgZW5kXSA6IFtudWxsLCBudWxsXVxuICAgIH1cbn0iLCAiaW1wb3J0IERhdGVUaW1lU2VsZWN0b3IgZnJvbSBcIi4vRGF0ZVRpbWVTZWxlY3RvclwiO1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9EYXRlVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXplciB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NUJGRVx1OEM2MVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZXZlbnRTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1x1MzBGQlx1NjY0Mlx1OTU5M1x1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2VsZWN0b3I6IERhdGVUaW1lU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEQ4XHUzMEMzXHUzMEMwXHUzMEZDXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9oZWFkQ3Vyc29yOiBzdHJpbmcgPSAnZ2MtY3Vyc29yLXctcmVzaXplJztcblxuICAgIC8qKlxuICAgICAqIFx1MzBDNlx1MzBGQ1x1MzBFQlx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfdGFpbEN1cnNvcjogc3RyaW5nID0gJ2djLWN1cnNvci1lLXJlc2l6ZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nOiBIVE1MRWxlbWVudCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkJcdTMwMDFcdTUyNERcdTU2REVcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNUZcdTY1RTVcdTRFRDhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nUHJldkRhdGU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dyYWJiZWREYXRlOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dyYWJiZWRTdGFydDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9ncmFiYmVkRW5kOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTc1MUZcdTYyMTBcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uUHJldmlldzogKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIHNlbGVjdG9yOiBEYXRlVGltZVNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU5NThCXHU1OUNCXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgRWxlbWVudClcbiAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTU5MDlcdTVGNjJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgIHRoaXMuX2dyYWJiZWRTdGFydCA9IHRoaXMuX2dyYWJiZWRFbmQgPSB0cnVlXG4gICAgICAgICAgICBpZiAodGhpcy5oaXRIZWFkKGUudGFyZ2V0IGFzIEVsZW1lbnQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgIHRoaXMuX2dyYWJiZWRFbmQgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaGl0VGFpbChlLnRhcmdldCBhcyBFbGVtZW50KSkgeyAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTU4MzRcdTU0MDhcdTMwMDFcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwNkZcdTU2RkFcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLl9ncmFiYmVkU3RhcnQgPSBmYWxzZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcbiAgICAgICAgICAgIHRoaXMuX2dyYWJiZWREYXRlID0gdGhpcy5fc2VsZWN0b3IucGlja0RhdGVUaW1lQnlQb3NpdGlvbihlLngsIGUueSlcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZyA9IGVsXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1RkYwOFx1ODg2OFx1NzkzQVx1MzA5Mlx1NkQ4OFx1MzA1OVx1RkYwOVxuICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZyh0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmtleSwgdHJ1ZSlcblxuICAgICAgICAgICAgLy8gXHU3M0ZFXHU1NzI4XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ByZXZEYXRlID0gbnVsbFxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyh0aGlzLl9ncmFiYmVkRGF0ZSlcblxuICAgICAgICAgICAgLy8gXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUN1cnNvcigpXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1OTFDRlx1MzA5Mlx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdDb3VudCA9IDBcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1ODg2OFx1NzkzQVxuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tEYXRlVGltZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyhkYXRlKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTMwREVcdTMwQTZcdTMwQjlcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwNUZcdTMwODFcdTMwNkJcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdThBMThcdTkzMzJcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nQ291bnQrK1xuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4NlxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlVXAoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQua2V5XG4gICAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5fc2VsZWN0b3IucGlja0RhdGVUaW1lQnlQb3NpdGlvbihlLngsIGUueSlcbiAgICAgICAgICAgIGlmIChkYXRlICYmIHRoaXMuX2dyYWJiZWREYXRlICE9PSBkYXRlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRDaGFuZ2VkUGVyaW9kKGRhdGUpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZHJhZ2dpbmdDb3VudCA8IDMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25QcmV2aWV3KHRoaXMuX2RyYWdnaW5nLCBudWxsLCBudWxsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldERyYWdnaW5nKGtleSwgZmFsc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZyA9IG51bGxcbiAgICAgICAgICAgIHRoaXMuX2dyYWJiZWRTdGFydCA9IHRoaXMuX2dyYWJiZWRFbmQgPSBudWxsXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUN1cnNvcigpXG5cbiAgICAgICAgICAgIC8vIFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1RlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEJBXHU1QkZFXHU4QzYxXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldEV2ZW50U2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9ldmVudFNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1NjY0Mlx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjdXJzb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0SGVhZEN1cnNvcihjdXJzb3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9oZWFkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTY2NDJcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY3Vyc29yXG4gICAgICovXG4gICAgcHVibGljIHNldFRhaWxDdXJzb3IoY3Vyc29yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fdGFpbEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uRXZlbnQoY2FsbGJhY2s6IChrZXk6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUoY2FsbGJhY2s6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NzUxRlx1NjIxMFx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvblByZXZpZXcoY2FsbGJhY2s6IChlbDogSFRNTEVsZW1lbnQsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uUHJldmlldyA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHVibGljIGlzRHJhZ2dpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kcmFnZ2luZyAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0R3JhYmJlZERhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dyYWJiZWREYXRlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBpY2tFdmVudChlbDogRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2V2ZW50U2VsZWN0b3IpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRIZWFkKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy1oZWFkJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhpdFRhaWwoZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLXRhaWwnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXREcmFnZ2luZyhrZXk6IHN0cmluZywgZHJhZ2dpbmc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2V2ZW50U2VsZWN0b3IgKyAnW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldENoYW5nZWRQZXJpb2QoZGF0ZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBEYXRlVXRpbHMuZGlmZkluTWlsbGlzZWNvbmRzKHRoaXMuX2dyYWJiZWREYXRlLCBkYXRlKVxuICAgICAgICBsZXQgc3RhcnQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuc3RhcnQpICsgKHRoaXMuX2dyYWJiZWRTdGFydCA/IGRpZmYgOiAwKSlcbiAgICAgICAgbGV0IGVuZCA9IERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKERhdGUucGFyc2UodGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5lbmQpICsgKHRoaXMuX2dyYWJiZWRFbmQgPyBkaWZmIDogMCkpXG4gICAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWREYXRlLmxlbmd0aClcbiAgICAgICAgZW5kID0gZW5kLnN1YnN0cmluZygwLCB0aGlzLl9ncmFiYmVkRGF0ZS5sZW5ndGgpXG4gICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2dyYWJiZWRTdGFydCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fZ3JhYmJlZEVuZCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGVDdXJzb3IoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLl9oZWFkQ3Vyc29yLCB0aGlzLl90YWlsQ3Vyc29yKVxuICAgICAgICBpZiAodGhpcy5fZ3JhYmJlZFN0YXJ0ICYmIHRoaXMuX2dyYWJiZWRFbmQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCgnZ2MtY3Vyc29yLW1vdmUnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2dyYWJiZWRTdGFydCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKHRoaXMuX2hlYWRDdXJzb3IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZ3JhYmJlZEVuZCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKHRoaXMuX3RhaWxDdXJzb3IpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlUHJldmlldyhkYXRlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nUHJldkRhdGUgIT09IGRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0Q2hhbmdlZFBlcmlvZChkYXRlKVxuICAgICAgICAgICAgaWYgKHRoaXMuX29uUHJldmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uUHJldmlldyh0aGlzLl9kcmFnZ2luZywgc3RhcnQsIGVuZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nUHJldkRhdGUgPSBkYXRlXG4gICAgICAgIH1cbiAgICB9XG59IiwgImltcG9ydCBEYXRlVGltZVNlbGVjdG9yIGZyb20gXCIuL0RhdGVUaW1lU2VsZWN0b3JcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuL1Jlc2l6ZXJcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFsbERheUV2ZW50IHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RhdGVTZWxlY3RvcjogRGF0ZVRpbWVTZWxlY3RvciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQjZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc2l6ZXI6IFJlc2l6ZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMERCXHUzMEQwXHUzMEZDXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9ob3Zlcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqIEBwYXJhbSBkYXRlU2VsZWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgZGF0ZVNlbGVjdG9yOiBEYXRlVGltZVNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3IgPSBkYXRlU2VsZWN0b3I7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAqL1xuICAgIHB1YmxpYyBpbml0KCkge1xuICAgICAgICB0aGlzLl9yZXNpemVyID0gbmV3IFJlc2l6ZXIodGhpcy5fcm9vdCwgdGhpcy5fZGF0ZVNlbGVjdG9yKVxuICAgICAgICAgICAgLnNldEV2ZW50U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAuc2V0SGVhZEN1cnNvcignZ2MtY3Vyc29yLXctcmVzaXplJylcbiAgICAgICAgICAgIC5zZXRUYWlsQ3Vyc29yKCdnYy1jdXJzb3ItZS1yZXNpemUnKVxuICAgICAgICAgICAgLm9uRXZlbnQoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub25Nb3ZlKChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uTW92ZShrZXksIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub25QcmV2aWV3KChlbDogSFRNTEVsZW1lbnQsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQcmV2aWV3KCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVByZXZpZXcoZWwsIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzBERVx1MzBBNlx1MzBCOVx1MzBEQlx1MzBEMFx1MzBGQ1x1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlIHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZU92ZXIoZTogRXZlbnQpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jlc2l6ZXIuaXNEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrQWxsRGF5RXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQsIHRydWUpO1xuICAgICAgICBjb25zdCBrZXkgPSBlbCA/IGVsLmRhdGFzZXQua2V5IDogbnVsbDtcbiAgICAgICAgaWYgKGtleSAhPT0gdGhpcy5faG92ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLl9ob3ZlciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuX2hvdmVyID0ga2V5LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBjb250YWluZXJTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcjogc3RyaW5nKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9yZXNpemVyLnNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBjb250YWluZXJTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHJldHVybnMge0FsbERheUV2ZW50fSBcdTgxRUFcdThFQUJcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChjYWxsYmFjazogKGtleTogc3RyaW5nKSA9PiB2b2lkKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEByZXR1cm5zIHtBbGxEYXlFdmVudH0gXHU4MUVBXHU4RUFCXG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShjYWxsYmFjazogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IEFsbERheUV2ZW50IHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSB3aXRob3V0UG9wdXAge2Jvb2xlYW59IFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTY2NFx1NTkxNlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBpY2tBbGxEYXlFdmVudChlbDogSFRNTEVsZW1lbnQsIHdpdGhvdXRQb3B1cDogYm9vbGVhbiA9IGZhbHNlKTogbnVsbCB8IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAod2l0aG91dFBvcHVwID8gJycgOiAnLCAuZ2MtZGF5LWdyaWQtcG9wdXAnKSlcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwREJcdTMwRDBcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0ga2V5IHtzdHJpbmd9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1xuICAgICAqIEBwYXJhbSBob3ZlciB7Ym9vbGVhbn0gXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldEhvdmVyQWxsRGF5RXZlbnQoa2V5OiBzdHJpbmcsIGhvdmVyOiBib29sZWFuKSB7XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gZXZlbnRTdGFydCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZXZlbnRFbmQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVByZXZpZXcoZWxFdmVudDogSFRNTEVsZW1lbnQsIGV2ZW50U3RhcnQ6IHN0cmluZywgZXZlbnRFbmQ6IHN0cmluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtd2VlaywgLmdjLWFsbC1kYXktc2VjdGlvbicpKS5mb3JFYWNoKGVsV2VlayA9PiB7XG4gICAgICAgICAgICBjb25zdCBbd2Vla1N0YXJ0LCB3ZWVrRW5kXSA9IHRoaXMuZ2V0V2Vla1BlcmlvZChlbFdlZWspXG4gICAgICAgICAgICBpZiAod2Vla1N0YXJ0ICYmIHdlZWtFbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbcGVyaW9kU3RhcnQsIHBlcmlvZEVuZF0gPSBEYXRlVXRpbHMub3ZlcmxhcFBlcmlvZChldmVudFN0YXJ0LCBldmVudEVuZCwgd2Vla1N0YXJ0LCB3ZWVrRW5kKVxuICAgICAgICAgICAgICAgIGlmIChwZXJpb2RTdGFydCAmJiBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxQcmV2aWV3ID0gZWxXZWVrLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXlbZGF0YS1kYXRlPVwiJyArIHBlcmlvZFN0YXJ0ICsgJ1wiXSAuZ2MtYWxsLWRheS1ldmVudC1wcmV2aWV3JylcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdlZWtTdGFydCA8PSB0aGlzLl9yZXNpemVyLmdldEdyYWJiZWREYXRlKCkgJiYgdGhpcy5fcmVzaXplci5nZXRHcmFiYmVkRGF0ZSgpIDw9IHdlZWtFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1OTAzMVx1MzA2N1x1MzA2Rlx1MzAwMVx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA2RVx1N0UyNlx1NEY0RFx1N0Y2RVx1MzA5Mlx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXcsIHRoaXMuZ2V0SW5kZXhJblBhcmVudChlbEV2ZW50KSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGVsRXZlbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRheXMgPSBEYXRlVXRpbHMuZGlmZkRheXMocGVyaW9kU3RhcnQsIHBlcmlvZEVuZCkgKyAxXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0UHJldmlldyhlbCwgZGF5cywgcGVyaW9kU3RhcnQgPT09IGV2ZW50U3RhcnQsIHBlcmlvZEVuZCA9PT0gZXZlbnRFbmQpXG4gICAgICAgICAgICAgICAgICAgIGVsUHJldmlldy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XHUzMEZCXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsV2VlayB7SFRNTEVsZW1lbnR9IFx1OTAzMVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU5MDMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XHUzMEZCXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFdlZWtQZXJpb2QoZWxXZWVrOiBIVE1MRWxlbWVudCk6IEFycmF5PGFueT4ge1xuICAgICAgICBjb25zdCBlbERheXMgPSBlbFdlZWsucXVlcnlTZWxlY3RvckFsbCgnLmdjLWRheTpub3QoLmdjLWRpc2FibGVkKScpIGFzIE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+XG4gICAgICAgIGlmIChlbERheXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFtlbERheXNbMF0uZGF0YXNldC5kYXRlLCBlbERheXNbZWxEYXlzLmxlbmd0aCAtIDFdLmRhdGFzZXQuZGF0ZV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbbnVsbCwgbnVsbF1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA2Qlx1NTQwOFx1MzA4Rlx1MzA1Qlx1MzA4QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBkYXlzIHtudW1iZXJ9IFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjVFNVx1NjU3MFxuICAgICAqIEBwYXJhbSBpc1N0YXJ0IHtib29sZWFufSBcdTkwMzFcdTUxODVcdTMwNkJcdTk1OEJcdTU5Q0JcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gaXNFbmQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1N0Q0Mlx1NEU4Nlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhZGp1c3RQcmV2aWV3KGVsOiBIVE1MRWxlbWVudCwgZGF5czogbnVtYmVyLCBpc1N0YXJ0OiBib29sZWFuLCBpc0VuZDogYm9vbGVhbikge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLXN0YXJ0JylcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZW5kJylcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gNzsgaSsrKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy0nICsgaSArICdkYXlzJylcbiAgICAgICAgfVxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy0nICsgZGF5cyArICdkYXlzJylcbiAgICAgICAgaWYgKGlzU3RhcnQpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXN0YXJ0JylcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWVuZCcpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDRDXHU1MTQ0XHU1RjFGXHUzMDZFXHU0RTJEXHUzMDY3XHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHUzMEE0XHUzMEYzXHUzMEM3XHUzMEMzXHUzMEFGXHUzMEI5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEluZGV4SW5QYXJlbnQoZWw6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbC5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKGVsKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1Rlx1NjU3MFx1MzA2MFx1MzA1MVx1N0E3QVx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXc6IEhUTUxFbGVtZW50LCBjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgZWxQcmV2aWV3LmFwcGVuZENoaWxkKGVsKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU1MjRBXHU5NjY0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbW92ZVByZXZpZXcoKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbDogRWxlbWVudCkgPT4gZWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWwuY2xvbmVOb2RlKGZhbHNlKSwgZWwpKVxuICAgIH1cbn0iLCAiaW1wb3J0IERhdGVUaW1lU2VsZWN0b3IgZnJvbSAnLi9EYXRlVGltZVNlbGVjdG9yJ1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9EYXRlVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF5R3JpZFRpbWVkRXZlbnQge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9kYXRlU2VsZWN0b3I6IERhdGVUaW1lU2VsZWN0b3I7XG5cbiAgICAvKipcbiAgICAgKiBBbHBpbmUuanNcdTMwNkVcdTMwQTRcdTMwRjNcdTMwQjlcdTMwQkZcdTMwRjNcdTMwQjlcbiAgICAgKi9cbiAgICBwcml2YXRlIF9hbHBpbmU6IGFueTtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgX2RyYWdnaW5nOiBIVE1MRWxlbWVudCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gZGF0ZVNlbGVjdG9yXG4gICAgICogQHBhcmFtIGFscGluZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCBkYXRlU2VsZWN0b3I6IERhdGVUaW1lU2VsZWN0b3IsIGFscGluZTogYW55KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3IgPSBkYXRlU2VsZWN0b3I7XG4gICAgICAgIHRoaXMuX2FscGluZSA9IGFscGluZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuX29uRHJhZ1N0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5fb25EcmFnT3Zlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLl9vbkRyYWdFbmQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICpcbiAgICAgKiBAcGFyYW0gb25FdmVudCB7RnVuY3Rpb259IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChvbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiBEYXlHcmlkVGltZWRFdmVudCB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBvbkV2ZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvbk1vdmUge0Z1bmN0aW9ufSBcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcmV0dXJucyB7RGF5R3JpZFRpbWVkRXZlbnR9IFx1MzBBNFx1MzBGM1x1MzBCOVx1MzBCRlx1MzBGM1x1MzBCOVxuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUob25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogRGF5R3JpZFRpbWVkRXZlbnQge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBvbk1vdmU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqXG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpPy5kYXRhc2V0LmtleTtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgLy8gXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU1ODM0XHU1NDA4XG4gICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTYyQkNcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25Nb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25EcmFnU3RhcnQoZTogRHJhZ0V2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gZWw7XG4gICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIGVsLmRhdGFzZXQua2V5KTtcbiAgICAgICAgICAgIHRoaXMuX2FscGluZS4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dpbmdDbGFzcygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA0Q1x1ODk4MVx1N0QyMFx1MzA2Qlx1NEU1N1x1MzA2M1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYWdPdmVyKGU6IERyYWdFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5fZGF0ZVNlbGVjdG9yLnBpY2tEYXRlVGltZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3Iuc2VsZWN0KGRhdGUpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJvcChlOiBEcmFnRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHU1MUU2XHU3NDA2XHUzMDkyXHU1QjlGXHU4ODRDXG4gICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9kYXRlU2VsZWN0b3IucGlja0RhdGVUaW1lQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRheXMgPSBEYXRlVXRpbHMuZGlmZkRheXModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydCwgZGF0ZSk7XG4gICAgICAgICAgICBpZiAoZGF5cyAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZVV0aWxzLmFkZERheXModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydCwgZGF5cykpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKERhdGVVdGlscy5hZGREYXlzKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuZW5kLCBkYXlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDRDXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHU1OTE2XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJhZ0VuZChlOiBEcmFnRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4OUUzXHU5NjY0XG4gICAgICAgIHRoaXMuX2RhdGVTZWxlY3Rvci5kZXNlbGVjdCgpO1xuXG4gICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE0M1x1MzA2Qlx1NjIzQlx1MzA1OVxuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJyk7XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZET01cdTg5ODFcdTdEMjBcdTMwNkVcdThGRDFcdTMwNEZcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgcGlja0V2ZW50KGVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QoJy5nYy1kYXktZ3JpZCwgLmdjLWRheS1ncmlkLXBvcHVwJylcbiAgICAgICAgICAgID8gKGVsLmNsb3Nlc3QoJy5nYy10aW1lZC1ldmVudC1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTcyQjZcdTYxNEJcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkRHJhZ2dpbmdDbGFzcygpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZy5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpO1xuICAgICAgICB9XG4gICAgfVxufSIsICJpbXBvcnQgRGF5R3JpZExpbWl0IGZyb20gXCIuL21vZHVsZXMvRGF5R3JpZExpbWl0XCI7XG5pbXBvcnQgRGF0ZVRpbWVTZWxlY3RvciBmcm9tICcuL21vZHVsZXMvRGF0ZVRpbWVTZWxlY3RvcidcbmltcG9ydCBEYXlHcmlkUG9wdXAgZnJvbSAnLi9tb2R1bGVzL0RheUdyaWRQb3B1cCdcbmltcG9ydCBBbGxEYXlFdmVudCBmcm9tIFwiLi9tb2R1bGVzL0FsbERheUV2ZW50LmpzXCI7XG5pbXBvcnQgRGF5R3JpZFRpbWVkRXZlbnQgZnJvbSBcIi4vbW9kdWxlcy9EYXlHcmlkVGltZWRFdmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkYXlHcmlkKGNvbXBvbmVudFBhcmFtZXRlcnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogXHU4ODY4XHU3OTNBXHU0RUY2XHU2NTcwXHUzMDkyXHU1MjM2XHU5NjUwXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEYzXHUzMEREXHUzMEZDXHUzMENEXHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBkYXlHcmlkTGltaXQ6IERheUdyaWRMaW1pdCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEYzXHUzMEREXHUzMEZDXHUzMENEXHUzMEYzXHUzMEM4XG4gICAgICAgICAqL1xuICAgICAgICBkYXlHcmlkUG9wdXA6IERheUdyaWRQb3B1cCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAqL1xuICAgICAgICBkYXRlU2VsZWN0b3I6IERhdGVUaW1lU2VsZWN0b3IsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWRFdmVudDogRGF5R3JpZFRpbWVkRXZlbnQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgYWxsRGF5RXZlbnQ6IEFsbERheUV2ZW50LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICAvLyBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMuZGF5R3JpZFBvcHVwID0gbmV3IERheUdyaWRQb3B1cCh0aGlzLiRlbCk7XG5cbiAgICAgICAgICAgIC8vIFx1ODg2OFx1NzkzQVx1NjU3MFx1MzA5Mlx1NTIzNlx1OTY1MFx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGM1x1MzBERFx1MzBGQ1x1MzBDRFx1MzBGM1x1MzBDOFx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgdGhpcy5kYXlHcmlkTGltaXQgPSBuZXcgRGF5R3JpZExpbWl0KHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRMb2NhbGl6ZWRSZW1haW5pbmdUZXh0KGNvbXBvbmVudFBhcmFtZXRlcnMucmVtYWluaW5nKVxuICAgICAgICAgICAgICAgIC5vblJlbWFpbmluZ1RleHRDbGljaygoZWxEYXkpID0+IHRoaXMuZGF5R3JpZFBvcHVwLm9wZW4oZWxEYXkpKTtcblxuICAgICAgICAgICAgLy8gXHU2NUU1XHU0RUQ4XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3RvciA9IG5ldyBEYXRlVGltZVNlbGVjdG9yKHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLWRheS1ncmlkJylcbiAgICAgICAgICAgICAgICAuc2V0RWxlbWVudFNlbGVjdG9yKCcuZ2MtZGF5JylcbiAgICAgICAgICAgICAgICAuc2V0UHJvcGVydHlOYW1lKCdkYXRlJylcbiAgICAgICAgICAgICAgICAub25TZWxlY3QoKHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkRhdGUoc3RhcnQgKyAnIDAwOjAwOjAwJywgZW5kICsgJyAyMzo1OTo1OScpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudCA9IG5ldyBBbGxEYXlFdmVudCh0aGlzLiRlbCwgdGhpcy5kYXRlU2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtZGF5LWdyaWQnKVxuICAgICAgICAgICAgICAgIC5vbk1vdmUoKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub25FdmVudCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50ID0gbmV3IERheUdyaWRUaW1lZEV2ZW50KHRoaXMuJGVsLCB0aGlzLmRhdGVTZWxlY3RvciwgdGhpcylcbiAgICAgICAgICAgICAgICAub25FdmVudCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub25Nb3ZlKChrZXksIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwNkVcdTc2N0JcdTkzMzJcbiAgICAgICAgICAgIHRoaXMuZGF5R3JpZFBvcHVwLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLmFsbERheUV2ZW50LnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVkRXZlbnQucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZVNlbGVjdG9yLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG5cbiAgICAgICAgICAgIC8vIExpdmV3aXJlXHUzMDRCXHUzMDg5XHUzMDZFXHU1RjM3XHU1MjM2XHU2NkY0XHU2NUIwXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICBMaXZld2lyZS5vbigncmVmcmVzaENhbGVuZGFyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHRoaXMuZGF5R3JpZExpbWl0LnVwZGF0ZUxheW91dCh0cnVlKSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQUEsSUFBcUIsZ0JBQXJCLE1BQXFCLGNBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBeUQ5QixZQUFZLE1BQW1CO0FBcEQvQjtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRO0FBTVI7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFBUSxpQkFBd0I7QUFNaEM7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFBUSxpQkFBd0I7QUFNaEM7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFBUSxnQkFBdUI7QUFNL0I7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFBUSwyQkFBa0M7QUFLMUM7QUFBQTtBQUFBO0FBQUEsd0JBQVE7QUF3QkosU0FBSyxRQUFRO0FBQ2IsU0FBSyxLQUFLO0FBQUEsRUFDZDtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS08sT0FBTztBQUNWLFNBQUssYUFBYTtBQUNsQixXQUFPLGlCQUFpQixVQUFVLEtBQUssVUFBVSxLQUFLLElBQUksQ0FBQztBQUMzRCxTQUFLLE1BQU0saUJBQWlCLFNBQVMsS0FBSyxTQUFTLEtBQUssSUFBSSxDQUFDO0FBQzdELFNBQUssTUFBTSxpQkFBaUIsYUFBYSxLQUFLLGFBQWEsS0FBSyxJQUFJLENBQUM7QUFBQSxFQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFNTywwQkFBMEIs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
