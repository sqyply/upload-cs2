// Жёстко прописанные скины для ТВОЕГО ИНВЕНТАРЯ (Тест-режим)
const myFixedInventory = [
    { id: 1, name: "AWP | Dragon Lore", price: 1250000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrY6i2lHj-ERvY273co-SclA8YVvS_FLsl73ng5S9v8zMmHBu73I8pSGKgf9f_6M" },
    { id: 2, name: "AK-47 | Fire Serpent", price: 95000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppUp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" },
    { id: 3, name: "Knife | Butterfly Doppler", price: 180000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYi59_9Szh4S0g_7zO6-fzzxUuJFz3-qSrd2tjge2_RE9a2DycI-Sd1VvYF3VqVPrwb_rjZXpv8idm3VgvXNw4S7D30vgvN9mAtM" }
];

// Настройки колеса
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let currentChance = 0;
let isRolling = false;
let selectedSkinId = null;

// Отрисовка колеса (Механика: выигрыш, если сектор под стрелкой сверху)
function drawWheel(rotation = 0, chance = 0) {
    const cx = 250, cy = 250, r = 235;
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Основной серый трек
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#11111a';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Желтый сектор выигрыша
    if (chance > 0) {
        const angleSize = (Math.PI * 2) * (chance / 100);
        ctx.beginPath();
        // Центрируем сектор относительно 0 (который под стрелкой)
        ctx.arc(0, 0, r, -angleSize/2, angleSize/2); 
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();
}

// Заполнение твоего инвентаря
const grid = document.getElementById('inventory-grid');
myFixedInventory.forEach(skin => {
    grid.innerHTML += `
        <div onclick="selectSkinForUpgrade(${skin.id})" id="skin-${skin.id}" class="item-card p-6 rounded-[1.5rem] cursor-pointer active:scale-95">
            <img src="${skin.img}" class="w-28 mx-auto drop-shadow-2xl">
            <div class="text-[9px] font-black text-gray-500 uppercase mt-4 tracking-tighter truncate">${skin.name}</div>
            <div class="text-white font-black text-lg italic mt-1">${skin.price.toLocaleString()} SQ</div>
        </div>
    `;
});

// Логика выбора скина
function selectSkinForUpgrade(id) {
    if (isRolling) return;
    
    // Сбрасываем старое выделение
    if (selectedSkinId) {
        document.getElementById(`skin-${selectedSkinId}`).classList.remove('selected');
    }
    
    // Выделяем новый
    selectedSkinId = id;
    document.getElementById(`skin-${id}`).classList.add('selected');
    
    const skin = myFixedInventory.find(s => s.id === id);
    
    // В ТЕСТ-РЕЖИМЕ цель всегда Dragon Lore (для наглядности шанса)
    const targetLore = myFixedInventory[0]; 
    
    // Если выбрали сам Dragon Lore, шанс 100% (апгрейд в себя же)
    const chance = skin.id === targetLore.id ? 100 : ((skin.price / targetLore.price) * 100).toFixed(2);
    currentChance = parseFloat(chance);

    // Обновляем интерфейс
    document.getElementById('target-area').style.opacity = '1';
    document.getElementById('target-img').src = targetLore.img;
    document.getElementById('target-name').innerText = targetLore.name;
    document.getElementById('target-price').innerText = targetLore.price.toLocaleString() + " SQ";
    document.getElementById('chance-display').innerText = currentChance + '%';
    
    const rollBtn = document.getElementById('roll-btn');
    rollBtn.disabled = false;
    rollBtn.innerText = `АПГРЕЙД ЗА ${skin.price.toLocaleString()} SQ`;

    drawWheel(0, currentChance);
}

// Логика крутилки
document.getElementById('roll-btn').onclick = () => {
    if (isRolling || !selectedSkinId) return;
    isRolling = true;
    document.getElementById('roll-btn').disabled = true;

    // Математика выигрыша
    const win = Math.random() * 100 <= currentChance;
    const spins = 10; // Сколько кругов сделать
    
    // Угол остановки: 0 - центр желтого сектора.
    const angleSize = (Math.PI * 2) * (currentChance / 100);
    let targetAngle;
    if (win) {
        // Рандомная точка ВНУТРИ желтого сектора
        targetAngle = (Math.random() * angleSize) - (angleSize / 2);
    } else {
        // Рандомная точка ВНЕ желтого сектора
        targetAngle = (Math.random() * (Math.PI * 2 - angleSize)) + (angleSize / 2);
    }

    // Финальное вращение (крутим в обратную сторону, чтобы сектор попал под стрелку)
    const finalRotation = (Math.PI * 2 * spins) - targetAngle;

    // Анимация
    const startTime = performance.now();
    const duration = 6000; // 6 секунд крутится

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Эффект замедления (EaseOut)
        const ease = 1 - Math.pow(1 - progress, 5); 
        const rotation = finalRotation * ease;
        
        drawWheel(rotation, currentChance);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Конец анимации
            isRolling = false;
            document.getElementById('roll-btn').disabled = false;
            if (win) {
                alert("ПОБЕДА! В ТЕСТ-РЕЖИМЕ шмотки не начисляются.");
            } else {
                alert("ПРОИГРЫШ. В ТЕСТ-РЕЖИМЕ шмотки не сгорают.");
            }
        }
    }
    requestAnimationFrame(animate);
};

// Инициализация колеса
drawWheel(0, 0);
