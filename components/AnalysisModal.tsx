import React from 'react';
import { X, Sparkles, Copy, Check, Share2 } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  isLoading: boolean;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysis, isLoading }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Minha Vibe Cultural 7list:\n\n${analysis}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Minha Identidade Cultural - 7list',
      text: `Minha Vibe Cultural 7list:\n\n${analysis}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Se o usuário cancelar ou o browser não suportar, fazemos o fallback para copiar
        if ((err as any).name !== 'AbortError') {
            handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col relative border border-brand-100">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-brand-50 to-white -z-10" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-200 rounded-full blur-3xl opacity-50" />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-400 to-rose-400 flex items-center justify-center text-white shadow-lg mb-6 animate-bounce-slow">
            <Sparkles size={32} />
          </div>

          <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">
            Sua Identidade Cultural
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            O que sua curadoria diz sobre você, segundo a IA.
          </p>

          <div className="w-full bg-brand-50/50 rounded-xl p-6 mb-6 border border-brand-100 relative min-h-[120px] flex items-center justify-center shadow-inner">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-brand-400 font-medium animate-pulse">Consultando os astros da cultura...</span>
              </div>
            ) : (
              <p className="font-serif text-lg text-gray-800 italic leading-relaxed select-text">
                "{analysis}"
              </p>
            )}
          </div>

          {!isLoading && (
            <div className="flex gap-3 w-full">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                {copied ? 'Copiado para área de transferência!' : 'Compartilhar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};