<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;

trait CanHideHeader
{
    protected bool|Closure $isHeaderHidden = false;

    /**
     * ヘッダーを非表示にする
     *
     * @param bool|Closure $condition ヘッダーを非表示にするか？
     * @return $this
     */
    public function hideHeader(bool|Closure $condition = true): static
    {
        $this->isHeaderHidden = $condition;
        return $this;
    }

    /**
     * ヘッダーが非表示か取得する
     *
     * @return bool ヘッダーが非表示か？
     */
    public function isHeaderHidden(): bool
    {
        return $this->evaluate($this->isHeaderHidden);
    }

    /**
     * 全日イベントを表示されているか取得する
     *
     * @return bool 全日イベントが表示されているか
     */
    public function isHeaderVisible(): bool
    {
        return !$this->isHeaderHidden();
    }
}