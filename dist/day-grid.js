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
     * 選択処理が有効かどうか
     * @private
     */
    __publicField(this, "_enabled", true);
    /**
     * 複数選択が有効かどうか
     * @private
     */
    __publicField(this, "_multiple", false);
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
    this._root.addEventListener("click", this._click.bind(this));
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
   * 選択処理が有効かどうかを設定する。
   * @param enabled
   */
  setEnabled(enabled) {
    this._enabled = enabled;
    return this;
  }
  /**
   * 複数選択が有効かどうかを設定する。
   * @param multiple
   */
  setMultiple(multiple) {
    this._multiple = multiple;
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
   * クリックした時の処理
   * @param e
   */
  _click(e) {
    if (!this._enabled) {
      return;
    }
    const value = this.pickValueByPosition(e.x, e.y);
    if (value) {
      this._resourceId = this.pickResourceId(e.target);
      if (this._onSelect) {
        this._onSelect(value, value, this._resourceId);
      }
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスを押した時の処理
   * @param e
   */
  _mouseDown(e) {
    if (!this._enabled || !this._multiple) {
      return;
    }
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
    if (this.isSelected()) {
      const value = this.pickValueByPosition(e.x, e.y);
      if (value) {
        this.selectEnd(value);
        e.stopImmediatePropagation();
      }
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
    }).at(0)?.dataset[this._propertyName] ?? null;
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
      const [start2, end2] = this.getSelection();
      return this._onDraw(start2, end2, this._resourceId);
    }
    let [start, end] = this.getSelection();
    this._root.querySelectorAll(
      this._containerSelector + (this._resourceId !== null ? ' [data-resource-id="' + this._resourceId + '"] ' : " ") + this._elementSelector
    ).forEach((el) => {
      const value = el.dataset[this._propertyName];
      if (start <= value && value <= end) {
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
    return Date.parse(date.substring(0, 10) + " 00:00:00") + days * _DateUtils.MILLISECONDS_PER_DAY;
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
   *
   * @param start {string} 開始時間
   * @param end {string} 終了時間
   * @param interval {string} 時間間隔(秒数)
   * @param time {string} 時間
   * @returns {number} 何番目か
   */
  static timeSlot(start, end, interval, time) {
    return Math.floor((Date.parse(time > end ? end : time) - Date.parse(start)) / parseInt(interval) / 1e3);
  }
  /**
   * 日時の時間を変更する。
   *
   * @param dateTime {string} 日時
   * @param time {string} 時間
   * @returns {string} 日時
   */
  static setTimeOfDateTime(dateTime, time) {
    return dateTime.substring(0, 10) + " " + time;
  }
  /**
   * 時間を分数に変換する。
   */
  static toMinutes(time) {
    const [hour, minute] = time.split(":");
    return parseInt(hour) * 60 + parseInt(minute);
  }
  /**
   * 時間を秒数に変換する
   */
  static toSeconds(time) {
    const [h, i, s] = time.split(":");
    return (parseInt(h) * 60 + parseInt(i)) * 60 + parseInt(s);
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
     * 一日の時間間隔
     * @protected
     */
    __publicField(this, "_unit", 1);
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
    this._root.addEventListener("click", this._onClick.bind(this));
  }
  /**
   * クリックイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を開始したかどうか
   */
  _onClick(e) {
    const el = this.pickEvent(e.target);
    if (el && el.dataset.canClick === "true" && el.dataset.canMove === "false" && el.dataset.canMove === "false") {
      if (this._onEvent) {
        this._onEvent(el.dataset.key);
      }
      e.stopImmediatePropagation();
    }
  }
  /**
   * マウスダウンイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を開始したかどうか
   */
  _onMouseDown(e) {
    const el = this.pickEvent(e.target);
    if (el && (el.dataset.canMove === "true" || el.dataset.canResize === "true")) {
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
      this.setDraggingClass(this._dragging.dataset.key, true);
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
      if (value !== null) {
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
      if (value !== null && this._grabbed !== value) {
        const [start, end] = this.drag(value);
        if (this._onMove && start !== null && end !== null) {
          this._onMove(key, start, end);
        }
      } else if (this._draggingCount < 3) {
        if (this._dragging.dataset.canClick === "true") {
          if (this._onEvent) {
            this._onEvent(key);
          }
        }
      } else {
        if (this._onPreview) {
          this._onPreview(this._dragging, null, null);
        }
        this.setDraggingClass(key, false);
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
   * 一日の時間間隔を設定する
   * @param unit {number} 一日の時間間隔
   */
  setUnit(unit) {
    this._unit = unit;
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
  setDraggingClass(key, dragging) {
    this._root.querySelectorAll(this._eventSelector + '[data-key="' + key + '"]').forEach((el) => {
      if (dragging) {
        el.classList.add("gc-dragging");
      } else {
        el.classList.remove("gc-dragging");
      }
    });
  }
  /**
   * 現在、ドラッグ中の予定は、終日予定かどうか
   */
  isAllDayDragging() {
    return this._dragging?.dataset.allDay === "true";
  }
  /**
   * 指定されたパラメータが整数値かどうか
   */
  isNumber(value) {
    return /^\d+$/.test(value);
  }
  /**
   * 変更後の期間を取得する
   * @param value {string} マウスの位置の日付
   * @returns {Array} 変更後の期間
   */
  drag(value) {
    return this.isNumber(value) ? this.dragNumber(value) : this.dragDateTime(value);
  }
  /**
   * 日時のパラメータに対して、変更後の期間を取得する
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
   * 整数値のパラメータに対して、変更後の期間を取得する
   * @param value {string} マウスの位置の日付
   * @returns {Array} 変更後の期間
   */
  dragNumber(value) {
    const diff = parseInt(value) - parseInt(this._grabbed);
    let start = parseInt(this._draggingStart) + (this._isGrabbingHead ? diff : 0);
    let end = parseInt(this._draggingEnd) + (this._isGrabbingTail ? diff : 0);
    if (this.isAllDayDragging()) {
      start = Math.floor(start / this._unit) * this._unit;
      end = Math.floor(end / this._unit) * this._unit;
    }
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
  /**
   * 頭部分を掴んでいるかどうか
   * @protected
   */
  isGrabbingHead() {
    return this._isGrabbingHead;
  }
  /**
   * 末尾部分を掴んでいるかどうか
   * @protected
   */
  isGrabbingTail() {
    return this._isGrabbingTail;
  }
  /**
   * 頭部分と末尾部分を掴んでいるかどうか
   * @protected
   */
  isGrabbingBody() {
    return this._isGrabbingHead && this._isGrabbingTail;
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
    const el = this.pickEvent(e.target);
    if (el?.dataset.canClick === "true") {
      const key = el?.dataset.key;
      if (key) {
        if (this._onEvent) {
          this._onEvent(key);
        }
        e.stopImmediatePropagation();
      }
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
      this.dateSelector = new Selector(this.$el).setContainerSelector(".gc-day-grid").setElementSelector(".gc-day").setPropertyName("date").setEnabled(componentParameters.canSelectDates).setMultiple(componentParameters.canSelectMultipleDates).onSelect((start, end, resourceId) => {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF5R3JpZExpbWl0LnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1NlbGVjdG9yLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL0RheUdyaWRQb3B1cC50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9EYXRlVXRpbHMudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvUmVzaXplci50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9BbGxEYXlFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9EYXlHcmlkVGltZWRFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvZGF5LWdyaWQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGNsYXNzIERheUdyaWRMaW1pdCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFx1MzA2RVx1MzBBRFx1MzBFM1x1MzBDM1x1MzBCN1x1MzBFNVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdmlzaWJsZUNvdW50OiBudW1iZXIgPSAwO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9kYXlUb3BIZWlnaHQ6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdUZGMTFcdTRFRjZcdThGQkFcdTMwOEFcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2V2ZW50SGVpZ2h0OiBudW1iZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEM2XHUzMEFEXHUzMEI5XHUzMEM4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0OiBzdHJpbmcgPSAnKyA6Y291bnQgbW9yZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vblJlbWFpbmluZ1RleHRDbGljazogKGVsRGF5OiBIVE1MRWxlbWVudCkgPT4gdm9pZDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBEQVlfU0VMRUNUT1IgPSAnLmdjLWRheXMgLmdjLWRheSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTRFMEFcdTkwRThcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgREFZX1RPUF9TRUxFQ1RPUiA9ICcuZ2MtZGF5LXRvcCc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiAuZ2MtYWxsLWRheS1ldmVudHNcdTMwNkJcdTMwNkZcdTMwMDFcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwNkJcdTMwNjBcdTMwNTFcdTMwQzdcdTMwRkNcdTMwQkZcdTMwNENcdTUxNjVcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTMwNkVcdTMwNjBcdTMwNENcdTMwMDFcbiAgICAgKiAuZ2MtdGltZWQtZXZlbnRzXHUzMDZCXHUzMDZGXHUzMDAxXHU1MTY4XHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1NDJCXHUzMDgxXHUzMDY2XHUzMDAxXHU1MTY4XHUzMDY2XHUzMDZFXHU2NUU1XHUzMDZCXHUzMEM3XHUzMEZDXHUzMEJGXHUzMDRDXHU1MTY1XHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IEFOWV9FVkVOVF9TRUxFQ1RPUiA9ICcuZ2MtdGltZWQtZXZlbnRzID4gLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lciwgLmdjLXRpbWVkLWV2ZW50cyA+IC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcic7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgcHVibGljIGluaXQoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTGF5b3V0KClcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwNkVcdTg4NjhcdTc5M0FcdTMwQzZcdTMwQURcdTMwQjlcdTMwQzhcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gbG9jYWxpemVkUmVtYWluaW5nVGV4dFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRMb2NhbGl6ZWRSZW1haW5pbmdUZXh0KGxvY2FsaXplZFJlbWFpbmluZ1RleHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0ID0gbG9jYWxpemVkUmVtYWluaW5nVGV4dDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIG9uUmVtYWluaW5nVGV4dENsaWNrXG4gICAgICovXG4gICAgcHVibGljIG9uUmVtYWluaW5nVGV4dENsaWNrKG9uUmVtYWluaW5nVGV4dENsaWNrOiAoZWxEYXk6IEhUTUxFbGVtZW50KSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuX29uUmVtYWluaW5nVGV4dENsaWNrID0gb25SZW1haW5pbmdUZXh0Q2xpY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uUmVzaXplKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUxheW91dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25DbGljayhlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVtYWluaW5nVGV4dEVsZW1lbnQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblJlbWFpbmluZ1RleHRDbGljaykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uUmVtYWluaW5nVGV4dENsaWNrKHRoaXMucGlja0RheShlLnRhcmdldCBhcyBFbGVtZW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU2MkJDXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVtYWluaW5nVGV4dEVsZW1lbnQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwOTJcdTUxOERcdThBMDhcdTdCOTdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIFx1NUYzN1x1NTIzNlx1NzY4NFx1MzA2Qlx1NTE4RFx1OEEwOFx1N0I5N1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlTGF5b3V0KGZvcmNlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgdmlzaWJsZUNvdW50ID0gdGhpcy5nZXRWaXNpYmxlQ291bnQoKTtcbiAgICAgICAgaWYgKHRoaXMuX3Zpc2libGVDb3VudCAhPT0gdmlzaWJsZUNvdW50IHx8IGZvcmNlKSB7XG4gICAgICAgICAgICB0aGlzLl92aXNpYmxlQ291bnQgPSB2aXNpYmxlQ291bnQ7XG4gICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoRGF5R3JpZExpbWl0LkRBWV9TRUxFQ1RPUikuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGF5KGRheSBhcyBIVE1MRWxlbWVudCwgdmlzaWJsZUNvdW50KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTg4NjhcdTc5M0FcdTMwNTlcdTMwOEJcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTY2RjRcdTY1QjBcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gdmlzaWJsZUNvdW50IHtudW1iZXJ9IFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlRGF5KGVsRGF5OiBIVE1MRWxlbWVudCwgdmlzaWJsZUNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZXZlbnRDb3VudCA9IHRoaXMuZ2V0RXZlbnRDb3VudChlbERheSk7XG4gICAgICAgIGNvbnN0IGxpbWl0Q291bnQgPSBldmVudENvdW50IDwgdmlzaWJsZUNvdW50ID8gZXZlbnRDb3VudCA6IHZpc2libGVDb3VudCAtIDE7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ0NvdW50ID0gZXZlbnRDb3VudCAtIGxpbWl0Q291bnQ7XG4gICAgICAgIHRoaXMuc2V0VGltZWRFdmVudHNIZWlnaHQoZWxEYXksIHRoaXMuZ2V0RXZlbnRIZWlnaHQoKSAqIGxpbWl0Q291bnQpO1xuICAgICAgICB0aGlzLmxpbWl0QWxsRGF5RXZlbnRzKGVsRGF5LCBsaW1pdENvdW50IC0gKHJlbWFpbmluZ0NvdW50ID8gMSA6IDApKTtcbiAgICAgICAgdGhpcy5zZXRSZW1haW5pbmdDb3VudChlbERheSwgcmVtYWluaW5nQ291bnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFdmVudENvdW50KGVsRGF5OiBIVE1MRWxlbWVudCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBlbERheS5xdWVyeVNlbGVjdG9yQWxsKERheUdyaWRMaW1pdC5BTllfRVZFTlRfU0VMRUNUT1IpLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEV2ZW50SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudEhlaWdodCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRIZWlnaHQgPSB0aGlzLmdldEVsZW1lbnRIZWlnaHQoRGF5R3JpZExpbWl0LkFOWV9FVkVOVF9TRUxFQ1RPUik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50SGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVxuICAgICAqIEBwYXJhbSBoZWlnaHQge251bWJlcn0gXHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRUaW1lZEV2ZW50c0hlaWdodChlbERheTogSFRNTEVsZW1lbnQsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIChlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJykgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXREYXlIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudEhlaWdodChEYXlHcmlkTGltaXQuREFZX1NFTEVDVE9SKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTU0MDRcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldERheVRvcEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fZGF5VG9wSGVpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXlUb3BIZWlnaHQgPSB0aGlzLmdldEVsZW1lbnRIZWlnaHQoRGF5R3JpZExpbWl0LkRBWV9UT1BfU0VMRUNUT1IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXlUb3BIZWlnaHRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEVsZW1lbnRIZWlnaHQoc2VsZWN0b3I6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAodGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSBhcyBIVE1MRWxlbWVudCkub2Zmc2V0SGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NTQwNFx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RGF5Qm9keUhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXlIZWlnaHQoKSAtIHRoaXMuZ2V0RGF5VG9wSGVpZ2h0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRWaXNpYmxlQ291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXREYXlCb2R5SGVpZ2h0KCkgLyB0aGlzLmdldEV2ZW50SGVpZ2h0KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODg2OFx1NzkzQVx1MzBGQlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBsaW1pdCB7bnVtYmVyfSBcdTg4NjhcdTc5M0FcdTUzRUZcdTgwRkRcdTMwNkFcdTRFODhcdTVCOUFcdTY1NzBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxpbWl0QWxsRGF5RXZlbnRzKGVsRGF5OiBIVE1MRWxlbWVudCwgbGltaXQ6IG51bWJlcikge1xuICAgICAgICBlbERheVxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsRXZlbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IDw9IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGVsRXZlbnQuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbEV2ZW50LmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIHJlbWFpbmluZ0NvdW50IHtudW1iZXJ9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0UmVtYWluaW5nQ291bnQoZWxEYXk6IEhUTUxFbGVtZW50LCByZW1haW5pbmdDb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGVsUmVtYWluaW5nID0gZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLXJlbWFpbmluZy1jb250YWluZXInKTtcbiAgICAgICAgaWYgKHJlbWFpbmluZ0NvdW50ID4gMCkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgZWxSZW1haW5pbmcuY2hpbGRyZW5bMF0uaW5uZXJUZXh0ID0gdGhpcy5tYWtlUmVtYWluaW5nVGV4dChyZW1haW5pbmdDb3VudCk7XG4gICAgICAgICAgICBlbFJlbWFpbmluZy5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsUmVtYWluaW5nLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEM2XHUzMEFEXHUzMEI5XHUzMEM4XHUzMDkyXHU0RjVDXHU2MjEwXG4gICAgICogQHBhcmFtIHJlbWFpbmluZ0NvdW50IHtudW1iZXJ9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA2RVx1ODg2OFx1NzkzQVx1MzBDNlx1MzBBRFx1MzBCOVx1MzBDOFxuICAgICAqL1xuICAgIHByaXZhdGUgbWFrZVJlbWFpbmluZ1RleHQocmVtYWluaW5nQ291bnQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0LnJlcGxhY2UoJzpjb3VudCcsIFN0cmluZyhyZW1haW5pbmdDb3VudCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7RWxlbWVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgaXNSZW1haW5pbmdUZXh0RWxlbWVudChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWwuY2xvc2VzdCgnLmdjLXJlbWFpbmluZy1jb250YWluZXInKSAmJiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0VsZW1lbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBwaWNrRGF5KGVsOiBFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gZWwuY2xvc2VzdCgnLmdjLWRheScpIGFzIEhUTUxFbGVtZW50O1xuICAgIH1cbn0iLCAiLyoqXG4gKiBEYXRlVGltZVNlbGVjdG9yXG4gKlxuICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU5MDc4XHU2MjlFXHU2QTVGXHU4MEZEXHUzMDkyXHU2M0QwXHU0RjlCXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZCXHUzMDAxXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU2NENEXHU0RjVDXHUzMDZCXHUzMDg4XHUzMDhCXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU2MzA3XHU1QjlBXHUzMDkyXHU4ODRDXHUzMDQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdG9yIHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wcm9wZXJ0eU5hbWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NlbGVjdGlvblN0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3Rpb25FbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVzb3VyY2VJZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBcdTg5MDdcdTY1NzBcdTkwNzhcdTYyOUVcdTMwNENcdTY3MDlcdTUyQjlcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX211bHRpcGxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTYzQ0ZcdTc1M0JcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYXc6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA0Q1x1NTkwOVx1NjZGNFx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbGVtZW50U2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RWxlbWVudFNlbGVjdG9yKGVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3IgPSBlbGVtZW50U2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA5Mlx1NjMwMVx1MzA2NFx1MzBEN1x1MzBFRFx1MzBEMVx1MzBDNlx1MzBBM1x1NTQwRFx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMihkYXRhLWRhdGVcdTMwNkFcdTMwODlcdTMwMDFkYXRlKVxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eU5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlOYW1lKHByb3BlcnR5TmFtZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0Qlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbmFibGVkXG4gICAgICovXG4gICAgcHVibGljIHNldEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1ODkwN1x1NjU3MFx1OTA3OFx1NjI5RVx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0Qlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBtdWx0aXBsZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRNdWx0aXBsZShtdWx0aXBsZTogYm9vbGVhbik6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fbXVsdGlwbGUgPSBtdWx0aXBsZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU2M0NGXHU3NTNCXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIG9uRHJhd1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkRyYXcob25EcmF3OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25EcmF3ID0gb25EcmF3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNENcdTU5MDlcdTY2RjRcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gb25TZWxlY3RcbiAgICAgKi9cbiAgICBwdWJsaWMgb25TZWxlY3Qob25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25TZWxlY3QgPSBvblNlbGVjdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3QodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uU3RhcnQgPSB0aGlzLl9zZWxlY3Rpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3RFbmQodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uRW5kID0gdmFsdWU7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1ODlFM1x1OTY2NFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3QobnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2VsZWN0aW9uKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLl9zZWxlY3Rpb25TdGFydCwgdGhpcy5fc2VsZWN0aW9uRW5kXS5zb3J0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3M0ZFXHU1NzI4XHUzMDAxXHU5MDc4XHU2MjlFXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25TdGFydCAhPT0gbnVsbCAmJiB0aGlzLl9zZWxlY3Rpb25FbmQgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jbGljayhlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvdXJjZUlkID0gdGhpcy5waWNrUmVzb3VyY2VJZChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblNlbGVjdCh2YWx1ZSwgdmFsdWUsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1NjJCQ1x1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbW91c2VEb3duKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVkIHx8ICF0aGlzLl9tdWx0aXBsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvdXJjZUlkID0gdGhpcy5waWNrUmVzb3VyY2VJZChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCh2YWx1ZSk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU1MkQ1XHUzMDRCXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RW5kKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU5NkUyXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25TZWxlY3Qoc3RhcnQsIGVuZCwgdGhpcy5fcmVzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gZWwgXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHBpY2tWYWx1ZShlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2VsZW1lbnRTZWxlY3RvciArICc6bm90KC5kaXNhYmxlZCknKSAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgPy5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSBlbCBcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrUmVzb3VyY2VJZChlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KCdbZGF0YS1yZXNvdXJjZS1pZF0nKT8uZGF0YXNldFsncmVzb3VyY2VJZCddID8/IG51bGxcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTVFQTdcdTZBMTlcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0geCBYXHU1RUE3XHU2QTE5XG4gICAgICogQHBhcmFtIHkgWVx1NUVBN1x1NkExOVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrVmFsdWVCeVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IpKVxuICAgICAgICAgICAgLmZpbHRlcigoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0LmxlZnQgPD0geCAmJiB4IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0geSAmJiB5IDw9IHJlY3QuYm90dG9tO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdCgwKT8uZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdID8/IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHVibGljIGdldEVsZW1lbnRCeVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IgK1xuICAgICAgICAgICAgJ1tkYXRhLScgKyB0aGlzLl9wcm9wZXJ0eU5hbWUgKyAnPVwiJyArIHZhbHVlICsgJ1wiXSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTY2NDJcdTMwNkVcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTg4NjhcdTc5M0FcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX29uRHJhdykgeyAvLyBcdTYzQ0ZcdTc1M0JcdTMwOTJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwNjdcdTg4NENcdTMwNDZcbiAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb25EcmF3KHN0YXJ0LCBlbmQsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciArXG4gICAgICAgICAgICAodGhpcy5fcmVzb3VyY2VJZCAhPT0gbnVsbCA/ICcgW2RhdGEtcmVzb3VyY2UtaWQ9XCInICsgdGhpcy5fcmVzb3VyY2VJZCArICdcIl0gJyA6ICcgJykgK1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFNlbGVjdG9yXG4gICAgICAgICkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsLmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgaWYgKHN0YXJ0IDw9IHZhbHVlICYmIHZhbHVlIDw9IGVuZCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59IiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERheUdyaWRQb3B1cCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCOVx1MzBDQVx1MzBGQ1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTU4Qlx1MzA0RlxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHB1YmxpYyBvcGVuKGVsRGF5OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmJ1aWxkUG9wdXAoZWxEYXkpO1xuICAgICAgICB0aGlzLmxheW91dFBvcHVwKGVsRGF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk1ODlcdTMwNThcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuZmluZFBvcHVwRWxlbWVudCgpLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBmaW5kUG9wdXBFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvcignLmdjLWRheS1ncmlkLXBvcHVwJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU2OUNCXHU3QkM5XG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBidWlsZFBvcHVwKGVsRGF5OiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBET01cdTMwOTJcdTY5Q0JcdTdCQzlcbiAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuZmluZFBvcHVwRWxlbWVudCgpO1xuICAgICAgICBjb25zdCBlbERheUJvZHkgPSBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWJvZHknKS5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGVsRGF5Qm9keU9yaWcgPSBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktYm9keScpO1xuICAgICAgICB0aGlzLnJlcGxhY2VBbGxEYXlFdmVudHMoZWxEYXlCb2R5LCB0aGlzLmdldEFsbERheUV2ZW50S2V5cyhlbERheUJvZHkpKTtcbiAgICAgICAgZWxEYXlCb2R5T3JpZy5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbERheUJvZHksIGVsRGF5Qm9keU9yaWcpO1xuICAgICAgICB0aGlzLmFkanVzdFBvcHVwKGVsUG9wdXApO1xuXG4gICAgICAgIC8vIFx1NjVFNVx1NEVEOFx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAoZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF0ZScpIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHRcbiAgICAgICAgICAgID0gKGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXRlJykgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVrZXlcdTMwOTJcdTUxNjhcdTMwNjZcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEFsbERheUV2ZW50S2V5cyhlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleV0nKSlcbiAgICAgICAgICAgIC5tYXAoKGVsOiBIVE1MRWxlbWVudCkgPT4gZWwuZGF0YXNldC5rZXkpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXk6IHN0cmluZykgPT4ga2V5ICE9PSAnJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEI5XHUzMERBXHUzMEZDXHUzMEI1XHUzMEZDXHUzMDkyXHU1MTY4XHUzMDY2XHU1MjRBXHU5NjY0XG4gICAgICogQHBhcmFtIGVsRGF5Qm9keSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBrZXlzIHtBcnJheX0gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFa2V5XG4gICAgICovXG4gICAgcHJpdmF0ZSByZXBsYWNlQWxsRGF5RXZlbnRzKGVsRGF5Qm9keTogSFRNTEVsZW1lbnQsIGtleXM6IEFycmF5PGFueT4pIHtcbiAgICAgICAgLy8gXHU2NUUyXHUzMDZCXHU1MTY1XHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1MjRBXHU5NjY0XHUzMDU5XHUzMDhCXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbShlbERheUJvZHkucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJykpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWw6IEhUTUxFbGVtZW50KSA9PiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKSk7XG5cbiAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXG4gICAgICAgIGNvbnN0IGVsQWxsRGF5RXZlbnRzID0gZWxEYXlCb2R5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cycpO1xuICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID1cbiAgICAgICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcsICdnYy1lbmQnKTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpO1xuICAgICAgICAgICAgZWxBbGxEYXlFdmVudHMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1NTE4NVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NUZBRVx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBlbFBvcHVwIHtIVE1MRWxlbWVudH0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGp1c3RQb3B1cChlbFBvcHVwOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBcdTg4NjhcdTc5M0FcdTMwNTlcdTMwOEJcbiAgICAgICAgZWxQb3B1cC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKTtcblxuICAgICAgICAvLyBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkVcdTU5MjdcdTMwNERcdTMwNTVcdTMwOTJcdTgxRUFcdTUyRDVcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9IGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXG4gICAgICAgIC8vIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1ODFFQVx1NTJENVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICBjb25zdCBlbFRpbWVkRXZlbnRzID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGVsVGltZWRFdmVudHMuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXG4gICAgICAgIC8vIFx1NEVENlx1MjZBQVx1RkUwRVx1NEVGNlx1MzA5Mlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICBjb25zdCBlbFJlbWFpbmluZyA9IGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLXJlbWFpbmluZy1jb250YWluZXInKTtcbiAgICAgICAgZWxSZW1haW5pbmcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbFJlbWFpbmluZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFXHUzMEVDXHUzMEE0XHUzMEEyXHUzMEE2XHUzMEM4XHUzMDkyXHU2NkY0XHU2NUIwXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBsYXlvdXRQb3B1cChlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuZmluZFBvcHVwRWxlbWVudCgpO1xuICAgICAgICBjb25zdCByZWN0UG9wdXAgPSBlbFBvcHVwLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCByZWN0RGF5ID0gZWxEYXkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCB4ID0gcmVjdERheS5sZWZ0IC0gMSArIHdpbmRvdy5zY3JvbGxYO1xuICAgICAgICBsZXQgeSA9IHJlY3REYXkudG9wIC0gMSArIHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICBsZXQgdyA9IE1hdGgubWF4KHJlY3REYXkud2lkdGggKiAxLjEsIHJlY3RQb3B1cC53aWR0aCk7XG4gICAgICAgIGxldCBoID0gTWF0aC5tYXgocmVjdERheS5oZWlnaHQsIHJlY3RQb3B1cC5oZWlnaHQpO1xuICAgICAgICBpZiAoeCArIHcgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xuICAgICAgICAgICAgeCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gdztcbiAgICAgICAgfVxuICAgICAgICBpZiAoeSArIGggPiB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBoO1xuICAgICAgICB9XG4gICAgICAgIGVsUG9wdXAuc3R5bGUubGVmdCA9IHggKyAncHgnO1xuICAgICAgICBlbFBvcHVwLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuICAgICAgICBlbFBvcHVwLnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgICAgIGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gaCArICdweCc7XG4gICAgfVxufSIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRlVXRpbHMge1xuICAgIC8qKlxuICAgICAqIDFcdTY1RTVcdTMwNkVcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgTUlMTElTRUNPTkRTX1BFUl9EQVkgPSAyNCAqIDYwICogNjAgKiAxMDAwXG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVN0cmluZyhkOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gKG5ldyBEYXRlKGQpKS50b0xvY2FsZURhdGVTdHJpbmcoJ3N2LVNFJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTY2NDJcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVRpbWVTdHJpbmcoZCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBEYXRlVXRpbHMudG9EYXRlU3RyaW5nKGQpICsgJyAnICsgKG5ldyBEYXRlKGQpKS50b0xvY2FsZVRpbWVTdHJpbmcoXCJlbi1HQlwiKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2Qlx1NjVFNVx1NjU3MFx1MzA5Mlx1NTJBMFx1N0I5N1xuICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICAgICAqIEBwYXJhbSBkYXlzIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NTJBMFx1N0I5N1x1NUY4Q1x1MzA2RVx1NjVFNVx1NEVEOChcdTMwREZcdTMwRUFcdTc5RDIpXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhZGREYXlzKGRhdGU6IHN0cmluZywgZGF5czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZS5zdWJzdHJpbmcoMCwgMTApICsgJyAwMDowMDowMCcpICsgZGF5cyAqIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA2RVx1NjVFNVx1NjU3MFx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZEYXlzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZDEgPSBuZXcgRGF0ZShkYXRlMSlcbiAgICAgICAgbGV0IGQyID0gbmV3IERhdGUoZGF0ZTIpXG4gICAgICAgIGQxLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIGQyLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChkMi5nZXRUaW1lKCkgLSBkMS5nZXRUaW1lKCkpIC8gRGF0ZVV0aWxzLk1JTExJU0VDT05EU19QRVJfREFZKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA5Mm1zXHUzMDY3XHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICogQHBhcmFtIGRhdGUxIHtzdHJpbmd9IFx1NjVFNVx1NEVEODFcbiAgICAgKiBAcGFyYW0gZGF0ZTIge3N0cmluZ30gXHU2NUU1XHU0RUQ4MlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGlmZkluTWlsbGlzZWNvbmRzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gRGF0ZS5wYXJzZShkYXRlMikgLSBEYXRlLnBhcnNlKGRhdGUxKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcxRlx1OTU5M1x1MzA2RVx1OTFDRFx1MzA2QVx1MzA4QVx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBzdGFydDEge3N0cmluZ30gXHU2NzFGXHU5NTkzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKiBAcGFyYW0gc3RhcnQyIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzJcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpOiBBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBzdGFydDEgPD0gc3RhcnQyID8gc3RhcnQyIDogc3RhcnQxXG4gICAgICAgIGNvbnN0IGVuZCA9IGVuZDEgPD0gZW5kMiA/IGVuZDEgOiBlbmQyXG4gICAgICAgIHJldHVybiBzdGFydCA8PSBlbmQgPyBbc3RhcnQsIGVuZF0gOiBbbnVsbCwgbnVsbF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwOTJcdTZFMjFcdTMwNTdcdTMwMDFcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdThGRDRcdTMwNTlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdGFydCB7c3RyaW5nfSBcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcbiAgICAgKiBAcGFyYW0gZW5kIHtzdHJpbmd9IFx1N0Q0Mlx1NEU4Nlx1NjY0Mlx1OTU5M1xuICAgICAqIEBwYXJhbSBpbnRlcnZhbCB7c3RyaW5nfSBcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTQoXHU3OUQyXHU2NTcwKVxuICAgICAqIEBwYXJhbSB0aW1lIHtzdHJpbmd9IFx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEY1NVx1NzU2QVx1NzZFRVx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdGltZVNsb3Qoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIGludGVydmFsOiBzdHJpbmcsIHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChEYXRlLnBhcnNlKHRpbWUgPiBlbmQgPyBlbmQgOiB0aW1lKSAtIERhdGUucGFyc2Uoc3RhcnQpKSAvIHBhcnNlSW50KGludGVydmFsKSAvIDEwMDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1MzA2RVx1NjY0Mlx1OTU5M1x1MzA5Mlx1NTkwOVx1NjZGNFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGVUaW1lIHtzdHJpbmd9IFx1NjVFNVx1NjY0MlxuICAgICAqIEBwYXJhbSB0aW1lIHtzdHJpbmd9IFx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NjY0MlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc2V0VGltZU9mRGF0ZVRpbWUoZGF0ZVRpbWU6IHN0cmluZywgdGltZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGRhdGVUaW1lLnN1YnN0cmluZygwLCAxMCkgKyAnICcgKyB0aW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA5Mlx1NTIwNlx1NjU3MFx1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9NaW51dGVzKHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IFtob3VyLCBtaW51dGVdID0gdGltZS5zcGxpdCgnOicpXG4gICAgICAgIHJldHVybiBwYXJzZUludChob3VyKSAqIDYwICsgcGFyc2VJbnQobWludXRlKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA5Mlx1NzlEMlx1NjU3MFx1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9TZWNvbmRzKHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IFtoLCBpLCBzXSA9IHRpbWUuc3BsaXQoJzonKTtcbiAgICAgICAgcmV0dXJuIChwYXJzZUludChoKSAqIDYwICsgcGFyc2VJbnQoaSkpICogNjAgKyBwYXJzZUludChzKTtcbiAgICB9XG59IiwgImltcG9ydCBTZWxlY3RvciBmcm9tIFwiLi9TZWxlY3RvclwiO1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9EYXRlVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXplciB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NUJGRVx1OEM2MVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZXZlbnRTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1x1MzBGQlx1NjY0Mlx1OTU5M1x1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2VsZWN0b3I6IFNlbGVjdG9yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEOFx1MzBDM1x1MzBDMFx1MzBGQ1x1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGVhZEN1cnNvcjogc3RyaW5nID0gJ2djLWN1cnNvci13LXJlc2l6ZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzZcdTMwRkNcdTMwRUJcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RhaWxDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3ItZS1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZzogSFRNTEVsZW1lbnQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU1MjFEXHU2NzFGXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ1N0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU1MjFEXHU2NzFGXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ0VuZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2Qlx1MzAwMVx1NTI0RFx1NTZERVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA1Rlx1NTAyNFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdWYWx1ZTogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NzlGQlx1NTJENVx1OTFDRlx1MzAwMlx1NzlGQlx1NTJENVx1OTFDRlx1MzA0Q1x1NUMxMVx1MzA2QVx1MzA0NFx1MzA2OFx1MzAwMVx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA2OFx1NTIyNFx1NjVBRFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdDb3VudDogbnVtYmVyID0gMDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NjNCNFx1MzA5M1x1MzA2MFx1NEY0RFx1N0Y2RVx1RkYwOFx1NjVFNVx1NEVEOFx1RkYwOVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZ3JhYmJlZDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0dyYWJiaW5nSGVhZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0dyYWJiaW5nVGFpbDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHU0RTAwXHU2NUU1XHUzMDZFXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfdW5pdDogbnVtYmVyID0gMTtcblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NzUxRlx1NjIxMFx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25QcmV2aWV3OiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgc2VsZWN0b3I6IFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25DbGljayhlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgRWxlbWVudClcbiAgICAgICAgaWYgKGVsICYmIGVsLmRhdGFzZXQuY2FuQ2xpY2sgPT09ICd0cnVlJyAmJiBlbC5kYXRhc2V0LmNhbk1vdmUgPT09ICdmYWxzZScgJiYgZWwuZGF0YXNldC5jYW5Nb3ZlID09PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoZWwuZGF0YXNldC5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBDMFx1MzBBNlx1MzBGM1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU5NThCXHU1OUNCXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgRWxlbWVudClcbiAgICAgICAgaWYgKGVsICYmIChlbC5kYXRhc2V0LmNhbk1vdmUgPT09ICd0cnVlJyB8fCBlbC5kYXRhc2V0LmNhblJlc2l6ZSA9PT0gJ3RydWUnKSkge1xuICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1OTA5XHU1RjYyXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAgICB0aGlzLl9pc0dyYWJiaW5nSGVhZCA9IHRoaXMuX2lzR3JhYmJpbmdUYWlsID0gdHJ1ZVxuICAgICAgICAgICAgaWYgKHRoaXMuaGl0SGVhZChlLnRhcmdldCBhcyBFbGVtZW50KSkgeyAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTU4MzRcdTU0MDhcdTMwMDFcdTdENDJcdTRFODZcdTY1RTVcdTMwNkZcdTU2RkFcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5oaXRUYWlsKGUudGFyZ2V0IGFzIEVsZW1lbnQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdIZWFkID0gZmFsc2VcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICAgICAgICB0aGlzLl9ncmFiYmVkID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSlcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZyA9IGVsXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1N0YXJ0ID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydFxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdFbmQgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmVuZFxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdUZGMDhcdTg4NjhcdTc5M0FcdTMwOTJcdTZEODhcdTMwNTlcdUZGMDlcbiAgICAgICAgICAgIHRoaXMuc2V0RHJhZ2dpbmdDbGFzcyh0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmtleSwgdHJ1ZSlcblxuICAgICAgICAgICAgLy8gXHU3M0ZFXHU1NzI4XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ZhbHVlID0gbnVsbFxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyh0aGlzLl9ncmFiYmVkKVxuXG4gICAgICAgICAgICAvLyBcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ3Vyc29yKClcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHU5MUNGXHUzMDkyXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0NvdW50ID0gMFxuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBFMFx1MzBGQ1x1MzBENlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlTW92ZShlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcodmFsdWUpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzA1Rlx1MzA4MVx1MzA2Qlx1NzlGQlx1NTJENVx1OTFDRlx1MzA5Mlx1OEExOFx1OTMzMlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdDb3VudCsrXG5cbiAgICAgICAgICAgIC8vIFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1RlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VVcChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5rZXlcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSlcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB0aGlzLl9ncmFiYmVkICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZHJhZyh2YWx1ZSlcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25Nb3ZlICYmIHN0YXJ0ICE9PSBudWxsICYmIGVuZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZHJhZ2dpbmdDb3VudCA8IDMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5jYW5DbGljayA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vblByZXZpZXcodGhpcy5fZHJhZ2dpbmcsIG51bGwsIG51bGwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RHJhZ2dpbmdDbGFzcyhrZXksIGZhbHNlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBudWxsXG4gICAgICAgICAgICB0aGlzLl9pc0dyYWJiaW5nSGVhZCA9IHRoaXMuX2lzR3JhYmJpbmdUYWlsID0gbnVsbFxuICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKVxuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NUJGRVx1OEM2MVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRFdmVudFNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fZXZlbnRTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk4MkRcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTY2NDJcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY3Vyc29yXG4gICAgICovXG4gICAgcHVibGljIHNldEhlYWRDdXJzb3IoY3Vyc29yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5faGVhZEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHU2NjQyXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGN1cnNvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRUYWlsQ3Vyc29yKGN1cnNvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX3RhaWxDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEUwMFx1NjVFNVx1MzA2RVx1NjY0Mlx1OTU5M1x1OTU5M1x1OTY5NFx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB1bml0IHtudW1iZXJ9IFx1NEUwMFx1NjVFNVx1MzA2RVx1NjY0Mlx1OTU5M1x1OTU5M1x1OTY5NFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRVbml0KHVuaXQ6IG51bWJlcik6IHRoaXMge1xuICAgICAgICB0aGlzLl91bml0ID0gdW5pdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uRXZlbnQoY2FsbGJhY2s6IChrZXk6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUoY2FsbGJhY2s6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NzUxRlx1NjIxMFx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvblByZXZpZXcoY2FsbGJhY2s6IChlbDogSFRNTEVsZW1lbnQsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uUHJldmlldyA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHVibGljIGlzRHJhZ2dpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kcmFnZ2luZyAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0R3JhYmJlZERhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dyYWJiZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge251bGx8SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcGlja0V2ZW50KGVsOiBFbGVtZW50KTogSFRNTEVsZW1lbnQgfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IpXG4gICAgICAgICAgICA/IGVsLmNsb3Nlc3QodGhpcy5fZXZlbnRTZWxlY3RvcilcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhpdEhlYWQoZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLWhlYWQnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NTIyNFx1NUI5QVx1MzA1OVx1MzA4Qlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGl0VGFpbChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFlbC5jbG9zZXN0KCcuZ2MtdGFpbCcpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldERyYWdnaW5nQ2xhc3Moa2V5OiBzdHJpbmcsIGRyYWdnaW5nOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9ldmVudFNlbGVjdG9yICsgJ1tkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTczRkVcdTU3MjhcdTMwMDFcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkZcdTMwMDFcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNBbGxEYXlEcmFnZ2luZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyYWdnaW5nPy5kYXRhc2V0LmFsbERheSA9PT0gJ3RydWUnO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzBEMVx1MzBFOVx1MzBFMVx1MzBGQ1x1MzBCRlx1MzA0Q1x1NjU3NFx1NjU3MFx1NTAyNFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc051bWJlcih2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAvXlxcZCskLy50ZXN0KHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZHJhZyh2YWx1ZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzTnVtYmVyKHZhbHVlKVxuICAgICAgICAgICAgPyB0aGlzLmRyYWdOdW1iZXIodmFsdWUpXG4gICAgICAgICAgICA6IHRoaXMuZHJhZ0RhdGVUaW1lKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTY2NDJcdTMwNkVcdTMwRDFcdTMwRTlcdTMwRTFcdTMwRkNcdTMwQkZcdTMwNkJcdTVCRkVcdTMwNTdcdTMwNjZcdTMwMDFcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZHJhZ0RhdGVUaW1lKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgY29uc3QgZGlmZiA9IERhdGVVdGlscy5kaWZmSW5NaWxsaXNlY29uZHModGhpcy5fZ3JhYmJlZCwgdmFsdWUpO1xuICAgICAgICBsZXQgc3RhcnQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nU3RhcnQpICsgKHRoaXMuX2lzR3JhYmJpbmdIZWFkID8gZGlmZiA6IDApKTtcbiAgICAgICAgbGV0IGVuZCA9IERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKERhdGUucGFyc2UodGhpcy5fZHJhZ2dpbmdFbmQpICsgKHRoaXMuX2lzR3JhYmJpbmdUYWlsID8gZGlmZiA6IDApKTtcbiAgICAgICAgc3RhcnQgPSBzdGFydC5zdWJzdHJpbmcoMCwgdGhpcy5fZ3JhYmJlZC5sZW5ndGgpO1xuICAgICAgICBlbmQgPSBlbmQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWQubGVuZ3RoKTtcbiAgICAgICAgaWYgKHN0YXJ0ID4gZW5kKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQpIHtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGVuZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdUYWlsKSB7XG4gICAgICAgICAgICAgICAgZW5kID0gc3RhcnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3N0YXJ0LCBlbmRdXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NTc0XHU2NTcwXHU1MDI0XHUzMDZFXHUzMEQxXHUzMEU5XHUzMEUxXHUzMEZDXHUzMEJGXHUzMDZCXHU1QkZFXHUzMDU3XHUzMDY2XHUzMDAxXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWdOdW1iZXIodmFsdWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICAgICAgICBjb25zdCBkaWZmID0gcGFyc2VJbnQodmFsdWUpIC0gcGFyc2VJbnQodGhpcy5fZ3JhYmJlZCk7XG4gICAgICAgIGxldCBzdGFydCA9IHBhcnNlSW50KHRoaXMuX2RyYWdnaW5nU3RhcnQpICsgKHRoaXMuX2lzR3JhYmJpbmdIZWFkID8gZGlmZiA6IDApO1xuICAgICAgICBsZXQgZW5kID0gcGFyc2VJbnQodGhpcy5fZHJhZ2dpbmdFbmQpICsgKHRoaXMuX2lzR3JhYmJpbmdUYWlsID8gZGlmZiA6IDApO1xuICAgICAgICBpZiAodGhpcy5pc0FsbERheURyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gTWF0aC5mbG9vcihzdGFydCAvIHRoaXMuX3VuaXQpICogdGhpcy5fdW5pdDtcbiAgICAgICAgICAgIGVuZCA9IE1hdGguZmxvb3IoZW5kIC8gdGhpcy5fdW5pdCkgKiB0aGlzLl91bml0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGVDdXJzb3IoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLl9oZWFkQ3Vyc29yLCB0aGlzLl90YWlsQ3Vyc29yKVxuICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQgJiYgdGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCgnZ2MtY3Vyc29yLW1vdmUnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQodGhpcy5faGVhZEN1cnNvcilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKHRoaXMuX3RhaWxDdXJzb3IpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVByZXZpZXcodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZHJhZyh2YWx1ZSlcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblByZXZpZXcodGhpcy5fZHJhZ2dpbmcsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ZhbHVlID0gdmFsdWVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNHcmFiYmluZ0hlYWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0dyYWJiaW5nSGVhZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzR3JhYmJpbmdUYWlsKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNHcmFiYmluZ1RhaWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5ODJEXHU5MEU4XHU1MjA2XHUzMDY4XHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc0dyYWJiaW5nQm9keSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzR3JhYmJpbmdIZWFkICYmIHRoaXMuX2lzR3JhYmJpbmdUYWlsO1xuICAgIH1cbn0iLCAiaW1wb3J0IFNlbGVjdG9yIGZyb20gXCIuL1NlbGVjdG9yXCI7XG5pbXBvcnQgUmVzaXplciBmcm9tIFwiLi9SZXNpemVyXCI7XG5pbXBvcnQgRGF0ZVV0aWxzIGZyb20gXCIuL0RhdGVVdGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbGxEYXlFdmVudCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2NvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kYXRlU2VsZWN0b3I6IFNlbGVjdG9yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzaXplcjogUmVzaXplciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREJcdTMwRDBcdTMwRkNcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hvdmVyOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICogQHBhcmFtIGRhdGVTZWxlY3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCBkYXRlU2VsZWN0b3I6IFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3IgPSBkYXRlU2VsZWN0b3I7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAqL1xuICAgIHB1YmxpYyBpbml0KCkge1xuICAgICAgICB0aGlzLl9yZXNpemVyID0gbmV3IFJlc2l6ZXIodGhpcy5fcm9vdCwgdGhpcy5fZGF0ZVNlbGVjdG9yKVxuICAgICAgICAgICAgLnNldEV2ZW50U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAuc2V0SGVhZEN1cnNvcignZ2MtY3Vyc29yLXctcmVzaXplJylcbiAgICAgICAgICAgIC5zZXRUYWlsQ3Vyc29yKCdnYy1jdXJzb3ItZS1yZXNpemUnKVxuICAgICAgICAgICAgLm9uRXZlbnQoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub25Nb3ZlKChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uTW92ZShrZXksIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub25QcmV2aWV3KChlbDogSFRNTEVsZW1lbnQsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQcmV2aWV3KCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVByZXZpZXcoZWwsIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzBERVx1MzBBNlx1MzBCOVx1MzBEQlx1MzBEMFx1MzBGQ1x1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlIHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZU92ZXIoZTogRXZlbnQpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jlc2l6ZXIuaXNEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrQWxsRGF5RXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQsIHRydWUpO1xuICAgICAgICBjb25zdCBrZXkgPSBlbCA/IGVsLmRhdGFzZXQua2V5IDogbnVsbDtcbiAgICAgICAgaWYgKGtleSAhPT0gdGhpcy5faG92ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLl9ob3ZlciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuX2hvdmVyID0ga2V5LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBjb250YWluZXJTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcjogc3RyaW5nKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9yZXNpemVyLnNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBjb250YWluZXJTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHJldHVybnMge0FsbERheUV2ZW50fSBcdTgxRUFcdThFQUJcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChjYWxsYmFjazogKGtleTogc3RyaW5nKSA9PiB2b2lkKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEByZXR1cm5zIHtBbGxEYXlFdmVudH0gXHU4MUVBXHU4RUFCXG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShjYWxsYmFjazogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IEFsbERheUV2ZW50IHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSB3aXRob3V0UG9wdXAge2Jvb2xlYW59IFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTY2NFx1NTkxNlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBpY2tBbGxEYXlFdmVudChlbDogSFRNTEVsZW1lbnQsIHdpdGhvdXRQb3B1cDogYm9vbGVhbiA9IGZhbHNlKTogbnVsbCB8IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAod2l0aG91dFBvcHVwID8gJycgOiAnLCAuZ2MtZGF5LWdyaWQtcG9wdXAnKSlcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwREJcdTMwRDBcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0ga2V5IHtzdHJpbmd9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1xuICAgICAqIEBwYXJhbSBob3ZlciB7Ym9vbGVhbn0gXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldEhvdmVyQWxsRGF5RXZlbnQoa2V5OiBzdHJpbmcsIGhvdmVyOiBib29sZWFuKSB7XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gZXZlbnRTdGFydCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZXZlbnRFbmQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVByZXZpZXcoZWxFdmVudDogSFRNTEVsZW1lbnQsIGV2ZW50U3RhcnQ6IHN0cmluZywgZXZlbnRFbmQ6IHN0cmluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtd2VlaywgLmdjLWFsbC1kYXktc2VjdGlvbicpKS5mb3JFYWNoKGVsV2VlayA9PiB7XG4gICAgICAgICAgICBjb25zdCBbd2Vla1N0YXJ0LCB3ZWVrRW5kXSA9IHRoaXMuZ2V0V2Vla1BlcmlvZChlbFdlZWspXG4gICAgICAgICAgICBpZiAod2Vla1N0YXJ0ICYmIHdlZWtFbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbcGVyaW9kU3RhcnQsIHBlcmlvZEVuZF0gPSBEYXRlVXRpbHMub3ZlcmxhcFBlcmlvZChldmVudFN0YXJ0LCBldmVudEVuZCwgd2Vla1N0YXJ0LCB3ZWVrRW5kKVxuICAgICAgICAgICAgICAgIGlmIChwZXJpb2RTdGFydCAmJiBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxQcmV2aWV3ID0gZWxXZWVrLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXlbZGF0YS1kYXRlPVwiJyArIHBlcmlvZFN0YXJ0ICsgJ1wiXSAuZ2MtYWxsLWRheS1ldmVudC1wcmV2aWV3JylcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdlZWtTdGFydCA8PSB0aGlzLl9yZXNpemVyLmdldEdyYWJiZWREYXRlKCkgJiYgdGhpcy5fcmVzaXplci5nZXRHcmFiYmVkRGF0ZSgpIDw9IHdlZWtFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1OTAzMVx1MzA2N1x1MzA2Rlx1MzAwMVx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA2RVx1N0UyNlx1NEY0RFx1N0Y2RVx1MzA5Mlx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXcsIHRoaXMuZ2V0SW5kZXhJblBhcmVudChlbEV2ZW50KSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGVsRXZlbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRheXMgPSBEYXRlVXRpbHMuZGlmZkRheXMocGVyaW9kU3RhcnQsIHBlcmlvZEVuZCkgKyAxXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0UHJldmlldyhlbCwgZGF5cywgcGVyaW9kU3RhcnQgPT09IGV2ZW50U3RhcnQsIHBlcmlvZEVuZCA9PT0gZXZlbnRFbmQpXG4gICAgICAgICAgICAgICAgICAgIGVsUHJldmlldy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XHUzMEZCXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsV2VlayB7SFRNTEVsZW1lbnR9IFx1OTAzMVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU5MDMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XHUzMEZCXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFdlZWtQZXJpb2QoZWxXZWVrOiBIVE1MRWxlbWVudCk6IEFycmF5PGFueT4ge1xuICAgICAgICBjb25zdCBlbERheXMgPSBlbFdlZWsucXVlcnlTZWxlY3RvckFsbCgnLmdjLWRheTpub3QoLmdjLWRpc2FibGVkKScpIGFzIE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+XG4gICAgICAgIGlmIChlbERheXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFtlbERheXNbMF0uZGF0YXNldC5kYXRlLCBlbERheXNbZWxEYXlzLmxlbmd0aCAtIDFdLmRhdGFzZXQuZGF0ZV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbbnVsbCwgbnVsbF1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA2Qlx1NTQwOFx1MzA4Rlx1MzA1Qlx1MzA4QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBkYXlzIHtudW1iZXJ9IFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjVFNVx1NjU3MFxuICAgICAqIEBwYXJhbSBpc1N0YXJ0IHtib29sZWFufSBcdTkwMzFcdTUxODVcdTMwNkJcdTk1OEJcdTU5Q0JcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gaXNFbmQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1N0Q0Mlx1NEU4Nlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhZGp1c3RQcmV2aWV3KGVsOiBIVE1MRWxlbWVudCwgZGF5czogbnVtYmVyLCBpc1N0YXJ0OiBib29sZWFuLCBpc0VuZDogYm9vbGVhbikge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLXN0YXJ0JylcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZW5kJylcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gNzsgaSsrKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy0nICsgaSArICdkYXlzJylcbiAgICAgICAgfVxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy0nICsgZGF5cyArICdkYXlzJylcbiAgICAgICAgaWYgKGlzU3RhcnQpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXN0YXJ0JylcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWVuZCcpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDRDXHU1MTQ0XHU1RjFGXHUzMDZFXHU0RTJEXHUzMDY3XHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHUzMEE0XHUzMEYzXHUzMEM3XHUzMEMzXHUzMEFGXHUzMEI5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEluZGV4SW5QYXJlbnQoZWw6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbC5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKGVsKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1Rlx1NjU3MFx1MzA2MFx1MzA1MVx1N0E3QVx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXc6IEhUTUxFbGVtZW50LCBjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgZWxQcmV2aWV3LmFwcGVuZENoaWxkKGVsKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU1MjRBXHU5NjY0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbW92ZVByZXZpZXcoKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbDogRWxlbWVudCkgPT4gZWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWwuY2xvbmVOb2RlKGZhbHNlKSwgZWwpKVxuICAgIH1cbn0iLCAiaW1wb3J0IFNlbGVjdG9yIGZyb20gJy4vU2VsZWN0b3InXG5pbXBvcnQgRGF0ZVV0aWxzIGZyb20gXCIuL0RhdGVVdGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXlHcmlkVGltZWRFdmVudCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByaXZhdGUgX2RhdGVTZWxlY3RvcjogU2VsZWN0b3I7XG5cbiAgICAvKipcbiAgICAgKiBBbHBpbmUuanNcdTMwNkVcdTMwQTRcdTMwRjNcdTMwQjlcdTMwQkZcdTMwRjNcdTMwQjlcbiAgICAgKi9cbiAgICBwcml2YXRlIF9hbHBpbmU6IGFueTtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgX2RyYWdnaW5nOiBIVE1MRWxlbWVudCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gZGF0ZVNlbGVjdG9yXG4gICAgICogQHBhcmFtIGFscGluZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCBkYXRlU2VsZWN0b3I6IFNlbGVjdG9yLCBhbHBpbmU6IGFueSkge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5fZGF0ZVNlbGVjdG9yID0gZGF0ZVNlbGVjdG9yO1xuICAgICAgICB0aGlzLl9hbHBpbmUgPSBhbHBpbmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdkcmFnc3RhcnQnLCB0aGlzLl9vbkRyYWdTdGFydC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIHRoaXMuX29uRHJhZ092ZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIHRoaXMuX29uRHJvcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdkcmFnZW5kJywgdGhpcy5fb25EcmFnRW5kLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqXG4gICAgICogQHBhcmFtIG9uRXZlbnQge0Z1bmN0aW9ufSBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHVibGljIG9uRXZlbnQob25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkKTogRGF5R3JpZFRpbWVkRXZlbnQge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gb25FdmVudDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICpcbiAgICAgKiBAcGFyYW0gb25Nb3ZlIHtGdW5jdGlvbn0gXHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHJldHVybnMge0RheUdyaWRUaW1lZEV2ZW50fSBcdTMwQTRcdTMwRjNcdTMwQjlcdTMwQkZcdTMwRjNcdTMwQjlcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Nb3ZlKG9uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IERheUdyaWRUaW1lZEV2ZW50IHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gb25Nb3ZlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25DbGljayhlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICBpZiAoZWw/LmRhdGFzZXQuY2FuQ2xpY2sgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gZWw/LmRhdGFzZXQua2V5O1xuICAgICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgICAgIC8vIFx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NTgzNFx1NTQwOFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1NjJCQ1x1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnBpY2tFdmVudChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7RHJhZ0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYWdTdGFydChlOiBEcmFnRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLnBpY2tFdmVudChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBlbDtcbiAgICAgICAgICAgIGUuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQgPSAnbW92ZSc7XG4gICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKCd0ZXh0L3BsYWluJywgZWwuZGF0YXNldC5rZXkpO1xuICAgICAgICAgICAgdGhpcy5fYWxwaW5lLiRuZXh0VGljaygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGREcmFnZ2luZ0NsYXNzKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDRDXHU4OTgxXHU3RDIwXHUzMDZCXHU0RTU3XHUzMDYzXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJhZ092ZXIoZTogRHJhZ0V2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9kYXRlU2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSlcbiAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2RhdGVTZWxlY3Rvci5zZWxlY3QoZGF0ZSk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRURcdTMwQzNcdTMwRDdcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7RHJhZ0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25Ecm9wKGU6IERyYWdFdmVudCk6IHZvaWQge1xuICAgICAgICAvLyBcdTMwQzlcdTMwRURcdTMwQzNcdTMwRDdcdTUxRTZcdTc0MDZcdTMwOTJcdTVCOUZcdTg4NENcbiAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuX2RhdGVTZWxlY3Rvci5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgY29uc3Qga2V5ID0gZS5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuICAgICAgICBpZiAoZGF0ZSkge1xuICAgICAgICAgICAgY29uc3QgZGF5cyA9IERhdGVVdGlscy5kaWZmRGF5cyh0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LnN0YXJ0LCBkYXRlKTtcbiAgICAgICAgICAgIGlmIChkYXlzICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlVXRpbHMuYWRkRGF5cyh0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LnN0YXJ0LCBkYXlzKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZVV0aWxzLmFkZERheXModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5lbmQsIGRheXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9kcmFnZ2luZyA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdmUoa2V5LCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNENcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTU5MTZcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7RHJhZ0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25EcmFnRW5kKGU6IERyYWdFdmVudCk6IHZvaWQge1xuICAgICAgICAvLyBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTg5RTNcdTk2NjRcbiAgICAgICAgdGhpcy5fZGF0ZVNlbGVjdG9yLmRlc2VsZWN0KCk7XG5cbiAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTQzXHUzMDZCXHU2MjNCXHUzMDU5XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1RkRPTVx1ODk4MVx1N0QyMFx1MzA2RVx1OEZEMVx1MzA0Rlx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1x1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBwaWNrRXZlbnQoZWw6IEhUTUxFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCgnLmdjLWRheS1ncmlkLCAuZ2MtZGF5LWdyaWQtcG9wdXAnKVxuICAgICAgICAgICAgPyAoZWwuY2xvc2VzdCgnLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lcicpIGFzIEhUTUxFbGVtZW50KVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NzJCNlx1NjE0Qlx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAqXG4gICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGREcmFnZ2luZ0NsYXNzKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nLmNsYXNzTGlzdC5hZGQoJ2djLWRyYWdnaW5nJyk7XG4gICAgICAgIH1cbiAgICB9XG59IiwgImltcG9ydCBEYXlHcmlkTGltaXQgZnJvbSBcIi4vbW9kdWxlcy9EYXlHcmlkTGltaXRcIjtcbmltcG9ydCBTZWxlY3RvciBmcm9tICcuL21vZHVsZXMvU2VsZWN0b3IuanMnXG5pbXBvcnQgRGF5R3JpZFBvcHVwIGZyb20gJy4vbW9kdWxlcy9EYXlHcmlkUG9wdXAnXG5pbXBvcnQgQWxsRGF5RXZlbnQgZnJvbSBcIi4vbW9kdWxlcy9BbGxEYXlFdmVudC5qc1wiO1xuaW1wb3J0IERheUdyaWRUaW1lZEV2ZW50IGZyb20gXCIuL21vZHVsZXMvRGF5R3JpZFRpbWVkRXZlbnQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGF5R3JpZChjb21wb25lbnRQYXJhbWV0ZXJzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1ODg2OFx1NzkzQVx1NEVGNlx1NjU3MFx1MzA5Mlx1NTIzNlx1OTY1MFx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGM1x1MzBERFx1MzBGQ1x1MzBDRFx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgZGF5R3JpZExpbWl0OiBEYXlHcmlkTGltaXQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGM1x1MzBERFx1MzBGQ1x1MzBDRFx1MzBGM1x1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgZGF5R3JpZFBvcHVwOiBEYXlHcmlkUG9wdXAsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAgICAgKi9cbiAgICAgICAgZGF0ZVNlbGVjdG9yOiBTZWxlY3RvcixcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICB0aW1lZEV2ZW50OiBEYXlHcmlkVGltZWRFdmVudCxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAqL1xuICAgICAgICBhbGxEYXlFdmVudDogQWxsRGF5RXZlbnQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgKi9cbiAgICAgICAgaW5pdCgpIHtcbiAgICAgICAgICAgIC8vIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgdGhpcy5kYXlHcmlkUG9wdXAgPSBuZXcgRGF5R3JpZFBvcHVwKHRoaXMuJGVsKTtcblxuICAgICAgICAgICAgLy8gXHU4ODY4XHU3OTNBXHU2NTcwXHUzMDkyXHU1MjM2XHU5NjUwXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEYzXHUzMEREXHUzMEZDXHUzMENEXHUzMEYzXHUzMEM4XHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICB0aGlzLmRheUdyaWRMaW1pdCA9IG5ldyBEYXlHcmlkTGltaXQodGhpcy4kZWwpXG4gICAgICAgICAgICAgICAgLnNldExvY2FsaXplZFJlbWFpbmluZ1RleHQoY29tcG9uZW50UGFyYW1ldGVycy5yZW1haW5pbmcpXG4gICAgICAgICAgICAgICAgLm9uUmVtYWluaW5nVGV4dENsaWNrKChlbERheSkgPT4gdGhpcy5kYXlHcmlkUG9wdXAub3BlbihlbERheSkpO1xuXG4gICAgICAgICAgICAvLyBcdTY1RTVcdTRFRDhcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMuZGF0ZVNlbGVjdG9yID0gbmV3IFNlbGVjdG9yKHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLWRheS1ncmlkJylcbiAgICAgICAgICAgICAgICAuc2V0RWxlbWVudFNlbGVjdG9yKCcuZ2MtZGF5JylcbiAgICAgICAgICAgICAgICAuc2V0UHJvcGVydHlOYW1lKCdkYXRlJylcbiAgICAgICAgICAgICAgICAuc2V0RW5hYmxlZChjb21wb25lbnRQYXJhbWV0ZXJzLmNhblNlbGVjdERhdGVzKVxuICAgICAgICAgICAgICAgIC5zZXRNdWx0aXBsZShjb21wb25lbnRQYXJhbWV0ZXJzLmNhblNlbGVjdE11bHRpcGxlRGF0ZXMpXG4gICAgICAgICAgICAgICAgLm9uU2VsZWN0KChzdGFydCwgZW5kLCByZXNvdXJjZUlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25EYXRlKHN0YXJ0ICsgJyAwMDowMDowMCcsIGVuZCArICcgMjM6NTk6NTknLCByZXNvdXJjZUlkKVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMuYWxsRGF5RXZlbnQgPSBuZXcgQWxsRGF5RXZlbnQodGhpcy4kZWwsIHRoaXMuZGF0ZVNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLWRheS1ncmlkJylcbiAgICAgICAgICAgICAgICAub25Nb3ZlKChrZXksIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uRXZlbnQoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMudGltZWRFdmVudCA9IG5ldyBEYXlHcmlkVGltZWRFdmVudCh0aGlzLiRlbCwgdGhpcy5kYXRlU2VsZWN0b3IsIHRoaXMpXG4gICAgICAgICAgICAgICAgLm9uRXZlbnQoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uTW92ZSgoa2V5LCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25Nb3ZlKGtleSwgc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDZFXHU3NjdCXHU5MzMyXG4gICAgICAgICAgICB0aGlzLmRheUdyaWRQb3B1cC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50LnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3Rvci5yZWdpc3RlckNhbGxiYWNrcygpO1xuXG4gICAgICAgICAgICAvLyBMaXZld2lyZVx1MzA0Qlx1MzA4OVx1MzA2RVx1NUYzN1x1NTIzNlx1NjZGNFx1NjVCMFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgTGl2ZXdpcmUub24oJ3JlZnJlc2hDYWxlbmRhcicsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRuZXh0VGljaygoKSA9PiB0aGlzLmRheUdyaWRMaW1pdC51cGRhdGVMYXlvdXQodHJ1ZSkpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgIH1cbn0iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7OztBQUFBLElBQXFCLGdCQUFyQixNQUFxQixjQUFhO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXlEOUIsWUFBWSxNQUFtQjtBQXBEL0I7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFBUTtBQU1SO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsaUJBQXdCO0FBTWhDO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsaUJBQXdCO0FBTWhDO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsZ0JBQXVCO0FBTS9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsMkJBQWtDO0FBSzFDO0FBQUE7QUFBQTtBQUFBLHdCQUFRO0FBd0JKLFNBQUssUUFBUTtBQUNiLFNBQUssS0FBSztBQUFBLEVBQ2Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtPLE9BQU87QUFDVixTQUFLLGFBQWE7QUFDbEIsV0FBTyxpQkFBaUIsVUFBVSxLQUFLLFVBQVUsS0FBSyxJQUFJLENBQUM7QUFDM0QsU0FBSyxNQUFNLGlCQUFpQixTQUFTLEtBQUssU0FBUyxLQUFLLElBQUksQ0FBQztBQUM3RCxTQUFLLE1BQU0saUJBQWlCLGFBQWEsS0FBSyxhQUFhLEtBQUssSUFBSSxDQUFDO0FBQUEsRUFDekU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBTU8sMEJB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
