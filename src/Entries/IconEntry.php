<?php

namespace Kobesoft\GreenCalendar\Entries;

class IconEntry extends Entry
{
    use Concerns\HasColor;
    use Concerns\HasIcon;

    protected string $view = 'green-calendar::components.entries.icon-entry';
}