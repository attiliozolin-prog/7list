import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Login } from './components/Login';
import { ShelfData, Category, Item, SearchResult, UserProfile } from './types';
import { ShelfSection } from './components/ShelfSection';
import { SearchModal } from './components/SearchModal';
import { AnalysisModal } from './components/AnalysisModal';
import { ProfileHeader } from './components/ProfileHeader';
import { generateAffiliateLink, generateCulturalPersona } from './services/apiService';
import { Edit2, Eye, Share2, Sparkles, LogOut, Loader2 } from 'lucide-react';

const INITIAL_SHELF: ShelfData = {
  movies: Array(7).fill(null),
  books: Array(7).fill(null),
  music: Array(7).fill(null),
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // App Data States
  const [shelf, setShelf] = useState<ShelfData>(INITIAL_SHELF);
  const [profile, setProfile] = useState<UserProfile>({
    name: '', handle: '', bio: '', avatarUrl: '', instagramUrl: '', spotifyUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Search & Modals
  const [searchState, setSearchState] = useState<{isOpen: boolean; category: Category; slotIndex: number}>({
    isOpen: false, category: 'movies', slotIndex: -1
  });
  const [analysisState, setAnalysisState] = useState<{isOpen: boolean; isLoading: boolean; text: string}>({
    isOpen: false, isLoading: false, text: ''
  });

  // 1. Check Auth Session on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
      if (session) loadUserData(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserData(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load User Data from Supabase
  const loadUserData = async (userId: string) => {
    setDataLoading(true);
    
    // Load Profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) {
      setProfile({
        name: profileData.full_name || 'Sem Nome',
        handle: profileData.username || '@usuario',
        bio: profileData.bio || '',
        avatarUrl: profileData.avatar_url || 'https://via.placeholder.com/150',
        instagramUrl: profileData.instagram_url,
        spotifyUrl: profileData.spotify_url
      });
    }

    // Load Shelf
    const { data: shelfData } = await supabase
      .from('shelves')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (shelfData) {
      // O banco retorna JSON, mas precisamos garantir que venha como array de 7 itens
      // Se vier null ou array incompleto, completamos com null
      const sanitize = (arr: any[]) => {
        const clean = Array.isArray(arr) ? arr : [];
        return [...clean, ...Array(7).fill(null)].slice(0, 7);
      };

      setShelf({
        movies: sanitize(shelfData.movies),
        books: sanitize(shelfData.books),
        music: sanitize(shelfData.music)
      });
    }
    setDataLoading(false);
  };

  // 3. Save Functions (Auto-save)
  const saveShelf = async (newShelf: ShelfData) => {
    if (!session) return;
    setShelf(newShelf); // Optimistic update
    
    await supabase
      .from('shelves')
      .update({
        movies: newShelf.movies,
        books: newShelf.books,
        music: newShelf.music,
        updated_at: new Date()
      })
      .eq('user_id', session.user.id);
  };

  const saveProfile = async (updates: Partial<UserProfile>) => {
    if (!session) return;
    setProfile(prev => ({ ...prev, ...updates })); // Optimistic

    // Map frontend types to DB columns
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.bio) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.instagramUrl) dbUpdates.instagram_url = updates.instagramUrl;
    if (updates.spotifyUrl) dbUpdates.spotify_url = updates.spotifyUrl;

    await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', session.user.id);
  };

  // --- Handlers ---
  const handleSelectItem = (result: SearchResult) => {
    const { category, slotIndex } = searchState;
    const newItem: Item = {
      id: Math.random().toString(36).substr(2, 9),
      title: result.title,
      subtitle: result.subtitle,
      imageUrl: result.imageUrl,
      category: category,
      affiliateLink: generateAffiliateLink(result, category),
    };

    const newShelf = { ...shelf };
    newShelf[category][slotIndex] = newItem;
    saveShelf(newShelf);
    setSearchState(prev => ({ ...prev, isOpen: false }));
  };

  const handleRemoveItem = (category: Category, index: number) => {
    const newShelf = { ...shelf };
    newShelf[category][index] = null;
    saveShelf(newShelf);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShelf(INITIAL_SHELF);
    setProfile({ name: '', handle: '', bio: '', avatarUrl: '' });
  };

  // --- Renders ---

  if (loadingSession) {
    return <div className="h-screen flex items-center justify-center bg-brand-50"><Loader2 className="animate-spin text-brand-500" size={48} /></div>;
  }

  if (!session) {
    return <Login />;
  }

  const hasItems = Object.values(shelf).some(list => list.some(item => item !== null));

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-brand-50/30">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="font-serif font-bold text-3xl text-brand-500 tracking-tight">7list</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {hasItems && (
              <button 
                onClick={async () => {
                   setAnalysisState({ isOpen: true, isLoading: true, text: '' });
                   const text = await generateCulturalPersona(shelf);
                   setAnalysisState({ isOpen: true, isLoading: false, text });
                }}
                className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-full text-xs md:text-sm font-bold shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Sparkles className="text-amber-200" size={16} />
                <span className="hidden sm:inline">Gerar Análise</span>
              </button>
            )}

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                ${isEditing 
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}
              `}
            >
              {isEditing ? <Eye size={16} /> : <Edit2 size={16} />}
              <span className="hidden md:inline">{isEditing ? 'Visualizar' : 'Editar'}</span>
            </button>
            
            <button 
                onClick={handleSignOut}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Sair"
            >
                 <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero / User Profile */}
      <main className="flex-1 pb-20">
        {dataLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-brand-300" /></div>
        ) : (
            <>
                <div className="container mx-auto px-4 max-w-4xl">
                  <ProfileHeader 
                    profile={profile} 
                    isEditing={isEditing}
                    onProfileUpdate={saveProfile}
                  />
                </div>

                <div className="space-y-4">
                  <ShelfSection 
                    title="Filmes" category="movies" items={shelf.movies} isEditing={isEditing}
                    onSlotClick={(idx) => setSearchState({isOpen: true, category: 'movies', slotIndex: idx})}
                    onRemoveItem={(idx) => handleRemoveItem('movies', idx)}
                  />
                  <ShelfSection 
                    title="Livros" category="books" items={shelf.books} isEditing={isEditing}
                    onSlotClick={(idx) => setSearchState({isOpen: true, category: 'books', slotIndex: idx})}
                    onRemoveItem={(idx) => handleRemoveItem('books', idx)}
                  />
                  <ShelfSection 
                    title="Músicas" category="music" items={shelf.music} isEditing={isEditing}
                    onSlotClick={(idx) => setSearchState({isOpen: true, category: 'music', slotIndex: idx})}
                    onRemoveItem={(idx) => handleRemoveItem('music', idx)}
                  />
                </div>
            </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif font-bold text-2xl text-brand-500 mb-4">7list</p>
          <div className="text-xs text-gray-300">© {new Date().getFullYear()} 7list MVP.</div>
        </div>
      </footer>

      {/* Modals */}
      <SearchModal 
        isOpen={searchState.isOpen} category={searchState.category}
        onClose={() => setSearchState(prev => ({...prev, isOpen: false}))}
        onSelect={handleSelectItem}
      />
      <AnalysisModal
        isOpen={analysisState.isOpen} isLoading={analysisState.isLoading} analysis={analysisState.text}
        onClose={() => setAnalysisState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default App;
