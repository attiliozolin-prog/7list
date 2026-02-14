import { Category, SearchResult, ShelfData } from "../types";
import { supabase } from "../lib/supabase";

// --- CONFIGURAÇÃO DAS CHAVES ---
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
// URLs Base
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";

// --- FUNÇÕES AUXILIARES ---
const getPlaceholderImage = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`;

// 1. BUSCA DE FILMES (TMDb) - MANTIDO
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
        imageUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : getPlaceholderImage(movie.title),
        externalId: movie.id.toString(),
        category: 'movies'
      };
    });
  } catch (error) {
    console.error("Erro TMDb:", error);
    return [];
  }
};

// 2. BUSCA DE LIVROS (Google Books API via Backend)
// SEGURANÇA: API Key agora está protegida no backend
const searchBooks = async (query: string): Promise<SearchResult[]> => {
  try {
    // Chamar a API serverless que gerencia a comunicação com Google Books
    const response = await fetch(`/api/google-books-search?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.error) {
      console.error('Erro Google Books API:', data.error);
      return [];
    }

    if (!data.items || data.items.length === 0) return [];

    return data.items.map((item: any) => {
      const book = item.volumeInfo;
      const authors = book.authors ? book.authors.join(', ') : 'Autor desconhecido';
      const year = book.publishedDate ? book.publishedDate.split('-')[0] : '';

      // Google Books oferece capas em várias resoluções
      const thumbnail = book.imageLinks?.thumbnail?.replace('http:', 'https:') ||
        book.imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
        getPlaceholderImage(book.title || 'book');

      return {
        title: book.title || 'Título desconhecido',
        subtitle: `${authors}${year ? ' • ' + year : ''}`,
        imageUrl: thumbnail,
        externalId: item.id,
        category: 'books'
      };
    });
  } catch (error) {
    console.error("Erro Google Books:", error);
    return [];
  }
};

// 3. BUSCA DE MÚSICAS (Spotify API via Backend)
// SEGURANÇA: Client Secret agora está protegido no backend
const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    // Chamar a API serverless que gerencia a autenticação do Spotify
    const response = await fetch(`/api/spotify-search?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
      return [];
    }

    return data.tracks.items.map((track: any) => {
      // Artistas (pode ter múltiplos)
      const artists = track.artists.map((artist: any) => artist.name).join(', ');

      // Álbum
      const albumName = track.album.name;

      // Capa do álbum (pegar a maior disponível)
      const coverUrl = track.album.images[0]?.url || getPlaceholderImage(track.id);

      // Ano de lançamento
      const year = track.album.release_date ? track.album.release_date.split('-')[0] : '';

      return {
        title: track.name,
        subtitle: `${artists} • ${albumName}${year ? ' • ' + year : ''}`,
        imageUrl: coverUrl,
        externalId: track.id,
        category: 'music'
      };
    });
  } catch (error) {
    console.error("Erro Spotify:", error);
    return [];
  }
};

// --- ROTEADOR ---
export const searchItems = async (query: string, category: Category): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];
  switch (category) {
    case 'movies': return await searchMovies(query);
    case 'books': return await searchBooks(query);
    case 'music': return await searchMusic(query);
    default: return [];
  }
};

export const generateAffiliateLink = (item: SearchResult, category: Category): string => {
  const query = encodeURIComponent(`${item.title} ${item.subtitle}`);
  return `https://www.amazon.com.br/s?k=${query}&tag=7list-mvp-20`;
};

// --- PERSONA CULTURAL (AGORA VIA SERVERLESS COM AUTENTICAÇÃO) ---
export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
  try {
    // Obter token do usuário autenticado
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return "Você precisa estar logado para usar esta funcionalidade.";
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        shelf: {
          movies: shelf.movies.map(i => i ? `Filme: ${i.title}` : null),
          books: shelf.books.map(i => i ? `Livro: ${i.title}` : null),
          music: shelf.music.map(i => i ? `Álbum: ${i.title}` : null),
        }
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        return "Sessão expirada. Faça login novamente.";
      }
      const err = await response.json();
      return err.text || err.error || "O oráculo está mudo no momento.";
    }

    const data = await response.json();
    return data.text;
  } catch (e) {
    console.error(e);
    return "O oráculo está tirando um cochilo (Erro de conexão).";
  }
};
