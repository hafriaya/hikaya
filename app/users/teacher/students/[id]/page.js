"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Link from "next/link";
import { Trash2 } from 'lucide-react';

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [student, setStudent] = useState(null);
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [stories, setStories] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      // Delete all readingHistory for this student
      const rhQuery = query(collection(db, "readingHistory"), where("studentId", "==", id));
      const rhSnap = await getDocs(rhQuery);
      await Promise.all(rhSnap.docs.map(docu => deleteDoc(docu.ref)));
      // Delete the student
      await deleteDoc(doc(db, "students", id));
      router.push("/users/teacher/dashboard");
    } catch (err) {
      alert("Erreur lors de la suppression : " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      // Fetch student
      const studentDoc = await getDoc(doc(db, "students", id));
      if (!studentDoc.exists()) {
        setStudent(null);
        setLoading(false);
        return;
      }
      const studentData = studentDoc.data();
      setStudent(studentData);
      // Fetch class name
      if (studentData.classId) {
        const classDoc = await getDoc(doc(db, "class", studentData.classId));
        setClassName(classDoc.exists() ? classDoc.data().name : studentData.classId);
      }
      // Fetch teacher name (optional)
      if (studentData.teacherId) {
        const teacherDoc = await getDoc(doc(db, "users", studentData.teacherId));
        setTeacherName(teacherDoc.exists() ? teacherDoc.data().fullName || teacherDoc.data().email : studentData.teacherId);
      }
      // Fetch all stories
      const storiesSnap = await getDocs(collection(db, "story"));
      setStories(storiesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Fetch reading history
      const rhQuery = query(collection(db, "readingHistory"), where("studentId", "==", id));
      const rhSnap = await getDocs(rhQuery);
      setReadingHistory(rhSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Remove handleMarkAsRead and the button for marking as read
  // In the stories.map rendering, for each story:
  // If the student has read it (rh exists), show checkmark and date
  // If not, show nothing (no button)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-slate-700 text-lg font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            !
          </div>
          <p className="text-red-600 text-xl font-semibold mb-6">Élève introuvable</p>
          <Link 
            href="/users/teacher/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium rounded-xl hover:bg-white/50 transition-all duration-200"
          >
            <span className="mr-2">←</span>
            Retour
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                  {student.name?.charAt(0) || "E"}
                </div>
                <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white ${student.isActive ? "bg-green-500" : "bg-gray-400"}`}></div>
              </div>
              
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">{student.name}</h1>
                <p className="text-slate-600 text-lg mb-3">{className}</p>
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${student.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${student.isActive ? "bg-green-500" : "bg-gray-500"}`}></span>
                  {student.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-blue-600 text-sm font-medium">Âge</div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-xs">👤</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-900">{student.age || "-"}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-purple-600 text-sm font-medium">Livres lus</div>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 text-xs">📚</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-900">{student.booksRead || 0}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-green-600 text-sm font-medium">Inscription</div>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">📅</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-green-900">
                  {student.createdAt?.seconds ? new Date(student.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : "-"}
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-orange-600 text-sm font-medium">Enseignant</div>
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 text-xs">🎓</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-orange-900 truncate" title={teacherName || "-"}>
                  {teacherName || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Reading History Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                <span className="mr-3">📚</span>
                Histoires lues
              </h2>
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                {readingHistory.length} histoire{readingHistory.length !== 1 ? 's' : ''} lue{readingHistory.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="space-y-4">
              {stories.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Aucune histoire disponible.</div>
              ) : (
                stories.map((story) => {
                  const rh = readingHistory.find(r => r.storyId === story.id);
                  const isRead = !!rh;
                  return (
                    <div
                      key={story.id}
                      className={`flex items-center gap-4 rounded-2xl p-4 sm:p-6 border transition-all duration-200
                        ${isRead ? 'bg-green-50 border-green-400 shadow-green-100 shadow-lg' : 'bg-white/80 border-white/30 opacity-80'}
                      `}
                    >
                      <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center overflow-hidden">
                        {story.illustration ? (
                          <img src={story.illustration} alt={story.title} className="object-cover w-full h-full rounded-xl" />
                        ) : (
                          <span className="text-3xl text-indigo-400">📖</span>
                        )}
                        {isRead && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xl shadow-lg border-2 border-white">✔️</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`font-semibold text-lg mb-1 ${isRead ? 'text-green-800' : 'text-indigo-800'}`}>{story.title}</div>
                        <div className="text-slate-500 text-sm mb-1">{story.summary}</div>
                        {isRead && (
                          <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
                            <span>Lu le {rh.readDate?.seconds ? new Date(rh.readDate.seconds * 1000).toLocaleDateString('fr-FR') : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow transition disabled:opacity-60"
          >
            <Trash2 className="w-5 h-5" />
            {deleting ? "Suppression..." : "Supprimer l'élève"}
          </button>
        </div>
      </div>
    </div>
  );
}