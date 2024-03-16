@props(['calendar', 'month', 'events', 'componentParameters'])
<div ax-load
     ax-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('day-grid', 'kobesoft/green-calendar') }}"
     x-data="dayGrid(@js($componentParameters))"
     class="gc-monthly-day-grid"
>
    <div class="gc-header">
        <x-green-calendar::actions :calendar="$calendar"/>
    </div>
    <div class="gc-body">
        <x-green-calendar::day-grid
            :calendar="$calendar"
            :month="$month"
            :events="$events"
            :showNonCurrentDates="true"
        />
    </div>
    <x-green-calendar::day-grid.popup/>
</div>