"use client";

import React from 'react';
import { BookOpenIcon } from 'lucide-react';

export default function ReadingProgress({ readingHistory, childrenData, stories }) {
    if (readingHistory.length === 0) {
        return (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Historique de Lecture</h3>
                <div className="text-center text-slate-500 py-8">
                    <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg">Aucun historique de lecture</p>
                    <p className="text-sm text-slate-400 mt-2">Commencez à lire des histoires avec vos enfants</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Historique de Lecture</h3>
            <div className="space-y-4">
                {readingHistory.slice(0, 10).map((record) => {
                    const child = childrenData.find(c => c.id === record.studentId);
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
        </div>
    );
}
