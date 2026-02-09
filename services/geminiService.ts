import { GoogleGenAI, Type } from "@google/genai";
import { Category, SearchResult, ShelfData } from "../types";

// NÃO inicializamos o cliente globalmente aqui para evitar crash na inicialização
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

// Função auxiliar para obter o cliente de forma segura
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API Key não encontrada. Verifique as variáveis de ambiente na Vercel.");
    return null;
  }
  
  return new GoogleGenAI({ apiKey });
};

// Using standard Picsum for consistency since we can't fetch real album art without protected APIs
const getPlaceholderImage = (seed: string) => `https://picsum.photos/seed/${seed}/300/450`;

export const searchItems = async (query: string, category: Category): Promise<SearchResult[]> => {
  const ai = getGenAIClient();

  // Se não houver cliente (sem chave), retorna array vazio sem quebrar a tela
  if (!ai) {
    return [];
  }

  // Usando um modelo estável
  const modelName = 'gemini-2.0-flash';
  
  let categoryContext = "";
  if (category === 'movies') categoryContext = "Movies/Cinema (Title, Director, Year)";
  if (category === 'books') categoryContext = "Books/Literature (Title, Author, Year)";
  if (category === 'music') categoryContext = "Music/Songs/Albums (Song/Album Title, Artist)";

  const prompt = `
    Search for the following query in the database of ${categoryContext}: "${query}".
    Return a list of the top 5 most likely matches.
    For each match, provide the exact title and the subtitle (Director for movies, Author for books, Artist for music).
    Also provide a seed string for a random image generator.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              imageSeed: { type: Type.STRING },
            },
            required: ["title", "subtitle", "imageSeed"],
          },
        },
      },
    });

    const data = JSON.parse(response.text() || "[]");

    // Map the AI response to our app structure
    return data.map((item: any) => ({
      title: item.title,
      subtitle: item.subtitle,
      imageUrl: getPlaceholderImage(item.imageSeed + query), // Salt with query to ensure variety
    }));

  } catch (error) {
    console.error("Search failed:", error);
    // Return empty array on error so UI handles it gracefully
    return [];
  }
};

export const generateAffiliateLink = (item: SearchResult, category: Category): string => {
  // Logic to simulate the affiliate link generation strategy described in the brief.
  // In a real app, this would query Amazon's Product Advertising API.
  // Here we construct a search URL with an affiliate tag.
  
  const query = encodeURIComponent(`${item.title} ${item.subtitle}`);
  const tag = "7list-mvp-20"; // Simulated tag
  const baseUrl = `https://www.amazon.com.br/s?k=${query}&tag=${tag}`;
  
  return baseUrl;
};

export const generateCulturalPersona = async (shelf: ShelfData): Promise<string> => {
  const ai = getGenAIClient();

  if (!ai) {
    return "Erro: Chave de API não configurada no ambiente.";
  }

  const movies = shelf.movies.filter(i => i).map(i => `${i?.title} (${i?.subtitle})`).join(", ");
  const books = shelf.books.filter(i => i).map(i => `${i?.title} (${i?.subtitle})`).join(", ");
  const music = shelf.music.filter(i => i).map(i => `${i?.title} (${i?.subtitle})`).join(", ");

  if (!movies && !books && !music) {
    return "Adicione itens à sua estante para gerar uma análise.";
  }

  const prompt = `
    Analise a seguinte lista de favoritos culturais de uma pessoa (o '7list' dela):
    
    Filmes: ${movies || "Nenhum selecionado"}
    Livros: ${books || "Nenhum selecionado"}
    Músicas: ${music || "Nenhuma selecionada"}

    Aja como um crítico cultural sofisticado, porém acessível e moderno (estilo colunista de cultura pop ou influencer cult).
    Escreva um parágrafo curto (máximo 280 caracteres, estilo Twitter/Threads) definindo a "vibe" ou personalidade dessa pessoa baseada nessas escolhas.
    Seja perspicaz, levemente elogioso, mas com um toque de humor ou ironia carinhosa. Use emojis.
    O texto deve ser em Português do Brasil e pronto para ser compartilhado nas redes sociais.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    return response.text() || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Persona generation failed:", error);
    return "O oráculo cultural está dormindo. Tente novamente mais tarde.";
  }
};
