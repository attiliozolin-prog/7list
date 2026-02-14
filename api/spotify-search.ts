import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cache do access token (válido por 1 hora)
let spotifyAccessToken: string | null = null;
let tokenExpiresAt = 0;

// Obter access token do Spotify (Client Credentials Flow)
const getSpotifyToken = async (): Promise<string> => {
  // Retornar token em cache se ainda válido
  if (spotifyAccessToken && Date.now() < tokenExpiresAt) {
    return spotifyAccessToken;
  }

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Credenciais do Spotify não configuradas');
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    spotifyAccessToken = data.access_token;
    // Token expira em 1 hora, renovar 5 minutos antes
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return spotifyAccessToken;
  } catch (error) {
    console.error('Erro ao obter token do Spotify:', error);
    throw error;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration - apenas domínios permitidos
  const allowedOrigins = [
    'https://7list.me',
    'https://www.7list.me',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query } = req.query;

  // Validação de input
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  if (query.length < 2) {
    return res.status(400).json({ error: 'Query too short (min 2 characters)' });
  }

  if (query.length > 200) {
    return res.status(400).json({ error: 'Query too long (max 200 characters)' });
  }

  try {
    const token = await getSpotifyToken();

    // Buscar tracks no Spotify (mercado BR para resultados localizados)
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=5&market=BR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
      return res.status(200).json({ tracks: { items: [] } });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Spotify Search Error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Failed to search music' });
  }
}
