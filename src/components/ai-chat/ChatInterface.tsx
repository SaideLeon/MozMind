import { FormEvent, useState } from 'react';
import { AnalysisMessage } from '@/types';
import { Loader2, Maximize2, Minimize2, Send } from 'lucide-react';

interface ChatInterfaceProps {
  messages: AnalysisMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isThinking: boolean;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}

export function ChatInterface({ messages, onSendMessage, isThinking, isMaximized, onToggleMaximize }: ChatInterfaceProps) {
  const [input, setInput] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = input.trim();
    if (!value || isThinking) return;
    setInput('');
    await onSendMessage(value);
  };

  return (
    <div className="h-full bg-[#111] rounded-xl border border-white/10 flex flex-col overflow-hidden">
      <div className="h-12 border-b border-white/10 px-3 flex items-center justify-between">
        <h2 className="text-sm font-medium">Chat de análise</h2>
        <button onClick={onToggleMaximize} className="p-1 rounded hover:bg-white/5">{isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-500">A análise inicial aparecerá aqui.</p>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.timestamp}-${index}`} className={`rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-indigo-600/20 ml-6' : 'bg-white/5 mr-6'}`}>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          ))
        )}

        {isThinking && (
          <div className="rounded-lg p-3 text-sm bg-white/5 mr-6 flex items-center gap-2 text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            Pensando...
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-3 border-t border-white/10 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Faça uma pergunta sobre o código..."
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button type="submit" disabled={isThinking || !input.trim()} className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50">
          {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
