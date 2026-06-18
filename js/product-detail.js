// product-detail.js

/**
 * Генерирует HTML-разметку для подробной страницы автозапчасти
 * @param {Object} product - Объект с данными товара из Store
 * @param {Function} onBack - Функция возврата обратно к каталогу
 */
export function renderProductDetail(product, onBack) {
    const container = document.createElement('div');
    
    container.style.cssText = `
        grid-column: 1 / -1;
        width: 100%;
        box-sizing: border-box;
        padding: 10px;
    `;

    // Подготовка данных
    const name = product.name || 'Без названия';
    const brand = product.brand || 'Не указан';
    const article = product.article || '—';
    const price = product.price ? product.price.toLocaleString('ru-RU') : '0';
    const stock = product.stock !== undefined ? product.stock : 0;
    const description = product.description || 'Описание товара отсутствует.';
    
    const oemList = product.oem_numbers && product.oem_numbers.length > 0 
        ? product.oem_numbers.join(', ') 
        : 'Не указаны';

    const imageUrl = product.image || `https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80`;

    container.innerHTML = `
        <div class="detail-back-nav" style="margin-bottom: 25px;">
            <button id="back-to-catalog-btn" class="btn-back" style="padding: 10px 20px; background-color: #f1f5f9; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; color: #0f172a; transition: background 0.2s;">
                ← Назад в каталог
            </button>
        </div>
        
        <div class="detail-main-layout" style="display: flex; gap: 40px; width: 100%; align-items: flex-start; box-sizing: border-box;">
            
            <div class="detail-media" style="flex: 0 0 40%; max-width: 450px; min-width: 280px; box-sizing: border-box;">
                <div style="width: 100%; border-radius: 12px; overflow: hidden; background-color: #f8fafc; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <img src="${imageUrl}" alt="${name}" style="width: 100%; height: auto; display: block; object-fit: contain;">
                </div>
            </div>
            
            <div class="detail-info" style="flex: 1; display: flex; flex-direction: column; box-sizing: border-box;">
                
                <div class="brand-badge" style="color: #3b82f6; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
                    ${brand}
                </div>
                
                <h1 style="margin: 0 0 20px 0; font-size: 28px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                    ${name}
                </h1>
                
                <div class="tech-codes" style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; display: flex; flex-direction: column; gap: 10px; border: 1px solid #f1f5f9;">
                    <div style="font-size: 15px;"><span style="color: #64748b;">Артикул:</span> <strong style="color: #0f172a; margin-left: 8px; font-size: 16px;">${article}</strong></div>
                    <div style="font-size: 15px;"><span style="color: #64748b;">OEM-номера:</span> <span style="color: #334155; font-family: monospace; font-size: 14px; margin-left: 8px; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${oemList}</span></div>
                </div>

                <div class="detail-description-block" style="margin-bottom: 30px; background: #fff; border-left: 4px solid #cbd5e1; padding-left: 15px;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #0f172a; margin: 0 0 10px 0;">Описание и характеристики:</h3>
                    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0;">
                        ${description}
                    </p>
                </div>

                <div class="purchase-zone" style="margin-top: auto; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
                    <div>
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 4px;">Цена:</div>
                        <span class="detail-price" style="font-size: 32px; font-weight: 800; color: #0f172a;">
                            ${price} ₽
                        </span>
                    </div>
                    
                    <div style="text-align: right; display: flex; flex-direction: column; gap: 8px;">
                        <div style="font-size: 14px;">
                            <span style="color: #64748b;">Наличие:</span>
                            <span style="font-weight: 600; margin-left: 5px; color: ${stock > 0 ? '#10b981' : '#ef4444'}">
                                ${stock > 0 ? `${stock} шт.` : 'Нет в наличии'}
                            </span>
                        </div>
                        
                        <button class="add-to-cart-btn" data-id="${product.id}" ${stock <= 0 ? 'disabled' : ''} style="padding: 12px 28px; font-size: 16px; font-weight: 600;">
                            В корзину
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;

    // Навешиваем обработчики
    container.querySelector('#back-to-catalog-btn').addEventListener('click', onBack);

    const addToCartBtn = container.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            import('./store.js').then(module => {
                module.Store.addToCart(product.id);
                import('./ui.js').then(uiModule => {
                    uiModule.UI.renderCart();
                });
            });
        });
    }

    return container;
}