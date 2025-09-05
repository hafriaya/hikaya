"use client";

import React, { useEffect, useRef, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { UserIcon, GraduationCapIcon, BookOpenIcon, BarChart3Icon, Bell, Settings, Search, Plus, Eye, Edit3, Trash2, Users, Calendar, TrendingUp, Award, Menu, X } from 'lucide-react';
import { collection, getDocs, doc, getDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function TeacherDashboard() {
    const [students, setStudents] = useState([]);
    const [stories, setStories] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [teacher, setTeacher] = useState(null);
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
                    // Fetch teacher profile
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setTeacher(userDoc.data());

                        // Fetch classes for this teacher
                        const classesQ = query(collection(db, "class"), where("teacherId", "==", user.uid));
                        const classesSnap = await getDocs(classesQ);
                        setClasses(classesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                        // Fetch students for this teacher
                        const studentsQ = query(collection(db, "students"), where("teacherId", "==", user.uid));
                        const studentsSnap = await getDocs(studentsQ);
                        setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                        // Fetch stories for this teacher
                        const storiesQ = query(collection(db, "story"), where("teacherId", "==", user.uid));
                        const storiesSnap = await getDocs(storiesQ);
                        setStories(storiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                    } else {
                        setTeacher(null);
                    }
                } catch (err) {
                    console.error("Error fetching teacher dashboard data:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setTeacher(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // --- Dynamic Stats ---
    // Students added this month
    const now = new Date();
    const studentsThisMonth = students.filter(s => {
        if (!s.createdAt?.seconds) return false;
        const created = new Date(s.createdAt.seconds * 1000);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    // Stories added this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0,0,0,0);
    const storiesThisWeek = stories.filter(story => {
        if (!story.createdAt?.seconds) return false;
        const created = new Date(story.createdAt.seconds * 1000);
        return created >= startOfWeek;
    }).length;
    // Number of unique levels (assuming class.level exists)
    const levels = Array.from(new Set(classes.map(cls => cls.level))).filter(Boolean);
    // Average students per class
    const classDistribution = students.reduce((acc, student) => {
        acc[student.classId] = (acc[student.classId] || 0) + 1;
        return acc;
    }, {});
    const averageStudentsPerClass = classes.length > 0 ? Math.round(students.length / classes.length) : 0;

    // --- Chart Data ---
    const classChartData = Object.entries(classDistribution).map(([classId, value]) => ({
        name: classes.find(cls => cls.id === classId)?.name || classId,
        value,
        percentage: Math.round((value / students.length) * 100)
    }));
    const languageDistribution = stories.reduce((acc, story) => {
        acc[story.language] = (acc[story.language] || 0) + 1;
        return acc;
    }, {});
    const languageChartData = Object.entries(languageDistribution).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / stories.length) * 100)
    }));
    const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981'];

    // --- UI Render ---
    const getClassName = (classId) => {
        const found = classes.find((cls) => cls.id === classId);
        return found ? found.name : classId;
    };

    const getStatsData = () => {
        const totalStudents = students.length;
        const totalStories = stories.length;
        const languageDistribution = stories.reduce((acc, story) => {
            acc[story.language] = (acc[story.language] || 0) + 1;
            return acc;
        }, {});
        const classDistribution = students.reduce((acc, student) => {
            const className = getClassName(student.classId);
            acc[className] = (acc[className] || 0) + 1;
            return acc;
        }, {});

        return {
            totalStudents,
            totalStories,
            languageDistribution,
            classDistribution,
            activeClasses: Object.keys(classDistribution).length,
            averageStudentsPerClass: totalStudents > 0 ? Math.round(totalStudents / Object.keys(classDistribution).length) : 0
        };
    };

    const stats = getStatsData();



    // Search logic
    const filteredStudents = students.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredStories = stories.filter(story => story.title?.toLowerCase().includes(search.toLowerCase()));
    const filteredClasses = classes.filter(cls => cls.name?.toLowerCase().includes(search.toLowerCase()));

    // Add effect to close profile menu on outside click
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
        { id: 'students', label: 'Élèves', icon: GraduationCapIcon },
        { id: 'stories', label: 'Histoires', icon: BookOpenIcon },
        { id: 'classes', label: 'Classes', icon: Users }
    ];

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.")) return;
        try {
            // Delete all readingHistory for this student
            const rhQuery = query(collection(db, "readingHistory"), where("studentId", "==", studentId));
            const rhSnap = await getDocs(rhQuery);
            await Promise.all(rhSnap.docs.map(docu => deleteDoc(docu.ref)));
            // Delete the student
            await deleteDoc(doc(db, "students", studentId));
            // Refresh students list
            setStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    };

    const handleDeleteStory = async (storyId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette histoire ? Cette action est irréversible.")) return;
        try {
            await deleteDoc(doc(db, "story", storyId));
            setStories(prev => prev.filter(s => s.id !== storyId));
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    };

    const handleDeleteClass = async (classId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible et supprimera tous les élèves associés.")) return;
        try {
            // Delete all students in this class
            const studentsInClass = students.filter(s => s.classId === classId);
            for (const student of studentsInClass) {
                // Delete reading history for each student
                const rhQuery = query(collection(db, "readingHistory"), where("studentId", "==", student.id));
                const rhSnap = await getDocs(rhQuery);
                await Promise.all(rhSnap.docs.map(docu => deleteDoc(docu.ref)));
                
                // Delete the student
                await deleteDoc(doc(db, "students", student.id));
            }
            
            // Delete the class
            await deleteDoc(doc(db, "class", classId));
            
            // Update local state
            setClasses(prev => prev.filter(c => c.id !== classId));
            setStudents(prev => prev.filter(s => s.classId !== classId));
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    };

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
                                    {studentsThisMonth > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {studentsThisMonth}
                                        </span>
                                    )}
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-slate-100 min-w-[280px] py-2 flex flex-col text-left">
                                        <div className="px-4 py-2 border-b border-slate-100">
                                            <h3 className="font-semibold text-slate-800">Notifications</h3>
                                        </div>
                                        {studentsThisMonth > 0 ? (
                                            <div className="px-4 py-2">
                                                <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{studentsThisMonth} nouvel(le)(s) élève(s) ce mois</p>
                                                        <p className="text-xs text-slate-500">Bienvenue dans votre classe !</p>
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
                                            onClick={() => { setShowSettings(false); /* TODO: Theme settings */ }}
                                        >
                                            <span>🎨</span>
                                            Apparence
                                        </button>
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2"
                                            onClick={() => { setShowSettings(false); /* TODO: Language settings */ }}
                                        >
                                            <span>🌐</span>
                                            Langue
                                        </button>
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2"
                                            onClick={() => { setShowSettings(false); /* TODO: Privacy settings */ }}
                                        >
                                            <span>🔒</span>
                                            Confidentialité
                                        </button>
                                        <div className="border-t border-slate-100 mt-1">
                                            <button
                                                className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2 w-full"
                                                onClick={() => { setShowSettings(false); /* TODO: Help/Support */ }}
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
                            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base cursor-pointer relative"
                            onClick={() => setShowProfileMenu(v => !v)}
                            ref={profileMenuRef}
                        >
                            {teacher ? (teacher.fullName?.charAt(0) || teacher.email?.charAt(0) || 'T') : 'T'}
                            {showProfileMenu && (
                                <div className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-slate-100 min-w-[160px] py-2 flex flex-col text-left">
                                    <button
                                        className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left"
                                        onClick={() => { setShowProfileMenu(false); router.push('/users/teacher/profile'); }}
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
                                    Notifications {studentsThisMonth > 0 && `(${studentsThisMonth})`}
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
                        {activeTab === 'dashboard' ? 'Tableau de Bord' :
                         activeTab === 'students' ? 'Gestion des Élèves' :
                         activeTab === 'stories' ? 'Gestion des Histoires' :
                         'Gestion des Classes'}
                    </h2>
                    <p className="text-slate-500 text-sm">Bienvenue dans votre espace d'enseignement</p>
                </div>
                {/* Search Bar: only for students, stories, classes */}
                {(activeTab === 'students' || activeTab === 'stories' || activeTab === 'classes') && (
                    <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'students' ? 'Rechercher un élève...' : activeTab === 'stories' ? 'Rechercher une histoire...' : 'Rechercher une classe...'}
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
                                                <GraduationCapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover:text-green-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{students.length}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Total Élèves</div>
                                        <div className="text-xs sm:text-sm mt-1 text-green-600 group-hover:text-green-100 transition-colors">+{studentsThisMonth} ce mois</div>
                                    </div>
                                </div>
                                
                                <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-green-500 to-emerald-500 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                                <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 group-hover:text-green-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{stories.length}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Total Histoires</div>
                                        <div className="text-xs sm:text-sm mt-1 text-green-600 group-hover:text-green-100 transition-colors">+{storiesThisWeek} cette semaine</div>
                                    </div>
                                </div>
                                
                                <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-purple-500 to-pink-500 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:text-blue-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{levels.length}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Niveaux</div>
                                        <div className="text-xs sm:text-sm mt-1 text-blue-600 group-hover:text-blue-100 transition-colors">4 niveaux</div>
                                    </div>
                                </div>
                                
                                <div className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">
                                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-orange-500 to-red-500 z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white group-hover:bg-white/20 transition-colors">
                                                <BarChart3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 group-hover:text-orange-100 transition-colors" />
                                        </div>
                                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{averageStudentsPerClass}</div>
                                        <div className="font-medium text-sm sm:text-base text-slate-600 group-hover:text-white transition-colors">Moy. Élèves/Classe</div>
                                        <div className="text-xs sm:text-sm mt-1 text-orange-600 group-hover:text-orange-100 transition-colors">Équilibré</div>
                                    </div>
                                </div>
                            </div>

                            {/* Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6">Répartition par Classe</h3>
                                    <div className="h-48 sm:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={classChartData}>
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
                                                <Bar dataKey="value" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
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
                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6">Langues des Histoires</h3>
                                    <div className="h-48 sm:h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={languageChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={60}
                                                    dataKey="value"
                                                    label={({ name, percentage }) => `${name} ${percentage}%`}
                                                    labelStyle={{ fontSize: '10px' }}
                                                >
                                                    {languageChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'students' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {students.slice(0, 3).map((student, i) => (
                                                <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold border-2 border-white">
                                                    {student.name?.charAt(0) || 'E'}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-slate-600 text-sm sm:text-base">+{Math.max(0, students.length - 3)}</span>
                                    </div>
                                </div>
                                <Link href="/users/teacher/students/add" legacyBehavior>
                                    <a className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25 text-sm sm:text-base">
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Ajouter un Élève
                                    </a>
                                </Link>
                            </div>
                            
                            {/* Mobile Cards View */}
                            <div className="block sm:hidden space-y-4">
                                {filteredStudents.length === 0 ? (
                                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center text-slate-500 border border-white/20">
                                        <GraduationCapIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg">Aucun élève pour le moment</p>
                                    </div>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <div key={student.id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-lg">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {student.name?.charAt(0) || 'E'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-slate-800">{student.name}</div>
                                                    <div className="text-sm text-slate-500">Élève</div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                                    {getClassName(student.classId)}
                                                </div>
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    student.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                    {student.isActive ? "Actif" : "Inactif"}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/users/teacher/students/${student.id}`} legacyBehavior>
                                                    <a className="flex-1 p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors flex items-center justify-center">
                                                        <Eye className="w-4 h-4 mx-auto" />
                                                    </a>
                                                </Link>
                                                <Link href={`/users/teacher/students/${student.id}/edit`} legacyBehavior>
                                                    <a className="flex-1 p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center">
                                                        <Edit3 className="w-4 h-4 mx-auto" />
                                                    </a>
                                                </Link>
                                                <button className="flex-1 p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    title="Supprimer l'élève"
                                                >
                                                    <Trash2 className="w-4 h-4 mx-auto" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
                                <div className="grid grid-cols-4 gap-6 p-6 bg-slate-50/50 border-b border-slate-200 font-semibold text-slate-700">
                                    <div>Élève</div>
                                    <div>Classe</div>
                                    <div>Statut</div>
                                    <div>Actions</div>
                                </div>
                                
                                {filteredStudents.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        <GraduationCapIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg">Aucun élève pour le moment</p>
                                    </div>
                                ) : (
                                    filteredStudents.map((student, index) => (
                                        <div key={student.id} className="grid grid-cols-4 gap-6 p-6 border-b border-slate-100 items-center hover:bg-white/40 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {student.name?.charAt(0) || 'E'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-800">{student.name}</div>
                                                    <div className="text-sm text-slate-500">Élève {student.isActive ? "Actif" : "Inactif"}</div>
                                                </div>
                                            </div>
                                            <div className="inline-flex items-center px-3 py-1 bg-indigo-500 text-white rounded-full text-sm font-medium">
                                                {getClassName(student.classId)}
                                            </div>
                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
    ${student.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
  {student.isActive ? "Actif" : "Inactif"}
</div>
                                            <div className="flex gap-2">
                                                <Link href={`/users/teacher/students/${student.id}`} legacyBehavior>
                                                    <a className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                </Link>
                                                <Link href={`/users/teacher/students/${student.id}/edit`} legacyBehavior>
                                                    <a className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                                                        <Edit3 className="w-4 h-4" />
                                                    </a>
                                                </Link>
                                                <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                    title="Supprimer l'élève"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
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
                                <Link href="/users/teacher/stories/add" legacyBehavior>
                                    <a className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-500/25 text-sm sm:text-base">
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Ajouter une Histoire
                                    </a>
                                </Link>
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
                                                <Link href={`/users/teacher/stories/${story.id}`} legacyBehavior>
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
                                                <Link href={`/users/teacher/stories/edit/${story.id}`} legacyBehavior>
                                                    <a className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-2 px-4 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors">
                                                        <Edit3 className="w-4 h-4" />
                                                        Modifier
                                                    </a>
                                                </Link>
                                                <button
                                                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 px-4 rounded-xl font-medium text-sm hover:bg-red-200 transition-colors"
                                                    onClick={() => handleDeleteStory(story.id)}
                                                    title="Supprimer l'histoire"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                                <div className="flex items-center gap-4">
                                    <div className="text-slate-600 text-sm sm:text-base">
                                        <span className="font-medium">{classes.length}</span> classes configurées
                                    </div>
                                </div>
                                <Link href="/users/teacher/classes/add" legacyBehavior>
                                    <a className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-purple-500/25 text-sm sm:text-base">
                                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Nouvelle Classe
                                    </a>
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {filteredClasses.length === 0 ? (
                                    <div className="col-span-full bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center text-slate-500 border border-white/20">
                                        <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg">Aucune classe pour le moment</p>
                                    </div>
                                ) : (
                                    filteredClasses.map((cls) => (
                                        <div key={cls.id} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-xl transition-all duration-300">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <div className="text-sm text-slate-500">
                                                    {students.filter(s => s.classId === cls.id).length} élèves
                                                </div>
                                            </div>
                                            <Link href={`/users/teacher/classes/${cls.id}`} legacyBehavior>
                                                <a className="text-lg font-semibold text-slate-800 hover:text-purple-600 transition-colors block mb-2">
                                                    {cls.name}
                                                </a>
                                            </Link>
                                            <p className="text-slate-600 mb-4">{cls.description || 'Aucune description disponible'}</p>
                                            <div className="flex gap-2">
                                                <Link href={`/users/teacher/classes/${cls.id}`} legacyBehavior>
                                                    <a className="flex-1 flex items-center justify-center gap-2 bg-purple-100 text-purple-600 py-2 px-4 rounded-xl font-medium text-sm hover:bg-purple-200 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                        Voir détails
                                                    </a>
                                                </Link>
                                                <Link href={`/users/teacher/classes/${cls.id}/edit`} legacyBehavior>
                                                    <a className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                                                        <Edit3 className="w-4 h-4" />
                                                    </a>
                                                </Link>
                                                <button
                                                    className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                                                    onClick={() => handleDeleteClass(cls.id)}
                                                    title="Supprimer la classe"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
