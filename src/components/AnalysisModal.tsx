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
          <p className="text-sm text-gray-500 mb-8">
            O que sua curadoria diz sobre você.
          </p>

          <div className="w-full bg-brand-50/30 rounded-2xl p-8 mb-8 border border-brand-100 relative min-h-[140px] flex items-center justify-center shadow-sm">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                <span className="text-sm text-brand-500 font-bold animate-pulse tracking-wide">LENDO AS ESTRELAS...</span>
              </div>
            ) : (
              <div className="relative w-full">
                 {/* Aspas Decorativas Gigantes */}
                <span className="absolute -top-6 -left-2 text-6xl text-brand-300 font-serif opacity-40 select-none leading-none">“</span>
                
                <p className="font-sans text-xl font-medium text-gray-800 leading-relaxed select-text px-2 relative z-10">
                  {analysis}
                </p>
                
                <span className="absolute -bottom-8 -right-2 text-6xl text-brand-300 font-serif opacity-40 select-none leading-none">”</span>
              </div>
            )}
          </div>

          {!isLoading && (
            <div className="flex gap-3 w-full">
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg text-sm uppercase tracking-wider"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                {copied ? 'Copiado!' : 'Compartilhar nos Stories'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
