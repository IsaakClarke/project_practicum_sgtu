import { Store } from './store.js';

export const UI = {
  
  // 1. ОТРИСОВКА СПИСКА КАТЕГОРИЙ (ЛЕВАЯ ПАНЕЛЬ)
  renderCategories(activeCategoryId) {
    const categoriesList = document.getElementById('categories-list');
    const categories = Store.getCategories();
    
    let html = `
      <li class="${!activeCategoryId ? 'active' : ''}" data-id="">
        Все детали
      </li>
    `;
    
    categories.forEach(cat => {
      const isActive = cat.id === activeCategoryId ? 'active' : '';
      html += `
        <li class="${isActive}" data-id="${cat.id}">
          ${cat.name}
        </li>
      `;
    });
    
    categoriesList.innerHTML = html;
  },

  // 2. ОТРИСОВКА КАРТОЧЕК ТОВАРОВ В КАТАЛОГЕ
  renderProducts() {
    const productsGrid = document.getElementById('products-grid');
    const products = Store.getFilteredProducts();
    
    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
          Ничего не найдено. Попробуйте изменить параметры поиска.
        </div>
      `;
      return;
    }

    // Генерация сетки товаров
    productsGrid.innerHTML = products.map(product => {
      const imageUrl = product.image || `https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80`;

      // ИЗМЕНЕНИЕ: добавили data-id на саму карточку и класс стиля для курсора
      return `
        <div class="product-card" data-id="${product.id}" style="cursor: pointer;">
          <div class="product-img-wrapper" style="width: 100%; height: 180px; overflow: hidden; background-color: #f8fafc; border-radius: 8px 8px 0 0; position: relative;">
            <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
          </div>
          
          <div class="product-card-content" style="padding: 15px; display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
            <div>
              <div class="product-meta">
                <span>${product.brand}</span>
                <strong>${product.article}</strong>
              </div>
              <h3 class="product-title" style="margin: 8px 0; font-size: 16px; font-weight: 600; line-height: 1.4;">${product.name}</h3>
              <p class="product-desc" style="font-size: 13px; color: #64748b; margin-bottom: 15px;">${product.description || ''}</p>
            </div>
            <div class="product-footer" style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
              <span class="product-price" style="font-weight: 700; font-size: 18px;">${product.price.toLocaleString('ru-RU')} ₽</span>
              <button class="add-to-cart-btn" data-id="${product.id}">
                В корзину
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // === НОВЫЕ МЕТОДЫ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ЭКРАНОВ ===

  /**
   * Замещает сетку товаров детальным обзором одной запчасти
   * @param {HTMLElement} detailElement - Сгенерированный узел страницы товара
   */
  showProductDetailView(detailElement) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = ''; // Стираем каталог товаров
    productsGrid.appendChild(detailElement); // Вставляем детальную страницу запчасти
  },

  /**
   * Возвращает отображение обратно к списку товаров каталога
   */
  showCatalogView() {
    // Вызов встроенного метода заново соберет сетку по текущим фильтрам Store
    this.renderProducts();
  },

  // 3. ОТРИСОВКА СОДЕРЖИМОГО ВЫЕЗЖАЮЩЕЙ КОРЗИНЫ
  renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountBadge = document.getElementById('cart-count');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    const cart = Store.getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountBadge.textContent = totalItems;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-text">В корзине пока ничего нет</p>';
      cartTotalAmount.textContent = '0 ₽';
      checkoutBtn.disabled = true;
      return;
    }

    let html = `
      <div style="text-align: right; margin-bottom: 15px;">
        <button id="clear-cart-btn" style="background: none; border: none; color: #ef4444; font-weight: 600; cursor: pointer; font-size: 13px;">
          🗑️ Очистить всё
        </button>
      </div>
    `;

    html += cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h4>${item.product.name}</h4>
          <p>${item.product.brand} | ${item.product.article}</p>
          <p style="font-weight: 700; margin-top: 5px;">${item.product.price.toLocaleString('ru-RU')} ₽</p>
        </div>
        
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
          <div style="display: flex; align-items: center; background-color: #f1f5f9; border-radius: 6px; padding: 2px;">
            <button class="cart-qty-btn minus-btn" data-id="${item.product.id}" style="width: 28px; height: 28px; border: none; background: none; cursor: pointer; font-weight: bold;">-</button>
            <span style="min-width: 24px; text-align: center; font-weight: 600; font-size: 14px;">${item.quantity}</span>
            <button class="cart-qty-btn plus-btn" data-id="${item.product.id}" style="width: 28px; height: 28px; border: none; background: none; cursor: pointer; font-weight: bold;">+</button>
          </div>
          
          <button class="cart-remove-btn" data-id="${item.product.id}" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 12px; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">
            Удалить
          </button>
        </div>
      </div>
    `).join('');

    cartItemsContainer.innerHTML = html;
    cartTotalAmount.textContent = `${Store.getCartTotal().toLocaleString('ru-RU')} ₽`;
    checkoutBtn.disabled = false;
  },

  // 4. ПЕРЕКЛЮЧАТЕЛЬ ВИДИМОСТИ ПАНЕЛИ КОРЗИНЫ
  toggleCart(isOpen) {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    if (isOpen) {
      cartSidebar.classList.add('open');
      overlay.classList.add('show');
    } else {
      cartSidebar.classList.remove('open');
      overlay.classList.remove('show');
    }
  }
};