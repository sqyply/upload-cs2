export function rollUpgrade(chancePercent) {
  const roll = Math.random() * 100;
  return roll <= chancePercent;
}

export function calculateChance(inputPrice, targetPrice) {
  if (!inputPrice || !targetPrice || targetPrice === 0) return 0;
  const raw = (inputPrice / targetPrice) * 100;
  const clamped = Math.min(Math.max(raw, 1), 90);
  return parseFloat(clamped.toFixed(2));
}