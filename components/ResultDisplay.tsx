import React, { useState } from 'react';
import { AnalysisResult, FoodItem, Language, UserProfile, DailyLog, MealEntry } from '../types';
import { CheckCircle, Plus, Edit3, Save, Info, Camera, Zap } from 'lucide-react';
import { AnimatedCatLogo } from './AnimatedCatLogo';

interface ResultDisplayProps {
  result: AnalysisResult;
  userProfile: UserProfile | null;
  dailyLog: DailyLog;
  onReset: () => void;
  onAddToLog: (entry: MealEntry) => void;
  lang: Language;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, userProfile, dailyLog, onReset, onAddToLog, lang 
}) => {
  
  // --- Editing State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editableDetails, setEditableDetails] = useState<FoodItem[]>(
    result.is_food ? JSON.parse(JSON.stringify(result.food_details)) : []
  );
  // We initialize summary with the AI result.
  const [summary, setSummary] = useState(result.analysis_summary);
  const [added, setAdded] = useState(false);

  // Helper to recalculate totals based on current items
  const recalculateSummary = (items: FoodItem[]) => {
    const newTotalCal = items.reduce((acc, item) => acc + (Number(item.calories_approx) || 0), 0);
    const newTotalCarbs = items.reduce((acc, item) => acc + (Number(item.carbs_g) || 0), 0);
    const newTotalProtein = items.reduce((acc, item) => acc + (Number(item.protein_g) || 0), 0);
    const newTotalFat = items.reduce((acc, item) => acc + (Number(item.fat_g) || 0), 0);

    setSummary(prev => ({
        ...prev,
        total_calories: Math.round(newTotalCal),
        total_carbs: Math.round(newTotalCarbs),
        total_protein: Math.round(newTotalProtein),
        total_fat: Math.round(newTotalFat)
    }));
  };

  const handleItemChange = (index: number, field: keyof FoodItem, value: string | number) => {
     const updated = [...editableDetails];
     // @ts-ignore
     updated[index][field] = value;
     
     // Auto-update GL if GI or Carbs change
     if (field === 'gi_value' || field === 'carbs_g') {
         const gi = Number(updated[index].gi_value) || 0;
         const carbs = Number(updated[index].carbs_g) || 0;
         updated[index].glycemic_load = Math.round((gi * carbs) / 100);
     }
     setEditableDetails(updated);
     
     // Only recalculate total summary if user changes a numeric macro field
     if (['calories_approx', 'carbs_g', 'protein_g', 'fat_g'].includes(field)) {
        recalculateSummary(updated);
     }
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  // --- Localization ---
  const t = {
    en: {
      score: "Health Score",
      dailyLimit: "Daily Limit",
      remaining: "Remaining",
      today: "Today's Intake",
      addToLog: "Feed Mio",
      added: "Yum! Added!",
      gi: "Glycemic Index (GI)",
      gl: "Glycemic Load (GL)",
      glDesc: "Load = GI × Carbs / 100",
      low: "Low",
      med: "Med",
      high: "High",
      advice: "Mio's Advice",
      scanNext: "Snap Next Meal",
      macros: "Nutrients",
      carbs: "Carbs",
      protein: "Protein",
      fat: "Fat",
      glExplanation: "GL measures how much a food raises blood glucose levels. Low GL < 10, High GL > 20.",
      totalCal: "Total Energy",
      edit: "Edit",
      save: "Save",
      whatIsGi: "What is GI?",
      giExplanationText: "GI measures speed. GL measures impact. For weight loss, watch your GL!",
      notFoodTitle: "Mio is Confused",
      notFoodDesc: "This doesn't look like food to me. Can you try another photo?",
      retry: "Try Again",
      progressLabel: "Daily Budget Used",
      reportTitle: "Mio's Report"
    },
    zh: {
      score: "健康评分",
      dailyLimit: "每日限额",
      remaining: "今日剩余",
      today: "今日已摄入",
      addToLog: "喂给 Mio",
      added: "好吃！已记录",
      gi: "升糖指数 (GI)",
      gl: "升糖负荷 (GL)",
      glDesc: "负荷 = GI × 碳水 / 100",
      low: "低",
      med: "中",
      high: "高",
      advice: "Mio 的建议",
      scanNext: "拍下一餐",
      macros: "营养成分",
      carbs: "碳水",
      protein: "蛋白质",
      fat: "脂肪",
      glExplanation: "GL 反映了食物对血糖的实际影响幅度。低 GL < 10, 高 GL > 20。",
      totalCal: "总能量",
      edit: "修改",
      save: "保存",
      whatIsGi: "什么是 GI?",
      giExplanationText: "GI 是速度，GL 是总量。想要控糖减脂，重点看 GL 哦！",
      notFoodTitle: "Mio 没看懂",
      notFoodDesc: "这看起来不像食物耶？请拍一张清晰的食物照片给我。",
      retry: "重新拍摄",
      progressLabel: "今日额度已用",
      reportTitle: "Mio 的分析报告"
    }
  };
  const text = t[lang];

  // --- Non-Food Handling (Updated to be COLORFUL as per user request) ---
  if (result.is_food === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        {/* Colorful/Orange Theme */}
        <div className="relative mb-8">
           <div className="w-40 h-40 bg-orange-50 rounded-full flex items-center justify-center shadow-inner mx-auto">
             <AnimatedCatLogo size={80} className="text-orange-500" />
           </div>
           {/* Question Mark Bubble */}
           <div className="absolute top-0 right-2 bg-white text-orange-400 w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold shadow-md border border-orange-100 animate-bounce">
              ?
           </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">{text.notFoodTitle}</h2>
        <p className="text-slate-500 mb-8 text-sm max-w-[240px] text-center leading-relaxed">{text.notFoodDesc}</p>
        <button 
          onClick={onReset}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-slate-300 active:scale-95 transition-all flex items-center gap-2"
        >
          <Camera size={20} />
          {text.retry}
        </button>
      </div>
    );
  }

  // --- Logic ---
  const consumedCal = dailyLog.entries.reduce((acc, e) => acc + e.calories, 0);
  const tdee = userProfile?.tdee || 2000;
  
  const remaining = Math.max(0, tdee - consumedCal);
  const progressPercent = Math.min((consumedCal / tdee) * 100, 100);
  
  const handleAdd = () => {
    const entry: MealEntry = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        name: summary.meal_type,
        calories: summary.total_calories,
        carbs: summary.total_carbs,
        protein: summary.total_protein,
        fat: summary.total_fat,
        items: editableDetails.map(i => i.name)
    };
    onAddToLog(entry);
    setAdded(true);
  };

  // Gauge Component
  const Gauge = ({ value, max, label, subLabel, type }: { value: number, max: number, label: string, subLabel?: string, type: 'GI' | 'GL' }) => {
    const percent = Math.min((value / max) * 100, 100);
    let color = 'bg-emerald-400';
    if (type === 'GI') {
      if (value > 55) color = 'bg-amber-400';
      if (value > 70) color = 'bg-red-400';
    } else {
      if (value > 10) color = 'bg-amber-400';
      if (value > 20) color = 'bg-red-400';
    }

    return (
      <div className="flex flex-col w-full">
        <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-1 uppercase tracking-wide px-1">
          <span>{text.low}</span>
          <span>{text.med}</span>
          <span>{text.high}</span>
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
          <span className={`text-xs font-bold ${color.replace('bg-', 'text-')}`}>{Math.round(value)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-32">
      
      {/* Header with Cat */}
      <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-white/50">
             <AnimatedCatLogo size={32} />
          </div>
          <div>
              <h2 className="font-bold text-slate-900">{text.reportTitle}</h2>
              <p className="text-xs text-slate-400">{summary.meal_type} • {summary.short_description}</p>
          </div>
      </div>

      {/* 1. Large Calorie Summary Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-white/40 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
             <Zap size={120} className="text-slate-900" />
         </div>
         
         <div className="relative z-10">
             <div className="flex justify-between items-start mb-2">
                 <h2 className="text-slate-400 font-bold text-xs uppercase tracking-wider">{text.totalCal}</h2>
                 <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                        isEditing 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                 >
                    {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                    {isEditing ? text.save : text.edit}
                 </button>
             </div>
             
             <div className="flex items-baseline gap-2 mb-8">
                 <span className="text-6xl font-black text-slate-900 tracking-tighter">
                    {summary.total_calories}
                 </span>
                 <span className="text-xl text-slate-400 font-medium">kcal</span>
             </div>

             {/* Macro Grid - Softer Colors */}
             <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/80 p-3 rounded-2xl text-center border border-blue-100">
                   <span className="block text-blue-900 font-bold text-lg">{summary.total_carbs}g</span>
                   <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wide">{text.carbs}</span>
                </div>
                <div className="bg-purple-50/80 p-3 rounded-2xl text-center border border-purple-100">
                   <span className="block text-purple-900 font-bold text-lg">{summary.total_protein}g</span>
                   <span className="text-[10px] text-purple-400 uppercase font-bold tracking-wide">{text.protein}</span>
                </div>
                <div className="bg-amber-50/80 p-3 rounded-2xl text-center border border-amber-100">
                   <span className="block text-amber-900 font-bold text-lg">{summary.total_fat}g</span>
                   <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wide">{text.fat}</span>
                </div>
             </div>
         </div>
      </div>

      {/* 2. Context Card (If User Profile exists) - Visual Update */}
      {userProfile && (
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl ring-4 ring-white/50">
           <div className="flex items-start justify-between mb-6">
             <div>
                <h3 className="text-xs text-slate-400 font-bold uppercase mb-1">{text.remaining}</h3>
                <div className="text-3xl font-bold tracking-tight">
                   {remaining} <span className="text-sm font-normal text-slate-500">kcal</span>
                </div>
             </div>
             
             {!added ? (
               <button 
                 onClick={handleAdd}
                 className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/30 active:scale-95"
               >
                 <Plus size={16} /> {text.addToLog}
               </button>
             ) : (
               <div className="bg-slate-800 text-emerald-400 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700">
                 <CheckCircle size={16} /> {text.added}
               </div>
             )}
           </div>

           {/* Visual Progress Bar Inside Card */}
           <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                 <span>{text.progressLabel}</span>
                 <span>{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden ring-1 ring-white/10">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPercent > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`} 
                   style={{ width: `${progressPercent}%` }}
                 ></div>
              </div>
           </div>
        </div>
      )}

      {/* 3. Food Items List (Editable) */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 px-2">
            <h3 className="font-bold text-slate-900">{text.macros} & {text.gl}</h3>
            {isEditing && <span className="text-xs text-emerald-600 font-bold animate-pulse">● Editing Mode</span>}
         </div>

         {editableDetails.map((item, idx) => (
           <div key={idx} className={`bg-white rounded-[1.5rem] p-5 shadow-sm border transition-all ${isEditing ? 'border-emerald-400 ring-2 ring-emerald-50' : 'border-slate-100'}`}>
             
             {/* Header / Name Row */}
             <div className="flex justify-between items-start mb-4">
               {isEditing ? (
                  <input 
                    type="text" 
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    className="font-bold text-lg border-b border-slate-300 focus:border-emerald-500 outline-none w-full mr-4 bg-transparent"
                  />
               ) : (
                  <h4 className="font-bold text-lg text-slate-800">{item.name}</h4>
               )}
               
               <div className="flex flex-col items-end">
                  {isEditing ? (
                      <div className="flex items-center gap-1">
                         <input 
                           type="number" 
                           value={item.calories_approx}
                           onChange={(e) => handleItemChange(idx, 'calories_approx', Number(e.target.value))}
                           className="w-16 text-right font-bold text-sm border rounded p-1 bg-slate-50"
                         />
                         <span className="text-xs text-slate-500">kcal</span>
                      </div>
                  ) : (
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{item.calories_approx} kcal</span>
                  )}
               </div>
             </div>
             
             {/* Editable Macros */}
             {isEditing && (
                 <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-2 rounded-lg">
                    <label className="text-xs text-slate-500 flex flex-col">
                       C (g)
                       <input type="number" value={item.carbs_g} onChange={(e) => handleItemChange(idx, 'carbs_g', Number(e.target.value))} className="font-bold bg-white border rounded p-1 mt-1"/>
                    </label>
                    <label className="text-xs text-slate-500 flex flex-col">
                       P (g)
                       <input type="number" value={item.protein_g} onChange={(e) => handleItemChange(idx, 'protein_g', Number(e.target.value))} className="font-bold bg-white border rounded p-1 mt-1"/>
                    </label>
                    <label className="text-xs text-slate-500 flex flex-col">
                       F (g)
                       <input type="number" value={item.fat_g} onChange={(e) => handleItemChange(idx, 'fat_g', Number(e.target.value))} className="font-bold bg-white border rounded p-1 mt-1"/>
                    </label>
                    
                    <label className="text-xs text-slate-500 flex flex-col col-span-3 mt-2">
                       GI Index (Affects GL)
                       <input type="number" value={item.gi_value} onChange={(e) => handleItemChange(idx, 'gi_value', Number(e.target.value))} className="font-bold bg-white border rounded p-1 mt-1"/>
                    </label>
                 </div>
             )}

             {/* Gauges */}
             <div className="space-y-4">
                <Gauge value={item.glycemic_load} max={30} label="GL (Load)" subLabel={text.glDesc} type="GL" />
                <Gauge value={item.gi_value} max={100} label="GI (Index)" type="GI" />
             </div>
           </div>
         ))}
         
         {/* GI Explanation Card */}
         <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3">
            <div className="bg-blue-100 p-1.5 rounded-full h-fit text-blue-600">
                <Info size={16} />
            </div>
            <div>
                <h4 className="font-bold text-sm text-blue-900 mb-1">{text.whatIsGi}</h4>
                <p className="text-xs text-blue-700 leading-relaxed opacity-90">
                    {text.giExplanationText}
                </p>
            </div>
         </div>
      </div>

      {/* 4. Advice */}
      <div className="bg-emerald-50 rounded-[1.5rem] p-6 border border-emerald-100 relative overflow-hidden">
        {/* Decorative Background Cat Paw */}
        <div className="absolute -right-4 -top-4 text-emerald-100 opacity-50">
            <AnimatedCatLogo size={80} />
        </div>
        
        <div className="flex items-center gap-2 mb-4 relative z-10">
           <h3 className="font-bold text-emerald-900 text-lg">{text.advice}</h3>
        </div>
        <ul className="space-y-3 relative z-10">
           {result.nutritional_advice.advice_list.map((tip, i) => (
             <li key={i} className="text-sm text-emerald-800 leading-relaxed flex items-start gap-3 bg-white/50 p-3 rounded-xl">
               <span className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>
               {tip}
             </li>
           ))}
        </ul>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-10">
        <button 
          onClick={onReset}
          className="bg-slate-900 text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-slate-400/40 active:scale-95 transition-all flex items-center gap-2 border-4 border-white"
        >
          <Camera size={20} />
          {text.scanNext}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;