// app.js
let state = {
    selectedMy: null,
    selectedTarget: null,
    inventory: [],
    shop: [],
    balance: 500.25,
    speed: 'slow'
};

window.onload = async () => {
    // 1. Инициализация баланса и юзера
    updateUI();
    
    // 2. Тестовый инвентарь (если пустой)
    state.inventory = [
        { id: 100, name: 'AK-47 | Safari Mesh', price: 1.20, img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' },
        { id: 101, name: 'AWP | Asiimov', price: 150.00, img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' }
    ];

    // 3. Загрузка ВСЕХ скинов из API
    await loadShop();
    renderInventory();
    initHistory();
};

async function loadShop() {
    const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
    const data = await res.json();
    state.shop = data.slice(0, 200).map(s => ({
        name: s.name,
        price: Math.floor(Math.random() * 5000) + 1, // Фейк цена, т.к. в API нет цен
        img: s.image
    }));
    renderShop(state.shop);
}

function renderInventory() {
    const grid = document.getElementById('grid-my');
    grid.innerHTML = state.inventory.map(item => `
        <div class="item-mini-card" onclick="selectMy(${item.id})" id="my-${item.id}">
            <img src="${item.img}" class="w-full h-10 object-contain mb-2">
            <div class="text-[8px] font-bold text-gray-500 truncate italic">${item.name}</div>
            <div class="text-[10px] font-black text-yellow-500 mt-1">${item.price} SQ</div>
            <button onclick="sellItem(${item.id}, event)" class="text-[8px] text-red-500/50 hover:text-red-500 uppercase mt-2 font-black">Sell</button>
        </div>
    `).join('');
}

function renderShop(items) {
    const grid = document.getElementById('grid-shop');
    grid.innerHTML = items.map(item => `
        <div class="item-mini-card" onclick="selectTarget('${item.name}')" id="shop-${item.name}">
            <img src="${item.img}" class="w-full h-10 object-contain mb-2">
            <div class="text-[8px] font-bold text-gray-500 truncate italic">${item.name}</div>
            <div class="text-[10px] font-black text-yellow-500 mt-1">${item.price} SQ</div>
        </div>
    `).join('');
}

// Продажа одного
window.sellItem = (id, e) => {
    e.stopPropagation();
    const item = state.inventory.find(i => i.id === id);
    state.balance += item.price;
    state.inventory = state.inventory.filter(i => i.id !== id);
    updateUI();
    renderInventory();
};

// Продажа ВСЕХ
window.sellAllItems = () => {
    const total = state.inventory.reduce((acc, i) => acc + i.price, 0);
    state.balance += total;
    state.inventory = [];
    updateUI();
    renderInventory();
};

window.selectMy = (id) => {
    state.selectedMy = state.inventory.find(i => i.id === id);
    document.querySelectorAll('#grid-my .item-mini-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`my-${id}`).classList.add('selected');
    calculate();
};

window.selectTarget = (name) => {
    state.selectedTarget = state.shop.find(i => i.name === name);
    document.querySelectorAll('#grid-shop .item-mini-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`shop-${name}`).classList.add('selected');
    calculate();
};

function calculate() {
    if(state.selectedMy && state.selectedTarget) {
        let chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
        chance = Math.min(chance, 85).toFixed(2);
        document.getElementById('chance-text').innerText = chance + '%';
        const ring = document.getElementById('ring-progress');
        ring.style.strokeDashoffset = 911 - (911 * chance / 100);
        document.getElementById('btn-execute').disabled = false;
        document.getElementById('btn-execute').innerText = `Upgrade (${state.selectedMy.price} → ${state.selectedTarget.price})`;
    }
}

function updateUI() {
    document.getElementById('user-balance').innerText = state.balance.toFixed(2);
}

function initHistory() {
    const track = document.getElementById('live-history');
    const items = Array(30).fill('<div class="history-item"><img src="https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56" class="w-full h-full object-contain"></div>');
    track.innerHTML = items.join('') + items.join('');
}

window.showPage = (p) => {
    document.getElementById('page-main').classList.toggle('hidden', p !== 'main');
    document.getElementById('page-profile').classList.toggle('hidden', p !== 'profile');
};
