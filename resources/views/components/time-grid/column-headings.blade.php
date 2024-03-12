@props(['calendar', 'columns'])
<div class="gc-column-headings">
    <div class="gc-time-slots-column"></div>
    <div class="gc-days">
        @foreach($columns as $column)
            <div class="gc-day">{{$column->label}}</div>
        @endforeach
    </div>
</div>