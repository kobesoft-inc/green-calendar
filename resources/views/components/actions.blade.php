@props(['calendar'])
@php
    $positions = [
        \Filament\Support\Enums\Alignment::Left,
        \Filament\Support\Enums\Alignment::Right,
        \Filament\Support\Enums\Alignment::Center,
    ];
@endphp
<div class="gc-actions">
    @foreach($positions as $position)
        <div class="gc-actions-{{$position}}">
            @foreach($calendar->getActions($position) as $action)
                {{ $action }}
            @endforeach
        </div>
    @endforeach
</div>