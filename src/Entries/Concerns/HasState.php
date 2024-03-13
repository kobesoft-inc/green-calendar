<?php

namespace Kobesoft\GreenCalendar\Entries\Concerns;

use Illuminate\Database\Eloquent\Model;
use Kobesoft\GreenCalendar\ViewModel\Event;

trait HasState
{
    protected ?Event $event = null;
    protected ?string $statePath = null;
    protected mixed $getStateUsing = null;
    protected mixed $defaultState = null;

    /**
     * 関連する予定を設定する
     *
     * @param Event $event 予定
     * @return $this
     */
    public function event(Event $event): static
    {
        $this->event = $event;
        return $this;
    }

    /**
     * 関連する予定を取得する
     *
     * @return Event|null 予定
     */
    public function getEvent(): ?Event
    {
        return $this->event;
    }

    /**
     * レコードを取得する
     *
     * @return Model|null レコード
     */
    public function getRecord(): ?Model
    {
        return $this->getEvent()?->model;
    }

    /**
     * ステートのパスを設定する
     *
     * @param string|null $path ステートのパス
     * @return $this
     */
    public function statePath(?string $path): static
    {
        $this->statePath = $path;
        return $this;
    }

    /**
     * ステートのパスを取得する
     *
     * @return string|null ステートのパス
     */
    public function getStatePath(): ?string
    {
        return $this->statePath;
    }

    /**
     * ステートを取得するためのコールバックを設定する
     *
     * @param mixed $callback ステートを取得するためのコールバック
     * @return $this
     */
    public function getStateUsing(mixed $callback): static
    {
        $this->getStateUsing = $callback;
    }

    /**
     * ステートを設定する
     *
     * @param mixed $state ステート
     * @return $this
     */
    public function state(mixed $state): static
    {
        $this->getStateUsing($state);
        return $this;
    }

    /**
     * デフォルトのステートを設定する
     *
     * @param mixed $state デフォルトのステート
     * @return $this
     */
    public function default(mixed $state): static
    {
        $this->defaultState = $state;
        return $this;
    }

    /**
     * デフォルトのステートを取得する
     *
     * @return mixed デフォルトのステート
     */
    public function getDefaultState(): mixed
    {
        return $this->evaluate($this->defaultState);
    }

    /**
     * ステートを取得する
     *
     * @return mixed ステート
     */
    public function getState(): mixed
    {
        if ($this->getStateUsing !== null) {
            $state = $this->evaluate($this->getStateUsing);
        } else {
            $state = data_get($this->getRecord(), $this->getStatePath());
        }
        if (blank($state)) {
            $state = $this->getDefaultState();
        }
        return $state;
    }
}