import React, { useState, useEffect } from 'react';
import { X, Sparkles, ChevronLeft, ChevronRight, Maximize2, Minimize2, Users, Heart, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BRANCHES, GENERATION_LABELS } from '../data/initialFamilyData';

export default function PartyPresentationModal({ isOpen, onClose, members = [], branches = BRANCHES, onSelectPerson }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pioneer 7 immigrants
  const pioneers = members.filter((m) => m.generation === 1 || m.generation === 2);

  // Available presentation slides:
  // Slide 0: Welcome / Encontro da Família Visentin
  // Slide 1: Os 7 Imigrantes Originais (Giuseppe, Catterina e os 5 filhos)
  // Slides 2-6: Each of the 5 branches
  // Slide 7: A Grande Celebração das 6 Gerações
  const slides = [
    {
      id: 'welcome',
      title: 'Benvenuti alla Festa della Famiglia Visentin',
      subtitle: 'Nossas Raízes, Nossa História e Nosso Legado',
      type: 'welcome'
    },
    {
      id: 'pioneers',
      title: 'Os 7 Imigrantes que Cruzaram o Oceano',
      subtitle: 'Giuseppe, Catterina e os 5 filhos que plantaram esta árvore',
      type: 'pioneers'
    },
    ...(branches || BRANCHES).filter((b) => b.id !== 'all').map((branch) => ({
      id: `branch-${branch.id}`,
      title: branch.name,
      subtitle: branch.patriarch,
      branchId: branch.id,
      type: 'branch',
      description: branch.description
    })),
    {
      id: 'legacy',
      title: '6 Gerações de Amor, Trabalho e União',
      subtitle: 'Brindamos a todos os descendentes presentes e em memória',
      type: 'legacy'
    }
  ];

  const currentSlide = slides[currentSlideIndex];

  // Fire confetti
  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#009246', '#ffffff', '#ce2b37', '#c89f56', '#2d5a37']
    });
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, onClose]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c2419] text-amber-50 flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-300">
      {/* Italian tricolor top strip */}
      <div className="h-2 w-full flex shrink-0">
        <div className="flex-1 bg-[#009246]" />
        <div className="flex-1 bg-[#ffffff]" />
        <div className="flex-1 bg-[#ce2b37]" />
      </div>

      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-emerald-900/50 bg-[#091b13]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌳</span>
          <div>
            <h1 className="text-lg font-heading font-bold text-amber-200 tracking-wider">
              FESTA DA FAMÍLIA VISENTIN
            </h1>
            <p className="text-[11px] text-emerald-300/80 font-serif-vintage tracking-wide">
              Modo Apresentação • Slide {currentSlideIndex + 1} de {slides.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fireConfetti}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl shadow-lg transition text-xs"
          >
            <Sparkles size={16} /> Celebrar com Chuva de Confetes!
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-stone-300 hover:text-white rounded-xl hover:bg-white/10 transition"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded-xl hover:bg-white/10 transition"
            title="Fechar"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        {/* SLIDE: WELCOME */}
        {currentSlide.type === 'welcome' && (
          <div className="max-w-4xl text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="inline-block p-4 rounded-full bg-emerald-900/60 border-2 border-amber-500/50 shadow-2xl">
              <span className="text-6xl sm:text-7xl">🇮🇹</span>
            </div>

            <div className="space-y-4">
              <span className="text-xs sm:text-sm uppercase tracking-[0.3em] font-bold text-amber-400">
                Encontro & Festa da Família
              </span>
              <h1 className="text-3xl sm:text-6xl font-heading font-black text-amber-50 tracking-wide drop-shadow-md">
                Família Visentin
              </h1>
              <p className="text-lg sm:text-2xl text-emerald-200/90 font-serif-vintage italic max-w-2xl mx-auto leading-relaxed">
                "Honrando nossas raízes italianas, celebrando os que vieram antes e acolhendo as novas gerações que continuam nossa história."
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-6 text-center">
              <div className="bg-[#133926]/80 border border-emerald-700/40 p-4 rounded-2xl">
                <span className="text-2xl font-bold font-heading text-amber-300">1880s</span>
                <p className="text-xs text-stone-300 mt-1">Imigração da Itália</p>
              </div>
              <div className="bg-[#133926]/80 border border-emerald-700/40 p-4 rounded-2xl">
                <span className="text-2xl font-bold font-heading text-amber-300">7</span>
                <p className="text-xs text-stone-300 mt-1">Pioneiros Imigrantes</p>
              </div>
              <div className="bg-[#133926]/80 border border-emerald-700/40 p-4 rounded-2xl">
                <span className="text-2xl font-bold font-heading text-amber-300">5</span>
                <p className="text-xs text-stone-300 mt-1">Grandes Ramos</p>
              </div>
              <div className="bg-[#133926]/80 border border-emerald-700/40 p-4 rounded-2xl">
                <span className="text-2xl font-bold font-heading text-amber-300">6</span>
                <p className="text-xs text-stone-300 mt-1">Gerações Unidas</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  fireConfetti();
                  setCurrentSlideIndex(1);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3.5 rounded-2xl text-base shadow-xl transition"
              >
                Iniciar Apresentação da Família →
              </button>
            </div>
          </div>
        )}

        {/* SLIDE: PIONEERS (THE 7 IMMIGRANTS) */}
        {currentSlide.type === 'pioneers' && (
          <div className="max-w-5xl w-full text-center space-y-8 animate-in fade-in duration-500">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                A Origem
              </span>
              <h2 className="text-2xl sm:text-4xl font-heading font-bold text-white mt-1">
                Os 7 Imigrantes que Vieram da Itália
              </h2>
              <p className="text-sm text-emerald-200 font-serif-vintage mt-1">
                Os pais Giuseppe e Catterina Visentin e seus 5 filhos
              </p>
            </div>

            {/* Patriarchs (Giuseppe & Catarina) */}
            <div className="flex flex-wrap justify-center gap-6">
              {pioneers
                .filter((p) => p.generation === 1)
                .map((patriarch) => (
                  <div
                    key={patriarch.id}
                    onClick={() => onSelectPerson(patriarch)}
                    className="w-64 bg-[#143b27] border-2 border-amber-500/60 p-4 rounded-2xl shadow-xl text-center cursor-pointer hover:scale-105 transition"
                  >
                    <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-400 overflow-hidden bg-stone-900 mb-3 shadow">
                      {patriarch.photo ? (
                        <img src={patriarch.photo} alt={patriarch.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-amber-300">
                          {patriarch.name[0]}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                      {patriarch.gender === 'M' ? 'Patriarca' : 'Matriarca'}
                    </span>
                    <h3 className="font-heading font-bold text-base text-white mt-1.5 truncate">
                      {patriarch.name}
                    </h3>
                    <p className="text-xs text-stone-300 font-serif-vintage">{patriarch.birthDate} — {patriarch.deathDate || '?'}</p>
                    <p className="text-[11px] text-emerald-300 mt-1">📍 Treviso, Vêneto, Itália</p>
                  </div>
                ))}
            </div>

            {/* The 5 Children */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-4">
                Os 5 Filhos Imigrantes (Origem dos 5 Ramos):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {pioneers
                  .filter((p) => p.generation === 2)
                  .map((child, idx) => (
                    <div
                      key={child.id}
                      onClick={() => onSelectPerson(child)}
                      className="bg-[#123623] border border-emerald-600/40 p-3.5 rounded-2xl hover:border-amber-400 transition cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full border-2 border-emerald-400 bg-stone-900 flex items-center justify-center font-bold text-sm text-emerald-200 mb-2">
                        {child.photo ? (
                          <img src={child.photo} alt={child.name} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          child.name[0]
                        )}
                      </div>
                      <span className="text-[9px] text-amber-300 font-bold block">{idx + 1}º Filho</span>
                      <h5 className="font-heading font-bold text-xs text-white truncate mt-0.5">
                        {child.name.split(' ')[0]}
                      </h5>
                      <p className="text-[10px] text-stone-400 font-serif-vintage">{child.birthDate}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE: SPECIFIC BRANCH (1 OF THE 5 CHILDREN) */}
        {currentSlide.type === 'branch' && (
          <div className="max-w-5xl w-full space-y-6 animate-in fade-in duration-500">
            {(() => {
              const branchMembers = members.filter((m) => m.branchId === currentSlide.branchId);
              const branchChild = members.find(
                (m) => m.branchId === currentSlide.branchId && m.generation === 2
              );
              const bisnetosCount = branchMembers.filter((m) => m.generation === 4).length;

              return (
                <div className="space-y-6">
                  {/* Branch Title & Header */}
                  <div className="text-center space-y-2">
                    <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">
                      Homenagem ao Ramo Familiar
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-heading font-black text-white">
                      {currentSlide.title}
                    </h2>
                    <p className="text-base text-emerald-200 font-serif-vintage">
                      {currentSlide.subtitle} • {branchMembers.length} descendentes nesta linhagem
                    </p>
                  </div>

                  {/* Branch Stats Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="bg-[#143b27] border border-emerald-600/40 p-4 rounded-2xl">
                      <span className="text-xs text-stone-300 uppercase">Total do Ramo</span>
                      <div className="text-2xl font-bold font-heading text-amber-300 mt-1">
                        {branchMembers.length}
                      </div>
                    </div>
                    <div className="bg-[#143b27] border border-emerald-600/40 p-4 rounded-2xl">
                      <span className="text-xs text-stone-300 uppercase">Bisnetos</span>
                      <div className="text-2xl font-bold font-heading text-amber-300 mt-1">
                        {bisnetosCount} bisnetos
                      </div>
                    </div>
                    <div className="bg-[#143b27] border border-emerald-600/40 p-4 rounded-2xl">
                      <span className="text-xs text-stone-300 uppercase">Vivos Hoje</span>
                      <div className="text-2xl font-bold font-heading text-amber-300 mt-1">
                        {branchMembers.filter((m) => m.isLiving).length}
                      </div>
                    </div>
                    <div className="bg-[#143b27] border border-emerald-600/40 p-4 rounded-2xl">
                      <span className="text-xs text-stone-300 uppercase">Gerações</span>
                      <div className="text-2xl font-bold font-heading text-amber-300 mt-1">
                        Até 6ª Geração
                      </div>
                    </div>
                  </div>

                  {/* Showcase of Founder of this branch */}
                  {branchChild && (
                    <div className="bg-[#143b27]/90 border-2 border-amber-500/40 p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-24 h-24 rounded-full border-4 border-amber-400 bg-stone-900 shrink-0 flex items-center justify-center font-bold text-3xl text-amber-200 overflow-hidden shadow-xl">
                        {branchChild.photo ? (
                          <img src={branchChild.photo} alt={branchChild.name} className="w-full h-full object-cover" />
                        ) : (
                          branchChild.name[0]
                        )}
                      </div>
                      <div className="text-center sm:text-left flex-1 min-w-0">
                        <span className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">
                          Patriarca deste Ramo
                        </span>
                        <h3 className="text-2xl font-heading font-bold text-white">
                          {branchChild.name}
                        </h3>
                        <p className="text-xs text-stone-300 mt-0.5">
                          {branchChild.birthDate} — {branchChild.deathDate || ''} {branchChild.spouseName ? `• Casado com ${branchChild.spouseName}` : ''}
                        </p>
                        {branchChild.bio && (
                          <p className="text-xs text-emerald-100/90 font-serif-vintage mt-2 italic leading-relaxed">
                            "{branchChild.bio}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Toast to this branch button */}
                  <div className="text-center pt-2">
                    <button
                      onClick={fireConfetti}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow transition inline-flex items-center gap-2"
                    >
                      <Sparkles size={16} /> Um brinde à Família {currentSlide.title.replace('Ramo ', '')}! 🥂
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SLIDE: LEGACY & CLOSING */}
        {currentSlide.type === 'legacy' && (
          <div className="max-w-4xl text-center space-y-8 animate-in zoom-in-95 duration-500">
            <span className="text-6xl sm:text-7xl block">🥂</span>
            <div className="space-y-4">
              <span className="text-xs sm:text-sm uppercase tracking-widest font-bold text-amber-400">
                Viva a Família Visentin!
              </span>
              <h2 className="text-3xl sm:text-5xl font-heading font-black text-white">
                "Uma árvore frondosa, com raízes profundas na Itália e flores eternas no Brasil."
              </h2>
              <p className="text-base sm:text-xl text-emerald-200 font-serif-vintage max-w-2xl mx-auto leading-relaxed">
                Que os laços de afeto, trabalho e tradição continuem nos unindo por muitas e muitas gerações.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <button
                onClick={fireConfetti}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-stone-950 font-bold px-8 py-4 rounded-2xl text-base shadow-2xl transition flex items-center gap-2"
              >
                <Sparkles size={20} /> Chuva de Confetes da Família! 🎉
              </button>
              <button
                onClick={() => setCurrentSlideIndex(0)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-2xl text-sm font-semibold transition"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Slide Controls */}
      <div className="px-6 py-4 bg-[#091b13]/80 backdrop-blur-md border-t border-emerald-900/50 flex items-center justify-between">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            currentSlideIndex === 0
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-white/10 text-white cursor-pointer'
          }`}
        >
          <ChevronLeft size={16} /> Slide Anterior
        </button>

        {/* Slide Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentSlideIndex
                  ? 'w-7 bg-amber-400'
                  : 'w-2.5 bg-emerald-900 hover:bg-emerald-700'
              }`}
              title={s.title}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            currentSlideIndex === slides.length - 1
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:bg-white/10 text-white cursor-pointer'
          }`}
        >
          Próximo Slide <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
