'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Quiz, Question } from '@/lib/types';

interface EditQuizProps {
  params: {
    id: string;
  };
}

export default function EditQuizPage({ params }: EditQuizProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizDoc = await getDoc(doc(db, 'quizzes', params.id));
        if (!quizDoc.exists()) {
          router.push('/teacher/dashboard');
          return;
        }

        const quizData = {
          ...quizDoc.data(),
          id: quizDoc.id,
          createdAt: quizDoc.data().createdAt?.toDate(),
        } as Quiz;

        setQuiz(quizData);
        setTitle(quizData.title);
        setDescription(quizData.description);
        setStatus(quizData.status);

        // Fetch questions for this quiz
        // In a real app, you'd fetch the actual question documents
        // For now, we'll just display the IDs
      } catch (error) {
        console.error('Error fetching quiz:', error);
        router.push('/teacher/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleSave = async () => {
    if (!quiz) return;
    setSaving(true);

    try {
      await updateDoc(doc(db, 'quizzes', quiz.id), {
        title,
        description,
        status,
      });
      alert('Ujian berhasil diperbarui');
    } catch (error) {
      console.error('Error updating quiz:', error);
      alert('Gagal memperbarui ujian');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!quiz) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400">Ujian tidak ditemukan</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link href="/teacher/dashboard" className="text-accent hover:text-accent-dark text-sm">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">Edit Ujian</h1>
          </div>

          <div className="card">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Judul Ujian</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Judul ujian"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-24 resize-none"
                  placeholder="Deskripsi ujian"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                  className="input"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>

              <div className="bg-secondary/50 border border-accent/30 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">📊 Informasi Ujian</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Soal</p>
                    <p className="text-xl font-bold text-accent">{quiz.questions.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Dibuat</p>
                    <p className="text-sm text-gray-300">
                      {quiz.createdAt?.toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex-1"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <Link href="/teacher/dashboard" className="btn-secondary flex-1 text-center">
                  Batal
                </Link>
              </div>
            </form>
          </div>

          {/* Soal dalam Ujian */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Soal dalam Ujian ({quiz.questions.length})</h2>
            {quiz.questions.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400 mb-4">Belum ada soal dalam ujian ini</p>
                <Link href="/teacher/questions" className="btn-primary inline-block">
                  Tambah Soal
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {quiz.questions.map((questionId, index) => (
                  <div key={questionId} className="card flex justify-between items-center">
                    <p className="text-white font-semibold">Soal {index + 1}</p>
                    <p className="text-gray-400 text-sm">{questionId}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
