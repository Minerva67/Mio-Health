import React from 'react';
import { Globe, User, ChevronLeft } from 'lucide-react';
import { AnimatedCatLogo } from './AnimatedCatLogo';
import { AppStatus, Language } from '../types';

interface HeaderProps {
  status: AppStatus;
  lang: Language;
  onReset: () => void;
  onToggleLang: () => void;
  onOpenUserHub: () => void;
  isOverLimit: boolean;
}

const Header: React.FC<HeaderProps> = ({ status, lang, onReset, onToggleLang, onOpenUserHub, isOverLimit }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none w-full">
      <div className="w-full max-w-md bg-[#FDFBF7]/95 backdrop-blur-md border-b border-slate-100/50 px-4 py-3 flex justify-between items-center shadow-sm pointer-events-auto">
        <div className="flex items-center gap-2">
          {status === 'success' ? (
             <button 
                onClick={onReset}
                className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors active:scale-95"
                aria-label="Back"
             >
                <ChevronLeft size={24} strokeWidth={2.5} />
             </button>
          ) : (
             <div className="flex items-center justify-center">
               <AnimatedCatLogo />
             </div>
          )}
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Mio Health</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleLang}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
          >
            <Globe size={14} />
            {lang === 'zh' ? 'CN' : 'EN'}
          </button>

          <button 
            onClick={onOpenUserHub}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors relative border border-slate-200 shadow-sm"
          >
            <User size={18} />
            {isOverLimit && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;