<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Kobesoft\GreenCalendar\ViewModel\Event;

trait CanClick
{
    protected bool|Closure $clickableEvents = true;

    /**
     * 予定のクリックが可能かどうかを設定する
     *
     * @param bool|Closure $clickableEvents イベントのクリックが可能な場合はtrue
     * @return $this
     */
    public function clickable(bool|Closure $clickableEvents = true): static
    {
        $this->clickableEvents = $clickableEvents;
        return $this;
    }

    /**
     * 予定のクリックが可能かどうかを判定する
     * @return bool イベントのクリックが可能な場合はtrue
     */
    public function canClick(Event $event): bool
    {
        return $this->evaluate($this->clickableEvents, $event?->getNamedInjections() ?? []);
    }
}