<?php

namespace Kobesoft\GreenCalendar;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\Facades\Blade;

class GreenCalendarServiceProvider extends \Illuminate\Support\ServiceProvider
{
    /**
     * アプリケーションのサービスを登録する
     *
     * @return void
     */
    public function register(): void
    {
    }

    /**
     * アプリケーションのサービスを起動する
     *
     * @return void
     */
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'green-calendar');
        $this->loadTranslationsFrom(__DIR__ . '/../lang', 'green-calendar');
        Blade::componentNamespace('Kobesoft\\GreenCalendar\\View\\Components', 'green-calendar');

        FilamentAsset::register([
            Css::make('green-calendar', __DIR__ . '/../dist/green-calendar.css'),
            AlpineComponent::make('day-grid', __DIR__ . '/../dist/day-grid.js'),
            AlpineComponent::make('time-grid', __DIR__ . '/../dist/time-grid.js'),
            AlpineComponent::make('timeline', __DIR__ . '/../dist/timeline.js'),
        ], 'kobesoft/green-calendar');
    }
}