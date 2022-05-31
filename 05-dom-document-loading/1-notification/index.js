export default class NotificationMessage {

    constructor(
        message = '', {
            duration = 0,
            type = '' } = {}
    ) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.render();
    }

    template() {
        return `
        <div class="notification ${this.type}" style="--value:${this.duration}s">
            <div class="timer"></div>
                <div class="inner-wrapper">
                <div class="notification-header">success</div>
                <div class="notification-body">
                ${this.message}
                </div>
            </div>
        </div>
        `
    }

    show(el) {
        if (el) {
            el.innerHTML = this.template();
        }
        this.closeMessage();
    }

    render() {
        const el = document.createElement('div')
        el.innerHTML = this.template()
        this.element = el.firstElementChild
        this.closeMessage();
    }

    closeMessage() {
        if (this.duration) {
            return setTimeout(() => { this.remove() }, this.duration);
        }
    }

    remove() {
        this.element.remove();
    }

    destroy() {
        this.element.remove();
    }

}
