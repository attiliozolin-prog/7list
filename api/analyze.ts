
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define o corpo esperado da requisição
interface AnalyzeRequestBody {
  shelf: {
    movies: (string | null)[];
    books: (string | null)[];
    music: (string | null)[];
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { shelf } = req.body as AnalyzeRequestBody;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: Missing OpenAI API Key' });
  }

  if (!shelf) {
      return res.status(400).json({ error: 'Missing shelf data' });
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
    console.error('OpenAI Error:', error);
    return res.status(500).json({ error: 'Failed to generate persona' });
  }
}
