@props(['calendar', 'columns', 'events'])
<div class="gc-all-day-section">
    <div class="gc-time-slots-column">&nbsp;</div>
    <div class="gc-days">
        @foreach($columns as $column)
            <div class="gc-day"></div>
        @endforeach
    </div>
</div>