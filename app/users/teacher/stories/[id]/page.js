"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Link from "next/link";
import { Edit3, Trash2, Calendar } from 'lucide-react';

export default function StoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [story, setStory] = useState(null);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storyDoc = await getDoc(doc(db, "story", id));
        if (!storyDoc.exists()) {
          setStory(null);
          setLoading(false);
          return;
        }
        setStory({ id: storyDoc.id, ...storyDoc.data() });
        const classSnap = await getDocs(collection(db, "class"));
        setClasses(classSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const studentsSnap = await getDocs(collection(db, "students"));
        setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        // Fetch readingHistory for this story
        const rhQuery = query(collection(db, "readingHistory"), where("storyId", "==", id));
        const rhSnap = await getDocs(rhQuery);
        setReaders(rhSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette histoire ? Cette action est irréversible.")) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "story", id));
      router.push("/users/teacher/dashboard");
    } catch (err) {
      setError("Erreur lors de la suppression : " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Chargement...</div>;
  }
  if (!story) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            !
          </div>
          <p className="text-red-600 text-xl font-semibold mb-6">Histoire introuvable</p>
          <Link href="/users/teacher/dashboard" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }
  const classNames = story.classIds && story.classIds.length > 0
    ? story.classIds.map(cid => classes.find(c => c.id === cid)?.name || cid).join(", ")
    : "Toutes les classes";
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium rounded-xl hover:bg-white/50 transition-all duration-200 mb-4"
          >
            <span className="mr-2">←</span>
            Retour
          </button>
          <div className="flex gap-2">
            <Link href={`/users/teacher/stories/edit/${story.id}`} legacyBehavior>
              <a className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-medium hover:bg-slate-200 transition">
                <Edit3 className="w-4 h-4" /> Modifier
              </a>
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold shadow transition disabled:opacity-60"
            >
              <Trash2 className="w-5 h-5" />
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            {story.illustrationUrl && (
              <img src={story.illustrationUrl} alt="Illustration" className="w-32 h-32 object-cover rounded-xl border border-slate-200" />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{story.title}</h1>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  story.language === 'Français' ? 'bg-blue-100 text-blue-700' :
                  story.language === 'Anglais' ? 'bg-green-100 text-green-700' :
                  story.language === 'Arabe' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-pink-100 text-pink-700'
                }`}>
                  {story.language}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${story.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{story.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="text-slate-500 text-sm mb-2">Catégorie : {story.category || 'Aucune'}</div>
              <div className="text-slate-500 text-sm mb-2">Classes concernées : {classNames}</div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {story.createdAt && story.createdAt.seconds
                    ? new Date(story.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                    : story.createdAt || "N/A"}
                </span>
              </div>
              <div className="text-slate-700 text-base mt-4 whitespace-pre-line">{story.summary}</div>
            </div>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><span className="mr-2">👦</span> Élèves ayant lu cette histoire</h2>
          {readers.length === 0 ? (
            <div className="text-slate-500 text-sm">Aucun élève n'a encore lu cette histoire.</div>
          ) : (
            <ul className="space-y-3">
              {readers.map(rh => {
                const student = students.find(s => s.id === rh.studentId);
                return (
                  <li key={rh.id} className="flex items-center gap-4 bg-white/80 rounded-xl p-3 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {student?.name?.charAt(0) || 'E'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{student?.name || rh.studentId}</div>
                      <div className="text-slate-500 text-xs">Lu le {rh.readDate?.seconds ? new Date(rh.readDate.seconds * 1000).toLocaleDateString('fr-FR') : ''}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-6">
            <div className="flex items-center text-red-700">
              <span className="mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 