<?php

namespace Kobesoft\GreenCalendar\Concerns;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Closure;
use Exception;

trait HasCurrentDate
{
    public ?Carbon $currentDate = null;

    /**
     * 現在の表示日付を設定する
     *
     * @param Carbon $currentDate 現在の表示日付
     * @return $this
     */
    public function currentDate(Carbon $currentDate): static
    {
        $this->currentDate = $currentDate;
        return $this;
    }

    /**
     * 現在の表示日付を取得する
     *
     * @return Carbon 現在の表示日付
     */
    public function getCurrentDate(): Carbon
    {
        return $this->currentDate?->copy() ?? now();
    }

    /**
     * 次の月・週・日に移動するときの処理を取得する
     *
     * @return HasCurrentDate
     * @throws Exception
     */
    public function next(): static
    {
        if ($nextDate = $this->getCalendar()->getCalendarView()->nextDate($this->getCurrentDate())) {
            return $this->currentDate($nextDate);
        }
        throw new Exception("Current calendar view-component does not have a [nextUsing()].");
    }

    /**
     * 前の月・週・日に移動するときの処理を取得する
     *
     * @return HasCurrentDate
     * @throws Exception
     */
    public function previous(): static
    {
        if ($previousDate = $this->getCalendar()->getCalendarView()->previousDate($this->getCurrentDate())) {
            return $this->currentDate($previousDate);
        }
        throw new Exception("Current calendar view-component does not have a [previousUsing()].");
    }
}