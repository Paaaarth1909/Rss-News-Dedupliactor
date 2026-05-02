const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");
const db = require("./database");
const { clusterArticles, formatClusters } = require("./utils/deduplicate");
const app = express();

const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  },
});

app.use(cors());

const PORT = process.env.PORT || 5050;

const feeds = [
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml",
];

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/news", async (req, res) => {
  try {
    let allArticles = [];

    for (let url of feeds) {
      try {
        const feed = await parser.parseURL(url);

        const articles = feed.items.map((item) => ({
          title: item.title,
          content: item.contentSnippet || "",
          link: item.link,
          source: feed.title,
        }));

        allArticles = allArticles.concat(articles);

        for (let article of articles) {
          try {
            db.prepare(
              `INSERT OR IGNORE INTO articles (title, content, link, source) VALUES (?, ?, ?, ?)`
            ).run(
              article.title,
              article.content,
              article.link,
              article.source
            );
          } catch (err) {}
        }
      } catch (err) {}
    }

    res.json(allArticles);
  } catch (error) {
    res.status(500).send("Error fetching news");
  }
});

app.get("/stored-news", (req, res) => {
  try {
    const articles = db
      .prepare(`SELECT * FROM articles ORDER BY created_at DESC`)
      .all();

    res.json(articles);
  } catch (err) {
    res.status(500).send("Error fetching stored news");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.get("/clustered-news", (req, res) => {
  try {
    const articles = db.prepare(`
      SELECT * FROM articles
      ORDER BY created_at DESC
    `).all();

    const clusters = clusterArticles(articles);

    const formatted = formatClusters(clusters);

    res.json(formatted);

  } catch (err) {
    res.status(500).send("Error clustering news");
  }
});