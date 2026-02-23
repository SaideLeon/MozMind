import { ArrowLeft, ArrowRight, Maximize2, Minimize2, X } from 'lucide-react';

interface FileViewerProps {
  file: { path: string; content: string };
  onClose: () => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onBack: () => void;
  onForward: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export function FileViewer({
  file,
  onClose,
  isMaximized,
  onToggleMaximize,
  onBack,
  onForward,
  canGoBack,
  canGoForward
}: FileViewerProps) {
  return (
    <div className="h-full bg-[#111] rounded-xl border border-white/10 overflow-hidden flex flex-col">
      <div className="h-12 px-3 border-b border-white/10 flex items-center gap-2">
        <button disabled={!canGoBack} onClick={onBack} className="p-1 rounded hover:bg-white/5 disabled:opacity-40"><ArrowLeft className="w-4 h-4" /></button>
        <button disabled={!canGoForward} onClick={onForward} className="p-1 rounded hover:bg-white/5 disabled:opacity-40"><ArrowRight className="w-4 h-4" /></button>
        <span className="text-xs text-gray-300 truncate flex-1">{file.path}</span>
        <button onClick={onToggleMaximize} className="p-1 rounded hover:bg-white/5">{isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</button>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4" /></button>
      </div>
      <pre className="flex-1 overflow-auto p-4 text-xs leading-5 text-gray-200 whitespace-pre-wrap break-words">{file.content}</pre>
    </div>
  );
}
