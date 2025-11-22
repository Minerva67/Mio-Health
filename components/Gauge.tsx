import React from 'react';

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  subLabel?: string;
  type: 'GI' | 'GL';
  lang: 'en' | 'zh';
}

const Gauge: React.FC<GaugeProps> = ({ value, max, label, subLabel, type, lang }) => {
  const percent = Math.min((value / max) * 100, 100);
  
  let color = 'bg-emerald-400';
  if (type === 'GI') {
    if (value > 55) color = 'bg-amber-400';
    if (value > 70) color = 'bg-red-400';
  } else {
    if (value > 10) color = 'bg-amber-400';
    if (value > 20) color = 'bg-red-400';
  }
  
  const textColor = color.replace('bg-', 'text-');
  
  const t = {
    low: lang === 'zh' ? "低" : "Low",
    med: lang === 'zh' ? "中" : "Med",
    high: lang === 'zh' ? "高" : "High"
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1 uppercase tracking-wide px-1">
        <span>{t.low}</span>
        <span>{t.med}</span>
        <span>{t.high}</span>
      </div>
      <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative shadow-inner">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`} 
          style={{ width: `${percent}%` }}
        ></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-white left-[33%] opacity-50"></div>
        <div className="absolute top-0 bottom-0 w-0.5 bg-white left-[66%] opacity-50"></div>
      </div>
      <div className="flex justify-between items-center mt-1 px-1">
        <div>
           <span className="text-xs font-bold text-gray-600">{label}</span>
           {subLabel && <span className="text-[10px] text-gray-400 ml-1">({subLabel})</span>}
        </div>
        <span className={`text-xs font-bold ${textColor}`}>{Math.round(value)}</span>
      </div>
    </div>
  );
};

export default Gauge;