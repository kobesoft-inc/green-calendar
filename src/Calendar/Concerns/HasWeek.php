<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Carbon\Carbon;
use Closure;
use Illuminate\Support\Collection;

trait HasWeek
{
    protected int|Closure|null $firstDayOfWeek = null;

    /**
     * 週の最初の曜日を設定する
     *
     * @param int|Closure|null $firstDayOfWeek 週の最初の曜日
     * @return static
     */
    public function firstDayOfWeek(int|Closure|null $firstDayOfWeek): static
    {
        $this->firstDayOfWeek = $firstDayOfWeek;
        return $this;
    }

    /**
     * 週の最初の曜日を取得する
     *
     * @return int 週の最初の曜日
     */
    public function getFirstDayOfWeek(): int
    {
        return $this->evaluate($this->firstDayOfWeek) ?? 0;
    }

    /**
     * 週の最後の曜日を取得する
     *
     * @return int 週の最後の曜日
     */
    public function getLastDayOfWeek(): int
    {
        return ($this->getFirstDayOfWeek() + 6) % 7;
    }

    /**
     * 曜日の名前の配列を取得する
     *
     * @return Collection 曜日の名前の配列
     */
    public function daysOfWeek(): Collection
    {
        $translator = Carbon::getTranslator();
        return collect(range(0, 6))
            ->map(fn($day) => $translator->trans('weekdays_short.' . ($day + $this->getFirstDayOfWeek()) % 7));
    }
}