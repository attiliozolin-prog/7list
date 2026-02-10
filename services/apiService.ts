import { Category, SearchResult, ShelfData } from "../types";

// --- CONFIGURAÇÃO DAS CHAVES ---
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const GOOGLE_BOOKS_API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// URLs Base
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

// --- FUNÇÕES AUXILIARES ---
const getPlaceholderImage = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`;

// --- BUSCA DE FILMES (TMDB) ---
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

// --- BUSCA DE LIVROS (GOOGLE BOOKS) ---
const searchBooks = async (query: string): Promise<SearchResult[]> => {
  // A Google Books funciona mesmo sem chave para testes limitados, 
  // mas é bom ter a chave para produção.
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
      
      // Google Books retorna links http que o navegador bloqueia, forçamos https
      let thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
      if (thumbnail) {
        thumbnail = thumbnail.replace('http://', 'https://');
        // Hack para pegar imagem de melhor qualidade se possível
        thumbnail = thumbnail.replace('&edge=curl', ''); 
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

// --- BUSCA GENÉRICA (OPENAI - Apenas Músicas agora) ---
const searchWithAI = async (query: string, category: Category): Promise<SearchResult[]> => {
  if (!OPENAI_API_KEY) return [];

  // Se for livros ou filmes e caiu aqui, retorna vazio
  if (category !== 'music') return [];

  const prompt = `
    Busque por "${query}" em Músicas (Música/Álbum, Artista).
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
      imageUrl: getPlaceholderImage(item.imageSeed || query),
      category: 'music'
    }));
  } catch (error) {
    console.error("Erro OpenAI:", error);
    return [];
  }
};

// --- ROTEADOR DE BUSCA ---
export const searchItems = async (query: string, category: Category): Promise<SearchResult[]> => {
  if (category === 'movies') {
    return await searchMovies(query);
  } else if (category === 'books') {
    return await searchBooks(query);
  } else {
    return await searchWithAI(query, category);
  }
};

// --- GERAÇÃO DE LINK DE AFILIADO ---
export const generateAffiliateLink = (item: SearchResult, category: Category): string => {
  const query = encodeURIComponent(`${item.title} ${item.subtitle}`);
  // Tag de afiliado definida no MVP
  const tag = "7list-mvp-20"; 
  
  // Aqui futuramente podemos diferenciar: 
  // se for Filme -> Prime Video
  // se for Livro -> Amazon Books
  // Mas para o MVP, a busca geral funciona bem.
  return `https://www.amazon.com.br/s?k=${query}&tag=${tag}`;
};

// --- ANÁLISE CULTURAL (Mantida igual) ---
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
