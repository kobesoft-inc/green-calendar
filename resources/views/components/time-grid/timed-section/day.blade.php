@props(['calendar', 'date', 'resourceId', 'events', 'timeSlots'])
<div class="gc-day">
    @foreach($timeSlots as $hourIndex => $hour)
        <div class="gc-hour">
            @foreach($hour['minutes'] as $minuteIndex => $time)
                <div class="gc-slot">
                </div>
            @endforeach
        </div>
    @endforeach
</div>