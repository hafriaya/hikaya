"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Save, UserIcon, Mail, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUserEdit() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        role: 'student',
        isActive: true
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role === 'admin') {
                        setAdmin(userData);
                    } else {
                        router.push('/login');
                    }
                } else {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', params.id));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({ id: userDoc.id, ...userData });
                    setFormData({
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        role: userData.role || 'student',
                        isActive: userData.isActive !== undefined ? userData.isActive : true
                    });
                } else {
                    alert('Utilisateur non trouvé');
                    router.push('/users/admin/dashboard');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user:', error);
                setLoading(false);
            }
        };
        fetchUser();
    }, [params.id, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, 'users', user.id), {
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role,
                isActive: formData.isActive,
                updatedAt: new Date()
            });
            alert('Utilisateur mis à jour avec succès');
            router.push(`/users/admin/users/${user.id}`);
        } catch (error) {
            alert('Erreur lors de la mise à jour: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-slate-600">Utilisateur non trouvé</p>
                    <button 
                        onClick={() => router.push('/users/admin/dashboard')}
                        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => router.push(`/users/admin/users/${user.id}`)}
                                className="p-2 bg-white/60 rounded-full hover:bg-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Hikaya Logo" className="w-8 h-8 rounded-xl shadow-lg" />
                                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Modifier l'Utilisateur
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto p-4 sm:p-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* User Header */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Modifier {user.fullName}</h1>
                            <p className="text-slate-600">Mettez à jour les informations de l'utilisateur</p>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <UserIcon className="w-4 h-4 inline mr-2" />
                                Nom complet
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                placeholder="Entrez le nom complet"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                placeholder="Entrez l'email"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Shield className="w-4 h-4 inline mr-2" />
                                Rôle
                            </label>
                                                            <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                >
                                    <option value="student">Élève</option>
                                    <option value="teacher">Enseignant</option>
                                    <option value="parent">Parent</option>
                                </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {formData.isActive ? <CheckCircle className="w-4 h-4 inline mr-2 text-green-500" /> : <XCircle className="w-4 h-4 inline mr-2 text-red-500" />}
                                Statut
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="isActive"
                                        value="true"
                                        checked={formData.isActive === true}
                                        onChange={() => setFormData({...formData, isActive: true})}
                                        className="text-indigo-500"
                                    />
                                    <span className="text-slate-700">Actif</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="isActive"
                                        value="false"
                                        checked={formData.isActive === false}
                                        onChange={() => setFormData({...formData, isActive: false})}
                                        className="text-indigo-500"
                                    />
                                    <span className="text-slate-700">Inactif</span>
                                </label>
                            </div>
                        </div>

                        {/* User Info Display */}
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h3 className="font-medium text-slate-700 mb-2">Informations système</h3>
                            <div className="text-sm text-slate-600 space-y-1">
                                <p><strong>ID:</strong> {user.id}</p>
                                <p><strong>Créé le:</strong> {user.createdAt?.seconds 
                                    ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                                    : 'N/A'
                                }</p>
                                {user.createdBy && <p><strong>Créé par:</strong> {user.createdBy}</p>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => router.push(`/users/admin/users/${user.id}`)}
                                className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Sauvegarder
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
} 