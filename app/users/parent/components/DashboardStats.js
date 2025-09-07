"use client";

import React from 'react';
import { UserIcon, BookOpen, Clock, Star, TrendingUp, Award, Calendar } from 'lucide-react';

export default function DashboardStats({ 
    childrenData, 
    totalStoriesRead, 
    averageReadingTime, 
    mostReadLanguage 
}) {
    return (
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
                    <div className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 group-hover:text-white transition-colors">{childrenData.length}</div>
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
    );
}
