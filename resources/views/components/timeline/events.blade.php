@props(['calendar', 'resources', 'timeSlots', 'period', 'events'])
<div class="gc-events">
    @foreach($resources as $resource)
        <div
            class="gc-resource"
            data-resource-id="{{$resource->id}}"
            x-cloak
        >
            @php
                $allDayEvents = $events
                    ->whereResource($resource->id)
                    ->withTimeline($timeSlots, $period)
                    ->getAllDayEvents();
                $maxPosition = $allDayEvents->max('position') ?? -1;
            @endphp
            <x-green-calendar::timeline.all-day-events
                :calendar="$calendar"
                :resource="$resource"
                :allDayEvents="$allDayEvents"
                :timeSlots="$timeSlots"
                :period="$period"
                :maxPosition="$maxPosition"
            />
        </div>
    @endforeach
</div>