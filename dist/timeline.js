// resources/js/timeline.js
function timeline() {
  return {
    init() {
      this.layout();
    },
    layout() {
      this.$el.querySelectorAll(".gc-resources .gc-resource").forEach((elResource) => {
        const el = this.$el.querySelector('.gc-events .gc-resource[data-resource-id="' + elResource.dataset.resourceId + '"]');
        el.style.height = elResource.offsetHeight + "px";
      });
    },
    elEvents() {
      return this.$el.querySelector(".events");
    }
  };
}
export {
  timeline as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vcmVzb3VyY2VzL2pzL3RpbWVsaW5lLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aW1lbGluZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQoKVxuICAgICAgICB9LFxuICAgICAgICBsYXlvdXQoKSB7XG4gICAgICAgICAgICB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yQWxsKCcuZ2MtcmVzb3VyY2VzIC5nYy1yZXNvdXJjZScpLmZvckVhY2goZWxSZXNvdXJjZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWwgPSB0aGlzLiRlbC5xdWVyeVNlbGVjdG9yKCcuZ2MtZXZlbnRzIC5nYy1yZXNvdXJjZVtkYXRhLXJlc291cmNlLWlkPVwiJyArIGVsUmVzb3VyY2UuZGF0YXNldC5yZXNvdXJjZUlkICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgZWwuc3R5bGUuaGVpZ2h0ID0gZWxSZXNvdXJjZS5vZmZzZXRIZWlnaHQgKyAncHgnO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZWxFdmVudHMoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy4kZWwucXVlcnlTZWxlY3RvcignLmV2ZW50cycpXG4gICAgICAgIH0sXG4gICAgfVxufSJdLAogICJtYXBwaW5ncyI6ICI7QUFBZSxTQUFSLFdBQTRCO0FBQy9CLFNBQU87QUFBQSxJQUNILE9BQU87QUFDSCxXQUFLLE9BQU87QUFBQSxJQUNoQjtBQUFBLElBQ0EsU0FBUztBQUNMLFdBQUssSUFBSSxpQkFBaUIsNEJBQTRCLEVBQUUsUUFBUSxnQkFBYztBQUMxRSxjQUFNLEtBQUssS0FBSyxJQUFJLGNBQWMsK0NBQStDLFdBQVcsUUFBUSxhQUFhLElBQUk7QUFDckgsV0FBRyxNQUFNLFNBQVMsV0FBVyxlQUFlO0FBQUEsTUFDaEQsQ0FBQztBQUFBLElBQ0w7QUFBQSxJQUNBLFdBQVc7QUFDUCxhQUFPLEtBQUssSUFBSSxjQUFjLFNBQVM7QUFBQSxJQUMzQztBQUFBLEVBQ0o7QUFDSjsiLAogICJuYW1lcyI6IFtdCn0K
