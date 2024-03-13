<?php

namespace Kobesoft\GreenCalendar\Entries\Concerns;

use Carbon\Carbon;
use Closure;
use Filament\Support\Contracts\HasLabel;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;
use Kobesoft\GreenCalendar\Entries\Entry;

trait CanFormatState
{
    public static string $defaultDateDisplayFormat = 'M j, Y';
    public static string $defaultDateTimeDisplayFormat = 'M j, Y H:i';
    public static string $defaultTimeDisplayFormat = 'H:i';
    protected string|Htmlable|Closure|null $prefix = null;
    protected string|Htmlable|Closure|null $suffix = null;
    protected bool|Closure $isHtml = false;
    protected ?Closure $formatStateUsing = null;
    protected string|Closure|null $timezone = null;
    protected bool $isDate = false;
    protected bool $isDateTime = false;
    protected bool $isTime = false;

    /**
     * プレフィックスを設定する
     *
     * @param string|Htmlable|Closure $prefix プレフィックス
     * @return $this
     */
    public function prefix(string|Htmlable|Closure $prefix): static
    {
        $this->prefix = $prefix;
        return $this;
    }

    /**
     * プレフィックスを取得する
     *
     * @return string|Htmlable|Closure|null プレフィックス
     */
    public function getPrefix(): string|Htmlable|Closure|null
    {
        return $this->evaluate($this->prefix);
    }

    /**
     * サフィックスを設定する
     *
     * @param string|Htmlable|Closure $suffix サフィックス
     * @return $this
     */
    public function suffix(string|Htmlable|Closure $suffix): static
    {
        $this->suffix = $suffix;
        return $this;
    }

    /**
     * サフィックスを取得する
     *
     * @return string|Htmlable|Closure|null サフィックス
     */
    public function getSuffix(): string|Htmlable|Closure|null
    {
        return $this->evaluate($this->suffix);
    }

    /**
     * HTMLかどうかを設定する
     *
     * @param bool|Closure $condition
     * @return $this
     */
    public function html(bool|Closure $condition = true): static
    {
        $this->isHtml = $condition;
        return $this;
    }

    /**
     * HTMLかどうかを取得する
     *
     * @return bool
     */
    public function isHtml(): bool
    {
        return $this->evaluate($this->isHtml);
    }

    /**
     * ステートのフォーマットを設定する
     *
     * @param Closure $callback コールバック
     * @return $this
     */
    public function formatStateUsing(Closure $callback): static
    {
        $this->formatStateUsing = $callback;
        return $this;
    }

    /**
     * ステートをフォーマットする
     *
     * @param mixed $state ステート
     * @return mixed
     */
    public function formatState(mixed $state): mixed
    {
        $isHtml = $this->isHtml();
        $state = $this->evaluate($this->formatStateUsing ?? $state, [
            'state' => $state,
        ]);
        if ($isHtml) {
            $state = Str::sanitizeHtml($state);
        }
        if ($state instanceof Htmlable) {
            $isHtml = true;
            $state = $state->toHtml();
        }
        if ($state instanceof HasLabel) {
            $state = $state->getLabel();
        }
        $prefix = $this->getPrefix();
        $suffix = $this->getSuffix();
        if ((($prefix instanceof Htmlable) || ($suffix instanceof Htmlable)) && !$isHtml) {
            $isHtml = true;
            $state = e($state);
        }
        if (filled($prefix)) {
            if ($prefix instanceof Htmlable) {
                $prefix = $prefix->toHtml();
            } elseif ($isHtml) {
                $prefix = e($prefix);
            }
            $state = $prefix . $state;
        }
        if (filled($suffix)) {
            if ($suffix instanceof Htmlable) {
                $suffix = $suffix->toHtml();
            } elseif ($isHtml) {
                $suffix = e($suffix);
            }
            $state .= $suffix;
        }
        return $isHtml ? new HtmlString($state) : $state;
    }

    /**
     * タイムゾーンを設定する
     *
     * @param string|Closure|null $timezone タイムゾーン
     * @return $this
     */
    public function timezone(string|Closure|null $timezone): static
    {
        $this->timezone = $timezone;
        return $this;
    }

    /**
     * タイムゾーンを取得する
     *
     * @return string|Closure|null タイムゾーン
     */
    public function getTimezone(): string|Closure|null
    {
        return $this->evaluate($this->timezone) ?? config('app.timezone');
    }

    /**
     * フォーマットを日付に設定する
     *
     * @param string|null $format 日付のフォーマット
     * @param string|null $timezone タイムゾーン
     * @return $this
     */
    public function date(?string $format = null, ?string $timezone = null): static
    {
        $this->isDate = true;
        $format ??= self::$defaultDateDisplayFormat;
        $this->formatStateUsing(function (mixed $state) use ($format, $timezone): ?string {
            if (blank($state)) {
                return null;
            }
            return Carbon::parse($state)
                ->setTimezone($timezone ?? $this->getTimezone())
                ->translatedFormat($format);
        });
        return $this;
    }

    /**
     * フォーマットを日時に設定する
     *
     * @param string|null $format 日時のフォーマット
     * @param string|null $timezone タイムゾーン
     * @return $this
     */
    public function dateTime(?string $format = null, ?string $timezone = null): static
    {
        $this->isDateTime = true;
        $format ??= self::$defaultDateTimeDisplayFormat;
        $this->date($format, $timezone);
        return $this;
    }

    /**
     * フォーマットを時間に設定する
     *
     * @param string|null $format 時間のフォーマット
     * @param string|null $timezone タイムゾーン
     * @return $this
     */
    public function time(?string $format = null, ?string $timezone = null): static
    {
        $this->isTime = true;
        $format ??= self::$defaultTimeDisplayFormat;
        $this->date($format, $timezone);
        return $this;
    }
}