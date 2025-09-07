"use client";

import React, { useRef, useEffect } from 'react';
import { Bell, Settings, Menu, X } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ParentNavigation({ 
    activeTab, 
    setActiveTab, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen,
    showProfileMenu,
    setShowProfileMenu,
    showNotifications,
    setShowNotifications,
    showSettings,
    setShowSettings,
    totalStoriesRead,
    parent
}) {
    const router = useRouter();
    const profileMenuRef = useRef(null);
    const notificationsRef = useRef(null);
    const settingsRef = useRef(null);

    const navItems = [
        { id: 'dashboard', label: 'Tableau de bord', icon: 'BarChart3Icon' },
        { id: 'children', label: 'Mes Enfants', icon: 'UserIcon' },
        { id: 'stories', label: 'Histoires', icon: 'BookOpenIcon' },
        { id: 'progress', label: 'Progrès', icon: 'TrendingUp' }
    ];

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
    }, [showProfileMenu, showNotifications, showSettings, setShowProfileMenu, setShowNotifications, setShowSettings]);

    const handleSignOut = async () => {
        setShowProfileMenu(false);
        await signOut(getAuth());
        router.push('/login');
    };

    return (
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
                                onClick={() => setActiveTab(item.id)}
                                className={`flex flex-col items-center px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 min-w-[100px] ${
                                    activeTab === item.id
                                        ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow'
                                        : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                            >
                                <div className="w-5 h-5 mb-1">📊</div>
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
                                        onClick={() => setShowSettings(false)}
                                    >
                                        <span>🎨</span>
                                        Apparence
                                    </button>
                                    <button
                                        className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2"
                                        onClick={() => setShowSettings(false)}
                                    >
                                        <span>🌐</span>
                                        Langue
                                    </button>
                                    <button
                                        className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2"
                                        onClick={() => setShowSettings(false)}
                                    >
                                        <span>🔒</span>
                                        Confidentialité
                                    </button>
                                    <div className="border-t border-slate-100 mt-1">
                                        <button
                                            className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm text-left flex items-center gap-2 w-full"
                                            onClick={() => setShowSettings(false)}
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
                                    onClick={handleSignOut}
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
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                                    activeTab === item.id
                                        ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow'
                                        : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                            >
                                <div className="w-5 h-5">📊</div>
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
    );
}
