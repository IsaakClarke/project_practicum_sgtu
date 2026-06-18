import { Store } from './store.js';
import { UI } from './ui.js';

export const Payment = {
  // Открыть окно оплаты
  openModal() {
    const modal = document.getElementById('payment-modal');
    const overlay = document.getElementById('overlay');
    const totalSpan = document.getElementById('payment-total');
    
    totalSpan.textContent = `${Store.getCartTotal().toLocaleString('ru-RU')} ₽`;
    
    // Закрываем боковую корзину, но оставляем overlay (затемнение)
    document.getElementById('cart-sidebar').classList.remove('open');
    
    modal.classList.add('show');
    overlay.classList.add('show');
  },

  // Закрыть окно оплаты
  closeModal() {
    document.getElementById('payment-modal').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    document.getElementById('payment-form').reset();
  },

  // Имитация отправки чека
  sendReceipt(email) {
    const cart = Store.getCart();
    const total = Store.getCartTotal();
    
    // Формируем красивый текстовый список товаров для консоли/оповещения
    const itemsText = cart.map(item => 
      `- ${item.product.brand} ${item.product.article} (${item.product.name}) x ${item.quantity} шт.`
    ).join('\n');

    console.log(`%c[Имитация Сервера]: Отправка чека на ${email}...`, 'color: #2563eb; font-weight: bold;');
    console.log(`Детали чека:\n${itemsText}\nИтого оплачено: ${total} ₽`);

    // Показываем пользователю финальное уведомление
    alert(`Оплата прошла успешно!\n\nЭлектронный чек с деталями заказа отправлен на почту: ${email}\n\nСпасибо за покупку в AutoDoc!`);
    
    // Очищаем корзину после успешной транзакции
    Store.clearCart();
    UI.renderCart();
    this.closeModal();
  }
};

// ---МАСКИ ДЛЯ ВВОДА ДАННЫХ КАРТЫ---
document.addEventListener('DOMContentLoaded', () => {
  const cardInput = document.getElementById('card-number');
  const expiryInput = document.getElementById('card-expiry');

  // Форматирование номера карты (красивые пробелы каждые 4 цифры)
  cardInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    e.target.value = formatted;
  });

  // Форматирование срока действия (добавление слеша MM/YY)
  expiryInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (value.length > 2) {
      e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
      e.target.value = value;
    }
  });
});