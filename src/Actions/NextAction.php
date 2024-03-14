<?php

namespace Kobesoft\GreenCalendar\Actions;

use Filament\Actions\Action;
use Kobesoft\GreenCalendar\Contracts\HasCalendar;

class NextAction extends Action
{
    /**
     * アクションの設定
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();

        $this->name('next');
        $this->hiddenLabel();
        $this->icon('heroicon-o-chevron-right');
        $this->action(
            fn(HasCalendar $livewire) => $livewire->next()
        );
        $this->after(
            fn(HasCalendar $livewire) => $livewire->refreshCalendar()
        );
    }
}