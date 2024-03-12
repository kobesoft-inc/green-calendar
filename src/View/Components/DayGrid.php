<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\View\Component;
use Illuminate\View\View;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\ViewModel\EventCollection;

class DayGrid extends Component
{
    protected static int $numberOfWeeks = 6;
    protected string $view = 'green-calendar::components.day-grid';

    /**
     * コンポーネントを初期化する
     */
    public function __construct(
        protected Calendar        $calendar,
        protected Carbon          $month,
        protected EventCollection $events
    )
    {
    }

    /**
     * カレンダーの表示範囲を取得する
     *
     * @return CarbonPeriod
     */
    protected function getPeriod(): CarbonPeriod
    {
        $start = $this->month->copy()
            ->startOfWeek($this->calendar->getFirstDayOfWeek());
        $end = $start->copy()
            ->addWeeks(self::$numberOfWeeks - 1)
            ->endOfWeek($this->calendar->getLastDayOfWeek());
        return CarbonPeriod::between($start, $end);
    }

    /**
     * コンポーネントを描画する
     *
     * @return View
     */
    public function render(): View
    {
        return view($this->view, [
            'calendar' => $this->calendar,
            'period' => $this->getPeriod(),
            'events' => $this->calendar->getEvents(),
        ]);
    }
}