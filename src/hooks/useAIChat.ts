import { useCallback, useState } from 'react';
import { AnalysisMessage } from '@/types';
import { analyzeCode, thinkAndSuggest, generateBlueprint as generateBlueprintService } from '@/services/ai';
import { limitTextContext } from '@/utils/textLimiter';
import { getResponseText } from '@/utils/ai-helpers';

export function useAIChat() {
  const [chatHistory, setChatHistory] = useState<AnalysisMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [keyIndex, setKeyIndex] = useState(0);

  const getNextKey = useCallback(() => {
    if (apiKeys.length === 0) return undefined;
    const key = apiKeys[keyIndex];
    setKeyIndex((keyIndex + 1) % apiKeys.length);
    return key;
  }, [apiKeys, keyIndex]);

  const addMessage = useCallback((msg: AnalysisMessage) => {
    setChatHistory(prev => [...prev, msg]);
  }, []);

  const handleKeyFileUpload = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const keys = text.split(/\r?\n/).map(k => k.trim()).filter(k => k.length > 20);
      
      if (keys.length === 0) {
        throw new Error("Nenhuma chave válida encontrada no arquivo.");
      }
      
      setApiKeys(keys);
      return keys.length;
    } catch (err) {
      console.error("Erro ao ler arquivo de chaves:", err);
      throw err;
    }
  }, [setApiKeys]);

  const performInitialAnalysis = useCallback(async (files: { path: string, content: string }[]) => {
    try {
      const activeKey = getNextKey();
      
      const limitedFiles = files.map(f => ({
        path: f.path,
        content: limitTextContext(f.content)
      }));

      const aiRes = await analyzeCode(limitedFiles, undefined, activeKey);
      const analysisText = getResponseText(aiRes);
      
      if (!analysisText) {
        throw new Error("A resposta da IA veio vazia. Verifique os logs do servidor.");
      }
      
      setAnalysis(analysisText);
      setChatHistory([{
        role: 'model',
        content: analysisText,
        timestamp: Date.now(),
        relatedLinks: aiRes.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
             title: c.web?.title || "Fonte",
             url: c.web?.uri
        })).filter((l: any): l is { title: string; url: string } => !!l.url) || []
      }]);
      
      return analysisText;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw error;
    }
  }, [getNextKey, setAnalysis, setChatHistory]);

  const sendMessage = useCallback(async (msg: string) => {
    const userMsg: AnalysisMessage = { role: 'user', content: msg, timestamp: Date.now() };
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setIsThinking(true);

    try {
      const activeKey = getNextKey();
      const response = await thinkAndSuggest(
        newHistory.map(h => ({ role: h.role, content: h.content })),
        msg,
        analysis || "Nenhum contexto disponível.",
        activeKey
      );

      const responseText = getResponseText(response);
      
      if (!responseText) {
         throw new Error("A resposta da IA veio vazia.");
      }
      
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => ({
        title: c.web?.title || "Fonte",
        url: c.web?.uri
      })).filter((l: any): l is { title: string; url: string } => !!l.url) || [];

      addMessage({
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
        relatedLinks: links
      });
    } catch (err) {
      console.error(err);
      addMessage({
        role: 'model',
        content: `Erro: ${err instanceof Error ? err.message : "Erro desconhecido ao processar resposta."}`,
        timestamp: Date.now()
      });
    } finally {
      setIsThinking(false);
    }
  }, [chatHistory, analysis, getNextKey, setChatHistory, addMessage, setIsThinking]);

  const generateProjectBlueprint = useCallback(async (repoName: string, contextFiles: { path: string, content: string }[]) => {
    if (!analysis) return;
    setIsGeneratingBlueprint(true);
    
    try {
      const activeKey = getNextKey();
      const limitedFiles = contextFiles.map(f => ({
        path: f.path,
        content: limitTextContext(f.content)
      }));

      const response = await generateBlueprintService(limitedFiles, analysis, activeKey);
      const blueprintText = getResponseText(response);
      
      if (!blueprintText) {
        throw new Error("A resposta da IA veio vazia.");
      }
      
      const blob = new Blob([blueprintText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blueprint-${repoName}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Blueprint generation failed:", err);
      throw err;
    } finally {
      setIsGeneratingBlueprint(false);
    }
  }, [analysis, getNextKey, setIsGeneratingBlueprint]);

  return {
    chatHistory,
    isThinking,
    analysis,
    isGeneratingBlueprint,
    performInitialAnalysis,
    sendMessage,
    generateProjectBlueprint,
    setChatHistory,
    apiKeys,
    keyIndex,
    handleKeyFileUpload
  };
}
