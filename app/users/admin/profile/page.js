"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { ArrowLeft, Edit3, Save, X, UserIcon, Mail, Shield, Calendar, LogOut, Settings, Bell } from 'lucide-react';

export default function AdminProfile() {
    const router = useRouter();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role === 'admin') {
                        setAdmin({ id: user.uid, ...userData });
                        setEditedProfile({ id: user.uid, ...userData });
                    } else {
                        router.push('/login');
                    }
                } else {
                    router.push('/login');
                }
            } else {
                router.push('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, 'users', admin.id), {
                fullName: editedProfile.fullName,
                email: editedProfile.email,
                updatedAt: new Date()
            });
            setAdmin(editedProfile);
            setIsEditing(false);
            alert('Profil mis à jour avec succès');
        } catch (error) {
            alert('Erreur lors de la mise à jour: ' + error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(getAuth());
            router.push('/login');
        } catch (error) {
            alert('Erreur lors de la déconnexion: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
        );
    }

    if (!admin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-slate-600">Accès non autorisé</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
                    >
                        Retour à la connexion
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
                                onClick={() => router.push('/users/admin/dashboard')}
                                className="p-2 bg-white/60 rounded-full hover:bg-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="Hikaya Logo" className="w-8 h-8 rounded-xl shadow-lg" />
                                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Mon Profil
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <Save className="w-4 h-4" />
                                        Sauvegarder
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedProfile(admin);
                                        }}
                                        className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Modifier
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* Profile Header */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                            {admin.fullName?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedProfile.fullName}
                                    onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                                    className="text-3xl font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-slate-800">{admin.fullName}</h1>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                                    Administrateur
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                    Actif
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Informations personnelles</h3>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-500" />
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-600">Email</label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editedProfile.email}
                                                onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                            />
                                        ) : (
                                            <p className="text-slate-800">{admin.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Shield className="w-5 h-5 text-slate-500" />
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-600">Rôle</label>
                                        <p className="text-slate-800">Administrateur</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-slate-500" />
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-600">Membre depuis</label>
                                        <p className="text-slate-800">
                                            {admin.createdAt?.seconds 
                                                ? new Date(admin.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                                                : 'N/A'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-slate-800 mb-4">Actions rapides</h3>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/users/admin/dashboard')}
                                    className="w-full flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                                >
                                    <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-800">Gestion des utilisateurs</p>
                                        <p className="text-sm text-slate-600">Gérer les enseignants, parents et élèves</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => router.push('/users/admin/dashboard')}
                                    className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                                >
                                    <div className="p-2 bg-purple-500 rounded-lg text-white">
                                        <Settings className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-800">Paramètres système</p>
                                        <p className="text-sm text-slate-600">Configurer l'application</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => router.push('/users/admin/dashboard')}
                                    className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                                >
                                    <div className="p-2 bg-green-500 rounded-lg text-white">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-800">Notifications</p>
                                        <p className="text-sm text-slate-600">Voir les alertes système</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Informations système</h3>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-slate-700">ID Utilisateur</p>
                                    <p className="text-slate-600 font-mono break-all">{admin.id}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700">Dernière modification</p>
                                    <p className="text-slate-600">
                                        {admin.updatedAt?.seconds 
                                            ? new Date(admin.updatedAt.seconds * 1000).toLocaleDateString('fr-FR')
                                            : 'Jamais modifié'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-700">Statut</p>
                                    <p className="text-slate-600">Administrateur actif</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                onClick={() => router.push('/users/admin/dashboard')}
                                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Retour au tableau de bord
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 