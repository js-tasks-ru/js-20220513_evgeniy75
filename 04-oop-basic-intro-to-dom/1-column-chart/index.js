export default class ColumnChart {

    constructor(props) {

        this.data = []
        this.label = ` ...`
        this.value = `...`
        this.link
        this.formatHeading
        this.chartHeight = 50

        this.checkProps(props)
        this.dataId = Math.floor(Math.random() * 1000)

        this.render()

    }

    checkProps(props) {

        if (props) {
            Object.entries(props).forEach((el) => {
                if (el) {
                    const [key, value] = el
                    this[key] = value
                }
            })
        }

    }

    getColumnProps(data) {

        const maxValue = Math.max(...data)
        const scale = 50 / maxValue

        return data.map(item => {
            return {
                percent: (item / maxValue * 100).toFixed(0) + '%',
                value: String(Math.floor(item * scale))
            }
        })

    }

    getTempleteChart() {

        const linkViewAll = () => {

            if (this.link) {
                return `<a href="${this.link}" class="column-chart__link">View all</a>`
            }
            return ``

        }

        const formattedValue = () => {

            const pattern = /\B(?=(\d{3})+(?!\d))/g
            const value = this.value ? this.value.toString() : ''
            if (this.formatHeading) {
                return this.formatHeading(value.replace(pattern, ','))
            }
            return value.replace(pattern, ' ')

        }

        const templateChartColuns = () => {

            const columnProps = this.getColumnProps(this.data)
            const chartsColuns = columnProps.map(({ percent, value }) => {
                return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
            })
            return chartsColuns.join('')

        }

        const templateChart = `
        <div class="column-chart" data-id='${this.dataId}' style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
            Total ${this.label}
            ${linkViewAll()}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                ${formattedValue()}
                </div>
                <div data-element="body" class="column-chart__chart">
                ${templateChartColuns()}
                </div>
            </div>
        </div>
        `

        const templateEmptyChart = `        
        <div class="column-chart column-chart_loading" data-id='${this.dataId}' style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
            Total ${this.label}
            ${linkViewAll()}
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                ${formattedValue()}
                </div>
                <div data-element="body" class="column-chart__chart">
                </div>
            </div>
        </div>
        `

        const assembleTemplate = () => {

            const compile = () => {

                if (Array.isArray(this.data) && this.data.length > 0) {
                    return templateChart
                }
                return templateEmptyChart
                
            }
            this.chartStatus = true
            return compile()

        }

        return assembleTemplate()

    }

    render() {

        const el = document.createElement('div')
        el.innerHTML = this.getTempleteChart()
        this.element = el.firstElementChild

    }

    update(data) {

        if (this.chartStatus) {
            const el = this.element.querySelector(`[data-element="body"]`)
            if (Array.isArray(data) && data.length > 0) {
                const columnProps = this.getColumnProps(data)
                const chartsColuns = columnProps.map(({ percent, value }) => {
                    return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
                })
                this.element.classList.remove('column-chart_loading')
                el.innerHTML = chartsColuns.join('');
                return;
            }
            this.element.classList.add('column-chart_loading')
            el.innerHTML = ``;
        }
        const el = document.createElement('div')
        el.innerHTML = this.getTempleteChart()

    }
    
    remove() {

        this.chartStatus = false
        this.element.remove();

    }
    
    destroy() {
    }

}