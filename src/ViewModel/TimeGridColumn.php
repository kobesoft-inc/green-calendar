<?php

namespace Kobesoft\GreenCalendar\ViewModel;

use Carbon\Carbon;

class TimeGridColumn
{
    /**
     * TimeGridの列を初期化する
     *
     * @param string|null $label ラベル
     * @param Carbon|null $date 日付
     * @param string|null $resourceId リソースID
     */
    public function __construct(
        public ?string $label,
        public ?Carbon $date,
        public ?string $resourceId,
    )
    {
    }

    /**
     * TimeGridの列を作成する
     *
     * @param string|null $label ラベル
     * @param Carbon|null $date 日付
     * @param string|null $resourceId リソースID
     * @return static
     */
    public static function make(?string $label, ?Carbon $date, ?string $resourceId): static
    {
        return new static($label, $date, $resourceId);
    }
}