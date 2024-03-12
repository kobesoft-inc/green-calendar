<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\View\Component;
use Illuminate\View\View;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\View\Components\Contracts\CalendarView;
use Kobesoft\GreenCalendar\ViewModel\EventCollection;

class YearlyDayGrid extends Component implements CalendarView
{
    protected string $view = 'green-calendar::components.yearly-day-grid';

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
        return $date->startOfYear()->subYear();
    }

    /**
     * 次の月に移動する
     *
     * @param Carbon $date
     * @return Carbon
     */
    public function nextDate(Carbon $date): Carbon
    {
        return $date->startOfYear()->addYear();
    }

    /**
     * カレンダーの表示範囲を取得する
     *
     * @return CarbonPeriod
     */
    public function getPeriod(): CarbonPeriod
    {
        $start = $this->calendar->getLivewire()->getCurrentDate()
            ->startOfYear();
        $end = $start->copy()
            ->endOfYear()
            ->endOfDay();
        return CarbonPeriod::between($start, $end);
    }

    /**
     * イベントを取得する
     *
     * @return EventCollection
     * @throws Exception
     */
    protected function getEvents(): EventCollection
    {
        return $this->calendar->getEvents($this->getPeriod());
    }

    /**
     * Alpineコンポーネントのパラメータを取得する
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
            'period' => $period,
            'events' => $this->calendar->getEvents($period),
            'componentParameters' => $this->componentParameters(),
        ]);
    }
}