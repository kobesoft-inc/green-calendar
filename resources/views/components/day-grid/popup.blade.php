<div class="gc-day-grid-popup gc-hidden">
    <div class="gc-day">
        <div class="gc-day-top">
            <div class="gc-date"></div>
            <div class="gc-label">
                <x-filament::icon
                        icon="heroicon-m-x-mark"
                        class="h-5 w-5 text-gray-500 dark:text-gray-400"
                        @click="this.closePopup"
                />
            </div>
        </div>
        <div class="gc-day-body"></div>
    </div>
</div>