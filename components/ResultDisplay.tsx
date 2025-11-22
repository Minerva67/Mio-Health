import React, { useState } from 'react';
import { AnalysisResult, FoodItem, Language, UserProfile, DailyLog, MealEntry } from '../types';
import { CheckCircle, Plus, Edit3, Save, Info, Camera, Zap } from 'lucide-react';
import { AnimatedCatLogo } from './AnimatedCatLogo';
import Gauge from './Gauge';

interface ResultDisplayProps {
  result: AnalysisResult;
  userProfile: UserProfile | null;
  dailyLog: DailyLog;
  onReset: () => void;
  onAddToLog: (entry: MealEntry) => void;
  lang: Language;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, userProfile, dailyLog, onReset, onAddToLog, lang }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableDetails, setEditableDetails] = useState<FoodItem[]>(
    result.is_food ? JSON.parse(JSON.stringify(result.food_details)) : []
  );
  const [summary, setSummary] = useState(result.analysis_summary);
  const [added, setAdded] = useState(false);

  const recalculateSummary = (items: FoodItem[]) => {
    const sum = (field: keyof FoodItem) => items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
    setSummary(prev => ({
        ...prev,
        total_calories: Math.round(sum('calories_approx')),
        total_carbs: Math.round(sum('carbs_g')),
        total_protein: Math.round(sum('protein_g')),
        total_fat: Math.round(sum('fat_g'))
    }));
  };

  const handleItemChange = (index: number, field: keyof FoodItem, value: string | number) => {
     const updated = [...editableDetails];
     // @ts-ignore
     updated[index][field] = value;
     
     if (field === 'gi_value' || field === 'carbs_g') {
         const gi = Number(updated[index].gi_value) || 0;
         const carbs = Number(updated[index].carbs_g) || 0;
         updated[index].glycemic_load = Math.round((gi * carbs) / 100);
     }
     setEditableDetails(updated);
     if (['calories_approx', 'carbs_g', 'protein_g', 'fat_g'].includes(field as string)) {
        recalculateSummary(updated);
     }
  };

  const t = {
    en: {
      totalCal: "Total Energy", edit: "Edit", save: "Save", remaining: "Remaining", addToLog: "Feed Mio", added: "Yum! Added!",
      progressLabel: "Daily Budget Used", macros: "Nutrients", gl: "Glycemic Load (GL)", carbs: "Carbs", protein: "Protein", fat: "Fat",
      glDesc: "Load = GI × Carbs / 100", 
      whatIsGi: "The Secret of GL", 
      giExplanationText: "\" The dose makes the poison. \" High GI foods (like Watermelon) can have a very Low GL if you eat a small portion. Always look at the GL to stay fit!",
      advice: "Mio's Advice", scanNext: "Snap Next Meal", notFoodTitle: "Mio is Confused", notFoodDesc: "This doesn't look like food to me.", retry: "Try Again",
      reportTitle: "Mio's Report"
    },
    zh: {
      totalCal: "总能量", edit: "修改", save: "保存", remaining: "今日剩余", addToLog: "喂给 Mio", added: "好吃！已记录",
      progressLabel: "今日额度已用", macros: "营养成分", gl: "升糖负荷 (GL)", carbs: "碳水", protein: "蛋白质", fat: "脂肪",
      glDesc: "负荷 = GI × 碳水 / 100", 
      whatIsGi: "GI 和 GL 的小秘密",
      giExplanationText: "抛开剂量谈毒性是耍流氓喵！高 GI 食物（比如西瓜）只要吃得少，GL 其实很低，完全不用慌。控制总量才是王道！",
      advice: "Mio 的建议", scanNext: "拍下一餐", notFoodTitle: "Mio 没看懂", notFoodDesc: "这看起来不像食物耶？请拍一张清晰的食物照片给我。", retry: "重新拍摄",
      reportTitle: "Mio 的分析报告"
    }
  };
  const text = t[lang];

  if (result.is_food === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="relative mb-8">
           <div className="w-40 h-40 bg-orange-50 rounded-full flex items-center justify-center shadow-inner mx-auto">
             <AnimatedCatLogo size={80} className="text-orange-500" />
           </div>
           <div className="absolute top-0 right-2 bg-white text-orange-400 w-12 h-12 flex items-center justify-center rounded-full text-2xl font-bold shadow-md border border-orange-100 animate-bounce">?</div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">{text.notFoodTitle}</h2>
        <p className="text-slate-500 mb-8 text-sm max-w-[240px] text-center leading-relaxed">{text.notFoodDesc}</p>
        <button onClick={onReset} className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-slate-300 active:scale-95 transition-all flex items-center gap-2">
          <Camera size={20} /> {text.retry}
        </button>
      </div>
    );
  }

  const consumedCal = dailyLog.entries.reduce((acc, e) => acc + e.calories, 0);
  const remaining = Math.max(0, (userProfile?.tdee || 2000) - consumedCal);
  const progressPercent = Math.min((consumedCal / (userProfile?.tdee || 2000)) * 100, 100);

  return (
    <div className="space-y-6 animate-fade-in pb-32">
      <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-white/50">
             <AnimatedCatLogo size={32} />
          </div>
          <div>
              <h2 className="font-bold text-slate-900">{text.reportTitle}</h2>
              <p className="text-xs text-slate-400">{summary.meal_type} • {summary.short_description}</p>
          </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-white/40 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12"><Zap size={120} className="text-slate-900" /></div>
         <div className="relative z-10">
             <div className="flex justify-between items-start mb-2">
                 <h2 className="text-slate-400 font-bold text-xs uppercase tracking-wider">{text.totalCal}</h2>
                 <button onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)} className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${isEditing ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500'}`}>
                    {isEditing ? <Save size={14} /> : <Edit3 size={14} />} {isEditing ? text.save : text.edit}
                 </button>
             </div>
             <div className="flex items-baseline gap-2 mb-8">
                 <span className="text-6xl font-black text-slate-900 tracking-tighter">{summary.total_calories}</span>
                 <span className="text-xl text-slate-400 font-medium">kcal</span>
             </div>
             <div className="grid grid-cols-3 gap-3">
                {[
                  { l: text.carbs, v: summary.total_carbs, c: 'blue' }, 
                  { l: text.protein, v: summary.total_protein, c: 'purple' }, 
                  { l: text.fat, v: summary.total_fat, c: 'amber' }
                ].map((m, i) => (
                  <div key={i} className={`bg-${m.c}-50/80 p-3 rounded-2xl text-center border border-${m.c}-100`}>
                     <span className={`block text-${m.c}-900 font-bold text-lg`}>{m.v}g</span>
                     <span className={`text-[10px] text-${m.c}-400 uppercase font-bold tracking-wide`}>{m.l}</span>
                  </div>
                ))}
             </div>
         </div>
      </div>

      {userProfile && (
        <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl ring-4 ring-white/50">
           <div className="flex items-start justify-between mb-6">
             <div>
                <h3 className="text-xs text-slate-400 font-bold uppercase mb-1">{text.remaining}</h3>
                <div className="text-3xl font-bold tracking-tight">{remaining} <span className="text-sm font-normal text-slate-500">kcal</span></div>
             </div>
             {!added ? (
               <button onClick={() => { onAddToLog({ id: crypto.randomUUID(), timestamp: Date.now(), name: summary.meal_type, calories: summary.total_calories, carbs: summary.total_carbs, protein: summary.total_protein, fat: summary.total_fat, items: editableDetails.map(i => i.name) }); setAdded(true); }} className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-lg">
                 <Plus size={16} /> {text.addToLog}
               </button>
             ) : (
               <div className="bg-slate-800 text-emerald-400 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700"><CheckCircle size={16} /> {text.added}</div>
             )}
           </div>
           <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wide"><span>{text.progressLabel}</span><span>{Math.round(progressPercent)}%</span></div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden ring-1 ring-white/10">
                 <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progressPercent > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'}`} style={{ width: `${progressPercent}%` }} ></div>
              </div>
           </div>
        </div>
      )}

      <div className="space-y-4">
         <div className="flex items-center gap-2 px-2">
            <h3 className="font-bold text-slate-900">{text.macros} & {text.gl}</h3>
            {isEditing && <span className="text-xs text-emerald-600 font-bold animate-pulse">● Editing</span>}
         </div>
         {editableDetails.map((item, idx) => (
           <div key={idx} className={`bg-white rounded-[1.5rem] p-5 shadow-sm border transition-all ${isEditing ? 'border-emerald-400 ring-2 ring-emerald-50' : 'border-slate-100'}`}>
             <div className="flex justify-between items-start mb-4">
               {isEditing ? (
                  <input type="text" value={item.name} onChange={(e) => handleItemChange(idx, 'name', e.target.value)} className="font-bold text-lg border-b border-slate-300 focus:border-emerald-500 outline-none w-full mr-4 bg-transparent" />
               ) : (
                  <h4 className="font-bold text-lg text-slate-800">{item.name}</h4>
               )}
               <div className="flex flex-col items-end">
                  {isEditing ? (
                      <input type="number" value={item.calories_approx} onChange={(e) => handleItemChange(idx, 'calories_approx', Number(e.target.value))} className="w-16 text-right font-bold text-sm border rounded p-1 bg-slate-50" />
                  ) : (
                      <span className="text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{item.calories_approx} kcal</span>
                  )}
               </div>
             </div>
             
             {isEditing && (
                 <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-50 p-2 rounded-lg">
                    {['carbs_g', 'protein_g', 'fat_g', 'gi_value'].map(f => (
                        <label key={f} className="text-[10px] text-slate-500 flex flex-col">{f.split('_')[0]} <input type="number" value={item[f as keyof FoodItem]} onChange={(e) => handleItemChange(idx, f as keyof FoodItem, Number(e.target.value))} className="font-bold bg-white border rounded p-1 mt-1"/></label>
                    ))}
                 </div>
             )}

             <div className="space-y-4">
                <Gauge value={item.glycemic_load} max={30} label="GL (Load)" subLabel={text.glDesc} type="GL" lang={lang} />
                <Gauge value={item.gi_value} max={100} label="GI (Index)" type="GI" lang={lang} />
             </div>
           </div>
         ))}
         
         <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex gap-3">
            <div className="bg-blue-100 p-1.5 rounded-full h-fit text-blue-600"><Info size={16} /></div>
            <div>
                <h4 className="font-bold text-sm text-blue-900 mb-1">{text.whatIsGi}</h4>
                <p className="text-xs text-blue-700 leading-relaxed opacity-90">{text.giExplanationText}</p>
            </div>
         </div>
      </div>

      <div className="bg-emerald-50 rounded-[1.5rem] p-6 border border-emerald-100 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-emerald-100 opacity-50"><AnimatedCatLogo size={80} /></div>
        <div className="flex items-center gap-2 mb-4 relative z-10"><h3 className="font-bold text-emerald-900 text-lg">{text.advice}</h3></div>
        <ul className="space-y-3 relative z-10">
           {result.nutritional_advice.advice_list.map((tip, i) => (
             <li key={i} className="text-sm text-emerald-800 leading-relaxed flex items-start gap-3 bg-white/50 p-3 rounded-xl">
               <span className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0"></span>{tip}
             </li>
           ))}
        </ul>
      </div>

      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-10">
        <button onClick={onReset} className="bg-slate-900 text-white font-bold py-4 px-10 rounded-full shadow-xl shadow-slate-400/40 active:scale-95 transition-all flex items-center gap-2 border-4 border-white">
          <Camera size={20} /> {text.scanNext}
        </button>
      </div>
    </div>
  );
};

export default ResultDisplay;