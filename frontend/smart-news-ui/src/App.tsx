import { useEffect, useState } from "react";
import axios from "axios";

type Article = {
  headline: string;
  sources: string[];
  totalArticles: number;
  articles: { link: string }[];
};

function App() {
  const [news, setNews] = useState<Article[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5050/clustered-news")
      .then(res => setNews(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
<div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white px-6 py-10">
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-12">
        Smart News Aggregator
      </h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

        {news.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-lg"
          >

            <h2 className="text-xl font-semibold mb-3">
              {item.headline}
            </h2>

            <div className="flex flex-wrap gap-2 mb-3">
              {item.sources.map((src, i) => (
                <span
                  key={i}
                  className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs"
                >
                  {src}
                </span>
              ))}
            </div>

            <p className="text-gray-400 text-sm mb-4">
              {item.totalArticles} related articles
            </p>

            <a
              href={item.articles[0].link}
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              Read more →
            </a>

          </div>
        ))}

      </div>
    </div>
  );
}

export default App;