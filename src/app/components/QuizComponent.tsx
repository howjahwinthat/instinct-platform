import { useState } from 'react';
import { Question } from '../data/types';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';

interface QuizComponentProps {
  questions: Question[];
  onComplete: (score: number) => void;
}

export function QuizComponent({ questions, onComplete }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [quizComplete, setQuizComplete] = useState(false);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleAnswerSelect = (index: number) => {
    if (!showExplanation) {
      setSelectedAnswer(index);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setShowExplanation(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      const correctAnswers = answers.filter((answer, index) =>
        answer === questions[index].correctAnswer
      ).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      setQuizComplete(true);
      onComplete(score);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
      setShowExplanation(answers[currentQuestion + 1] !== null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers(new Array(questions.length).fill(null));
    setQuizComplete(false);
  };

  if (quizComplete) {
    const correctAnswers = answers.filter((answer, index) =>
      answer === questions[index].correctAnswer
    ).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Quiz Complete!</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Your score: {correctAnswers} / {questions.length} ({score}%)
          </p>

          <div className="space-y-2 mb-6 text-left">
            {questions.map((q, index) => (
              <div key={q.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                {answers[index] === q.correctAnswer ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-900 dark:text-gray-200">{q.question}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleRetry} variant="outline">
            Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{question.question}</h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrect = showExplanation && isCorrect;
            const showIncorrect = showExplanation && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all
                  ${showCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:border-green-500' : ''}
                  ${showIncorrect ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-500' : ''}
                  ${!showExplanation && isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400' : ''}
                  ${!showExplanation && !isSelected ? 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600' : ''}
                  ${showExplanation && !isSelected && !isCorrect ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600' : ''}
                  ${showExplanation ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className={`
                    ${showCorrect ? 'text-green-800 dark:text-green-200' : ''}
                    ${showIncorrect ? 'text-red-800 dark:text-red-200' : ''}
                    ${!showCorrect && !showIncorrect ? 'text-gray-900 dark:text-gray-100' : ''}
                  `}>
                    {option}
                  </span>
                  {showCorrect && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Explanation</h4>
            <p className="text-blue-800 dark:text-blue-300 text-sm">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!showExplanation && (
          <Button
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
          >
            Check Answer
          </Button>
        )}
        {showExplanation && (
          <Button onClick={handleNext}>
            {isLastQuestion ? 'Complete Quiz' : 'Next Question'}
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}