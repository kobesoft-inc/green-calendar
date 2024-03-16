import DateTimeSelector from "./DateTimeSelector";
import Resizer from "./Resizer";
import DateUtils from "./DateUtils";

export default class AllDayEvent {
    /**
     * ルート要素
     * @private
     */
    protected _root: HTMLElement;

    /**
     * 選択対象の要素を全て含むセレクタ
     * @private
     */
    protected _containerSelector: string = null;

    /**
     * 日付セレクター
     */
    protected _dateSelector: DateTimeSelector = null;

    /**
     * リサイザー
     */
    protected _resizer: Resizer = null;

    /**
     * ホバー中の終日予定の要素
     */
    protected _hover: string = null;

    /**
     * 終日予定をクリックした時の処理
     */
    protected _onEvent: (key: string) => void = null;

    /**
     * 終日予定を移動した時の処理
     */
    protected _onMove: (key: string, start: string, end: string) => void = null;

    /**
     * コンストラクタ
     * @param root ルート要素。イベントを登録するための要素。
     * @param dateSelector
     */
    constructor(root: HTMLElement, dateSelector: DateTimeSelector) {
        this._root = root;
        this._dateSelector = dateSelector;
        this.init();
    }

    /**
     * 初期化
     */
    public init() {
        this._resizer = new Resizer(this._root, this._dateSelector)
            .setEventSelector('.gc-all-day-event-container')
            .setHeadCursor('gc-cursor-w-resize')
            .setTailCursor('gc-cursor-e-resize')
            .onEvent((key: string) => {
                if (this._onEvent) {
                    this._onEvent(key);
                }
            })
            .onMove((key: string, start: string, end: string) => {
                if (this._onMove) {
                    this._onMove(key, start, end);
                }
            })
            .onPreview((el: HTMLElement, start: string, end: string) => {
                this.removePreview();
                if (start && end) {
                    this.createPreview(el, start, end);
                }
            });
    }

    /**
     * コールバックを登録
     */
    public registerCallbacks(): void {
        this._resizer.registerCallbacks();
        this._root.addEventListener('mouseover', this._onMouseOver.bind(this));
    }

    /**
     * 終日イベントのマウスホバー処理
     * @param e {Event} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    protected _onMouseOver(e: Event): boolean {
        if (this._resizer.isDragging()) {
            return; // 終日イベントをドラッグ中、日付の選択処理中は、ホバーしない
        }
        const el = this.pickAllDayEvent(e.target as HTMLElement, true);
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
    public setContainerSelector(containerSelector: string): AllDayEvent {
        this._resizer.setContainerSelector(containerSelector);
        this._containerSelector = containerSelector;
        return this;
    }

    /**
     * 終日予定をクリックした時の処理を設定
     * @param callback {Function} コールバック
     * @returns {AllDayEvent} 自身
     */
    public onEvent(callback: (key: string) => void): AllDayEvent {
        this._onEvent = callback;
        return this;
    }

    /**
     * 終日予定を移動した時の処理を設定
     * @param callback {Function} コールバック
     * @returns {AllDayEvent} 自身
     */
    public onMove(callback: (key: string, start: string, end: string) => void): AllDayEvent {
        this._onMove = callback;
        return this;
    }

    /**
     * 終日予定を取得
     * @param el {HTMLElement} DOM要素
     * @param withoutPopup {boolean} ポップアップを除外するかどうか
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    protected pickAllDayEvent(el: HTMLElement, withoutPopup: boolean = false): null | HTMLElement {
        return this._root.contains(el) && el.closest(this._containerSelector + (withoutPopup ? '' : ', .gc-day-grid-popup'))
            ? el.closest('.gc-all-day-event-container')
            : null;
    }

    /**
     * 指定された終日予定のホバーを設定する
     * @param key {string} 終日予定のキー
     * @param hover {boolean} ホバーするかどうか
     */
    protected setHoverAllDayEvent(key: string, hover: boolean) {
        if (key) {
            this._root.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]')
                .forEach(el => {
                    if (hover) {
                        el.classList.add('gc-hover')
                    } else {
                        el.classList.remove('gc-hover')
                    }
                })
        }
    }

    /**
     * ドラッグ中の終日予定のプレビューを表示
     * @param elEvent {HTMLElement} 予定のDOM要素
     * @param eventStart {string} 予定の開始日
     * @param eventEnd {string} 予定の終了日
     */
    protected createPreview(elEvent: HTMLElement, eventStart: string, eventEnd: string) {
        // @ts-ignore
        Array.from(this._root.querySelectorAll('.gc-week, .gc-all-day-section')).forEach(elWeek => {
            const [weekStart, weekEnd] = this.getWeekPeriod(elWeek)
            if (weekStart && weekEnd) {
                const [periodStart, periodEnd] = DateUtils.overlapPeriod(eventStart, eventEnd, weekStart, weekEnd)
                if (periodStart && periodEnd) {
                    const elPreview = elWeek.querySelector('.gc-day[data-date="' + periodStart + '"] .gc-all-day-event-preview')
                    if (weekStart <= this._resizer.getGrabbedDate() && this._resizer.getGrabbedDate() <= weekEnd) {
                        // ドラッグを開始した週では、ドラッグの縦位置を調節する
                        this.addEmptyAllDayEvents(elPreview, this.getIndexInParent(elEvent))
                    }
                    const el = elEvent.cloneNode(true) as HTMLElement
                    const days = DateUtils.diffDays(periodStart, periodEnd) + 1
                    this.adjustPreview(el, days, periodStart === eventStart, periodEnd === eventEnd)
                    elPreview.appendChild(el)
                }
            }
        })
    }

    /**
     * 週の開始日・終了日を取得
     * @param elWeek {HTMLElement} 週のDOM要素
     * @returns {Array} 週の開始日・終了日
     */
    protected getWeekPeriod(elWeek: HTMLElement): Array<any> {
        const elDays = elWeek.querySelectorAll('.gc-day:not(.gc-disabled)') as NodeListOf<HTMLElement>
        if (elDays.length > 0) {
            return [elDays[0].dataset.date, elDays[elDays.length - 1].dataset.date]
        } else {
            return [null, null]
        }
    }

    /**
     * ドラッグ中の終日予定をプレビューに合わせる
     * @param el {HTMLElement} 予定のDOM要素
     * @param days {number} ドラッグ中の終日予定の日数
     * @param isStart {boolean} 週内に開始するかどうか
     * @param isEnd {boolean} 週内に終了するかどうか
     */
    protected adjustPreview(el: HTMLElement, days: number, isStart: boolean, isEnd: boolean) {
        el.classList.remove('gc-dragging')
        el.classList.remove('gc-start')
        el.classList.remove('gc-end')
        for (let i = 1; i <= 7; i++) {
            el.classList.remove('gc-' + i + 'days')
        }
        el.classList.add('gc-' + days + 'days')
        if (isStart) {
            el.classList.add('gc-start')
        }
        if (isEnd) {
            el.classList.add('gc-end')
        }
        return el
    }

    /**
     * 指定したDOM要素が兄弟の中で何番目かを取得
     * @param el {HTMLElement} DOM要素
     * @returns {number} インデックス
     */
    protected getIndexInParent(el: HTMLElement): number {
        // @ts-ignore
        return Array.from(el.parentNode.children).indexOf(el)
    }

    /**
     * 指定した数だけ空の終日予定を追加する
     */
    protected addEmptyAllDayEvents(elPreview: HTMLElement, count: number) {
        for (let i = 0; i < count; i++) {
            const el = document.createElement('div')
            el.classList.add('gc-all-day-event-container')
            elPreview.appendChild(el)
        }
    }

    /**
     * 終日予定のプレビューを削除
     */
    protected removePreview() {
        // @ts-ignore
        Array.from(this._root.querySelectorAll('.gc-all-day-event-preview'))
            .forEach((el: Element) => el.parentNode.replaceChild(el.cloneNode(false), el))
    }
}