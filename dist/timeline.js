var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

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
    this._root = root;
    this.init();
  }
  /**
   * 初期化
   */
  init() {
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
    this._root.querySelectorAll(".gc-events .gc-all-day-events .gc-all-day-event-container").forEach((el) => {
      this.updateEventLayout(el);
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
   * 指定位置の開始時間・終了時間の幅を取得する
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
   * 終日イベントのレイアウトをピクセルで設定する
   * @returns {number}
   * @param el
   */
  updateEventLayout(el) {
    el.style.left = parseInt(el.dataset.start) * this.getTimeSlotWidth() + "px";
    el.style.width = (parseInt(el.dataset.end) - parseInt(el.dataset.start)) * this.getTimeSlotWidth() + "px";
    el.style.top = parseInt(el.dataset.position) * this.getEventHeight() + "px";
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

// resources/js/timeline.js
function timeline() {
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
     * 初期化する
     */
    init() {
      this.timelineLayout = new TimelineLayout(this.$el);
      this.timelineLayout.registerCallbacks();
      this.$nextTick(() => {
        this.timelineLayout.updateLayout();
      });
      this.timelineSelection = new TimelineSelection(this.$el);
      this.selector = new Selector(this.$el).setContainerSelector(".gc-main").setElementSelector(".gc-time-slot").setPropertyName("index").onDraw((start, end, resourceId) => {
        this.timelineSelection.draw(start, end, resourceId);
      }).onSelect((start, end, resourceId) => {
        this.$wire.onDate(
          this.timelineLayout.getTimeSlot(start).dataset.time,
          this.timelineLayout.getTimeSlot(end).dataset.timeEnd,
          resourceId
        );
      });
      this.resizer = new Resizer(this.$el, this.selector).setContainerSelector(".gc-main").setEventSelector(".gc-all-day-event-container").setHeadCursor("gc-cursor-w-resize").setTailCursor("gc-cursor-e-resize").onMove((key, start, end) => {
        this.moveEvent(key, start, end);
        this.$wire.onMove(key, start, end);
      }).onEvent((key) => {
        this.$wire.onEvent(key);
      }).onPreview((el, start, end) => {
        el.dataset.start = start;
        el.dataset.end = end;
        this.timelineLayout.updateEventLayout(el);
      });
      this.resizer.registerCallbacks();
      this.selector.registerCallbacks();
      Livewire.on("refreshCalendar", () => {
        this.$nextTick(() => this.timelineLayout.updateLayout());
      });
    },
    /**
     * イベントを移動する
     */
    moveEvent(key, start, end) {
      const el = this.$el.querySelector('.gc-events [data-key="' + key + '"]');
      const time = this.timelineLayout.getTimeSlot(start).dataset.time;
      const endTime = this.timelineLayout.getTimeSlot(end - 1).dataset.timeEnd;
      if (el.dataset.allDay === "true") {
        this.$wire.onMove(key, time.substring(0, 10) + " 00:00:00", endTime.substring(0, 10) + " 23:59:59");
      } else {
        this.$wire.onMove(key, time, endTime);
      }
    }
  };
}
export {
  timeline as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvVGltZWxpbmVMYXlvdXQudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvU2VsZWN0b3IudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvVGltZWxpbmVTZWxlY3Rpb24udHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF0ZVV0aWxzLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1Jlc2l6ZXIudHMiLCAiLi4vcmVzb3VyY2VzL2pzL3RpbWVsaW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lbGluZUxheW91dCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHR5cGUge0hUTUxFbGVtZW50fVxuICAgICAqL1xuICAgIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1OTU5M1x1OTY5NFx1MzA2RVx1NUU0NVx1MzA2RVx1MzBENFx1MzBBRlx1MzBCQlx1MzBFQlx1NTAyNFxuICAgICAqL1xuICAgIF90aW1lU2xvdFdpZHRoOiBudW1iZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU1NDA0XHU0RTg4XHU1QjlBXHUzMDZFXHU5QUQ4XHUzMDU1XHUzMDZFXHUzMEQ0XHUzMEFGXHUzMEJCXHUzMEVCXHU1MDI0XG4gICAgICovXG4gICAgX2V2ZW50SGVpZ2h0OiBudW1iZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3RcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgcHJpdmF0ZSBpbml0KCkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByaXZhdGUgX29uUmVzaXplKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUxheW91dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQ1x1MzBBNFx1MzBBMlx1MzBBNlx1MzBDOFx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHB1YmxpYyB1cGRhdGVMYXlvdXQoKSB7XG4gICAgICAgIC8vIFx1NTQwNFx1MzBFQVx1MzBCRFx1MzBGQ1x1MzBCOVx1MzA2RVx1ODk4Qlx1NTFGQVx1MzA1N1x1MzA2RVx1OUFEOFx1MzA1NVx1MzA5Mlx1MzAwMVx1NEU4OFx1NUI5QVx1NkIwNFx1MzA2RVx1OUFEOFx1MzA1NVx1MzA2Qlx1NTQwOFx1MzA4Rlx1MzA1Qlx1MzA4QlxuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1ldmVudHMgLmdjLXJlc291cmNlJylcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFJlc291cmNlSGVhZGluZ0VsZW1lbnQoZWwuZGF0YXNldC5yZXNvdXJjZUlkKS5zdHlsZS5oZWlnaHQgPSBlbC5vZmZzZXRIZWlnaHQgKyAncHgnO1xuICAgICAgICAgICAgfSlcblxuICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtZXZlbnRzIC5nYy1hbGwtZGF5LWV2ZW50cyAuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRXZlbnRMYXlvdXQoZWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEJEXHUzMEZDXHUzMEI5XHUzMDZFXHU4OThCXHU1MUZBXHUzMDU3XHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHJlc291cmNlSWRcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRSZXNvdXJjZUhlYWRpbmdFbGVtZW50KHJlc291cmNlSWQ6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3RcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yKCcuZ2MtcmVzb3VyY2VzIC5nYy1yZXNvdXJjZVtkYXRhLXJlc291cmNlLWlkPVwiJyArIHJlc291cmNlSWQgKyAnXCJdJykgYXMgSFRNTEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1NDA0XHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDZFXHU1RTQ1XHUzMDkyXHUzMEQ0XHUzMEFGXHUzMEJCXHUzMEVCXHUzMDY3XHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFRpbWVTbG90V2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVTbG90V2lkdGggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVTbG90V2lkdGggPSAodGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZS1zbG90JykgYXMgSFRNTEVsZW1lbnQpLm9mZnNldFdpZHRoICsgMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fdGltZVNsb3RXaWR0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTRGNERcdTdGNkVcdTMwNkVcdTk1OEJcdTU5Q0JcdTY2NDJcdTk1OTNcdTMwRkJcdTdENDJcdTRFODZcdTY2NDJcdTk1OTNcdTMwNkVcdTVFNDVcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0VGltZVNsb3QoaW5kZXg6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvcignLmdjLXRpbWUtc2xvdC1saW5lcyAuZ2MtdGltZS1zbG90WycgKyAnZGF0YS1pbmRleD1cIicgKyBpbmRleCArICdcIl0nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwMDFcdTRFMDBcdTMwNjRcdTZCQ0VcdTMwNkVcdTVFNDVcdTMwOTJcdTMwRDRcdTMwQUZcdTMwQkJcdTMwRUJcdTMwNjdcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0RXZlbnRIZWlnaHQoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX2V2ZW50SGVpZ2h0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9ldmVudEhlaWdodCA9ICh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1ldmVudHMgLmdjLWFsbC1kYXktZXZlbnRzIC5nYy1zcGFjZXInKSBhcyBIVE1MRWxlbWVudCkub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9ldmVudEhlaWdodDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcdTMwOTJcdTMwRDRcdTMwQUZcdTMwQkJcdTMwRUJcdTMwNjdcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqIEBwYXJhbSBlbFxuICAgICAqL1xuICAgIHB1YmxpYyB1cGRhdGVFdmVudExheW91dChlbDogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgZWwuc3R5bGUubGVmdCA9IChwYXJzZUludChlbC5kYXRhc2V0LnN0YXJ0KSAqIHRoaXMuZ2V0VGltZVNsb3RXaWR0aCgpKSArICdweCc7XG4gICAgICAgIGVsLnN0eWxlLndpZHRoID0gKChwYXJzZUludChlbC5kYXRhc2V0LmVuZCkgLSBwYXJzZUludChlbC5kYXRhc2V0LnN0YXJ0KSkgKiB0aGlzLmdldFRpbWVTbG90V2lkdGgoKSkgKyAncHgnO1xuICAgICAgICBlbC5zdHlsZS50b3AgPSAocGFyc2VJbnQoZWwuZGF0YXNldC5wb3NpdGlvbikgKiB0aGlzLmdldEV2ZW50SGVpZ2h0KCkpICsgJ3B4JztcbiAgICB9XG59IiwgIi8qKlxuICogRGF0ZVRpbWVTZWxlY3RvclxuICpcbiAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA2RVx1OTA3OFx1NjI5RVx1NkE1Rlx1ODBGRFx1MzA5Mlx1NjNEMFx1NEY5Qlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2Qlx1MzAwMVx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NjRDRFx1NEY1Q1x1MzA2Qlx1MzA4OFx1MzA4Qlx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1NjMwN1x1NUI5QVx1MzA5Mlx1ODg0Q1x1MzA0Nlx1MzAwMlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWxlY3RvciB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2VsZW1lbnRTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA5Mlx1NjMwMVx1MzA2NFx1MzBEN1x1MzBFRFx1MzBEMVx1MzBDNlx1MzBBM1x1NTQwRFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcHJvcGVydHlOYW1lOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3Rpb25TdGFydDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2VsZWN0aW9uRW5kOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEVBXHUzMEJEXHUzMEZDXHUzMEI5SURcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jlc291cmNlSWQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTYzQ0ZcdTc1M0JcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkRyYXc6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA0Q1x1NTkwOVx1NjZGNFx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9tb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fbW91c2VNb3ZlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLl9tb3VzZVVwLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBjb250YWluZXJTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcjogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IGNvbnRhaW5lclNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gZWxlbWVudFNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldEVsZW1lbnRTZWxlY3RvcihlbGVtZW50U2VsZWN0b3I6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudFNlbGVjdG9yID0gZWxlbWVudFNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwOTJcdTYzMDFcdTMwNjRcdTMwRDdcdTMwRURcdTMwRDFcdTMwQzZcdTMwQTNcdTU0MERcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDIoZGF0YS1kYXRlXHUzMDZBXHUzMDg5XHUzMDAxZGF0ZSlcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlOYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldFByb3BlcnR5TmFtZShwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fcHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTYzQ0ZcdTc1M0JcdTMwNTlcdTMwOEJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gb25EcmF3XG4gICAgICovXG4gICAgcHVibGljIG9uRHJhdyhvbkRyYXc6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSA9PiB2b2lkKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9vbkRyYXcgPSBvbkRyYXc7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA0Q1x1NTkwOVx1NjZGNFx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBvblNlbGVjdFxuICAgICAqL1xuICAgIHB1YmxpYyBvblNlbGVjdChvblNlbGVjdDogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9vblNlbGVjdCA9IG9uU2VsZWN0O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gdmFsdWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHNlbGVjdCh2YWx1ZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25TdGFydCA9IHRoaXMuX3NlbGVjdGlvbkVuZCA9IHZhbHVlO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTdENDJcdTRFODZcdTRGNERcdTdGNkVcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gdmFsdWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHNlbGVjdEVuZCh2YWx1ZTogc3RyaW5nKTogU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4OUUzXHU5NjY0XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgcHVibGljIGRlc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNlbGVjdChudWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZWxlY3Rpb24oKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gW3RoaXMuX3NlbGVjdGlvblN0YXJ0LCB0aGlzLl9zZWxlY3Rpb25FbmRdLnNvcnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTczRkVcdTU3MjhcdTMwMDFcdTkwNzhcdTYyOUVcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNTZWxlY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvblN0YXJ0ICE9PSBudWxsICYmIHRoaXMuX3NlbGVjdGlvbkVuZCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTYyQkNcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX21vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9yZXNvdXJjZUlkID0gdGhpcy5waWNrUmVzb3VyY2VJZChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCh2YWx1ZSk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU1MkQ1XHUzMDRCXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZU1vdmUoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RFbmQodmFsdWUpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1OTZFMlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbW91c2VVcChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLmlzU2VsZWN0ZWQoKSkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uU2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uU2VsZWN0KHN0YXJ0LCBlbmQsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHUzMDAxXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIGVsIFx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrVmFsdWUoZWw6IEVsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCh0aGlzLl9lbGVtZW50U2VsZWN0b3IgKyAnOm5vdCguZGlzYWJsZWQpJykgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgID8uZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU4OTgxXHU3RDIwXHUzMDRCXHUzMDg5XHUzMDAxXHUzMEVBXHUzMEJEXHUzMEZDXHUzMEI5SURcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gZWwgXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHUzMEVBXHUzMEJEXHUzMEZDXHUzMEI5SURcbiAgICAgKi9cbiAgICBwdWJsaWMgcGlja1Jlc291cmNlSWQoZWw6IEVsZW1lbnQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCgnW2RhdGEtcmVzb3VyY2UtaWRdJyk/LmRhdGFzZXRbJ3Jlc291cmNlSWQnXSA/PyBudWxsXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU1RUE3XHU2QTE5XHUzMDRCXHUzMDg5XHUzMDAxXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIHggWFx1NUVBN1x1NkExOVxuICAgICAqIEBwYXJhbSB5IFlcdTVFQTdcdTZBMTlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgcGlja1ZhbHVlQnlQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgJyAnICsgdGhpcy5fZWxlbWVudFNlbGVjdG9yKSlcbiAgICAgICAgICAgIC5maWx0ZXIoKGVsOiBIVE1MRWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdC5sZWZ0IDw9IHggJiYgeCA8PSByZWN0LnJpZ2h0ICYmIHJlY3QudG9wIDw9IHkgJiYgeSA8PSByZWN0LmJvdHRvbTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYXQoMCk/LmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gdmFsdWUgXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50fSBcdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RWxlbWVudEJ5VmFsdWUodmFsdWU6IHN0cmluZyk6IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3Rvcih0aGlzLl9jb250YWluZXJTZWxlY3RvciArICcgJyArIHRoaXMuX2VsZW1lbnRTZWxlY3RvciArXG4gICAgICAgICAgICAnW2RhdGEtJyArIHRoaXMuX3Byb3BlcnR5TmFtZSArICc9XCInICsgdmFsdWUgKyAnXCJdJ1xuICAgICAgICApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NjY0Mlx1MzA2RVx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1ODg2OFx1NzkzQVx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5fb25EcmF3KSB7IC8vIFx1NjNDRlx1NzUzQlx1MzA5Mlx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA2N1x1ODg0Q1x1MzA0NlxuICAgICAgICAgICAgY29uc3QgW2JlZ2luLCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vbkRyYXcoYmVnaW4sIGVuZCwgdGhpcy5fcmVzb3VyY2VJZCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IFtiZWdpbiwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICtcbiAgICAgICAgICAgICh0aGlzLl9yZXNvdXJjZUlkICE9PSBudWxsID8gJyBbZGF0YS1yZXNvdXJjZS1pZD1cIicgKyB0aGlzLl9yZXNvdXJjZUlkICsgJ1wiXSAnIDogJyAnKSArXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50U2VsZWN0b3JcbiAgICAgICAgKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gZWwuZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICBpZiAoYmVnaW4gPD0gdmFsdWUgJiYgdmFsdWUgPD0gZW5kKSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1zZWxlY3RlZCcpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn0iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGltZWxpbmVTZWxlY3Rpb24ge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEB0eXBlIHtIVE1MRWxlbWVudH1cbiAgICAgKi9cbiAgICBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTY2NDJcdTk1OTNcdTk2OTRcdTMwNkVcdTVFNDVcdTMwNkVcdTMwRDRcdTMwQUZcdTMwQkJcdTMwRUJcdTUwMjRcbiAgICAgKi9cbiAgICBfdGltZVNsb3RXaWR0aDogbnVtYmVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290XG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1NDA0XHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDZFXHU1RTQ1XHUzMDkyXHUzMEQ0XHUzMEFGXHUzMEJCXHUzMEVCXHUzMDY3XHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFRpbWVTbG90V2lkdGgoKTogbnVtYmVyIHtcbiAgICAgICAgaWYgKHRoaXMuX3RpbWVTbG90V2lkdGggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVTbG90V2lkdGggPSAodGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKCcuZ2MtdGltZS1zbG90JykgYXMgSFRNTEVsZW1lbnQpLm9mZnNldFdpZHRoICsgMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fdGltZVNsb3RXaWR0aDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTYzQ0ZcdTc1M0JcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgZHJhdyhzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgcmVzb3VyY2VJZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlU2VsZWN0aW9uKCk7XG4gICAgICAgIGlmIChzdGFydCAhPT0gbnVsbCAmJiBlbmQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBbc3RhcnRJbnQsIGVuZEludF0gPSBbcGFyc2VJbnQoc3RhcnQpLCBwYXJzZUludChlbmQpXTtcbiAgICAgICAgICAgIGlmIChzdGFydEludCA+IGVuZEludCkge1xuICAgICAgICAgICAgICAgIFtzdGFydEludCwgZW5kSW50XSA9IFtlbmRJbnQsIHN0YXJ0SW50XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU2VsZWN0aW9uRWxlbWVudChzdGFydEludCwgZW5kSW50LCByZXNvdXJjZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1NTI0QVx1OTY2NFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVtb3ZlU2VsZWN0aW9uKCkge1xuICAgICAgICBjb25zdCBlbCA9IHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvcignLmdjLXNlbGVjdGlvbicpO1xuICAgICAgICBpZiAoZWwpIHtcbiAgICAgICAgICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU4MEEyXHUzMDkyXHU0RjVDXHU2MjEwXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVTZWxlY3Rpb25FbGVtZW50KHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyLCByZXNvdXJjZUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY29udGFpbmVyRWwgPSB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1zZWxlY3Rpb24tY29udGFpbmVyJyk7XG4gICAgICAgIGNvbnN0IHJlc291cmNlRWwgPSB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IoJy5nYy1ldmVudHMgLmdjLXJlc291cmNlW2RhdGEtcmVzb3VyY2UtaWQ9XCInICsgcmVzb3VyY2VJZCArICdcIl0nKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWwuY2xhc3NOYW1lID0gJ2djLXNlbGVjdGlvbic7XG4gICAgICAgIGVsLnN0eWxlLmxlZnQgPSAoc3RhcnQgKiB0aGlzLmdldFRpbWVTbG90V2lkdGgoKSkgKyAncHgnO1xuICAgICAgICBlbC5zdHlsZS50b3AgPSByZXNvdXJjZUVsLm9mZnNldFRvcCArICdweCc7XG4gICAgICAgIGVsLnN0eWxlLndpZHRoID0gKChlbmQgLSBzdGFydCArIDEpICogdGhpcy5nZXRUaW1lU2xvdFdpZHRoKCkpICsgJ3B4JztcbiAgICAgICAgZWwuc3R5bGUuaGVpZ2h0ID0gcmVzb3VyY2VFbC5vZmZzZXRIZWlnaHQgKyAncHgnO1xuICAgICAgICBjb250YWluZXJFbC5wcmVwZW5kKGVsKTtcbiAgICB9XG59IiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGVVdGlscyB7XG4gICAgLyoqXG4gICAgICogMVx1NjVFNVx1MzA2RVx1MzBERlx1MzBFQVx1NzlEMlxuICAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBNSUxMSVNFQ09ORFNfUEVSX0RBWSA9IDI0ICogNjAgKiA2MCAqIDEwMDBcblxuICAgIC8qKlxuICAgICAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBkIHtudW1iZXJ9IFx1MzBERlx1MzBFQVx1NzlEMlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9EYXRlU3RyaW5nKGQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAobmV3IERhdGUoZCkpLnRvTG9jYWxlRGF0ZVN0cmluZygnc3YtU0UnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NjY0Mlx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBkIHtudW1iZXJ9IFx1MzBERlx1MzBFQVx1NzlEMlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9EYXRlVGltZVN0cmluZyhkKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIERhdGVVdGlscy50b0RhdGVTdHJpbmcoZCkgKyAnICcgKyAobmV3IERhdGUoZCkpLnRvTG9jYWxlVGltZVN0cmluZyhcImVuLUdCXCIpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMDZCXHU2NUU1XHU2NTcwXHUzMDkyXHU1MkEwXHU3Qjk3XG4gICAgICogQHBhcmFtIGRhdGUge3N0cmluZ30gXHU2NUU1XHU0RUQ4XG4gICAgICogQHBhcmFtIGRheXMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU1MkEwXHU3Qjk3XHU1RjhDXHUzMDZFXHU2NUU1XHU0RUQ4KFx1MzBERlx1MzBFQVx1NzlEMilcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFkZERheXMoZGF0ZTogc3RyaW5nLCBkYXlzOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gRGF0ZS5wYXJzZShkYXRlKSArIGRheXMgKiBEYXRlVXRpbHMuTUlMTElTRUNPTkRTX1BFUl9EQVlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNjhcdTY1RTVcdTRFRDhcdTMwNkVcdTVERUVcdTMwNkVcdTY1RTVcdTY1NzBcdTMwOTJcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICAgICAqIEBwYXJhbSBkYXRlMiB7c3RyaW5nfSBcdTY1RTVcdTRFRDgyXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBkaWZmRGF5cyhkYXRlMTogc3RyaW5nLCBkYXRlMjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGQxID0gbmV3IERhdGUoZGF0ZTEpXG4gICAgICAgIGxldCBkMiA9IG5ldyBEYXRlKGRhdGUyKVxuICAgICAgICBkMS5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgICAgICBkMi5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoZDIuZ2V0VGltZSgpIC0gZDEuZ2V0VGltZSgpKSAvIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNjhcdTY1RTVcdTRFRDhcdTMwNkVcdTVERUVcdTMwOTJtc1x1MzA2N1x1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZJbk1pbGxpc2Vjb25kcyhkYXRlMTogc3RyaW5nLCBkYXRlMjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZTIpIC0gRGF0ZS5wYXJzZShkYXRlMSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MUZcdTk1OTNcdTMwNkVcdTkxQ0RcdTMwNkFcdTMwOEFcdTMwOTJcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgKiBAcGFyYW0gc3RhcnQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMSB7c3RyaW5nfSBcdTY3MUZcdTk1OTMxXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHBhcmFtIHN0YXJ0MiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICogQHBhcmFtIGVuZDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU5MUNEXHUzMDZBXHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBvdmVybGFwUGVyaW9kKHN0YXJ0MSwgZW5kMSwgc3RhcnQyLCBlbmQyKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gc3RhcnQxIDw9IHN0YXJ0MiA/IHN0YXJ0MiA6IHN0YXJ0MVxuICAgICAgICBjb25zdCBlbmQgPSBlbmQxIDw9IGVuZDIgPyBlbmQxIDogZW5kMlxuICAgICAgICByZXR1cm4gc3RhcnQgPD0gZW5kID8gW3N0YXJ0LCBlbmRdIDogW251bGwsIG51bGxdXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXHUzMDAxXHU2NjQyXHU5NTkzXHUzMDAxXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDkyXHU2RTIxXHUzMDU3XHUzMDAxXHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU4RkQ0XHUzMDU5XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0aW1lU2xvdChzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgaW50ZXJ2YWw6IHN0cmluZywgdGltZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKERhdGUucGFyc2UodGltZSA+IGVuZCA/IGVuZCA6IHRpbWUpIC0gRGF0ZS5wYXJzZShzdGFydCkpIC8gcGFyc2VJbnQoaW50ZXJ2YWwpIC8gMTAwMCk7XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vU2VsZWN0b3JcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6ZXIge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2V2ZW50U2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwRkJcdTY2NDJcdTk1OTNcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NlbGVjdG9yOiBTZWxlY3RvciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDhcdTMwQzNcdTMwQzBcdTMwRkNcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYWRDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3Itdy1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM2XHUzMEZDXHUzMEVCXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF90YWlsQ3Vyc29yOiBzdHJpbmcgPSAnZ2MtY3Vyc29yLWUtcmVzaXplJztcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmc6IEhUTUxFbGVtZW50ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdTdGFydDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdFbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkJcdTMwMDFcdTUyNERcdTU2REVcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNUZcdTUwMjRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nVmFsdWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwMDJcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwNENcdTVDMTFcdTMwNkFcdTMwNDRcdTMwNjhcdTMwMDFcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNjhcdTUyMjRcdTY1QURcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTYzQjRcdTMwOTNcdTMwNjBcdTRGNERcdTdGNkVcdUZGMDhcdTY1RTVcdTRFRDhcdUZGMDlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dyYWJiZWQ6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ0hlYWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ1RhaWw6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NzUxRlx1NjIxMFx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25QcmV2aWV3OiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgc2VsZWN0b3I6IFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBDMFx1MzBBNlx1MzBGM1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU5NThCXHU1OUNCXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgRWxlbWVudClcbiAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTU5MDlcdTVGNjJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdIZWFkID0gdGhpcy5faXNHcmFiYmluZ1RhaWwgPSB0cnVlXG4gICAgICAgICAgICBpZiAodGhpcy5oaXRIZWFkKGUudGFyZ2V0IGFzIEVsZW1lbnQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdUYWlsID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpdFRhaWwoZS50YXJnZXQgYXMgRWxlbWVudCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU5NThCXHU1OUNCXHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSBmYWxzZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcbiAgICAgICAgICAgIHRoaXMuX2dyYWJiZWQgPSB0aGlzLl9zZWxlY3Rvci5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KVxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gZWxcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nU3RhcnQgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LnN0YXJ0XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0VuZCA9IHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuZW5kXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1RkYwOFx1ODg2OFx1NzkzQVx1MzA5Mlx1NkQ4OFx1MzA1OVx1RkYwOVxuICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZyh0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmtleSwgdHJ1ZSlcblxuICAgICAgICAgICAgLy8gXHU3M0ZFXHU1NzI4XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ZhbHVlID0gbnVsbFxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyh0aGlzLl9ncmFiYmVkKVxuXG4gICAgICAgICAgICAvLyBcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ3Vyc29yKClcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHU5MUNGXHUzMDkyXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0NvdW50ID0gMFxuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBFMFx1MzBGQ1x1MzBENlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlTW92ZShlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcodmFsdWUpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzA1Rlx1MzA4MVx1MzA2Qlx1NzlGQlx1NTJENVx1OTFDRlx1MzA5Mlx1OEExOFx1OTMzMlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdDb3VudCsrXG5cbiAgICAgICAgICAgIC8vIFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1RlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VVcChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5rZXlcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSlcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0aGlzLl9ncmFiYmVkICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZHJhZyh2YWx1ZSlcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9kcmFnZ2luZ0NvdW50IDwgMykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vblByZXZpZXcodGhpcy5fZHJhZ2dpbmcsIG51bGwsIG51bGwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RHJhZ2dpbmcoa2V5LCBmYWxzZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gbnVsbFxuICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IG51bGxcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ3Vyc29yKClcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RXZlbnRTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2V2ZW50U2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5ODJEXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHU2NjQyXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGN1cnNvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRIZWFkQ3Vyc29yKGN1cnNvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2hlYWRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1NjY0Mlx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjdXJzb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VGFpbEN1cnNvcihjdXJzb3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl90YWlsQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChjYWxsYmFjazogKGtleTogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShjYWxsYmFjazogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU3NTFGXHU2MjEwXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uUHJldmlldyhjYWxsYmFjazogKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25QcmV2aWV3ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNEcmFnZ2luZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyYWdnaW5nICE9PSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRHcmFiYmVkRGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ3JhYmJlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwaWNrRXZlbnQoZWw6IEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCh0aGlzLl9ldmVudFNlbGVjdG9yKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NTIyNFx1NUI5QVx1MzA1OVx1MzA4Qlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGl0SGVhZChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFlbC5jbG9zZXN0KCcuZ2MtaGVhZCcpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRUYWlsKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy10YWlsJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0RHJhZ2dpbmcoa2V5OiBzdHJpbmcsIGRyYWdnaW5nOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9ldmVudFNlbGVjdG9yICsgJ1tkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZcdTUwMjRcdTMwNENcdTY1NzBcdTVCNTdcdTMwNkVcdTMwN0ZcdTMwNjdcdTY5Q0JcdTYyMTBcdTMwNTVcdTMwOENcdTMwNjZcdTMwNDRcdTMwOEJcdTMwNEJcdUZGMUZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNOdW1iZXIodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gL15bMC05XSskLy50ZXN0KHZhbHVlKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2Qlx1NUJGRVx1MzA1N1x1MzA2Nlx1MzAwMVx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTUwMjRcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBkcmFnKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOdW1iZXIodmFsdWUpXG4gICAgICAgICAgICA/IHRoaXMuZHJhZ051bWJlcih2YWx1ZSlcbiAgICAgICAgICAgIDogdGhpcy5kcmFnRGF0ZVRpbWUodmFsdWUpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHUzMDRDXHU2NUU1XHU2NjQyXHUzMDZFXHU1ODM0XHU1NDA4XHUzMDZCXHUzMDAxXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWdEYXRlVGltZSh2YWx1ZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBEYXRlVXRpbHMuZGlmZkluTWlsbGlzZWNvbmRzKHRoaXMuX2dyYWJiZWQsIHZhbHVlKVxuICAgICAgICBsZXQgc3RhcnQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nU3RhcnQpICsgKHRoaXMuX2lzR3JhYmJpbmdIZWFkID8gZGlmZiA6IDApKVxuICAgICAgICBsZXQgZW5kID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZS5wYXJzZSh0aGlzLl9kcmFnZ2luZ0VuZCkgKyAodGhpcy5faXNHcmFiYmluZ1RhaWwgPyBkaWZmIDogMCkpXG4gICAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWQubGVuZ3RoKVxuICAgICAgICBlbmQgPSBlbmQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWQubGVuZ3RoKVxuICAgICAgICBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgICAgICBlbmQgPSBzdGFydFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbc3RhcnQsIGVuZF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRURcdTMwRDFcdTMwQzZcdTMwQTNcdTMwNENcdTY1NzBcdTVCNTdcdTMwNkVcdTU4MzRcdTU0MDhcdTMwNkJcdTMwMDFcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU1MDI0XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZHJhZ051bWJlcih2YWx1ZTogc3RyaW5nKTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBwYXJzZUludCh2YWx1ZSkgLSBwYXJzZUludCh0aGlzLl9ncmFiYmVkKVxuICAgICAgICBsZXQgc3RhcnQgPSBwYXJzZUludCh0aGlzLl9kcmFnZ2luZ1N0YXJ0KSArICh0aGlzLl9pc0dyYWJiaW5nSGVhZCA/IGRpZmYgOiAwKVxuICAgICAgICBsZXQgZW5kID0gcGFyc2VJbnQodGhpcy5fZHJhZ2dpbmdFbmQpICsgKHRoaXMuX2lzR3JhYmJpbmdUYWlsID8gZGlmZiA6IDApXG4gICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGVDdXJzb3IoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLl9oZWFkQ3Vyc29yLCB0aGlzLl90YWlsQ3Vyc29yKVxuICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQgJiYgdGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCgnZ2MtY3Vyc29yLW1vdmUnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQodGhpcy5faGVhZEN1cnNvcilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKHRoaXMuX3RhaWxDdXJzb3IpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVByZXZpZXcodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZHJhZyh2YWx1ZSlcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblByZXZpZXcodGhpcy5fZHJhZ2dpbmcsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ZhbHVlID0gdmFsdWVcbiAgICAgICAgfVxuICAgIH1cbn0iLCAiaW1wb3J0IFRpbWVsaW5lTGF5b3V0IGZyb20gXCIuL21vZHVsZXMvVGltZWxpbmVMYXlvdXQuanNcIjtcbmltcG9ydCBTZWxlY3RvciBmcm9tIFwiLi9tb2R1bGVzL1NlbGVjdG9yLnRzXCI7XG5pbXBvcnQgVGltZWxpbmVTZWxlY3Rpb24gZnJvbSBcIi4vbW9kdWxlcy9UaW1lbGluZVNlbGVjdGlvbi5qc1wiO1xuaW1wb3J0IFJlc2l6ZXIgZnJvbSBcIi4vbW9kdWxlcy9SZXNpemVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpbWVsaW5lKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcbiAgICAgICAgICovXG4gICAgICAgIHRpbWVsaW5lTGF5b3V0OiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIHNlbGVjdG9yOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTYzQ0ZcdTc1M0JcbiAgICAgICAgICovXG4gICAgICAgIHRpbWVsaW5lU2VsZWN0aW9uOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTUyMURcdTY3MUZcdTUzMTZcdTMwNTlcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICAvLyBcdTMwQkZcdTMwQTRcdTMwRTBcdTMwRTlcdTMwQTRcdTMwRjNcdTMwNkVcdTMwRUNcdTMwQTRcdTMwQTJcdTMwQTZcdTMwQzhcbiAgICAgICAgICAgIHRoaXMudGltZWxpbmVMYXlvdXQgPSBuZXcgVGltZWxpbmVMYXlvdXQodGhpcy4kZWwpO1xuICAgICAgICAgICAgdGhpcy50aW1lbGluZUxheW91dC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy4kbmV4dFRpY2soKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZWxpbmVMYXlvdXQudXBkYXRlTGF5b3V0KCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU2M0NGXHU3NTNCXG4gICAgICAgICAgICB0aGlzLnRpbWVsaW5lU2VsZWN0aW9uID0gbmV3IFRpbWVsaW5lU2VsZWN0aW9uKHRoaXMuJGVsKTtcblxuICAgICAgICAgICAgLy8gXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yID0gbmV3IFNlbGVjdG9yKHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLW1haW4nKVxuICAgICAgICAgICAgICAgIC5zZXRFbGVtZW50U2VsZWN0b3IoJy5nYy10aW1lLXNsb3QnKVxuICAgICAgICAgICAgICAgIC5zZXRQcm9wZXJ0eU5hbWUoJ2luZGV4JylcbiAgICAgICAgICAgICAgICAub25EcmF3KChzdGFydCwgZW5kLCByZXNvdXJjZUlkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGltZWxpbmVTZWxlY3Rpb24uZHJhdyhzdGFydCwgZW5kLCByZXNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vblNlbGVjdCgoc3RhcnQsIGVuZCwgcmVzb3VyY2VJZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRGF0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGltZWxpbmVMYXlvdXQuZ2V0VGltZVNsb3Qoc3RhcnQpLmRhdGFzZXQudGltZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGltZWxpbmVMYXlvdXQuZ2V0VGltZVNsb3QoZW5kKS5kYXRhc2V0LnRpbWVFbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvdXJjZUlkXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1xuICAgICAgICAgICAgdGhpcy5yZXNpemVyID0gbmV3IFJlc2l6ZXIodGhpcy4kZWwsIHRoaXMuc2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtbWFpbicpXG4gICAgICAgICAgICAgICAgLnNldEV2ZW50U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAgICAgLnNldEhlYWRDdXJzb3IoJ2djLWN1cnNvci13LXJlc2l6ZScpXG4gICAgICAgICAgICAgICAgLnNldFRhaWxDdXJzb3IoJ2djLWN1cnNvci1lLXJlc2l6ZScpXG4gICAgICAgICAgICAgICAgLm9uTW92ZSgoa2V5LCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUV2ZW50KGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub25FdmVudCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uUHJldmlldygoZWwsIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWwuZGF0YXNldC5zdGFydCA9IHN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICBlbC5kYXRhc2V0LmVuZCA9IGVuZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lbGluZUxheW91dC51cGRhdGVFdmVudExheW91dChlbCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlxuICAgICAgICAgICAgdGhpcy5yZXNpemVyLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9yLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG5cbiAgICAgICAgICAgIC8vIExpdmV3aXJlXHUzMDRCXHUzMDg5XHUzMDZFXHU1RjM3XHU1MjM2XHU2NkY0XHU2NUIwXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICAgICAgICBMaXZld2lyZS5vbigncmVmcmVzaENhbGVuZGFyJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJG5leHRUaWNrKCgpID0+IHRoaXMudGltZWxpbmVMYXlvdXQudXBkYXRlTGF5b3V0KCkpXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTlcdTMwOEJcbiAgICAgICAgICovXG4gICAgICAgIG1vdmVFdmVudChrZXksIHN0YXJ0LCBlbmQpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmdjLWV2ZW50cyBbZGF0YS1rZXk9XCInICsga2V5ICsgJ1wiXScpO1xuICAgICAgICAgICAgY29uc3QgdGltZSA9IHRoaXMudGltZWxpbmVMYXlvdXQuZ2V0VGltZVNsb3Qoc3RhcnQpLmRhdGFzZXQudGltZTtcbiAgICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLnRpbWVsaW5lTGF5b3V0LmdldFRpbWVTbG90KGVuZCAtIDEpLmRhdGFzZXQudGltZUVuZDtcbiAgICAgICAgICAgIGlmIChlbC5kYXRhc2V0LmFsbERheSA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCB0aW1lLnN1YnN0cmluZygwLCAxMCkgKyAnIDAwOjAwOjAwJywgZW5kVGltZS5zdWJzdHJpbmcoMCwgMTApICsgJyAyMzo1OTo1OScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHRpbWUsIGVuZFRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7O0FBQUEsSUFBcUIsaUJBQXJCLE1BQW9DO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQXFCaEMsWUFBWSxNQUFtQjtBQWhCL0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUtBO0FBQUE7QUFBQTtBQUFBLDBDQUF5QjtBQUt6QjtBQUFBO0FBQUE7QUFBQSx3Q0FBdUI7QUFPbkIsU0FBSyxRQUFRO0FBQ2IsU0FBSyxLQUFLO0FBQUEsRUFDZDtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS1EsT0FBTztBQUFBLEVBQ2Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtPLG9CQUFvQjtBQUN2QixXQUFPLGlCQUFpQixVQUFVLEtBQUssVUFBVSxLQUFLLElBQUksQ0FBQztBQUFBLEVBQy9EO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLUSxZQUFZO0FBQ2hCLFNBQUssYUFBYTtBQUFBLEVBQ3RCO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUFLTyxlQUFlO0FBRWxCLFNBQUssTUFBTSxpQkFBaUIseUJBQXlCLEVBQ2hELFFBQVEsQ0FBQyxPQUFvQjtBQUMxQixXQUFLLDBCQUEwQixHQUFHLFFBQVEsVUFBVSxFQUFFLE1BQU0sU0FBUyxHQUFHLGVBQWU7QUFBQSxJQUMzRixDQUFDO0FBR0wsU0FBSyxNQUFNLGlCQUFpQiwyREFBMkQsRUFDbEYsUUFBUSxDQUFDLE9BQW9CO0FBQzFCLFdBQUssa0JBQWtCLEVBQUU7QUFBQSxJQUM3QixDQUFDO0FBQUEsRUFD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
