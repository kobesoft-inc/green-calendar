<?php

namespace Kobesoft\GreenCalendar\Entries;

class TextEntry extends Entry
{
    use Concerns\CanFormatState;
    use Concerns\HasColor;

    protected string $view = 'green-calendar::entries.text-entry';
}