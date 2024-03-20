<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;

trait CanSelectDates
{
    protected bool|Closure $selectableDates = true;
    protected bool|Closure $multipleSelectableDates = false;

    /**
     * 日付の選択が可能かどうかを判定する
     *
     * @param bool|Closure $selectableDates 日付の選択が可能な場合はtrue
     * @param bool|Closure $multiple 複数の日付を選択できる場合はtrue
     * @return $this
     */
    public function selectableDates(bool|Closure $selectableDates = true, bool|Closure $multiple = true): static
    {
        $this->selectableDates = $selectableDates;
        $this->multipleSelectableDates = $multiple;

        return $this;
    }

    /**
     * 日付の選択が可能かどうかを判定する
     * @return bool 日付の選択が可能な場合はtrue
     */
    public function canSelectDates(): bool
    {
        return $this->evaluate($this->selectableDates);
    }

    /**
     * 複数の日付を選択できるかどうかを判定する
     * @return bool 複数の日付を選択できる場合はtrue
     */
    public function canSelectMultipleDates(): bool
    {
        return $this->evaluate($this->multipleSelectableDates);
    }
}