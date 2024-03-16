@props(['calendar', 'period', 'columns', 'timeSlots', 'events'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('time-grid', 'kobesoft/green-calendar') }}"
     x-data="timeGrid()"
     @click="onClick"
     @mousedown="onMouseDown"
     @mouseup="onMouseUp"
     @mouseup.away="onMouseUp"
     @mousemove.throttle.100ms="onMouseMove"
     @mousemove.away.throttle.100ms="onMouseMove"
     @mouseover="onMouseOver"
     @mouseover.away="onMouseOver"
     class="gc-time-grid"
>
    <div class="gc-header">
        <x-green-calendar::actions :calendar="$calendar"/>
    </div>
    <div class="gc-body">
        @if($columns->count()> 0)
            <x-green-calendar::time-grid.column-headings
                :calendar="$calendar"
                :columns="$columns"
            />
            <x-green-calendar::time-grid.all-day-section
                :calendar="$calendar"
                :period="$period"
                :columns="$columns"
                :events="$events"
            />
            <x-green-calendar::time-grid.timed-section
                :calendar="$calendar"
                :columns="$columns"
                :timeSlots="$timeSlots"
                :events="$events"
            />
        @else
            <x-green-calendar::time-grid.empty/>
        @endif
    </div>
</div>