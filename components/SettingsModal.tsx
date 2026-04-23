
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Moon, Sun, Layout, Trash2, Check, Bell, 
  Settings as SettingsIcon, Shield, Eye, Globe, Database,
  Terminal, Share2, Info, MapPin
} from 'lucide-react';
import { ALL_COUNTRIES } from '../src/constants';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsTab = 'identity' | 'appearance' | 'content' | 'notifications' | 'privacy' | 'about';

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('identity');
  const [nickname, setNickname] = useState(localStorage.getItem('chat-nickname') || '');
  const [theme, setTheme] = useState(() => {
    if (document.documentElement.classList.contains('cream')) return 'cream';
    if (document.documentElement.classList.contains('dark')) return 'dark';
    return 'light';
  });
  
  // New standardized settings state
  const [settings, setSettings] = useState({
    autoLounge: localStorage.getItem('setting-auto-lounge') === 'true',
    aiInsights: localStorage.getItem('setting-notifications') === 'true',
    browserNotifications: localStorage.getItem('setting-browser-notif') === 'true',
    soundEffects: localStorage.getItem('setting-sounds') === 'true',
    publicProfile: localStorage.getItem('setting-public') === 'true',
    analytics: localStorage.getItem('setting-analytics') !== 'false',
    language: localStorage.getItem('setting-lang') || 'en-US',
    region: localStorage.getItem('setting-region') || 'US'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('chat-nickname', nickname);
    localStorage.setItem('setting-auto-lounge', String(settings.autoLounge));
    localStorage.setItem('setting-notifications', String(settings.aiInsights));
    localStorage.setItem('setting-browser-notif', String(settings.browserNotifications));
    localStorage.setItem('setting-sounds', String(settings.soundEffects));
    localStorage.setItem('setting-public', String(settings.publicProfile));
    localStorage.setItem('setting-analytics', String(settings.analytics));
    localStorage.setItem('setting-lang', settings.language);
    localStorage.setItem('setting-region', settings.region);
    localStorage.setItem('setting-theme', theme);
    localStorage.setItem('setting-news-sources', JSON.stringify(activeSources));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'chat-nickname',
      newValue: nickname
    }));

    document.documentElement.classList.remove('dark', 'cream');
    if (theme !== 'light') {
      document.documentElement.classList.add(theme);
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your local history and master configuration? This action is irreversible.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'appearance', label: 'Chroma', icon: Sun },
    { id: 'content', label: 'Content', icon: Layout },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'privacy', label: 'Security', icon: Shield },
    { id: 'about', label: 'Version', icon: Info },
  ];

  const newsSources = [
    { id: 'cnbc', name: 'CNBC Intelligence' },
    { id: 'yahoo', name: 'Yahoo Market' },
    { id: 'wsj', name: 'Wall Street Journal' },
    { id: 'investing', name: 'Investing.com Analytics' },
    { id: 'marketwatch', name: 'MarketWatch' },
  ];

  const [activeSources, setActiveSources] = useState(() => {
    const saved = localStorage.getItem('setting-news-sources');
    return saved ? JSON.parse(saved) : ['cnbc', 'yahoo', 'wsj', 'investing', 'marketwatch'];
  });

  const toggleSource = (id: string) => {
    setActiveSources((prev: string[]) => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'identity':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Personal Interface</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">Global Nickname</label>
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter visual handle..."
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-black/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Operating Region (Globe)</label>
                  <div className="relative">
                    <select 
                      value={settings.region}
                      onChange={(e) => setSettings({...settings, region: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-black/20 transition-all text-sm appearance-none cursor-pointer pr-10"
                    >
                      {ALL_COUNTRIES.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <MapPin size={14} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">Primary Locale</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 outline-none focus:border-black/20 transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="de-DE">Deutsch</option>
                    <option value="fr-FR">Français</option>
                    <option value="es-ES">Español</option>
                    <option value="zh-CN">中文</option>
                    <option value="jp-JP">日本語</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 'appearance':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Environment Theme</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'light', label: 'Light', bg: 'bg-white', border: 'border-gray-200' },
                  { id: 'dark', label: 'Dark', bg: 'bg-[#121212]', border: 'border-gray-800' },
                  { id: 'cream', label: 'Cream', bg: 'bg-[#fdfcf7]', border: 'border-[#e8e4d3]' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex flex-col items-center space-y-3 p-4 rounded-[1.5rem] border transition-all ${
                      theme === t.id ? 'border-black bg-gray-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`w-full h-16 rounded-xl ${t.bg} border ${t.border} shadow-sm`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Auto-Lounge Activation</p>
                  <p className="text-[10px] text-gray-400">Force split-view on all dashboard interactions.</p>
                </div>
                <button 
                  onClick={() => setSettings({...settings, autoLounge: !settings.autoLounge})}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.autoLounge ? 'bg-black' : 'bg-gray-100'}`}
                >
                  <div className={`absolute top-1 bottom-1 w-4 rounded-full bg-white transition-all ${settings.autoLounge ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'content':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Intelligence Calibration</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {newsSources.map((source) => (
                  <button
                    key={source.id}
                    onClick={() => toggleSource(source.id)}
                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                      activeSources.includes(source.id) 
                        ? 'border-indigo-100 bg-indigo-50/30' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        activeSources.includes(source.id) ? 'text-indigo-600' : 'text-gray-900'
                      }`}>
                        {source.name}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">Verified Stream</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                      activeSources.includes(source.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-200'
                    }`}>
                      {activeSources.includes(source.id) && <Check size={12} />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Signal Intelligence</p>
              <div className="space-y-6">
                {[
                  { key: 'aiInsights', label: 'AI Market Insights', desc: 'Real-time analysis and conclusion processing.' },
                  { key: 'browserNotifications', label: 'Browser Alerts', desc: 'Native OS notifications for critical updates.' },
                  { key: 'soundEffects', label: 'Auditory Feedback', desc: 'Subtle sound cues for system navigation.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-[10px] text-gray-400">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => setSettings({...settings, [item.key]: !settings[item.key as keyof typeof settings]})}
                      className={`w-10 h-5 rounded-full transition-all relative ${settings[item.key as keyof typeof settings] ? 'bg-black' : 'bg-gray-100'}`}
                    >
                      <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white transition-all ${settings[item.key as keyof typeof settings] ? 'left-5.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      case 'privacy':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Security Protocols</p>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Public Recognition</p>
                    <p className="text-[10px] text-gray-400">Make your insights and reflections visible to others.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, publicProfile: !settings.publicProfile})}
                    className={`w-10 h-5 rounded-full transition-all relative ${settings.publicProfile ? 'bg-black' : 'bg-gray-100'}`}
                  >
                    <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white transition-all ${settings.publicProfile ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Usage Telemetry</p>
                    <p className="text-[10px] text-gray-400">Share anonymous diagnostic data to improve the hub.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({...settings, analytics: !settings.analytics})}
                    className={`w-10 h-5 rounded-full transition-all relative ${settings.analytics ? 'bg-black' : 'bg-gray-100'}`}
                  >
                    <div className={`absolute top-0.5 bottom-0.5 w-4 rounded-full bg-white transition-all ${settings.analytics ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
              
              <div className="pt-8 border-t border-gray-100">
                <button 
                  onClick={handleClear}
                  className="w-full flex items-center justify-center space-x-2 py-4 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100/50"
                >
                  <Trash2 size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Master System Reset</span>
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 'about':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-[2rem] border border-gray-100">
                <div className="w-16 h-16 bg-black rounded-3xl flex items-center justify-center mb-4 shadow-xl">
                  <Terminal className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold serif">RS Finance Hub</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6">Visual Engine v2.4.0</p>
                <p className="text-sm text-gray-500 font-light leading-relaxed max-w-xs">
                  An automated intelligence platform for modern market explorers.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Documentation', icon: Database },
                  { label: 'Support Channel', icon: Share2 },
                ].map((btn) => (
                  <button key={btn.label} className="flex items-center justify-center space-x-2 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all group">
                    <btn.icon size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-white/80 backdrop-blur-3xl" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        className="relative bg-white w-full max-w-4xl h-full sm:h-auto sm:max-h-[85vh] overflow-hidden sm:rounded-[3rem] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.12)] border border-gray-100/50 flex flex-col sm:flex-row"
      >
        {/* Sidebar */}
        <div className="w-full sm:w-64 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col">
          <div className="mb-12 flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <SettingsIcon size={16} className="text-white" />
            </div>
            <span className="font-bold tracking-tight text-lg serif">Settings</span>
          </div>

          <nav className="flex-1 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white text-black shadow-sm shadow-black/5 ring-1 ring-black/5' 
                    : 'text-gray-400 hover:text-black hover:bg-white/50'
                }`}
              >
                <tab.icon size={16} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={onClose}
            className="mt-8 flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold uppercase tracking-wider text-[11px]"
          >
            <X size={16} />
            <span>Abandon</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 sm:p-12">
            {renderContent()}
          </div>

          <div className="p-8 sm:p-12 bg-white border-t border-gray-50 flex items-center justify-between">
            <div className="hidden sm:block space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 leading-none">Status</p>
              <div className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${saved ? 'bg-green-500' : 'bg-amber-400'}`} />
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  {saved ? 'Synchronized' : 'Draft Config'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleSave}
              disabled={saved}
              className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center space-x-3 ${
                saved ? 'bg-green-500 text-white shadow-xl shadow-green-500/20' : 'bg-black text-white hover:bg-gray-800 shadow-xl shadow-black/10'
              }`}
            >
              {saved ? (
                <>
                  <Check size={16} />
                  <span>Configured</span>
                </>
              ) : (
                <>
                  <Database size={16} />
                  <span>Update Hub</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsModal;
