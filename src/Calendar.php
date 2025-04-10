<?php

namespace Kobesoft\GreenCalendar;

use Carbon\Carbon;
use Filament\Support\Components\ViewComponent;
use Filament\Support\Enums\Alignment;
use Kobesoft\GreenCalendar\Actions\CreateAction;
use Kobesoft\GreenCalendar\Actions\EditAction;
use Kobesoft\GreenCalendar\Actions\MoveAction;
use Kobesoft\GreenCalendar\Contracts\HasCalendar;

class Calendar extends ViewComponent
{
    use Calendar\Concerns\BelongsToLivewire;
    use Calendar\Concerns\CanClick;
    use Calendar\Concerns\CanFormatDate;
    use Calendar\Concerns\CanHideAllDayEvents;
    use Calendar\Concerns\CanMove;
    use Calendar\Concerns\CanSelectDates;
    use Calendar\Concerns\HasHeaderActions;
    use Calendar\Concerns\HasActions;
    use Calendar\Concerns\HasCellExtraAttributes;
    use Calendar\Concerns\HasColor;
    use Calendar\Concerns\HasCurrentDate;
    use Calendar\Concerns\HasEntries;
    use Calendar\Concerns\HasHeading;
    use Calendar\Concerns\HasQuery;
    use Calendar\Concerns\HasRecords;
    use Calendar\Concerns\HasResources;
    use Calendar\Concerns\HasView;
    use Calendar\Concerns\HasWeek;

    protected string $view = 'green-calendar::index';

    /**
     * カレンダーを初期化する
     *
     * @param HasCalendar $livewire
     */
    final public function __construct(HasCalendar $livewire)
    {
        $this->livewire($livewire);
    }

    /**
     * カレンダーを作成する
     *
     * @param HasCalendar $livewire
     * @return static
     */
    public static function make(HasCalendar $livewire): static
    {
        $static = app(static::class, ['livewire' => $livewire]);
        $static->configure();
        return $static;
    }

    /**
     * カレンダーの初期設定をする
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();

        // デフォルト設定
        $this
            ->recordStartAttribute('start')
            ->recordEndAttribute('end')
            ->resourceIdAttribute('id')
            ->resourceTitleAttribute('name')
            ->headerActions($this->getDefaultHeaderActions(), Alignment::Left)
            ->entries($this->getDefaultEntries())
            ->firstDayOfWeek(Carbon::SUNDAY)
            ->eventAction(EditAction::make())
            ->dateAction(CreateAction::make())
            ->moveAction(MoveAction::make())
            ->monthlyDayGrid();
    }

    /**
     * 引数名から依存関係を解決する
     *
     * @param string $parameterName パラメータ名
     * @return array 解決された依存関係
     */
    protected function resolveDefaultClosureDependencyForEvaluationByName(string $parameterName): array
    {
        return match ($parameterName) {
            'livewire' => [$this->getLivewire()],
            default => parent::resolveDefaultClosureDependencyForEvaluationByName($parameterName),
        };
    }
}