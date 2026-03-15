import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
});

// Configure interceptor for the API Key
tmdbClient.interceptors.request.use((config) => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return config;

  if (apiKey.startsWith('eyJ')) {
    // It's a v4 Bearer token
    config.headers.Authorization = `Bearer ${apiKey}`;
  } else {
    // It's a v3 API Key (most common)
    config.params = config.params || {};
    config.params.api_key = apiKey;
  }
  return config;
});
