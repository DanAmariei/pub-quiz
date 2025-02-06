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
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['games']['Row'], 'id'>>;
      };
    };
  };
}

export interface Category {
  id: string
  name: string
}

export interface Question {
  id: string
  question: string
  correct_answer: string
  incorrect_answers: string[]
  category: Category
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface QuizQuestion {
  question: Question
  answers_order: string[]
  order: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: QuizQuestion[]
}

export interface Game {
  id: string
  host_id: string
  quiz_id: string
  active_question_id: string | null
  is_finished: boolean
  title: string
  quiz: Quiz
}

export interface GameParticipant {
  id: string
  game_id: string
  participant_id: string
  score: number
}

export interface UserAnswer {
  question_id: string
  answer: string
  is_correct: boolean
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

export interface Tournament {
  id: string
  name: string
  description: string
  start_date: string
  stages: number
  status: 'upcoming' | 'active' | 'completed'
  games_count?: number
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