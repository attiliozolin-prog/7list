import { Category, SearchResult, ShelfData } from "../types";

// --- CONFIGURAÇÃO DAS CHAVES ---
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// URLs Base
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const ITUNES_BASE_URL = "https://itunes.apple.com/search"; // Usaremos para Música e Livros

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

// 2. BUSCA DE LIVROS (iTunes Books API) - MANTIDO
const searchBooks = async (query: string): Promise<SearchResult[]> => {
  try {
    // media=ebook busca na base de livros da Apple
    const response = await fetch(
      `${ITUNES_BASE_URL}?term=${encodeURIComponent(query)}&media=ebook&limit=5&lang=pt_br`
    );
    
    const data = await response.json();

    if (!data.results || data.results.length === 0) return [];

    return data.results.map((book: any) => {
      // Pega capa em alta resolução
      const hdImage = book.artworkUrl100?.replace('100x100', '600x600');
      const year = book.releaseDate ? book.releaseDate.split('-')[0] : '';
      
      return {
        title: book.trackName, // Na API da Apple, nome do livro é trackName
        subtitle: `${book.artistName} • ${year}`,
        imageUrl: hdImage || book.artworkUrl100,
        externalId: book.trackId.toString(),
        category: 'books'
      };
    });
  } catch (error) {
    console.error("Erro iTunes Books:", error);
    return [];
  }
};

// 3. BUSCA DE MÚSICAS (iTunes Music API) - MANTIDO
const searchMusic = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(
      `${ITUNES_BASE_URL}?term=${encodeURIComponent(query)}&media=music&entity=album&limit=5`
    );
    const data = await response.json();
    if (!data.results) return [];
    
    return data.results.map((item: any) => {
      const hdImage = item.artworkUrl100?.replace('100x100', '600x600');
      const year = item.releaseDate ? item.releaseDate.split('-')[0] : '';
      return {
        title: item.collectionName,
        subtitle: `${item.artistName} • ${year}`,
        imageUrl: hdImage || item.artworkUrl100,
        externalId: item.collectionId.toString(),
        category: 'music'
      };
    });
  } catch (error) {
    console.error("Erro iTunes Music:", error);
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

// --- PERSONA CULTURAL (TURBINADA COM PROMPT CRIATIVO) ---
export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
  if (!OPENAI_API_KEY) return "Configure a VITE_OPENAI_API_KEY na Vercel.";
  
  const items = [
    ...shelf.movies.filter(i => i).map(i => `Filme: ${i?.title}`),
    ...shelf.books.filter(i => i).map(i => `Livro: ${i?.title}`),
    ...shelf.music.filter(i => i).map(i => `Álbum: ${i?.title}`)
  ].join(", ");
  
  if (items.length < 10) return "Adicione mais itens à estante para o oráculo ler sua mente.";

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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é uma IA especialista em análise cultural e personalidade." },
          { role: "user", content: prompt }
        ],
        temperature: 0.85, // Temperatura mais alta para ser mais criativo
        max_tokens: 250
      })
    });
    const data = await response.json();
    
    // Remove aspas se a IA colocar, para ficar limpo no design
    let text = data.choices?.[0]?.message?.content || "O oráculo está confuso com tanta cultura.";
    text = text.replace(/^["']|["']$/g, ''); 
    
    return text;
  } catch (e) { return "O oráculo está tirando um cochilo."; }
};
