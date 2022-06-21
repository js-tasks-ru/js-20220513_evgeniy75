import fetchJson from './utils/fetch-json.js'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ColumnChart {

    chartHeight = 50
    subElements = {}

    constructor({
        url = `api/dashboard/orders`,
        range = {
            from: new Date(),
            to: new Date()
        },
        label = ` ...`,
        link = `#`,
        formatHeading = data => data,
    } = {}) {
        this.url = new URL(url, BACKEND_URL)
        this.data = {}
        this.range = range
        this.label = label
        this.link = link
        this.formatHeading = formatHeading
        this.render()
        this.update(this.range.from, this.range.to)
    }

    async getData() {
        const { from, to } = this.range
        const req = `${this.url}?from=${this.getFormattedDate(from)}&to=${this.getFormattedDate(to)}`
        const data = await fetchJson(req)
        return data
    }

    getFormattedDate(date) {
        return date.toISOString()
    }

    getTemplate() {
        const buttonViewAll = this.getTemplateViewAll()
        return `
        <div class="column-chart" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                Total ${this.label}
                ${buttonViewAll}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                </div>
                <div data-element="body" class="column-chart__chart">               
                </div>
            </div>
        </div>
        `
    }

    getTemplateData() {
        const columnsProps = this.getColumnsProps()
        const templateBodyData = columnsProps.map(({ tooltip, value }) => {
            return `<div style="--value: ${value}" data-tooltip="${tooltip}"></div>`
        })
        return templateBodyData.join('')
    }

    getColumnsProps() {
        const values = Object.values(this.data); // []
        const maxValue = Math.max(...values)
        const scale = 50 / maxValue
        return Object.entries(this.data).map(item => {
            const [tooltip, value] = item;
            return {
                percent: (item / maxValue * 100).toFixed(0) + '%',
                value: String(Math.floor(value * scale)),
                tooltip: tooltip
            }
        })
    }

    getTemplateValue() {
        const value = Object.values(this.data).reduce((acc, el) => acc + el, 0).toString()
        const pattern = /\B(?=(\d{3})+(?!\d))/g
        if (this.formatHeading) {
            return this.formatHeading(value.replace(pattern, ','))
        }
        return value.replace(pattern, ' ')
    }

    getTemplateViewAll() {
        if (this.link) {
            return `<a href="${this.link}" class="column-chart__link">View all</a>`
        }
        return ``
    }

    render() {
        const wrap = document.createElement('div')
        wrap.innerHTML = this.getTemplate()
        this.element = wrap.firstElementChild
        this.subElements = this.getSubElements()
    }

    getSubElements() {
        const result = {}
        const els = this.element.querySelectorAll(`[data-element]`)
        for (const el of els) {
            const name = el.dataset.element
            result[name] = el
        }
        return result
    }

    updateData() {
        this.subElements.header.textContent = this.getTemplateValue()
        this.subElements.body.innerHTML = this.getTemplateData()        
    }

    async update(startDate, endDate) {
        this.element.classList.add(`column-chart_loading`)
        this.range = { from: startDate, to: endDate }
        this.data = await this.getData()
        this.updateData()
        this.element.classList.remove(`column-chart_loading`)
        return this.data        
    }

    remove() {
        this.element.remove()
    }

    destroy() {
        this.element.remove()
    }
}