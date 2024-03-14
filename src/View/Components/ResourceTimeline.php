<?php

namespace Kobesoft\GreenCalendar\View\Components;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Exception;
use Generator;
use Illuminate\Support\Collection;
use Illuminate\View\Component;
use Illuminate\View\View;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\View\Components\Contracts\CalendarView;

class ResourceTimeline extends Component implements CalendarView
{
    use Concerns\HasTimeSlots;

    protected string $view = 'green-calendar::components.timeline';

    /**
     * コンポーネントを初期化する
     * @throws Exception
     */
    public function __construct(
        protected Calendar $calendar,
    )
    {
        $this->timeSlots('1 day'); // デフォルトの時間帯を設定する
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
     * タイムラインの表示範囲を取得する
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
     * コンポーネントを描画する
     *
     * @return View
     * @throws Exception
     */
    public function render(): View
    {
        return view($this->view, [
            'calendar' => $this->calendar,
            'timeSlots' => $this->getMonths($this->calendar->getPeriod()),
            'interval' => $this->interval,
            'events' => $this->calendar->getEvents(),
            'resources' => $this->calendar->getResources(),
        ]);
    }
}