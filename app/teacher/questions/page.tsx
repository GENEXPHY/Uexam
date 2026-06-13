'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { Question } from '@/lib/types';

export default function QuestionsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    image: null as File | null,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const q = query(
        collection(db, 'questions'),
        where('createdBy', '==', user?.uid)
      );
      const snapshot = await getDocs(q);
      const questionsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate(),
      })) as Question[];
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = '';

      if (formData.image) {
        const storageRef = ref(
          storage,
          `questions/${user?.uid}/${Date.now()}-${formData.image.name}`
        );
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'questions'), {
        text: formData.text,
        options: formData.options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        image: imageUrl,
        createdBy: user?.uid,
        createdAt: Timestamp.now(),
      });

      // Reset form
      setFormData({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        image: null,
      });
      setShowForm(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (confirm('Yakin ingin menghapus soal ini?')) {
      try {
        await deleteDoc(doc(db, 'questions', questionId));
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  return (
    <ProtectedRoute requiredRole="teacher">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href="/teacher/dashboard" className="text-accent hover:text-accent-dark text-sm">
                ← Kembali ke Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-white mt-2">Manajemen Soal</h1>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? '✕ Batal' : '+ Tambah Soal'}
            </button>
          </div>

          {/* Form Tambah Soal */}
          {showForm && (
            <div className="card mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Tambah Soal Baru</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Soal</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                    className="input min-h-24 resize-none"
                    placeholder="Masukkan pertanyaan soal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Upload Media (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input"
                  />
                  {formData.image && (
                    <p className="text-sm text-gray-400 mt-2">File: {formData.image.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4">Pilihan Jawaban</label>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={index}
                          checked={formData.correctAnswer === index}
                          onChange={() => setFormData((prev) => ({ ...prev, correctAnswer: index }))}
                          className="w-4 h-4 text-accent"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="input flex-1"
                          placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Penjelasan Jawaban</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, explanation: e.target.value }))}
                    className="input min-h-24 resize-none"
                    placeholder="Penjelasan untuk siswa yang salah menjawab"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-success w-full"
                >
                  {uploading ? 'Menyimpan...' : 'Simpan Soal'}
                </button>
              </form>
            </div>
          )}

          {/* Daftar Soal */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Soal Saya ({questions.length})</h2>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-400">Belum ada soal yang dibuat</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, idx) => (
                  <div key={question.id} className="card">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {idx + 1}. {question.text}
                      </h3>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="btn-danger text-sm"
                      >
                        🗑️ Hapus
                      </button>
                    </div>

                    {question.image && (
                      <img
                        src={question.image}
                        alt="Question"
                        className="w-full max-h-48 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Pilihan:</p>
                      <div className="space-y-1 text-sm">
                        {question.options.map((option, index) => (
                          <p
                            key={index}
                            className={`pl-4 ${
                              index === question.correctAnswer
                                ? 'text-success font-semibold'
                                : 'text-gray-300'
                            }`}
                          >
                            {index === question.correctAnswer ? '✓' : '○'} {option}
                          </p>
                        ))}
                      </div>
                    </div>

                    {question.explanation && (
                      <div className="bg-secondary/50 border border-accent/30 rounded-lg p-3">
                        <p className="text-xs text-gray-400 mb-1">Penjelasan:</p>
                        <p className="text-sm text-gray-300">{question.explanation}</p>
                      </div>
                    )}
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
