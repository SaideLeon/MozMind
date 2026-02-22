import { useState, useCallback } from 'react';
import { FileNode } from '@/types';
import { githubApi } from '@/services/github.api';

export function useGithubRepository() {
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ path: string, content: string } | null>(null);
  
  // History
  const [fileHistory, setFileHistory] = useState<{ path: string, content: string }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  const fetchRepository = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    setRepoUrl(url);
    
    try {
      const cleanUrl = url.replace(/\.git\/?$/, "").replace(/\/$/, "");
      const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error("URL do GitHub inválida. Use o formato: https://github.com/usuario/repo");
      const [, owner, repo] = match;

      const treeData = await githubApi.getTree(owner, repo);
      const allFiles = treeData.tree.filter((f) => f.type === 'blob');
      setFiles(allFiles);
      
      return { owner, repo, allFiles };
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro ao buscar o repositório.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectFile = useCallback(async (path: string) => {
    if (!repoUrl) return;
    
    if (selectedFile && selectedFile.path === path) return;

    try {
      const cleanUrl = repoUrl.replace(/\.git\/?$/, "").replace(/\/$/, "");
      const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return;
      const [, owner, repo] = match;

      const content = await githubApi.getFileContent(owner, repo, path);
      
      const newFile = { path, content };
      setSelectedFile(newFile);
      
      const newHistory = fileHistory.slice(0, currentHistoryIndex + 1);
      newHistory.push(newFile);
      setFileHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
      
      return newFile;
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar conteúdo do arquivo");
    }
  }, [repoUrl, selectedFile, fileHistory, currentHistoryIndex]);

  const navigateBack = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setSelectedFile(fileHistory[newIndex]);
    }
  }, [currentHistoryIndex, fileHistory]);

  const navigateForward = useCallback(() => {
    if (currentHistoryIndex < fileHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setSelectedFile(fileHistory[newIndex]);
    }
  }, [currentHistoryIndex, fileHistory]);

  const clearRepository = useCallback(() => {
    setRepoUrl(null);
    setFiles([]);
    setSelectedFile(null);
    setFileHistory([]);
    setCurrentHistoryIndex(-1);
    githubApi.clearCache();
  }, []);

  return {
    repoUrl,
    files,
    isLoading,
    error,
    selectedFile,
    fileHistory,
    currentHistoryIndex,
    fetchRepository,
    selectFile,
    navigateBack,
    navigateForward,
    clearRepository,
    setSelectedFile, // Exposed for closing file viewer
    setError
  };
}
