"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/src/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const db = getFirestore();

  const checkTeacherAndRedirect = async (user) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "teacher") {
          router.push("users/teacher/dashboard");
        } else if (userData.role === "parent") {
          router.push("users/parent/dashboard");
        } else if (userData.role === "student") {
          router.push("users/student/dashboard");
        } else {
          setError("Rôle utilisateur non reconnu.");
        }
      } else {
        setError("Compte utilisateur non trouvé.");
      }
    } catch (err) {
      setError("Erreur lors de la vérification du rôle utilisateur.");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await checkTeacherAndRedirect(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkTeacherAndRedirect(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-pink-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="Hikaya Logo" 
            className="w-16 h-16 mb-4"
          />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Hikaya</h1>
          <p className="text-sm text-slate-600 text-center">Suivi de Lecture pour les Élèves de Préscolaire</p>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-pink-600">Se connecter</h2>
        <form onSubmit={handleEmailLogin} className="w-full flex flex-col gap-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-black"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition text-black"
          />
          <button
            type="submit"
            className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow transition"
          >
            Connexion par Email
          </button>
        </form>
        <div className="w-full flex items-center my-2">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-sm">ou</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg flex items-center justify-center gap-2 shadow transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.85-6.85C35.64 2.36 30.18 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.13 13.13 17.57 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.59C43.93 37.36 46.1 31.41 46.1 24.55z"/><path fill="#FBBC05" d="M10.67 28.29c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C.99 15.1 0 19.39 0 24c0 4.61.99 8.9 2.69 12.24l7.98-6.2z"/><path fill="#EA4335" d="M24 48c6.18 0 11.64-2.04 15.52-5.56l-7.19-5.59c-2.01 1.35-4.58 2.15-8.33 2.15-6.43 0-11.87-3.63-14.33-8.79l-7.98 6.2C6.71 42.18 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Connexion avec Google
        </button>
        {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
      </div>
    </div>
  );
}
