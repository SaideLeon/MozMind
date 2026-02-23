export interface RepoNode {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

export interface FileNode extends RepoNode {
  mode: string;
  sha: string;
  url: string;
}

export interface RepoTreeResponse {
  sha: string;
  url: string;
  tree: FileNode[];
  truncated: boolean;
  branch?: string;
}

export interface AnalysisMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  isThinking?: boolean;
  relatedLinks?: { title: string; url: string }[];
}
