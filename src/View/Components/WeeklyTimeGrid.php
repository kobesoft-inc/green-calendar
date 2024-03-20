<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\View\Component;
use Illuminate\View\View;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\View\Components\Contracts\CalendarView;
use Kobesoft\GreenCalendar\ViewModel\TimeGridColumn;

class WeeklyTimeGrid extends Component implements CalendarView
{
    use Concerns\HasTimeSlots;

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
     * 前の月に移動する
     *
     * @param Carbon $date
     * @return Carbon
     */
    public function previousDate(Carbon $date): Carbon
    {
        return $date->startOfWeek($this->calendar->getFirstDayOfWeek())->subWeek();
    }

    /**
     * 次の月に移動する
     *
     * @param Carbon $date
     * @return Carbon
     */
    public function nextDate(Carbon $date): Carbon
    {
        return $date->startOfWeek($this->calendar->getFirstDayOfWeek())->addWeek();
    }

    /**
     * カレンダーの表示範囲を取得する
     *
     * @return CarbonPeriod
     */
    public function getPeriod(): CarbonPeriod
    {
        $start = $this->calendar->getLivewire()->getCurrentDate()
            ->startOfWeek($this->calendar->getFirstDayOfWeek());
        $end = $start->copy()
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
        return 'Daily Time Grid';
    }

    /**
     * カラムのイテレータを取得する
     */
    protected function getColumns(): \Iterator
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
            'canSelectDates' => $this->calendar->canSelectDates(),
            'canSelectMultipleDates' => $this->calendar->canSelectMultipleDates(),
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
            'componentParameters' => $this->componentParameters(),
        ]);
    }
}