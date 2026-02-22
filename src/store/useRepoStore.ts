import { create } from 'zustand';
import { RepoNode } from '../types/github';

interface RepoState {
  repoUrl: string | null;
  files: RepoNode[];
  selectedFile: RepoNode | null;
  fileHistory: RepoNode[];
  currentHistoryIndex: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setRepoUrl: (url: string | null) => void;
  setFiles: (files: RepoNode[]) => void;
  setSelectedFile: (file: RepoNode | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Navigation
  addToHistory: (file: RepoNode) => void;
  navigateBack: () => void;
  navigateForward: () => void;
  clearRepository: () => void;
}

export const useRepoStore = create<RepoState>((set) => ({
  repoUrl: null,
  files: [],
  selectedFile: null,
  fileHistory: [],
  currentHistoryIndex: -1,
  isLoading: false,
  error: null,

  setRepoUrl: (url) => set({ repoUrl: url }),
  setFiles: (files) => set({ files }),
  setSelectedFile: (file) => set({ selectedFile: file }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addToHistory: (file) => set((state) => {
    const newHistory = state.fileHistory.slice(0, state.currentHistoryIndex + 1);
    return {
      fileHistory: [...newHistory, file],
      currentHistoryIndex: newHistory.length,
      selectedFile: file
    };
  }),

  navigateBack: () => set((state) => {
    if (state.currentHistoryIndex > 0) {
      const newIndex = state.currentHistoryIndex - 1;
      return {
        currentHistoryIndex: newIndex,
        selectedFile: state.fileHistory[newIndex]
      };
    }
    return state;
  }),

  navigateForward: () => set((state) => {
    if (state.currentHistoryIndex < state.fileHistory.length - 1) {
      const newIndex = state.currentHistoryIndex + 1;
      return {
        currentHistoryIndex: newIndex,
        selectedFile: state.fileHistory[newIndex]
      };
    }
    return state;
  }),

  clearRepository: () => set({
    repoUrl: null,
    files: [],
    selectedFile: null,
    fileHistory: [],
    currentHistoryIndex: -1,
    error: null
  }),
}));
