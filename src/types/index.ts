export interface Package {
  name: string;
  description: string;
  author: string;
  version: string;
  tags: string[];
  stats: {
    downloads: string;
    stars: string;
    forks: string;
  };
  time: string;
  repository: {
    owner: string;
    name: string;
  } | null;
  npmLink: string;
  isBookmarked?: boolean;
}

export interface Repository {
  owner: string;
  name: string;
}

export type AIAction = "explain" | "generate" | "readme" | null;

export interface User {
  id: string;
  email: string;
  user_metadata: {
    avatar_url: string;
    full_name?: string;
    user_name?: string;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  provider_token?: string;
  user: User;
}
