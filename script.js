const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let chance = 45.00;
let isRolling = false;
let currentRotation = 0;
let speedMode = 'slow';

const config = {
    slow: { duration: 6000, spins: 5 },
    fast: { duration: 2500, spins: 8 },
    instant: { duration: 300, spins: 2 }
};

const skins = [
    { name: "M4A4 | Howl", price: 5400, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjx2jJemkV09_km460m_7zO6-fzj9V7cAl2eySpt-m21Xh8kY4Mm_zLITAdlU2aV6F-lS5xeu5hJW6ucvJy3Zqv3In7XvD30vg9fsh6mY" },
    { name: "AK-47 | Redline", price: 85, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppMp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" },
    { name: "Butterfly Knife", price: 1200, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYi59_9Szh4S0g_7zO6-fzzxUuJFz3-qSrd2tjge2_RE9a2DycI-Sd1VvYF3VqVPrwb_rjZXpv8idm3VgvXNw4S7D30vgvN9mAtM" }
];

function draw(rotation = 0) {
    const size = 450;
    const center = size / 2;
    ctx.clearRect(0, 0, size, size);
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    // Основной обод
    ctx.beginPath();
    ctx.arc(0, 0, 210, 0, Math.PI * 2);
    ctx.strokeStyle = '#15151e';
    ctx.lineWidth = 12;
    ctx.stroke();

    // Сектор выигрыша
    const angleSize = (Math.PI * 2) * (chance / 100);
    ctx.beginPath();
    ctx.arc(0, 0, 210, -Math.PI/2, -Math.PI/2 + angleSize);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 12;
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
    const user = prompt("Create Username:");
    if(user) {
        document.getElementById('username').innerText = user;
        localStorage.setItem('user', user);
    }
}

document.getElementById('upgrade-btn').onclick = () => {
    if (isRolling) return;
    isRolling = true;
    
    const settings = config[speedMode];
    const startTime = performance.now();
    
    // Результат определяется СРАЗУ, анимация лишь подстраивается
    const win = Math.random() * 100 <= chance;
    const finalRotation = win 
        ? (Math.PI * 2 * settings.spins) + (Math.random() * (Math.PI * 2 * (chance/100))) 
        : (Math.PI * 2 * settings.spins) + (Math.PI * 2 * (chance/100)) + (Math.random() * (Math.PI * 2 * (1 - chance/100)));

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / settings.duration, 1);
        
        // Плавное замедление (EaseOut)
        const ease = 1 - Math.pow(1 - progress, 4);
        currentRotation = finalRotation * ease;
        
        draw(currentRotation);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isRolling = false;
            if(win) alert("WINNER! Item added to inventory.");
            else alert("LOSE. Try again.");
        }
    }
    requestAnimationFrame(animate);
};

// Загрузка инвентаря
const grid = document.getElementById('inventory-grid');
skins.forEach(s => {
    grid.innerHTML += `
        <div class="item-card p-3 rounded-2xl cursor-pointer hover:scale-95 transition-all">
            <img src="${s.img}" class="w-full">
            <div class="text-[10px] text-gray-500 uppercase mt-1 truncate">${s.name}</div>
            <div class="text-yellow-500 font-bold">$${s.price}</div>
        </div>
    `;
});

draw();
