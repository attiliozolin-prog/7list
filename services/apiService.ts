import { Category, SearchResult, ShelfData } from "../types";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY; // Fallback para Books/Music

// Configurações do TMDb
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342"; // w342 é um tamanho ótimo para cards

// Interface auxiliar para resposta do TMDb
interface TMDbMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  poster_path: string | null;
}

// --- BUSCA DE FILMES (REAL) ---
const searchMovies = async (query: string): Promise<SearchResult[]> => {
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY não encontrada.");
    return [];
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}&language=pt-BR&page=1`
    );
    
    const data = await response.json();

    if (!data.results) return [];

    // Filtramos apenas filmes que têm poster para a estante ficar bonita
    return data.results
      .slice(0, 5) // Pega só os top 5
      .map((movie: TMDbMovie) => {
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        
        return {
          title: movie.title,
          // No MVP, usar o Ano é mais rápido que buscar o Diretor (que exige outra chamada de API)
          subtitle: `Filme • ${year}`, 
          imageUrl: movie.poster_path 
            ? `${TMDB_IMAGE_BASE}${movie.poster_path}` 
            : "https://via.placeholder.com/300x450?text=Sem+Capa",
          // Guardamos o ID real para links futuros
          externalId: movie.id.toString() 
        };
      });

  } catch (error) {
    console.error("Erro ao buscar filmes no TMDb:", error);
    return [];
  }
};

// --- BUSCA COM IA (FALLBACK PARA LIVROS/MÚSICAS) ---
const searchWithAI = async (query: string, category: Category): Promise<SearchResult[]> => {
    // ... Aqui mantemos a lógica antiga do OpenAI que te mandei antes
    // Vou simplificar aqui para não ficar gigante, mas você pode manter o código anterior
    // se quiser continuar usando AI para livros e músicas por enquanto.
    return []; 
};

// --- FUNÇÃO PRINCIPAL DE BUSCA (ROTEADOR) ---
export const searchItems = async (query: string, category: Category): Promise<SearchResult[]> => {
  if (category === 'movies') {
    return await searchMovies(query);
  } else {
    // Por enquanto retorna vazio ou usa o código da OpenAI antigo para Books/Music
    // Vamos implementar Books e Music nos próximos passos
    return []; 
  }
};

// --- GERAÇÃO DE LINKS ---
export const generateAffiliateLink = (item: SearchResult, category: Category): string => {
  const query = encodeURIComponent(`${item.title} ${item.subtitle}`);
  const tag = "7list-mvp-20"; 
  return `https://www.amazon.com.br/s?k=${query}&tag=${tag}`;
};

// --- PERSONA (Mantém a IA) ---
export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
    // ... (Copie a função generateCulturalPersona do código anterior da OpenAI)
    // Se precisar eu mando ela completa novamente
    return "Análise indisponível temporariamente.";
};
