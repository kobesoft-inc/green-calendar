<?php

namespace Kobesoft\GreenCalendar\Entries\Concerns;

use Kobesoft\GreenCalendar\Calendar;

trait BelongsToCalendar
{
    protected Calendar $calendar;

    /**
     * 所属するカレンダーを設定する
     *
     * @param Calendar $calendar カレンダー
     * @return $this
     */
    public function calendar(Calendar $calendar): static
    {
        $this->calendar = $calendar;
        return $this;
    }

    /**
     * 所属するカレンダーを取得する
     *
     * @return Calendar カレンダー
     */
    public function getCalendar(): Calendar
    {
        return $this->calendar;
    }
}