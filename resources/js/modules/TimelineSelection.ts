export default class TimelineSelection {
    /**
     * ルート要素
     * @type {HTMLElement}
     */
    _root: HTMLElement;

    /**
     * 日時間隔の幅のピクセル値
     */
    _timeSlotWidth: number = null;

    /**
     * コンストラクタ
     * @param root
     */
    constructor(root: HTMLElement) {
        this._root = root;
    }

    /**
     * 各時間間隔の幅をピクセルで取得する
     * @returns {number}
     */
    private getTimeSlotWidth(): number {
        if (this._timeSlotWidth === null) {
            this._timeSlotWidth = (this._root.querySelector('.gc-time-slot') as HTMLElement).offsetWidth + 1;
        }
        return this._timeSlotWidth;
    }

    /**
     * 選択範囲を描画する
     */
    public draw(start: string, end: string, resourceId: string) {
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
    private removeSelection() {
        const el = this._root.querySelector('.gc-selection');
        if (el) {
            el.parentNode.removeChild(el);
        }
    }

    /**
     * 選択肢を作成する
     */
    private createSelectionElement(start: number, end: number, resourceId: string) {
        const containerEl = this._root.querySelector('.gc-selection-container');
        const resourceEl = this._root.querySelector('.gc-events .gc-resource[data-resource-id="' + resourceId + '"]') as HTMLElement;
        const el = document.createElement('div');
        el.className = 'gc-selection';
        el.style.left = (start * this.getTimeSlotWidth()) + 'px';
        el.style.top = resourceEl.offsetTop + 'px';
        el.style.width = ((end - start + 1) * this.getTimeSlotWidth()) + 'px';
        el.style.height = resourceEl.offsetHeight + 'px';
        containerEl.prepend(el);
    }
}