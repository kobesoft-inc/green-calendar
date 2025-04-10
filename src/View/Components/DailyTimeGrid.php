<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\View\Component;
use Illuminate\View\View;
use Iterator;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\View\Components\Contracts\CalendarView;
use Kobesoft\GreenCalendar\ViewModel\TimeGridColumn;

class DailyTimeGrid extends Component implements CalendarView
{
    use Concerns\HasTimeSlots;
    use Concerns\CanHideAllDayEvents;

    protected string $view = 'green-calendar::components.time-grid';

    /**
     * コンポーネントを初期化する
     * @throws Exception
     */
    public function __construct(
        protected Calendar $calendar,
    )
    {
        // デフォルトの時間帯を設定する
        $this->timeSlots('30 minutes', '00:00:00', '23:59:59');
    }

    /**
     * 昨日に移動する
     *
     * @param Carbon $date
     * @return Carbon
     */
    public function previousDate(Carbon $date): Carbon
    {
        return $date->subDay();
    }

    /**
     * 明日に移動する
     *
     * @param Carbon $date
     * @return Carbon
     */
    public function nextDate(Carbon $date): Carbon
    {
        return $date->addDay();
    }

    /**
     * カレンダーの表示範囲を取得する
     *
     * @return CarbonPeriod
     */
    public function getPeriod(): CarbonPeriod
    {
        $start = $this->calendar->getCurrentDate();
        $end = $start->copy()->endOfDay();
        return CarbonPeriod::between($start, $end);
    }

    /**
     * カレンダーの見出しを取得する
     *
     * @return string
     */
    public function getDefaultHeading(): string
    {
        return 'Daily Time Grid';
    }

    /**
     * カラムのイテレータを取得する
     *
     * @return Iterator
     */
    protected function getColumns(): Iterator
    {
        return collect($this->getPeriod()->days())
            ->map(fn(Carbon $date) => TimeGridColumn::make($date->day, $date, null))
            ->getIterator();
    }

    /**
     * Alpineコンポーネントのパラメータを取得する
     *
     * @return array
     */
    protected function componentParameters(): array
    {
        return [
            'canSelectDates' => $this->calendar->canSelect(),
            'canSelectMultipleDates' => $this->calendar->canSelectMultipleDates(),
            'canSelectMultipleResources' => $this->calendar->canSelectMultipleResources(),
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
        if ($this->timeSlots->interval->gt('1 day')) {
            throw new Exception('The interval must be less than or equal to 1 day.');
        }
        return view($this->view, [
            'calendar' => $this->calendar,
            'period' => $this->calendar->getPeriod(),
            'columns' => $this->getColumns(),
            'timeSlots' => $this->getTimeSlots(),
            'events' => $this->calendar->getEvents(),
            'allDayEventsVisible' => $this->isAllDayEventsVisible(),
            'componentParameters' => $this->componentParameters(),
        ]);
    }
}