var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

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
      const [dayStart, dayEnd] = [elDay.dataset.startTime, elDay.dataset.endTime];
      if (dayStart && dayEnd) {
        const [periodStart, periodEnd] = DateUtils.overlapPeriod(eventStart, eventEnd, dayStart, dayEnd);
        if (periodStart && periodEnd) {
          const [slot, height] = this.getSlotAndHeight(elDay, periodStart, periodEnd);
          const el = elEvent.cloneNode(true);
          this.adjustPreview(el, height);
          slot.querySelector(".gc-timed-event-preview").appendChild(el);
        }
      }
    });
  }
  /**
   * 開始スロットと高さを取得
   *
   * @param elDay {HTMLElement} 日付のDOM要素
   * @param startTime {string} 開始時間
   * @param endTime {string} 終了時間
   * @returns {[HTMLElement, number]} 開始スロットと高さ
   */
  getSlotAndHeight(elDay, startTime, endTime) {
    const slots = elDay.querySelectorAll(".gc-slot");
    let startIndex = 0;
    let endIndex = slots.length;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].dataset.time <= startTime) {
        startIndex = i;
      }
      if (slots[i].dataset.time <= endTime) {
        endIndex = i;
      }
    }
    return [slots[startIndex], endIndex - startIndex];
  }
  /**
   * ドラッグ中の終日予定をプレビューに合わせる
   * @param el {HTMLElement} 予定のDOM要素
   * @param timeSlotHeight {number} スロット数
   */
  adjustPreview(el, timeSlotHeight) {
    el.classList.remove("gc-dragging");
    el.style.setProperty("--gc-timed-event-height", timeSlotHeight * 100 + "%");
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
    dateSelector: DateTimeSelector,
    //selector(this.$el, '.gc-time-grid', '.gc-day', 'date'),
    /**
     * 時間のセレクター
     */
    timeSelector: DateTimeSelector,
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
      this.dateSelector = new DateTimeSelector(this.$el).setContainerSelector(".gc-all-day-section").setElementSelector(".gc-day").setPropertyName("date").onSelect((start, end) => {
        this.$wire.onDate(start + " 00:00:00", end + " 23:59:59");
      });
      this.timeSelector = new DateTimeSelector(this.$el).setContainerSelector(".gc-timed-section").setElementSelector(".gc-slot").setPropertyName("time").onSelect((start, end) => {
        this.$wire.onDate(start, this.timeSelector.getElementByDateTime(end).dataset.timeEnd);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvRGF0ZVRpbWVTZWxlY3Rvci50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9EYXRlVXRpbHMudHMiLCAiLi4vcmVzb3VyY2VzL2pzL21vZHVsZXMvUmVzaXplci50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9BbGxEYXlFdmVudC50cyIsICIuLi9yZXNvdXJjZXMvanMvbW9kdWxlcy9UaW1lZEdyaWRUaW1lZEV2ZW50LnRzIiwgIi4uL3Jlc291cmNlcy9qcy90aW1lLWdyaWQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogRGF0ZVRpbWVTZWxlY3RvclxuICpcbiAqIFx1MzBBQlx1MzBFQ1x1MzBGM1x1MzBDMFx1MzBGQ1x1MzA2RVx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA2RVx1OTA3OFx1NjI5RVx1NkE1Rlx1ODBGRFx1MzA5Mlx1NjNEMFx1NEY5Qlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2Qlx1MzAwMVx1MzBERVx1MzBBNlx1MzBCOVx1MzA2RVx1NjRDRFx1NEY1Q1x1MzA2Qlx1MzA4OFx1MzA4Qlx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1NjMwN1x1NUI5QVx1MzA5Mlx1ODg0Q1x1MzA0Nlx1MzAwMlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRlVGltZVNlbGVjdG9yIHtcbiAgICAvKipcbiAgICAgKiBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXHUzMDkyXHU2MzAxXHUzMDY0XHUzMEQ3XHUzMEVEXHUzMEQxXHUzMEM2XHUzMEEzXHU1NDBEXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9wcm9wZXJ0eU5hbWU6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNkVcdTk1OEJcdTU5Q0JcdTRGNERcdTdGNkVcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NlbGVjdGlvblN0YXJ0OiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zZWxlY3Rpb25FbmQ6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwNENcdTU5MDlcdTY2RjRcdTMwNTVcdTMwOENcdTMwNUZcdTY2NDJcdTMwNkVcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX29uU2VsZWN0OiAoYmVnaW46IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXG4gICAgICovXG4gICAgcHVibGljIHJlZ2lzdGVyQ2FsbGJhY2tzKCkge1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMuX21vdXNlRG93bi5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLl9tb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX21vdXNlVXAuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGNvbnRhaW5lclNlbGVjdG9yXG4gICAgICovXG4gICAgcHVibGljIHNldENvbnRhaW5lclNlbGVjdG9yKGNvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcpOiBEYXRlVGltZVNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyU2VsZWN0b3IgPSBjb250YWluZXJTZWxlY3RvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGVsZW1lbnRTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRFbGVtZW50U2VsZWN0b3IoZWxlbWVudFNlbGVjdG9yOiBzdHJpbmcpOiBEYXRlVGltZVNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fZWxlbWVudFNlbGVjdG9yID0gZWxlbWVudFNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwNkVcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcdTMwOTJcdTYzMDFcdTMwNjRcdTMwRDdcdTMwRURcdTMwRDFcdTMwQzZcdTMwQTNcdTU0MERcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDIoZGF0YS1kYXRlXHUzMDZBXHUzMDg5XHUzMDAxZGF0ZSlcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlOYW1lXG4gICAgICovXG4gICAgcHVibGljIHNldFByb3BlcnR5TmFtZShwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IERhdGVUaW1lU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9wcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA0Q1x1NTkwOVx1NjZGNFx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjY0Mlx1MzA2RVx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBvblNlbGVjdFxuICAgICAqL1xuICAgIHB1YmxpYyBvblNlbGVjdChvblNlbGVjdDogKGJlZ2luOiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogRGF0ZVRpbWVTZWxlY3RvciB7XG4gICAgICAgIHRoaXMuX29uU2VsZWN0ID0gb25TZWxlY3Q7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1N0JDNFx1NTZGMlx1MzA2RVx1OTU4Qlx1NTlDQlx1NEY0RFx1N0Y2RVx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBkYXRlVGltZSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc2VsZWN0KGRhdGVUaW1lOiBzdHJpbmcpOiBEYXRlVGltZVNlbGVjdG9yIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uU3RhcnQgPSB0aGlzLl9zZWxlY3Rpb25FbmQgPSBkYXRlVGltZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU3RDQyXHU0RTg2XHU0RjREXHU3RjZFXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICogQHBhcmFtIGRhdGVUaW1lIFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBzZWxlY3RFbmQoZGF0ZVRpbWU6IHN0cmluZyk6IERhdGVUaW1lU2VsZWN0b3Ige1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25FbmQgPSBkYXRlVGltZTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDkyXHU4OUUzXHU5NjY0XHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgcHVibGljIGRlc2VsZWN0KCkge1xuICAgICAgICB0aGlzLnNlbGVjdChudWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTdCQzRcdTU2RjJcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBnZXRTZWxlY3Rpb24oKTogc3RyaW5nW10ge1xuICAgICAgICByZXR1cm4gW3RoaXMuX3NlbGVjdGlvblN0YXJ0LCB0aGlzLl9zZWxlY3Rpb25FbmRdLnNvcnQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTczRkVcdTU3MjhcdTMwMDFcdTkwNzhcdTYyOUVcdTRFMkRcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNTZWxlY3RlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbGVjdGlvblN0YXJ0ICE9PSBudWxsICYmIHRoaXMuX3NlbGVjdGlvbkVuZCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTYyQkNcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX21vdXNlRG93bihlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRhdGVUaW1lID0gdGhpcy5waWNrRGF0ZVRpbWUoZS50YXJnZXQgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgICBpZiAoZGF0ZVRpbWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0KGRhdGVUaW1lKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwREVcdTMwQTZcdTMwQjlcdTMwOTJcdTUyRDVcdTMwNEJcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZVxuICAgICAqL1xuICAgIHByaXZhdGUgX21vdXNlTW92ZShlOiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRhdGVUaW1lID0gdGhpcy5waWNrRGF0ZVRpbWVCeVBvc2l0aW9uKGUueCwgZS55KTtcbiAgICAgICAgaWYgKGRhdGVUaW1lKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdEVuZChkYXRlVGltZSk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERFXHUzMEE2XHUzMEI5XHUzMDkyXHU5NkUyXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGVcbiAgICAgKi9cbiAgICBwcml2YXRlIF9tb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuaXNTZWxlY3RlZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRlVGltZSA9IHRoaXMucGlja0RhdGVUaW1lQnlQb3NpdGlvbihlLngsIGUueSk7XG4gICAgICAgICAgICBpZiAoZGF0ZVRpbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25TZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgW3N0YXJ0LCBlbmRdID0gdGhpcy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25TZWxlY3Qoc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTg5ODFcdTdEMjBcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0gZWwgXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHUzMEZCXHU2NjQyXHU5NTkzXG4gICAgICovXG4gICAgcHVibGljIHBpY2tEYXRlVGltZShlbDogRWxlbWVudCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yKVxuICAgICAgICAgICAgPyBlbC5jbG9zZXN0KHRoaXMuX2VsZW1lbnRTZWxlY3RvciArICc6bm90KC5kaXNhYmxlZCknKSAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgPy5kYXRhc2V0W3RoaXMuX3Byb3BlcnR5TmFtZV1cbiAgICAgICAgICAgIDogbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTVcdTMwOENcdTMwNUZcdTVFQTdcdTZBMTlcdTMwNEJcdTMwODlcdTMwMDFcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTYzQTJcdTMwNTlcdTMwMDJcbiAgICAgKiBAcGFyYW0geCBYXHU1RUE3XHU2QTE5XG4gICAgICogQHBhcmFtIHkgWVx1NUVBN1x1NkExOVxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1xuICAgICAqL1xuICAgIHB1YmxpYyBwaWNrRGF0ZVRpbWVCeVBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IpKVxuICAgICAgICAgICAgLmZpbHRlcigoZWw6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN0LmxlZnQgPD0geCAmJiB4IDw9IHJlY3QucmlnaHQgJiYgcmVjdC50b3AgPD0geSAmJiB5IDw9IHJlY3QuYm90dG9tO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdCgwKT8uZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1NVx1MzA4Q1x1MzA1Rlx1NjVFNVx1NEVEOFx1MzBGQlx1NjY0Mlx1OTU5M1x1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NjNBMlx1MzA1OVx1MzAwMlxuICAgICAqIEBwYXJhbSBkYXRlVGltZSBcdTY1RTVcdTRFRDhcdTMwRkJcdTY2NDJcdTk1OTNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR9IFx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRFbGVtZW50QnlEYXRlVGltZShkYXRlVGltZTogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yKHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgJyAnICsgdGhpcy5fZWxlbWVudFNlbGVjdG9yICtcbiAgICAgICAgICAgICdbZGF0YS0nICsgdGhpcy5fcHJvcGVydHlOYW1lICsgJz1cIicgKyBkYXRlVGltZSArICdcIl0nXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU2NjQyXHUzMDZFXHU5MDc4XHU2MjlFXHU3QkM0XHU1NkYyXHUzMDZFXHU4ODY4XHU3OTNBXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXHUzMDAyXG4gICAgICovXG4gICAgcHJpdmF0ZSB1cGRhdGUoKSB7XG4gICAgICAgIGxldCBbYmVnaW4sIGVuZF0gPSBbdGhpcy5fc2VsZWN0aW9uU3RhcnQsIHRoaXMuX3NlbGVjdGlvbkVuZF0uc29ydCgpO1xuICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5fY29udGFpbmVyU2VsZWN0b3IgKyAnICcgKyB0aGlzLl9lbGVtZW50U2VsZWN0b3IpXG4gICAgICAgICAgICAuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVUaW1lID0gZWwuZGF0YXNldFt0aGlzLl9wcm9wZXJ0eU5hbWVdXG4gICAgICAgICAgICAgICAgaWYgKGJlZ2luIDw9IGRhdGVUaW1lICYmIGRhdGVUaW1lIDw9IGVuZCkge1xuICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zZWxlY3RlZCcpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2Mtc2VsZWN0ZWQnKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn0iLCAiZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0ZVV0aWxzIHtcbiAgICAvKipcbiAgICAgKiAxXHU2NUU1XHUzMDZFXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICovXG4gICAgc3RhdGljIHJlYWRvbmx5IE1JTExJU0VDT05EU19QRVJfREFZID0gMjQgKiA2MCAqIDYwICogMTAwMFxuXG4gICAgLyoqXG4gICAgICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0b0RhdGVTdHJpbmcoZDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVEYXRlU3RyaW5nKCdzdi1TRScpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMERGXHUzMEVBXHU3OUQyXHUzMDkyXHU2NUU1XHU2NjQyXHU2NTg3XHU1QjU3XHU1MjE3XHUzMDZCXHU1OTA5XHU2M0RCXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGQge251bWJlcn0gXHUzMERGXHUzMEVBXHU3OUQyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gXHU2NUU1XHU0RUQ4XHU2NTg3XHU1QjU3XHU1MjE3XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0b0RhdGVUaW1lU3RyaW5nKGQpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gRGF0ZVV0aWxzLnRvRGF0ZVN0cmluZyhkKSArICcgJyArIChuZXcgRGF0ZShkKSkudG9Mb2NhbGVUaW1lU3RyaW5nKFwiZW4tR0JcIilcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwNkJcdTY1RTVcdTY1NzBcdTMwOTJcdTUyQTBcdTdCOTdcbiAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTY1RTVcdTRFRDhcbiAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTUyQTBcdTdCOTdcdTVGOENcdTMwNkVcdTY1RTVcdTRFRDgoXHUzMERGXHUzMEVBXHU3OUQyKVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYWRkRGF5cyhkYXRlOiBzdHJpbmcsIGRheXM6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBEYXRlLnBhcnNlKGRhdGUpICsgZGF5cyAqIERhdGVVdGlscy5NSUxMSVNFQ09ORFNfUEVSX0RBWVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA2RVx1NjVFNVx1NjU3MFx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBkYXRlMSB7c3RyaW5nfSBcdTY1RTVcdTRFRDgxXG4gICAgICogQHBhcmFtIGRhdGUyIHtzdHJpbmd9IFx1NjVFNVx1NEVEODJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBcdTY1RTVcdTY1NzBcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRpZmZEYXlzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICBsZXQgZDEgPSBuZXcgRGF0ZShkYXRlMSlcbiAgICAgICAgbGV0IGQyID0gbmV3IERhdGUoZGF0ZTIpXG4gICAgICAgIGQxLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIGQyLnNldEhvdXJzKDAsIDAsIDAsIDApXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKChkMi5nZXRUaW1lKCkgLSBkMS5nZXRUaW1lKCkpIC8gRGF0ZVV0aWxzLk1JTExJU0VDT05EU19QRVJfREFZKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjVFNVx1NEVEOFx1MzA2OFx1NjVFNVx1NEVEOFx1MzA2RVx1NURFRVx1MzA5Mm1zXHUzMDY3XHU2QzQyXHUzMDgxXHUzMDhCXG4gICAgICogQHBhcmFtIGRhdGUxIHtzdHJpbmd9IFx1NjVFNVx1NEVEODFcbiAgICAgKiBAcGFyYW0gZGF0ZTIge3N0cmluZ30gXHU2NUU1XHU0RUQ4MlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1NjVFNVx1NjU3MFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGlmZkluTWlsbGlzZWNvbmRzKGRhdGUxOiBzdHJpbmcsIGRhdGUyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gRGF0ZS5wYXJzZShkYXRlMikgLSBEYXRlLnBhcnNlKGRhdGUxKVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjcxRlx1OTU5M1x1MzA2RVx1OTFDRFx1MzA2QVx1MzA4QVx1MzA5Mlx1NkM0Mlx1MzA4MVx1MzA4QlxuICAgICAqIEBwYXJhbSBzdGFydDEge3N0cmluZ30gXHU2NzFGXHU5NTkzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVxuICAgICAqIEBwYXJhbSBlbmQxIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzFcdTMwNkVcdTdENDJcdTRFODZcdTY1RTVcbiAgICAgKiBAcGFyYW0gc3RhcnQyIHtzdHJpbmd9IFx1NjcxRlx1OTU5MzJcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZW5kMiB7c3RyaW5nfSBcdTY3MUZcdTk1OTMyXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICogQHJldHVybnMge0FycmF5fSBcdTkxQ0RcdTMwNkFcdTMwNjNcdTMwNjZcdTMwNDRcdTMwOEJcdTY3MUZcdTk1OTNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG92ZXJsYXBQZXJpb2Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpOiBBcnJheTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBzdGFydDEgPD0gc3RhcnQyID8gc3RhcnQyIDogc3RhcnQxXG4gICAgICAgIGNvbnN0IGVuZCA9IGVuZDEgPD0gZW5kMiA/IGVuZDEgOiBlbmQyXG4gICAgICAgIHJldHVybiBzdGFydCA8PSBlbmQgPyBbc3RhcnQsIGVuZF0gOiBbbnVsbCwgbnVsbF1cbiAgICB9XG59IiwgImltcG9ydCBEYXRlVGltZVNlbGVjdG9yIGZyb20gXCIuL0RhdGVUaW1lU2VsZWN0b3JcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2l6ZXIge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQkFcdTVCRkVcdThDNjFcdTMwNkVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2V2ZW50U2VsZWN0b3I6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY1RTVcdTRFRDhcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcdTMwRkJcdTY2NDJcdTk1OTNcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwRkNcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3NlbGVjdG9yOiBEYXRlVGltZVNlbGVjdG9yID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEOFx1MzBDM1x1MzBDMFx1MzBGQ1x1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaGVhZEN1cnNvcjogc3RyaW5nID0gJ2djLWN1cnNvci13LXJlc2l6ZSc7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzZcdTMwRkNcdTMwRUJcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3RhaWxDdXJzb3I6IHN0cmluZyA9ICdnYy1jdXJzb3ItZS1yZXNpemUnO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZzogSFRNTEVsZW1lbnQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZCXHUzMDAxXHU1MjREXHU1NkRFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDVGXHU2NUU1XHU0RUQ4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ1ByZXZEYXRlOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3OUZCXHU1MkQ1XHU5MUNGXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kcmFnZ2luZ0NvdW50OiBudW1iZXIgPSAwO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9ncmFiYmVkRGF0ZTogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU0RjREXHU3RjZFXHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9ncmFiYmVkU3RhcnQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NEY0RFx1N0Y2RVx1MzA5Mlx1NjNCNFx1MzA5M1x1MzA2N1x1MzA0NFx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfZ3JhYmJlZEVuZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbkV2ZW50OiAoa2V5OiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vbk1vdmU6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU3NTFGXHU2MjEwXHUzMDU5XHUzMDhCXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9vblByZXZpZXc6IChlbDogSFRNTEVsZW1lbnQsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGM1x1MzBCOVx1MzBDOFx1MzBFOVx1MzBBRlx1MzBCRlxuICAgICAqIEBwYXJhbSByb290IFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFx1MzAwMlx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4Qlx1MzA1Rlx1MzA4MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzAwMlxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCBzZWxlY3RvcjogRGF0ZVRpbWVTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5fb25Nb3VzZURvd24uYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuX3Jvb3QuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMuX29uTW91c2VVcC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTk1OEJcdTU5Q0JcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1OTU4Qlx1NTlDQlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZURvd24oZTogTW91c2VFdmVudCk6IHZvaWQge1xuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0V2ZW50KGUudGFyZ2V0IGFzIEVsZW1lbnQpXG4gICAgICAgIGlmIChlbCkge1xuICAgICAgICAgICAgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU1OTA5XHU1RjYyXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICAgICAgICB0aGlzLl9ncmFiYmVkU3RhcnQgPSB0aGlzLl9ncmFiYmVkRW5kID0gdHJ1ZVxuICAgICAgICAgICAgaWYgKHRoaXMuaGl0SGVhZChlLnRhcmdldCBhcyBFbGVtZW50KSkgeyAvLyBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTU4MzRcdTU0MDhcdTMwMDFcdTdENDJcdTRFODZcdTY1RTVcdTMwNkZcdTU2RkFcdTVCOUFcbiAgICAgICAgICAgICAgICB0aGlzLl9ncmFiYmVkRW5kID0gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmhpdFRhaWwoZS50YXJnZXQgYXMgRWxlbWVudCkpIHsgLy8gXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHU1ODM0XHU1NDA4XHUzMDAxXHU5NThCXHU1OUNCXHU2NUU1XHUzMDZGXHU1NkZBXHU1QjlBXG4gICAgICAgICAgICAgICAgdGhpcy5fZ3JhYmJlZFN0YXJ0ID0gZmFsc2VcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XG4gICAgICAgICAgICB0aGlzLl9ncmFiYmVkRGF0ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tEYXRlVGltZUJ5UG9zaXRpb24oZS54LCBlLnkpXG5cbiAgICAgICAgICAgIC8vIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBlbFxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdUZGMDhcdTg4NjhcdTc5M0FcdTMwOTJcdTZEODhcdTMwNTlcdUZGMDlcbiAgICAgICAgICAgIHRoaXMuc2V0RHJhZ2dpbmcodGhpcy5fZHJhZ2dpbmcuZGF0YXNldC5rZXksIHRydWUpXG5cbiAgICAgICAgICAgIC8vIFx1NzNGRVx1NTcyOFx1MzA2RVx1NjVFNVx1NEVEOFx1MzA5Mlx1OEExOFx1OTMzMlxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdQcmV2RGF0ZSA9IG51bGxcblxuICAgICAgICAgICAgLy8gXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcodGhpcy5fZ3JhYmJlZERhdGUpXG5cbiAgICAgICAgICAgIC8vIFx1MzBBQlx1MzBGQ1x1MzBCRFx1MzBFQlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKVxuXG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTkxQ0ZcdTMwOTJcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgICAgICAgIHRoaXMuX2RyYWdnaW5nQ291bnQgPSAwXG5cbiAgICAgICAgICAgIC8vIFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFx1MzA0Q1x1NTFFNlx1NzQwNlx1MzA1NVx1MzA4Q1x1MzA1RlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU3OUZCXHU1MkQ1XHUzMDkyXHU3RDQyXHU0RTg2XG4gICAgICogQHBhcmFtIGUge01vdXNlRXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcdTMwNTdcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VNb3ZlKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTg4NjhcdTc5M0FcbiAgICAgICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLl9zZWxlY3Rvci5waWNrRGF0ZVRpbWVCeVBvc2l0aW9uKGUueCwgZS55KVxuICAgICAgICAgICAgaWYgKGRhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVByZXZpZXcoZGF0ZSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gXHUzMERFXHUzMEE2XHUzMEI5XHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDZFXHUzMDVGXHUzMDgxXHUzMDZCXHU3OUZCXHU1MkQ1XHU5MUNGXHUzMDkyXHU4QTE4XHU5MzMyXG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0NvdW50KytcblxuICAgICAgICAgICAgLy8gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDRDXHU1MUU2XHU3NDA2XHUzMDU1XHUzMDhDXHUzMDVGXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTc5RkJcdTUyRDVcdTMwOTJcdTdENDJcdTRFODZcbiAgICAgKiBAcGFyYW0gZSB7TW91c2VFdmVudH0gXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NzlGQlx1NTJENVx1MzA5Mlx1N0Q0Mlx1NEU4Nlx1MzA1N1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfb25Nb3VzZVVwKGU6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdnaW5nKSB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSB0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LmtleVxuICAgICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuX3NlbGVjdG9yLnBpY2tEYXRlVGltZUJ5UG9zaXRpb24oZS54LCBlLnkpXG4gICAgICAgICAgICBpZiAoZGF0ZSAmJiB0aGlzLl9ncmFiYmVkRGF0ZSAhPT0gZGF0ZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtzdGFydCwgZW5kXSA9IHRoaXMuZ2V0Q2hhbmdlZFBlcmlvZChkYXRlKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2RyYWdnaW5nQ291bnQgPCAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25FdmVudChrZXkpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25QcmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uUHJldmlldyh0aGlzLl9kcmFnZ2luZywgbnVsbCwgbnVsbClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREcmFnZ2luZyhrZXksIGZhbHNlKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmcgPSBudWxsXG4gICAgICAgICAgICB0aGlzLl9ncmFiYmVkU3RhcnQgPSB0aGlzLl9ncmFiYmVkRW5kID0gbnVsbFxuICAgICAgICAgICAgdGhpcy51cGRhdGVDdXJzb3IoKVxuXG4gICAgICAgICAgICAvLyBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTA3OFx1NjI5RVx1NUJGRVx1OEM2MVx1MzA2RVx1ODk4MVx1N0QyMFx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBFQVx1MzBCNVx1MzBBNFx1MzBCQVx1NUJGRVx1OEM2MVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1x1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBzZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRFdmVudFNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fZXZlbnRTZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk4MkRcdTkwRThcdTUyMDZcdTMwOTJcdTYzQjRcdTMwOTNcdTMwNjdcdTMwNDRcdTMwOEJcdTY2NDJcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY3Vyc29yXG4gICAgICovXG4gICAgcHVibGljIHNldEhlYWRDdXJzb3IoY3Vyc29yOiBzdHJpbmcpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5faGVhZEN1cnNvciA9IGN1cnNvcjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDkyXHU2M0I0XHUzMDkzXHUzMDY3XHUzMDQ0XHUzMDhCXHU2NjQyXHUzMDZFXHUzMEFCXHUzMEZDXHUzMEJEXHUzMEVCXHUzMDkyXHU4QTJEXHU1QjlBXG4gICAgICogQHBhcmFtIGN1cnNvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRUYWlsQ3Vyc29yKGN1cnNvcjogc3RyaW5nKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX3RhaWxDdXJzb3IgPSBjdXJzb3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbkV2ZW50KGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcpID0+IHZvaWQpOiB0aGlzIHtcbiAgICAgICAgdGhpcy5fb25FdmVudCA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25Nb3ZlKGNhbGxiYWNrOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkKTogdGhpcyB7XG4gICAgICAgIHRoaXMuX29uTW92ZSA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwOTJcdTc1MUZcdTYyMTBcdTMwNTlcdTMwOEJcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgb25QcmV2aWV3KGNhbGxiYWNrOiAoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCk6IHRoaXMge1xuICAgICAgICB0aGlzLl9vblByZXZpZXcgPSBjYWxsYmFjaztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHB1YmxpYyBpc0RyYWdnaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fZHJhZ2dpbmcgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2M0I0XHUzMDkzXHUzMDYwXHU2NUU1XHU0RUQ4XHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICovXG4gICAgcHVibGljIGdldEdyYWJiZWREYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ncmFiYmVkRGF0ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwaWNrRXZlbnQoZWw6IEVsZW1lbnQpOiBIVE1MRWxlbWVudCB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCh0aGlzLl9ldmVudFNlbGVjdG9yKVxuICAgICAgICAgICAgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NTE0OFx1OTgyRFx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IFx1NTIyNFx1NUI5QVx1MzA1OVx1MzA4Qlx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTUxNDhcdTk4MkRcdTkwRThcdTUyMDZcdTMwNkJcdTVGNTNcdTMwNUZcdTMwNjNcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgaGl0SGVhZChlbDogRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFlbC5jbG9zZXN0KCcuZ2MtaGVhZCcpXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHU2NzJCXHU1QzNFXHU5MEU4XHU1MjA2XHUzMDZCXHU1RjUzXHUzMDVGXHUzMDYzXHUzMDVGXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gXHU1MjI0XHU1QjlBXHUzMDU5XHUzMDhCXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFx1NjcyQlx1NUMzRVx1OTBFOFx1NTIwNlx1MzA2Qlx1NUY1M1x1MzA1Rlx1MzA2M1x1MzA1Rlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBoaXRUYWlsKGVsOiBFbGVtZW50KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhIWVsLmNsb3Nlc3QoJy5nYy10YWlsJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUZcdTMwRTlcdTMwQjlcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc2V0RHJhZ2dpbmcoa2V5OiBzdHJpbmcsIGRyYWdnaW5nOiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9ldmVudFNlbGVjdG9yICsgJ1tkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1kcmFnZ2luZycpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWRyYWdnaW5nJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTU5MDlcdTY2RjRcdTVGOENcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY3MUZcdTk1OTNcdTMwOTJcdTUzRDZcdTVGOTdcdTMwNTlcdTMwOEJcbiAgICAgKiBAcGFyYW0gZGF0ZSB7c3RyaW5nfSBcdTMwREVcdTMwQTZcdTMwQjlcdTMwNkVcdTRGNERcdTdGNkVcdTMwNkVcdTY1RTVcdTRFRDhcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1NTkwOVx1NjZGNFx1NUY4Q1x1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1NjcxRlx1OTU5M1xuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRDaGFuZ2VkUGVyaW9kKGRhdGU6IHN0cmluZyk6IEFycmF5PGFueT4ge1xuICAgICAgICBjb25zdCBkaWZmID0gRGF0ZVV0aWxzLmRpZmZJbk1pbGxpc2Vjb25kcyh0aGlzLl9ncmFiYmVkRGF0ZSwgZGF0ZSlcbiAgICAgICAgbGV0IHN0YXJ0ID0gRGF0ZVV0aWxzLnRvRGF0ZVRpbWVTdHJpbmcoRGF0ZS5wYXJzZSh0aGlzLl9kcmFnZ2luZy5kYXRhc2V0LnN0YXJ0KSArICh0aGlzLl9ncmFiYmVkU3RhcnQgPyBkaWZmIDogMCkpXG4gICAgICAgIGxldCBlbmQgPSBEYXRlVXRpbHMudG9EYXRlVGltZVN0cmluZyhEYXRlLnBhcnNlKHRoaXMuX2RyYWdnaW5nLmRhdGFzZXQuZW5kKSArICh0aGlzLl9ncmFiYmVkRW5kID8gZGlmZiA6IDApKVxuICAgICAgICBzdGFydCA9IHN0YXJ0LnN1YnN0cmluZygwLCB0aGlzLl9ncmFiYmVkRGF0ZS5sZW5ndGgpXG4gICAgICAgIGVuZCA9IGVuZC5zdWJzdHJpbmcoMCwgdGhpcy5fZ3JhYmJlZERhdGUubGVuZ3RoKVxuICAgICAgICBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9ncmFiYmVkU3RhcnQpIHtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGVuZFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX2dyYWJiZWRFbmQpIHtcbiAgICAgICAgICAgICAgICBlbmQgPSBzdGFydFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbc3RhcnQsIGVuZF1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTMwQUJcdTMwRkNcdTMwQkRcdTMwRUJcdTMwOTJcdTY2RjRcdTY1QjBcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgdXBkYXRlQ3Vyc29yKCkge1xuICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5yZW1vdmUodGhpcy5faGVhZEN1cnNvciwgdGhpcy5fdGFpbEN1cnNvcilcbiAgICAgICAgaWYgKHRoaXMuX2dyYWJiZWRTdGFydCAmJiB0aGlzLl9ncmFiYmVkRW5kKSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LmNsYXNzTGlzdC5hZGQoJ2djLWN1cnNvci1tb3ZlJylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ncmFiYmVkU3RhcnQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCh0aGlzLl9oZWFkQ3Vyc29yKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2dyYWJiZWRFbmQpIHtcbiAgICAgICAgICAgIHRoaXMuX3Jvb3QuY2xhc3NMaXN0LmFkZCh0aGlzLl90YWlsQ3Vyc29yKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU2NkY0XHU2NUIwXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGRhdGUge3N0cmluZ30gXHUzMERFXHUzMEE2XHUzMEI5XHUzMDZFXHU0RjREXHU3RjZFXHUzMDZFXHU2NUU1XHU0RUQ4XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHVwZGF0ZVByZXZpZXcoZGF0ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLl9kcmFnZ2luZ1ByZXZEYXRlICE9PSBkYXRlKSB7XG4gICAgICAgICAgICBjb25zdCBbc3RhcnQsIGVuZF0gPSB0aGlzLmdldENoYW5nZWRQZXJpb2QoZGF0ZSlcbiAgICAgICAgICAgIGlmICh0aGlzLl9vblByZXZpZXcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vblByZXZpZXcodGhpcy5fZHJhZ2dpbmcsIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ1ByZXZEYXRlID0gZGF0ZVxuICAgICAgICB9XG4gICAgfVxufSIsICJpbXBvcnQgRGF0ZVRpbWVTZWxlY3RvciBmcm9tIFwiLi9EYXRlVGltZVNlbGVjdG9yXCI7XG5pbXBvcnQgUmVzaXplciBmcm9tIFwiLi9SZXNpemVyXCI7XG5pbXBvcnQgRGF0ZVV0aWxzIGZyb20gXCIuL0RhdGVVdGlsc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBbGxEYXlFdmVudCB7XG4gICAgLyoqXG4gICAgICogXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX3Jvb3Q6IEhUTUxFbGVtZW50O1xuXG4gICAgLyoqXG4gICAgICogXHU5MDc4XHU2MjlFXHU1QkZFXHU4QzYxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDkyXHU1MTY4XHUzMDY2XHU1NDJCXHUzMDgwXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2NvbnRhaW5lclNlbGVjdG9yOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU2NUU1XHU0RUQ4XHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9kYXRlU2VsZWN0b3I6IERhdGVUaW1lU2VsZWN0b3IgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEVBXHUzMEI1XHUzMEE0XHUzMEI2XHUzMEZDXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9yZXNpemVyOiBSZXNpemVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEQlx1MzBEMFx1MzBGQ1x1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfaG92ZXI6IHN0cmluZyA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwQUZcdTMwRUFcdTMwQzNcdTMwQUZcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uRXZlbnQ6IChrZXk6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW92ZTogKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4gdm9pZCA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRjNcdTMwQjlcdTMwQzhcdTMwRTlcdTMwQUZcdTMwQkZcbiAgICAgKiBAcGFyYW0gcm9vdCBcdTMwRUJcdTMwRkNcdTMwQzhcdTg5ODFcdTdEMjBcdTMwMDJcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTc2N0JcdTkzMzJcdTMwNTlcdTMwOEJcdTMwNUZcdTMwODFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwMDJcbiAgICAgKiBAcGFyYW0gZGF0ZVNlbGVjdG9yXG4gICAgICovXG4gICAgY29uc3RydWN0b3Iocm9vdDogSFRNTEVsZW1lbnQsIGRhdGVTZWxlY3RvcjogRGF0ZVRpbWVTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLl9yb290ID0gcm9vdDtcbiAgICAgICAgdGhpcy5fZGF0ZVNlbGVjdG9yID0gZGF0ZVNlbGVjdG9yO1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTUyMURcdTY3MUZcdTUzMTZcbiAgICAgKi9cbiAgICBwdWJsaWMgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplciA9IG5ldyBSZXNpemVyKHRoaXMuX3Jvb3QsIHRoaXMuX2RhdGVTZWxlY3RvcilcbiAgICAgICAgICAgIC5zZXRFdmVudFNlbGVjdG9yKCcuZ2MtYWxsLWRheS1ldmVudC1jb250YWluZXInKVxuICAgICAgICAgICAgLnNldEhlYWRDdXJzb3IoJ2djLWN1cnNvci13LXJlc2l6ZScpXG4gICAgICAgICAgICAuc2V0VGFpbEN1cnNvcignZ2MtY3Vyc29yLWUtcmVzaXplJylcbiAgICAgICAgICAgIC5vbkV2ZW50KChrZXk6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX29uRXZlbnQoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uTW92ZSgoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29uTW92ZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbk1vdmUoa2V5LCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLm9uUHJldmlldygoZWw6IEhUTUxFbGVtZW50LCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJldmlldygpO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydCAmJiBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVQcmV2aWV3KGVsLCBzdGFydCwgZW5kKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcdTMwOTJcdTc2N0JcdTkzMzJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJDYWxsYmFja3MoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgdGhpcy5fcm9vdC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLl9vbk1vdXNlT3Zlci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwREVcdTMwQTZcdTMwQjlcdTMwREJcdTMwRDBcdTMwRkNcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZSB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX29uTW91c2VPdmVyKGU6IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLl9yZXNpemVyLmlzRHJhZ2dpbmcoKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwOTJcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwMDFcdTY1RTVcdTRFRDhcdTMwNkVcdTkwNzhcdTYyOUVcdTUxRTZcdTc0MDZcdTRFMkRcdTMwNkZcdTMwMDFcdTMwREJcdTMwRDBcdTMwRkNcdTMwNTdcdTMwNkFcdTMwNDRcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbCA9IHRoaXMucGlja0FsbERheUV2ZW50KGUudGFyZ2V0IGFzIEhUTUxFbGVtZW50LCB0cnVlKTtcbiAgICAgICAgY29uc3Qga2V5ID0gZWwgPyBlbC5kYXRhc2V0LmtleSA6IG51bGw7XG4gICAgICAgIGlmIChrZXkgIT09IHRoaXMuX2hvdmVyKSB7XG4gICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5faG92ZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0SG92ZXJBbGxEYXlFdmVudCh0aGlzLl9ob3ZlciA9IGtleSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTkwNzhcdTYyOUVcdTVCRkVcdThDNjFcdTMwNkVcdTg5ODFcdTdEMjBcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcdTMwOTJcdThBMkRcdTVCOUFcdTMwNTlcdTMwOEJcdTMwMDJcbiAgICAgKiBAcGFyYW0gY29udGFpbmVyU2VsZWN0b3JcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3I6IHN0cmluZyk6IEFsbERheUV2ZW50IHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5zZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yID0gY29udGFpbmVyU2VsZWN0b3I7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA5Mlx1MzBBRlx1MzBFQVx1MzBDM1x1MzBBRlx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlx1MzA5Mlx1OEEyRFx1NUI5QVxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlxuICAgICAqIEByZXR1cm5zIHtBbGxEYXlFdmVudH0gXHU4MUVBXHU4RUFCXG4gICAgICovXG4gICAgcHVibGljIG9uRXZlbnQoY2FsbGJhY2s6IChrZXk6IHN0cmluZykgPT4gdm9pZCk6IEFsbERheUV2ZW50IHtcbiAgICAgICAgdGhpcy5fb25FdmVudCA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTc5RkJcdTUyRDVcdTMwNTdcdTMwNUZcdTY2NDJcdTMwNkVcdTUxRTZcdTc0MDZcdTMwOTJcdThBMkRcdTVCOUFcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSBcdTMwQjNcdTMwRkNcdTMwRUJcdTMwRDBcdTMwQzNcdTMwQUZcbiAgICAgKiBAcmV0dXJucyB7QWxsRGF5RXZlbnR9IFx1ODFFQVx1OEVBQlxuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUoY2FsbGJhY2s6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpOiBBbGxEYXlFdmVudCB7XG4gICAgICAgIHRoaXMuX29uTW92ZSA9IGNhbGxiYWNrO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gd2l0aG91dFBvcHVwIHtib29sZWFufSBcdTMwRERcdTMwQzNcdTMwRDdcdTMwQTJcdTMwQzNcdTMwRDdcdTMwOTJcdTk2NjRcdTU5MTZcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKiBAcmV0dXJucyB7bnVsbHxIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXHUzMDdFXHUzMDVGXHUzMDZGbnVsbFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBwaWNrQWxsRGF5RXZlbnQoZWw6IEhUTUxFbGVtZW50LCB3aXRob3V0UG9wdXA6IGJvb2xlYW4gPSBmYWxzZSk6IG51bGwgfCBIVE1MRWxlbWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yb290LmNvbnRhaW5zKGVsKSAmJiBlbC5jbG9zZXN0KHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgKHdpdGhvdXRQb3B1cCA/ICcnIDogJywgLmdjLWRheS1ncmlkLXBvcHVwJykpXG4gICAgICAgICAgICA/IGVsLmNsb3Nlc3QoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGtleSB7c3RyaW5nfSBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcbiAgICAgKiBAcGFyYW0gaG92ZXIge2Jvb2xlYW59IFx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBzZXRIb3ZlckFsbERheUV2ZW50KGtleTogc3RyaW5nLCBob3ZlcjogYm9vbGVhbikge1xuICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICB0aGlzLl9yb290LnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1hbGwtZGF5LWV2ZW50LWNvbnRhaW5lcltkYXRhLWtleT1cIicgKyBrZXkgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChob3Zlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtaG92ZXInKVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtaG92ZXInKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBDOVx1MzBFOVx1MzBDM1x1MzBCMFx1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1ODg2OFx1NzkzQVxuICAgICAqIEBwYXJhbSBlbEV2ZW50IHtIVE1MRWxlbWVudH0gXHU0RTg4XHU1QjlBXHUzMDZFRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHBhcmFtIGV2ZW50U3RhcnQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU5NThCXHU1OUNCXHU2NUU1XG4gICAgICogQHBhcmFtIGV2ZW50RW5kIHtzdHJpbmd9IFx1NEU4OFx1NUI5QVx1MzA2RVx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBjcmVhdGVQcmV2aWV3KGVsRXZlbnQ6IEhUTUxFbGVtZW50LCBldmVudFN0YXJ0OiBzdHJpbmcsIGV2ZW50RW5kOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBBcnJheS5mcm9tKHRoaXMuX3Jvb3QucXVlcnlTZWxlY3RvckFsbCgnLmdjLXdlZWssIC5nYy1hbGwtZGF5LXNlY3Rpb24nKSkuZm9yRWFjaChlbFdlZWsgPT4ge1xuICAgICAgICAgICAgY29uc3QgW3dlZWtTdGFydCwgd2Vla0VuZF0gPSB0aGlzLmdldFdlZWtQZXJpb2QoZWxXZWVrKVxuICAgICAgICAgICAgaWYgKHdlZWtTdGFydCAmJiB3ZWVrRW5kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW3BlcmlvZFN0YXJ0LCBwZXJpb2RFbmRdID0gRGF0ZVV0aWxzLm92ZXJsYXBQZXJpb2QoZXZlbnRTdGFydCwgZXZlbnRFbmQsIHdlZWtTdGFydCwgd2Vla0VuZClcbiAgICAgICAgICAgICAgICBpZiAocGVyaW9kU3RhcnQgJiYgcGVyaW9kRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsUHJldmlldyA9IGVsV2Vlay5xdWVyeVNlbGVjdG9yKCcuZ2MtZGF5W2RhdGEtZGF0ZT1cIicgKyBwZXJpb2RTdGFydCArICdcIl0gLmdjLWFsbC1kYXktZXZlbnQtcHJldmlldycpXG4gICAgICAgICAgICAgICAgICAgIGlmICh3ZWVrU3RhcnQgPD0gdGhpcy5fcmVzaXplci5nZXRHcmFiYmVkRGF0ZSgpICYmIHRoaXMuX3Jlc2l6ZXIuZ2V0R3JhYmJlZERhdGUoKSA8PSB3ZWVrRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTMwOTJcdTk1OEJcdTU5Q0JcdTMwNTdcdTMwNUZcdTkwMzFcdTMwNjdcdTMwNkZcdTMwMDFcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTMwNkVcdTdFMjZcdTRGNERcdTdGNkVcdTMwOTJcdThBQkZcdTdCQzBcdTMwNTlcdTMwOEJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3LCB0aGlzLmdldEluZGV4SW5QYXJlbnQoZWxFdmVudCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWwgPSBlbEV2ZW50LmNsb25lTm9kZSh0cnVlKSBhcyBIVE1MRWxlbWVudFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXlzID0gRGF0ZVV0aWxzLmRpZmZEYXlzKHBlcmlvZFN0YXJ0LCBwZXJpb2RFbmQpICsgMVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkanVzdFByZXZpZXcoZWwsIGRheXMsIHBlcmlvZFN0YXJ0ID09PSBldmVudFN0YXJ0LCBwZXJpb2RFbmQgPT09IGV2ZW50RW5kKVxuICAgICAgICAgICAgICAgICAgICBlbFByZXZpZXcuYXBwZW5kQ2hpbGQoZWwpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1OTAzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzBGQlx1N0Q0Mlx1NEU4Nlx1NjVFNVx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbFdlZWsge0hUTUxFbGVtZW50fSBcdTkwMzFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFx1OTAzMVx1MzA2RVx1OTU4Qlx1NTlDQlx1NjVFNVx1MzBGQlx1N0Q0Mlx1NEU4Nlx1NjVFNVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRXZWVrUGVyaW9kKGVsV2VlazogSFRNTEVsZW1lbnQpOiBBcnJheTxhbnk+IHtcbiAgICAgICAgY29uc3QgZWxEYXlzID0gZWxXZWVrLnF1ZXJ5U2VsZWN0b3JBbGwoJy5nYy1kYXk6bm90KC5nYy1kaXNhYmxlZCknKSBhcyBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PlxuICAgICAgICBpZiAoZWxEYXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbZWxEYXlzWzBdLmRhdGFzZXQuZGF0ZSwgZWxEYXlzW2VsRGF5cy5sZW5ndGggLSAxXS5kYXRhc2V0LmRhdGVdXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW251bGwsIG51bGxdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwNkJcdTU0MDhcdTMwOEZcdTMwNUJcdTMwOEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gZGF5cyB7bnVtYmVyfSBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTY1RTVcdTY1NzBcbiAgICAgKiBAcGFyYW0gaXNTdGFydCB7Ym9vbGVhbn0gXHU5MDMxXHU1MTg1XHUzMDZCXHU5NThCXHU1OUNCXHUzMDU5XHUzMDhCXHUzMDRCXHUzMDY5XHUzMDQ2XHUzMDRCXG4gICAgICogQHBhcmFtIGlzRW5kIHtib29sZWFufSBcdTkwMzFcdTUxODVcdTMwNkJcdTdENDJcdTRFODZcdTMwNTlcdTMwOEJcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWRqdXN0UHJldmlldyhlbDogSFRNTEVsZW1lbnQsIGRheXM6IG51bWJlciwgaXNTdGFydDogYm9vbGVhbiwgaXNFbmQ6IGJvb2xlYW4pIHtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtZHJhZ2dpbmcnKVxuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1zdGFydCcpXG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2djLWVuZCcpXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDc7IGkrKykge1xuICAgICAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnZ2MtJyArIGkgKyAnZGF5cycpXG4gICAgICAgIH1cbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnZ2MtJyArIGRheXMgKyAnZGF5cycpXG4gICAgICAgIGlmIChpc1N0YXJ0KSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1zdGFydCcpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRW5kKSB7XG4gICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1lbmQnKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjMwN1x1NUI5QVx1MzA1N1x1MzA1RkRPTVx1ODk4MVx1N0QyMFx1MzA0Q1x1NTE0NFx1NUYxRlx1MzA2RVx1NEUyRFx1MzA2N1x1NEY1NVx1NzU2QVx1NzZFRVx1MzA0Qlx1MzA5Mlx1NTNENlx1NUY5N1xuICAgICAqIEBwYXJhbSBlbCB7SFRNTEVsZW1lbnR9IERPTVx1ODk4MVx1N0QyMFxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFx1MzBBNFx1MzBGM1x1MzBDN1x1MzBDM1x1MzBBRlx1MzBCOVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBnZXRJbmRleEluUGFyZW50KGVsOiBIVE1MRWxlbWVudCk6IG51bWJlciB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZWwucGFyZW50Tm9kZS5jaGlsZHJlbikuaW5kZXhPZihlbClcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTYzMDdcdTVCOUFcdTMwNTdcdTMwNUZcdTY1NzBcdTMwNjBcdTMwNTFcdTdBN0FcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdThGRkRcdTUyQTBcdTMwNTlcdTMwOEJcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWRkRW1wdHlBbGxEYXlFdmVudHMoZWxQcmV2aWV3OiBIVE1MRWxlbWVudCwgY291bnQ6IG51bWJlcikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ2djLWFsbC1kYXktZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIGVsUHJldmlldy5hcHBlbmRDaGlsZChlbClcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1MzBEN1x1MzBFQ1x1MzBEM1x1MzBFNVx1MzBGQ1x1MzA5Mlx1NTI0QVx1OTY2NFxuICAgICAqL1xuICAgIHByb3RlY3RlZCByZW1vdmVQcmV2aWV3KCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtYWxsLWRheS1ldmVudC1wcmV2aWV3JykpXG4gICAgICAgICAgICAuZm9yRWFjaCgoZWw6IEVsZW1lbnQpID0+IGVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsLmNsb25lTm9kZShmYWxzZSksIGVsKSlcbiAgICB9XG59IiwgImltcG9ydCBEYXRlVGltZVNlbGVjdG9yIGZyb20gXCIuL0RhdGVUaW1lU2VsZWN0b3JcIjtcbmltcG9ydCBSZXNpemVyIGZyb20gXCIuL1Jlc2l6ZXJcIjtcbmltcG9ydCBEYXRlVXRpbHMgZnJvbSBcIi4vRGF0ZVV0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVkR3JpZFRpbWVkRXZlbnQge1xuICAgIC8qKlxuICAgICAqIFx1MzBFQlx1MzBGQ1x1MzBDOFx1ODk4MVx1N0QyMFxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgcHJpdmF0ZSBfcm9vdDogSFRNTEVsZW1lbnQ7XG5cbiAgICAvKipcbiAgICAgKiBcdTY2NDJcdTk1OTNcdTYzMDdcdTVCOUFcdTMwNkVcdTRFODhcdTVCOUFcdTMwOTJcdTUxNjhcdTMwNjZcdTU0MkJcdTMwODBcdTMwQkJcdTMwRUNcdTMwQUZcdTMwQkZcbiAgICAgKi9cbiAgICBwcml2YXRlIF9jb250YWluZXJTZWxlY3Rvcjogc3RyaW5nID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAqL1xuICAgIHByaXZhdGUgX3RpbWVTZWxlY3RvcjogRGF0ZVRpbWVTZWxlY3RvciA9IG51bGw7XG5cbiAgICAvKipcbiAgICAgKiBcdTY2NDJcdTk1OTNcdTMwNkVcdTMwRUFcdTMwQjVcdTMwQTRcdTMwQjZcdTMwRkNcbiAgICAgKi9cbiAgICBwcml2YXRlIF9yZXNpemVyOiBSZXNpemVyID0gbnVsbDtcblxuICAgIC8qKlxuICAgICAqIFx1MzBEQlx1MzBEMFx1MzBGQ1x1NEUyRFx1MzA2RVx1N0Q0Mlx1NjVFNVx1NEU4OFx1NUI5QVx1MzA2RVx1ODk4MVx1N0QyMFxuICAgICAqL1xuICAgIHByaXZhdGUgX2hvdmVyOiBzdHJpbmcgPSBudWxsO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHUzMEFGXHUzMEVBXHUzMEMzXHUzMEFGXHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25FdmVudDogKGtleTogc3RyaW5nKSA9PiB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICovXG4gICAgcHJpdmF0ZSBfb25Nb3ZlOiAoa2V5OiBzdHJpbmcsIHN0YXJ0OiBzdHJpbmcsIGVuZDogc3RyaW5nKSA9PiB2b2lkO1xuXG4gICAgLyoqXG4gICAgICogXHUzMEIzXHUzMEYzXHUzMEI5XHUzMEM4XHUzMEU5XHUzMEFGXHUzMEJGXG4gICAgICogQHBhcmFtIHJvb3QgXHUzMEVCXHUzMEZDXHUzMEM4XHU4OTgxXHU3RDIwXHUzMDAyXHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHU3NjdCXHU5MzMyXHUzMDU5XHUzMDhCXHUzMDVGXHUzMDgxXHUzMDZFXHU4OTgxXHU3RDIwXHUzMDAyXG4gICAgICogQHBhcmFtIHRpbWVTZWxlY3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHJvb3Q6IEhUTUxFbGVtZW50LCB0aW1lU2VsZWN0b3I6IERhdGVUaW1lU2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICAgIHRoaXMuX3RpbWVTZWxlY3RvciA9IHRpbWVTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICovXG4gICAgaW5pdCgpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplciA9IG5ldyBSZXNpemVyKHRoaXMuX3Jvb3QsIHRoaXMuX3RpbWVTZWxlY3RvcilcbiAgICAgICAgICAgIC5zZXRFdmVudFNlbGVjdG9yKCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyJylcbiAgICAgICAgICAgIC5zZXRIZWFkQ3Vyc29yKCdnYy1jdXJzb3Itbi1yZXNpemUnKVxuICAgICAgICAgICAgLnNldFRhaWxDdXJzb3IoJ2djLWN1cnNvci1zLXJlc2l6ZScpXG4gICAgICAgICAgICAub25FdmVudCgoa2V5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb25FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbkV2ZW50KGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vbk1vdmUoKGtleTogc3RyaW5nLCBzdGFydDogc3RyaW5nLCBlbmQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbk1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fb25Nb3ZlKGtleSwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5vblByZXZpZXcoKGVsOiBIVE1MRWxlbWVudCwgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVByZXZpZXcoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlUHJldmlldyhlbCwgc3RhcnQsIGVuZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXHUzMDkyXHU3OUZCXHU1MkQ1XHUzMDU3XHUzMDVGXHU2NjQyXHUzMDZFXHU1MUU2XHU3NDA2XG4gICAgICogQHBhcmFtIGNhbGxiYWNrXG4gICAgICovXG4gICAgcHVibGljIG9uRXZlbnQoY2FsbGJhY2s6IChrZXk6IHN0cmluZykgPT4gdm9pZCkge1xuICAgICAgICB0aGlzLl9vbkV2ZW50ID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1NzlGQlx1NTJENVx1MzA1N1x1MzA1Rlx1NjY0Mlx1MzA2RVx1NTFFNlx1NzQwNlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvbk1vdmUoY2FsbGJhY2s6IChrZXk6IHN0cmluZywgc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHZvaWQpIHtcbiAgICAgICAgdGhpcy5fb25Nb3ZlID0gY2FsbGJhY2s7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1MzBCM1x1MzBGQ1x1MzBFQlx1MzBEMFx1MzBDM1x1MzBBRlx1MzA5Mlx1NzY3Qlx1OTMzMlx1MzA1OVx1MzA4QlxuICAgICAqL1xuICAgIHB1YmxpYyByZWdpc3RlckNhbGxiYWNrcygpIHtcbiAgICAgICAgdGhpcy5fcmVzaXplci5yZWdpc3RlckNhbGxiYWNrcygpO1xuICAgICAgICB0aGlzLl9yb290LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMuX29uTW91c2VPdmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFx1NjY0Mlx1OTU5M1x1NjMwN1x1NUI5QVx1MzA2RVx1NEU4OFx1NUI5QVx1MzA5Mlx1NTE2OFx1MzA2Nlx1NTQyQlx1MzA4MFx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzA5Mlx1OEEyRFx1NUI5QVx1MzA1OVx1MzA4Qlx1MzAwMlxuICAgICAqIEBwYXJhbSBjb250YWluZXJTZWxlY3RvclxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRDb250YWluZXJTZWxlY3Rvcihjb250YWluZXJTZWxlY3Rvcjogc3RyaW5nKTogVGltZWRHcmlkVGltZWRFdmVudCB7XG4gICAgICAgIHRoaXMuX3Jlc2l6ZXIuc2V0Q29udGFpbmVyU2VsZWN0b3IoY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICB0aGlzLl9jb250YWluZXJTZWxlY3RvciA9IGNvbnRhaW5lclNlbGVjdG9yO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTdENDJcdTY1RTVcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNkVcdTMwREVcdTMwQTZcdTMwQjlcdTMwREJcdTMwRDBcdTMwRkNcdTUxRTZcdTc0MDZcbiAgICAgKiBAcGFyYW0gZSB7RXZlbnR9IFx1MzBBNFx1MzBEOVx1MzBGM1x1MzBDOFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBcdTMwQTRcdTMwRDlcdTMwRjNcdTMwQzhcdTMwNENcdTUxRTZcdTc0MDZcdTMwNTVcdTMwOENcdTMwNUZcdTMwNEJcdTMwNjlcdTMwNDZcdTMwNEJcbiAgICAgKi9cbiAgICBwcml2YXRlIF9vbk1vdXNlT3ZlcihlOiBFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5fcmVzaXplci5pc0RyYWdnaW5nKCkpIHsgLy8gXHU3RDQyXHU2NUU1XHUzMEE0XHUzMEQ5XHUzMEYzXHUzMEM4XHUzMDkyXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDAxXHU2NUU1XHU0RUQ4XHUzMDZFXHU5MDc4XHU2MjlFXHU1MUU2XHU3NDA2XHU0RTJEXHUzMDZGXHUzMDAxXHUzMERCXHUzMEQwXHUzMEZDXHUzMDU3XHUzMDZBXHUzMDQ0XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLnBpY2tFdmVudChlLnRhcmdldCBhcyBIVE1MRWxlbWVudCk7XG4gICAgICAgIGNvbnN0IGtleSA9IGVsID8gZWwuZGF0YXNldC5rZXkgOiBudWxsO1xuICAgICAgICBpZiAoa2V5ICE9PSB0aGlzLl9ob3Zlcikge1xuICAgICAgICAgICAgdGhpcy5zZXRIb3ZlckFsbERheUV2ZW50KHRoaXMuX2hvdmVyLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnNldEhvdmVyQWxsRGF5RXZlbnQodGhpcy5faG92ZXIgPSBrZXksIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDkyXHU1M0Q2XHU1Rjk3XG4gICAgICogQHBhcmFtIGVsIHtIVE1MRWxlbWVudH0gRE9NXHU4OTgxXHU3RDIwXG4gICAgICogQHJldHVybnMge251bGx8SFRNTEVsZW1lbnR9IFx1NEU4OFx1NUI5QVx1MzA2RURPTVx1ODk4MVx1N0QyMFx1MzA3RVx1MzA1Rlx1MzA2Rm51bGxcbiAgICAgKi9cbiAgICBwcml2YXRlIHBpY2tFdmVudChlbDogSFRNTEVsZW1lbnQpOiBudWxsIHwgSFRNTEVsZW1lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5fcm9vdC5jb250YWlucyhlbCkgJiYgZWwuY2xvc2VzdCh0aGlzLl9jb250YWluZXJTZWxlY3RvcilcbiAgICAgICAgICAgID8gZWwuY2xvc2VzdCgnLmdjLXRpbWVkLWV2ZW50LWNvbnRhaW5lcicpXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU2MzA3XHU1QjlBXHUzMDU1XHUzMDhDXHUzMDVGXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMERCXHUzMEQwXHUzMEZDXHUzMDkyXHU4QTJEXHU1QjlBXHUzMDU5XHUzMDhCXG4gICAgICogQHBhcmFtIGtleSB7c3RyaW5nfSBcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwNkVcdTMwQURcdTMwRkNcbiAgICAgKiBAcGFyYW0gaG92ZXIge2Jvb2xlYW59IFx1MzBEQlx1MzBEMFx1MzBGQ1x1MzA1OVx1MzA4Qlx1MzA0Qlx1MzA2OVx1MzA0Nlx1MzA0QlxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0SG92ZXJBbGxEYXlFdmVudChrZXk6IHN0cmluZywgaG92ZXI6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAgICAgdGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnQtY29udGFpbmVyW2RhdGEta2V5PVwiJyArIGtleSArICdcIl0nKVxuICAgICAgICAgICAgICAgIC5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhvdmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1ob3ZlcicpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHUzMEM5XHUzMEU5XHUzMEMzXHUzMEIwXHU0RTJEXHUzMDZFXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU4ODY4XHU3OTNBXG4gICAgICogQHBhcmFtIGVsRXZlbnQge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gZXZlbnRTdGFydCB7c3RyaW5nfSBcdTRFODhcdTVCOUFcdTMwNkVcdTk1OEJcdTU5Q0JcdTY1RTVcbiAgICAgKiBAcGFyYW0gZXZlbnRFbmQge3N0cmluZ30gXHU0RTg4XHU1QjlBXHUzMDZFXHU3RDQyXHU0RTg2XHU2NUU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVQcmV2aWV3KGVsRXZlbnQ6IEhUTUxFbGVtZW50LCBldmVudFN0YXJ0OiBzdHJpbmcsIGV2ZW50RW5kOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcmVzb3VyY2VJZCA9IGVsRXZlbnQuZGF0YXNldC5yZXNvdXJjZUlkO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX2NvbnRhaW5lclNlbGVjdG9yICsgJyAuZ2MtZGF5W2RhdGEtcmVzb3VyY2UtaWQ9XCInICsgcmVzb3VyY2VJZCArICdcIl0nKSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChlbERheTogSFRNTEVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBbZGF5U3RhcnQsIGRheUVuZF0gPSBbZWxEYXkuZGF0YXNldC5zdGFydFRpbWUsIGVsRGF5LmRhdGFzZXQuZW5kVGltZV07XG4gICAgICAgICAgICAgICAgaWYgKGRheVN0YXJ0ICYmIGRheUVuZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbcGVyaW9kU3RhcnQsIHBlcmlvZEVuZF0gPSBEYXRlVXRpbHMub3ZlcmxhcFBlcmlvZChldmVudFN0YXJ0LCBldmVudEVuZCwgZGF5U3RhcnQsIGRheUVuZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwZXJpb2RTdGFydCAmJiBwZXJpb2RFbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFtzbG90LCBoZWlnaHRdID0gdGhpcy5nZXRTbG90QW5kSGVpZ2h0KGVsRGF5LCBwZXJpb2RTdGFydCwgcGVyaW9kRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVsID0gZWxFdmVudC5jbG9uZU5vZGUodHJ1ZSkgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkanVzdFByZXZpZXcoZWwsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzbG90LnF1ZXJ5U2VsZWN0b3IoJy5nYy10aW1lZC1ldmVudC1wcmV2aWV3JykuYXBwZW5kQ2hpbGQoZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTk1OEJcdTU5Q0JcdTMwQjlcdTMwRURcdTMwQzNcdTMwQzhcdTMwNjhcdTlBRDhcdTMwNTVcdTMwOTJcdTUzRDZcdTVGOTdcbiAgICAgKlxuICAgICAqIEBwYXJhbSBlbERheSB7SFRNTEVsZW1lbnR9IFx1NjVFNVx1NEVEOFx1MzA2RURPTVx1ODk4MVx1N0QyMFxuICAgICAqIEBwYXJhbSBzdGFydFRpbWUge3N0cmluZ30gXHU5NThCXHU1OUNCXHU2NjQyXHU5NTkzXG4gICAgICogQHBhcmFtIGVuZFRpbWUge3N0cmluZ30gXHU3RDQyXHU0RTg2XHU2NjQyXHU5NTkzXG4gICAgICogQHJldHVybnMge1tIVE1MRWxlbWVudCwgbnVtYmVyXX0gXHU5NThCXHU1OUNCXHUzMEI5XHUzMEVEXHUzMEMzXHUzMEM4XHUzMDY4XHU5QUQ4XHUzMDU1XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRTbG90QW5kSGVpZ2h0KGVsRGF5OiBIVE1MRWxlbWVudCwgc3RhcnRUaW1lOiBzdHJpbmcsIGVuZFRpbWU6IHN0cmluZyk6IFtIVE1MRWxlbWVudCwgbnVtYmVyXSB7XG4gICAgICAgIGNvbnN0IHNsb3RzID0gZWxEYXkucXVlcnlTZWxlY3RvckFsbCgnLmdjLXNsb3QnKSBhcyBOb2RlTGlzdE9mPEhUTUxFbGVtZW50PjtcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSAwO1xuICAgICAgICBsZXQgZW5kSW5kZXggPSBzbG90cy5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2xvdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChzbG90c1tpXS5kYXRhc2V0LnRpbWUgPD0gc3RhcnRUaW1lKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2xvdHNbaV0uZGF0YXNldC50aW1lIDw9IGVuZFRpbWUpIHtcbiAgICAgICAgICAgICAgICBlbmRJbmRleCA9IGk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtzbG90c1tzdGFydEluZGV4XSwgZW5kSW5kZXggLSBzdGFydEluZGV4XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBcdTMwQzlcdTMwRTlcdTMwQzNcdTMwQjBcdTRFMkRcdTMwNkVcdTdENDJcdTY1RTVcdTRFODhcdTVCOUFcdTMwOTJcdTMwRDdcdTMwRUNcdTMwRDNcdTMwRTVcdTMwRkNcdTMwNkJcdTU0MDhcdTMwOEZcdTMwNUJcdTMwOEJcbiAgICAgKiBAcGFyYW0gZWwge0hUTUxFbGVtZW50fSBcdTRFODhcdTVCOUFcdTMwNkVET01cdTg5ODFcdTdEMjBcbiAgICAgKiBAcGFyYW0gdGltZVNsb3RIZWlnaHQge251bWJlcn0gXHUzMEI5XHUzMEVEXHUzMEMzXHUzMEM4XHU2NTcwXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGp1c3RQcmV2aWV3KGVsOiBIVE1MRWxlbWVudCwgdGltZVNsb3RIZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdnYy1kcmFnZ2luZycpO1xuICAgICAgICBlbC5zdHlsZS5zZXRQcm9wZXJ0eSgnLS1nYy10aW1lZC1ldmVudC1oZWlnaHQnLCAodGltZVNsb3RIZWlnaHQgKiAxMDApICsgJyUnKTtcbiAgICAgICAgcmV0dXJuIGVsXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXHUzMDZFXHUzMEQ3XHUzMEVDXHUzMEQzXHUzMEU1XHUzMEZDXHUzMDkyXHU1MjRBXHU5NjY0XG4gICAgICovXG4gICAgcHJpdmF0ZSByZW1vdmVQcmV2aWV3KCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIEFycmF5LmZyb20odGhpcy5fcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtdGltZWQtZXZlbnQtcHJldmlldycpKVxuICAgICAgICAgICAgLmZvckVhY2goKGVsOiBIVE1MRWxlbWVudCkgPT4gZWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoZWwuY2xvbmVOb2RlKGZhbHNlKSwgZWwpKTtcbiAgICB9XG59IiwgImltcG9ydCBEYXRlVGltZVNlbGVjdG9yIGZyb20gXCIuL21vZHVsZXMvRGF0ZVRpbWVTZWxlY3Rvci5qc1wiO1xuaW1wb3J0IEFsbERheUV2ZW50IGZyb20gXCIuL21vZHVsZXMvQWxsRGF5RXZlbnQuanNcIjtcbmltcG9ydCBUaW1lZEdyaWRUaW1lZEV2ZW50IGZyb20gXCIuL21vZHVsZXMvVGltZWRHcmlkVGltZWRFdmVudC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUaW1lR3JpZCgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NUU1XHU0RUQ4XHUzMDZFXHUzMEJCXHUzMEVDXHUzMEFGXHUzMEJGXHUzMEZDXG4gICAgICAgICAqL1xuICAgICAgICBkYXRlU2VsZWN0b3I6IERhdGVUaW1lU2VsZWN0b3IsLy9zZWxlY3Rvcih0aGlzLiRlbCwgJy5nYy10aW1lLWdyaWQnLCAnLmdjLWRheScsICdkYXRlJyksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFx1NjY0Mlx1OTU5M1x1MzA2RVx1MzBCQlx1MzBFQ1x1MzBBRlx1MzBCRlx1MzBGQ1xuICAgICAgICAgKi9cbiAgICAgICAgdGltZVNlbGVjdG9yOiBEYXRlVGltZVNlbGVjdG9yLC8vc2VsZWN0b3IodGhpcy4kZWwsICcuZ2MtdGltZS1ncmlkJywgJy5nYy1zbG90JywgJ3RpbWUnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU3RDQyXHU2NUU1XHU0RTg4XHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICBhbGxEYXlFdmVudDogQWxsRGF5RXZlbnQsLy9hbGxEYXlFdmVudCh0aGlzLiRlbCwgJy5nYy10aW1lLWdyaWQnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHU2NjQyXHU5NTkzXHU2MzA3XHU1QjlBXHUzMDZFXHU0RTg4XHU1QjlBXG4gICAgICAgICAqL1xuICAgICAgICB0aW1lZEV2ZW50OiBUaW1lZEdyaWRUaW1lZEV2ZW50LC8vdGltZWRFdmVudCh0aGlzLiRlbCwgJy5nYy10aW1lLWdyaWQnKSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogXHUzMEFCXHUzMEVDXHUzMEYzXHUzMEMwXHUzMEZDXHUzMDZFXHU1MjFEXHU2NzFGXHU1MzE2XG4gICAgICAgICAqL1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5kYXRlU2VsZWN0b3IgPSBuZXcgRGF0ZVRpbWVTZWxlY3Rvcih0aGlzLiRlbClcbiAgICAgICAgICAgICAgICAuc2V0Q29udGFpbmVyU2VsZWN0b3IoJy5nYy1hbGwtZGF5LXNlY3Rpb24nKVxuICAgICAgICAgICAgICAgIC5zZXRFbGVtZW50U2VsZWN0b3IoJy5nYy1kYXknKVxuICAgICAgICAgICAgICAgIC5zZXRQcm9wZXJ0eU5hbWUoJ2RhdGUnKVxuICAgICAgICAgICAgICAgIC5vblNlbGVjdCgoc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRGF0ZShzdGFydCArICcgMDA6MDA6MDAnLCBlbmQgKyAnIDIzOjU5OjU5JylcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMudGltZVNlbGVjdG9yID0gbmV3IERhdGVUaW1lU2VsZWN0b3IodGhpcy4kZWwpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtdGltZWQtc2VjdGlvbicpXG4gICAgICAgICAgICAgICAgLnNldEVsZW1lbnRTZWxlY3RvcignLmdjLXNsb3QnKVxuICAgICAgICAgICAgICAgIC5zZXRQcm9wZXJ0eU5hbWUoJ3RpbWUnKVxuICAgICAgICAgICAgICAgIC5vblNlbGVjdCgoc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRGF0ZShzdGFydCwgdGhpcy50aW1lU2VsZWN0b3IuZ2V0RWxlbWVudEJ5RGF0ZVRpbWUoZW5kKS5kYXRhc2V0LnRpbWVFbmQpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmFsbERheUV2ZW50ID0gbmV3IEFsbERheUV2ZW50KHRoaXMuJGVsLCB0aGlzLmRhdGVTZWxlY3RvcilcbiAgICAgICAgICAgICAgICAuc2V0Q29udGFpbmVyU2VsZWN0b3IoJy5nYy1hbGwtZGF5LXNlY3Rpb24nKVxuICAgICAgICAgICAgICAgIC5vbkV2ZW50KChrZXkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy4kd2lyZS5vbkV2ZW50KGtleSlcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5vbk1vdmUoKGtleSwgc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uTW92ZShrZXksIHN0YXJ0LCBlbmQpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnRpbWVkRXZlbnQgPSBuZXcgVGltZWRHcmlkVGltZWRFdmVudCh0aGlzLiRlbCwgdGhpcy50aW1lU2VsZWN0b3IpXG4gICAgICAgICAgICAgICAgLnNldENvbnRhaW5lclNlbGVjdG9yKCcuZ2MtdGltZWQtc2VjdGlvbicpXG4gICAgICAgICAgICAgICAgLm9uRXZlbnQoKGtleSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiR3aXJlLm9uRXZlbnQoa2V5KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLm9uTW92ZSgoa2V5LCBzdGFydCwgZW5kKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJHdpcmUub25Nb3ZlKGtleSwgc3RhcnQsIGVuZClcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gXHUzMEIzXHUzMEZDXHUzMEVCXHUzMEQwXHUzMEMzXHUzMEFGXHUzMDZFXHU3NjdCXHU5MzMyXG4gICAgICAgICAgICB0aGlzLmFsbERheUV2ZW50LnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVkRXZlbnQucmVnaXN0ZXJDYWxsYmFja3MoKTtcbiAgICAgICAgICAgIHRoaXMuZGF0ZVNlbGVjdG9yLnJlZ2lzdGVyQ2FsbGJhY2tzKCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVTZWxl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
