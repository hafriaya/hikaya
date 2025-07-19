"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function TeacherProfilePage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({ students: 0, stories: 0, classes: 0 });
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [subject, setSubject] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setTeacher(userData);
            setFullName(userData.fullName || "");
            setEmail(userData.email || user.email || "");
            setPhone(userData.phone || "");
            setSchool(userData.school || "");
            setSubject(userData.subject || "");
            setBio(userData.bio || "");
          } else {
            setTeacher({ email: user.email });
            setEmail(user.email || "");
          }

          // Fetch teacher's statistics
          const studentsQuery = query(collection(db, "students"), where("teacherId", "==", user.uid));
          const storiesQuery = query(collection(db, "story"), where("teacherId", "==", user.uid));
          const classesQuery = query(collection(db, "class"), where("teacherId", "==", user.uid));

          const [studentsSnap, storiesSnap, classesSnap] = await Promise.all([
            getDocs(studentsQuery),
            getDocs(storiesQuery),
            getDocs(classesQuery)
          ]);

          setStats({
            students: studentsSnap.size,
            stories: storiesSnap.size,
            classes: classesSnap.size
          });
        } catch (err) {
          setError("Erreur lors du chargement du profil");
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error("Non authentifié");
      
      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName.trim(),
        phone: phone.trim(),
        school: school.trim(),
        subject: subject.trim(),
        bio: bio.trim(),
        updatedAt: new Date(),
      });
      
      setSuccess("Profil mis à jour avec succès !");
      setTeacher(prev => ({
        ...prev,
        fullName: fullName.trim(),
        phone: phone.trim(),
        school: school.trim(),
        subject: subject.trim(),
        bio: bio.trim(),
      }));
    } catch (err) {
      setError("Erreur lors de la mise à jour : " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-slate-700 text-lg font-medium">Chargement du profil...</p>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            <span className="mr-3">👤</span>
            Mon Profil
          </h1>
          <p className="text-slate-600">Gérez vos informations personnelles et professionnelles</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                  {teacher?.fullName?.charAt(0) || teacher?.email?.charAt(0) || 'T'}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  {teacher?.fullName || 'Enseignant'}
                </h2>
                <p className="text-slate-500 text-sm">{teacher?.email}</p>
                {teacher?.school && (
                  <p className="text-slate-500 text-sm mt-1">🏫 {teacher.school}</p>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 text-lg">📚</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Histoires créées</p>
                    <p className="text-lg font-bold text-indigo-600">{stats.stories}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">👨‍🎓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Élèves</p>
                    <p className="text-lg font-bold text-green-600">{stats.students}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🏫</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Classes</p>
                    <p className="text-lg font-bold text-purple-600">{stats.classes}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-medium text-sm">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black placeholder-slate-400"
                        placeholder="Votre nom complet"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-medium text-sm">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                        placeholder="Votre email"
                      />
                      <p className="text-xs text-slate-500">L'email ne peut pas être modifié</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-medium text-sm">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black placeholder-slate-400"
                        placeholder="Votre numéro de téléphone"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <span className="mr-2">🏫</span>
                    Informations professionnelles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-medium text-sm">
                        École
                      </label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black placeholder-slate-400"
                        placeholder="Nom de votre école"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-slate-700 font-medium text-sm">
                        Matière principale
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black placeholder-slate-400"
                        placeholder="Ex: Français, Mathématiques..."
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="block text-slate-700 font-medium text-sm">
                    <span className="flex items-center">
                      <span className="mr-2">📖</span>
                      Biographie
                    </span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black placeholder-slate-400"
                    placeholder="Parlez-nous un peu de vous, de votre expérience en enseignement..."
                  />
                  <p className="text-xs text-slate-500">Décrivez votre expérience et vos objectifs pédagogiques</p>
                </div>

                {/* Messages */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <div className="flex items-center text-red-700">
                      <span className="mr-2">⚠️</span>
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center text-green-700">
                      <span className="mr-2">✅</span>
                      <span className="font-medium">{success}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                  >
                    <span className="mr-2">✕</span>
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💾</span>
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 