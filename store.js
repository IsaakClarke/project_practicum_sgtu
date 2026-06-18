import { database } from './data.js';

// Локальное состояние магазина в памяти приложения
const state = {
  products: database.products,
  categories: database.categories,
  cars: database.cars,
  cart: loadCartFromLocalStorage(), // Загружаем корзину из памяти браузера при старте
  filters: {
    searchQuery: '',
    selectedCarId: '',
    selectedCategoryId: ''
  }
};

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Очистка артикулов от лишних символов (пробелы, дефисы, спецсимволы)
const cleanArticle = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

// Сохранение корзины в LocalStorage
function saveCartToLocalStorage() {
  localStorage.setItem('autodoc_cart', JSON.stringify(state.cart));
}

// Загрузка корзины из LocalStorage
function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('autodoc_cart');
  return savedCart ? JSON.parse(savedCart) : [];
}


// --- ЭКСПОРТ ДВИЖКА МАГАЗИНА ---
export const Store = {
  
  // 1. ПОЛУЧИТЬ ТОВАРЫ С УЧЕТОМ ФИЛЬТРОВ И ПОИСКА
  getFilteredProducts() {
    return state.products.filter(product => {
      // А. Умный поиск по тексту (название, бренд, артикул или OEM)
      const query = cleanArticle(state.filters.searchQuery);
      let matchesSearch = true;
      
      if (query) {
        const inName = product.name.toLowerCase().includes(query);
        const inBrand = product.brand.toLowerCase().includes(query);
        const inArticle = cleanArticle(product.article).includes(query);
        const inOem = product.oem_numbers.some(oem => cleanArticle(oem).includes(query));
        
        matchesSearch = inName || inBrand || inArticle || inOem;
      }

      // Б. Фильтр по автомобилю
      let matchesCar = true;
      if (state.filters.selectedCarId) {
        matchesCar = product.compatibility.includes(state.filters.selectedCarId);
      }

      // В. Фильтр по категории
      let matchesCategory = true;
      if (state.filters.selectedCategoryId) {
        matchesCategory = product.category_id === state.filters.selectedCategoryId;
      }

      return matchesSearch && matchesCar && matchesCategory;
    });
  },

  // 2. УПРАВЛЕНИЕ ФИЛЬТРАМИ
  setSearchQuery(query) { state.filters.searchQuery = query; },
  setCarFilter(carId) { state.filters.selectedCarId = carId; },
  setCategoryFilter(catId) { state.filters.selectedCategoryId = catId; },

  // 3. ПОЛУЧЕНИЕ ДАННЫХ ДЛЯ ИНТЕРФЕЙСА
  getCars() { return state.cars; },
  getCategories() { return state.categories; },
  
  /**
   * Находит один товар в базе по его уникальному ID
   * @param {string|number} productId 
   * @returns {Object|undefined} объект товара или undefined
   */
  getProductById(productId) {
    // Приведение к строке гарантирует корректное сравнение, 
    // даже если в HTML id стал строкой, а в data.js он числом.
    return state.products.find(product => String(product.id) === String(productId));
  },

  // 4. ЛОГИКА КОРЗИНЫ (С АВТОСОХРАНЕНИЕМ)
  
  // Добавить товар / Увеличить количество на 1
  addToCart(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    const cartItem = state.cart.find(item => item.product.id === productId);
    if (cartItem) {
      if (cartItem.quantity < product.stock) {
        cartItem.quantity++;
      } else {
        alert(`Невозможно добавить больше товаров. На складе доступно: ${product.stock} шт.`);
        return;
      }
    } else {
      state.cart.push({ product, quantity: 1 });
    }
    
    saveCartToLocalStorage(); // Сохраняем изменения
  },

  // Уменьшить количество товара на 1
  decreaseQuantity(productId) {
    const cartItem = state.cart.find(item => item.product.id === productId);
    if (!cartItem) return;

    cartItem.quantity--;
    
    // Если количество стало 0 — полностью удаляем деталь из корзины
    if (cartItem.quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      saveCartToLocalStorage(); // Сохраняем изменения количества
    }
  },

  // Полностью удалить товар из корзины (независимо от количества)
  removeFromCart(productId) {
    state.cart = state.cart.filter(item => item.product.id !== productId);
    saveCartToLocalStorage(); // Сохраняем изменения
  },

  // Полная очистка корзины
  clearCart() {
    state.cart = [];
    saveCartToLocalStorage(); // Сохраняем пустую корзину
  },

  // Получить текущий состав корзины
  getCart() { 
    return state.cart; 
  },
  
  // Подсчитать общую стоимость заказа
  getCartTotal() {
    return state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }
};