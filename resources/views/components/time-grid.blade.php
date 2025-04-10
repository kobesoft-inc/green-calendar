@props(['calendar', 'period', 'columns', 'timeSlots', 'events', 'componentParameters'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('time-grid', 'kobesoft/green-calendar') }}"
     x-data="timeGrid(@js($componentParameters))"
     class="gc-time-grid"
>
    @if($calendar->isHeaderVisible())
        <div class="gc-header">
            <x-green-calendar::actions :calendar="$calendar" />
        </div>
    @endif
    <div class="gc-body">
        @if($columns->count()> 0)
            <x-green-calendar::time-grid.column-headings
                    :calendar="$calendar"
                    :columns="$columns"
            />
            @if($calendar->isAllDayEventsVisible())
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
            <x-green-calendar::time-grid.empty />
        @endif
    </div>
</div>