import DayGridLimit from "./modules/DayGridLimit";
import Selector from './modules/Selector.js'
import DayGridPopup from './modules/DayGridPopup'
import AllDayEvent from "./modules/AllDayEvent.js";
import DayGridTimedEvent from "./modules/DayGridTimedEvent.js";

export default function dayGrid(componentParameters) {
    return {
        /**
         * 表示件数を制限するコンポーネント
         */
        dayGridLimit: DayGridLimit,

        /**
         * ポップアップに関するコンポーネント
         */
        dayGridPopup: DayGridPopup,

        /**
         * 日付のセレクター
         */
        dateSelector: Selector,

        /**
         * 時間指定の予定に関する処理
         */
        timedEvent: DayGridTimedEvent,

        /**
         * 終日の予定に関する処理
         */
        allDayEvent: AllDayEvent,

        /**
         * カレンダーの初期化
         */
        init() {
            // ポップアップに関する処理
            this.dayGridPopup = new DayGridPopup(this.$el);

            // 表示数を制限するコンポーネントに関する処理
            this.dayGridLimit = new DayGridLimit(this.$el)
                .setLocalizedRemainingText(componentParameters.remaining)
                .onRemainingTextClick((elDay) => this.dayGridPopup.open(elDay));

            // 日付のセレクターに関する処理
            this.dateSelector = new Selector(this.$el)
                .setContainerSelector('.gc-day-grid')
                .setElementSelector('.gc-day')
                .setPropertyName('date')
                .onSelect((start, end, resourceId) => {
                    this.$wire.onDate(start + ' 00:00:00', end + ' 23:59:59', resourceId)
                });

            // 終日の予定に関する処理
            this.allDayEvent = new AllDayEvent(this.$el, this.dateSelector)
                .setContainerSelector('.gc-day-grid')
                .onMove((key, start, end) => {
                    this.$wire.onMove(key, start, end)
                })
                .onEvent((key) => {
                    this.$wire.onEvent(key)
                });

            // 時間指定の予定に関する処理
            this.timedEvent = new DayGridTimedEvent(this.$el, this.dateSelector, this)
                .onEvent((key) => {
                    this.$wire.onEvent(key)
                })
                .onMove((key, start, end) => {
                    this.$wire.onMove(key, start, end)
                });

            // コールバックの登録
            this.dayGridPopup.registerCallbacks();
            this.allDayEvent.registerCallbacks();
            this.timedEvent.registerCallbacks();
            this.dateSelector.registerCallbacks();

            // Livewireからの強制更新イベントの処理
            Livewire.on('refreshCalendar', () => {
                this.$nextTick(() => this.dayGridLimit.updateLayout(true))
            })
        },
    }
}