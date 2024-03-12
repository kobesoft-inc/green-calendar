<?php

namespace Kobesoft\GreenCalendar\ViewModel;

use Illuminate\Database\Eloquent\Model;

class Resource
{
    /**
     * リソースを初期化する
     *
     * @param string $id リソースのID
     * @param string $title リソースのタイトル
     * @param Model|null $model リソースのモデル
     */
    public function __construct(
        public string $id,
        public string $title,
        public ?Model $model = null
    )
    {
    }

    /**
     * リソースを作成する
     *
     * @param string $id リソースのID
     * @param string $title リソースのタイトル
     * @param Model|null $model リソースのモデル
     * @return Resource リソース
     */
    public static function make(string $id, string $title, ?Model $model = null): Resource
    {
        return new static($id, $title, $model);
    }
}