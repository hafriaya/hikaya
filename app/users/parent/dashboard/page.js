"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

// Import components
import ParentNavigation from '../components/ParentNavigation';
import DashboardStats from '../components/DashboardStats';
import DashboardCharts from '../components/DashboardCharts';
import ChildrenList from '../components/ChildrenList';
import StoriesList from '../components/StoriesList';
import ReadingProgress from '../components/ReadingProgress';
import SearchBar from '../components/SearchBar';

export default function ParentDashboard() {
    const [children, setChildren] = useState([]);
    const [stories, setStories] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [parent, setParent] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const router = useRouter();

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
                            await fetchParentData(user.uid);
                        } else {
                            router.push('/login');
                        }
                    } else {
                        setParent({ email: user.email });
                    }
                } catch (err) {
                    console.error("Error fetching parent data:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const fetchParentData = async (parentId) => {
        try {
            // Fetch children
            const childrenQuery = query(collection(db, "students"), where("parentId", "==", parentId));
            const childrenSnapshot = await getDocs(childrenQuery);
            const childrenData = childrenSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setChildren(childrenData);

            // Fetch stories (all available stories for children)
            const storiesSnapshot = await getDocs(collection(db, "story"));
            const storiesData = storiesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setStories(storiesData);

            // Fetch reading history for all children
            const childIds = childrenData.map(child => child.id);
            const readingHistoryData = [];
            
            for (const childId of childIds) {
                const historyQuery = query(collection(db, "readingHistory"), where("studentId", "==", childId));
                const historySnapshot = await getDocs(historyQuery);
                const childHistory = historySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                readingHistoryData.push(...childHistory);
            }
            
            setReadingHistory(readingHistoryData);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    // Calculate statistics
    const totalStoriesRead = readingHistory.length;
    const totalReadingTime = readingHistory.reduce((total, record) => total + (record.readingTime || 0), 0);
    const averageReadingTime = children.length > 0 ? Math.round(totalReadingTime / children.length) : 0;
    const favoriteLanguage = stories.reduce((acc, story) => {
        acc[story.language] = (acc[story.language] || 0) + 1;
        return acc;
    }, {});
    const mostReadLanguage = Object.keys(favoriteLanguage).length > 0 
        ? Object.keys(favoriteLanguage).reduce((a, b) => favoriteLanguage[a] > favoriteLanguage[b] ? a : b)
        : 'Français';

    // Chart data
    const readingProgressData = children.map(child => {
        const childHistory = readingHistory.filter(record => record.studentId === child.id);
        return {
            name: child.name,
            storiesRead: childHistory.length,
            totalTime: childHistory.reduce((total, record) => total + (record.readingTime || 0), 0)
        };
    });

    const weeklyReadingData = Array.from({ length: 7 }, (_, i) => {
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

    // Search logic
    const filteredChildren = children.filter(child => child.name?.toLowerCase().includes(search.toLowerCase()));
    const filteredStories = stories.filter(story => story.title?.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl text-center border border-white/20 p-8">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 animate-pulse"></div>
                    </div>
                    <p className="text-slate-600 text-lg font-medium">Chargement de votre tableau de bord...</p>
                </div>
            </div>
        );
    }

    const getPageTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Tableau de Bord Parent';
            case 'children': return 'Mes Enfants';
            case 'stories': return 'Histoires Disponibles';
            case 'progress': return 'Progrès de Lecture';
            default: return 'Tableau de Bord Parent';
        }
    };

    const getPageDescription = () => {
        switch (activeTab) {
            case 'dashboard': return 'Suivez le progrès de lecture de vos enfants';
            case 'children': return 'Gérez les profils de vos enfants';
            case 'stories': return 'Découvrez les histoires disponibles';
            case 'progress': return 'Consultez l\'historique de lecture';
            default: return 'Suivez le progrès de lecture de vos enfants';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
            <ParentNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                showProfileMenu={showProfileMenu}
                setShowProfileMenu={setShowProfileMenu}
                showNotifications={showNotifications}
                setShowNotifications={setShowNotifications}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                totalStoriesRead={totalStoriesRead}
                parent={parent}
            />

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                        {getPageTitle()}
                    </h2>
                    <p className="text-slate-500 text-sm">{getPageDescription()}</p>
                </div>

                {/* Search Bar */}
                {(activeTab === 'children' || activeTab === 'stories') && (
                    <SearchBar
                        search={search}
                        setSearch={setSearch}
                        placeholder={activeTab === 'children' ? 'Rechercher un enfant...' : 'Rechercher une histoire...'}
                    />
                )}

                {/* Dashboard Content */}
                <div className="space-y-6 sm:space-y-8">
                    {activeTab === 'dashboard' && (
                        <>
                            <DashboardStats
                                childrenData={children}
                                totalStoriesRead={totalStoriesRead}
                                averageReadingTime={averageReadingTime}
                                mostReadLanguage={mostReadLanguage}
                            />
                            <DashboardCharts
                                readingProgressData={readingProgressData}
                                weeklyReadingData={weeklyReadingData}
                            />
                        </>
                    )}

                    {activeTab === 'children' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex -space-x-2">
                                            {children.slice(0, 3).map((child, i) => (
                                                <div key={i} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold border-2 border-white">
                                                    {child.name?.charAt(0) || 'E'}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-slate-600 text-sm sm:text-base">+{Math.max(0, children.length - 3)}</span>
                                    </div>
                                </div>
                            </div>
                            <ChildrenList childrenData={filteredChildren} readingHistory={readingHistory} />
                        </div>
                    )}

                    {activeTab === 'stories' && (
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
                                <div className="flex items-center gap-4">
                                    <div className="text-slate-600 text-sm sm:text-base">
                                        <span className="font-medium">{stories.length}</span> histoires disponibles
                                    </div>
                                </div>
                            </div>
                            <StoriesList stories={filteredStories} />
                        </div>
                    )}

                    {activeTab === 'progress' && (
                        <div className="space-y-4 sm:space-y-6">
                            <ReadingProgress
                                readingHistory={readingHistory}
                                childrenData={children}
                                stories={stories}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
