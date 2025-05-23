<?php

namespace Kobesoft\GreenCalendar\ViewModel;

use Carbon\Carbon;
use Carbon\CarbonInterval;
use Carbon\CarbonPeriod;
use Illuminate\Database\Eloquent\Model;

class Event
{
    /**
     * @var int 配置位置
     */
    public int $position;

    /**
     * @var int 時間帯の分割数
     */
    public int $division;

    /**
     * @var int 時間帯のインデックス
     */
    public int $timeSlot;

    /**
     * @var int 時間帯の表示コマ数
     */
    public int $timeSlotSpan;

    /**
     * 予定を初期化する
     *
     * @param Carbon $start 開始日時
     * @param Carbon $end 終了日時
     * @param EventType $type 予定の種類
     * @param bool $background 背景型の予定かどうか
     * @param string|null $resourceId 関連付けられたリソース
     * @param Model|null $model 関連付けられたモデル
     */
    public function __construct(
        public Carbon    $start,
        public Carbon    $end,
        public EventType $type,
        public bool      $background = false,
        public ?string   $resourceId = null,
        public ?Model    $model = null,
    )
    {
        // 終日の予定の場合は開始日時を00:00:00、終了日時を23:59:59に設定します。
        if ($this->type === EventType::AllDayEvent) {
            $this->start->startOfDay();
            $this->end->endOfDay();
        }
    }

    /**
     * 予定を作成する
     *
     * @param Carbon $start 開始日時
     * @param Carbon $end 終了日時
     * @param EventType $type 予定の種類
     * @param bool $background 背景型の予定かどうか
     * @param string|null $resourceId 関連付けられたリソース
     * @param Model|null $model 関連付けられたモデル
     * @return Event 予定
     */
    public static function make(
        Carbon    $start,
        Carbon    $end,
        EventType $type,
        bool      $background = false,
        ?string   $resourceId = null,
        ?Model    $model = null,
    ): Event
    {
        return new static($start, $end, $type, $background, $resourceId, $model);
    }

    /**
     * 予定の期間を取得する
     *
     * @return CarbonPeriod 期間
     */
    public function period(): CarbonPeriod
    {
        return CarbonPeriod::create($this->start, $this->end);
    }

    /**
     * 指定した日に予定が含まれるかどうかを判定する
     *
     * @param Carbon $date
     * @return bool
     */
    public function on(Carbon $date): bool
    {
        if ($this->type === EventType::AllDayEvent) {
            return $date->between($this->start, $this->end);
        } else {
            return $this->start->isSameDay($date);
        }
    }

    /**
     * 指定した期間内に予定が含まれるかどうかを判定する
     *
     * @param CarbonPeriod $period 期間
     * @return bool 指定した期間内に予定が含まれるかどうか
     */
    public function between(CarbonPeriod $period): bool
    {
        return $period->overlaps($this->period());
    }

    /**
     * 開始日時を丸めて取得する
     *
     * @param CarbonInterval|null $precision 丸める精度。nullなら丸めない。
     * @return Carbon 開始日時
     */
    public function getRoundedStart(?CarbonInterval $precision = null): Carbon
    {
        return $precision
            ? static::roundCarbon($this->start, $precision, false)
            : $this->start;
    }

    /**
     * 終了日を丸めて取得する
     *
     * @param CarbonInterval|null $precision 丸める精度。nullなら丸めない。
     * @return Carbon 終了日時
     */
    public function getRoundedEnd(?CarbonInterval $precision = null): Carbon
    {
        return $precision
            ? static::roundCarbon($this->end, $precision, true)
            : $this->end;
    }

    /**
     * 指定した期間内に開始する予定かどうかを判定する
     *
     * @param CarbonPeriod $period 期間
     * @return bool 指定した期間内に開始する予定かどうか
     */
    public function startsBetween(CarbonPeriod $period): bool
    {
        return $period->contains($this->start);
    }

    /**
     * 指定した期間内に終了する予定かどうかを判定する
     *
     * @param CarbonPeriod $period 期間
     * @return bool 指定した期間内に終了する予定かどうか
     */
    public function endsBetween(CarbonPeriod $period): bool
    {
        return $period->contains($this->end);
    }

    /**
     * 時間帯のレイアウトを求め、この予定に設定する
     *
     * @param TimeSlots $timeSlots 時間帯
     * @param CarbonPeriod $period 期間
     * @param bool $limit 時間帯の表示を制限するかどうか
     * @return $this
     */
    public function withTimeSlotLayout(TimeSlots $timeSlots, CarbonPeriod $period, bool $limit = false): static
    {
        $start = $limit ? max($this->start, $period->getStartDate()) : $this->start;
        $end = $limit ? min($this->end, $period->getEndDate()) : $this->end;
        $this->timeSlot = $timeSlots->indexOf($start, $period);
        $this->timeSlotSpan = max($timeSlots->indexOf($end->subSecond(), $period) - $this->timeSlot, 0) + 1;
        if ($timeSlots->interval->d == 1) {
            $this->timeSlotSpan++;
        }
        return $this;
    }

    /**
     * 引数名からの依存関係を取得する
     *
     * @return array 依存関係
     */
    public function getNamedInjections(): array
    {
        return [
            'event' => $this,
            'record' => $this->model,
            'start' => $this->start,
            'end' => $this->end,
            'type' => $this->type,
            'isAllDayEvent' => $this->type === EventType::AllDayEvent,
            'isTimedEvent' => $this->type === EventType::TimedEvent,
            'resource', 'resourceId' => $this->resourceId,
        ];
    }

    /**
     * 引数名から依存関係を解決する
     *
     * @param string $parameterName パラメータ名
     * @return array|null 解決された依存関係
     */
    public function resolveDefaultClosureDependencyForEvaluationByName(string $parameterName): ?array
    {
        $namedInjections = $this->getNamedInjections();
        return isset($namedInjections[$parameterName]) ? [$namedInjections[$parameterName]] : null;
    }

    /**
     * 日時を丸める(実用上、年・月には未対応)
     *
     * @param Carbon $carbon 日時
     * @param CarbonInterval $precision 丸める単位
     * @param bool $roundsUp
     * @return Carbon
     */
    protected static function roundCarbon(Carbon $carbon, CarbonInterval $precision, bool $roundsUp): Carbon
    {
        if ($precision->years !== 0 || $precision->months !== 0) {
            throw new \InvalidArgumentException('Invalid span');
        }
        $startOfDay = $carbon->copy()->startOfDay();
        $secondsFromStartOfYear = $carbon->diffInSeconds($startOfDay);
        $roundedSeconds = $roundsUp
            ? ceil($secondsFromStartOfYear / $precision->totalSeconds) * $precision->totalSeconds
            : floor($secondsFromStartOfYear / $precision->totalSeconds) * $precision->totalSeconds;
        return $startOfDay->addSeconds($roundedSeconds);
    }
}