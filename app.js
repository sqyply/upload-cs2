// app.js
let state = {
    selectedMy: null,
    selectedTarget: null,
    speed: 'slow',
    allSkins: []
};

window.addEventListener('DOMContentLoaded', async () => {
    initLiveDrop();
    if (TEST_CONFIG.enabled) {
        applyTestData();
    }
    await loadGlobalSkins();
});

// Наполнение ленты дропа (фейковые данные для вида)
function initLiveDrop() {
    const track = document.getElementById('live-drop-container');
    const fakeDrops = Array(40).fill(TEST_CONFIG.inventory[0]);
    track.innerHTML = fakeDrops.map(item => `
        <div class="drop-item">
            <img src="${item.img}" class="w-12 h-12 object-contain drop-shadow-lg">
        </div>
    `).join('') + track.innerHTML;
}

function applyTestData() {
    document.getElementById('nav-balance').innerText = TEST_CONFIG.user.balance.toLocaleString() + " SQ";
    document.getElementById('nav-username').innerText = TEST_CONFIG.user.username;
    document.getElementById('nav-level').innerText = TEST_CONFIG.user.level;
    
    // Профиль
    document.getElementById('prof-level').innerText = TEST_CONFIG.user.level;
    document.getElementById('prof-xp').innerText = TEST_CONFIG.user.xp;
    document.getElementById('xp-bar').style.width = (TEST_CONFIG.user.xp / 1000 * 100) + "%";
    document.getElementById('best-drop-img').src = TEST_CONFIG.bestDrop.img;
    document.getElementById('best-drop-name').innerText = TEST_CONFIG.bestDrop.name;
    document.getElementById('best-drop-price').innerText = TEST_CONFIG.bestDrop.price.toLocaleString() + " SQ";

    renderInventory(TEST_CONFIG.inventory);
}

async function loadGlobalSkins() {
    const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
    const data = await res.json();
    state.allSkins = data.slice(0, 100).map(s => ({
        name: s.name,
        img: s.image,
        price: Math.floor(Math.random() * 10000) + 100
    })).sort((a,b) => b.price - a.price);
    
    renderTargetList(state.allSkins);
}

function renderInventory(items) {
    const list = document.getElementById('inventory-list');
    list.innerHTML = items.map(item => `
        <div onclick="selectMy('${item.name}')" id="inv-${item.name}" class="skin-card p-4 rounded-3xl flex items-center gap-4 cursor-pointer">
            <img src="${item.img}" class="w-14 h-14 object-contain">
            <div>
                <div class="text-[10px] font-black uppercase text-gray-400 italic">${item.name}</div>
                <div class="text-yellow-500 font-black italic text-sm">${item.price.toLocaleString()} SQ</div>
            </div>
        </div>
    `).join('');
}

function renderTargetList(items) {
    const list = document.getElementById('target-list');
    list.innerHTML = items.map(item => `
        <div onclick="selectTarget('${item.name}')" id="target-${item.name}" class="skin-card p-4 rounded-3xl flex items-center gap-4 cursor-pointer">
            <img src="${item.img}" class="w-14 h-14 object-contain">
            <div>
                <div class="text-[10px] font-black uppercase text-gray-400 italic">${item.name}</div>
                <div class="text-yellow-500 font-black italic text-sm">${item.price.toLocaleString()} SQ</div>
            </div>
        </div>
    `).join('');
}

window.selectMy = (name) => {
    state.selectedMy = TEST_CONFIG.inventory.find(i => i.name === name);
    document.querySelectorAll('#inventory-list .skin-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`inv-${name}`).classList.add('selected');
    updateUpgradeLogic();
};

window.selectTarget = (name) => {
    state.selectedTarget = state.allSkins.find(i => i.name === name);
    document.querySelectorAll('#target-list .skin-card').forEach(el => el.classList.remove('selected'));
    document.getElementById(`target-${name}`).classList.add('selected');
    updateUpgradeLogic();
};

function updateUpgradeLogic() {
    if (state.selectedMy && state.selectedTarget) {
        let chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
        chance = Math.min(chance, 80).toFixed(1);
        
        document.getElementById('chance-display').innerText = chance + "%";
        const ring = document.getElementById('progress-ring');
        ring.style.strokeDashoffset = 1319 - (1319 * chance / 100);
        
        const btn = document.getElementById('upgrade-btn');
        btn.disabled = false;
        btn.innerText = `UPGRADE FOR ${state.selectedMy.price.toLocaleString()} SQ`;
    }
}

window.showPage = (p) => {
    document.getElementById('page-main').classList.toggle('hidden', p !== 'main');
    document.getElementById('page-profile').classList.toggle('hidden', p !== 'profile');
};

window.setSpeed = (s) => {
    state.speed = s;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.toggle('active', b.id === 'speed-'+s));
};
