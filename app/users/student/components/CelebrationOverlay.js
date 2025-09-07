"use client";

import React from 'react';

export default function CelebrationOverlay({ celebrationMode }) {
    if (!celebrationMode) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="text-6xl">🎉</div>
            <div className="absolute top-20 left-20 text-4xl">⭐</div>
            <div className="absolute top-32 right-32 text-5xl">🌟</div>
            <div className="absolute bottom-40 left-1/4 text-3xl">✨</div>
            <div className="absolute bottom-32 right-1/3 text-4xl">🎊</div>
        </div>
    );
}
