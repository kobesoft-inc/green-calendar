<?php

namespace Kobesoft\GreenCalendar\Entries\Concerns;

use Closure;

trait HasIcon
{
    protected string|bool|Closure|null $icon = null;

    /**
     * アイコンを設定する
     *
     * @param string|bool|Closure|null $icon アイコン
     * @return $this
     */
    public function icon(string|bool|Closure|null $icon = null): static
    {
        $this->icon = $icon;
        return $this;
    }

    /**
     * アイコンを取得する
     *
     * @param mixed $state ステート
     * @return string|null アイコン
     */
    public function getIcon(mixed $state): string|null
    {
        $icon = $this->evaluate($this->icon, ['state' => $state]);
        if ($icon === false) {
            return null;
        }
        if (filled($icon)) {
            return $icon;
        }
        if ($state instanceof \Filament\Support\Contracts\HasIcon) {
            return $state->getIcon();
        }
        return null;
    }
}