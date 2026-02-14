import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS configuration - apenas domínios permitidos
    const allowedOrigins = [
        'https://7list.me',
        'https://www.7list.me',
        'https://7list.vercel.app',
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
        // Google Books API oferece biblioteca muito mais completa
        const url = GOOGLE_BOOKS_API_KEY
            ? `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&langRestrict=pt&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`
            : `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&langRestrict=pt&maxResults=5`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Google Books API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Se houver erro na resposta da API
        if (data.error) {
            console.error('Google Books API Error:', data.error);
            return res.status(400).json({ error: data.error.message || 'Google Books API error' });
        }

        // Retornar resultado (mesmo que vazio)
        return res.status(200).json(data);

    } catch (error) {
        console.error('Google Books Search Error:', error instanceof Error ? error.message : 'Unknown error');
        return res.status(500).json({ error: 'Failed to search books' });
    }
}
