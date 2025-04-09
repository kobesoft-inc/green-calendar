<?php

namespace Kobesoft\GreenCalendar\Contracts;

use Filament\Forms\Form;
use Illuminate\Database\Eloquent\Model;
use Kobesoft\GreenCalendar\Calendar;

/**
 * @property string $model
 */
interface HasCalendar
{
    public function getModel(): string;

    public function getRecord(): ?Model;

    public function getCalendar(): Calendar;

    public function refreshCalendar();
}