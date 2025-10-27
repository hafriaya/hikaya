"use client";

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function NavigationLoading({ 
  destination = "la page suivante", 
  role = "user" 
}) {
  const messages = {
    admin: `Redirection vers ${destination}...`,
    teacher: `Chargement de ${destination}...`,
    parent: `Accès à ${destination}...`,
    student: `Préparation de ${destination}...`,
    default: `Chargement de ${destination}...`
  };

  const loadingMessage = messages[role] || messages.default;

  if (role === 'student') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300 flex items-center justify-center z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20 max-w-md mx-4">
          <div className="mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-xl border-4 border-white animate-pulse">
              <div className="text-4xl">📚</div>
            </div>
          </div>
          <h2 className="text-2xl font-black text-purple-800 mb-4">✨ {loadingMessage} ✨</h2>
          <p className="text-lg text-purple-700 font-bold mb-4">Prépare-toi pour l'aventure ! 🚀</p>
          
          {/* Loading dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
        <div className="flex flex-col items-center justify-center">
          <LoadingSpinner size="large" message="" />
          <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Chargement en cours</h3>
          <p className="text-gray-600 text-center">{loadingMessage}</p>
        </div>
      </div>
    </div>
  );
}

