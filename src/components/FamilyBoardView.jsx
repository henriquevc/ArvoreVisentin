import React, { useState } from 'react';
import { BRANCHES, sortMembersByOrder } from '../data/initialFamilyData';
import { Users, Heart, Calendar, ChevronRight, Eye, ArrowUpRight, Award, Sparkles } from 'lucide-react';

export default function FamilyBoardView({
  members = [],
  branches: externalBranches,
  onSelectPerson,
  onFocusBranch,
  onMoveSibling
}) {
  const [expandedNetoId, setExpandedNetoId] = useState(null);

  const patriarchs = members.filter((m) => m.generation === 1);
  const giuseppe = patriarchs.find((p) => p.gender === 'M') || patriarchs[0];
  const catarina = patriarchs.find((p) => p.gender === 'F') || patriarchs[1];

  const branches = (externalBranches || BRANCHES).filter((b) => b.id !== 'all');

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F7F9F6] p-4 sm:p-8 space-y-8 select-none">
      {/* Patriarchs Header Banner (Giuseppe & Catarina) */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#133926] via-[#1b4d3e] to-[#255734] text-amber-50 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/60 text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 flex">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-[#ffffff]" />
          <div className="flex-1 bg-[#ce2b37]" />
        </div>

        <span className="inline-block bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full border border-amber-500/40 text-xs uppercase tracking-widest mb-3">
          1ª Geração • Patriarcas Imigrantes da Itália
        </span>

        <h2 className="text-2xl sm:text-4xl font-heading font-black text-white tracking-wider">
          {giuseppe?.name || 'Giuseppe'} & {catarina?.name || 'Catterina Sartori'}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 font-serif-vintage mt-1 max-w-xl mx-auto">
          Partiram de Treviso, Vêneto rumo ao Brasil no final do século XIX acompanhados de seus 5 filhos pequenos.
        </p>

        {/* Portraits */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {/* Giuseppe */}
          <div
            onClick={() => giuseppe && onSelectPerson(giuseppe)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full border-4 border-amber-400 overflow-hidden bg-stone-900 shadow-xl group-hover:scale-105 transition">
              {giuseppe?.photo ? (
                <img src={giuseppe.photo} alt="Giuseppe" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-amber-300 text-2xl">
                  G
                </div>
              )}
            </div>
            <span className="font-heading font-bold text-sm text-white mt-1.5 group-hover:text-amber-300 transition">
              {giuseppe?.name || 'Giuseppe Visentin'}
            </span>
            <span className="text-[11px] text-amber-200/80 font-serif-vintage">
              {giuseppe?.birthDate || '1852'} — {giuseppe?.deathDate || '1927'}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-amber-400 pt-1">
            <Heart size={24} fill="#c89f56" className="text-amber-400" />
            <span className="text-[10px] text-amber-200 font-serif-vintage mt-1">Casados</span>
          </div>

          {/* Catterina */}
          <div
            onClick={() => catarina && onSelectPerson(catarina)}
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full border-4 border-amber-400 overflow-hidden bg-stone-900 shadow-xl group-hover:scale-105 transition">
              {catarina?.photo ? (
                <img src={catarina.photo} alt="Catterina" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-amber-300 text-2xl">
                  C
                </div>
              )}
            </div>
            <span className="font-heading font-bold text-sm text-white mt-1.5 group-hover:text-amber-300 transition">
              {catarina?.name || 'Catterina Visentin'}
            </span>
            <span className="text-[11px] text-amber-200/80 font-serif-vintage">
              {catarina?.birthDate || '1856'} — {catarina?.deathDate || '1934'}
            </span>
          </div>
        </div>
      </div>

      {/* The 5 Branches Columns (Side-by-Side Family Lanes) */}
      <div>
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-emerald-800 font-bold block">
            A Descendência dos 5 Filhos
          </span>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-stone-900">
            Quadro Comparativo dos 5 Ramos da Família Visentin
          </h3>
          <p className="text-xs text-stone-500 font-serif-vintage mt-1">
            Clique em qualquer membro para ver a ficha completa ou em "Ver na Árvore" para navegar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {branches.map((branch, idx) => {
            const branchChild = members.find(
              (m) => m.branchId === branch.id && m.generation === 2
            );
            const netos = members.filter(
              (m) => m.branchId === branch.id && m.generation === 3
            );
            const bisnetos = members.filter(
              (m) => m.branchId === branch.id && m.generation === 4
            );
            const totalBranch = members.filter((m) => m.branchId === branch.id).length;

            return (
              <div
                key={branch.id}
                className="bg-white rounded-3xl border-2 border-stone-200 hover:border-emerald-700 shadow-md flex flex-col justify-between overflow-hidden transition"
              >
                {/* Branch Header */}
                <div className="bg-[#133926] text-amber-50 p-4 border-b border-amber-600/30">
                  <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold mb-1">
                    <span>{idx + 1}º FILHO IMIGRANTE</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-full text-amber-200 font-medium">
                      {totalBranch} membros
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-white tracking-wide truncate">
                    {branch.name.replace('Ramo ', '')}
                  </h4>
                  <p className="text-[11px] text-emerald-200/80 font-serif-vintage">
                    {netos.length} Netos • {bisnetos.length} Bisnetos
                  </p>
                </div>

                {/* Immigrant Child Card (Generation 2) */}
                {branchChild && (
                  <div className="p-3 bg-emerald-50/50 border-b border-stone-200 flex items-center justify-between gap-2 hover:bg-emerald-100/60 transition">
                    <div
                      onClick={() => onSelectPerson(branchChild)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full border-2 border-amber-500 bg-stone-900 shrink-0 flex items-center justify-center font-bold text-base text-amber-300 overflow-hidden shadow">
                        {branchChild.photo ? (
                          <img src={branchChild.photo} alt={branchChild.name} className="w-full h-full object-cover" />
                        ) : (
                          branchChild.name[0]
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase font-bold text-emerald-900 block">
                          {branchChild.order ? `${branchChild.order}º Filho(a)` : 'Filho(a) Imigrante'}
                        </span>
                        <h5 className="font-heading font-bold text-xs text-stone-900 truncate">
                          {branchChild.name}
                        </h5>
                        <p className="text-[10px] text-stone-500">
                          {branchChild.birthDate} {branchChild.deathDate ? `— ${branchChild.deathDate}` : ''}
                        </p>
                      </div>
                    </div>

                    {/* Sibling order buttons ◀ ▶ */}
                    {onMoveSibling && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onMoveSibling(branchChild.id, 'left')}
                          className="px-1.5 py-0.5 bg-white hover:bg-emerald-200 border border-stone-200 rounded text-[9px] font-bold text-stone-700 shadow-sm"
                          title="Mover este ramo para a esquerda"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveSibling(branchChild.id, 'right')}
                          className="px-1.5 py-0.5 bg-white hover:bg-emerald-200 border border-stone-200 rounded text-[9px] font-bold text-stone-700 shadow-sm"
                          title="Mover este ramo para a direita"
                        >
                          ▶
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Netos and Bisnetos Section */}
                <div className="p-3 flex-1 overflow-y-auto max-h-[380px] space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Netos ({netos.length}) & Bisnetos ({bisnetos.length}):
                  </span>

                  {sortMembersByOrder(netos).map((neto) => {
                    const netoBisnetos = sortMembersByOrder(
                      bisnetos.filter((b) => (b.parents || []).includes(neto.id))
                    );
                    const isExpanded = expandedNetoId === neto.id;

                    return (
                      <div
                        key={neto.id}
                        className="bg-stone-50 rounded-xl p-2.5 border border-stone-200 hover:border-emerald-600 transition"
                      >
                        <div
                          onClick={() => onSelectPerson(neto)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <h6 className="font-heading font-bold text-xs text-stone-900 truncate hover:text-emerald-900">
                              {neto.name}
                            </h6>
                            <p className="text-[10px] text-stone-500">
                              {neto.birthDate || '?'} {neto.spouseName ? `• c/c ${neto.spouseName.split(' ')[0]}` : ''}
                            </p>
                          </div>

                          {netoBisnetos.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedNetoId(isExpanded ? null : neto.id);
                              }}
                              className="text-[9px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-full shrink-0"
                            >
                              {isExpanded ? 'Recolher' : `+${netoBisnetos.length} Bisn.`}
                            </button>
                          )}
                        </div>

                        {/* Expandable Bisnetos List */}
                        {isExpanded && netoBisnetos.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-stone-200 space-y-1 animate-in fade-in duration-200">
                            {netoBisnetos.map((bisneto) => (
                              <div
                                key={bisneto.id}
                                onClick={() => onSelectPerson(bisneto)}
                                className="flex items-center justify-between p-1 rounded hover:bg-white text-[11px] text-stone-700 cursor-pointer"
                              >
                                <span className="truncate">• {bisneto.name}</span>
                                <span className="text-[10px] text-stone-400 shrink-0">
                                  {bisneto.birthDate || ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action: Zoom into branch */}
                <div className="p-3 bg-stone-50 border-t border-stone-200">
                  <button
                    onClick={() => onFocusBranch(branch.id)}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#1b4d3e] hover:bg-[#133926] text-amber-50 py-2 px-3 rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <span>Ver Árvore deste Ramo</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
