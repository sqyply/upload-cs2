const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
let chance = 50.00;

function draw() {
    ctx.clearRect(0,0,400,400);
    ctx.beginPath();
    ctx.arc(200,200,180,0,Math.PI*2);
    ctx.strokeStyle='#222'; ctx.lineWidth=15; ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(200,200,180,-Math.PI/2, (-Math.PI/2) + (Math.PI*2*(chance/100)));
    ctx.strokeStyle='#ffcc00'; ctx.lineWidth=15; ctx.stroke();
}

function setChance(m) { 
    chance = (100/m).toFixed(2); 
    document.getElementById('chance-value').innerText = chance + '%'; 
    draw(); 
}

draw();

document.getElementById('upgrade-btn').onclick = () => {
    alert("Крутилка UPLOAD.CS2 готова! Джек, теперь деплой это на Vercel!");
};
