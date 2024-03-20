@props(['calendar', 'resources', 'timeSlots', 'period', 'events'])
<div class="gc-events">
    @foreach($resources as $resource)
        <div
            class="gc-resource"
            data-resource-id="{{$resource->id}}"
            x-cloak
        >
            @php
                $events = $events
                    ->whereResource($resource->id)
                    ->withTimeline($timeSlots, $period);
                $allDayEvents = $events->getAllDayEvents();
                $timedEvents = $events->getTimedEvents();
            @endphp
            <x-green-calendar::timeline.all-day-events
                :calendar="$calendar"
                :resource="$resource"
                :allDayEvents="$allDayEvents"
                :timeSlots="$timeSlots"
                :period="$period"
                :maxPosition="$allDayEvents->max('position') ?? -1"
            />
            <x-green-calendar::timeline.timed-events
                :calendar="$calendar"
                :resource="$resource"
                :timedEvents="$timedEvents"
                :timeSlots="$timeSlots"
                :period="$period"
                :maxPosition="$timedEvents->max('position') ?? -1"
            />
        </div>
    @endforeach
</div>