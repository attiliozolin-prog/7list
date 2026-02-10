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
      if (item && item.affiliateLink) {
        window.open(item.affiliateLink, '_blank');
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full group">
      
      {/* --- ANDAR DE CIMA: ÁREA DA IMAGEM / BOX PONTILHADO --- 
          Usamos 'aspect-[2/3]' para garantir formato de pôster.
          O 'border-dashed' só aparece aqui se não tiver item.
      */}
      <div 
        onClick={handleClick}
        className={`
          relative w-full aspect-[2/3] rounded-xl overflow-hidden transition-all duration-300
          ${!item 
            ? `border-2 border-dashed flex flex-col items-center justify-center
               ${isEditing 
                 ? 'border-brand-300 bg-brand-50 hover:bg-brand-100 cursor-pointer text-brand-400' 
                 : 'border-gray-200 bg-gray-50 opacity-50 cursor-default text-gray-300'}`
            : 'shadow-md bg-gray-800 cursor-pointer hover:scale-105'
          }
        `}
      >
        {item ? (
          /* CASO 1: TEM ITEM (FOTO) */
          <>
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-100 opacity-90"
            />
            
            {/* Badge do Número */}
            <div className="absolute top-0 left-0 bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg shadow-sm z-10">
              {index + 1}
            </div>

            {/* Hover Link Externo (Modo Visualização) */}
            {!isEditing && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                 <ExternalLink className="text-white drop-shadow-md" size={24} />
              </div>
            )}

            {/* Botão Remover (X) - Mantido igual ao seu arquivo */}
            {isEditing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 shadow-md border border-gray-100 hover:bg-red-50 z-20"
              >
                <X size={14} />
              </button>
            )}
          </>
        ) : (
          /* CASO 2: VAZIO (BOX PONTILHADO) */
          <>
            <span className="absolute top-2 left-2 text-xs font-bold opacity-50">{index + 1}</span>
            {isEditing ? <Plus size={32} /> : <div className="w-8 h-8 rounded-full bg-gray-200" />}
          </>
        )}
      </div>

      {/* --- ANDAR DE BAIXO: ÁREA DO TEXTO --- 
          Fica fora do box da imagem/pontilhado.
          Se não tiver item, fica invisível mas ocupa espaço para alinhar a grade.
      */}
      <div className="min-h-[2.5rem] px-1 text-left">
        {item ? (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1" title={item.title}>
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {item.subtitle}
            </p>
          </div>
        ) : (
           /* Espaço vazio para manter alinhamento */
           <div aria-hidden="true" className="w-full h-full" />
        )}
      </div>
      
    </div>
  );
};
