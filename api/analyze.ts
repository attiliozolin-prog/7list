
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Define o corpo esperado da requisição
interface AnalyzeRequestBody {
  shelf: {
    movies: (string | null)[];
    books: (string | null)[];
    music: (string | null)[];
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration - RESTRITO a domínios permitidos
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

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // AUTENTICAÇÃO: Verificar token do Supabase
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.replace('Bearer ', '');

  // Verificar token com Supabase
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  // VALIDAÇÃO DE INPUT
  const { shelf } = req.body as AnalyzeRequestBody;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing OpenAI API Key' });
  }

  if (!shelf || typeof shelf !== 'object') {
    return res.status(400).json({ error: 'Invalid request: shelf data required' });
  }

  // Validar e sanitizar cada categoria
  const categories = ['movies', 'books', 'music'] as const;
  for (const cat of categories) {
    if (!Array.isArray(shelf[cat])) {
      return res.status(400).json({ error: `Invalid ${cat} data` });
    }

    if (shelf[cat].length > 7) {
      return res.status(400).json({ error: `Too many ${cat} items (max 7)` });
    }

    // Sanitizar strings
    shelf[cat] = shelf[cat].map(item => {
      if (!item || typeof item !== 'string') return null;
      // Limitar tamanho e remover caracteres perigosos
      return item.substring(0, 300).replace(/[<>]/g, '');
    });
  }

  const items = [
    ...(shelf.movies || []).filter(i => i),
    ...(shelf.books || []).filter(i => i),
    ...(shelf.music || []).filter(i => i)
  ].join(", ");

  if (items.length < 10) {
    return res.status(200).json({ text: "Adicione mais itens à estante para o oráculo ler sua mente." });
  }

  const prompt = `
    Aja como um "Oráculo Cultural" moderno, místico e levemente debochado (mas carinhoso).
    Analise a "vibe" estética e psicológica dessa pessoa baseada nesta lista de favoritos:
    ${items}

    Diretrizes Criativas:
    1. NÃO descreva a lista. Fale sobre a *personalidade* de quem gosta dessas coisas.
    2. Use uma analogia criativa e poética (ex: "Sua alma tem cheiro de livro velho e chuva...", "Você é o personagem principal de um filme indie...", "Sua vibe é café preto e boletos pagos...").
    3. O tom deve ser divertido, inteligente e "shareable" (pra postar no story).
    4. Limite estrito: Máximo 280 caracteres.
    5. Finalize com 3 emojis que resumam a aura da pessoa.
    6. Texto em Português do Brasil.
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é uma IA especialista em análise cultural e personalidade." },
          { role: "user", content: prompt }
        ],
        temperature: 0.85,
        max_tokens: 250
      })
    });

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "O oráculo está confuso com tanta cultura.";
    text = text.replace(/^["']|["']$/g, '');

    return res.status(200).json({ text });

  } catch (error) {
    // Logar apenas internamente, sem expor detalhes ao cliente
    console.error('OpenAI API Error:', error instanceof Error ? error.message : 'Unknown error');

    // Retornar mensagem genérica
    return res.status(500).json({
      error: 'Erro ao processar análise. Tente novamente mais tarde.'
    });
  }
}
