
import React from 'react';
import { DailyLog, Language } from '../types';
import { Trash2, X, Calendar } from 'lucide-react';

interface Props {
  log: DailyLog;
  onClose: () => void;
  onDelete: (id: string) => void;
  lang: Language;
}

const DailyHistory: React.FC<Props> = ({ log, onClose, onDelete, lang }) => {
  const t = {
    en: {
      title: "Today's History",
      empty: "No meals logged yet today.",
      total: "Total Intake",
      delete: "Delete",
      calories: "kcal"
    },
    zh: {
      title: "今日饮食记录",
      empty: "今天还没有记录哦。",
      total: "总摄入",
      delete: "删除",
      calories: "千卡"
    }
  };
  const text = t[lang];

  const totalCal = log.entries.reduce((acc, curr) => acc + curr.calories, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md h-[80vh] sm:h-auto sm:rounded-2xl rounded-t-2xl p-6 flex flex-col shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <Calendar size={16} />
             </div>
             <h2 className="text-xl font-bold text-gray-900">{text.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {log.entries.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>{text.empty}</p>
            </div>
          ) : (
            log.entries.map((entry) => (
              <div key={entry.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center group">
                 <div>
                    <h3 className="font-bold text-gray-900">{entry.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {entry.items.join(', ')}
                    </p>
                    <div className="flex gap-2 mt-2">
                       <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{entry.calories} {text.calories}</span>
                       <span className="text-xs text-gray-400">P: {entry.protein}g • C: {entry.carbs}g • F: {entry.fat}g</span>
                    </div>
                 </div>
                 <button 
                   onClick={() => onDelete(entry.id)}
                   className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                   aria-label={text.delete}
                 >
                   <Trash2 size={18} />
                 </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
             <span className="text-gray-500 font-medium">{text.total}</span>
             <span className="text-2xl font-bold text-gray-900">{totalCal} <span className="text-sm text-gray-500 font-normal">{text.calories}</span></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DailyHistory;
