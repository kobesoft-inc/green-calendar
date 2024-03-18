@props(['calendar', 'date', 'period', 'timedEvents', 'allDayEvents', 'maxPosition'])
@php
    $disabled = !$period->contains($date);
    if ($disabled) { // 期間外の日付の場合は、予定を表示しない
        $maxPosition = -1;
        $timedEvents = $allDayEvents = collect();
    }
@endphp
<div
    @class([
        'gc-day',
        'gc-today' => $date->isToday(),
        'gc-disabled' => $disabled,
    ])
    data-date="{{$date->toDateString()}}"
>
    <div class="gc-day-top">
        <div class="gc-date">{{$date->day}}</div>
        <div class="gc-label"></div>
    </div>
    <div class="gc-day-body">
        <x-green-calendar::all-day-events
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