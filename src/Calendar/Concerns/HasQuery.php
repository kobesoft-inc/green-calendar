<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Carbon\CarbonPeriod;
use Closure;
use Exception;
use Illuminate\Database\Eloquent\Builder;

trait HasQuery
{
    protected Builder|Closure|null $query = null;
    protected array $queryScopes = [];

    /**
     * 予定を取得するクエリを設定する
     *
     * @param Builder|Closure $query 予定を取得するクエリ
     * @return $this
     */
    public function query(Builder|Closure $query): static
    {
        $this->query = $query;
        return $this;
    }

    /**
     * 予定のクエリスコープを設定する
     *
     * @param Closure $callback 予定のクエリスコープ
     * @return $this
     */
    public function modifyQueryUsing(Closure $callback): static
    {
        $this->queryScopes[] = $callback;
        return $this;
    }

    /**
     * クエリにスコープを適用する
     *
     * @param Builder $query クエリ
     * @return Builder スコープを適用したクエリ
     */
    protected function applyQueryScopes(Builder $query): Builder
    {
        foreach ($this->queryScopes as $scope) {
            $query = $scope($query);
        }
        return $query;
    }

    /**
     * 予定を取得するクエリを取得する
     *
     * @return Builder 予定を取得するクエリ
     * @throws Exception
     */
    public function getQuery(?CarbonPeriod $period = null): Builder
    {
        if ($query = $this->evaluate($this->query, ['period' => $period])) {
            return $this->applyQueryScopes($query->clone());
        }
        $livewireClass = $this->getLivewire()::class;
        throw new Exception("Calendar [{$livewireClass}] does not have a [query()].");
    }

    /**
     * モデルのクラス名を取得する
     *
     * @return string モデルのクラス名
     * @throws Exception
     */
    public function getModel(): string
    {
        return $this->getQuery()->getModel();
    }
}