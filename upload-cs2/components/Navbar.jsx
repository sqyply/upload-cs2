"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        onSnapshot(ref, (snap) => {
          if (snap.exists()) setBalance(snap.data().balance);
        });
      }
    });
    return () => unsub();
  }, []);

  return (
    <nav className="navbar">
      <Link href="/upgrade">⬆ CS2 UPGRADER</Link>
      <div className="nav-links">
        <Link href="/upgrade">Апгрейд</Link>
        <Link href="/profile">Профиль</Link>
        {!user && <Link href="/auth">Войти</Link>}
      </div>
      {user && <span className="balance">${balance.toFixed(2)}</span>}
    </nav>
  );
}