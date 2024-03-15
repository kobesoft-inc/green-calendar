@props(['calendar', 'period', 'column', 'events'])
@php
    $allDayEvents = $events->getAllDayEventsOn($column->date)->keyBy('position');
    $maxPosition = $allDayEvents->max('position') ?? -1;
@endphp
<div
    class="gc-day"
    data-date="{{$column->date->toDateString()}}"
>
    <x-green-calendar::time-grid.all-day-section.all-day-events
        :calendar="$calendar"
        :date="$column->date"
        :period="$period"
        :allDayEvents="$allDayEvents"
        :maxPosition="$maxPosition"
    />
</div>