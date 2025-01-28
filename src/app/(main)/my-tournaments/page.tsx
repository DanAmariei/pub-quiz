export default function MyTournamentsPage() {
  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Turneele Mele</h1>
          <p className="text-muted-foreground">
            Turneele la care participi sau ai participat
          </p>
        </div>

        <div className="grid gap-4">
          <div className="border rounded-lg p-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-primary">Activ</span>
              <h3 className="text-xl font-semibold">Campionatul Național de Quiz</h3>
              <p className="text-sm text-muted-foreground">
                Poziția curentă: 5/32
              </p>
              <div className="mt-2">
                <p className="text-sm">Următorul meci: 15 Mai 2024, 18:00</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted">Finalizat</span>
              <h3 className="text-xl font-semibold">Cupa Primăverii</h3>
              <p className="text-sm text-muted-foreground">
                Poziția finală: 3/16
              </p>
              <div className="mt-2">
                <p className="text-sm">Finalizat pe: 1 Aprilie 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 