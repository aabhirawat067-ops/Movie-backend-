import dns from "node:dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch(endpoint, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  url.searchParams.set("api_key", process.env.TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000),
});
  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

app.get("/", (req, res) => {
  res.json({
    message: "Movie Explorer API is running 🎬",
  });
});

app.get("/api/movies/trending", async (req, res) => {
  try {
    const data = await tmdbFetch("/trending/movie/week", {
      language: "en-US",
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch trending movies",
    });
  }
});

app.get("/api/movies/popular", async (req, res) => {
  try {
    const data = await tmdbFetch("/movie/popular", {
      language: "en-US",
      page: 1,
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch popular movies",
    });
  }
});

app.get("/api/movies/upcoming", async (req, res) => {
  try {
    const data = await tmdbFetch("/movie/upcoming", {
      language: "en-US",
      page: 1,
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch upcoming movies",
    });
  }
});

app.get("/api/movies/search", async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    const data = await tmdbFetch("/search/movie", {
      query,
      include_adult: false,
      language: "en-US",
      page: 1,
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to search movies",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🎬 Movie Explorer API running on http://localhost:${PORT}`);
});