@php
    $state = $getState();
    $color = $getColor($state);
@endphp
<div
    {{
        $attributes
            ->merge($getExtraAttributes(), escape: false)
            ->class(['gc-color-entry'])
    }}

>
    <div
        class="gc-dot"
        @style([
            \Filament\Support\get_color_css_variables(
                $color,
                shades: [400, 500],
            ) => $color !== 'gray',
        ]
    )
    ></div>
</div>