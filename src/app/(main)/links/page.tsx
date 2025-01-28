export default function LinksPage() {
  return (
    <main className="flex-1 container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Link-uri Utile</h1>
          <p className="text-muted-foreground">
            Resurse și link-uri importante pentru comunitatea quiz
          </p>
        </div>

        <div className="grid gap-4 max-w-3xl">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{link.title}</h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}

const links = [
  {
    title: "Federația Română de Quiz",
    description: "Site-ul oficial al Federației Române de Quiz cu informații despre competiții și evenimente",
    url: "#",
  },
  {
    title: "Resurse pentru Quiz",
    description: "Colecție de materiale și resurse pentru pregătirea la quiz",
    url: "#",
  },
  {
    title: "Blog Quiz România",
    description: "Articole și noutăți din lumea quiz-urilor",
    url: "#",
  },
  {
    title: "Forum Quiz România",
    description: "Comunitatea quiz din România - discuții, sfaturi și evenimente",
    url: "#",
  },
]; 