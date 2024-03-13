<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;

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
     * @param Model|null $record
     * @return string|array|null 色
     */
    public function getColor(?Model $record): string|array|null
    {
        $color = $this->evaluate($this->color, ['record' => $record]);
        if ($color === false) {
            return null;
        }
        if (filled($color)) {
            return $color;
        }
        return null;
    }
}