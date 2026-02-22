import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import { Header } from '@/components/layout/Header';
import { RepoInput } from '@/components/layout/RepoInput';
import { FileTree } from '@/components/file-explorer/FileTree';
import { FileViewer } from '@/components/file-explorer/FileViewer';
import { ChatInterface } from '@/components/ai-chat/ChatInterface';

// Hooks
import { useGithubRepository } from '@/hooks/useGithubRepository';
import { useAIChat } from '@/hooks/useAIChat';

export default function App() {
  const [maximizedPanel, setMaximizedPanel] = useState<'chat' | 'file' | null>(null);

  // Custom Hooks
  const {
    repoUrl,
    files,
    isLoading: isRepoLoading,
    error: repoError,
    selectedFile,
    fileHistory,
    currentHistoryIndex,
    analyzeRepository,
    selectFile,
    navigateBack,
    navigateForward,
    clearRepository,
    setSelectedFile,
    setError: setRepoError
  } = useGithubRepository();

  const {
    chatHistory,
    isThinking,
    analysis,
    isGeneratingBlueprint,
    performInitialAnalysis,
    sendMessage,
    generateProjectBlueprint,
    apiKeys,
    keyIndex,
    handleKeyFileUpload
  } = useAIChat();

  // Effects
  useEffect(() => {
    if (!selectedFile && maximizedPanel === 'file') {
      setMaximizedPanel(null);
    }
  }, [selectedFile, maximizedPanel]);

  // Handlers
  const handleAnalyze = async (url: string) => {
    await analyzeRepository(url, performInitialAnalysis);
  };

  const handleGenerateBlueprint = async () => {
    if (!repoUrl || !analysis) return;
    
    // Use selected file as context if available
    const contextFiles = selectedFile ? [selectedFile] : [];
    
    try {
      await generateProjectBlueprint(repoUrl.split('github.com/')[1], contextFiles);
    } catch (err) {
      setRepoError("Falha ao gerar blueprint.");
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0a] text-gray-100 font-sans selection:bg-indigo-500/30">
      <Header 
        apiKeys={apiKeys} 
        keyIndex={keyIndex} 
        onUploadKeys={handleKeyFileUpload} 
      />
      
      <main className="flex-1 w-full p-4 md:p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {!repoUrl ? (
            <RepoInput key="input" onAnalyze={handleAnalyze} isLoading={isRepoLoading} />
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
            >
              {/* Sidebar: File Tree */}
              {!maximizedPanel && (
                <div className={cn(
                  "bg-[#111] rounded-xl border border-white/10 p-4 h-full overflow-hidden flex flex-col transition-all duration-300",
                  selectedFile ? "lg:col-span-2" : "lg:col-span-3"
                )}>
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <h2 className="font-semibold truncate" title={repoUrl}>{repoUrl.split('github.com/')[1]}</h2>
                    <div className="flex flex-col gap-2 mt-2">
                      <button 
                        onClick={clearRepository} 
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        ← Analisar outro
                      </button>
                      <button
                        onClick={handleGenerateBlueprint}
                        disabled={isGeneratingBlueprint}
                        className="text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded px-2 py-1.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                      >
                        {isGeneratingBlueprint ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        {isGeneratingBlueprint ? "Gerando..." : "Gerar Blueprint"}
                      </button>
                    </div>
                  </div>
                  <FileTree files={files} onSelect={selectFile} />
                </div>
              )}

              {/* Main Content: Chat & Analysis */}
              {(maximizedPanel === 'chat' || (!maximizedPanel && !selectedFile) || (!maximizedPanel && selectedFile)) && (
                 <div className={cn(
                  "h-full flex flex-col gap-6 transition-all duration-300",
                  maximizedPanel === 'chat' ? "lg:col-span-12" : (selectedFile ? "lg:col-span-5" : "lg:col-span-9"),
                  maximizedPanel === 'file' ? "hidden" : ""
                )}>
                  {repoError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                      Erro: {repoError}
                    </div>
                  )}
                  
                  <ChatInterface 
                    messages={chatHistory} 
                    onSendMessage={sendMessage}
                    isThinking={isThinking}
                    isMaximized={maximizedPanel === 'chat'}
                    onToggleMaximize={() => setMaximizedPanel(prev => prev === 'chat' ? null : 'chat')}
                  />
                </div>
              )}

              {/* File Preview Pane */}
              <AnimatePresence>
                {selectedFile && (maximizedPanel === 'file' || !maximizedPanel) && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "h-full",
                      maximizedPanel === 'file' ? "lg:col-span-12" : "lg:col-span-5"
                    )}
                  >
                    <FileViewer 
                      file={selectedFile} 
                      onClose={() => setSelectedFile(null)} 
                      isMaximized={maximizedPanel === 'file'}
                      onToggleMaximize={() => setMaximizedPanel(prev => prev === 'file' ? null : 'file')}
                      onBack={navigateBack}
                      onForward={navigateForward}
                      canGoBack={currentHistoryIndex > 0}
                      canGoForward={currentHistoryIndex < fileHistory.length - 1}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
