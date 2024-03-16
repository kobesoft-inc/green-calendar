import selector from './selector'
import {addDays, diffDays, toDateTimeString} from './date-utils'

export default function dayGridTimedEvent($el, rootSelector) {
    return {
        $el,

        /**
         * 日付選択
         */
        dateSelector: selector($el, rootSelector, '.gc-day', 'date'),

        /**
         * ドラッグ中の時間指定の予定のDOM要素
         */
        draggingTimedEvent: null,

        /**
         * 予定をクリックした時の処理
         */
        onEvent: null,

        /**
         * 予定を移動した時の処理
         */
        onMove: null,

        /**
         * クリックイベント
         *
         * @param $event {MouseEvent} クリックイベント
         * @returns {boolean} イベントが処理されたかどうか
         */
        onClick($event) {
            const key = this.findEventKeyAtElement($event.target)
            if (key) {
                // 予定をクリックした場合
                if (this.onEvent) {
                    this.onEvent(key)
                }
                return true
            }
            return false
        },

        /**
         * ドラッグイベント
         * @param $event {DragEvent} イベント
         * @returns {boolean} イベントが処理されたかどうか
         */
        onDragStart($event) {
            const el = $event.target.closest('.gc-timed-event-container')
            if (el) {
                this.draggingTimedEvent = el
                $event.dataTransfer.effectAllowed = 'move'
                $event.dataTransfer.setData('text/plain', el.dataset.key)
                return true
            }
        },

        /**
         * ドラッグ中の要素が要素に乗った時のイベント
         * @param $event {DragEvent} イベント
         * @returns {boolean} イベントが処理されたかどうか
         */
        onDragOver($event) {
            const date = this.dateSelector.findDateAtPoint($event.x, $event.y)
            if (date) {
                this.dateSelector.updateSelection(date, date)
                $event.preventDefault()
            }
        },

        /**
         * ドロップイベント
         * @param $event {DragEvent} イベント
         * @returns {boolean} イベントが処理されたかどうか
         */
        onDrop($event) {
            // ドロップ処理を実行
            const date = this.dateSelector.findDateAtPoint($event.x, $event.y)
            const key = $event.dataTransfer.getData('text/plain')
            if (date) {
                const days = diffDays(this.draggingTimedEvent.dataset.start, date)
                if (days !== 0) {
                    const start = toDateTimeString(addDays(this.draggingTimedEvent.dataset.start, days))
                    const end = toDateTimeString(addDays(this.draggingTimedEvent.dataset.end, days))
                    this.draggingTimedEvent = null
                    if (this.onMove) {
                        this.onMove(key, start, end)
                    }
                }
            }
        },

        /**
         * ドラッグ中の要素が要素から外れた時のイベント
         * @param $event {DragEvent} イベント
         * @returns {boolean} イベントが処理されたかどうか
         */
        onDragEnd($event) {
            // 選択範囲を解除
            this.dateSelector.updateSelection(null, null)

            // ドラッグ中の要素を元に戻す
            if (this.draggingTimedEvent) {
                this.draggingTimedEvent.classList.remove('gc-dragging')
                this.draggingTimedEvent = null
            }
        },

        /**
         * 指定したDOM要素の近くの予定のキーを取得
         * @param el {HTMLElement} DOM要素
         * @returns {null|string} 予定のDOM要素またはnull
         */
        findEventKeyAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest('.gc-day-grid, .gc-day-grid-popup')) {
                    const elEvent = el.closest('.gc-timed-event-container')
                    if (elEvent) {
                        return elEvent.dataset.key
                    }
                }
            }
            return null
        },

        /**
         * ドラッグ中の要素をドラッグ中の状態にする
         *
         * @returns {void}
         */
        addDraggingClass() {
            if (this.draggingTimedEvent) {
                this.draggingTimedEvent.classList.add('gc-dragging')
            }
        },
    }
}