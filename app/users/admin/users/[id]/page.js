"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Edit3, Trash2, Save, X, UserIcon, Mail, Calendar, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function AdminUserDetails() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [admin, setAdmin] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(null);

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
                    setEditedUser({ id: userDoc.id, ...userData });
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

    const handleSave = async () => {
        try {
            await updateDoc(doc(db, 'users', user.id), {
                fullName: editedUser.fullName,
                email: editedUser.email,
                role: editedUser.role,
                isActive: editedUser.isActive
            });
            setUser(editedUser);
            setIsEditing(false);
            alert('Utilisateur mis à jour avec succès');
        } catch (error) {
            alert('Erreur lors de la mise à jour: ' + error.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            return;
        }
        try {
            await deleteDoc(doc(db, 'users', user.id));
            alert('Utilisateur supprimé avec succès');
            router.push('/users/admin/dashboard');
        } catch (error) {
            alert('Erreur lors de la suppression: ' + error.message);
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

    const getRoleColor = (role) => {
        switch (role) {
            case 'teacher': return 'bg-blue-100 text-blue-700';
            case 'parent': return 'bg-purple-100 text-purple-700';
            case 'student': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'teacher': return 'Enseignant';
            case 'parent': return 'Parent';
            case 'student': return 'Élève';
            default: return role;
        }
    };

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
                                    Détails Utilisateur
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
                                            setEditedUser(user);
                                        }}
                                        className="flex items-center gap-2 bg-slate-500 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Annuler
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* User Header */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                            {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editedUser.fullName}
                                    onChange={(e) => setEditedUser({...editedUser, fullName: e.target.value})}
                                    className="text-2xl font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <h1 className="text-2xl font-bold text-slate-800">{user.fullName}</h1>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                                    {getRoleLabel(user.role)}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                }`}>
                                    {user.isActive ? "Actif" : "Inactif"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informations de base</h3>
                            
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-slate-500" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-600">Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedUser.email}
                                            onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                        />
                                    ) : (
                                        <p className="text-slate-800">{user.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-slate-500" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-600">Rôle</label>
                                    {isEditing ? (
                                        <select
                                            value={editedUser.role}
                                            onChange={(e) => setEditedUser({...editedUser, role: e.target.value})}
                                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                        >
                                            <option value="student">Élève</option>
                                            <option value="teacher">Enseignant</option>
                                            <option value="parent">Parent</option>
                                        </select>
                                    ) : (
                                        <p className="text-slate-800">{getRoleLabel(user.role)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-500" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-600">Date de création</label>
                                    <p className="text-slate-800">
                                        {user.createdAt?.seconds 
                                            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {user.isActive ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-slate-600">Statut</label>
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="isActive"
                                                checked={editedUser.isActive}
                                                onChange={(e) => setEditedUser({...editedUser, isActive: e.target.checked})}
                                                className="rounded"
                                            />
                                            <label htmlFor="isActive" className="text-slate-800">
                                                Utilisateur actif
                                            </label>
                                        </div>
                                    ) : (
                                        <p className="text-slate-800">
                                            {user.isActive ? "Actif" : "Inactif"}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informations système</h3>
                            
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="font-medium text-slate-700 mb-2">ID Utilisateur</h4>
                                <p className="text-sm text-slate-600 font-mono break-all">{user.id}</p>
                            </div>

                            {user.createdBy && (
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <h4 className="font-medium text-slate-700 mb-2">Créé par</h4>
                                    <p className="text-sm text-slate-600">{user.createdBy}</p>
                                </div>
                            )}

                            <div className="bg-slate-50 rounded-lg p-4">
                                <h4 className="font-medium text-slate-700 mb-2">Dernière modification</h4>
                                <p className="text-sm text-slate-600">
                                    {user.updatedAt?.seconds 
                                        ? new Date(user.updatedAt.seconds * 1000).toLocaleDateString('fr-FR')
                                        : 'Jamais modifié'
                                    }
                                </p>
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
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Sauvegarder les modifications
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                                >
                                    Modifier l'utilisateur
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 