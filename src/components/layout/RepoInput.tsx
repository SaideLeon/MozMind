import { FormEvent, useState } from 'react';
import { Loader2, Github } from 'lucide-react';

interface RepoInputProps {
  onAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function RepoInput({ onAnalyze, isLoading }: RepoInputProps) {
  const [url, setUrl] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!url.trim()) return;
    await onAnalyze(url.trim());
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl mx-auto mt-12 bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
      <h1 className="text-xl font-semibold">Analise um repositório GitHub</h1>
      <p className="text-sm text-gray-400">Cole a URL do repositório para iniciar a análise.</p>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2 text-sm"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
          Analisar
        </button>
      </div>
    </form>
  );
}
