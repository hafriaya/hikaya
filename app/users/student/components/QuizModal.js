"use client";

import React from 'react';

export default function QuizModal({
    showQuiz,
    setShowQuiz,
    showResults,
    questions,
    currentQuestionIndex,
    selectedAnswers,
    handleAnswerSelect,
    handleNextQuestion,
    handleQuizComplete,
    quizScore,
    isPassingScore,
    showHint,
    setShowHint,
    isSubmittingQuiz = false
}) {
    if (!showQuiz) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {!showResults ? (
                    // Quiz Questions
                    <div>
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-2">📚</div>
                            <h2 className="text-2xl font-bold text-purple-600">Quiz de l&apos;histoire</h2>
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
                                                💡 {showHint ? 'Masquer l&apos;indice' : 'Voir l&apos;indice'}
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
                                        {questions[currentQuestionIndex].options.map((option, optionIndex) => {
                                            const isSelected = selectedAnswers[currentQuestionIndex] === optionIndex;
                                            const isCorrect = optionIndex === questions[currentQuestionIndex].correctAnswerIndex;
                                            const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
                                            
                                            return (
                                                <button
                                                    key={optionIndex}
                                                    onClick={() => !hasAnswered && handleAnswerSelect(currentQuestionIndex, optionIndex)}
                                                    disabled={hasAnswered}
                                                    className={`w-full p-4 text-left rounded-xl border-2 transition-all relative ${
                                                        hasAnswered
                                                            ? isCorrect
                                                                ? 'border-green-500 bg-green-100 text-green-700'
                                                                : isSelected
                                                                ? 'border-red-500 bg-red-100 text-red-700'
                                                                : 'border-gray-200 bg-gray-100 text-gray-500'
                                                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                                                    } ${hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-black flex-1">{option}</span>
                                                        {hasAnswered && isSelected && (
                                                            <div className="text-lg">
                                                                {isCorrect ? '✅' : '❌'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
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
                                    🏆 Excellent ! Tu as bien compris l&apos;histoire !
                                </p>
                            </div>
                        ) : (
                            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                                <p className="text-red-800 font-bold">
                                    📚 Tu peux relire l&apos;histoire et réessayer !
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleQuizComplete}
                            disabled={isSubmittingQuiz}
                            className={`px-8 py-4 rounded-xl font-bold transition-all ${
                                isSubmittingQuiz 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-purple-500 hover:bg-purple-600'
                            } text-white`}
                        >
                            {isSubmittingQuiz ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Sauvegarde...</span>
                                </div>
                            ) : (
                                isPassingScore ? 'Continuer' : 'Fermer'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
