<?php

namespace Kobesoft\GreenCalendar\ViewModel;

enum EventType: int
{
    /**
     * 時間指定の予定
     */
    case TimedEvent = 1;

    /**
     * 終日の予定
     */
    case AllDayEvent = 2;
}
