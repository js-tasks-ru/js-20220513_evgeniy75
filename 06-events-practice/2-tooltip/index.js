class Tooltip {
  
  static instance
  tooltip
  elementTarget

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance
    }
    Tooltip.instance = this
  }

  initialize() {
    this.initEventListeners()
  }

  initEventListeners() {
    document.addEventListener(`pointerover`, this.handlerOver)
    document.addEventListener(`pointerout`, this.handlerOut)
  }

  templateTooltip(value) {
    const tooltip = document.createElement(`div`)
    tooltip.classList.add(`tooltip`)
    tooltip.innerText = value
    return tooltip
  }

  handlerOver = (e) => {
    this.elementTarget = e.target.closest(`[data-tooltip]`)
    if (this.elementTarget) {
      const value = this.elementTarget.dataset.tooltip
      this.tooltip = this.templateTooltip(value)
      document.body.append(this.tooltip)
      this.elementTarget.addEventListener(`pointermove`, this.handlerMove)
    }
  }

  handlerOut = () => {
    if (this.elementTarget) {
      this.tooltip.remove()
      this.elementTarget.removeEventListener(`pointermove`, this.handlerMove)
    }
  }

  handlerMove = (e) => {
    const indent = 10
    const tooltipClientX = `${e.clientX + indent}px`
    const tooltipClientY = `${e.clientY + indent}px`
    this.tooltip.style.left = tooltipClientX
    this.tooltip.style.top = tooltipClientY
  }

  destroy() {
    document.removeEventListener(`pointerover`, this.handlerOver)
    document.removeEventListener(`pointerout`, this.handlerOut)
    this.tooltip.remove()
    this.elementTarget = null
  }

}

export default Tooltip