"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function ParentProfilePage() {
  const router = useRouter();
  const [parent, setParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState({ children: 0, storiesRead: 0, totalTime: 0 });
  
  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'parent') {
              setParent(userData);
              setFullName(userData.fullName || "");
              setEmail(userData.email || user.email || "");
              setPhone(userData.phone || "");
              setAddress(userData.address || "");
              setBio(userData.bio || "");
              
              // Fetch parent's statistics
              await fetchParentStats(user.uid);
            } else {
              router.push('/login');
            }
          } else {
            setParent({ email: user.email });
            setEmail(user.email || "");
          }
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

  const fetchParentStats = async (parentId) => {
    try {
      // Fetch children
      const childrenQuery = query(collection(db, "students"), where("parentId", "==", parentId));
      const childrenSnapshot = await getDocs(childrenQuery);
      const childrenData = childrenSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      
      // Fetch reading history for all children
      const childIds = childrenData.map(child => child.id);
      const readingHistoryData = [];
      
      for (const childId of childIds) {
        const historyQuery = query(collection(db, "readingHistory"), where("studentId", "==", childId));
        const historySnapshot = await getDocs(historyQuery);
        const childHistory = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        readingHistoryData.push(...childHistory);
      }
      
      const totalReadingTime = readingHistoryData.reduce((total, record) => total + (record.readingTime || 0), 0);
      
      setStats({
        children: childrenData.length,
        storiesRead: readingHistoryData.length,
        totalTime: totalReadingTime
      });
    } catch (err) {
      console.error("Error fetching parent stats:", err);
    }
  };

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
        address: address.trim(),
        bio: bio.trim(),
        updatedAt: new Date(),
      });
      
      setSuccess("Profil mis à jour avec succès !");
      setParent(prev => ({
        ...prev,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
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
            <span className="mr-3">👨‍👩‍👧‍👦</span>
            Mon Profil Parent
          </h1>
          <p className="text-slate-600">Gérez vos informations personnelles et familiales</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
                  {parent?.fullName?.charAt(0) || parent?.email?.charAt(0) || 'P'}
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-1">
                  {parent?.fullName || 'Parent'}
                </h2>
                <p className="text-slate-500 text-sm">{parent?.email}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">👶</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Enfants</p>
                    <p className="text-lg font-bold text-green-600">{stats.children}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📚</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Histoires lues</p>
                    <p className="text-lg font-bold text-blue-600">{stats.storiesRead}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 text-lg">⏱️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Temps total</p>
                    <p className="text-lg font-bold text-purple-600">{stats.totalTime} min</p>
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

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <span className="mr-2">🏠</span>
                    Adresse
                  </h3>
                  <div className="space-y-2">
                    <label className="block text-slate-700 font-medium text-sm">
                      Adresse complète
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black placeholder-slate-400"
                      placeholder="Votre adresse complète"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="block text-slate-700 font-medium text-sm">
                    <span className="flex items-center">
                      <span className="mr-2">📖</span>
                      À propos de vous
                    </span>
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black placeholder-slate-400"
                    placeholder="Parlez-nous un peu de vous et de votre famille..."
                  />
                  <p className="text-xs text-slate-500">Partagez vos préférences de lecture et vos objectifs pour vos enfants</p>
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
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
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