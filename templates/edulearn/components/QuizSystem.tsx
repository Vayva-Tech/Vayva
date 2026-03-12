"use client";

import { useState } from 'react';
import { CheckCircle, XCircle, Circle, RotateCcw } from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onComplete?: (score: number, total: number) => void;
}

export default function QuizSystem({ questions, onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
    
    const score = calculateScore();
    if (onComplete) {
      onComplete(score, questions.length);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, question) => {
      const selectedOptionId = selectedAnswers[question.id];
      const correctOption = question.options.find(opt => opt.isCorrect);
      
      if (selectedOptionId === correctOption?.id) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setSubmitted(false);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getScorePercentage = () => {
    const score = calculateScore();
    return Math.round((score / questions.length) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = getScorePercentage();

    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
          <div className="text-4xl font-bold mb-2">
            <span className={percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}>
              {score}/{questions.length}
            </span>
            <span className="text-gray-400 text-2xl ml-2">({percentage}%)</span>
          </div>
          <p className="text-gray-600">
            {percentage >= 70 
              ? "🎉 Excellent work! You've mastered this material." 
              : percentage >= 50 
                ? "👍 Good effort! Review the material to improve." 
                : "📚 Keep studying and try again!"}
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {questions.map((question, index) => {
            const selectedOptionId = selectedAnswers[question.id];
            const correctOption = question.options.find(opt => opt.isCorrect);
            const isCorrect = selectedOptionId === correctOption?.id;

            return (
              <div key={question.id} className="border rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Question {index + 1}: {question.question}
                    </h3>
                    {question.explanation && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-lg border ${
                        option.id === selectedOptionId
                          ? option.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : option.isCorrect
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 ${
                          option.id === selectedOptionId || option.isCorrect
                            ? option.isCorrect ? 'text-green-600' : 'text-red-600'
                            : 'text-gray-400'
                        }`}>
                          {option.id === selectedOptionId ? (
                            option.isCorrect ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )
                          ) : option.isCorrect ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                        <span className={
                          option.id === selectedOptionId || option.isCorrect
                            ? option.isCorrect ? 'text-green-800' : 'text-red-800'
                            : 'text-gray-700'
                        }>
                          {option.text}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedAnswers[currentQuestion.id] === option.id
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : submitted
                    ? 'border-gray-200 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 ${
                  selectedAnswers[currentQuestion.id] === option.id 
                    ? 'text-blue-600' 
                    : 'text-gray-400'
                }`}>
                  {selectedAnswers[currentQuestion.id] === option.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </div>
                <span className="font-medium">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={goToNextQuestion}
            disabled={!selectedAnswers[currentQuestion.id]}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswers[currentQuestion.id]}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}