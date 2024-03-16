import selector from "./selector.js";
import resizer from "./resizer.js";
import {addDays, diffDays, overlapPeriod, toDateString} from "./date-utils.js";

export default function allDayEvent($el, rootSelector) {
    return {
        $el,

        /**
         * ルートセレクタ
         */
        rootSelector,

        /**
         * 日付選択
         */
        dateSelector: null,

        /**
         * リサイザー
         */
        resizer: null,

        /**
         * ホバー中の終日予定の要素
         */
        hover: null,

        /**
         * 終日予定をクリックした時の処理
         */
        onEvent: null,

        /**
         * 終日予定を移動した時の処理
         */
        onMove: null,

        /**
         * 初期化
         */
        init() {
            this.dateSelector = selector(this.$el, this.rootSelector, '.gc-day', 'date')
            this.resizer = resizer(this.$el, this.rootSelector, '.gc-all-day-event-container', this.dateSelector)
            this.resizer.headCursor = 'gc-cursor-w-resize'
            this.resizer.tailCursor = 'gc-cursor-e-resize'
            this.resizer.onEvent = (key) => {
                if (this.onEvent) {
                    this.onEvent(key)
                }
            }
            this.resizer.onMove = (key, start, end) => {
                if (this.onMove) {
                    this.onMove(key, start, end)
                }
            }
            this.resizer.onPreview = (el, start, end) => {
                this.removePreview()
                if (start && end) {
                    this.createPreview(el, start, end)
                }
            }
        },

        /**
         * 終日予定の移動を開始
         * @param $event {MouseEvent} イベント
         * @returns {boolean} 移動を開始したかどうか
         */
        onMouseDown($event) {
            return this.resizer.onMouseDown($event)
        },

        /**
         * 終日予定の移動を終了
         * @param $event {MouseEvent} イベント
         * @returns {boolean} 移動を終了したかどうか
         */
        onMouseMove($event) {
            return this.resizer.onMouseMove($event)
        },

        /**
         * 終日予定の移動を終了
         * @param $event {MouseEvent} イベント
         * @returns {boolean} 移動を終了したかどうか
         */
        onMouseUp($event) {
            return this.resizer.onMouseUp($event)
        },

        /**
         * 終日イベントのマウスホバー処理
         * @param $event {Event} イベント
         * @returns {boolean} イベントが処理されたかどうか
         */
        onMouseOver($event) {
            if (this.resizer.dragging) {
                // 終日イベントをドラッグ中、日付の選択処理中は、ホバーしない
                return
            }
            const el = this.findAllDayEventAtElement($event.target, true)
            const key = el ? el.dataset.key : null
            if (key !== this.hover) {
                this.setHoverAllDayEvent(this.hover, false)
                this.setHoverAllDayEvent(this.hover = key, true)
            }
        },

        /**
         * 終日予定を取得
         * @param el {HTMLElement} DOM要素
         * @param withoutPopup {boolean} ポップアップを除外するかどうか
         * @returns {null|HTMLElement} 予定のDOM要素またはnull
         */
        findAllDayEventAtElement(el, withoutPopup = false) {
            if (this.$el.contains(el)) {
                if (el.closest(rootSelector + (withoutPopup ? '' : ', .gc-day-grid-popup'))) {
                    return el.closest('.gc-all-day-event-container')
                }
            }
            return null
        },

        /**
         * 指定された終日予定のホバーを設定する
         * @param key {string} 終日予定のキー
         * @param hover {boolean} ホバーするかどうか
         */
        setHoverAllDayEvent(key, hover) {
            if (key) {
                this.$el.querySelectorAll('.gc-all-day-event-container[data-key="' + key + '"]').forEach(el => {
                    if (hover) {
                        el.classList.add('gc-hover')
                    } else {
                        el.classList.remove('gc-hover')
                    }
                })
            }
        },

        /**
         * ドラッグ中の終日予定のプレビューを表示
         * @param elEvent {HTMLElement} 予定のDOM要素
         * @param eventStart {string} 予定の開始日
         * @param eventEnd {string} 予定の終了日
         */
        createPreview(elEvent, eventStart, eventEnd) {
            // 各週ごとに処理
            Array.from(this.$el.querySelectorAll('.gc-week, .gc-all-day-section')).forEach(elWeek => {
                const [weekStart, weekEnd] = this.getWeekPeriod(elWeek)
                if (weekStart && weekEnd) {
                    const [periodStart, periodEnd] = overlapPeriod(eventStart, eventEnd, weekStart, weekEnd)
                    if (periodStart && periodEnd) {
                        const elPreview = elWeek.querySelector('.gc-day[data-date="' + periodStart + '"] .gc-all-day-event-preview')
                        if (weekStart <= this.resizer.grabbedDate && this.resizer.grabbedDate <= weekEnd) {
                            // ドラッグを開始した週では、ドラッグ位置を考慮して空の終日予定を追加する
                            this.addEmptyAllDayEvents(elPreview, this.getIndexInParent(elEvent))
                        }
                        const el = elEvent.cloneNode(true)
                        const days = diffDays(periodStart, periodEnd) + 1
                        this.adjustAllDayEventForPreview(el, days, periodStart === eventStart, periodEnd === eventEnd)
                        elPreview.appendChild(el)
                    }
                }
            })
        },

        /**
         * 週の開始日・終了日を取得
         * @param elWeek {HTMLElement} 週のDOM要素
         * @returns {Array} 週の開始日・終了日
         */
        getWeekPeriod(elWeek) {
            const elDays = elWeek.querySelectorAll('.gc-day:not(.gc-disabled)')
            if (elDays.length > 0) {
                return [elDays[0].dataset.date, elDays[elDays.length - 1].dataset.date]
            } else {
                return [null, null]
            }
        },

        /**
         * ドラッグ中の終日予定をプレビューに合わせる
         * @param el {HTMLElement} 予定のDOM要素
         * @param days {number} ドラッグ中の終日予定の日数
         * @param isStart {boolean} 週内に開始するかどうか
         * @param isEnd {boolean} 週内に終了するかどうか
         */
        adjustAllDayEventForPreview(el, days, isStart, isEnd) {
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
        },

        /**
         * 指定したDOM要素が兄弟の中で何番目かを取得
         * @param el {HTMLElement} DOM要素
         * @returns {number} インデックス
         */
        getIndexInParent(el) {
            return Array.from(el.parentNode.children).indexOf(el)
        },

        /**
         * 指定した数だけ空の終日予定を追加する
         */
        addEmptyAllDayEvents(elPreview, count) {
            for (let i = 0; i < count; i++) {
                const el = document.createElement('div')
                el.classList.add('gc-all-day-event-container')
                elPreview.appendChild(el)
            }
        },

        /**
         * 終日予定のプレビューを削除
         */
        removePreview() {
            Array.from(this.$el.querySelectorAll('.gc-all-day-event-preview'))
                .forEach(el => el.parentNode.replaceChild(el.cloneNode(false), el))
        },
    }
}