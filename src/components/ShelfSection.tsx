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
    <section className="py-8 border-b border-gray-100 last:border-0 w-full">
      {/* Cabeçalho */}
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

      {/* Container Principal */}
      <div className="w-full md:container md:mx-auto md:px-4 pb-4">

        {/* LÓGICA DO LAYOUT:
           MOBILE: flex + overflow (Rolagem horizontal, itens fixos grandes)
           TABLET: grid 3 colunas (cards grandes)
           DESKTOP: grid 4 colunas (cards grandes e proporcionais)
           Todos os 7 itens visíveis sem scroll, mas com cards maiores
        */}
        <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 overflow-x-auto md:overflow-visible px-4 md:px-0 hide-scrollbar snap-x md:max-w-4xl lg:max-w-5xl md:mx-auto">

          {items.map((item, index) => (
            /* O TRUQUE DO CSS (!w-full):
               1. min-w-[140px]: No celular, força largura mínima para ativar a rolagem.
               2. md:min-w-0: No desktop, permite encolher para caber na grade.
               3. [&>*]:!w-full: "Manda" no componente filho (SlotCard). Diz: "Ocupe 100% do espaço que eu der, nem mais, nem menos."
            */
            <div
              key={`${category}-${index}`}
              className="min-w-[140px] md:min-w-0 md:w-full snap-center [&>*]:!w-full [&>*]:!h-full"
            >
              <SlotCard
                index={index}
                item={item}
                isEditing={isEditing}
                onAdd={() => onSlotClick(index)}
                onRemove={() => onRemoveItem(index)}
              />
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};
