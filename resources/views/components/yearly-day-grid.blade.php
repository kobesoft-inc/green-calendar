@props(['calendar', 'period', 'events', 'componentParameters'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('day-grid', 'kobesoft/green-calendar') }}"
     x-data="dayGrid(@js($componentParameters))"
     @resize.window="onResize"
     @click="onClick"
     @click.away="onClick"
     @mousedown="onMouseDown"
     @mouseup="onMouseUp"
     @mouseup.away="onMouseUp"
     @mousemove.throttle="onMouseMove"
     @mousemove.away.throttle="onMouseMove"
     @mouseover="onMouseOver"
     @mouseover.away="onMouseOver"
     @dragstart="onDragStart"
     @dragover="onDragOver"
     @drop="onDrop"
     @dragend="onDragEnd"
     class="gc-yearly-day-grid"
>
    <div class="gc-header">
        <x-green-calendar::actions :calendar="$calendar"/>
    </div>
    <div class="gc-body">
        @foreach($period->months() as $startOfMonth)
            @php
                $monthPeriod = \Carbon\CarbonPeriod::between(
                    $startOfMonth->copy()->startOfMonth(),
                    $startOfMonth->copy()->endOfMonth()
                );
                $monthEvents = $events->between($monthPeriod);
            @endphp
            <div class="gc-month">
                <div>{{$startOfMonth}}</div>
                <x-green-calendar::day-grid
                        :calendar="$calendar"
                        :month="$startOfMonth"
                        :events="$monthEvents"/>
            </div>
        @endforeach
    </div>
    <x-green-calendar::day-grid.popup/>
</div>