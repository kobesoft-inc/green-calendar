<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use BackedEnum;
use Closure;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Kobesoft\GreenCalendar\ViewModel\Resource;

trait HasResources
{
    protected Collection|Closure|null $resources = null;
    protected ?Collection $cachedResources = null;
    protected Closure|null $resourceIdUsing = null;
    protected string|Closure|null $resourceIdAttribute = null;
    protected Closure|null $resourceTitleUsing = null;
    protected string|Closure|null $resourceTitleAttribute = null;

    /**
     * リソースを取得するクロージャを設定する
     *
     * @param Collection|Closure|null $resources リソースを取得するクロージャ
     * @return $this
     */
    public function resources(Collection|Closure|null $resources): static
    {
        $this->resources = $resources;
        return $this;
    }

    /**
     * リソースを取得する
     *
     * @return Collection
     */
    public function getResources(): Collection
    {
        if ($this->cachedResources) {
            return $this->cachedResources;
        } else {
            return $this->cachedResources = (collect($this->evaluate($this->resources)))
                ->map(fn($record) => $this->makeResource($record));
        }
    }

    /**
     * リソースのIDを取得するクロージャを設定する
     *
     * @param Closure|null $closure クロージャ
     * @return $this
     */
    public function resourceIdUsing(Closure|null $closure): static
    {
        $this->resourceIdAttribute = null;
        $this->resourceIdUsing = $closure;
        return $this;
    }

    /**
     * リソースのIDに使用する属性を設定する
     *
     * @param string|Closure|null $attribute 属性
     * @return $this
     */
    public function resourceIdAttribute(string|Closure|null $attribute): static
    {
        $this->resourceIdAttribute = $attribute;
        $this->resourceIdUsing = fn(?Model $record) => $record->getAttribute($attribute);
        return $this;
    }

    /**
     * リソースのIDを取得する
     *
     * @param Model|null $record
     * @return string リソースのID
     */
    public function getResourceId(?Model $record): string
    {
        return $this->evaluate(
            $this->resourceIdUsing,
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        );
    }

    /**
     * リソースのタイトルを取得するクロージャを設定する
     *
     * @param Closure|null $closure クロージャ
     * @return $this
     */
    public function resourceTitleUsing(Closure|null $closure): static
    {
        $this->resourceTitleAttribute = null;
        $this->resourceTitleUsing = $closure;
        return $this;
    }

    /**
     * リソースのタイトルに使用する属性を設定する
     *
     * @param string|Closure|null $attribute 属性
     * @return $this
     */
    public function resourceTitleAttribute(string|Closure|null $attribute): static
    {
        $this->resourceTitleAttribute = $attribute;
        $this->resourceTitleUsing = fn(?Model $record) => $record->getAttribute($attribute);
        return $this;
    }

    /**
     * リソースのタイトルを取得する
     *
     * @param Model|null $record
     * @return string リソースのタイトル
     */
    public function getResourceTitle(?Model $record): string
    {
        $title = $this->evaluate(
            $this->resourceTitleUsing,
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        );
        if ($title instanceof HasLabel) {
            return $title->getLabel();
        }
        if ($title instanceof BackedEnum) {
            return $title->value;
        }
        return $title;
    }

    /**
     * レコードからリソースを作成する
     *
     * @param Model|null $record レコード
     * @return Resource リソース
     */
    protected function makeResource(?Model $record): Resource
    {
        return Resource::make(
            $this->getResourceId($record),
            $this->getResourceTitle($record),
            $record
        );
    }
}