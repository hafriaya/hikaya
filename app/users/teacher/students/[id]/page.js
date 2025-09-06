"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, BookOpen, Calendar, Clock, Star, Users, Award } from 'lucide-react';
import Link from 'next/link';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [student, setStudent] = useState(null);
  const [stories, setStories] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch teacher profile
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setTeacher(userDoc.data());
            await fetchStudentData();
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
  }, [id, router]);

  const fetchStudentData = async () => {
    try {
      console.log('Fetching data for student ID:', id);
      
      // Fetch student data
      const studentDoc = await getDoc(doc(db, 'students', id));
      if (studentDoc.exists()) {
        const studentData = { id: studentDoc.id, ...studentDoc.data() };
        console.log('Student data:', studentData);
        setStudent(studentData);
      } else {
        console.log('Student not found');
      }

      // Fetch all stories (readable stories)
      const storiesSnapshot = await getDocs(collection(db, 'story'));
      const storiesData = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('All stories:', storiesData);
      setStories(storiesData);

      // Fetch reading history for this student
      const historyQuery = query(collection(db, 'readingHistory'), where('studentId', '==', id));
      const historySnapshot = await getDocs(historyQuery);
      const historyData = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Reading history for student', id, ':', historyData);
      setReadingHistory(historyData);

      // Fetch classes
      const classesSnapshot = await getDocs(collection(db, 'class'));
      setClasses(classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    } catch (err) {
      console.error("Error fetching student data:", err);
    }
  };

  const getClassName = (classId) => {
    const found = classes.find((cls) => cls.id === classId);
    return found ? found.name : 'Classe inconnue';
  };

  const getStoryTitle = (storyId) => {
    const found = stories.find((story) => story.id === storyId);
    return found ? found.title : 'Histoire inconnue';
  };

  const hasReadStory = (storyId) => {
    // Since we already filtered readingHistory by studentId in the query,
    // we just need to check if the storyId matches
    return readingHistory.some(record => record.storyId === storyId);
  };

  const getReadingRecord = (storyId) => {
    return readingHistory.find(record => record.storyId === storyId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl text-center border border-white/20 p-8">
          <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 animate-pulse"></div>
          </div>
          <p className="text-slate-600 text-lg font-medium">Chargement des données de l'élève...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl text-center border border-white/20 p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Élève non trouvé</h2>
          <p className="text-slate-600 mb-6">Cet élève n'existe pas ou a été supprimé.</p>
          <Link href="/users/teacher/dashboard" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all">
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  const readStories = stories.filter(story => hasReadStory(story.id));
  const unreadStories = stories.filter(story => !hasReadStory(story.id));
  const totalScore = readingHistory.length > 0 
    ? Math.round(readingHistory.reduce((total, record) => total + (record.score || 0), 0) / readingHistory.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/users/teacher/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Détails de l'élève</h1>
                <p className="text-slate-500">Informations et progrès de lecture</p>
              </div>
            </div>
          </div>
        </div>
        </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Student Info Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
              {student.name?.charAt(0) || 'E'}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{student.name}</h2>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{getClassName(student.classId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{student.age || 'N/A'} ans</span>
              </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  student.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {student.isActive ? "Actif" : "Inactif"}
                </div>
              </div>
            </div>
                  </div>
                </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{readStories.length}</div>
                <div className="text-sm text-slate-600">Histoires lues</div>
              </div>
                  </div>
                </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{totalScore}%</div>
                <div className="text-sm text-slate-600">Score moyen</div>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{unreadStories.length}</div>
                <div className="text-sm text-slate-600">Histoires disponibles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stories Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Read Stories */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Histoires lues ({readStories.length})
            </h3>
            {readStories.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg">Aucune histoire lue</p>
                <p className="text-sm text-slate-400 mt-2">Cet élève n'a pas encore lu d'histoires</p>
              </div>
            ) : (
              <div className="space-y-3">
                {readStories.map((story) => {
                  const record = getReadingRecord(story.id);
                  return (
                    <div key={story.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {story.title?.charAt(0) || 'H'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{story.title}</div>
                        <div className="text-sm text-slate-500">{story.language}</div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          (record?.score || 0) >= 70 
                            ? 'bg-green-100 text-green-700' 
                            : (record?.score || 0) >= 50 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {Math.round(record?.score || 0)}%
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {record?.completedAt && record.completedAt.seconds
                            ? new Date(record.completedAt.seconds * 1000).toLocaleDateString('fr-FR')
                            : 'N/A'}
                          </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>

          {/* Available Stories */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Histoires disponibles ({unreadStories.length})
            </h3>
            {unreadStories.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-lg">Toutes les histoires lues !</p>
                <p className="text-sm text-slate-400 mt-2">Excellent travail !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unreadStories.map((story) => (
                  <div key={story.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {story.title?.charAt(0) || 'H'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800">{story.title}</div>
                      <div className="text-sm text-slate-500">{story.language}</div>
                    </div>
                    <div className="text-sm text-slate-500">
                      Non lue
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}