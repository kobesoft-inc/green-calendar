<?php

namespace Kobesoft\GreenCalendar\View\Components\Concerns;

use Carbon\Carbon;
use Carbon\CarbonInterval;
use Carbon\CarbonPeriod;
use Exception;
use Iterator;

trait HasTimeSlots
{
    static string $timePattern = '/^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?$/';

    protected CarbonPeriod $timeRange;
    protected CarbonInterval $interval;

    /**
     * 時間帯を設定する
     *
     * @param CarbonInterval|string $interval 時間間隔
     * @param string|null $start 開始時間
     * @param string|null $end 終了時間
     * @return $this
     * @throws Exception
     */
    public function timeSlots(
        CarbonInterval|string $interval,
        string|null           $start = null,
        string|null           $end = null,
    ): static
    {
        $this->timeRange = CarbonPeriod::between(
            self::parseTimeSlotTime($start ?? '00:00:00'),
            self::parseTimeSlotTime($end ?? '23:59:59'),
        );
        $this->interval = CarbonInterval::make($interval);
        if (!self::isValidInterval($this->interval)) {
            throw new Exception('Invalid interval');
        }
        return $this;
    }

    /**
     * 期間内の月を取得する
     *
     * @param CarbonPeriod $calendarPeriod
     * @return Iterator
     */
    protected function getMonths(CarbonPeriod $calendarPeriod): Iterator
    {
        return collect(
            CarbonPeriod::between(
                $calendarPeriod->start->copy()->startOfMonth(),
                $calendarPeriod->end->copy()->endOfMonth()
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
    protected function getDays(CarbonPeriod $calendarPeriod, ?Carbon $startOfMonth = null): Iterator
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
            'hours' => $this->getTimeSlots($date),
        ])->getIterator();
    }

    /**
     * 時間帯を取得する
     *
     * @param Carbon|null $date 日付
     * @return Iterator
     */
    protected function getTimeSlots(?Carbon $date = null): Iterator
    {
        $hours = collect();
        $time = $date
            ? $date->copy()->setTimeFrom($this->timeRange->start)
            : $this->timeRange->start->copy();
        $end = $date
            ? $date->copy()->setTimeFrom($this->timeRange->end)
            : $this->timeRange->end->copy();
        $intervalHours = max($this->interval->totalHours, 1);
        while ($time->lt($end)) {
            $hours->push(['hour' => $time->copy(), 'minutes' => $this->getMinuteTimeSlots($time)]);
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
    protected function getMinuteTimeSlots(Carbon $time): Iterator
    {
        $minutes = collect();
        $time = $time->copy();
        $end = $time->copy()->addHour();
        $end->minute = $end->second = 0;
        if (($intervalMinutes = $this->interval->totalMinutes) == 0) {
            $intervalMinutes = 60;
        }
        while ($time->lt($end)) {
            $minutes->push($time->copy());
            $time->addMinutes($intervalMinutes);
        }
        return $minutes->getIterator();
    }

    /**
     * 時間間隔が有効かどうかを判定する
     *
     * @param CarbonInterval $interval 時間間隔
     * @return bool 有効な場合は true
     */
    protected static function isValidInterval(CarbonInterval $interval): bool
    {
        if ($interval->years > 0 || $interval->months > 1 || $interval->seconds) {
            return false; // 1ヶ月以上の間隔、秒単位の間隔は無効
        }
        if ($interval->days > 0 && ($interval->hours > 0 || $interval->minutes > 0)) {
            return false; // 1日以上の間隔の場合、時間または分単位の間隔は無効
        }
        if ($interval->hours > 0 && $interval->minutes > 0) {
            return false; // 1時間以上の間隔の場合、分単位の間隔は無効
        }
        if ($interval->minutes > 0 && 60 % $interval->minutes !== 0) {
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
        if (preg_match(self::$timePattern, $time, $matches)) {
            return Carbon::create()
                ->addHours($matches[1])
                ->addMinutes($matches[2] ?? 0)
                ->addSeconds($matches[3] ?? 0);
        } else {
            throw new Exception('Invalid time format');
        }
    }
}