<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Closure;
use Exception;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Kobesoft\GreenCalendar\ViewModel\Event;
use Kobesoft\GreenCalendar\ViewModel\EventCollection;
use Kobesoft\GreenCalendar\ViewModel\EventType;

trait HasRecords
{
    protected Collection|Closure|null $records = null;
    protected Collection|null $cachedRecords = null;
    protected Closure|null $recordStartUsing = null;
    protected string|Closure|null $recordStartAttribute = null;
    protected Closure|null $recordEndUsing = null;
    protected string|Closure|null $recordEndAttribute = null;
    protected Closure|null $recordTypeUsing = null;
    protected Closure|null $recordBackgroundUsing = null;
    protected Closure|null $recordResourceUsing = null;
    protected string|Closure|null $recordResourceAttribute = null;

    /**
     * レコードの開始日時を取得するクロージャを設定する
     *
     * @param Closure|null $closure クロージャ
     * @return $this
     */
    public function recordStartUsing(Closure|null $closure): static
    {
        $this->recordStartAttribute = null;
        $this->recordStartUsing = $closure;
        return $this;
    }

    /**
     * レコードの開始日時に使用する属性を設定する
     *
     * @param string|Closure|null $attribute 属性
     * @return $this
     */
    public function recordStartAttribute(string|Closure|null $attribute): static
    {
        $this->recordStartAttribute = $attribute;
        $this->recordStartUsing = fn(Model $record) => $record->getAttribute($attribute);
        return $this;
    }

    /**
     * レコードの開始日時を取得する
     *
     * @param Model $record レコード
     * @return Carbon 開始日時
     */
    public function getRecordStart(Model $record): Carbon
    {
        return Carbon::make($this->evaluate(
            $this->recordStartUsing,
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        ));
    }

    /**
     * レコードの終了日時を取得するクロージャを設定する
     *
     * @param Closure|null $closure クロージャ
     * @return $this
     */
    public function recordEndUsing(Closure|null $closure): static
    {
        $this->recordEndAttribute = null;
        $this->recordEndUsing = $closure;
        return $this;
    }

    /**
     * レコードの終了日時に使用する属性を設定する
     *
     * @param string|Closure|null $attribute 属性
     * @return $this
     */
    public function recordEndAttribute(string|Closure|null $attribute): static
    {
        $this->recordEndAttribute = $attribute;
        $this->recordEndUsing = fn(Model $record) => $record->getAttribute($attribute);
        return $this;
    }

    /**
     * レコードの終了日時を取得する
     *
     * @param Model $record レコード
     * @return Carbon 終了日時
     */
    public function getRecordEnd(Model $record): Carbon
    {
        return Carbon::make($this->evaluate(
            $this->recordEndUsing,
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        ));
    }

    /**
     * レコードのタイプを取得するクロージャを設定する
     *
     * @param Closure|null $closure クロージャ
     * @return $this
     */
    public function recordTypeUsing(Closure|null $closure): static
    {
        $this->recordTypeUsing = $closure;
        return $this;
    }

    /**
     * レコードのタイプを取得する
     *
     * @param Model $record レコード
     * @return EventType タイプ
     */
    public function getRecordType(Model $record): EventType
    {
        return $this->evaluate(
            $this->recordTypeUsing,
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        ) ?? EventType::TimedEvent;
    }

    /**
     * レコードの背景型を取得するクロージャを設定する
     *
     * @param Closure|null $closure クロージャ
     * @return $this
     */
    public function recordBackgroundUsing(Closure|null $closure): static
    {
        $this->recordBackgroundUsing = $closure;
        return $this;
    }

    /**
     * レコードの背景型を取得する
     *
     * @param Model $record レコード
     * @return bool 背景型
     */
    public function getRecordBackground(Model $record): bool
    {
        return $this->evaluate(
            $this->recordBackgroundUsing,
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        ) ?? false;
    }

    /**
     * レコードのリソースを取得するクロージャを設定する
     *
     * @param Closure|null $closure クロージャ
     * @return $this
     */
    public function recordResourceUsing(Closure|null $closure): static
    {
        $this->recordResourceAttribute = null;
        $this->recordResourceUsing = $closure;
        return $this;
    }

    /**
     * レコードのリソースに使用する属性を設定する
     *
     * @param string|Closure|null $attribute 属性
     * @return $this
     */
    public function recordResourceAttribute(string|Closure|null $attribute): static
    {
        $this->recordResourceAttribute = $attribute;
        $this->recordResourceUsing = fn(Model $record) => $record->getAttribute($attribute);
        return $this;
    }

    /**
     * レコードのリソースを取得する
     *
     * @param Model $record レコード
     * @return string|null リソース
     */
    public function getRecordResource(Model $record): ?string
    {
        return $this->evaluate(
            $this->recordResourceUsing,
            namedInjections: ['record' => $record],
            typedInjections: [Model::class => $record, $record::class => $record]
        );
    }

    /**
     * カレンダーの予定のレコード配列またはクロージャを設定する
     *
     * @param Collection|Closure|null $records カレンダーの予定のレコード配列またはクロージャ
     * @return $this
     */
    public function records(Collection|Closure|null $records): static
    {
        $this->records = $records;
        return $this;
    }

    /**
     * カレンダーのレコードを取得する
     *
     * @param CarbonPeriod|null $period 取得期間
     * @return Collection
     * @throws Exception
     */
    public function getRecords(): Collection
    {
        if ($this->cachedRecords) {
            return $this->cachedRecords;
        } elseif ($this->records) {
            $period = $this->getPeriod();
            return $this->cachedRecords = $this->evaluate(
                $this->records,
                namedInjections: ['period' => $period, 'start' => $period->start, 'end' => $period->end],
                typedInjections: [CarbonPeriod::class => $period],
            );
        } elseif ($this->query) {
            return $this->cachedRecords = $this->getQuery($this->getPeriod())->get();
        }
        $livewireClass = $this->getLivewire()::class;
        throw new Exception("Calendar [{$livewireClass}] does not have a [records()] or [query()].");
    }

    /**
     * レコードから予定を作成する
     *
     * @param Model $record レコード
     * @return Event 予定
     */
    protected function makeEvent(Model $record): Event
    {
        return Event::make(
            $this->getRecordStart($record),
            $this->getRecordEnd($record),
            $this->getRecordType($record),
            $this->getRecordBackground($record),
            $this->getRecordResource($record),
            $record
        );
    }

    /**
     * 予定のコレクションを取得する
     *
     * @return EventCollection 予定のコレクション
     * @throws Exception
     */
    public function getEvents(): EventCollection
    {
        return EventCollection::fromArray(
            $this->getRecords()->map(fn(Model $record) => $this->makeEvent($record))
        );
    }
}