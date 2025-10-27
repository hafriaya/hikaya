"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc, query, where, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

// Import components
import StudentNavigation from '../components/StudentNavigation';
import ProgressStats from '../components/ProgressStats';
import StoriesGrid from '../components/StoriesGrid';
import QuizModal from '../components/QuizModal';
import LoadingScreen from '../components/LoadingScreen';
import CelebrationOverlay from '../components/CelebrationOverlay';
import NavigationLoading from '@/app/components/NavigationLoading';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function StudentInterface() {
  const [student, setStudent] = useState(null);
  const [stories, setStories] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [showHint, setShowHint] = useState(false);
  
  // Loading states
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
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

      // Find the student document that matches this user
      const studentQuery = query(collection(db, "students"), where("userId", "==", studentId));
      const studentSnapshot = await getDocs(studentQuery);
      
      if (!studentSnapshot.empty) {
        const studentDocId = studentSnapshot.docs[0].id;
        // Fetch reading history for this student using the student document ID
        const historyQuery = query(collection(db, "readingHistory"), where("studentId", "==", studentDocId));
        const historySnapshot = await getDocs(historyQuery);
        const historyData = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReadingHistory(historyData);
      } else {
        setReadingHistory([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
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

    setIsLoadingQuiz(true);

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
        setIsLoadingQuiz(false);
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
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const hasReadStory = (storyId) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    return readingHistory.some(record => record.storyId === storyId);
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
    console.log('handleAnswerSelect called:', { questionIndex, answerIndex });
    console.log('Current selectedAnswers:', selectedAnswers);
    
    setSelectedAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionIndex]: answerIndex
      };
      console.log('New selectedAnswers:', newAnswers);
      return newAnswers;
    });
  };

  const handleNextQuestion = () => {
    console.log('handleNextQuestion called, currentQuestionIndex:', currentQuestionIndex);
    console.log('Total questions:', questions.length);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => {
        const newIndex = prev + 1;
        console.log('Moving to question index:', newIndex);
        return newIndex;
      });
      setShowHint(false); // Reset hint visibility for next question
    } else {
      // Quiz completed, calculate score
      console.log('Quiz completed, calculating score...');
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
      setIsSubmittingQuiz(true);
      
      // Mark story as read in reading history
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        console.log('Adding reading record to Firestore...');
        console.log('Current user UID:', currentUser.uid);
        console.log('Story ID:', currentStoryId);

        // Find the student document that matches this user
        const studentQuery = query(collection(db, "students"), where("userId", "==", currentUser.uid));
        const studentSnapshot = await getDocs(studentQuery);
        
        if (studentSnapshot.empty) {
          alert(`Erreur: Impossible de trouver l'élève correspondant.`);
          setIsSubmittingQuiz(false);
          return;
        }
        
        const studentDocId = studentSnapshot.docs[0].id;
        console.log('Found student document ID:', studentDocId);

        const readingRecord = {
          studentId: studentDocId, // Use the student document ID, not the auth UID
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
      } finally {
        setIsSubmittingQuiz(false);
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

  if (loading) {
    return <LoadingScreen />;
  }

  const readCount = readingHistory.filter(record => record.studentId === student?.uid).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 via-blue-200 to-green-200 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-8 h-8 bg-yellow-400 rounded-full opacity-60"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-pink-500 rounded-full opacity-70"></div>
      <div className="absolute top-60 left-1/3 w-10 h-10 bg-blue-400 rounded-full opacity-50"></div>
      <div className="absolute bottom-40 right-1/4 w-12 h-12 bg-green-400 rounded-full opacity-60"></div>

      <CelebrationOverlay celebrationMode={celebrationMode} />
      
      {/* Loading overlays */}
      {isLoadingQuiz && (
        <NavigationLoading destination="le quiz" role="student" />
      )}
      
      {isSubmittingQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20 max-w-md mx-4">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 via-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-white animate-pulse">
                <div className="text-4xl">🏆</div>
              </div>
            </div>
            <h2 className="text-2xl font-black text-purple-800 mb-4">✨ Sauvegarde en cours... ✨</h2>
            <p className="text-lg text-purple-700 font-bold mb-4">Ton progrès est enregistré ! 🌟</p>
            
            {/* Loading dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      )}

      <StudentNavigation
        showFavorites={showFavorites}
        setShowFavorites={setShowFavorites}
        showReadBooks={showReadBooks}
        setShowReadBooks={setShowReadBooks}
        student={student}
        handleLogout={handleLogout}
      />

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
             'Découvre des histoires incroyables qui t&apos;attendent ! 🌟'}
          </p>
        </div>

        <ProgressStats readCount={readCount} totalStories={stories.length} />

          <StoriesGrid
            filteredStories={filteredStories}
            hasReadStory={hasReadStory}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            markStoryAsRead={markStoryAsRead}
            openPDFInNewTab={openPDFInNewTab}
            showReadBooks={showReadBooks}
            isLoadingQuiz={isLoadingQuiz}
          />
      </div>

      <QuizModal
        showQuiz={showQuiz}
        setShowQuiz={setShowQuiz}
        showResults={showResults}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswers={selectedAnswers}
        handleAnswerSelect={handleAnswerSelect}
        handleNextQuestion={handleNextQuestion}
        handleQuizComplete={handleQuizComplete}
        quizScore={quizScore}
        isPassingScore={isPassingScore}
        showHint={showHint}
        setShowHint={setShowHint}
        isSubmittingQuiz={isSubmittingQuiz}
      />

      {/* Fun Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-purple-400 via-pink-300 to-transparent"></div>
      
      {/* Floating fun elements */}
      <div className="absolute bottom-10 left-10 text-2xl sm:text-3xl">🎈</div>
      <div className="absolute bottom-16 right-20 text-xl sm:text-2xl">🦄</div>
      <div className="absolute bottom-8 left-1/3 text-3xl sm:text-4xl">🌈</div>
    </div>
  );
}
