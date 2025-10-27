"use client";

import React from 'react';
import { BookOpen } from 'lucide-react';

export default function KidLoadingScreen({ message = "Préparation magique..." }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating shapes */}
            <div className="absolute top-20 left-20 w-16 h-16 bg-yellow-300 rounded-full opacity-70 animate-bounce"></div>
            <div className="absolute top-40 right-32 w-12 h-12 bg-pink-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-blue-400 rounded-full opacity-50 animate-bounce delay-300"></div>
            
            <div className="text-center z-10">
                <div className="mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white animate-pulse">
                        <BookOpen className="w-16 h-16 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-purple-800 mb-4">✨ {message} ✨</h2>
                <p className="text-xl text-purple-700 font-bold">Tes aventures arrivent ! 🚀🌈</p>
                
                {/* Loading dots */}
                <div className="flex justify-center mt-6 space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
                </div>
            </div>
        </div>
    );
}

