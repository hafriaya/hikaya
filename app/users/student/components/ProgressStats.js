"use client";

import React from 'react';

export default function ProgressStats({ readCount, totalStories }) {
    if (readCount === 0) return null;

    return (
        <div className="mb-6 sm:mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-4 border-yellow-400 shadow-xl relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-2 right-2 text-xl sm:text-2xl">⭐</div>
                <div className="absolute bottom-2 left-2 text-xl sm:text-2xl">🏆</div>
                
                <div className="flex flex-col sm:flex-row items-center justify-between relative z-10 gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-center bg-gradient-to-br from-blue-400 to-purple-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                            <div className="text-2xl sm:text-3xl font-black">{readCount}</div>
                            <div className="text-xs sm:text-sm font-bold">📚 Histoires lues</div>
                        </div>
                        <div className="hidden sm:block w-2 h-16 bg-gradient-to-b from-pink-400 to-yellow-400 rounded-full"></div>
                        <div className="text-center bg-gradient-to-br from-green-400 to-blue-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                            <div className="text-2xl sm:text-3xl font-black">{totalStories}</div>
                            <div className="text-xs sm:text-sm font-bold"> Disponibles</div>
                        </div>
                    </div>
                    <div className="text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                        <div className="text-xs sm:text-sm font-bold mb-1">🏆 Ton Score</div>
                        <div className="text-xl sm:text-2xl font-black">
                            {Math.round((readCount / Math.max(totalStories, 1)) * 100)}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
