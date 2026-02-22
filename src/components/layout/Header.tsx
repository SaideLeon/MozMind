import { Code2 } from 'lucide-react';

export const Header = () => (
  <header className="border-b border-white/10 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-50">
    <div className="w-full px-6 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Code2 className="text-white w-5 h-5" />
        </div>
        <span className="font-semibold text-lg tracking-tight">CodeMind Analista</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span className="flex items-center gap-1">v1.0.0</span>
      </div>
    </div>
  </header>
);
