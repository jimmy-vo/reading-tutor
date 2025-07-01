import dotenv from 'dotenv';

dotenv.config();

export const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY!;
export const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
export const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT!;
