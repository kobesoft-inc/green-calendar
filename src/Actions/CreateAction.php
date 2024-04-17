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
            function (HasCalendar $livewire, array $arguments) {
                $startAttribute = $livewire->getCalendar()->getRecordStartAttribute() ?? 'start';
                $endAttribute = $livewire->getCalendar()->getRecordEndAttribute() ?? 'end';
                return [
                    $startAttribute => $arguments['start'],
                    $endAttribute => $arguments['end'],
                ];
            }
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