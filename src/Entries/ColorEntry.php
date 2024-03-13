<?php

namespace Kobesoft\GreenCalendar\Entries;

class ColorEntry extends Entry
{
    use Concerns\HasColor;

    protected string $view = 'green-calendar::components.entries.color-entry';
}