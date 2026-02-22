import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";
import path from "path";
import aiRoutes from "./routes/ai.routes";
import { cacheService } from "./services/cache.service";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' })); // Increase limit for large file payloads

  // API Routes for GitHub Proxy
  // We use a proxy to avoid CORS issues and manage basic fetching logic
  
  // Get Repository Tree (Recursive)
  app.get("/api/github/tree", async (req, res) => {
    const { owner, repo, branch } = req.query;
    if (!owner || !repo) {
      return res.status(400).json({ error: "Owner and repo are required" });
    }

    // Check cache first if branch is provided
    if (branch) {
      const cachedTree = cacheService.getTree(owner as string, repo as string, branch as string);
      if (cachedTree) {
        return res.json(cachedTree);
      }
    }

    const ref = branch ? `?recursive=1&ref=${branch}` : '?recursive=1';
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch || 'main'}${ref}`;

    try {
      const headers: any = {
        'User-Agent': 'CodeMind-Analyst',
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (process.env.GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      // Try main first, if fails try master (simple fallback logic)
      let usedBranch = branch || 'main';
      let response = await fetch(url, { headers });

      if (response.status === 404 && !branch) {
         // Try 'master' if 'main' failed and no branch specified
         const masterUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
         response = await fetch(masterUrl, { headers });
         if (response.ok) usedBranch = 'master';
      }

      if (!response.ok) {
        const error = await response.json();
        return res.status(response.status).json(error);
      }

      const data = await response.json() as any;
      const result = { ...data, branch: usedBranch };
      
      // Cache the result
      cacheService.setTree(owner as string, repo as string, usedBranch as string, result);
      
      res.json(result);
    } catch (error) {
      console.error("GitHub API Error:", error);
      res.status(500).json({ error: "Failed to fetch repository tree" });
    }
  });

  // Get File Content
  app.get("/api/github/content", async (req, res) => {
    const { owner, repo, path, branch } = req.query;
    if (!owner || !repo || !path || !branch) {
      return res.status(400).json({ error: "Owner, repo, path, and branch are required" });
    }

    // Check cache first
    const cachedContent = cacheService.getFileContent(owner as string, repo as string, branch as string, path as string);
    if (cachedContent) {
      return res.send(cachedContent);
    }

    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch file content" });
      }
      const text = await response.text();
      
      // Cache the content
      cacheService.setFileContent(owner as string, repo as string, branch as string, path as string, text);
      
      res.send(text);
    } catch (error) {
      console.error("GitHub Content Error:", error);
      res.status(500).json({ error: "Failed to fetch file content" });
    }
  });

  // AI Routes
  app.use('/api/ai', aiRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: process.cwd(), // Ensure root is correct since we moved server.ts
    });
    app.use(vite.middlewares);
  } else {
    // Production middleware
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
