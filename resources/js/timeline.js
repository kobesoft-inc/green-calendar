export default function timeline() {
    return {
        init() {
            this.layout()
        },
        layout() {
            this.$el.querySelectorAll('.gc-resources .gc-resource').forEach(elResource => {
                const el = this.$el.querySelector('.gc-events .gc-resource[data-resource-id="' + elResource.dataset.resourceId + '"]')
                el.style.height = elResource.offsetHeight + 'px';
            })
        },
        elEvents() {
            return this.$el.querySelector('.events')
        },
    }
}