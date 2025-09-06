"use client";

import React from "react";
import { UserIcon, GraduationCapIcon, Users, Menu, X, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { getAuth } from "firebase/auth";

export default function AdminNavigation({ 
    activeTab, 
    setActiveTab, 
    setSearch, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    showProfileMenu, 
    setShowProfileMenu, 
    admin, 
    router 
}) {
    const navItems = [
        { id: "dashboard", label: "Tableau de bord", icon: UserIcon },
        { id: "teacher", label: "Enseignants", icon: GraduationCapIcon },
        { id: "parent", label: "Parents", icon: Users },
        { id: "student", label: "Élèves", icon: UserIcon }
    ];

    return (
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
                                {admin?.fullName?.charAt(0) || "A"}
                            </button>
                            {showProfileMenu && (
                                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-slate-100 min-w-[160px] py-2">
                                    <button
                                        className="px-4 py-2 hover:bg-slate-100 text-slate-700 text-sm w-full text-left"
                                        onClick={() => { setShowProfileMenu(false); router.push("/users/admin/profile"); }}
                                    >
                                        Profil
                                    </button>
                                    <button
                                        className="px-4 py-2 hover:bg-slate-100 text-red-600 text-sm w-full text-left flex items-center gap-2"
                                        onClick={async () => {
                                            await signOut(getAuth());
                                            if (router) router.push("/login");
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
                                            ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow"
                                            : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
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
                                        ? "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow"
                                        : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
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
    );
}
