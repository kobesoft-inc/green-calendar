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
    private _root: HTMLElement;

    /**
     * 選択対象の要素を全て含むセレクタ
     * @private
     */
    private _containerSelector: string = null;

    /**
     * 選択対象の要素のセレクタ
     * @private
     */
    private _elementSelector: string = null;

    /**
     * 選択対象の要素の日付・時間を持つプロパティ名
     * @private
     */
    private _propertyName: string = null;

    /**
     * 選択範囲の開始位置
     * @private
     */
    private _selectionStart: string = null;

    /**
     * 選択範囲の終了位置
     * @private
     */
    private _selectionEnd: string = null;

    /**
     * 選択対象の要素のリソースID
     * @private
     */
    private _resourceId: string = null;

    /**
     * 選択範囲を描画するコールバック
     */
    private _onDraw: (begin: string, end: string, resourceId: string) => void = null;

    /**
     * 選択範囲が変更された時のコールバック
     * @private
     */
    private _onSelect: (begin: string, end: string, resourceId: string) => void = null;

    /**
     * コンストラクタ
     * @param root ルート要素。イベントを登録するための要素。
     */
    constructor(root: HTMLElement) {
        this._root = root;
    }

    /**
     * コールバックを登録する
     */
    public registerCallbacks() {
        this._root.addEventListener('mousedown', this._mouseDown.bind(this));
        this._root.addEventListener('mousemove', this._mouseMove.bind(this));
        this._root.addEventListener('mouseup', this._mouseUp.bind(this));
    }

    /**
     * 選択対象の要素を全て含むセレクタを設定する。
     * @param containerSelector
     */
    public setContainerSelector(containerSelector: string): Selector {
        this._containerSelector = containerSelector;
        return this;
    }

    /**
     * 選択対象の要素のセレクタを設定する。
     * @param elementSelector
     */
    public setElementSelector(elementSelector: string): Selector {
        this._elementSelector = elementSelector;
        return this;
    }

    /**
     * 選択対象の要素の日付・時間を持つプロパティ名を設定する。(data-dateなら、date)
     * @param propertyName
     */
    public setPropertyName(propertyName: string): Selector {
        this._propertyName = propertyName;
        return this;
    }

    /**
     * 選択範囲を描画するコールバックを設定する。
     * @param onDraw
     */
    public onDraw(onDraw: (begin: string, end: string, resourceId: string) => void): Selector {
        this._onDraw = onDraw;
        return this;
    }

    /**
     * 選択範囲が変更された時のコールバックを設定する。
     * @param onSelect
     */
    public onSelect(onSelect: (begin: string, end: string) => void): Selector {
        this._onSelect = onSelect;
        return this;
    }

    /**
     * 選択範囲の開始位置を設定する。
     * @param value 日付・時間
     */
    public select(value: string): Selector {
        this._selectionStart = this._selectionEnd = value;
        this.update();
        return this;
    }

    /**
     * 選択範囲の終了位置を設定する。
     * @param value 日付・時間
     */
    public selectEnd(value: string): Selector {
        this._selectionEnd = value;
        this.update();
        return this;
    }

    /**
     * 選択範囲を解除する。
     */
    public deselect() {
        this.select(null);
    }

    /**
     * 選択範囲を取得する。
     * @returns {string[]} 日付・時間
     */
    public getSelection(): string[] {
        return [this._selectionStart, this._selectionEnd].sort();
    }

    /**
     * 現在、選択中かどうかを取得する。
     * @returns {boolean}
     */
    public isSelected(): boolean {
        return this._selectionStart !== null && this._selectionEnd !== null;
    }

    /**
     * マウスを押した時の処理
     * @param e
     */
    private _mouseDown(e: MouseEvent): void {
        const value = this.pickValueByPosition(e.x, e.y);
        if (value) {
            this._resourceId = this.pickResourceId(e.target as HTMLElement);
            this.select(value);
            e.stopImmediatePropagation();
        }
    }

    /**
     * マウスを動かした時の処理
     * @param e
     */
    private _mouseMove(e: MouseEvent): void {
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
    private _mouseUp(e: MouseEvent): void {
        if (this.isSelected()) {
            const value = this.pickValueByPosition(e.x, e.y);
            if (value) {
                if (this._onSelect) {
                    const [start, end] = this.getSelection();
                    console.log(start, end, this._resourceId)
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
    public pickValue(el: Element): string {
        return this._root.contains(el) && el.closest(this._containerSelector)
            ? el.closest(this._elementSelector + ':not(.disabled)') // @ts-ignore
                ?.dataset[this._propertyName]
            : null;
    }

    /**
     * 指定された要素から、リソースIDの要素を探す。
     * @param el 要素
     * @returns {string} リソースID
     */
    public pickResourceId(el: Element): string {
        return this._root.contains(el) && el.closest(this._containerSelector)
            // @ts-ignore
            ? el.closest('[data-resource-id]')?.dataset['resourceId'] ?? null
            : null;
    }

    /**
     * 指定された座標から、選択対象の要素を探す。
     * @param x X座標
     * @param y Y座標
     * @returns {string} 日付・時間
     */
    public pickValueByPosition(x: number, y: number): string {
        // @ts-ignore
        return Array.from(this._root.querySelectorAll(this._containerSelector + ' ' + this._elementSelector))
            .filter((el: HTMLElement) => {
                const rect = el.getBoundingClientRect();
                return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
            })
            .at(0)?.dataset[this._propertyName] ?? null;
    }

    /**
     * 指定された日付・時間の要素を探す。
     * @param value 日付・時間
     * @returns {HTMLElement} 要素
     */
    public getElementByValue(value: string): HTMLElement {
        return this._root.querySelector(this._containerSelector + ' ' + this._elementSelector +
            '[data-' + this._propertyName + '="' + value + '"]'
        );
    }

    /**
     * 日時の選択範囲の表示を更新する。
     */
    private update() {
        if (this._onDraw) { // 描画をコールバックで行う
            const [start, end] = this.getSelection();
            return this._onDraw(start, end, this._resourceId);
        }
        let [start, end] = this.getSelection();
        this._root.querySelectorAll(
            this._containerSelector +
            (this._resourceId !== null ? ' [data-resource-id="' + this._resourceId + '"] ' : ' ') +
            this._elementSelector
        ).forEach(el => {
            // @ts-ignore
            const value = el.dataset[this._propertyName]
            if (start <= value && value <= end) {
                el.classList.add('gc-selected')
            } else {
                el.classList.remove('gc-selected')
            }
        });
    }
}