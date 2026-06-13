'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

interface StudentAttempt {
  id: string;
  studentId: string;
  quizId: string;
  score: number;
  total: number;
  timeSpent: number;
  completedAt: Date;
  percentage: number;
}

interface QuizResultsProps {
  params: {
    id: string;
  };
}

export default function QuizResultsPage({ params }: QuizResultsProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<StudentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const q = query(
          collection(db, 'attempts'),
          where('quizId', '==', params.id)
        );
        const snapshot = await getDocs(q);
        const attemptsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
          completedAt: doc.data().completedAt?.toDate(),
        })) as StudentAttempt[];

        // Sort by score descending
        attemptsData.sort((a, b) => b.percentage - a.percentage);
        setAttempts(attemptsData);
      } catch (error) {
        console.error('Error fetching attempts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [params.id]);

  const handleDeleteAttempt = async (attemptId: string) => {
    if (confirm('Yakin ingin menghapus progress ujian siswa ini?')) {
      try {
        await deleteDoc(doc(db, 'attempts', attemptId));
        setAttempts(attempts.filter((a) => a.id !== attemptId));
      } catch (error) {
        console.error('Error deleting attempt:', error);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="teacher">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link href="/teacher/dashboard" className="text-accent hover:text-accent-dark text-sm">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">Hasil Ujian Siswa</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Total Pengerjaan</h3>
              <p className="text-4xl font-bold text-accent">{attempts.length}</p>
            </div>
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Rata-rata Score</h3>
              <p className="text-4xl font-bold text-success">
                {attempts.length > 0
                  ? Math.round(
                      attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="card">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Nilai Tertinggi</h3>
              <p className="text-4xl font-bold text-accent">
                {attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0}%
              </p>
            </div>
          </div>

          {/* Attempts Table */}
          {loading ? (
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : attempts.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">Belum ada siswa yang mengerjakan ujian ini</p>
            </div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Rank</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">ID Siswa</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Skor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Persentase</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Waktu</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Tanggal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-400">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt, index) => (
                    <tr key={attempt.id} className="border-b border-secondary hover:bg-secondary/30">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 truncate">
                        {attempt.studentId}
                      </td>
                      <td className="px-4 py-3 text-sm text-accent font-semibold">
                        {attempt.score}/{attempt.total}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            attempt.percentage >= 70
                              ? 'bg-success/20 text-success'
                              : attempt.percentage >= 50
                              ? 'bg-warning/20 text-warning'
                              : 'bg-danger/20 text-danger'
                          }`}
                        >
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {Math.floor(attempt.timeSpent / 60)}m
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {attempt.completedAt
                          ? new Date(attempt.completedAt).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteAttempt(attempt.id)}
                          className="text-danger hover:text-danger/80 text-xs"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
