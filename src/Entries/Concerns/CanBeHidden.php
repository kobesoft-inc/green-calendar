<?php

namespace Kobesoft\GreenCalendar\Entries\Concerns;

use Closure;

trait CanBeHidden
{
    public bool|Closure $isHidden = false;
    public bool|Closure $isVisible = true;

    /**
     * エントリーを非表示にする
     *
     * @param bool|Closure $condition 非表示にする条件
     * @return $this
     */
    public function hidden(bool|Closure $condition = true): static
    {
        $this->isHidden = $condition;
        return $this;
    }

    /**
     * エントリーを表示する
     *
     * @param bool|Closure $condition 表示する条件
     * @return $this
     */
    public function visible(bool|Closure $condition = true): static
    {
        $this->isVisible = $condition;
        return $this;
    }

    /**
     * エントリーが非表示かどうかを判定する
     *
     * @return bool 非表示の場合は true
     */
    public function isHidden(): bool
    {
        if ($this->evaluate($this->isHidden)) {
            return true;
        }
        return !$this->evaluate($this->isVisible);
    }

    /**
     * エントリーが表示されているかどうかを判定する
     *
     * @return bool 表示されている場合は true
     */
    public function isVisible(): bool
    {
        return !$this->isHidden();
    }
}