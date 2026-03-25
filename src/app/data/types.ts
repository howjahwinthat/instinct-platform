export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz';
  duration?: number; // in minutes
  content?: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  units: Unit[];
  skillsCount: number;
}

export interface UserProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
}
