<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;

trait HasCellExtraAttributes
{
    protected string|array|Closure|null $cellExtraAttributes = null;

    /**
     * セルの追加属性を設定する
     *
     * @param string|array|Closure|null $cellExtraAttributes セルの追加属性
     * @return $this
     */
    public function cellExtraAttributes(string|array|Closure|null $cellExtraAttributes = null): static
    {
        $this->cellExtraAttributes = $cellExtraAttributes;
        return $this;
    }

    /**
     * セルの追加属性を取得する
     *
     * @param array $injections 依存性注入
     * @return string|array|null セルの追加属性
     */
    public function getCellExtraAttributes(array $injections = []): string|array|null
    {
        $cellExtraAttributes = $this->evaluate($this->cellExtraAttributes, $injections);
        if (filled($cellExtraAttributes)) {
            return $cellExtraAttributes;
        } else {
            return [];
        }
    }
}