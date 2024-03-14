<?php

namespace Kobesoft\GreenCalendar\Concerns;

use Kobesoft\GreenCalendar\Calendar;

trait InteractsWithCalendar
{
    use HasCurrentDate;
    use InteractsWithEvents;
    use InteractsWithRecord;

    protected Calendar $calendar;

    /**
     * カレンダーの初期化処理
     *
     * @return void
     */
    public function bootedInteractsWithCalendar(): void
    {
        $this->calendar = $this->calendar($this->makeCalendar());
        $this->calendar->setUpViewComponent();
    }

    /**
     * カレンダーのインスタンスを初期化する
     *
     * @param Calendar $calendar 変更前のカレンダーのインスタンス
     * @return Calendar 変更後のカレンダーのインスタンス
     */
    public function calendar(Calendar $calendar): Calendar
    {
        return $calendar;
    }

    /**
     * カレンダーのインスタンスを取得する
     *
     * @return Calendar カレンダーのインスタンス
     */
    public function getCalendar(): Calendar
    {
        return $this->calendar;
    }

    /**
     * カレンダーのインスタンスを生成する
     *
     * @return Calendar カレンダーのインスタンス
     */
    public function makeCalendar(): Calendar
    {
        return Calendar::make($this);
    }
}