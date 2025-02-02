import { createClient } from "@/utils/supabase/server";
import { getProfile } from "@/utils/get-profile";
import CreateTournamentForm from "./_components/create-tournament-form";
import TournamentCard from "./_components/tournament-card";

export default async function TurneePage() {
  const { profile } = await getProfile() || {};
  const canCreateTournament = profile?.is_host || profile?.is_admin;

  const supabase = createClient();
  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('start_date', { ascending: true });

  console.log('tournaments basic query:', { tournaments, error });

  let formattedTournaments = tournaments || [];
  
  if (tournaments && tournaments.length > 0) {
    const { data: gamesCount } = await supabase
      .from('games')
      .select('tournament_id')
      .in('tournament_id', tournaments.map(t => t.id));

    console.log('games count query:', { gamesCount });

    formattedTournaments = tournaments.map(tournament => ({
      ...tournament,
      games_count: gamesCount?.filter(g => g.tournament_id === tournament.id).length || 0
    }));
  }

  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex justify-between items-center w-full max-w-2xl">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Turnee</h1>
            <p className="text-muted-foreground">
              Toate turneele disponibile
            </p>
          </div>
          {canCreateTournament && <CreateTournamentForm />}
        </div>

        <div className="flex flex-col gap-4 w-full max-w-2xl">
          {formattedTournaments?.map((tournament) => (
            <TournamentCard 
              key={tournament.id} 
              tournament={tournament}
              canDelete={canCreateTournament}
            />
          ))}
          {(!formattedTournaments || formattedTournaments.length === 0) && (
            <p className="text-muted-foreground text-center py-8">
              Nu există turnee încă.
            </p>
          )}
        </div>
      </div>
    </main>
  );
} 