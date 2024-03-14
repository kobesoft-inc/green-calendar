<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Filament\Support\Enums\Alignment;

trait HasHeading
{
    protected string|Closure|null $heading = null;
    protected Alignment|Closure|null $headingAlignment = null;

    /**
     * 見出しを設定する
     *
     * @param string|Closure|null $heading 見出し
     * @return $this
     */
    public function heading(string|Closure|null $heading = null): static
    {
        $this->heading = $heading;
        return $this;
    }

    /**
     * 見出しを取得する
     *
     * @return string|null
     */
    public function getHeading(): ?string
    {
        return $this->evaluate($this->heading)
            ?? $this->getCalendarView()->getDefaultHeading();
    }

    /**
     * 見出しの配置を設定する
     *
     * @param Alignment|Closure|null $alignment 見出しの配置
     * @return $this
     */
    public function headingAlignment(Alignment|Closure|null $alignment): static
    {
        $this->headingAlignment = $alignment;
        return $this;
    }

    /**
     * 見出しの配置を取得する
     *
     * @return Alignment 見出しの配置
     */
    public function getHeadingAlignment(): Alignment
    {
        return $this->evaluate($this->headingAlignment) ?? Alignment::Center;
    }
}