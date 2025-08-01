"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc, query, where, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { BookOpen, Star, Heart, CheckCircle, Play, Volume2, Smile, ArrowLeft, Sparkles, Home, Grid, Info, Menu, Search, Bell, Filter, Trophy, Gift, Zap } from 'lucide-react';

export default function StudentInterface() {
  const [student, setStudent] = useState(null);
  const [stories, setStories] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === 'student') {
              setStudent(userData);
              await fetchStudentData(user.uid);
            } else {
              router.push('/login');
            }
          } else {
            router.push('/login');
          }
        } catch (err) {
          console.error("Error fetching student data:", err);
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchStudentData = async (studentId) => {
    try {
      // Fetch all stories
      const storiesSnapshot = await getDocs(collection(db, "story"));
      const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);

      // Fetch reading history for this student
      const historyQuery = query(collection(db, "readingHistory"), where("studentId", "==", studentId));
      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReadingHistory(historyData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const markStoryAsRead = async (storyId) => {
    if (!student) return;
    
    try {
      // Check if already read
      const alreadyRead = readingHistory.some(record => record.storyId === storyId);
      if (alreadyRead) {
        alert("Tu as déjà lu cette histoire ! 🎉");
        return;
      }

      // Add reading record
      await addDoc(collection(db, "readingHistory"), {
        studentId: student.uid,
        storyId: storyId,
        createdAt: Timestamp.now(),
        completed: true
      });

      // Refresh reading history
      await fetchStudentData(student.uid);
      
      // Trigger celebration
      setCelebrationMode(true);
      setTimeout(() => setCelebrationMode(false), 3000);
      
      alert("Bravo ! Tu as marqué cette histoire comme lue ! 🌟");
    } catch (err) {
      console.error("Error marking story as read:", err);
      alert("Oups ! Il y a eu un problème. Essaie encore !");
    }
  };

  const hasReadStory = (storyId) => {
    return readingHistory.some(record => record.studentId === student?.uid && record.storyId === storyId);
  };

  // Toggle favorite
  const toggleFavorite = (storyId) => {
    setFavorites(prev => {
      if (prev.includes(storyId)) {
        return prev.filter(id => id !== storyId);
      } else {
        return [...prev, storyId];
      }
    });
  };

  // Filter stories based on favorites
  const filteredStories = showFavorites ? stories.filter(story => favorites.includes(story.id)) : stories;

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      router.push('/login');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-yellow-300 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-blue-400 rounded-full animate-bounce delay-500 opacity-50"></div>
        
        <div className="text-center z-10">
          <div className="animate-bounce mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white">
              <BookOpen className="w-16 h-16 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-purple-800 mb-4 animate-pulse">✨ Préparation magique... ✨</h2>
          <p className="text-xl text-purple-700 font-bold">Tes aventures arrivent ! 🚀🌈</p>
        </div>
      </div>
    );
  }

  const readCount = readingHistory.filter(record => record.studentId === student?.uid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 via-blue-200 to-green-200 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-60"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-pink-500 rounded-full animate-pulse opacity-70"></div>
      <div className="absolute top-60 left-1/3 w-10 h-10 bg-blue-400 rounded-full animate-bounce delay-300 opacity-50"></div>
      <div className="absolute bottom-40 right-1/4 w-12 h-12 bg-green-400 rounded-full animate-pulse delay-700 opacity-60"></div>

      {/* Celebration Mode */}
      {celebrationMode && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
          <div className="absolute top-20 left-20 text-4xl animate-spin">⭐</div>
          <div className="absolute top-32 right-32 text-5xl animate-pulse">🌟</div>
          <div className="absolute bottom-40 left-1/4 text-3xl animate-bounce delay-500">✨</div>
          <div className="absolute bottom-32 right-1/3 text-4xl animate-spin delay-300">🎊</div>
        </div>
      )}

      {/* Playful Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 shadow-lg sticky top-0 z-40 border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Menu and Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg">
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </button>
              <div className="text-xl sm:text-3xl font-black text-white drop-shadow-lg">
                🌈 Hikaya 📚
              </div>
            </div>

            {/* Center Navigation - Kid Style */}
            <div className="hidden sm:flex items-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur text-purple-600 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all">
                <BookOpen className="w-5 h-5" />
                📖 Mes Livres
              </button>
              <button 
                className={`flex items-center gap-2 p-3 text-white hover:text-yellow-300 transition-colors hover:scale-110 ${showFavorites ? 'text-yellow-300' : ''}`}
                onClick={() => setShowFavorites(!showFavorites)}
              >
                <Heart className="w-6 h-6" />
              </button>
              <button className="flex items-center gap-2 p-3 text-white hover:text-yellow-300 transition-colors hover:scale-110">
                <Star className="w-6 h-6" />
              </button>
              <button className="flex items-center gap-2 p-3 text-white hover:text-yellow-300 transition-colors hover:scale-110">
                <Trophy className="w-6 h-6" />
              </button>
            </div>

            {/* Right side - User and Logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg">
                <div className="text-sm font-bold text-purple-600">
                  👋 Salut {student?.name || 'Champion'} !
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all hover:scale-105 text-xs sm:text-sm border-2 border-white"
              >
                🚪 Sortir
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="sm:hidden mt-3 flex items-center justify-center gap-3">
            <button 
              className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${!showFavorites ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => setShowFavorites(false)}
            >
              <BookOpen className="w-4 h-4" />
              📖 Tous
            </button>
            <button 
              className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${showFavorites ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => setShowFavorites(true)}
            >
              <Heart className="w-4 h-4" />
              ❤️ Favoris
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Fun Section Title */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-purple-800 mb-2 sm:mb-4 drop-shadow-lg">
            🎨 Tes Aventures Magiques ! ✨
          </h1>
          <p className="text-sm sm:text-xl text-purple-700 font-bold">Découvre des histoires incroyables qui t'attendent ! 🌟</p>
        </div>

        {/* Super Fun Progress Stats */}
        {readCount > 0 && (
          <div className="mb-6 sm:mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-4 border-yellow-400 shadow-xl relative overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-2 right-2 text-xl sm:text-2xl animate-spin">⭐</div>
              <div className="absolute bottom-2 left-2 text-xl sm:text-2xl animate-bounce">🌟</div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between relative z-10 gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center bg-gradient-to-br from-blue-400 to-purple-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                    <div className="text-2xl sm:text-3xl font-black">{readCount}</div>
                    <div className="text-xs sm:text-sm font-bold">📚 Histoires lues</div>
                  </div>
                  <div className="hidden sm:block w-2 h-16 bg-gradient-to-b from-pink-400 to-yellow-400 rounded-full"></div>
                  <div className="text-center bg-gradient-to-br from-green-400 to-blue-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                    <div className="text-2xl sm:text-3xl font-black">{stories.length}</div>
                    <div className="text-xs sm:text-sm font-bold">🎭 Disponibles</div>
                  </div>
                </div>
                <div className="text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                  <div className="text-xs sm:text-sm font-bold mb-1">🏆 Ton Score</div>
                  <div className="text-xl sm:text-2xl font-black">
                    {Math.round((readCount / Math.max(stories.length, 1)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Super Colorful Stories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredStories.length === 0 ? (
            <div className="col-span-full text-center py-8 sm:py-12">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-4 border-orange-400 shadow-xl max-w-md mx-auto">
                <div className="text-4xl sm:text-6xl mb-4">📚</div>
                <h3 className="text-lg sm:text-2xl font-black text-orange-600 mb-2 sm:mb-4">
                  {showFavorites ? 'Pas de favoris !' : 'Pas d\'histoires pour le moment !'}
                </h3>
                <p className="text-orange-500 font-bold text-sm sm:text-lg">
                  {showFavorites ? 'Ajoute des histoires à tes favoris ! 💖' : 'Demande à ton maître de t\'en ajouter ! 🎓✨'}
                </p>
              </div>
            </div>
          ) : (
            filteredStories.map((story, index) => {
              const isRead = hasReadStory(story.id);
              const isFavorite = favorites.includes(story.id);
              const colors = [
                'from-pink-400 to-purple-500',
                'from-blue-400 to-teal-500', 
                'from-yellow-400 to-orange-500',
                'from-green-400 to-blue-500',
                'from-purple-400 to-pink-500',
                'from-red-400 to-yellow-500'
              ];
              const cardColor = colors[index % colors.length];
              
              return (
                <div key={story.id} className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <a href={`/users/student/stories/${story.id}`} className="block group" tabIndex={0} aria-label={`Voir l'histoire ${story.title}`}> 
                  <div className="relative">
                    {/* Super Fun Book Cover */}
                    <div className="aspect-[3/4] bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden border-4 border-white relative group-hover:shadow-2xl transition-all duration-300">
                      {story.illustrationUrl ? (
                        <img 
                          src={story.illustrationUrl} 
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${cardColor} flex items-center justify-center relative overflow-hidden`}>
                          {/* Decorative elements */}
                          <div className="absolute top-2 left-2 text-lg sm:text-2xl animate-bounce">⭐</div>
                          <div className="absolute top-2 right-2 text-lg sm:text-2xl animate-pulse">✨</div>
                          <div className="absolute bottom-2 left-2 text-lg sm:text-2xl animate-bounce delay-500">🌟</div>
                          
                          <div className="text-center text-white z-10">
                            <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 animate-pulse" />
                            <div className="text-sm sm:text-lg font-black drop-shadow-lg">Histoire Magique</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fun Read Status Badge */}
                      {isRead && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                            <div className="text-sm sm:text-lg">🏆</div>
                          </div>
                        </div>
                      )}

                      {/* Favorite Badge */}
                      {isFavorite && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
                            <div className="text-sm sm:text-lg">💖</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Colorful Language Badge */}
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3">
                        <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-black shadow-lg border-2 border-white ${
                          story.language === 'Français' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' :
                          story.language === 'English' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' :
                          'bg-gradient-to-r from-yellow-500 to-red-500 text-white'
                        }`}>
                          {story.language === 'Français' ? '🇫🇷' : story.language === 'English' ? '🇬🇧' : '🌍'} {story.language}
                        </div>
                      </div>
                    </div>

                    {/* Super Fun Interactive Icons */}
                    <div className="mt-3 sm:mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg border-2 border-white" onClick={e => {e.preventDefault(); alert('🎵 Lecture audio arrive bientôt !')}}>
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </button>
                        <button 
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg border-2 border-white ${isFavorite ? 'bg-gradient-to-r from-pink-400 to-red-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}
                          onClick={e => {e.preventDefault(); toggleFavorite(story.id)}}
                        >
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-white' : 'text-gray-300'}`} />
                        </button>
                        <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-lg border-2 border-white" onClick={e => {e.preventDefault(); alert('🔊 Audio magique à venir !')}}>
                          <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </button>
                      </div>
                      <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⚡ {Math.floor(Math.random() * 1000) + 100}
                      </div>
                    </div>

                    {/* Fun Story Title */}
                    <h3 className="font-black text-purple-800 text-sm sm:text-base mt-2 sm:mt-3 line-clamp-2 leading-tight drop-shadow-sm">
                      {story.title}
                    </h3>
                    
                    {/* Super Fun Action Button */}
                    {!isRead && (
                      <button
                        onClick={(e) => {e.preventDefault(); markStoryAsRead(story.id)}}
                        className="w-full mt-2 sm:mt-3 py-2 sm:py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:shadow-xl transition-all hover:scale-105 border-2 border-white"
                      >
                        ✨ J'ai lu cette histoire ! 🎉
                      </button>
                    )}
                    
                    {/* Completed Badge */}
                    {isRead && (
                      <div className="w-full mt-2 sm:mt-3 py-2 sm:py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl border-2 border-white flex items-center justify-center gap-1 sm:gap-2">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                        Terminé ! 🌟
                      </div>
                    )}
                  </div>
                  </a>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Fun Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-purple-400 via-pink-300 to-transparent"></div>
      
      {/* Floating fun elements */}
      <div className="absolute bottom-10 left-10 text-2xl sm:text-3xl animate-bounce delay-1000">🎈</div>
      <div className="absolute bottom-16 right-20 text-xl sm:text-2xl animate-pulse delay-1500">🦄</div>
      <div className="absolute bottom-8 left-1/3 text-3xl sm:text-4xl animate-bounce delay-2000">🌈</div>
    </div>
  );
}