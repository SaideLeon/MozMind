import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'cache.db');
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Ensure the database file exists or is created
const db = new Database(DB_PATH);

// Error logging for SQLite
db.on('error', (err) => {
  console.error('SQLite Database Error:', err);
});

// Initialize tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS repo_trees (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS file_contents (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
} catch (err) {
  console.error('Failed to initialize SQLite tables:', err);
}

// Cleanup old entries on startup
try {
  const now = Date.now();
  db.prepare('DELETE FROM repo_trees WHERE created_at < ?').run(now - TTL_MS);
  db.prepare('DELETE FROM file_contents WHERE created_at < ?').run(now - TTL_MS);
} catch (err) {
  console.error('Failed to cleanup SQLite cache:', err);
}

export const cacheService = {
  getTree(owner: string, repo: string, branch: string) {
    try {
      const id = `${owner}/${repo}/${branch}`;
      const row = db.prepare('SELECT data, created_at FROM repo_trees WHERE id = ?').get(id) as { data: string, created_at: number } | undefined;

      if (!row) return null;

      if (Date.now() - row.created_at > TTL_MS) {
        db.prepare('DELETE FROM repo_trees WHERE id = ?').run(id);
        return null;
      }

      return JSON.parse(row.data);
    } catch (err) {
      console.error('SQLite getTree error:', err);
      return null;
    }
  },

  setTree(owner: string, repo: string, branch: string, data: any) {
    try {
      const id = `${owner}/${repo}/${branch}`;
      const stmt = db.prepare('INSERT OR REPLACE INTO repo_trees (id, data, created_at) VALUES (?, ?, ?)');
      stmt.run(id, JSON.stringify(data), Date.now());
    } catch (err) {
      console.error('SQLite setTree error:', err);
    }
  },

  getFileContent(owner: string, repo: string, branch: string, filePath: string) {
    try {
      const id = `${owner}/${repo}/${branch}/${filePath}`;
      const row = db.prepare('SELECT content, created_at FROM file_contents WHERE id = ?').get(id) as { content: string, created_at: number } | undefined;

      if (!row) return null;

      if (Date.now() - row.created_at > TTL_MS) {
        db.prepare('DELETE FROM file_contents WHERE id = ?').run(id);
        return null;
      }

      return row.content;
    } catch (err) {
      console.error('SQLite getFileContent error:', err);
      return null;
    }
  },

  setFileContent(owner: string, repo: string, branch: string, filePath: string, content: string) {
    try {
      const id = `${owner}/${repo}/${branch}/${filePath}`;
      const stmt = db.prepare('INSERT OR REPLACE INTO file_contents (id, content, created_at) VALUES (?, ?, ?)');
      stmt.run(id, content, Date.now());
    } catch (err) {
      console.error('SQLite setFileContent error:', err);
    }
  }
};
