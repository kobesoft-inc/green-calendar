@props(['calendar', 'resourceId', 'timedEvents'])
<div class="gc-timed-events">
    @foreach($timedEvents as $event)
        @php
            // 時間指定の予定のCSS変数
            $variables =
                '--gc-position: ' . (100 * $event->position/ $event->division) . '%;' .
                '--gc-width: ' . (100 / $event->division) . '%;' .
                '--gc-span: calc(' . (100 * $event->timeSlotSpan) . '% + ' . ($event->timeSlotSpan - 1) . 'px);';
        @endphp
        <div
            class="gc-timed-event-container"
            @style([$variables])
            data-key="{{$event->model->getKey()}}"
            data-start="{{$event->start->toDateTimeString()}}"
            data-end="{{$event->end->toDateTimeString()}}"
            data-resource-id="{{$event->resourceId}}"
            data-can-click="{{$calendar->canClickEvent($event) ? 'true' : 'false'}}"
            data-can-move="{{$calendar->canMoveEvent($event) ? 'true' : 'false'}}"
            data-can-resize="{{$calendar->canResizeEvent($event) ? 'true' : 'false'}}"
        >
            @php($color = $calendar->getColor($event) ?? 'primary')
            <div
                @class([
                    'gc-timed-event',
                ])
                @style([
                    \Filament\Support\get_color_css_variables(
                        $color,
                        shades: [50, 100, 200, 400, 800, 900],
                    ),
                ])
            >
                @if($calendar->canResizeEvent($event))
                    <div class="gc-head"></div>
                    <div class="gc-tail"></div>
                @endif
                <x-green-calendar::entries :calendar="$calendar" :event="$event"/>
            </div>
        </div>
    @endforeach
</div>
<div class="gc-timed-event-preview"></div>