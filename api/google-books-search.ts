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
        let data: any = null;

        // 1. Tentar COM a chave (se existir)
        if (GOOGLE_BOOKS_API_KEY) {
            try {
                // Adicionando &printType=books para filtrar revistas e focar em livros
                const url = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&langRestrict=pt&maxResults=5&printType=books&key=${GOOGLE_BOOKS_API_KEY}`;

                const response = await fetch(url);

                if (response.ok) {
                    data = await response.json();

                    // Se a API retornou erro no corpo da resposta (mesmo com status 200)
                    if (data.error) {
                        console.warn('Google Books API retornou erro no corpo, tentando fallback...');
                        data = null; // Forçar fallback
                    }
                } else {
                    console.warn(`Google Books API com chave falhou (${response.status}), tentando fallback...`);
                }
            } catch (e) {
                console.warn('Erro de conexão ao usar API Key, tentando fallback:', e);
            }
        }

        // 2. Fallback: Se não tem chave ou se a tentativa com chave falhou (data é null)
        if (!data) {
            console.log('Usando fallback: iTunes Search API...');
            const fallbackUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=ebook&limit=5&country=br`;

            const response = await fetch(fallbackUrl);

            if (!response.ok) {
                throw new Error(`iTunes API error: ${response.statusText}`);
            }

            const itunesData = await response.json();
            
            // Mapear dados do iTunes para o formato esperado pelo frontend (Google Books)
            data = {
                items: (itunesData.results || []).map((track: any) => ({
                    id: track.trackId ? track.trackId.toString() : Math.random().toString(36).substring(7),
                    volumeInfo: {
                        title: track.trackName || 'Título desconhecido',
                        authors: track.artistName ? [track.artistName] : ['Autor desconhecido'],
                        publishedDate: track.releaseDate ? track.releaseDate.substring(0, 10) : '',
                        imageLinks: {
                            thumbnail: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '300x300bb') : ''
                        }
                    }
                }))
            };
        }

        // Se houver erro na resposta final
        if (data.error) {
            console.error('Google Books API Error:', data.error);
            return res.status(400).json({ error: data.error.message || 'Google Books API error' });
        }

        // Retornar resultado
        return res.status(200).json(data);

    } catch (error) {
        console.error('Google Books Search Error:', error instanceof Error ? error.message : 'Unknown error');
        return res.status(500).json({ error: 'Failed to search books' });
    }
}
