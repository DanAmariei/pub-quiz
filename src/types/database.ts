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
    };
  };
}

export interface Quiz {
  id: string
  created_at: string
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: {
    questions: Array<{
      question: string
      song?: string
      image?: string
      video?: string
      correct_answer: string
      incorrect_answers: string[]
    }>
  }
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