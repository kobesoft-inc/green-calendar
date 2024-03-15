@props(['calendar', 'date', 'resourceId', 'events', 'timeSlots'])
@php
    $timeSlotIndex = 0;
    $period = $timeSlots->periodOfDate($date);
    $timedEvents = $events
        ->between($period)
        ->withTimeSlotLayout($timeSlots, $period)
        ->getTimedEvents()
        ->groupBy('timeSlotIndex')
        ->when($resourceId, function ($timedEvents) use ($resourceId) {
            return $timedEvents->where('resourceId', $resourceId);
        });
@endphp
<div class="gc-day">
    @foreach($timeSlots->getHours() as $hourIndex => $hour)
        <div class="gc-hour">
            @foreach($hour['minutes'] as $minuteIndex => $timeSlot)
                <div class="gc-slot">
                    <x-green-calendar::time-grid.timed-section.timed-events
                        :calendar="$calendar"
                        :timedEvents="$timedEvents->get($timeSlotIndex, collect())"
                    />
                    @php($timeSlotIndex++)
                </div>
            @endforeach
        </div>
    @endforeach
</div>