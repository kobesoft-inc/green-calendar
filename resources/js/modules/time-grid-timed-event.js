import selector from "./selector.js";
import resizer from "./resizer.js";
import {addDays, diffDays, overlapPeriod, toDateString} from "./date-utils.js";

export default function timeGridTimedEvent($el, rootSelector) {
    return {
        $el,

        /**
         * ルートセレクタ
         */
        rootSelector,

        /**
         * 日付選択
         */
        timeSelector: null,

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
            this.timeSelector = selector(this.$el, this.rootSelector, '.gc-slot', 'time')
            this.resizer = resizer(this.$el, this.rootSelector, '.gc-timed-event-container', this.timeSelector)
            this.resizer.headCursor = 'gc-cursor-n-resize'
            this.resizer.tailCursor = 'gc-cursor-s-resize'
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
            const resourceId = elEvent.dataset.resourceId
            Array.from(this.$el.querySelectorAll('.gc-timed-section .gc-day[data-resource-id="' + resourceId + '"]')).forEach(elDay => {
                const [dayStart, dayEnd] = this.getDayPeriod(elDay)
                if (dayStart && dayEnd) {
                    const [periodStart, periodEnd] = overlapPeriod(eventStart, eventEnd, dayStart, dayEnd)
                    if (periodStart && periodEnd) {
                        const elPreview = elDay.querySelector('.gc-slot[data-time="' + periodStart + '"] .gc-timed-event-preview')
                        const el = elEvent.cloneNode(true)
                        const slots = elDay.querySelectorAll('.gc-slot')
                        let s = 0, e = slots.length
                        for (let i = 0; i < slots.length; i++) {
                            if (slots[i].dataset.time === periodStart) {
                                s = i
                            }
                            if (slots[i].dataset.time === periodEnd) {
                                e = i
                            }
                        }
                        const h = e - s
                        this.adjustTimedEventForPreview(el, h)
                        elPreview.appendChild(el)
                    }
                }
            })
        },

        /**
         * 日の開始時間・終了時間を取得
         * @param elDay {HTMLElement} 週のDOM要素
         * @returns {Array} 日の開始時間・終了時間
         */
        getDayPeriod(elDay) {
            return [elDay.dataset.startTime, elDay.dataset.endTime]
        },

        /**
         * ドラッグ中の終日予定をプレビューに合わせる
         * @param el {HTMLElement} 予定のDOM要素
         * @param h {number} スロット数
         */
        adjustTimedEventForPreview(el, h) {
            el.classList.remove('gc-dragging')
            el.style.setProperty('--gc-timed-event-height', (h * 100) + '%');
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
         * 終日予定のプレビューを削除
         */
        removePreview() {
            Array.from(this.$el.querySelectorAll('.gc-timed-event-preview'))
                .forEach(el => el.parentNode.replaceChild(el.cloneNode(false), el))
        },
    }
}