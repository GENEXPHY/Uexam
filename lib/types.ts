export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  image?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: string[]; // Question IDs
  createdBy: string;
  createdAt: Date;
  status: 'active' | 'inactive';
}

export interface StudentAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timestamp: Date;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  answers: StudentAnswer[];
  score: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  startedAt: Date;
  completedAt: Date;
  status: 'completed' | 'in_progress';
}

export interface User {
  uid: string;
  email: string;
  username: string;
  role: 'student' | 'teacher';
  createdAt: Date;
}
