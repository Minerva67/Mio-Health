import React, { useState, useEffect } from 'react';
import { AlertCircle, Globe } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import UserProfileSetup from './components/UserProfileSetup';
import DailyHistory from './components/DailyHistory';
import UserHub from './components/UserHub';
import Header from './components/Header';
import LoadingOverlay from './components/LoadingOverlay';
import { analyzeFoodImage } from './services/geminiService';
import { AnalysisResult, AppStatus, Language, UserProfile, DailyLog, MealEntry } from './types';
import { AnimatedCatLogo } from './components/AnimatedCatLogo';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('zh'); 
  const [showHistory, setShowHistory] = useState(false);
  const [showUserHub, setShowUserHub] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Data Persistence
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog>({ date: '', entries: [] });

  // For the vibrant loading screen
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('smartplate_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      if (!parsed.tdee || parsed.tdee < 1000) {
         const safeBmr = Math.max(1200, parsed.bmr || 1200);
         parsed.tdee = Math.round(safeBmr * 1.2); 
         parsed.bmr = safeBmr;
      }
      setUserProfile(parsed);
    }
    
    const savedLog = localStorage.getItem('smartplate_log_v2');
    const today = getLocalToday();

    if (savedLog) {
      const parsedLog = JSON.parse(savedLog);
      // Check if the saved date matches today's date
      // If dates differ (it's a new day), reset entries to []
      setDailyLog(parsedLog.date === today ? parsedLog : { date: today, entries: [] });
    } else {
      setDailyLog({ date: today, entries: [] });
    }
  }, []);

  useEffect(() => {
    if (userProfile) localStorage.setItem('smartplate_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (dailyLog.date) localStorage.setItem('smartplate_log_v2', JSON.stringify(dailyLog));
  }, [dailyLog]);

  useEffect(() => {
    if (status === 'analyzing') {
      const msgsEn = [
        "Mio is sniffing the food...",
        "Identifying cooking methods...",
        "Calculating hidden calories...",
        "Thinking of health advice...",
        "Almost done, meow!"
      ];
      const msgsZh = [
        "Mio 正在凑近闻闻...",
        "正在观察是怎么做出来的...",
        "好难算喵，让我仔细想想...",
        "正在给主子写建议...",
        "马上就好喵！"
      ];
      const list = lang === 'zh' ? msgsZh : msgsEn;
      
      let i = 0;
      setLoadingMsg(list[0]);
      const interval = setInterval(() => {
        i = (i + 1) % list.length;
        setLoadingMsg(list[i]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status, lang]);

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsEditingProfile(false);
  };

  const handleImageSelect = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStatus('analyzing');
    setError(null);

    try {
      const data = await analyzeFoodImage(file, lang);
      setResult(data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const consumedCalories = dailyLog.entries.reduce((acc, e) => acc + e.calories, 0);
  const progressPercent = userProfile ? (consumedCalories / userProfile.tdee) * 100 : 0;
  const isOverLimit = progressPercent > 100;

  const t = {
    en: { slogan: "Eat for Vitality", sub: "Balance • Joy • Health", desc: "Let Mio help you find the healthiest choice in every meal.", today: "Today's Intake", target: "Target", error: "Mio is confused", retry: "Try Again", over: "Max Power" },
    zh: { slogan: "吃出满满元气", sub: "平衡 • 快乐 • 健康", desc: "让 Mio 帮你发现每一餐的健康秘密。", today: "今日摄入", target: "目标", error: "Mio 没看懂", retry: "再试一次", over: "能量爆表" }
  };
  const text = t[lang];

  if (!userProfile || isEditingProfile) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><AnimatedCatLogo /> Mio Health</h1>
          <button onClick={() => setLang(prev => prev === 'zh' ? 'en' : 'zh')} className="text-sm font-bold text-slate-500 border px-3 py-1.5 rounded-full flex items-center gap-1 bg-white shadow-sm">
            <Globe size={14} /> {lang === 'en' ? 'EN' : '中文'}
          </button>
        </div>
        <UserProfileSetup onComplete={handleProfileComplete} lang={lang} initialData={userProfile} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900">
      {status === 'analyzing' && <LoadingOverlay previewUrl={previewUrl} loadingMsg={loadingMsg} />}

      <Header status={status} lang={lang} onReset={handleReset} onToggleLang={() => setLang(prev => prev === 'zh' ? 'en' : 'zh')} onOpenUserHub={() => setShowUserHub(true)} isOverLimit={isOverLimit} />

      <main className="w-full max-w-md mx-auto px-4 pt-24 pb-10 relative z-0">
        {status === 'idle' && (
          <div className="mb-8 animate-fade-in relative">
             <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
                <div className="absolute top-[10%] left-[10%] text-4xl animate-float-1">🥑</div>
                <div className="absolute bottom-[30%] left-[20%] text-5xl animate-float-3">🥗</div>
                <div className="absolute bottom-[15%] right-[25%] text-4xl animate-float-2">🥦</div>
             </div>

             <div className="text-center mb-8 mt-2 relative z-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">{text.slogan}</h2>
                <div className="inline-flex flex-wrap justify-center gap-2 mb-3">
                  {text.sub.split(' • ').map((tag, i) => (
                    <span key={i} className="bg-white/60 backdrop-blur text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm border border-orange-100">{tag}</span>
                  ))}
                </div>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">{text.desc}</p>
             </div>

             <div onClick={() => setShowUserHub(true)} className={`relative z-10 rounded-3xl p-6 text-white shadow-xl shadow-orange-900/5 mb-8 cursor-pointer hover:scale-[1.02] transition-all active:scale-95 border border-white/10 overflow-hidden ${isOverLimit ? 'bg-red-500 ring-4 ring-red-200' : 'bg-slate-900'}`}>
                <div className="flex justify-between items-end mb-6">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isOverLimit ? 'text-red-100' : 'text-slate-400'}`}>{text.today}</span>
                  <span className={`text-xs font-bold ${isOverLimit ? 'text-white' : 'text-orange-400'}`}>{text.target}: {userProfile.tdee}</span>
                </div>
                <div className="flex items-end gap-1 justify-between">
                  <div><span className="text-5xl font-extrabold tracking-tighter leading-none">{consumedCalories}</span><span className={`text-lg mb-1 font-medium ${isOverLimit ? 'text-red-100' : 'text-slate-500'}`}>kcal</span></div>
                  {isOverLimit && <div className="flex flex-col items-end mb-1 animate-bounce"><AlertCircle className="text-white mb-1" /><span className="text-xs font-bold bg-red-700 px-2 py-1 rounded text-white">{text.over}</span></div>}
                </div>
                <div className={`w-full h-1.5 rounded-full mt-4 overflow-hidden ${isOverLimit ? 'bg-red-800' : 'bg-slate-800'}`}>
                  <div className={`h-full transition-all duration-1000 ${isOverLimit ? 'bg-white' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`} style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                </div>
             </div>

             <ImageUploader onImageSelect={handleImageSelect} isAnalyzing={false} lang={lang} />
          </div>
        )}

        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 border border-red-100 shadow-lg"><AnimatedCatLogo size={60} /></div>
            <h3 className="text-lg font-bold text-slate-900">{text.error}</h3>
            <p className="text-slate-500 mt-2 mb-8 text-sm px-8 leading-relaxed">{error}</p>
            <button onClick={handleReset} className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-slate-200 active:scale-95 transition-all">{text.retry}</button>
          </div>
        )}

        {status === 'success' && result && (
          <ResultDisplay result={result} userProfile={userProfile} dailyLog={dailyLog} onReset={handleReset} onAddToLog={(entry) => setDailyLog(prev => ({...prev, entries: [...prev.entries, entry]}))} lang={lang} />
        )}
      </main>

      {showHistory && <DailyHistory log={dailyLog} onClose={() => setShowHistory(false)} onDelete={(id) => setDailyLog(prev => ({...prev, entries: prev.entries.filter(e => e.id !== id)}))} lang={lang} />}
      <UserHub isOpen={showUserHub} onClose={() => setShowUserHub(false)} userProfile={userProfile} onEditProfile={() => setIsEditingProfile(true)} onOpenHistory={() => setShowHistory(true)} lang={lang} dailyLog={dailyLog} />
    </div>
  );
};

export default App;