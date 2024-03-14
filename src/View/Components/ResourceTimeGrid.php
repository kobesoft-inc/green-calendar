<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Illuminate\Support\Collection;
use Illuminate\View\Component;
use Illuminate\View\View;
use Iterator;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\View\Components\Contracts\CalendarView;
use Kobesoft\GreenCalendar\ViewModel\EventCollection;
use Kobesoft\GreenCalendar\ViewModel\Resource;
use Kobesoft\GreenCalendar\ViewModel\TimeGridColumn;

class ResourceTimeGrid extends Component implements CalendarView
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
        $date = $this->calendar->getCurrentDate();
        return $this->calendar->getResources()
            ->map(fn(Resource $resource) => TimeGridColumn::make($resource->title, $date, $resource->id))
            ->getIterator();
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
            'columns' => $this->getColumns(),
            'timeSlots' => $this->getTimeSlots(),
            'events' => $this->calendar->getEvents(),
        ]);
    }
}