// app.js
let state = {
    balance: 1500.00,
    inventory: [
        { id: 1, name: 'AK-47 | Safari Mesh', price: 2.50, img: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' },
        { id: 2, name: 'AWP | Asiimov', price: 150.00, img: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' }
    ],
    shop: [],
    selectedMy: null,
    selectedTarget: null,
    chance: 0,
    speed: 3000,
    isRolling: false
};

// Загрузка скинов из реального API CS2
async function init() {
    try {
        const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
        const data = await res.json();
        // Фильтруем и берем первые 100 для скорости
        state.shop = data.slice(0, 100).map(s => ({
            name: s.name,
            price: (Math.random() * 800 + 10).toFixed(2), // Генерим цену (в API её нет)
            img: s.image
        }));
        renderAll();
    } catch (e) { console.error("API Error", e); }
}

function renderAll() {
    // Инвентарь
    const invGrid = document.getElementById('my-grid');
    invGrid.innerHTML = state.inventory.map(item => `
        <div class="skin-card" onclick="selectMy(${item.id})" id="my-${item.id}">
            <img src="${item.img}" class="w-full h-12 object-contain mb-2">
            <div class="text-[8px] font-bold text-gray-500 uppercase truncate">${item.name}</div>
            <div class="text-[10px] font-black text-yellow-500 mt-1">${item.price} SQ</div>
        </div>
    `).join('');

    // Магазин
    const shopGrid = document.getElementById('shop-grid');
    shopGrid.innerHTML = state.shop.map(item => `
        <div class="skin-card" onclick="selectTarget('${item.name}')" id="shop-${item.name}">
            <img src="${item.img}" class="w-full h-12 object-contain mb-2">
            <div class="text-[8px] font-bold text-gray-500 uppercase truncate">${item.name}</div>
            <div class="text-[10px] font-black text-yellow-500 mt-1">${item.price} SQ</div>
        </div>
    `).join('');
}

window.selectMy = (id) => {
    state.selectedMy = state.inventory.find(i => i.id === id);
    document.querySelectorAll('#my-grid .skin-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`my-${id}`).classList.add('selected');
    calcChance();
};

window.selectTarget = (name) => {
    state.selectedTarget = state.shop.find(i => i.name === name);
    document.querySelectorAll('#shop-grid .skin-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`shop-${name}`).classList.add('selected');
    calcChance();
};

function calcChance() {
    if (state.selectedMy && state.selectedTarget) {
        state.chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
        state.chance = Math.min(state.chance, 95).toFixed(2);
        
        document.getElementById('chance-display').innerText = state.chance + '%';
        const ring = document.getElementById('ring-progress');
        ring.style.strokeDashoffset = 1005 - (1005 * state.chance / 100);
        
        const btn = document.getElementById('upgrade-btn');
        btn.disabled = false;
        btn.innerText = `UPGRADE`;
    }
}

window.setSpeed = (ms, btn) => {
    state.speed = ms;
    document.querySelectorAll('.spd-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
};

function startUpgrade() {
    if (state.isRolling) return;
    state.isRolling = true;
    document.getElementById('upgrade-btn').disabled = true;

    const ticker = document.getElementById('ticker');
    ticker.classList.remove('hidden');

    const resultPoint = Math.random() * 100; // Где остановится стрелка
    const isWin = resultPoint <= state.chance;
    const finalRotation = (360 * 5) + (resultPoint * 3.6); // 5 кругов + точка

    ticker.style.transition = `transform ${state.speed}ms cubic-bezier(0.1, 0, 0.1, 1)`;
    ticker.style.transform = `rotate(${finalRotation}deg)`;

    setTimeout(() => {
        showResult(isWin);
    }, state.speed);
}

function showResult(win) {
    const modal = document.getElementById('modal');
    const resDiv = document.getElementById('modal-res');
    modal.classList.remove('hidden');

    if (win) {
        resDiv.innerHTML = `
            <h2 class="text-7xl font-black text-yellow-500 italic mb-4">SUCCESS</h2>
            <img src="${state.selectedTarget.img}" class="w-64 mx-auto drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]">
            <p class="mt-4 font-black uppercase">${state.selectedTarget.name}</p>
            <button onclick="location.reload()" class="mt-10 bg-yellow-500 text-black px-12 py-4 rounded-2xl font-black uppercase">Collect Item</button>
        `;
    } else {
        resDiv.innerHTML = `
            <h2 class="text-7xl font-black text-red-600 italic mb-4">FAILED</h2>
            <p class="text-gray-500 font-bold uppercase">You lost everything</p>
            <button onclick="location.reload()" class="mt-10 border border-white/20 text-white px-12 py-4 rounded-2xl font-black uppercase">Try Again</button>
        `;
    }
}

init();
