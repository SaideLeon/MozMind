import React from 'react';

export const Header = ({ apiKeys, keyIndex, onUploadKeys, onLogoClick }: any) => (
  <header className="p-4 border-b border-white/10 flex justify-between items-center">
    <button onClick={onLogoClick} className="text-xl font-bold text-indigo-400">CodeMind Analista</button>
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <span>Chaves: {apiKeys.length}</span>
      <input type="file" onChange={(e) => e.target.files?.[0] && onUploadKeys(e.target.files[0])} className="hidden" id="key-upload" />
      <label htmlFor="key-upload" className="cursor-pointer hover:text-white transition-colors">Upload Keys</label>
    </div>
  </header>
);
