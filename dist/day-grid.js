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

// resources/js/modules/Selector.ts
var Selector = class {
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
     * 選択対象の要素のリソースID
     * @private
     */
    __publicField(this, "_resourceId", null);
    /**
     * 選択範囲を描画するコールバック
     */
    __publicField(this, "_onDraw", null);
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
   * 選択範囲を描画するコールバックを設定する。
   * @param onDraw
   */
  onDraw(onDraw) {
    this._onDraw = onDraw;
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
   * @param value 日付・時間
   */
  select(value) {
    this._selectionStart = this._selectionEnd = value;
    this.update();
    return this;
  }
  /**
   * 選択範囲の終了位置を設定する。
   * @param value 日付・時間
   */
  selectEnd(value) {
    this._selectionEnd = value;
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
    const value = this.pickValueByPosition(e.x, e.y);
    if (value) {
      this._resourceId = this.pickResourceId(e.target);
      this.select(value);
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスを動かした時の処理
   * @param e
   */
  _mouseMove(e) {
    const value = this.pickValueByPosition(e.x, e.y);
    if (value) {
      this.selectEnd(value);
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスを離した時の処理
   * @param e
   */
  _mouseUp(e) {
    if (this.isSelected()) {
      const value = this.pickValueByPosition(e.x, e.y);
      if (value) {
        if (this._onSelect) {
          const [start, end] = this.getSelection();
          this._onSelect(start, end, this._resourceId);
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
  pickValue(el) {
    return this._root.contains(el) && el.closest(this._containerSelector) ? el.closest(this._elementSelector + ":not(.disabled)")?.dataset[this._propertyName] : null;
  }
  /**
   * 指定された要素から、リソースIDの要素を探す。
   * @param el 要素
   * @returns {string} リソースID
   */
  pickResourceId(el) {
    return this._root.contains(el) && el.closest(this._containerSelector) ? el.closest("[data-resource-id]")?.dataset["resourceId"] ?? null : null;
  }
  /**
   * 指定された座標から、選択対象の要素を探す。
   * @param x X座標
   * @param y Y座標
   * @returns {string} 日付・時間
   */
  pickValueByPosition(x, y) {
    return Array.from(this._root.querySelectorAll(this._containerSelector + " " + this._elementSelector)).filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
    }).at(0)?.dataset[this._propertyName];
  }
  /**
   * 指定された日付・時間の要素を探す。
   * @param value 日付・時間
   * @returns {HTMLElement} 要素
   */
  getElementByValue(value) {
    return this._root.querySelector(
      this._containerSelector + " " + this._elementSelector + "[data-" + this._propertyName + '="' + value + '"]'
    );
  }
  /**
   * 日時の選択範囲の表示を更新する。
   */
  update() {
    if (this._onDraw) {
      const [begin2, end2] = this.getSelection();
      return this._onDraw(begin2, end2, this._resourceId);
    }
    let [begin, end] = this.getSelection();
    this._root.querySelectorAll(
      this._containerSelector + (this._resourceId !== null ? ' [data-resource-id="' + this._resourceId + '"] ' : " ") + this._elementSelector
    ).forEach((el) => {
      const value = el.dataset[this._propertyName];
      if (begin <= value && value <= end) {
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
  /**
   * 開始時間、時間、時間間隔を渡し、何番目かを返す
   */
  static timeSlot(start, end, interval, time) {
    return Math.floor((Date.parse(time > end ? end : time) - Date.parse(start)) / parseInt(interval) / 1e3);
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
     * ドラッグ中のDOM要素
     */
    __publicField(this, "_dragging", null);
    /**
     * ドラッグ中の初期の開始位置
     */
    __publicField(this, "_draggingStart", null);
    /**
     * ドラッグ中の初期の終了位置
     */
    __publicField(this, "_draggingEnd", null);
    /**
     * ドラッグ中に、前回ホバーした値
     */
    __publicField(this, "_draggingValue", null);
    /**
     * ドラッグ中の移動量。移動量が少ないと、クリックと判断する
     */
    __publicField(this, "_draggingCount", 0);
    /**
     * ドラッグ中の掴んだ位置（日付）
     */
    __publicField(this, "_grabbed");
    /**
     * 開始位置を掴んでいるかどうか
     */
    __publicField(this, "_isGrabbingHead", false);
    /**
     * 終了位置を掴んでいるかどうか
     */
    __publicField(this, "_isGrabbingTail", false);
    /**
     * クリックした時の処理
     */
    __publicField(this, "_onEvent", null);
    /**
     * 移動した時の処理
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
   * マウスダウンイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を開始したかどうか
   */
  _onMouseDown(e) {
    const el = this.pickEvent(e.target);
    if (el) {
      this._isGrabbingHead = this._isGrabbingTail = true;
      if (this.hitHead(e.target)) {
        this._isGrabbingTail = false;
      }
      if (this.hitTail(e.target)) {
        this._isGrabbingHead = false;
      }
      this._grabbed = this._selector.pickValueByPosition(e.x, e.y);
      this._dragging = el;
      this._draggingStart = this._dragging.dataset.start;
      this._draggingEnd = this._dragging.dataset.end;
      this.setDragging(this._dragging.dataset.key, true);
      this._draggingValue = null;
      this.updatePreview(this._grabbed);
      this.updateCursor();
      this._draggingCount = 0;
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスムーブイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を終了したかどうか
   */
  _onMouseMove(e) {
    if (this._dragging) {
      const value = this._selector.pickValueByPosition(e.x, e.y);
      if (value) {
        this.updatePreview(value);
      }
      this._draggingCount++;
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスアップイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を終了したかどうか
   */
  _onMouseUp(e) {
    if (this._dragging) {
      const key = this._dragging.dataset.key;
      const value = this._selector.pickValueByPosition(e.x, e.y);
      if (value && this._grabbed !== value) {
        const [start, end] = this.drag(value);
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
      this._isGrabbingHead = this._isGrabbingTail = null;
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
   * クリックした時の処理を設定
   * @param callback
   */
  onEvent(callback) {
    this._onEvent = callback;
    return this;
  }
  /**
   * 移動した時の処理を設定
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
    return this._grabbed;
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
   * 先頭部分に当たったかどうか
   * @param el {HTMLElement} 判定する要素
   * @returns {boolean} 先頭部分に当たったかどうか
   */
  hitHead(el) {
    return !!el.closest(".gc-head");
  }
  /**
   * 末尾部分に当たったかどうか
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
   * 指定した値が数字のみで構成されているか？
   */
  isNumber(value) {
    return /^[0-9]+$/.test(value);
  }
  /**
   * ドラッグ中の位置に対して、変更後の期間を取得する
   * @param value {string} マウスの位置の値
   * @returns {Array} 変更後の期間
   */
  drag(value) {
    return this.isNumber(value) ? this.dragNumber(value) : this.dragDateTime(value);
  }
  /**
   * プロパティが日時の場合に、変更後の期間を取得する
   * @param value {string} マウスの位置の日付
   * @returns {Array} 変更後の期間
   */
  dragDateTime(value) {
    const diff = DateUtils.diffInMilliseconds(this._grabbed, value);
    let start = DateUtils.toDateTimeString(Date.parse(this._draggingStart) + (this._isGrabbingHead ? diff : 0));
    let end = DateUtils.toDateTimeString(Date.parse(this._draggingEnd) + (this._isGrabbingTail ? diff : 0));
    start = start.substring(0, this._grabbed.length);
    end = end.substring(0, this._grabbed.length);
    if (start > end) {
      if (this._isGrabbingHead) {
        start = end;
      }
      if (this._isGrabbingTail) {
        end = start;
      }
    }
    return [start, end];
  }
  /**
   * プロパティが数字の場合に、変更後の期間を取得する
   * @param value {string} マウスの位置の値
   * @returns {Array} 変更後の終日予定の期間
   */
  dragNumber(value) {
    const diff = parseInt(value) - parseInt(this._grabbed);
    let start = parseInt(this._draggingStart) + (this._isGrabbingHead ? diff : 0);
    let end = parseInt(this._draggingEnd) + (this._isGrabbingTail ? diff : 0);
    if (start > end) {
      if (this._isGrabbingHead) {
        start = end;
      }
      if (this._isGrabbingTail) {
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
    if (this._isGrabbingHead && this._isGrabbingTail) {
      this._root.classList.add("gc-cursor-move");
    } else if (this._isGrabbingHead) {
      this._root.classList.add(this._headCursor);
    } else if (this._isGrabbingTail) {
      this._root.classList.add(this._tailCursor);
    }
  }
  /**
   * ドラッグ中の終日予定のプレビューを更新する
   * @param value {string} マウスの位置の日付
   */
  updatePreview(value) {
    if (this._draggingValue !== value) {
      const [start, end] = this.drag(value);
      if (this._onPreview) {
        this._onPreview(this._dragging, start, end);
      }
      this._draggingValue = value;
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
    const date = this._dateSelector.pickValueByPosition(e.x, e.y);
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
    const date = this._dateSelector.pickValueByPosition(e.x, e.y);
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
    dateSelector: Selector,
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
      this.dateSelector = new Selector(this.$el).setContainerSelector(".gc-day-grid").setElementSelector(".gc-day").setPropertyName("date").onSelect((start, end, resourceId) => {
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59", resourceId);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF5R3JpZExpbWl0LnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1NlbGVjdG9yLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL0RheUdyaWRQb3B1cC50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9EYXRlVXRpbHMudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvUmVzaXplci50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9BbGxEYXlFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9EYXlHcmlkVGltZWRFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvZGF5LWdyaWQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGNsYXNzIERheUdyaWRMaW1pdCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFx1MzA2RVx1MzBBRFx1MzBFM1x1MzBDM1x1MzBCN1x1MzBFNVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdmlzaWJsZUNvdW50OiBudW1iZXIgPSAwO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9kYXlUb3BIZWlnaHQ6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdUZGMTFcdTRFRjZcdThGQkFcdTMwOEFcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2V2ZW50SGVpZ2h0OiBudW1iZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEM2XHUzMEFEXHUzMEI5XHUzMEM4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0OiBzdHJpbmcgPSAnKyA6Y291bnQgbW9yZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vblJlbWFpbmluZ1RleHRDbGljazogKGVsRGF5OiBIVE1MRWxlbWVudCkgPT4gdm9pZDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBEQVlfU0VMRUNUT1IgPSAnLmdjLWRheXMgLmdjLWRheSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTRFMEFcdTkwRThcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgREFZX1RPUF9TRUxFQ1RPUiA9ICcuZ2MtZGF5LXRvcCc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiAuZ2MtYWxsLWRheS1ldmVudHNcdTMwNkJcdTMwNkZcdTMwMDFcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwNkJcdTMwNjBcdTMwNTFcdTMwQzdcdTMwRkNcdTMwQkZcdTMwNENcdTUxNjVcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTMwNkVcdTMwNjBcdTMwNENcdTMwMDFcbiAgICAgKiAuZ2MtdGltZWQtZXZlbnRzXHUzMDZCXHUzMDZGXHUzMDAxXHU1MTY4XHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1NDJCXHUzMDgxXHUzMDY2XHUzMDAxXHU1MTY4XHUzMDY2XHUzMDZFXHU2NUU1XHUzMDZCXHUzMEM3XHUzMEZDXHUzMEJGXHUzMDRDXHU1MTY1XHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IEFOWV9FVkVOVF9TRUxFQ1RPUiA9ICcuZ2MtdGltZWQtZXZlbnRzID4gLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lciwgLmdjLXRpbWVkLWV2ZW50cyA+IC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcic7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgcHVibGljIGluaXQoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTGF5b3V0KClcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwNkVcdTg4NjhcdTc5M0FcdTMwQzZcdTMwQURcdTMwQjlcdTMwQzhcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gbG9jYWxpemVkUmVtYWluaW5nVGV4dFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRMb2NhbGl6ZWRSZW1haW5pbmdUZXh0KGxvY2FsaXplZFJlbWFpbmluZ1RleHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0ID0gbG9jYWxpemVkUmVtYWluaW5nVGV4dDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIG9uUmVtYWluaW5nVGV4dENsaWNrXG4gICAgICovXG4gICAgcHVibGljIG9uUmVtYWluaW5nVGV4dENsaWNrKG9uUmVtYWluaW5nVGV4dENsaWNrOiAoZWxEYXk6IEhUTUxFbGVtZW50KSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuX29uUmVtYWluaW5nVGV4dENsaWNrID0gb25SZW1haW5pbmdUZXh0Q2xpY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uUmVzaXplKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUxheW91dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25DbGljayhlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVtYWluaW5nVGV4dEVsZW1lbnQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblJlbWFpbmluZ1RleHRDbGljaykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uUmVtYWluaW5nVGV4dENsaWNrKHRoaXMucGlja0RheShlLnRhcmdldCBhcyBFbGVtZW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU2MkJDXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVtYWluaW5nVGV4dEVsZW1lbnQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwOTJcdTUxOERcdThBMDhcdTdCOTdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIFx1NUYzN1x1NTIzNlx1NzY4NFx1MzA2Qlx1NTE4RFx1OEEwOFx1N0I5N1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlTGF5b3V0KGZvcmNlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgdmlzaWJsZUNvdW50ID0gdGhpcy5nZXRWaXNpYmxlQ291bnQoKTtcbiAgICAgICAgaWYgKHRoaXMuX3Zpc2libGVDb3VudCAhPT0gdmlzaWJsZUNvdW50IHx8IGZvcmNlKSB7XG4gICAgICAgICAgICB0aGlzLl92aXNpYmxlQ291bnQgPSB2aXNpYmxlQ291bnQ7XG4gICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoRGF5R3JpZExpbWl0LkRBWV9TRUxFQ1RPUikuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGF5KGRheSBhcyBIVE1MRWxlbWVudCwgdmlzaWJsZUNvdW50KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTg4NjhcdTc5M0FcdTMwNTlcdTMwOEJcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTY2RjRcdTY1QjBcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gdmlzaWJsZUNvdW50IHtudW1iZXJ9IFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlRGF5KGVsRGF5OiBIVE1MRWxlbWVudCwgdmlzaWJsZUNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZXZlbnRDb3VudCA9IHRoaXMuZ2V0RXZlbnRDb3VudChlbERheSk7XG4gICAgICAgIGNvbnN0IGxpbWl0Q291bnQgPSBldmVudENvdW50IDwgdmlzaWJsZUNvdW50ID8gZXZlbnRDb3VudCA6IHZpc2libGVDb3VudCAtIDE7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ0NvdW50ID0gZXZlbnRDb3VudCAtIGxpbWl0Q291bnQ7XG4gICAgICAgIHRoaXMuc2V0VGltZWRFdmVudHNIZWlnaHQoZWxEYXksIHRoaXMuZ2V0RXZlbnRIZWlnaHQoKSAqIGxpbWl0Q291bnQpO1xuICAgICAgICB0aGlzLmxpbWl0QWxsRGF5RXZlbnRzKGVsRGF5LCBsaW1pdENvdW50IC0gKHJlbWFpbmluZ0NvdW50ID8gMSA6IDApKTtcbiAgICAgICAgdGhpcy5zZXRSZW1haW5pbmdDb3VudChlbERheSwgcmVtYWluaW5nQ291bnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFdmVudENvdW50KGVsRGF5OiBIVE1MRWxlbWVudCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBlbERheS5xdWVyeVNlbGVjdG9yQWxsKERheUdyaWRMaW1pdC5BTllfRVZFTlRfU0VMRUNUT1IpLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEV2ZW50SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudEhlaWdodCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRIZWlnaHQgPSB0aGlzLmdldEVsZW1lbnRIZWlnaHQoRGF5R3JpZExpbWl0LkFOWV9FVkVOVF9TRUxFQ1RPUik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50SGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVxuICAgICAqIEBwYXJhbSBoZWlnaHQge251bWJlcn0gXHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRUaW1lZEV2ZW50c0hlaWdodChlbERheTogSFRNTEVsZW1lbnQsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIChlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJykgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXREYXlIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudEhlaWdodChEYXlHcmlkTGltaXQuREFZX1NFTEVDVE9SKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTU0MDRcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldERheVRvcEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fZGF5VG9wSGVpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXlUb3BIZWlnaHQgPSB0aGlzLmdldEVsZW1lbnRIZWlnaHQoRGF5R3JpZExpbWl0LkRBWV9UT1BfU0VMRUNUT1IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXlUb3BIZWlnaHRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEVsZW1lbnRIZWlnaHQoc2VsZWN0b3I6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAodGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSBhcyBIVE1MRWxlbWVudCkub2Zmc2V0SGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NTQwNFx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RGF5Qm9keUhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXlIZWlnaHQoKSAtIHRoaXMuZ2V0RGF5VG9wSGVpZ2h0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRWaXNpYmxlQ291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXREYXlCb2R5SGVpZ2h0KCkgLyB0aGlzLmdldEV2ZW50SGVpZ2h0KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODg2OFx1NzkzQVx1MzBGQlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBsaW1pdCB7bnVtYmVyfSBcdTg4NjhcdTc5M0FcdTUzRUZcdTgwRkRcdTMwNkFcdTRFODhcdTVCOUFcdTY1NzBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxpbWl0QWxsRGF5RXZlbnRzKGVsRGF5OiBIVE1MRWxlbWVudCwgbGltaXQ6IG51bWJlcikge1xuICAgICAgICBlbERheVxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsRXZlbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IDw9IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGVsRXZlbnQuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbEV2ZW50LmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIHJlbWFpbmluZ0NvdW50IHtudW1iZXJ9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0UmVtYWluaW5nQ291bnQoZWxEYXk6IEhUTUxFbGVtZW50LCByZW1haW5pbmdDb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGVsUmVtYWluaW5nID0gZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLXJlbWFpbmluZy1jb250YWluZXInKTtcbiAgICAgICAgaWYgKHJlbWFpbmluZ0NvdW50ID4gMCkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgZWxSZW1haW5pbmcuY2hpbGRyZW5bMF0uaW5uZXJUZXh0ID0gdGhpcy5tYWtlUmVtYWluaW5nVGV4dChyZW1haW5pbmdDb3VudCk7XG4gICAgICAgICAgICBlbFJlbWFpbmluZy5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsUmVtYWluaW5nLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEM2XHUzMEFEXHUzMEI5XHUzMEM4XHUzMDkyXHU0RjVDXHU2MjEwXG4gICAgICogQHBhcmFtIHJlbWFpbmluZ0NvdW50IHtudW1iZXJ9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA2RVx1ODg2OFx1NzkzQVx1MzBDNlx1MzBBRFx1MzBCOVx1MzBDOFxuICAgICAqL1xuICAgIHByaXZhdGUgbWFrZVJlbWFpbmluZ1RleHQocmVtYWluaW5nQ291bnQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0LnJlcGxhY2UoJzpjb3VudCcsIFN0cmluZyhyZW1haW5pbmdDb3VudCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7RWxlbWVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgaXNSZW1haW5pbmdUZXh0RWxlbWVudChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWwuY2xvc2VzdCgnLmdjLXJlbWFpbmluZy1jb250YWluZXInKSAmJiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0VsZW1lbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBwaWNrRGF5KGVsOiBFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gZWwuY2xvc2VzdCgnLmdjLWRheScpIGFzIEhUTUxFbGVtZW50O1xuICAgIH1cbn0iLCAiLyoqXG4gKiBEYXRlVGltZVNlbGVjdG9yXG4gKlxuICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU5MDc4XHU2MjlFXHU2QTVGXHU4MEZEXHUzMDkyXHU2M0QwXHU0RjlCXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZCXHUzMDAxXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU2NENEXHU0RjVDXHUzMDZCXHUzMDg4XHUzMDhCXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU2MzA3XHU1QjlBXHUzMDkyXHU4ODRDXHUzMDQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdG9yIHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wcm9wZXJ0eU5hbWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NlbGVjdGlvblN0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3Rpb25FbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVzb3VyY2VJZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1NjNDRlx1NzUzQlx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJhdzogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nLCByZXNvdXJjZUlkOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDRDXHU1OTA5XHU2NkY0XHUzMDU1XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vblNlbGVjdDogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nLCByZXNvdXJjZUlkOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbGVtZW50U2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RWxlbWVudFNlbGVjdG9yKGVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3IgPSBlbGVtZW50U2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA5Mlx1NjMwMVx1MzA2NFx1MzBEN1x1MzBFRFx1MzBEMVx1MzBDNlx1MzBBM1x1NTQwRFx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMihkYXRhLWRhdGVcdTMwNkFcdTMwODlcdTMwMDFkYXRlKVxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eU5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlOYW1lKHByb3BlcnR5TmFtZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1NjNDRlx1NzUzQlx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBvbkRyYXdcbiAgICAgKi9cbiAgICBwdWJsaWMgb25EcmF3KG9uRHJhdzogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nLCByZXNvdXJjZUlkOiBzdHJpbmcpID0+IHZvaWQpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX29uRHJhdyA9IG9uRHJhdztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDRDXHU1OTA5XHU2NkY0XHUzMDU1XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIG9uU2VsZWN0XG4gICAgICovXG4gICAgcHVibGljIG9uU2VsZWN0KG9uU2VsZWN0OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX29uU2VsZWN0ID0gb25TZWxlY3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSB2YWx1ZSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2VsZWN0KHZhbHVlOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGlvblN0YXJ0ID0gdGhpcy5fc2VsZWN0aW9uRW5kID0gdmFsdWU7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSB2YWx1ZSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2VsZWN0RW5kKHZhbHVlOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX3NlbGVjdGlvbkVuZCA9IHZhbHVlO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTg5RTNcdTk2NjRcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKi9cbiAgICBwdWJsaWMgZGVzZWxlY3QoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0KG51bGwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX0gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIGdldFNlbGVjdGlvbigpOiBzdHJpbmdbXSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5fc2VsZWN0aW9uU3RhcnQsIHRoaXMuX3NlbGVjdGlvbkVuZF0uc29ydCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NzNGRVx1NTcyOFx1MzAwMVx1OTA3OFx1NjI5RVx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0Qlx1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHB1YmxpYyBpc1NlbGVjdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0aW9uU3RhcnQgIT09IG51bGwgJiYgdGhpcy5fc2VsZWN0aW9uRW5kICE9PSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1NjJCQ1x1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbW91c2VEb3duKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc291cmNlSWQgPSB0aGlzLnBpY2tSZXNvdXJjZUlkKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTUyRDVcdTMwNEJcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX21vdXNlTW92ZShlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdEVuZCh2YWx1ZSk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU5NkUyXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25TZWxlY3Qoc3RhcnQsIGVuZCwgdGhpcy5fcmVzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gZWwgXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHBpY2tWYWx1ZShlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2VsZW1lbnRTZWxlY3RvciArICc6bm90KC5kaXNhYmxlZCknKSAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgPy5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSBlbCBcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrUmVzb3VyY2VJZChlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KCdbZGF0YS1yZXNvdXJjZS1pZF0nKT8uZGF0YXNldFsncmVzb3VyY2VJZCddID8/IG51bGxcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTVFQTdcdTZBMTlcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0geCBYXHU1RUE3XHU2QTE5XG4gICAgICogQHBhcmFtIHkgWVx1NUVBN1x1NkExOVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrVmFsdWVCeVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IpKVxuICAgICAgICAgICAgLmZpbHRlcigoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0LmxlZnQgPD0geCAmJiB4IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0geSAmJiB5IDw9IHJlY3QuYm90dG9tO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdCgwKT8uZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSB2YWx1ZSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IFx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFbGVtZW50QnlWYWx1ZSh2YWx1ZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgJyAnICsgdGhpcy5fZWxlbWVudFNlbGVjdG9yICtcbiAgICAgICAgICAgICdbZGF0YS0nICsgdGhpcy5fcHJvcGVydHlOYW1lICsgJz1cIicgKyB2YWx1ZSArICdcIl0nXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU2NjQyXHUzMDZFXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU4ODY4XHU3OTNBXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLl9vbkRyYXcpIHsgLy8gXHU2M0NGXHU3NTNCXHUzMDkyXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDY3XHU4ODRDXHUzMDQ2XG4gICAgICAgICAgICBjb25zdCBbYmVnaW4sIGVuZF0gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX29uRHJhdyhiZWdpbiwgZW5kLCB0aGlzLl9yZXNvdXJjZUlkKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgW2JlZ2luLCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgK1xuICAgICAgICAgICAgKHRoaXMuX3Jlc291cmNlSWQgIT09IG51bGwgPyAnIFtkYXRhLXJlc291cmNlLWlkPVwiJyArIHRoaXMuX3Jlc291cmNlSWQgKyAnXCJdICcgOiAnICcpICtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRTZWxlY3RvclxuICAgICAgICApLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlbC5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgIGlmIChiZWdpbiA8PSB2YWx1ZSAmJiB2YWx1ZSA8PSBlbmQpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zZWxlY3RlZCcpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufSIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEYXlHcmlkUG9wdXAge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjlcdTMwQ0FcdTMwRkNcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gdGhpcy5jbG9zZSgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk1OEJcdTMwNEZcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwdWJsaWMgb3BlbihlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5idWlsZFBvcHVwKGVsRGF5KTtcbiAgICAgICAgdGhpcy5sYXlvdXRQb3B1cChlbERheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NTg5XHUzMDU4XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIGNsb3NlKCkge1xuICAgICAgICB0aGlzLmZpbmRQb3B1cEVsZW1lbnQoKS5jbGFzc0xpc3QuYWRkKCdnYy1oaWRkZW4nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgZmluZFBvcHVwRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktZ3JpZC1wb3B1cCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1NjlDQlx1N0JDOVxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgYnVpbGRQb3B1cChlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gRE9NXHUzMDkyXHU2OUNCXHU3QkM5XG4gICAgICAgIGNvbnN0IGVsUG9wdXAgPSB0aGlzLmZpbmRQb3B1cEVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgZWxEYXlCb2R5ID0gZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLWRheS1ib2R5JykuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBjb25zdCBlbERheUJvZHlPcmlnID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWJvZHknKTtcbiAgICAgICAgdGhpcy5yZXBsYWNlQWxsRGF5RXZlbnRzKGVsRGF5Qm9keSwgdGhpcy5nZXRBbGxEYXlFdmVudEtleXMoZWxEYXlCb2R5KSk7XG4gICAgICAgIGVsRGF5Qm9keU9yaWcucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWxEYXlCb2R5LCBlbERheUJvZHlPcmlnKTtcbiAgICAgICAgdGhpcy5hZGp1c3RQb3B1cChlbFBvcHVwKTtcblxuICAgICAgICAvLyBcdTY1RTVcdTRFRDhcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgKGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLWRhdGUnKSBhcyBIVE1MRWxlbWVudCkuaW5uZXJUZXh0XG4gICAgICAgICAgICA9IChlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF0ZScpIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFa2V5XHUzMDkyXHU1MTY4XHUzMDY2XHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU2NzJDXHU0RjUzXHU5MEU4XHU1MjA2XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRBbGxEYXlFdmVudEtleXMoZWxEYXk6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZWxEYXkucXVlcnlTZWxlY3RvckFsbCgnLmdjLXRpbWVkLWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXldJykpXG4gICAgICAgICAgICAubWFwKChlbDogSFRNTEVsZW1lbnQpID0+IGVsLmRhdGFzZXQua2V5KVxuICAgICAgICAgICAgLmZpbHRlcigoa2V5OiBzdHJpbmcpID0+IGtleSAhPT0gJycpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCOVx1MzBEQVx1MzBGQ1x1MzBCNVx1MzBGQ1x1MzA5Mlx1NTE2OFx1MzA2Nlx1NTI0QVx1OTY2NFxuICAgICAqIEBwYXJhbSBlbERheUJvZHkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0ga2V5cyB7QXJyYXl9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RWtleVxuICAgICAqL1xuICAgIHByaXZhdGUgcmVwbGFjZUFsbERheUV2ZW50cyhlbERheUJvZHk6IEhUTUxFbGVtZW50LCBrZXlzOiBBcnJheTxhbnk+KSB7XG4gICAgICAgIC8vIFx1NjVFMlx1MzA2Qlx1NTE2NVx1MzA2M1x1MzA2Nlx1MzA0NFx1MzA4Qlx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTI0QVx1OTY2NFx1MzA1OVx1MzA4QlxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20oZWxEYXlCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsOiBIVE1MRWxlbWVudCkgPT4gZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbCkpO1xuXG4gICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFxuICAgICAgICBjb25zdCBlbEFsbERheUV2ZW50cyA9IGVsRGF5Qm9keS5xdWVyeVNlbGVjdG9yKCcuZ2MtYWxsLWRheS1ldmVudHMnKTtcbiAgICAgICAga2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbCA9XG4gICAgICAgICAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKCcuZ2MtYWxsLWRheS1ldmVudHMgLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKVxuICAgICAgICAgICAgICAgICAgICAuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc3RhcnQnLCAnZ2MtZW5kJyk7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKTtcbiAgICAgICAgICAgIGVsQWxsRGF5RXZlbnRzLmFwcGVuZENoaWxkKGVsKTtcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTUxODVcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTg4NjhcdTc5M0FcdTMwOTJcdTVGQUVcdThBQkZcdTdCQzBcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZWxQb3B1cCB7SFRNTEVsZW1lbnR9IFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRqdXN0UG9wdXAoZWxQb3B1cDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gXHU4ODY4XHU3OTNBXHUzMDU5XHUzMDhCXG4gICAgICAgIGVsUG9wdXAuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaGlkZGVuJyk7XG5cbiAgICAgICAgLy8gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFXHU1OTI3XHUzMDREXHUzMDU1XHUzMDkyXHU4MUVBXHU1MkQ1XHUzMDZCXHUzMDU5XHUzMDhCXG4gICAgICAgIGVsUG9wdXAuc3R5bGUud2lkdGggPSBlbFBvcHVwLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcblxuICAgICAgICAvLyBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTgxRUFcdTUyRDVcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgY29uc3QgZWxUaW1lZEV2ZW50cyA9IGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLXRpbWVkLWV2ZW50cycpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBlbFRpbWVkRXZlbnRzLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcblxuICAgICAgICAvLyBcdTRFRDZcdTI2QUFcdUZFMEVcdTRFRjZcdTMwOTJcdTk3NUVcdTg4NjhcdTc5M0FcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgY29uc3QgZWxSZW1haW5pbmcgPSBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1yZW1haW5pbmctY29udGFpbmVyJyk7XG4gICAgICAgIGVsUmVtYWluaW5nLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWxSZW1haW5pbmcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RVx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFx1MzA5Mlx1NjZGNFx1NjVCMFxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgbGF5b3V0UG9wdXAoZWxEYXk6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGVsUG9wdXAgPSB0aGlzLmZpbmRQb3B1cEVsZW1lbnQoKTtcbiAgICAgICAgY29uc3QgcmVjdFBvcHVwID0gZWxQb3B1cC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgcmVjdERheSA9IGVsRGF5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IHJlY3REYXkubGVmdCAtIDEgKyB3aW5kb3cuc2Nyb2xsWDtcbiAgICAgICAgbGV0IHkgPSByZWN0RGF5LnRvcCAtIDEgKyB3aW5kb3cuc2Nyb2xsWTtcbiAgICAgICAgbGV0IHcgPSBNYXRoLm1heChyZWN0RGF5LndpZHRoICogMS4xLCByZWN0UG9wdXAud2lkdGgpO1xuICAgICAgICBsZXQgaCA9IE1hdGgubWF4KHJlY3REYXkuaGVpZ2h0LCByZWN0UG9wdXAuaGVpZ2h0KTtcbiAgICAgICAgaWYgKHggKyB3ID4gd2luZG93LmlubmVyV2lkdGgpIHtcbiAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIHc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHkgKyBoID4gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgICAgICAgICB4ID0gd2luZG93LmlubmVySGVpZ2h0IC0gaDtcbiAgICAgICAgfVxuICAgICAgICBlbFBvcHVwLnN0eWxlLmxlZnQgPSB4ICsgJ3B4JztcbiAgICAgICAgZWxQb3B1cC5zdHlsZS50b3AgPSB5ICsgJ3B4JztcbiAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9IHcgKyAncHgnO1xuICAgICAgICBlbFBvcHVwLnN0eWxlLmhlaWdodCA9IGggKyAncHgnO1xuICAgIH1cbn0iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0ZVV0aWxzIHtcbiAgICAvKipcbiAgICAgKiAxXHU2NUU1XHUzMDZFXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IE1JTExJU0VDT05EU19QRVJfREFZID0gMjQgKiA2MCAqIDYwICogMTAwMFxuXG4gICAgLyoqXG4gICAgICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0b0RhdGVTdHJpbmcoZDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdzdi1TRScpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU2NjQyXHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0b0RhdGVUaW1lU3RyaW5nKGQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gRGF0ZVV0aWxzLnRvRGF0ZVN0cmluZyhkKSArICcgJyArIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVUaW1lU3RyaW5nKFwiZW4tR0JcIilcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkJcdTY1RTVcdTY1NzBcdTMwOTJcdTUyQTBcdTdCOTdcbiAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTUyQTBcdTdCOTdcdTVGOENcdTMwNkVcdTY1RTVcdTRFRDgoXHUzMERGXHUzMEVBXHU3OUQyKVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYWRkRGF5cyhkYXRlOiBzdHJpbmcsIGRheXM6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBEYXRlLnBhcnNlKGRhdGUpICsgZGF5cyAqIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA2RVx1NjVFNVx1NjU3MFx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZEYXlzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZDEgPSBuZXcgRGF0ZShkYXRlMSlcbiAgICAgICAgbGV0IGQyID0gbmV3IERhdGUoZGF0ZTIpXG4gICAgICAgIGQxLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIGQyLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChkMi5nZXRUaW1lKCkgLSBkMS5nZXRUaW1lKCkpIC8gRGF0ZVV0aWxzLk1JTExJU0VDT05EU19QRVJfREFZKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA5Mm1zXHUzMDY3XHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICogQHBhcmFtIGRhdGUxIHtzdHJpbmd9IFx1NjVFNVx1NEVEODFcbiAgICAgKiBAcGFyYW0gZGF0ZTIge3N0cmluZ30gXHU2NUU1XHU0RUQ4MlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGlmZkluTWlsbGlzZWNvbmRzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gRGF0ZS5wYXJzZShkYXRlMikgLSBEYXRlLnBhcnNlKGRhdGUxKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcxRlx1OTU5M1x1MzA2RVx1OTFDRFx1MzA2QVx1MzA4QVx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBzdGFydDEge3N0cmluZ30gXHU2NzFGXHU5NTkzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKiBAcGFyYW0gc3RhcnQyIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzJcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpOiBBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBzdGFydDEgPD0gc3RhcnQyID8gc3RhcnQyIDogc3RhcnQxXG4gICAgICAgIGNvbnN0IGVuZCA9IGVuZDEgPD0gZW5kMiA/IGVuZDEgOiBlbmQyXG4gICAgICAgIHJldHVybiBzdGFydCA8PSBlbmQgPyBbc3RhcnQsIGVuZF0gOiBbbnVsbCwgbnVsbF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwOTJcdTZFMjFcdTMwNTdcdTMwMDFcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdThGRDRcdTMwNTlcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRpbWVTbG90KHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nLCBpbnRlcnZhbDogc3RyaW5nLCB0aW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoRGF0ZS5wYXJzZSh0aW1lID4gZW5kID8gZW5kIDogdGltZSkgLSBEYXRlLnBhcnNlKHN0YXJ0KSkgLyBwYXJzZUludChpbnRlcnZhbCkgLyAxMDAwKTtcbiAgICB9XG59IiwgImltcG9ydCBTZWxlY3RvciBmcm9tIFwiLi9TZWxlY3RvclwiO1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9EYXRlVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXplciB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NUJGRVx1OEM2MVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZXZlbnRTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1x1MzBGQlx1NjY0Mlx1OTU5M1x1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2VsZWN0b3I6IFNlbGVjdG9yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEOFx1MzBDM1x1MzBDMFx1MzBGQ1x1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGVhZEN1cnNvcjogc3RyaW5nID0gJ2djLWN1cnNvci13LXJlc2l6ZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzZcdTMwRkNcdTMwRUJcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RhaWxDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3ItZS1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZzogSFRNTEVsZW1lbnQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU1MjFEXHU2NzFGXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ1N0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU1MjFEXHU2NzFGXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ0VuZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2Qlx1MzAwMVx1NTI0RFx1NTZERVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA1Rlx1NTAyNFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdWYWx1ZTogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NzlGQlx1NTJENVx1OTFDRlx1MzAwMlx1NzlGQlx1NTJENVx1OTFDRlx1MzA0Q1x1NUMxMVx1MzA2QVx1MzA0NFx1MzA2OFx1MzAwMVx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA2OFx1NTIyNFx1NjVBRFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdDb3VudDogbnVtYmVyID0gMDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NjNCNFx1MzA5M1x1MzA2MFx1NEY0RFx1N0Y2RVx1RkYwOFx1NjVFNVx1NEVEOFx1RkYwOVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZ3JhYmJlZDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0dyYWJiaW5nSGVhZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0dyYWJiaW5nVGFpbDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU3NTFGXHU2MjEwXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblByZXZpZXc6IChlbDogSFRNTEVsZW1lbnQsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCBzZWxlY3RvcjogU2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX29uTW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9vbk1vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEMwXHUzMEE2XHUzMEYzXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VEb3duKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLnBpY2tFdmVudChlLnRhcmdldCBhcyBFbGVtZW50KVxuICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTkwOVx1NUY2Mlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IHRydWVcbiAgICAgICAgICAgIGlmICh0aGlzLmhpdEhlYWQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ1RhaWwgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaGl0VGFpbChlLnRhcmdldCBhcyBFbGVtZW50KSkgeyAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTU4MzRcdTU0MDhcdTMwMDFcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwNkZcdTU2RkFcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0dyYWJiaW5nSGVhZCA9IGZhbHNlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFxuICAgICAgICAgICAgdGhpcy5fZ3JhYmJlZCA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBlbFxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdTdGFydCA9IHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuc3RhcnRcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nRW5kID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5lbmRcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHVGRjA4XHU4ODY4XHU3OTNBXHUzMDkyXHU2RDg4XHUzMDU5XHVGRjA5XG4gICAgICAgICAgICB0aGlzLnNldERyYWdnaW5nKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQua2V5LCB0cnVlKVxuXG4gICAgICAgICAgICAvLyBcdTczRkVcdTU3MjhcdTMwNkVcdTY1RTVcdTRFRDhcdTMwOTJcdThBMThcdTkzMzJcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nVmFsdWUgPSBudWxsXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1ODg2OFx1NzkzQVxuICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3KHRoaXMuX2dyYWJiZWQpXG5cbiAgICAgICAgICAgIC8vIFx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKVxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nQ291bnQgPSAwXG5cbiAgICAgICAgICAgIC8vIFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1RlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEUwXHUzMEZDXHUzMEQ2XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VNb3ZlKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSlcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyh2YWx1ZSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gXHUzMERFXHUzMEE2XHUzMEI5XHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDZFXHUzMDVGXHUzMDgxXHUzMDZCXHU3OUZCXHU1MkQ1XHU5MUNGXHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0NvdW50KytcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwQTJcdTMwQzNcdTMwRDdcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmtleVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9zZWxlY3Rvci5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KVxuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHRoaXMuX2dyYWJiZWQgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5kcmFnKHZhbHVlKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2RyYWdnaW5nQ291bnQgPCAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25QcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uUHJldmlldyh0aGlzLl9kcmFnZ2luZywgbnVsbCwgbnVsbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZyhrZXksIGZhbHNlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBudWxsXG4gICAgICAgICAgICB0aGlzLl9pc0dyYWJiaW5nSGVhZCA9IHRoaXMuX2lzR3JhYmJpbmdUYWlsID0gbnVsbFxuICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKVxuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NUJGRVx1OEM2MVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRFdmVudFNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fZXZlbnRTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk4MkRcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTY2NDJcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY3Vyc29yXG4gICAgICovXG4gICAgcHVibGljIHNldEhlYWRDdXJzb3IoY3Vyc29yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5faGVhZEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHU2NjQyXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGN1cnNvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRUYWlsQ3Vyc29yKGN1cnNvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX3RhaWxDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkV2ZW50KGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25FdmVudCA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Nb3ZlKGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uTW92ZSA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTc1MUZcdTYyMTBcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25QcmV2aWV3KGNhbGxiYWNrOiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vblByZXZpZXcgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0RyYWdnaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJhZ2dpbmcgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICovXG4gICAgcHVibGljIGdldEdyYWJiZWREYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ncmFiYmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBpY2tFdmVudChlbDogRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2V2ZW50U2VsZWN0b3IpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRIZWFkKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy1oZWFkJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhpdFRhaWwoZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLXRhaWwnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXREcmFnZ2luZyhrZXk6IHN0cmluZywgZHJhZ2dpbmc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2V2ZW50U2VsZWN0b3IgKyAnW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1Rlx1NTAyNFx1MzA0Q1x1NjU3MFx1NUI1N1x1MzA2RVx1MzA3Rlx1MzA2N1x1NjlDQlx1NjIxMFx1MzA1NVx1MzA4Q1x1MzA2Nlx1MzA0NFx1MzA4Qlx1MzA0Qlx1RkYxRlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc051bWJlcih2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAvXlswLTldKyQvLnRlc3QodmFsdWUpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU0RjREXHU3RjZFXHUzMDZCXHU1QkZFXHUzMDU3XHUzMDY2XHUzMDAxXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NTAyNFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWcodmFsdWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pc051bWJlcih2YWx1ZSlcbiAgICAgICAgICAgID8gdGhpcy5kcmFnTnVtYmVyKHZhbHVlKVxuICAgICAgICAgICAgOiB0aGlzLmRyYWdEYXRlVGltZSh2YWx1ZSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRURcdTMwRDFcdTMwQzZcdTMwQTNcdTMwNENcdTY1RTVcdTY2NDJcdTMwNkVcdTU4MzRcdTU0MDhcdTMwNkJcdTMwMDFcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZHJhZ0RhdGVUaW1lKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgY29uc3QgZGlmZiA9IERhdGVVdGlscy5kaWZmSW5NaWxsaXNlY29uZHModGhpcy5fZ3JhYmJlZCwgdmFsdWUpXG4gICAgICAgIGxldCBzdGFydCA9IERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKERhdGUucGFyc2UodGhpcy5fZHJhZ2dpbmdTdGFydCkgKyAodGhpcy5faXNHcmFiYmluZ0hlYWQgPyBkaWZmIDogMCkpXG4gICAgICAgIGxldCBlbmQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nRW5kKSArICh0aGlzLl9pc0dyYWJiaW5nVGFpbCA/IGRpZmYgOiAwKSlcbiAgICAgICAgc3RhcnQgPSBzdGFydC5zdWJzdHJpbmcoMCwgdGhpcy5fZ3JhYmJlZC5sZW5ndGgpXG4gICAgICAgIGVuZCA9IGVuZC5zdWJzdHJpbmcoMCwgdGhpcy5fZ3JhYmJlZC5sZW5ndGgpXG4gICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBEN1x1MzBFRFx1MzBEMVx1MzBDNlx1MzBBM1x1MzA0Q1x1NjU3MFx1NUI1N1x1MzA2RVx1NTgzNFx1NTQwOFx1MzA2Qlx1MzAwMVx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTUwMjRcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBkcmFnTnVtYmVyKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxudW1iZXI+IHtcbiAgICAgICAgY29uc3QgZGlmZiA9IHBhcnNlSW50KHZhbHVlKSAtIHBhcnNlSW50KHRoaXMuX2dyYWJiZWQpXG4gICAgICAgIGxldCBzdGFydCA9IHBhcnNlSW50KHRoaXMuX2RyYWdnaW5nU3RhcnQpICsgKHRoaXMuX2lzR3JhYmJpbmdIZWFkID8gZGlmZiA6IDApXG4gICAgICAgIGxldCBlbmQgPSBwYXJzZUludCh0aGlzLl9kcmFnZ2luZ0VuZCkgKyAodGhpcy5faXNHcmFiYmluZ1RhaWwgPyBkaWZmIDogMClcbiAgICAgICAgaWYgKHN0YXJ0ID4gZW5kKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQpIHtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGVuZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdUYWlsKSB7XG4gICAgICAgICAgICAgICAgZW5kID0gc3RhcnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3N0YXJ0LCBlbmRdXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUN1cnNvcigpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX2hlYWRDdXJzb3IsIHRoaXMuX3RhaWxDdXJzb3IpXG4gICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCAmJiB0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKCdnYy1jdXJzb3ItbW92ZScpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCh0aGlzLl9oZWFkQ3Vyc29yKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzR3JhYmJpbmdUYWlsKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQodGhpcy5fdGFpbEN1cnNvcilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlUHJldmlldyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZ1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5kcmFnKHZhbHVlKVxuICAgICAgICAgICAgaWYgKHRoaXMuX29uUHJldmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uUHJldmlldyh0aGlzLl9kcmFnZ2luZywgc3RhcnQsIGVuZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nVmFsdWUgPSB2YWx1ZVxuICAgICAgICB9XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vU2VsZWN0b3JcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuL1Jlc2l6ZXJcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFsbERheUV2ZW50IHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RhdGVTZWxlY3RvcjogU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEI2XHUzMEZDXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNpemVyOiBSZXNpemVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEQlx1MzBEMFx1MzBGQ1x1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaG92ZXI6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gZGF0ZVNlbGVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIGRhdGVTZWxlY3RvcjogU2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuX2RhdGVTZWxlY3RvciA9IGRhdGVTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgcHVibGljIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIgPSBuZXcgUmVzaXplcih0aGlzLl9yb290LCB0aGlzLl9kYXRlU2VsZWN0b3IpXG4gICAgICAgICAgICAuc2V0RXZlbnRTZWxlY3RvcignLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIC5zZXRIZWFkQ3Vyc29yKCdnYy1jdXJzb3Itdy1yZXNpemUnKVxuICAgICAgICAgICAgLnNldFRhaWxDdXJzb3IoJ2djLWN1cnNvci1lLXJlc2l6ZScpXG4gICAgICAgICAgICAub25FdmVudCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbk1vdmUoKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vblByZXZpZXcoKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZXZpZXcoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUHJldmlldyhlbCwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZXNpemVyLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDZFXHUzMERFXHUzMEE2XHUzMEI5XHUzMERCXHUzMEQwXHUzMEZDXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGUge0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlT3ZlcihlOiBFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fcmVzaXplci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gXHU3RDQyXHU2NUU1XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDAxXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XHU0RTJEXHUzMDZGXHUzMDAxXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDZBXHUzMDQ0XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLnBpY2tBbGxEYXlFdmVudChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGVsID8gZWwuZGF0YXNldC5rZXkgOiBudWxsO1xuICAgICAgICBpZiAoa2V5ICE9PSB0aGlzLl9ob3Zlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuX2hvdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5faG92ZXIgPSBrZXksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBBbGxEYXlFdmVudCB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIuc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IGNvbnRhaW5lclNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKiBAcmV0dXJucyB7QWxsRGF5RXZlbnR9IFx1ODFFQVx1OEVBQlxuICAgICAqL1xuICAgIHB1YmxpYyBvbkV2ZW50KGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiBBbGxEYXlFdmVudCB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHJldHVybnMge0FsbERheUV2ZW50fSBcdTgxRUFcdThFQUJcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Nb3ZlKGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIHdpdGhvdXRQb3B1cCB7Ym9vbGVhbn0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NjY0XHU1OTE2XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHJldHVybnMge251bGx8SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcGlja0FsbERheUV2ZW50KGVsOiBIVE1MRWxlbWVudCwgd2l0aG91dFBvcHVwOiBib29sZWFuID0gZmFsc2UpOiBudWxsIHwgSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvciArICh3aXRob3V0UG9wdXAgPyAnJyA6ICcsIC5nYy1kYXktZ3JpZC1wb3B1cCcpKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBrZXkge3N0cmluZ30gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFEXHUzMEZDXG4gICAgICogQHBhcmFtIGhvdmVyIHtib29sZWFufSBcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0SG92ZXJBbGxEYXlFdmVudChrZXk6IHN0cmluZywgaG92ZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgKiBAcGFyYW0gZWxFdmVudCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBldmVudFN0YXJ0IHtzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlUHJldmlldyhlbEV2ZW50OiBIVE1MRWxlbWVudCwgZXZlbnRTdGFydDogc3RyaW5nLCBldmVudEVuZDogc3RyaW5nKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy13ZWVrLCAuZ2MtYWxsLWRheS1zZWN0aW9uJykpLmZvckVhY2goZWxXZWVrID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFt3ZWVrU3RhcnQsIHdlZWtFbmRdID0gdGhpcy5nZXRXZWVrUGVyaW9kKGVsV2VlaylcbiAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgJiYgd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtwZXJpb2RTdGFydCwgcGVyaW9kRW5kXSA9IERhdGVVdGlscy5vdmVybGFwUGVyaW9kKGV2ZW50U3RhcnQsIGV2ZW50RW5kLCB3ZWVrU3RhcnQsIHdlZWtFbmQpXG4gICAgICAgICAgICAgICAgaWYgKHBlcmlvZFN0YXJ0ICYmIHBlcmlvZEVuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbFByZXZpZXcgPSBlbFdlZWsucXVlcnlTZWxlY3RvcignLmdjLWRheVtkYXRhLWRhdGU9XCInICsgcGVyaW9kU3RhcnQgKyAnXCJdIC5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKVxuICAgICAgICAgICAgICAgICAgICBpZiAod2Vla1N0YXJ0IDw9IHRoaXMuX3Jlc2l6ZXIuZ2V0R3JhYmJlZERhdGUoKSAmJiB0aGlzLl9yZXNpemVyLmdldEdyYWJiZWREYXRlKCkgPD0gd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMDkyXHU5NThCXHU1OUNCXHUzMDU3XHUzMDVGXHU5MDMxXHUzMDY3XHUzMDZGXHUzMDAxXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMDZFXHU3RTI2XHU0RjREXHU3RjZFXHUzMDkyXHU4QUJGXHU3QkMwXHUzMDU5XHUzMDhCXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEVtcHR5QWxsRGF5RXZlbnRzKGVsUHJldmlldywgdGhpcy5nZXRJbmRleEluUGFyZW50KGVsRXZlbnQpKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZWxFdmVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF5cyA9IERhdGVVdGlscy5kaWZmRGF5cyhwZXJpb2RTdGFydCwgcGVyaW9kRW5kKSArIDFcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RQcmV2aWV3KGVsLCBkYXlzLCBwZXJpb2RTdGFydCA9PT0gZXZlbnRTdGFydCwgcGVyaW9kRW5kID09PSBldmVudEVuZClcbiAgICAgICAgICAgICAgICAgICAgZWxQcmV2aWV3LmFwcGVuZENoaWxkKGVsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWxXZWVrIHtIVE1MRWxlbWVudH0gXHU5MDMxXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0V2Vla1BlcmlvZChlbFdlZWs6IEhUTUxFbGVtZW50KTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGVsRGF5cyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZGF5Om5vdCguZ2MtZGlzYWJsZWQpJykgYXMgTm9kZUxpc3RPZjxIVE1MRWxlbWVudD5cbiAgICAgICAgaWYgKGVsRGF5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW2VsRGF5c1swXS5kYXRhc2V0LmRhdGUsIGVsRGF5c1tlbERheXMubGVuZ3RoIC0gMV0uZGF0YXNldC5kYXRlXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtudWxsLCBudWxsXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIGRheXMge251bWJlcn0gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NUU1XHU2NTcwXG4gICAgICogQHBhcmFtIGlzU3RhcnQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1OTU4Qlx1NTlDQlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBpc0VuZCB7Ym9vbGVhbn0gXHU5MDMxXHU1MTg1XHUzMDZCXHU3RDQyXHU0RTg2XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFkanVzdFByZXZpZXcoZWw6IEhUTUxFbGVtZW50LCBkYXlzOiBudW1iZXIsIGlzU3RhcnQ6IGJvb2xlYW4sIGlzRW5kOiBib29sZWFuKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc3RhcnQnKVxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1lbmQnKVxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA3OyBpKyspIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLScgKyBpICsgJ2RheXMnKVxuICAgICAgICB9XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLScgKyBkYXlzICsgJ2RheXMnKVxuICAgICAgICBpZiAoaXNTdGFydCkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc3RhcnQnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtZW5kJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZET01cdTg5ODFcdTdEMjBcdTMwNENcdTUxNDRcdTVGMUZcdTMwNkVcdTRFMkRcdTMwNjdcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTMwQTRcdTMwRjNcdTMwQzdcdTMwQzNcdTMwQUZcdTMwQjlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0SW5kZXhJblBhcmVudChlbDogSFRNTEVsZW1lbnQpOiBudW1iZXIge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YoZWwpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGXHU2NTcwXHUzMDYwXHUzMDUxXHU3QTdBXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFkZEVtcHR5QWxsRGF5RXZlbnRzKGVsUHJldmlldzogSFRNTEVsZW1lbnQsIGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTUyNEFcdTk2NjRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVtb3ZlUHJldmlldygpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsOiBFbGVtZW50KSA9PiBlbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbC5jbG9uZU5vZGUoZmFsc2UpLCBlbCkpXG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSAnLi9TZWxlY3RvcidcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERheUdyaWRUaW1lZEV2ZW50IHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZGF0ZVNlbGVjdG9yOiBTZWxlY3RvcjtcblxuICAgIC8qKlxuICAgICAqIEFscGluZS5qc1x1MzA2RVx1MzBBNFx1MzBGM1x1MzBCOVx1MzBCRlx1MzBGM1x1MzBCOVxuICAgICAqL1xuICAgIHByaXZhdGUgX2FscGluZTogYW55O1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZHJhZ2dpbmc6IEhUTUxFbGVtZW50ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZDtcblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqIEBwYXJhbSBkYXRlU2VsZWN0b3JcbiAgICAgKiBAcGFyYW0gYWxwaW5lXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIGRhdGVTZWxlY3RvcjogU2VsZWN0b3IsIGFscGluZTogYW55KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3IgPSBkYXRlU2VsZWN0b3I7XG4gICAgICAgIHRoaXMuX2FscGluZSA9IGFscGluZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX29uTW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdzdGFydCcsIHRoaXMuX29uRHJhZ1N0YXJ0LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgdGhpcy5fb25EcmFnT3Zlci5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgdGhpcy5fb25Ecm9wLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbmQnLCB0aGlzLl9vbkRyYWdFbmQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICpcbiAgICAgKiBAcGFyYW0gb25FdmVudCB7RnVuY3Rpb259IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChvbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiBEYXlHcmlkVGltZWRFdmVudCB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBvbkV2ZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvbk1vdmUge0Z1bmN0aW9ufSBcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcmV0dXJucyB7RGF5R3JpZFRpbWVkRXZlbnR9IFx1MzBBNFx1MzBGM1x1MzBCOVx1MzBCRlx1MzBGM1x1MzBCOVxuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUob25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogRGF5R3JpZFRpbWVkRXZlbnQge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBvbk1vdmU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqXG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkNsaWNrKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpPy5kYXRhc2V0LmtleTtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgLy8gXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU1ODM0XHU1NDA4XG4gICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTYyQkNcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25Nb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25EcmFnU3RhcnQoZTogRHJhZ0V2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gZWw7XG4gICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIGVsLmRhdGFzZXQua2V5KTtcbiAgICAgICAgICAgIHRoaXMuX2FscGluZS4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dpbmdDbGFzcygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA0Q1x1ODk4MVx1N0QyMFx1MzA2Qlx1NEU1N1x1MzA2M1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYWdPdmVyKGU6IERyYWdFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5fZGF0ZVNlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3Iuc2VsZWN0KGRhdGUpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJvcChlOiBEcmFnRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHU1MUU2XHU3NDA2XHUzMDkyXHU1QjlGXHU4ODRDXG4gICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9kYXRlU2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRheXMgPSBEYXRlVXRpbHMuZGlmZkRheXModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydCwgZGF0ZSk7XG4gICAgICAgICAgICBpZiAoZGF5cyAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZVV0aWxzLmFkZERheXModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydCwgZGF5cykpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKERhdGVVdGlscy5hZGREYXlzKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuZW5kLCBkYXlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDRDXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHU1OTE2XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJhZ0VuZChlOiBEcmFnRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4OUUzXHU5NjY0XG4gICAgICAgIHRoaXMuX2RhdGVTZWxlY3Rvci5kZXNlbGVjdCgpO1xuXG4gICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE0M1x1MzA2Qlx1NjIzQlx1MzA1OVxuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJyk7XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZET01cdTg5ODFcdTdEMjBcdTMwNkVcdThGRDFcdTMwNEZcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgcGlja0V2ZW50KGVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QoJy5nYy1kYXktZ3JpZCwgLmdjLWRheS1ncmlkLXBvcHVwJylcbiAgICAgICAgICAgID8gKGVsLmNsb3Nlc3QoJy5nYy10aW1lZC1ldmVudC1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTcyQjZcdTYxNEJcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkRHJhZ2dpbmdDbGFzcygpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZy5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpO1xuICAgICAgICB9XG4gICAgfVxufSIsICJpbXBvcnQgRGF5R3JpZExpbWl0IGZyb20gXCIuL21vZHVsZXMvRGF5R3JpZExpbWl0XCI7XG5pbXBvcnQgU2VsZWN0b3IgZnJvbSAnLi9tb2R1bGVzL1NlbGVjdG9yLmpzJ1xuaW1wb3J0IERheUdyaWRQb3B1cCBmcm9tICcuL21vZHVsZXMvRGF5R3JpZFBvcHVwJ1xuaW1wb3J0IEFsbERheUV2ZW50IGZyb20gXCIuL21vZHVsZXMvQWxsRGF5RXZlbnQuanNcIjtcbmltcG9ydCBEYXlHcmlkVGltZWRFdmVudCBmcm9tIFwiLi9tb2R1bGVzL0RheUdyaWRUaW1lZEV2ZW50LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRheUdyaWQoY29tcG9uZW50UGFyYW1ldGVycykge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTg4NjhcdTc5M0FcdTRFRjZcdTY1NzBcdTMwOTJcdTUyMzZcdTk2NTBcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRjNcdTMwRERcdTMwRkNcdTMwQ0RcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIGRheUdyaWRMaW1pdDogRGF5R3JpZExpbWl0LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRjNcdTMwRERcdTMwRkNcdTMwQ0RcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIGRheUdyaWRQb3B1cDogRGF5R3JpZFBvcHVwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIGRhdGVTZWxlY3RvcjogU2VsZWN0b3IsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWRFdmVudDogRGF5R3JpZFRpbWVkRXZlbnQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgYWxsRGF5RXZlbnQ6IEFsbERheUV2ZW50LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICAvLyBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMuZGF5R3JpZFBvcHVwID0gbmV3IERheUdyaWRQb3B1cCh0aGlzLiRlbCk7XG5cbiAgICAgICAgICAgIC8vIFx1ODg2OFx1NzkzQVx1NjU3MFx1MzA5Mlx1NTIzNlx1OTY1MFx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGM1x1MzBERFx1MzBGQ1x1MzBDRFx1MzBGM1x1MzBDOFx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgdGhpcy5kYXlHcmlkTGltaXQgPSBuZXcgRGF5R3JpZExpbWl0KHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRMb2NhbGl6ZWRSZW1haW5pbmdUZXh0KGNvbXBvbmVudFBhcmFtZXRlcnMucmVtYWluaW5nKVxuICAgICAgICAgICAgICAgIC5vblJlbWFpbmluZ1RleHRDbGljaygoZWxEYXkpID0+IHRoaXMuZGF5R3JpZFBvcHVwLm9wZW4oZWxEYXkpKTtcblxuICAgICAgICAgICAgLy8gXHU2NUU1XHU0RUQ4XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3RvciA9IG5ldyBTZWxlY3Rvcih0aGlzLiRlbClcbiAgICAgICAgICAgICAgICAuc2V0Q29udGFpbmVyU2VsZWN0b3IoJy5nYy1kYXktZ3JpZCcpXG4gICAgICAgICAgICAgICAgLnNldEVsZW1lbnRTZWxlY3RvcignLmdjLWRheScpXG4gICAgICAgICAgICAgICAgLnNldFByb3BlcnR5TmFtZSgnZGF0ZScpXG4gICAgICAgICAgICAgICAgLm9uU2VsZWN0KChzdGFydCwgZW5kLCByZXNvdXJjZUlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25EYXRlKHN0YXJ0ICsgJyAwMDowMDowMCcsIGVuZCArICcgMjM6NTk6NTknLCByZXNvdXJjZUlkKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMuYWxsRGF5RXZlbnQgPSBuZXcgQWxsRGF5RXZlbnQodGhpcy4kZWwsIHRoaXMuZGF0ZVNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLWRheS1ncmlkJylcbiAgICAgICAgICAgICAgICAub25Nb3ZlKChrZXksIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uRXZlbnQoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMudGltZWRFdmVudCA9IG5ldyBEYXlHcmlkVGltZWRFdmVudCh0aGlzLiRlbCwgdGhpcy5kYXRlU2VsZWN0b3IsIHRoaXMpXG4gICAgICAgICAgICAgICAgLm9uRXZlbnQoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uTW92ZSgoa2V5LCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25Nb3ZlKGtleSwgc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDZFXHU3NjdCXHU5MzMyXG4gICAgICAgICAgICB0aGlzLmRheUdyaWRQb3B1cC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50LnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3Rvci5yZWdpc3RlckNhbGxiYWNrcygpO1xuXG4gICAgICAgICAgICAvLyBMaXZld2lyZVx1MzA0Qlx1MzA4OVx1MzA2RVx1NUYzN1x1NTIzNlx1NjZGNFx1NjVCMFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgTGl2ZXdpcmUub24oJ3JlZnJlc2hDYWxlbmRhcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB0aGlzLmRheUdyaWRMaW1pdC51cGRhdGVMYXlvdXQodHJ1ZSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7OztBQUFBLElBQXFCLGdCQUFyQixNQUFxQixjQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXlEOUIsWUFBWSxNQUFtQjtBQXBEL0I7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFBUTtBQU1SO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsaUJBQXdCO0FBTWhDO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsaUJBQXdCO0FBTWhDO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsZ0JBQXVCO0FBTS9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsMkJBQWtDO0FBSzFDO0FBQUE7QUFBQTtBQUFBLHdCQUFRO0FBd0JKLFNBQUssUUFBUTtBQUNiLFNBQUssS0FBSztBQUFBLEVBQ2Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtPLE9BQU87QUFDVixTQUFLLGFBQWE7QUFDbEIsV0FBTyxpQkFBaUIsVUFBVSxLQUFLLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFDM0QsU0FBSyxNQUFNLGlCQUFpQixTQUFTLEtBQUssU0FBUyxLQUFLLElBQUksQ0FBQztBQUM3RCxTQUFLLE1BQU0saUJBQWlCLGFBQWEsS0FBSyxhQUFhLEtBQUssSUFBSSxDQUFDO0FBQUEsRUFDekU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTU8sMEJBQTBCLHdCQUFnQztBQUM3RCxTQUFLLDBCQUEwQjtBQUMvQixXQUFP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QjtBQUNqRCxTQUFPO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJSCxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxjQUFjO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLZCxZQUFZO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLWixhQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLYixPQUFPO0FBRUgsV0FBSyxlQUFlLElBQUksYUFBYSxLQUFLLEdBQUc7QUFHN0MsV0FBSyxlQUFlLElBQUksYUFBYSxLQUFLLEdBQUcsRUFDeEMsMEJBQTBCLG9CQUFvQixTQUFTLEVBQ3ZELHFCQUFxQixDQUFDLFVBQVUsS0FBSyxhQUFhLEtBQUssS0FBSyxDQUFDO0FBR2xFLFdBQUssZUFBZSxJQUFJLFNBQVMsS0FBSyxHQUFHLEVBQ3BDLHFCQUFxQixjQUFjLEVBQ25DLG1CQUFtQixTQUFTLEVBQzVCLGdCQUFnQixNQUFNLEVBQ3RCLFNBQVMsQ0FBQyxPQUFPLEtBQUssZUFBZTtBQUNsQyxhQUFLLE1BQU0sT0FBTyxRQUFRLGFBQWEsTUFBTSxhQUFhLFVBQVU7QUFBQSxNQUN4RSxDQUFDO0FBR0wsV0FBSyxjQUFjLElBQUksWUFBWSxLQUFLLEtBQUssS0FBSyxZQUFZLEVBQ3pELHFCQUFxQixjQUFjLEVBQ25DLE9BQU8sQ0FBQyxLQUFLLE9BQU8sUUFBUTtBQUN6QixhQUFLLE1BQU0sT0FBTyxLQUFLLE9BQU8sR0FBRztBQUFBLE1BQ3JDLENBQUMsRUFDQSxRQUFRLENBQUMsUUFBUTtBQUNkLGFBQUssTUFBTSxRQUFRLEdBQUc7QUFBQSxNQUMxQixDQUFDO0FBR0wsV0FBSyxhQUFhLElBQUksa0JBQWtCLEtBQUssS0FBSyxLQUFLLGNBQWMsSUFBSSxFQUNwRSxRQUFRLENBQUMsUUFBUTtBQUNkLGFBQUssTUFBTSxRQUFRLEdBQUc7QUFBQSxNQUMxQixDQUFDLEVBQ0EsT0FBTyxDQUFDLEtBQUssT0FBTyxRQUFRO0FBQ3pCLGFBQUssTUFBTSxPQUFPLEtBQUssT0FBTyxHQUFHO0FBQUEsTUFDckMsQ0FBQztBQUdMLFdBQUssYUFBYSxrQkFBa0I7QUFDcEMsV0FBSyxZQUFZLGtCQUFrQjtBQUNuQyxXQUFLLFdBQVcsa0JBQWtCO0FBQ2xDLFdBQUssYUFBYSxrQkFBa0I7QUFHcEMsZUFBUyxHQUFHLG1CQUFtQixNQUFNO0FBQ2pDLGFBQUssVUFBVSxNQUFNLEtBQUssYUFBYSxhQUFhLElBQUksQ0FBQztBQUFBLE1BQzdELENBQUM7QUFBQSxJQUNMO0FBQUEsRUFDSjtBQUNKOyIsCiAgIm5hbWVzIjogWyJiZWdpbiIsICJlbmQiXQp9Cg==
