import { useState, useCallback } from 'react';
import { AnalysisMessage } from '@/types';
import { analyzeCode, thinkAndSuggest, generateBlueprint } from '@/services/ai';
import { limitTextContext } from '@/utils/textLimiter';

export function useAIChat() {
  const [chatHistory, setChatHistory] = useState<AnalysisMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  const performInitialAnalysis = useCallback(async (files: { path: string, content: string }[]) => {
    try {
      // Apply text limiter to file contents before sending to AI
      const limitedFiles = files.map(f => ({
        path: f.path,
        content: limitTextContext(f.content)
      }));

      const aiRes = await analyzeCode(limitedFiles);
      const analysisText = aiRes.text || "A análise falhou ao gerar texto.";
      
      setAnalysis(analysisText);
      setChatHistory([{
        role: 'model',
        content: analysisText,
        timestamp: Date.now(),
        relatedLinks: aiRes.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c) => ({
             title: c.web?.title || "Fonte",
             url: c.web?.uri
        })).filter((l): l is { title: string; url: string } => !!l.url) || []
      }]);
      
      return analysisText;
    } catch (error) {
      console.error("AI Analysis Error:", error);
      throw error;
    }
  }, []);

  const sendMessage = useCallback(async (msg: string) => {
    const newHistory = [...chatHistory, { role: 'user', content: msg, timestamp: Date.now() } as AnalysisMessage];
    setChatHistory(newHistory);
    setIsThinking(true);

    try {
      const response = await thinkAndSuggest(
        newHistory.map(h => ({ role: h.role, content: h.content })),
        msg,
        analysis || "Nenhum contexto disponível."
      );

      const responseText = response.text || "Não consegui gerar uma resposta.";
      
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c) => ({
        title: c.web?.title || "Fonte",
        url: c.web?.uri
      })).filter((l): l is { title: string; url: string } => !!l.url) || [];

      setChatHistory(prev => [...prev, {
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
        relatedLinks: links
      }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, {
        role: 'model',
        content: "Encontrei um erro ao pensar sobre isso. Por favor, tente novamente.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsThinking(false);
    }
  }, [chatHistory, analysis]);

  const generateProjectBlueprint = useCallback(async (repoName: string, contextFiles: { path: string, content: string }[]) => {
    if (!analysis) return;
    setIsGeneratingBlueprint(true);
    
    try {
      const limitedFiles = contextFiles.map(f => ({
        path: f.path,
        content: limitTextContext(f.content)
      }));

      const response = await generateBlueprint(limitedFiles, analysis);
      const blueprintText = response.text || "Falha ao gerar blueprint.";
      
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
  }, [analysis]);

  return {
    chatHistory,
    isThinking,
    analysis,
    isGeneratingBlueprint,
    performInitialAnalysis,
    sendMessage,
    generateProjectBlueprint,
    setChatHistory // Exposed for manual updates if needed (e.g. clearing)
  };
}
