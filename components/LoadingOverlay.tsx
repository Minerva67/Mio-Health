import React from 'react';
import { AnimatedCatLogo } from './AnimatedCatLogo';

interface LoadingOverlayProps {
  previewUrl: string | null;
  loadingMsg: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ previewUrl, loadingMsg }) => {
  if (!previewUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden">
       {/* Background Image (Blurred) */}
       <div 
         className="absolute inset-0 opacity-60 blur-xl scale-110"
         style={{ backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
       ></div>
       
       {/* Dark Overlay */}
       <div className="absolute inset-0 bg-black/40"></div>

       {/* Scanning Line Animation */}
       <div className="absolute inset-0 w-full h-1 bg-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.8)] animate-scan z-10"></div>

       {/* Content */}
       <div className="relative z-20 flex flex-col items-center px-6 text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-8 border border-white/20 animate-pulse-slow">
             <AnimatedCatLogo size={60} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight mb-2">{loadingMsg}</h3>
          <p className="text-white/60 text-sm">Mio Health AI</p>
       </div>
    </div>
  );
};

export default LoadingOverlay;