import { Category, SearchResult, ShelfData } from "../types";

// --- CONFIGURAÇÃO DAS CHAVES ---
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// URLs Base
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";
const ITUNES_BASE_URL = "https://itunes.apple.com/search";

// --- FUNÇÕES AUXILIARES ---
const getPlaceholderImage = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`;

// 1. BUSCA DE FILMES (TMDb)
const searchMovies = async (query: string): Promise<SearchResult[]> => {
  if (!TMDB_API_KEY) return [];

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

// 2. BUSCA DE LIVROS (Google Books)
const searchBooks = async (query: string): Promise<SearchResult[]> => {
  const apiKeyParam = GOOGLE_BOOKS_API_KEY ? `&key=${GOOGLE_BOOKS_API_KEY}` : '';

  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(query)}&maxResults=5&printType=books${apiKeyParam}`
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((book: any) => {
      const info = book.volumeInfo;
      const authors = info.authors ? info.authors.join(", ") : "Autor desconhecido";
      const year = info.publishedDate ? info.publishedDate.split('-')[0] : '';
      
      let thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
      if (thumbnail) {
        thumbnail = thumbnail.replace('http://', 'https://').replace('&edge=curl', ''); 
      }

      return {
        title: info.title,
        subtitle: `${authors} ${year ? '• ' + year : ''}`,
        imageUrl: thumbnail || getPlaceholderImage(info.title),
        externalId: book.id,
        category: 'books'
      };
    });
  } catch (error) {
    console.error("Erro Google Books:", error);
    return [];
  }
};

// 3. BUSCA DE MÚSICAS (iTunes API - Sem Auth)
const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    // Buscamos por "album" para pegar a capa bonita, mas também serve para músicas
    const response = await fetch(
      `${ITUNES_BASE_URL}?term=${encodeURIComponent(query)}&media=music&entity=album&limit=5`
    );
    const data = await response.json();

    if (!data.results) return [];

    return data.results.map((item: any) => {
      // O iTunes retorna imagem 100x100, trocamos para 600x600 para ficar HD
      const hdImage = item.artworkUrl100?.replace('100x100', '600x600');
      const year = item.releaseDate ? item.releaseDate.split('-')[0] : '';

      return {
        title: item.collectionName, // Nome do Álbum
        subtitle: `${item.artistName} • ${year}`,
        imageUrl: hdImage || item.artworkUrl100,
        externalId: item.collectionId.toString(),
        category: 'music'
      };
    });
  } catch (error) {
    console.error("Erro iTunes:", error);
    return [];
  }
};

// --- ROTEADOR PRINCIPAL (Os "Fios" Conectados) ---
export const searchItems = async (query: string, category: Category): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];

  switch (category) {
    case 'movies':
      return await searchMovies(query);
    case 'books':
      return await searchBooks(query);
    case 'music':
      return await searchMusic(query);
    default:
      return [];
  }
};

// --- ESTRATÉGIA DE LINKS (Amazon Afiliados) ---
export const generateAffiliateLink = (item: SearchResult, category: Category): string => {
  // Montamos a busca específica para cada categoria para aumentar a conversão
  let searchTerm = `${item.title} ${item.subtitle}`;
  const tag = "7list-mvp-20"; // Sua TAG de afiliado

  // Limpeza básica para melhorar a busca na Amazon
  if (category === 'music') {
    searchTerm = searchTerm.replace('•', ''); // Remove caracteres especiais
  }

  // Categoria específica na URL da Amazon (i=stripbooks, i=dvd, etc) ajuda na conversão
  // Mas para MVP, a busca global (s?k=) é mais segura para não dar "sem resultados"
  const encodedQuery = encodeURIComponent(searchTerm);
  return `https://www.amazon.com.br/s?k=${encodedQuery}&tag=${tag}`;
};

// --- PERSONA CULTURAL (OpenAI) ---
export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
  if (!OPENAI_API_KEY) return "Configure a VITE_OPENAI_API_KEY na Vercel.";

  const items = [
    ...shelf.movies.filter(i => i).map(i => `Filme: ${i?.title}`),
    ...shelf.books.filter(i => i).map(i => `Livro: ${i?.title}`),
    ...shelf.music.filter(i => i).map(i => `Álbum: ${i?.title} (${i?.subtitle})`)
  ].join(", ");

  if (items.length < 10) return "Adicione itens à estante para gerar a análise.";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Modelo rápido
        messages: [{ 
          role: "user", 
          content: `Analise a vibe dessa lista cultural: ${items}. Crie um texto curto (max 280 chars) estilo horóscopo/twitter sobre a personalidade dessa pessoa. Seja divertido, use emojis e pt-BR.` 
        }],
        temperature: 0.8
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Erro ao interpretar sua vibe.";
  } catch (e) {
    return "O oráculo está offline.";
  }
};
