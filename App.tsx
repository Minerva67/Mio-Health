import React, { useState, useEffect } from 'react';
import { User, AlertCircle, Globe, ChevronLeft } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import UserProfileSetup from './components/UserProfileSetup';
import DailyHistory from './components/DailyHistory';
import UserHub from './components/UserHub';
import { analyzeFoodImage } from './services/geminiService';
import { AnalysisResult, AppStatus, Language, UserProfile, DailyLog, MealEntry } from './types';
import { AnimatedCatLogo } from './components/AnimatedCatLogo';

// --- Floating Background Emojis ---
const FloatingEmojis = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
    <div className="absolute top-[10%] left-[10%] text-4xl animate-float-1">🥑</div>
    <div className="absolute top-[20%] right-[15%] text-3xl animate-float-2">🥕</div>
    <div className="absolute bottom-[30%] left-[20%] text-5xl animate-float-3">🥗</div>
    <div className="absolute top-[40%] right-[5%] text-2xl animate-float-1" style={{animationDelay: '1s'}}>🍎</div>
    <div className="absolute bottom-[15%] right-[25%] text-4xl animate-float-2" style={{animationDelay: '0.5s'}}>🥦</div>
  </div>
);

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
  const [dailyLog, setDailyLog] = useState<DailyLog>({
    date: '',
    entries: []
  });
  // Network Settings
  const [customBaseUrl, setCustomBaseUrl] = useState<string>("");

  // For the vibrant loading screen
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState("");

  // Helper: Get Local Date String YYYY-MM-DD (Not UTC)
  const getLocalToday = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load Data on Mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('smartplate_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      // Safety Fix: If loaded data has invalid TDEE
      if (!parsed.tdee || parsed.tdee < 1000 || isNaN(parsed.tdee)) {
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
      if (parsedLog.date === today) {
        setDailyLog(parsedLog);
      } else {
        setDailyLog({ date: today, entries: [] });
      }
    } else {
      setDailyLog({ date: today, entries: [] });
    }

    const savedSettings = localStorage.getItem('smartplate_settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      if (parsedSettings.customBaseUrl) {
        setCustomBaseUrl(parsedSettings.customBaseUrl);
      }
    }
  }, []);

  // Save Data on Change
  useEffect(() => {
    if (userProfile) localStorage.setItem('smartplate_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    if (dailyLog.date) {
        localStorage.setItem('smartplate_log_v2', JSON.stringify(dailyLog));
    }
  }, [dailyLog]);

  // Save Settings
  useEffect(() => {
    localStorage.setItem('smartplate_settings', JSON.stringify({ customBaseUrl }));
  }, [customBaseUrl]);

  // Dynamic Loading Messages - CUTE CAT THEME
  useEffect(() => {
    if (status === 'analyzing') {
      const msgsEn = [
        "Mio is sniffing...", 
        "Checking for hidden treats...", 
        "Calculating nutrition...",
        "Mio is curious...",
        "Almost there..."
      ];
      const msgsZh = [
        "Mio 正在嗅探食物...",
        "正在寻找隐藏糖分...",
        "Mio 正在计算元气值...",
        "快好啦，喵...",
        "正在生成健康建议..."
      ];
      const list = lang === 'zh' ? msgsZh : msgsEn;
      
      let i = 0;
      setLoadingMsg(list[0]);
      const interval = setInterval(() => {
        i = (i + 1) % list.length;
        setLoadingMsg(list[i]);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [status, lang]);

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsEditingProfile(false);
  };

  const handleImageSelect = async (file: File) => {
    // Create URL for background preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    setStatus('analyzing');
    setError(null);

    try {
      const data = await analyzeFoodImage(file, lang, customBaseUrl);
      setResult(data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleAddToLog = (entry: MealEntry) => {
    setDailyLog(prev => ({
      ...prev,
      entries: [...prev.entries, entry]
    }));
  };

  const handleDeleteEntry = (id: string) => {
    setDailyLog(prev => ({
      ...prev,
      entries: prev.entries.filter(e => e.id !== id)
    }));
  };

  const handleReset = () => {
    setStatus('idle');
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  const consumedCalories = dailyLog.entries.reduce((acc, e) => acc + e.calories, 0);
  const progressPercent = userProfile ? (consumedCalories / userProfile.tdee) * 100 : 0;
  const isOverLimit = progressPercent > 100;

  const t = {
    en: {
      title: "Mio Health",
      mainSlogan: "Eat for Vitality",
      subSlogan: "Balance • Joy • Health",
      description: "Let Mio help you find the healthiest choice in every meal.",
      todayCal: "Today's Intake",
      target: "Target",
      errorTitle: "Mio is confused",
      tryAgain: "Try Again",
      over: "Max Power"
    },
    zh: {
      title: "Mio Health",
      mainSlogan: "吃出满满元气",
      subSlogan: "平衡 • 快乐 • 健康",
      description: "让 Mio 帮你发现每一餐的健康秘密。",
      todayCal: "今日摄入",
      target: "目标",
      errorTitle: "Mio 没看懂",
      tryAgain: "再试一次",
      over: "能量爆表"
    }
  };

  const text = t[lang];

  // 1. Profile Setup / Editing
  if (!userProfile || isEditingProfile) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
             <AnimatedCatLogo />
            {text.title}
          </h1>
          <button onClick={toggleLanguage} className="text-sm font-bold text-slate-500 border px-3 py-1.5 rounded-full flex items-center gap-1 bg-white shadow-sm">
            <Globe size={14} />
            {lang === 'en' ? 'EN' : '中文'}
          </button>
        </div>
        <UserProfileSetup 
          onComplete={handleProfileComplete} 
          lang={lang} 
          initialData={userProfile} 
        />
      </div>
    );
  }

  // 2. Main App
  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-slate-900">
      
      {/* Full Screen Scanner Overlay (Analyzing State) */}
      {status === 'analyzing' && previewUrl && (
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
      )}

      {/* Header - Fixed Positioning */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none w-full">
        <div className="w-full max-w-md bg-[#FDFBF7]/95 backdrop-blur-md border-b border-slate-100/50 px-4 py-3 flex justify-between items-center shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2">
            {status === 'success' ? (
               // Explicit Back Button Logic
               <button 
                  onClick={handleReset}
                  className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors active:scale-95"
                  aria-label="Back"
               >
                  <ChevronLeft size={24} strokeWidth={2.5} />
               </button>
            ) : (
               // Default State: Animated Logo
               <div className="flex items-center justify-center">
                 <AnimatedCatLogo />
               </div>
            )}
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">{text.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
            >
              <Globe size={14} />
              {lang === 'zh' ? 'CN' : 'EN'}
            </button>

            <button 
              onClick={() => setShowUserHub(true)}
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

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto px-4 pt-24 pb-10 relative z-0">
        
        {/* Dashboard Summary (Only show when idle) */}
        {status === 'idle' && (
          <div className="mb-8 animate-fade-in relative">
             {/* Floating Emojis Background */}
             <FloatingEmojis />

             {/* HERO SECTION: Slogan */}
             <div className="text-center mb-8 mt-2 relative z-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  {text.mainSlogan}
                </h2>
                <div className="inline-flex flex-wrap justify-center gap-2 mb-3">
                  {text.subSlogan.split(' • ').map((tag, i) => (
                    <span key={i} className="bg-white/60 backdrop-blur text-orange-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm border border-orange-100">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {text.description}
                </p>
             </div>

             {/* Progress Card */}
             <div 
               onClick={() => setShowUserHub(true)}
               className={`relative z-10 rounded-3xl p-6 text-white shadow-xl shadow-orange-900/5 mb-8 cursor-pointer hover:scale-[1.02] transition-all active:scale-95 border border-white/10 overflow-hidden ${
                 isOverLimit ? 'bg-red-500 ring-4 ring-red-200' : 'bg-slate-900'
               }`}
             >
                <div className="flex justify-between items-end mb-6">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isOverLimit ? 'text-red-100' : 'text-slate-400'}`}>{text.todayCal}</span>
                  <span className={`text-xs font-bold ${isOverLimit ? 'text-white' : 'text-orange-400'}`}>{text.target}: {userProfile.tdee}</span>
                </div>
                <div className="flex items-end gap-1 justify-between">
                  <div>
                     <span className="text-5xl font-extrabold tracking-tighter leading-none">{consumedCalories}</span>
                     <span className={`text-lg mb-1 font-medium ${isOverLimit ? 'text-red-100' : 'text-slate-500'}`}>kcal</span>
                  </div>
                  {isOverLimit && (
                     <div className="flex flex-col items-end mb-1 animate-bounce">
                        <AlertCircle className="text-white mb-1" />
                        <span className="text-xs font-bold bg-red-700 px-2 py-1 rounded text-white">{text.over}</span>
                     </div>
                  )}
                </div>
                <div className={`w-full h-1.5 rounded-full mt-4 overflow-hidden ${isOverLimit ? 'bg-red-800' : 'bg-slate-800'}`}>
                  <div 
                    className={`h-full transition-all duration-1000 ${isOverLimit ? 'bg-white' : 'bg-gradient-to-r from-orange-500 to-amber-400'}`} 
                    style={{ width: `${Math.min(progressPercent, 100)}%` }} 
                  />
                </div>
             </div>

             <ImageUploader onImageSelect={handleImageSelect} isAnalyzing={false} lang={lang} />
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 border border-red-100 shadow-lg">
               <AnimatedCatLogo size={60} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{text.errorTitle}</h3>
            <p className="text-slate-500 mt-2 mb-8 text-sm px-8 leading-relaxed">{error}</p>
            <button 
              onClick={handleReset}
              className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-slate-200 active:scale-95 transition-all"
            >
              {text.tryAgain}
            </button>
          </div>
        )}

        {/* Success */}
        {status === 'success' && result && (
          <ResultDisplay 
            result={result} 
            userProfile={userProfile} 
            dailyLog={dailyLog}
            onReset={handleReset} 
            onAddToLog={handleAddToLog}
            lang={lang} 
          />
        )}
      </main>

      {/* History Modal */}
      {showHistory && (
        <DailyHistory 
          log={dailyLog} 
          onClose={() => setShowHistory(false)} 
          onDelete={handleDeleteEntry}
          lang={lang}
        />
      )}

      {/* User Hub (Sidebar/Modal) */}
      <UserHub 
        isOpen={showUserHub} 
        onClose={() => setShowUserHub(false)} 
        userProfile={userProfile}
        onEditProfile={() => setIsEditingProfile(true)}
        onOpenHistory={() => setShowHistory(true)}
        lang={lang}
        dailyLog={dailyLog}
        customBaseUrl={customBaseUrl}
        setCustomBaseUrl={setCustomBaseUrl}
      />

    </div>
  );
};

export default App;