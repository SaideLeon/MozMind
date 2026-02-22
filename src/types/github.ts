export interface GithubFile {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
  content?: string;
}

export interface GithubTreeResponse {
  sha: string;
  url: string;
  tree: GithubFile[];
  truncated: boolean;
}

export interface GithubRepoInfo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  default_branch: string;
  html_url: string;
}

export interface RepoNode {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  children?: RepoNode[];
  isOpen?: boolean;
  content?: string;
  size?: number;
  isBinary?: boolean;
}
