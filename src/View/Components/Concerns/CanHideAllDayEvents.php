<?php

namespace Kobesoft\GreenCalendar\View\Components\Concerns;

use Closure;

trait CanHideAllDayEvents
{
    protected bool $isAllDayEventsHidden = false;

    /**
     * 全日イベントを非表示にする
     *
     * @param bool|Closure $condition 全日イベントが非表示になる条件。またはクロージャ。
     * @return $this
     */
    public function hideAllDayEvents(bool $condition = true): static
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
        return $this->isAllDayEventsHidden;
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