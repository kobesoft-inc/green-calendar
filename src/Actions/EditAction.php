<?php

namespace Kobesoft\GreenCalendar\Actions;

use Filament\Forms\Form;
use Kobesoft\GreenCalendar\Contracts\HasCalendar;

class EditAction extends \Filament\Actions\EditAction
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->form(
            fn(HasCalendar $livewire, Form $form) => $livewire->form($form),
        );
        $this->model(
            fn(HasCalendar $livewire) => $livewire->getModel(),
        );
        $this->record(
            fn(HasCalendar $livewire) => $livewire->getRecord(),
        );
        $this->after(
            fn(HasCalendar $livewire) => $livewire->refreshCalendar(),
        );
        $this->cancelParentActions();
    }
}