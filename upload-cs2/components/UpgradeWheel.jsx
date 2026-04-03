"use client";
import { useEffect, useRef } from "react";

export default function UpgradeWheel({ chance, spinning, result }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фон — проигрыш
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#2c0a0a";
    ctx.fill();

    // Зона выигрыша
    const winAngle = (chance / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + winAngle);
    ctx.closePath();
    ctx.fillStyle = "#1a4a1a";
    ctx.fill();

    // Обводка
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Центральный круг
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fillStyle =
      result === "win" ? "#2ecc71" :
      result === "lose" ? "#e74c3c" :
      "#1a1a1a";
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Указатель снизу
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + r + 4);
    ctx.lineTo(cx + 8, cy + r + 4);
    ctx.lineTo(cx, cy + r - 10);
    ctx.closePath();
    ctx.fillStyle = "#f0c040";
    ctx.fill();
  }, [chance, result]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={220}
      className={`wheel ${spinning ? "spinning" : ""}`}
    />
  );
}