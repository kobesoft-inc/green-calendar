@props(['calendar', 'date', 'timedEvents', 'allDayEvents', 'maxPosition'])
<div class="gc-timed-events" wire:ignore.self>
    @for($i = 0;$i <= $maxPosition;$i++)
        @php($event = $allDayEvents->get($i))
        <div class="gc-all-day-event-container"
             data-key="{{$event?->model->getKey()}}"
        ></div>
    @endfor
    @foreach ($timedEvents as $event)
        <div class="gc-timed-event-container"
             data-key="{{$event->model->getKey()}}"
             data-start="{{$event->start->toDateTimeString()}}"
             data-end="{{$event->end->toDateTimeString()}}"
             data-can-click="{{$calendar->canClick($event) ? 'true' : 'false'}}"
        >
            @php($color = $calendar->getColor($event))
            <div
                @class([
                    'gc-timed-event',
                    'gc-timed-event-bg' => $color !== null,
                ])
                @style([
                    \Filament\Support\get_color_css_variables(
                        $color,
                        shades: [50, 100, 800, 900],
                    ),
                ])
                draggable="{{$calendar->canMove($event) ? 'true' : 'false'}}"
            >
                <x-green-calendar::entries :calendar="$calendar" :event="$event"/>
            </div>
        </div>
    @endforeach
</div>