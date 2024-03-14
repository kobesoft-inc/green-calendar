<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\View\Component;
use Illuminate\View\View;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\View\Components\Contracts\CalendarView;

class MonthlyDayGrid extends Component implements CalendarView
{
    protected static int $numberOfWeeks = 6;
    protected string $view = 'green-calendar::components.monthly-day-grid';

    /**
     * コンポーネントを初期化する
     */
    public function __construct(
        protected Calendar $calendar,
    )
    {
    }

    /**
     * 前の月に移動する
     *
     * @param Carbon $date
     * @return Carbon
     */
    public function previousDate(Carbon $date): Carbon
    {
        return $date->firstOfMonth()->subMonth();
    }

    /**
     * 次の月に移動する
     *
     * @param Carbon $date
     * @return Carbon
     */
    public function nextDate(Carbon $date): Carbon
    {
        return $date->firstOfMonth()->addMonth();
    }

    /**
     * カレンダーに表示する月の初日を取得する
     *
     * @return Carbon
     */
    protected function getMonth(): Carbon
    {
        return $this->calendar->getLivewire()->getCurrentDate()->firstOfMonth();
    }

    /**
     * カレンダーの表示範囲を取得する
     *
     * @return CarbonPeriod
     */
    public function getPeriod(): CarbonPeriod
    {
        $start = $this->getMonth()
            ->startOfWeek($this->calendar->getFirstDayOfWeek());
        $end = $start->copy()
            ->addWeeks(self::$numberOfWeeks - 1)
            ->endOfWeek($this->calendar->getLastDayOfWeek())
            ->endOfDay();
        return CarbonPeriod::between($start, $end);
    }

    /**
     * カレンダーの見出しを取得する
     *
     * @return string
     */
    public function getDefaultHeading(): string
    {
        return $this->calendar->formatMonth($this->getMonth());
    }

    /**
     * コンポーネントのパラメータを取得する
     *
     * @return array
     */
    protected function componentParameters(): array
    {
        return [
            'remaining' => __('green-calendar::messages.remaining'),
        ];
    }

    /**
     * コンポーネントを描画する
     *
     * @return View
     * @throws Exception
     */
    public function render(): View
    {
        $period = $this->getPeriod();
        return view($this->view, [
            'calendar' => $this->calendar,
            'month' => $this->calendar->getLivewire()->getCurrentDate()->firstOfMonth(),
            'events' => $this->calendar->getEvents(),
            'componentParameters' => $this->componentParameters(),
        ]);
    }
}