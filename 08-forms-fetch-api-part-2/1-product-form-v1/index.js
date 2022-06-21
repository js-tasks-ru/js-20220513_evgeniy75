import escapeHtml from './utils/escape-html.js'
import fetchJson from './utils/fetch-json.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1'
const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ProductForm {

  url = new URL('api/rest/', BACKEND_URL)
  subElements = {}
  formElementsNames = []
  data = {
    title: ``,
    description: ``,
    images: [],
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1,
    subcategory: ``
  }
  category = []

  constructor(productId) {
    this.productId = productId
  }

  async getData() {
    const categoryUrl = `${this.url}categories?_sort=weight&_refs=subcategory`    
    const productUrl = `${this.url}products?id=${this.productId}`
    const getCategory = fetchJson(categoryUrl)
    const getProduct = this.productId ? fetchJson(productUrl) : Promise.resolve([this.data])
    const [categoryData, [productData]] = await Promise.all([getCategory, getProduct])
    this.formElementsNames = Object.keys(this.data)
    this.formElementsNames.forEach((el) => [
      this.data[el] = productData[el]
    ])
    this.category = categoryData
  }

  saveProduct = (e) => {
    e.preventDefault()
    this.save()
  }

  async save() {
    const productJSON = this.getJsonDataToSave()
    try {
      const res = await fetchJson(`${this.url}products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: productJSON
      })
      this.dispatchEvent(res.id)
    } catch (error) {
      console.error('something went wrong', error)
    }
  }

  updateDataForm() {
    const form = this.subElements.productForm.elements
    const { 
      title,
      description,
      subcategory,
      price,
      discount,
      quantity,
      status
    } = this.data
    form.title.value = title
    form.description.value = description
    subcategory === `` 
      ? form.subcategory.selectedIndex = 0 
      : form.subcategory.value = subcategory
    form.price.value = price
    form.discount.value = discount
    form.quantity.value = quantity
    form.status.value = status
    this.setEventListeners(form)

    // for tests ;(
    this.forTests(form)      
  }
  
  forTests(form) {
    const els = Object.keys(this.data)
    els.forEach((el) => {
      if(el !== `images`) {
        form[el].setAttribute(`id`, `${el}`)
      }
    })
  }

  getJsonDataToSave() {  
    const formElements = this.subElements.productForm.elements
    const dataProduct = {}
    dataProduct.id = this.productId
    this.formElementsNames.forEach((el) => {
      if(el === `images`) {
        dataProduct[el] = this.data.images
        return      
      }
      dataProduct[el] = escapeHtml(formElements[el].value)
    })
    const productJSON = JSON.stringify(dataProduct, (key, value) => {
      const toNumber = [`price`,`discount`,`quantity`,`status`]
      if(toNumber.includes(key)) {
        return new Number(value)
      }
      return value
    })
    return productJSON    
  }  

  setEventListeners(form) {
    form.uploadImage.addEventListener(`click`, this.uploadImages)
    form.save.addEventListener(`click`, this.saveProduct)    
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved')

    this.element.dispatchEvent(event)
  }

  uploadImages = () => {
    const uploadImageElement = this.subElements.productForm.uploadImage
    const input = document.createElement(`input`)
    input.type = `file`
    input.onchange = async () => {
      uploadImageElement.classList.add('is-loading')
      const [file] = input.files
      if(file) {
        const formData = new FormData()
        formData.append("image", file)
        const req = `https://api.imgur.com/3/image`
        const reqOptions = {
          method: `POST`,
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: file,
        }
        const getImagesData = await fetchJson(req, reqOptions)
        const imageUrlFromImgur = getImagesData.data.link
        this.addImages([{url: imageUrlFromImgur, source: file.name}])
        uploadImageElement.classList.remove('is-loading')
        input.remove()
      }
    }    
    input.click()
  }
  
  addImages(image) {
    this.data.images.push(...image)
    this.imagesList = this.subElements.imageListContainer.firstElementChild
    const images = this.getTemplateImagesElements(image)
    this.imagesList.insertAdjacentHTML(`beforeend`, images)
  }

  getTepmlateForm() {
    const title = this.getTemplateTitle()
    const description = this.getTemplateDescription()
    const images = this.getTemplateImages()
    const catagory = this.getTemplateProductCatagory()
    const otherProps = this.getTemplateOtherProps()
    const submitButton = this.getTemplateSubmitButton()
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid" name="product">
      ${title}
      ${description}
      ${images}
      ${catagory}
      ${otherProps}
      ${submitButton}
      </form>
    </div>
    `
  }

  getTemplateTitle() {
    return `
    <div class="form-group form-group__half_left">
      <fieldset>
        <label class="form-label">Название товара</label>
        <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
      </fieldset>
    </div>
    `
  }

  getTemplateDescription() {
    return `
    <div class="form-group form-group__wide">
      <label class="form-label">Описание</label>
      <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
    </div>
    `
  }

  getTemplateImages() {
    const images = this.getTemplateImagesElements()
    return `
    <div class="form-group form-group__wide" data-element="sortable-list-container">
      <label class="form-label">Фото</label>
      <div data-element="imageListContainer">
        <ul class="sortable-list">
        ${images}
        </ul>
      </div>
      <button type="button" name="uploadImage" class="button-primary-outline fit-content"><span>Загрузить</span></button>
    </div>
    `
  }

  getTemplateProductCatagory() {
    const options = this.category.map(({ id, title, subcategories }) => {
      if (subcategories) {
        const parentTitle = title
        return subcategories.map(({ id, title }) => {
          return `<option value="${id}">${parentTitle} > ${title}</option>`
        }).join(``)
      }
      return `
      <option value="${id}">${title}</option>
      `
    }).join(``)
    return `
    <div class="form-group form-group__half_left">
      <label class="form-label">Категория</label>
      <select class="form-control" name="subcategory">
      ${options}
      </select>
    </div>
    `
  }

  getTemplateImagesElements(images) {
    const imagesData = images ? images : this.data.images
    return imagesData.map(({ url, source }) => {
      return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${escapeHtml(url)}">
        <input type="hidden" name="source" value="${escapeHtml(source)}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
      `
    }).join(``)
  }

  getTemplateOtherProps() {
    return `
    <div class="form-group form-group__half_left form-group__two-col">
      <fieldset>
        <label class="form-label">Цена ($)</label>
        <input required="" type="number" name="price" class="form-control" placeholder="100">
      </fieldset>
      <fieldset>
        <label class="form-label">Скидка ($)</label>
        <input required="" type="number" name="discount" class="form-control" placeholder="0">
      </fieldset>
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Количество</label>
      <input required="" type="number" class="form-control" name="quantity" placeholder="1">
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Статус</label>
      <select class="form-control" name="status">
        <option value="1">Активен</option>
        <option value="0">Неактивен</option>
      </select>
    </div>
    `
  }

  getTemplateSubmitButton() {
    return `
    <div class="form-buttons">
      <button type="submit" name="save" class="button-primary-outline">
      Сохранить товар
      </button>
    </div>
    `
  }

  getSubElements() {
    const result = {}
    const elements = this.element.querySelectorAll(`[data-element]`)
    for (const el of elements) {
      const name = el.dataset.element
      result[name] = el
    }
    return result
  }

  async render() {
    await this.getData()
    const wrap = document.createElement(`div`)
    wrap.innerHTML = this.getTepmlateForm()
    this.element = wrap.firstElementChild
    this.subElements = this.getSubElements()
    this.updateDataForm()
    return this.element  
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.element.remove()
    this.element = null
    this.subElements = {}
  }
}