import { create } from 'zustand';
import { AnalysisMessage } from '@/types';

interface ChatState {
  chatHistory: AnalysisMessage[];
  isThinking: boolean;
  analysis: string;
  isGeneratingBlueprint: boolean;
  apiKeys: string[];
  keyIndex: number;
  setChatHistory: (messages: AnalysisMessage[]) => void;
  addMessage: (message: AnalysisMessage) => void;
  setIsThinking: (value: boolean) => void;
  setAnalysis: (value: string) => void;
  setIsGeneratingBlueprint: (value: boolean) => void;
  setApiKeys: (keys: string[]) => void;
  setKeyIndex: (value: number) => void;
  getNextKey: () => string | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatHistory: [],
  isThinking: false,
  analysis: '',
  isGeneratingBlueprint: false,
  apiKeys: [],
  keyIndex: 0,
  setChatHistory: (messages) => set({ chatHistory: messages }),
  addMessage: (message) => set((state) => ({ chatHistory: [...state.chatHistory, message] })),
  setIsThinking: (value) => set({ isThinking: value }),
  setAnalysis: (value) => set({ analysis: value }),
  setIsGeneratingBlueprint: (value) => set({ isGeneratingBlueprint: value }),
  setApiKeys: (keys) => set({ apiKeys: keys, keyIndex: 0 }),
  setKeyIndex: (value) => set({ keyIndex: value }),
  getNextKey: () => {
    const { apiKeys, keyIndex } = get();
    if (apiKeys.length === 0) return undefined;

    const activeKey = apiKeys[keyIndex % apiKeys.length];
    set({ keyIndex: (keyIndex + 1) % apiKeys.length });
    return activeKey;
  }
}));
