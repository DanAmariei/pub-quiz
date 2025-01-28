export default function MyGamesPage() {
  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Jocurile Mele</h1>
          <p className="text-muted-foreground">
            Istoricul jocurilor și performanțele tale
          </p>
        </div>

        <div className="grid gap-4">
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Quiz de Istorie</h3>
                <p className="text-sm text-muted-foreground mt-1">Completat pe 12 Aprilie 2024</p>
              </div>
              <span className="text-lg font-semibold">85/100</span>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Quiz de Geografie</h3>
                <p className="text-sm text-muted-foreground mt-1">Completat pe 10 Aprilie 2024</p>
              </div>
              <span className="text-lg font-semibold">92/100</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 