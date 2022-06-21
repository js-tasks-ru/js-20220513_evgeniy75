import fetchJson from './utils/fetch-json.js'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class SortableTable {

  subElements = {}
  prevElementSort
  step = 20
  loading = true

  constructor(headersConfig, {
    data = [],
    sorted = {},
    url = ``,
    isSortLocally = false,
  } = {}) {
    this.url = new URL(url, BACKEND_URL)
    this.headerConfig = headersConfig
    this.isSortLocally = isSortLocally
    this.data = data
    this.sorted = this.initSorted(sorted)
    this.render()
  }

  initSorted(sorted) {
    const defaultSorted = {
      id: this.headerConfig.find(item => item.sortable).id,
      order: 'asc',
      start: 0,
      end: this.step
    }
    return Object.assign(defaultSorted, sorted)
  }

  async getData( { id, order, start, end } = this.sorted, step) {
    if(step) {
      start += end
      end += step
      this.sorted.end += step
    }
    const req = `
    ${this.url}?_embed=subcategory.category&_sort=${id}&_order=${order}&_start=${start}&_end=${end}
    `
    const data = await fetchJson(req)
    return data
  }

  updateData() {    
    this.subElements.body.innerHTML = this.getTemplateDataElements()
  }
  updateDataInfiniteScroll(data) {
    this.subElements.body.insertAdjacentHTML('beforeend', this.getTemplateDataElements(data))
  }

  getTemplateTable() {
    const header = this.getTemplateHeader()
    const body = this.getTemplateBody()
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${header}${body}
      </div>
    </div>
    `
  }

  getTemplateHeader() {
    const headerElements = this.getTemplateHeaderElements()
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
      ${headerElements}
      </div>    
    `
  }

  getTemplateHeaderElements() {
    return this.headerConfig.map(({ id, title, sortable }) => {
      return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>            
      </div>
      `
    }).join('')
  }

  getTemplateBody() {
    const dataElements = this.getTemplateDataElements()
    return `
      <div data-element="body" class="sortable-table__body">
        ${dataElements}
      </div>    
      `
  }

  getTemplateDataElements(data = this.data) {    
    return data.map((dataElement) => {
      const elementCells = this.getTemplateElementCells(dataElement)
      return `
        <a href="/products/${dataElement.id}" class="sortable-table__row">
        ${elementCells}
        </a>
        `
    }).join('')
  }

  getTemplateElementCells(dataElement) {
    return this.headerConfig.map(({ id, template }) => {
      if (template) {
        return template(dataElement[id])
      }
      return `
        <div class="sortable-table__cell">${dataElement[id]}</div>        
        `
    }).join('')
  }

  getTemplateArrow() {
    const arrow = () => {
      const wrap = document.createElement('div')
      wrap.innerHTML = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
      <span class="sort-arrow"></span>
      </span>
      `
      return wrap.firstElementChild
    }
    this.arrow = arrow()
    const el = this.subElements.header.querySelector(`[data-id="${this.sorted.id}"]`)
    this.prevElementSort = el
    el.dataset.order = this.sorted.order
    el.append(this.arrow)
  }

  moveArrow(el) {
    if (!(this.arrow.parentElement === el)) {
      el.append(this.arrow)
    }
  }

  initSortEventListeners() {
    const header = this.subElements.header
    header.addEventListener('pointerdown', this.sortClick)
    window.addEventListener('scroll', this.infiniteScroll)
  }
  
  sortClick = (e) => {
    const el = e.target.closest(`[data-sortable='true']`)
    if (el) {
      el.dataset.order = el.dataset.order === 'asc' ? 'desc' : 'asc'
      const {id, order} = el.dataset
      this.sorted.id = id
      this.sorted.order = order
      if(this.prevElementSort !== el) {
        this.prevElementSort.removeAttribute(`data-order`)
      }
      this.prevElementSort = el
      this.moveArrow(el)
      if(this.isSortLocally) {
        this.sortOnClient(el.dataset.id, el.dataset.order)
        return
      }
      this.sortOnServer()
    }
  }
  
  infiniteScroll = async () => {
    const docBottom = document.documentElement.getBoundingClientRect().bottom
    const doc = document.documentElement.clientHeight + 50
    if (docBottom < doc && this.loading) {
      this.loading = false
      const data = await this.getData(this.sorted, this.step)
      this.data.push(...data)
      this.updateDataInfiniteScroll(data)
      this.loading = true
    }
  }

  async render() {
    const el = document.createElement('div')
    el.innerHTML = this.getTemplateTable()
    this.element = el.firstElementChild
    this.subElements = this.getSubElements()
    if (!this.arrow) {      
      this.getTemplateArrow()
    }
    this.initSortEventListeners()
    this.data = await this.getData()
    this.updateData()
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

  sortOnClient() {
    const {id, order} = this.sorted
    this.data.sort((a, b) => {
      const direction = order === 'asc' ? 1 : -1
      return direction * `${a[id]}`.localeCompare(`${b[id]}`, ['ru-RU', 'en-US'], { numeric: true, caseFirst: 'upper' })
    })
    this.subElements.body.innerHTML = this.getTemplateDataElements()
  }

  async sortOnServer() {
    this.data = await this.getData()
    this.updateData()
  }

  destroy() {
    window.removeEventListener('scroll', this.infiniteScroll)
    this.element.remove()
    this.subElements = {}
  }
}
