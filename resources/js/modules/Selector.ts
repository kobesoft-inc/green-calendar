type DrawCallback = (begin: string, end: string, resources: Array<string>) => void
type SelectCallback = (begin: string, end: string, resources: Array<string>) => void

/**
 * DateTimeSelector
 *
 * カレンダーの日付・時間の選択機能を提供するために、マウスの操作による選択範囲の指定を行う。
 */
export default class Selector {
  /**
   * ルート要素
   * @private
   */
  private _root: HTMLElement

  /**
   * 選択対象の要素を全て含むセレクタ
   * @private
   */
  private _containerSelector: string = null

  /**
   * 選択対象の要素のセレクタ
   * @private
   */
  private _elementSelector: string = null

  /**
   * 選択対象の要素の日付・時間を持つプロパティ名
   * @private
   */
  private _propertyName: string = null

  /**
   * 日付の選択範囲の開始位置
   * @private
   */
  private _dateSelectionStart: string = null

  /**
   * 日付の選択範囲の終了位置
   * @private
   */
  private _dateSelectionEnd: string = null

  /**
   * リソースの選択範囲の開始位置
   * @private
   */
  private _resourceSelectionStart: string = null

  /**
   * リソースの選択範囲の終了位置
   */
  private _resourceSelectionEnd: string = null

  /**
   * 選択処理が有効かどうか
   * @private
   */
  private _enabled: boolean = true

  /**
   * 日付を複数選択が有効かどうか
   * @private
   */
  private _multipleDates: boolean = false

  /**
   * リソースを複数選択が有効かどうか
   * @private
   */
  private _multipleResources: boolean = false

  /**
   * リソースのIDの配列
   * @private
   */
  private _resourceIds: Array<string> = null

  /**
   * 選択範囲を描画するコールバック
   */
  private _onDraw: DrawCallback = null

  /**
   * 選択範囲が変更された時のコールバック
   * @private
   */
  private _onSelect: SelectCallback = null

  /**
   * コンストラクタ
   * @param root ルート要素。イベントを登録するための要素。
   */
  constructor(root: HTMLElement) {
    this._root = root
  }

  /**
   * コールバックを登録する
   */
  public registerCallbacks() {
    this._root.addEventListener('mousedown', this._mouseDown.bind(this))
    this._root.addEventListener('mousemove', this._mouseMove.bind(this))
    this._root.addEventListener('mouseup', this._mouseUp.bind(this))
  }

  /**
   * 選択対象の要素を全て含むセレクタを設定する。
   * @param containerSelector
   */
  public setContainerSelector(containerSelector: string): Selector {
    this._containerSelector = containerSelector
    return this
  }

  /**
   * 選択対象の要素のセレクタを設定する。
   * @param elementSelector
   */
  public setElementSelector(elementSelector: string): Selector {
    this._elementSelector = elementSelector
    return this
  }

  /**
   * 選択対象の要素の日付・時間を持つプロパティ名を設定する。(data-dateなら、date)
   * @param propertyName
   */
  public setPropertyName(propertyName: string): Selector {
    this._propertyName = propertyName
    return this
  }

  /**
   * 選択処理が有効かどうかを設定する。
   * @param enabled
   */
  public setEnabled(enabled: boolean): Selector {
    this._enabled = enabled
    return this
  }

  /**
   * 日付を複数選択が有効かどうかを設定する。
   * @param multiple
   */
  public setMultipleDates(multiple: boolean): Selector {
    this._multipleDates = multiple
    return this
  }

  /**
   * リソースを複数選択が有効かどうかを設定する。
   * @param multiple
   * @param resourceIds
   */
  public setMultipleResources(
    multiple: boolean,
    resourceIds: Array<string> | null,
  ): Selector {
    this._multipleResources = multiple
    this._resourceIds = resourceIds
    return this
  }

  /**
   * 選択範囲を描画するコールバックを設定する。
   * @param onDraw
   */
  public onDraw(onDraw: DrawCallback): Selector {
    this._onDraw = onDraw
    return this
  }

  /**
   * 選択範囲が変更された時のコールバックを設定する。
   * @param onSelect
   */
  public onSelect(onSelect: SelectCallback): Selector {
    this._onSelect = onSelect
    return this
  }

  /**
   * 選択範囲の開始位置を設定する。
   * @param value 日付・時間
   * @param resource リソースID
   */
  public select(value: string, resource: string = null): Selector {
    this._dateSelectionStart = this._dateSelectionEnd = value
    this._resourceSelectionStart = this._resourceSelectionEnd = resource
    this.update()
    return this
  }

  /**
   * 選択範囲の終了位置を設定する。
   * @param value 日付・時間
   * @param resource リソースID
   */
  public selectEnd(value: string, resource: string = null): Selector {
    if (this._multipleDates) {
      this._dateSelectionEnd = value
    }
    if (this._multipleResources) {
      this._resourceSelectionEnd = resource
    }
    this.update()
    return this
  }

  /**
   * 選択範囲を解除する。
   */
  public deselect() {
    this.select(null)
  }

  /**
   * 選択したリソースIDを取得する。
   *
   * @returns {string[]} リソースID
   */
  public getResourceSelection(): Array<string> {
    if (!this._multipleResources) {
      return this._resourceSelectionStart ? [this._resourceSelectionStart] : []
    }
    const startIndex =
      this._resourceIds?.indexOf(this._resourceSelectionStart) ?? -1
    const endIndex =
      this._resourceIds?.indexOf(this._resourceSelectionEnd) ?? -1
    return startIndex >= 0 && endIndex >= 0
      ? this._resourceIds.slice(
          Math.min(startIndex, endIndex),
          Math.max(startIndex, endIndex) + 1,
        )
      : []
  }

  /**
   * 選択範囲を取得する。
   * @returns {string[]} 日付・時間
   */
  public getDateSelection(): string[] {
    return [this._dateSelectionStart, this._dateSelectionEnd].sort()
  }

  /**
   * 現在、選択中かどうかを取得する。
   * @returns {boolean}
   */
  public isSelected(): boolean {
    return this._dateSelectionStart !== null && this._dateSelectionEnd !== null
  }

  /**
   * マウスを押した時の処理
   * @param e
   */
  private _mouseDown(e: MouseEvent): void {
    if (!this._enabled) {
      return
    }
    const value = this.pickValueByPosition(e.x, e.y)
    const resourceId = this.pickResourceId(e.target as HTMLElement)
    if (value) {
      this.select(value, resourceId)
      e.stopImmediatePropagation()
    }
  }

  /**
   * マウスを動かした時の処理
   * @param e
   */
  private _mouseMove(e: MouseEvent): void {
    if (this.isSelected()) {
      const value = this.pickValueByPosition(e.x, e.y)
      const resourceId = this.pickResourceId(e.target as HTMLElement)
      if (value) {
        this.selectEnd(value, resourceId)
        e.stopImmediatePropagation()
      }
    }
  }

  /**
   * マウスを離した時の処理
   * @param e
   */
  private _mouseUp(e: MouseEvent): void {
    if (this.isSelected()) {
      const value = this.pickValueByPosition(e.x, e.y)
      const resourceId = this.pickResourceId(e.target as HTMLElement)
      if (value) {
        this.selectEnd(value, resourceId)
        if (this._onSelect) {
          const [start, end] = this.getDateSelection()
          this._onSelect(start, end, this.getResourceSelection())
        }
        this.deselect()
      }
      e.stopImmediatePropagation()
    }
  }

  /**
   * 指定された要素から、リソースIDの要素を探す。
   * @param el 要素
   * @returns {string} リソースID
   */
  public pickResourceId(el: Element): string {
    return this._root.contains(el) && el.closest(this._containerSelector)
      ? // @ts-ignore
        el.closest('[data-resource-id]')?.dataset['resourceId'] ?? null
      : null
  }

  /**
   * 指定された座標から、選択対象の要素を探す。
   * @param x X座標
   * @param y Y座標
   * @returns {string} 日付・時間
   */
  public pickValueByPosition(x: number, y: number): string {
    const element = Array.from(
      this._root.querySelectorAll(
        `${this._containerSelector} ${this._elementSelector}`,
      ),
    ).find((el: HTMLElement) => {
      const rect = el.getBoundingClientRect()
      return (
        rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom
      )
    })
    return (element as HTMLElement)?.dataset[this._propertyName] ?? null
  }

  /**
   * 指定された日付・時間の要素を探す。
   * @param value 日付・時間
   * @returns {HTMLElement} 要素
   */
  public getElementByValue(value: string): HTMLElement {
    return this._root.querySelector(
      `${this._containerSelector} ${this._elementSelector}[data-${this._propertyName}="${value}"]`,
    )
  }

  /**
   * 選択範囲の表示を更新する。
   */
  private update() {
    if (this._onDraw) {
      const [start, end] = this.getDateSelection()
      this._onDraw(start, end, this.getResourceSelection())
    } else {
      this.highlightSelection()
    }
  }

  /**
   * 選択範囲を強調表示する。
   */
  private highlightSelection() {
    const [start, end] = this.getDateSelection()
    const resourceIds = this.getResourceSelection()
    const selector = resourceIds.length
      ? resourceIds
          .map(
            (id) =>
              `${this._containerSelector} [data-resource-id="${id}"] ${this._elementSelector}`,
          )
          .join(',')
      : `${this._containerSelector} ${this._elementSelector}`
    this._root
      .querySelectorAll(`${this._containerSelector} .gc-selected`)
      .forEach((el) => {
        el.classList.remove('gc-selected')
      })
    this._root.querySelectorAll(selector).forEach((el) => {
      // @ts-ignore
      const value = el.dataset[this._propertyName]
      if (start <= value && value <= end) {
        el.classList.add('gc-selected')
      }
    })
  }
}
