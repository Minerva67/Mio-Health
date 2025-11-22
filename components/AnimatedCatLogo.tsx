import React from 'react';

// --- Animated Stick Figure Cat Component (V2: Cuter, Less Mouse-like) ---
export const AnimatedCatLogo = ({ size = 40, className = "text-slate-900" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={`${className} overflow-visible`}>
    <g className="animate-bounce-subtle">
      {/* Head - Wider, softer trapezoid/oval shape */}
      <path 
        d="M20,40 Q15,65 25,80 Q50,95 75,80 Q85,65 80,40 Q85,40 80,40" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
      
      {/* Ears - Triangular but soft */}
      <path d="M22,42 L15,20 Q25,25 35,35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M78,42 L85,20 Q75,25 65,35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Top of Head Connect */}
      <path d="M35,35 Q50,32 65,35" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Eyes (Blinking Animation) */}
      <g className="animate-blink">
        <circle cx="35" cy="55" r="4" fill="currentColor" />
        <circle cx="65" cy="55" r="4" fill="currentColor" />
      </g>
      
      {/* Nose & Mouth - Cute 'W' shape */}
      <path d="M50,65 L50,68 M42,72 Q50,78 58,72" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Whiskers (Wiggle Animation) */}
      <g className="animate-wiggle">
        <path d="M15,58 L5,55" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M15,66 L5,68" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M85,58 L95,55" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M85,66 L95,68" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
    
    <style>{`
      @keyframes blink {
        0%, 90%, 100% { transform: scaleY(1); }
        95% { transform: scaleY(0.1); }
      }
      @keyframes wiggle {
        0%, 100% { transform: rotate(-2deg); transform-origin: center; }
        50% { transform: rotate(2deg); transform-origin: center; }
      }
      @keyframes bounce-subtle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      .animate-blink { animation: blink 4s infinite; transform-origin: center; }
      .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
      .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
    `}</style>
  </svg>
);