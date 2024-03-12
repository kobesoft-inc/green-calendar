<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Filament\Actions\Action;
use Filament\Actions\ActionGroup;
use Filament\Support\Enums\Alignment;
use Illuminate\Support\Arr;
use Kobesoft\GreenCalendar\Actions\NextAction;
use Kobesoft\GreenCalendar\Actions\PreviousAction;
use Kobesoft\GreenCalendar\Actions\TodayAction;

trait HasActions
{
    protected array $actions = ['left' => [], 'center' => [], 'right' => []];

    /**
     * カレンダーにアクションを設定する
     *
     * @param array|ActionGroup $actions アクション
     * @param Alignment $position 配置場所
     * @return $this
     */
    public function actions(array|ActionGroup $actions, Alignment $position = Alignment::Right): static
    {
        $this->actions[$position->value] = [];
        $this->pushActions($actions, $position);
        return $this;
    }

    /**
     * カレンダーにアクションを追加する
     *
     * @param array|ActionGroup $actions アクション
     * @param Alignment $position 配置場所
     * @return $this
     */
    public function pushActions(array|ActionGroup $actions, Alignment $position = Alignment::Right): static
    {
        foreach (Arr::wrap($actions) as $action) {
            if ($action instanceof ActionGroup) {
                foreach ($action->getFlatActions() as $flatAction) {
                    $this->getLivewire()->cacheAction($flatAction);
                }
            } elseif ($action instanceof Action) {
                $this->getLivewire()->cacheAction($action);
            } else {
                throw new \InvalidArgumentException('Actions must be an instance of ' . Action::class . ' or ' . ActionGroup::class);
            }
            $this->actions[$position->value][] = $action;
        }
        return $this;
    }

    /**
     * カレンダーにアクションを取得する
     *
     * @param Alignment $position 配置場所
     * @return array
     */
    public function getActions(Alignment $position): array
    {
        return $this->actions[$position->value];
    }

    /**
     * デフォルトのアクションを取得する
     *
     * @return array
     */
    public function getDefaultActions(): array
    {
        return [
            PreviousAction::make(),
            NextAction::make(),
            TodayAction::make(),
        ];
    }
}