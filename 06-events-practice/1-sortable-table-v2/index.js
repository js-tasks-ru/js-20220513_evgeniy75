export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.render();
    this.defaultSort(this.sorted);
  }

  templateTable() {
    const header = this.templateHeader();
    const body = this.templateBody();
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        ${header}${body}
      </div>
    </div>
    `
  }

  templateHeader() {
    this.columnConfig = [];

    const templateHeaderElements = this.headerConfig.map(({
      id = null,
      title = '',
      sortable = false,
      sortType = 'string',
      template = null,
    }) => {

      if (id) {

        this.columnConfig.push({ name: id, tpl: template });
        return `
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="asc">
            <span>${title}</span>            
          </div>
          `
      }
    }).join('');

    return `
        <div data-element="header" class="sortable-table__header sortable-table__row">
        ${templateHeaderElements}
        </div>    
      `
  }

  templateBody() {
    const templateBodyElements = this.data.map((dataElement) => {
      const elementsCell = wrapElementsCell(dataElement, this.columnConfig);
      return `
        <a href="/products/${dataElement.id}" class="sortable-table__row">
          ${elementsCell}
        </a>
        `
    }).join('');

    function wrapElementsCell(dataElement, columnConfig) {
      return columnConfig.map(({ name, tpl = null }) => {
        if (tpl) {
          return tpl(dataElement[name]);
        }
        return `
          <div class="sortable-table__cell">${dataElement[name]}</div>        
          `
      }).join('')
    }

    return `
      <div data-element="body" class="sortable-table__body">
        ${templateBodyElements}
      </div>    
      `
  }

  defaultSort({ id, order = 'asc' }) {
    if (id) {
      const defaultCell = this.element.querySelector(`[data-id="${id}"]`);
      defaultCell.dataset.order = order;
      this.arrowTemplate({ element: defaultCell });
      this.sort(id, order);
    }
  }

  arrowTemplate({ element, sortable = 'true' }) {

    if(!this.arrow) {
      this.arrow = createArrow();
    }

    if (sortable === 'true') {
      if (this.arrow.parentElement !== element) {
        element.append(this.arrow); 
      }        
    }    

    function createArrow () {
      let el = document.createElement('div');
      el.innerHTML = `
        <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
        </span>
        `
      let arrowElement = el.firstElementChild;
      return arrowElement;
    }

  }

  headerSort() {
    const elementHeader = this.element.querySelector(`[data-element="header"]`);
    let currentCell;

    elementHeader.addEventListener('click', handler.bind(this));

    function handler (e) {
      const target = e.target;      

      if (target.dataset.id) {
        currentCell = target;
      }
      else if (target.parentElement.dataset.id) {
        currentCell = target.parentElement;
      }
      else if (target.parentElement.dataset.element) {
        currentCell = target.parentElement.parentElement;
      }

      const currentCellOptions = Object.assign({element: currentCell}, currentCell.dataset);      
      
      if (currentCellOptions.sortable === 'true') {
        currentCell.dataset.order = currentCellOptions.order === 'asc' ? 'desc' : 'asc';
        this.sort(currentCellOptions.id, currentCell.dataset.order);
      }

      this.arrowTemplate(currentCellOptions);

    }

  }

  sort(field, order) {
    this.data.sort((a, b) => {
      if (order === 'asc') {
        return `${a[field]}`.localeCompare(`${b[field]}`, ['ru-RU', 'en-US'], { numeric: true, caseFirst: 'upper' });
      }
      return `${b[field]}`.localeCompare(`${a[field]}`, ['ru-RU', 'en-US'], { numeric: true, caseFirst: 'upper' });
    });

    const tableBody = this.element.querySelector(`[data-element="header"]`);
    this.removeBodyTable();
    this.renderBody();
    tableBody.after(this.elementBody);
  }

  renderBody() {
    const el = document.createElement('div');
    el.innerHTML = this.templateBody();
    this.elementBody = el.firstElementChild;
  }

  render() {
    const el = document.createElement('div');
    el.innerHTML = this.templateTable();
    this.element = el.firstElementChild;
    this.headerSort();
  }
  
  removeBodyTable() {
    this.element.querySelector(`[data-element="body"]`).remove()
  }
  destroy() {
    this.element.remove();
  }

}