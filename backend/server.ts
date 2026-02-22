import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";
import path from "path";
import aiRoutes from "./routes/ai.routes";
import { cacheService } from "./services/cache.service";
import { GithubRepoInfo, GithubTreeResponse } from "./types/github";
import { errorHandler, AppError } from "./middleware/errorHandler";
import { config } from "./config/env";

async function startServer() {
  const app = express();
  const PORT = config.port;

  app.use(express.json({ limit: '50mb' })); // Increase limit for large file payloads

  // API Routes for GitHub Proxy
  
  // Get User Repositories
  app.get("/api/github/repos", async (req, res, next) => {
    try {
      const userToken = req.headers['x-github-token'] as string;
      if (!userToken) {
        throw new AppError("GitHub token is required to list repositories", 401);
      }

      const headers: any = {
        'User-Agent': 'CodeMind-Analyst',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${userToken}`
      };

      // Fetch user repos sorted by updated time
      const url = `https://api.github.com/user/repos?sort=updated&per_page=100&type=all`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const error = await response.json();
        throw new AppError("Failed to fetch repositories", response.status, error);
      }

      const repos = await response.json();
      res.json(repos);
    } catch (error) {
      next(error);
    }
  });

  // Get Repository Tree (Recursive)
  app.get("/api/github/tree", async (req, res, next) => {
    try {
      const { owner, repo, branch } = req.query;
      if (!owner || !repo) {
        throw new AppError("Owner and repo are required", 400);
      }

      const headers: any = {
        'User-Agent': 'CodeMind-Analyst',
        'Accept': 'application/vnd.github.v3+json'
      };
      
      const userToken = req.headers['x-github-token'] as string;
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      } else if (config.githubToken) {
        headers['Authorization'] = `Bearer ${config.githubToken}`;
      }

      // Resolve branch if not provided
      let targetBranch = branch as string;
      if (!targetBranch) {
        const repoInfoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const repoRes = await fetch(repoInfoUrl, { headers });
        
        if (!repoRes.ok) {
           const error = await repoRes.json();
           throw new AppError("Failed to fetch repository info", repoRes.status, error);
        }
        
        const repoInfo = await repoRes.json() as GithubRepoInfo;
        targetBranch = repoInfo.default_branch;
      }

      // Check cache
      const cachedTree = cacheService.getTree(owner as string, repo as string, targetBranch);
      if (cachedTree) {
        return res.json(cachedTree);
      }

      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const error = await response.json();
        throw new AppError("Failed to fetch repository tree", response.status, error);
      }

      const data = await response.json() as GithubTreeResponse;
      const result = { ...data, branch: targetBranch };
      
      // Cache the result
      cacheService.setTree(owner as string, repo as string, targetBranch, result);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Get File Content
  app.get("/api/github/content", async (req, res, next) => {
    try {
      const { owner, repo, path: filePath, branch } = req.query;
      if (!owner || !repo || !filePath || !branch) {
        throw new AppError("Owner, repo, path, and branch are required", 400);
      }

      // Check cache first
      const cachedContent = cacheService.getFileContent(owner as string, repo as string, branch as string, filePath as string);
      if (cachedContent) {
        return res.send(cachedContent);
      }

      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
      
      const headers: any = {};
      const userToken = req.headers['x-github-token'] as string;
      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`;
      } else if (config.githubToken) {
        headers['Authorization'] = `Bearer ${config.githubToken}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new AppError("Failed to fetch file content", response.status);
      }

      // Robustness checks
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) { // 2MB limit
          throw new AppError("File too large (max 2MB)", 400);
      }

      const contentType = response.headers.get('content-type');
      // Basic binary check (can be improved)
      if (contentType && (
          contentType.includes('image') || 
          contentType.includes('application/octet-stream') ||
          contentType.includes('application/pdf') ||
          contentType.includes('video') ||
          contentType.includes('audio')
      )) {
          throw new AppError("Binary files are not supported", 400);
      }

      const text = await response.text();
      
      // Cache the content
      cacheService.setFileContent(owner as string, repo as string, branch as string, filePath as string, text);
      
      res.send(text);
    } catch (error) {
      next(error);
    }
  });

  // AI Routes
  app.use('/api/ai', aiRoutes);

  // Error Handler Middleware
  app.use(errorHandler);

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
