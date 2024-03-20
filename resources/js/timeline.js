import TimelineLayout from "./modules/TimelineLayout.js";
import Selector from "./modules/Selector.ts";
import TimelineSelection from "./modules/TimelineSelection.js";
import Resizer from "./modules/Resizer.js";
import DateUtils from "./modules/DateUtils.js";

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
         * タイムラインのリサイザーの処理
         */
        timelineResizer: null,

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
                    this.timelineSelection.draw(
                        this.selector.getElementByValue(start)?.dataset.index ?? null,
                        this.selector.getElementByValue(end)?.dataset.index ?? null,
                        resourceId
                    );
                })
                .onSelect((start, end, resourceId) => {
                    this.$wire.onDate(
                        this.timelineLayout.getDateTimeByIndex(start),
                        this.timelineLayout.getDateTimeByIndex(end, true),
                        resourceId
                    )
                });

            // リサイザー
            this.resizer = new Resizer(this.$el, this.selector)
                .setContainerSelector('.gc-main')
                .setEventSelector('.gc-all-day-event-container,.gc-timed-event-container')
                .setHeadCursor('gc-cursor-w-resize')
                .setTailCursor('gc-cursor-e-resize')
                .setUnit(this.timelineLayout.getTimeSlotsPerDay())
                .onMove((key, start, end) => {
                    if (this.resizer.isAllDayDragging()) {
                        this.$wire.onMove(
                            key,
                            DateUtils.setTimeOfDateTime(this.timelineLayout.getDateTimeByIndex(parseInt(start), false), '00:00:00'),
                            DateUtils.setTimeOfDateTime(this.timelineLayout.getDateTimeByIndex(parseInt(end) - 1, false), '23:59:59'),
                        );
                    } else {
                        this.$wire.onMove(
                            key,
                            this.timelineLayout.getDateTimeByIndex(parseInt(start), false),
                            this.timelineLayout.getDateTimeByIndex(parseInt(end) - 1, true),
                        );
                    }
                })
                .onEvent((key) => {
                    this.$wire.onEvent(key);
                })
                .onPreview((el, start, end) => {
                    if (start !== null && end !== null) {
                        el.dataset.start = start;
                        el.dataset.end = end;
                        this.timelineLayout.updateEventLayout(el);
                    }
                });

            // コールバックを登録
            this.resizer.registerCallbacks();
            this.selector.registerCallbacks();

            // Livewireからの強制更新イベントの処理
            Livewire.hook('request', ({uri, options, payload, respond, succeed, fail}) => {
                succeed(({status, json}) => {
                    this.$nextTick(() => this.timelineLayout.updateLayout())
                })
            })
        },
    }
}