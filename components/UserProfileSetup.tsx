import React, { useState, useEffect } from 'react';
import { UserProfile, ActivityLevel, Goal, Language } from '../types';
import { ArrowRight, Check, Settings } from 'lucide-react';
import { AnimatedCatLogo } from './AnimatedCatLogo';

interface Props {
  onComplete: (profile: UserProfile) => void;
  lang: Language;
  initialData?: UserProfile | null;
  customBaseUrl?: string;
  setCustomBaseUrl?: (url: string) => void;
}

const UserProfileSetup: React.FC<Props> = ({ onComplete, lang, initialData, customBaseUrl, setCustomBaseUrl }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: 'male',
    activity: 'moderate',
    goal: 'maintain',
    age: 30,
    heightCm: 170,
    weightKg: 70
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const t = {
    en: {
      title: "Hi, I'm Mio!",
      subtitle: "Help me understand your needs so I can give better advice.",
      basicInfo: "Basic Info",
      lifestyle: "Lifestyle & Goals",
      weight: "Weight (kg)",
      height: "Height (cm)",
      age: "Age",
      gender: "Biological Sex",
      genderNote: "For BMR Calc",
      male: "Male",
      female: "Female",
      activity: "Activity Level",
      sedentary: "Sedentary (Office job)",
      light: "Light (Exercise 1-3x/wk)",
      moderate: "Moderate (Exercise 3-5x/wk)",
      active: "Active (Daily exercise)",
      goal: "Your Goal",
      lose: "Lose Weight",
      maintain: "Maintain",
      gain: "Build Muscle",
      finish: "Calculate My Limits",
      errorInputs: "Please enter valid numbers for height and weight.",
      networkSettings: "Network Settings",
      proxyUrl: "API Proxy URL",
      proxyPlaceholder: "e.g. https://my-worker.workers.dev",
      save: "Save"
    },
    zh: {
      title: "你好，我是 Mio!",
      subtitle: "让我更了解你一点，这样才能给你更准确的建议哦。",
      basicInfo: "基础信息",
      lifestyle: "生活方式与目标",
      weight: "体重 (kg)",
      height: "身高 (cm)",
      age: "年龄",
      gender: "生理性别",
      genderNote: "用于代谢计算",
      male: "男",
      female: "女",
      activity: "日常活动量",
      sedentary: "久坐 (办公室)",
      light: "轻度 (运动 1-3次/周)",
      moderate: "中度 (运动 3-5次/周)",
      active: "重度 (每天运动)",
      goal: "您的目标",
      lose: "减脂",
      maintain: "保持",
      gain: "增肌",
      finish: "生成健康档案",
      errorInputs: "请输入有效的身高和体重数值。",
      networkSettings: "网络设置",
      proxyUrl: "API 代理地址",
      proxyPlaceholder: "例如 https://my-worker.workers.dev",
      save: "保存"
    }
  };
  
  const text = t[lang];

  const calculateBMR = (data: Partial<UserProfile>) => {
    // Mifflin-St Jeor Equation
    const w = data.weightKg || 0;
    const h = data.heightCm || 0;
    const a = data.age || 0;
    
    // Safety check
    if (w < 20 || h < 50) return 1200;

    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr += data.gender === 'male' ? 5 : -161;
    return Math.max(1000, Math.round(bmr));
  };

  const calculateTDEE = (bmr: number, activity: ActivityLevel, goal: Goal) => {
    let multiplier = 1.2;
    if (activity === 'light') multiplier = 1.375;
    if (activity === 'moderate') multiplier = 1.55;
    if (activity === 'active') multiplier = 1.725;

    let tdee = bmr * multiplier;

    // Adjust for goal
    if (goal === 'lose') tdee -= 500;
    if (goal === 'gain') tdee += 300;

    const floor = Math.max(1000, bmr); 
    return Math.max(floor, Math.round(tdee));
  };

  const handleSubmit = () => {
    if (!formData.heightCm || !formData.weightKg || !formData.age || formData.heightCm < 50 || formData.weightKg < 20) {
        alert(text.errorInputs);
        return;
    }

    const bmr = calculateBMR(formData);
    const tdee = calculateTDEE(bmr, formData.activity as ActivityLevel, formData.goal as Goal);
    
    const profile: UserProfile = {
      ...formData as UserProfile,
      bmr: bmr,
      tdee: tdee
    };
    onComplete(profile);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-10 animate-fade-in relative">
      
      {/* Settings Button (Absolute Positioned Top Right of Container, relative to Parent App usually puts it in header, but here we add it in body) */}
      {setCustomBaseUrl && (
        <div className="absolute -top-14 right-20"> 
          <button 
             onClick={() => setShowSettings(!showSettings)}
             className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"
          >
             <Settings size={16} />
          </button>
        </div>
      )}

      {/* Settings Modal/Panel */}
      {showSettings && setCustomBaseUrl && (
        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-fade-in-up">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{text.networkSettings}</h3>
            <label className="block text-xs text-slate-400 mb-1">{text.proxyUrl}</label>
            <input 
               type="text" 
               value={customBaseUrl || ''}
               onChange={(e) => setCustomBaseUrl(e.target.value)}
               placeholder={text.proxyPlaceholder}
               className="w-full p-2 text-sm border border-slate-200 rounded-lg mb-2 outline-none focus:border-emerald-500"
            />
            <div className="text-[10px] text-slate-400 mb-2">
              如果在中国大陆无法使用，请填入 Cloudflare Workers 地址。
            </div>
            <button 
              onClick={() => setShowSettings(false)}
              className="w-full py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-300"
            >
              {text.save}
            </button>
        </div>
      )}

      {/* Updated Header with Mio Persona */}
      <div className="flex items-center gap-4 mb-8 pl-1">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full shadow-sm flex items-center justify-center shrink-0 border border-orange-200">
          <AnimatedCatLogo size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{text.title}</h2>
          <p className="text-sm text-slate-500 leading-snug mt-1">{text.subtitle}</p>
        </div>
      </div>

      <div className="space-y-8">
         {/* Section 1: Basic Stats */}
         <div>
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">{text.basicInfo}</h3>
             
             {/* Gender / Biological Sex */}
             <div className="mb-5">
                <div className="flex items-center justify-between mb-2 pl-1 pr-1">
                   <label className="block text-xs font-bold text-slate-500">{text.gender}</label>
                   <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                     {text.genderNote}
                   </span>
                </div>
                <div className="flex rounded-2xl bg-white p-1.5 border border-slate-100 shadow-sm">
                  <button 
                    onClick={() => setFormData({...formData, gender: 'male'})}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${formData.gender === 'male' ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {formData.gender === 'male' && <Check size={16} strokeWidth={3}/>} {text.male}
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, gender: 'female'})}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${formData.gender === 'female' ? 'bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    {formData.gender === 'female' && <Check size={16} strokeWidth={3}/>} {text.female}
                  </button>
                </div>
             </div>

             {/* Inputs */}
             <div className="grid grid-cols-3 gap-3">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 pl-1">{text.age}</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-center text-lg shadow-sm text-slate-900 placeholder:text-slate-200"
                      value={formData.age || ''}
                      onChange={e => setFormData({...formData, age: parseInt(e.target.value)})}
                      placeholder="30"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 pl-1">{text.height}</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-center text-lg shadow-sm text-slate-900 placeholder:text-slate-200"
                      value={formData.heightCm || ''}
                      onChange={e => setFormData({...formData, heightCm: parseInt(e.target.value)})}
                      placeholder="170"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 pl-1">{text.weight}</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-center text-lg shadow-sm text-slate-900 placeholder:text-slate-200"
                      value={formData.weightKg || ''}
                      onChange={e => setFormData({...formData, weightKg: parseInt(e.target.value)})}
                      placeholder="70"
                    />
                 </div>
             </div>
         </div>

         {/* Section 2: Lifestyle */}
         <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">{text.lifestyle}</h3>
            
            <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">{text.activity}</label>
                 <div className="grid grid-cols-1 gap-2.5">
                   {['sedentary', 'light', 'moderate', 'active'].map((level) => (
                     <button
                       key={level}
                       onClick={() => setFormData({...formData, activity: level as ActivityLevel})}
                       className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center justify-between group ${
                         formData.activity === level 
                         ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-100' 
                         : 'border-transparent bg-white text-slate-500 hover:bg-slate-50 shadow-sm'
                       }`}
                     >
                       <span className={`font-medium text-sm ${formData.activity === level ? 'font-bold' : ''}`}>
                         {/* @ts-ignore */}
                         {text[level]}
                       </span>
                       {formData.activity === level && <Check size={18} className="text-emerald-600" strokeWidth={3} />}
                     </button>
                   ))}
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">{text.goal}</label>
                 <div className="grid grid-cols-3 gap-2">
                   {['lose', 'maintain', 'gain'].map((g) => (
                     <button
                       key={g}
                       onClick={() => setFormData({...formData, goal: g as Goal})}
                       className={`py-3.5 text-xs font-bold rounded-2xl border transition-all shadow-sm ${
                         formData.goal === g
                         ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100'
                         : 'border-transparent bg-white text-slate-500 hover:bg-slate-50'
                       }`}
                     >
                       {/* @ts-ignore */}
                       {text[g]}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
         </div>
         
         <button 
           onClick={handleSubmit}
           className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-300 flex justify-center items-center gap-2 active:scale-95 mt-4"
         >
           {text.finish} <ArrowRight size={18} />
         </button>
      </div>
    </div>
  );
};

export default UserProfileSetup;