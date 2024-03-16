@props(['resources', 'timeSlots', 'period'])
@php($months = $timeSlots->getMonths($period))
<div class="gc-resources">
    <div class="gc-spacers">
        @if(count($months)> 1)
            <div class="gc-spacer"></div>
        @endif
        @if(count($months[0]['days']) > 1)
            <div class="gc-spacer"></div>
        @endif
        @if(count($months[0]['days'][0]['hours']) > 1)
            <div class="gc-spacer"></div>
        @endif
    </div>
    <div class="divide-y">
        @foreach($resources as $resource)
            <div class="gc-resource" data-resource-id="{{$resource->id}}">
                {{$resource->title}}
            </div>
        @endforeach
    </div>
</div>