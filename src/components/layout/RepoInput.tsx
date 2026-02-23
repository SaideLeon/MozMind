import React, { useState } from 'react';

export const RepoInput = ({ onAnalyze, isLoading }: { onAnalyze: (url: string) => void, isLoading: boolean }) => {
  const [url, setUrl] = useState('');
  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-[#111] rounded-2xl border border-white/10">
      <h2 className="text-2xl font-bold mb-6 text-center">Analisar Repositório</h2>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/usuario/repo"
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-colors"
        />
        <button 
          onClick={() => onAnalyze(url)}
          disabled={isLoading || !url}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Analisando...' : 'Analisar'}
        </button>
      </div>
    </div>
  );
};
