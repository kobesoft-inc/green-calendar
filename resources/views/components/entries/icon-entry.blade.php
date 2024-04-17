@php
    $state = $getState();
    $color = $getColor($state);
    $icon = $getIcon($state);
@endphp
<div
    {{
        $attributes
            ->merge($getExtraAttributes(), escape: false)
            ->class(['gc-icon-entry'])
    }}
>
    <x-filament::icon
        :icon="$icon"
        @class([
            match ($color) {
                'gray' => 'text-gray-400 dark:text-gray-500',
                default => 'text-custom-500 dark:text-custom-400',
            },
        ])
        @style([
            \Filament\Support\get_color_css_variables(
                $color,
                shades: [400, 500],
            ) => $color !== 'gray',
        ])
    />
</div>