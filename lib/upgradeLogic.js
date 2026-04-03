// Возвращает true если апгрейд удался
export function rollUpgrade(chancePercent) {
  const roll = Math.random() * 100;
  return roll <= chancePercent;
}

// Считает шанс на основе стоимостей скинов
export function calculateChance(inputValue, targetValue) {
  if (!inputValue || !targetValue || targetValue === 0) return 0;
  const raw = (inputValue / targetValue) * 100;
  return Math.min(Math.max(raw.toFixed(2), 1), 90); // минимум 1%, максимум 90%
}
