let state = {
    balance: 0,
    inventory: [],
    allSkins: [],
    selectedMy: null,
    selectedTarget: null,
    speed: 'slow',
    level: 1,
    xp: 0
};

// Инициализация
window.addEventListener('DOMContentLoaded', async () => {
    if (typeof TEST_CONFIG !== 'undefined' && TEST_CONFIG.enabled) {
        state.balance = TEST_CONFIG.balance;
        state.inventory = TEST_CONFIG.inventory;
        state.level = TEST_CONFIG.level;
        state.xp = TEST_CONFIG.xp;
    }
    
    await loadDatabase();
    updateUI();
});

async function loadDatabase() {
    // Симуляция загрузки базы
    const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
    const data = await res.json();
    state.allSkins = data.slice(0, 100).map(s => ({
        name: s.name,
        price: Math.floor(Math.random() * 50000) + 100,
        img: s.image
    })).sort((a,b) => b.price - a.price);
    UI.renderSkins('target-list', state.allSkins, 'target');
}

window.setSpeed = (s) => {
    state.speed = s;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', b.id === 'speed-'+s));
};

window.setChancePreset = (percent) => {
    if (!state.selectedMy) return alert("Выбери свой скин!");
    const targetPrice = state.selectedMy.price / (percent / 100);
    const closest = state.allSkins.reduce((prev, curr) => Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev);
    window.handleSelect(closest.name, 'target');
};

window.handleSelect = (name, type) => {
    const skin = type === 'my' ? state.inventory.find(s => s.name === name) : state.allSkins.find(s => s.name === name);
    if (type === 'my') state.selectedMy = skin;
    else state.selectedTarget = skin;

    if (state.selectedMy && state.selectedTarget) {
        let chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
        chance = Math.min(chance, 80);
        UI.updateCircle(chance);
        const btn = document.getElementById('upgrade-btn');
        btn.disabled = false;
        btn.innerText = `АПГРЕЙД ЗА ${state.selectedMy.price} SQ`;
    }
    updateUI();
};

function updateUI() {
    document.getElementById('nav-balance').innerText = state.balance.toLocaleString();
    document.getElementById('user-level').innerText = state.level;
    document.getElementById('user-xp').innerText = state.xp;
    document.getElementById('xp-bar').style.width = (state.xp / 1000 * 100) + '%';
    
    UI.renderSkins('inventory-list', state.inventory, 'my', state.selectedMy);
    UI.renderSkins('target-list', state.allSkins, 'target', state.selectedTarget);
}
