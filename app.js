let myItems = [];
let allSkins = [];
let selectedMy = null;
let selectedTarget = null;
let userBalance = 0;

// 1. Инициализация при загрузке
window.onload = async () => {
    await loadGlobalSkins();
    checkAuth();
};

// 2. Загрузка ВСЕХ скинов мира (API)
async function loadGlobalSkins() {
    try {
        const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
        const data = await res.json();
        allSkins = data.map(s => ({
            name: s.name,
            img: s.image,
            price: Math.floor(Math.random() * 50000) + 10 // Симуляция цен
        })).sort((a,b) => b.price - a.price);
        renderList('target-list', allSkins, 'target');
    } catch (e) { console.error("API Error", e); }
}

// 3. Проверка авторизации и данных юзера
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).onSnapshot(doc => {
                const data = doc.data() || {};
                userBalance = data.balance || 0;
                myItems = data.inventory || [];
                updateUI(data);
            });
        } else {
            // Если не залогинен, можно сделать редирект или показать кнопку входа
        }
    });
}

// 4. Отрисовка списков
function renderList(containerId, items, type, filter = "") {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const filtered = items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));

    filtered.slice(0, 50).forEach(item => {
        const div = document.createElement('div');
        div.className = `skin-card p-3 mb-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer flex items-center gap-3`;
        if((type === 'my' && selectedMy === item) || (type === 'target' && selectedTarget === item)) div.classList.add('selected');
        
        div.onclick = () => selectItem(item, type);
        div.innerHTML = `
            <img src="${item.img}" class="w-10 h-10 object-contain">
            <div class="overflow-hidden">
                <div class="text-[10px] font-bold truncate text-gray-300 uppercase">${item.name}</div>
                <div class="text-yellow-500 font-black text-xs">${item.price} SQ</div>
            </div>
        `;
        container.appendChild(div);
    });
}

// 5. Логика выбора и шанса
function selectItem(item, type) {
    if (type === 'my') selectedMy = item;
    else selectedTarget = item;
    
    const ring = document.getElementById('progress-ring');
    const chanceDisplay = document.getElementById('chance-display');
    const btn = document.getElementById('upgrade-btn');

    if (selectedMy && selectedTarget) {
        let chance = (selectedMy.price / selectedTarget.price) * 100;
        if (chance > 80) chance = 80;
        if (chance < 0.1) chance = 0.1;

        chanceDisplay.innerText = chance.toFixed(1) + "%";
        
        // Рисуем кольцо (длина 1130)
        const offset = 1130 - (1130 * chance) / 100;
        ring.style.strokeDashoffset = offset;
        
        btn.disabled = false;
        btn.innerText = `АПГРЕЙДНУТЬ ЗА ${selectedMy.price} SQ`;
    }
    
    renderList('inventory-list', myItems, 'my');
    renderList('target-list', allSkins, 'target');
}

// 6. Навигация
function showPage(page) {
    document.getElementById('page-main').style.display = page === 'main' ? 'grid' : 'none';
    document.getElementById('page-profile').style.display = page === 'profile' ? 'block' : 'none';
}

function updateUI(data) {
    document.getElementById('nav-balance').innerText = userBalance;
    document.getElementById('profile-balance').innerText = userBalance + " SQ";
    document.getElementById('user-name').innerText = data.name || "Профиль";
    renderList('inventory-list', myItems, 'my');
}

// Поиск
document.getElementById('target-search').oninput = (e) => renderList('target-list', allSkins, 'target', e.target.value);
document.getElementById('inv-search').oninput = (e) => renderList('inventory-list', myItems, 'my', e.target.value);
