@props(['calendar', 'date', 'period', 'timedEvents', 'maxPosition'])
<div class="gc-timed-events">
    @foreach($timedEvents as $event)
        <div class="gc-timed-event-position invisible" wire:ignore.self>
            <div
                @class([
                    'gc-timed-event-container',
                    'gc-start' => $event->startsBetween($period),
                    'gc-end' => $event->endsBetween($period),
                ])
                data-key="{{$event->model->getKey()}}"
                data-start="{{$event->timeSlot}}"
                data-end="{{$event->timeSlot + $event->timeSlotSpan}}"
                data-position="{{$event->position}}"
                data-can-click="{{$calendar->canClickEvent($event) ? 'true' : 'false'}}"
                data-can-move="{{$calendar->canMoveEvent($event) ? 'true' : 'false'}}"
                data-all-day="false"
            >
                @php($color = $calendar->getColor($event) ?? 'primary')
                <div class="gc-timed-event" @style([
                    \Filament\Support\get_color_css_variables(
                        $color,
                        shades: [100, 200, 300, 400, 500, 600, 700],
                    ),
                ]) wire:ignore.self>
                    @if($calendar->canResizeEvent($event))
                        <div class="gc-head"></div>
                        <div class="gc-tail"></div>
                    @endif
                    <x-green-calendar::entries :calendar="$calendar" :event="$event"/>
                </div>
            </div>
        </div>
    @endforeach
    @for($i = 0; $i <= $maxPosition; $i++)
        <div class="gc-spacer"></div>
    @endfor
</div>