"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth } from "firebase/auth";

export default function AddStudentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingClasses, setFetchingClasses] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const snap = await getDocs(collection(db, "class"));
        setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Erreur lors du chargement des classes");
      } finally {
        setFetchingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Non authentifié");
      
      await addDoc(collection(db, "students"), {
        name,
        age: Number(age),
        classId,
        isActive,
        booksRead: 0,
        teacherId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      router.push("/users/teacher/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingClasses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-slate-700 text-lg font-medium">Chargement des classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium rounded-xl hover:bg-white/50 transition-all duration-200 mb-4"
          >
            <span className="mr-2">←</span>
            Retour
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            <span className="mr-3">👨‍🎓</span>
            Ajouter un élève
          </h1>
          <p className="text-slate-600">Créez un nouveau profil d'élève pour commencer le suivi de lecture</p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">👤</span>
                  Nom complet
                </span>
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 placeholder-black text-black"
                placeholder="Entrez le nom complet de l'élève"
              />
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">🎂</span>
                  Âge
                </span>
              </label>
              <input 
                type="number" 
                value={age} 
                onChange={e => setAge(e.target.value)} 
                required 
                min="3" 
                max="6" 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 placeholder-black text-black"
                placeholder="Âge de l'élève (3-6 ans)"
              />
              <p className="text-xs text-slate-500 mt-1">Âge recommandé: 3 à 6 ans</p>
            </div>

            {/* Class Selection */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">🏫</span>
                  Classe
                </span>
              </label>
              <select 
                value={classId} 
                onChange={e => setClassId(e.target.value)} 
                required 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black"
              >
                <option value="" className="text-black">Sélectionner une classe</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-black">{cls.name}</option>
                ))}
              </select>
              {classes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Aucune classe disponible. Créez d'abord une classe.</p>
              )}
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm mb-3">
                <span className="flex items-center">
                  <span className="mr-2">⚡</span>
                  Statut initial
                </span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={isActive === true} 
                    onChange={() => setIsActive(true)}
                    className="sr-only"
                  />
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    isActive === true 
                      ? 'border-green-400 bg-green-50 text-green-700' 
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${isActive === true ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span className="font-medium">Actif</span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={isActive === false} 
                    onChange={() => setIsActive(false)}
                    className="sr-only"
                  />
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    isActive === false 
                      ? 'border-gray-400 bg-gray-50 text-gray-700' 
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${isActive === false ? 'bg-gray-500' : 'bg-slate-300'}`}></div>
                    <span className="font-medium">Inactif</span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">Par défaut, les nouveaux élèves sont actifs</p>
            </div>

            {/* Success Preview */}
            {name && age && classId && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                <div className="flex items-center text-green-700 mb-2">
                  <span className="mr-2">✨</span>
                  <span className="font-medium">Aperçu du profil</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-green-800">{name}</p>
                    <p className="text-sm text-green-600">
                      {age} ans • {classes.find(c => c.id === classId)?.name} • {isActive ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center text-red-700">
                  <span className="mr-2">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <span className="mr-2">✕</span>
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading || classes.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Ajouter l'élève
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}