'use client'

import { useState, useEffect } from 'react'
import { createClient } from "@/utils/supabase/client"

interface ParticipantResponse {
  participant_id: string
  profiles: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export function useGameParticipants(gameId: string) {
  const [participants, setParticipants] = useState<ParticipantResponse[]>([])

  useEffect(() => {
    const supabase = createClient()
    
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('game_participants')
        .select<string, ParticipantResponse>(`
          participant_id,
          profiles:participant_id!inner (
            id,
            username,
            avatar_url
          )
        `)
        .eq('game_id', gameId);

      if (error) {
        console.error('Error fetching participants:', error);
        return;
      }

      const formattedParticipants = data?.map(p => ({
        participant_id: p.participant_id,
        profiles: {
          id: p.profiles.id,
          username: p.profiles.username,
          avatar_url: p.profiles.avatar_url
        }
      }));

      setParticipants(formattedParticipants || []);
    };

    fetchParticipants();

    const channel = supabase
      .channel(`game_participants_${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_participants', filter: `game_id=eq.${gameId}` },
        fetchParticipants
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return participants;
} 