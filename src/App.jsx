import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Settings, ChevronRight, Play, Check, Backpack, Image as ImageIcon, Loader2, X, PenTool } from 'lucide-react';

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

const TEXTS = {
  zh: {
    app_title: 'RAYSTORY',
    app_subtitle: '无限剧本宇宙',
    choose_destiny: '选择你的宿命',
    setup_title: '剧本定制',
    select_tags: '选择风格标签 (最多3个)',
    custom_prompt: '天道指令 (自定义背景/金手指)',
    custom_placeholder: '例如：主角天生拥有混沌灵根...',
    start_journey: '开启旅程',
    inventory: '须弥戒',
    loading: '天机推演中...',
    rendering: '幻境生成...',
    end_game: '飞升/结局',
    lang_name: '简体中文',
    genres: {
      xianxia: { label: '大道争锋', desc: '凡人修仙，逆天而行。', tags: ['废柴退婚', '上古遗迹', '御剑飞行'] },
      cyberpunk: { label: '赛博朋克', desc: '高科技，低生活。', tags: ['黑客', '企业战争'] },
      romance: { label: '绮丽之约', desc: '跨越光年的誓言。', tags: ['校园', '穿越'] },
    },
  },
  en: {
    app_title: 'RAYSTORY',
    app_subtitle: 'INFINITE SAGAS',
    choose_destiny: 'CHOOSE DESTINY',
    setup_title: 'CUSTOMIZE STORY',
    select_tags: 'Select Tags (Max 3)',
    custom_prompt: "Director's Note",
    custom_placeholder: 'E.g., The protagonist is a toaster...',
    start_journey: 'START JOURNEY',
    inventory: 'INVENTORY',
    loading: 'WEAVING FATE...',
    rendering: 'RENDERING...',
    end_game: 'FINISH',
    lang_name: 'English',
    genres: {
      xianxia: { label: 'Cultivation', desc: 'Immortality journey.', tags: ['Sect', 'Alchemy'] },
      cyberpunk: { label: 'Cyberpunk', desc: 'Neon rain.', tags: ['Hacker', 'Megacorp'] },
      romance: { label: 'Romance', desc: 'Love story.', tags: ['High School', 'Fantasy'] },
    },
  },
};

const GENRES_CONFIG = [
  { id: 'xianxia', colors: ['#10b981', '#f59e0b', '#ecfdf5'], bgGradient: 'linear-gradient(to bottom, #064e3b, #065f46, #022c22)', accent: 'text-emerald-300', font: 'font-serif', particle: '☁️' },
  { id: 'cyberpunk', colors: ['#00f2ff', '#ff00ff', '#000000'], bgGradient: 'conic-gradient(from 180deg at 50% 50%, #000000 0deg, #0f172a 120deg, #1e1b4b 240deg, #000000 360deg)', accent: 'text-cyan-300', font: 'font-sans tracking-widest', particle: '█' },
  { id: 'romance', colors: ['#f472b6', '#be185d', '#500724'], bgGradient: 'radial-gradient(circle at center, #831843, #500724, #000000)', accent: 'text-pink-300', font: 'font-serif', particle: '♥' },
];

const GAME_LENGTHS = [
  { id: 'short', name: 'Short (~50 turns)', turns: 50 },
  { id: 'medium', name: 'Medium (~150 turns)', turns: 150 },
  { id: 'long', name: 'Long (~300 turns)', turns: 300 },
];

const MagneticButton = ({ children, className = '', ...props }) => (
  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`${className}`} {...props}>
    {children}
  </motion.button>
);

const ParticleField = ({ genre }) => {
  const particles = useMemo(() => Array.from({ length: 12 }), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: '110vh', x: Math.random() * 100 + 'vw', opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.5, 0] }}
          transition={{ duration: 12 + Math.random() * 8, repeat: Infinity, ease: 'linear', delay: Math.random() * 4 }}
          className="absolute text-xl text-white/10 select-none font-bold"
        >
          {genre.particle}
        </motion.div>
      ))}
    </div>
  );
};

const StorySetupModal = ({ isOpen, onClose, genre, onConfirm, t }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [mode, setMode] = useState(GAME_LENGTHS[0]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTags([]);
      setCustomPrompt('');
      setMode(GAME_LENGTHS[0]);
    }
  }, [isOpen]);

  if (!isOpen || !genre) return null;
  const localGenre = t.genres[genre.id];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) setSelectedTags((prev) => prev.filter((t) => t !== tag));
    else if (selectedTags.length < 3) setSelectedTags((prev) => [...prev, tag]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gray-900/90 border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh] text-white">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings className="text-indigo-400" /> {t.setup_title}
          </h3>
          <button onClick={onClose}>
            <X className="text-white/50 hover:text-white" />
          </button>
        </div>
        <div className="flex-1 p-8 overflow-y-auto space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            {GAME_LENGTHS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m)}
                className={`p-4 rounded-xl border text-left transition-all ${mode.id === m.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
              >
                <div className="text-xs font-bold mb-1">{m.name}</div>
                <div className="text-sm">{m.turns} turns</div>
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold text-white/50 block mb-3 uppercase tracking-widest">{t.select_tags}</label>
            <div className="flex flex-wrap gap-2">
              {localGenre.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedTags.includes(tag) ? 'bg-white text-black border-white' : 'bg-black/30 text-white/60 border-white/10 hover:border-white/30'}`}
                >
                  {selectedTags.includes(tag) && <Check size={10} className="inline mr-1" />} {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-white/50 block mb-3 uppercase tracking-widest flex items-center gap-2">
              <PenTool size={14} /> {t.custom_prompt}
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full h-28 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
              placeholder={t.custom_placeholder}
            />
          </div>
        </div>
        <div className="p-6 border-t border-white/10 bg-black/20">
          <button onClick={() => onConfirm({ lengthId: mode.id, maxTurns: mode.turns, tags: selectedTags, customPrompt })} className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-[1.02] transition-transform shadow-xl flex items-center justify-center gap-2">
            <Play size={20} fill="currentColor" /> {t.start_journey}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const StoryMode = ({ data, genre, t, onEnd }) => {
  const [text, setText] = useState('');
  const [img, setImg] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);

  useEffect(() => {
    setText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < data.content.length) {
        setText((p) => p + data.content.charAt(i));
        i += 1;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, [data]);

  useEffect(() => {
    if (!data.visualPrompt) return;
    setLoadingImg(true);
    const timer = setTimeout(() => {
      setImg(`https://dummyimage.com/800x800/111827/fff&text=${encodeURIComponent(data.visualPrompt)}`);
      setLoadingImg(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
        <div>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 leading-tight text-white drop-shadow-xl ${genre.font}`}>{data.title}</h2>
          <div className={`prose prose-invert prose-lg max-w-none leading-relaxed ${genre.font} text-white/95 tracking-wide p-6 rounded-3xl bg-gray-950/80 border border-white/10 backdrop-blur-2xl shadow-2xl`}>
            <p className="whitespace-pre-line">{text}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-black/60 border border-white/20 shadow-2xl backdrop-blur-md">
            {loadingImg ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-white/40" size={40} />
                <span className="text-[10px] font-bold tracking-widest text-white/40">{t.rendering}</span>
              </div>
            ) : (
              img && <motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={img} className="w-full h-full object-cover" />
            )}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <button className="p-3 rounded-xl backdrop-blur text-white bg-black/40 border border-white/10 flex-1 flex items-center justify-center">
                <ImageIcon size={18} />
              </button>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
              <Backpack size={14} /> {t.inventory}
            </div>
            <div className="text-white/60 text-sm">{data.items_gained?.length ? data.items_gained.join(', ') : '...'}</div>
          </div>
          <button onClick={onEnd} className="w-full py-4 rounded-2xl bg-white text-black font-black text-lg tracking-widest hover:scale-[1.01] transition-transform shadow-[0_0_30px_rgba(255,255,255,0.5)]">
            {t.end_game}
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuMode = ({ genres, onSelect, t }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col justify-center pb-10">
    <div className="text-center mb-12 relative z-10">
      <motion.h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl font-sans">{t.choose_destiny}</motion.h2>
    </div>
    <div className="flex gap-8 overflow-x-auto pb-12 px-8 custom-scrollbar snap-x snap-mandatory items-center h-[420px] z-10">
      {genres.map((g, i) => {
        const localG = t.genres[g.id];
        return (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, scale: 0.85, x: 80 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(g)}
            className={`snap-center shrink-0 w-[260px] h-[360px] relative rounded-[2.2rem] overflow-hidden cursor-pointer group border-2 border-white/10 bg-gray-900/60 backdrop-blur-md hover:border-white/40 transition-all duration-500 shadow-2xl`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-80 transition-opacity duration-700`} style={{ backgroundImage: g.bgGradient }} />
            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
              <div className={`w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-white shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                <Zap />
              </div>
              <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className={`text-3xl font-black text-white mb-3 leading-none drop-shadow-lg ${g.font}`}>{localG.label}</h3>
                <p className="text-sm font-medium text-white/60 group-hover:text-white/90 leading-relaxed mb-4">{localG.desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                  <span>{t.start_journey}</span> <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default function App() {
  const [lang, setLang] = useState('zh');
  const [status, setStatus] = useState('menu');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [storyData, setStoryData] = useState(null);
  const [gameSettings, setGameSettings] = useState(null);

  const t = TEXTS[lang];

  const onGenreClick = (genre) => {
    setSelectedGenre(genre);
    setShowSetup(true);
  };

  const onSetupConfirm = (settings) => {
    setGameSettings(settings);
    setShowSetup(false);
    setStatus('loading');
    setTimeout(() => {
      setStoryData({
        title: `${t.genres[selectedGenre.id].label} · Turn 1`,
        content: '这是一个示例剧情片段。这里会展示来自模型的故事文本，支持多语言渲染。',
        choices: [],
        isEnding: false,
        atmosphere: 'Story Node',
        visualPrompt: `${selectedGenre.id} scene`,
        items_gained: ['示例道具'],
      });
      setStatus('playing');
    }, 800);
  };

  const onEnd = () => {
    setStatus('menu');
    setStoryData(null);
    setGameSettings(null);
    setSelectedGenre(null);
  };

  const bgStyle = selectedGenre ? { background: selectedGenre.bgGradient } : { background: '#000' };

  return (
    <div className="min-h-screen w-full text-white font-sans overflow-hidden relative transition-all duration-1000 selection:bg-indigo-500/50 selection:text-white" style={bgStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;700;900&family=Noto+Serif+SC:wght@400;700;900&display=swap');
        .font-serif { font-family: 'Noto Serif SC', serif; }
        .font-sans { font-family: 'Noto Sans SC', sans-serif; }
        .custom-scrollbar { scrollbar-width: thin; }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-0 bg-black/25" />
      <div className="fixed inset-0 pointer-events-none z-[60] opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: NOISE_SVG }} />
      {selectedGenre && <div className="fixed inset-0 z-0 pointer-events-none"><ParticleField genre={selectedGenre} /></div>}

      <div className="relative z-10 h-screen flex flex-col max-w-6xl mx-auto p-4 lg:p-6">
        <header className="flex justify-between items-center py-4 shrink-0 z-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-lg bg-black/20">
              <Zap size={24} className="text-indigo-300" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-black tracking-tighter leading-none text-white drop-shadow-lg">{t.app_title}</h1>
              <span className="text-[10px] tracking-[0.4em] opacity-60 font-bold text-indigo-200">{t.app_subtitle}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {['zh', 'en'].map((l) => (
              <MagneticButton key={l} onClick={() => setLang(l)} className={`px-3 py-2 rounded-xl border text-xs font-bold ${lang === l ? 'bg-white text-black' : 'bg-black/30 border-white/20 text-white/60 hover:text-white'}`}>
                {TEXTS[l].lang_name}
              </MagneticButton>
            ))}
          </div>
        </header>

        <main className="flex-1 relative flex flex-col justify-center min-h-0 z-10">
          <AnimatePresence mode="wait">
            {status === 'menu' && <MenuMode genres={GENRES_CONFIG} onSelect={onGenreClick} t={t} />}
            {status === 'loading' && (
              <div className="flex flex-col items-center justify-center h-full relative z-20">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <motion.div className="absolute inset-0 border-2 rounded-full mix-blend-screen" animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ borderTopColor: selectedGenre?.colors[0] || '#fff', opacity: 0.8 }} />
                  <div className="text-sm font-black tracking-widest text-white animate-pulse">{t.loading}</div>
                </div>
              </div>
            )}
            {status === 'playing' && storyData && selectedGenre && (
              <StoryMode data={storyData} genre={selectedGenre} t={t} onEnd={onEnd} />
            )}
          </AnimatePresence>
        </main>
      </div>

      <StorySetupModal isOpen={showSetup} onClose={() => setShowSetup(false)} genre={selectedGenre} onConfirm={onSetupConfirm} t={t} />
    </div>
  );
}
