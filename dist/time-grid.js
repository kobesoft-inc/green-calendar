var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
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

// resources/js/modules/TimedGridTimedEvent.ts
var TimedGridTimedEvent = class {
  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   * @param timeSelector
   */
  constructor(root, timeSelector) {
    /**
     * ルート要素
     * @private
     */
    __publicField(this, "_root");
    /**
     * 時間指定の予定を全て含むセレクタ
     */
    __publicField(this, "_containerSelector", null);
    /**
     * 時間のセレクター
     */
    __publicField(this, "_timeSelector", null);
    /**
     * 時間のリサイザー
     */
    __publicField(this, "_resizer", null);
    /**
     * ホバー中の予定の要素
     */
    __publicField(this, "_hover", null);
    /**
     * 予定をクリックした時の処理
     */
    __publicField(this, "_onEvent");
    /**
     * 予定を移動した時の処理
     */
    __publicField(this, "_onMove");
    this._root = root;
    this._timeSelector = timeSelector;
    this.init();
  }
  /**
   * 初期化
   */
  init() {
    this._resizer = new Resizer(this._root, this._timeSelector).setEventSelector(".gc-timed-event-container").setHeadCursor("gc-cursor-n-resize").setTailCursor("gc-cursor-s-resize").onEvent((key) => {
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
   * 時間指定の予定を移動した時の処理
   * @param callback
   */
  onEvent(callback) {
    this._onEvent = callback;
    return this;
  }
  /**
   * 時間指定の予定を移動した時の処理
   * @param callback
   */
  onMove(callback) {
    this._onMove = callback;
    return this;
  }
  /**
   * コールバックを登録する
   */
  registerCallbacks() {
    this._resizer.registerCallbacks();
    this._root.addEventListener("mouseover", this._onMouseOver.bind(this));
  }
  /**
   * 時間指定の予定を全て含むセレクタを設定する。
   * @param containerSelector
   */
  setContainerSelector(containerSelector) {
    this._resizer.setContainerSelector(containerSelector);
    this._containerSelector = containerSelector;
    return this;
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
    const el = this.pickEvent(e.target);
    const key = el ? el.dataset.key : null;
    if (key !== this._hover) {
      this.setHoverAllDayEvent(this._hover, false);
      this.setHoverAllDayEvent(this._hover = key, true);
    }
  }
  /**
   * 予定を取得
   * @param el {HTMLElement} DOM要素
   * @returns {null|HTMLElement} 予定のDOM要素またはnull
   */
  pickEvent(el) {
    return this._root.contains(el) && el.closest(this._containerSelector) ? el.closest(".gc-timed-event-container") : null;
  }
  /**
   * 指定された予定のホバーを設定する
   * @param key {string} 予定のキー
   * @param hover {boolean} ホバーするかどうか
   */
  setHoverAllDayEvent(key, hover) {
    if (key) {
      this._root.querySelectorAll('.gc-timed-event-container[data-key="' + key + '"]').forEach((el) => {
        if (hover) {
          el.classList.add("gc-hover");
        } else {
          el.classList.remove("gc-hover");
        }
      });
    }
  }
  /**
   * ドラッグ中の予定のプレビューを表示
   * @param elEvent {HTMLElement} 予定のDOM要素
   * @param eventStart {string} 予定の開始日
   * @param eventEnd {string} 予定の終了日
   */
  createPreview(elEvent, eventStart, eventEnd) {
    const resourceId = elEvent.dataset.resourceId;
    Array.from(this._root.querySelectorAll(this._containerSelector + ' .gc-day[data-resource-id="' + resourceId + '"]')).forEach((elDay) => {
      const [dayStart, dayEnd] = this.getPeriodOfDay(elDay);
      if (dayStart && dayEnd) {
        const [periodStart, periodEnd] = DateUtils.overlapPeriod(eventStart, eventEnd, dayStart, dayEnd);
        if (periodStart && periodEnd) {
          const [slot, span] = this.getSlotPosition(elDay, periodStart, periodEnd);
          const el = elEvent.cloneNode(true);
          this.adjustPreview(el, span);
          slot.querySelector(".gc-timed-event-preview").appendChild(el);
        }
      }
    });
  }
  /**
   * 開始スロットと高さを取得
   *
   * @param elDay {HTMLElement} 日付のDOM要素
   * @param eventStart {string} 開始時間
   * @param eventEnd {string} 終了時間
   * @returns {[HTMLElement, number]} 開始スロットと高さ
   */
  getSlotPosition(elDay, eventStart, eventEnd) {
    const [dayStart, dayEnd] = this.getPeriodOfDay(elDay);
    const start = DateUtils.timeSlot(dayStart, dayEnd, elDay.dataset.interval, eventStart);
    const end = DateUtils.timeSlot(dayStart, dayEnd, elDay.dataset.interval, eventEnd);
    const slots = elDay.querySelectorAll(".gc-slot");
    return [slots[start], end - start + 1];
  }
  /**
   * １日の開始日時と終了日時を取得
   * @param elDay {HTMLElement} 日付のDOM要素
   * @private
   */
  getPeriodOfDay(elDay) {
    return [elDay.dataset.start, elDay.dataset.end];
  }
  /**
   * ドラッグ中の予定をプレビューに合わせる
   * @param el {HTMLElement} 予定のDOM要素
   * @param timeSlotHeight {number} スロット数
   */
  adjustPreview(el, timeSlotHeight) {
    el.classList.remove("gc-dragging");
    el.style.setProperty("--gc-span", "calc(" + timeSlotHeight * 100 + "% + " + (timeSlotHeight - 1) + "px)");
    return el;
  }
  /**
   * 予定のプレビューを削除
   */
  removePreview() {
    Array.from(this._root.querySelectorAll(".gc-timed-event-preview")).forEach((el) => el.parentNode.replaceChild(el.cloneNode(false), el));
  }
};

// resources/js/time-grid.js
function TimeGrid(componentParameters) {
  return {
    /**
     * 日付のセレクター
     */
    dateSelector: Selector,
    //selector(this.$el, '.gc-time-grid', '.gc-day', 'date'),
    /**
     * 時間のセレクター
     */
    timeSelector: Selector,
    //selector(this.$el, '.gc-time-grid', '.gc-slot', 'time'),
    /**
     * 終日予定
     */
    allDayEvent: AllDayEvent,
    //allDayEvent(this.$el, '.gc-time-grid'),
    /**
     * 時間指定の予定
     */
    timedEvent: TimedGridTimedEvent,
    //timedEvent(this.$el, '.gc-time-grid'),
    /**
     * カレンダーの初期化
     */
    init() {
      this.dateSelector = new Selector(this.$el).setContainerSelector(".gc-all-day-section").setElementSelector(".gc-day").setPropertyName("date").setEnabled(componentParameters.canSelectDates).setMultiple(componentParameters.canSelectMultipleDates).onSelect((start, end, resourceId) => {
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59", resourceId);
      });
      this.timeSelector = new Selector(this.$el).setContainerSelector(".gc-timed-section").setElementSelector(".gc-slot").setPropertyName("time").setEnabled(componentParameters.canSelectDates).setMultiple(componentParameters.canSelectMultipleDates).onSelect((start, end, resourceId) => {
        this.$wire.onDate(start, this.timeSelector.getElementByValue(end).dataset.timeEnd, resourceId);
      });
      this.allDayEvent = new AllDayEvent(this.$el, this.dateSelector).setContainerSelector(".gc-all-day-section").onEvent((key) => {
        this.$wire.onEvent(key);
      }).onMove((key, start, end) => {
        this.$wire.onMove(key, start, end);
      });
      this.timedEvent = new TimedGridTimedEvent(this.$el, this.timeSelector).setContainerSelector(".gc-timed-section").onEvent((key) => {
        this.$wire.onEvent(key);
      }).onMove((key, start, end) => {
        this.$wire.onMove(key, start, end);
      });
      this.allDayEvent.registerCallbacks();
      this.timedEvent.registerCallbacks();
      this.dateSelector.registerCallbacks();
      this.timeSelector.registerCallbacks();
    }
  };
}
export {
  TimeGrid as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvU2VsZWN0b3IudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF0ZVV0aWxzLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1Jlc2l6ZXIudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvQWxsRGF5RXZlbnQudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvVGltZWRHcmlkVGltZWRFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvdGltZS1ncmlkLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERhdGVUaW1lU2VsZWN0b3JcbiAqXG4gKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwNkVcdTkwNzhcdTYyOUVcdTZBNUZcdTgwRkRcdTMwOTJcdTYzRDBcdTRGOUJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkJcdTMwMDFcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTY0Q0RcdTRGNUNcdTMwNkJcdTMwODhcdTMwOEJcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTYzMDdcdTVCOUFcdTMwOTJcdTg4NENcdTMwNDZcdTMwMDJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0b3Ige1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9lbGVtZW50U2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwOTJcdTYzMDFcdTMwNjRcdTMwRDdcdTMwRURcdTMwRDFcdTMwQzZcdTMwQTNcdTU0MERcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Byb3BlcnR5TmFtZTogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2VsZWN0aW9uU3RhcnQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTdENDJcdTRFODZcdTRGNERcdTdGNkVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NlbGVjdGlvbkVuZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBFQVx1MzBCRFx1MzBGQ1x1MzBCOUlEXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZXNvdXJjZUlkOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XHUzMDRDXHU2NzA5XHU1MkI5XHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9lbmFibGVkOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIC8qKlxuICAgICAqIFx1ODkwN1x1NjU3MFx1OTA3OFx1NjI5RVx1MzA0Q1x1NjcwOVx1NTJCOVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbXVsdGlwbGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1NjNDRlx1NzUzQlx1MzA1OVx1MzA4Qlx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRHJhdzogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nLCByZXNvdXJjZUlkOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDRDXHU1OTA5XHU2NkY0XHUzMDU1XHUzMDhDXHUzMDVGXHU2NjQyXHUzMDZFXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vblNlbGVjdDogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nLCByZXNvdXJjZUlkOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fY2xpY2suYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fbW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fbW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVyU2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBjb250YWluZXJTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGVsZW1lbnRTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRFbGVtZW50U2VsZWN0b3IoZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRTZWxlY3RvciA9IGVsZW1lbnRTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyKGRhdGEtZGF0ZVx1MzA2QVx1MzA4OVx1MzAwMWRhdGUpXG4gICAgICogQHBhcmFtIHByb3BlcnR5TmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eU5hbWUocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX3Byb3BlcnR5TmFtZSA9IHByb3BlcnR5TmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XHUzMDRDXHU2NzA5XHU1MkI5XHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGVuYWJsZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RW5hYmxlZChlbmFibGVkOiBib29sZWFuKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9lbmFibGVkID0gZW5hYmxlZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU4OTA3XHU2NTcwXHU5MDc4XHU2MjlFXHUzMDRDXHU2NzA5XHU1MkI5XHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIG11bHRpcGxlXG4gICAgICovXG4gICAgcHVibGljIHNldE11bHRpcGxlKG11bHRpcGxlOiBib29sZWFuKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9tdWx0aXBsZSA9IG11bHRpcGxlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTYzQ0ZcdTc1M0JcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gb25EcmF3XG4gICAgICovXG4gICAgcHVibGljIG9uRHJhdyhvbkRyYXc6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9vbkRyYXcgPSBvbkRyYXc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA0Q1x1NTkwOVx1NjZGNFx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBvblNlbGVjdFxuICAgICAqL1xuICAgIHB1YmxpYyBvblNlbGVjdChvblNlbGVjdDogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9vblNlbGVjdCA9IG9uU2VsZWN0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gdmFsdWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHNlbGVjdCh2YWx1ZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25TdGFydCA9IHRoaXMuX3NlbGVjdGlvbkVuZCA9IHZhbHVlO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTdENDJcdTRFODZcdTRGNERcdTdGNkVcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gdmFsdWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHNlbGVjdEVuZCh2YWx1ZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4OUUzXHU5NjY0XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgcHVibGljIGRlc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNlbGVjdChudWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZWxlY3Rpb24oKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gW3RoaXMuX3NlbGVjdGlvblN0YXJ0LCB0aGlzLl9zZWxlY3Rpb25FbmRdLnNvcnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTczRkVcdTU3MjhcdTMwMDFcdTkwNzhcdTYyOUVcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNTZWxlY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvblN0YXJ0ICE9PSBudWxsICYmIHRoaXMuX3NlbGVjdGlvbkVuZCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NsaWNrKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLl9lbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc291cmNlSWQgPSB0aGlzLnBpY2tSZXNvdXJjZUlkKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uU2VsZWN0KHZhbHVlLCB2YWx1ZSwgdGhpcy5fcmVzb3VyY2VJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU2MkJDXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuX2VuYWJsZWQgfHwgIXRoaXMuX211bHRpcGxlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jlc291cmNlSWQgPSB0aGlzLnBpY2tSZXNvdXJjZUlkKGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0KHZhbHVlKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTUyRDVcdTMwNEJcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX21vdXNlTW92ZShlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RFbmQodmFsdWUpO1xuICAgICAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTk2RTJcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX21vdXNlVXAoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vblNlbGVjdChzdGFydCwgZW5kLCB0aGlzLl9yZXNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFx1MzA0Qlx1MzA4OVx1MzAwMVx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSBlbCBcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgcGlja1ZhbHVlKGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IpXG4gICAgICAgICAgICA/IGVsLmNsb3Nlc3QodGhpcy5fZWxlbWVudFNlbGVjdG9yICsgJzpub3QoLmRpc2FibGVkKScpIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICA/LmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFx1MzA0Qlx1MzA4OVx1MzAwMVx1MzBFQVx1MzBCRFx1MzBGQ1x1MzBCOUlEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIGVsIFx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1MzBFQVx1MzBCRFx1MzBGQ1x1MzBCOUlEXG4gICAgICovXG4gICAgcHVibGljIHBpY2tSZXNvdXJjZUlkKGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IpXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICA/IGVsLmNsb3Nlc3QoJ1tkYXRhLXJlc291cmNlLWlkXScpPy5kYXRhc2V0WydyZXNvdXJjZUlkJ10gPz8gbnVsbFxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1NUVBN1x1NkExOVx1MzA0Qlx1MzA4OVx1MzAwMVx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSB4IFhcdTVFQTdcdTZBMTlcbiAgICAgKiBAcGFyYW0geSBZXHU1RUE3XHU2QTE5XG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHBpY2tWYWx1ZUJ5UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9jb250YWluZXJTZWxlY3RvciArICcgJyArIHRoaXMuX2VsZW1lbnRTZWxlY3RvcikpXG4gICAgICAgICAgICAuZmlsdGVyKChlbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY3QubGVmdCA8PSB4ICYmIHggPD0gcmVjdC5yaWdodCAmJiByZWN0LnRvcCA8PSB5ICYmIHkgPD0gcmVjdC5ib3R0b207XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0KDApPy5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV0gPz8gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gdmFsdWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBcdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RWxlbWVudEJ5VmFsdWUodmFsdWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3Rvcih0aGlzLl9jb250YWluZXJTZWxlY3RvciArICcgJyArIHRoaXMuX2VsZW1lbnRTZWxlY3RvciArXG4gICAgICAgICAgICAnW2RhdGEtJyArIHRoaXMuX3Byb3BlcnR5TmFtZSArICc9XCInICsgdmFsdWUgKyAnXCJdJ1xuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1MzA2RVx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5fb25EcmF3KSB7IC8vIFx1NjNDRlx1NzUzQlx1MzA5Mlx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA2N1x1ODg0Q1x1MzA0NlxuICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vbkRyYXcoc3RhcnQsIGVuZCwgdGhpcy5fcmVzb3VyY2VJZCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICtcbiAgICAgICAgICAgICh0aGlzLl9yZXNvdXJjZUlkICE9PSBudWxsID8gJyBbZGF0YS1yZXNvdXJjZS1pZD1cIicgKyB0aGlzLl9yZXNvdXJjZUlkICsgJ1wiXSAnIDogJyAnKSArXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3JcbiAgICAgICAgKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZWwuZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICBpZiAoc3RhcnQgPD0gdmFsdWUgJiYgdmFsdWUgPD0gZW5kKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1zZWxlY3RlZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0ZVV0aWxzIHtcbiAgICAvKipcbiAgICAgKiAxXHU2NUU1XHUzMDZFXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IE1JTExJU0VDT05EU19QRVJfREFZID0gMjQgKiA2MCAqIDYwICogMTAwMFxuXG4gICAgLyoqXG4gICAgICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0b0RhdGVTdHJpbmcoZDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdzdi1TRScpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU2NjQyXHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0b0RhdGVUaW1lU3RyaW5nKGQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gRGF0ZVV0aWxzLnRvRGF0ZVN0cmluZyhkKSArICcgJyArIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVUaW1lU3RyaW5nKFwiZW4tR0JcIilcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkJcdTY1RTVcdTY1NzBcdTMwOTJcdTUyQTBcdTdCOTdcbiAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTUyQTBcdTdCOTdcdTVGOENcdTMwNkVcdTY1RTVcdTRFRDgoXHUzMERGXHUzMEVBXHU3OUQyKVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYWRkRGF5cyhkYXRlOiBzdHJpbmcsIGRheXM6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBEYXRlLnBhcnNlKGRhdGUuc3Vic3RyaW5nKDAsIDEwKSArICcgMDA6MDA6MDAnKSArIGRheXMgKiBEYXRlVXRpbHMuTUlMTElTRUNPTkRTX1BFUl9EQVlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNjhcdTY1RTVcdTRFRDhcdTMwNkVcdTVERUVcdTMwNkVcdTY1RTVcdTY1NzBcdTMwOTJcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICAgICAqIEBwYXJhbSBkYXRlMiB7c3RyaW5nfSBcdTY1RTVcdTRFRDgyXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBkaWZmRGF5cyhkYXRlMTogc3RyaW5nLCBkYXRlMjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGQxID0gbmV3IERhdGUoZGF0ZTEpXG4gICAgICAgIGxldCBkMiA9IG5ldyBEYXRlKGRhdGUyKVxuICAgICAgICBkMS5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgICAgICBkMi5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoZDIuZ2V0VGltZSgpIC0gZDEuZ2V0VGltZSgpKSAvIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNjhcdTY1RTVcdTRFRDhcdTMwNkVcdTVERUVcdTMwOTJtc1x1MzA2N1x1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZJbk1pbGxpc2Vjb25kcyhkYXRlMTogc3RyaW5nLCBkYXRlMjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZTIpIC0gRGF0ZS5wYXJzZShkYXRlMSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MUZcdTk1OTNcdTMwNkVcdTkxQ0RcdTMwNkFcdTMwOEFcdTMwOTJcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgKiBAcGFyYW0gc3RhcnQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMSB7c3RyaW5nfSBcdTY3MUZcdTk1OTMxXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHBhcmFtIHN0YXJ0MiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICogQHBhcmFtIGVuZDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU5MUNEXHUzMDZBXHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBvdmVybGFwUGVyaW9kKHN0YXJ0MSwgZW5kMSwgc3RhcnQyLCBlbmQyKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gc3RhcnQxIDw9IHN0YXJ0MiA/IHN0YXJ0MiA6IHN0YXJ0MVxuICAgICAgICBjb25zdCBlbmQgPSBlbmQxIDw9IGVuZDIgPyBlbmQxIDogZW5kMlxuICAgICAgICByZXR1cm4gc3RhcnQgPD0gZW5kID8gW3N0YXJ0LCBlbmRdIDogW251bGwsIG51bGxdXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXHUzMDAxXHU2NjQyXHU5NTkzXHUzMDAxXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDkyXHU2RTIxXHUzMDU3XHUzMDAxXHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU4RkQ0XHUzMDU5XG4gICAgICpcbiAgICAgKiBAcGFyYW0gc3RhcnQge3N0cmluZ30gXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXG4gICAgICogQHBhcmFtIGVuZCB7c3RyaW5nfSBcdTdENDJcdTRFODZcdTY2NDJcdTk1OTNcbiAgICAgKiBAcGFyYW0gaW50ZXJ2YWwge3N0cmluZ30gXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0KFx1NzlEMlx1NjU3MClcbiAgICAgKiBAcGFyYW0gdGltZSB7c3RyaW5nfSBcdTY2NDJcdTk1OTNcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRpbWVTbG90KHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nLCBpbnRlcnZhbDogc3RyaW5nLCB0aW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoRGF0ZS5wYXJzZSh0aW1lID4gZW5kID8gZW5kIDogdGltZSkgLSBEYXRlLnBhcnNlKHN0YXJ0KSkgLyBwYXJzZUludChpbnRlcnZhbCkgLyAxMDAwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTY2NDJcdTMwNkVcdTY2NDJcdTk1OTNcdTMwOTJcdTU5MDlcdTY2RjRcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKlxuICAgICAqIEBwYXJhbSBkYXRlVGltZSB7c3RyaW5nfSBcdTY1RTVcdTY2NDJcbiAgICAgKiBAcGFyYW0gdGltZSB7c3RyaW5nfSBcdTY2NDJcdTk1OTNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTY2NDJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHNldFRpbWVPZkRhdGVUaW1lKGRhdGVUaW1lOiBzdHJpbmcsIHRpbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBkYXRlVGltZS5zdWJzdHJpbmcoMCwgMTApICsgJyAnICsgdGltZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY2NDJcdTk1OTNcdTMwOTJcdTUyMDZcdTY1NzBcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvTWludXRlcyh0aW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBbaG91ciwgbWludXRlXSA9IHRpbWUuc3BsaXQoJzonKVxuICAgICAgICByZXR1cm4gcGFyc2VJbnQoaG91cikgKiA2MCArIHBhcnNlSW50KG1pbnV0ZSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY2NDJcdTk1OTNcdTMwOTJcdTc5RDJcdTY1NzBcdTMwNkJcdTU5MDlcdTYzREJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIHRvU2Vjb25kcyh0aW1lOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBbaCwgaSwgc10gPSB0aW1lLnNwbGl0KCc6Jyk7XG4gICAgICAgIHJldHVybiAocGFyc2VJbnQoaCkgKiA2MCArIHBhcnNlSW50KGkpKSAqIDYwICsgcGFyc2VJbnQocyk7XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vU2VsZWN0b3JcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6ZXIge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2V2ZW50U2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwRkJcdTY2NDJcdTk1OTNcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NlbGVjdG9yOiBTZWxlY3RvciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDhcdTMwQzNcdTMwQzBcdTMwRkNcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYWRDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3Itdy1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM2XHUzMEZDXHUzMEVCXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF90YWlsQ3Vyc29yOiBzdHJpbmcgPSAnZ2MtY3Vyc29yLWUtcmVzaXplJztcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmc6IEhUTUxFbGVtZW50ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdTdGFydDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdFbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkJcdTMwMDFcdTUyNERcdTU2REVcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNUZcdTUwMjRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nVmFsdWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwMDJcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwNENcdTVDMTFcdTMwNkFcdTMwNDRcdTMwNjhcdTMwMDFcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNjhcdTUyMjRcdTY1QURcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTYzQjRcdTMwOTNcdTMwNjBcdTRGNERcdTdGNkVcdUZGMDhcdTY1RTVcdTRFRDhcdUZGMDlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dyYWJiZWQ6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ0hlYWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ1RhaWw6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1NEUwMFx1NjVFNVx1MzA2RVx1NjY0Mlx1OTU5M1x1OTU5M1x1OTY5NFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3VuaXQ6IG51bWJlciA9IDE7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTc1MUZcdTYyMTBcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uUHJldmlldzogKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIHNlbGVjdG9yOiBTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uQ2xpY2soZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0V2ZW50KGUudGFyZ2V0IGFzIEVsZW1lbnQpO1xuICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIGlmIChlbC5kYXRhc2V0LmNhbkNsaWNrID09PSAndHJ1ZScgJiYgZWwuZGF0YXNldC5jYW5Nb3ZlID09PSAnZmFsc2UnICYmIGVsLmRhdGFzZXQuY2FuUmVzaXplID09PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChlbC5kYXRhc2V0LmtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBDMFx1MzBBNlx1MzBGM1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU5NThCXHU1OUNCXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgRWxlbWVudCk7XG4gICAgICAgIGlmIChlbCAmJiAoZWwuZGF0YXNldC5jYW5Nb3ZlID09PSAndHJ1ZScgfHwgZWwuZGF0YXNldC5jYW5SZXNpemUgPT09ICd0cnVlJykpIHtcbiAgICAgICAgICAgIC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTkwOVx1NUY2Mlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IHRydWU7XG4gICAgICAgICAgICBpZiAodGhpcy5oaXRIZWFkKGUudGFyZ2V0IGFzIEVsZW1lbnQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdUYWlsID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5oaXRUYWlsKGUudGFyZ2V0IGFzIEVsZW1lbnQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdIZWFkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFxuICAgICAgICAgICAgdGhpcy5fZ3JhYmJlZCA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gZWw7XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1N0YXJ0ID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5zdGFydDtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nRW5kID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5lbmQ7XG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1RkYwOFx1ODg2OFx1NzkzQVx1MzA5Mlx1NkQ4OFx1MzA1OVx1RkYwOVxuICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZ0NsYXNzKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQua2V5LCB0cnVlKTtcblxuICAgICAgICAgICAgLy8gXHU3M0ZFXHU1NzI4XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ZhbHVlID0gbnVsbDtcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcodGhpcy5fZ3JhYmJlZCk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKTtcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHU5MUNGXHUzMDkyXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0NvdW50ID0gMDtcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEUwXHUzMEZDXHUzMEQ2XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VNb3ZlKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgICAgICBpZiAodmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcodmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTMwREVcdTMwQTZcdTMwQjlcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwNUZcdTMwODFcdTMwNkJcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdThBMThcdTkzMzJcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nQ291bnQrKztcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VVcChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5rZXk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHRoaXMuX2dyYWJiZWQgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5kcmFnKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25Nb3ZlICYmIHN0YXJ0ICE9PSBudWxsICYmIGVuZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdmUoa2V5LCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2RyYWdnaW5nQ291bnQgPCAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuY2FuQ2xpY2sgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChrZXkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25QcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uUHJldmlldyh0aGlzLl9kcmFnZ2luZywgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RHJhZ2dpbmdDbGFzcyhrZXksIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdIZWFkID0gdGhpcy5faXNHcmFiYmluZ1RhaWwgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKTtcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEJBXHU1QkZFXHU4QzYxXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIHNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldEV2ZW50U2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9ldmVudFNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1NjY0Mlx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjdXJzb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0SGVhZEN1cnNvcihjdXJzb3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9oZWFkQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTY2NDJcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY3Vyc29yXG4gICAgICovXG4gICAgcHVibGljIHNldFRhaWxDdXJzb3IoY3Vyc29yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fdGFpbEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU0RTAwXHU2NUU1XHUzMDZFXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHVuaXQge251bWJlcn0gXHU0RTAwXHU2NUU1XHUzMDZFXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XG4gICAgICovXG4gICAgcHVibGljIHNldFVuaXQodW5pdDogbnVtYmVyKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX3VuaXQgPSB1bml0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChjYWxsYmFjazogKGtleTogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShjYWxsYmFjazogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU3NTFGXHU2MjEwXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uUHJldmlldyhjYWxsYmFjazogKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25QcmV2aWV3ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNEcmFnZ2luZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyYWdnaW5nICE9PSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRHcmFiYmVkRGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ3JhYmJlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwaWNrRXZlbnQoZWw6IEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCh0aGlzLl9ldmVudFNlbGVjdG9yKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NTIyNFx1NUI5QVx1MzA1OVx1MzA4Qlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGl0SGVhZChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFlbC5jbG9zZXN0KCcuZ2MtaGVhZCcpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRUYWlsKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy10YWlsJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0RHJhZ2dpbmdDbGFzcyhrZXk6IHN0cmluZywgZHJhZ2dpbmc6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2V2ZW50U2VsZWN0b3IgKyAnW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NzNGRVx1NTcyOFx1MzAwMVx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2Rlx1MzAwMVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0FsbERheURyYWdnaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJhZ2dpbmc/LmRhdGFzZXQuYWxsRGF5ID09PSAndHJ1ZSc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHUzMEQxXHUzMEU5XHUzMEUxXHUzMEZDXHUzMEJGXHUzMDRDXHU2NTc0XHU2NTcwXHU1MDI0XHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzTnVtYmVyKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIC9eXFxkKyQvLnRlc3QodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBkcmFnKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOdW1iZXIodmFsdWUpXG4gICAgICAgICAgICA/IHRoaXMuZHJhZ051bWJlcih2YWx1ZSlcbiAgICAgICAgICAgIDogdGhpcy5kcmFnRGF0ZVRpbWUodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1MzA2RVx1MzBEMVx1MzBFOVx1MzBFMVx1MzBGQ1x1MzBCRlx1MzA2Qlx1NUJGRVx1MzA1N1x1MzA2Nlx1MzAwMVx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBkcmFnRGF0ZVRpbWUodmFsdWU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICAgICAgICBjb25zdCBkaWZmID0gRGF0ZVV0aWxzLmRpZmZJbk1pbGxpc2Vjb25kcyh0aGlzLl9ncmFiYmVkLCB2YWx1ZSk7XG4gICAgICAgIGxldCBzdGFydCA9IERhdGVVdGlscy50b0RhdGVUaW1lU3RyaW5nKERhdGUucGFyc2UodGhpcy5fZHJhZ2dpbmdTdGFydCkgKyAodGhpcy5faXNHcmFiYmluZ0hlYWQgPyBkaWZmIDogMCkpO1xuICAgICAgICBsZXQgZW5kID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZS5wYXJzZSh0aGlzLl9kcmFnZ2luZ0VuZCkgKyAodGhpcy5faXNHcmFiYmluZ1RhaWwgPyBkaWZmIDogMCkpO1xuICAgICAgICBzdGFydCA9IHN0YXJ0LnN1YnN0cmluZygwLCB0aGlzLl9ncmFiYmVkLmxlbmd0aCk7XG4gICAgICAgIGVuZCA9IGVuZC5zdWJzdHJpbmcoMCwgdGhpcy5fZ3JhYmJlZC5sZW5ndGgpO1xuICAgICAgICBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgICAgICBlbmQgPSBzdGFydFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbc3RhcnQsIGVuZF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1NzRcdTY1NzBcdTUwMjRcdTMwNkVcdTMwRDFcdTMwRTlcdTMwRTFcdTMwRkNcdTMwQkZcdTMwNkJcdTVCRkVcdTMwNTdcdTMwNjZcdTMwMDFcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZHJhZ051bWJlcih2YWx1ZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBwYXJzZUludCh2YWx1ZSkgLSBwYXJzZUludCh0aGlzLl9ncmFiYmVkKTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gcGFyc2VJbnQodGhpcy5fZHJhZ2dpbmdTdGFydCkgKyAodGhpcy5faXNHcmFiYmluZ0hlYWQgPyBkaWZmIDogMCk7XG4gICAgICAgIGxldCBlbmQgPSBwYXJzZUludCh0aGlzLl9kcmFnZ2luZ0VuZCkgKyAodGhpcy5faXNHcmFiYmluZ1RhaWwgPyBkaWZmIDogMCk7XG4gICAgICAgIGlmICh0aGlzLmlzQWxsRGF5RHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgc3RhcnQgPSBNYXRoLmZsb29yKHN0YXJ0IC8gdGhpcy5fdW5pdCkgKiB0aGlzLl91bml0O1xuICAgICAgICAgICAgZW5kID0gTWF0aC5mbG9vcihlbmQgLyB0aGlzLl91bml0KSAqIHRoaXMuX3VuaXQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ID4gZW5kKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQpIHtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGVuZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdUYWlsKSB7XG4gICAgICAgICAgICAgICAgZW5kID0gc3RhcnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW3N0YXJ0LCBlbmRdXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUN1cnNvcigpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QucmVtb3ZlKHRoaXMuX2hlYWRDdXJzb3IsIHRoaXMuX3RhaWxDdXJzb3IpXG4gICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCAmJiB0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKCdnYy1jdXJzb3ItbW92ZScpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCh0aGlzLl9oZWFkQ3Vyc29yKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzR3JhYmJpbmdUYWlsKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQodGhpcy5fdGFpbEN1cnNvcilcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlUHJldmlldyh2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZ1ZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5kcmFnKHZhbHVlKVxuICAgICAgICAgICAgaWYgKHRoaXMuX29uUHJldmlldykge1xuICAgICAgICAgICAgICAgIHRoaXMuX29uUHJldmlldyh0aGlzLl9kcmFnZ2luZywgc3RhcnQsIGVuZClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nVmFsdWUgPSB2YWx1ZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5ODJEXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBpc0dyYWJiaW5nSGVhZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzR3JhYmJpbmdIZWFkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNHcmFiYmluZ1RhaWwoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0dyYWJiaW5nVGFpbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk4MkRcdTkwRThcdTUyMDZcdTMwNjhcdTY3MkJcdTVDM0VcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGlzR3JhYmJpbmdCb2R5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNHcmFiYmluZ0hlYWQgJiYgdGhpcy5faXNHcmFiYmluZ1RhaWw7XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vU2VsZWN0b3JcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuL1Jlc2l6ZXJcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFsbERheUV2ZW50IHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RhdGVTZWxlY3RvcjogU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEI2XHUzMEZDXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNpemVyOiBSZXNpemVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEQlx1MzBEMFx1MzBGQ1x1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaG92ZXI6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gZGF0ZVNlbGVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIGRhdGVTZWxlY3RvcjogU2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuX2RhdGVTZWxlY3RvciA9IGRhdGVTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgcHVibGljIGluaXQoKSB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIgPSBuZXcgUmVzaXplcih0aGlzLl9yb290LCB0aGlzLl9kYXRlU2VsZWN0b3IpXG4gICAgICAgICAgICAuc2V0RXZlbnRTZWxlY3RvcignLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIC5zZXRIZWFkQ3Vyc29yKCdnYy1jdXJzb3Itdy1yZXNpemUnKVxuICAgICAgICAgICAgLnNldFRhaWxDdXJzb3IoJ2djLWN1cnNvci1lLXJlc2l6ZScpXG4gICAgICAgICAgICAub25FdmVudCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbk1vdmUoKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vblByZXZpZXcoKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZXZpZXcoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUHJldmlldyhlbCwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9yZXNpemVyLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDZFXHUzMERFXHUzMEE2XHUzMEI5XHUzMERCXHUzMEQwXHUzMEZDXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGUge0V2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlT3ZlcihlOiBFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fcmVzaXplci5pc0RyYWdnaW5nKCkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gXHU3RDQyXHU2NUU1XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDAxXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XHU0RTJEXHUzMDZGXHUzMDAxXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDZBXHUzMDQ0XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLnBpY2tBbGxEYXlFdmVudChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGVsID8gZWwuZGF0YXNldC5rZXkgOiBudWxsO1xuICAgICAgICBpZiAoa2V5ICE9PSB0aGlzLl9ob3Zlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuX2hvdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5faG92ZXIgPSBrZXksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBBbGxEYXlFdmVudCB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIuc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IGNvbnRhaW5lclNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKiBAcmV0dXJucyB7QWxsRGF5RXZlbnR9IFx1ODFFQVx1OEVBQlxuICAgICAqL1xuICAgIHB1YmxpYyBvbkV2ZW50KGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiBBbGxEYXlFdmVudCB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHJldHVybnMge0FsbERheUV2ZW50fSBcdTgxRUFcdThFQUJcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Nb3ZlKGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIHdpdGhvdXRQb3B1cCB7Ym9vbGVhbn0gXHUzMEREXHUzMEMzXHUzMEQ3XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMDkyXHU5NjY0XHU1OTE2XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHJldHVybnMge251bGx8SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcGlja0FsbERheUV2ZW50KGVsOiBIVE1MRWxlbWVudCwgd2l0aG91dFBvcHVwOiBib29sZWFuID0gZmFsc2UpOiBudWxsIHwgSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvciArICh3aXRob3V0UG9wdXAgPyAnJyA6ICcsIC5nYy1kYXktZ3JpZC1wb3B1cCcpKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBrZXkge3N0cmluZ30gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEFEXHUzMEZDXG4gICAgICogQHBhcmFtIGhvdmVyIHtib29sZWFufSBcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0SG92ZXJBbGxEYXlFdmVudChrZXk6IHN0cmluZywgaG92ZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgKiBAcGFyYW0gZWxFdmVudCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBldmVudFN0YXJ0IHtzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgY3JlYXRlUHJldmlldyhlbEV2ZW50OiBIVE1MRWxlbWVudCwgZXZlbnRTdGFydDogc3RyaW5nLCBldmVudEVuZDogc3RyaW5nKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy13ZWVrLCAuZ2MtYWxsLWRheS1zZWN0aW9uJykpLmZvckVhY2goZWxXZWVrID0+IHtcbiAgICAgICAgICAgIGNvbnN0IFt3ZWVrU3RhcnQsIHdlZWtFbmRdID0gdGhpcy5nZXRXZWVrUGVyaW9kKGVsV2VlaylcbiAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgJiYgd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtwZXJpb2RTdGFydCwgcGVyaW9kRW5kXSA9IERhdGVVdGlscy5vdmVybGFwUGVyaW9kKGV2ZW50U3RhcnQsIGV2ZW50RW5kLCB3ZWVrU3RhcnQsIHdlZWtFbmQpXG4gICAgICAgICAgICAgICAgaWYgKHBlcmlvZFN0YXJ0ICYmIHBlcmlvZEVuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbFByZXZpZXcgPSBlbFdlZWsucXVlcnlTZWxlY3RvcignLmdjLWRheVtkYXRhLWRhdGU9XCInICsgcGVyaW9kU3RhcnQgKyAnXCJdIC5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKVxuICAgICAgICAgICAgICAgICAgICBpZiAod2Vla1N0YXJ0IDw9IHRoaXMuX3Jlc2l6ZXIuZ2V0R3JhYmJlZERhdGUoKSAmJiB0aGlzLl9yZXNpemVyLmdldEdyYWJiZWREYXRlKCkgPD0gd2Vla0VuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMDkyXHU5NThCXHU1OUNCXHUzMDU3XHUzMDVGXHU5MDMxXHUzMDY3XHUzMDZGXHUzMDAxXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHUzMDZFXHU3RTI2XHU0RjREXHU3RjZFXHUzMDkyXHU4QUJGXHU3QkMwXHUzMDU5XHUzMDhCXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZEVtcHR5QWxsRGF5RXZlbnRzKGVsUHJldmlldywgdGhpcy5nZXRJbmRleEluUGFyZW50KGVsRXZlbnQpKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZWxFdmVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF5cyA9IERhdGVVdGlscy5kaWZmRGF5cyhwZXJpb2RTdGFydCwgcGVyaW9kRW5kKSArIDFcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RQcmV2aWV3KGVsLCBkYXlzLCBwZXJpb2RTdGFydCA9PT0gZXZlbnRTdGFydCwgcGVyaW9kRW5kID09PSBldmVudEVuZClcbiAgICAgICAgICAgICAgICAgICAgZWxQcmV2aWV3LmFwcGVuZENoaWxkKGVsKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWxXZWVrIHtIVE1MRWxlbWVudH0gXHU5MDMxXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTkwMzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcdTMwRkJcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0V2Vla1BlcmlvZChlbFdlZWs6IEhUTUxFbGVtZW50KTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGVsRGF5cyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZGF5Om5vdCguZ2MtZGlzYWJsZWQpJykgYXMgTm9kZUxpc3RPZjxIVE1MRWxlbWVudD5cbiAgICAgICAgaWYgKGVsRGF5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW2VsRGF5c1swXS5kYXRhc2V0LmRhdGUsIGVsRGF5c1tlbERheXMubGVuZ3RoIC0gMV0uZGF0YXNldC5kYXRlXVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtudWxsLCBudWxsXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIGRheXMge251bWJlcn0gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NUU1XHU2NTcwXG4gICAgICogQHBhcmFtIGlzU3RhcnQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1OTU4Qlx1NTlDQlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBpc0VuZCB7Ym9vbGVhbn0gXHU5MDMxXHU1MTg1XHUzMDZCXHU3RDQyXHU0RTg2XHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFkanVzdFByZXZpZXcoZWw6IEhUTUxFbGVtZW50LCBkYXlzOiBudW1iZXIsIGlzU3RhcnQ6IGJvb2xlYW4sIGlzRW5kOiBib29sZWFuKSB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc3RhcnQnKVxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1lbmQnKVxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSA3OyBpKyspIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLScgKyBpICsgJ2RheXMnKVxuICAgICAgICB9XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLScgKyBkYXlzICsgJ2RheXMnKVxuICAgICAgICBpZiAoaXNTdGFydCkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc3RhcnQnKVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc0VuZCkge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtZW5kJylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZET01cdTg5ODFcdTdEMjBcdTMwNENcdTUxNDRcdTVGMUZcdTMwNkVcdTRFMkRcdTMwNjdcdTRGNTVcdTc1NkFcdTc2RUVcdTMwNEJcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTMwQTRcdTMwRjNcdTMwQzdcdTMwQzNcdTMwQUZcdTMwQjlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0SW5kZXhJblBhcmVudChlbDogSFRNTEVsZW1lbnQpOiBudW1iZXIge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKGVsLnBhcmVudE5vZGUuY2hpbGRyZW4pLmluZGV4T2YoZWwpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGXHU2NTcwXHUzMDYwXHUzMDUxXHU3QTdBXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU4RkZEXHU1MkEwXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFkZEVtcHR5QWxsRGF5RXZlbnRzKGVsUHJldmlldzogSFRNTEVsZW1lbnQsIGNvdW50OiBudW1iZXIpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTUyNEFcdTk2NjRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVtb3ZlUHJldmlldygpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsOiBFbGVtZW50KSA9PiBlbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbC5jbG9uZU5vZGUoZmFsc2UpLCBlbCkpXG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vU2VsZWN0b3JcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuL1Jlc2l6ZXJcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVkR3JpZFRpbWVkRXZlbnQge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByaXZhdGUgX3RpbWVTZWxlY3RvcjogU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHUzMDZFXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEI2XHUzMEZDXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcmVzaXplcjogUmVzaXplciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREJcdTMwRDBcdTMwRkNcdTRFMkRcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcml2YXRlIF9ob3Zlcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZDtcblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqIEBwYXJhbSB0aW1lU2VsZWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgdGltZVNlbGVjdG9yOiBTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5fdGltZVNlbGVjdG9yID0gdGltZVNlbGVjdG9yO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgKi9cbiAgICBpbml0KCkge1xuICAgICAgICB0aGlzLl9yZXNpemVyID0gbmV3IFJlc2l6ZXIodGhpcy5fcm9vdCwgdGhpcy5fdGltZVNlbGVjdG9yKVxuICAgICAgICAgICAgLnNldEV2ZW50U2VsZWN0b3IoJy5nYy10aW1lZC1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgLnNldEhlYWRDdXJzb3IoJ2djLWN1cnNvci1uLXJlc2l6ZScpXG4gICAgICAgICAgICAuc2V0VGFpbEN1cnNvcignZ2MtY3Vyc29yLXMtcmVzaXplJylcbiAgICAgICAgICAgIC5vbkV2ZW50KChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uTW92ZSgoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdmUoa2V5LCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uUHJldmlldygoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJldmlldygpO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydCAmJiBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVQcmV2aWV3KGVsLCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChjYWxsYmFjazogKGtleTogc3RyaW5nKSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShjYWxsYmFjazogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLl9yZXNpemVyLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5fb25Nb3VzZU92ZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBUaW1lZEdyaWRUaW1lZEV2ZW50IHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5zZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzBERVx1MzBBNlx1MzBCOVx1MzBEQlx1MzBEMFx1MzBGQ1x1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlIHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uTW91c2VPdmVyKGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLl9yZXNpemVyLmlzRHJhZ2dpbmcoKSkgeyAvLyBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwMDFcdTY1RTVcdTRFRDhcdTMwNkVcdTkwNzhcdTYyOUVcdTUxRTZcdTc0MDZcdTRFMkRcdTMwNkZcdTMwMDFcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNkFcdTMwNDRcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0V2ZW50KGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50KTtcbiAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGw7XG4gICAgICAgIGlmIChrZXkgIT09IHRoaXMuX2hvdmVyKSB7XG4gICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5faG92ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLl9ob3ZlciA9IGtleSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAqL1xuICAgIHByaXZhdGUgcGlja0V2ZW50KGVsOiBIVE1MRWxlbWVudCk6IG51bGwgfCBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTRFODhcdTVCOUFcdTMwNkVcdTMwREJcdTMwRDBcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0ga2V5IHtzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1xuICAgICAqIEBwYXJhbSBob3ZlciB7Ym9vbGVhbn0gXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRIb3ZlckFsbERheUV2ZW50KGtleTogc3RyaW5nLCBob3ZlcjogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy10aW1lZC1ldmVudC1jb250YWluZXJbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaG92ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWhvdmVyJylcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgKiBAcGFyYW0gZWxFdmVudCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBldmVudFN0YXJ0IHtzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVByZXZpZXcoZWxFdmVudDogSFRNTEVsZW1lbnQsIGV2ZW50U3RhcnQ6IHN0cmluZywgZXZlbnRFbmQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCByZXNvdXJjZUlkID0gZWxFdmVudC5kYXRhc2V0LnJlc291cmNlSWQ7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnIC5nYy1kYXlbZGF0YS1yZXNvdXJjZS1pZD1cIicgKyByZXNvdXJjZUlkICsgJ1wiXScpKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsRGF5OiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtkYXlTdGFydCwgZGF5RW5kXSA9IHRoaXMuZ2V0UGVyaW9kT2ZEYXkoZWxEYXkpO1xuICAgICAgICAgICAgICAgIGlmIChkYXlTdGFydCAmJiBkYXlFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3BlcmlvZFN0YXJ0LCBwZXJpb2RFbmRdID0gRGF0ZVV0aWxzLm92ZXJsYXBQZXJpb2QoZXZlbnRTdGFydCwgZXZlbnRFbmQsIGRheVN0YXJ0LCBkYXlFbmQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGVyaW9kU3RhcnQgJiYgcGVyaW9kRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbc2xvdCwgc3Bhbl0gPSB0aGlzLmdldFNsb3RQb3NpdGlvbihlbERheSwgcGVyaW9kU3RhcnQsIHBlcmlvZEVuZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGVsRXZlbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGp1c3RQcmV2aWV3KGVsLCBzcGFuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3QucXVlcnlTZWxlY3RvcignLmdjLXRpbWVkLWV2ZW50LXByZXZpZXcnKS5hcHBlbmRDaGlsZChlbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTU4Qlx1NTlDQlx1MzBCOVx1MzBFRFx1MzBDM1x1MzBDOFx1MzA2OFx1OUFEOFx1MzA1NVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqXG4gICAgICogQHBhcmFtIGVsRGF5IHtIVE1MRWxlbWVudH0gXHU2NUU1XHU0RUQ4XHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIGV2ZW50U3RhcnQge3N0cmluZ30gXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXG4gICAgICogQHBhcmFtIGV2ZW50RW5kIHtzdHJpbmd9IFx1N0Q0Mlx1NEU4Nlx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtbSFRNTEVsZW1lbnQsIG51bWJlcl19IFx1OTU4Qlx1NTlDQlx1MzBCOVx1MzBFRFx1MzBDM1x1MzBDOFx1MzA2OFx1OUFEOFx1MzA1NVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0U2xvdFBvc2l0aW9uKGVsRGF5OiBIVE1MRWxlbWVudCwgZXZlbnRTdGFydDogc3RyaW5nLCBldmVudEVuZDogc3RyaW5nKTogW0hUTUxFbGVtZW50LCBudW1iZXJdIHtcbiAgICAgICAgY29uc3QgW2RheVN0YXJ0LCBkYXlFbmRdID0gdGhpcy5nZXRQZXJpb2RPZkRheShlbERheSk7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZVV0aWxzLnRpbWVTbG90KGRheVN0YXJ0LCBkYXlFbmQsIGVsRGF5LmRhdGFzZXQuaW50ZXJ2YWwsIGV2ZW50U3RhcnQpO1xuICAgICAgICBjb25zdCBlbmQgPSBEYXRlVXRpbHMudGltZVNsb3QoZGF5U3RhcnQsIGRheUVuZCwgZWxEYXkuZGF0YXNldC5pbnRlcnZhbCwgZXZlbnRFbmQpO1xuICAgICAgICBjb25zdCBzbG90cyA9IGVsRGF5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1zbG90JykgYXMgTm9kZUxpc3RPZjxIVE1MRWxlbWVudD47XG4gICAgICAgIHJldHVybiBbc2xvdHNbc3RhcnRdLCBlbmQgLSBzdGFydCArIDFdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1RkYxMVx1NjVFNVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1NjY0Mlx1MzA2OFx1N0Q0Mlx1NEU4Nlx1NjVFNVx1NjY0Mlx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1NjVFNVx1NEVEOFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRQZXJpb2RPZkRheShlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIFtlbERheS5kYXRhc2V0LnN0YXJ0LCBlbERheS5kYXRhc2V0LmVuZF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIHRpbWVTbG90SGVpZ2h0IHtudW1iZXJ9IFx1MzBCOVx1MzBFRFx1MzBDM1x1MzBDOFx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRqdXN0UHJldmlldyhlbDogSFRNTEVsZW1lbnQsIHRpbWVTbG90SGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKTtcbiAgICAgICAgZWwuc3R5bGUuc2V0UHJvcGVydHkoJy0tZ2Mtc3BhbicsICdjYWxjKCcgKyAodGltZVNsb3RIZWlnaHQgKiAxMDApICsgJyUgKyAnICsgKHRpbWVTbG90SGVpZ2h0IC0gMSkgKyAncHgpJyk7XG4gICAgICAgIHJldHVybiBlbFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NTI0QVx1OTY2NFxuICAgICAqL1xuICAgIHByaXZhdGUgcmVtb3ZlUHJldmlldygpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLXRpbWVkLWV2ZW50LXByZXZpZXcnKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbDogSFRNTEVsZW1lbnQpID0+IGVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsLmNsb25lTm9kZShmYWxzZSksIGVsKSk7XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vbW9kdWxlcy9TZWxlY3Rvci50c1wiO1xuaW1wb3J0IEFsbERheUV2ZW50IGZyb20gXCIuL21vZHVsZXMvQWxsRGF5RXZlbnQuanNcIjtcbmltcG9ydCBUaW1lZEdyaWRUaW1lZEV2ZW50IGZyb20gXCIuL21vZHVsZXMvVGltZWRHcmlkVGltZWRFdmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUaW1lR3JpZChjb21wb25lbnRQYXJhbWV0ZXJzKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAgICAgKi9cbiAgICAgICAgZGF0ZVNlbGVjdG9yOiBTZWxlY3RvciwvL3NlbGVjdG9yKHRoaXMuJGVsLCAnLmdjLXRpbWUtZ3JpZCcsICcuZ2MtZGF5JywgJ2RhdGUnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NjQyXHU5NTkzXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAqL1xuICAgICAgICB0aW1lU2VsZWN0b3I6IFNlbGVjdG9yLC8vc2VsZWN0b3IodGhpcy4kZWwsICcuZ2MtdGltZS1ncmlkJywgJy5nYy1zbG90JywgJ3RpbWUnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICBhbGxEYXlFdmVudDogQWxsRGF5RXZlbnQsLy9hbGxEYXlFdmVudCh0aGlzLiRlbCwgJy5nYy10aW1lLWdyaWQnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICB0aW1lZEV2ZW50OiBUaW1lZEdyaWRUaW1lZEV2ZW50LC8vdGltZWRFdmVudCh0aGlzLiRlbCwgJy5nYy10aW1lLWdyaWQnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAqL1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5kYXRlU2VsZWN0b3IgPSBuZXcgU2VsZWN0b3IodGhpcy4kZWwpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtYWxsLWRheS1zZWN0aW9uJylcbiAgICAgICAgICAgICAgICAuc2V0RWxlbWVudFNlbGVjdG9yKCcuZ2MtZGF5JylcbiAgICAgICAgICAgICAgICAuc2V0UHJvcGVydHlOYW1lKCdkYXRlJylcbiAgICAgICAgICAgICAgICAuc2V0RW5hYmxlZChjb21wb25lbnRQYXJhbWV0ZXJzLmNhblNlbGVjdERhdGVzKVxuICAgICAgICAgICAgICAgIC5zZXRNdWx0aXBsZShjb21wb25lbnRQYXJhbWV0ZXJzLmNhblNlbGVjdE11bHRpcGxlRGF0ZXMpXG4gICAgICAgICAgICAgICAgLm9uU2VsZWN0KChzdGFydCwgZW5kLCByZXNvdXJjZUlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25EYXRlKHN0YXJ0ICsgJyAwMDowMDowMCcsIGVuZCArICcgMjM6NTk6NTknLCByZXNvdXJjZUlkKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy50aW1lU2VsZWN0b3IgPSBuZXcgU2VsZWN0b3IodGhpcy4kZWwpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtdGltZWQtc2VjdGlvbicpXG4gICAgICAgICAgICAgICAgLnNldEVsZW1lbnRTZWxlY3RvcignLmdjLXNsb3QnKVxuICAgICAgICAgICAgICAgIC5zZXRQcm9wZXJ0eU5hbWUoJ3RpbWUnKVxuICAgICAgICAgICAgICAgIC5zZXRFbmFibGVkKGNvbXBvbmVudFBhcmFtZXRlcnMuY2FuU2VsZWN0RGF0ZXMpXG4gICAgICAgICAgICAgICAgLnNldE11bHRpcGxlKGNvbXBvbmVudFBhcmFtZXRlcnMuY2FuU2VsZWN0TXVsdGlwbGVEYXRlcylcbiAgICAgICAgICAgICAgICAub25TZWxlY3QoKHN0YXJ0LCBlbmQsIHJlc291cmNlSWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkRhdGUoc3RhcnQsIHRoaXMudGltZVNlbGVjdG9yLmdldEVsZW1lbnRCeVZhbHVlKGVuZCkuZGF0YXNldC50aW1lRW5kLCByZXNvdXJjZUlkKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudCA9IG5ldyBBbGxEYXlFdmVudCh0aGlzLiRlbCwgdGhpcy5kYXRlU2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtYWxsLWRheS1zZWN0aW9uJylcbiAgICAgICAgICAgICAgICAub25FdmVudCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub25Nb3ZlKChrZXksIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50ID0gbmV3IFRpbWVkR3JpZFRpbWVkRXZlbnQodGhpcy4kZWwsIHRoaXMudGltZVNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLXRpbWVkLXNlY3Rpb24nKVxuICAgICAgICAgICAgICAgIC5vbkV2ZW50KChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbk1vdmUoKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA2RVx1NzY3Qlx1OTMzMlxuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50LnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3Rvci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy50aW1lU2VsZWN0b3IucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgfSxcbiAgICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7QUFLQSxJQUFxQixXQUFyQixNQUE4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFzRTFCLFlBQVksTUFBbUI7QUFqRS9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVE7QUFNUjtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLHNCQUE2QjtBQU1yQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLG9CQUEyQjtBQU1uQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGlCQUF3QjtBQU1oQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLG1CQUEwQjtBQU1sQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGlCQUF3QjtBQU1oQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGVBQXNCO0FBTTlCO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsWUFBb0I7QUFNNUI7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFBUSxhQUFxQjtBQUs3QjtBQUFBO0FBQUE7QUFBQSx3QkFBUSxXQUFvRTtBQU01RTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGFBQXNFO0FBTzFFLFNBQUssUUFBUTtBQUFBLEVBQ2pCO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLTyxvQkFBb0I7QUFDdkIsU0FBSyxNQUFNLGlCQUFpQixTQUFT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
