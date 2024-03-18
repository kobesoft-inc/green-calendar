@props(['timeSlots', 'period'])
@php($months = $timeSlots->getMonths($period))
<div class="gc-time-slot-heading">
    <div class="gc-months">
        @foreach ($months as $month)
            <div class="gc-month">
                @if(count($months)> 1)
                    <div class="gc-month-text">{{ $month['month']->month }}</div>
                @endif
                <div class="gc-days">
                    @foreach ($month['days'] as $day)
                        <div class="gc-day">
                            @if(count($month['days'])> 1)
                                <div class="gc-day-text">{{ $day['date']->day }}</div>
                            @endif
                            <div class="gc-hours">
                                @foreach ($day['hours'] as $hourIndex => $hour)
                                    <div class="gc-hour">
                                        @if(count($day['hours'])> 2)
                                            <div class="gc-hour-text-container">
                                                <div class="gc-hour-text">
                                                    @if($hourIndex !== 0)
                                                        {{ $hour['hour']->hour }}
                                                    @endif
                                                </div>
                                            </div>
                                        @endif
                                        <div class="gc-slots">
                                            @foreach ($hour['minutes'] as $minute)
                                                <div class="gc-slot">
                                                </div>
                                            @endforeach
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        @endforeach
    </div>
</div>