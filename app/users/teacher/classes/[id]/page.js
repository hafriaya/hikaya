"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/src/lib/firebase';

export default function ClassDetailsPage() {
    const [classData, setClassData] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [teacher, setTeacher] = useState(null);
    const params = useParams();
    const router = useRouter();
    const classId = params.id;

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setTeacher(user);
                await fetchClassData();
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [classId, router]);

    const fetchClassData = async () => {
        try {
            // Fetch class data
            const classDoc = await getDoc(doc(db, 'class', classId));
            if (!classDoc.exists()) {
                setError('Classe non trouvée');
                setLoading(false);
                return;
            }
            setClassData({ id: classDoc.id, ...classDoc.data() });

            // Fetch students in this class
            const studentsQuery = query(collection(db, 'students'), where('classId', '==', classId));
            const studentsSnapshot = await getDocs(studentsQuery);
            const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(studentsData);

            setLoading(false);
        } catch (err) {
            setError('Erreur lors du chargement: ' + err.message);
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible et supprimera tous les élèves associés.")) {
            return;
        }

        setDeleting(true);
        try {
            // Delete all students in this class
            for (const student of students) {
                // Delete reading history for each student
                const rhQuery = query(collection(db, "readingHistory"), where("studentId", "==", student.id));
                const rhSnap = await getDocs(rhQuery);
                await Promise.all(rhSnap.docs.map(docu => deleteDoc(docu.ref)));
                
                // Delete the student
                await deleteDoc(doc(db, "students", student.id));
            }

            // Delete the class
            await deleteDoc(doc(db, "class", classId));
            
            router.push('/users/teacher/dashboard?tab=classes');
        } catch (err) {
            setError('Erreur lors de la suppression: ' + err.message);
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
                    <p className="text-slate-700 text-lg font-medium">Chargement des détails de la classe...</p>
                </div>
            </div>
        );
    }

    if (error && !classData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => router.back()} 
                        className="text-indigo-600 hover:text-indigo-700"
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => router.back()} 
                        className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium rounded-xl hover:bg-white/50 transition-all duration-200 mb-4"
                    >
                        <span className="mr-2">←</span>
                        Retour
                    </button>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                                <span className="text-2xl">🏫</span>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">{classData?.name}</h1>
                                <p className="text-slate-600">{classData?.description || 'Aucune description'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-60"
                            >
                                <span>🗑️</span>
                                {deleting ? "Suppression..." : "Supprimer"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Class Information Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <span className="text-2xl">🏫</span>
                            </div>
                            <h3 className="font-semibold text-slate-800">Informations de la classe</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-slate-500">Nom:</span>
                                <p className="font-medium text-slate-800">{classData?.name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-500">Niveau:</span>
                                <p className="font-medium text-slate-800">{classData?.level || 'Non spécifié'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-500">Statut:</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    classData?.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {classData?.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm text-slate-500">Créée le:</span>
                                <p className="font-medium text-slate-800">
                                    {classData?.createdAt?.seconds ? new Date(classData.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 rounded-xl">
                                <span className="text-2xl">📊</span>
                            </div>
                            <h3 className="font-semibold text-slate-800">Statistiques</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm text-slate-500">Nombre d'élèves:</span>
                                <p className="text-3xl font-bold text-slate-800">{students.length}</p>
                            </div>
                            <div>
                                <span className="text-sm text-slate-500">Élèves actifs:</span>
                                <p className="font-medium text-slate-800">
                                    {students.filter(s => s.isActive).length} / {students.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-xl">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="font-semibold text-slate-800">Actions</h3>
                        </div>
                        <div className="space-y-3">
                            <button 
                                onClick={() => router.push('/users/teacher/students/add')}
                                className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 px-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                            >
                                👨‍🎓 Ajouter un élève
                            </button>
                            <button 
                                onClick={() => router.push(`/users/teacher/classes/${classId}/edit`)}
                                className="block w-full bg-slate-100 text-slate-700 text-center py-2 px-4 rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                ✏️ Modifier la classe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-slate-800">👨‍🎓 Élèves de la classe</h3>
                        <span className="text-slate-500">{students.length} élève(s)</span>
                    </div>

                    {students.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <span className="text-6xl mb-4 block">👨‍🎓</span>
                            <p className="text-lg">Aucun élève dans cette classe</p>
                            <button 
                                onClick={() => router.push('/users/teacher/students/add')}
                                className="inline-block mt-4 text-indigo-600 hover:text-indigo-700"
                            >
                                Ajouter le premier élève
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map((student) => (
                                <div key={student.id} className="bg-white/80 rounded-2xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {student.name?.charAt(0) || 'E'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-800">{student.name}</h4>
                                            <p className="text-sm text-slate-500">{student.age} ans</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            student.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                            {student.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                        <button 
                                            onClick={() => router.push(`/users/teacher/students/${student.id}`)}
                                            className="text-indigo-600 hover:text-indigo-700 text-sm"
                                        >
                                            Voir détails
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
} 