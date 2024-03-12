@props(['calendar', 'period', 'events'])
<div class="gc-day-grid">
    <x-green-calendar::day-grid.days-of-week :calendar="$calendar"/>
    <div class="gc-days">
        @foreach($period->weeks() as $startOfWeek)
            @php
                $weekPeriod = \Carbon\CarbonPeriod::between($startOfWeek, $startOfWeek->copy()->addDays(6)->endOfDay());
                $weekEvents = $events->between($weekPeriod)->withAllDayEventPositions($weekPeriod);
            @endphp
            <x-green-calendar::day-grid.week
                    :period="$weekPeriod"
                    :events="$weekEvents"
                    :calendar="$calendar"
            />
        @endforeach
    </div>
</div>