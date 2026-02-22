import { useState } from 'react';
import { Search, FileCode } from 'lucide-react';
import { FileNode } from '@/types';

export const FileTree = ({ files, onSelect }: { files: FileNode[], onSelect: (path: string) => void }) => {
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
