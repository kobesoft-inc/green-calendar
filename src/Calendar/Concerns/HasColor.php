<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Kobesoft\GreenCalendar\ViewModel\Event;

trait HasColor
{
    protected string|array|Closure|null $color = null;

    /**
     * 色を設定する
     *
     * @param string|array|Closure|null $color 色
     * @return $this
     */
    public function color(string|array|Closure|null $color = null): static
    {
        $this->color = $color;
        return $this;
    }

    /**
     * 色を取得する
     *
     * @param Event|null $event 予定
     * @return string|array|null 色
     */
    public function getColor(?Event $event): string|array|null
    {
        $color = $this->evaluate($this->color, $event?->getNamedInjections() ?? []);
        if ($color === false) {
            return null;
        }
        if (filled($color)) {
            return $color;
        }
        return null;
    }
}