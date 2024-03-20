var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
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

// resources/js/modules/TimelineLayout.ts
var TimelineLayout = class {
  /**
   * コンストラクタ
   * @param root
   */
  constructor(root) {
    /**
     * ルート要素
     * @type {HTMLElement}
     */
    __publicField(this, "_root");
    /**
     * 日時間隔の幅のピクセル値
     */
    __publicField(this, "_timeSlotWidth", null);
    /**
     * 各予定の高さのピクセル値
     */
    __publicField(this, "_eventHeight", null);
    /**
     * 開始期間（日付）
     */
    __publicField(this, "_startDate", null);
    /**
     * 終了期間（日付）
     */
    __publicField(this, "_endDate", null);
    /**
     * 1日の開始時間（１日からの秒数）
     */
    __publicField(this, "_startTime", null);
    /**
     * 1日の終了時間（１日からの秒数）
     */
    __publicField(this, "_endTime", null);
    /**
     * 時間間隔（秒）
     */
    __publicField(this, "_interval", null);
    /**
     * 1日辺りの時間間隔の数
     */
    __publicField(this, "_perDay", null);
    /**
     * 時間間隔の数
     */
    __publicField(this, "_timeSlotTotal", null);
    this._root = root;
    this.init();
  }
  /**
   * 初期化
   */
  init() {
    this._startDate = this._root.dataset.startDate;
    this._endDate = this._root.dataset.endDate;
    this._startTime = DateUtils.toSeconds(this._root.dataset.startTime);
    this._endTime = DateUtils.toSeconds(this._root.dataset.endTime);
    this._interval = parseInt(this._root.dataset.interval);
    this._perDay = Math.ceil((this._endTime - this._startTime) / this._interval);
    this._timeSlotTotal = this._perDay * (DateUtils.diffDays(this._startDate, this._endDate) + 1);
  }
  /**
   * コールバックを登録する
   */
  registerCallbacks() {
    window.addEventListener("resize", this._onResize.bind(this));
  }
  /**
   * リサイズ時の処理
   */
  _onResize() {
    this.updateLayout();
  }
  /**
   * レイアウト処理
   */
  updateLayout() {
    this._root.querySelectorAll(".gc-events .gc-resource").forEach((el) => {
      this.getResourceHeadingElement(el.dataset.resourceId).style.height = el.offsetHeight + "px";
    });
    this._root.querySelectorAll(".gc-events .gc-all-day-events .gc-all-day-event-container, .gc-events .gc-timed-events .gc-timed-event-container").forEach((el) => {
      this.updateEventLayout(el);
    });
    this._root.querySelectorAll(".gc-all-day-event-position.invisible, .gc-timed-event-position.invisible").forEach((el) => {
      el.classList.remove("invisible");
    });
  }
  /**
   * リソースの見出しのDOM要素を取得する
   * @param resourceId
   * @returns {HTMLElement}
   */
  getResourceHeadingElement(resourceId) {
    return this._root.querySelector('.gc-resources .gc-resource[data-resource-id="' + resourceId + '"]');
  }
  /**
   * 各時間間隔の幅をピクセルで取得する
   * @returns {number}
   */
  getTimeSlotWidth() {
    if (this._timeSlotWidth === null) {
      this._timeSlotWidth = this._root.querySelector(".gc-time-slot").offsetWidth + 1;
    }
    return this._timeSlotWidth;
  }
  /**
   * 指定位置の時間間隔のDOM要素を取得する
   * @returns {number}
   */
  getTimeSlot(index) {
    return this._root.querySelector('.gc-time-slot-lines .gc-time-slot[data-index="' + index + '"]');
  }
  /**
   * 終日イベント、一つ毎の幅をピクセルで取得する
   * @returns {number}
   */
  getEventHeight() {
    if (this._eventHeight === null) {
      this._eventHeight = this._root.querySelector(".gc-events .gc-all-day-events .gc-spacer").offsetHeight;
    }
    return this._eventHeight;
  }
  /**
   * 位置から日時を取得する
   *
   * @returns {number} 位置
   * @param index
   * @param isEnd
   */
  getDateTimeByIndex(index, isEnd = false) {
    const d = DateUtils.addDays(this._startDate, Math.floor(index / this._perDay));
    let t = this._startTime + index % this._perDay * this._interval;
    if (this._interval === 3600) {
      if (t != this._startTime) {
        t = Math.floor(t / 3600) * 3600;
      }
    }
    if (isEnd) {
      t += this._interval;
    }
    if (t >= this._endTime) {
      t = this._endTime;
    }
    return DateUtils.toDateTimeString(d + t * 1e3);
  }
  /**
   * 日時から位置を取得する
   *
   * @param dateTime {string} 日時
   * @returns {number} 位置
   */
  getIndexByDateTime(dateTime, isEnd) {
    const m = DateUtils.toMinutes(dateTime.substring(11, 16)) - (isEnd ? 1 : 0);
    const d = DateUtils.diffDays(this._startDate, dateTime.substring(0, 10));
    const t = Math.floor((Math.min(m, this._endTime) - this._startTime) / this._interval);
    return this._perDay * d + Math.max(0, t);
  }
  /**
   * １日の時間間隔の数を取得する
   * @returns {number}
   */
  getTimeSlotsPerDay() {
    return this._perDay;
  }
  /**
   * 予定のレイアウトをピクセルで設定する
   * @returns {number}
   * @param el
   */
  updateEventLayout(el) {
    el.classList.remove("gc-start", "gc-end");
    let startIndex = parseInt(el.dataset.start);
    if (startIndex < 0) {
      startIndex = 0;
    } else {
      el.classList.add("gc-start");
    }
    let endIndex = parseInt(el.dataset.end);
    if (endIndex > this._timeSlotTotal) {
      endIndex = this._timeSlotTotal;
    } else {
      el.classList.add("gc-end");
    }
    const elPos = el.parentNode;
    elPos.style.left = startIndex * this.getTimeSlotWidth() + "px";
    elPos.style.width = (endIndex - startIndex) * this.getTimeSlotWidth() + "px";
    elPos.style.top = parseInt(el.dataset.position) * this.getEventHeight() + "px";
  }
};

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

// resources/js/modules/TimelineSelection.ts
var TimelineSelection = class {
  /**
   * コンストラクタ
   * @param root
   */
  constructor(root) {
    /**
     * ルート要素
     * @type {HTMLElement}
     */
    __publicField(this, "_root");
    /**
     * 日時間隔の幅のピクセル値
     */
    __publicField(this, "_timeSlotWidth", null);
    this._root = root;
  }
  /**
   * 各時間間隔の幅をピクセルで取得する
   * @returns {number}
   */
  getTimeSlotWidth() {
    if (this._timeSlotWidth === null) {
      this._timeSlotWidth = this._root.querySelector(".gc-time-slot").offsetWidth + 1;
    }
    return this._timeSlotWidth;
  }
  /**
   * 選択範囲を描画する
   */
  draw(start, end, resourceId) {
    this.removeSelection();
    if (start !== null && end !== null) {
      let [startInt, endInt] = [parseInt(start), parseInt(end)];
      if (startInt > endInt) {
        [startInt, endInt] = [endInt, startInt];
      }
      this.createSelectionElement(startInt, endInt, resourceId);
    }
  }
  /**
   * 選択範囲を削除する
   */
  removeSelection() {
    const el = this._root.querySelector(".gc-selection");
    if (el) {
      el.parentNode.removeChild(el);
    }
  }
  /**
   * 選択肢を作成する
   */
  createSelectionElement(start, end, resourceId) {
    const containerEl = this._root.querySelector(".gc-selection-container");
    const resourceEl = this._root.querySelector('.gc-events .gc-resource[data-resource-id="' + resourceId + '"]');
    const el = document.createElement("div");
    el.className = "gc-selection";
    el.style.left = start * this.getTimeSlotWidth() + "px";
    el.style.top = resourceEl.offsetTop + "px";
    el.style.width = (end - start + 1) * this.getTimeSlotWidth() + "px";
    el.style.height = resourceEl.offsetHeight + "px";
    containerEl.prepend(el);
  }
};

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

// resources/js/timeline.js
function timeline(componentParameters) {
  return {
    /**
     * レイアウト
     */
    timelineLayout: null,
    /**
     * セレクター
     */
    selector: null,
    /**
     * 選択範囲の描画
     */
    timelineSelection: null,
    /**
     * タイムラインのリサイザーの処理
     */
    timelineResizer: null,
    /**
     * 初期化する
     */
    init() {
      this.timelineLayout = new TimelineLayout(this.$el);
      this.timelineLayout.registerCallbacks();
      this.$nextTick(() => {
        this.timelineLayout.updateLayout();
      });
      this.timelineSelection = new TimelineSelection(this.$el);
      this.selector = new Selector(this.$el).setContainerSelector(".gc-main").setElementSelector(".gc-time-slot").setPropertyName("index").setEnabled(componentParameters.canSelectDates).setMultiple(componentParameters.canSelectMultipleDates).onDraw((start, end, resourceId) => {
        this.timelineSelection.draw(
          this.selector.getElementByValue(start)?.dataset.index ?? null,
          this.selector.getElementByValue(end)?.dataset.index ?? null,
          resourceId
        );
      }).onSelect((start, end, resourceId) => {
        this.$wire.onDate(
          this.timelineLayout.getDateTimeByIndex(start),
          this.timelineLayout.getDateTimeByIndex(end, true),
          resourceId
        );
      });
      this.resizer = new Resizer(this.$el, this.selector).setContainerSelector(".gc-main").setEventSelector(".gc-all-day-event-container,.gc-timed-event-container").setHeadCursor("gc-cursor-w-resize").setTailCursor("gc-cursor-e-resize").setUnit(this.timelineLayout.getTimeSlotsPerDay()).onMove((key, start, end) => {
        if (this.resizer.isAllDayDragging()) {
          this.$wire.onMove(
            key,
            DateUtils.setTimeOfDateTime(this.timelineLayout.getDateTimeByIndex(parseInt(start), false), "00:00:00"),
            DateUtils.setTimeOfDateTime(this.timelineLayout.getDateTimeByIndex(parseInt(end) - 1, false), "23:59:59")
          );
        } else {
          this.$wire.onMove(
            key,
            this.timelineLayout.getDateTimeByIndex(parseInt(start), false),
            this.timelineLayout.getDateTimeByIndex(parseInt(end) - 1, true)
          );
        }
      }).onEvent((key) => {
        this.$wire.onEvent(key);
      }).onPreview((el, start, end) => {
        if (start !== null && end !== null) {
          el.dataset.start = start;
          el.dataset.end = end;
          this.timelineLayout.updateEventLayout(el);
        }
      });
      this.resizer.registerCallbacks();
      this.selector.registerCallbacks();
      Livewire.hook("request", ({ uri, options, payload, respond, succeed, fail }) => {
        succeed(({ status, json }) => {
          this.$nextTick(() => this.timelineLayout.updateLayout());
        });
      });
    }
  };
}
export {
  timeline as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF0ZVV0aWxzLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1RpbWVsaW5lTGF5b3V0LnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1NlbGVjdG9yLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1RpbWVsaW5lU2VsZWN0aW9uLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1Jlc2l6ZXIudHMiLCAiLi4vcmVzb3VyY2VzL2pzL3RpbWVsaW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRlVXRpbHMge1xuICAgIC8qKlxuICAgICAqIDFcdTY1RTVcdTMwNkVcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKi9cbiAgICBzdGF0aWMgcmVhZG9ubHkgTUlMTElTRUNPTkRTX1BFUl9EQVkgPSAyNCAqIDYwICogNjAgKiAxMDAwXG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVN0cmluZyhkOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gKG5ldyBEYXRlKGQpKS50b0xvY2FsZURhdGVTdHJpbmcoJ3N2LVNFJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREZcdTMwRUFcdTc5RDJcdTMwOTJcdTY1RTVcdTY2NDJcdTY1ODdcdTVCNTdcdTUyMTdcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZCB7bnVtYmVyfSBcdTMwREZcdTMwRUFcdTc5RDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTY1ODdcdTVCNTdcdTUyMTdcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvRGF0ZVRpbWVTdHJpbmcoZCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBEYXRlVXRpbHMudG9EYXRlU3RyaW5nKGQpICsgJyAnICsgKG5ldyBEYXRlKGQpKS50b0xvY2FsZVRpbWVTdHJpbmcoXCJlbi1HQlwiKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2Qlx1NjVFNVx1NjU3MFx1MzA5Mlx1NTJBMFx1N0I5N1xuICAgICAqIEBwYXJhbSBkYXRlIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFxuICAgICAqIEBwYXJhbSBkYXlzIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NTJBMFx1N0I5N1x1NUY4Q1x1MzA2RVx1NjVFNVx1NEVEOChcdTMwREZcdTMwRUFcdTc5RDIpXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBhZGREYXlzKGRhdGU6IHN0cmluZywgZGF5czogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZS5zdWJzdHJpbmcoMCwgMTApICsgJyAwMDowMDowMCcpICsgZGF5cyAqIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA2RVx1NjVFNVx1NjU3MFx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZEYXlzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZDEgPSBuZXcgRGF0ZShkYXRlMSlcbiAgICAgICAgbGV0IGQyID0gbmV3IERhdGUoZGF0ZTIpXG4gICAgICAgIGQxLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIGQyLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChkMi5nZXRUaW1lKCkgLSBkMS5nZXRUaW1lKCkpIC8gRGF0ZVV0aWxzLk1JTExJU0VDT05EU19QRVJfREFZKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA5Mm1zXHUzMDY3XHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICogQHBhcmFtIGRhdGUxIHtzdHJpbmd9IFx1NjVFNVx1NEVEODFcbiAgICAgKiBAcGFyYW0gZGF0ZTIge3N0cmluZ30gXHU2NUU1XHU0RUQ4MlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGlmZkluTWlsbGlzZWNvbmRzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gRGF0ZS5wYXJzZShkYXRlMikgLSBEYXRlLnBhcnNlKGRhdGUxKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcxRlx1OTU5M1x1MzA2RVx1OTFDRFx1MzA2QVx1MzA4QVx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBzdGFydDEge3N0cmluZ30gXHU2NzFGXHU5NTkzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKiBAcGFyYW0gc3RhcnQyIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzJcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpOiBBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBzdGFydDEgPD0gc3RhcnQyID8gc3RhcnQyIDogc3RhcnQxXG4gICAgICAgIGNvbnN0IGVuZCA9IGVuZDEgPD0gZW5kMiA/IGVuZDEgOiBlbmQyXG4gICAgICAgIHJldHVybiBzdGFydCA8PSBlbmQgPyBbc3RhcnQsIGVuZF0gOiBbbnVsbCwgbnVsbF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTMwMDFcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwOTJcdTZFMjFcdTMwNTdcdTMwMDFcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdThGRDRcdTMwNTlcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdGFydCB7c3RyaW5nfSBcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcbiAgICAgKiBAcGFyYW0gZW5kIHtzdHJpbmd9IFx1N0Q0Mlx1NEU4Nlx1NjY0Mlx1OTU5M1xuICAgICAqIEBwYXJhbSBpbnRlcnZhbCB7c3RyaW5nfSBcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTQoXHU3OUQyXHU2NTcwKVxuICAgICAqIEBwYXJhbSB0aW1lIHtzdHJpbmd9IFx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEY1NVx1NzU2QVx1NzZFRVx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdGltZVNsb3Qoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIGludGVydmFsOiBzdHJpbmcsIHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChEYXRlLnBhcnNlKHRpbWUgPiBlbmQgPyBlbmQgOiB0aW1lKSAtIERhdGUucGFyc2Uoc3RhcnQpKSAvIHBhcnNlSW50KGludGVydmFsKSAvIDEwMDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1MzA2RVx1NjY0Mlx1OTU5M1x1MzA5Mlx1NTkwOVx1NjZGNFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqXG4gICAgICogQHBhcmFtIGRhdGVUaW1lIHtzdHJpbmd9IFx1NjVFNVx1NjY0MlxuICAgICAqIEBwYXJhbSB0aW1lIHtzdHJpbmd9IFx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NjY0MlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgc2V0VGltZU9mRGF0ZVRpbWUoZGF0ZVRpbWU6IHN0cmluZywgdGltZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGRhdGVUaW1lLnN1YnN0cmluZygwLCAxMCkgKyAnICcgKyB0aW1lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA5Mlx1NTIwNlx1NjU3MFx1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9NaW51dGVzKHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IFtob3VyLCBtaW51dGVdID0gdGltZS5zcGxpdCgnOicpXG4gICAgICAgIHJldHVybiBwYXJzZUludChob3VyKSAqIDYwICsgcGFyc2VJbnQobWludXRlKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA5Mlx1NzlEMlx1NjU3MFx1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9TZWNvbmRzKHRpbWU6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IFtoLCBpLCBzXSA9IHRpbWUuc3BsaXQoJzonKTtcbiAgICAgICAgcmV0dXJuIChwYXJzZUludChoKSAqIDYwICsgcGFyc2VJbnQoaSkpICogNjAgKyBwYXJzZUludChzKTtcbiAgICB9XG59IiwgImltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVsaW5lTGF5b3V0IHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU2NjQyXHU5NTkzXHU5Njk0XHUzMDZFXHU1RTQ1XHUzMDZFXHUzMEQ0XHUzMEFGXHUzMEJCXHUzMEVCXHU1MDI0XG4gICAgICovXG4gICAgX3RpbWVTbG90V2lkdGg6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTU0MDRcdTRFODhcdTVCOUFcdTMwNkVcdTlBRDhcdTMwNTVcdTMwNkVcdTMwRDRcdTMwQUZcdTMwQkJcdTMwRUJcdTUwMjRcbiAgICAgKi9cbiAgICBfZXZlbnRIZWlnaHQ6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTk1OEJcdTU5Q0JcdTY3MUZcdTk1OTNcdUZGMDhcdTY1RTVcdTRFRDhcdUZGMDlcbiAgICAgKi9cbiAgICBfc3RhcnREYXRlOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU0RTg2XHU2NzFGXHU5NTkzXHVGRjA4XHU2NUU1XHU0RUQ4XHVGRjA5XG4gICAgICovXG4gICAgX2VuZERhdGU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiAxXHU2NUU1XHUzMDZFXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXHVGRjA4XHVGRjExXHU2NUU1XHUzMDRCXHUzMDg5XHUzMDZFXHU3OUQyXHU2NTcwXHVGRjA5XG4gICAgICovXG4gICAgX3N0YXJ0VGltZTogbnVtYmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIDFcdTY1RTVcdTMwNkVcdTdENDJcdTRFODZcdTY2NDJcdTk1OTNcdUZGMDhcdUZGMTFcdTY1RTVcdTMwNEJcdTMwODlcdTMwNkVcdTc5RDJcdTY1NzBcdUZGMDlcbiAgICAgKi9cbiAgICBfZW5kVGltZTogbnVtYmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1OTU5M1x1OTY5NFx1RkYwOFx1NzlEMlx1RkYwOVxuICAgICAqL1xuICAgIF9pbnRlcnZhbDogbnVtYmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIDFcdTY1RTVcdThGQkFcdTMwOEFcdTMwNkVcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwNkVcdTY1NzBcbiAgICAgKi9cbiAgICBfcGVyRGF5OiBudW1iZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDZFXHU2NTcwXG4gICAgICovXG4gICAgX3RpbWVTbG90VG90YWw6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX3N0YXJ0RGF0ZSA9IHRoaXMuX3Jvb3QuZGF0YXNldC5zdGFydERhdGU7XG4gICAgICAgIHRoaXMuX2VuZERhdGUgPSB0aGlzLl9yb290LmRhdGFzZXQuZW5kRGF0ZTtcbiAgICAgICAgdGhpcy5fc3RhcnRUaW1lID0gRGF0ZVV0aWxzLnRvU2Vjb25kcyh0aGlzLl9yb290LmRhdGFzZXQuc3RhcnRUaW1lKTtcbiAgICAgICAgdGhpcy5fZW5kVGltZSA9IERhdGVVdGlscy50b1NlY29uZHModGhpcy5fcm9vdC5kYXRhc2V0LmVuZFRpbWUpO1xuICAgICAgICB0aGlzLl9pbnRlcnZhbCA9IHBhcnNlSW50KHRoaXMuX3Jvb3QuZGF0YXNldC5pbnRlcnZhbCk7XG4gICAgICAgIHRoaXMuX3BlckRheSA9IE1hdGguY2VpbCgodGhpcy5fZW5kVGltZSAtIHRoaXMuX3N0YXJ0VGltZSkgLyB0aGlzLl9pbnRlcnZhbCk7XG4gICAgICAgIHRoaXMuX3RpbWVTbG90VG90YWwgPSB0aGlzLl9wZXJEYXkgKiAoRGF0ZVV0aWxzLmRpZmZEYXlzKHRoaXMuX3N0YXJ0RGF0ZSwgdGhpcy5fZW5kRGF0ZSkgKyAxKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vblJlc2l6ZSgpIHtcbiAgICAgICAgdGhpcy51cGRhdGVMYXlvdXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwdWJsaWMgdXBkYXRlTGF5b3V0KCkge1xuICAgICAgICAvLyBcdTU0MDRcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlcdTMwNkVcdTg5OEJcdTUxRkFcdTMwNTdcdTMwNkVcdTlBRDhcdTMwNTVcdTMwOTJcdTMwMDFcdTRFODhcdTVCOUFcdTZCMDRcdTMwNkVcdTlBRDhcdTMwNTVcdTMwNkJcdTU0MDhcdTMwOEZcdTMwNUJcdTMwOEJcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZXZlbnRzIC5nYy1yZXNvdXJjZScpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSZXNvdXJjZUhlYWRpbmdFbGVtZW50KGVsLmRhdGFzZXQucmVzb3VyY2VJZCkuc3R5bGUuaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgLy8gXHU0RTg4XHU1QjlBXHUzMDZFXHUzMEVDXHUzMEE0XHUzMEEyXHUzMEE2XHUzMEM4XHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudHMgLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyLCAuZ2MtZXZlbnRzIC5nYy10aW1lZC1ldmVudHMgLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVFdmVudExheW91dChlbCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAvLyBcdTRFODhcdTVCOUFcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwNENcdTdENDJcdTMwOEZcdTMwNjNcdTMwNUZcdTMwODlcdTMwMDFpbnZpc2libGVcdTMwOTJcdTUyNEFcdTk2NjRcdTMwNTlcdTMwOEJcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1wb3NpdGlvbi5pbnZpc2libGUsIC5nYy10aW1lZC1ldmVudC1wb3NpdGlvbi5pbnZpc2libGUnKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2ludmlzaWJsZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEJEXHUzMEZDXHUzMEI5XHUzMDZFXHU4OThCXHU1MUZBXHUzMDU3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHJlc291cmNlSWRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRSZXNvdXJjZUhlYWRpbmdFbGVtZW50KHJlc291cmNlSWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3RcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCcuZ2MtcmVzb3VyY2VzIC5nYy1yZXNvdXJjZVtkYXRhLXJlc291cmNlLWlkPVwiJyArIHJlc291cmNlSWQgKyAnXCJdJykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1NDA0XHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDZFXHU1RTQ1XHUzMDkyXHUzMEQ0XHUzMEFGXHUzMEJCXHUzMEVCXHUzMDY3XHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFRpbWVTbG90V2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVTbG90V2lkdGggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVTbG90V2lkdGggPSAodGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZS1zbG90JykgYXMgSFRNTEVsZW1lbnQpLm9mZnNldFdpZHRoICsgMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fdGltZVNsb3RXaWR0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTRGNERcdTdGNkVcdTMwNkVcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0VGltZVNsb3QoaW5kZXg6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvcignLmdjLXRpbWUtc2xvdC1saW5lcyAuZ2MtdGltZS1zbG90WycgKyAnZGF0YS1pbmRleD1cIicgKyBpbmRleCArICdcIl0nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwMDFcdTRFMDBcdTMwNjRcdTZCQ0VcdTMwNkVcdTVFNDVcdTMwOTJcdTMwRDRcdTMwQUZcdTMwQkJcdTMwRUJcdTMwNjdcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RXZlbnRIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50SGVpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudEhlaWdodCA9ICh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1ldmVudHMgLmdjLWFsbC1kYXktZXZlbnRzIC5nYy1zcGFjZXInKSBhcyBIVE1MRWxlbWVudCkub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEhlaWdodDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRGNERcdTdGNkVcdTMwNEJcdTMwODlcdTY1RTVcdTY2NDJcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NEY0RFx1N0Y2RVxuICAgICAqIEBwYXJhbSBpbmRleFxuICAgICAqIEBwYXJhbSBpc0VuZFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXREYXRlVGltZUJ5SW5kZXgoaW5kZXg6IG51bWJlciwgaXNFbmQ6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGQgPSBEYXRlVXRpbHMuYWRkRGF5cyh0aGlzLl9zdGFydERhdGUsIE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9wZXJEYXkpKTtcbiAgICAgICAgbGV0IHQgPSB0aGlzLl9zdGFydFRpbWUgKyAoaW5kZXggJSB0aGlzLl9wZXJEYXkpICogdGhpcy5faW50ZXJ2YWw7XG4gICAgICAgIGlmICh0aGlzLl9pbnRlcnZhbCA9PT0gMzYwMCkgeyAvLyAxXHU2NjQyXHU5NTkzXHU1MzU4XHU0RjREXHUzMDZFXHU1ODM0XHU1NDA4XHUzMDAxXHU5NThCXHU1OUNCXHU0RUU1XHU1OTE2XHUzMDZGMVx1NjY0Mlx1OTU5M1x1NTM1OFx1NEY0RFx1MzA2Qlx1ODhEQ1x1NkI2M1x1MzA1OVx1MzA4QlxuICAgICAgICAgICAgaWYgKHQgIT0gdGhpcy5fc3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgdCA9IE1hdGguZmxvb3IodCAvIDM2MDApICogMzYwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgIHQgKz0gdGhpcy5faW50ZXJ2YWw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgPj0gdGhpcy5fZW5kVGltZSkge1xuICAgICAgICAgICAgdCA9IHRoaXMuX2VuZFRpbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKGQgKyB0ICogMTAwMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU2NjQyXHUzMDRCXHUzMDg5XHU0RjREXHU3RjZFXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZGF0ZVRpbWUge3N0cmluZ30gXHU2NUU1XHU2NjQyXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU0RjREXHU3RjZFXG4gICAgICovXG4gICAgcHVibGljIGdldEluZGV4QnlEYXRlVGltZShkYXRlVGltZTogc3RyaW5nLCBpc0VuZDogYm9vbGVhbik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IG0gPSBEYXRlVXRpbHMudG9NaW51dGVzKGRhdGVUaW1lLnN1YnN0cmluZygxMSwgMTYpKSAtIChpc0VuZCA/IDEgOiAwKTtcbiAgICAgICAgY29uc3QgZCA9IERhdGVVdGlscy5kaWZmRGF5cyh0aGlzLl9zdGFydERhdGUsIGRhdGVUaW1lLnN1YnN0cmluZygwLCAxMCkpO1xuICAgICAgICBjb25zdCB0ID0gTWF0aC5mbG9vcigoTWF0aC5taW4obSwgdGhpcy5fZW5kVGltZSkgLSB0aGlzLl9zdGFydFRpbWUpIC8gdGhpcy5faW50ZXJ2YWwpO1xuICAgICAgICByZXR1cm4gdGhpcy5fcGVyRGF5ICogZCArIE1hdGgubWF4KDAsIHQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1RkYxMVx1NjVFNVx1MzA2RVx1NjY0Mlx1OTU5M1x1OTU5M1x1OTY5NFx1MzA2RVx1NjU3MFx1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgcHVibGljIGdldFRpbWVTbG90c1BlckRheSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGVyRGF5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA2RVx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFx1MzA5Mlx1MzBENFx1MzBBRlx1MzBCQlx1MzBFQlx1MzA2N1x1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQHBhcmFtIGVsXG4gICAgICovXG4gICAgcHVibGljIHVwZGF0ZUV2ZW50TGF5b3V0KGVsOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgICAgICAvLyBcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTMwRkJcdTdENDJcdTRFODZcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdTUyNEFcdTk2NjRcdTMwNTlcdTMwOEJcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc3RhcnQnLCAnZ2MtZW5kJyk7XG5cbiAgICAgICAgLy8gXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICAgIGxldCBzdGFydEluZGV4ID0gcGFyc2VJbnQoZWwuZGF0YXNldC5zdGFydCk7XG4gICAgICAgIGlmIChzdGFydEluZGV4IDwgMCkge1xuICAgICAgICAgICAgc3RhcnRJbmRleCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcpOyAvLyBcdTk1OEJcdTU5Q0JcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThGRkRcdTUyQTBcdTMwNTlcdTMwOEJcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAgICBsZXQgZW5kSW5kZXggPSBwYXJzZUludChlbC5kYXRhc2V0LmVuZCk7XG4gICAgICAgIGlmIChlbmRJbmRleCA+IHRoaXMuX3RpbWVTbG90VG90YWwpIHtcbiAgICAgICAgICAgIGVuZEluZGV4ID0gdGhpcy5fdGltZVNsb3RUb3RhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWVuZCcpOyAvLyBcdTdENDJcdTRFODZcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThGRkRcdTUyQTBcdTMwNTlcdTMwOEJcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFx1OTE0RFx1N0Y2RVx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAgICBjb25zdCBlbFBvczogSFRNTEVsZW1lbnQgPSBlbC5wYXJlbnROb2RlIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBlbFBvcy5zdHlsZS5sZWZ0ID0gKHN0YXJ0SW5kZXggKiB0aGlzLmdldFRpbWVTbG90V2lkdGgoKSkgKyAncHgnO1xuICAgICAgICBlbFBvcy5zdHlsZS53aWR0aCA9ICgoZW5kSW5kZXggLSBzdGFydEluZGV4KSAqIHRoaXMuZ2V0VGltZVNsb3RXaWR0aCgpKSArICdweCc7XG4gICAgICAgIGVsUG9zLnN0eWxlLnRvcCA9IChwYXJzZUludChlbC5kYXRhc2V0LnBvc2l0aW9uKSAqIHRoaXMuZ2V0RXZlbnRIZWlnaHQoKSkgKyAncHgnO1xuICAgIH1cbn0iLCAiLyoqXG4gKiBEYXRlVGltZVNlbGVjdG9yXG4gKlxuICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU5MDc4XHU2MjlFXHU2QTVGXHU4MEZEXHUzMDkyXHU2M0QwXHU0RjlCXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZCXHUzMDAxXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU2NENEXHU0RjVDXHUzMDZCXHUzMDg4XHUzMDhCXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU2MzA3XHU1QjlBXHUzMDkyXHU4ODRDXHUzMDQ2XHUzMDAyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdG9yIHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wcm9wZXJ0eU5hbWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NlbGVjdGlvblN0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3Rpb25FbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVzb3VyY2VJZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG5cbiAgICAvKipcbiAgICAgKiBcdTg5MDdcdTY1NzBcdTkwNzhcdTYyOUVcdTMwNENcdTY3MDlcdTUyQjlcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX211bHRpcGxlOiBib29sZWFuID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTYzQ0ZcdTc1M0JcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYXc6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA0Q1x1NTkwOVx1NjZGNFx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2NsaWNrLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbGVtZW50U2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RWxlbWVudFNlbGVjdG9yKGVsZW1lbnRTZWxlY3Rvcjogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3IgPSBlbGVtZW50U2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA5Mlx1NjMwMVx1MzA2NFx1MzBEN1x1MzBFRFx1MzBEMVx1MzBDNlx1MzBBM1x1NTQwRFx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMihkYXRhLWRhdGVcdTMwNkFcdTMwODlcdTMwMDFkYXRlKVxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eU5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0UHJvcGVydHlOYW1lKHByb3BlcnR5TmFtZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0Qlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBlbmFibGVkXG4gICAgICovXG4gICAgcHVibGljIHNldEVuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fZW5hYmxlZCA9IGVuYWJsZWQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1ODkwN1x1NjU3MFx1OTA3OFx1NjI5RVx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0Qlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBtdWx0aXBsZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRNdWx0aXBsZShtdWx0aXBsZTogYm9vbGVhbik6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fbXVsdGlwbGUgPSBtdWx0aXBsZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU2M0NGXHU3NTNCXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIG9uRHJhd1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkRyYXcob25EcmF3OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25EcmF3ID0gb25EcmF3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNENcdTU5MDlcdTY2RjRcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gb25TZWxlY3RcbiAgICAgKi9cbiAgICBwdWJsaWMgb25TZWxlY3Qob25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25TZWxlY3QgPSBvblNlbGVjdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3QodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uU3RhcnQgPSB0aGlzLl9zZWxlY3Rpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3RFbmQodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uRW5kID0gdmFsdWU7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1ODlFM1x1OTY2NFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3QobnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2VsZWN0aW9uKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLl9zZWxlY3Rpb25TdGFydCwgdGhpcy5fc2VsZWN0aW9uRW5kXS5zb3J0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3M0ZFXHU1NzI4XHUzMDAxXHU5MDc4XHU2MjlFXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25TdGFydCAhPT0gbnVsbCAmJiB0aGlzLl9zZWxlY3Rpb25FbmQgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jbGljayhlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5fZW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvdXJjZUlkID0gdGhpcy5waWNrUmVzb3VyY2VJZChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblNlbGVjdCh2YWx1ZSwgdmFsdWUsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1NjJCQ1x1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbW91c2VEb3duKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVkIHx8ICF0aGlzLl9tdWx0aXBsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvdXJjZUlkID0gdGhpcy5waWNrUmVzb3VyY2VJZChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCh2YWx1ZSk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU1MkQ1XHUzMDRCXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RW5kKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU5NkUyXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25TZWxlY3Qoc3RhcnQsIGVuZCwgdGhpcy5fcmVzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gZWwgXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHBpY2tWYWx1ZShlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2VsZW1lbnRTZWxlY3RvciArICc6bm90KC5kaXNhYmxlZCknKSAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgPy5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSBlbCBcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTMwRUFcdTMwQkRcdTMwRkNcdTMwQjlJRFxuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrUmVzb3VyY2VJZChlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KCdbZGF0YS1yZXNvdXJjZS1pZF0nKT8uZGF0YXNldFsncmVzb3VyY2VJZCddID8/IG51bGxcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTVFQTdcdTZBMTlcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0geCBYXHU1RUE3XHU2QTE5XG4gICAgICogQHBhcmFtIHkgWVx1NUVBN1x1NkExOVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrVmFsdWVCeVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IpKVxuICAgICAgICAgICAgLmZpbHRlcigoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0LmxlZnQgPD0geCAmJiB4IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0geSAmJiB5IDw9IHJlY3QuYm90dG9tO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdCgwKT8uZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdID8/IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHVibGljIGdldEVsZW1lbnRCeVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IgK1xuICAgICAgICAgICAgJ1tkYXRhLScgKyB0aGlzLl9wcm9wZXJ0eU5hbWUgKyAnPVwiJyArIHZhbHVlICsgJ1wiXSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTY2NDJcdTMwNkVcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTg4NjhcdTc5M0FcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX29uRHJhdykgeyAvLyBcdTYzQ0ZcdTc1M0JcdTMwOTJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwNjdcdTg4NENcdTMwNDZcbiAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb25EcmF3KHN0YXJ0LCBlbmQsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciArXG4gICAgICAgICAgICAodGhpcy5fcmVzb3VyY2VJZCAhPT0gbnVsbCA/ICcgW2RhdGEtcmVzb3VyY2UtaWQ9XCInICsgdGhpcy5fcmVzb3VyY2VJZCArICdcIl0gJyA6ICcgJykgK1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFNlbGVjdG9yXG4gICAgICAgICkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsLmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgaWYgKHN0YXJ0IDw9IHZhbHVlICYmIHZhbHVlIDw9IGVuZCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59IiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVsaW5lU2VsZWN0aW9uIHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU2NjQyXHU5NTkzXHU5Njk0XHUzMDZFXHU1RTQ1XHUzMDZFXHUzMEQ0XHUzMEFGXHUzMEJCXHUzMEVCXHU1MDI0XG4gICAgICovXG4gICAgX3RpbWVTbG90V2lkdGg6IG51bWJlciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTQwNFx1NjY0Mlx1OTU5M1x1OTU5M1x1OTY5NFx1MzA2RVx1NUU0NVx1MzA5Mlx1MzBENFx1MzBBRlx1MzBCQlx1MzBFQlx1MzA2N1x1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRUaW1lU2xvdFdpZHRoKCk6IG51bWJlciB7XG4gICAgICAgIGlmICh0aGlzLl90aW1lU2xvdFdpZHRoID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl90aW1lU2xvdFdpZHRoID0gKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvcignLmdjLXRpbWUtc2xvdCcpIGFzIEhUTUxFbGVtZW50KS5vZmZzZXRXaWR0aCArIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3RpbWVTbG90V2lkdGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU2M0NGXHU3NTNCXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIGRyYXcoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnJlbW92ZVNlbGVjdGlvbigpO1xuICAgICAgICBpZiAoc3RhcnQgIT09IG51bGwgJiYgZW5kICE9PSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgW3N0YXJ0SW50LCBlbmRJbnRdID0gW3BhcnNlSW50KHN0YXJ0KSwgcGFyc2VJbnQoZW5kKV07XG4gICAgICAgICAgICBpZiAoc3RhcnRJbnQgPiBlbmRJbnQpIHtcbiAgICAgICAgICAgICAgICBbc3RhcnRJbnQsIGVuZEludF0gPSBbZW5kSW50LCBzdGFydEludF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNlbGVjdGlvbkVsZW1lbnQoc3RhcnRJbnQsIGVuZEludCwgcmVzb3VyY2VJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTUyNEFcdTk2NjRcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlbW92ZVNlbGVjdGlvbigpIHtcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1zZWxlY3Rpb24nKTtcbiAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1ODBBMlx1MzA5Mlx1NEY1Q1x1NjIxMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlU2VsZWN0aW9uRWxlbWVudChzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlciwgcmVzb3VyY2VJZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lckVsID0gdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKCcuZ2Mtc2VsZWN0aW9uLWNvbnRhaW5lcicpO1xuICAgICAgICBjb25zdCByZXNvdXJjZUVsID0gdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKCcuZ2MtZXZlbnRzIC5nYy1yZXNvdXJjZVtkYXRhLXJlc291cmNlLWlkPVwiJyArIHJlc291cmNlSWQgKyAnXCJdJykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGVsLmNsYXNzTmFtZSA9ICdnYy1zZWxlY3Rpb24nO1xuICAgICAgICBlbC5zdHlsZS5sZWZ0ID0gKHN0YXJ0ICogdGhpcy5nZXRUaW1lU2xvdFdpZHRoKCkpICsgJ3B4JztcbiAgICAgICAgZWwuc3R5bGUudG9wID0gcmVzb3VyY2VFbC5vZmZzZXRUb3AgKyAncHgnO1xuICAgICAgICBlbC5zdHlsZS53aWR0aCA9ICgoZW5kIC0gc3RhcnQgKyAxKSAqIHRoaXMuZ2V0VGltZVNsb3RXaWR0aCgpKSArICdweCc7XG4gICAgICAgIGVsLnN0eWxlLmhlaWdodCA9IHJlc291cmNlRWwub2Zmc2V0SGVpZ2h0ICsgJ3B4JztcbiAgICAgICAgY29udGFpbmVyRWwucHJlcGVuZChlbCk7XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vU2VsZWN0b3JcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6ZXIge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2V2ZW50U2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwRkJcdTY2NDJcdTk1OTNcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NlbGVjdG9yOiBTZWxlY3RvciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDhcdTMwQzNcdTMwQzBcdTMwRkNcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYWRDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3Itdy1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM2XHUzMEZDXHUzMEVCXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF90YWlsQ3Vyc29yOiBzdHJpbmcgPSAnZ2MtY3Vyc29yLWUtcmVzaXplJztcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmc6IEhUTUxFbGVtZW50ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdTdGFydDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdFbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkJcdTMwMDFcdTUyNERcdTU2REVcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNUZcdTUwMjRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nVmFsdWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwMDJcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwNENcdTVDMTFcdTMwNkFcdTMwNDRcdTMwNjhcdTMwMDFcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNjhcdTUyMjRcdTY1QURcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTYzQjRcdTMwOTNcdTMwNjBcdTRGNERcdTdGNkVcdUZGMDhcdTY1RTVcdTRFRDhcdUZGMDlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dyYWJiZWQ6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ0hlYWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ1RhaWw6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1NEUwMFx1NjVFNVx1MzA2RVx1NjY0Mlx1OTU5M1x1OTU5M1x1OTY5NFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3VuaXQ6IG51bWJlciA9IDE7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTc1MUZcdTYyMTBcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uUHJldmlldzogKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIHNlbGVjdG9yOiBTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uQ2xpY2soZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0V2ZW50KGUudGFyZ2V0IGFzIEVsZW1lbnQpXG4gICAgICAgIGlmIChlbCAmJiBlbC5kYXRhc2V0LmNhbkNsaWNrID09PSAndHJ1ZScgJiYgZWwuZGF0YXNldC5jYW5Nb3ZlID09PSAnZmFsc2UnICYmIGVsLmRhdGFzZXQuY2FuTW92ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgaWYgKHRoaXMuX29uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGVsLmRhdGFzZXQua2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwQzBcdTMwQTZcdTMwRjNcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0V2ZW50KGUudGFyZ2V0IGFzIEVsZW1lbnQpXG4gICAgICAgIGlmIChlbCAmJiAoZWwuZGF0YXNldC5jYW5Nb3ZlID09PSAndHJ1ZScgfHwgZWwuZGF0YXNldC5jYW5SZXNpemUgPT09ICd0cnVlJykpIHtcbiAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTkwOVx1NUY2Mlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IHRydWVcbiAgICAgICAgICAgIGlmICh0aGlzLmhpdEhlYWQoZS50YXJnZXQgYXMgRWxlbWVudCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ1RhaWwgPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuaGl0VGFpbChlLnRhcmdldCBhcyBFbGVtZW50KSkgeyAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTU4MzRcdTU0MDhcdTMwMDFcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwNkZcdTU2RkFcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0dyYWJiaW5nSGVhZCA9IGZhbHNlXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFxuICAgICAgICAgICAgdGhpcy5fZ3JhYmJlZCA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBlbFxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdTdGFydCA9IHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuc3RhcnRcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nRW5kID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5lbmRcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFGXHUzMEU5XHUzMEI5XHUzMDkyXHU4QTJEXHU1QjlBXHVGRjA4XHU4ODY4XHU3OTNBXHUzMDkyXHU2RDg4XHUzMDU5XHVGRjA5XG4gICAgICAgICAgICB0aGlzLnNldERyYWdnaW5nQ2xhc3ModGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5rZXksIHRydWUpXG5cbiAgICAgICAgICAgIC8vIFx1NzNGRVx1NTcyOFx1MzA2RVx1NjVFNVx1NEVEOFx1MzA5Mlx1OEExOFx1OTMzMlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdWYWx1ZSA9IG51bGxcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcodGhpcy5fZ3JhYmJlZClcblxuICAgICAgICAgICAgLy8gXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUN1cnNvcigpXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NzlGQlx1NTJENVx1OTFDRlx1MzA5Mlx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdDb3VudCA9IDBcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwRTBcdTMwRkNcdTMwRDZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1ODg2OFx1NzkzQVxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9zZWxlY3Rvci5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KVxuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVQcmV2aWV3KHZhbHVlKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTMwREVcdTMwQTZcdTMwQjlcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwNUZcdTMwODFcdTMwNkJcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdThBMThcdTkzMzJcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nQ291bnQrK1xuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBBMlx1MzBDM1x1MzBEN1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlVXAoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQua2V5XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwgJiYgdGhpcy5fZ3JhYmJlZCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmRyYWcodmFsdWUpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uTW92ZSAmJiBzdGFydCAhPT0gbnVsbCAmJiBlbmQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2RyYWdnaW5nQ291bnQgPCAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuY2FuQ2xpY2sgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25QcmV2aWV3KHRoaXMuX2RyYWdnaW5nLCBudWxsLCBudWxsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNldERyYWdnaW5nQ2xhc3Moa2V5LCBmYWxzZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gbnVsbFxuICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IG51bGxcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ3Vyc29yKClcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RXZlbnRTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2V2ZW50U2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5ODJEXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHU2NjQyXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGN1cnNvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRIZWFkQ3Vyc29yKGN1cnNvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2hlYWRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1NjY0Mlx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjdXJzb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VGFpbEN1cnNvcihjdXJzb3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl90YWlsQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFMDBcdTY1RTVcdTMwNkVcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdW5pdCB7bnVtYmVyfSBcdTRFMDBcdTY1RTVcdTMwNkVcdTY2NDJcdTk1OTNcdTk1OTNcdTk2OTRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VW5pdCh1bml0OiBudW1iZXIpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fdW5pdCA9IHVuaXQ7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkV2ZW50KGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25FdmVudCA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Nb3ZlKGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uTW92ZSA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTc1MUZcdTYyMTBcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25QcmV2aWV3KGNhbGxiYWNrOiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vblByZXZpZXcgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0RyYWdnaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJhZ2dpbmcgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICovXG4gICAgcHVibGljIGdldEdyYWJiZWREYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ncmFiYmVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBpY2tFdmVudChlbDogRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2V2ZW50U2VsZWN0b3IpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MTQ4XHU5ODJEXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRIZWFkKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy1oZWFkJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTUyMjRcdTVCOUFcdTMwNTlcdTMwOEJcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGhpdFRhaWwoZWw6IEVsZW1lbnQpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhZWwuY2xvc2VzdCgnLmdjLXRhaWwnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXREcmFnZ2luZ0NsYXNzKGtleTogc3RyaW5nLCBkcmFnZ2luZzogYm9vbGVhbikge1xuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fZXZlbnRTZWxlY3RvciArICdbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3M0ZFXHU1NzI4XHUzMDAxXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZGXHUzMDAxXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHVibGljIGlzQWxsRGF5RHJhZ2dpbmcoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kcmFnZ2luZz8uZGF0YXNldC5hbGxEYXkgPT09ICd0cnVlJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTMwRDFcdTMwRTlcdTMwRTFcdTMwRkNcdTMwQkZcdTMwNENcdTY1NzRcdTY1NzBcdTUwMjRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNOdW1iZXIodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gL15cXGQrJC8udGVzdCh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWcodmFsdWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pc051bWJlcih2YWx1ZSlcbiAgICAgICAgICAgID8gdGhpcy5kcmFnTnVtYmVyKHZhbHVlKVxuICAgICAgICAgICAgOiB0aGlzLmRyYWdEYXRlVGltZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU2NjQyXHUzMDZFXHUzMEQxXHUzMEU5XHUzMEUxXHUzMEZDXHUzMEJGXHUzMDZCXHU1QkZFXHUzMDU3XHUzMDY2XHUzMDAxXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWdEYXRlVGltZSh2YWx1ZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBEYXRlVXRpbHMuZGlmZkluTWlsbGlzZWNvbmRzKHRoaXMuX2dyYWJiZWQsIHZhbHVlKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZS5wYXJzZSh0aGlzLl9kcmFnZ2luZ1N0YXJ0KSArICh0aGlzLl9pc0dyYWJiaW5nSGVhZCA/IGRpZmYgOiAwKSk7XG4gICAgICAgIGxldCBlbmQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nRW5kKSArICh0aGlzLl9pc0dyYWJiaW5nVGFpbCA/IGRpZmYgOiAwKSk7XG4gICAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWQubGVuZ3RoKTtcbiAgICAgICAgZW5kID0gZW5kLnN1YnN0cmluZygwLCB0aGlzLl9ncmFiYmVkLmxlbmd0aCk7XG4gICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjU3NFx1NjU3MFx1NTAyNFx1MzA2RVx1MzBEMVx1MzBFOVx1MzBFMVx1MzBGQ1x1MzBCRlx1MzA2Qlx1NUJGRVx1MzA1N1x1MzA2Nlx1MzAwMVx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBkcmFnTnVtYmVyKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgY29uc3QgZGlmZiA9IHBhcnNlSW50KHZhbHVlKSAtIHBhcnNlSW50KHRoaXMuX2dyYWJiZWQpO1xuICAgICAgICBsZXQgc3RhcnQgPSBwYXJzZUludCh0aGlzLl9kcmFnZ2luZ1N0YXJ0KSArICh0aGlzLl9pc0dyYWJiaW5nSGVhZCA/IGRpZmYgOiAwKTtcbiAgICAgICAgbGV0IGVuZCA9IHBhcnNlSW50KHRoaXMuX2RyYWdnaW5nRW5kKSArICh0aGlzLl9pc0dyYWJiaW5nVGFpbCA/IGRpZmYgOiAwKTtcbiAgICAgICAgaWYgKHRoaXMuaXNBbGxEYXlEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICBzdGFydCA9IE1hdGguZmxvb3Ioc3RhcnQgLyB0aGlzLl91bml0KSAqIHRoaXMuX3VuaXQ7XG4gICAgICAgICAgICBlbmQgPSBNYXRoLmZsb29yKGVuZCAvIHRoaXMuX3VuaXQpICogdGhpcy5fdW5pdDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgICAgICBlbmQgPSBzdGFydFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbc3RhcnQsIGVuZF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlQ3Vyc29yKCkge1xuICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5faGVhZEN1cnNvciwgdGhpcy5fdGFpbEN1cnNvcilcbiAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkICYmIHRoaXMuX2lzR3JhYmJpbmdUYWlsKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQoJ2djLWN1cnNvci1tb3ZlJylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKHRoaXMuX2hlYWRDdXJzb3IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCh0aGlzLl90YWlsQ3Vyc29yKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGVQcmV2aWV3KHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nVmFsdWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmRyYWcodmFsdWUpXG4gICAgICAgICAgICBpZiAodGhpcy5fb25QcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb25QcmV2aWV3KHRoaXMuX2RyYWdnaW5nLCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdWYWx1ZSA9IHZhbHVlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk4MkRcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzR3JhYmJpbmdIZWFkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNHcmFiYmluZ0hlYWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc0dyYWJiaW5nVGFpbCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzR3JhYmJpbmdUYWlsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2OFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNHcmFiYmluZ0JvZHkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0dyYWJiaW5nSGVhZCAmJiB0aGlzLl9pc0dyYWJiaW5nVGFpbDtcbiAgICB9XG59IiwgImltcG9ydCBUaW1lbGluZUxheW91dCBmcm9tIFwiLi9tb2R1bGVzL1RpbWVsaW5lTGF5b3V0LmpzXCI7XG5pbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vbW9kdWxlcy9TZWxlY3Rvci50c1wiO1xuaW1wb3J0IFRpbWVsaW5lU2VsZWN0aW9uIGZyb20gXCIuL21vZHVsZXMvVGltZWxpbmVTZWxlY3Rpb24uanNcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuL21vZHVsZXMvUmVzaXplci5qc1wiO1xuaW1wb3J0IERhdGVVdGlscyBmcm9tIFwiLi9tb2R1bGVzL0RhdGVVdGlscy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aW1lbGluZShjb21wb25lbnRQYXJhbWV0ZXJzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWxpbmVMYXlvdXQ6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAgICAgKi9cbiAgICAgICAgc2VsZWN0b3I6IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1NjNDRlx1NzUzQlxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWxpbmVTZWxlY3Rpb246IG51bGwsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1MzBCRlx1MzBBNFx1MzBFMFx1MzBFOVx1MzBBNFx1MzBGM1x1MzA2RVx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1x1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAgICAgKi9cbiAgICAgICAgdGltZWxpbmVSZXNpemVyOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTUyMURcdTY3MUZcdTUzMTZcdTMwNTlcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICAvLyBcdTMwQkZcdTMwQTRcdTMwRTBcdTMwRTlcdTMwQTRcdTMwRjNcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcbiAgICAgICAgICAgIHRoaXMudGltZWxpbmVMYXlvdXQgPSBuZXcgVGltZWxpbmVMYXlvdXQodGhpcy4kZWwpO1xuICAgICAgICAgICAgdGhpcy50aW1lbGluZUxheW91dC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZWxpbmVMYXlvdXQudXBkYXRlTGF5b3V0KCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU2M0NGXHU3NTNCXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lU2VsZWN0aW9uID0gbmV3IFRpbWVsaW5lU2VsZWN0aW9uKHRoaXMuJGVsKTtcblxuICAgICAgICAgICAgLy8gXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gbmV3IFNlbGVjdG9yKHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLW1haW4nKVxuICAgICAgICAgICAgICAgIC5zZXRFbGVtZW50U2VsZWN0b3IoJy5nYy10aW1lLXNsb3QnKVxuICAgICAgICAgICAgICAgIC5zZXRQcm9wZXJ0eU5hbWUoJ2luZGV4JylcbiAgICAgICAgICAgICAgICAuc2V0RW5hYmxlZChjb21wb25lbnRQYXJhbWV0ZXJzLmNhblNlbGVjdERhdGVzKVxuICAgICAgICAgICAgICAgIC5zZXRNdWx0aXBsZShjb21wb25lbnRQYXJhbWV0ZXJzLmNhblNlbGVjdE11bHRpcGxlRGF0ZXMpXG4gICAgICAgICAgICAgICAgLm9uRHJhdygoc3RhcnQsIGVuZCwgcmVzb3VyY2VJZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lU2VsZWN0aW9uLmRyYXcoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9yLmdldEVsZW1lbnRCeVZhbHVlKHN0YXJ0KT8uZGF0YXNldC5pbmRleCA/PyBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5nZXRFbGVtZW50QnlWYWx1ZShlbmQpPy5kYXRhc2V0LmluZGV4ID8/IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZUlkXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub25TZWxlY3QoKHN0YXJ0LCBlbmQsIHJlc291cmNlSWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkRhdGUoXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lTGF5b3V0LmdldERhdGVUaW1lQnlJbmRleChzdGFydCksXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lTGF5b3V0LmdldERhdGVUaW1lQnlJbmRleChlbmQsIHRydWUpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3VyY2VJZFxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1xuICAgICAgICAgICAgdGhpcy5yZXNpemVyID0gbmV3IFJlc2l6ZXIodGhpcy4kZWwsIHRoaXMuc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtbWFpbicpXG4gICAgICAgICAgICAgICAgLnNldEV2ZW50U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lciwuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgICAgICAuc2V0SGVhZEN1cnNvcignZ2MtY3Vyc29yLXctcmVzaXplJylcbiAgICAgICAgICAgICAgICAuc2V0VGFpbEN1cnNvcignZ2MtY3Vyc29yLWUtcmVzaXplJylcbiAgICAgICAgICAgICAgICAuc2V0VW5pdCh0aGlzLnRpbWVsaW5lTGF5b3V0LmdldFRpbWVTbG90c1BlckRheSgpKVxuICAgICAgICAgICAgICAgIC5vbk1vdmUoKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXNpemVyLmlzQWxsRGF5RHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIERhdGVVdGlscy5zZXRUaW1lT2ZEYXRlVGltZSh0aGlzLnRpbWVsaW5lTGF5b3V0LmdldERhdGVUaW1lQnlJbmRleChwYXJzZUludChzdGFydCksIGZhbHNlKSwgJzAwOjAwOjAwJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRGF0ZVV0aWxzLnNldFRpbWVPZkRhdGVUaW1lKHRoaXMudGltZWxpbmVMYXlvdXQuZ2V0RGF0ZVRpbWVCeUluZGV4KHBhcnNlSW50KGVuZCkgLSAxLCBmYWxzZSksICcyMzo1OTo1OScpLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25Nb3ZlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lTGF5b3V0LmdldERhdGVUaW1lQnlJbmRleChwYXJzZUludChzdGFydCksIGZhbHNlKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lTGF5b3V0LmdldERhdGVUaW1lQnlJbmRleChwYXJzZUludChlbmQpIC0gMSwgdHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub25FdmVudCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uUHJldmlldygoZWwsIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0ICE9PSBudWxsICYmIGVuZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuZGF0YXNldC5zdGFydCA9IHN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuZGF0YXNldC5lbmQgPSBlbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lTGF5b3V0LnVwZGF0ZUV2ZW50TGF5b3V0KGVsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcbiAgICAgICAgICAgIHRoaXMucmVzaXplci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3Rvci5yZWdpc3RlckNhbGxiYWNrcygpO1xuXG4gICAgICAgICAgICAvLyBMaXZld2lyZVx1MzA0Qlx1MzA4OVx1MzA2RVx1NUYzN1x1NTIzNlx1NjZGNFx1NjVCMFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAgICAgICAgTGl2ZXdpcmUuaG9vaygncmVxdWVzdCcsICh7dXJpLCBvcHRpb25zLCBwYXlsb2FkLCByZXNwb25kLCBzdWNjZWVkLCBmYWlsfSkgPT4ge1xuICAgICAgICAgICAgICAgIHN1Y2NlZWQoKHtzdGF0dXMsIGpzb259KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHRoaXMudGltZWxpbmVMYXlvdXQudXBkYXRlTGF5b3V0KCkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQUEsSUFBcUIsYUFBckIsTUFBcUIsV0FBVTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxF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
