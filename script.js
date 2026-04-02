let isRolling = false;

document.getElementById('upgrade-btn').onclick = () => {
    if (isRolling) return;
    isRolling = true;
    
    let roll = (Math.random() * 100).toFixed(2);
    let duration = 3000; // 3 секунды крутится
    let start = Date.now();

    let timer = setInterval(() => {
        let timePassed = Date.now() - start;
        if (timePassed >= duration) {
            clearInterval(timer);
            isRolling = false;
            if (parseFloat(roll) <= parseFloat(chance)) {
                alert("ЕБАТЬ! ТЫ ВЫИГРАЛ! Выпало: " + roll);
            } else {
                alert("БРИТВА... Выпало: " + roll);
            }
            return;
        }
        // Тут можно добавить визуальный эффект вращения стрелки
    }, 10);
};
