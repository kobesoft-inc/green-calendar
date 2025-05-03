import DateUtils from './DateUtils'
import Selector from './Selector'

export default class Resizer {
  /**
   * ルート要素
   * @protected
   */
  protected _root: HTMLElement

  /**
   * 選択対象の要素を全て含むセレクタ
   * @protected
   */
  protected _containerSelector: string = null

  /**
   * リサイズ対象の予定のセレクター
   */
  protected _eventSelector: string = null

  /**
   * 日付セレクター・時間セレクター
   */
  protected _selector: Selector = null

  /**
   * ヘッダーカーソル
   */
  protected _headCursor: string = 'gc-cursor-w-resize'

  /**
   * テールカーソル
   */
  protected _tailCursor: string = 'gc-cursor-e-resize'

  /**
   * ドラッグ中のDOM要素
   */
  protected _dragging: HTMLElement = null

  /**
   * ドラッグ中の初期の開始位置
   */
  protected _draggingStart: string = null

  /**
   * ドラッグ中の初期の終了位置
   */
  protected _draggingEnd: string = null

  /**
   * ドラッグ中に、前回ホバーした値
   */
  protected _draggingValue: string = null

  /**
   * ドラッグ中の移動量。移動量が少ないと、クリックと判断する
   */
  protected _draggingCount: number = 0

  /**
   * ドラッグ中の掴んだ位置（日付）
   */
  protected _grabbed: string

  /**
   * 開始位置を掴んでいるかどうか
   */
  protected _isGrabbingHead: boolean = false

  /**
   * 終了位置を掴んでいるかどうか
   */
  protected _isGrabbingTail: boolean = false

  /**
   * 一日の時間間隔
   * @protected
   */
  protected _unit: number = 1

  /**
   * クリックした時の処理
   */
  protected _onEvent: (key: string) => void = null

  /**
   * 移動した時の処理
   */
  protected _onMove: (key: string, start: string, end: string) => void = null

  /**
   * プレビューを生成する処理
   */
  protected _onPreview: (el: HTMLElement, start: string, end: string) => void =
    null

  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   * @param selector
   */
  constructor(root: HTMLElement, selector: Selector) {
    this._root = root
    this._selector = selector
  }

  /**
   * コールバックを登録する
   */
  public registerCallbacks(): void {
    this._root.addEventListener('mousedown', this._onMouseDown.bind(this))
    this._root.addEventListener('mousemove', this._onMouseMove.bind(this))
    this._root.addEventListener('mouseup', this._onMouseUp.bind(this))
  }

  /**
   * マウスダウンイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を開始したかどうか
   */
  protected _onMouseDown(e: MouseEvent): void {
    const el = this.pickEvent(e.target as Element)
    if (el) {
      // 終日予定の変形を設定
      const canMove = el.dataset.canMove === 'true'
      const canResize = el.dataset.canResize === 'true'
      this._isGrabbingHead = this._isGrabbingTail = canMove || canResize
      if (canResize) {
        if (this.hitHead(e.target as Element)) {
          // 終日予定の先頭部分に当たった場合、終了日は固定
          this._isGrabbingTail = false
        }
        if (this.hitTail(e.target as Element)) {
          // 終日予定の末尾部分に当たった場合、開始日は固定
          this._isGrabbingHead = false
        }
      }

      // 掴んだ日付
      this._grabbed = this._selector.pickValueByPosition(e.x, e.y)

      // ドラッグ中のDOM要素
      this._dragging = el
      this._draggingStart = this._dragging.dataset.start
      this._draggingEnd = this._dragging.dataset.end

      // 現在の日付を記録
      this._draggingValue = null

      if (this.isResizing()) {
        // ドラッグ中の終日予定のクラスを設定（表示を消す）
        this.setDraggingClass(this._dragging.dataset.key, true)

        // ドラッグ中の終日予定のプレビューを表示
        this.updatePreview(this._grabbed)

        // カーソルを設定
        this.updateCursor()
      }

      // ドラッグ中の終日予定の移動量を初期化
      this._draggingCount = 0

      // イベントが処理された
      e.stopImmediatePropagation()
    }
  }

  /**
   * マウスムーブイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を終了したかどうか
   */
  protected _onMouseMove(e: MouseEvent): void {
    if (this._dragging) {
      // ドラッグ中の終日予定のプレビューを表示
      if (this.isResizing()) {
        const value = this._selector.pickValueByPosition(e.x, e.y)
        if (value !== null) {
          this.updatePreview(value)
        }
      }

      // マウスクリックイベントのために移動量を記録
      this._draggingCount++

      // イベントが処理された
      e.stopImmediatePropagation()
    }
  }

  /**
   * マウスアップイベント
   * @param e {MouseEvent} イベント
   * @returns {boolean} 移動を終了したかどうか
   */
  protected _onMouseUp(e: MouseEvent): void {
    if (this._dragging) {
      const key = this._dragging.dataset.key
      const value = this._selector.pickValueByPosition(e.x, e.y)
      if (value !== null && this._grabbed !== value && this.isResizing()) {
        const [start, end] = this.drag(value)
        if (this._onMove && start !== null && end !== null) {
          this._onMove(key, start, end)
        }
      } else if (this._draggingCount < 3 || !this.isResizing()) {
        if (this._dragging.dataset.canClick === 'true') {
          if (this._onEvent) {
            this._onEvent(key)
          }
        }
      } else {
        if (this._onPreview) {
          this._onPreview(this._dragging, null, null)
        }
        this.setDraggingClass(key, false)
      }
      this._dragging = null
      this._isGrabbingHead = this._isGrabbingTail = null
      this.updateCursor()

      // イベントが処理された
      e.stopImmediatePropagation()
    }
  }

  /**
   * 選択対象の要素を全て含むセレクタを設定
   * @param selector
   */
  public setContainerSelector(selector: string): this {
    this._containerSelector = selector
    return this
  }

  /**
   * リサイズ対象の予定のセレクターを設定
   * @param selector
   */
  public setEventSelector(selector: string): this {
    this._eventSelector = selector
    return this
  }

  /**
   * 頭部分を掴んでいる時のカーソルを設定
   * @param cursor
   */
  public setHeadCursor(cursor: string): this {
    this._headCursor = cursor
    return this
  }

  /**
   * 末尾部分を掴んでいる時のカーソルを設定
   * @param cursor
   */
  public setTailCursor(cursor: string): this {
    this._tailCursor = cursor
    return this
  }

  /**
   * 一日の時間間隔を設定する
   * @param unit {number} 一日の時間間隔
   */
  public setUnit(unit: number): this {
    this._unit = unit
    return this
  }

  /**
   * クリックした時の処理を設定
   * @param callback
   */
  public onEvent(callback: (key: string) => void): this {
    this._onEvent = callback
    return this
  }

  /**
   * 移動した時の処理を設定
   * @param callback
   */
  public onMove(
    callback: (key: string, start: string, end: string) => void,
  ): this {
    this._onMove = callback
    return this
  }

  /**
   * プレビューを生成する処理を設定
   * @param callback
   */
  public onPreview(
    callback: (el: HTMLElement, start: string, end: string) => void,
  ): this {
    this._onPreview = callback
    return this
  }

  /**
   * ドラッグ中かどうか
   * @returns {boolean} ドラッグ中かどうか
   */
  public isDragging(): boolean {
    return this._dragging !== null
  }

  /**
   * 移動・リサイズ中かどうか
   * @returns {boolean} 移動・リサイズ中かどうか
   */
  public isResizing(): boolean {
    return this._isGrabbingHead || this._isGrabbingTail
  }

  /**
   * 掴んだ日付を取得
   */
  public getGrabbedDate(): string {
    return this._grabbed
  }

  /**
   * 予定を取得
   * @param el {HTMLElement} DOM要素
   * @returns {null|HTMLElement} 予定のDOM要素またはnull
   */
  protected pickEvent(el: Element): HTMLElement | null {
    return this._root.contains(el) && el.closest(this._containerSelector)
      ? el.closest(this._eventSelector)
      : null
  }

  /**
   * 先頭部分に当たったかどうか
   * @param el {HTMLElement} 判定する要素
   * @returns {boolean} 先頭部分に当たったかどうか
   */
  protected hitHead(el: Element): boolean {
    return !!el.closest('.gc-head')
  }

  /**
   * 末尾部分に当たったかどうか
   * @param el {HTMLElement} 判定する要素
   * @returns {boolean} 末尾部分に当たったかどうか
   */
  protected hitTail(el: Element): boolean {
    return !!el.closest('.gc-tail')
  }

  /**
   * ドラッグ中のクラスを設定する
   */
  protected setDraggingClass(key: string, dragging: boolean) {
    this._root
      .querySelectorAll(this._eventSelector + '[data-key="' + key + '"]')
      .forEach((el) => {
        if (dragging) {
          el.classList.add('gc-dragging')
        } else {
          el.classList.remove('gc-dragging')
        }
      })
  }

  /**
   * 現在、ドラッグ中の予定は、終日予定かどうか
   */
  public isAllDayDragging(): boolean {
    return this._dragging?.dataset.allDay === 'true'
  }

  /**
   * 指定されたパラメータが整数値かどうか
   */
  protected isNumber(value: string): boolean {
    return /^\d+$/.test(value)
  }

  /**
   * 変更後の期間を取得する
   * @param value {string} マウスの位置の日付
   * @returns {Array} 変更後の期間
   */
  protected drag(value: string): Array<any> {
    return this.isNumber(value)
      ? this.dragNumber(value)
      : this.dragDateTime(value)
  }

  /**
   * 日時のパラメータに対して、変更後の期間を取得する
   * @param value {string} マウスの位置の日付
   * @returns {Array} 変更後の期間
   */
  protected dragDateTime(value: string): Array<any> {
    const diff = DateUtils.diffInMilliseconds(this._grabbed, value)
    let start = DateUtils.toDateTimeString(
      Date.parse(this._draggingStart) + (this._isGrabbingHead ? diff : 0),
    )
    let end = DateUtils.toDateTimeString(
      Date.parse(this._draggingEnd) + (this._isGrabbingTail ? diff : 0),
    )
    start = start.substring(0, this._grabbed.length)
    end = end.substring(0, this._grabbed.length)
    if (start > end) {
      if (this._isGrabbingHead) {
        start = end
      }
      if (this._isGrabbingTail) {
        end = start
      }
    }
    return [start, end]
  }

  /**
   * 整数値のパラメータに対して、変更後の期間を取得する
   * @param value {string} マウスの位置の日付
   * @returns {Array} 変更後の期間
   */
  protected dragNumber(value: string): Array<any> {
    const diff = parseInt(value) - parseInt(this._grabbed)
    let start =
      parseInt(this._draggingStart) + (this._isGrabbingHead ? diff : 0)
    let end = parseInt(this._draggingEnd) + (this._isGrabbingTail ? diff : 0)
    if (this.isAllDayDragging()) {
      start = Math.floor(start / this._unit) * this._unit
      end = Math.floor(end / this._unit) * this._unit
    }
    if (start > end) {
      if (this._isGrabbingHead) {
        start = end
      }
      if (this._isGrabbingTail) {
        end = start
      }
    }
    return [start, end]
  }

  /**
   * 終日予定をドラッグ中のカーソルを更新する
   */
  protected updateCursor() {
    this._root.classList.remove(this._headCursor, this._tailCursor)
    if (this._isGrabbingHead && this._isGrabbingTail) {
      this._root.classList.add('gc-cursor-move')
    } else if (this._isGrabbingHead) {
      this._root.classList.add(this._headCursor)
    } else if (this._isGrabbingTail) {
      this._root.classList.add(this._tailCursor)
    }
  }

  /**
   * ドラッグ中の終日予定のプレビューを更新する
   * @param value {string} マウスの位置の日付
   */
  protected updatePreview(value: string): void {
    if (this._draggingValue !== value) {
      const [start, end] = this.drag(value)
      if (this._onPreview) {
        this._onPreview(this._dragging, start, end)
      }
      this._draggingValue = value
    }
  }

  /**
   * 頭部分を掴んでいるかどうか
   * @protected
   */
  protected isGrabbingHead(): boolean {
    return this._isGrabbingHead
  }

  /**
   * 末尾部分を掴んでいるかどうか
   * @protected
   */
  protected isGrabbingTail(): boolean {
    return this._isGrabbingTail
  }

  /**
   * 頭部分と末尾部分を掴んでいるかどうか
   * @protected
   */
  protected isGrabbingBody(): boolean {
    return this._isGrabbingHead && this._isGrabbingTail
  }
}
