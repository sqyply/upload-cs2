const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const chanceDisplay = document.getElementById('chance-display');
const upgradeBtn = document.getElementById('upgrade-btn');
const firebaseConfig = {
  apiKey: "AIzaSyD8-CEB-HZMouwx_HLGmPfnOOD5HmF3nUM",
  authDomain: "upload-cs2.firebaseapp.com",
  projectId: "upload-cs2",
  storageBucket: "upload-cs2.firebasestorage.app",
  messagingSenderId: "611922955960",
  appId: "1:611922955960:web:c9b87c819075e33446ae4d",
  measurementId: "G-2HHKE194B7"
};

let chance = 45.00;
let isRolling = false;
let currentRotation = 0;
let speedMode = 'slow';

const config = {
    slow: { duration: 7000, spins: 6 },
    fast: { duration: 3000, spins: 10 },
    instant: { duration: 400, spins: 2 }
};

const skins = [
    { name: "M4A4 | HOWL", price: 5400, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjx2jJemkV09_km460m_7zO6-fzj9V7cAl2eySpt-m21Xh8kY4Mm_zLITAdlU2aV6F-lS5xeu5hJW6ucvJy3Zqv3In7XvD30vg9fsh6mY" },
    { name: "AK-47 | REDLINE", price: 85, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppMp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" },
    { name: "BUTTERFLY KNIFE", price: 1200, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYi59_9Szh4S0g_7zO6-fzzxUuJFz3-qSrd2tjge2_RE9a2DycI-Sd1VvYF3VqVPrwb_rjZXpv8idm3VgvXNw4S7D30vgvN9mAtM" }
];

function draw(rotation = 0) {
    const center = 250;
    ctx.clearRect(0, 0, 500, 500);
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    // Inner Glow
    const gradient = ctx.createRadialGradient(0,0,150, 0,0,230);
    gradient.addColorStop(0, 'rgba(10,10,15,0)');
    gradient.addColorStop(1, 'rgba(234,179,8,0.05)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0,0,230,0,Math.PI*2);
    ctx.fill();

    // Track
    ctx.beginPath();
    ctx.arc(0, 0, 230, 0, Math.PI * 2);
    ctx.strokeStyle = '#11111a';
    ctx.lineWidth = 15;
    ctx.stroke();

    // WIN SECTOR (Yellow)
    const angleSize = (Math.PI * 2) * (chance / 100);
    ctx.beginPath();
    ctx.arc(0, 0, 230, -angleSize/2, angleSize/2); // Центрируем сектор относительно 0
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.restore();
}

function setSpeed(mode) {
    speedMode = mode;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`speed-${mode}`).classList.add('active');
}

function openAuth() {
    const user = prompt("ENTER NICKNAME:");
    if(user) {
        document.getElementById('username').innerText = user.toUpperCase();
        localStorage.setItem('user', user);
    }
}

upgradeBtn.onclick = () => {
    if (isRolling) return;
    isRolling = true;
    upgradeBtn.disabled = true;
    
    const settings = config[speedMode];
    const startTime = performance.now();
    
    // МЕХАНИКА: Результат определяет угол. 0 - это центр сектора выигрыша.
    const win = Math.random() * 100 <= chance;
    
    // Если win - угол остановки должен быть в пределах [-angleSize/2, angleSize/2]
    // Если lose - угол за этими пределами
    const angleSize = (Math.PI * 2) * (chance / 100);
    let targetAngle;
    
    if (win) {
        // Рандомный угол внутри сектора (под палочкой)
        targetAngle = (Math.random() * angleSize) - (angleSize / 2);
    } else {
        // Рандомный угол вне сектора
        targetAngle = (Math.random() * (Math.PI * 2 - angleSize)) + (angleSize / 2);
    }

    // Финальное вращение = Полные круги - целевой угол (чтобы палочка сверху совпала)
    const finalRotation = (Math.PI * 2 * settings.spins) - targetAngle;

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / settings.duration, 1);
        
        // Custom cubic-bezier для реалистичного торможения
        const ease = 1 - Math.pow(1 - progress, 5); 
        currentRotation = finalRotation * ease;
        
        draw(currentRotation);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isRolling = false;
            upgradeBtn.disabled = false;
            if(win) {
                alert("SYSTEM: SUCCESSFUL UPGRADE!");
                document.body.classList.add('win-active');
                setTimeout(() => document.body.classList.remove('win-active'), 2000);
            } else {
                alert("SYSTEM: ASSET LOST.");
            }
        }
    }
    requestAnimationFrame(animate);
};

// Рендер инвентаря
const grid = document.getElementById('inventory-grid');
skins.forEach(s => {
    grid.innerHTML += `
        <div class="item-card p-4 rounded-2xl cursor-pointer transition-all active:scale-90">
            <img src="${s.img}" class="w-full drop-shadow-2xl">
            <div class="text-[10px] text-gray-500 font-black uppercase mt-3 tracking-tighter">${s.name}</div>
            <div class="text-yellow-500 font-black text-lg italic mt-1">$${s.price}</div>
        </div>
    `;
});

draw();
