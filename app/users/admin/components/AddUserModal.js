"use client";

import React from "react";

export default function AddUserModal({ 
    showAddUserModal, 
    setShowAddUserModal, 
    newUser, 
    setNewUser, 
    handleAddUser 
}) {
    if (!showAddUserModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Ajouter un Utilisateur</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nom complet</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={newUser.fullName}
                            onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={newUser.email}
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe (optionnel)</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={newUser.password}
                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                            placeholder="Laissez vide pour Google Auth"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Rôle</label>
                        <select
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                            value={newUser.role}
                            onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="student">Élève</option>
                            <option value="teacher">Enseignant</option>
                            <option value="parent">Parent</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={newUser.isActive}
                            onChange={e => setNewUser({...newUser, isActive: e.target.checked})}
                            className="rounded"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Utilisateur actif</label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            Ajouter
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddUserModal(false)}
                            className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
