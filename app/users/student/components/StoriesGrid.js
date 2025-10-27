"use client";

import React from 'react';
import { BookOpen, Play, Heart, Trophy } from 'lucide-react';

export default function StoriesGrid({ 
    filteredStories, 
    hasReadStory, 
    favorites, 
    toggleFavorite, 
    markStoryAsRead, 
    openPDFInNewTab,
    showReadBooks,
    isLoadingQuiz = false
}) {
    if (filteredStories.length === 0) {
        return (
            <div className="col-span-full text-center py-8 sm:py-12">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-4 border-orange-400 shadow-xl max-w-md mx-auto">
                    <div className="text-4xl sm:text-6xl mb-4">📚</div>
                    <h3 className="text-lg sm:text-2xl font-black text-orange-600 mb-2 sm:mb-4">
                        {showReadBooks ? 'Aucune histoire terminée !' : 
                         'Pas d&apos;histoires pour le moment !'}
                    </h3>
                    <p className="text-orange-500 font-bold text-sm sm:text-lg">
                        {showReadBooks ? 'Lis des histoires pour les voir ici ! 📖' : 
                         'Demande à ton maître de t&apos;en ajouter ! ✨'}
                    </p>
                </div>
            </div>
        );
    }

    const colors = [
        'from-pink-400 to-purple-500',
        'from-blue-400 to-teal-500', 
        'from-yellow-400 to-orange-500',
        'from-green-400 to-blue-500',
        'from-purple-400 to-pink-500',
        'from-red-400 to-yellow-500'
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredStories.map((story, index) => {
                const isRead = hasReadStory(story.id);
                const isFavorite = favorites.includes(story.id);
                const cardColor = colors[index % colors.length];
                
                return (
                    <div key={story.id} className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                        <div className="relative">
                            {/* Super Fun Book Cover */}
                            <div className="aspect-[3/4] bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-4 border-white relative group-hover:shadow-2xl transition-all duration-300">
                                {story.illustrationUrl ? (
                                    <img 
                                        src={story.illustrationUrl} 
                                        alt={story.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${cardColor} flex items-center justify-center relative overflow-hidden`}>
                                        {/* Decorative elements */}
                                        <div className="absolute top-2 left-2 text-lg sm:text-2xl">⭐</div>
                                        <div className="absolute top-2 right-2 text-lg sm:text-2xl">✨</div>
                                        <div className="absolute bottom-2 left-2 text-lg sm:text-2xl">🌟</div>
                                        
                                        <div className="text-center text-white z-10">
                                            <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
                                            <div className="text-sm sm:text-lg font-black drop-shadow-lg">Histoire Magique</div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Fun Read Status Badge */}
                                {isRead && (
                                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                            <div className="text-sm sm:text-lg">🏆</div>
                                        </div>
                                    </div>
                                )}

                                {/* Favorite Badge */}
                                {isFavorite && (
                                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                                            <div className="text-sm sm:text-lg">💖</div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Colorful Language Badge */}
                                <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                                    <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-black shadow-lg border-2 border-white ${
                                        story.language === 'Français' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                                        story.language === 'English' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' :
                                        'bg-gradient-to-r from-yellow-500 to-red-500 text-white'
                                    }`}>
                                        {story.language === 'Français' ? '🇫🇷' : story.language === 'English' ? '🇬🇧' : '🌍'} {story.language}
                                    </div>
                                </div>
                            </div>

                            {/* Super Fun Interactive Icons */}
                            <div className="mt-3 sm:mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg border-2 border-white" onClick={e => {e.preventDefault(); alert('🎵 Lecture audio arrive bientôt !')}}>
                                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </button>
                                    <button 
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg border-2 border-white ${isFavorite ? 'bg-gradient-to-r from-pink-400 to-red-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                                        onClick={e => {e.preventDefault(); toggleFavorite(story.id)}}
                                    >
                                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-white' : 'text-gray-300'}`} />
                                    </button>
                                </div>
                                <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    ⚡ {Math.floor(Math.random() * 1000) + 100}
                                </div>
                            </div>

                            {/* Fun Story Title */}
                            <h3 className="font-black text-purple-800 text-sm sm:text-base mt-2 sm:mt-3 line-clamp-2 leading-tight drop-shadow-sm">
                                {story.title}
                            </h3>
                            
                            {/* Super Fun Action Button - Only show for unread books */}
                            {!isRead && !showReadBooks && (
                                <button
                                    onClick={(e) => {e.preventDefault(); markStoryAsRead(story.id)}}
                                    disabled={isLoadingQuiz}
                                    className={`w-full mt-2 sm:mt-3 py-2 sm:py-3 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl border-2 border-white transition-all ${
                                        isLoadingQuiz 
                                            ? 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 cursor-not-allowed opacity-70' 
                                            : 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:shadow-xl hover:scale-105'
                                    }`}
                                >
                                    {isLoadingQuiz ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Chargement...</span>
                                        </div>
                                    ) : (
                                        '✨ J\'ai lu cette histoire ! 🎉'
                                    )}
                                </button>
                            )}
                            
                            {/* Completed Badge - Only show for read books */}
                            {isRead && (
                                <div className="w-full mt-2 sm:mt-3 py-2 sm:py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl border-2 border-white flex items-center justify-center gap-1 sm:gap-2">
                                    <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Terminé ! 🌟
                                </div>
                            )}
                        </div>
                        <button
                            className="w-full mt-2 sm:mt-3 py-2 sm:py-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:shadow-xl transition-all hover:scale-105 border-2 border-white"
                            onClick={e => {
                                e.preventDefault();
                                if (story.pdfUrl) {
                                    openPDFInNewTab(story.pdfUrl);
                                } else {
                                    alert('PDF non disponible pour cette histoire !');
                                }
                            }}
                        >
                            📖 Lire le PDF
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
