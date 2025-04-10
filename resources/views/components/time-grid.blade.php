@props(['calendar', 'period', 'columns', 'timeSlots', 'events', 'allDayEventsVisible', 'componentParameters'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('time-grid', 'kobesoft/green-calendar') }}"
     x-data="timeGrid(@js($componentParameters))"
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
            @if($allDayEventsVisible)
                <x-green-calendar::time-grid.all-day-section
                    :calendar="$calendar"
                    :period="$period"
                    :columns="$columns"
                    :events="$events"
                />
            @endif
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