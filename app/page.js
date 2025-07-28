"use client";

import { useRouter } from 'next/navigation';
import { BookOpen, Users, Heart, Star, Play, ArrowRight, Sparkles, Baby } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 relative overflow-hidden">
      {/* Floating decorative elements - reduced on mobile */}
      <div className="hidden sm:block absolute top-20 left-10 w-16 h-16 bg-yellow-300 rounded-full animate-bounce opacity-60"></div>
      <div className="hidden sm:block absolute top-40 right-20 w-12 h-12 bg-pink-400 rounded-full animate-pulse opacity-70"></div>
      <div className="hidden sm:block absolute top-60 left-1/3 w-20 h-20 bg-blue-400 rounded-full animate-bounce delay-300 opacity-50"></div>
      <div className="hidden sm:block absolute bottom-40 right-1/4 w-14 h-14 bg-green-400 rounded-full animate-pulse delay-700 opacity-60"></div>
      <div className="hidden sm:block absolute bottom-20 left-20 w-10 h-10 bg-orange-400 rounded-full animate-bounce delay-1000 opacity-50"></div>

      {/* Navigation - Mobile optimized */}
      <nav className="bg-white/90 backdrop-blur-sm sticky top-0 z-40 border-b-4 border-white">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src="/logo.png" alt="Hikaya Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl shadow-lg" />
              <span className="text-xl sm:text-3xl font-black text-purple-600">Hikaya</span>
            </div>
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 sm:px-8 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl transition-all hover:scale-105 text-sm sm:text-lg"
            >
              🚀 Commencer
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile optimized */}
      <section className="relative py-12 sm:py-20 lg:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-yellow-300 text-purple-700 rounded-full text-sm sm:text-lg font-bold mb-6 sm:mb-8 animate-pulse">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
              ✨ Nouveau ! ✨
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-purple-800 mb-4 sm:mb-8 drop-shadow-lg leading-tight">
              🎨 Histoires
              <span className="block bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Magiques ! ✨
              </span>
            </h1>
            <p className="text-lg sm:text-2xl lg:text-3xl text-purple-700 font-bold mb-8 sm:mb-12 max-w-4xl mx-auto px-4">
              Découvre des histoires incroyables et deviens un champion de la lecture ! 🌟
            </p>
          </div>
          
          <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
            <button 
              onClick={() => router.push('/login')}
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white font-black rounded-2xl sm:rounded-3xl hover:shadow-2xl transition-all hover:scale-110 flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-2xl"
            >
              🎯 Commencer l'Aventure
              <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>
        </div>
      </section>

      {/* Fun Features - Mobile optimized grid */}
      <section className="py-12 sm:py-16 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-center text-purple-800 mb-8 sm:mb-12">
            🎪 Ce que tu peux faire !
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
              <h3 className="text-lg sm:text-2xl font-black mb-2 sm:mb-3">Lire des Histoires</h3>
              <p className="text-sm sm:text-lg">Des histoires amusantes et colorées !</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🏆</div>
              <h3 className="text-lg sm:text-2xl font-black mb-2 sm:mb-3">Gagner des Points</h3>
              <p className="text-sm sm:text-lg">Deviens un champion de la lecture !</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🌍</div>
              <h3 className="text-lg sm:text-2xl font-black mb-2 sm:mb-3">Plusieurs Langues</h3>
              <p className="text-sm sm:text-lg">Français, Anglais, Arabe, Espagnol !</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center text-white shadow-2xl hover:scale-105 transition-all">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎨</div>
              <h3 className="text-lg sm:text-2xl font-black mb-2 sm:mb-3">Couleurs Partout</h3>
              <p className="text-sm sm:text-lg">Une interface super colorée !</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Everyone - Mobile optimized */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-center text-purple-800 mb-8 sm:mb-12">
            👥 Pour Tout le Monde !
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:scale-105 transition-all border-4 border-blue-400">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">👨‍🏫</div>
              <h3 className="text-lg sm:text-2xl font-black text-blue-600 mb-2 sm:mb-3">Enseignants</h3>
              <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">Gère tes classes et vois les progrès !</p>
              <button 
                onClick={() => router.push('/login')}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-blue-500 text-white font-black rounded-xl sm:rounded-2xl hover:bg-blue-600 transition-all text-sm sm:text-lg"
              >
                🚀 Commencer
              </button>
            </div>
            
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:scale-105 transition-all border-4 border-pink-400">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-lg sm:text-2xl font-black text-pink-600 mb-2 sm:mb-3">Parents</h3>
              <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">Suis les progrès de ton enfant !</p>
              <button 
                onClick={() => router.push('/login')}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-pink-500 text-white font-black rounded-xl sm:rounded-2xl hover:bg-pink-600 transition-all text-sm sm:text-lg"
              >
                🚀 Commencer
              </button>
            </div>
            
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl hover:scale-105 transition-all border-4 border-green-400">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">👶</div>
              <h3 className="text-lg sm:text-2xl font-black text-green-600 mb-2 sm:mb-3">Enfants</h3>
              <p className="text-sm sm:text-lg text-gray-600 mb-4 sm:mb-6">Lis des histoires amusantes !</p>
              <button 
                onClick={() => router.push('/login')}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-green-500 text-white font-black rounded-xl sm:rounded-2xl hover:bg-green-600 transition-all text-sm sm:text-lg"
              >
                🚀 Commencer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Big CTA - Mobile optimized */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
            🎉 Prêt pour l'Aventure ?
          </h2>
          <p className="text-lg sm:text-2xl text-purple-100 mb-8 sm:mb-10 font-bold">
            Rejoins des milliers d'enfants qui lisent déjà avec Hikaya ! 🌟
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full sm:w-auto px-8 sm:px-16 py-4 sm:py-8 bg-white text-purple-600 font-black rounded-2xl sm:rounded-3xl hover:shadow-2xl transition-all hover:scale-110 text-xl sm:text-3xl"
          >
            🚀 Commencer Maintenant !
          </button>
        </div>
      </section>

      {/* Simple Footer - Mobile optimized */}
      <footer className="bg-purple-900 text-white py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <img src="/logo.png" alt="Hikaya Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
            <span className="text-lg sm:text-2xl font-black">Hikaya</span>
          </div>
          <p className="text-sm sm:text-lg text-purple-200">
            🌈 Rendez la lecture magique pour les enfants ! 📚
          </p>
          <p className="text-xs sm:text-sm text-purple-300 mt-2">
            © 2025 Hikaya - Tous droits réservés ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
