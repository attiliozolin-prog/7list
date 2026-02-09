import React from 'react';
import { Item, Category } from '../types';
import { SlotCard } from './SlotCard';
import { Film, Book, Music } from 'lucide-react';

interface ShelfSectionProps {
  title: string;
  category: Category;
  items: (Item | null)[];
  isEditing: boolean;
  onSlotClick: (index: number) => void;
  onRemoveItem: (index: number) => void;
}

export const ShelfSection: React.FC<ShelfSectionProps> = ({ 
  title, 
  category, 
  items, 
  isEditing, 
  onSlotClick, 
  onRemoveItem 
}) => {
  
  const getIcon = () => {
    switch (category) {
      case 'movies': return <Film className="w-5 h-5 md:w-6 md:h-6" />;
      case 'books': return <Book className="w-5 h-5 md:w-6 md:h-6" />;
      case 'music': return <Music className="w-5 h-5 md:w-6 md:h-6" />;
    }
  };

  const getColor = () => {
    switch (category) {
      case 'movies': return 'text-rose-500';
      case 'books': return 'text-amber-600';
      case 'music': return 'text-indigo-500';
    }
  };

  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
      {/* Centered Header */}
      <div className="container mx-auto px-4 mb-6 flex flex-col items-center justify-center">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg bg-white shadow-sm ${getColor()}`}>
            {getIcon()}
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-gray-800">{title}</h2>
        </div>
        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {items.filter(Boolean).length}/7 selecionados
        </span>
      </div>
      
      {/* Centered Scrollable List */}
      <div className="w-full overflow-x-auto hide-scrollbar pb-6">
        <div className="flex gap-4 md:gap-6 w-max mx-auto px-4">
          {items.map((item, index) => (
            <SlotCard
              key={`${category}-${index}`}
              index={index}
              item={item}
              isEditing={isEditing}
              onAdd={() => onSlotClick(index)}
              onRemove={() => onRemoveItem(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};