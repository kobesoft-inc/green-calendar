import {addDays, diffDays, toDateString, toDateTimeString, diffInMilliseconds} from "./date-utils.js";

export default function resize($el, rootSelector, eventSelector, selector) {
    return {
        $el,

        /**
         * ルートセレクタ
         */
        rootSelector,

        /**
         * 予定セレクタ
         */
        eventSelector,

        /**
         * 日付セレクター・時間セレクター
         */
        selector,

        /**
         * ヘッダーカーソル
         */
        headCursor: 'gc-cursor-w-resize',

        /**
         * テールカーソル
         */
        tailCursor: 'gc-cursor-e-resize',

        /**
         * ドラッグ中の終日予定のDOM要素
         */
        dragging: null,

        /**
         * 終日予定をドラッグ中に、前回ホバーした日付
         */
        draggingPrevDate: null,

        /**
         * 終日予定のドラッグ中の移動量
         */
        draggingCount: 0,

        /**
         * ドラッグ中の終日予定の掴んだ日付
         */
        grabbedDate: null,

        /**
         * 終日予定の開始位置を掴んでいるかどうか
         */
        grabbedStart: false,

        /**
         * 終日予定の終了位置を掴んでいるかどうか
         */
        grabbedEnd: false,

        /**
         * 終日予定をクリックした時の処理
         */
        onEvent: null,

        /**
         * 終日予定を移動した時の処理
         */
        onMove: null,

        /**
         * プレビューを生成する処理
         */
        onPreview: null,

        /**
         * 終日予定の移動を開始
         * @param $event {MouseEvent} イベント
         * @returns {boolean} 移動を開始したかどうか
         */
        onMouseDown($event) {
            const el = this.findEventAtElement($event.target)
            if (el) {
                // 終日予定の変形を設定
                this.grabbedStart = this.grabbedEnd = true
                if (this.hitHead($event.target)) { // 終日予定の先頭部分に当たった場合、終了日は固定
                    this.grabbedEnd = false
                }
                if (this.hitTail($event.target)) { // 終日予定の末尾部分に当たった場合、開始日は固定
                    this.grabbedStart = false
                }

                // 掴んだ日付
                this.grabbedDate = this.selector.findDateAtPoint($event.x, $event.y)

                // ドラッグ中のDOM要素
                this.dragging = el

                // ドラッグ中の終日予定のクラスを設定（表示を消す）
                this.setDragging(this.dragging.dataset.key, true)

                // 現在の日付を記録
                this.draggingPrevDate = null

                // ドラッグ中の終日予定のプレビューを表示
                this.updatePreview(this.grabbedDate)

                // カーソルを設定
                this.updateCursor()

                // ドラッグ中の終日予定の移動量を初期化
                this.draggingCount = 0

                return true
            }
            return false
        },

        /**
         * 終日予定の移動を終了
         * @param $event {MouseEvent} イベント
         * @returns {boolean} 移動を終了したかどうか
         */
        onMouseMove($event) {
            if (this.dragging) {
                const date = this.selector.findDateAtPoint($event.x, $event.y)
                if (date) {
                    this.updatePreview(date)
                }
                this.draggingCount++
                return true
            }
            return false
        },

        /**
         * 終日予定の移動を終了
         * @param $event {MouseEvent} イベント
         * @returns {boolean} 移動を終了したかどうか
         */
        onMouseUp($event) {
            if (this.dragging) {
                const key = this.dragging.dataset.key
                const date = this.selector.findDateAtPoint($event.x, $event.y)
                if (date && this.grabbedDate !== date) {
                    const [start, end] = this.getChangedPeriod(date)
                    if (this.onMove) {
                        this.onMove(key, start, end)
                    }
                } else if (this.draggingCount < 3) {
                    if (this.onEvent) {
                        this.onEvent(key)
                    }
                } else {
                    if (this.onPreview) {
                        this.onPreview(this.dragging, null, null)
                    }
                    this.setDragging(key, false)
                }
                this.dragging = null
                this.grabbedStart = this.grabbedEnd = null
                this.updateCursor()
                return true
            }
            return false
        },

        /**
         * 予定を取得
         * @param el {HTMLElement} DOM要素
         * @returns {null|HTMLElement} 予定のDOM要素またはnull
         */
        findEventAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest(rootSelector)) {
                    return el.closest(eventSelector)
                }
            }
            return null
        },

        /**
         * 終日予定の先頭部分に当たったかどうか
         * @param el {HTMLElement} 判定する要素
         * @returns {boolean} 先頭部分に当たったかどうか
         */
        hitHead(el) {
            return !!el.closest('.gc-head')
        },

        /**
         * 終日予定の末尾部分に当たったかどうか
         * @param el {HTMLElement} 判定する要素
         * @returns {boolean} 末尾部分に当たったかどうか
         */
        hitTail(el) {
            return !!el.closest('.gc-tail')
        },

        /**
         * ドラッグ中のクラスを設定する
         */
        setDragging(key, dragging) {
            this.$el.querySelectorAll(this.eventSelector + '[data-key="' + key + '"]').forEach(el => {
                if (dragging) {
                    el.classList.add('gc-dragging')
                } else {
                    el.classList.remove('gc-dragging')
                }
            })
        },

        /**
         * 変更後の終日予定の期間を取得する
         * @param date {string} マウスの位置の日付
         * @returns {Array} 変更後の終日予定の期間
         */
        getChangedPeriod(date) {
            const diff = diffInMilliseconds(this.grabbedDate, date)
            let start = toDateTimeString(Date.parse(this.dragging.dataset.start) + (this.grabbedStart ? diff : 0))
            let end = toDateTimeString(Date.parse(this.dragging.dataset.end) + (this.grabbedEnd ? diff : 0))
            start = start.substring(0, this.grabbedDate.length)
            end = end.substring(0, this.grabbedDate.length)
            if (start > end) {
                if (this.grabbedStart) {
                    start = end
                }
                if (this.grabbedEnd) {
                    end = start
                }
            }
            return [start, end]
        },

        /**
         * 終日予定をドラッグ中のカーソルを更新する
         */
        updateCursor() {
            this.$el.classList.remove(this.headCursor, this.tailCursor)
            if (this.grabbedStart && this.grabbedEnd) {
                this.$el.classList.add('gc-cursor-move')
            } else if (this.grabbedStart) {
                this.$el.classList.add(this.headCursor)
            } else if (this.grabbedEnd) {
                this.$el.classList.add(this.tailCursor)
            }
        },

        /**
         * ドラッグ中の終日予定のプレビューを更新する
         * @param date {string} マウスの位置の日付
         */
        updatePreview(date) {
            if (this.draggingPrevDate !== date) {
                const [start, end] = this.getChangedPeriod(date)
                if (this.onPreview) {
                    this.onPreview(this.dragging, start, end)
                }
                this.draggingPrevDate = date
            }
        },
    }
}