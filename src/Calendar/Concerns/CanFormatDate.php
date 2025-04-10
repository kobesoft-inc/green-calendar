<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use Closure;

trait CanFormatDate
{
    protected string|Closure|null $formatTime = null;
    protected string|Closure|null $formatDate = null;
    protected string|Closure|null $formatShortDate = null;
    protected string|Closure|null $formatMonth = null;
    protected string|Closure|null $formatShortMonth = null;
    protected string|Closure|null $formatYear = null;

    /**
     * 時間のフォーマットを設定する
     *
     * @param string|Closure $format フォーマット
     * @return static
     */
    public function formatTimeUsing(string|Closure $format): static
    {
        $this->formatTime = $format;
        return $this;
    }

    /**
     * 日付のフォーマットを設定する
     *
     * @param string|Closure $format フォーマット
     * @return static
     */
    public function formatDateUsing(string|Closure $format): static
    {
        $this->formatDate = $format;
        return $this;
    }

    /**
     * 短い日付のフォーマットを設定する
     *
     * @param string|Closure $format フォーマット
     * @return static
     */
    public function shortDateFormat(string|Closure $format): static
    {
        $this->formatShortDate = $format;
        return $this;
    }

    /**
     * 月のフォーマットを設定する
     *
     * @param string|Closure $format フォーマット
     * @return static
     */
    public function formatMonthUsing(string|Closure $format): static
    {
        $this->formatMonth = $format;
        return $this;
    }

    /**
     * 短い月のフォーマットを設定する
     *
     * @param string|Closure $format フォーマット
     * @return static
     */
    public function formatShortMonthUsing(string|Closure $format): static
    {
        $this->formatShortMonth = $format;
        return $this;
    }

    /**
     * 年のフォーマットを設定する
     *
     * @param string|Closure $format フォーマット
     * @return static
     */
    public function formatYearUsing(string|Closure $format): static
    {
        $this->formatYear = $format;
        return $this;
    }

    /**
     * 時間をフォーマットする
     *
     * @param Carbon $date 日付
     * @return string
     */
    public function formatTime(CarbonInterface $date): string
    {
        $format = $this->formatTime ?? __('green-calendar::messages.formats.time');
        return self::formatWithStringOrClosure($date, $format);
    }

    /**
     * 日付をフォーマットする
     *
     * @param Carbon $date 日付
     * @return string
     */
    public function formatDate(CarbonInterface $date): string
    {
        $format = $this->formatDate ?? __('green-calendar::messages.formats.date');
        return self::formatWithStringOrClosure($date, $format);
    }

    /**
     * 短い日付をフォーマットする
     *
     * @param Carbon $date 日付
     * @return string
     */
    public function formatShortDate(CarbonInterface $date): string
    {
        $format = $this->formatDate ?? __('green-calendar::messages.formats.short_date');
        return self::formatWithStringOrClosure($date, $format);
    }

    /**
     * 月をフォーマットする
     *
     * @param Carbon $date 日付
     * @return string
     */
    public function formatMonth(CarbonInterface $date): string
    {
        $format = $this->formatDate ?? __('green-calendar::messages.formats.month');
        return self::formatWithStringOrClosure($date, $format);
    }

    /**
     * 短い月をフォーマットする
     *
     * @param Carbon $date 日付
     * @return string
     */
    public function formatShortMonth(CarbonInterface $date): string
    {
        $format = $this->formatDate ?? __('green-calendar::messages.formats.short_month');
        return self::formatWithStringOrClosure($date, $format);
    }

    /**
     * 年をフォーマットする
     *
     * @param Carbon $date 日付
     * @return string
     */
    public function formatYear(CarbonInterface $date): string
    {
        $format = $this->formatDate ?? __('green-calendar::messages.formats.year');
        return self::formatWithStringOrClosure($date, $format);
    }

    /**
     * 日付を文字列・クロージャー・Carbonの形式で、フォーマットする
     *
     * @param Carbon $date 日付
     * @param string|Closure|null $format フォーマット
     * @return string
     */
    protected function formatWithStringOrClosure(CarbonInterface $date, string|Closure|null $format): string
    {
        if ($format instanceof Closure) {
            return ($format)($date);
        } else {
            return $date->format($format);
        }
    }
}