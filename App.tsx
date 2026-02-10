import React, { useState } from 'react';
import { ShelfData, Category, Item, SearchResult, UserProfile } from './types';
import { ShelfSection } from './components/ShelfSection';
import { SearchModal } from './components/SearchModal';
import { AnalysisModal } from './components/AnalysisModal';
import { ProfileHeader } from './components/ProfileHeader';
import { generateAffiliateLink, generateCulturalPersona } from './services/apiService';
import { Edit2, Eye, Share2, Sparkles } from 'lucide-react';

const INITIAL_SHELF: ShelfData = {
  movies: Array(7).fill(null),
  books: Array(7).fill(null),
  music: Array(7).fill(null),
};

// Initial mock data to show an example if the shelf is empty on first load
// In a real app, this would come from a backend or local storage
const EXAMPLE_DATA: Partial<ShelfData> = {
  movies: [
    { id: '1', title: 'A Chegada', subtitle: 'Denis Villeneuve', imageUrl: 'https://picsum.photos/seed/Arrival/300/450', affiliateLink: 'https://amazon.com', category: 'movies' },
    { id: '2', title: 'Central do Brasil', subtitle: 'Walter Salles', imageUrl: 'https://picsum.photos/seed/Central/300/450', affiliateLink: 'https://amazon.com', category: 'movies' },
    null, null, null, null, null
  ]
};

const MOCK_PROFILE: UserProfile = {
  name: "Sofia Costa",
  handle: "@sofiac",
  bio: "Cinéfila, leitora de ficção científica e viciada em MPB. Buscando a beleza no caos do cotidiano.",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
  instagramUrl: "https://instagram.com",
  spotifyUrl: "https://spotify.com"
};

const App: React.FC = () => {
  const [shelf, setShelf] = useState<ShelfData>({ ...INITIAL_SHELF, ...EXAMPLE_DATA });
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(MOCK_PROFILE);
  
  // Search State
  const [searchState, setSearchState] = useState<{
    isOpen: boolean;
    category: Category;
    slotIndex: number;
  }>({
    isOpen: false,
    category: 'movies',
    slotIndex: -1,
  });

  // Analysis State
  const [analysisState, setAnalysisState] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    text: string;
  }>({
    isOpen: false,
    isLoading: false,
    text: '',
  });

  const handleOpenSearch = (category: Category, index: number) => {
    setSearchState({ isOpen: true, category, slotIndex: index });
  };

  const handleCloseSearch = () => {
    setSearchState(prev => ({ ...prev, isOpen: false }));
  };

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

    setShelf(prev => {
      const newList = [...prev[category]];
      newList[slotIndex] = newItem;
      return { ...prev, [category]: newList };
    });

    handleCloseSearch();
  };

  const handleRemoveItem = (category: Category, index: number) => {
    setShelf(prev => {
      const newList = [...prev[category]];
      newList[index] = null;
      return { ...prev, [category]: newList };
    });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleGenerateAnalysis = async () => {
    setAnalysisState({ isOpen: true, isLoading: true, text: '' });
    const result = await generateCulturalPersona(shelf);
    setAnalysisState({ isOpen: true, isLoading: false, text: result });
  };

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
                onClick={handleGenerateAnalysis}
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
              <span className="hidden md:inline">{isEditing ? 'Visualizar' : 'Editar Estante'}</span>
            </button>
            
            {!isEditing && (
               <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                 <Share2 size={20} />
               </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero / User Profile */}
      <main className="flex-1 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <ProfileHeader 
            profile={profile} 
            isEditing={isEditing}
            onProfileUpdate={handleUpdateProfile}
          />
        </div>

        {/* Shelves */}
        <div className="space-y-4">
          <ShelfSection 
            title="Filmes" 
            category="movies" 
            items={shelf.movies} 
            isEditing={isEditing}
            onSlotClick={(idx) => handleOpenSearch('movies', idx)}
            onRemoveItem={(idx) => handleRemoveItem('movies', idx)}
          />
          
          <ShelfSection 
            title="Livros" 
            category="books" 
            items={shelf.books} 
            isEditing={isEditing}
            onSlotClick={(idx) => handleOpenSearch('books', idx)}
            onRemoveItem={(idx) => handleRemoveItem('books', idx)}
          />

          <ShelfSection 
            title="Músicas" 
            category="music" 
            items={shelf.music} 
            isEditing={isEditing}
            onSlotClick={(idx) => handleOpenSearch('music', idx)}
            onRemoveItem={(idx) => handleRemoveItem('music', idx)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif font-bold text-2xl text-brand-500 mb-4">7list</p>
          <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">
            O gosto cultural como identidade.
          </p>
          <div className="text-xs text-gray-300">
            &copy; {new Date().getFullYear()} 7list MVP.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SearchModal 
        isOpen={searchState.isOpen}
        category={searchState.category}
        onClose={handleCloseSearch}
        onSelect={handleSelectItem}
      />

      <AnalysisModal
        isOpen={analysisState.isOpen}
        isLoading={analysisState.isLoading}
        analysis={analysisState.text}
        onClose={() => setAnalysisState(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
};

export default App;
