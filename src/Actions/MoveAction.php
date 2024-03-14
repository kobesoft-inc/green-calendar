<?php

namespace Kobesoft\GreenCalendar\Actions;

use Kobesoft\GreenCalendar\Contracts\HasCalendar;

class MoveAction extends \Filament\Actions\Action
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->name('move');
        $this->action(
            function (HasCalendar $livewire, array $arguments) {
                $record = $livewire->getRecord();
                $startAttribute = $livewire->getCalendar()->getRecordStartAttribute();
                $endAttribute = $livewire->getCalendar()->getRecordEndAttribute();
                if ($startAttribute === null || $endAttribute === null) {
                    throw new \Exception('The calendar record start and end attributes must be set for default MoveAction.');
                }
                $record->fill([
                    $startAttribute => $arguments['start'],
                    $endAttribute => $arguments['end'],
                ]);
                $record->save();
            }
        );
        $this->after(
            fn(HasCalendar $livewire) => $livewire->refreshCalendar(),
        );
        $this->cancelParentActions();
    }
}