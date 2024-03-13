<?php

namespace Kobesoft\GreenCalendar\Calendar\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;
use Kobesoft\GreenCalendar\Calendar;
use Kobesoft\GreenCalendar\Entries\Entry;
use Kobesoft\GreenCalendar\Entries\IconEntry;
use Kobesoft\GreenCalendar\Entries\TextEntry;
use Kobesoft\GreenCalendar\ViewModel\Event;
use Kobesoft\GreenCalendar\ViewModel\EventType;
use Throwable;

trait HasEntries
{
    protected array|Closure|null $entries = null;

    /**
     * エントリーを設定する
     *
     * @param array|Closure|null $entities エントリーの配列またはクロージャ
     * @return $this
     */
    public function entries(array|Closure|null $entities): static
    {
        $this->entries = $entities;
        return $this;
    }

    /**
     * エントリーを取得する
     *
     * @param Event|null $event 予定
     * @return array|Closure|null エントリーの配列
     * @throws Throwable
     */
    public function getEntries(?Event $event): array|Closure|null
    {
        $record = $event?->model;
        $entries = $this->evaluate(
            $this->entries,
            namedInjections: ['event' => $event, 'record' => $record],
            typedInjections: [Event::class => $event, Model::class => $record, $record::class => $record]
        );
        throw_if(
            !is_array($entries),
            InvalidArgumentException::class, 'The entries must be an array or a closure that returns an array.'
        );
        foreach ($entries as $entry) {
            $entry->event($event);
        }
        return $entries;
    }

    /**
     * デフォルトのエントリーを取得する
     *
     * @return Closure デフォルトのエントリー
     */
    public function getDefaultEntries(): Closure
    {
        return fn(Calendar $component) => [
            TextEntry::make($component->getRecordStartAttribute() ?? 'start')
                ->time()
                ->visible(fn(Event $event) => $event->type === EventType::TimedEvent),
            TextEntry::make('title'),
        ];
    }
}