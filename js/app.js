import { Store } from './store.js';
import { UI } from './ui.js';
import { Payment } from './payment.js';
import { renderProductDetail } from './product-detail.js';

// Переменная для хранения текущей выбранной категории (чтобы подсвечивать её)
let currentCategoryId = '';

function initApp() {
  // Первичный рендер данных при загрузке страницы
  UI.renderCategories(currentCategoryId);
  UI.renderProducts();
  UI.renderCart();

  // === ЛОГИКА ПОИСКА ===
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  const handleSearch = () => {
    Store.setSearchQuery(searchInput.value);
    // При поиске имеет смысл возвращать пользователя в каталог, если он был на странице товара
    UI.showCatalogView(); 
    UI.renderProducts();
  };

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('input', handleSearch);

  // === ФИЛЬТР ПО КАТЕГОРИЯМ (Клик в левой панели) ===
  document.getElementById('categories-list').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;

    currentCategoryId = li.dataset.id;
    
    Store.setCategoryFilter(currentCategoryId);
    UI.renderCategories(currentCategoryId); 
    
    // При переключении категории обязательно возвращаемся к сетке каталога
    UI.showCatalogView();
    UI.renderProducts(); 
  });

  // === ВЗАИМОДЕЙСТВИЕ С КАТАЛОГОМ И ДЕТАЛЯМИ ТОВАРА ===
  const productsGrid = document.getElementById('products-grid');

  productsGrid.addEventListener('click', (e) => {
    // 1. Клик на кнопку "В корзину"
    if (e.target.classList.contains('add-to-cart-btn')) {
      e.stopPropagation(); // Останавливаем всплытие, чтобы не триггерить клик по карточке
      const productId = e.target.dataset.id;
      Store.addToCart(productId);
      UI.renderCart();
      return;
    }

    // 2. Клик по самой карточке товара (для открытия подробной страницы)
    const productCard = e.target.closest('.product-card'); // замени .product-card на свой класс карточки
    if (productCard) {
      const productId = productCard.dataset.id;
      
      // Получаем актуальные данные товара из твоего Store по ID
      const productData = Store.getProductById(productId); 
      
      if (productData) {
        // Рендерим DOM-элемент детализации. 
        // Вторым аргументом передаем функцию возврата назад к каталогу.
        const detailElement = renderProductDetail(productData, () => {
          UI.showCatalogView();
        });

        // Отображаем страницу товара через UI-модуль
        UI.showProductDetailView(detailElement);
      }
    }
  });

  // === ВЗАИМОДЕЙСТВИЕ С КОРЗИНОЙ ===
  document.getElementById('open-cart-btn').addEventListener('click', () => UI.toggleCart(true));
  document.getElementById('close-cart-btn').addEventListener('click', () => UI.toggleCart(false));
  document.getElementById('overlay').addEventListener('click', () => UI.toggleCart(false));

  // === СЛУШАТЕЛИ ДЛЯ КНОПОК ВНУТРИ КОРЗИНЫ ===
  document.getElementById('cart-items').addEventListener('click', (e) => {
    
    // 1. СНАЧАЛА проверяем кнопку "Очистить всё" (ей не нужен id товара)
    if (e.target.id === 'clear-cart-btn') {
      if (confirm('Вы уверены, что хотите полностью очистить корзину?')) {
        Store.clearCart();
        UI.renderCart();
      }
      return; // Выходим из функции, чтобы не идти дальше
    }

    // 2. Теперь получаем ID товара для остальных кнопок
    const productId = e.target.dataset.id;
    
    // 3. И только теперь делаем проверку на существование ID
    if (!productId) return;

    // 4. Нажата кнопка ПЛЮС (+)
    if (e.target.classList.contains('plus-btn')) {
      Store.addToCart(productId);
      UI.renderCart();
    }
    
    // 5. Нажата кнопка МИНУС (-)
    if (e.target.classList.contains('decrease-btn') || e.target.classList.contains('minus-btn')) {
      Store.decreaseQuantity(productId);
      UI.renderCart();
    }
    
    // 6. Нажата кнопка "Удалить"
    if (e.target.classList.contains('cart-remove-btn')) {
      Store.removeFromCart(productId);
      UI.renderCart();
    }
  });

  // Кнопка "Оформить заказ"
  document.getElementById('checkout-btn').addEventListener('click', () => {
    Payment.openModal();
  });

  // Слушатели закрытия модалки оплаты
  document.getElementById('close-payment-btn').addEventListener('click', () => Payment.closeModal());
  
  document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('pay-email').value;
    Payment.sendReceipt(email);
  });
  
  document.getElementById('overlay').addEventListener('click', () => {
    Payment.closeModal();
  });
}

document.addEventListener('DOMContentLoaded', initApp);