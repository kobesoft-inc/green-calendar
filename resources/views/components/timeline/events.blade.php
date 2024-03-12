<div class="gc-events">
    @foreach($resources as $resource)
        <div class="gc-resource" data-resource-id="{{$resource->id}}" x-cloak>
        </div>
    @endforeach
</div>