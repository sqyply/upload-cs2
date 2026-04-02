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

// Данные
let userData = null;
let selectedSkin = null;
let currentRotation = 0;
let isRolling = false;

// Реальный список скинов (база для апгрейда)
const allSkins = [
    { id: 1, name: "AWP | Dragon Lore", price: 12500, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV09-5lpKKqPrxN7LEmyVQ7MEpiLuSrY6i2lHj-ERvY273co-SclA8YVvS_FLsl73ng5S9v8zMmHBu73I8pSGKgf9f_6M" },
    { id: 2, name: "AK-47 | Fire Serpent", price: 900, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppUp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" },
    { id: 3, name: "Knife | Doppler", price: 650, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYi59_9Szh4S0g_7zO6-fzzxUuJFz3-qSrd2tjge2_RE9a2DycI-Sd1VvYF3VqVPrwb_rjZXpv8idm3VgvXNw4S7D30vgvN9mAtM" }
];

// Колесо
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

function drawWheel(rotation = 0, chance = 0) {
    const cx = 240, cy = 240, r = 220;
    ctx.clearRect(0, 0, 480, 480);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    // Подложка
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#11111a';
    ctx.lineWidth = 15;
    ctx.stroke();

    // Сектор выигрыша
    if (chance > 0) {
        const angle = (Math.PI * 2) * (chance / 100);
        ctx.beginPath();
        ctx.arc(0, 0, r, -angle/2, angle/2);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 15;
        ctx.stroke();
    }
    ctx.restore();
}

// Регистрация / Логин
async function handleAuth(type) {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    try {
        if (type === 'register') {
            const res = await auth.createUserWithEmailAndPassword(email, pass);
            await db.collection('users').doc(res.user.uid).set({
                balance: 500,
                inventory: [
                    { name: "AK-47 | Safari Mesh", price: 10, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppQp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" }
                ]
            });
        } else {
            await auth.signInWithEmailAndPassword(email, pass);
        }
        toggleAuthModal(false);
    } catch (e) { alert(e.message); }
}

// Мониторинг состояния юзера
auth.onAuthStateChanged(async user => {
    if (user) {
        db.collection('users').doc(user.uid).onSnapshot(doc => {
            userData = doc.data();
            updateUI();
        });
        document.getElementById('user-bar').classList.remove('hidden');
        document.getElementById('nav-auth-btn').classList.add('hidden');
    } else {
        document.getElementById('user-bar').classList.add('hidden');
        document.getElementById('nav-auth-btn').classList.remove('hidden');
        toggleAuthModal(true);
    }
});

function updateUI() {
    document.getElementById('user-balance').innerText = `$${userData.balance.toFixed(2)}`;
    document.getElementById('user-name').innerText = auth.currentUser.email.split('@')[0];
    
    const inv = document.getElementById('inventory');
    inv.innerHTML = '';
    userData.inventory.forEach((item, idx) => {
        inv.innerHTML += `
            <div onclick="selectForUpgrade(${idx})" class="bg-[#12121a] p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-yellow-500/50 transition-all ${selectedSkin?.idx === idx ? 'border-yellow-500 bg-yellow-500/5' : ''}">
                <img src="${item.img}" class="w-20 mx-auto">
                <div class="text-[10px] font-bold text-gray-500 uppercase mt-2">${item.name}</div>
                <div class="text-white font-black">$${item.price}</div>
            </div>
        `;
    });
}

function selectForUpgrade(idx) {
    selectedSkin = { ...userData.inventory[idx], idx };
    const target = allSkins[Math.floor(Math.random() * allSkins.length)];
    const chance = ((selectedSkin.price / target.price) * 100).toFixed(2);
    
    document.getElementById('target-area').style.opacity = 1;
    document.getElementById('target-img').src = target.img;
    document.getElementById('target-name').innerText = target.name.split('|')[1];
    document.getElementById('target-price').innerText = `$${target.price}`;
    document.getElementById('chance-display').innerText = chance + '%';
    document.getElementById('potential-win').innerText = `$${target.price}`;
    document.getElementById('roll-btn').disabled = false;
    
    drawWheel(0, chance);
}

document.getElementById('roll-btn').onclick = async () => {
    if (isRolling) return;
    isRolling = true;
    
    const chance = parseFloat(document.getElementById('chance-display').innerText);
    const win = Math.random() * 100 <= chance;
    const spins = 8;
    const targetAngle = win ? (Math.random() * (Math.PI * 2 * (chance/100)) - (Math.PI * 2 * (chance/100)/2)) : (Math.PI);
    const finalRotation = (Math.PI * 2 * spins) - targetAngle;

    const start = performance.now();
    function animate(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / 5000, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        drawWheel(finalRotation * ease, chance);

        if (progress < 1) requestAnimationFrame(animate);
        else {
            isRolling = false;
            alert(win ? "UPGRADE SUCCESS!" : "UPGRADE FAILED");
            // Тут логика обновления инвентаря в Firebase (удаление старого, добавление нового)
        }
    }
    requestAnimationFrame(animate);
};

function toggleAuthModal(show) {
    document.getElementById('auth-modal').classList.toggle('hidden', !show);
}
