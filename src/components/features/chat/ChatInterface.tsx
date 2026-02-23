import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { MessageSquare, Loader2, Maximize2, Minimize2, Code2, ChevronRight, Youtube, ExternalLink, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';
import { AnalysisMessage } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

import { SafeMarkdown } from '@/components/ui/SafeMarkdown';

export const ChatInterface = ({ 
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
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // If user is more than 100px away from bottom, consider they scrolled up
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setUserHasScrolledUp(!isAtBottom);
  }, []);

  useEffect(() => {
    if (scrollRef.current && !userHasScrolledUp) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, userHasScrolledUp]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      setUserHasScrolledUp(false); // Reset on new message
    }
  };

  return (
    <div className={cn(
      "flex flex-col bg-[#111] rounded-xl border border-white/10 overflow-hidden transition-all duration-300", 
      isMaximized ? "h-full" : "h-full lg:h-[600px]"
    )}>
      <div className="p-3 md:p-4 border-b border-white/10 bg-[#151515] flex items-center justify-between">
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
      
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-6" 
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 && !isThinking && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="flex gap-4 flex-row-reverse">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-2 flex-1 flex flex-col items-end">
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        )}

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
              <SafeMarkdown content={msg.content} />
              
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
             <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 text-sm text-gray-400 italic animate-pulse flex-1">
               <div className="space-y-2">
                 <Skeleton className="h-3 w-full opacity-50" />
                 <Skeleton className="h-3 w-2/3 opacity-50" />
               </div>
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
