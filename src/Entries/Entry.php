<?php

namespace Kobesoft\GreenCalendar\Entries;

use Filament\Support\Components\ViewComponent;
use Illuminate\Database\Eloquent\Model;

class Entry extends ViewComponent
{
    use Concerns\CanBeHidden;
    use Concerns\HasState;

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
        return match ($parameterName) {
            'event' => [$this->getEvent()],
            'record' => [$this->getRecord()],
            'state' => [$this->getState()],
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
        if (!$record) {
            return parent::resolveDefaultClosureDependencyForEvaluationByType($parameterType);
        }
        return match ($parameterType) {
            Model::class, $record::class => [$record],
            default => parent::resolveDefaultClosureDependencyForEvaluationByType($parameterType),
        };
    }
}