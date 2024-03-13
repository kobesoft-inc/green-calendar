@props(['calendar', 'date', 'weekPeriod', 'allDayEvents', 'maxPosition'])
<div class="gc-all-day-event-preview"></div>
<div class="gc-all-day-events">
    @for($i = 0;$i <= $maxPosition;$i++)
        @php($event = $allDayEvents->get($i))
        @if($event && ($date->isSameDay($weekPeriod->start) || $date->isSameDay($event->start)))
            @php($days = $date->diffInDays(min($event->end, $weekPeriod->end)) + 1)
            <div @class([
                'gc-all-day-event-container',
                'gc-' . $days . 'days',
                'gc-start' => $event->start->isSameDay($date),
                'gc-end' => $event->endsBetween($weekPeriod),
            ])
                 data-key="{{$event->model->getKey()}}"
                 data-start="{{$event->start->toDateString()}}"
                 data-end="{{$event->end->toDateString()}}"
            >
                <div class="gc-all-day-event">
                    <div class="gc-head"></div>
                    <div class="gc-tail"></div>
                    <x-green-calendar::entries :calendar="$calendar" :event="$event"/>
                </div>
            </div>
        @else
            <div class="gc-all-day-event-container"></div>
        @endif
    @endfor
</div>