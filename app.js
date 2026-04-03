// app.js — Логика данных и событий
let state = {
    myItems: [],
    allSkins: [],
    selectedMy: null,
    selectedTarget: null,
    balance: 0
};

// Запуск
window.addEventListener('DOMContentLoaded', async () => {
    await loadSkins();
    initAuth();
});

async function loadSkins() {
    const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
    const data = await res.json();
    state.allSkins = data.map(s => ({
        name: s.name,
        img: s.image,
        price: Math.floor(Math.random() * 20000) + 50
    })).sort((a,b) => b.price - a.price);
    UI.renderSkins('target-list', state.allSkins, 'target');
}

function initAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).onSnapshot(doc => {
                const data = doc.data() || {};
                state.balance = data.balance || 0;
                state.myItems = data.inventory || [];
                updateGlobalUI();
            });
        }
    });
}

// Выбор предмета (вызывается из ui.js)
window.handleSelect = (item, type) => {
    if (type === 'my') state.selectedMy = item;
    else state.selectedTarget = item;

    if (state.selectedMy && state.selectedTarget) {
        let chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
        if (chance > 80) chance = 80;
        UI.updateCircle(chance);
        
        const btn = document.getElementById('upgrade-btn');
        btn.disabled = false;
        btn.innerText = `АПГРЕЙД ЗА ${state.selectedMy.price} SQ`;
    }

    UI.renderSkins('inventory-list', state.myItems, 'my', state.selectedMy);
    UI.renderSkins('target-list', state.allSkins, 'target', state.selectedTarget);
};

function updateGlobalUI() {
    document.getElementById('nav-balance').innerText = state.balance.toLocaleString();
    document.getElementById('profile-balance').innerText = state.balance.toLocaleString() + " SQ";
    UI.renderSkins('inventory-list', state.myItems, 'my', state.selectedMy);
}

// Обработка кнопки Апгрейда
document.getElementById('upgrade-btn').onclick = async () => {
    const chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
    const isWin = (Math.random() * 100) <= Math.min(chance, 80);
    
    // Тут должна быть логика обновления Firebase (удаление старого, добавление нового)
    // Но для начала просто покажем результат
    UI.showResult(isWin, state.selectedTarget);
};
