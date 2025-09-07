"use client";

import React from 'react';
import { UserIcon, Eye } from 'lucide-react';
import Link from 'next/link';

export default function ChildrenList({ childrenData, readingHistory }) {
    if (childrenData.length === 0) {
        return (
            <div className="col-span-full bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center text-slate-500 border border-white/20">
                <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg">Aucun enfant enregistré</p>
                <p className="text-sm text-slate-400 mt-2">Contactez lContactez l'enseignant pour ajouter vos enfantsapos;enseignant pour ajouter vos enfants</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {childrenData.map((child) => {
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
            })}
        </div>
    );
}
