@props(['calendar', 'timeSlots'])
<div class="gc-time-slots">
    @foreach($timeSlots as $hourIndex => $hour)
        <div class="gc-time-slots-column">
            <div class="gc-hour">
                @foreach($hour['minutes'] as $minuteIndex => $time)
                    <div class="gc-slot">
                        @if ($hourIndex && !$minuteIndex)
                            {{$time->hour}}
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach
</div>