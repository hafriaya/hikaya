"use client";

import React, { useEffect, useState } from 'react';
import { UserIcon, GraduationCapIcon, Users, Plus, Eye, Edit3, Trash2, Search, Bell, Settings, Menu, X, LogOut, Upload } from 'lucide-react';
import { collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc, setDoc, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [admin, setAdmin] = useState(null);
    const [search, setSearch] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

    // Add user form state
    const [newUser, setNewUser] = useState({
        fullName: '',
        email: '',
        password: '',
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
                        // Redirect non-admin users
                        if (router) router.push('/login');
                    }
                } else {
                    if (router) router.push('/login');
                }
            } else {
                if (router) router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setUsers(usersData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filter users by role and search (exclude admin users from display)
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                             user.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = activeTab === 'dashboard' || user.role === activeTab;
        // Don't show admin users in the table
        return matchesSearch && matchesRole && user.role !== 'admin';
    });

    // Stats calculation
    const stats = {
        total: users.length,
        teachers: users.filter(u => u.role === 'teacher').length,
        parents: users.filter(u => u.role === 'parent').length,
        students: users.filter(u => u.role === 'student').length,
        active: users.filter(u => u.isActive).length
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            
            if (newUser.password) {
                // For now, we'll create a user document without Firebase Auth to avoid logout
                // In a production app, you'd use Firebase Admin SDK on the backend
                const userData = {
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role,
                    isActive: newUser.isActive,
                    createdAt: Timestamp.now(),
                    createdBy: admin?.uid || 'admin',
                    hasPassword: true // Flag to indicate this user has a password
                };
                
                const docRef = await addDoc(collection(db, "users"), userData);
                setUsers(prev => [...prev, { id: docRef.id, ...userData }]);
                setShowAddUserModal(false);
                setNewUser({ fullName: '', email: '', password: '', role: 'student', isActive: true });
                alert("Utilisateur créé avec succès! L'utilisateur devra utiliser 'Mot de passe oublié' pour définir son mot de passe.");
                return;
            } else {
                // Create user document without Firebase Auth
                const userData = {
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role,
                    isActive: newUser.isActive,
                    createdAt: Timestamp.now(),
                    createdBy: admin?.uid || 'admin',
                    hasPassword: false
                };
                
                const docRef = await addDoc(collection(db, "users"), userData);
                setUsers(prev => [...prev, { id: docRef.id, ...userData }]);
                setShowAddUserModal(false);
                setNewUser({ fullName: '', email: '', password: '', role: 'student', isActive: true });
                alert("Utilisateur créé avec succès! L'utilisateur pourra se connecter avec Google.");
                return;
            }
        } catch (error) {
            alert("Erreur lors de la création de l'utilisateur: " + error.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            alert("Erreur lors de la suppression: " + error.message);
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isActive: !currentStatus
            });
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, isActive: !currentStatus } : u
            ));
        } catch (error) {
            alert("Erreur lors de la mise à jour: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
        );
    }

    const navItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: UserIcon },
        { id: 'teacher', label: 'Enseignants', icon: GraduationCapIcon },
        { id: 'parent', label: 'Parents', icon: Users },
        { id: 'student', label: 'Élèves', icon: UserIcon }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur border-b border-white/20 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Hikaya Logo" className="w-8 h-8 rounded-xl shadow-lg" />
                            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Hikaya Admin
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button 
                                className="md:hidden p-2 bg-white/60 rounded-full hover:bg-white transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                            
                            <div className="relative">
                                <button 
                                    className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                    {admin?.fullName?.charAt(0) || 'A'}
                                </button>
                                {showProfileMenu && (
                                    <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-100 min-w-[160px] py-2">
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm w-full text-left"
                                            onClick={() => { setShowProfileMenu(false); router.push('/users/admin/profile'); }}
                                        >
                                            Profil
                                        </button>
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-red-600 text-sm w-full text-left flex items-center gap-2"
                                            onClick={async () => {
                                                await signOut(getAuth());
                                                if (router) router.push('/login');
                                            }}
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Déconnexion
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur mt-3">
                            <div className="px-4 py-2 space-y-2">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setIsMobileMenuOpen(false);
                                            setSearch("");
                                        }}
                                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                                            activeTab === item.id
                                                ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow'
                                                : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex justify-center mt-4">
                        <div className="flex gap-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setSearch(""); }}
                                    className={`flex flex-col items-center px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 min-w-[100px] ${
                                        activeTab === item.id
                                            ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow'
                                            : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mb-1" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {activeTab === 'dashboard' ? 'Tableau de Bord Admin' :
                         activeTab === 'teacher' ? 'Gestion des Enseignants' :
                         activeTab === 'parent' ? 'Gestion des Parents' :
                         'Gestion des Élèves'}
                    </h2>
                    <p className="text-slate-500">Administration des utilisateurs Hikaya</p>
                </div>

                {/* Search and Add Button */}
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur..."
                            className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-slate-400"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAddUserModal(true)}
                            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Ajouter un Utilisateur
                        </button>
                        <Link href="/users/admin/students/import">
                            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-500/25">
                                <Upload className="w-5 h-5" />
                                Import Étudiants
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Dashboard Stats */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2 text-slate-800">{stats.total}</div>
                            <div className="font-medium text-slate-600">Total Utilisateurs</div>
                        </div>
                        

                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                                    <GraduationCapIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2 text-slate-800">{stats.teachers}</div>
                            <div className="font-medium text-slate-600">Enseignants</div>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2 text-slate-800">{stats.parents}</div>
                            <div className="font-medium text-slate-600">Parents</div>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2 text-slate-800">{stats.students}</div>
                            <div className="font-medium text-slate-600">Élèves</div>
                        </div>
                        
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl text-white">
                                    <Bell className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold mb-2 text-slate-800">{stats.active}</div>
                            <div className="font-medium text-slate-600">Actifs</div>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid grid-cols-5 gap-6 p-6 bg-slate-50/50 border-b border-slate-200 font-semibold text-slate-700">
                        <div>Utilisateur</div>
                        <div>Email</div>
                        <div>Rôle</div>
                        <div>Statut</div>
                        <div>Actions</div>
                    </div>
                    
                    {filteredUsers.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <p className="text-lg">Aucun utilisateur trouvé</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div key={user.id} className="grid grid-cols-5 gap-6 p-6 border-b border-slate-100 items-center hover:bg-white/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {user.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-800">{user.fullName}</div>
                                        <div className="text-sm text-slate-500">Utilisateur</div>
                                    </div>
                                </div>
                                <div className="text-slate-700">{user.email}</div>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                                    user.role === 'parent' ? 'bg-purple-100 text-purple-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {user.role === 'teacher' ? 'Enseignant' :
                                     user.role === 'parent' ? 'Parent' : 'Élève'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                    }`}>
                                        {user.isActive ? "Actif" : "Inactif"}
                                    </div>
                                    <button
                                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            user.isActive 
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                                        }`}
                                    >
                                        {user.isActive ? 'Désactiver' : 'Activer'}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/users/admin/users/${user.id}`}>
                                        <button className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </Link>
                                    <Link href={`/users/admin/users/${user.id}/edit`}>
                                        <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </Link>
                                    <button 
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Ajouter un Utilisateur</h3>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                    value={newUser.fullName}
                                    onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                    value={newUser.email}
                                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe (optionnel)</label>
                                <input
                                    type="password"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                    value={newUser.password}
                                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                                    placeholder="Laissez vide pour Google Auth"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Rôle</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                                    value={newUser.role}
                                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                                >
                                    <option value="student">Élève</option>
                                    <option value="teacher">Enseignant</option>
                                    <option value="parent">Parent</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={newUser.isActive}
                                    onChange={e => setNewUser({...newUser, isActive: e.target.checked})}
                                    className="rounded"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Utilisateur actif</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
                                >
                                    Ajouter
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 