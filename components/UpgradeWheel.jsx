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
    const r = cx - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Зона проигрыша
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#c0392b";
    ctx.fill();

    // Зона выигрыша
    const winAngle = (chance / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + winAngle);
    ctx.fillStyle = "#27ae60";
    ctx.fill();

    // Центр
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.fillStyle = result === "win"
      ? "#2ecc71"
      : result === "lose"
      ? "#e74c3c"
      : "#222";
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
