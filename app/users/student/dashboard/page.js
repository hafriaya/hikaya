"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc, query, where, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { BookOpen, Star, Heart, CheckCircle, Play, Volume2, Smile, ArrowLeft, Sparkles, Home, Grid, Info, Menu, Search, Bell, Filter, Trophy, Gift, Zap, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { pdfjs } from 'react-pdf';

// Set workerSrc to CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Dynamically import react-pdf components (client-side only)
const PDFDocument = dynamic(() => import('react-pdf').then(mod => mod.Document), { ssr: false });
const PDFPage = dynamic(() => import('react-pdf').then(mod => mod.Page), { ssr: false });

export default function StudentInterface() {
  const [student, setStudent] = useState(null);
  const [stories, setStories] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [celebrationMode, setCelebrationMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showReadBooks, setShowReadBooks] = useState(false);
  
  // Quiz states
  const [showQuiz, setShowQuiz] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [isPassingScore, setIsPassingScore] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showHint, setShowHint] = useState(false); // Add hint visibility state
  
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

  const fetchQuestionsForStory = async (storyId) => {
    try {
      // Fetch questions from the questions collection for this specific story
      const questionsQuery = query(collection(db, "questions"), where("storyId", "==", storyId));
      const questionsSnapshot = await getDocs(questionsQuery);
      const questionsData = questionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return questionsData;
    } catch (err) {
      console.error("Error fetching questions:", err);
      return [];
    }
  };

  const markStoryAsRead = async (storyId) => {
    console.log('markStoryAsRead called with storyId:', storyId);
    console.log('student object:', student);
    
    // Get the current authenticated user
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      alert('Erreur: ID utilisateur non disponible. Rechargez la page.');
      return;
    }

    try {
      // First, load questions for this story from the questions collection
      const questionsQuery = query(collection(db, 'questions'), where('storyId', '==', storyId));
      const questionsSnapshot = await getDocs(questionsQuery);
      const questionsData = questionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (questionsData.length === 0) {
        alert('Aucune question disponible pour cette histoire.');
        return;
      }

      // Sort questions by order field
      questionsData.sort((a, b) => (a.order || 0) - (b.order || 0));

      // Set up quiz
      setQuestions(questionsData);
      setCurrentStoryId(storyId);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizScore(0);
      setShowResults(false);
      setIsPassingScore(false);
      setShowQuiz(true);

    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Oups ! Il y a eu un problème: ' + error.message + '. Essaie encore !');
    }
  };

  const addReadingRecord = async (studentId, storyId) => {
    try {
      console.log('Adding reading record to Firestore...');
      
      // Add reading record using the authenticated user's UID
      const docRef = await addDoc(collection(db, "readingHistory"), {
        studentId: studentId,
        storyId: storyId,
        createdAt: Timestamp.now(),
        completed: true
      });
      
      console.log('Reading record added with ID:', docRef.id);

      // Refresh reading history
      console.log('Refreshing student data...');
      await fetchStudentData(studentId);
      
      // Trigger celebration
      setCelebrationMode(true);
      setTimeout(() => setCelebrationMode(false), 3000);
    } catch (err) {
      console.error("Error adding reading record:", err);
      throw err;
    }
  };

  const hasReadStory = (storyId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    return readingHistory.some(record => record.studentId === currentUser.uid && record.storyId === storyId);
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

  // Filter stories based on current view
  const getFilteredStories = () => {
    if (showReadBooks) {
      // Show only books the student has read
      return stories.filter(story => hasReadStory(story.id));
    } else if (showFavorites) {
      // Show only favorite books
      return stories.filter(story => favorites.includes(story.id));
    } else {
      // Show all available books
      return stories;
    }
  };

  const filteredStories = getFilteredStories();

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      router.push('/login');
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  // Open PDF in new tab
  const openPDFInNewTab = (pdfUrl) => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  // Quiz functions
  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHint(false); // Reset hint visibility for next question
    } else {
      // Quiz completed, calculate score
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    
    const score = (correctAnswers / questions.length) * 100;
    setQuizScore(score);
    setIsPassingScore(score >= 70); // 70% passing score
    setShowResults(true);
  };

  const handleQuizComplete = async () => {
    if (isPassingScore) {
      // Mark story as read in reading history
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        console.log('Adding reading record to Firestore...');
        console.log('Current user UID:', currentUser.uid);
        console.log('Story ID:', currentStoryId);

        const readingRecord = {
          studentId: currentUser.uid,
          storyId: currentStoryId,
          completedAt: Timestamp.now(),
          score: quizScore,
          questionsAnswered: questions.length,
          correctAnswers: Math.round((quizScore / 100) * questions.length)
        };

        const docRef = await addDoc(collection(db, 'readingHistory'), readingRecord);
        console.log('Reading record added with ID:', docRef.id);

        // Refresh student data
        await fetchStudentData(currentUser.uid);
        console.log('Refreshing student data...');

        alert(`Bravo ! Tu as marqué cette histoire comme lue ! 🌟\nScore: ${Math.round(quizScore)}%`);
      } catch (error) {
        console.error('Error marking story as read:', error);
        alert('Oups ! Il y a eu un problème: ' + error.message + '. Essaie encore !');
      }
    }
    
    setShowQuiz(false);
    setQuestions([]);
    setCurrentStoryId(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizScore(0);
    setShowResults(false);
    setIsPassingScore(false);
  };

  // Navigation handlers
  const handleShowAllBooks = () => {
    setShowFavorites(false);
    setShowReadBooks(false);
  };

  const handleShowFavorites = () => {
    setShowFavorites(true);
    setShowReadBooks(false);
  };

  const handleShowReadBooks = () => {
    setShowReadBooks(true);
    setShowFavorites(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Floating shapes - NO ANIMATION */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-yellow-300 rounded-full opacity-70"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-pink-400 rounded-full opacity-60"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-blue-400 rounded-full opacity-50"></div>
        
        <div className="text-center z-10">
          <div className="mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white">
              <BookOpen className="w-16 h-16 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-purple-800 mb-4">✨ Préparation magique... ✨</h2>
          <p className="text-xl text-purple-700 font-bold">Tes aventures arrivent ! 🚀🌈</p>
        </div>
      </div>
    );
  }

  const readCount = readingHistory.filter(record => record.studentId === student?.uid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 via-blue-200 to-green-200 relative overflow-hidden">
      {/* Floating decorative elements - NO ANIMATION */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-yellow-400 rounded-full opacity-60"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-pink-500 rounded-full opacity-70"></div>
      <div className="absolute top-60 left-1/3 w-10 h-10 bg-blue-400 rounded-full opacity-50"></div>
      <div className="absolute bottom-40 right-1/4 w-12 h-12 bg-green-400 rounded-full opacity-60"></div>

      {/* Celebration Mode - NO ANIMATION */}
      {celebrationMode && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl">🎉</div>
          <div className="absolute top-20 left-20 text-4xl">⭐</div>
          <div className="absolute top-32 right-32 text-5xl">🌟</div>
          <div className="absolute bottom-40 left-1/4 text-3xl">✨</div>
          <div className="absolute bottom-32 right-1/3 text-4xl">🎊</div>
        </div>
      )}

      {/* Playful Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 shadow-lg sticky top-0 z-40 border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Menu and Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              <div className="text-xl sm:text-3xl font-black text-white drop-shadow-lg">
                🌈 Hikaya 📚
              </div>
            </div>

            {/* Center Navigation - Kid Style */}
            <div className="hidden sm:flex items-center gap-4">
              <button 
                onClick={handleShowAllBooks}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg hover:scale-105 transition-all ${
                  !showFavorites && !showReadBooks 
                    ? 'bg-white/90 backdrop-blur text-purple-600' 
                    : 'bg-white/50 backdrop-blur text-purple-400 hover:bg-white/70'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                📖 Mes Livres
              </button>
              <button 
                onClick={handleShowFavorites}
                className={`flex items-center gap-2 p-3 text-white hover:text-yellow-300 transition-colors hover:scale-110 ${
                  showFavorites ? 'text-yellow-300' : ''
                }`}
              >
                <Heart className="w-6 h-6" />
              </button>
              <button 
                onClick={handleShowReadBooks}
                className={`flex items-center gap-2 p-3 text-white hover:text-yellow-300 transition-colors hover:scale-110 ${
                  showReadBooks ? 'text-yellow-300' : ''
                }`}
              >
                <Trophy className="w-6 h-6" />
              </button>
            </div>

            {/* Right side - User and Logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-lg">
                <div className="text-sm font-bold text-purple-600">
                  👋 Salut {student?.fullName || 'Champion'} !
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
              onClick={handleShowAllBooks}
              className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${
                !showFavorites && !showReadBooks ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <BookOpen className="w-4 h-4" />
              📖 Tous
            </button>
            <button 
              onClick={handleShowFavorites}
              className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${
                showFavorites ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <Heart className="w-4 h-4" />
              ❤️ Favoris
            </button>
            <button 
              onClick={handleShowReadBooks}
              className={`flex items-center gap-1 px-3 py-2 bg-white/90 backdrop-blur text-purple-600 rounded-xl font-bold text-xs shadow-lg ${
                showReadBooks ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <Trophy className="w-4 h-4" />
              🏆 Lues
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
          <p className="text-sm sm:text-xl text-purple-700 font-bold">
            {showReadBooks ? 'Tes histoires terminées ! 🏆' : 
             showFavorites ? 'Tes histoires préférées ! ❤️' : 
             'Découvre des histoires incroyables qui t\'attendent ! 🌟'}
          </p>
        </div>

        {/* Super Fun Progress Stats */}
        {readCount > 0 && (
          <div className="mb-6 sm:mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-4 border-yellow-400 shadow-xl relative overflow-hidden">
              {/* Background decorations - NO ANIMATION */}
              <div className="absolute top-2 right-2 text-xl sm:text-2xl">⭐</div>
              <div className="absolute bottom-2 left-2 text-xl sm:text-2xl"></div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between relative z-10 gap-4 sm:gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-center bg-gradient-to-br from-blue-400 to-purple-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                    <div className="text-2xl sm:text-3xl font-black">{readCount}</div>
                    <div className="text-xs sm:text-sm font-bold">📚 Histoires lues</div>
                  </div>
                  <div className="hidden sm:block w-2 h-16 bg-gradient-to-b from-pink-400 to-yellow-400 rounded-full"></div>
                  <div className="text-center bg-gradient-to-br from-green-400 to-blue-500 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg">
                    <div className="text-2xl sm:text-3xl font-black">{stories.length}</div>
                    <div className="text-xs sm:text-sm font-bold"> Disponibles</div>
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
                  {showReadBooks ? 'Aucune histoire terminée !' : 
                   showFavorites ? 'Pas de favoris !' : 
                   'Pas d\'histoires pour le moment !'}
                </h3>
                <p className="text-orange-500 font-bold text-sm sm:text-lg">
                  {showReadBooks ? 'Lis des histoires pour les voir ici ! 📖' : 
                   showFavorites ? 'Ajoute des histoires à tes favoris ! 💖' : 
                   'Demande à ton maître de t\'en ajouter ! ✨'}
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
                          {/* Decorative elements - NO ANIMATION */}
                          <div className="absolute top-2 left-2 text-lg sm:text-2xl">⭐</div>
                          <div className="absolute top-2 right-2 text-lg sm:text-2xl">✨</div>
                          <div className="absolute bottom-2 left-2 text-lg sm:text-2xl">🌟</div>
                          
                          <div className="text-center text-white z-10">
                            <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3" />
                            <div className="text-sm sm:text-lg font-black drop-shadow-lg">Histoire Magique</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Fun Read Status Badge - NO ANIMATION */}
                      {isRead && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <div className="text-sm sm:text-lg">🏆</div>
                          </div>
                        </div>
                      )}

                      {/* Favorite Badge - NO ANIMATION */}
                      {isFavorite && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
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
                    
                    {/* Super Fun Action Button - Only show for unread books */}
                    {!isRead && !showReadBooks && (
                      <button
                        onClick={(e) => {e.preventDefault(); markStoryAsRead(story.id)}}
                        className="w-full mt-2 sm:mt-3 py-2 sm:py-3 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:shadow-xl transition-all hover:scale-105 border-2 border-white"
                      >
                        ✨ J'ai lu cette histoire ! 🎉
                      </button>
                    )}
                    
                    {/* Completed Badge - Only show for read books */}
                    {isRead && (
                      <div className="w-full mt-2 sm:mt-3 py-2 sm:py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl border-2 border-white flex items-center justify-center gap-1 sm:gap-2">
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                        Terminé ! 🌟
                      </div>
                    )}
                  </div>
                  </a>
                  <button
                    className="w-full mt-2 sm:mt-3 py-2 sm:py-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 text-white font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl hover:shadow-xl transition-all hover:scale-105 border-2 border-white"
                    onClick={e => {
                      e.preventDefault();
                      if (story.pdfUrl) {
                        openPDFInNewTab(story.pdfUrl);
                      } else {
                        alert('PDF non disponible pour cette histoire !');
                      }
                    }}
                  >
                    📖 Lire le PDF
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!showResults ? (
              // Quiz Questions
              <div>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-2">📚</div>
                  <h2 className="text-2xl font-bold text-purple-600">Quiz de l'histoire</h2>
                  <p className="text-gray-600">Question {currentQuestionIndex + 1} sur {questions.length}</p>
                </div>

                {questions[currentQuestionIndex] && (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        {questions[currentQuestionIndex].questionText}
                      </h3>
                      
                      {questions[currentQuestionIndex].hint && (
                        <div className="mb-4">
                          <button
                            onClick={() => setShowHint(!showHint)}
                            className="px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg text-yellow-800 font-medium hover:bg-yellow-200 transition-all"
                          >
                            💡 {showHint ? 'Masquer l\'indice' : 'Voir l\'indice'}
                          </button>
                          
                          {showHint && (
                            <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                <strong>Indice:</strong> {questions[currentQuestionIndex].hint}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        {questions[currentQuestionIndex].options.map((option, optionIndex) => (
                          <button
                            key={optionIndex}
                            onClick={() => handleAnswerSelect(currentQuestionIndex, optionIndex)}
                            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                              selectedAnswers[currentQuestionIndex] === optionIndex
                                ? 'border-purple-500 bg-purple-100 text-purple-700'
                                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <span className="font-medium text-black">{option}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setShowQuiz(false)}
                        className="px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all"
                      >
                        Annuler
                      </button>
                      
                      <button
                        onClick={handleNextQuestion}
                        disabled={selectedAnswers[currentQuestionIndex] === undefined}
                        className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentQuestionIndex < questions.length - 1 ? 'Suivant' : 'Terminer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Quiz Results
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {isPassingScore ? '🎉' : '😔'}
                </div>
                <h2 className="text-3xl font-bold text-purple-600 mb-4">
                  {isPassingScore ? 'Bravo !' : 'Dommage !'}
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Tu as obtenu {Math.round(quizScore)}% de bonnes réponses
                </p>
                
                {isPassingScore ? (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6">
                    <p className="text-green-800 font-bold">
                      🏆 Excellent ! Tu as bien compris l'histoire !
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                    <p className="text-red-800 font-bold">
                      📚 Tu peux relire l'histoire et réessayer !
                    </p>
                  </div>
                )}

                <button
                  onClick={handleQuizComplete}
                  className="px-8 py-4 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
                >
                  {isPassingScore ? 'Continuer' : 'Fermer'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fun Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-purple-400 via-pink-300 to-transparent"></div>
      
      {/* Floating fun elements - NO ANIMATION */}
      <div className="absolute bottom-10 left-10 text-2xl sm:text-3xl">🎈</div>
      <div className="absolute bottom-16 right-20 text-xl sm:text-2xl">🦄</div>
      <div className="absolute bottom-8 left-1/3 text-3xl sm:text-4xl"></div>
    </div>
  );
}