<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Kobesoft\GreenCalendar\ViewModel\Event;

trait CanMove
{
    protected bool|Closure $movable = true;
    protected bool|Closure $resizable = true;

    /**
     * 予定の移動が可能かどうかを設定する
     *
     * @param bool|Closure $movable イベントの移動が可能な場合はtrue
     * @return $this
     */
    public function movable(bool|Closure $movable = true): static
    {
        $this->movable = $movable;
        return $this;
    }

    /**
     * 予定のリサイズが可能かどうかを設定する
     *
     * @param bool|Closure $resizable イベントのリサイズが可能な場合はtrue
     * @return $this
     */
    public function resizable(bool|Closure $resizable = true): static
    {
        $this->resizable = $resizable;
        return $this;
    }

    /**
     * 予定の移動が可能かどうかを判定する
     * @return bool イベントの移動が可能な場合はtrue
     */
    public function canMove(Event $event): bool
    {
        return $this->evaluate($this->movable, $event?->getNamedInjections() ?? []);
    }

    /**
     * 予定のリサイズが可能かどうかを判定する
     * @return bool イベントのリサイズが可能な場合はtrue
     */
    public function canResize(Event $event): bool
    {
        return $this->evaluate($this->resizable, $event?->getNamedInjections() ?? []);
    }
}