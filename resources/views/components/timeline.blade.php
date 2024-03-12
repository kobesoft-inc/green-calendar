@props(['calendar', 'timeSlots', 'events', 'resources', 'interval'])
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
                :resources="$resources"
                :timeSlots="$timeSlots"
                :interval="$interval"
        />
        <div style="width:calc(100% - 20em);" class="gc-main">
            <x-green-calendar::timeline.time-slot-lines :timeSlots="$timeSlots"/>
            <div class="absolute top-0">
                <x-green-calendar::timeline.time-slot-heading
                        :timeSlots="$timeSlots"
                        :interval="$interval"
                />
                <x-green-calendar::timeline.events :events="$events" :resources="$resources"/>
            </div>
        </div>
    </div>
</div>