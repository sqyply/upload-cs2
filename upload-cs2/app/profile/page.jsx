"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { router.push("/auth"); return; }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) setBalance(snap.data().balance);

      const histSnap = await getDocs(collection(db, "users", u.uid, "history"));
      const items = [];
      histSnap.forEach((d) => items.push(d.data()));
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(items.slice(0, 10));
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth");
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <h2>Профиль</h2>
        <p>Email: <strong>{user?.email}</strong></p>
        <p>Баланс: <strong style={{ color: "#f0c040" }}>${balance.toFixed(2)}</strong></p>

        <h3 style={{ marginTop: "30px", marginBottom: "12px", color: "#f0c040" }}>История апгрейдов</h3>
        {history.length === 0 && <p style={{ color: "#666" }}>Пока нет апгрейдов</p>}
        {history.map((h, i) => (
          <div key={i} style={{
            background: "#222",
            borderRadius: "8px",
            padding: "10px 14px",
            marginBottom: "8px",
            borderLeft: `3px solid ${h.result === "win" ? "#2ecc71" : "#e74c3c"}`
          }}>
            <p style={{ fontSize: "13px" }}>
              {h.inputSkin} → {h.targetSkin}
            </p>
            <p style={{ fontSize: "12px", color: "#888" }}>
              Шанс: {h.chance}% | {h.result === "win" ? "✓ Победа" : "✗ Проигрыш"} | {new Date(h.date).toLocaleString("ru")}
            </p>
          </div>
        ))}

        <button className="logout-btn" onClick={handleLogout}>Выйти</button>
      </div>
    </>
  );
}