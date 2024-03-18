export default class TimelineLayout {
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
     * 各予定の高さのピクセル値
     */
    _eventHeight: number = null;

    /**
     * コンストラクタ
     * @param root
     */
    constructor(root: HTMLElement) {
        this._root = root;
        this.init();
    }

    /**
     * 初期化
     */
    private init() {
    }

    /**
     * コールバックを登録する
     */
    public registerCallbacks() {
        window.addEventListener('resize', this._onResize.bind(this));
    }

    /**
     * リサイズ時の処理
     */
    private _onResize() {
        this.updateLayout();
    }

    /**
     * レイアウト処理
     */
    public updateLayout() {
        // 各リソースの見出しの高さを、予定欄の高さに合わせる
        this._root.querySelectorAll('.gc-events .gc-resource')
            .forEach((el: HTMLElement) => {
                this.getResourceHeadingElement(el.dataset.resourceId).style.height = el.offsetHeight + 'px';
            })

        // 終日イベントのレイアウトを設定する
        this._root.querySelectorAll('.gc-events .gc-all-day-events .gc-all-day-event-container')
            .forEach((el: HTMLElement) => {
                this.updateEventLayout(el);
            });
    }

    /**
     * リソースの見出しのDOM要素を取得する
     * @param resourceId
     * @returns {HTMLElement}
     */
    private getResourceHeadingElement(resourceId: string): HTMLElement {
        return this._root
            .querySelector('.gc-resources .gc-resource[data-resource-id="' + resourceId + '"]') as HTMLElement;
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
     * 指定位置の開始時間・終了時間の幅を取得する
     * @returns {number}
     */
    private getTimeSlot(index: number): HTMLElement {
        return this._root.querySelector('.gc-time-slot-lines .gc-time-slot[' + 'data-index="' + index + '"]');
    }

    /**
     * 終日イベント、一つ毎の幅をピクセルで取得する
     * @returns {number}
     */
    private getEventHeight(): number {
        if (this._eventHeight === null) {
            this._eventHeight = (this._root.querySelector('.gc-events .gc-all-day-events .gc-spacer') as HTMLElement).offsetHeight;
        }
        return this._eventHeight;
    }

    /**
     * 終日イベントのレイアウトをピクセルで設定する
     * @returns {number}
     * @param el
     */
    public updateEventLayout(el: HTMLElement): void {
        el.style.left = (parseInt(el.dataset.start) * this.getTimeSlotWidth()) + 'px';
        el.style.width = ((parseInt(el.dataset.end) - parseInt(el.dataset.start)) * this.getTimeSlotWidth()) + 'px';
        el.style.top = (parseInt(el.dataset.position) * this.getEventHeight()) + 'px';
    }
}