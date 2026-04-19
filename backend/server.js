const express = require("express");
const Parser = require("rss-parser");
const cors = require("cors");
const db = require("./database");

const app = express();
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  }
});
app.use(cors());

const PORT = process.env.PORT || 5050;

// RSS feeds
const feeds = [
  // "https://feeds.bbci.co.uk/news/rss.xml",
  "https://techcrunch.com/feed/",
  "https://www.theverge.com/rss/index.xml"
];

// API to fetch news
app.get("/news", async (req, res) => {
  try {
    let allArticles = [];

    for (let url of feeds) {
      try {
        const feed = await parser.parseURL(url);

        const articles = feed.items.map(item => ({
          title: item.title,
          content: item.contentSnippet || "",
          link: item.link,
          source: feed.title
        }));

for (let article of articles) {
  try {
    db.prepare(`
      INSERT OR IGNORE INTO articles (title, content, link, source)
      VALUES (?, ?, ?, ?)
    `).run(article.title, article.content, article.link, article.source);
  } catch (err) {
    console.log("DB insert error");
  }
}
      } catch (err) {
        console.log("Error with feed:", url);
      }
    }

    res.json(allArticles);

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).send("Error fetching news");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.get("/stored-news", (req, res) => {
  try {
    const articles = db.prepare(`
      SELECT * FROM articles
      ORDER BY created_at DESC
    `).all();

    res.json(articles);
  } catch (err) {
    res.status(500).send("Error fetching stored news");
  }
});