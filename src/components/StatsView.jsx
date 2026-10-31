import React from 'react';
import { Users, Award, MapPin, Calendar, Heart, Layers, Sparkles, TrendingUp } from 'lucide-react';
import { BRANCHES, GENERATION_LABELS } from '../data/initialFamilyData';

export default function StatsView({ members = [], branches = BRANCHES, onFocusBranch }) {
  const totalMembers = members.length;
  const livingCount = members.filter((m) => m.isLiving).length;
  const deceasedCount = totalMembers - livingCount;
  const withPhotosCount = members.filter((m) => Boolean(m.photo)).length;

  // Breakdown by generation
  const genCounts = [1, 2, 3, 4, 5, 6].map((gen) => {
    return {
      gen,
      label: GENERATION_LABELS[gen] || `G${gen}`,
      count: members.filter((m) => m.generation === gen).length
    };
  });

  // Breakdown by branch
  const branchCounts = (branches || BRANCHES).filter((b) => b.id !== 'all').map((b) => {
    const count = members.filter((m) => m.branchId === b.id).length;
    return {
      ...b,
      count
    };
  });

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F7F9F6] p-4 sm:p-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133926] via-[#1b4d3e] to-[#255734] text-amber-50 p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-600/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📊</span>
          <span className="text-xs uppercase tracking-widest font-bold text-amber-300">
            Estatísticas & Legado Familiar
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-wide">
          A Força da Linhagem Visentin
        </h2>
        <p className="text-xs sm:text-sm text-amber-100/80 font-serif-vintage mt-1 max-w-2xl leading-relaxed">
          De um sonho que cruzou o Atlântico com Giuseppe e Catterina e seus 5 filhos, até uma numerosa família de mais de {totalMembers} descendentes espalhados por 6 gerações.
        </p>

        {/* Highlight Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-amber-200 uppercase font-semibold">Total de Membros</span>
            <div className="text-3xl font-bold font-heading text-white mt-1">{totalMembers}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-emerald-200 uppercase font-semibold">Gerações Registradas</span>
            <div className="text-3xl font-bold font-heading text-white mt-1">6</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-amber-200 uppercase font-semibold">Membros Vivos</span>
            <div className="text-3xl font-bold font-heading text-white mt-1">{livingCount}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
            <span className="text-xs text-emerald-200 uppercase font-semibold">Fotos Cadastradas</span>
            <div className="text-3xl font-bold font-heading text-white mt-1">{withPhotosCount}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Branches and Generations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branches of the 5 Immigrant Children */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-stone-900 text-lg flex items-center gap-2">
              <Layers className="text-emerald-800" size={20} />
              Os 5 Ramos dos Filhos Imigrantes
            </h3>
            <span className="text-xs text-stone-500 font-serif-vintage">Descendência por filho</span>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            Cada um dos 5 filhos que imigrou da Itália originou um ramo próspero com netos, mais de 14 bisnetos e gerações seguintes:
          </p>

          <div className="space-y-3 pt-2">
            {branchCounts.map((branch) => {
              const pct = totalMembers > 0 ? Math.round((branch.count / totalMembers) * 100) : 0;
              return (
                <div
                  key={branch.id}
                  onClick={() => onFocusBranch(branch.id)}
                  className="group p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-700 bg-stone-50/50 hover:bg-emerald-50/40 transition cursor-pointer flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌿</span>
                      <div>
                        <h4 className="font-heading font-bold text-stone-800 text-xs sm:text-sm group-hover:text-emerald-950 transition">
                          {branch.name}
                        </h4>
                        <span className="text-[10px] text-stone-500">{branch.patriarch}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-900">{branch.count} membros</span>
                      <span className="block text-[10px] text-stone-400">({pct}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generations Progression */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-stone-900 text-lg flex items-center gap-2">
              <TrendingUp className="text-emerald-800" size={20} />
              Distribuição por Gerações
            </h3>
            <span className="text-xs text-stone-500 font-serif-vintage">Linha do tempo (1850 - 2026)</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {genCounts.map((item) => {
              const pct = totalMembers > 0 ? Math.round((item.count / totalMembers) * 100) : 0;
              return (
                <div key={item.gen} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-800">{item.label}</span>
                    <span className="font-semibold text-emerald-900">
                      {item.count} membros ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-800 to-emerald-600 transition-all duration-500"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Historical Immigration Note Card */}
          <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 font-serif-vintage leading-relaxed">
            <h4 className="font-bold font-heading text-sm text-amber-900 mb-1 flex items-center gap-1.5">
              🇮🇹 Marco Histórico da Família
            </h4>
            <p>
              A família Visentin imigrou da região do Vêneto, Itália, composta originalmente por 7 pessoas: o casal Giuseppe e Catterina Visentin e seus 5 filhos pequenos (Antonio, Giovanni, Maria, Francesco e Lucia). A sua coragem estabeleceu as raízes que hoje florescem em mais de 6 gerações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
