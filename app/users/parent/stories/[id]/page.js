"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BookOpen, Calendar, ArrowLeft, Volume2, Star, Heart, Share2, Bookmark, UserIcon, CheckCircle, Clock } from 'lucide-react';

export default function StoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storyId = params.id;
  
  const [story, setStory] = useState(null);
  const [children, setChildren] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
              await fetchData(storyId, user.uid);
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
  }, [storyId, router]);

  const fetchData = async (storyId, parentId) => {
    try {
      // Fetch story data
      const storyDoc = await getDoc(doc(db, "story", storyId));
      if (storyDoc.exists()) {
        setStory({ id: storyId, ...storyDoc.data() });
      } else {
        router.push('/users/parent/dashboard');
        return;
      }

      // Fetch parent's children
      const childrenQuery = query(collection(db, "students"), where("parentId", "==", parentId));
      const childrenSnapshot = await getDocs(childrenQuery);
      const childrenData = childrenSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChildren(childrenData);

      // Fetch reading history for this story
      const historyQuery = query(collection(db, "readingHistory"), where("storyId", "==", storyId));
      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReadingHistory(historyData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  // Check if a child has read this story
  const hasChildReadStory = (childId) => {
    return readingHistory.some(record => record.studentId === childId);
  };

  // Get reading date for a child
  const getChildReadingDate = (childId) => {
    const record = readingHistory.find(record => record.studentId === childId);
    if (record && record.createdAt && record.createdAt.seconds) {
      return new Date(record.createdAt.seconds * 1000).toLocaleDateString('fr-FR');
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
          <p className="text-slate-700 text-lg font-medium">Chargement de l'histoire...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20">
          <p className="text-slate-700 text-lg font-medium">Histoire non trouvée</p>
        </div>
      </div>
    );
  }

  // Calculate simple statistics
  const childrenWhoRead = children.filter(child => hasChildReadStory(child.id)).length;
  const totalChildren = children.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium rounded-xl hover:bg-white/50 transition-all duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Story Image */}
              <div className="lg:w-1/3">
                <div className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  {story.imageUrl ? (
                    <img 
                      src={story.imageUrl} 
                      alt={story.title}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <BookOpen className="w-24 h-24 text-indigo-400" />
                  )}
                </div>
              </div>
              
              {/* Story Info */}
              <div className="lg:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">{story.title}</h1>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleFavorite}
                      className={`p-2 rounded-full transition-colors ${
                        isFavorite ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600'
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={toggleBookmark}
                      className={`p-2 rounded-full transition-colors ${
                        isBookmarked ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                    <button className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {story.createdAt && story.createdAt.seconds
                        ? new Date(story.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    story.language === 'Français' ? 'bg-blue-100 text-blue-700' :
                    story.language === 'English' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {story.language}
                  </span>
                </div>
                
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {story.description || "Une belle histoire à lire avec votre enfant..."}
                </p>
                
                {/* Simple Reading Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600">{totalChildren}</div>
                    <div className="text-sm text-slate-600">Enfants</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{childrenWhoRead}</div>
                    <div className="text-sm text-slate-600">Ont lu</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">
                      {totalChildren > 0 ? Math.round((childrenWhoRead / totalChildren) * 100) : 0}%
                    </div>
                    <div className="text-sm text-slate-600">Progression</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Children Reading Status */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            <UserIcon className="w-6 h-6 mr-2" />
            Statut de lecture de vos enfants
          </h2>
          
          {children.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <UserIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg">Aucun enfant enregistré</p>
              <p className="text-sm text-slate-400 mt-2">Contactez l'enseignant pour ajouter vos enfants</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.map((child) => {
                const hasRead = hasChildReadStory(child.id);
                const readingDate = getChildReadingDate(child.id);
                
                return (
                  <div key={child.id} className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                    hasRead 
                      ? 'bg-green-50 border-green-200 shadow-lg' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          hasRead 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500' 
                            : 'bg-gradient-to-br from-slate-400 to-gray-500'
                        }`}>
                          {child.name?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">{child.name}</h3>
                          <p className="text-sm text-slate-500">{child.age || 'N/A'} ans</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasRead ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">A lu</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400">
                            <Clock className="w-5 h-5" />
                            <span className="text-sm">Pas encore lu</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {hasRead ? (
                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">Histoire lue</span>
                        </div>
                        {readingDate && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>Lu le {readingDate}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-slate-500 text-sm">Cet enfant n'a pas encore lu cette histoire</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Story Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vocabulary */}
          {story.vocabulary && story.vocabulary.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">📚</span>
                Vocabulaire
              </h3>
              <div className="flex flex-wrap gap-2">
                {story.vocabulary.map((word, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Questions */}
          {story.questions && story.questions.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <span className="mr-2">❓</span>
                Questions de compréhension
              </h3>
              <div className="space-y-4">
                {story.questions.map((question, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl">
                    <p className="font-medium text-slate-800 mb-2">Question {index + 1}: {question.question}</p>
                    <div className="space-y-2">
                      {question.options?.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            option === question.answer ? 'bg-green-500 border-green-500' : 'border-slate-300'
                          }`}></div>
                          <span className="text-sm text-slate-700">{option}</span>
                          {option === question.answer && (
                            <span className="text-xs text-green-600 font-medium">✓ Réponse correcte</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 