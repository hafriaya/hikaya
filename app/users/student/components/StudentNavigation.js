"use client";

import React from 'react';
import { BookOpen, Heart, Trophy } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function StudentNavigation({ 
    showFavorites, 
    setShowFavorites, 
    showReadBooks, 
    setShowReadBooks,
    student,
    handleLogout
}) {
    const router = useRouter();

    const handleShowAllBooks = () => {
        setShowFavorites(false);
        setShowReadBooks(false);
    };

    const handleShowFavorites = () => {
        setShowFavorites(true);
        setShowReadBooks(false);
    };

    const handleShowReadBooks = () => {
        setShowReadBooks(true);
        setShowFavorites(false);
    };

    return (
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 shadow-lg sticky top-0 z-40 border-b-4 border-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Left side - Logo */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-xl sm:text-3xl font-black text-white drop-shadow-lg">
                            🌈 Hikaya 📚
                        </div>
                    </div>

                    {/* Center Navigation - Kid Style */}
                    <div className="hidden sm:flex items-center gap-4">
                        <button 
                            onClick={handleShowAllBooks}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all ${
                                !showFavorites && !showReadBooks 
                                    ? 'bg-white/90 backdrop-blur text-purple-600' 
                                    : 'bg-white/50 backdrop-blur text-purple-400 hover:bg-white/70'
                            }`}
                        >
                            <BookOpen className="w-5 h-5" />
                            📖 Mes Livres
                        </button>
                        <button 
                            onClick={handleShowFavorites}
                            className={`flex items-center gap-2 p-3 text-white hover:text-yellow-300 transition-colors hover:scale-110 ${
                                showFavorites ? 'text-yellow-300' : ''
                            }`}
                        >
                            <Heart className="w-6 h-6" />
                        </button>
                        <button 
                            onClick={handleShowReadBooks}
                            className={`flex items-center gap-2 p-3 text-white hover:text-yellow-300 transition-colors hover:scale-110 ${
                                showReadBooks ? 'text-yellow-300' : ''
                            }`}
                        >
                            <Trophy className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Right side - User and Logout */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:block bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg">
                            <div className="text-sm font-bold text-purple-600">
                                👋 Salut {student?.fullName || 'Champion'} !
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all hover:scale-105 text-xs sm:text-sm border-2 border-white"
                        >
                            🚪 Sortir
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="sm:hidden mt-3 flex items-center justify-center gap-3">
                    <button 
                        onClick={handleShowAllBooks}
                        className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${
                            !showFavorites && !showReadBooks ? 'ring-2 ring-yellow-400' : ''
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        📖 Tous
                    </button>
                    <button 
                        onClick={handleShowFavorites}
                        className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${
                            showFavorites ? 'ring-2 ring-yellow-400' : ''
                        }`}
                    >
                        <Heart className="w-4 h-4" />
                        ❤️ Favoris
                    </button>
                    <button 
                        onClick={handleShowReadBooks}
                        className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${
                            showReadBooks ? 'ring-2 ring-yellow-400' : ''
                        }`}
                    >
                        <Trophy className="w-4 h-4" />
                        🏆 Lues
                    </button>
                </div>
            </div>
        </div>
    );
}
