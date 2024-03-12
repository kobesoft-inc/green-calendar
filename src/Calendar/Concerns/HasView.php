<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Kobesoft\GreenCalendar\View\Components\Contracts\CalendarView;
use Kobesoft\GreenCalendar\View\Components\DailyTimeGrid;
use Kobesoft\GreenCalendar\View\Components\MonthlyDayGrid;
use Kobesoft\GreenCalendar\View\Components\ResourceTimeGrid;
use Kobesoft\GreenCalendar\View\Components\ResourceTimeline;
use Kobesoft\GreenCalendar\View\Components\WeeklyTimeGrid;
use Kobesoft\GreenCalendar\View\Components\YearlyDayGrid;

trait HasView
{
    protected ?string $calendarViewClass = null;
    protected ?CalendarView $calendarView = null;
    protected Closure|null $calendarViewUsing = null;

    /**
     * ビューコンポーネントをMonthlyDayGridに設定する
     *
     * @return $this
     */
    public function monthlyDayGrid(?Closure $using = null): static
    {
        $this->calendarViewClass = MonthlyDayGrid::class;
        $this->calendarViewUsing = $using;
        return $this;
    }

    /**
     * ビューコンポーネントをYearlyDayGridに設定する
     */
    public function yearlyDayGrid(?Closure $using = null): static
    {
        $this->calendarViewClass = YearlyDayGrid::class;
        $this->calendarViewUsing = $using;
        return $this;
    }

    /**
     * ビューコンポーネントをDailyTimeGridに設定する
     *
     * @return $this
     */
    public function dailyTimeGrid(?Closure $using = null): static
    {
        $this->calendarViewClass = DailyTimeGrid::class;
        $this->calendarViewUsing = $using;
        return $this;
    }

    /**
     * ビューコンポーネントをWeeklyTimeGridに設定する
     *
     * @return $this
     */
    public function weeklyTimeGrid(?Closure $using = null): static
    {
        $this->calendarViewClass = WeeklyTimeGrid::class;
        $this->calendarViewUsing = $using;
        return $this;
    }

    /**
     * ビューコンポーネントをResourceTimelineに設定する
     *
     * @return $this
     */
    public function resourceTimeGrid(?Closure $using = null): static
    {
        $this->calendarViewClass = ResourceTimeGrid::class;
        $this->calendarViewUsing = $using;
        return $this;
    }

    /**
     * ビューコンポーネントをResourceTimelineに設定する
     *
     * @return $this
     */
    public function resourceTimeline(?Closure $using = null): static
    {
        $this->calendarViewClass = ResourceTimeline::class;
        $this->calendarViewUsing = $using;
        return $this;
    }

    /**
     * カレンダーのビューを取得する
     *
     * @return CalendarView カレンダーのビュー
     */
    public function getCalendarView(): CalendarView
    {
        if ($this->calendarView !== null) {
            return $this->calendarView;
        } else {
            $this->calendarView = app($this->calendarViewClass, ['calendar' => $this]);
            if ($this->calendarViewUsing !== null) {
                $this->calendarViewUsing->call($this, $this->calendarView);
            }
            return $this->calendarView;
        }
    }

    /**
     * カレンダーのビューを初期化する
     *
     * @return void
     */
    public function setUpViewComponent(): void
    {
        $this->getCalendarView();
    }
}