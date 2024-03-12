@props(['calendar', 'date', 'timedEvents', 'allDayEvents', 'maxPosition'])
<div class="gc-timed-events">
    @for($i = 0;$i <= $maxPosition;$i++)
        @php($event = $allDayEvents->get($i))
        <div class="gc-all-day-event-container"
             data-key="{{$event?->model->getKey()}}"
        ></div>
    @endfor
    @foreach ($timedEvents as $event)
        <div class="gc-timed-event-container"
             data-key="{{$event->model->getKey()}}"
        >
            <div class="gc-timed-event"
                 draggable="true"
            >
                {{$event->model->title}}
            </div>
        </div>
    @endforeach
</div>