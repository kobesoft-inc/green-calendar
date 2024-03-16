@props(['calendar', 'date', 'resourceId', 'events', 'timeSlots'])
@php
    $timeSlotIndex = 0;
    $period = $timeSlots->periodOfDate($date);
    $timedEvents = $events
        ->between($period)
        ->whereResource($resourceId)
        ->withTimeSlotLayout($timeSlots, $period)
        ->getTimedEvents()
        ->groupBy('timeSlotIndex');
@endphp
<div
    class="gc-day"
    data-date="{{$date->toDateString()}}"
    data-start-time="{{$period->start->format('Y-m-d H:i')}}"
    data-end-time="{{$period->end->format('Y-m-d H:i')}}"
    data-resource-id="{{$resourceId}}"
>
    @foreach($timeSlots->getHours() as $hourIndex => $hour)
        <div class="gc-hour">
            @foreach($hour['minutes'] as $minuteIndex => $timeSlot)
                <div
                    class="gc-slot"
                    data-time="{{$timeSlot->start->setDateFrom($date)->format('Y-m-d H:i')}}"
                    data-time-end="{{$timeSlot->end->setDateFrom($date)->format('Y-m-d H:i')}}"
                >
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