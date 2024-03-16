import selector from './modules/selector'
import allDayEvent from './modules/all-day-event'
import timedEvent from './modules/time-grid-timed-event'

export default function timeGrid() {
    return {
        /**
         * 日付のセレクター
         */
        dateSelector: selector(this.$el, '.gc-time-grid', '.gc-day', 'date'),

        /**
         * 時間のセレクター
         */
        timeSelector: selector(this.$el, '.gc-time-grid', '.gc-slot', 'time'),

        /**
         * 終日予定
         */
        allDayEvent: allDayEvent(this.$el, '.gc-time-grid'),

        /**
         * 時間指定の予定
         */
        timedEvent: timedEvent(this.$el, '.gc-time-grid'),

        /**
         * カレンダーの初期化
         */
        init() {
            this.dateSelector.onSelect = (start, end) => {
                this.$wire.onDate(start + ' 00:00:00', end + ' 23:59:59')
            }

            //this.timeSelector.init()
            this.timeSelector.onSelect = (start, end) => {
                this.$wire.onDate(start, this.timeSelector.findElementByDate(end).dataset.timeEnd)
            }

            // 終日予定の初期化
            this.allDayEvent.init()
            this.allDayEvent.onEvent = (key) => {
                this.$wire.onEvent(key)
            }
            this.allDayEvent.onMove = (key, start, end) => {
                this.$wire.onMove(key, start, end)
            }

            // 時間指定の予定の初期化
            this.timedEvent.init()
            this.timedEvent.onEvent = (key) => {
                this.$wire.onEvent(key)
            }
            this.timedEvent.onMove = (key, start, end) => {
                this.$wire.onMove(key, start, end)
            }
        },

        /**
         * クリックイベント
         * @param $event {Event} クリックイベント
         */
        onClick($event) {
            const key = this.findEventKeyAtElement($event.target)
            if (key) {
                // 予定をクリックした場合
                this.$wire.onEvent(key)
            }
        },

        /**
         * マウスが押された時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseDown($event) {
            if (this.allDayEvent.onMouseDown($event)) {
                // 終日予定の移動を開始
            } else if (this.timedEvent.onMouseDown($event)) {
                // 時間指定の予定の移動を開始
            } else if (this.dateSelector.onMouseDown($event)) {
            } else if (this.timeSelector.onMouseDown($event)) {
            }
        },

        /**
         * マウスが移動した時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseMove($event) {
            if (this.allDayEvent.onMouseMove($event)) {
            } else if (this.timedEvent.onMouseMove($event)) {
            } else if (this.dateSelector.onMouseMove($event)) {
            } else if (this.timeSelector.onMouseMove($event)) {
            }
        },

        /**
         * マウスが離された時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseUp($event) {
            if (this.allDayEvent.onMouseUp($event)) {
            } else if (this.timedEvent.onMouseUp($event)) {
            } else if (this.dateSelector.onMouseUp($event)) {
            } else if (this.timeSelector.onMouseUp($event)) {
            }
        },

        /**
         * マウスが要素に乗った時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseOver($event) {
            if (!this.dateSelector.selectionStart) {
                this.allDayEvent.onMouseOver($event)
            }
        },

        /**
         * 指定したDOM要素の近くの予定のキーを取得
         * @param el {HTMLElement} DOM要素
         * @returns {null|string} 予定のDOM要素またはnull
         */
        findEventKeyAtElement(el) {
            if (this.$el.contains(el)) {
                if (el.closest('.gc-time-grid')) {
                    const elEvent = el.closest('.gc-timed-event-container, .gc-all-day-event-container')
                    if (elEvent) {
                        return elEvent.dataset.key
                    }
                }
            }
            return null
        },
    }
}