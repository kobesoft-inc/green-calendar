@props(['calendar', 'resourceId', 'timedEvents'])
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
        <div class="gc-timed-event-container" @style([$timedEventVariables])>
            <div class="gc-timed-event">
                <x-green-calendar::entries :calendar="$calendar" :event="$event"/>
            </div>
        </div>
    @endforeach
</div>