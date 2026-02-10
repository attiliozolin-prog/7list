import { Category, SearchResult, ShelfData } from "../types";

// Função auxiliar para verificar a chave
const getApiKey = () => {
  // Tenta pegar a chave da OpenAI. 
  // Nota: Em projetos Vite, variáveis de ambiente geralmente precisam começar com VITE_ 
  // para serem visíveis no frontend, MAS como estamos na Vercel, vamos tentar acessá-las diretamente
  // ou usar uma estratégia segura.
  const key = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!key) console.warn("OPENAI_API_KEY não encontrada.");
  return key;
};

// Usamos o Picsum para imagens consistentes sem precisar de API de imagens paga
const getPlaceholderImage = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`;

export const searchItems = async (query: string, category: Category): Promise<SearchResult[]> => {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    console.error("API Key da OpenAI ausente");
    return [];
  }

  let categoryContext = "";
  if (category === 'movies') categoryContext = "Filmes (Título, Diretor, Ano)";
  if (category === 'books') categoryContext = "Livros (Título, Autor, Ano)";
  if (category === 'music') categoryContext = "Músicas/Álbuns (Título da Música/Álbum, Artista)";

  // Prompt otimizado para JSON
  const prompt = `
    Você é um assistente de banco de dados cultural. 
    Busque por: "${query}" na categoria: ${categoryContext}.
    Retorne APENAS um JSON válido contendo uma lista com os top 5 resultados mais prováveis.
    
    O formato do JSON deve ser estritamente este:
    {
      "results": [
        {
          "title": "Nome exato",
          "subtitle": "Diretor (filmes), Autor (livros) ou Artista (música)",
          "imageSeed": "uma string curta e única para gerar uma imagem aleatoria (ex: titulo-sem-espaco)"
        }
      ]
    }
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo rápido e barato
        messages: [
          { role: "system", content: "Você é uma API JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }, // Garante JSON válido
        temperature: 0.3
      })
    });

    const data = await response.json();
    
    if (data.error) {
        console.error("OpenAI Error:", data.error);
        return [];
    }

    const content = JSON.parse(data.choices[0].message.content);
    
    return content.results.map((item: any) => ({
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: getPlaceholderImage(item.imageSeed || query), 
    }));

  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
};

export const generateAffiliateLink = (item: SearchResult, category: Category): string => {
  // Mantemos a mesma lógica de URL da Amazon
  const query = encodeURIComponent(`${item.title} ${item.subtitle}`);
  const tag = "7list-mvp-20"; 
  const baseUrl = `https://www.amazon.com.br/s?k=${query}&tag=${tag}`;
  return baseUrl;
};

export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey) return "Erro: Chave de API não configurada.";

  const movies = shelf.movies.filter(i => i).map(i => `${i?.title} (${i?.subtitle})`).join(", ");
  const books = shelf.books.filter(i => i).map(i => `${i?.title} (${i?.subtitle})`).join(", ");
  const music = shelf.music.filter(i => i).map(i => `${i?.title} (${i?.subtitle})`).join(", ");

  if (!movies && !books && !music) {
    return "Adicione itens à sua estante para gerar uma análise.";
  }

  const prompt = `
    Analise a seguinte lista de favoritos culturais de uma pessoa:
    Filmes: ${movies}
    Livros: ${books}
    Músicas: ${music}

    Aja como um crítico cultural sofisticado e cool. Escreva um parágrafo curto (max 280 caracteres) definindo a "vibe" dessa pessoa. Use emojis. Português do Brasil.
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
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (data.error) return "O oráculo cultural está indisponível.";
    
    return data.choices[0].message.content || "Análise indisponível.";

  } catch (error) {
    console.error("Persona generation failed:", error);
    return "O oráculo cultural está dormindo.";
  }
};
