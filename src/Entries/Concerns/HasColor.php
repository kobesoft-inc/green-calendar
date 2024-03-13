<?php

namespace Kobesoft\GreenCalendar\Entries\Concerns;

use Closure;

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
     * @param mixed $state ステート
     * @return string|array|null 色
     */
    public function getColor(mixed $state): string|array|null
    {
        $color = $this->evaluate($this->color, ['state' => $state]);
        if ($color === false) {
            return null;
        }
        if (filled($color)) {
            return $color;
        }
        return null;
    }
}