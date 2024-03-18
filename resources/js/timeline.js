import TimelineLayout from "./modules/TimelineLayout.js";
import Selector from "./modules/Selector.ts";
import TimelineSelection from "./modules/TimelineSelection.js";
import Resizer from "./modules/Resizer.js";

export default function timeline() {
    return {
        /**
         * レイアウト
         */
        timelineLayout: null,

        /**
         * セレクター
         */
        selector: null,

        /**
         * 選択範囲の描画
         */
        timelineSelection: null,

        /**
         * 初期化する
         */
        init() {
            // タイムラインのレイアウト
            this.timelineLayout = new TimelineLayout(this.$el);
            this.timelineLayout.registerCallbacks();
            this.$nextTick(() => {
                this.timelineLayout.updateLayout();
            });

            // 選択範囲の描画
            this.timelineSelection = new TimelineSelection(this.$el);

            // セレクター
            this.selector = new Selector(this.$el)
                .setContainerSelector('.gc-main')
                .setElementSelector('.gc-time-slot')
                .setPropertyName('index')
                .onDraw((start, end, resourceId) => {
                    this.timelineSelection.draw(start, end, resourceId);
                })
                .onSelect((start, end, resourceId) => {
                    this.$wire.onDate(
                        this.timelineLayout.getTimeSlot(start).dataset.time,
                        this.timelineLayout.getTimeSlot(end).dataset.timeEnd,
                        resourceId
                    );
                });

            // リサイザー
            this.resizer = new Resizer(this.$el, this.selector)
                .setContainerSelector('.gc-main')
                .setEventSelector('.gc-all-day-event-container')
                .setHeadCursor('gc-cursor-w-resize')
                .setTailCursor('gc-cursor-e-resize')
                .onMove((key, start, end) => {
                    this.moveEvent(key, start, end);
                    this.$wire.onMove(key, start, end);
                })
                .onEvent((key) => {
                    this.$wire.onEvent(key);
                })
                .onPreview((el, start, end) => {
                    el.dataset.start = start;
                    el.dataset.end = end;
                    this.timelineLayout.updateEventLayout(el);
                });

            // コールバックを登録
            this.resizer.registerCallbacks();
            this.selector.registerCallbacks();

            // Livewireからの強制更新イベントの処理
            Livewire.on('refreshCalendar', () => {
                this.$nextTick(() => this.timelineLayout.updateLayout())
            })
        },

        /**
         * イベントを移動する
         */
        moveEvent(key, start, end) {
            const el = this.$el.querySelector('.gc-events [data-key="' + key + '"]');
            const time = this.timelineLayout.getTimeSlot(start).dataset.time;
            const endTime = this.timelineLayout.getTimeSlot(end - 1).dataset.timeEnd;
            if (el.dataset.allDay === 'true') {
                this.$wire.onMove(key, time.substring(0, 10) + ' 00:00:00', endTime.substring(0, 10) + ' 23:59:59');
            } else {
                this.$wire.onMove(key, time, endTime);
            }
        }
    }
}