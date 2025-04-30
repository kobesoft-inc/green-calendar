<?php

namespace Kobesoft\GreenCalendar;

use Filament\Support\Components\ViewComponent;

class DatePicker extends ViewComponent
{
    use Calendar\Concerns\BelongsToLivewire;
    use Calendar\Concerns\HasWeek;
}