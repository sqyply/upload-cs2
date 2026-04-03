"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { rollUpgrade, calculateChance } from "@/lib/upgradeLogic";
import SkinCard from "@/components/SkinCard";
import UpgradeWheel from "@/components/UpgradeWheel";

const SKINS = [
  { id: 1, name: "AK-47 | Redline", price: 15.5, image: "/skins/ak_redline.png" },
  { id: 2, name: "AWP | Asiimov", price: 85.0, image: "/skins/awp_asiimov.png" },
  { id: 3, name: "M4A4 | Howl", price: 1500.0, image: "/skins/m4_howl.png" },
  { id: 4, name: "Karambit | Fade", price: 800.0, image: "/skins/kara_fade.png" },
];

export default function UpgradePage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [inputSkin, setInputSkin] = useState(null);
  const [targetSkin, setTargetSkin] = useState(null);
  const [chance, setChance] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setBalance(snap.data().balance);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (inputSkin && targetSkin) {
      setChance(calculateChance(inputSkin.price, targetSkin.price));
    }
  }, [inputSkin, targetSkin]);

  const handleUpgrade = async () => {
    if (!inputSkin || !targetSkin || spinning) return;
    if (balance < inputSkin.price) {
      setResult("insufficient");
      return;
    }

    setSpinning(true);
    setResult(null);

    // Списываем стоимость входного скина
    const newBalance = balance - inputSkin.price;
    await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
    setBalance(newBalance);

    // Имитация вращения
    await new Promise((r) => setTimeout(r, 3000));

    const won = rollUpgrade(chance);

    if (won) {
      const winBalance = newBalance + targetSkin.price;
      await updateDoc(doc(db, "users", user.uid), { balance: winBalance });
      setBalance(winBalance);
      setResult("win");
    } else {
      setResult("lose");
    }

    setSpinning(false);
  };

  return (
    <div className="upgrade-page">
      <h1>UPGRADER</h1>
      <p className="balance">Баланс: ${balance.toFixed(2)}</p>

      <div className="upgrade-arena">
        <div className="skin-select">
          <h3>Ваш скин</h3>
          {SKINS.map((s) => (
            <SkinCard
              key={s.id}
              skin={s}
              selected={inputSkin?.id === s.id}
              onClick={() => setInputSkin(s)}
            />
          ))}
        </div>

        <div className="wheel-section">
          <UpgradeWheel chance={chance} spinning={spinning} result={result} />
          <p className="chance-display">{chance}% шанс</p>
          <button
            className="upgrade-btn"
            onClick={handleUpgrade}
            disabled={!inputSkin || !targetSkin || spinning}
          >
            {spinning ? "..." : "UPGRADE"}
          </button>
          {result === "win" && <p className="result win">Победа!</p>}
          {result === "lose" && <p className="result lose">Проигрыш</p>}
          {result === "insufficient" && <p className="result error">Недостаточно средств</p>}
        </div>

        <div className="skin-select">
          <h3>Цель</h3>
          {SKINS.map((s) => (
            <SkinCard
              key={s.id}
              skin={s}
              selected={targetSkin?.id === s.id}
              onClick={() => setTargetSkin(s)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
