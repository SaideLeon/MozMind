import { Upload, BrainCircuit } from 'lucide-react';

interface HeaderProps {
  apiKeys: string[];
  keyIndex: number;
  onUploadKeys: (file: File) => Promise<number>;
  onLogoClick: () => void;
}

export function Header({ apiKeys, keyIndex, onUploadKeys, onLogoClick }: HeaderProps) {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await onUploadKeys(file);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <header className="h-16 border-b border-white/10 px-4 md:px-6 flex items-center justify-between bg-[#0d0d0d]">
      <button onClick={onLogoClick} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors">
        <BrainCircuit className="w-5 h-5" />
        <span className="font-semibold">MozMind</span>
      </button>

      <label className="text-xs border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5 cursor-pointer flex items-center gap-2">
        <Upload className="w-4 h-4" />
        <span>Upload keys</span>
        <input type="file" accept=".txt" className="hidden" onChange={handleFileChange} />
      </label>

      <span className="text-xs text-gray-400 hidden md:inline">
        {apiKeys.length > 0 ? `Keys: ${apiKeys.length} • Ativa: ${keyIndex + 1}` : 'Sem API keys carregadas'}
      </span>
    </header>
  );
}
