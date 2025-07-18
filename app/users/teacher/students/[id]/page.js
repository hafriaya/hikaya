"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import Link from "next/link";

export default function StudentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [student, setStudent] = useState(null);
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [readingProgress, setReadingProgress] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Fetch reading progress
      const rpQuery = query(collection(db, "readingProgress"), where("studentId", "==", id));
      const rpSnap = await getDocs(rpQuery);
      setReadingProgress(rpSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
        <div className="bg-white/80 rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }
  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
        <div className="bg-white/80 rounded-2xl shadow-lg p-8 text-center">
          <p className="text-red-500 text-lg font-semibold mb-4">Élève introuvable</p>
          <Link href="/users/teacher/dashboard" className="text-indigo-600 hover:underline">Retour au tableau de bord</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col items-center p-4">
      <div className="w-full max-w-xl bg-white/80 rounded-2xl shadow-xl p-6 mt-6">
        <button onClick={() => router.back()} className="mb-4 text-indigo-600 hover:underline text-sm">&larr; Retour</button>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {student.name?.charAt(0) || "E"}
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{student.name}</div>
            <div className="text-slate-500 text-sm">{className}</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-1 ${student.isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
              {student.isActive ? "Actif" : "Inactif"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-slate-500 text-xs">Âge</div>
            <div className="text-lg font-semibold">{student.age || "-"}</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-slate-500 text-xs">Livres lus</div>
            <div className="text-lg font-semibold">{student.booksRead || 0}</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-slate-500 text-xs">Date d'inscription</div>
            <div className="text-lg font-semibold">{student.createdAt?.seconds ? new Date(student.createdAt.seconds * 1000).toLocaleDateString() : "-"}</div>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <div className="text-slate-500 text-xs">Enseignant</div>
            <div className="text-lg font-semibold">{teacherName || "-"}</div>
          </div>
        </div>
        <div className="mb-2 text-lg font-semibold text-slate-800">Progression de lecture</div>
        {readingProgress.length === 0 ? (
          <div className="text-slate-500 text-sm">Aucune progression de lecture trouvée.</div>
        ) : (
          <ul className="space-y-2">
            {readingProgress.map((rp) => (
              <li key={rp.id} className="bg-white/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-medium text-indigo-700">{rp.storyTitle || rp.storyId}</span>
                  <span className="ml-2 text-slate-500 text-xs">{rp.progress ? `Progression: ${rp.progress}%` : null}</span>
                </div>
                <div className="text-slate-400 text-xs mt-1 sm:mt-0">
                  {rp.timestamp?.seconds ? new Date(rp.timestamp.seconds * 1000).toLocaleString() : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 