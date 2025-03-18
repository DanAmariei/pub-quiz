"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from '@supabase/supabase-js';

type ParticipantScore = {
  id: string;
  name: string;
  avatar_url?: string;
  score: number;
};

type EtapaRankingsProps = {
  tournamentId: string;
  date: string;
  className?: string;
  games: any[];
};

export default function EtapaRankings({
  tournamentId,
  date,
  className = "",
  games = [],
}: EtapaRankingsProps) {
  const [participants, setParticipants] = useState<ParticipantScore[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Creăm clientul Supabase o singură dată
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchParticipantsForStage() {
      setLoading(true);
      try {
        if (!games.length) {
          console.log('Nu există jocuri pentru această etapă');
          setParticipants([]);
          return;
        }

        const gameIds = games.map(game => game.id);
        console.log('ID-uri jocuri pentru turneul', tournamentId, 'și data', date, ':', gameIds);

        // Modificăm query-ul pentru a include și verificarea tournament_id prin join cu games
        const { data: gameRankings, error: rankingsError } = await supabase
          .from('game_rankings')
          .select(`
            points,
            participant_id,
            game_id,
            games!inner (
              tournament_id
            )
          `)
          .in('game_id', gameIds)
          .eq('games.tournament_id', tournamentId); // Verificăm că jocurile sunt din turneul corect

        if (rankingsError) {
          console.error('Eroare la obținerea clasamentului:', rankingsError);
          return;
        }

        if (!gameRankings?.length) {
          console.log('Nu s-au găsit scoruri pentru jocurile din acest turneu și această dată');
          setParticipants([]);
          return;
        }

        console.log('Scoruri găsite pentru turneu:', gameRankings);

        // Obținem ID-urile unice ale participanților
        const participantIds = [...new Set(gameRankings.map(r => r.participant_id))];

        // Obținem profilurile participanților
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', participantIds);

        if (profilesError) {
          console.error('Eroare la obținerea profilurilor:', profilesError);
          return;
        }

        // Creăm un map pentru scoruri
        const participantScores = new Map<string, ParticipantScore>();

        // Inițializăm participanții cu profilurile lor
        profiles?.forEach(profile => {
          participantScores.set(profile.id, {
            id: profile.id,
            name: profile.username || 'Anonim',
            avatar_url: profile.avatar_url,
            score: 0
          });
        });

        // Adăugăm scorurile din game_rankings
        gameRankings.forEach(ranking => {
          const participantData = participantScores.get(ranking.participant_id);
          if (participantData) {
            participantData.score += ranking.points || 0;
          }
        });

        // Sortăm participanții după scor
        const sortedParticipants = Array.from(participantScores.values())
          .sort((a, b) => b.score - a.score);

        console.log('Clasament final pentru turneul', tournamentId, 'și data', date, ':', sortedParticipants);
        setParticipants(sortedParticipants);
      } catch (error) {
        console.error('Eroare la procesarea datelor:', error);
        setParticipants([]);
      } finally {
        setLoading(false);
      }
    }

    fetchParticipantsForStage();
  }, [games, tournamentId, date]);
  
  // Dacă nu avem participanți, afișăm un mesaj
  if (participants.length === 0 && !loading) {
    return (
      <Card className={`${className} bg-gray-900 border-gray-800`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Clasament etapă</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-2">
            Nu există date suficiente pentru clasament
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${className} bg-gray-900 border-gray-800`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Clasament etapă</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-gray-800"></div>
            <div className="h-4 w-full animate-pulse rounded-md bg-gray-800"></div>
            <div className="h-4 w-full animate-pulse rounded-md bg-gray-800"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-800"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="w-6 sm:w-8 text-center font-medium shrink-0">
                    #{index + 1}
                  </div>
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 shrink-0">
                    <AvatarImage
                      src={participant.avatar_url || ''}
                      alt={participant.name}
                    />
                    <AvatarFallback>
                      {participant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {participant.name}
                  </span>
                </div>
                <div className="font-semibold whitespace-nowrap">
                  {participant.score} puncte
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 