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

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const q = query(
          collection(db, 'quizzes'),
          where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);
        const quizzesData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate(),
        })) as Quiz[];
        setQuizzes(quizzesData);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <ProtectedRoute requiredRole="student">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard Siswa</h1>
            <p className="text-gray-400">
              Selamat datang, <span className="text-accent">{user?.username}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Ujian Tersedia</h3>
              <p className="text-4xl font-bold text-accent">{quizzes.length}</p>
            </div>
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Poin</h3>
              <p className="text-4xl font-bold text-success">0</p>
            </div>
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Ujian Selesai</h3>
              <p className="text-4xl font-bold text-accent">0</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Ujian Tersedia</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 mb-4">Tidak ada ujian yang tersedia saat ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="card-hover">
                    <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{quiz.description}</p>
                    <div className="mb-4 text-sm text-gray-400">
                      <p>Jumlah Soal: {quiz.questions.length}</p>
                    </div>
                    <Link
                      href={`/student/quiz/${quiz.id}`}
                      className="btn-primary w-full block text-center"
                    >
                      Mulai Ujian
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Riwayat Ujian</h2>
            <div className="card text-center py-12">
              <p className="text-gray-400">Belum ada riwayat ujian</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
