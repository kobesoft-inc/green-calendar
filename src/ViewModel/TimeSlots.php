<?php

namespace Kobesoft\GreenCalendar\ViewModel;

use Carbon\Carbon;
use Carbon\CarbonInterval;
use Carbon\CarbonPeriod;
use Exception;
use Iterator;

class TimeSlots
{
    static string $timePattern = '/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/';

    public CarbonPeriod $timeRange;
    public CarbonInterval $interval;

    /**
     * 時間帯を設定する
     *
     * @param CarbonInterval|string $interval 時間間隔
     * @param string|null $start 開始時間
     * @param string|null $end 終了時間
     * @return $this
     * @throws Exception
     */
    public function __construct(
        CarbonInterval|string $interval,
        string|null           $start = null,
        string|null           $end = null,
    )
    {
        $this->timeRange = CarbonPeriod::between(
            static::parseTimeSlotTime($start ?? '00:00:00'),
            static::parseTimeSlotTime($end ?? '23:59:59'),
        );
        $this->interval = CarbonInterval::make($interval);
        if (!static::isValidInterval($this->interval)) {
            throw new Exception('Invalid interval ' . $this->interval->forHumans());
        }
        return $this;
    }

    /**
     * 時間帯を生成する
     *
     * @param CarbonInterval|string $interval 時間間隔
     * @param string|null $start 開始時間
     * @param string|null $end 終了時間
     * @return static
     * @throws Exception
     */
    public static function make(
        CarbonInterval|string $interval,
        string|null           $start = null,
        string|null           $end = null,
    ): static
    {
        return new static($interval, $start, $end);
    }

    /**
     * 期間内の月を取得する
     *
     * @param CarbonPeriod $calendarPeriod
     * @return Iterator
     */
    public function getMonths(CarbonPeriod $calendarPeriod): Iterator
    {
        return collect(
            CarbonPeriod::between(
                $calendarPeriod->getStartDate()->copy()->startOfMonth(),
                $calendarPeriod->getEndDate()->copy()->endOfMonth()
            )->months()
        )->map(fn(Carbon $startOfMonth) => [
            'month' => $startOfMonth,
            'days' => $this->getDays($calendarPeriod, $startOfMonth)
        ])->getIterator();
    }

    /**
     * 指定した月の日にちを取得する
     *
     * @param CarbonPeriod $calendarPeriod
     * @param Carbon|null $startOfMonth
     * @return Iterator
     */
    public function getDays(CarbonPeriod $calendarPeriod, ?Carbon $startOfMonth = null): Iterator
    {
        if ($startOfMonth) {
            $start = $startOfMonth->copy()->max($calendarPeriod->getStartDate());
            $period = CarbonPeriod::between(
                $start,
                $start->copy()->endOfMonth()->min($calendarPeriod->getEndDate())
            );
        } else {
            $period = $calendarPeriod;
        }
        return collect($period->days())->map(fn(Carbon $date) => [
            'date' => $date,
            'hours' => $this->getHours($date),
        ])->getIterator();
    }

    /**
     * 時間帯を取得する
     *
     * @param Carbon|null $date 日付
     * @return Iterator
     */
    public function getHours(?Carbon $date = null): Iterator
    {
        $hours = collect();
        $time = $date
            ? $date->copy()->setTimeFrom($this->timeRange->getStartDate())
            : $this->timeRange->getStartDate()->copy();
        $end = $date
            ? $date->copy()->setTimeFrom($this->timeRange->getEndDate())
            : $this->timeRange->getEndDate()->copy();
        $intervalHours = max($this->interval->totalHours, 1);
        while ($time->lt($end)) {
            $hours->push(['hour' => $time->copy(), 'minutes' => $this->getMinutes($time)]);
            $time->addHours($intervalHours)->startOfHour();
        }
        return $hours->getIterator();
    }

    /**
     * 時間帯の分を取得する
     *
     * @param Carbon $time 時間 (時刻)
     * @return Iterator
     */
    public function getMinutes(Carbon $time): Iterator
    {
        $minutes = collect();
        $time = $time->copy();
        $end = $time->copy()->addHour();
        $end->minute = $end->second = 0;
        if (($intervalMinutes = $this->interval->totalMinutes) == 0) {
            $intervalMinutes = 60;
        }
        while ($time->lt($end)) {
            $minutes->push(CarbonPeriod::between(
                $time,
                $time->copy()->addMinutes($intervalMinutes)->min($this->timeRange->getEndDate()->copy()->setDateFrom($time))
            ));
            $time->addMinutes($intervalMinutes);
        }
        return $minutes->getIterator();
    }

    /**
     * 時間帯の分を取得する
     *
     * @return int 分
     */
    public function getIntervalSeconds(): int
    {
        return static::intervalToMinutes($this->interval) * 60;
    }

    /**
     * 時間間隔が有効かどうかを判定する
     *
     * @param CarbonInterval $interval 時間間隔
     * @return bool 有効な場合は true
     */
    protected static function isValidInterval(CarbonInterval $interval): bool
    {
        if ($interval->y > 0 || $interval->m > 0 || $interval->d > 1 || $interval->s) {
            return false; // 1ヶ月以上の間隔、秒単位の間隔は無効
        }
        if ($interval->d > 0 && ($interval->h > 0 || $interval->i > 0)) {
            return false; // 1日以上の間隔の場合、時間または分単位の間隔は無効
        }
        if ($interval->h > 0 && $interval->i > 0) {
            return false; // 1時間以上の間隔の場合、分単位の間隔は無効
        }
        if ($interval->i > 0 && 60 % $interval->i !== 0) {
            return false; // 60分で割り切れない場合は無効
        }
        return true;
    }

    /**
     * 間隔を分に変換する
     *
     * @param CarbonInterval $interval 時間間隔
     * @return int 分
     */
    protected static function intervalToMinutes(CarbonInterval $interval): int
    {
        return $interval->days * 24 * 60 + $interval->hours * 60 + $interval->minutes;
    }

    /**
     * @throws Exception
     */
    protected static function parseTimeSlotTime(string $time): Carbon
    {
        if (preg_match(static::$timePattern, $time, $matches)) {
            return Carbon::create()
                ->addHours(intval($matches[1]))
                ->addMinutes(intval($matches[2] ?? 0))
                ->addSeconds(intval($matches[3] ?? 0));
        } else {
            throw new Exception('Invalid time format');
        }
    }

    /**
     * 指定した日時の日付・時間帯含めたインデックスを取得する
     *
     * @param Carbon $time 日時
     * @return int インデックス
     */
    public function indexOf(Carbon $time, CarbonPeriod $period): int
    {
        if ($this->interval->h > 0 || $this->interval->i > 0) {
            // 1日の開始時間、終了時間の分を取得
            $start = $this->timeRange->getStartDate()->hour * 60 + $this->timeRange->getStartDate()->minute;
            $end = $this->timeRange->getEndDate()->hour * 60 + $this->timeRange->getEndDate()->minute - 1;
            // 時間帯のインデックスを求める
            $min = $time->hour * 60 + $time->minute;
            $min = max($start, min($end, $min)) - $start;
            $timeIndex = floor($min / ($this->interval->h * 60 + $this->interval->i));
        } else {
            $timeIndex = 0;
        }
        $days = floor($period->getStartDate()->copy()->startOfDay()->diffInDays($time));
        return $timeIndex + $this->timeSlotsPerDay() * $days;
    }

    /**
     * 1日の時間帯の数を取得する
     *
     * @return int 時間帯の数
     */
    public function timeSlotsPerDay(): int
    {
        return ceil($this->timeRange->getEndDate()->diffInMinutes($this->timeRange->getStartDate()) / $this->interval->totalMinutes);
    }

    /**
     * 指定した日の時間範囲を取得する
     *
     * @param Carbon $date 日付
     * @return CarbonPeriod
     */
    public function periodOfDate(Carbon $date): CarbonPeriod
    {
        return CarbonPeriod::between(
            $date->copy()->setTimeFrom($this->timeRange->getStartDate()),
            $date->copy()->setTimeFrom($this->timeRange->getEndDate())
        );
    }
}