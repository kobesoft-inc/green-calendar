@props(['timeSlots', 'period'])
@php($months = $timeSlots->getMonths($period))
@php($timeSlotIndex = 0)
@php($countOfHours = $months[0]['days'][0]['hours']->count() > 1 ? 0 : 1)
<div class="gc-time-slot-lines">
    @foreach ($months as $month)
        <div class="gc-month">
            @foreach ($month['days'] as $day)
                <div class="gc-day">
                    @foreach ($day['hours'] as $hour)
                        <div class="gc-hour">
                            @foreach ($hour['minutes'] as $minute)
                                <div
                                    class="gc-time-slot"
                                    data-index="{{ $timeSlotIndex++ }}"
                                    data-time="{{ $countOfHours > 0 ? $minute->start->copy()->startOfDay() : $minute->start->format('Y-m-d H:i') }}"
                                    data-time-end="{{ $countOfHours > 0 ? $minute->end->copy()->endOfDay() : $minute->end->format('Y-m-d H:i') }}"
                                ></div>
                            @endforeach
                        </div>
                    @endforeach
                </div>
            @endforeach
        </div>
    @endforeach
</div>