@props(['calendar', 'weekPeriod', 'period', 'events'])
<div class="gc-week">
    @foreach($weekPeriod as $date)
        @php
            $timedEvents = $events->getTimedEventsOn($date);
            $allDayEvents = $events->getAllDayEventsOn($date)->keyBy('position');
            $maxPosition = $allDayEvents->max('position') ?? -1;
        @endphp
        <x-green-calendar::day-grid.day
            :calendar="$calendar"
            :date="$date"
            :period="$period"
            :timedEvents="$timedEvents"
            :allDayEvents="$allDayEvents"
            :maxPosition="$maxPosition"
        />
    @endforeach
</div>