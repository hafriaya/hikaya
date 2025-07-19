"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { UserIcon, BookOpen, Clock, Calendar, TrendingUp, Star, ArrowLeft } from 'lucide-react';

export default function ChildDetailPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;
  
  const [child, setChild] = useState(null);
  const [readingHistory, setReadingHistory] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);

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
              await fetchChildData(childId, user.uid);
            } else {
              router.push('/login');
            }
          } else {
            router.push('/login');
          }
        } catch (err) {
          console.error("Error fetching data:", err);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [childId, router]);

  const fetchChildData = async (childId, parentId) => {
    try {
      // Fetch child data
      const childDoc = await getDoc(doc(db, "students", childId));
      if (childDoc.exists()) {
        const childData = childDoc.data();
        // Verify this child belongs to the current parent
        if (childData.parentId === parentId) {
          setChild({ id: childId, ...childData });
        } else {
          router.push('/users/parent/dashboard');
          return;
        }
      } else {
        router.push('/users/parent/dashboard');
        return;
      }

      // Fetch reading history for this child
      const historyQuery = query(collection(db, "readingHistory"), where("studentId", "==", childId));
      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReadingHistory(historyData);

      // Fetch all stories
      const storiesSnapshot = await getDocs(collection(db, "story"));
      const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);
    } catch (err) {
      console.error("Error fetching child data:", err);
    }
  };

  // Calculate statistics
  const totalStoriesRead = readingHistory.length;
  const totalReadingTime = readingHistory.reduce((total, record) => total + (record.readingTime || 0), 0);
  const averageReadingTime = totalStoriesRead > 0 ? Math.round(totalReadingTime / totalStoriesRead) : 0;
  
  // Get favorite language
  const languageCount = {};
  readingHistory.forEach(record => {
    const story = stories.find(s => s.id === record.storyId);
    if (story && story.language) {
      languageCount[story.language] = (languageCount[story.language] || 0) + 1;
    }
  });
  const favoriteLanguage = Object.keys(languageCount).length > 0 
    ? Object.keys(languageCount).reduce((a, b) => languageCount[a] > languageCount[b] ? a : b)
    : 'Aucune';

  // Weekly reading data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const dayHistory = readingHistory.filter(record => {
      const recordDate = new Date(record.createdAt?.seconds * 1000);
      return recordDate >= dayStart && recordDate <= dayEnd;
    });
    
    return {
      day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      stories: dayHistory.length,
      time: dayHistory.reduce((total, record) => total + (record.readingTime || 0), 0)
    };
  }).reverse();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-slate-700 text-lg font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <p className="text-slate-700 text-lg font-medium">Enfant non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium rounded-xl hover:bg-white/50 transition-all duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {child.name?.charAt(0) || 'E'}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
                {child.name}
              </h1>
              <p className="text-slate-600">Progrès de lecture et historique</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-2">{totalStoriesRead}</div>
            <div className="text-slate-600">Histoires lues</div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                <Clock className="w-6 h-6" />
              </div>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-2">{totalReadingTime}</div>
            <div className="text-slate-600">Minutes totales</div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                <Star className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-2">{averageReadingTime}</div>
            <div className="text-slate-600">Min moyennes</div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                <UserIcon className="w-6 h-6" />
              </div>
              <Star className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-2">{favoriteLanguage}</div>
            <div className="text-slate-600">Langue préférée</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Activité Hebdomadaire</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="stories" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Temps de Lecture</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="time" fill="url(#timeGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Reading History */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Historique de Lecture</h3>
          {readingHistory.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">Aucun historique de lecture</p>
              <p className="text-sm text-slate-400 mt-2">Commencez à lire des histoires avec votre enfant</p>
            </div>
          ) : (
            <div className="space-y-4">
              {readingHistory.map((record) => {
                const story = stories.find(s => s.id === record.storyId);
                
                return (
                  <div key={record.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {story?.title?.charAt(0) || 'H'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{story?.title || 'Histoire inconnue'}</div>
                      <div className="text-sm text-slate-500">
                        {story?.language || 'Langue inconnue'} • {record.readingTime || 0} minutes
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-800">
                        {record.createdAt && record.createdAt.seconds
                          ? new Date(record.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {record.createdAt && record.createdAt.seconds
                          ? new Date(record.createdAt.seconds * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 