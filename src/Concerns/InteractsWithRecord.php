<?php

namespace Kobesoft\GreenCalendar\Concerns;

use Exception;
use Illuminate\Database\Eloquent\Model;

trait InteractsWithRecord
{
    public ?Model $record;

    /**
     * レコードを設定する
     *
     * @param Model $record
     * @return InteractsWithRecord
     */
    public function record(Model $record): static
    {
        $this->record = $record;
        return $this;
    }

    /**
     * レコードを取得する
     *
     * @return Model|null
     */
    public function getRecord(): ?Model
    {
        return $this->record;
    }

    /**
     * 予定のIDからレコードを解決します。
     *
     * @param string $id 予定のID
     * @return Model 予定のレコード
     */
    protected function resolveRecord(string $id): Model
    {
        return $this->getCalendar()->resolveRecord($id);
    }

    /**
     * モデルを取得する
     * @throws \Exception
     */
    public function getModel(): string
    {
        return static::$model
            ?? throw new Exception('Calendar [' . static::class . '] does not have a [static::$model].');
    }
}