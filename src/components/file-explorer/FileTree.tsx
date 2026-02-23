import { useMemo, useState } from 'react';
import { ChevronRight, Folder, FolderOpen, FileCode2 } from 'lucide-react';
import { FileNode } from '@/types';
import { buildTree, flattenTree } from '@/utils/file-tree';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  files: FileNode[];
  onSelect: (path: string) => void | Promise<void>;
}

export function FileTree({ files, onSelect }: FileTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const flatNodes = useMemo(() => {
    const tree = buildTree(files);
    return flattenTree(tree, expandedIds);
  }, [files, expandedIds]);

  const toggleNode = (path: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div className="overflow-auto text-xs space-y-1 pr-1">
      {flatNodes.map((node) => (
        <button
          key={node.id}
          onClick={() => (node.type === 'tree' ? toggleNode(node.path) : onSelect(node.path))}
          className={cn(
            'w-full text-left px-2 py-1.5 rounded hover:bg-white/5 flex items-center gap-1.5',
            node.type === 'blob' && 'text-gray-300'
          )}
          style={{ paddingLeft: `${node.level * 12 + 8}px` }}
        >
          {node.type === 'tree' ? (
            <>
              <ChevronRight className={cn('w-3 h-3 transition-transform', node.isExpanded && 'rotate-90')} />
              {node.isExpanded ? <FolderOpen className="w-3 h-3 text-indigo-300" /> : <Folder className="w-3 h-3 text-indigo-300" />}
            </>
          ) : (
            <>
              <span className="w-3" />
              <FileCode2 className="w-3 h-3 text-gray-500" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </button>
      ))}
    </div>
  );
}
