@props(['calendar', 'columns', 'events', 'timeSlots'])
<div class="gc-timed-section">
    <x-green-calendar::time-grid.timed-section.time-slots
        :calendar="$calendar"
        :timeSlots="$timeSlots"
    />
    <div class="gc-days">
        @foreach($columns as $column)
            <x-green-calendar::time-grid.timed-section.day
                :calendar="$calendar"
                :date="$column->date"
                :resourceId="$column->resourceId"
                :events="$events"
                :timeSlots="$timeSlots"
            />
        @endforeach
    </div>
</div>