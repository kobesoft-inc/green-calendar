@props(['calendar', 'date', 'period', 'allDayEvents', 'maxPosition'])
<div class="gc-all-day-events">
    @foreach($allDayEvents as $event)
        <div class="gc-all-day-event-position invisible" wire:ignore.self>
            <div
                @class([
                    'gc-all-day-event-container',
                    'gc-start' => $event->startsBetween($period),
                    'gc-end' => $event->endsBetween($period),
                ])
                data-key="{{$event->model->getKey()}}"
                data-start="{{$event->timeSlot}}"
                data-end="{{$event->timeSlot + $event->timeSlotSpan}}"
                data-position="{{$event->position}}"
                data-can-click="{{$calendar->canClick($event) ? 'true' : 'false'}}"
                data-can-move="{{$calendar->canMove($event) ? 'true' : 'false'}}"
                data-can-resize="{{$calendar->canResize($event) ? 'true' : 'false'}}"
                data-all-day="true"
            >
                @php($color = $calendar->getColor($event) ?? 'primary')
                <div class="gc-all-day-event" @style([
                    \Filament\Support\get_color_css_variables(
                        $color,
                        shades: [300, 400, 500, 600, 700],
                    ),
                ]) wire:ignore.self>
                    @if($calendar->canResize($event))
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