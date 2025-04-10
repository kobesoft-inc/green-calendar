<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;

trait CanHideAllDayEvents
{
    protected bool|Closure $isAllDayEventsHidden = false;

    /**
     * 全日イベントを非表示にする
     *
     * @param bool|Closure $condition 全日イベントを非表示にするか？
     * @return $this
     */
    public function hideAllDayEvents(bool|Closure $condition = true): static
    {
        $this->isAllDayEventsHidden = $condition;
        return $this;
    }

    /**
     * 全日イベントが非表示か取得する
     *
     * @return bool 全日イベントが非表示か
     */
    public function isAllDayEventsHidden(): bool
    {
        return $this->evaluate($this->isAllDayEventsHidden);
    }

    /**
     * 全日イベントを表示されているか取得する
     *
     * @return bool 全日イベントが表示されているか
     */
    public function isAllDayEventsVisible(): bool
    {
        return !$this->isAllDayEventsHidden();
    }
}