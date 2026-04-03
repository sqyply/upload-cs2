// app.js
const CONFIG = {
    testMode: true,
    user: { name: 'JACK_BOSS', balance: 1000000.0, avatar: 'J' },
    mySkins: [
        { id: 1, name: 'AK-47 | Safari Mesh', price: 10, img: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' },
        { id: 2, name: 'AWP | Dragon Lore', price: 1250000, img: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' },
        { id: 3, name: 'Butterfly | Doppler', price: 180000, img: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' }
    ]
};

let state = {
    selectedMy: null,
    selectedTarget: null,
    chance: 0,
    speed: 'slow',
    isUpgrading: false
};

// Инициализация
window.onload = async () => {
    updateUI();
    renderGrids();
    initHistory();
};

function updateUI() {
    document.getElementById('user-balance').innerText = CONFIG.user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 });
    document.getElementById('display-name').innerText = CONFIG.user.name;
    document.getElementById('user-avatar').innerText = CONFIG.user.avatar;
}

function renderGrids() {
    const myGrid = document.getElementById('grid-my');
    myGrid.innerHTML = CONFIG.mySkins.map(item => `
        <div class="item-card" onclick="selectMy(${item.id})" id="my-${item.id}">
            <img src="${item.img}" class="w-full h-16 object-contain mb-2">
            <div class="text-[9px] font-bold text-gray-500 uppercase truncate">${item.name}</div>
            <div class="text-xs font-black italic text-yellow-500 mt-1">${item.price.toLocaleString()} SQ</div>
        </div>
    `).join('');

    // Фейковый магазин (можно подключить реальное API позже)
    const shopGrid = document.getElementById('grid-shop');
    const shopItems = [
        { id: 101, name: 'M4A4 | Howl', price: 550000, img: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' },
        { id: 102, name: 'AWP | Gungnir', price: 1350000, img: 'https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56' }
    ];
    shopGrid.innerHTML = shopItems.map(item => `
        <div class="item-card" onclick="selectTarget(${item.id})" id="shop-${item.id}">
            <img src="${item.img}" class="w-full h-16 object-contain mb-2">
            <div class="text-[9px] font-bold text-gray-500 uppercase truncate">${item.name}</div>
            <div class="text-xs font-black italic text-yellow-500 mt-1">${item.price.toLocaleString()} SQ</div>
        </div>
    `).join('');
}

window.selectMy = (id) => {
    state.selectedMy = CONFIG.mySkins.find(i => i.id === id);
    document.querySelectorAll('#grid-my .item-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`my-${id}`).classList.add('selected');
    
    document.getElementById('selected-my-container').classList.add('hidden');
    document.getElementById('selected-my-item').classList.remove('hidden');
    document.getElementById('my-item-img').src = state.selectedMy.img;
    document.getElementById('my-item-name').innerText = state.selectedMy.name;
    document.getElementById('my-item-price').innerText = state.selectedMy.price.toLocaleString() + ' SQ';
    
    calculateChance();
};

window.selectTarget = (id) => {
    // В реале тут будет поиск по массиву магазина
    state.selectedTarget = { id: 101, name: 'M4A4 | Howl', price: 550000, img: '...' }; // Упрощено для примера
    calculateChance();
};

function calculateChance() {
    if (state.selectedMy && state.selectedTarget) {
        state.chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
        state.chance = Math.min(state.chance, 95).toFixed(2);
        
        document.getElementById('chance-text').innerText = state.chance + '%';
        const ring = document.getElementById('ring-progress');
        const offset = 1036 - (1036 * state.chance / 100);
        ring.style.strokeDashoffset = offset;
        
        document.getElementById('btn-execute').disabled = false;
    }
}

document.getElementById('btn-execute').onclick = () => {
    if (state.isUpgrading) return;
    state.isUpgrading = true;
    document.getElementById('btn-execute').disabled = true;
    
    const ticker = document.getElementById('ticker');
    ticker.classList.remove('hidden');
    
    // Результат (0 - 100)
    const resultPoint = Math.random() * 100;
    const isWin = resultPoint <= state.chance;
    const finalRotation = 360 * 5 + (resultPoint * 3.6); // 5 полных оборотов + точка
    
    ticker.style.transform = `rotate(${finalRotation}deg)`;
    
    setTimeout(() => {
        showResult(isWin);
    }, 3200);
};

function showResult(win) {
    const modal = document.getElementById('result-modal');
    const title = document.getElementById('result-title');
    
    modal.classList.remove('hidden');
    if (win) {
        title.innerText = 'WIN';
        title.className = 'text-[120px] font-black italic text-yellow-500 italic mb-4 win-animate';
        document.getElementById('result-img').src = state.selectedTarget.img;
        document.getElementById('result-name').innerText = state.selectedTarget.name;
    } else {
        title.innerText = 'LOSE';
        title.className = 'text-[120px] font-black italic text-red-600 italic mb-4';
        document.getElementById('result-img').src = state.selectedMy.img;
        document.getElementById('result-name').innerText = 'Items lost in test mode';
    }
}

window.closeModal = () => {
    location.reload(); // Для теста просто ресет
};
