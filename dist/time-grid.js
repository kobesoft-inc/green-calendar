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
     * ホバー中の終日予定の要素
     */
    __publicField(this, "_hover", null);
    /**
     * 終日予定をクリックした時の処理
     */
    __publicField(this, "_onEvent");
    /**
     * 終日予定を移動した時の処理
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
   * 終日予定を取得
   * @param el {HTMLElement} DOM要素
   * @returns {null|HTMLElement} 予定のDOM要素またはnull
   */
  pickEvent(el) {
    return this._root.contains(el) && el.closest(this._containerSelector) ? el.closest(".gc-timed-event-container") : null;
  }
  /**
   * 指定された終日予定のホバーを設定する
   * @param key {string} 終日予定のキー
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
   * ドラッグ中の終日予定のプレビューを表示
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
    return [slots[start], end - start];
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
   * ドラッグ中の終日予定をプレビューに合わせる
   * @param el {HTMLElement} 予定のDOM要素
   * @param timeSlotHeight {number} スロット数
   */
  adjustPreview(el, timeSlotHeight) {
    el.classList.remove("gc-dragging");
    el.style.setProperty("--gc-span", "calc(" + timeSlotHeight * 100 + "% + " + (timeSlotHeight - 1) + "px)");
    return el;
  }
  /**
   * 終日予定のプレビューを削除
   */
  removePreview() {
    Array.from(this._root.querySelectorAll(".gc-timed-event-preview")).forEach((el) => el.parentNode.replaceChild(el.cloneNode(false), el));
  }
};

// resources/js/time-grid.js
function TimeGrid() {
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
      this.dateSelector = new Selector(this.$el).setContainerSelector(".gc-all-day-section").setElementSelector(".gc-day").setPropertyName("date").onSelect((start, end, resourceId) => {
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59", resourceId);
      });
      this.timeSelector = new Selector(this.$el).setContainerSelector(".gc-timed-section").setElementSelector(".gc-slot").setPropertyName("time").onSelect((start, end, resourceId) => {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvU2VsZWN0b3IudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF0ZVV0aWxzLnRzIiwgIi4uL3Jlc291cmNlcy9qcy9tb2R1bGVzL1Jlc2l6ZXIudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvQWxsRGF5RXZlbnQudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvVGltZWRHcmlkVGltZWRFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvdGltZS1ncmlkLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIERhdGVUaW1lU2VsZWN0b3JcbiAqXG4gKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwNkVcdTkwNzhcdTYyOUVcdTZBNUZcdTgwRkRcdTMwOTJcdTYzRDBcdTRGOUJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkJcdTMwMDFcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTY0Q0RcdTRGNUNcdTMwNkJcdTMwODhcdTMwOEJcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTYzMDdcdTVCOUFcdTMwOTJcdTg4NENcdTMwNDZcdTMwMDJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0b3Ige1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX2NvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9lbGVtZW50U2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwOTJcdTYzMDFcdTMwNjRcdTMwRDdcdTMwRURcdTMwRDFcdTMwQzZcdTMwQTNcdTU0MERcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Byb3BlcnR5TmFtZTogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfc2VsZWN0aW9uU3RhcnQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTdENDJcdTRFODZcdTRGNERcdTdGNkVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NlbGVjdGlvbkVuZDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBFQVx1MzBCRFx1MzBGQ1x1MzBCOUlEXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZXNvdXJjZUlkOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU2M0NGXHU3NTNCXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25EcmF3OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNENcdTU5MDlcdTY2RjRcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uU2VsZWN0OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCkge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fbW91c2VEb3duLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMuX21vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fbW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVyU2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBjb250YWluZXJTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGVsZW1lbnRTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRFbGVtZW50U2VsZWN0b3IoZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX2VsZW1lbnRTZWxlY3RvciA9IGVsZW1lbnRTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyKGRhdGEtZGF0ZVx1MzA2QVx1MzA4OVx1MzAwMWRhdGUpXG4gICAgICogQHBhcmFtIHByb3BlcnR5TmFtZVxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRQcm9wZXJ0eU5hbWUocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX3Byb3BlcnR5TmFtZSA9IHByb3BlcnR5TmFtZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU2M0NGXHU3NTNCXHUzMDU5XHUzMDhCXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIG9uRHJhd1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkRyYXcob25EcmF3OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcsIHJlc291cmNlSWQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25EcmF3ID0gb25EcmF3O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNENcdTU5MDlcdTY2RjRcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gb25TZWxlY3RcbiAgICAgKi9cbiAgICBwdWJsaWMgb25TZWxlY3Qob25TZWxlY3Q6IChiZWdpbjogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fb25TZWxlY3QgPSBvblNlbGVjdDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3QodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uU3RhcnQgPSB0aGlzLl9zZWxlY3Rpb25FbmQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3RFbmQodmFsdWU6IHN0cmluZyk6IFNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uRW5kID0gdmFsdWU7XG4gICAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA5Mlx1ODlFM1x1OTY2NFx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXNlbGVjdCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3QobnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2VsZWN0aW9uKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLl9zZWxlY3Rpb25TdGFydCwgdGhpcy5fc2VsZWN0aW9uRW5kXS5zb3J0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3M0ZFXHU1NzI4XHUzMDAxXHU5MDc4XHU2MjlFXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgcHVibGljIGlzU2VsZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb25TdGFydCAhPT0gbnVsbCAmJiB0aGlzLl9zZWxlY3Rpb25FbmQgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU2MkJDXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fcmVzb3VyY2VJZCA9IHRoaXMucGlja1Jlc291cmNlSWQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QodmFsdWUpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzA5Mlx1NTJENVx1MzA0Qlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfbW91c2VNb3ZlKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RW5kKHZhbHVlKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTk2RTJcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX21vdXNlVXAoZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vblNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vblNlbGVjdChzdGFydCwgZW5kLCB0aGlzLl9yZXNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFx1MzA0Qlx1MzA4OVx1MzAwMVx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSBlbCBcdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgcGlja1ZhbHVlKGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IpXG4gICAgICAgICAgICA/IGVsLmNsb3Nlc3QodGhpcy5fZWxlbWVudFNlbGVjdG9yICsgJzpub3QoLmRpc2FibGVkKScpIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICA/LmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1ODk4MVx1N0QyMFx1MzA0Qlx1MzA4OVx1MzAwMVx1MzBFQVx1MzBCRFx1MzBGQ1x1MzBCOUlEXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIGVsIFx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1MzBFQVx1MzBCRFx1MzBGQ1x1MzBCOUlEXG4gICAgICovXG4gICAgcHVibGljIHBpY2tSZXNvdXJjZUlkKGVsOiBFbGVtZW50KTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IpXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICA/IGVsLmNsb3Nlc3QoJ1tkYXRhLXJlc291cmNlLWlkXScpPy5kYXRhc2V0WydyZXNvdXJjZUlkJ10gPz8gbnVsbFxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1NUVBN1x1NkExOVx1MzA0Qlx1MzA4OVx1MzAwMVx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSB4IFhcdTVFQTdcdTZBMTlcbiAgICAgKiBAcGFyYW0geSBZXHU1RUE3XHU2QTE5XG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHBpY2tWYWx1ZUJ5UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9jb250YWluZXJTZWxlY3RvciArICcgJyArIHRoaXMuX2VsZW1lbnRTZWxlY3RvcikpXG4gICAgICAgICAgICAuZmlsdGVyKChlbDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY3QubGVmdCA8PSB4ICYmIHggPD0gcmVjdC5yaWdodCAmJiByZWN0LnRvcCA8PSB5ICYmIHkgPD0gcmVjdC5ib3R0b207XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmF0KDApPy5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU2M0EyXHUzMDU5XHUzMDAyXG4gICAgICogQHBhcmFtIHZhbHVlIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudH0gXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHVibGljIGdldEVsZW1lbnRCeVZhbHVlKHZhbHVlOiBzdHJpbmcpOiBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3IodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IgK1xuICAgICAgICAgICAgJ1tkYXRhLScgKyB0aGlzLl9wcm9wZXJ0eU5hbWUgKyAnPVwiJyArIHZhbHVlICsgJ1wiXSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTY2NDJcdTMwNkVcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTg4NjhcdTc5M0FcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX29uRHJhdykgeyAvLyBcdTYzQ0ZcdTc1M0JcdTMwOTJcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwNjdcdTg4NENcdTMwNDZcbiAgICAgICAgICAgIGNvbnN0IFtiZWdpbiwgZW5kXSA9IHRoaXMuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fb25EcmF3KGJlZ2luLCBlbmQsIHRoaXMuX3Jlc291cmNlSWQpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBbYmVnaW4sIGVuZF0gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciArXG4gICAgICAgICAgICAodGhpcy5fcmVzb3VyY2VJZCAhPT0gbnVsbCA/ICcgW2RhdGEtcmVzb3VyY2UtaWQ9XCInICsgdGhpcy5fcmVzb3VyY2VJZCArICdcIl0gJyA6ICcgJykgK1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudFNlbGVjdG9yXG4gICAgICAgICkuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGVsLmRhdGFzZXRbdGhpcy5fcHJvcGVydHlOYW1lXVxuICAgICAgICAgICAgaWYgKGJlZ2luIDw9IHZhbHVlICYmIHZhbHVlIDw9IGVuZCkge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXNlbGVjdGVkJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59IiwgImV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGVVdGlscyB7XG4gICAgLyoqXG4gICAgICogMVx1NjVFNVx1MzA2RVx1MzBERlx1MzBFQVx1NzlEMlxuICAgICAqL1xuICAgIHN0YXRpYyByZWFkb25seSBNSUxMSVNFQ09ORFNfUEVSX0RBWSA9IDI0ICogNjAgKiA2MCAqIDEwMDBcblxuICAgIC8qKlxuICAgICAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBkIHtudW1iZXJ9IFx1MzBERlx1MzBFQVx1NzlEMlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9EYXRlU3RyaW5nKGQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAobmV3IERhdGUoZCkpLnRvTG9jYWxlRGF0ZVN0cmluZygnc3YtU0UnKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERlx1MzBFQVx1NzlEMlx1MzA5Mlx1NjVFNVx1NjY0Mlx1NjU4N1x1NUI1N1x1NTIxN1x1MzA2Qlx1NTkwOVx1NjNEQlx1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSBkIHtudW1iZXJ9IFx1MzBERlx1MzBFQVx1NzlEMlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1NjU4N1x1NUI1N1x1NTIxN1xuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgdG9EYXRlVGltZVN0cmluZyhkKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIERhdGVVdGlscy50b0RhdGVTdHJpbmcoZCkgKyAnICcgKyAobmV3IERhdGUoZCkpLnRvTG9jYWxlVGltZVN0cmluZyhcImVuLUdCXCIpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMDZCXHU2NUU1XHU2NTcwXHUzMDkyXHU1MkEwXHU3Qjk3XG4gICAgICogQHBhcmFtIGRhdGUge3N0cmluZ30gXHU2NUU1XHU0RUQ4XG4gICAgICogQHBhcmFtIGRheXMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU1MkEwXHU3Qjk3XHU1RjhDXHUzMDZFXHU2NUU1XHU0RUQ4KFx1MzBERlx1MzBFQVx1NzlEMilcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGFkZERheXMoZGF0ZTogc3RyaW5nLCBkYXlzOiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gRGF0ZS5wYXJzZShkYXRlKSArIGRheXMgKiBEYXRlVXRpbHMuTUlMTElTRUNPTkRTX1BFUl9EQVlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNjhcdTY1RTVcdTRFRDhcdTMwNkVcdTVERUVcdTMwNkVcdTY1RTVcdTY1NzBcdTMwOTJcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgKiBAcGFyYW0gZGF0ZTEge3N0cmluZ30gXHU2NUU1XHU0RUQ4MVxuICAgICAqIEBwYXJhbSBkYXRlMiB7c3RyaW5nfSBcdTY1RTVcdTRFRDgyXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHU2NUU1XHU2NTcwXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBkaWZmRGF5cyhkYXRlMTogc3RyaW5nLCBkYXRlMjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgbGV0IGQxID0gbmV3IERhdGUoZGF0ZTEpXG4gICAgICAgIGxldCBkMiA9IG5ldyBEYXRlKGRhdGUyKVxuICAgICAgICBkMS5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgICAgICBkMi5zZXRIb3VycygwLCAwLCAwLCAwKVxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoZDIuZ2V0VGltZSgpIC0gZDEuZ2V0VGltZSgpKSAvIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNjhcdTY1RTVcdTRFRDhcdTMwNkVcdTVERUVcdTMwOTJtc1x1MzA2N1x1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZJbk1pbGxpc2Vjb25kcyhkYXRlMTogc3RyaW5nLCBkYXRlMjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIERhdGUucGFyc2UoZGF0ZTIpIC0gRGF0ZS5wYXJzZShkYXRlMSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY3MUZcdTk1OTNcdTMwNkVcdTkxQ0RcdTMwNkFcdTMwOEFcdTMwOTJcdTZDNDJcdTMwODFcdTMwOEJcbiAgICAgKiBAcGFyYW0gc3RhcnQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMSB7c3RyaW5nfSBcdTY3MUZcdTk1OTMxXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHBhcmFtIHN0YXJ0MiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICogQHBhcmFtIGVuZDIge3N0cmluZ30gXHU2NzFGXHU5NTkzMlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU5MUNEXHUzMDZBXHUzMDYzXHUzMDY2XHUzMDQ0XHUzMDhCXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBvdmVybGFwUGVyaW9kKHN0YXJ0MSwgZW5kMSwgc3RhcnQyLCBlbmQyKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0ID0gc3RhcnQxIDw9IHN0YXJ0MiA/IHN0YXJ0MiA6IHN0YXJ0MVxuICAgICAgICBjb25zdCBlbmQgPSBlbmQxIDw9IGVuZDIgPyBlbmQxIDogZW5kMlxuICAgICAgICByZXR1cm4gc3RhcnQgPD0gZW5kID8gW3N0YXJ0LCBlbmRdIDogW251bGwsIG51bGxdXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXHUzMDAxXHU2NjQyXHU5NTkzXHUzMDAxXHU2NjQyXHU5NTkzXHU5NTkzXHU5Njk0XHUzMDkyXHU2RTIxXHUzMDU3XHUzMDAxXHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU4RkQ0XHUzMDU5XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0aW1lU2xvdChzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZywgaW50ZXJ2YWw6IHN0cmluZywgdGltZTogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKERhdGUucGFyc2UodGltZSA+IGVuZCA/IGVuZCA6IHRpbWUpIC0gRGF0ZS5wYXJzZShzdGFydCkpIC8gcGFyc2VJbnQoaW50ZXJ2YWwpIC8gMTAwMCk7XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vU2VsZWN0b3JcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6ZXIge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2V2ZW50U2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwRkJcdTY2NDJcdTk1OTNcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NlbGVjdG9yOiBTZWxlY3RvciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDhcdTMwQzNcdTMwQzBcdTMwRkNcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hlYWRDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3Itdy1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM2XHUzMEZDXHUzMEVCXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF90YWlsQ3Vyc29yOiBzdHJpbmcgPSAnZ2MtY3Vyc29yLWUtcmVzaXplJztcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmc6IEhUTUxFbGVtZW50ID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdTdGFydDogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NTIxRFx1NjcxRlx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZHJhZ2dpbmdFbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkJcdTMwMDFcdTUyNERcdTU2REVcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNUZcdTUwMjRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nVmFsdWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwMDJcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwNENcdTVDMTFcdTMwNkFcdTMwNDRcdTMwNjhcdTMwMDFcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNjhcdTUyMjRcdTY1QURcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2RyYWdnaW5nQ291bnQ6IG51bWJlciA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTYzQjRcdTMwOTNcdTMwNjBcdTRGNERcdTdGNkVcdUZGMDhcdTY1RTVcdTRFRDhcdUZGMDlcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2dyYWJiZWQ6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ0hlYWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaXNHcmFiYmluZ1RhaWw6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NzUxRlx1NjIxMFx1MzA1OVx1MzA4Qlx1NTFFNlx1NzQwNlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25QcmV2aWV3OiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihyb290OiBIVE1MRWxlbWVudCwgc2VsZWN0b3I6IFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLl9vbk1vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5fb25Nb3VzZVVwLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBDMFx1MzBBNlx1MzBGM1x1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU5NThCXHU1OUNCXHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrRXZlbnQoZS50YXJnZXQgYXMgRWxlbWVudClcbiAgICAgICAgaWYgKGVsKSB7XG4gICAgICAgICAgICAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTU5MDlcdTVGNjJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdIZWFkID0gdGhpcy5faXNHcmFiYmluZ1RhaWwgPSB0cnVlXG4gICAgICAgICAgICBpZiAodGhpcy5oaXRIZWFkKGUudGFyZ2V0IGFzIEVsZW1lbnQpKSB7IC8vIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1NTgzNFx1NTQwOFx1MzAwMVx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA2Rlx1NTZGQVx1NUI5QVxuICAgICAgICAgICAgICAgIHRoaXMuX2lzR3JhYmJpbmdUYWlsID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpdFRhaWwoZS50YXJnZXQgYXMgRWxlbWVudCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU5NThCXHU1OUNCXHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSBmYWxzZVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBcdTYzQjRcdTMwOTNcdTMwNjBcdTY1RTVcdTRFRDhcbiAgICAgICAgICAgIHRoaXMuX2dyYWJiZWQgPSB0aGlzLl9zZWxlY3Rvci5waWNrVmFsdWVCeVBvc2l0aW9uKGUueCwgZS55KVxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gZWxcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nU3RhcnQgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LnN0YXJ0XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0VuZCA9IHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuZW5kXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRlx1MzBFOVx1MzBCOVx1MzA5Mlx1OEEyRFx1NUI5QVx1RkYwOFx1ODg2OFx1NzkzQVx1MzA5Mlx1NkQ4OFx1MzA1OVx1RkYwOVxuICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZyh0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmtleSwgdHJ1ZSlcblxuICAgICAgICAgICAgLy8gXHU3M0ZFXHU1NzI4XHUzMDZFXHU2NUU1XHU0RUQ4XHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ZhbHVlID0gbnVsbFxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUHJldmlldyh0aGlzLl9ncmFiYmVkKVxuXG4gICAgICAgICAgICAvLyBcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ3Vyc29yKClcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHU5MUNGXHUzMDkyXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0NvdW50ID0gMFxuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBFMFx1MzBGQ1x1MzBENlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEBwYXJhbSBlIHtNb3VzZUV2ZW50fSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XHUzMDU3XHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdXNlTW92ZShlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tWYWx1ZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcodmFsdWUpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFx1MzBERVx1MzBBNlx1MzBCOVx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzA1Rlx1MzA4MVx1MzA2Qlx1NzlGQlx1NTJENVx1OTFDRlx1MzA5Mlx1OEExOFx1OTMzMlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdDb3VudCsrXG5cbiAgICAgICAgICAgIC8vIFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1RlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMEEyXHUzMEMzXHUzMEQ3XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VVcChlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZykge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gdGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5rZXlcbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fc2VsZWN0b3IucGlja1ZhbHVlQnlQb3NpdGlvbihlLngsIGUueSlcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiB0aGlzLl9ncmFiYmVkICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZHJhZyh2YWx1ZSlcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9kcmFnZ2luZ0NvdW50IDwgMykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uUHJldmlldykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vblByZXZpZXcodGhpcy5fZHJhZ2dpbmcsIG51bGwsIG51bGwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RHJhZ2dpbmcoa2V5LCBmYWxzZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nID0gbnVsbFxuICAgICAgICAgICAgdGhpcy5faXNHcmFiYmluZ0hlYWQgPSB0aGlzLl9pc0dyYWJiaW5nVGFpbCA9IG51bGxcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ3Vyc29yKClcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0RXZlbnRTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2V2ZW50U2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5ODJEXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHU2NjQyXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGN1cnNvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRIZWFkQ3Vyc29yKGN1cnNvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2hlYWRDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1NjY0Mlx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjdXJzb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0VGFpbEN1cnNvcihjdXJzb3I6IHN0cmluZyk6IHRoaXMge1xuICAgICAgICB0aGlzLl90YWlsQ3Vyc29yID0gY3Vyc29yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChjYWxsYmFjazogKGtleTogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShjYWxsYmFjazogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vbk1vdmUgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU3NTFGXHU2MjEwXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uUHJldmlldyhjYWxsYmFjazogKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25QcmV2aWV3ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwdWJsaWMgaXNEcmFnZ2luZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RyYWdnaW5nICE9PSBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjNCNFx1MzA5M1x1MzA2MFx1NjVFNVx1NEVEOFx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRHcmFiYmVkRGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ3JhYmJlZDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwaWNrRXZlbnQoZWw6IEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCh0aGlzLl9ldmVudFNlbGVjdG9yKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NTIyNFx1NUI5QVx1MzA1OVx1MzA4Qlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGl0SGVhZChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFlbC5jbG9zZXN0KCcuZ2MtaGVhZCcpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRUYWlsKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy10YWlsJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0RHJhZ2dpbmcoa2V5OiBzdHJpbmcsIGRyYWdnaW5nOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9ldmVudFNlbGVjdG9yICsgJ1tkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZcdTUwMjRcdTMwNENcdTY1NzBcdTVCNTdcdTMwNkVcdTMwN0ZcdTMwNjdcdTY5Q0JcdTYyMTBcdTMwNTVcdTMwOENcdTMwNjZcdTMwNDRcdTMwOEJcdTMwNEJcdUZGMUZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaXNOdW1iZXIodmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gL15bMC05XSskLy50ZXN0KHZhbHVlKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2Qlx1NUJGRVx1MzA1N1x1MzA2Nlx1MzAwMVx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1x1MzA5Mlx1NTNENlx1NUY5N1x1MzA1OVx1MzA4QlxuICAgICAqIEBwYXJhbSB2YWx1ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTUwMjRcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBkcmFnKHZhbHVlOiBzdHJpbmcpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNOdW1iZXIodmFsdWUpXG4gICAgICAgICAgICA/IHRoaXMuZHJhZ051bWJlcih2YWx1ZSlcbiAgICAgICAgICAgIDogdGhpcy5kcmFnRGF0ZVRpbWUodmFsdWUpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHUzMDRDXHU2NUU1XHU2NjQyXHUzMDZFXHU1ODM0XHU1NDA4XHUzMDZCXHUzMDAxXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXHUzMDkyXHU1M0Q2XHU1Rjk3XHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIHZhbHVlIHtzdHJpbmd9IFx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NEY0RFx1N0Y2RVx1MzA2RVx1NjVFNVx1NEVEOFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU1OTA5XHU2NkY0XHU1RjhDXHUzMDZFXHU2NzFGXHU5NTkzXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGRyYWdEYXRlVGltZSh2YWx1ZTogc3RyaW5nKTogQXJyYXk8YW55PiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBEYXRlVXRpbHMuZGlmZkluTWlsbGlzZWNvbmRzKHRoaXMuX2dyYWJiZWQsIHZhbHVlKVxuICAgICAgICBsZXQgc3RhcnQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nU3RhcnQpICsgKHRoaXMuX2lzR3JhYmJpbmdIZWFkID8gZGlmZiA6IDApKVxuICAgICAgICBsZXQgZW5kID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZS5wYXJzZSh0aGlzLl9kcmFnZ2luZ0VuZCkgKyAodGhpcy5faXNHcmFiYmluZ1RhaWwgPyBkaWZmIDogMCkpXG4gICAgICAgIHN0YXJ0ID0gc3RhcnQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWQubGVuZ3RoKVxuICAgICAgICBlbmQgPSBlbmQuc3Vic3RyaW5nKDAsIHRoaXMuX2dyYWJiZWQubGVuZ3RoKVxuICAgICAgICBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nSGVhZCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgICAgICBlbmQgPSBzdGFydFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbc3RhcnQsIGVuZF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRURcdTMwRDFcdTMwQzZcdTMwQTNcdTMwNENcdTY1NzBcdTVCNTdcdTMwNkVcdTU4MzRcdTU0MDhcdTMwNkJcdTMwMDFcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTY3MUZcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU1MDI0XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZHJhZ051bWJlcih2YWx1ZTogc3RyaW5nKTogQXJyYXk8bnVtYmVyPiB7XG4gICAgICAgIGNvbnN0IGRpZmYgPSBwYXJzZUludCh2YWx1ZSkgLSBwYXJzZUludCh0aGlzLl9ncmFiYmVkKVxuICAgICAgICBsZXQgc3RhcnQgPSBwYXJzZUludCh0aGlzLl9kcmFnZ2luZ1N0YXJ0KSArICh0aGlzLl9pc0dyYWJiaW5nSGVhZCA/IGRpZmYgOiAwKVxuICAgICAgICBsZXQgZW5kID0gcGFyc2VJbnQodGhpcy5fZHJhZ2dpbmdFbmQpICsgKHRoaXMuX2lzR3JhYmJpbmdUYWlsID8gZGlmZiA6IDApXG4gICAgICAgIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBlbmRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzdGFydCwgZW5kXVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1NjZGNFx1NjVCMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCB1cGRhdGVDdXJzb3IoKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LnJlbW92ZSh0aGlzLl9oZWFkQ3Vyc29yLCB0aGlzLl90YWlsQ3Vyc29yKVxuICAgICAgICBpZiAodGhpcy5faXNHcmFiYmluZ0hlYWQgJiYgdGhpcy5faXNHcmFiYmluZ1RhaWwpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCgnZ2MtY3Vyc29yLW1vdmUnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzR3JhYmJpbmdIZWFkKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQodGhpcy5faGVhZEN1cnNvcilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc0dyYWJiaW5nVGFpbCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5jbGFzc0xpc3QuYWRkKHRoaXMuX3RhaWxDdXJzb3IpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gdmFsdWUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVByZXZpZXcodmFsdWU6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5fZHJhZ2dpbmdWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZHJhZyh2YWx1ZSlcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblByZXZpZXcodGhpcy5fZHJhZ2dpbmcsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ZhbHVlID0gdmFsdWVcbiAgICAgICAgfVxuICAgIH1cbn0iLCAiaW1wb3J0IFNlbGVjdG9yIGZyb20gXCIuL1NlbGVjdG9yXCI7XG5pbXBvcnQgUmVzaXplciBmcm9tIFwiLi9SZXNpemVyXCI7XG5pbXBvcnQgRGF0ZVV0aWxzIGZyb20gXCIuL0RhdGVVdGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbGxEYXlFdmVudCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2NvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kYXRlU2VsZWN0b3I6IFNlbGVjdG9yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBfcmVzaXplcjogUmVzaXplciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREJcdTMwRDBcdTMwRkNcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTg5ODFcdTdEMjBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2hvdmVyOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICogQHBhcmFtIGRhdGVTZWxlY3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCBkYXRlU2VsZWN0b3I6IFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgICB0aGlzLl9kYXRlU2VsZWN0b3IgPSBkYXRlU2VsZWN0b3I7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NTIxRFx1NjcxRlx1NTMxNlxuICAgICAqL1xuICAgIHB1YmxpYyBpbml0KCkge1xuICAgICAgICB0aGlzLl9yZXNpemVyID0gbmV3IFJlc2l6ZXIodGhpcy5fcm9vdCwgdGhpcy5fZGF0ZVNlbGVjdG9yKVxuICAgICAgICAgICAgLnNldEV2ZW50U2VsZWN0b3IoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICAuc2V0SGVhZEN1cnNvcignZ2MtY3Vyc29yLXctcmVzaXplJylcbiAgICAgICAgICAgIC5zZXRUYWlsQ3Vyc29yKCdnYy1jdXJzb3ItZS1yZXNpemUnKVxuICAgICAgICAgICAgLm9uRXZlbnQoKGtleTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub25Nb3ZlKChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25Nb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uTW92ZShrZXksIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub25QcmV2aWV3KChlbDogSFRNTEVsZW1lbnQsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVQcmV2aWV3KCk7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0ICYmIGVuZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVByZXZpZXcoZWwsIHN0YXJ0LCBlbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA2RVx1MzBERVx1MzBBNlx1MzBCOVx1MzBEQlx1MzBEMFx1MzBGQ1x1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBlIHtFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZU92ZXIoZTogRXZlbnQpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuX3Jlc2l6ZXIuaXNEcmFnZ2luZygpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIFx1N0Q0Mlx1NjVFNVx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzAwMVx1NjVFNVx1NEVEOFx1MzA2RVx1OTA3OFx1NjI5RVx1NTFFNlx1NzQwNlx1NEUyRFx1MzA2Rlx1MzAwMVx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1N1x1MzA2QVx1MzA0NFxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsID0gdGhpcy5waWNrQWxsRGF5RXZlbnQoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQsIHRydWUpO1xuICAgICAgICBjb25zdCBrZXkgPSBlbCA/IGVsLmRhdGFzZXQua2V5IDogbnVsbDtcbiAgICAgICAgaWYgKGtleSAhPT0gdGhpcy5faG92ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLl9ob3ZlciwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuX2hvdmVyID0ga2V5LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBjb250YWluZXJTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcjogc3RyaW5nKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9yZXNpemVyLnNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBjb250YWluZXJTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXG4gICAgICogQHJldHVybnMge0FsbERheUV2ZW50fSBcdTgxRUFcdThFQUJcbiAgICAgKi9cbiAgICBwdWJsaWMgb25FdmVudChjYWxsYmFjazogKGtleTogc3RyaW5nKSA9PiB2b2lkKTogQWxsRGF5RXZlbnQge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEByZXR1cm5zIHtBbGxEYXlFdmVudH0gXHU4MUVBXHU4RUFCXG4gICAgICovXG4gICAgcHVibGljIG9uTW92ZShjYWxsYmFjazogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IEFsbERheUV2ZW50IHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSB3aXRob3V0UG9wdXAge2Jvb2xlYW59IFx1MzBERFx1MzBDM1x1MzBEN1x1MzBBMlx1MzBDM1x1MzBEN1x1MzA5Mlx1OTY2NFx1NTkxNlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEByZXR1cm5zIHtudWxsfEhUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcdTMwN0VcdTMwNUZcdTMwNkZudWxsXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHBpY2tBbGxEYXlFdmVudChlbDogSFRNTEVsZW1lbnQsIHdpdGhvdXRQb3B1cDogYm9vbGVhbiA9IGZhbHNlKTogbnVsbCB8IEhUTUxFbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Jvb3QuY29udGFpbnMoZWwpICYmIGVsLmNsb3Nlc3QodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAod2l0aG91dFBvcHVwID8gJycgOiAnLCAuZ2MtZGF5LWdyaWQtcG9wdXAnKSlcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwREJcdTMwRDBcdTMwRkNcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0ga2V5IHtzdHJpbmd9IFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBBRFx1MzBGQ1xuICAgICAqIEBwYXJhbSBob3ZlciB7Ym9vbGVhbn0gXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNldEhvdmVyQWxsRGF5RXZlbnQoa2V5OiBzdHJpbmcsIGhvdmVyOiBib29sZWFuKSB7XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLWFsbC1kYXktZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gZXZlbnRTdGFydCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZXZlbnRFbmQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNyZWF0ZVByZXZpZXcoZWxFdmVudDogSFRNTEVsZW1lbnQsIGV2ZW50U3RhcnQ6IHN0cmluZywgZXZlbnRFbmQ6IHN0cmluZykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtd2VlaywgLmdjLWFsbC1kYXktc2VjdGlvbicpKS5mb3JFYWNoKGVsV2VlayA9PiB7XG4gICAgICAgICAgICBjb25zdCBbd2Vla1N0YXJ0LCB3ZWVrRW5kXSA9IHRoaXMuZ2V0V2Vla1BlcmlvZChlbFdlZWspXG4gICAgICAgICAgICBpZiAod2Vla1N0YXJ0ICYmIHdlZWtFbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBbcGVyaW9kU3RhcnQsIHBlcmlvZEVuZF0gPSBEYXRlVXRpbHMub3ZlcmxhcFBlcmlvZChldmVudFN0YXJ0LCBldmVudEVuZCwgd2Vla1N0YXJ0LCB3ZWVrRW5kKVxuICAgICAgICAgICAgICAgIGlmIChwZXJpb2RTdGFydCAmJiBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWxQcmV2aWV3ID0gZWxXZWVrLnF1ZXJ5U2VsZWN0b3IoJy5nYy1kYXlbZGF0YS1kYXRlPVwiJyArIHBlcmlvZFN0YXJ0ICsgJ1wiXSAuZ2MtYWxsLWRheS1ldmVudC1wcmV2aWV3JylcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdlZWtTdGFydCA8PSB0aGlzLl9yZXNpemVyLmdldEdyYWJiZWREYXRlKCkgJiYgdGhpcy5fcmVzaXplci5nZXRHcmFiYmVkRGF0ZSgpIDw9IHdlZWtFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1OTAzMVx1MzA2N1x1MzA2Rlx1MzAwMVx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1MzA2RVx1N0UyNlx1NEY0RFx1N0Y2RVx1MzA5Mlx1OEFCRlx1N0JDMFx1MzA1OVx1MzA4QlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXcsIHRoaXMuZ2V0SW5kZXhJblBhcmVudChlbEV2ZW50KSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbCA9IGVsRXZlbnQuY2xvbmVOb2RlKHRydWUpIGFzIEhUTUxFbGVtZW50XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRheXMgPSBEYXRlVXRpbHMuZGlmZkRheXMocGVyaW9kU3RhcnQsIHBlcmlvZEVuZCkgKyAxXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0UHJldmlldyhlbCwgZGF5cywgcGVyaW9kU3RhcnQgPT09IGV2ZW50U3RhcnQsIHBlcmlvZEVuZCA9PT0gZXZlbnRFbmQpXG4gICAgICAgICAgICAgICAgICAgIGVsUHJldmlldy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XHUzMEZCXHU3RDQyXHU0RTg2XHU2NUU1XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsV2VlayB7SFRNTEVsZW1lbnR9IFx1OTAzMVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gXHU5MDMxXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XHUzMEZCXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldFdlZWtQZXJpb2QoZWxXZWVrOiBIVE1MRWxlbWVudCk6IEFycmF5PGFueT4ge1xuICAgICAgICBjb25zdCBlbERheXMgPSBlbFdlZWsucXVlcnlTZWxlY3RvckFsbCgnLmdjLWRheTpub3QoLmdjLWRpc2FibGVkKScpIGFzIE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+XG4gICAgICAgIGlmIChlbERheXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFtlbERheXNbMF0uZGF0YXNldC5kYXRlLCBlbERheXNbZWxEYXlzLmxlbmd0aCAtIDFdLmRhdGFzZXQuZGF0ZV1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbbnVsbCwgbnVsbF1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA2Qlx1NTQwOFx1MzA4Rlx1MzA1Qlx1MzA4QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBkYXlzIHtudW1iZXJ9IFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjVFNVx1NjU3MFxuICAgICAqIEBwYXJhbSBpc1N0YXJ0IHtib29sZWFufSBcdTkwMzFcdTUxODVcdTMwNkJcdTk1OEJcdTU5Q0JcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcGFyYW0gaXNFbmQge2Jvb2xlYW59IFx1OTAzMVx1NTE4NVx1MzA2Qlx1N0Q0Mlx1NEU4Nlx1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhZGp1c3RQcmV2aWV3KGVsOiBIVE1MRWxlbWVudCwgZGF5czogbnVtYmVyLCBpc1N0YXJ0OiBib29sZWFuLCBpc0VuZDogYm9vbGVhbikge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLXN0YXJ0JylcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZW5kJylcbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gNzsgaSsrKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy0nICsgaSArICdkYXlzJylcbiAgICAgICAgfVxuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy0nICsgZGF5cyArICdkYXlzJylcbiAgICAgICAgaWYgKGlzU3RhcnQpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLXN0YXJ0JylcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNFbmQpIHtcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWVuZCcpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU3XHUzMDVGRE9NXHU4OTgxXHU3RDIwXHUzMDRDXHU1MTQ0XHU1RjFGXHUzMDZFXHU0RTJEXHUzMDY3XHU0RjU1XHU3NTZBXHU3NkVFXHUzMDRCXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge251bWJlcn0gXHUzMEE0XHUzMEYzXHUzMEM3XHUzMEMzXHUzMEFGXHUzMEI5XG4gICAgICovXG4gICAgcHJvdGVjdGVkIGdldEluZGV4SW5QYXJlbnQoZWw6IEhUTUxFbGVtZW50KTogbnVtYmVyIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbC5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKGVsKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1Rlx1NjU3MFx1MzA2MFx1MzA1MVx1N0E3QVx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1OEZGRFx1NTJBMFx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhZGRFbXB0eUFsbERheUV2ZW50cyhlbFByZXZpZXc6IEhUTUxFbGVtZW50LCBjb3VudDogbnVtYmVyKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgZWxQcmV2aWV3LmFwcGVuZENoaWxkKGVsKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU1MjRBXHU5NjY0XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlbW92ZVByZXZpZXcoKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LXByZXZpZXcnKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbDogRWxlbWVudCkgPT4gZWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWwuY2xvbmVOb2RlKGZhbHNlKSwgZWwpKVxuICAgIH1cbn0iLCAiaW1wb3J0IFNlbGVjdG9yIGZyb20gXCIuL1NlbGVjdG9yXCI7XG5pbXBvcnQgUmVzaXplciBmcm9tIFwiLi9SZXNpemVyXCI7XG5pbXBvcnQgRGF0ZVV0aWxzIGZyb20gXCIuL0RhdGVVdGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUaW1lZEdyaWRUaW1lZEV2ZW50IHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICovXG4gICAgcHJpdmF0ZSBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY2NDJcdTk1OTNcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcml2YXRlIF90aW1lU2VsZWN0b3I6IFNlbGVjdG9yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA2RVx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCNlx1MzBGQ1xuICAgICAqL1xuICAgIHByaXZhdGUgX3Jlc2l6ZXI6IFJlc2l6ZXIgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMERCXHUzMEQwXHUzMEZDXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJpdmF0ZSBfaG92ZXI6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gdGltZVNlbGVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIHRpbWVTZWxlY3RvcjogU2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuX3RpbWVTZWxlY3RvciA9IHRpbWVTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplciA9IG5ldyBSZXNpemVyKHRoaXMuX3Jvb3QsIHRoaXMuX3RpbWVTZWxlY3RvcilcbiAgICAgICAgICAgIC5zZXRFdmVudFNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIC5zZXRIZWFkQ3Vyc29yKCdnYy1jdXJzb3Itbi1yZXNpemUnKVxuICAgICAgICAgICAgLnNldFRhaWxDdXJzb3IoJ2djLWN1cnNvci1zLXJlc2l6ZScpXG4gICAgICAgICAgICAub25FdmVudCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbk1vdmUoKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vblByZXZpZXcoKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZXZpZXcoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUHJldmlldyhlbCwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uRXZlbnQoY2FsbGJhY2s6IChrZXk6IHN0cmluZykgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUoY2FsbGJhY2s6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBjb250YWluZXJTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcjogc3RyaW5nKTogVGltZWRHcmlkVGltZWRFdmVudCB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIuc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IGNvbnRhaW5lclNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwREVcdTMwQTZcdTMwQjlcdTMwREJcdTMwRDBcdTMwRkNcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZSB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdXNlT3ZlcihlOiBFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fcmVzaXplci5pc0RyYWdnaW5nKCkpIHsgLy8gXHU3RDQyXHU2NUU1XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDAxXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XHU0RTJEXHUzMDZGXHUzMDAxXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDZBXHUzMDQ0XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLnBpY2tFdmVudChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgIGNvbnN0IGtleSA9IGVsID8gZWwuZGF0YXNldC5rZXkgOiBudWxsO1xuICAgICAgICBpZiAoa2V5ICE9PSB0aGlzLl9ob3Zlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuX2hvdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5faG92ZXIgPSBrZXksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge251bGx8SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgKi9cbiAgICBwcml2YXRlIHBpY2tFdmVudChlbDogSFRNTEVsZW1lbnQpOiBudWxsIHwgSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCgnLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGtleSB7c3RyaW5nfSBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcbiAgICAgKiBAcGFyYW0gaG92ZXIge2Jvb2xlYW59IFx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0SG92ZXJBbGxEYXlFdmVudChrZXk6IHN0cmluZywgaG92ZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gZXZlbnRTdGFydCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZXZlbnRFbmQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVQcmV2aWV3KGVsRXZlbnQ6IEhUTUxFbGVtZW50LCBldmVudFN0YXJ0OiBzdHJpbmcsIGV2ZW50RW5kOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcmVzb3VyY2VJZCA9IGVsRXZlbnQuZGF0YXNldC5yZXNvdXJjZUlkO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgJyAuZ2MtZGF5W2RhdGEtcmVzb3VyY2UtaWQ9XCInICsgcmVzb3VyY2VJZCArICdcIl0nKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbERheTogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBbZGF5U3RhcnQsIGRheUVuZF0gPSB0aGlzLmdldFBlcmlvZE9mRGF5KGVsRGF5KTtcbiAgICAgICAgICAgICAgICBpZiAoZGF5U3RhcnQgJiYgZGF5RW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IFtwZXJpb2RTdGFydCwgcGVyaW9kRW5kXSA9IERhdGVVdGlscy5vdmVybGFwUGVyaW9kKGV2ZW50U3RhcnQsIGV2ZW50RW5kLCBkYXlTdGFydCwgZGF5RW5kKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlcmlvZFN0YXJ0ICYmIHBlcmlvZEVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgW3Nsb3QsIHNwYW5dID0gdGhpcy5nZXRTbG90UG9zaXRpb24oZWxEYXksIHBlcmlvZFN0YXJ0LCBwZXJpb2RFbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBlbEV2ZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRqdXN0UHJldmlldyhlbCwgc3Bhbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBzbG90LnF1ZXJ5U2VsZWN0b3IoJy5nYy10aW1lZC1ldmVudC1wcmV2aWV3JykuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk1OEJcdTU5Q0JcdTMwQjlcdTMwRURcdTMwQzNcdTMwQzhcdTMwNjhcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1NjVFNVx1NEVEOFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBldmVudFN0YXJ0IHtzdHJpbmd9IFx1OTU4Qlx1NTlDQlx1NjY0Mlx1OTU5M1xuICAgICAqIEBwYXJhbSBldmVudEVuZCB7c3RyaW5nfSBcdTdENDJcdTRFODZcdTY2NDJcdTk1OTNcbiAgICAgKiBAcmV0dXJucyB7W0hUTUxFbGVtZW50LCBudW1iZXJdfSBcdTk1OEJcdTU5Q0JcdTMwQjlcdTMwRURcdTMwQzNcdTMwQzhcdTMwNjhcdTlBRDhcdTMwNTVcbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFNsb3RQb3NpdGlvbihlbERheTogSFRNTEVsZW1lbnQsIGV2ZW50U3RhcnQ6IHN0cmluZywgZXZlbnRFbmQ6IHN0cmluZyk6IFtIVE1MRWxlbWVudCwgbnVtYmVyXSB7XG4gICAgICAgIGNvbnN0IFtkYXlTdGFydCwgZGF5RW5kXSA9IHRoaXMuZ2V0UGVyaW9kT2ZEYXkoZWxEYXkpO1xuICAgICAgICBjb25zdCBzdGFydCA9IERhdGVVdGlscy50aW1lU2xvdChkYXlTdGFydCwgZGF5RW5kLCBlbERheS5kYXRhc2V0LmludGVydmFsLCBldmVudFN0YXJ0KTtcbiAgICAgICAgY29uc3QgZW5kID0gRGF0ZVV0aWxzLnRpbWVTbG90KGRheVN0YXJ0LCBkYXlFbmQsIGVsRGF5LmRhdGFzZXQuaW50ZXJ2YWwsIGV2ZW50RW5kKTtcbiAgICAgICAgY29uc3Qgc2xvdHMgPSBlbERheS5xdWVyeVNlbGVjdG9yQWxsKCcuZ2Mtc2xvdCcpIGFzIE5vZGVMaXN0T2Y8SFRNTEVsZW1lbnQ+O1xuICAgICAgICByZXR1cm4gW3Nsb3RzW3N0YXJ0XSwgZW5kIC0gc3RhcnRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1RkYxMVx1NjVFNVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1NjY0Mlx1MzA2OFx1N0Q0Mlx1NEU4Nlx1NjVFNVx1NjY0Mlx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1NjVFNVx1NEVEOFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRQZXJpb2RPZkRheShlbERheTogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIFtlbERheS5kYXRhc2V0LnN0YXJ0LCBlbERheS5kYXRhc2V0LmVuZF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDZCXHU1NDA4XHUzMDhGXHUzMDVCXHUzMDhCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIHRpbWVTbG90SGVpZ2h0IHtudW1iZXJ9IFx1MzBCOVx1MzBFRFx1MzBDM1x1MzBDOFx1NjU3MFxuICAgICAqL1xuICAgIHByaXZhdGUgYWRqdXN0UHJldmlldyhlbDogSFRNTEVsZW1lbnQsIHRpbWVTbG90SGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKTtcbiAgICAgICAgZWwuc3R5bGUuc2V0UHJvcGVydHkoJy0tZ2Mtc3BhbicsICdjYWxjKCcgKyAodGltZVNsb3RIZWlnaHQgKiAxMDApICsgJyUgKyAnICsgKHRpbWVTbG90SGVpZ2h0IC0gMSkgKyAncHgpJyk7XG4gICAgICAgIHJldHVybiBlbFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NTI0QVx1OTY2NFxuICAgICAqL1xuICAgIHByaXZhdGUgcmVtb3ZlUHJldmlldygpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLXRpbWVkLWV2ZW50LXByZXZpZXcnKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbDogSFRNTEVsZW1lbnQpID0+IGVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsLmNsb25lTm9kZShmYWxzZSksIGVsKSk7XG4gICAgfVxufSIsICJpbXBvcnQgU2VsZWN0b3IgZnJvbSBcIi4vbW9kdWxlcy9TZWxlY3Rvci50c1wiO1xuaW1wb3J0IEFsbERheUV2ZW50IGZyb20gXCIuL21vZHVsZXMvQWxsRGF5RXZlbnQuanNcIjtcbmltcG9ydCBUaW1lZEdyaWRUaW1lZEV2ZW50IGZyb20gXCIuL21vZHVsZXMvVGltZWRHcmlkVGltZWRFdmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUaW1lR3JpZCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAqL1xuICAgICAgICBkYXRlU2VsZWN0b3I6IFNlbGVjdG9yLC8vc2VsZWN0b3IodGhpcy4kZWwsICcuZ2MtdGltZS1ncmlkJywgJy5nYy1kYXknLCAnZGF0ZScpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY2NDJcdTk1OTNcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgICAgICovXG4gICAgICAgIHRpbWVTZWxlY3RvcjogU2VsZWN0b3IsLy9zZWxlY3Rvcih0aGlzLiRlbCwgJy5nYy10aW1lLWdyaWQnLCAnLmdjLXNsb3QnLCAndGltZScpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcbiAgICAgICAgICovXG4gICAgICAgIGFsbERheUV2ZW50OiBBbGxEYXlFdmVudCwvL2FsbERheUV2ZW50KHRoaXMuJGVsLCAnLmdjLXRpbWUtZ3JpZCcpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcbiAgICAgICAgICovXG4gICAgICAgIHRpbWVkRXZlbnQ6IFRpbWVkR3JpZFRpbWVkRXZlbnQsLy90aW1lZEV2ZW50KHRoaXMuJGVsLCAnLmdjLXRpbWUtZ3JpZCcpLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBcdTMwQUJcdTMwRUNcdTMwRjNcdTMwQzBcdTMwRkNcdTMwNkVcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICovXG4gICAgICAgIGluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3RvciA9IG5ldyBTZWxlY3Rvcih0aGlzLiRlbClcbiAgICAgICAgICAgICAgICAuc2V0Q29udGFpbmVyU2VsZWN0b3IoJy5nYy1hbGwtZGF5LXNlY3Rpb24nKVxuICAgICAgICAgICAgICAgIC5zZXRFbGVtZW50U2VsZWN0b3IoJy5nYy1kYXknKVxuICAgICAgICAgICAgICAgIC5zZXRQcm9wZXJ0eU5hbWUoJ2RhdGUnKVxuICAgICAgICAgICAgICAgIC5vblNlbGVjdCgoc3RhcnQsIGVuZCwgcmVzb3VyY2VJZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRGF0ZShzdGFydCArICcgMDA6MDA6MDAnLCBlbmQgKyAnIDIzOjU5OjU5JywgcmVzb3VyY2VJZClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudGltZVNlbGVjdG9yID0gbmV3IFNlbGVjdG9yKHRoaXMuJGVsKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLXRpbWVkLXNlY3Rpb24nKVxuICAgICAgICAgICAgICAgIC5zZXRFbGVtZW50U2VsZWN0b3IoJy5nYy1zbG90JylcbiAgICAgICAgICAgICAgICAuc2V0UHJvcGVydHlOYW1lKCd0aW1lJylcbiAgICAgICAgICAgICAgICAub25TZWxlY3QoKHN0YXJ0LCBlbmQsIHJlc291cmNlSWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkRhdGUoc3RhcnQsIHRoaXMudGltZVNlbGVjdG9yLmdldEVsZW1lbnRCeVZhbHVlKGVuZCkuZGF0YXNldC50aW1lRW5kLCByZXNvdXJjZUlkKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudCA9IG5ldyBBbGxEYXlFdmVudCh0aGlzLiRlbCwgdGhpcy5kYXRlU2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtYWxsLWRheS1zZWN0aW9uJylcbiAgICAgICAgICAgICAgICAub25FdmVudCgoa2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAub25Nb3ZlKChrZXksIHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbk1vdmUoa2V5LCBzdGFydCwgZW5kKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50ID0gbmV3IFRpbWVkR3JpZFRpbWVkRXZlbnQodGhpcy4kZWwsIHRoaXMudGltZVNlbGVjdG9yKVxuICAgICAgICAgICAgICAgIC5zZXRDb250YWluZXJTZWxlY3RvcignLmdjLXRpbWVkLXNlY3Rpb24nKVxuICAgICAgICAgICAgICAgIC5vbkV2ZW50KChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbk1vdmUoKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA2RVx1NzY3Qlx1OTMzMlxuICAgICAgICAgICAgdGhpcy5hbGxEYXlFdmVudC5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy50aW1lZEV2ZW50LnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLmRhdGVTZWxlY3Rvci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICAgICAgdGhpcy50aW1lU2VsZWN0b3IucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgfSxcbiAgICB9XG59Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7QUFLQSxJQUFxQixXQUFyQixNQUE4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRUEwRDFCLFlBQVksTUFBbUI7QUFyRC9CO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVE7QUFNUjtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLHNCQUE2QjtBQU1yQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLG9CQUEyQjtBQU1uQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGlCQUF3QjtBQU1oQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLG1CQUEwQjtBQU1sQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGlCQUF3QjtBQU1oQztBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUFRLGVBQXNCO0FBSzlCO0FBQUE7QUFBQTtBQUFBLHdCQUFRLFdBQW9FO0FBTTVFO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQVEsYUFBc0U7QUFPMUUsU0FBSyxRQUFRO0FBQUEsRUFDakI7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUtPLG9CQUFvQjtBQUN2QixTQUFLLE1BQU0saUJBQWlCLGFBQWEsS0FBSyxXQUFXLEtBQUssSUFBSSxDQUFDO0FBQ25FLFNBQUssTUFBTSxpQkFBaUIsYUFBYSxLQUFLLFdBQVcsS0FBSyxJQUFJLENBQUM7QUFDbkUsU0FBSyxNQUFNLGlCQUFpQixXQUFXLEtBQUssU0FBUyxLQUFLLElBQUksQ0FB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
