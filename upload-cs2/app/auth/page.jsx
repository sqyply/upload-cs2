"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email,
          balance: 100.0,
          createdAt: new Date().toISOString(),
        });
      }
      router.push("/upgrade");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Вход" : "Регистрация"}</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleSubmit}>
        {isLogin ? "Войти" : "Зарегистрироваться"}
      </button>
      <span onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
      </span>
    </div>
  );
}