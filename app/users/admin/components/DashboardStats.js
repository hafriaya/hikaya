"use client";

import React from 'react';
import { UserIcon, GraduationCapIcon, Users, Bell } from 'lucide-react';

export default function DashboardStats({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                        <UserIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-bold mb-2 text-slate-800">{stats.total}</div>
                <div className="font-medium text-slate-600">Total Utilisateurs</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                        <GraduationCapIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-bold mb-2 text-slate-800">{stats.teachers}</div>
                <div className="font-medium text-slate-600">Enseignants</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                        <Users className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-bold mb-2 text-slate-800">{stats.parents}</div>
                <div className="font-medium text-slate-600">Parents</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                        <UserIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-bold mb-2 text-slate-800">{stats.students}</div>
                <div className="font-medium text-slate-600">Élèves</div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl text-white">
                        <Bell className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-bold mb-2 text-slate-800">{stats.active}</div>
                <div className="font-medium text-slate-600">Actifs</div>
            </div>
        </div>
    );
}
