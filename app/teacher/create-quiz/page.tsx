'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function CreateQuizPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Judul ujian harus diisi');
      return;
    }

    setLoading(true);
    try {
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        title,
        description,
        createdBy: user?.uid,
        questions: [],
        status: 'active',
        createdAt: Timestamp.now(),
      });

      router.push(`/teacher/edit-quiz/${quizRef.id}`);
    } catch (err) {
      console.error('Error creating quiz:', err);
      setError('Gagal membuat ujian');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="teacher">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Link href="/teacher/dashboard" className="text-accent hover:text-accent-dark text-sm">
              ← Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-white mt-2">Buat Ujian Baru</h1>
          </div>

          <div className="card">
            <form onSubmit={handleCreate} className="space-y-6">
              {error && (
                <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Judul Ujian</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="Contoh: Ujian Matematika Bab 5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi Ujian</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input min-h-32 resize-none"
                  placeholder="Deskripsi singkat tentang ujian ini"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Membuat...' : 'Buat Ujian'}
                </button>
                <Link href="/teacher/dashboard" className="btn-secondary flex-1 text-center">
                  Batal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
