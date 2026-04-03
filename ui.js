// ui.js — Управление внешним видом
const UI = {
    // Переключение страниц
    showPage(pageId) {
        const pages = ['page-main', 'page-profile'];
        pages.forEach(id => {
            document.getElementById(id).classList.toggle('hidden', id !== `page-${pageId}`);
        });
    },

    // Отрисовка скинов в списки
    renderSkins(containerId, items, type, selectedItem) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        items.slice(0, 50).forEach(item => {
            const isSelected = selectedItem && selectedItem.name === item.name;
            const card = document.createElement('div');
            card.className = `skin-card p-3 mb-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer flex items-center gap-3 ${isSelected ? 'selected' : ''}`;
            
            // Клик прокидываем в основной app.js через глобальную функцию
            card.onclick = () => window.handleSelect(item, type);

            card.innerHTML = `
                <img src="${item.img}" class="w-10 h-10 object-contain">
                <div class="overflow-hidden">
                    <div class="text-[10px] font-bold truncate text-gray-400 uppercase">${item.name}</div>
                    <div class="text-yellow-500 font-black text-xs">${item.price.toLocaleString()} SQ</div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    // Обновление кольца шанса
    updateCircle(chance) {
        const ring = document.getElementById('progress-ring');
        const display = document.getElementById('chance-display');
        if (!ring || !display) return;

        // Длина окружности 2 * PI * r (r=180) ≈ 1130
        const offset = 1130 - (1130 * chance) / 100;
        ring.style.strokeDashoffset = offset;
        display.innerText = chance.toFixed(1) + "%";
    },

    // Табло результата (Победа/Проигрыш)
    showResult(win, item = null) {
        // Можно добавить красивую модалку, пока сделаем алертом для теста
        if (win) {
            alert(`ПОЗДРАВЛЯЕМ! Вы выиграли ${item.name}`);
        } else {
            alert("УПС! Апгрейд не удался, предмет сгорел.");
        }
    }
};

// Глобальная функция для HTML-кнопок
window.showPage = UI.showPage;
