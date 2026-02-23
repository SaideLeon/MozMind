import React from 'react';

export const FileViewer = ({ 
  file, 
  onClose, 
  isMaximized, 
  onToggleMaximize,
  onBack,
  onForward,
  canGoBack,
  canGoForward
}: any) => {
  return (
    <div className={`h-full flex flex-col bg-[#111] rounded-xl border border-white/10 overflow-hidden ${isMaximized ? 'fixed inset-0 z-[100]' : ''}`}>
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#151515]">
        <div className="flex items-center gap-2">
          <button onClick={onBack} disabled={!canGoBack} className="disabled:opacity-30">←</button>
          <button onClick={onForward} disabled={!canGoForward} className="disabled:opacity-30">→</button>
          <span className="text-sm font-medium truncate ml-2">{file.path}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleMaximize} className="text-xs hover:bg-white/10 px-2 py-1 rounded">
            {isMaximized ? 'Restore' : 'Maximize'}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">X</button>
        </div>
      </div>
      <pre className="flex-1 p-4 overflow-auto text-xs text-gray-300 font-mono">
        {file.content}
      </pre>
    </div>
  );
};
