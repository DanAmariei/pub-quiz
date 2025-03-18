"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import GameCard from "@/components/game-card";
import EtapaRankings from "./etapa-rankings";

type TournamentGamesProps = {
  groupedGames: Record<string, any[]>;
  tournamentId: string;
};

export default function TournamentGames({ groupedGames, tournamentId }: TournamentGamesProps) {
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});
  
  const toggleDate = (date: string) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };
  
  // Funcție pentru a obține numărul maxim de participanți pentru jocurile dintr-o dată
  const getMaxParticipantsCount = (games: any[]) => {
    // Găsim numărul maxim de participanți dintr-un joc
    let maxParticipants = 0;
    
    games.forEach(game => {
      // Verificăm dacă jocul are participanți
      if (game.participants && game.participants.length > 0) {
        // Dacă primul element are o proprietate 'count', verificăm dacă e mai mare decât maximul curent
        if (game.participants[0].count !== undefined) {
          maxParticipants = Math.max(maxParticipants, game.participants[0].count);
        }
      }
    });
    
    return maxParticipants;
  };
  
  // Funcție pentru a determina etapa bazată pe dată
  const getStageForDate = (date: string, index: number) => {
    // Sortăm datele în ordine cronologică (cele mai vechi primele)
    const sortedDates = Object.keys(groupedGames).sort((a, b) => {
      const dateA = new Date(a.split('.').reverse().join('-'));
      const dateB = new Date(b.split('.').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });
    
    // Găsim indexul datei curente în array-ul sortat
    const stageIndex = sortedDates.indexOf(date);
    
    // Etapele încep de la 1
    return `ETAPA ${stageIndex + 1}`;
  };
  
  // Sortăm datele în ordine cronologică inversă (cele mai recente primele)
  const sortedDates = Object.keys(groupedGames).sort((a, b) => {
    const dateA = new Date(a.split('.').reverse().join('-'));
    const dateB = new Date(b.split('.').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <div className="grid gap-4">
      {sortedDates.map((date, index) => {
        const games = groupedGames[date];
        const participantsCount = getMaxParticipantsCount(games);
        const stage = getStageForDate(date, index);
        
        return (
          <div key={date} className="border rounded-lg overflow-hidden bg-gray-950">
            <Button 
              variant="ghost" 
              className="w-full flex justify-between items-center p-6 text-lg font-medium h-auto py-6"
              onClick={() => toggleDate(date)}
            >
              <div className="flex items-center gap-4">
                <CalendarIcon className="h-6 w-6" />
                <span className="text-xl font-bold">{date}</span>
                <span className="text-xl font-bold ml-2">{stage}</span>
                
                <Badge variant="secondary" className="rounded-full px-3 py-1 ml-2 bg-gray-800">
                  {games.length} jocuri
                </Badge>
                
                <Badge variant="secondary" className="rounded-full px-3 py-1 bg-gray-800">
                  {participantsCount} participanți
                </Badge>
              </div>
              {expandedDates[date] ? (
                <ChevronUp className="h-6 w-6" />
              ) : (
                <ChevronDown className="h-6 w-6" />
              )}
            </Button>
            
            {expandedDates[date] && (
              <div className="p-4 space-y-3 bg-gray-900">
                <EtapaRankings 
                  tournamentId={tournamentId}
                  date={date}
                  className="mb-4"
                  games={games}
                />
                
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    showHost={true}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {Object.keys(groupedGames).length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          Nu există jocuri în acest turneu.
        </p>
      )}
    </div>
  );
} 