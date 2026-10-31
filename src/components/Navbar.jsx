import React, { useState } from 'react';
import {
  TreePine,
  BookOpen,
  BarChart2,
  Sparkles,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  Layers,
  ChevronDown,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { BRANCHES } from '../data/initialFamilyData';

export default function Navbar({
  currentView,
  setCurrentView,
  activeBranch,
  setActiveBranch,
  branches = BRANCHES,
  onAddNewMember,
  onOpenPartyMode,
  onExportBackup,
  onImportBackup,
  onResetData,
  onExportPng
}) {
  const [isBackupMenuOpen, setIsBackupMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#133926] text-amber-50 shadow-xl border-b border-amber-600/30">
      {/* Italian Tricolor Ribbon Bar */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#009246]" />
        <div className="flex-1 bg-[#ffffff]" />
        <div className="flex-1 bg-[#ce2b37]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Brand & Crest */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setCurrentView('tree')}>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg border border-amber-300 text-stone-950 font-black text-xl sm:text-2xl">
              🌿
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-base sm:text-xl text-amber-100 tracking-wider">
                  FAMÍLIA VISENTIN
                </h1>
                <span className="hidden sm:inline-block text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold uppercase tracking-wider">
                  Itália 1880
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-serif-vintage tracking-wide hidden sm:block">
                Árvore Genealógica • 6 Gerações • Giuseppe & Catterina
              </p>
            </div>
          </div>

          {/* Center Views Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#0e291b] p-1.5 rounded-2xl border border-emerald-800/60">
            <button
              onClick={() => setCurrentView('tree')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'tree'
                  ? 'bg-[#1b4d3e] text-amber-200 shadow-md border border-emerald-600/40'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <TreePine size={16} /> Árvore Visual
            </button>

            <button
              onClick={() => setCurrentView('directory')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'directory'
                  ? 'bg-[#1b4d3e] text-amber-200 shadow-md border border-emerald-600/40'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen size={16} /> Livro da Família
            </button>

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                currentView === 'stats'
                  ? 'bg-[#1b4d3e] text-amber-200 shadow-md border border-emerald-600/40'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart2 size={16} /> Estatísticas
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Presentation / Party Mode Button */}
            <button
              onClick={onOpenPartyMode}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs shadow-lg transition animate-pulse"
              title="Apresentar na TV/Festa da Família"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">Modo Festa</span>
            </button>

            {/* Add Member Button */}
            <button
              onClick={onAddNewMember}
              className="flex items-center gap-1.5 bg-[#1b4d3e] hover:bg-[#153e32] text-amber-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold border border-emerald-600/40 shadow-sm transition"
              title="Cadastrar novo membro na árvore"
            >
              <UserPlus size={16} />
              <span className="hidden lg:inline">+ Novo Membro</span>
            </button>

            {/* Backup / Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsBackupMenuOpen((prev) => !prev)}
                className="flex items-center gap-1 bg-[#0e291b] hover:bg-[#153e32] text-stone-300 hover:text-white p-2 sm:px-3 sm:py-2.5 rounded-xl text-xs font-medium border border-emerald-800/60 transition"
                title="Opções de Backup e Arquivo"
              >
                <Download size={16} />
                <span className="hidden xl:inline">Backup</span>
                <ChevronDown size={14} />
              </button>

              {isBackupMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsBackupMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-[#FAF9F5] text-stone-800 rounded-2xl shadow-2xl border border-stone-300 py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-stone-200">
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        Gerenciar Dados da Árvore
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsBackupMenuOpen(false);
                        onExportBackup();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-stone-700 hover:text-emerald-950 flex items-center gap-2"
                    >
                      <Download size={14} className="text-emerald-800" />
                      Baixar Backup (JSON)
                    </button>

                    <label className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-stone-700 hover:text-emerald-950 flex items-center gap-2 cursor-pointer">
                      <Upload size={14} className="text-emerald-800" />
                      Carregar Backup (JSON)
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          setIsBackupMenuOpen(false);
                          onImportBackup(e);
                        }}
                        className="hidden"
                      />
                    </label>

                    {onExportPng && (
                      <button
                        onClick={() => {
                          setIsBackupMenuOpen(false);
                          onExportPng();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-xs font-semibold text-stone-700 hover:text-emerald-950 flex items-center gap-2"
                      >
                        <FileText size={14} className="text-emerald-800" />
                        Salvar Imagem da Árvore
                      </button>
                    )}

                    <div className="border-t border-stone-200 my-1" />

                    <button
                      onClick={() => {
                        setIsBackupMenuOpen(false);
                        onResetData();
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Restaurar Dados Originais
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 text-stone-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Sub-bar: Branch Filter Selector (Allows filtering by family branch!) */}
        <div className="py-2.5 border-t border-emerald-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-amber-300 font-semibold mr-1">
            <Layers size={14} />
            <span className="hidden sm:inline">Exibir:</span>
          </div>

          {(branches || BRANCHES).map((branch) => {
            const isActive = activeBranch === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => {
                  setActiveBranch(branch.id);
                  if (currentView !== 'tree') {
                    setCurrentView('tree');
                  }
                }}
                className={`shrink-0 px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-md font-bold'
                    : 'bg-[#0e291b] hover:bg-[#163f2a] text-stone-300 border-emerald-800/40'
                }`}
              >
                {branch.name}
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-900/60 flex flex-col gap-2">
            <button
              onClick={() => {
                setCurrentView('tree');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/10"
            >
              🌳 Árvore Visual
            </button>
            <button
              onClick={() => {
                setCurrentView('directory');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/10"
            >
              📖 Livro da Família
            </button>
            <button
              onClick={() => {
                setCurrentView('stats');
                setIsMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg text-sm font-semibold hover:bg-white/10"
            >
              📊 Estatísticas & Legado
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
