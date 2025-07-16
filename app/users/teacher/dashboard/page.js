'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export default function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      // Fetch students
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentsData);

      // Fetch stories
      const storiesSnapshot = await getDocs(collection(db, "stories"));
      const storiesData = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStories(storiesData);

      setLoading(false);
    };

    fetchData();
  }, []);

  const getStatsData = () => {
    const totalStudents = students.length
    const totalStories = stories.length
    const languageDistribution = stories.reduce((acc, story) => {
      acc[story.language] = (acc[story.language] || 0) + 1
      return acc
    }, {})
    const classDistribution = students.reduce((acc, student) => {
      acc[student.class] = (acc[student.class] || 0) + 1
      return acc
    }, {})

    return {
      totalStudents,
      totalStories,
      languageDistribution,
      classDistribution,
      activeClasses: Object.keys(classDistribution).length,
      averageStudentsPerClass: totalStudents > 0 ? Math.round(totalStudents / Object.keys(classDistribution).length) : 0
    }
  }

  const stats = getStatsData()

  // Prepare chart data
  const classChartData = Object.entries(stats.classDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / stats.totalStudents) * 100)
  }))

  const languageChartData = Object.entries(stats.languageDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / stats.totalStories) * 100)
  }))

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const recentActivities = [
    { type: 'story', title: 'Nouvelle histoire créée', description: 'Space Adventure par David Chen', time: '2h' },
    { type: 'student', title: 'Nouvel élève inscrit', description: 'Henri Lambert rejoint CM1-B', time: '4h' },
    { type: 'story', title: 'Histoire terminée', description: 'La Quête du Trésor par Emma Wilson', time: '1j' },
    { type: 'class', title: 'Classe mise à jour', description: 'CM2-C - 3 nouveaux élèves', time: '2j' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tableau de Bord
                </h1>
                <p className="text-sm text-gray-500">Gestion des élèves et histoires</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {/* Assuming user is fetched from Firestore or local */}
                    {/* For now, using a placeholder or a default */}
                    {students.length > 0 ? students[0].name?.charAt(0) || students[0].email?.charAt(0) : "T"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{students.length > 0 ? students[0].name : "Enseignant"}</p>
                  <p className="text-xs text-gray-500">Enseignant</p>
                </div>
              </div>
              <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-200">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
              { id: 'students', label: 'Élèves', icon: '👨‍🎓' },
              { id: 'stories', label: 'Histoires', icon: '📖' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Élèves</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                    <p className="text-xs text-green-600 mt-1">+2 ce mois</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                    <span className="text-2xl">👨‍🎓</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Histoires</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalStories}</p>
                    <p className="text-xs text-green-600 mt-1">+3 cette semaine</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                    <span className="text-2xl">📖</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Classes Actives</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeClasses}</p>
                    <p className="text-xs text-blue-600 mt-1">4 niveaux</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                    <span className="text-2xl">🏫</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Moy. Élèves/Classe</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.averageStudentsPerClass}</p>
                    <p className="text-xs text-orange-600 mt-1">Équilibré</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 rounded-xl">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Class Distribution Chart */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition par Classe</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Language Distribution Chart */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Langues des Histoires</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {languageChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité Récente</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'story' ? 'bg-green-500' :
                        activity.type === 'student' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Gestion des Élèves</h2>
                <p className="text-gray-600 mt-1">Gérez vos élèves et leurs classes</p>
              </div>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-blue-200">
                + Ajouter un Élève
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-200/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200/50 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900">Liste des Élèves ({students.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Élève
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-white font-semibold text-sm">{student.avatar}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">Élève actif</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {student.class}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-800 mr-4 font-medium transition-colors">
                            Voir profil
                          </button>
                          <button className="text-red-600 hover:text-red-800 font-medium transition-colors">
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Gestion des Histoires</h2>
                <p className="text-gray-600 mt-1">Créez et gérez les histoires des élèves</p>
              </div>
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-green-200">
                + Ajouter une Histoire
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <div key={story.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{story.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          Catégorie: <span className="font-medium text-gray-800">{story.category}</span>
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        story.language === 'Français' ? 'bg-blue-100 text-blue-800' :
                        story.language === 'English' ? 'bg-green-100 text-green-800' :
                        story.language === 'Español' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {story.language}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Créé le {story.createdAt}</span>
                      <span>📖</span>
                    </div>
                    <div className="flex space-x-3">
                      <button className="flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 py-2.5 px-4 rounded-xl text-sm font-medium hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
                        Lire
                      </button>
                      <button className="flex-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-200">
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}