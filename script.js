// === ВСТАВЬ СЮДА СВОЙ КОНФИГ ИЗ FIREBASE ===
const firebaseConfig = {
    apiKey: "AIzaSyD8-CEB-HZMouwx_HLGmPfnOOD5HmF3nUM",
    authDomain: "upload-cs2.firebaseapp.com",
    projectId: "upload-cs2",
    storageBucket: "upload-cs2.firebasestorage.app",
    messagingSenderId: "611922955960",
    appId: "1:611922955960:web:c9b87c819075e33446ae4d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let userData = null;
let selectedMySkin = null;
let selectedTargetSkin = null;
let isRolling = false;

// Огромный список скинов для выбора цели
const targetSkins = [
    { name: "AWP | Dragon Lore", price: 1250000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrY6i2lHj-ERvY273co-SclA8YVvS_FLsl73ng5S9v8zMmHBu73I8pSGKgf9f_6M" },
    { name: "AK-47 | Fire Serpent", price: 95000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppUp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" },
    { name: "M4A4 | Howl", price: 550000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjx2jJemkV09_km460m_7zO6-fzj9V7cAl2eySpt-m21Xh8kY4Mm_zLITAdlU2aV6F-lS5xeu5hJW6ucvJy3Zqv3In7XvD30vg9fsh6mY" },
    { name: "Knife | Butterfly Doppler", price: 180000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYi59_9Szh4S0g_7zO6-fzzxUuJFz3-qSrd2tjge2_RE9a2DycI-Sd1VvYF3VqVPrwb_rjZXpv8idm3VgvXNw4S7D30vgvN9mAtM" },
    { name: "USP-S | Kill Confirmed", price: 15000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrbcumRd5MpZmOzA-LP5gVO8v11rMT_6JtWUcwE2ZVmFr1S_xL3qh5_u6Z2azyRkvSAn-z-DyLv9S_47" }
];

const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

function drawWheel(rotation = 0, chance = 0) {
    const cx = 250, cy = 250, r = 235;
    ctx.clearRect(0, 0, 500, 500);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Внешнее кольцо
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#11111a';
    ctx.lineWidth = 18;
    ctx.stroke();

    // Сектор выигрыша
    if (chance > 0) {
        const angle = (Math.PI * 2) * (chance / 100);
        ctx.beginPath();
        ctx.arc(0, 0, r, -angle/2, angle/2);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 18;
        ctx.lineCap = 'round';
        ctx.stroke();
    }
    ctx.restore();
}

// Табы
function switchTab(tab) {
    document.getElementById('tab-upgrade').classList.toggle('hidden', tab !== 'upgrade');
    document.getElementById('tab-profile').classList.toggle('hidden', tab !== 'profile');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('text-yellow-500'));
    document.getElementById(`link-${tab}`).classList.add('text-yellow-500');
}

// Авторизация (SQ-Коины при регистрации)
async function handleAuth(type) {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    try {
        if (type === 'register') {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            await db.collection('users').doc(res.user.uid).set({
                balance: 1000, // Дарим 1000 SQ при входе
                inventory: [
                    { name: "P250 | Песчаные дюны", price: 50, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposvupPANzhjx2jJkV092lnYmGmOHLP7LWnn8f65dwj7_E8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" }
                ]
            });
        } else {
            await auth.signInWithEmailAndPassword(email, pass);
        }
        toggleAuthModal(false);
    } catch (e) { alert("Ошибка: " + e.message); }
}

auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('users').doc(user.uid).onSnapshot(doc => {
            userData = doc.data();
            renderUI();
        });
        document.getElementById('user-bar').classList.remove('hidden');
        toggleAuthModal(false);
    } else {
        toggleAuthModal(true);
    }
});

function renderUI() {
    const bal = userData.balance.toLocaleString();
    document.getElementById('user-balance').innerText = bal;
    document.getElementById('profile-balance').innerText = bal;
    const name = auth.currentUser.email.split('@')[0].toUpperCase();
    document.getElementById('user-name').innerText = name;
    document.getElementById('profile-name').innerText = name;
    document.getElementById('user-avatar-initial').innerText = name[0];
    document.getElementById('profile-avatar').innerText = name[0];

    // Мой инвентарь
    const inv = document.getElementById('inventory');
    inv.innerHTML = '';
    userData.inventory.forEach((item, idx) => {
        inv.innerHTML += `
            <div onclick="selectMySkin(${idx})" class="item-card bg-[#11111a] p-5 rounded-[1.5rem] border border-white/5 cursor-pointer transition-all ${selectedMySkin?.idx === idx ? 'border-yellow-500 bg-yellow-500/5' : ''}">
                <img src="${item.img}" class="w-24 mx-auto drop-shadow-2xl">
                <div class="text-[9px] font-black text-gray-500 uppercase mt-4 tracking-tighter truncate">${item.name}</div>
                <div class="text-white font-black text-lg mt-1">${item.price.toLocaleString()} SQ</div>
            </div>
        `;
    });

    // Список целей
    const tList = document.getElementById('target-list');
    tList.innerHTML = '';
    targetSkins.forEach((item, idx) => {
        tList.innerHTML += `
            <div onclick="selectTargetSkin(${idx})" class="bg-[#11111a]/50 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-yellow-500/30 transition-all ${selectedTargetSkin?.name === item.name ? 'border-yellow-500 bg-yellow-500/5' : ''}">
                <div class="flex items-center gap-4">
                    <img src="${item.img}" class="w-12">
                    <div class="text-left">
                        <div class="text-[10px] font-bold text-white truncate w-32">${item.name}</div>
                        <div class="text-yellow-500 font-black text-xs">${item.price.toLocaleString()} SQ</div>
                    </div>
                </div>
            </div>
        `;
    });
}

function selectMySkin(idx) { selectedMySkin = { ...userData.inventory[idx], idx }; updateChance(); }
function selectTargetSkin(idx) { selectedTargetSkin = targetSkins[idx]; updateChance(); }

function updateChance() {
    if (!selectedMySkin || !selectedTargetSkin) return;
    const chance = Math.min(((selectedMySkin.price / selectedTargetSkin.price) * 100), 100).toFixed(2);
    document.getElementById('chance-display').innerText = chance + '%';
    document.getElementById('roll-btn').disabled = false;
    drawWheel(0, chance);
}

document.getElementById('roll-btn').onclick = () => {
    if (isRolling) return;
    isRolling = true;
    const chance = parseFloat(document.getElementById('chance-display').innerText);
    const win = Math.random() * 100 <= chance;
    const finalRotation = (Math.PI * 2 * 10) - (win ? 0 : Math.PI); // Упрощенная анимация для примера

    const start = performance.now();
    function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / 5000, 1);
        const ease = 1 - Math.pow(1 - progress, 5);
        drawWheel(finalRotation * ease, chance);
        if (progress < 1) requestAnimationFrame(animate);
        else {
            isRolling = false;
            alert(win ? "ПОБЕДА! Скин зачислен." : "НЕУДАЧА. Скин сгорел.");
        }
    }
    requestAnimationFrame(animate);
};

function toggleAuthModal(s) { document.getElementById('auth-modal').classList.toggle('hidden', !s); }

drawWheel(0, 0);
// Переключение меню
function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    menu.classList.toggle('hidden');
}

// Закрытие меню при клике мимо
window.onclick = function(event) {
    if (!event.target.closest('#user-bar')) {
        document.getElementById('profile-menu').classList.add('hidden');
    }
}

// Система статусов в зависимости от "депа" (баланса для тестов)
function getStatus(balance) {
    if (balance >= 500000) return "SQ-АРИСТОКРАТ";
    if (balance >= 100000) return "SQ-МАГНАТ";
    if (balance >= 10000) return "SQ-ФАРМИЛА";
    return "НОВИЧОК";
}

// Обновление аватара
async function updateAvatar() {
    const url = document.getElementById('avatar-input').value;
    if (!url) return;
    
    await db.collection('users').doc(auth.currentUser.uid).update({
        avatarUrl: url
    });
    alert("Аватар обновлен!");
}

// ФУНКЦИЯ ФРИ СКИНА (для тестов)
async function addFreeSkin() {
    const freeSkin = {
        name: "Glock-18 | High Beam",
        price: 150,
        img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKAxf0Ob3fDJ9_86nkL-HnvD8J_WDkm4GvZEi2L3D992s2Abm_UduY27ycY-Vcw9vYV_R-Vfsx7y908S-u8zNynU2pGB8slvV66mX"
    };

    await db.collection('users').doc(auth.currentUser.uid).update({
        inventory: firebase.firestore.FieldValue.arrayUnion(freeSkin)
    });
    alert("Бесплатный скин добавлен в инвентарь!");
}

// Обнови функцию renderUI, чтобы она подтягивала аватар и статус
function renderUI() {
    if (!userData) return;
    
    const balance = userData.balance;
    const status = getStatus(balance);
    const name = auth.currentUser.email.split('@')[0].toUpperCase();

    // Шапка и меню
    document.getElementById('user-balance').innerText = balance.toLocaleString();
    document.getElementById('menu-user-name').innerText = name;
    document.getElementById('menu-user-status').innerText = status;

    // Логика аватара
    const navImg = document.getElementById('nav-avatar-img');
    const navPlaceholder = document.getElementById('nav-avatar-placeholder');
    
    if (userData.avatarUrl) {
        navImg.src = userData.avatarUrl;
        navImg.classList.remove('hidden');
        navPlaceholder.classList.add('hidden');
    } else {
        navImg.classList.add('hidden');
        navPlaceholder.classList.remove('hidden');
        navPlaceholder.innerText = name[0];
    }

    // Рендер инвентаря и остального (оставь как было...)
    // ... твой старый код рендера инвентаря ...
}
