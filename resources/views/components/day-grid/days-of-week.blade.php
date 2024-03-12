@props(['calendar'])
<div class="gc-days-of-week">
    @foreach($calendar->daysOfWeek() as $day)
        <div class="gc-day-of-week">{{$day}}</div>
    @endforeach
</div>