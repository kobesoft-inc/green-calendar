import popup from './modules/day-grid-popup'
import selector from './modules/selector'
import timedEvent from './modules/day-grid-timed-event'
import allDayEvent from './modules/all-day-event'

export default function dayGrid(componentParameters) {
    return {
        /**
         * ポップアップに関する処理
         */
        popup: popup(this.$el, componentParameters),

        /**
         * 日付のセレクター
         */
        dateSelector: selector(this.$el, '.gc-day-grid', '.gc-day', 'date'),

        /**
         * 時間指定の予定に関する処理
         */
        timedEvent: timedEvent(this.$el, '.gc-day-grid'),

        /**
         * 終日の予定に関する処理
         */
        allDayEvent: allDayEvent(this.$el, '.gc-day-grid'),

        /**
         * カレンダーの初期化
         */
        init() {
            this.popup.updateLayout()
            this.dateSelector.onSelect = (start, end) => {
                this.$wire.onDate(start + ' 00:00:00', end + ' 23:59:59')
            }

            // 時間指定の初期化
            //this.timedEvent.init()
            this.timedEvent.onEvent = (key) => {
                this.$wire.onEvent(key)
            }
            this.timedEvent.onMove = (key, start, end) => {
                this.$wire.onMove(key, start, end)
            }

            // 終日予定の初期化
            this.allDayEvent.init()
            this.allDayEvent.onEvent = (key) => {
                this.$wire.onEvent(key)
            }
            this.allDayEvent.onMove = (key, start, end) => {
                this.$wire.onMove(key, start, end)
            }

            // ウィンドウのリサイズイベント
            Livewire.on('refreshCalendar', () => {
                this.$nextTick(() => this.popup.updateLayout(true))
            })
        },

        /**
         * ウィンドウのリサイズイベント
         * @param $event {Event} イベント
         */
        onResize($event) {
            this.popup.updateLayout()
        },

        /**
         * クリックイベント
         * @param $event {Event} クリックイベント
         */
        onClick($event) {
            const elDay = $event.target.closest('.gc-day')
            if (this.popup.hitRemaining($event.target)) {
                this.popup.openPopup(elDay)
            } else if (elDay && elDay.classList.contains('gc-disabled')) {
                // 無効な日をクリックした場合
            } else if (this.timedEvent.onClick($event)) {
                // 予定をクリックした場合
            } else {
                // その他の場合
                this.popup.closePopup()
            }
        },

        /**
         * マウスが押された時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseDown($event) {
            if (this.popup.hitRemaining($event.target)) {
            } else if (this.timedEvent.findEventKeyAtElement($event.target)) {
            } else if (this.allDayEvent.onMouseDown($event)) {
            } else {
                this.dateSelector.onMouseDown($event)
            }
        },

        /**
         * マウスが移動した時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseMove($event) {
            if (this.allDayEvent.onMouseMove($event)) {
            } else if (this.dateSelector.onMouseMove($event)) {
            }
        },

        /**
         * マウスが離された時のイベント
         * @param $event {MouseEvent} イベント
         */
        onMouseUp($event) {
            if (this.allDayEvent.onMouseUp($event)) {
            } else if (this.dateSelector.onMouseUp($event)) {
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
         * ドラッグイベント
         * @param $event {DragEvent} イベント
         */
        onDragStart($event) {
            if (this.timedEvent.onDragStart($event)) {
                this.$nextTick(() => this.timedEvent.addDraggingClass())
            }
        },

        /**
         * ドラッグ中の要素が要素に乗った時のイベント
         * @param $event
         */
        onDragOver($event) {
            this.timedEvent.onDragOver($event)
        },

        /**
         * ドロップイベント
         * @param $event {DragEvent} イベント
         */
        onDrop($event) {
            this.timedEvent.onDrop($event)
        },

        /**
         * ドラッグ中の要素が要素から外れた時のイベント
         * @param $event
         */
        onDragEnd($event) {
            this.timedEvent.onDragEnd($event)
        },
    }
}