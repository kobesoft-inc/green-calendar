@props(['calendar', 'period', 'events', 'componentParameters'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('day-grid', 'kobesoft/green-calendar') }}"
     x-data="dayGrid(@js($componentParameters))"
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
                <div class="gc-month-name">
                    {{$calendar->formatShortMonth($startOfMonth)}}
                </div>
                <x-green-calendar::day-grid
                    :calendar="$calendar"
                    :month="$startOfMonth"
                    :events="$monthEvents"
                    :showNonCurrentDates="false"
                />
            </div>
        @endforeach
    </div>
    <x-green-calendar::day-grid.popup/>
</div>