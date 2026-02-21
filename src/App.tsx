import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Github, Loader2, MessageSquare, Code2, Youtube, ExternalLink, ChevronRight, FileCode, X, Check, Copy, Maximize2, Minimize2, ArrowLeft, ArrowRight, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { analyzeCode, thinkAndSuggest, generateBlueprint } from '@/services/ai';
import { FileNode, AnalysisMessage, RepoTreeResponse } from '@/types';

// --- Components ---

const Header = () => (
  <header className="border-b border-white/10 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50">
    <div className="w-full px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Code2 className="text-white w-5 h-5" />
        </div>
        <span className="font-semibold text-lg tracking-tight">CodeMind Analista</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1">v1.0.0</span>
      </div>
    </div>
  </header>
);

const RepoInput = ({ onAnalyze, isLoading }: { onAnalyze: (url: string) => void, isLoading: boolean }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onAnalyze(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Analise Repositórios GitHub com Raciocínio Profundo
          </h1>
          <p className="text-gray-400 text-lg">
            Cole um link do GitHub para obter uma revisão de código abrangente, sugestões de melhoria e recursos curados.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
            <div className="relative flex items-center bg-[#111] rounded-xl border border-white/10 p-2">
              <Github className="w-6 h-6 text-gray-400 ml-3" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 px-4 py-2"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !url}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Analisar
              </button>
            </div>
          </div>
        </form>
        
        <div className="flex justify-center gap-4 text-sm text-gray-500">
          <span>Tente:</span>
          <button onClick={() => setUrl('https://github.com/facebook/react')} className="hover:text-indigo-400 transition-colors">facebook/react</button>
          <button onClick={() => setUrl('https://github.com/shadcn-ui/ui')} className="hover:text-indigo-400 transition-colors">shadcn-ui/ui</button>
        </div>
      </motion.div>
    </div>
  );
};

const FileTree = ({ files, onSelect }: { files: FileNode[], onSelect: (path: string) => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFiles = files.filter(file => 
    file.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Arquivos do Repositório</h3>
      
      <div className="relative mb-4">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar arquivos..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        {filteredFiles.slice(0, 50).map((file) => (
          <button
            key={file.path}
            onClick={() => onSelect(file.path)}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 truncate group"
          >
            <FileCode className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
            <span className="truncate" title={file.path}>
              {file.path.split('/').map((part, i, arr) => (
                <span key={i} className={i === arr.length - 1 ? "text-gray-200" : "text-gray-500"}>
                  {part}{i < arr.length - 1 && '/'}
                </span>
              ))}
            </span>
          </button>
        ))}
        {filteredFiles.length === 0 && (
          <div className="text-xs text-gray-500 italic text-center py-4">
            Nenhum arquivo encontrado.
          </div>
        )}
        {filteredFiles.length > 50 && (
          <div className="px-3 py-2 text-xs text-gray-500 italic">
            + {filteredFiles.length - 50} mais arquivos...
          </div>
        )}
      </div>
    </div>
  );
};

const CodeBlock = ({ language, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(children));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-md overflow-hidden my-4 border border-white/10">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-gray-300 hover:text-white transition-colors"
          title="Copiar código"
        >
          {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="bg-[#1e1e1e] px-4 py-2 text-xs text-gray-400 border-b border-white/5 flex justify-between items-center">
        <span>{language}</span>
      </div>
      <SyntaxHighlighter
        {...props}
        PreTag="div"
        children={String(children).replace(/\n$/, '')}
        language={language}
        style={atomDark}
        customStyle={{ margin: 0, borderRadius: 0, background: '#1a1a1a' }}
      />
    </div>
  );
};

const ChatInterface = ({ 
  messages, 
  onSendMessage, 
  isThinking,
  isMaximized,
  onToggleMaximize
}: { 
  messages: AnalysisMessage[], 
  onSendMessage: (msg: string) => void,
  isThinking: boolean,
  isMaximized: boolean,
  onToggleMaximize: () => void
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className={cn("flex flex-col bg-[#111] rounded-xl border border-white/10 overflow-hidden transition-all duration-300", isMaximized ? "h-[calc(100vh-120px)]" : "h-[600px]")}>
      <div className="p-4 border-b border-white/10 bg-[#151515] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            Assistente de Raciocínio Profundo
          </h3>
          {isThinking && (
            <span className="text-xs text-indigo-400 animate-pulse flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Pensando profundamente...
            </span>
          )}
        </div>
        <button 
          onClick={onToggleMaximize}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-gray-700" : "bg-indigo-600"
            )}>
              {msg.role === 'user' ? <span className="text-xs">Você</span> : <Code2 className="w-4 h-4" />}
            </div>
            <div className={cn(
              "max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed overflow-hidden",
              msg.role === 'user' ? "bg-gray-800 text-white" : "bg-[#1a1a1a] border border-white/10 text-gray-200"
            )}>
              <div className="prose prose-invert prose-sm max-w-none break-words">
                <ReactMarkdown
                  components={{
                    code(props) {
                      const {children, className, node, ref, ...rest} = props
                      const match = /language-(\w+)/.exec(className || '')
                      return match ? (
                        <CodeBlock language={match[1]} children={children} {...rest} />
                      ) : (
                        <code {...rest} ref={ref} className={className}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
              
              {/* Grounding / Links */}
              {msg.relatedLinks && msg.relatedLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Referências e Recursos</h4>
                  <div className="grid gap-2">
                    {msg.relatedLinks.map((link, i) => (
                      <a 
                        key={i} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 p-2 rounded hover:bg-indigo-500/20 transition-colors"
                      >
                        {link.url.includes('youtube') ? <Youtube className="w-3 h-3 text-red-500" /> : <ExternalLink className="w-3 h-3" />}
                        <span className="truncate">{link.title || link.url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isThinking && (
           <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
               <Code2 className="w-4 h-4" />
             </div>
             <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 text-sm text-gray-400 italic animate-pulse">
               Analisando implicações... Buscando padrões relevantes...
             </div>
           </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-[#151515] border-t border-white/10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sugira uma melhoria ou faça uma pergunta..."
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 pr-12 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            disabled={isThinking}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isThinking}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

const FileViewer = ({ 
  file, 
  onClose, 
  isMaximized, 
  onToggleMaximize,
  onBack,
  onForward,
  canGoBack,
  canGoForward
}: { 
  file: { path: string, content: string }, 
  onClose: () => void, 
  isMaximized: boolean, 
  onToggleMaximize: () => void,
  onBack: () => void,
  onForward: () => void,
  canGoBack: boolean,
  canGoForward: boolean
}) => {
  const extension = file.path.split('.').pop() || 'text';
  return (
    <div className={cn("flex flex-col bg-[#111] rounded-xl border border-white/10 overflow-hidden relative transition-all duration-300", isMaximized ? "h-[calc(100vh-120px)]" : "h-[600px]")}>
      <div className="p-4 border-b border-white/10 bg-[#151515] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
            <button 
              onClick={onBack}
              disabled={!canGoBack}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Voltar"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={onForward}
              disabled={!canGoForward}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Avançar"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-medium flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-400" />
            {file.path}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onToggleMaximize} 
            className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
            title={isMaximized ? "Restaurar" : "Maximizar"}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto text-sm">
        <SyntaxHighlighter
          language={extension}
          style={atomDark}
          showLineNumbers
          customStyle={{ margin: 0, padding: '1.5rem', background: '#0d0d0d', minHeight: '100%' }}
        >
          {file.content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<AnalysisMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{ path: string, content: string } | null>(null);
  const [maximizedPanel, setMaximizedPanel] = useState<'chat' | 'file' | null>(null);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  
  // File navigation history
  const [fileHistory, setFileHistory] = useState<{ path: string, content: string }[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!selectedFile && maximizedPanel === 'file') {
      setMaximizedPanel(null);
    }
  }, [selectedFile, maximizedPanel]);

  const handleGenerateBlueprint = async () => {
    if (!repoUrl || !analysis) return;
    setIsGeneratingBlueprint(true);
    
    try {
      // We need to fetch the key files again or use what we have. 
      // For a blueprint, we might want to ensure we have the context.
      // We'll use the currently loaded file history + analysis context.
      
      // Ideally we would fetch more files, but for now let's use the analysis context + selected file
      const contextFiles = selectedFile ? [selectedFile] : [];
      
      const response = await generateBlueprint(contextFiles, analysis);
      const blueprintText = response.text || "Falha ao gerar blueprint.";
      
      // Create a blob and download
      const blob = new Blob([blueprintText], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blueprint-${repoUrl.split('/').pop()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Blueprint generation failed:", err);
      setError("Falha ao gerar o blueprint. Tente novamente.");
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const handleFileSelect = async (path: string) => {
    if (!repoUrl) return;
    
    // If selecting the same file as current, do nothing
    if (selectedFile && selectedFile.path === path) return;

    try {
      // Parse owner/repo from repoUrl
      const cleanUrl = repoUrl.replace(/\.git\/?$/, "").replace(/\/$/, "");
      const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) return;
      const [, owner, repo] = match;

      const res = await fetch(`/api/github/content?owner=${owner}&repo=${repo}&path=${path}`);
      if (!res.ok) throw new Error("Falha ao buscar arquivo");
      const text = await res.text();
      
      const newFile = { path, content: text };
      setSelectedFile(newFile);
      
      // Update history
      const newHistory = fileHistory.slice(0, currentHistoryIndex + 1);
      newHistory.push(newFile);
      setFileHistory(newHistory);
      setCurrentHistoryIndex(newHistory.length - 1);
      
    } catch (err) {
      console.error(err);
      setError("Falha ao carregar conteúdo do arquivo");
    }
  };

  const handleHistoryBack = () => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setSelectedFile(fileHistory[newIndex]);
    }
  };

  const handleHistoryForward = () => {
    if (currentHistoryIndex < fileHistory.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setSelectedFile(fileHistory[newIndex]);
    }
  };

  useEffect(() => {
    if (!process.env.GEMINI_API_KEY) {
      setHasKey(false);
    }
  }, []);

  const handleAnalyze = async (url: string) => {
    if (!hasKey) {
      setError("A Chave da API Gemini está faltando. Configure-a nos segredos do AI Studio.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRepoUrl(url);

    try {
      // Parse URL
      // Remove trailing slash and .git suffix
      const cleanUrl = url.replace(/\.git\/?$/, "").replace(/\/$/, "");
      const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw new Error("URL do GitHub inválida. Use o formato: https://github.com/usuario/repo");
      const [, owner, repo] = match;

      // 1. Fetch Tree
      const treeRes = await fetch(`/api/github/tree?owner=${owner}&repo=${repo}`);
      
      if (!treeRes.ok) {
        let errorMsg = "Falha ao buscar repositório.";
        try {
          const errData = await treeRes.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch {
          errorMsg += ` (${treeRes.status} ${treeRes.statusText})`;
        }
        
        if (treeRes.status === 404) {
          errorMsg = "Repositório não encontrado ou privado. Esta ferramenta suporta apenas repositórios públicos.";
        } else if (treeRes.status === 403) {
          errorMsg = "Limite de taxa da API do GitHub excedido. Tente novamente mais tarde.";
        }
        
        throw new Error(errorMsg);
      }

      const contentType = treeRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Recebeu resposta não-JSON do servidor. Verifique se o servidor está rodando corretamente.");
      }

      const treeData: RepoTreeResponse = await treeRes.json();
      
      // Filter for relevant files (code, config, readme)
      const allFiles = treeData.tree.filter((f) => f.type === 'blob');
      setFiles(allFiles);

      // 2. Fetch Content of Key Files (Limit to avoid token limits/context window)
      // Prioritize: README, package.json, tsconfig, main src files
      const priorityFiles = allFiles.filter((f) => 
        f.path.match(/(README|package\.json|tsconfig\.json|src\/main|src\/App|server\.ts|\.py|\.js|\.tsx)$/i)
      ).slice(0, 5); // Limit to 5 key files for initial analysis to be fast

      const fileContents = await Promise.all(priorityFiles.map(async (f) => {
        const res = await fetch(`/api/github/content?owner=${owner}&repo=${repo}&path=${f.path}`);
        const text = await res.text();
        return { path: f.path, content: text };
      }));

      // 3. Initial AI Analysis
      const aiRes = await analyzeCode(fileContents);
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

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Ocorreu um erro durante a análise.");
      // Do NOT reset repoUrl here, so the user stays on the dashboard and can try again or see partial results if any
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (msg: string) => {
    const newHistory = [...chatHistory, { role: 'user', content: msg, timestamp: Date.now() } as AnalysisMessage];
    setChatHistory(newHistory);
    setIsThinking(true);

    try {
      // Use the "Thinking" service
      const response = await thinkAndSuggest(
        newHistory.map(h => ({ role: h.role, content: h.content })),
        msg,
        analysis || "Nenhum contexto disponível."
      );

      const responseText = response.text || "Não consegui gerar uma resposta.";
      
      // Extract grounding links
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
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans selection:bg-indigo-500/30">
      <Header />
      
      <main className="w-full p-4 md:p-6">
        {!hasKey && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 p-4 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span>
              <strong>Configuração Necessária:</strong> A Chave da API Gemini está faltando. Por favor, adicione <code>GEMINI_API_KEY</code> aos seus segredos.
            </span>
          </div>
        )}
        <AnimatePresence mode="wait">
          {!repoUrl ? (
            <RepoInput key="input" onAnalyze={handleAnalyze} isLoading={isLoading} />
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Sidebar: File Tree */}
              {!maximizedPanel && (
                <div className={cn(
                  "bg-[#111] rounded-xl border border-white/10 p-4 h-[calc(100vh-120px)] overflow-hidden flex flex-col transition-all duration-300",
                  selectedFile ? "lg:col-span-2" : "lg:col-span-3"
                )}>
                  <div className="mb-4 pb-4 border-b border-white/10">
                    <h2 className="font-semibold truncate" title={repoUrl}>{repoUrl.split('github.com/')[1]}</h2>
                    <div className="flex flex-col gap-2 mt-2">
                      <button 
                        onClick={() => setRepoUrl(null)} 
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
                  <FileTree files={files} onSelect={handleFileSelect} />
                </div>
              )}

              {/* Main Content: Chat & Analysis */}
              {(maximizedPanel === 'chat' || (!maximizedPanel && !selectedFile) || (!maximizedPanel && selectedFile)) && (
                 <div className={cn(
                  "h-[calc(100vh-120px)] flex flex-col gap-6 transition-all duration-300",
                  maximizedPanel === 'chat' ? "lg:col-span-12" : (selectedFile ? "lg:col-span-5" : "lg:col-span-9"),
                  maximizedPanel === 'file' ? "hidden" : ""
                )}>
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                      Erro: {error}
                    </div>
                  )}
                  
                  <ChatInterface 
                    messages={chatHistory} 
                    onSendMessage={handleSendMessage}
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
                      "h-[calc(100vh-120px)]",
                      maximizedPanel === 'file' ? "lg:col-span-12" : "lg:col-span-5"
                    )}
                  >
                    <FileViewer 
                      file={selectedFile} 
                      onClose={() => setSelectedFile(null)} 
                      isMaximized={maximizedPanel === 'file'}
                      onToggleMaximize={() => setMaximizedPanel(prev => prev === 'file' ? null : 'file')}
                      onBack={handleHistoryBack}
                      onForward={handleHistoryForward}
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
