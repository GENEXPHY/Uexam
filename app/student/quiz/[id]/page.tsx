'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Question, Quiz } from '@/lib/types';

interface QuizPageProps {
  params: {
    id: string;
  };
}

interface Answer {
  [key: string]: number;
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-tab protection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        alert('⚠️ Anda tidak boleh meninggalkan halaman ujian!');
        document.title = '⚠️ UJIAN - Kembali sekarang!';
      } else {
        document.title = 'Uexam - Quiz';
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!submitted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [submitted]);

  // Timer
  useEffect(() => {
    if (!submitted) {
      timerRef.current = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted]);

  // Fetch quiz and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get quiz
        const quizDoc = await getDoc(doc(db, 'quizzes', params.id));
        if (!quizDoc.exists()) {
          router.push('/student/dashboard');
          return;
        }

        const quizData = {
          ...quizDoc.data(),
          id: quizDoc.id,
          createdAt: quizDoc.data().createdAt?.toDate(),
        } as Quiz;
        setQuiz(quizData);

        // Get questions
        const questionsSnapshot = await getDocs(
          query(
            collection(db, 'questions'),
            where('__name__', 'in', quizData.questions)
          )
        );

        const questionsData = questionsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
        })) as Question[];

        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        router.push('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    if (window.confirm('Yakin ingin mengirimkan jawaban? Anda tidak bisa mengubahnya lagi.')) {
      setSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);

      // Calculate score
      let score = 0;
      questions.forEach((question) => {
        if (answers[question.id] === question.correctAnswer) {
          score++;
        }
      });

      // Save to results
      router.push(
        `/student/results/${params.id}?score=${score}&total=${questions.length}&time=${timeSpent}`
      );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="student">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <ProtectedRoute requiredRole="student">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-400">Ujian tidak ditemukan</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const question = questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Waktu: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Soal {currentQuestion + 1} dari {questions.length}
            </p>
          </div>

          {/* Question */}
          <div className="card mb-8">
            {question.image && (
              <div className="mb-6">
                <img
                  src={question.image}
                  alt="Question"
                  className="w-full max-h-80 object-cover rounded-lg"
                />
              </div>
            )}

            <h2 className="text-xl font-bold text-white mb-6">{question.text}</h2>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label key={index} className="flex items-center p-4 bg-secondary hover:bg-secondary/80 rounded-lg cursor-pointer transition-all">
                  <input
                    type="radio"
                    name={question.id}
                    value={index}
                    checked={answers[question.id] === index}
                    onChange={() => handleAnswerChange(question.id, index)}
                    className="w-4 h-4 text-accent"
                  />
                  <span className="ml-3 text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <button
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Soal Sebelumnya
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button onClick={handleSubmit} className="btn-success">
                Selesai & Lihat Hasil
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
                className="btn-primary"
              >
                Soal Berikutnya →
              </button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
