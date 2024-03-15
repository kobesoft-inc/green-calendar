@props(['calendar', 'period', 'columns', 'events'])
@php($events = $events->between($period)->withAllDayEventPositions($period))
<div class="gc-all-day-section">
    <div class="gc-time-slots-column"></div>
    <div class="gc-days">
        @foreach($columns as $column)
            <x-green-calendar::time-grid.all-day-section.day
                :calendar="$calendar"
                :period="$period"
                :column="$column"
                :events="$events"
            />
        @endforeach
    </div>
</div>