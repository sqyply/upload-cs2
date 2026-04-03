let currentSpeed = 'slow';

// Кнопки быстрой настройки шанса
const CHANCE_PRESETS = [1, 15, 35, 50, 75];

// Установка скорости прокрутки
function setSpeed(speed) {
    currentSpeed = speed;
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active', 'text-yellow-500'));
    document.getElementById(`speed-${speed}`).classList.add('active');
}

// Умный подбор скина под шанс
function setChancePreset(percent) {
    if (!state.selectedMy) return alert("Сначала выбери свой скин!");
    
    const targetPrice = state.selectedMy.price / (percent / 100);
    // Ищем ближайший скин по цене в базе
    const bestMatch = state.allSkins.reduce((prev, curr) => {
        return (Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev);
    });
    
    window.handleSelect(bestMatch, 'target');
}

// Интеграция Тест-Режима
function initAuth() {
    if (typeof TEST_CONFIG !== 'undefined' && TEST_CONFIG.enabled) {
        console.log("🚀 TEST MODE ACTIVE");
        state.balance = TEST_CONFIG.testBalance;
        state.myItems = TEST_CONFIG.testInventory;
        updateGlobalUI();
        return; // Пропускаем Firebase если тест включен
    }
    
    // Иначе обычная логика Firebase...
}
