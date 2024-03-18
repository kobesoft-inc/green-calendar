import Selector from "./modules/Selector.ts";
import AllDayEvent from "./modules/AllDayEvent.js";
import TimedGridTimedEvent from "./modules/TimedGridTimedEvent.js";

export default function TimeGrid() {
    return {
        /**
         * 日付のセレクター
         */
        dateSelector: Selector,//selector(this.$el, '.gc-time-grid', '.gc-day', 'date'),

        /**
         * 時間のセレクター
         */
        timeSelector: Selector,//selector(this.$el, '.gc-time-grid', '.gc-slot', 'time'),

        /**
         * 終日予定
         */
        allDayEvent: AllDayEvent,//allDayEvent(this.$el, '.gc-time-grid'),

        /**
         * 時間指定の予定
         */
        timedEvent: TimedGridTimedEvent,//timedEvent(this.$el, '.gc-time-grid'),

        /**
         * カレンダーの初期化
         */
        init() {
            this.dateSelector = new Selector(this.$el)
                .setContainerSelector('.gc-all-day-section')
                .setElementSelector('.gc-day')
                .setPropertyName('date')
                .onSelect((start, end, resourceId) => {
                    this.$wire.onDate(start + ' 00:00:00', end + ' 23:59:59', resourceId)
                });
            this.timeSelector = new Selector(this.$el)
                .setContainerSelector('.gc-timed-section')
                .setElementSelector('.gc-slot')
                .setPropertyName('time')
                .onSelect((start, end, resourceId) => {
                    this.$wire.onDate(start, this.timeSelector.getElementByValue(end).dataset.timeEnd, resourceId)
                });
            this.allDayEvent = new AllDayEvent(this.$el, this.dateSelector)
                .setContainerSelector('.gc-all-day-section')
                .onEvent((key) => {
                    this.$wire.onEvent(key)
                })
                .onMove((key, start, end) => {
                    this.$wire.onMove(key, start, end)
                });
            this.timedEvent = new TimedGridTimedEvent(this.$el, this.timeSelector)
                .setContainerSelector('.gc-timed-section')
                .onEvent((key) => {
                    this.$wire.onEvent(key)
                })
                .onMove((key, start, end) => {
                    this.$wire.onMove(key, start, end)
                });

            // コールバックの登録
            this.allDayEvent.registerCallbacks();
            this.timedEvent.registerCallbacks();
            this.dateSelector.registerCallbacks();
            this.timeSelector.registerCallbacks();
        },
    }
}