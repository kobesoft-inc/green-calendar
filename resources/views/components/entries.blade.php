@props(['calendar', 'event'])
<div class="gc-entries">
    @foreach($calendar->getEntries($event) as $entry)
        @if($entry->isVisible())
            {{ $entry }}
        @endif
    @endforeach
</div>