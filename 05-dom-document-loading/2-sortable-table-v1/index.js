export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  templateTable () {
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

  templateHeader () {
    this.columnConfig = [];
    const templateHeaderElements = this.headerConfig.map(({
      id = null,
      title = '',
      sortable = false,
      sortType = '',
      template = null,
    }) => {

      if (id) {
        this.columnConfig.push({name: id, tpl: template});
        return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
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

  templateBody () {
    const templateBodyElements = this.data.map((dataElement) => {
      const elementsCell = wrapElementsCell(dataElement, this.columnConfig);      
      return `
        <a href="/products/${dataElement.id}" class="sortable-table__row">
          ${elementsCell}
        </a>
        ` 
    }).join('');

    function wrapElementsCell (dataElement, columnConfig) {
      return columnConfig.map(({name, tpl = null}) => {        
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

  sort(field, order) {
    this.data.sort((a, b) => {
      if (order === 'asc') {
          return `${a[field]}`.localeCompare(`${b[field]}`, ['ru-RU', 'en-US'], {numeric: true, caseFirst: 'upper'});
      }
      return `${b[field]}`.localeCompare(`${a[field]}`, ['ru-RU', 'en-US'], {numeric: true, caseFirst: 'upper'});
  });
  
  const parent = this.element.parentElement;
  this.destroy();
  this.render();
  parent.append(this.element);      
  }

  render () {
    const el = document.createElement('div');
    el.innerHTML = this.templateTable();
    this.element = el.firstElementChild;
  }

  destroy () {
    this.element.remove();
  }

}

