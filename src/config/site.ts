type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
  };
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export const siteConfig: SiteConfig = {
  name: "Quizmasters Hub",
  description:
    "Where quiz-lovers meet and knowledge is shared!",
  url: baseUrl,
  ogImage: `${baseUrl}/open-graph.png`,
  links: {
    twitter: "https://instagram.com/quizmasters_hub",
    github: "https://github.com/DanAmariei",
  },
};
