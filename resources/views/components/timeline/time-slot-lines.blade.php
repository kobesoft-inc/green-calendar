@props(['timeSlots'])
<div class="gc-time-slot-lines">
    @foreach ($timeSlots as $month)
        <div class="gc-month">
            @foreach ($month['days'] as $day)
                <div class="gc-day">
                    @foreach ($day['hours'] as $hour)
                        <div class="gc-hour">
                            @foreach ($hour['minutes'] as $minute)
                                <div class="gc-time-slot"></div>
                            @endforeach
                        </div>
                    @endforeach
                </div>
            @endforeach
        </div>
    @endforeach
</div>