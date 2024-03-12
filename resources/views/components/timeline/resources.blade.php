@props(['resources', 'timeSlots', 'interval'])
<div class="gc-resources">
    <div class="gc-spacers">
        @if(count($timeSlots)> 1)
            <div class="gc-spacer"></div>
        @endif
        @if(count($timeSlots[0]['days']) > 1)
            <div class="gc-spacer"></div>
        @endif
        @if(count($timeSlots[0]['days'][0]['hours']) > 1)
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