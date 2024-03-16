export default class DayGridLimit {
    /**
     * ルート要素
     * @private
     */
    private _root: HTMLElement;

    /**
     * 表示できる数のキャッシュ
     * @private
     */
    private _visibleCount: number = 0;

    /**
     * カレンダーの日の高さ
     * @private
     */
    private _dayTopHeight: number = null;

    /**
     * 予定１件辺りの高さ
     * @private
     */
    private _eventHeight: number = null;

    /**
     * 残りの予定数の表示テキスト
     * @private
     */
    private _localizedRemainingText: string = '+ :count more';

    /**
     * 残りの予定数をクリックした時の処理
     */
    private _onRemainingTextClick: (elDay: HTMLElement) => void;

    /**
     * カレンダーの日のセレクタ
     */
    static readonly DAY_SELECTOR = '.gc-days .gc-day';

    /**
     * カレンダーの日の上部のセレクタ
     */
    static readonly DAY_TOP_SELECTOR = '.gc-day-top';

    /**
     * カレンダーの予定のセレクタ
     * .gc-all-day-eventsには、開始日にだけデータが入っているのだが、
     * .gc-timed-eventsには、全日予定を含めて、全ての日にデータが入っている。
     */
    static readonly ANY_EVENT_SELECTOR = '.gc-timed-events > .gc-timed-event-container, .gc-timed-events > .gc-all-day-event-container';

    /**
     * コンストラクタ
     * @param root ルート要素。イベントを登録するための要素。
     */
    constructor(root: HTMLElement) {
        this._root = root;
        this.init();
    }

    /**
     * 初期化
     */
    public init() {
        this.updateLayout()
        window.addEventListener('resize', this._onResize.bind(this));
        this._root.addEventListener('click', this._onClick.bind(this));
        this._root.addEventListener('mousedown', this._onMouseDown.bind(this));
    }

    /**
     * 残りの予定数の表示テキストを設定
     * @param localizedRemainingText
     */
    public setLocalizedRemainingText(localizedRemainingText: string) {
        this._localizedRemainingText = localizedRemainingText;
        return this;
    }

    /**
     * 残りの予定数をクリックした時の処理を設定
     * @param onRemainingTextClick
     */
    public onRemainingTextClick(onRemainingTextClick: (elDay: HTMLElement) => void) {
        this._onRemainingTextClick = onRemainingTextClick;
        return this;
    }

    /**
     * リサイズ時の処理
     */
    private _onResize() {
        this.updateLayout();
    }

    /**
     * クリック時の処理
     * @param e
     */
    private _onClick(e: MouseEvent) {
        if (this.isRemainingTextElement(e.target as Element)) {
            if (this._onRemainingTextClick) {
                this._onRemainingTextClick(this.pickDay(e.target as Element));
            }
            e.stopImmediatePropagation();
        }
    }

    /**
     * マウスを押した時の処理
     * @param e
     */
    private _onMouseDown(e: MouseEvent) {
        if (this.isRemainingTextElement(e.target as Element)) {
            e.stopImmediatePropagation();
        }
    }

    /**
     * カレンダーのレイアウトを再計算
     * @param {boolean} force 強制的に再計算するかどうか
     */
    private updateLayout(force: boolean = false) {
        const visibleCount = this.getVisibleCount();
        if (this._visibleCount !== visibleCount || force) {
            this._visibleCount = visibleCount;
            this._root.querySelectorAll(DayGridLimit.DAY_SELECTOR).forEach(day => {
                this.updateDay(day as HTMLElement, visibleCount);
            })
        }
    }

    /**
     * 表示する予定数を更新
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     * @param visibleCount {number} 表示できる数
     */
    private updateDay(elDay: HTMLElement, visibleCount: number) {
        const eventCount = this.getEventCount(elDay);
        const limitCount = eventCount < visibleCount ? eventCount : visibleCount - 1;
        const remainingCount = eventCount - limitCount;
        this.setTimedEventsHeight(elDay, this.getEventHeight() * limitCount);
        this.limitAllDayEvents(elDay, limitCount - (remainingCount ? 1 : 0));
        this.setRemainingCount(elDay, remainingCount);
    }

    /**
     * カレンダーの日の予定数を取得
     * @param elDay {HTMLElement} カレンダーの日
     * @returns {number} 予定数
     */
    public getEventCount(elDay: HTMLElement): number {
        return elDay.querySelectorAll(DayGridLimit.ANY_EVENT_SELECTOR).length;
    }

    /**
     * 予定の高さを取得
     * @returns {number} 予定の高さ
     */
    private getEventHeight(): number {
        if (this._eventHeight === null) {
            this._eventHeight = this.getElementHeight(DayGridLimit.ANY_EVENT_SELECTOR);
        }
        return this._eventHeight;
    }

    /**
     * 時間指定の予定の高さを設定
     * @param elDay {HTMLElement} カレンダーの日
     * @param height {number} 高さ
     */
    private setTimedEventsHeight(elDay: HTMLElement, height: number) {
        (elDay.querySelector('.gc-timed-events') as HTMLElement).style.height = height + 'px';
    }

    /**
     * カレンダーの日の高さを取得
     * @returns {number} 日の高さ
     */
    private getDayHeight(): number {
        return this.getElementHeight(DayGridLimit.DAY_SELECTOR);
    }

    /**
     * カレンダーの各日の日付表示の部分の高さを取得
     * @returns {number} 日付表示の部分の高さ
     */
    private getDayTopHeight(): number {
        if (this._dayTopHeight === null) {
            this._dayTopHeight = this.getElementHeight(DayGridLimit.DAY_TOP_SELECTOR);
        }
        return this._dayTopHeight
    }

    /**
     * 指定したセレクタの要素の高さを取得
     */
    private getElementHeight(selector: string): number {
        return (this._root.querySelector(selector) as HTMLElement).offsetHeight;
    }

    /**
     * カレンダーの各日の本体部分の高さを取得
     * @returns {number} 本体部分の高さ
     */
    private getDayBodyHeight(): number {
        return this.getDayHeight() - this.getDayTopHeight();
    }

    /**
     * 表示できる数を取得
     * @returns {number} 表示できる数
     */
    private getVisibleCount(): number {
        return Math.floor(this.getDayBodyHeight() / this.getEventHeight());
    }

    /**
     * 終日予定の表示・非表示を設定
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     * @param limit {number} 表示可能な予定数
     */
    private limitAllDayEvents(elDay: HTMLElement, limit: number) {
        elDay
            .querySelectorAll('.gc-all-day-events .gc-all-day-event-container')
            .forEach((elEvent, index) => {
                if (index <= limit) {
                    elEvent.classList.remove('gc-hidden')
                } else {
                    elEvent.classList.add('gc-hidden')
                }
            });
    }

    /**
     * 残りの予定数を設定
     * @param elDay {HTMLElement} カレンダーの日のDOM要素
     * @param remainingCount {number} 残りの予定数
     */
    private setRemainingCount(elDay: HTMLElement, remainingCount: number) {
        const elRemaining = elDay.querySelector('.gc-remaining-container');
        if (remainingCount > 0) {
            // @ts-ignore
            elRemaining.children[0].innerText = this.makeRemainingText(remainingCount);
            elRemaining.classList.remove('gc-hidden');
        } else {
            elRemaining.classList.add('gc-hidden');
        }
    }

    /**
     * 残りの予定数の表示テキストを作成
     * @param remainingCount {number} 残りの予定数
     * @returns {string} 残りの予定数の表示テキスト
     */
    private makeRemainingText(remainingCount: number): string {
        return this._localizedRemainingText.replace(':count', String(remainingCount));
    }

    /**
     * 残りの予定をクリックしたかどうか
     * @param el {Element} クリックされた要素
     * @returns {boolean} 残りの予定をクリックしたかどうか
     */
    private isRemainingTextElement(el: Element): boolean {
        return el.closest('.gc-remaining-container') && this._root.contains(el);
    }

    /**
     * カレンダーの日のDOM要素を取得
     * @param el {Element} クリックされた要素
     * @returns {HTMLElement} カレンダーの日のDOM要素
     */
    private pickDay(el: Element): HTMLElement {
        return el.closest('.gc-day') as HTMLElement;
    }
}