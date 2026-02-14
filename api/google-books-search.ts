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
            console.log('Usando fallback sem API Key...');
            const fallbackUrl = `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&langRestrict=pt&maxResults=5&printType=books`;

            // Tentar passar header de linguagem para ajudar na localização (embora a API possa ignorar dependendo do IP)
            const response = await fetch(fallbackUrl, {
                headers: {
                    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
                }
            });

            if (!response.ok) {
                throw new Error(`Google Books API error: ${response.statusText}`);
            }

            data = await response.json();
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
