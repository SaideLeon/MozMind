import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes for GitHub Proxy
  // We use a proxy to avoid CORS issues and manage basic fetching logic
  
  // Get Repository Tree (Recursive)
  app.get("/api/github/tree", async (req, res) => {
    const { owner, repo, branch } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and repo are required" });
    }

    const ref = branch ? `?recursive=1&ref=${branch}` : '?recursive=1';
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || 'main'}${ref}`;

    try {
      // Try main first, if fails try master (simple fallback logic)
      let response = await fetch(url, {
        headers: {
          'User-Agent': 'CodeMind-Analyst',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.status === 404 && !branch) {
         // Try 'master' if 'main' failed and no branch specified
         const masterUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
         response = await fetch(masterUrl, {
            headers: {
              'User-Agent': 'CodeMind-Analyst',
              'Accept': 'application/vnd.github.v3+json'
            }
          });
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("GitHub API Error:", error);
      res.status(500).json({ error: "Failed to fetch repository tree" });
    }
  });

  // Get File Content
  app.get("/api/github/content", async (req, res) => {
    const { owner, repo, path } = req.query;
    if (!owner || !repo || !path) {
      return res.status(400).json({ error: "Owner, repo, and path are required" });
    }

    const url = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch file content" });
      }
      const text = await response.text();
      res.send(text);
    } catch (error) {
      console.error("GitHub Content Error:", error);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
