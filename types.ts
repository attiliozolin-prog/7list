export type Category = 'movies' | 'books' | 'music';

export interface Item {
  id: string;
  title: string;
  subtitle: string; // Artist, Author, or Director/Year
  imageUrl?: string;
  affiliateLink: string;
  category: Category;
}

export interface ShelfData {
  movies: (Item | null)[];
  books: (Item | null)[];
  music: (Item | null)[];
}

export interface SearchResult {
  title: string;
  subtitle: string;
  year?: string;
  imageUrl?: string;
}

export interface UserProfile {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  instagramUrl?: string;
  spotifyUrl?: string;
}
