@props(['calendar', 'timeSlots'])
<div class="gc-time-slots">
    @foreach($timeSlots->getHours() as $hourIndex => $hour)
        <div class="gc-time-slots-column">
            <div class="gc-hour">
                @foreach($hour['minutes'] as $minuteIndex => $timeSlot)
                    <div class="gc-slot">
                        <div class="gc-slot-content">
                            @if ($hourIndex && !$minuteIndex)
                                {{$timeSlot->start->hour}}
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
    @endforeach
</div>