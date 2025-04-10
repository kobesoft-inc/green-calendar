<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;

trait CanSelectDates
{
    protected bool|Closure $selectable = true;
    protected bool|Closure $multipleDates = true;
    protected bool|Closure $multipleResources = false;

    /**
     * 選択が可能かどうかを判定する
     *
     * @param bool|Closure $selectable 選択が可能な場合はtrue
     * @return $this
     */
    public function selectable(bool|Closure $selectable = true): static
    {
        $this->selectable = $selectable;
        return $this;
    }

    /**
     * 複数の日付を選択できるかを設定する
     *
     * @param bool|Closure $multipleDates 複数の日付を選択できる場合はtrue
     * @return $this
     */
    public function multipleDates(bool|Closure $multipleDates = true): static
    {
        $this->multipleDates = $multipleDates;
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
     * 複数のリソースを選択できるかを設定する
     *
     * @param bool|Closure $multipleResources 複数のリソースを選択できる場合はtrue
     * @return $this
     */
    public function multipleResources(bool|Closure $multipleResources = true): static
    {
        $this->multipleResources = $multipleResources;
        return $this;
    }

    /**
     * 複数の日付を選択できるかどうかを判定する
     * @return bool 複数の日付を選択できる場合はtrue
     */
    public function canSelectMultipleDates(): bool
    {
        return $this->evaluate($this->multipleDates);
    }


    /**
     * 複数のリソースを選択できるかどうかを判定する
     * @return bool 複数のリソースを選択できる場合はtrue
     */
    public function canSelectMultipleResources(): bool
    {
        return $this->evaluate($this->multipleResources);
    }
}