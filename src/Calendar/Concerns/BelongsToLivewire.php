<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Kobesoft\GreenCalendar\Contracts\HasCalendar;

trait BelongsToLivewire
{
    protected HasCalendar $livewire;

    /**
     * Livewireコンポーネントを設定する
     *
     * @param HasCalendar $livewire
     * @return $this
     */
    public function livewire(HasCalendar $livewire)
    {
        $this->livewire = $livewire;
        return $this;
    }

    /**
     * Livewireコンポーネントを取得する
     *
     * @return HasCalendar
     */
    public function getLivewire(): HasCalendar
    {
        return $this->livewire;
    }
}