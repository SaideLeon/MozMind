import { create } from 'zustand';
import { AnalysisMessage } from '../types';

interface ChatState {
  chatHistory: AnalysisMessage[];
  isThinking: boolean;
  analysis: string | null;
  isGeneratingBlueprint: boolean;
  apiKeys: string[];
  keyIndex: number;
  
  // Actions
  setChatHistory: (history: AnalysisMessage[]) => void;
  addMessage: (message: AnalysisMessage) => void;
  setIsThinking: (isThinking: boolean) => void;
  setAnalysis: (analysis: string | null) => void;
  setIsGeneratingBlueprint: (isGenerating: boolean) => void;
  setApiKeys: (keys: string[]) => void;
  setKeyIndex: (index: number) => void;
  getNextKey: () => string | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatHistory: [],
  isThinking: false,
  analysis: null,
  isGeneratingBlueprint: false,
  apiKeys: [],
  keyIndex: 0,

  setChatHistory: (history) => set({ chatHistory: history }),
  addMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  setIsThinking: (isThinking) => set({ isThinking }),
  setAnalysis: (analysis) => set({ analysis }),
  setIsGeneratingBlueprint: (isGenerating) => set({ isGeneratingBlueprint: isGenerating }),
  setApiKeys: (keys) => set({ apiKeys: keys, keyIndex: 0 }),
  setKeyIndex: (index) => set({ keyIndex: index }),
  
  getNextKey: () => {
    const { apiKeys, keyIndex } = get();
    if (apiKeys.length > 0) {
      const key = apiKeys[keyIndex];
      set({ keyIndex: (keyIndex + 1) % apiKeys.length });
      return key;
    }
    return undefined;
  },
}));
