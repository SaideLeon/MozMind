import React from 'react';
import { FileNode } from '@/types';

export const FileTree = ({ files, onSelect }: { files: FileNode[], onSelect: (path: string) => void }) => {
  return (
    <div className="flex-1 overflow-y-auto space-y-1">
      {files.map(file => (
        <button 
          key={file.path}
          onClick={() => file.type === 'blob' && onSelect(file.path)}
          className="w-full text-left px-2 py-1 hover:bg-white/5 rounded text-sm truncate text-gray-400 hover:text-white transition-colors"
        >
          {file.path}
        </button>
      ))}
    </div>
  );
};
