'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        router.push('/student/dashboard');
      } else {
        router.push('/teacher/dashboard');
      }
    } else {
      router.push('/auth/login');
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-secondary">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-accent">Uexam</h1>
        <p className="text-gray-300 mb-8">Platform Ujian Online</p>
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
