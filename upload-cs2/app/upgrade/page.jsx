"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { rollUpgrade, calculateChance } from "@/lib/upgradeLogic";
import SkinCard from "@/components/SkinCard";
import UpgradeWheel from "@/components/UpgradeWheel";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

const SKINS = [
  { id: 1, name: "AK-47 | Redline", price: 15.5, image: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEGeV0FnccYh3X_q3BVPGHHFMj6F9hVMW0Jgs_-gpXP4TemDHViuV3tCH6i27MKCYq78g9gaSBn2Pd1ypVs4T3_RZQU/360fx360f" },
  { id: 2, name: "AWP | Asiimov", price: 85.0, image: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEGeV0FnccYh3X_q3BVPGHHFMj6F9hVMW0Jgs_-gpXP4TemDHVm6B3oCHqn2HJJQW0rp0g0UuBl3uPJ0eZw4jipaQEU/360fx360f" },
  { id: 3, name: "M4A1-S | Hyper Beast", price: 45.0, image: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEGeV0FnccYh3X_q3BVPGHHFMj6F9hVMW0Jgs_-gpXP4TemDHVm6B3oX3q22TbMLSa1_p1w9X_Bx3uKJ0L1k4mibMFJQ/360fx360f" },
  { id: 4, name: "Glock | Fade", price: 350.0, image: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEGeV0FnccYh3X_q3BVPGHHFMj6F9hVMW0Jgs_-gpXP4TemDHVm_B_oSHvj3DbNLeBrp9Q5UuEgzuPdx5JY94TrpJAFQ/360fx360f" },
  { id: 5, name: "Karambit | Doppler", price: 950.0, image: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEGeV0FnccYh3X_q3BVPGHHFMj6F9hVMW0Jgs_-gpXP4TemDHVjuF_pGHqx2-bPCfo7ogV8UvVh2uPMxrZg44jiuLBUF/360fx360f" },
];

export default function UpgradePage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [inputSkin, setInputSkin] = useState(null);
  const [targetSkin, setTargetSkin] = useState(null);
  const [chance, setChance] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth"); return; }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) setBalance(snap.data().balance);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (inputSkin && targetSkin) {
      setChance(calculateChance(inputSkin.price, targetSkin.price));
    } else {
      setChance(0);
    }
  }, [inputSkin, targetSkin]);

  const handleUpgrade = async () => {
    if (!inputSkin || !targetSkin || spinning) return;
    if (balance < inputSkin.price) { setResult("insufficient"); return; }
    if (inputSkin.id === targetSkin.id) { setResult("same"); return; }

    setSpinning(true);
    setResult(null);

    const newBalance = parseFloat((balance - inputSkin.price).toFixed(2));
    await updateDoc(doc(db, "users", user.uid), { balance: newBalance });
    setBalance(newBalance);

    await new Promise((r) => setTimeout(r, 3000));

    const won = rollUpgrade(chance);

    let finalBalance = newBalance;
    if (won) {
      finalBalance = parseFloat((newBalance + targetSkin.price).toFixed(2));
      await updateDoc(doc(db, "users", user.uid), { balance: finalBalance });
      setBalance(finalBalance);
    }

    await addDoc(collection(db, "users", user.uid, "history"), {
      inputSkin: inputSkin.name,
      targetSkin: targetSkin.name,
      chance,
      result: won ? "win" : "lose",
      date: new Date().toISOString(),
    });

    setResult(won ? "win" : "lose");
    setSpinning(false);
  };

  return (
    <>
      <Navbar />
      <div className="upgrade-page">
        <h1>⬆ UPGRADER</h1>
        <p className="balance-bar">Баланс: <strong style={{ color: "#f0c040" }}>${balance.toFixed(2)}</strong></p>

        <div className="upgrade-arena">
          <div className="skin-panel">
            <h3>Ваш скин</h3>
            {SKINS.map((s) => (
              <SkinCard
                key={s.id}
                skin={s}
                selected={inputSkin?.id === s.id}
                onClick={() => !spinning && setInputSkin(s)}
              />
            ))}
          </div>

          <div className="wheel-section">
            <UpgradeWheel chance={chance} spinning={spinning} result={result} />
            <p className="chance-display">{chance}%</p>
            <p className="chance-label">шанс выигрыша</p>
            <button
              className="upgrade-btn"
              onClick={handleUpgrade}
              disabled={!inputSkin || !targetSkin || spinning || inputSkin?.id === targetSkin?.id}
            >
              {spinning ? "▶▶▶" : "UPGRADE"}
            </button>
            {result === "win" && <p className="result win">✓ Победа!</p>}
            {result === "lose" && <p className="result lose">✗ Проигрыш</p>}
            {result === "insufficient" && <p className="result error">Недостаточно средств</p>}
            {result === "same" && <p className="result error">Выбери разные скины</p>}
          </div>

          <div className="skin-panel">
            <h3>Цель</h3>
            {SKINS.map((s) => (
              <SkinCard
                key={s.id}
                skin={s}
                selected={targetSkin?.id === s.id}
                onClick={() => !spinning && setTargetSkin(s)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}