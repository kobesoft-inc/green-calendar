import DateUtils from "./DateUtils";

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
     * 開始期間（日付）
     */
    _startDate: string = null;

    /**
     * 終了期間（日付）
     */
    _endDate: string = null;

    /**
     * 1日の開始時間（１日からの秒数）
     */
    _startTime: number = null;

    /**
     * 1日の終了時間（１日からの秒数）
     */
    _endTime: number = null;

    /**
     * 時間間隔（秒）
     */
    _interval: number = null;

    /**
     * 1日辺りの時間間隔の数
     */
    _perDay: number = null;

    /**
     * 時間間隔の数
     */
    _timeSlotTotal: number = null;

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
        this._startDate = this._root.dataset.startDate;
        this._endDate = this._root.dataset.endDate;
        this._startTime = DateUtils.toSeconds(this._root.dataset.startTime);
        this._endTime = DateUtils.toSeconds(this._root.dataset.endTime);
        this._interval = parseInt(this._root.dataset.interval);
        this._perDay = Math.ceil((this._endTime - this._startTime) / this._interval);
        this._timeSlotTotal = this._perDay * (DateUtils.diffDays(this._startDate, this._endDate) + 1);
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

        // 予定のレイアウトを設定する
        this._root.querySelectorAll('.gc-events .gc-all-day-events .gc-all-day-event-container, .gc-events .gc-timed-events .gc-timed-event-container')
            .forEach((el: HTMLElement) => {
                this.updateEventLayout(el);
            });

        // 予定のレイアウトが終わったら、invisibleを削除する
        this._root.querySelectorAll('.gc-all-day-event-position.invisible, .gc-timed-event-position.invisible')
            .forEach((el: HTMLElement) => {
                el.classList.remove('invisible');
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
     * 指定位置の時間間隔のDOM要素を取得する
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
     * 位置から日時を取得する
     *
     * @returns {number} 位置
     * @param index
     * @param isEnd
     */
    public getDateTimeByIndex(index: number, isEnd: boolean = false): string {
        const d = DateUtils.addDays(this._startDate, Math.floor(index / this._perDay));
        let t = this._startTime + (index % this._perDay) * this._interval;
        if (this._interval === 3600) { // 1時間単位の場合、開始以外は1時間単位に補正する
            if (t != this._startTime) {
                t = Math.floor(t / 3600) * 3600;
            }
        }
        if (isEnd) {
            t += this._interval;
        }
        if (t >= this._endTime) {
            t = this._endTime;
        }
        return DateUtils.toDateTimeString(d + t * 1000);
    }

    /**
     * 日時から位置を取得する
     *
     * @param dateTime {string} 日時
     * @returns {number} 位置
     */
    public getIndexByDateTime(dateTime: string, isEnd: boolean): number {
        const m = DateUtils.toMinutes(dateTime.substring(11, 16)) - (isEnd ? 1 : 0);
        const d = DateUtils.diffDays(this._startDate, dateTime.substring(0, 10));
        const t = Math.floor((Math.min(m, this._endTime) - this._startTime) / this._interval);
        return this._perDay * d + Math.max(0, t);
    }

    /**
     * １日の時間間隔の数を取得する
     * @returns {number}
     */
    public getTimeSlotsPerDay(): number {
        return this._perDay;
    }

    /**
     * 予定のレイアウトをピクセルで設定する
     * @returns {number}
     * @param el
     */
    public updateEventLayout(el: HTMLElement): void {
        // 予定の開始・終了クラスを削除する
        el.classList.remove('gc-start', 'gc-end');

        // 開始位置を取得する
        let startIndex = parseInt(el.dataset.start);
        if (startIndex < 0) {
            startIndex = 0;
        } else {
            el.classList.add('gc-start'); // 開始クラスを追加する
        }

        // 終了位置を取得する
        let endIndex = parseInt(el.dataset.end);
        if (endIndex > this._timeSlotTotal) {
            endIndex = this._timeSlotTotal;
        } else {
            el.classList.add('gc-end'); // 終了クラスを追加する
        }

        // 配置を更新する
        const elPos: HTMLElement = el.parentNode as HTMLElement;
        elPos.style.left = (startIndex * this.getTimeSlotWidth()) + 'px';
        elPos.style.width = ((endIndex - startIndex) * this.getTimeSlotWidth()) + 'px';
        elPos.style.top = (parseInt(el.dataset.position) * this.getEventHeight()) + 'px';
    }
}