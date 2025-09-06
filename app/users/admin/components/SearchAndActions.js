"use client";

import React from 'react';
import { Search, Plus, Upload } from 'lucide-react';
import Link from 'next/link';

export default function SearchAndActions({ 
    search, 
    setSearch, 
    setShowAddUserModal 
}) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-slate-400"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter un Utilisateur
                </button>
                <Link href="/users/admin/students/import">
                    <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-green-500/25">
                        <Upload className="w-5 h-5" />
                        Import Étudiants
                    </button>
                </Link>
            </div>
        </div>
    );
}
