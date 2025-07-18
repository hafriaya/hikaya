"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/src/lib/firebase';

export default function AddClassPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [level, setLevel] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [teacher, setTeacher] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setTeacher(user);
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Le nom de la classe est requis');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await addDoc(collection(db, 'class'), {
                name: name.trim(),
                description: description.trim(),
                level: level.trim(),
                isActive,
                teacherId: teacher?.uid,
                createdAt: serverTimestamp(),
            });

            router.push('/users/teacher/dashboard?tab=classes');
        } catch (err) {
            setError('Erreur lors de l\'ajout de la classe: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!teacher) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
                    <p className="text-slate-700 text-lg font-medium">Vérification de l'authentification...</p>
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
                        <span className="mr-3">🏫</span>
                        Ajouter une classe
                    </h1>
                    <p className="text-slate-600">Créez une nouvelle classe pour organiser vos élèves</p>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                    <div className="space-y-6">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="block text-slate-700 font-medium text-sm">
                                <span className="flex items-center">
                                    <span className="mr-2">📝</span>
                                    Nom de la classe *
                                </span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 placeholder-black text-black"
                                placeholder="Ex: Classe A, Petite Section, etc."
                            />
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <label className="block text-slate-700 font-medium text-sm">
                                <span className="flex items-center">
                                    <span className="mr-2">📄</span>
                                    Description
                                </span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 placeholder-black text-black"
                                placeholder="Description optionnelle de la classe..."
                            />
                        </div>

                        {/* Level Field */}
                        <div className="space-y-2">
                            <label className="block text-slate-700 font-medium text-sm">
                                <span className="flex items-center">
                                    <span className="mr-2">📊</span>
                                    Niveau
                                </span>
                            </label>
                            <select
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black"
                            >
                                <option value="" className="text-black">Sélectionner un niveau</option>
                                <option value="Petite Section" className="text-black">Petite Section</option>
                                <option value="Moyenne Section" className="text-black">Moyenne Section</option>
                                <option value="Grande Section" className="text-black">Grande Section</option>
                                <option value="CP" className="text-black">CP</option>
                                <option value="CE1" className="text-black">CE1</option>
                            </select>
                        </div>

                        {/* Active Status */}
                        <div className="space-y-2">
                            <label className="block text-slate-700 font-medium text-sm mb-3">
                                <span className="flex items-center">
                                    <span className="mr-2">⚡</span>
                                    Statut de la classe
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
                                        <span className="font-medium">Active</span>
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
                                        <span className="font-medium">Inactive</span>
                                    </div>
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">Par défaut, les nouvelles classes sont actives</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">💾</span>
                                        Enregistrer la classe
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