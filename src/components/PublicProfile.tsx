import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShelfData, UserProfile } from '../types';
import { ProfileHeader } from './ProfileHeader';
import { ShelfSection } from './ShelfSection';
import { Loader2, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';

const INITIAL_SHELF: ShelfData = {
  movies: Array(7).fill(null),
  books: Array(7).fill(null),
  music: Array(7).fill(null),
};

export const PublicProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>(); // Pega o nome da URL
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [shelf, setShelf] = useState<ShelfData>(INITIAL_SHELF);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) loadPublicData(username);
  }, [username]);

  const loadPublicData = async (userHandle: string) => {
    setLoading(true);
    // 1. Busca o perfil pelo Username (ex: @joao)
    // Remove o @ se o usuário digitou na URL
    const cleanHandle = userHandle.replace('@', '');

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanHandle) // O username deve ser único no banco
      .single();

    if (error || !profileData) {
      setLoading(false);
      return;
    }

    setProfile({
      name: profileData.full_name || 'Sem Nome',
      handle: profileData.username,
      bio: profileData.bio || '',
      avatarUrl: profileData.avatar_url || 'https://via.placeholder.com/150',
      instagramUrl: profileData.instagram_url,
      spotifyUrl: profileData.spotify_url
    });

    // 2. Busca a estante desse ID
    const { data: shelfData } = await supabase
      .from('shelves')
      .select('*')
      .eq('user_id', profileData.id)
      .single();

    if (shelfData) {
      const sanitize = (arr: any[]) => [...(Array.isArray(arr) ? arr : []), ...Array(7).fill(null)].slice(0, 7);
      setShelf({
        movies: sanitize(shelfData.movies),
        books: sanitize(shelfData.books),
        music: sanitize(shelfData.music)
      });
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-brand-50"><Loader2 className="animate-spin text-brand-500" /></div>;
  }

  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-brand-50 text-center p-4">
        <h1 className="text-2xl font-serif font-bold text-gray-800 mb-2">Perfil não encontrado 😕</h1>
        <p className="text-gray-500 mb-6">O usuário @{username} ainda não criou sua 7list.</p>
        <Link to="/" className="text-brand-600 font-bold hover:underline">Criar a minha agora</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-brand-50/30 pb-20">
      {/* Header Simples */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Criar minha lista</span>
          </Link>
          <img src={logo} alt="7list" className="h-8 w-auto" />
          <div className="w-20"></div> {/* Espaço vazio para centralizar */}
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-4xl mt-8 space-y-8">
        <ProfileHeader profile={profile} isEditing={false} />

        <div className="space-y-4 opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ShelfSection title="Filmes" category="movies" items={shelf.movies} isEditing={false} />
          <ShelfSection title="Livros" category="books" items={shelf.books} isEditing={false} />
          <ShelfSection title="Músicas" category="music" items={shelf.music} isEditing={false} />
        </div>
      </main>

      <footer className="mt-20 py-8 text-center text-gray-400 text-sm">
        Curadoria feita com <span className="text-brand-500">7list</span>
      </footer>
    </div>
  );
};
