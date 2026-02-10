import React from 'react';
import { Plus, X, ExternalLink } from 'lucide-react';
import { Item } from '../types';

interface SlotCardProps {
  item: Item | null;
  index: number;
  isEditing: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({ item, index, isEditing, onAdd, onRemove }) => {
  const handleClick = () => {
    if (isEditing) {
      if (!item) onAdd();
    } else {
      if (item) {
        window.open(item.affiliateLink, '_blank');
      }
    }
  };

  if (!item) {
    return (
      <button
        onClick={handleClick}
        disabled={!isEditing}
        className={`
          relative flex-shrink-0 w-28 h-40 md:w-32 md:h-48 rounded-lg border-2 border-dashed
          flex flex-col items-center justify-center transition-all duration-200
          ${isEditing 
            ? 'border-brand-300 bg-brand-50 hover:bg-brand-100 cursor-pointer text-brand-400 hover:text-brand-600' 
            : 'border-gray-200 bg-gray-50 opacity-50 cursor-default text-gray-300'}
        `}
      >
        <span className="absolute top-2 left-2 text-xs font-bold opacity-50">{index + 1}</span>
        {isEditing && <Plus size={32} />}
        {!isEditing && <div className="w-8 h-8 rounded-full bg-gray-200" />}
      </button>
    );
  }

  return (
    <div className="relative group flex-shrink-0 w-28 md:w-32">
      <div 
        onClick={handleClick}
        className={`
          relative w-full h-40 md:h-48 rounded-lg overflow-hidden shadow-md transition-transform duration-200
          bg-gray-800
          ${!isEditing ? 'cursor-pointer hover:scale-105' : ''}
        `}
      >
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
        />
        
        {/* Number Badge */}
        <div className="absolute top-0 left-0 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg shadow-sm">
          {index + 1}
        </div>

        {/* Hover Overlay for View Mode */}
        {!isEditing && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
             <ExternalLink className="text-white drop-shadow-md" size={24} />
          </div>
        )}
      </div>

      <div className="mt-2 text-left">
        <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
      </div>

      {isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-100 hover:bg-red-50 z-10"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
