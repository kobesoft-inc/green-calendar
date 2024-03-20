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
    if (el) {
      if (el.dataset.canClick === "true" && el.dataset.canMove === "false" && el.dataset.canResize === "false") {
        if (this._onEvent) {
          this._onEvent(el.dataset.key);
        }
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF5R3JpZExpbWl0LnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1NlbGVjdG9yLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL0RheUdyaWRQb3B1cC50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9EYXRlVXRpbHMudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvUmVzaXplci50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9BbGxEYXlFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9EYXlHcmlkVGltZWRFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvZGF5LWdyaWQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImV4cG9ydCBkZWZhdWx0IGNsYXNzIERheUdyaWRMaW1pdCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFx1MzA2RVx1MzBBRFx1MzBFM1x1MzBDM1x1MzBCN1x1MzBFNVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfdmlzaWJsZUNvdW50OiBudW1iZXIgPSAwO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9kYXlUb3BIZWlnaHQ6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdUZGMTFcdTRFRjZcdThGQkFcdTMwOEFcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2V2ZW50SGVpZ2h0OiBudW1iZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEM2XHUzMEFEXHUzMEI5XHUzMEM4XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0OiBzdHJpbmcgPSAnKyA6Y291bnQgbW9yZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vblJlbWFpbmluZ1RleHRDbGljazogKGVsRGF5OiBIVE1MRWxlbWVudCkgPT4gdm9pZDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBEQVlfU0VMRUNUT1IgPSAnLmdjLWRheXMgLmdjLWRheSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTRFMEFcdTkwRThcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgREFZX1RPUF9TRUxFQ1RPUiA9ICcuZ2MtZGF5LXRvcCc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiAuZ2MtYWxsLWRheS1ldmVudHNcdTMwNkJcdTMwNkZcdTMwMDFcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwNkJcdTMwNjBcdTMwNTFcdTMwQzdcdTMwRkNcdTMwQkZcdTMwNENcdTUxNjVcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTMwNkVcdTMwNjBcdTMwNENcdTMwMDFcbiAgICAgKiAuZ2MtdGltZWQtZXZlbnRzXHUzMDZCXHUzMDZGXHUzMDAxXHU1MTY4XHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1NDJCXHUzMDgxXHUzMDY2XHUzMDAxXHU1MTY4XHUzMDY2XHUzMDZFXHU2NUU1XHUzMDZCXHUzMEM3XHUzMEZDXHUzMEJGXHUzMDRDXHU1MTY1XHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IEFOWV9FVkVOVF9TRUxFQ1RPUiA9ICcuZ2MtdGltZWQtZXZlbnRzID4gLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lciwgLmdjLXRpbWVkLWV2ZW50cyA+IC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcic7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgcHVibGljIGluaXQoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlTGF5b3V0KClcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTZCOEJcdTMwOEFcdTMwNkVcdTRFODhcdTVCOUFcdTY1NzBcdTMwNkVcdTg4NjhcdTc5M0FcdTMwQzZcdTMwQURcdTMwQjlcdTMwQzhcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gbG9jYWxpemVkUmVtYWluaW5nVGV4dFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRMb2NhbGl6ZWRSZW1haW5pbmdUZXh0KGxvY2FsaXplZFJlbWFpbmluZ1RleHQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0ID0gbG9jYWxpemVkUmVtYWluaW5nVGV4dDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIG9uUmVtYWluaW5nVGV4dENsaWNrXG4gICAgICovXG4gICAgcHVibGljIG9uUmVtYWluaW5nVGV4dENsaWNrKG9uUmVtYWluaW5nVGV4dENsaWNrOiAoZWxEYXk6IEhUTUxFbGVtZW50KSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuX29uUmVtYWluaW5nVGV4dENsaWNrID0gb25SZW1haW5pbmdUZXh0Q2xpY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uUmVzaXplKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUxheW91dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25DbGljayhlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVtYWluaW5nVGV4dEVsZW1lbnQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblJlbWFpbmluZ1RleHRDbGljaykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uUmVtYWluaW5nVGV4dENsaWNrKHRoaXMucGlja0RheShlLnRhcmdldCBhcyBFbGVtZW50KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU2MkJDXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVtYWluaW5nVGV4dEVsZW1lbnQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwOTJcdTUxOERcdThBMDhcdTdCOTdcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGZvcmNlIFx1NUYzN1x1NTIzNlx1NzY4NFx1MzA2Qlx1NTE4RFx1OEEwOFx1N0I5N1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlTGF5b3V0KGZvcmNlOiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgY29uc3QgdmlzaWJsZUNvdW50ID0gdGhpcy5nZXRWaXNpYmxlQ291bnQoKTtcbiAgICAgICAgaWYgKHRoaXMuX3Zpc2libGVDb3VudCAhPT0gdmlzaWJsZUNvdW50IHx8IGZvcmNlKSB7XG4gICAgICAgICAgICB0aGlzLl92aXNpYmxlQ291bnQgPSB2aXNpYmxlQ291bnQ7XG4gICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoRGF5R3JpZExpbWl0LkRBWV9TRUxFQ1RPUikuZm9yRWFjaChkYXkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGF5KGRheSBhcyBIVE1MRWxlbWVudCwgdmlzaWJsZUNvdW50KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTg4NjhcdTc5M0FcdTMwNTlcdTMwOEJcdTRFODhcdTVCOUFcdTY1NzBcdTMwOTJcdTY2RjRcdTY1QjBcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gdmlzaWJsZUNvdW50IHtudW1iZXJ9IFx1ODg2OFx1NzkzQVx1MzA2N1x1MzA0RFx1MzA4Qlx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlRGF5KGVsRGF5OiBIVE1MRWxlbWVudCwgdmlzaWJsZUNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgZXZlbnRDb3VudCA9IHRoaXMuZ2V0RXZlbnRDb3VudChlbERheSk7XG4gICAgICAgIGNvbnN0IGxpbWl0Q291bnQgPSBldmVudENvdW50IDwgdmlzaWJsZUNvdW50ID8gZXZlbnRDb3VudCA6IHZpc2libGVDb3VudCAtIDE7XG4gICAgICAgIGNvbnN0IHJlbWFpbmluZ0NvdW50ID0gZXZlbnRDb3VudCAtIGxpbWl0Q291bnQ7XG4gICAgICAgIHRoaXMuc2V0VGltZWRFdmVudHNIZWlnaHQoZWxEYXksIHRoaXMuZ2V0RXZlbnRIZWlnaHQoKSAqIGxpbWl0Q291bnQpO1xuICAgICAgICB0aGlzLmxpbWl0QWxsRGF5RXZlbnRzKGVsRGF5LCBsaW1pdENvdW50IC0gKHJlbWFpbmluZ0NvdW50ID8gMSA6IDApKTtcbiAgICAgICAgdGhpcy5zZXRSZW1haW5pbmdDb3VudChlbERheSwgcmVtYWluaW5nQ291bnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFdmVudENvdW50KGVsRGF5OiBIVE1MRWxlbWVudCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBlbERheS5xdWVyeVNlbGVjdG9yQWxsKERheUdyaWRMaW1pdC5BTllfRVZFTlRfU0VMRUNUT1IpLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEV2ZW50SGVpZ2h0KCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl9ldmVudEhlaWdodCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRIZWlnaHQgPSB0aGlzLmdldEVsZW1lbnRIZWlnaHQoRGF5R3JpZExpbWl0LkFOWV9FVkVOVF9TRUxFQ1RPUik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50SGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVxuICAgICAqIEBwYXJhbSBoZWlnaHQge251bWJlcn0gXHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRUaW1lZEV2ZW50c0hlaWdodChlbERheTogSFRNTEVsZW1lbnQsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIChlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJykgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHUzMDZFXHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXREYXlIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudEhlaWdodChEYXlHcmlkTGltaXQuREFZX1NFTEVDVE9SKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTU0MDRcdTY1RTVcdTMwNkVcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTRFRDhcdTg4NjhcdTc5M0FcdTMwNkVcdTkwRThcdTUyMDZcdTMwNkVcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldERheVRvcEhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICBpZiAodGhpcy5fZGF5VG9wSGVpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXlUb3BIZWlnaHQgPSB0aGlzLmdldEVsZW1lbnRIZWlnaHQoRGF5R3JpZExpbWl0LkRBWV9UT1BfU0VMRUNUT1IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXlUb3BIZWlnaHRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEVsZW1lbnRIZWlnaHQoc2VsZWN0b3I6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiAodGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSBhcyBIVE1MRWxlbWVudCkub2Zmc2V0SGVpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NTQwNFx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RVx1OUFEOFx1MzA1NVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RGF5Qm9keUhlaWdodCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXREYXlIZWlnaHQoKSAtIHRoaXMuZ2V0RGF5VG9wSGVpZ2h0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU4ODY4XHU3OTNBXHUzMDY3XHUzMDREXHUzMDhCXHU2NTcwXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRWaXNpYmxlQ291bnQoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5nZXREYXlCb2R5SGVpZ2h0KCkgLyB0aGlzLmdldEV2ZW50SGVpZ2h0KCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODg2OFx1NzkzQVx1MzBGQlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBsaW1pdCB7bnVtYmVyfSBcdTg4NjhcdTc5M0FcdTUzRUZcdTgwRkRcdTMwNkFcdTRFODhcdTVCOUFcdTY1NzBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxpbWl0QWxsRGF5RXZlbnRzKGVsRGF5OiBIVE1MRWxlbWVudCwgbGltaXQ6IG51bWJlcikge1xuICAgICAgICBlbERheVxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsRXZlbnQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IDw9IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgICAgIGVsRXZlbnQuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaGlkZGVuJylcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbEV2ZW50LmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIHJlbWFpbmluZ0NvdW50IHtudW1iZXJ9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0UmVtYWluaW5nQ291bnQoZWxEYXk6IEhUTUxFbGVtZW50LCByZW1haW5pbmdDb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IGVsUmVtYWluaW5nID0gZWxEYXkucXVlcnlTZWxlY3RvcignLmdjLXJlbWFpbmluZy1jb250YWluZXInKTtcbiAgICAgICAgaWYgKHJlbWFpbmluZ0NvdW50ID4gMCkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgZWxSZW1haW5pbmcuY2hpbGRyZW5bMF0uaW5uZXJUZXh0ID0gdGhpcy5tYWtlUmVtYWluaW5nVGV4dChyZW1haW5pbmdDb3VudCk7XG4gICAgICAgICAgICBlbFJlbWFpbmluZy5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsUmVtYWluaW5nLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2QjhCXHUzMDhBXHUzMDZFXHU0RTg4XHU1QjlBXHU2NTcwXHUzMDZFXHU4ODY4XHU3OTNBXHUzMEM2XHUzMEFEXHUzMEI5XHUzMEM4XHUzMDkyXHU0RjVDXHU2MjEwXG4gICAgICogQHBhcmFtIHJlbWFpbmluZ0NvdW50IHtudW1iZXJ9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1NjU3MFx1MzA2RVx1ODg2OFx1NzkzQVx1MzBDNlx1MzBBRFx1MzBCOVx1MzBDOFxuICAgICAqL1xuICAgIHByaXZhdGUgbWFrZVJlbWFpbmluZ1RleHQocmVtYWluaW5nQ291bnQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2NhbGl6ZWRSZW1haW5pbmdUZXh0LnJlcGxhY2UoJzpjb3VudCcsIFN0cmluZyhyZW1haW5pbmdDb3VudCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7RWxlbWVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NkI4Qlx1MzA4QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgaXNSZW1haW5pbmdUZXh0RWxlbWVudChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZWwuY2xvc2VzdCgnLmdjLXJlbWFpbmluZy1jb250YWluZXInKSAmJiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0VsZW1lbnR9IFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBwaWNrRGF5KGVsOiBFbGVtZW50KTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gZWwuY2xvc2VzdCgnLmdjLWRheScpIGFzIEhUTUxFbGVtZW50O1xuICAgIH1cbn0iLCAiLyoqXG4gKiBEYXRlVGltZVNlbGVjdG9yXG4gKlxuICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU5MDc4XHU2MjlFXHU2QTVGXHU4MEZEXHUzMDkyXHU2M0QwXHU0RjlCXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZCXHUzMDAxXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU2NENEXHU0RjVDXHUzMDZCXHUzMDg4XHUzMDhCXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU2MzA3XHU1QjlBXHUzMDkyXHU4ODRDXHUzMDQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdG9yIHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wcm9wZXJ0eU5hbWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NlbGVjdGlvblN0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3Rpb25FbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVzb3VyY2VJZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBcdTg5MDdcdTY1NzBcdTkwNzhcdTYyOUVcdTMwNENcdTY3MDlcdTUyQjlcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX211bHRpcGxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTYzQ0ZcdTc1M0JcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYXc6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA0Q1x1NTkwOVx1NjZGNFx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbGVtZW50U2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RWxlbWVudFNlbGVjdG9yKGVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3IgPSBlbGVtZW50U2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA5Mlx1NjMwMVx1MzA2NFx1MzBEN1x1MzBFRFx1MzBEMVx1MzBDNlx1MzBBM1x1NTQwRFx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMihkYXRhLWRhdGVcdTMwNkFcdTMwODlcdTMwMDFkYXRlKVxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eU5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlOYW1lKHByb3BlcnR5TmFtZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0Qlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbmFibGVkXG4gICAgICovXG4gICAgcHVibGljIHNldEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1ODkwN1x1NjU3MFx1OTA3OFx1NjI5RVx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0Qlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBtdWx0aXBsZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRNdWx0aXBsZShtdWx0aXBsZTogYm9vbGVhbik6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fbXVsdGlwbGUgPSBtdWx0aXBsZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU2M0NGXHU3NTNCXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIG9uRHJhd1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkRyYXcob25EcmF3OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25EcmF3ID0gb25EcmF3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNENcdTU5MDlcdTY2RjRcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gb25TZWxlY3RcbiAgICAgKi9cbiAgICBwdWJsaWMgb25TZWxlY3Qob25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25TZWxlY3QgPSBvblNlbGVjdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3QodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uU3RhcnQgPSB0aGlzLl9zZWxlY3Rpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3RFbmQodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uRW5kID0gdmFsdWU7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1ODlFM1x1OTY2NFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3QobnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2VsZWN0aW9uKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLl9zZWxlY3Rpb25TdGFydCwgdGhpcy5fc2VsZWN0aW9uRW5kXS5zb3J0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3M0ZFXHU1NzI4XHUzMDAxXHU5MDc4XHU2MjlFXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25TdGFydCAhPT0gbnVsbCAmJiB0aGlzLl9zZWxlY3Rpb25FbmQgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jbGljayhlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvdXJjZUlkID0gdGhpcy5waWNrUmVzb3VyY2VJZChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblNlbGVjdCh2YWx1ZSwgdmFsdWUsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1NjJCQ1x1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbW91c2VEb3duKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVkIHx8ICF0aGlzLl9tdWx0aXBsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvdXJjZUlkID0gdGhpcy5waWNrUmVzb3VyY2VJZChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCh2YWx1ZSk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU1MkQ1XHUzMDRCXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RW5kKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU5NkUyXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25TZWxlY3Qoc3RhcnQsIGVuZCwgdGhpcy5fcmVzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gZWwgXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHBpY2tWYWx1ZShlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2VsZW1lbnRTZWxlY3RvciArICc6bm90KC5kaXNhYmxlZCknKSAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgPy5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSBlbCBcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrUmVzb3VyY2VJZChlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KCdbZGF0YS1yZXNvdXJjZS1pZF0nKT8uZGF0YXNldFsncmVzb3VyY2VJZCddID8/IG51bGxcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTVFQTdcdTZBMTlcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0geCBYXHU1RUE3XHU2QTE5XG4gICAgICogQHBhcmFtIHkgWVx1NUVBN1x1NkExOVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrVmFsdWVCeVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IpKVxuICAgICAgICAgICAgLmZpbHRlcigoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0LmxlZnQgPD0geCAmJiB4IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0geSAmJiB5IDw9IHJlY3QuYm90dG9tO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdCgwKT8uZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdID8/IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHVibGljIGdldEVsZW1lbnRCeVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IgK1xuICAgICAgICAgICAgJ1tkYXRhLScgKyB0aGlzLl9wcm9wZXJ0eU5hbWUgKyAnPVwiJyArIHZhbHVlICsgJ1wiXSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTY2NDJcdTMwNkVcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTg4NjhcdTc5M0FcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX29uRHJhdykgeyAvLyBcdTYzQ0ZcdTc1M0JcdTMwOTJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwNjdcdTg4NENcdTMwNDZcbiAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb25EcmF3KHN0YXJ0LCBlbmQsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciArXG4gICAgICAgICAgICAodGhpcy5fcmVzb3VyY2VJZCAhPT0gbnVsbCA/ICcgW2RhdGEtcmVzb3VyY2UtaWQ9XCInICsgdGhpcy5fcmVzb3VyY2VJZCArICdcIl0gJyA6ICcgJykgK1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFNlbGVjdG9yXG4gICAgICAgICkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsLmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgaWYgKHN0YXJ0IDw9IHZhbHVlICYmIHZhbHVlIDw9IGVuZCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59IiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERheUdyaWRQb3B1cCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCOVx1MzBDQVx1MzBGQ1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB0aGlzLmNsb3NlKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTU4Qlx1MzA0RlxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHB1YmxpYyBvcGVuKGVsRGF5OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLmJ1aWxkUG9wdXAoZWxEYXkpO1xuICAgICAgICB0aGlzLmxheW91dFBvcHVwKGVsRGF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk1ODlcdTMwNThcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xvc2UoKSB7XG4gICAgICAgIHRoaXMuZmluZFBvcHVwRWxlbWVudCgpLmNsYXNzTGlzdC5hZGQoJ2djLWhpZGRlbicpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBmaW5kUG9wdXBFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvcignLmdjLWRheS1ncmlkLXBvcHVwJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU2OUNCXHU3QkM5XG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBidWlsZFBvcHVwKGVsRGF5OiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBET01cdTMwOTJcdTY5Q0JcdTdCQzlcbiAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuZmluZFBvcHVwRWxlbWVudCgpO1xuICAgICAgICBjb25zdCBlbERheUJvZHkgPSBlbERheS5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5LWJvZHknKS5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGVsRGF5Qm9keU9yaWcgPSBlbFBvcHVwLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXktYm9keScpO1xuICAgICAgICB0aGlzLnJlcGxhY2VBbGxEYXlFdmVudHMoZWxEYXlCb2R5LCB0aGlzLmdldEFsbERheUV2ZW50S2V5cyhlbERheUJvZHkpKTtcbiAgICAgICAgZWxEYXlCb2R5T3JpZy5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbERheUJvZHksIGVsRGF5Qm9keU9yaWcpO1xuICAgICAgICB0aGlzLmFkanVzdFBvcHVwKGVsUG9wdXApO1xuXG4gICAgICAgIC8vIFx1NjVFNVx1NEVEOFx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAoZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF0ZScpIGFzIEhUTUxFbGVtZW50KS5pbm5lclRleHRcbiAgICAgICAgICAgID0gKGVsRGF5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXRlJykgYXMgSFRNTEVsZW1lbnQpLmlubmVyVGV4dDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVrZXlcdTMwOTJcdTUxNjhcdTMwNjZcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWxEYXkge0hUTUxFbGVtZW50fSBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTMwNkVcdTY3MkNcdTRGNTNcdTkwRThcdTUyMDZcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldEFsbERheUV2ZW50S2V5cyhlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleV0nKSlcbiAgICAgICAgICAgIC5tYXAoKGVsOiBIVE1MRWxlbWVudCkgPT4gZWwuZGF0YXNldC5rZXkpXG4gICAgICAgICAgICAuZmlsdGVyKChrZXk6IHN0cmluZykgPT4ga2V5ICE9PSAnJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEI5XHUzMERBXHUzMEZDXHUzMEI1XHUzMEZDXHUzMDkyXHU1MTY4XHUzMDY2XHU1MjRBXHU5NjY0XG4gICAgICogQHBhcmFtIGVsRGF5Qm9keSB7SFRNTEVsZW1lbnR9IFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1MzA2RVx1NjcyQ1x1NEY1M1x1OTBFOFx1NTIwNlx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBrZXlzIHtBcnJheX0gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFa2V5XG4gICAgICovXG4gICAgcHJpdmF0ZSByZXBsYWNlQWxsRGF5RXZlbnRzKGVsRGF5Qm9keTogSFRNTEVsZW1lbnQsIGtleXM6IEFycmF5PGFueT4pIHtcbiAgICAgICAgLy8gXHU2NUUyXHUzMDZCXHU1MTY1XHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1MjRBXHU5NjY0XHUzMDU5XHUzMDhCXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbShlbERheUJvZHkucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJykpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWw6IEhUTUxFbGVtZW50KSA9PiBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKSk7XG5cbiAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXG4gICAgICAgIGNvbnN0IGVsQWxsRGF5RXZlbnRzID0gZWxEYXlCb2R5LnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cycpO1xuICAgICAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVsID1cbiAgICAgICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgICAgIC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcsICdnYy1lbmQnKTtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhpZGRlbicpO1xuICAgICAgICAgICAgZWxBbGxEYXlFdmVudHMuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1NTE4NVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NUZBRVx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBlbFBvcHVwIHtIVE1MRWxlbWVudH0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGp1c3RQb3B1cChlbFBvcHVwOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAvLyBcdTg4NjhcdTc5M0FcdTMwNTlcdTMwOEJcbiAgICAgICAgZWxQb3B1cC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1oaWRkZW4nKTtcblxuICAgICAgICAvLyBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkVcdTU5MjdcdTMwNERcdTMwNTVcdTMwOTJcdTgxRUFcdTUyRDVcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgICAgZWxQb3B1cC5zdHlsZS53aWR0aCA9IGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXG4gICAgICAgIC8vIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1ODFFQVx1NTJENVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICBjb25zdCBlbFRpbWVkRXZlbnRzID0gZWxQb3B1cC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnRzJykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGVsVGltZWRFdmVudHMuc3R5bGUuaGVpZ2h0ID0gJ2F1dG8nO1xuXG4gICAgICAgIC8vIFx1NEVENlx1MjZBQVx1RkUwRVx1NEVGNlx1MzA5Mlx1OTc1RVx1ODg2OFx1NzkzQVx1MzA2Qlx1MzA1OVx1MzA4QlxuICAgICAgICBjb25zdCBlbFJlbWFpbmluZyA9IGVsUG9wdXAucXVlcnlTZWxlY3RvcignLmdjLXJlbWFpbmluZy1jb250YWluZXInKTtcbiAgICAgICAgZWxSZW1haW5pbmcucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbFJlbWFpbmluZyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDZFXHUzMEVDXHUzMEE0XHUzMEEyXHUzMEE2XHUzMEM4XHUzMDkyXHU2NkY0XHU2NUIwXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBsYXlvdXRQb3B1cChlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgZWxQb3B1cCA9IHRoaXMuZmluZFBvcHVwRWxlbWVudCgpO1xuICAgICAgICBjb25zdCByZWN0UG9wdXAgPSBlbFBvcHVwLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCByZWN0RGF5ID0gZWxEYXkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCB4ID0gcmVjdERheS5sZWZ0IC0gMSArIHdpbmRvdy5zY3JvbGxYO1xuICAgICAgICBsZXQgeSA9IHJlY3REYXkudG9wIC0gMSArIHdpbmRvdy5zY3JvbGxZO1xuICAgICAgICBsZXQgdyA9IE1hdGgubWF4KHJlY3REYXkud2lkdGggKiAxLjEsIHJlY3RQb3B1cC53aWR0aCk7XG4gICAgICAgIGxldCBoID0gTWF0aC5tYXgocmVjdERheS5oZWlnaHQsIHJlY3RQb3B1cC5oZWlnaHQpO1xuICAgICAgICBpZiAoeCArIHcgPiB3aW5kb3cuaW5uZXJXaWR0aCkge1xuICAgICAgICAgICAgeCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gdztcbiAgICAgICAgfVxuICAgICAgICBpZiAoeSArIGggPiB3aW5kb3cuaW5uZXJIZWlnaHQpIHtcbiAgICAgICAgICAgIHggPSB3aW5kb3cuaW5uZXJIZWlnaHQgLSBoO1xuICAgICAgICB9XG4gICAgICAgIGVsUG9wdXAuc3R5bGUubGVmdCA9IHggKyAncHgnO1xuICAgICAgICBlbFBvcHVwLnN0eWxlLnRvcCA9IHkgKyAncHgnO1xuICAgICAgICBlbFBvcHVwLnN0eWxlLndpZHRoID0gdyArICdweCc7XG4gICAgICAgIGVsUG9wdXAuc3R5bGUuaGVpZ2h0ID0gaCArICdweCc7XG4gICAgfVxufSIsICJleHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRlVXRpbHMge1xuICAgIC8qKlxuICAgICAqIDFcdTY1RTVcdTMwNkVcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgTUlMTElTRUNPTkRTX1BFUl9EQVkgPSAyNCAqIDYwICogNjAgKiAxMDAwXG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVN0cmluZyhkOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gKG5ldyBEYXRlKGQpKS50b0xvY2FsZURhdGVTdHJpbmcoJ3N2LVNFJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTY2NDJcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVRpbWVTdHJpbmcoZCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBEYXRlVXRpbHMudG9EYXRlU3RyaW5nKGQpICsgJyAnICsgKG5ldyBEYXRlKGQpKS50b0xvY2FsZVRpbWVTdHJpbmcoXCJlbi1HQlwiKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2Qlx1NjVFNVx1NjU3MFx1MzA5Mlx1NTJBMFx1N0I5N1xuICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICAgICAqIEBwYXJhbSBkYXlzIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NTJBMFx1N0I5N1x1NUY4Q1x1MzA2RVx1NjVFNVx1NEVEOChcdTMwREZcdTMwRUFcdTc5RDIpXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhZGREYXlzKGRhdGU6IHN0cmluZywgZGF5czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZS5zdWJzdHJpbmcoMCwgMTApICsgJyAwMDowMDowMCcpICsgZGF5cyAqIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA2RVx1NjVFNVx1NjU3MFx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZEYXlzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZDEgPSBuZXcgRGF0ZShkYXRlMSlcbiAgICAgICAgbGV0IGQyID0gbmV3IERhdGUoZGF0ZTIpXG4gICAgICAgIGQxLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIGQyLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChkMi5nZXRUaW1lKCkgLSBkMS5nZXRUaW1lKCkpIC8gRGF0ZVV0aWxzLk1JTExJU0VDT05EU19QRVJfREFZKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA5Mm1zXHUzMDY3XHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICogQHBhcmFtIGRhdGUxIHtzdHJpbmd9IFx1NjVFNVx1NEVEODFcbiAgICAgKiBAcGFyYW0gZGF0ZTIge3N0cmluZ30gXHU2NUU1XHU0RUQ4MlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGlmZkluTWlsbGlzZWNvbmRzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gRGF0ZS5wYXJzZShkYXRlMikgLSBEYXRlLnBhcnNlKGRhdGUxKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcxRlx1OTU5M1x1MzA2RVx1OTFDRFx1MzA2QVx1MzA4QVx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBzdGFydDEge3N0cmluZ30gXHU2NzFGXHU5NTkzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKiBAcGFyYW0gc3RhcnQyIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzJcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpOiBBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBzdGFydDEgPD0gc3RhcnQyID8gc3RhcnQyIDogc3RhcnQxXG4gICAgICAgIGNvbnN0IGVuZCA9IGVuZDEgPD0gZW5kMiA/IGVuZDEgOiBlbmQyXG4gICAgICAgIHJldHVybiBzdGFydCA8PSBlbmQgPyBbc3RhcnQsIGVuZF0gOiBbbnVsbCwgbnVsbF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwOTJcdTZFMjFcdTMwNTdcdTMwMDFcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdThGRDRcdTMwNTlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdGFydCB7c3RyaW5nfSBcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcbiAgICAgKiBAcGFyYW0gZW5kIHtzdHJpbmd9IFx1N0Q0Mlx1NEU4Nlx1NjY0Mlx1OTU5M1xuICAgICAqIEBwYXJhbSBpbnRlcnZhbCB7c3RyaW5nfSBcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTQoXHU3OUQyXHU2NTcwKVxuICAgICAqIEBwYXJhbSB0aW1lIHtzdHJpbmd9IFx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEY1NVx1NzU2QVx1NzZFRVx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdGltZVNsb3Qoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIGludGVydmFsOiBzdHJpbmcsIHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChEYXRlLnBhcnNlKHRpbWUgPiBlbmQgPyBlbmQgOiB0aW1lKSAtIERhdGUucGFyc2Uoc3RhcnQpKSAvIHBhcnNlSW50KGludGVydmFsKSAvIDEwMDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1MzA2RVx1NjY0Mlx1OTU5M1x1MzA5Mlx1NTkwOVx1NjZGNFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGVUaW1lIHtzdHJpbmd9IFx1NjVFNVx1NjY0MlxuICAgICAqIEBwYXJhbSB0aW1lIHtzdHJpbmd9IFx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NjY0MlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc2V0VGltZU9mRGF0ZVRpbWUoZGF0ZVRpbWU6IHN0cmluZywgdGltZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGRhdGVUaW1lLnN1YnN0cmluZygwLCAxMCkgKyAnICcgKyB0aW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA5Mlx1NTIwNlx1NjU3MFx1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9NaW51dGVzKHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IFtob3VyLCBtaW51dGVdID0gdGltZS5zcGxpdCgnOicpXG4gICAgICAgIHJldHVybiBwYXJzZUludChob3VyKSAqIDYwICsgcGFyc2VJbnQobWludXRlKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA5Mlx1NzlEMlx1NjU3MFx1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9TZWNvbmRzKHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IFtoLCBpLCBzXSA9IHRpbWUuc3BsaXQoJzonKTtcbiAgICAgICAgcmV0dXJuIChwYXJzZUludChoKSAqIDYwICsgcGFyc2VJbnQoaSkpICogNjAgKyBwYXJzZUludChzKTtcbiAgICB9XG59IiwgImltcG9ydCBTZWxlY3RvciBmcm9tIFwiLi9TZWxlY3RvclwiO1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9EYXRlVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXplciB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NUJGRVx1OEM2MVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZXZlbnRTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1x1MzBGQlx1NjY0Mlx1OTU5M1x1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2VsZWN0b3I6IFNlbGVjdG9yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEOFx1MzBDM1x1MzBDMFx1MzBGQ1x1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGVhZEN1cnNvcjogc3RyaW5nID0gJ2djLWN1cnNvci13LXJlc2l6ZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzZcdTMwRkNcdTMwRUJcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RhaWxDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3ItZS1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZzogSFRNTEVsZW1lbnQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU1MjFEXHU2NzFGXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ1N0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU1MjFEXHU2NzFGXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ0VuZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2Qlx1MzAwMVx1NTI0RFx1NTZERVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA1Rlx1NTAyNFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdWYWx1ZTogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NzlGQlx1NTJENVx1OTFDRlx1MzAwMlx1NzlGQlx1NTJENVx1OTFDRlx1MzA0Q1x1NUMxMVx1MzA2QVx1MzA0NFx1MzA2OFx1MzAwMVx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA2OFx1NTIyNFx1NjVBRFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdDb3VudDogbnVtYmVyID0gMDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NjNCNFx1MzA5M1x1MzA2MFx1NEY0RFx1N0Y2RVx1RkYwOFx1NjVFNVx1NEVEOFx1RkYwOVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZ3JhYmJlZDogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0dyYWJiaW5nSGVhZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9pc0dyYWJiaW5nVGFpbDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHU0RTAwXHU2NUU1XHUzMDZFXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfdW5pdDogbnVtYmVyID0gMTtcblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NzUxRlx1NjIxMFx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25QcmV2aWV3OiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgc2VsZWN0b3I6IFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25DbGljayhlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgRWxlbWVudCk7XG4gICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgaWYgKGVsLmRhdGFzZXQuY2FuQ2xpY2sgPT09ICd0cnVlJyAmJiBlbC5kYXRhc2V0LmNhbk1vdmUgPT09ICdmYWxzZScgJiYgZWwuZGF0YXNldC5jYW5SZXNpemUgPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGVsLmRhdGFzZXQua2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEMwXHUzMEE2XHUzMEYzXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VEb3duKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLnBpY2tFdmVudChlLnRhcmdldCBhcyBFbGVtZW50KTtcbiAgICAgICAgaWYgKGVsICYmIChlbC5kYXRhc2V0LmNhbk1vdmUgPT09ICd0cnVlJyB8fCBlbC5kYXRhc2V0LmNhblJlc2l6ZSA9PT0gJ3RydWUnKSkge1xuICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1OTA5XHU1RjYyXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAgICB0aGlzLl9pc0dyYWJiaW5nSGVhZCA9IHRoaXMuX2lzR3JhYmJpbmdUYWlsID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhpdEhlYWQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ1RhaWwgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpdFRhaWwoZS50YXJnZXQgYXMgRWxlbWVudCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU5NThCXHU1OUNCXHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICAgICAgICB0aGlzLl9ncmFiYmVkID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBlbDtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nU3RhcnQgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LnN0YXJ0O1xuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdFbmQgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmVuZDtcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHVGRjA4XHU4ODY4XHU3OTNBXHUzMDkyXHU2RDg4XHUzMDU5XHVGRjA5XG4gICAgICAgICAgICB0aGlzLnNldERyYWdnaW5nQ2xhc3ModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5rZXksIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBcdTczRkVcdTU3MjhcdTMwNkVcdTY1RTVcdTRFRDhcdTMwOTJcdThBMThcdTkzMzJcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nVmFsdWUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyh0aGlzLl9ncmFiYmVkKTtcblxuICAgICAgICAgICAgLy8gXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUN1cnNvcigpO1xuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nQ291bnQgPSAwO1xuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwRTBcdTMwRkNcdTMwRDZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1ODg2OFx1NzkzQVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9zZWxlY3Rvci5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyh2YWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzA1Rlx1MzA4MVx1MzA2Qlx1NzlGQlx1NTJENVx1OTFDRlx1MzA5Mlx1OEExOFx1OTMzMlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdDb3VudCsrO1xuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwQTJcdTMwQzNcdTMwRDdcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmtleTtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdGhpcy5fZ3JhYmJlZCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmRyYWcodmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUgJiYgc3RhcnQgIT09IG51bGwgJiYgZW5kICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uTW92ZShrZXksIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fZHJhZ2dpbmdDb3VudCA8IDMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5jYW5DbGljayA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25QcmV2aWV3KHRoaXMuX2RyYWdnaW5nLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZ0NsYXNzKGtleSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUN1cnNvcigpO1xuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RXZlbnRTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2V2ZW50U2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5ODJEXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHU2NjQyXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGN1cnNvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRIZWFkQ3Vyc29yKGN1cnNvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2hlYWRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1NjY0Mlx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjdXJzb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VGFpbEN1cnNvcihjdXJzb3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl90YWlsQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFMDBcdTY1RTVcdTMwNkVcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdW5pdCB7bnVtYmVyfSBcdTRFMDBcdTY1RTVcdTMwNkVcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VW5pdCh1bml0OiBudW1iZXIpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fdW5pdCA9IHVuaXQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkV2ZW50KGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25FdmVudCA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Nb3ZlKGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uTW92ZSA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTc1MUZcdTYyMTBcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25QcmV2aWV3KGNhbGxiYWNrOiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vblByZXZpZXcgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0RyYWdnaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJhZ2dpbmcgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICovXG4gICAgcHVibGljIGdldEdyYWJiZWREYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ncmFiYmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBpY2tFdmVudChlbDogRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2V2ZW50U2VsZWN0b3IpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRIZWFkKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy1oZWFkJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhpdFRhaWwoZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLXRhaWwnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXREcmFnZ2luZ0NsYXNzKGtleTogc3RyaW5nLCBkcmFnZ2luZzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fZXZlbnRTZWxlY3RvciArICdbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3M0ZFXHU1NzI4XHUzMDAxXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZGXHUzMDAxXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHVibGljIGlzQWxsRGF5RHJhZ2dpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kcmFnZ2luZz8uZGF0YXNldC5hbGxEYXkgPT09ICd0cnVlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTMwRDFcdTMwRTlcdTMwRTFcdTMwRkNcdTMwQkZcdTMwNENcdTY1NzRcdTY1NzBcdTUwMjRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNOdW1iZXIodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gL15cXGQrJC8udGVzdCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWcodmFsdWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pc051bWJlcih2YWx1ZSlcbiAgICAgICAgICAgID8gdGhpcy5kcmFnTnVtYmVyKHZhbHVlKVxuICAgICAgICAgICAgOiB0aGlzLmRyYWdEYXRlVGltZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU2NjQyXHUzMDZFXHUzMEQxXHUzMEU5XHUzMEUxXHUzMEZDXHUzMEJGXHUzMDZCXHU1QkZFXHUzMDU3XHUzMDY2XHUzMDAxXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWdEYXRlVGltZSh2YWx1ZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBEYXRlVXRpbHMuZGlmZkluTWlsbGlzZWNvbmRzKHRoaXMuX2dyYWJiZWQsIHZhbHVlKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZS5wYXJzZSh0aGlzLl9kcmFnZ2luZ1N0YXJ0KSArICh0aGlzLl9pc0dyYWJiaW5nSGVhZCA/IGRpZmYgOiAwKSk7XG4gICAgICAgIGxldCBlbmQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nRW5kKSArICh0aGlzLl9pc0dyYWJiaW5nVGFpbCA/IGRpZmYgOiAwKSk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWQubGVuZ3RoKTtcbiAgICAgICAgZW5kID0gZW5kLnN1YnN0cmluZygwLCB0aGlzLl9ncmFiYmVkLmxlbmd0aCk7XG4gICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjU3NFx1NjU3MFx1NTAyNFx1MzA2RVx1MzBEMVx1MzBFOVx1MzBFMVx1MzBGQ1x1MzBCRlx1MzA2Qlx1NUJGRVx1MzA1N1x1MzA2Nlx1MzAwMVx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBkcmFnTnVtYmVyKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgY29uc3QgZGlmZiA9IHBhcnNlSW50KHZhbHVlKSAtIHBhcnNlSW50KHRoaXMuX2dyYWJiZWQpO1xuICAgICAgICBsZXQgc3RhcnQgPSBwYXJzZUludCh0aGlzLl9kcmFnZ2luZ1N0YXJ0KSArICh0aGlzLl9pc0dyYWJiaW5nSGVhZCA/IGRpZmYgOiAwKTtcbiAgICAgICAgbGV0IGVuZCA9IHBhcnNlSW50KHRoaXMuX2RyYWdnaW5nRW5kKSArICh0aGlzLl9pc0dyYWJiaW5nVGFpbCA/IGRpZmYgOiAwKTtcbiAgICAgICAgaWYgKHRoaXMuaXNBbGxEYXlEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICBzdGFydCA9IE1hdGguZmxvb3Ioc3RhcnQgLyB0aGlzLl91bml0KSAqIHRoaXMuX3VuaXQ7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLmZsb29yKGVuZCAvIHRoaXMuX3VuaXQpICogdGhpcy5fdW5pdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgICAgICBlbmQgPSBzdGFydFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbc3RhcnQsIGVuZF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlQ3Vyc29yKCkge1xuICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5faGVhZEN1cnNvciwgdGhpcy5fdGFpbEN1cnNvcilcbiAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkICYmIHRoaXMuX2lzR3JhYmJpbmdUYWlsKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQoJ2djLWN1cnNvci1tb3ZlJylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKHRoaXMuX2hlYWRDdXJzb3IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCh0aGlzLl90YWlsQ3Vyc29yKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGVQcmV2aWV3KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nVmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmRyYWcodmFsdWUpXG4gICAgICAgICAgICBpZiAodGhpcy5fb25QcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25QcmV2aWV3KHRoaXMuX2RyYWdnaW5nLCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdWYWx1ZSA9IHZhbHVlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk4MkRcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzR3JhYmJpbmdIZWFkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNHcmFiYmluZ0hlYWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc0dyYWJiaW5nVGFpbCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzR3JhYmJpbmdUYWlsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2OFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNHcmFiYmluZ0JvZHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0dyYWJiaW5nSGVhZCAmJiB0aGlzLl9pc0dyYWJiaW5nVGFpbDtcbiAgICB9XG59IiwgImltcG9ydCBTZWxlY3RvciBmcm9tIFwiLi9TZWxlY3RvclwiO1xuaW1wb3J0IFJlc2l6ZXIgZnJvbSBcIi4vUmVzaXplclwiO1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9EYXRlVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWxsRGF5RXZlbnQge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZGF0ZVNlbGVjdG9yOiBTZWxlY3RvciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQjZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jlc2l6ZXI6IFJlc2l6ZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMERCXHUzMEQwXHUzMEZDXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9ob3Zlcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqIEBwYXJhbSBkYXRlU2VsZWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgZGF0ZVNlbGVjdG9yOiBTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5fZGF0ZVNlbGVjdG9yID0gZGF0ZVNlbGVjdG9yO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgKi9cbiAgICBwdWJsaWMgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplciA9IG5ldyBSZXNpemVyKHRoaXMuX3Jvb3QsIHRoaXMuX2RhdGVTZWxlY3RvcilcbiAgICAgICAgICAgIC5zZXRFdmVudFNlbGVjdG9yKCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgLnNldEhlYWRDdXJzb3IoJ2djLWN1cnNvci13LXJlc2l6ZScpXG4gICAgICAgICAgICAuc2V0VGFpbEN1cnNvcignZ2MtY3Vyc29yLWUtcmVzaXplJylcbiAgICAgICAgICAgIC5vbkV2ZW50KChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uTW92ZSgoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdmUoa2V5LCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uUHJldmlldygoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJldmlldygpO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydCAmJiBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVQcmV2aWV3KGVsLCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3Zlci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwREVcdTMwQTZcdTMwQjlcdTMwREJcdTMwRDBcdTMwRkNcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZSB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VPdmVyKGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLl9yZXNpemVyLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwMDFcdTY1RTVcdTRFRDhcdTMwNkVcdTkwNzhcdTYyOUVcdTUxRTZcdTc0MDZcdTRFMkRcdTMwNkZcdTMwMDFcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNkFcdTMwNDRcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0FsbERheUV2ZW50KGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50LCB0cnVlKTtcbiAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGw7XG4gICAgICAgIGlmIChrZXkgIT09IHRoaXMuX2hvdmVyKSB7XG4gICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5faG92ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLl9ob3ZlciA9IGtleSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVyU2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyk6IEFsbERheUV2ZW50IHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5zZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEByZXR1cm5zIHtBbGxEYXlFdmVudH0gXHU4MUVBXHU4RUFCXG4gICAgICovXG4gICAgcHVibGljIG9uRXZlbnQoY2FsbGJhY2s6IChrZXk6IHN0cmluZykgPT4gdm9pZCk6IEFsbERheUV2ZW50IHtcbiAgICAgICAgdGhpcy5fb25FdmVudCA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKiBAcmV0dXJucyB7QWxsRGF5RXZlbnR9IFx1ODFFQVx1OEVBQlxuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUoY2FsbGJhY2s6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiBBbGxEYXlFdmVudCB7XG4gICAgICAgIHRoaXMuX29uTW92ZSA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gd2l0aG91dFBvcHVwIHtib29sZWFufSBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk2NjRcdTU5MTZcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwaWNrQWxsRGF5RXZlbnQoZWw6IEhUTUxFbGVtZW50LCB3aXRob3V0UG9wdXA6IGJvb2xlYW4gPSBmYWxzZSk6IG51bGwgfCBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgKHdpdGhvdXRQb3B1cCA/ICcnIDogJywgLmdjLWRheS1ncmlkLXBvcHVwJykpXG4gICAgICAgICAgICA/IGVsLmNsb3Nlc3QoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGtleSB7c3RyaW5nfSBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcbiAgICAgKiBAcGFyYW0gaG92ZXIge2Jvb2xlYW59IFx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXRIb3ZlckFsbERheUV2ZW50KGtleTogc3RyaW5nLCBob3ZlcjogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob3Zlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtaG92ZXInKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaG92ZXInKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1ODg2OFx1NzkzQVxuICAgICAqIEBwYXJhbSBlbEV2ZW50IHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIGV2ZW50U3RhcnQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICogQHBhcmFtIGV2ZW50RW5kIHtzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVQcmV2aWV3KGVsRXZlbnQ6IEhUTUxFbGVtZW50LCBldmVudFN0YXJ0OiBzdHJpbmcsIGV2ZW50RW5kOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLXdlZWssIC5nYy1hbGwtZGF5LXNlY3Rpb24nKSkuZm9yRWFjaChlbFdlZWsgPT4ge1xuICAgICAgICAgICAgY29uc3QgW3dlZWtTdGFydCwgd2Vla0VuZF0gPSB0aGlzLmdldFdlZWtQZXJpb2QoZWxXZWVrKVxuICAgICAgICAgICAgaWYgKHdlZWtTdGFydCAmJiB3ZWVrRW5kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3BlcmlvZFN0YXJ0LCBwZXJpb2RFbmRdID0gRGF0ZVV0aWxzLm92ZXJsYXBQZXJpb2QoZXZlbnRTdGFydCwgZXZlbnRFbmQsIHdlZWtTdGFydCwgd2Vla0VuZClcbiAgICAgICAgICAgICAgICBpZiAocGVyaW9kU3RhcnQgJiYgcGVyaW9kRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsUHJldmlldyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5W2RhdGEtZGF0ZT1cIicgKyBwZXJpb2RTdGFydCArICdcIl0gLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpXG4gICAgICAgICAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgPD0gdGhpcy5fcmVzaXplci5nZXRHcmFiYmVkRGF0ZSgpICYmIHRoaXMuX3Jlc2l6ZXIuZ2V0R3JhYmJlZERhdGUoKSA8PSB3ZWVrRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTkwMzFcdTMwNjdcdTMwNkZcdTMwMDFcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTMwNkVcdTdFMjZcdTRGNERcdTdGNkVcdTMwOTJcdThBQkZcdTdCQzBcdTMwNTlcdTMwOEJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3LCB0aGlzLmdldEluZGV4SW5QYXJlbnQoZWxFdmVudCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBlbEV2ZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlzID0gRGF0ZVV0aWxzLmRpZmZEYXlzKHBlcmlvZFN0YXJ0LCBwZXJpb2RFbmQpICsgMVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkanVzdFByZXZpZXcoZWwsIGRheXMsIHBlcmlvZFN0YXJ0ID09PSBldmVudFN0YXJ0LCBwZXJpb2RFbmQgPT09IGV2ZW50RW5kKVxuICAgICAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTAzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzBGQlx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbFdlZWsge0hUTUxFbGVtZW50fSBcdTkwMzFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1OTAzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzBGQlx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRXZWVrUGVyaW9kKGVsV2VlazogSFRNTEVsZW1lbnQpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgY29uc3QgZWxEYXlzID0gZWxXZWVrLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1kYXk6bm90KC5nYy1kaXNhYmxlZCknKSBhcyBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PlxuICAgICAgICBpZiAoZWxEYXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbZWxEYXlzWzBdLmRhdGFzZXQuZGF0ZSwgZWxEYXlzW2VsRGF5cy5sZW5ndGggLSAxXS5kYXRhc2V0LmRhdGVdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW251bGwsIG51bGxdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwNkJcdTU0MDhcdTMwOEZcdTMwNUJcdTMwOEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY1RTVcdTY1NzBcbiAgICAgKiBAcGFyYW0gaXNTdGFydCB7Ym9vbGVhbn0gXHU5MDMxXHU1MTg1XHUzMDZCXHU5NThCXHU1OUNCXHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGlzRW5kIHtib29sZWFufSBcdTkwMzFcdTUxODVcdTMwNkJcdTdENDJcdTRFODZcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWRqdXN0UHJldmlldyhlbDogSFRNTEVsZW1lbnQsIGRheXM6IG51bWJlciwgaXNTdGFydDogYm9vbGVhbiwgaXNFbmQ6IGJvb2xlYW4pIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1zdGFydCcpXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWVuZCcpXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDc7IGkrKykge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtJyArIGkgKyAnZGF5cycpXG4gICAgICAgIH1cbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtJyArIGRheXMgKyAnZGF5cycpXG4gICAgICAgIGlmIChpc1N0YXJ0KSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRW5kKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1lbmQnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1RkRPTVx1ODk4MVx1N0QyMFx1MzA0Q1x1NTE0NFx1NUYxRlx1MzA2RVx1NEUyRFx1MzA2N1x1NEY1NVx1NzU2QVx1NzZFRVx1MzA0Qlx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1MzBBNFx1MzBGM1x1MzBDN1x1MzBDM1x1MzBBRlx1MzBCOVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRJbmRleEluUGFyZW50KGVsOiBIVE1MRWxlbWVudCk6IG51bWJlciB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZWwucGFyZW50Tm9kZS5jaGlsZHJlbikuaW5kZXhPZihlbClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZcdTY1NzBcdTMwNjBcdTMwNTFcdTdBN0FcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdThGRkRcdTUyQTBcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3OiBIVE1MRWxlbWVudCwgY291bnQ6IG51bWJlcikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIGVsUHJldmlldy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NTI0QVx1OTY2NFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW1vdmVQcmV2aWV3KCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1wcmV2aWV3JykpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWw6IEVsZW1lbnQpID0+IGVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsLmNsb25lTm9kZShmYWxzZSksIGVsKSlcbiAgICB9XG59IiwgImltcG9ydCBTZWxlY3RvciBmcm9tICcuL1NlbGVjdG9yJ1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9EYXRlVXRpbHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF5R3JpZFRpbWVkRXZlbnQge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9kYXRlU2VsZWN0b3I6IFNlbGVjdG9yO1xuXG4gICAgLyoqXG4gICAgICogQWxwaW5lLmpzXHUzMDZFXHUzMEE0XHUzMEYzXHUzMEI5XHUzMEJGXHUzMEYzXHUzMEI5XG4gICAgICovXG4gICAgcHJpdmF0ZSBfYWxwaW5lOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcml2YXRlIF9kcmFnZ2luZzogSFRNTEVsZW1lbnQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogXHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICogQHBhcmFtIGRhdGVTZWxlY3RvclxuICAgICAqIEBwYXJhbSBhbHBpbmVcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgZGF0ZVNlbGVjdG9yOiBTZWxlY3RvciwgYWxwaW5lOiBhbnkpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuX2RhdGVTZWxlY3RvciA9IGRhdGVTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5fYWxwaW5lID0gYWxwaW5lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgdGhpcy5fb25EcmFnU3RhcnQuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCB0aGlzLl9vbkRyYWdPdmVyLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCB0aGlzLl9vbkRyb3AuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VuZCcsIHRoaXMuX29uRHJhZ0VuZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKlxuICAgICAqIEBwYXJhbSBvbkV2ZW50IHtGdW5jdGlvbn0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBvbkV2ZW50KG9uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZCk6IERheUdyaWRUaW1lZEV2ZW50IHtcbiAgICAgICAgdGhpcy5fb25FdmVudCA9IG9uRXZlbnQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqXG4gICAgICogQHBhcmFtIG9uTW92ZSB7RnVuY3Rpb259IFx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEByZXR1cm5zIHtEYXlHcmlkVGltZWRFdmVudH0gXHUzMEE0XHUzMEYzXHUzMEI5XHUzMEJGXHUzMEYzXHUzMEI5XG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShvbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiBEYXlHcmlkVGltZWRFdmVudCB7XG4gICAgICAgIHRoaXMuX29uTW92ZSA9IG9uTW92ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICpcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uQ2xpY2soZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0V2ZW50KGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgaWYgKGVsPy5kYXRhc2V0LmNhbkNsaWNrID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGVsPy5kYXRhc2V0LmtleTtcbiAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICAvLyBcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTU4MzRcdTU0MDhcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTYyQkNcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25Nb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpKSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25EcmFnU3RhcnQoZTogRHJhZ0V2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gZWw7XG4gICAgICAgICAgICBlLmRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuICAgICAgICAgICAgZS5kYXRhVHJhbnNmZXIuc2V0RGF0YSgndGV4dC9wbGFpbicsIGVsLmRhdGFzZXQua2V5KTtcbiAgICAgICAgICAgIHRoaXMuX2FscGluZS4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRHJhZ2dpbmdDbGFzcygpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA0Q1x1ODk4MVx1N0QyMFx1MzA2Qlx1NEU1N1x1MzA2M1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtEcmFnRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYWdPdmVyKGU6IERyYWdFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5fZGF0ZVNlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgIGlmIChkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3Iuc2VsZWN0KGRhdGUpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJvcChlOiBEcmFnRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gXHUzMEM5XHUzMEVEXHUzMEMzXHUzMEQ3XHU1MUU2XHU3NDA2XHUzMDkyXHU1QjlGXHU4ODRDXG4gICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9kYXRlU2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGUuZGF0YVRyYW5zZmVyLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcbiAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRheXMgPSBEYXRlVXRpbHMuZGlmZkRheXModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydCwgZGF0ZSk7XG4gICAgICAgICAgICBpZiAoZGF5cyAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZVV0aWxzLmFkZERheXModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydCwgZGF5cykpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKERhdGVVdGlscy5hZGREYXlzKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuZW5kLCBkYXlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDRDXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHU1OTE2XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge0RyYWdFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJhZ0VuZChlOiBEcmFnRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4OUUzXHU5NjY0XG4gICAgICAgIHRoaXMuX2RhdGVTZWxlY3Rvci5kZXNlbGVjdCgpO1xuXG4gICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE0M1x1MzA2Qlx1NjIzQlx1MzA1OVxuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJyk7XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZET01cdTg5ODFcdTdEMjBcdTMwNkVcdThGRDFcdTMwNEZcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgcGlja0V2ZW50KGVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QoJy5nYy1kYXktZ3JpZCwgLmdjLWRheS1ncmlkLXBvcHVwJylcbiAgICAgICAgICAgID8gKGVsLmNsb3Nlc3QoJy5nYy10aW1lZC1ldmVudC1jb250YWluZXInKSBhcyBIVE1MRWxlbWVudClcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTcyQjZcdTYxNEJcdTMwNkJcdTMwNTlcdTMwOEJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHt2b2lkfVxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkRHJhZ2dpbmdDbGFzcygpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZy5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpO1xuICAgICAgICB9XG4gICAgfVxufSIsICJpbXBvcnQgRGF5R3JpZExpbWl0IGZyb20gXCIuL21vZHVsZXMvRGF5R3JpZExpbWl0XCI7XG5pbXBvcnQgU2VsZWN0b3IgZnJvbSAnLi9tb2R1bGVzL1NlbGVjdG9yLmpzJ1xuaW1wb3J0IERheUdyaWRQb3B1cCBmcm9tICcuL21vZHVsZXMvRGF5R3JpZFBvcHVwJ1xuaW1wb3J0IEFsbERheUV2ZW50IGZyb20gXCIuL21vZHVsZXMvQWxsRGF5RXZlbnQuanNcIjtcbmltcG9ydCBEYXlHcmlkVGltZWRFdmVudCBmcm9tIFwiLi9tb2R1bGVzL0RheUdyaWRUaW1lZEV2ZW50LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRheUdyaWQoY29tcG9uZW50UGFyYW1ldGVycykge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTg4NjhcdTc5M0FcdTRFRjZcdTY1NzBcdTMwOTJcdTUyMzZcdTk2NTBcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRjNcdTMwRERcdTMwRkNcdTMwQ0RcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIGRheUdyaWRMaW1pdDogRGF5R3JpZExpbWl0LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRjNcdTMwRERcdTMwRkNcdTMwQ0RcdTMwRjNcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIGRheUdyaWRQb3B1cDogRGF5R3JpZFBvcHVwLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIGRhdGVTZWxlY3RvcjogU2VsZWN0b3IsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWRFdmVudDogRGF5R3JpZFRpbWVkRXZlbnQsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgYWxsRGF5RXZlbnQ6IEFsbERheUV2ZW50LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICAvLyBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwNkJcdTk1QTJcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIHRoaXMuZGF5R3JpZFBvcHVwID0gbmV3IERheUdyaWRQb3B1cCh0aGlzLiRlbCk7XG5cbiAgICAgICAgICAgIC8vIFx1ODg2OFx1NzkzQVx1NjU3MFx1MzA5Mlx1NTIzNlx1OTY1MFx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGM1x1MzBERFx1MzBGQ1x1MzBDRFx1MzBGM1x1MzBDOFx1MzA2Qlx1OTVBMlx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgdGhpcy5kYXlHcmlkTGltaXQgPSBuZXcgRGF5R3JpZExpbWl0KHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRMb2NhbGl6ZWRSZW1haW5pbmdUZXh0KGNvbXBvbmVudFBhcmFtZXRlcnMucmVtYWluaW5nKVxuICAgICAgICAgICAgICAgIC5vblJlbWFpbmluZ1RleHRDbGljaygoZWxEYXkpID0+IHRoaXMuZGF5R3JpZFBvcHVwLm9wZW4oZWxEYXkpKTtcblxuICAgICAgICAgICAgLy8gXHU2NUU1XHU0RUQ4XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3RvciA9IG5ldyBTZWxlY3Rvcih0aGlzLiRlbClcbiAgICAgICAgICAgICAgICAuc2V0Q29udGFpbmVyU2VsZWN0b3IoJy5nYy1kYXktZ3JpZCcpXG4gICAgICAgICAgICAgICAgLnNldEVsZW1lbnRTZWxlY3RvcignLmdjLWRheScpXG4gICAgICAgICAgICAgICAgLnNldFByb3BlcnR5TmFtZSgnZGF0ZScpXG4gICAgICAgICAgICAgICAgLnNldEVuYWJsZWQoY29tcG9uZW50UGFyYW1ldGVycy5jYW5TZWxlY3REYXRlcylcbiAgICAgICAgICAgICAgICAuc2V0TXVsdGlwbGUoY29tcG9uZW50UGFyYW1ldGVycy5jYW5TZWxlY3RNdWx0aXBsZURhdGVzKVxuICAgICAgICAgICAgICAgIC5vblNlbGVjdCgoc3RhcnQsIGVuZCwgcmVzb3VyY2VJZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRGF0ZShzdGFydCArICcgMDA6MDA6MDAnLCBlbmQgKyAnIDIzOjU5OjU5JywgcmVzb3VyY2VJZClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICB0aGlzLmFsbERheUV2ZW50ID0gbmV3IEFsbERheUV2ZW50KHRoaXMuJGVsLCB0aGlzLmRhdGVTZWxlY3RvcilcbiAgICAgICAgICAgICAgICAuc2V0Q29udGFpbmVyU2VsZWN0b3IoJy5nYy1kYXktZ3JpZCcpXG4gICAgICAgICAgICAgICAgLm9uTW92ZSgoa2V5LCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25Nb3ZlKGtleSwgc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbkV2ZW50KChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZCXHU5NUEyXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICB0aGlzLnRpbWVkRXZlbnQgPSBuZXcgRGF5R3JpZFRpbWVkRXZlbnQodGhpcy4kZWwsIHRoaXMuZGF0ZVNlbGVjdG9yLCB0aGlzKVxuICAgICAgICAgICAgICAgIC5vbkV2ZW50KChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbk1vdmUoKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA2RVx1NzY3Qlx1OTMzMlxuICAgICAgICAgICAgdGhpcy5kYXlHcmlkUG9wdXAucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgICAgIHRoaXMuYWxsRGF5RXZlbnQucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgICAgIHRoaXMudGltZWRFdmVudC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy5kYXRlU2VsZWN0b3IucmVnaXN0ZXJDYWxsYmFja3MoKTtcblxuICAgICAgICAgICAgLy8gTGl2ZXdpcmVcdTMwNEJcdTMwODlcdTMwNkVcdTVGMzdcdTUyMzZcdTY2RjRcdTY1QjBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgICAgICAgIExpdmV3aXJlLm9uKCdyZWZyZXNoQ2FsZW5kYXInLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4gdGhpcy5kYXlHcmlkTGltaXQudXBkYXRlTGF5b3V0KHRydWUpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7QUFBQSxJQUFxQixnQkFBckIsTUFBcUIsY0FBYTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUF5RDlCLFlBQVksTUFBbUI7QUFwRC9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVE7QUFNUjtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGlCQUF3QjtBQU1oQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGlCQUF3QjtBQU1oQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGdCQUF1QjtBQU0vQjtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLDJCQUFrQztBQUsxQztBQUFBO0FBQUE7QUFBQSx3QkFBUTtBQXdCSixTQUFLLFFBQVE7QUFDYixTQUFLLEtBQUs7QUFBQSxFQUNkO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLTyxPQUFPO0FBQ1YsU0FBSyxhQUFhO0FBQ2xCLFdBQU8saUJBQWlCLFVBQVUsS0FBSyxVQUFVLEtBQUssSUFBSSxDQUFDO0FBQzNELFNBQUssTUFBTSxpQkFBaUIsU0FBUyxLQUFLLFNBQVMsS0FBSyxJQUFJLENBQUM7QUFDN0QsU0FBSyxNQUFNLGlCQUFp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
