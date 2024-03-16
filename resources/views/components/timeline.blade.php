@props(['calendar', 'timeSlots', 'events', 'resources', 'period'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('timeline', 'kobesoft/green-calendar') }}"
     x-data="timeline()"
     class="gc-timeline"
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
            <x-green-calendar::timeline.time-slot-lines
                :timeSlots="$timeSlots"
                :period="$period"
            />
            <div class="absolute top-0">
                <x-green-calendar::timeline.time-slot-heading
                    :timeSlots="$timeSlots"
                    :period="$period"
                />
                <x-green-calendar::timeline.events
                    :events="$events"
                    :resources="$resources"
                />
            </div>
        </div>
    </div>
</div>