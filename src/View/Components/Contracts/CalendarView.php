<?php

namespace Kobesoft\GreenCalendar\View\Components\Contracts;

use Carbon\Carbon;
use Carbon\CarbonPeriod;

interface CalendarView
{
    public function previousDate(Carbon $date): Carbon;

    public function nextDate(Carbon $date): Carbon;

    public function getPeriod(): CarbonPeriod;

    public function getDefaultHeading(): string;
}