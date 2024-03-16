import DateTimeSelector from "./DateTimeSelector";
import DateUtils from "./DateUtils";

export default class Resizer {
    /**
     * ルート要素
     * @protected
     */
    protected _root: HTMLElement;

    /**
     * 選択対象の要素を全て含むセレクタ
     * @protected
     */
    protected _containerSelector: string = null;

    /**
     * リサイズ対象の予定のセレクター
     */
    protected _eventSelector: string = null;

    /**
     * 日付セレクター・時間セレクター
     */
    protected _selector: DateTimeSelector = null;

    /**
     * ヘッダーカーソル
     */
    protected _headCursor: string = 'gc-cursor-w-resize';

    /**
     * テールカーソル
     */
    protected _tailCursor: string = 'gc-cursor-e-resize';

    /**
     * ドラッグ中の終日予定のDOM要素
     */
    protected _dragging: HTMLElement = null;

    /**
     * 終日予定をドラッグ中に、前回ホバーした日付
     */
    protected _draggingPrevDate: string = null;

    /**
     * 終日予定のドラッグ中の移動量
     */
    protected _draggingCount: number = 0;

    /**
     * ドラッグ中の終日予定の掴んだ日付
     */
    protected _grabbedDate: string;

    /**
     * 終日予定の開始位置を掴んでいるかどうか
     */
    protected _grabbedStart: boolean = false;

    /**
     * 終日予定の終了位置を掴んでいるかどうか
     */
    protected _grabbedEnd: boolean = false;

    /**
     * 終日予定をクリックした時の処理
     */
    protected _onEvent: (key: string) => void = null;

    /**
     * 終日予定を移動した時の処理
     */
    protected _onMove: (key: string, start: string, end: string) => void = null;

    /**
     * プレビューを生成する処理
     */
    protected _onPreview: (el: HTMLElement, start: string, end: string) => void = null;

    /**
     * コンストラクタ
     * @param root ルート要素。イベントを登録するための要素。
     * @param selector
     */
    constructor(root: HTMLElement, selector: DateTimeSelector) {
        this._root = root;
        this._selector = selector;
    }

    /**
     * コールバックを登録する
     */
    public registerCallbacks(): void {
        this._root.addEventListener('mousedown', this._onMouseDown.bind(this));
        this._root.addEventListener('mousemove', this._onMouseMove.bind(this));
        this._root.addEventListener('mouseup', this._onMouseUp.bind(this));
    }

    /**
     * 終日予定の移動を開始
     * @param e {MouseEvent} イベント
     * @returns {boolean} 移動を開始したかどうか
     */
    protected _onMouseDown(e: MouseEvent): void {
        const el = this.pickEvent(e.target as Element)
        if (el) {
            // 終日予定の変形を設定
            this._grabbedStart = this._grabbedEnd = true
            if (this.hitHead(e.target as Element)) { // 終日予定の先頭部分に当たった場合、終了日は固定
                this._grabbedEnd = false
            }
            if (this.hitTail(e.target as Element)) { // 終日予定の末尾部分に当たった場合、開始日は固定
                this._grabbedStart = false
            }

            // 掴んだ日付
            this._grabbedDate = this._selector.pickDateTimeByPosition(e.x, e.y)

            // ドラッグ中のDOM要素
            this._dragging = el

            // ドラッグ中の終日予定のクラスを設定（表示を消す）
            this.setDragging(this._dragging.dataset.key, true)

            // 現在の日付を記録
            this._draggingPrevDate = null

            // ドラッグ中の終日予定のプレビューを表示
            this.updatePreview(this._grabbedDate)

            // カーソルを設定
            this.updateCursor()

            // ドラッグ中の終日予定の移動量を初期化
            this._draggingCount = 0

            // イベントが処理された
            e.stopImmediatePropagation()
        }
    }

    /**
     * 終日予定の移動を終了
     * @param e {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    protected _onMouseMove(e: MouseEvent): void {
        if (this._dragging) {
            // ドラッグ中の終日予定のプレビューを表示
            const date = this._selector.pickDateTimeByPosition(e.x, e.y)
            if (date) {
                this.updatePreview(date)
            }

            // マウスクリックイベントのために移動量を記録
            this._draggingCount++

            // イベントが処理された
            e.stopImmediatePropagation()
        }
    }

    /**
     * 終日予定の移動を終了
     * @param e {MouseEvent} イベント
     * @returns {boolean} 移動を終了したかどうか
     */
    protected _onMouseUp(e: MouseEvent): void {
        if (this._dragging) {
            const key = this._dragging.dataset.key
            const date = this._selector.pickDateTimeByPosition(e.x, e.y)
            if (date && this._grabbedDate !== date) {
                const [start, end] = this.getChangedPeriod(date)
                if (this._onMove) {
                    this._onMove(key, start, end)
                }
            } else if (this._draggingCount < 3) {
                if (this._onEvent) {
                    this._onEvent(key)
                }
            } else {
                if (this._onPreview) {
                    this._onPreview(this._dragging, null, null)
                }
                this.setDragging(key, false)
            }
            this._dragging = null
            this._grabbedStart = this._grabbedEnd = null
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
        this._containerSelector = selector;
        return this;
    }

    /**
     * リサイズ対象の予定のセレクターを設定
     * @param selector
     */
    public setEventSelector(selector: string): this {
        this._eventSelector = selector;
        return this;
    }

    /**
     * 頭部分を掴んでいる時のカーソルを設定
     * @param cursor
     */
    public setHeadCursor(cursor: string): this {
        this._headCursor = cursor;
        return this;
    }

    /**
     * 末尾部分を掴んでいる時のカーソルを設定
     * @param cursor
     */
    public setTailCursor(cursor: string): this {
        this._tailCursor = cursor;
        return this;
    }

    /**
     * 予定をクリックした時の処理を設定
     * @param callback
     */
    public onEvent(callback: (key: string) => void): this {
        this._onEvent = callback;
        return this;
    }

    /**
     * 予定を移動した時の処理を設定
     * @param callback
     */
    public onMove(callback: (key: string, start: string, end: string) => void): this {
        this._onMove = callback;
        return this;
    }

    /**
     * プレビューを生成する処理を設定
     * @param callback
     */
    public onPreview(callback: (el: HTMLElement, start: string, end: string) => void): this {
        this._onPreview = callback;
        return this;
    }

    /**
     * ドラッグ中かどうか
     * @returns {boolean} ドラッグ中かどうか
     */
    public isDragging(): boolean {
        return this._dragging !== null;
    }

    /**
     * 掴んだ日付を取得
     */
    public getGrabbedDate(): string {
        return this._grabbedDate;
    }

    /**
     * 予定を取得
     * @param el {HTMLElement} DOM要素
     * @returns {null|HTMLElement} 予定のDOM要素またはnull
     */
    protected pickEvent(el: Element): HTMLElement | null {
        return this._root.contains(el) && el.closest(this._containerSelector)
            ? el.closest(this._eventSelector)
            : null;
    }

    /**
     * 終日予定の先頭部分に当たったかどうか
     * @param el {HTMLElement} 判定する要素
     * @returns {boolean} 先頭部分に当たったかどうか
     */
    protected hitHead(el: Element): boolean {
        return !!el.closest('.gc-head')
    }

    /**
     * 終日予定の末尾部分に当たったかどうか
     * @param el {HTMLElement} 判定する要素
     * @returns {boolean} 末尾部分に当たったかどうか
     */
    protected hitTail(el: Element): boolean {
        return !!el.closest('.gc-tail')
    }

    /**
     * ドラッグ中のクラスを設定する
     */
    protected setDragging(key: string, dragging: boolean) {
        this._root.querySelectorAll(this._eventSelector + '[data-key="' + key + '"]').forEach(el => {
            if (dragging) {
                el.classList.add('gc-dragging')
            } else {
                el.classList.remove('gc-dragging')
            }
        })
    }

    /**
     * 変更後の終日予定の期間を取得する
     * @param date {string} マウスの位置の日付
     * @returns {Array} 変更後の終日予定の期間
     */
    protected getChangedPeriod(date: string): Array<any> {
        const diff = DateUtils.diffInMilliseconds(this._grabbedDate, date)
        let start = DateUtils.toDateTimeString(Date.parse(this._dragging.dataset.start) + (this._grabbedStart ? diff : 0))
        let end = DateUtils.toDateTimeString(Date.parse(this._dragging.dataset.end) + (this._grabbedEnd ? diff : 0))
        start = start.substring(0, this._grabbedDate.length)
        end = end.substring(0, this._grabbedDate.length)
        if (start > end) {
            if (this._grabbedStart) {
                start = end
            }
            if (this._grabbedEnd) {
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
        if (this._grabbedStart && this._grabbedEnd) {
            this._root.classList.add('gc-cursor-move')
        } else if (this._grabbedStart) {
            this._root.classList.add(this._headCursor)
        } else if (this._grabbedEnd) {
            this._root.classList.add(this._tailCursor)
        }
    }

    /**
     * ドラッグ中の終日予定のプレビューを更新する
     * @param date {string} マウスの位置の日付
     */
    protected updatePreview(date: string): void {
        if (this._draggingPrevDate !== date) {
            const [start, end] = this.getChangedPeriod(date)
            if (this._onPreview) {
                this._onPreview(this._dragging, start, end)
            }
            this._draggingPrevDate = date
        }
    }
}