'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Quiz } from '@/lib/types';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quizzes created by teacher
        const quizzesQuery = query(
          collection(db, 'quizzes'),
          where('createdBy', '==', user?.uid)
        );
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizzesData = quizzesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
        })) as Quiz[];
        setQuizzes(quizzesData);

        // Fetch attempts for teacher's quizzes
        const attemptIds = quizzesData.map((q) => q.id);
        if (attemptIds.length > 0) {
          const attemptsQuery = query(
            collection(db, 'attempts'),
            where('quizId', 'in', attemptIds)
          );
          const attemptsSnapshot = await getDocs(attemptsQuery);
          const attemptsData = attemptsSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            completedAt: doc.data().completedAt?.toDate(),
          }));
          setAttempts(attemptsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      fetchData();
    }
  }, [user?.uid]);

  return (
    <ProtectedRoute requiredRole="teacher">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard Guru</h1>
            <p className="text-gray-400">
              Selamat datang, <span className="text-accent">{user?.username}</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Ujian</h3>
              <p className="text-4xl font-bold text-accent">{quizzes.length}</p>
            </div>
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Pengerjaan Siswa</h3>
              <p className="text-4xl font-bold text-success">{attempts.length}</p>
            </div>
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Rata-rata Score</h3>
              <p className="text-4xl font-bold text-accent">
                {attempts.length > 0
                  ? Math.round(
                      attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) /
                        attempts.length
                    )
                  : 0}
                %
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-12 flex gap-4">
            <Link
              href="/teacher/create-quiz"
              className="btn-primary"
            >
              + Buat Ujian Baru
            </Link>
            <Link
              href="/teacher/questions"
              className="btn-secondary"
            >
              📋 Kelola Soal
            </Link>
          </div>

          {/* Quizzes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Ujian Saya</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 mb-4">Belum ada ujian yang dibuat</p>
                <Link href="/teacher/create-quiz" className="btn-primary inline-block">
                  Buat Ujian Pertama
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map((quiz) => {
                  const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
                  return (
                    <div key={quiz.id} className="card">
                      <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{quiz.description}</p>
                      <div className="mb-4 text-sm text-gray-400">
                        <p>📝 {quiz.questions.length} soal</p>
                        <p>👥 {quizAttempts.length} pengerjaan</p>
                        <p className="flex items-center gap-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${
                              quiz.status === 'active' ? 'bg-success' : 'bg-danger'
                            }`}
                          />
                          {quiz.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/teacher/edit-quiz/${quiz.id}`}
                          className="btn-secondary flex-1 text-center text-sm"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/teacher/quiz/${quiz.id}/results`}
                          className="btn-primary flex-1 text-center text-sm"
                        >
                          Lihat Hasil
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
