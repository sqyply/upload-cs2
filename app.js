// app.js
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

let user = null;
let state = {
    selectedMy: null,
    selectedTarget: null,
    speed: 3000,
    skins: []
};

// 1. АВТОРИЗАЦИЯ
async function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
}

auth.onAuthStateChanged(async (u) => {
    if (u) {
        user = u;
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('user-section').classList.remove('hidden');
        document.getElementById('username').innerText = u.displayName;
        document.getElementById('avatar').src = u.photoURL;
        
        // Подтягиваем данные из БД или создаем профиль
        const userDoc = await db.collection('users').doc(u.uid).get();
        if (!userDoc.exists()) {
            await db.collection('users').doc(u.uid).set({
                balance: 10.00, // Бонус при регистрации
                inventory: [],
                lvl: 1
            });
        }
        listenToUserData();
    }
});

function listenToUserData() {
    db.collection('users').doc(user.uid).onSnapshot(doc => {
        const data = doc.data();
        document.getElementById('balance').innerText = data.balance.toFixed(2);
        document.getElementById('lvl').innerText = data.lvl;
        renderInventory(data.inventory);
    });
}

// 2. ЗАГРУЗКА СКИНОВ (РЕАЛЬНОЕ API)
async function loadSkins() {
    const res = await fetch('https://bymykel.github.io/CSGO-API/api/ru/skins.json');
    const data = await res.json();
    state.skins = data.slice(0, 150).map(s => ({
        id: Math.random().toString(36).substr(2, 9),
        name: s.name,
        img: s.image,
        price: (Math.random() * 500 + 0.5).toFixed(2)
    }));
    renderShop(state.skins);
}

// 3. ЛОГИКА АПГРЕЙДА (РЕАЛЬНЫЕ ДЕНЬГИ)
async function executeUpgrade() {
    if (!state.selectedMy || !state.selectedTarget) return;
    
    const chance = (state.selectedMy.price / state.selectedTarget.price) * 100;
    const btn = document.getElementById('upgrade-btn');
    btn.disabled = true;

    // Крутим кольцо (визуал)
    const ring = document.getElementById('ring');
    ring.style.transition = `stroke-dashoffset ${state.speed}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    const randomPoint = Math.random() * 100;
    const isWin = randomPoint <= chance;

    setTimeout(async () => {
        const modal = document.getElementById('modal');
        const content = document.getElementById('modal-content');
        modal.classList.remove('hidden');

        if (isWin) {
            content.innerHTML = `
                <h2 class="text-6xl font-black text-yellow-500 italic mb-4">SUCCESS</h2>
                <div class="bg-white/5 p-8 rounded-[40px] border border-white/10 mb-6">
                    <img src="${state.selectedTarget.img}" class="w-64 mx-auto">
                    <p class="mt-4 font-black uppercase italic">${state.selectedTarget.name}</p>
                </div>
                <button onclick="location.reload()" class="bg-yellow-500 text-black px-10 py-4 rounded-2xl font-black italic uppercase">Collect</button>
            `;
            // Обновляем БД: удаляем старый, добавляем новый
            await updateDbAfterGame(true);
        } else {
            content.innerHTML = `
                <h2 class="text-6xl font-black text-red-600 italic mb-4">FAILED</h2>
                <p class="text-gray-500 mb-8">You lost your item</p>
                <button onclick="location.reload()" class="border border-white/20 text-white px-10 py-4 rounded-2xl font-black italic uppercase">Try Again</button>
            `;
            await updateDbAfterGame(false);
        }
    }, state.speed);
}

async function updateDbAfterGame(win) {
    const userRef = db.collection('users').doc(user.uid);
    const snap = await userRef.get();
    let inv = snap.data().inventory;
    
    // Удаляем предмет, который ставили
    inv = inv.filter(item => item.id !== state.selectedMy.id);
    
    if (win) {
        inv.push(state.selectedTarget);
    }
    
    await userRef.update({ inventory: inv });
}

// 4. ПЛАТЕЖКА (ЗАГЛУШКА ДЛЯ ИНТЕГРАЦИИ)
function openDeposit() {
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    document.getElementById('modal-content').innerHTML = `
        <div class="bg-[#0a0a0a] p-10 rounded-[40px] border border-white/5 max-w-md w-full">
            <h3 class="text-2xl font-black italic uppercase mb-6">Deposit Balance</h3>
            <div class="grid grid-cols-2 gap-4 mb-6">
                <button onclick="addCash(10)" class="p-4 bg-white/5 rounded-2xl hover:bg-yellow-500/20">10 SQ</button>
                <button onclick="addCash(50)" class="p-4 bg-white/5 rounded-2xl hover:bg-yellow-500/20">50 SQ</button>
            </div>
            <p class="text-[10px] text-gray-600 uppercase">This is where you integrate Stripe/Crypto API</p>
            <button onclick="location.reload()" class="mt-8 text-gray-400 text-xs">Close</button>
        </div>
    `;
}

async function addCash(amount) {
    const userRef = db.collection('users').doc(user.uid);
    await userRef.update({
        balance: firebase.firestore.FieldValue.increment(amount)
    });
    location.reload();
}

// Вспомогательные функции рендера... (как в прошлый раз, но компактнее)
loadSkins();
