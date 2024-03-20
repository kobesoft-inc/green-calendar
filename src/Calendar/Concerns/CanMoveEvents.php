<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Kobesoft\GreenCalendar\ViewModel\Event;

trait CanMoveEvents
{
    protected bool|Closure $movableEvents = true;
    protected bool|Closure $resizableEvents = true;

    /**
     * 予定の移動が可能かどうかを設定する
     *
     * @param bool|Closure $movableEvents イベントの移動が可能な場合はtrue
     * @return $this
     */
    public function movableEvents(bool|Closure $movableEvents = true): static
    {
        $this->movableEvents = $movableEvents;
        return $this;
    }

    /**
     * 予定のリサイズが可能かどうかを設定する
     *
     * @param bool|Closure $resizableEvents イベントのリサイズが可能な場合はtrue
     * @return $this
     */
    public function resizableEvents(bool|Closure $resizableEvents = true): static
    {
        $this->resizableEvents = $resizableEvents;
        return $this;
    }

    /**
     * 予定の移動が可能かどうかを判定する
     * @return bool イベントの移動が可能な場合はtrue
     */
    public function canMoveEvent(Event $event): bool
    {
        return $this->evaluate($this->movableEvents, $event?->getNamedInjections() ?? []);
    }

    /**
     * 予定のリサイズが可能かどうかを判定する
     * @return bool イベントのリサイズが可能な場合はtrue
     */
    public function canResizeEvent(Event $event): bool
    {
        return $this->evaluate($this->resizableEvents, $event?->getNamedInjections() ?? []);
    }
}