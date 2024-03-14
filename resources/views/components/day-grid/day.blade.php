@props(['calendar', 'date', 'weekPeriod', 'timedEvents', 'allDayEvents', 'maxPosition'])
<div
    @class([
        'gc-day',
        'gc-today' => $date->isToday(),
    ])
    data-date="{{$date->toDateString()}}"
>
    <div class="gc-day-top">
        <div class="gc-date">{{$date->day}}</div>
        <div class="gc-label"></div>
    </div>
    <div class="gc-day-body">
        <x-green-calendar::day-grid.all-day-events
            :calendar="$calendar"
            :date="$date"
            :weekPeriod="$weekPeriod"
            :allDayEvents="$allDayEvents"
            :maxPosition="$maxPosition"
        />
        <x-green-calendar::day-grid.timed-events
            :calendar="$calendar"
            :date="$date"
            :timedEvents="$timedEvents"
            :allDayEvents="$allDayEvents"
            :maxPosition="$maxPosition"
        />
        <x-green-calendar::day-grid.remaining/>
    </div>
</div>