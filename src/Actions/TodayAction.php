<?php

namespace Kobesoft\GreenCalendar\Actions;

use Carbon\Carbon;
use Filament\Actions\Action;
use Kobesoft\GreenCalendar\Contracts\HasCalendar;

class TodayAction extends Action
{
    public function setUp(): void
    {
        parent::setUp();

        $this->name('today');
        $this->label(Carbon::getTranslator()->trans('diff_today'));
        $this->action(
            fn(HasCalendar $livewire) => $livewire->currentDate(today())
        );
        $this->after(
            fn(HasCalendar $livewire) => $livewire->refreshCalendar()
        );
    }
}