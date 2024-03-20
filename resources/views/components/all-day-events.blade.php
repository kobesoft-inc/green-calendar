@props(['calendar', 'date', 'period', 'allDayEvents', 'maxPosition'])
<div class="gc-all-day-event-preview"></div>
<div class="gc-all-day-events">
    @for($i = 0;$i <= $maxPosition;$i++)
        @php($event = $allDayEvents->get($i))
        @if($event && ($date->isSameDay($period->start) || $date->isSameDay($event->start)) && $period->contains($date))
            @php($days = $date->diffInDays(min($event->end, $period->end)) + 1)
            <div @class([
                'gc-all-day-event-container',
                'gc-' . $days . 'days',
                'gc-start' => $event->start->isSameDay($date),
                'gc-end' => $event->endsBetween($period),
            ])
                 data-key="{{$event->model->getKey()}}"
                 data-start="{{$event->start->toDateString()}}"
                 data-end="{{$event->end->toDateString()}}"
                 data-can-click="{{$calendar->canClickEvent($event) ? 'true' : 'false'}}"
                 data-can-move="{{$calendar->canMoveEvent($event) ? 'true' : 'false'}}"
                 data-can-resize="{{$calendar->canResizeEvent($event) ? 'true' : 'false'}}"
            >
                @php($color = $calendar->getColor($event) ?? 'primary')
                <div class="gc-all-day-event" @style([
                    \Filament\Support\get_color_css_variables(
                        $color,
                        shades: [300, 400, 500, 600, 700],
                    ),
                ]) wire:ignore.self>
                    @if($calendar->canResizeEvent($event))
                        <div class="gc-head"></div>
                        <div class="gc-tail"></div>
                    @endif
                    <x-green-calendar::entries :calendar="$calendar" :event="$event"/>
                </div>
            </div>
        @else
            <div class="gc-all-day-event-container"></div>
        @endif
    @endfor
</div>