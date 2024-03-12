<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;

trait HasCurrentDate
{
    protected ?CarbonPeriod $period = null;

    /**
     * 現在の表示日付を設定する
     *
     * @param Carbon $currentDate 現在の表示日付
     * @return $this
     */
    public function currentDate(Carbon $currentDate): static
    {
        $this->getLivewire()->currentDate($currentDate);
        return $this;
    }

    /**
     * 現在の表示日付を取得する
     *
     * @return Carbon 現在の表示日付
     */
    public function getCurrentDate(): Carbon
    {
        return $this->getLivewire()->getCurrentDate();
    }

    /**
     * カレンダーの表示範囲を設定する
     *
     * @param CarbonPeriod $period
     * @return $this
     */
    public function period(CarbonPeriod $period)
    {
        $this->period = $period;
        return $this;
    }

    /**
     * カレンダーの表示範囲を取得する
     *
     * @return CarbonPeriod
     * @throws Exception
     */
    public function getPeriod(): CarbonPeriod
    {
        if ($this->period) {
            return $this->period;
        }
        if ($period = $this->getCalendarView()->getPeriod()) {
            return $period;
        }
        throw new Exception("Current calendar view-component does not have a [getPeriod()].");
    }
}