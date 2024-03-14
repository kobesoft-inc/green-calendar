@props(['calendar', 'date', 'period', 'timedEvents', 'allDayEvents', 'maxPosition'])
<div
    @class([
        'gc-day',
        'gc-today' => $date->isToday(),
        'gc-disabled' => !$period->contains($date),
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
            :period="$period"
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