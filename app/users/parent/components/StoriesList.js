"use client";

import React from 'react';
import { BookOpenIcon, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function StoriesList({ stories }) {
    if (stories.length === 0) {
        return (
            <div className="col-span-full bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center text-slate-500 border border-white/20">
                <BookOpenIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg">Aucune histoire pour le moment</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stories.map((story) => (
                <div key={story.id} className="group bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-xl transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <Link href={`/users/parent/stories/${story.id}`} legacyBehavior>
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
                        <Link href={`/users/parent/stories/${story.id}`} legacyBehavior>
                            <a className="w-full flex items-center justify-center gap-2 bg-indigo-100 text-indigo-600 py-2 px-4 rounded-xl font-medium text-sm hover:bg-indigo-200 transition-colors">
                                <BookOpen className="w-4 h-4" />
                                Voir les détails
                            </a>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
