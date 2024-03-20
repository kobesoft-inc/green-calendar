<?php

namespace Kobesoft\GreenCalendar\ViewModel;

use Carbon\Carbon;
use Carbon\CarbonInterval;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

class EventCollection
{
    /**
     * 予定のコレクションを初期化する
     *
     * @param Collection $timedEvents
     * @param Collection $allDayEvents
     */
    protected function __construct(
        protected Collection $timedEvents,
        protected Collection $allDayEvents
    )
    {
    }

    /**
     * 配列から予定のコレクションを取得する
     *
     * @param Collection $events 予定の配列(event, modelのキーを持つ連想配列のコレクション)
     * @return EventCollection 予定のコレクション
     */
    public static function fromArray(Collection $events): static
    {
        $eventsGroupByType = $events->sortBy('start')->groupBy('type');
        return new static(
            $eventsGroupByType->get(EventType::TimedEvent->value, collect()),
            $eventsGroupByType->get(EventType::AllDayEvent->value, collect())
        );
    }

    /**
     * 時間指定の予定を取得する
     *
     * @return Collection<Event> Eventの配列
     */
    public function getTimedEvents(): Collection
    {
        return $this->timedEvents;
    }

    /**
     * 終日予定を取得する
     *
     * @return Collection<Event> Eventの配列
     */
    public function getAllDayEvents(): Collection
    {
        return $this->allDayEvents;
    }

    /**
     * 指定した期間内の予定のコレクションを取得する
     *
     * @param CarbonPeriod $period 期間
     * @return EventCollection 予定のコレクション
     */
    public function between(CarbonPeriod $period): EventCollection
    {
        return new static(
            $this->timedEvents->filter(fn(Event $event) => $event->between($period)),
            $this->allDayEvents->filter(fn(Event $event) => $event->between($period))
        );
    }

    /**
     * 指定した日付の予定のコレクションを取得する
     *
     * @param Carbon $date 日付
     * @return EventCollection 予定のコレクション
     */
    public function on(Carbon $date): EventCollection
    {
        return new static(
            $this->timedEvents->filter(fn(Event $event) => $event->on($date)),
            $this->allDayEvents->filter(fn(Event $event) => $event->on($date))
        );
    }

    /**
     * 指定した日付の時間指定の予定を取得する
     *
     * @param Carbon $date 日付
     * @return Collection<Event> Eventの配列
     */
    public function getTimedEventsOn(Carbon $date): Collection
    {
        return $this->timedEvents->filter(fn(Event $event) => $event->on($date));
    }

    /**
     * 指定した日付の終日の予定を取得する
     *
     * @param Carbon $date 日付
     * @return Collection<Event> Eventの配列
     */
    public function getAllDayEventsOn(Carbon $date): Collection
    {
        return $this->allDayEvents->filter(fn(Event $event) => $event->on($date));
    }

    /**
     * 指定した期間の時間指定の予定を取得する
     *
     * @param CarbonPeriod $period 期間
     * @return Collection<Event> Eventの配列
     */
    public function getTimedEventsBetween(CarbonPeriod $period): Collection
    {
        return $this->timedEvents->filter(fn(Event $event) => $event->between($period));
    }

    /**
     * 指定した期間の終日の予定を取得する
     *
     * @param CarbonPeriod $period 期間
     * @return Collection<Event> Eventの配列
     */
    public function getAllDayEventsBetween(CarbonPeriod $period): Collection
    {
        return $this->allDayEvents->filter(fn(Event $event) => $event->between($period));
    }

    /**
     * 開始時間でグループ化した時間指定の予定を取得する
     *
     * @param CarbonInterval $precision グループ化する際に、時間を丸める間隔
     * @return Collection<array-key, Collection<array-key, Event>> 日時の文字列でグループ化したEventの配列
     */
    public function getTimedEventsGroupByStart(CarbonInterval $precision): Collection
    {
        return $this->timedEvents->groupBy(fn(Event $event) => $event->getRoundedStart($precision)->toDateTimeString());
    }

    /**
     * リソースIDで絞り込んだ予定のコレクションを取得する
     *
     * @param string|null $resourceId リソースID
     * @return EventCollection リソースIDで絞り込んだ予定のコレクション
     */
    public function whereResource(?string $resourceId): EventCollection
    {
        if ($resourceId === null) {
            return $this;
        } else {
            return new static(
                $this->timedEvents->filter(fn(Event $event) => $event->resourceId === $resourceId),
                $this->allDayEvents->filter(fn(Event $event) => $event->resourceId === $resourceId)
            );
        }
    }

    /**
     * 終日予定に、配置情報を含める
     *
     * @param CarbonPeriod $period 期間
     * @return $this
     */
    public function withAllDayEventPositions(CarbonPeriod $period): static
    {
        $this->allDayEvents = $this->assignPosition($this->getAllDayEventsBetween($period), $period);
        return $this;
    }

    /**
     * 予定の配列に、配置情報を含める
     *
     * @param Collection $events 予定の配列
     * @param CarbonPeriod $period 期間
     * @param CarbonInterval|null $precision
     * @return Collection
     */
    protected function assignPosition(Collection $events, CarbonPeriod $period, ?CarbonInterval $precision = null): Collection
    {
        return $events->reduce(function (Collection $carry, Event $event) use ($period, $precision) {
            $start = max($event->getRoundedStart($precision), $period->start);
            $usedPositions = $carry
                ->filter(fn(Event $e) => $e->getRoundedEnd($precision) > $start)
                ->pluck('position');
            $freePositions = collect(range(0, $usedPositions->max() + 1))->diff($usedPositions);
            $event->position = $freePositions->first();
            return $carry->push($event);
        }, collect());
    }

    /**
     * 予定の配列に、分割数を含める
     *
     * @param Collection $events 予定の配列
     * @return Collection
     */
    protected function assignDivision(Collection $events): Collection
    {
        // 時間帯にグループ番号を振る
        $groupIndex = 0;
        $groups = [];
        $events = $events->sortBy('timeSlot');
        foreach ($events as $event) {
            $group = $groups[$event->timeSlot] ?? $groupIndex++;
            for ($i = 0; $i < $event->timeSlotSpan; $i++) {
                $groups[$event->timeSlot + $i] = $group;
            }
        }
        try {
            // グループ毎に最大の分割数を求める
            $divisions = [];
            foreach ($events as $event) {
                $divisions[$groups[$event->timeSlot]] = max(
                    $divisions[$groups[$event->timeSlot]] ?? 0,
                    $event->position + 1
                );
            }
        } catch (\Exception $e) {
            dd($groups, $events);
        }

        // グループ毎に分割数を振り直す
        foreach ($events as $event) {
            $event->division = $divisions[$groups[$event->timeSlot]];
        }

        return $events;
    }

    /**
     * 時間帯のレイアウトを設定する
     *
     * @param TimeSlots $timeSlots 時間帯
     * @param CarbonPeriod $period 期間
     * @return $this
     */
    public function withTimeGrid(TimeSlots $timeSlots, CarbonPeriod $period): static
    {
        $this->timedEvents = $this->timedEvents->map(fn(Event $event) => $event->withTimeSlotLayout($timeSlots, $period));
        $this->timedEvents = $this->assignPosition($this->timedEvents, $period, $timeSlots->interval);
        $this->timedEvents = $this->assignDivision($this->timedEvents);
        return $this;
    }

    /**
     * 時間帯のレイアウトを設定する
     *
     * @param TimeSlots $timeSlots 時間帯
     * @param CarbonPeriod $period 期間
     * @return $this
     */
    public function withTimeline(TimeSlots $timeSlots, CarbonPeriod $period): static
    {
        $this->allDayEvents = $this->assignPosition($this->getAllDayEventsBetween($period), $period);
        $this->allDayEvents = $this->allDayEvents->map(fn(Event $event) => $event->withTimeSlotLayout($timeSlots, $period, false));
        $this->timedEvents = $this->assignPosition($this->getTimedEventsBetween($period), $period, $timeSlots->interval);
        $this->timedEvents = $this->timedEvents->map(fn(Event $event) => $event->withTimeSlotLayout($timeSlots, $period, false));
        return $this;
    }
}