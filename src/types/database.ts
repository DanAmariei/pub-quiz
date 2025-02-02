export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_host: boolean;
  is_admin: boolean;
  updated_at: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      games: {
        Row: {
          id: string;
          created_at: string;
          is_finished: boolean;
          title: string;
          host_id: string;
          quiz_id: string;
        };
        Insert: Omit<Row, 'id' | 'created_at'>;
        Update: Partial<Omit<Row, 'id'>>;
      };
    };
  };
}

export interface Quiz {
  id: string
  created_at: string
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: Array<{
    id: string
    question: string
    song?: string
    image?: string
    video?: string
    correct_answer: string
    incorrect_answers: string[]
    order: number;
  }>
  created_by: string
}

export interface Tournament {
  id: string
  name: string
  description: string
  start_date: string
  stages: number
  status: 'upcoming' | 'active' | 'completed'
  participants?: Array<{
    username: string
  }>
  quiz_sessions?: Array<{
    id: string
    name: string
    status: 'waiting' | 'active' | 'completed'
    created_at: string
    quiz: {
      name: string
      category: string
      difficulty: 'easy' | 'medium' | 'hard'
    }
  }>
}

export interface Question {
  id: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
  order: number;
}

export interface Game {
  id: string;
  host_id: string;
  quiz_id: string;
  active_question_id: string | null;
  is_finished: boolean;
  created_at: string;
  quiz: {
    id: string;
    title: string;
    questions: Array<{
      question: Question;
    }>;
  };
}

export interface Ranking {
  participant_id: string;
  points: number;
  rank: number;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export interface QuizQuestion {
  quiz_id: string;
  question_id: string;
  order: number;
} 