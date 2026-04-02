// === ВСТАВЬ СЮДА СВОЙ КОНФИГ ИЗ FIREBASE ===
const firebaseConfig = {
    apiKey: "AIzaSyD8-CEB-HZMouwx_HLGmPfnOOD5HmF3nUM",
    authDomain: "upload-cs2.firebaseapp.com",
    projectId: "upload-cs2",
    storageBucket: "upload-cs2.firebasestorage.app",
    messagingSenderId: "611922955960",
    appId: "1:611922955960:web:c9b87c819075e33446ae4d"
};

// ... (Сюда вставь свой Firebase Config из прошлого кода) ...

const auth = firebase.auth();
const db = firebase.firestore();

let userData = null;
let selectedMySkin = null;
let selectedTargetSkin = null;
let allGameSkins = []; // База всех скинов игры

// Загрузка всех скинов из API CS2
async function loadGlobalSkins() {
    try {
        // Используем открытое API для получения списка скинов
        const response = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
        const data = await response.json();
        
        // Фильтруем только нужные данные и убираем слишком дешевый мусор
        allGameSkins = data.filter(s => s.price > 1).map(s => ({
            name: s.name,
            price: Math.floor(Math.random() * 50000) + 10, // Цена пока рандом, т.к. API цен отдельное
            img: s.image,
            rarity: s.rarity.name
        })).sort((a,b) => b.price - a.price);

        renderTargetList();
    } catch (e) {
        console.error("Ошибка загрузки скинов:", e);
    }
}

// Навигация
function goHome() {
    document.getElementById('main-page').classList.remove('hidden');
    document.getElementById('profile-page').classList.add('hidden');
}

function toggleProfile(show) {
    if(show) {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('profile-page').classList.remove('hidden');
        renderHistory();
        renderBestDrop();
    } else {
        goHome();
    }
}

// Рендер целей (с фильтром)
function renderTargetList() {
    const list = document.getElementById('target-list');
    const search = document.getElementById('search-target').value.toLowerCase();
    list.innerHTML = '';

    allGameSkins.forEach(skin => {
        if(skin.name.toLowerCase().includes(search)) {
            const div = document.createElement('div');
            div.className = `item-card p-4 rounded-2xl cursor-pointer flex items-center gap-4 ${selectedTargetSkin?.name === skin.name ? 'selected' : ''}`;
            div.onclick = () => { selectedTargetSkin = skin; updateUI(); renderTargetList(); };
            div.innerHTML = `
                <img src="${skin.img}" class="w-12 h-12 object-contain">
                <div>
                    <div class="text-[10px] font-bold text-gray-500 uppercase">${skin.name}</div>
                    <div class="text-white font-black">${skin.price.toLocaleString()} SQ</div>
                </div>
            `;
            list.appendChild(div);
        }
    });
}

// История и Лучший Дроп
function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    
    const history = userData.history || [];
    if(history.length === 0) {
        list.innerHTML = '<div class="text-center text-gray-600 mt-20 font-bold uppercase italic">История пуста</div>';
        return;
    }

    history.slice().reverse().forEach(game => {
        list.innerHTML += `
            <div class="bg-white/5 p-4 rounded-2xl flex justify-between items-center border-l-4 ${game.win ? 'border-green-500' : 'border-red-500'}">
                <div class="flex items-center gap-4">
                    <img src="${game.item.img}" class="w-10 h-10 object-contain">
                    <div>
                        <div class="text-xs font-black uppercase">${game.item.name}</div>
                        <div class="text-[9px] text-gray-500">${game.date}</div>
                    </div>
                </div>
                <div class="font-black ${game.win ? 'text-green-500' : 'text-red-500'} uppercase">
                    ${game.win ? 'Победа' : 'Слив'}
                </div>
            </div>
        `;
    });
}

function renderBestDrop() {
    const box = document.getElementById('best-drop');
    const history = userData.history || [];
    const wins = history.filter(h => h.win).sort((a,b) => b.item.price - a.item.price);

    if(wins.length > 0) {
        const best = wins[0].item;
        box.innerHTML = `
            <img src="${best.img}" class="w-16 h-16 object-contain">
            <div>
                <div class="text-sm font-black uppercase text-yellow-500">${best.name}</div>
                <div class="text-xs font-bold text-gray-400">${best.price.toLocaleString()} SQ</div>
            </div>
        `;
    }
}

// Модифицированная функция выигрыша (с записью в историю)
async function handleRollResult(win) {
    const historyEntry = {
        win: win,
        item: selectedTargetSkin,
        date: new Date().toLocaleString('ru-RU'),
        cost: selectedMySkin.price
    };

    let newInventory = [...userData.inventory];
    let newHistory = userData.history || [];
    newHistory.push(historyEntry);

    if(win) {
        // Добавляем выигрыш, удаляем старую шмотку
        newInventory = newInventory.filter(i => i.name !== selectedMySkin.name);
        newInventory.push(selectedTargetSkin);
    } else {
        // Удаляем сгоревшую шмотку
        newInventory = newInventory.filter(i => i.name !== selectedMySkin.name);
    }

    await db.collection('users').doc(auth.currentUser.uid).update({
        inventory: newInventory,
        history: newHistory
    });

    showVisualResult(win);
}

// Запуск при старте
loadGlobalSkins();
// ... (Остальная логика колеса и фильтра инвентаря из прошлого сообщения) ...
