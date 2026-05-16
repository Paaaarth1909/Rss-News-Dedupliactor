import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type Article = {
  id?: number;
  title?: string;
  content?: string;
  link?: string;
  source?: string;
  created_at?: string;
};

type NewsGroup = {
  headline: string;
  sources: string[];
  totalArticles: number;
  articles: Article[];
};

type Metric = {
  label: string;
  value: number;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5050").replace(
  /\/+$/,
  "",
);

const apiUrl = (path: string) => `${API_BASE}${path}`;
const API_LABEL = API_BASE.replace(/^https?:\/\//, "");
const processSteps = [
  {
    title: "Fetch",
    text: "RSS items are pulled from the configured feeds and stored locally.",
  },
  {
    title: "Compare",
    text: "Headlines are cleaned and compared with a lightweight similarity check.",
  },
  {
    title: "Group",
    text: "Related stories are presented once, with every source kept visible.",
  },
];

const sourceLabels = ["TechCrunch", "The Verge", "SQLite", "Express API"];

function App() {
  const [groups, setGroups] = useState<NewsGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState("");

  const fetchGroups = async () => {
    const response = await axios.get<NewsGroup[]>(apiUrl("/clustered-news"));
    return response.data;
  };

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(() => setError("Start the backend on port 5050 to load stories."))
      .finally(() => setIsLoading(false));
  }, []);

  const syncLatestNews = async () => {
    setIsSyncing(true);
    setError("");

    try {
      await axios.get(apiUrl("/news"));
      setGroups(await fetchGroups());
    } catch {
      setError("Unable to sync RSS feeds right now.");
    } finally {
      setIsSyncing(false);
    }
  };

  const metrics = useMemo<Metric[]>(() => {
    const articleCount = groups.reduce((count, group) => count + group.totalArticles, 0);
    const sourceCount = new Set(groups.flatMap((group) => group.sources)).size;
    const repeatedCount = groups.filter((group) => group.totalArticles > 1).length;

    return [
      { label: "Groups", value: groups.length },
      { label: "Articles", value: articleCount },
      { label: "Sources", value: sourceCount },
      { label: "Merged", value: repeatedCount },
    ];
  }, [groups]);

  const leadStory = groups[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060d] text-white">
      <Background />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <a href="#" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white text-sm font-black text-slate-950">
            SN
          </span>
          <div>
            <p className="text-sm font-bold leading-none">Smart News</p>
            <p className="mt-1 text-xs text-white/45">RSS deduplicator</p>
          </div>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-white/60 md:flex">
          <a className="transition hover:text-white" href="#workflow">
            Workflow
          </a>
          <a className="transition hover:text-white" href="#feed">
            Feed
          </a>
          <button
            type="button"
            onClick={syncLatestNews}
            disabled={isSyncing}
            className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 font-semibold text-white/80 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSyncing ? "Syncing..." : "Sync latest"}
          </button>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-12 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-10">
        <div className="fade-in">
          <div className="mb-6 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Built for cleaner reading
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-normal text-white sm:text-7xl lg:text-8xl">
            Stop reading the same story twice.
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Smart News pulls from multiple RSS feeds, groups similar headlines,
            and keeps source overlap easy to scan.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={syncLatestNews}
              disabled={isSyncing}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSyncing ? "Syncing feeds..." : "Sync latest news"}
            </button>
            <a
              href="#feed"
              className="rounded-2xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-bold text-white/85 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.09]"
            >
              View grouped feed
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {metrics.map((metric) => (
              <MetricTile key={metric.label} metric={metric} />
            ))}
          </div>
        </div>

        <HeroMockup leadStory={leadStory} isLoading={isLoading} />
      </section>

      <section
        id="workflow"
        className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-10"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {processSteps.map((step, index) => (
            <div
              key={step.title}
              className="fade-in rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/15 backdrop-blur-xl"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="mb-8 inline-grid h-10 w-10 place-items-center rounded-2xl bg-white text-sm font-black text-slate-950">
                0{index + 1}
              </span>
              <h2 className="text-2xl font-black">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="feed"
        className="relative z-10 mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:px-10"
      >
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
              Grouped feed
            </p>
            <h2 className="mt-3 text-4xl font-black sm:text-6xl">Latest stories</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sourceLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {isLoading && <LoadingGrid />}
        {!isLoading && error && <StatePanel title="Could not load news" message={error} />}
        {!isLoading && !error && groups.length === 0 && (
          <StatePanel
            title="No stories yet"
            message="Sync the latest news to fetch RSS articles and build grouped cards."
          />
        )}
        {!isLoading && !error && groups.length > 0 && <NewsGrid groups={groups} />}
      </section>
    </main>
  );
}

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0">
      <div className="absolute left-[-10rem] top-[-10rem] h-[32rem] w-[32rem] rounded-full bg-cyan-500/20 blur-[130px]" />
      <div className="absolute right-[-12rem] top-32 h-[30rem] w-[30rem] rounded-full bg-violet-500/18 blur-[130px]" />
      <div className="absolute bottom-[-16rem] left-1/3 h-[34rem] w-[34rem] rounded-full bg-emerald-400/10 blur-[140px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:84px_84px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%)]" />
    </div>
  );
}

function MetricTile({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
      <p className="text-3xl font-black">{metric.value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-white/45">
        {metric.label}
      </p>
    </div>
  );
}

function HeroMockup({
  leadStory,
  isLoading,
}: {
  leadStory?: NewsGroup;
  isLoading: boolean;
}) {
  return (
    <div className="fade-in relative [animation-delay:160ms]">
      <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="rounded-[1.5rem] border border-white/10 bg-[#070a14]/80 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-300/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-300/80" />
            </div>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-white/50">
              {API_LABEL}
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                Highlight
              </p>

              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-7 w-11/12 rounded-full bg-white/10" />
                  <div className="h-7 w-8/12 rounded-full bg-white/10" />
                  <div className="mt-7 h-3 rounded-full bg-white/10" />
                  <div className="h-3 w-9/12 rounded-full bg-white/10" />
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black leading-tight">
                    {leadStory?.headline ?? "Sync your feeds to start grouping stories."}
                  </h2>
                  <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-400">
                    {leadStory?.articles.find((article) => article.content)?.content ??
                      "The first grouped headline will appear here after the backend fetches RSS articles."}
                  </p>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-cyan-200/15 bg-cyan-200/10 p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">
                  Sources
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(leadStory?.sources.length ? leadStory.sources : ["RSS", "News"]).map(
                    (source) => (
                      <span
                        key={source}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-cyan-50"
                      >
                        {source}
                      </span>
                    ),
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                  Duplicate check
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-2/3 rounded-full bg-cyan-300" />
                </div>
                <p className="mt-4 text-sm text-slate-400">
                  Similar headlines are clustered before they reach the feed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewsGrid({ groups }: { groups: NewsGroup[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group, index) => (
        <NewsCard key={`${group.headline}-${index}`} group={group} index={index} />
      ))}
    </div>
  );
}

function NewsCard({ group, index }: { group: NewsGroup; index: number }) {
  const primaryLink = group.articles[0]?.link;
  const excerpt = group.articles.find((article) => article.content)?.content;

  return (
    <article
      className="fade-in group flex min-h-[21rem] flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.055] p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-200/35 hover:bg-white/[0.075]"
      style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
    >
      <div>
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
            {group.totalArticles} related
          </span>
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.75)]" />
        </div>

        <h3 className="text-2xl font-bold leading-tight text-white">{group.headline}</h3>

        {excerpt && (
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-400">
            {excerpt}
          </p>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-5 flex flex-wrap gap-2">
          {group.sources.map((source) => (
            <span
              key={source}
              className="rounded-full border border-cyan-200/15 bg-cyan-200/10 px-3 py-1.5 text-xs font-medium text-cyan-100"
            >
              {source}
            </span>
          ))}
        </div>

        {primaryLink && (
          <a
            href={primaryLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white/85 transition duration-300 group-hover:border-white/35 group-hover:bg-white group-hover:text-slate-950"
          >
            Read source
          </a>
        )}
      </div>
    </article>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/[0.055] p-6 backdrop-blur-xl"
        >
          <div className="h-4 w-28 rounded-full bg-white/10" />
          <div className="mt-8 h-8 w-11/12 rounded-full bg-white/10" />
          <div className="mt-4 h-8 w-8/12 rounded-full bg-white/10" />
          <div className="mt-8 space-y-3">
            <div className="h-3 rounded-full bg-white/10" />
            <div className="h-3 w-10/12 rounded-full bg-white/10" />
            <div className="h-3 w-7/12 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatePanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-8 text-center shadow-xl shadow-black/20 backdrop-blur-xl">
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default App;
