<?php

namespace Kobesoft\GreenCalendar\Entries;

use Filament\Support\Components\ViewComponent;
use Filament\Support\Concerns\HasExtraAttributes;
use Illuminate\Database\Eloquent\Model;
use Kobesoft\GreenCalendar\Contracts\HasCalendar;
use Kobesoft\GreenCalendar\ViewModel\EventType;
use Livewire\Component;

class Entry extends ViewComponent
{
    use Concerns\BelongsToLivewire;
    use Concerns\BelongsToCalendar;
    use Concerns\CanBeHidden;
    use Concerns\HasState;
    use HasExtraAttributes;

    /**
     * コンポーネントを初期化する
     *
     * @param string $name コンポーネント名
     */
    public function __construct(string $name)
    {
        $this->statePath($name);
    }

    /**
     * コンポーネントを作成する
     *
     * @param string $name コンポーネント名
     * @return static
     */
    public static function make(string $name): static
    {
        $static = app(static::class, ['name' => $name]);
        $static->configure();
        return $static;
    }

    /**
     * 引数名から依存関係を解決する
     *
     * @param string $parameterName パラメータ名
     * @return array 解決された依存関係
     */
    protected function resolveDefaultClosureDependencyForEvaluationByName(string $parameterName): array
    {
        return $this->getEvent()->resolveDefaultClosureDependencyForEvaluationByName($parameterName) ?? match ($parameterName) {
            'record' => [$this->getRecord()],
            'state' => [$this->getState()],
            'livewire' => [$this->getLivewire()],
            'calendar', 'component' => [$this->getCalendar()],
            default => parent::resolveDefaultClosureDependencyForEvaluationByName($parameterName),
        };
    }

    /**
     * 型名から依存関係を解決する
     *
     * @param string $parameterType 型の名前
     * @return array 解決された依存関係
     */
    protected function resolveDefaultClosureDependencyForEvaluationByType(string $parameterType): array
    {
        $record = $this->getRecord();
        $recordClass = $record ? $record::class : null;
        return match ($parameterType) {
            Model::class, $recordClass => [$record],
            default => parent::resolveDefaultClosureDependencyForEvaluationByType($parameterType),
        };
    }
}