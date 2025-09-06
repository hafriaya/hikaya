"use client";

import React from "react";
import { UserIcon } from "lucide-react";

export default function StudentsTable({ students, getClassName }) {
    return (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
            <div className="grid grid-cols-5 gap-6 p-6 bg-slate-50/50 border-b border-slate-200 font-semibold text-slate-700">
                <div>Nom</div>
                <div>Âge</div>
                <div>Classe</div>
                <div>Statut</div>
                <div>Actions</div>
            </div>
            {students.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                    <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg">Aucun étudiant trouvé</p>
                </div>
            ) : (
                students.map((student) => (
                    <div key={student.id} className="grid grid-cols-5 gap-6 p-6 border-b border-slate-100 items-center hover:bg-white/40 transition-colors">
                        <div className="font-semibold text-slate-800">{student.name || student.fullName}</div>
                        <div className="text-slate-700">{student.age}</div>
                        <div className="text-slate-700">{getClassName(student.classId || student.classid)}</div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            student.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                            {student.isActive ? "Actif" : "Inactif"}
                        </div>
                        <div className="flex gap-2">
                            {/* Add actions if needed */}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
