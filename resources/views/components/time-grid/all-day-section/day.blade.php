@props(['calendar', 'period', 'date', 'resourceId', 'events'])
@php
    $allDayEvents = $events
        ->getAllDayEventsOn($date)
        ->when($resourceId, function ($timedEvents) use ($resourceId) {
            return $timedEvents->where('resourceId', $resourceId);
        })
        ->keyBy('position');
    $maxPosition = $allDayEvents->max('position') ?? -1;
@endphp
<div
    class="gc-day"
    data-date="{{$date->toDateString()}}"
>
    <x-green-calendar::all-day-events
        :calendar="$calendar"
        :date="$date"
        :period="$period"
        :allDayEvents="$allDayEvents"
        :maxPosition="$maxPosition"
    />
</div>