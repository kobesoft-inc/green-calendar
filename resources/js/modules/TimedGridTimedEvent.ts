import Selector from "./Selector";
import Resizer from "./Resizer";
import DateUtils from "./DateUtils";

export default class TimedGridTimedEvent {
    /**
     * ルート要素
     * @private
     */
    private _root: HTMLElement;

    /**
     * 時間指定の予定を全て含むセレクタ
     */
    private _containerSelector: string = null;

    /**
     * 時間のセレクター
     */
    private _timeSelector: Selector = null;

    /**
     * 時間のリサイザー
     */
    private _resizer: Resizer = null;

    /**
     * ホバー中の予定の要素
     */
    private _hover: string = null;

    /**
     * 予定をクリックした時の処理
     */
    private _onEvent: (key: string) => void;

    /**
     * 予定を移動した時の処理
     */
    private _onMove: (key: string, start: string, end: string) => void;

    /**
     * コンストラクタ
     * @param root ルート要素。イベントを登録するための要素。
     * @param timeSelector
     */
    constructor(root: HTMLElement, timeSelector: Selector) {
        this._root = root;
        this._timeSelector = timeSelector;
        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this._resizer = new Resizer(this._root, this._timeSelector)
            .setEventSelector('.gc-timed-event-container')
            .setHeadCursor('gc-cursor-n-resize')
            .setTailCursor('gc-cursor-s-resize')
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
     * 時間指定の予定を移動した時の処理
     * @param callback
     */
    public onEvent(callback: (key: string) => void) {
        this._onEvent = callback;
        return this;
    }

    /**
     * 時間指定の予定を移動した時の処理
     * @param callback
     */
    public onMove(callback: (key: string, start: string, end: string) => void) {
        this._onMove = callback;
        return this;
    }

    /**
     * コールバックを登録する
     */
    public registerCallbacks() {
        this._resizer.registerCallbacks();
        this._root.addEventListener('mouseover', this._onMouseOver.bind(this));
    }

    /**
     * 時間指定の予定を全て含むセレクタを設定する。
     * @param containerSelector
     */
    public setContainerSelector(containerSelector: string): TimedGridTimedEvent {
        this._resizer.setContainerSelector(containerSelector);
        this._containerSelector = containerSelector;
        return this;
    }

    /**
     * 終日イベントのマウスホバー処理
     * @param e {Event} イベント
     * @returns {boolean} イベントが処理されたかどうか
     */
    private _onMouseOver(e: Event): boolean {
        if (this._resizer.isDragging()) { // 終日イベントをドラッグ中、日付の選択処理中は、ホバーしない
            return;
        }
        const el = this.pickEvent(e.target as HTMLElement);
        const key = el ? el.dataset.key : null;
        if (key !== this._hover) {
            this.setHoverAllDayEvent(this._hover, false);
            this.setHoverAllDayEvent(this._hover = key, true);
        }
    }

    /**
     * 予定を取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    private pickEvent(el: HTMLElement): null | HTMLElement {
        return this._root.contains(el) && el.closest(this._containerSelector)
            ? el.closest('.gc-timed-event-container')
            : null;
    }

    /**
     * 指定された予定のホバーを設定する
     * @param key {string} 予定のキー
     * @param hover {boolean} ホバーするかどうか
     */
    private setHoverAllDayEvent(key: string, hover: boolean) {
        if (key) {
            this._root.querySelectorAll('.gc-timed-event-container[data-key="' + key + '"]')
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
     * ドラッグ中の予定のプレビューを表示
     * @param elEvent {HTMLElement} 予定のDOM要素
     * @param eventStart {string} 予定の開始日
     * @param eventEnd {string} 予定の終了日
     */
    private createPreview(elEvent: HTMLElement, eventStart: string, eventEnd: string) {
        const resourceId = elEvent.dataset.resourceId;
        // @ts-ignore
        Array.from(this._root.querySelectorAll(this._containerSelector + ' .gc-day[data-resource-id="' + resourceId + '"]'))
            .forEach((elDay: HTMLElement) => {
                const [dayStart, dayEnd] = this.getPeriodOfDay(elDay);
                if (dayStart && dayEnd) {
                    const [periodStart, periodEnd] = DateUtils.overlapPeriod(eventStart, eventEnd, dayStart, dayEnd);
                    if (periodStart && periodEnd) {
                        const [slot, span] = this.getSlotPosition(elDay, periodStart, periodEnd);
                        const el = elEvent.cloneNode(true) as HTMLElement;
                        this.adjustPreview(el, span);
                        slot.querySelector('.gc-timed-event-preview').appendChild(el);
                    }
                }
            })
    }

    /**
     * 開始スロットと高さを取得
     *
     * @param elDay {HTMLElement} 日付のDOM要素
     * @param eventStart {string} 開始時間
     * @param eventEnd {string} 終了時間
     * @returns {[HTMLElement, number]} 開始スロットと高さ
     */
    private getSlotPosition(elDay: HTMLElement, eventStart: string, eventEnd: string): [HTMLElement, number] {
        const [dayStart, dayEnd] = this.getPeriodOfDay(elDay);
        const start = DateUtils.timeSlot(dayStart, dayEnd, elDay.dataset.interval, eventStart);
        const end = DateUtils.timeSlot(dayStart, dayEnd, elDay.dataset.interval, eventEnd);
        const slots = elDay.querySelectorAll('.gc-slot') as NodeListOf<HTMLElement>;
        return [slots[start], end - start + 1];
    }

    /**
     * １日の開始日時と終了日時を取得
     * @param elDay {HTMLElement} 日付のDOM要素
     * @private
     */
    private getPeriodOfDay(elDay: HTMLElement) {
        return [elDay.dataset.start, elDay.dataset.end];
    }

    /**
     * ドラッグ中の予定をプレビューに合わせる
     * @param el {HTMLElement} 予定のDOM要素
     * @param timeSlotHeight {number} スロット数
     */
    private adjustPreview(el: HTMLElement, timeSlotHeight: number) {
        el.classList.remove('gc-dragging');
        el.style.setProperty('--gc-span', 'calc(' + (timeSlotHeight * 100) + '% + ' + (timeSlotHeight - 1) + 'px)');
        return el
    }

    /**
     * 予定のプレビューを削除
     */
    private removePreview() {
        // @ts-ignore
        Array.from(this._root.querySelectorAll('.gc-timed-event-preview'))
            .forEach((el: HTMLElement) => el.parentNode.replaceChild(el.cloneNode(false), el));
    }
}