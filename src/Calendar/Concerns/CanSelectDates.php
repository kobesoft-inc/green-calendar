<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;

trait CanSelectDates
{
    protected bool|Closure $selectable = true;
    protected bool|Closure $multipleSelectable = true;

    /**
     * 日付の選択が可能かどうかを判定する
     *
     * @param bool|Closure $selectable 日付の選択が可能な場合はtrue
     * @param bool|Closure $multiple 複数の日付を選択できる場合はtrue
     * @return $this
     */
    public function selectable(bool|Closure $selectable = true, bool|Closure $multiple = true): static
    {
        $this->selectable = $selectable;
        $this->multipleSelectable = $multiple;

        return $this;
    }

    /**
     * 日付の選択が可能かどうかを判定する
     * @return bool 日付の選択が可能な場合はtrue
     */
    public function canSelect(): bool
    {
        return $this->evaluate($this->selectable);
    }

    /**
     * 複数の日付を選択できるかどうかを判定する
     * @return bool 複数の日付を選択できる場合はtrue
     */
    public function canSelectMultiple(): bool
    {
        return $this->evaluate($this->multipleSelectable);
    }
}