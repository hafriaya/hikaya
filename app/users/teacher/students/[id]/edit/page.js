"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [classId, setClassId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "class"));
      setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const studentDoc = await getDoc(doc(db, "students", id));
      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setName(data.name || "");
        setAge(data.age || "");
        setClassId(data.classId || "");
        setIsActive(data.isActive ?? true);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateDoc(doc(db, "students", id), {
        name,
        age: Number(age),
        classId,
        isActive,
      });
      router.push(`/users/teacher/students/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-slate-700 text-lg font-medium">Chargement...</p>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Modifier l'élève</h1>
          <p className="text-slate-600">Modifiez les informations de l'élève ci-dessous</p>
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
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-indigo-400 focus:outline-none text-black placeholder-black"
                placeholder="Entrez le nom de l'élève"
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
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-indigo-400 focus:outline-none text-black placeholder-black"
                placeholder="Âge de l'élève"
              />
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
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-indigo-400 focus:outline-none text-black bg-white"
              >
                <option value="" className="text-black">Sélectionner une classe</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-black">{cls.name}</option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm mb-3">
                <span className="flex items-center">
                  <span className="mr-2">⚡</span>
                  Statut
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
            </div>

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
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Enregistrer les modifications
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