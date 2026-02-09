import React, { useState } from 'react';
import { ShelfData, Category, Item, SearchResult } from './types';
import { ShelfSection } from './components/ShelfSection';
import { SearchModal } from './components/SearchModal';
import { AnalysisModal } from './components/AnalysisModal';
import { generateAffiliateLink, generateCulturalPersona } from './services/geminiService';
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

const App: React.FC = () => {
  const [shelf, setShelf] = useState<ShelfData>({ ...INITIAL_SHELF, ...EXAMPLE_DATA });
  const [isEditing, setIsEditing] = useState(false);
  
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

      {/* Hero / Intro */}
      <main className="flex-1 pb-20">
        <div className="container mx-auto px-4 py-12 md:py-16 text-center max-w-2xl">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            O gosto cultural como <span className="text-brand-500">identidade</span>.
          </h1>
          <p className="text-lg md:text-xl text-gray-500 mb-8 leading-relaxed">
            Num mundo de excessos, o limite cria sentido. <br className="hidden md:block"/>
            Aqui estão os meus 7 filmes, livros e músicas definitivos.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            {!isEditing && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Estante Verificada
              </div>
            )}
            
            {hasItems && (
              <button 
                onClick={handleGenerateAnalysis}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-rose-500 text-white rounded-full font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="animate-pulse group-hover:rotate-12 transition-transform" size={18} />
                Gerar minha análise 7list
              </button>
            )}
          </div>
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
            Uma ideia simples, elegante e fácil de ser aplicada para curadoria pessoal em larga escala.
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