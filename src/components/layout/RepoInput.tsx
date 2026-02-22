import { useState } from 'react';
import { motion } from 'motion/react';
import { Github, Search, Loader2 } from 'lucide-react';

export const RepoInput = ({ onAnalyze, isLoading }: { onAnalyze: (url: string) => void, isLoading: boolean }) => {
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
