@props(['calendar', 'period', 'calendarPeriod', 'events'])
<div class="gc-day-grid">
    <x-green-calendar::day-grid.days-of-week :calendar="$calendar"/>
    <div class="gc-days">
        @foreach($calendarPeriod->weeks() as $startOfWeek)
            @php
                $weekPeriod = \Carbon\CarbonPeriod::between($startOfWeek, $startOfWeek->copy()->addDays(6)->endOfDay());
                $showPeriod = \Carbon\CarbonPeriod::between(
                    max($weekPeriod->getStartDate(), $period->getStartDate()),
                    min($weekPeriod->getEndDate(), $period->getEndDate())
                );
                $weekEvents = $events->between($showPeriod)->withAllDayEventPositions($showPeriod);
            @endphp
            <x-green-calendar::day-grid.week
                :weekPeriod="$weekPeriod"
                :period="$showPeriod"
                :events="$weekEvents"
                :calendar="$calendar"
            />
        @endforeach
    </div>
</div>