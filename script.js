// === ВСТАВЬ СЮДА СВОЙ КОНФИГ ИЗ FIREBASE ===
const firebaseConfig = {
    apiKey: "AIzaSyD8-CEB-HZMouwx_HLGmPfnOOD5HmF3nUM",
    authDomain: "upload-cs2.firebaseapp.com",
    projectId: "upload-cs2",
    storageBucket: "upload-cs2.firebasestorage.app",
    messagingSenderId: "611922955960",
    appId: "1:611922955960:web:c9b87c819075e33446ae4d"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Данные
let userData = null;
let selectedMySkin = null;
let selectedTargetSkin = null;
let isRolling = false;
let speedMode = 'slow'; // default speed

const config = {
    slow: { duration: 8000, spins: 6 },
    fast: { duration: 3000, spins: 10 },
    instant: { duration: 300, spins: 2 }
};

// База скинов для целей
const allSkins = [
    { name: "AWP | Dragon Lore", price: 1250000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrY6i2lHj-ERvY273co-SclA8YVvS_FLsl73ng5S9v8zMmHBu73I8pSGKgf9f_6M" },
    { name: "AK-47 | Fire Serpent", price: 95000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppUp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" },
    { name: "M4A4 | Howl", price: 550000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjx2jJemkV09_km460m_7zO6-fzj9V7cAl2eySpt-m21Xh8kY4Mm_zLITAdlU2aV6F-lS5xeu5hJW6ucvJy3Zqv3In7XvD30vg9fsh6mY" },
    { name: "Butterfly Knife", price: 180000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYi59_9Szh4S0g_7zO6-fzzxUuJFz3-qSrd2tjge2_RE9a2DycI-Sd1VvYF3VqVPrwb_rjZXpv8idm3VgvXNw4S7D30vgvN9mAtM" }
];

// Колесо
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

function drawWheel(rotation = 0, chance = 0) {
    const size = 500, cx = 250, cy = 250, r = 235;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Подложка
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#11111a';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Сектор выигрыша
    if (chance > 0) {
        const angle = (Math.PI * 2) * (chance / 100);
        ctx.beginPath();
        // Центрируем сектор относительно 0 (под палочкой сверху)
        ctx.arc(0, 0, r, -angle/2, angle/2); 
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();
}

// Утилиты
function getStatus(balance) {
    if (balance >= 500000) return "SQ-АРИСТОКРАТ";
    if (balance >= 100000) return "SQ-МАГНАТ";
    if (balance >= 10000) return "SQ-ФАРМИЛА";
    return "НОВИЧОК";
}

function updateChanceUI() {
    if (!selectedMySkin || !selectedTargetSkin) return;
    const chance = Math.min(((selectedMySkin.price / selectedTargetSkin.price) * 100), 100).toFixed(2);
    document.getElementById('chance-display').innerText = chance + '%';
    document.getElementById('roll-btn').disabled = false;
    document.getElementById('roll-btn').innerText = `ЗАПУСТИТЬ ЗА ${selectedMySkin.price.toLocaleString()} SQ`;
    drawWheel(0, chance);
}

// Модалки
function toggleModal(type, show) {
    if (type === 'auth') document.getElementById('auth-modal').classList.toggle('hidden', !show);
    if (type === 'profile') document.getElementById('profile-modal').classList.toggle('hidden', !show);
    if (type === 'result') document.getElementById('result-overlay').classList.toggle('hidden', !show);
}

// Авторизация
async function handleAuth(type) {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    try {
        if (type === 'register') {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            await db.collection('users').doc(res.user.uid).set({
                balance: 1000,
                inventory: [
                    { name: "P250 | Sand Dune", price: 5, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposvupPANzhjx2jJkV092lnYmGmOHLP7LWnn8f65dwj7_E8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" }
                ]
            });
        } else {
            await auth.signInWithEmailAndPassword(email, pass);
        }
    } catch (e) { alert("Ошибка: " + e.message); }
}

auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('users').doc(user.uid).onSnapshot(doc => {
            userData = doc.data();
            renderUI();
        });
        document.getElementById('user-bar').classList.remove('hidden');
        toggleModal('auth', false);
    } else {
        toggleModal('auth', true);
    }
});

function renderUI() {
    const bal = userData.balance.toLocaleString();
    const status = getStatus(userData.balance);
    const name = auth.currentUser.email.split('@')[0].toUpperCase();

    // Шапка
    document.getElementById('user-balance').innerText = bal;
    document.getElementById('user-status-nav').innerText = status;
    document.getElementById('nav-avatar-placeholder').innerText = name[0];

    // Модалка Профиля
    document.getElementById('profile-name').innerText = name;
    document.getElementById('profile-status').innerText = status;
    document.getElementById('profile-avatar-placeholder').innerText = name[0];

    // Рендер инвентаря
    renderInventory('inventory', userData.inventory);
    // Рендер целей
    renderInventory('target-list', allSkins, true);
}

function renderInventory(id, items, isTarget = false) {
    const grid = document.getElementById(id);
    const filter = document.getElementById(id === 'inventory' ? 'filter-inv' : 'filter-target').value.toLowerCase();
    grid.innerHTML = '';
    
    items.forEach((item, idx) => {
        if (item.name.toLowerCase().includes(filter)) {
            grid.innerHTML += `
                <div onclick="${isTarget ? `selectTarget(${idx})` : `selectMySkin(${idx})`}" class="item-card ${isTarget ? 'p-3' : 'p-5'} rounded-2xl cursor-pointer ${ (isTarget ? selectedTargetSkin?.name : selectedMySkin?.name) === item.name ? 'selected' : ''}">
                    <img src="${item.img}" class="${isTarget ? 'w-12 h-12' : 'w-24 h-24'} mx-auto object-contain">
                    <div class="text-[9px] font-bold text-gray-500 uppercase mt-3 truncate">${item.name}</div>
                    <div class="text-white font-black text-lg mt-1">${item.price.toLocaleString()} SQ</div>
                </div>
            `;
        }
    });
}

function selectMySkin(idx) { selectedMySkin = userData.inventory[idx]; updateChanceUI(); renderUI(); }
function selectTarget(idx) { selectedTargetSkin = allSkins[idx]; updateChanceUI(); renderUI(); }

function setSpeed(mode) {
    speedMode = mode;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`speed-${mode}`).classList.add('active');
}

// Крутилка
document.getElementById('roll-btn').onclick = async () => {
    if (isRolling) return;
    isRolling = true;
    
    const chance = parseFloat(document.getElementById('chance-display').innerText);
    const settings = config[speedMode];
    
    // Результат определяется СРАЗУ
    const win = Math.random() * 100 <= chance;
    const spins = settings.spins;
    
    // Математика физики выигрыша (Механика: выигрыш только если сектор под стрелкой сверху в момент остановки)
    const angleSize = (Math.PI * 2) * (chance / 100);
    const startAngleWin = -angleSize/2;
    const endAngleWin = angleSize/2;
    
    // Рандомный угол внутри сектора выигрыша (или вне)
    const targetAngle = win 
        ? (Math.random() * (endAngleWin - startAngleWin) + startAngleWin) // В желтом секторе
        : (Math.random() * (Math.PI * 2 - angleSize)) + angleSize/2; // В сером треке
    
    // Финальное вращение = Полные круги + угол остановки (чтобы палочка сверху совпала с сектором)
    const finalRotation = (Math.PI * 2 * spins) - targetAngle;

    // Анимация
    const start = performance.now();
    const duration = settings.duration;

    function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Custom Ease-Out Custom (5s duration)
        const ease = 1 - Math.pow(1 - progress, 5); 
        const rotation = finalRotation * ease;
        
        drawWheel(rotation, chance);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isRolling = false;
            showResult(win);
        }
    }
    requestAnimationFrame(animate);
};

function showResult(win) {
    const title = document.getElementById('result-title');
    const desc = document.getElementById('result-desc');
    
    if (win) {
        title.innerText = "ПОБЕДА";
        title.classList.add('text-yellow-500');
        desc.innerText = `${selectedTargetSkin.name} зачислен в твой инвентарь.`;
        // Логика обновления инвентаря в Firebase (удаление старого, добавление нового)
    } else {
        title.innerText = "ПРОИГРЫШ";
        title.classList.remove('text-yellow-500');
        desc.innerText = `${selectedMySkin.name} сгорел. Попробуй ещё раз!`;
        // Логика обновления инвентаря в Firebase (удаление старого)
    }
    toggleModal('result', true);
}

// Фильтры
document.getElementById('filter-inv').oninput = renderUI;
document.getElementById('filter-target').oninput = renderUI;

// Аватар и Фри Скин (Временные функции для теста в боевом режиме)
async function updateAvatar() {
    const url = document.getElementById('avatar-input').value;
    if(url) await db.collection('users').doc(auth.currentUser.uid).update({ avatarUrl: url });
}
async function addFreeSkin() {
    // Временная заглушка
    alert("Получение фри скина пока недоступно в боевом режиме.");
}

drawWheel(0, 0);
