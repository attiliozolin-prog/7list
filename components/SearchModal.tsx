import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Music, Book, Film, Plus } from 'lucide-react';
import { Category, SearchResult } from '../types';
import { searchItems } from '../services/apiService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onSelect: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, category, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        const data = await searchItems(query, category);
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 600); // Debounce to save API calls

    return () => clearTimeout(delayDebounceFn);
  }, [query, category]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (category) {
      case 'movies': return <Film className="text-brand-500" />;
      case 'books': return <Book className="text-brand-500" />;
      case 'music': return <Music className="text-brand-500" />;
    }
  };

  const getPlaceholder = () => {
    switch (category) {
      case 'movies': return "Busque um filme (ex: Interestelar)";
      case 'books': return "Busque um livro (ex: Torto Arado)";
      case 'music': return "Busque uma música (ex: Construção)";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-brand-50">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="font-serif font-bold text-lg text-brand-900 capitalize">
              Adicionar {category === 'music' ? 'Música' : category === 'movies' ? 'Filme' : 'Livro'}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Input */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all text-gray-800 placeholder-gray-400"
              placeholder={getPlaceholder()}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-sm">Buscando na base de dados...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(item)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-brand-50 rounded-lg transition-colors text-left group"
                >
                  <div className="w-12 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0 shadow-sm">
                     {item.imageUrl && <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate group-hover:text-brand-700">{item.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{item.subtitle}</p>
                  </div>
                  <Plus className="text-gray-300 group-hover:text-brand-500" size={20} />
                </button>
              ))}
            </div>
          ) : query.length > 2 ? (
            <div className="text-center py-12 text-gray-400">
              <p>Nenhum resultado encontrado.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">Digite para buscar...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
