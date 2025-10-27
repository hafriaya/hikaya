"use client";

import React from 'react';

export default function LoadingSpinner({ 
  size = 'medium', 
  message = 'Chargement...', 
  type = 'default',
  color = 'indigo' 
}) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  const colorClasses = {
    indigo: 'border-indigo-200 border-t-indigo-600',
    purple: 'border-purple-200 border-t-purple-600',
    pink: 'border-pink-200 border-t-pink-600',
    blue: 'border-blue-200 border-t-blue-600',
    green: 'border-green-200 border-t-green-600',
    yellow: 'border-yellow-200 border-t-yellow-600'
  };

  const spinnerClasses = `animate-spin rounded-full border-4 ${sizeClasses[size]} ${colorClasses[color]}`;

  if (type === 'inline') {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className={spinnerClasses}></div>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </div>
    );
  }

  if (type === 'button') {
    return (
      <div className="flex items-center justify-center gap-2">
        <div className={spinnerClasses}></div>
        <span>{message}</span>
      </div>
    );
  }

  if (type === 'overlay') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-center gap-3">
            <div className={spinnerClasses}></div>
            <span className="text-gray-700 font-medium">{message}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default full screen loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl w-full max-w-md shadow-2xl text-center border border-white/20 p-8">
        <div className="relative">
          <div className={`animate-spin rounded-full border-4 ${sizeClasses[size]} ${colorClasses[color]} mx-auto mb-6`}></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 animate-pulse"></div>
        </div>
        <p className="text-slate-600 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}

