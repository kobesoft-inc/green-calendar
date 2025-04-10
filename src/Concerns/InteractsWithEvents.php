<?php

namespace Kobesoft\GreenCalendar\Concerns;

trait InteractsWithEvents
{
    /**
     * 予定をクリックしたときのイベントを呼び出します。
     *
     * @param string $id
     * @return void
     */
    public function onEvent(string $id): void
    {
        if ($actionName = $this->getCalendar()->getEventAction()?->getName()) {
            $this->record($this->resolveRecord($id));
            $this->mountAction($actionName, ['id' => $id]);
        }
    }

    /**
     * 予定の期間を変更したときのイベントを呼び出します。
     *
     * @param string $id 予定のID
     * @param string $start 変更後の開始日時
     * @param string $end 変更後の終了日時
     * @return void
     */
    public function onMove(string $id, string $start, string $end): void
    {
        if ($actionName = $this->getCalendar()->getMoveAction()?->getName()) {
            $this->record($this->resolveRecord($id));
            $this->mountAction($actionName, ['id' => $id, 'start' => $start, 'end' => $end]);
        }
    }

    /**
     * 日付を選択したときのイベントを呼び出します。
     *
     * @param string $start 開始日
     * @param string $end 終了日
     * @return void
     */
    public function onDate(string $start, string $end): void
    {
        if ($actionName = $this->getCalendar()->getDateAction()?->getName()) {
            $this->mountAction($actionName, ['start' => $start, 'end' => $end]);
        }
    }

    /**
     * カレンダーを更新します。
     *
     * @return void
     */
    public function refreshCalendar(): void
    {
        $this->dispatch('refreshCalendar');
    }
}