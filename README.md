# RSS News Deduplicator

This project is a full-stack Smart News application that fetches articles from multiple RSS feeds, stores them locally, and groups similar headlines so users do not have to read the same story again and again.

The system uses a Node.js backend with Express, RSS parsing, SQLite storage, and a lightweight article deduplication algorithm. The frontend is built with React, TypeScript, Vite, and Tailwind CSS.

---

# Overview

The RSS News Deduplicator collects technology news from configured RSS feeds, saves each article in a local SQLite database, and clusters related stories based on headline similarity.

The frontend displays the grouped feed with source information, article counts, and quick metrics so repeated news coverage can be scanned easily.

---

# Technologies Used

- Node.js
- Express.js
- RSS Parser
- Better SQLite3
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

---

# Core Concepts Used

## RSS Feed Fetching

The backend pulls articles from RSS feeds using `rss-parser`.

Currently configured feeds:
- TechCrunch
- The Verge

Each article stores:
- title
- content snippet
- source
- original link

---

# Local Storage

Articles are stored in a local SQLite database using `better-sqlite3`.

The database table includes:
- article ID
- title
- content
- link
- source
- created timestamp

The article link is unique, so duplicate RSS entries are ignored during insertion.

---

# Deduplication Logic

The deduplication engine groups articles by comparing cleaned headline words.

## Text Cleaning

The headline cleaning pipeline:
- converts text to lowercase
- removes punctuation
- splits text into words
- removes very short words

## Similarity Check

The project uses Jaccard Similarity to compare headline word sets.

```text
Similarity = common words / total unique words
```

If the similarity score is above the threshold, articles are grouped into the same cluster.

---

# Workflow

## Step 1 - Fetch RSS Articles

- Read articles from configured RSS feeds
- Extract title, snippet, link, and source
- Combine articles from all feeds

## Step 2 - Store Articles

- Save articles in SQLite
- Ignore articles with links that already exist
- Keep stored news available for later clustering

## Step 3 - Clean Headlines

- Normalize article titles
- Remove punctuation
- Convert titles into useful word sets

## Step 4 - Compare Articles

- Compare each article with existing clusters
- Calculate Jaccard similarity between headlines
- Add similar articles to the same group

## Step 5 - Format Clusters

- Pick the first article title as the group headline
- Count total articles in the group
- List every source represented in the group
- Return grouped articles to the frontend

## Step 6 - Display Smart Feed

- Show metrics for groups, articles, sources, and merged stories
- Display grouped news cards
- Allow syncing latest RSS articles from the UI

---

# API Endpoints

| Endpoint | Method | Description |
| --- | --- | --- |
| `/` | GET | Health check for the backend |
| `/news` | GET | Fetch latest RSS articles and store them |
| `/stored-news` | GET | Return all stored articles |
| `/clustered-news` | GET | Return deduplicated article groups |

---

# Project Structure

```bash
rss-news-deduplicator/
│
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   └── utils/
│       └── deduplicate.js
│
├── frontend/
│   └── smart-news-ui/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.tsx
│       ├── public/
│       ├── package.json
│       └── vite.config.ts
│
├── package.json
└── README.md
```

---

# Running the Project

## Backend Setup

```bash
cd backend
npm install
npm start
```

The backend runs on:

```text
http://localhost:5050
```

## Frontend Setup

Open a second terminal and run:

```bash
cd frontend/smart-news-ui
npm install
npm run dev
```

The frontend runs on the Vite development URL shown in the terminal, usually:

```text
http://localhost:5173
```

---

# Environment Configuration

The frontend uses the backend URL below by default:

```text
http://localhost:5050
```

To override it, create a `.env` file inside `frontend/smart-news-ui/`:

```env
VITE_API_BASE_URL=http://localhost:5050
```

---

# Sample API Output

```json
[
  {
    "headline": "Example technology news headline",
    "totalArticles": 2,
    "sources": ["TechCrunch", "The Verge"],
    "articles": [
      {
        "title": "Example technology news headline",
        "content": "Short article summary",
        "link": "https://example.com/article",
        "source": "TechCrunch"
      }
    ]
  }
]
```

---

# Key Features

- Fetches news from multiple RSS sources
- Stores articles in SQLite
- Prevents duplicate article links from being saved
- Groups similar headlines using Jaccard Similarity
- Provides clean backend API routes
- Displays grouped stories in a modern React interface
- Shows feed metrics and source overlap
- Supports manual syncing from the frontend

---

# Key Learnings

This project helped in understanding:
- RSS feed parsing
- Express API development
- SQLite database integration
- Basic text preprocessing
- Similarity-based deduplication
- Full-stack React and Node.js integration
- Building a cleaner news reading workflow

---

# Notes

- The deduplication algorithm is intentionally lightweight and explainable.
- The backend stores articles locally in `news.db`.
- More RSS feeds can be added from the `feeds` array in `backend/server.js`.
- The frontend expects the backend to be running before loading grouped stories.

---

# Author

Parthsaarthie Sharma
