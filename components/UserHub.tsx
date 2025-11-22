import React from 'react';
import { UserProfile, Language, DailyLog } from '../types';
import { X, User, History, Target, ChevronRight, Edit2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onEditProfile: () => void;
  onOpenHistory: () => void;
  lang: Language;
  dailyLog: DailyLog;
}

const UserHub: React.FC<Props> = ({ 
  isOpen, onClose, userProfile, onEditProfile, onOpenHistory, lang, dailyLog
}) => {
  if (!isOpen) return null;

  const t = {
    en: {
      title: "My Health Hub",
      profile: "Profile & Goals",
      history: "History & Logs",
      dailyTarget: "Daily Goal",
      today: "Today's Intake",
      entries: "entries",
      edit: "Edit Profile",
      viewHistory: "Manage History",
      overLimit: "Over Limit"
    },
    zh: {
      title: "个人中心",
      profile: "身体档案 & 目标",
      history: "饮食记录",
      dailyTarget: "每日目标",
      today: "今日摄入",
      entries: "条记录",
      edit: "修改档案",
      viewHistory: "管理历史记录",
      overLimit: "超标"
    }
  };
  const text = t[lang];
  
  const consumed = dailyLog.entries.reduce((acc, e) => acc + e.calories, 0);
  const percentage = (consumed / userProfile.tdee) * 100;
  const isOver = percentage > 100;
  const displayPercentage = Math.round(percentage);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Sidebar */}
      <div className="relative w-80 h-full bg-white shadow-2xl p-6 flex flex-col animate-fade-in-right overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
               <User size={20} />
             </div>
             {text.title}
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
             <X size={24} className="text-gray-500" />
           </button>
        </div>

        <div className="space-y-6 flex-1">
           {/* Stats Card */}
           <div className={`rounded-2xl p-5 shadow-lg text-white transition-colors duration-500 ${isOver ? 'bg-red-500' : 'bg-gray-900'}`}>
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className={`text-xs uppercase font-bold mb-1 ${isOver ? 'text-red-100' : 'text-gray-400'}`}>{text.dailyTarget}</p>
                    <p className="text-3xl font-bold">{userProfile.tdee} <span className={`text-sm font-normal ${isOver ? 'text-red-200' : 'text-gray-500'}`}>kcal</span></p>
                 </div>
                 {isOver ? <AlertCircle className="text-white animate-pulse" /> : <Target className="text-emerald-500" />}
              </div>
              <div className="space-y-2">
                 <div className={`flex justify-between text-xs ${isOver ? 'text-red-100' : 'text-gray-400'}`}>
                    <span>{text.today}</span>
                    <span className="font-bold">{displayPercentage}% {isOver && `(${text.overLimit})`}</span>
                 </div>
                 <div className={`w-full h-2 rounded-full overflow-hidden ${isOver ? 'bg-red-800' : 'bg-gray-700'}`}>
                    <div 
                      className={`h-full transition-all duration-1000 ${isOver ? 'bg-white' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                 </div>
                 <p className={`text-xs mt-2 text-right ${isOver ? 'text-red-100' : 'text-gray-500'}`}>{consumed} / {userProfile.tdee} kcal</p>
              </div>
           </div>

           {/* Action Buttons */}
           <div className="space-y-3">
              <button 
                onClick={() => { onClose(); onOpenHistory(); }}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                 <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                       <History size={20} />
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-gray-800 text-sm">{text.history}</p>
                       <p className="text-xs text-gray-500">{dailyLog.entries.length} {text.entries}</p>
                    </div>
                 </div>
                 <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>

              <button 
                onClick={() => { onClose(); onEditProfile(); }}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                 <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                       <Edit2 size={20} />
                    </div>
                    <div className="text-left">
                       <p className="font-bold text-gray-800 text-sm">{text.profile}</p>
                       <p className="text-xs text-gray-500">{text.edit}</p>
                    </div>
                 </div>
                 <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserHub;