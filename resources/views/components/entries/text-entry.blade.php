@php
    $state = $getState();
    $formattedState = $formatState($state);
    $color = $getColor($state);
@endphp
<div
    {{
        $attributes->merge($getExtraAttributes(), escape: false)
    }}
    @class([
        match($color) {
            null => '',
            'gray' => 'text-gray-500 dark:text-gray-400',
            default => "text-custom-600 dark:text-custom-400",
        }
    ])
    @style([
        \Filament\Support\get_color_css_variables(
            $color,
            shades: [400, 600],
        ) => !in_array($color, [null, 'gray']),
    ])
>
    {{$formattedState}}
</div>