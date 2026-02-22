import dotenv from 'dotenv';

dotenv.config();

interface AppConfig {
  port: number;
  githubToken?: string;
  geminiApiKey: string;
  nodeEnv: string;
}

const getEnv = (key: string, required: boolean = false): string | undefined => {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

export const config: AppConfig = {
  port: 3000, // Hardcoded as per platform requirements
  githubToken: getEnv('GITHUB_TOKEN'),
  geminiApiKey: getEnv('GEMINI_API_KEY', true)!,
  nodeEnv: getEnv('NODE_ENV') || 'development',
};
