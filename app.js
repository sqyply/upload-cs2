// app.js
let state = {
    selectedMy: null,
    selectedTarget: null,
    speed: 'slow'
};

window.addEventListener('DOMContentLoaded', async () => {
    initLiveDrop();
    if (TEST_CONFIG.enabled) {
        renderInventory(TEST_CONFIG.inventory);
        updateHeader(TEST_CONFIG);
        updateProfile(TEST_CONFIG);
    }
    await loadGlobalSkins();
});

// Живая лента
function initLiveDrop() {
    const track = document.getElementById('live-drop-track');
    // Создаем 20 фейковых дропов для красоты
    for(let i=0; i<40; i++) {
        const div = document.createElement('div');
        div.className = 'live-drop-item';
        div.innerHTML = `<img src="https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I5qAZ2N_TIW8LpMQAO6fREDoURo0389m3vB9Of8_SFvD_88uMBBwdLA9SvrulKAdp0P_fczpD7Y60xtSOxPKmZ-6Fwz9X7pYkiLyY99SmiVfsqhVvN23yJ9CcclRrZAnW_FS6x-fu0MK_6ZzNynBrvSAn-z-dyLqA_v56" class="w-8">`;
        track.appendChild(div);
    }
}

function updateHeader(data) {
    document.getElementById('nav-balance').innerText = data.balance.toLocaleString();
    document.getElementById('nav-level').innerText = data.level;
}

function updateProfile(data) {
    document.getElementById('prof-level').innerText = data.level;
    document.getElementById('prof-xp').innerText = data.xp;
    document.getElementById('xp-bar').style.width = (data.xp / 1000 * 100) + '%';
    document.getElementById('best-drop-img').src = data.bestDrop.img;
    document.getElementById('best-drop-name').innerText = data.bestDrop.name;
    document.getElementById('best-drop-price').innerText = data.bestDrop.price.toLocaleString() + " SQ";
}

// Загрузка скинов из API
async function loadGlobalSkins() {
    const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
    const data = await res.json();
    const targetList = document.getElementById('target-list');
    
    data.slice(0, 50).forEach(skin => {
        const div = document.createElement('div');
        div.className = 'p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 cursor-pointer hover:border-yellow-500/50 transition-all';
        div.innerHTML = `
            <img src="${skin.image}" class="w-10">
            <div>
                <div class="text-[9px] font-black uppercase text-gray-400">${skin.name}</div>
                <div class="text-yellow-500 font-black text-xs italic">${Math.floor(Math.random()*5000)} SQ</div>
            </div>
        `;
        targetList.appendChild(div);
    });
}

function renderInventory(items) {
    const invList = document.getElementById('inventory-list');
    invList.innerHTML = items.map(item => `
        <div class="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 cursor-pointer">
            <img src="${item.img}" class="w-10">
            <div>
                <div class="text-[9px] font-black uppercase text-gray-400">${item.name}</div>
                <div class="text-yellow-500 font-black text-xs italic">${item.price.toLocaleString()} SQ</div>
            </div>
        </div>
    `).join('');
}

window.showPage = (p) => {
    document.getElementById('page-main').classList.toggle('hidden', p !== 'main');
    document.getElementById('page-profile').classList.toggle('hidden', p !== 'profile');
};
