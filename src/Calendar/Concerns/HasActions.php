<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Filament\Actions\Action;

trait HasActions
{
    protected Action|string|null $eventAction = null;
    protected Action|string|null $moveAction = null;
    protected Action|string|null $dateAction = null;

    /**
     * 予定をクリックしたときのアクションを設定する
     *
     * @param Action|string $action アクション
     * @return HasActions
     */
    public function eventAction(Action|string $action): static
    {
        $this->eventAction = $action;
        if ($action instanceof Action) {
            $this->getLivewire()->cacheAction($action);
        }
        return $this;
    }

    /**
     * 予定をクリックしたときのアクションを取得する
     *
     * @return Action|null
     */
    public function getEventAction(): ?Action
    {
        return $this->getAction($this->eventAction);
    }

    /**
     * 予定を移動したときのアクションを設定する
     *
     * @param Action|string $action アクション
     * @return HasActions
     */
    public function moveAction(Action|string $action): static
    {
        $this->moveAction = $action;
        if ($action instanceof Action) {
            $this->getLivewire()->cacheAction($action);
        }
        return $this;
    }

    /**
     * 予定を移動したときのアクションを取得する
     *
     * @return Action|null
     */
    public function getMoveAction(): ?Action
    {
        return $this->getAction($this->moveAction);
    }

    /**
     * 日付を選択したときのアクションを設定する
     *
     * @param Action|string $action アクション
     * @return HasActions
     */
    public function dateAction(Action|string $action): static
    {
        $this->dateAction = $action;
        if ($action instanceof Action) {
            $this->getLivewire()->cacheAction($action);
        }
        return $this;
    }

    /**
     * 日付を選択したときのアクションを取得する
     *
     * @return Action|null
     */
    public function getDateAction(): ?Action
    {
        return $this->getAction($this->dateAction);
    }

    /**
     * アクションを取得する
     *
     * @param Action|string|null $action アクション
     * @return Action|null
     */
    protected function getAction(Action|string|null $action): ?Action
    {
        if ($action instanceof Action) {
            return $action;
        }
        if (is_string($action)) {
            return $this->getLivewire()->getAction($action);
        }
        return null;
    }
}