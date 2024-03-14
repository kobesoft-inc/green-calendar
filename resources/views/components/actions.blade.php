@props(['calendar'])
@php
    use Filament\Support\Enums\Alignment;
    $headerActions = [
        Alignment::Center->value => $calendar->getHeaderActions(Alignment::Center),
        Alignment::Left->value => $calendar->getHeaderActions(Alignment::Left),
        Alignment::Right->value => $calendar->getHeaderActions(Alignment::Right),
    ];
    $hasLeftOrRightActions =
        $headerActions[Alignment::Left->value] ||
        $headerActions[Alignment::Right->value];
    $headingAlignment = $calendar->getHeadingAlignment();
@endphp
<div class="gc-header-actions">
    @foreach($headerActions as $position => $actions)
        <div @class([
            'gc-header-actions-' . $position,
            'absolute' => $position === Alignment::Center->value && $hasLeftOrRightActions,
        ])>
            @if ($position === $headingAlignment->value)
                <div class="gc-heading">
                    {{ $calendar->getHeading() }}
                </div>
            @endif
            @foreach($actions as $action)
                {{ $action }}
            @endforeach
        </div>
    @endforeach
</div>