@props(['calendar', 'date', 'resourceId', 'events', 'timeSlots'])
@php
    $timeSlotIndex = 0;
    $period = $timeSlots->periodOfDate($date);
    $timedEvents = $events
        ->between($period)
        ->whereResource($resourceId)
        ->withTimeGrid($timeSlots, $period)
        ->getTimedEvents()
        ->groupBy('timeSlot');
@endphp
<div
    class="gc-day"
    data-date="{{$date->toDateString()}}"
    data-start="{{$period->getStartDate()->format('Y-m-d H:i')}}"
    data-end="{{$period->getEndDate()->format('Y-m-d H:i')}}"
    data-interval="{{$timeSlots->getIntervalSeconds()}}"
    data-resource-id="{{$resourceId}}"
>
    @foreach($timeSlots->getHours() as $hourIndex => $hour)
        <div class="gc-hour">
            @foreach($hour['minutes'] as $minuteIndex => $timeSlot)
                @php($time = $timeSlot->getStartDate()->setDateFrom($date)->format('Y-m-d H:i'))
                @php($timeEnd = $timeSlot->getEndDate()->setDateFrom($date)->format('Y-m-d H:i'))
                <div
                    {{
                        \Filament\Support\prepare_inherited_attributes(new \Illuminate\View\ComponentAttributeBag())
                            ->class(['gc-slot'])
                            ->merge($calendar->getCellExtraAttributes([
                                'time' => $time,
                                'resourceId' => $resourceId,
                                'date' => $date->toDateString()
                            ])
                        )
                    }}
                    data-time="{{$time}}"
                    data-time-end="{{$timeEnd}}"
                >
                    <div class="gc-slot-content">
                        <x-green-calendar::time-grid.timed-section.timed-events
                            :calendar="$calendar"
                            :timedEvents="$timedEvents->get($timeSlotIndex, collect())"
                        />
                        @php($timeSlotIndex++)
                    </div>
                </div>
            @endforeach
        </div>
    @endforeach
</div>