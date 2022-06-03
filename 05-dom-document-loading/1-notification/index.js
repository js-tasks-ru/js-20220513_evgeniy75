export default class NotificationMessage {

    static previousMessage;

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
        <div class="notification ${this.type}" style="--value:${(this.duration / 1000) + 's'}">
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
        if (NotificationMessage.previousMessage) {
            NotificationMessage.previousMessage.remove();
        }
        NotificationMessage.previousMessage = this.element;
        const btn = document.querySelector('#btn1');
        this.closeMessage();
        if (btn) {
            btn.after(this.element);
            return
        }
        if (el) {
            el.append(this.element);
            return
        }
    }

    render() {
        const el = document.createElement('div');
        el.innerHTML = this.template();
        this.element = el.firstElementChild;
        this.closeMessage();
    }

    closeMessage() {
        return setTimeout(() => { this.remove() }, this.duration);
    }

    remove(time) {
        this.element.remove();
    }

    destroy() {
        this.element.remove();
    }

}
