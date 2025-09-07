"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function DashboardCharts({ readingProgressData, weeklyReadingData }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6">Progrès par Enfant</h3>
                <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={readingProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <Bar dataKey="storiesRead" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366F1" />
                                    <stop offset="100%" stopColor="#8B5CF6" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-4 sm:mb-6">Activité Hebdomadaire</h3>
                <div className="h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weeklyReadingData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="day" fontSize={10} />
                            <YAxis fontSize={10} />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <Line type="monotone" dataKey="stories" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
