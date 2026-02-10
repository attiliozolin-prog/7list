import { Category, SearchResult, ShelfData } from "../types";

// --- CONFIGURAÇÃO DAS CHAVES ---
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// URLs Base
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342"; 

// --- FUNÇÕES AUXILIARES ---
const getPlaceholderImage = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`;

// --- BUSCA DE FILMES (TMDB) ---
const searchMovies = async (query: string): Promise<SearchResult[]> => {
  if (!TMDB_API_KEY) {
    console.error("VITE_TMDB_API_KEY ausente.");
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=pt-BR&page=1`
    );
    const data = await response.json();

    if (!data.results) return [];

    return data.results.slice(0, 5).map((movie: any) => {
      const year = movie.release_date ? movie.release_date.split('-')[0] : '';
      return {
        title: movie.title,
        subtitle: year ? `Filme • ${year}` : 'Filme',
        imageUrl: movie.poster_path 
          ? `${TMDB_IMAGE_BASE}${movie.poster_path}` 
          : getPlaceholderImage(movie.title),
        externalId: movie.id.toString(),
        category: 'movies'
      };
    });
  } catch (error) {
    console.error("Erro TMDb:", error);
    return [];
  }
};

// --- BUSCA GENÉRICA (OPENAI - Livros e Músicas) ---
const searchWithAI = async (query: string, category: Category): Promise<SearchResult[]> => {
  if (!OPENAI_API_KEY) return [];

  let context = category === 'books' ? "Livros (Título, Autor)" : "Músicas (Música/Álbum, Artista)";
  
  const prompt = `
    Busque por "${query}" em ${context}.
    Retorne JSON: { "results": [{ "title": "...", "subtitle": "...", "imageSeed": "..." }] }
    Max 5 itens.
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "JSON output only." }, { role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    
    return content.results.map((item: any) => ({
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: getPlaceholderImage(item.imageSeed || query)
    }));
  } catch (error) {
    console.error("Erro OpenAI:", error);
    return [];
  }
};

// --- FUNÇÃO PRINCIPAL DE BUSCA ---
export const searchItems = async (query: string, category: Category): Promise<SearchResult[]> => {
  if (category === 'movies') {
    return await searchMovies(query);
  } else {
    return await searchWithAI(query, category);
  }
};

// --- GERAÇÃO DE LINK DE AFILIADO ---
export const generateAffiliateLink = (item: SearchResult, category: Category): string => {
  const query = encodeURIComponent(`${item.title} ${item.subtitle}`);
  return `https://www.amazon.com.br/s?k=${query}&tag=7list-mvp-20`;
};

// --- ANÁLISE CULTURAL (PERSONA) ---
export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
  if (!OPENAI_API_KEY) return "Configure a VITE_OPENAI_API_KEY para ver sua análise.";

  const items = [
    ...shelf.movies.filter(i => i).map(i => `Filme: ${i?.title}`),
    ...shelf.books.filter(i => i).map(i => `Livro: ${i?.title}`),
    ...shelf.music.filter(i => i).map(i => `Som: ${i?.title}`)
  ].join(", ");

  if (!items) return "Adicione itens à estante para gerar a análise.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ 
          role: "user", 
          content: `Analise essa lista cultural: ${items}. Defina a 'vibe' da pessoa em um tweet (max 280 chars). Seja divertido, use emojis e pt-BR.` 
        }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (e) {
    return "Erro ao gerar análise.";
  }
};
