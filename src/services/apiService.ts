import { Category, SearchResult, ShelfData } from "../types";

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

// 2. BUSCA DE LIVROS (Google Books API) - BIBLIOTECA COMPLETA (40M+ livros)
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1";

const searchBooks = async (query: string): Promise<SearchResult[]> => {
  try {
    // Google Books API oferece biblioteca muito mais completa que iTunes
    const url = GOOGLE_BOOKS_API_KEY
      ? `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&langRestrict=pt&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`
      : `${GOOGLE_BOOKS_BASE_URL}/volumes?q=${encodeURIComponent(query)}&langRestrict=pt&maxResults=5`;

    const response = await fetch(url);
    const data = await response.json();

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

// 3. BUSCA DE MÚSICAS (MusicBrainz API + Cover Art Archive) - BANCO DE DADOS MASSIVO
const MUSICBRAINZ_BASE_URL = "https://musicbrainz.org/ws/2";
const COVERART_BASE_URL = "https://coverartarchive.org";
let lastMusicBrainzRequest = 0;

// Rate limiting: MusicBrainz exige 1 requisição por segundo
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastMusicBrainzRequest;
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  lastMusicBrainzRequest = Date.now();
};

const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    await waitForRateLimit();

    // Busca por releases (álbuns) no MusicBrainz
    const response = await fetch(
      `${MUSICBRAINZ_BASE_URL}/release/?query=${encodeURIComponent(query)}&fmt=json&limit=5`,
      {
        headers: {
          'User-Agent': '7list/1.0.0 (https://7list.vercel.app)',
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();
    if (!data.releases || data.releases.length === 0) return [];

    // Buscar capas para cada álbum
    const results = await Promise.all(
      data.releases.slice(0, 5).map(async (release: any) => {
        let coverUrl = getPlaceholderImage(release.id);

        // Tentar buscar capa do Cover Art Archive
        try {
          const coverResponse = await fetch(
            `${COVERART_BASE_URL}/release/${release.id}`,
            { headers: { 'Accept': 'application/json' } }
          );

          if (coverResponse.ok) {
            const coverData = await coverResponse.json();
            // Pega a capa frontal em alta resolução
            const frontCover = coverData.images?.find((img: any) => img.front);
            if (frontCover) {
              coverUrl = frontCover.thumbnails?.large || frontCover.thumbnails?.small || frontCover.image;
            }
          }
        } catch (coverError) {
          // Se não encontrar capa, usa placeholder
          console.debug("Capa não encontrada para:", release.title);
        }

        const artistName = release['artist-credit']?.[0]?.name || 'Artista desconhecido';
        const year = release.date ? release.date.split('-')[0] : '';

        return {
          title: release.title || 'Álbum desconhecido',
          subtitle: `${artistName}${year ? ' • ' + year : ''}`,
          imageUrl: coverUrl,
          externalId: release.id,
          category: 'music'
        };
      })
    );

    return results;
  } catch (error) {
    console.error("Erro MusicBrainz:", error);
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

// --- PERSONA CULTURAL (AGORA VIA SERVERLESS) ---
export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shelf: {
          movies: shelf.movies.map(i => i ? `Filme: ${i.title}` : null),
          books: shelf.books.map(i => i ? `Livro: ${i.title}` : null),
          music: shelf.music.map(i => i ? `Álbum: ${i.title}` : null),
        }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return err.text || "O oráculo está mudo no momento.";
    }

    const data = await response.json();
    return data.text;
  } catch (e) {
    console.error(e);
    return "O oráculo está tirando um cochilo (Erro de conexão).";
  }
};
