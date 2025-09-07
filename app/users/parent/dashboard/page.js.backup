"use client";

import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { UserIcon, BookOpenIcon, BarChart3Icon, Bell, Settings, Search, Menu, X, Eye, Calendar, TrendingUp, Award, Users, BookOpen, Clock, Star } from 'lucide-react';
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';

export default function ParentDashboard() {
    const [children, setChildren] = useState([]);
    const [stories, setStories] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [parent, setParent] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;
    const profileMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const settingsRef = useRef(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData.role === 'parent') {
                            setParent(userData);
                            await fetchParentData(user.uid);
                        } else {
                            router.push('/login');
                        }
                    } else {
                        setParent({ email: user.email });
                    }
                } catch (err) {
                    console.error("Error fetching parent data:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchParentData = async (parentId) => {
        try {
            // Fetch children
            const childrenQuery = query(collection(db, "students"), where("parentId", "==", parentId));
            const childrenSnapshot = await getDocs(childrenQuery);
            const childrenData = childrenSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setChildren(childrenData);

            // Fetch stories (all available stories for children)
            const storiesSnapshot = await getDocs(collection(db, "story"));
            const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setStories(storiesData);

            // Fetch reading history for all children
            const childIds = childrenData.map(child => child.id);
            const readingHistoryData = [];
            
            for (const childId of childIds) {
                const historyQuery = query(collection(db, "readingHistory"), where("studentId", "==", childId));
                const historySnapshot = await getDocs(historyQuery);
                const childHistory = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                readingHistoryData.push(...childHistory);
            }
            
            setReadingHistory(readingHistoryData);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    // Calculate statistics
    const totalStoriesRead = readingHistory.length;
    const totalReadingTime = readingHistory.reduce((total, record) => total + (record.readingTime || 0), 0);
    const averageReadingTime = children.length > 0 ? Math.round(totalReadingTime / children.length) : 0;
    const favoriteLanguage = stories.reduce((acc, story) => {
        acc[story.language] = (acc[story.language] || 0) + 1;
        return acc;
    }, {});
    const mostReadLanguage = Object.keys(favoriteLanguage).length > 0 
        ? Object.keys(favoriteLanguage).reduce((a, b) => favoriteLanguage[a] > favoriteLanguage[b] ? a : b)
        : 'Français';

    // Chart data
    const readingProgressData = children.map(child => {
        const childHistory = readingHistory.filter(record => record.studentId === child.id);
        return {
            name: child.name,
            storiesRead: childHistory.length,
            totalTime: childHistory.reduce((total, record) => total + (record.readingTime || 0), 0)
        };
    });

    const weeklyReadingData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayHistory = readingHistory.filter(record => {
            const recordDate = new Date(record.createdAt?.seconds * 1000);
            return recordDate >= dayStart && recordDate <= dayEnd;
        });
        
        return {
            day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
            stories: dayHistory.length,
            time: dayHistory.reduce((total, record) => total + (record.readingTime || 0), 0)
        };
    }).reverse();

    const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981'];

    // Search logic
    const filteredChildren = children.filter(child => child.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredStories = stories.filter(story => story.title?.toLowerCase().includes(search.toLowerCase()));

    // Add effect to close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        }
        if (showProfileMenu || showNotifications || showSettings) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu, showNotifications, showSettings]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl text-center border border-white/20 p-8">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 animate-pulse"></div>
                    </div>
                    <p className="text-slate-600 text-lg font-medium">Chargement de votre tableau de bord...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3Icon },
        { id: 'children', label: 'Mes Enfants', icon: UserIcon },
        { id: 'stories', label: 'Histoires', icon: BookOpenIcon },
        { id: 'progress', label: 'Progrès', icon: TrendingUp }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-white/20 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <img 
                            src="/logo.png" 
                            alt="Hikaya Logo" 
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl shadow-lg"
                        />
                        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Hikaya</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex flex-1 justify-center">
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

                    {/* Mobile Menu Button & Profile */}
                    <div className="flex items-center gap-2 relative">
                        <button 
                            className="md:hidden p-2 bg-white/60 rounded-full hover:bg-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
                        </button>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="relative" ref={notificationsRef}>
                                <button 
                                    className="p-2 bg-white/60 rounded-full hover:bg-white transition-colors relative"
                                    onClick={() => setShowNotifications(v => !v)}
                                >
                                    <Bell className="w-5 h-5 text-slate-600" />
                                    {totalStoriesRead > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {totalStoriesRead}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-slate-100 min-w-[280px] py-2 flex flex-col text-left">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <h3 className="font-semibold text-slate-800">Notifications</h3>
                                        </div>
                                        {totalStoriesRead > 0 ? (
                                            <div className="px-4 py-2">
                                                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{totalStoriesRead} histoires lues</p>
                                                        <p className="text-xs text-slate-500">Excellent travail !</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="px-4 py-4 text-center text-slate-500 text-sm">
                                                Aucune nouvelle notification
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="relative" ref={settingsRef}>
                                <button 
                                    className="p-2 bg-white/60 rounded-full hover:bg-white transition-colors"
                                    onClick={() => setShowSettings(v => !v)}
                                >
                                    <Settings className="w-5 h-5 text-slate-600" />
                                </button>
                                {showSettings && (
                                    <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-slate-100 min-w-[200px] py-2 flex flex-col text-left">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <h3 className="font-semibold text-slate-800">Paramètres</h3>
                                        </div>
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2"
                                            onClick={() => { setShowSettings(false); }}
                                        >
                                            <span>🎨</span>
                                            Apparence
                                        </button>
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2"
                                            onClick={() => { setShowSettings(false); }}
                                        >
                                            <span>🌐</span>
                                            Langue
                                        </button>
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2"
                                            onClick={() => { setShowSettings(false); }}
                                        >
                                            <span>🔒</span>
                                            Confidentialité
                                        </button>
                                        <div className="border-t border-slate-100 mt-1">
                                            <button
                                                className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2 w-full"
                                                onClick={() => { setShowSettings(false); }}
                                            >
                                                <span>❓</span>
                                                Aide & Support
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base cursor-pointer relative"
                            onClick={() => setShowProfileMenu(v => !v)}
                            ref={profileMenuRef}
                        >
                            {parent ? (parent.fullName?.charAt(0) || parent.email?.charAt(0) || 'P') : 'P'}
                            {showProfileMenu && (
                                <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-slate-100 min-w-[160px] py-2 flex flex-col text-left">
                                    <button
                                        className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left"
                                        onClick={() => { setShowProfileMenu(false); router.push('/users/parent/profile'); }}
                                    >
                                        Profil
                                    </button>
                                    <button
                                        className="px-4 py-2 hover:bg-slate-100 text-red-600 text-sm text-left"
                                        onClick={async () => {
                                            setShowProfileMenu(false);
                                            await signOut(getAuth());
                                            if (router) router.push('/login');
                                        }}
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/20 bg-white/95 backdrop-blur">
                        <div className="px-4 py-2">
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
                            <div className="border-t border-slate-200 mt-2 pt-2">
                                <button
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                    onClick={() => { setShowNotifications(v => !v); setIsMobileMenuOpen(false); }}
                                >
                                    <Bell className="w-5 h-5" />
                                    Notifications {totalStoriesRead > 0 && `(${totalStoriesRead})`}
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                    onClick={() => { setShowSettings(v => !v); setIsMobileMenuOpen(false); }}
                                >
                                    <Settings className="w-5 h-5" />
                                    Paramètres
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        {activeTab === 'dashboard' ? 'Tableau de Bord Parent' :
                         activeTab === 'children' ? 'Mes Enfants' :
                         activeTab === 'stories' ? 'Histoires Disponibles' :
                         'Progrès de Lecture'}
                    </h2>
                    <p className="text-slate-500 text-sm">Suivez le progrès de lecture de vos enfants</p>
                </div>

                {/* Search Bar */}
                {(activeTab === 'children' || activeTab === 'stories') && (
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'children' ? 'Rechercher un enfant...' : 'Rechercher une histoire...'}
                                className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-slate-400"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Dashboard Content */}
                <div className="space-y-6 sm:space-y-8">
                    {activeTab === 'dashboard' && (
                        <>
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-500 to-indigo-500 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover:text-green-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{children.length}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Enfants</div>
                                        <div className="text-xs sm:text-sm mt-1 text-green-600 group-hover:text-green-100 transition-colors">Inscrits</div>
                                    </div>
                                </div>
                                
                                <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-green-500 to-emerald-500 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover:text-green-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{totalStoriesRead}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Histoires Lues</div>
                                        <div className="text-xs sm:text-sm mt-1 text-green-600 group-hover:text-green-100 transition-colors">Total</div>
                                    </div>
                                </div>
                                
                                <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-purple-500 to-pink-500 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:text-blue-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{averageReadingTime}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Min Moyen</div>
                                        <div className="text-xs sm:text-sm mt-1 text-blue-600 group-hover:text-blue-100 transition-colors">Par lecture</div>
                                    </div>
                                </div>
                                
                                <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-orange-500 to-red-500 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                                <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 group-hover:text-orange-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{mostReadLanguage}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Langue Préférée</div>
                                        <div className="text-xs sm:text-sm mt-1 text-orange-600 group-hover:text-orange-100 transition-colors">Favori</div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6">Progrès par Enfant</h3>
                                    <div className="h-48 sm:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={readingProgressData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="name" fontSize={10} />
                                                <YAxis fontSize={10} />
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Bar dataKey="storiesRead" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                                                <defs>
                                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#6366F1" />
                                                        <stop offset="100%" stopColor="#8B5CF6" />
                                                    </linearGradient>
                                                </defs>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6">Activité Hebdomadaire</h3>
                                    <div className="h-48 sm:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={weeklyReadingData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="day" fontSize={10} />
                                                <YAxis fontSize={10} />
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <Line type="monotone" dataKey="stories" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'children' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {children.slice(0, 3).map((child, i) => (
                                                <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold border-2 border-white">
                                                    {child.name?.charAt(0) || 'E'}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-slate-600 text-sm sm:text-base">+{Math.max(0, children.length - 3)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Children Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {filteredChildren.length === 0 ? (
                                    <div className="col-span-full bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center text-slate-500 border border-white/20">
                                        <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg">Aucun enfant enregistré</p>
                                        <p className="text-sm text-slate-400 mt-2">Contactez l'enseignant pour ajouter vos enfants</p>
                                    </div>
                                ) : (
                                    filteredChildren.map((child) => {
                                        const childHistory = readingHistory.filter(record => record.studentId === child.id);
                                        const totalStoriesRead = childHistory.length;
                                        const totalReadingTime = childHistory.reduce((total, record) => total + (record.readingTime || 0), 0);
                                        
                                        return (
                                            <div key={child.id} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-xl transition-all duration-300">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="p-3 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl text-white">
                                                        <UserIcon className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-sm text-slate-500">
                                                        {totalStoriesRead} histoires
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-800 mb-2">{child.name}</h3>
                                                <p className="text-slate-600 mb-4">{child.age || 'N/A'} ans</p>
                                                <div className="space-y-2 mb-4">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Histoires lues:</span>
                                                        <span className="font-medium text-slate-800">{totalStoriesRead}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Temps total:</span>
                                                        <span className="font-medium text-slate-800">{totalReadingTime} min</span>
                                                    </div>
                                                </div>
                                                <Link href={`/users/parent/children/${child.id}`} legacyBehavior>
                                                    <a className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-600 py-2 px-4 rounded-xl font-medium text-sm hover:bg-green-200 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                        Voir détails
                                                    </a>
                                                </Link>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'stories' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                                <div className="flex items-center gap-4">
                                    <div className="text-slate-600 text-sm sm:text-base">
                                        <span className="font-medium">{stories.length}</span> histoires disponibles
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {filteredStories.length === 0 ? (
                                    <div className="col-span-full bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center text-slate-500 border border-white/20">
                                        <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg">Aucune histoire pour le moment</p>
                                    </div>
                                ) : (
                                    filteredStories.map((story) => (
                                        <div key={story.id} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-xl transition-all duration-300">
                                            <div className="flex justify-between items-start mb-4">
                                                <Link href={`/users/parent/stories/${story.id}`} legacyBehavior>
                                                    <a className="font-semibold text-indigo-700 hover:underline text-lg">{story.title}</a>
                                                </Link>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    story.language === 'Français' ? 'bg-blue-100 text-blue-700' :
                                                    story.language === 'English' ? 'bg-green-100 text-green-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {story.language}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {story.createdAt && story.createdAt.seconds
                                                        ? new Date(story.createdAt.seconds * 1000).toLocaleDateString()
                                                        : story.createdAt || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/users/parent/stories/${story.id}`} legacyBehavior>
                                                    <a className="w-full flex items-center justify-center gap-2 bg-indigo-100 text-indigo-600 py-2 px-4 rounded-xl font-medium text-sm hover:bg-indigo-200 transition-colors">
                                                        <BookOpen className="w-4 h-4" />
                                                        Voir les détails
                                                    </a>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                                <h3 className="text-lg font-semibold text-slate-800 mb-4">Historique de Lecture</h3>
                                {readingHistory.length === 0 ? (
                                    <div className="text-center text-slate-500 py-8">
                                        <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg">Aucun historique de lecture</p>
                                        <p className="text-sm text-slate-400 mt-2">Commencez à lire des histoires avec vos enfants</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {readingHistory.slice(0, 10).map((record) => {
                                            const child = children.find(c => c.id === record.studentId);
                                            const story = stories.find(s => s.id === record.storyId);
                                            
                                            return (
                                                <div key={record.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {child?.name?.charAt(0) || 'E'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium text-slate-800">{story?.title || 'Histoire inconnue'}</div>
                                                        <div className="text-sm text-slate-500">Lu par {child?.name || 'Enfant'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-slate-800">{record.readingTime || 0} min</div>
                                                        <div className="text-xs text-slate-500">
                                                            {record.createdAt && record.createdAt.seconds
                                                                ? new Date(record.createdAt.seconds * 1000).toLocaleDateString()
                                                                : 'N/A'}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
} 