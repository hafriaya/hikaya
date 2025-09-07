"use client";

import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ search, setSearch, placeholder }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 bg-white/60 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black placeholder-slate-400"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>
    );
}
