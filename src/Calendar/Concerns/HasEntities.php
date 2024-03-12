<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;

trait HasEntities
{
    protected array|Closure|null $entities = null;

    /**
     * エンティティを設定する
     *
     * @param array|Closure|null $entities エンティティ
     * @return $this
     */
    public function entities(array|Closure|null $entities): static
    {
        $this->entities = $entities;
        return $this;
    }

    /**
     * エンティティを取得する
     *
     * @param Model $record レコード
     * @return array|Closure|null
     */
    public function getEntities(Model $record): array|Closure|null
    {
        return $this->evaluate(
            $this->entities ?? $this->defaultEntities($record),
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        );
    }

    /**
     * デフォルトのエンティティを取得する
     *
     * @param Model $record レコード
     * @return Closure
     */
    public function defaultEntities(Model $record): Closure
    {
        return fn() => [
            // アイコン

            // 開始時間

            // タイトル
        ];
    }
}