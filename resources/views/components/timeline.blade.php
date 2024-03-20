@props(['calendar', 'timeSlots', 'events', 'resources', 'period'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('timeline', 'kobesoft/green-calendar') }}"
     x-data="timeline()"
     x-cloak
     class="gc-timeline"
     data-start-date="{{ $period->startDate->format('Y-m-d') }}"
     data-end-date="{{ $period->endDate->format('Y-m-d') }}"
     data-start-time="{{ $timeSlots->timeRange->start->format('H:i:s') }}"
     data-end-time="{{ $timeSlots->timeRange->end->format('H:i:s') }}"
     data-interval="{{ $timeSlots->interval->totalSeconds }}"
>
    <div class="gc-header">
        <x-green-calendar::actions :calendar="$calendar"/>
    </div>
    <div class="gc-body">
        <x-green-calendar::timeline.resources
            :timeSlots="$timeSlots"
            :period="$period"
            :resources="$resources"
        />
        <div style="width:calc(100% - 20em);" class="gc-main">
            <div class="gc-selection-container"></div>
            <x-green-calendar::timeline.time-slot-lines
                :timeSlots="$timeSlots"
                :period="$period"
            />
            <div class="absolute top-0 z-10">
                <x-green-calendar::timeline.time-slot-heading
                    :timeSlots="$timeSlots"
                    :period="$period"
                />
                <x-green-calendar::timeline.events
                    :calendar="$calendar"
                    :resources="$resources"
                    :timeSlots="$timeSlots"
                    :period="$period"
                    :events="$events"
                />
            </div>
        </div>
    </div>
</div>