<?php

namespace Kobesoft\GreenCalendar\View\Components\Concerns;

use Exception;
use Kobesoft\GreenCalendar\ViewModel\TimeSlots;

trait HasTimeSlots
{
    protected ?TimeSlots $timeSlots = null;

    /**
     * 時間帯を設定する
     *
     * @param string $interval 時間帯の間隔
     * @param string|null $start 開始時間
     * @param string|null $end 終了時間
     * @return $this
     * @throws Exception
     */
    public function timeSlots(string $interval, ?string $start = null, ?string $end = null): static
    {
        $this->timeSlots = TimeSlots::make($interval, $start, $end);
        return $this;
    }

    /**
     * 時間帯を取得する
     *
     * @return TimeSlots
     */
    public function getTimeSlots(): TimeSlots
    {
        return $this->timeSlots;
    }
}