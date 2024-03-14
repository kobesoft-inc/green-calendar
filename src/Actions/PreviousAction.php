<?php

namespace Kobesoft\GreenCalendar\Actions;

use Filament\Actions\Action;
use Kobesoft\GreenCalendar\Contracts\HasCalendar;

class PreviousAction extends Action
{
    /**
     * アクションの設定
     *
     * @return void
     */
    public function setUp(): void
    {
        parent::setUp();

        $this->name('previous');
        $this->hiddenLabel();
        $this->icon('heroicon-o-chevron-left');
        $this->action(
            fn(HasCalendar $livewire) => $livewire->previous()
        );
        $this->after(
            fn(HasCalendar $livewire) => $livewire->refreshCalendar()
        );
    }
}