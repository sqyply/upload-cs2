const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let chance = 35.00; 
let isRolling = false;
let currentAngle = 0;

// Список фейковых скинов
const skins = [
    { name: "AK-47 | Redline", price: 50, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjx2jJemkV092lnYmGmOHLPr7Vn35cppMp2L-S8In0ilHj_0VvMG_0I9SccVNoYV_U8gS8l7_rg5S6vM6bm3Vguygh4XfD30vg7fVpE_E" },
    { name: "M4A4 | Howl", price: 5000, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjx2jJemkV09_km460m_7zO6-fzj9V7cAl2eySpt-m21Xh8kY4Mm_zLITAdlU2aV6F-lS5xeu5hJW6ucvJy3Zqv3In7XvD30vg9fsh6mY" },
    { name: "Knife | Doppler", price: 800, img: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1f_BYi59_9Szh4S0g_7zO6-fzzxUuJFz3-qSrd2tjge2_RE9a2DycI-Sd1VvYF3VqVPrwb_rjZXpv8idm3VgvXNw4S7D30vgvN9mAtM" }
];

// Рендерим инвентарь
const inv = document.getElementById('my-inventory');
skins.forEach(skin => {
    inv.innerHTML += `
        <div class="item-card" onclick="alert('Скин выбран!')">
            <img src="${skin.img}">
            <p>${skin.name}</p>
            <span>$${skin.price}</span>
        </div>
    `;
});

function draw(angle = 0) {
    ctx.clearRect(0,0,400,400);
    ctx.save();
    ctx.translate(200,200);
    ctx.rotate(angle);

    // Фон круга
    ctx.beginPath();
    ctx.arc(0,0,180,0,Math.PI*2);
    ctx.strokeStyle='#222'; ctx.lineWidth=15; ctx.stroke();
    
    // Сектор выигрыша
    ctx.beginPath();
    ctx.arc(0,0,180, -Math.PI/2, (-Math.PI/2) + (Math.PI*2*(chance/100)));
    ctx.strokeStyle='#ffcc00'; ctx.lineWidth=15; ctx.stroke();
    ctx.restore();
}

function fakeLogin() {
    const name = prompt("Введите ник для регистрации:");
    if(name) {
        document.querySelector('.login-btn').innerText = name.toUpperCase();
        alert("Регистрация успешна! Баланс пополнен на $500 (Демо)");
    }
}

document.getElementById('upgrade-btn').onclick = () => {
    if (isRolling) return;
    isRolling = true;
    
    let spinAngle = Math.random() * Math.PI * 10 + Math.PI * 10; 
    let start = null;
    let duration = 4000;

    function animate(timestamp) {
        if (!start) start = timestamp;
        let progress = timestamp - start;
        let easeOut = 1 - Math.pow(1 - (progress / duration), 3);
        let currentPos = spinAngle * easeOut;
        
        draw(currentPos);

        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            isRolling = false;
            // Проверка: попали ли в сектор (упрощенно)
            if (Math.random() * 100 <= chance) {
                alert("ЕБАТЬ! ВЫИГРАЛ!");
            } else {
                alert("ПРОЕБАЛ. Попробуй еще!");
            }
        }
    }
    requestAnimationFrame(animate);
};

draw();
