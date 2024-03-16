@props(['calendar', 'resourceId', 'timedEvents'])
<div class="gc-timed-event-preview"></div>
<div class="gc-timed-events">
    @foreach($timedEvents as $event)
        @php
            // 時間指定の予定のCSS変数
            $w = 1.0 / $event->division;
            $x = $event->position * $w;
            $h = $event->timeSlotSpan;
            $timedEventVariables =
                '--gc-timed-event-left: ' . (100 * $x) . '%;' .
                '--gc-timed-event-width: ' . (100 * $w) . '%;' .
                '--gc-timed-event-height: ' . (100 * $h) . '%;';
        @endphp
        <div
            class="gc-timed-event-container"
            @style([$timedEventVariables])
            data-key="{{$event->model->getKey()}}"
            data-start="{{$event->start->toDateTimeString()}}"
            data-end="{{$event->end->toDateTimeString()}}"
            data-resource-id="{{$event->resourceId}}"
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
            >
                <div class="gc-head"></div>
                <div class="gc-tail"></div>
                <x-green-calendar::entries :calendar="$calendar" :event="$event"/>
            </div>
        </div>
    @endforeach
</div>