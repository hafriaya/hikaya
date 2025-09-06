"use client";

import React from "react";
import { UserIcon, Eye, Edit3, Trash2 } from "lucide-react";
import Link from "next/link";

export default function UsersTable({ 
    filteredUsers, 
    handleToggleUserStatus, 
    handleDeleteUser 
}) {
    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-5 gap-6 p-6 bg-slate-50/50 border-b border-slate-200 font-semibold text-slate-700">
                <div>Utilisateur</div>
                <div>Email</div>
                <div>Rôle</div>
                <div>Statut</div>
                <div>Actions</div>
            </div>
            
            {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg">Aucun utilisateur trouvé</p>
                </div>
            ) : (
                filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-5 gap-6 p-6 border-b border-slate-100 items-center hover:bg-white/40 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user.fullName?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div className="font-semibold text-slate-800">{user.fullName}</div>
                                <div className="text-sm text-slate-500">Utilisateur</div>
                            </div>
                        </div>
                        <div className="text-slate-700">{user.email}</div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === "teacher" ? "bg-blue-100 text-blue-700" :
                            user.role === "parent" ? "bg-purple-100 text-purple-700" :
                            "bg-green-100 text-green-700"
                        }`}>
                            {user.role === "teacher" ? "Enseignant" :
                             user.role === "parent" ? "Parent" : "Élève"}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                            }`}>
                                {user.isActive ? "Actif" : "Inactif"}
                            </div>
                            <button
                                onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                    user.isActive 
                                        ? "bg-red-100 text-red-600 hover:bg-red-200" 
                                        : "bg-green-100 text-green-600 hover:bg-green-200"
                                }`}
                            >
                                {user.isActive ? "Désactiver" : "Activer"}
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <Link href={`/users/admin/users/${user.id}`}>
                                <button className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors">
                                    <Eye className="w-4 h-4" />
                                </button>
                            </Link>
                            <Link href={`/users/admin/users/${user.id}/edit`}>
                                <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                            </Link>
                            <button 
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                onClick={() => handleDeleteUser(user.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
