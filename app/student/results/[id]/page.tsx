'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Quiz, Question } from '@/lib/types';

interface ResultsPageProps {
  params: {
    id: string;
  };
}

interface StudentAnswer {
  questionId: string;
  studentAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  question: Question;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const score = parseInt(searchParams.get('score') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  const timeSpent = parseInt(searchParams.get('time') || '0');
  const percentage = Math.round((score / total) * 100);

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

        // Get questions with answers
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

        // Build answers array
        const answersArray = questionsData.map((q) => ({
          questionId: q.id,
          studentAnswer: -1, // Would be fetched from quiz attempt
          correctAnswer: q.correctAnswer,
          isCorrect: false,
          question: q,
        }));

        setAnswers(answersArray);

        // Save attempt to database
        await addDoc(collection(db, 'attempts'), {
          studentId: user?.uid,
          quizId: params.id,
          score,
          total,
          timeSpent,
          completedAt: Timestamp.now(),
          percentage,
        });
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router, user?.uid, score, total, timeSpent, percentage]);

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

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Score Card */}
          <div className="card mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Ujian Selesai! 🎉</h1>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div>
                <p className="text-gray-400 text-sm mb-2">Skor</p>
                <p className="text-4xl font-bold text-accent">{score}/{total}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Persentase</p>
                <p className={`text-4xl font-bold ${
                  percentage >= 70 ? 'text-success' : percentage >= 50 ? 'text-warning' : 'text-danger'
                }`}>
                  {percentage}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-2">Waktu</p>
                <p className="text-4xl font-bold text-accent">{Math.floor(timeSpent / 60)}m</p>
              </div>
            </div>

            <div className="mb-8">
              {percentage >= 70 ? (
                <div className="inline-block bg-success/20 border border-success text-success px-6 py-3 rounded-lg">
                  ✓ Selamat! Anda lulus ujian ini
                </div>
              ) : (
                <div className="inline-block bg-warning/20 border border-warning text-warning px-6 py-3 rounded-lg">
                  ⚠️ Silakan coba lagi untuk hasil yang lebih baik
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                <div>
                  <p className="font-semibold text-white">🥇 Anda</p>
                  <p className="text-sm text-gray-400">{user?.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{score} poin</p>
                  <p className="text-sm text-gray-400">{Math.floor(timeSpent / 60)} menit</p>
                </div>
              </div>
            </div>
          </div>

          {/* Review Answers */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Review Jawaban</h2>
            <div className="space-y-6">
              {answers.map((answer, index) => (
                <div key={answer.questionId} className="border-l-4 border-accent pl-4 pb-4">
                  <h3 className="font-semibold text-white mb-2">Soal {index + 1}</h3>
                  <p className="text-gray-300 mb-3">{answer.question.text}</p>

                  {answer.question.image && (
                    <img
                      src={answer.question.image}
                      alt="Question"
                      className="w-full max-h-64 object-cover rounded-lg mb-3"
                    />
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Jawaban Anda:</p>
                    <p className="text-white">{answer.question.options[answer.studentAnswer] || 'Tidak dijawab'}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Jawaban Benar:</p>
                    <p className="text-success">{answer.question.options[answer.correctAnswer]}</p>
                  </div>

                  {answer.question.explanation && (
                    <div className="bg-secondary/50 border border-accent/30 rounded-lg p-4">
                      <p className="text-sm font-semibold text-accent mb-2">📝 Penjelasan:</p>
                      <p className="text-gray-300">{answer.question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/student/dashboard" className="btn-primary flex-1 text-center">
              Kembali ke Dashboard
            </Link>
            <button className="btn-secondary flex-1">
              Download Hasil
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
