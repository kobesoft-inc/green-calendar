import DateUtils from './DateUtils'
import Selector from './Selector'

export default class DayGridTimedEvent {
  /**
   * ルート要素
   * @private
   */
  private _root: HTMLElement

  /**
   * 日付のセレクター
   */
  private _dateSelector: Selector

  /**
   * Alpine.jsのインスタンス
   */
  private _alpine: any

  /**
   * ドラッグ中の時間指定の予定のDOM要素
   */
  private _dragging: HTMLElement = null

  /**
   * 予定をクリックした時の処理
   */
  private _onEvent: (key: string) => void

  /**
   * 予定を移動した時の処理
   */
  private _onMove: (key: string, start: string, end: string) => void

  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   * @param dateSelector
   * @param alpine
   */
  constructor(root: HTMLElement, dateSelector: Selector, alpine: any) {
    this._root = root
    this._dateSelector = dateSelector
    this._alpine = alpine
  }

  /**
   * コールバックを登録する
   */
  public registerCallbacks() {
    this._root.addEventListener('click', this._onClick.bind(this))
    this._root.addEventListener('mousedown', this._onMouseDown.bind(this))
    this._root.addEventListener('dragstart', this._onDragStart.bind(this))
    this._root.addEventListener('dragover', this._onDragOver.bind(this))
    this._root.addEventListener('drop', this._onDrop.bind(this))
    this._root.addEventListener('dragend', this._onDragEnd.bind(this))
  }

  /**
   * 予定をクリックした時の処理
   *
   * @param onEvent {Function} クリックイベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  public onEvent(onEvent: (key: string) => void): DayGridTimedEvent {
    this._onEvent = onEvent
    return this
  }

  /**
   * 予定を移動した時の処理
   *
   * @param onMove {Function} 予定を移動した時の処理
   * @returns {DayGridTimedEvent} インスタンス
   */
  public onMove(
    onMove: (key: string, start: string, end: string) => void,
  ): DayGridTimedEvent {
    this._onMove = onMove
    return this
  }

  /**
   * クリックイベント
   *
   * @param e {MouseEvent} クリックイベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  private _onClick(e: MouseEvent): void {
    const el = this.pickEvent(e.target as HTMLElement)
    if (el?.dataset.canClick === 'true') {
      const key = el?.dataset.key
      if (key) {
        // 予定をクリックした場合
        if (this._onEvent) {
          this._onEvent(key)
        }
        e.stopImmediatePropagation()
      }
    }
  }

  /**
   * マウスを押した時の処理
   * @param e
   * @private
   */
  private _onMouseDown(e: MouseEvent): void {
    if (this.pickEvent(e.target as HTMLElement)) {
      e.stopImmediatePropagation()
    }
  }

  /**
   * ドラッグイベント
   * @param e {DragEvent} イベント
   */
  private _onDragStart(e: DragEvent): void {
    const el = this.pickEvent(e.target as HTMLElement)
    if (el) {
      this._dragging = el
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', el.dataset.key)
      this._alpine.$nextTick(() => {
        this.addDraggingClass()
      })
    }
  }

  /**
   * ドラッグ中の要素が要素に乗った時のイベント
   * @param e {DragEvent} イベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  private _onDragOver(e: DragEvent): void {
    const date = this._dateSelector.pickValueByPosition(e.x, e.y)
    if (date) {
      this._dateSelector.select(date)
      e.preventDefault()
    }
  }

  /**
   * ドロップイベント
   * @param e {DragEvent} イベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  private _onDrop(e: DragEvent): void {
    // ドロップ処理を実行
    const date = this._dateSelector.pickValueByPosition(e.x, e.y)
    const key = e.dataTransfer.getData('text/plain')
    if (date) {
      const days = DateUtils.diffDays(this._dragging.dataset.start, date)
      if (days !== 0) {
        const start = DateUtils.toDateTimeString(
          DateUtils.addDays(this._dragging.dataset.start, days),
        )
        const end = DateUtils.toDateTimeString(
          DateUtils.addDays(this._dragging.dataset.end, days),
        )
        this._dragging = null
        if (this._onMove) {
          this._onMove(key, start, end)
        }
      }
    }
  }

  /**
   * ドラッグ中の要素が要素から外れた時のイベント
   * @param e {DragEvent} イベント
   * @returns {boolean} イベントが処理されたかどうか
   */
  private _onDragEnd(e: DragEvent): void {
    // 選択範囲を解除
    this._dateSelector.deselect()

    // ドラッグ中の要素を元に戻す
    if (this._dragging) {
      this._dragging.classList.remove('gc-dragging')
      this._dragging = null
    }
  }

  /**
   * 指定したDOM要素の近くの予定のキーを取得
   * @param el {HTMLElement} DOM要素
   * @returns {HTMLElement} 予定のDOM要素
   */
  private pickEvent(el: HTMLElement): HTMLElement {
    return this._root.contains(el) &&
      el.closest('.gc-day-grid, .gc-day-grid-popup')
      ? (el.closest('.gc-timed-event-container') as HTMLElement)
      : null
  }

  /**
   * ドラッグ中の要素をドラッグ中の状態にする
   *
   * @returns {void}
   */
  private addDraggingClass(): void {
    if (this._dragging) {
      this._dragging.classList.add('gc-dragging')
    }
  }
}
