<?php

namespace Kobesoft\GreenCalendar\Actions;

use Filament\Forms\Form;
use Kobesoft\GreenCalendar\Contracts\HasCalendar;

class CreateAction extends \Filament\Actions\CreateAction
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->form(
            fn(HasCalendar $livewire, Form $form) => $livewire->form($form),
        );
        $this->fillForm(
            fn(array $arguments) => $arguments,
        );
        $this->model(
            fn(HasCalendar $livewire) => $livewire->getModel(),
        );
        $this->after(
            fn(HasCalendar $livewire) => $livewire->refreshCalendar(),
        );
        $this->cancelParentActions();
    }
}