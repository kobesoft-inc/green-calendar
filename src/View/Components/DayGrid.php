<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
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
        protected EventCollection $events,
        protected bool            $showNonCurrentDates,
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
        if ($this->showNonCurrentDates) {
            return $this->getCalendarPeriod();
        } else {
            return $this->getMonthPeriod();
        }
    }

    /**
     * カレンダーの日付として表示する期間を取得する
     *
     * @return CarbonPeriod
     */
    protected function getCalendarPeriod(): CarbonPeriod
    {
        $start = $this->month->copy()
            ->startOfWeek($this->calendar->getFirstDayOfWeek());
        $end = $start->copy()
            ->addWeeks(static::$numberOfWeeks - 1)
            ->endOfWeek($this->calendar->getLastDayOfWeek());
        return CarbonPeriod::between($start, $end);
    }

    /**
     * 月の期間を取得する
     *
     * @return CarbonPeriod
     */
    protected function getMonthPeriod(): CarbonPeriod
    {
        return CarbonPeriod::create(
            $this->month->copy()->startOfMonth(),
            $this->month->copy()->endOfMonth()
        );
    }

    /**
     * コンポーネントを描画する
     *
     * @return View
     * @throws Exception
     */
    public function render(): View
    {
        return view($this->view, [
            'calendar' => $this->calendar,
            'period' => $this->getPeriod(),
            'calendarPeriod' => $this->getCalendarPeriod(),
            'events' => $this->calendar->getEvents(),
        ]);
    }
}