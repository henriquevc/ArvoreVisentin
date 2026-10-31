import React from 'react';
import { Heart, User, ChevronDown, ChevronRight, Plus, Edit2, Calendar, MapPin, Eye } from 'lucide-react';
import { BRANCHES } from '../data/initialFamilyData';

export default function PersonCard({
  person,
  isCollapsed = false,
  hasChildren = false,
  childrenCount = 0,
  isSelected = false,
  onSelect,
  onToggleCollapse,
  onAddChild,
  onEdit,
  onMoveSibling
}) {
  const branch = BRANCHES.find((b) => b.id === person.branchId) || BRANCHES[0];
  const isPatriarch = person.generation === 1;
  const isImmigrantChild = person.generation === 2;

  // Couple Card (Giuseppe & Catterina) at the root
  if (person.isCouple) {
    const giuseppe = person.husband;
    const catarina = person.wife;

    return (
      <div
        className="group relative w-[340px] bg-gradient-to-b from-[#133926] to-[#1a4a33] text-amber-50 rounded-2xl p-4 shadow-2xl border-2 border-amber-500/80 select-none hover:border-amber-400 transition-all hover:scale-[1.01]"
      >
        {/* Top Ribbon */}
        <div className="flex items-center justify-between text-[10px] mb-2">
          <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40 uppercase tracking-widest text-[9px]">
            1ª Geração • Patriarcas Imigrantes
          </span>
          <span className="text-amber-200/80 font-serif-vintage italic text-xs">
            Itália 🇮🇹 1880
          </span>
        </div>

        {/* Both Photos & Couple Title */}
        <div className="grid grid-cols-2 gap-2 my-2.5">
          {/* Giuseppe Side */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              giuseppe && onSelect(giuseppe);
            }}
            className="flex flex-col items-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition cursor-pointer group/g"
            title="Clique para ver ou editar Giuseppe Visentin"
          >
            <div className="relative w-14 h-14 rounded-full border-2 border-amber-400 overflow-hidden bg-stone-900 shadow-md">
              {giuseppe?.photo ? (
                <img src={giuseppe.photo} alt={giuseppe.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-amber-300 text-lg">
                  G
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-white mt-1.5 group-hover/g:text-amber-300 transition truncate max-w-full">
              {giuseppe?.name?.split(' ')[0] || 'Giuseppe'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                giuseppe && onEdit(giuseppe);
              }}
              className="mt-1 text-[10px] text-amber-300 hover:text-white font-semibold flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/40 px-2 py-0.5 rounded-md border border-amber-500/30 transition"
            >
              <Edit2 size={10} /> Editar
            </button>
          </div>

          {/* Catterina Side */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              catarina && onSelect(catarina);
            }}
            className="flex flex-col items-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition cursor-pointer group/c"
            title="Clique para ver ou editar Catterina Visentin"
          >
            <div className="relative w-14 h-14 rounded-full border-2 border-amber-400 overflow-hidden bg-stone-900 shadow-md">
              {catarina?.photo ? (
                <img src={catarina.photo} alt={catarina.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-amber-300 text-lg">
                  C
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-white mt-1.5 group-hover/c:text-amber-300 transition truncate max-w-full">
              {catarina?.name?.split(' ')[0] || 'Catterina'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                catarina && onEdit(catarina);
              }}
              className="mt-1 text-[10px] text-amber-300 hover:text-white font-semibold flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/40 px-2 py-0.5 rounded-md border border-amber-500/30 transition"
            >
              <Edit2 size={10} /> Editar
            </button>
          </div>
        </div>

        <h3 className="font-heading font-black text-sm text-center text-white tracking-wider">
          {giuseppe?.name || 'Giuseppe'} & {catarina?.name || 'Catterina Visentin'}
        </h3>
        <p className="text-[10px] text-amber-200/90 text-center font-serif-vintage mt-0.5">
          Vindos de Treviso, Vêneto com os 5 filhos pequenos
        </p>

        {/* Children toggle badge */}
        <div className="mt-2.5 pt-2 border-t border-amber-500/30 flex items-center justify-between text-xs">
          <span className="text-[11px] text-emerald-200 font-medium">
            Origem dos 5 Ramos
          </span>

          {hasChildren && onToggleCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(person.id);
              }}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded-full text-[10px] transition shadow"
            >
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>{isCollapsed ? 'Expandir 5 Ramos' : 'Recolher Ramos'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Regular Member Card
  const borderTone = isImmigrantChild
    ? 'border-emerald-600 ring-2 ring-emerald-500/20'
    : person.generation === 3
    ? 'border-emerald-700/60'
    : 'border-stone-300';

  return (
    <div
      onClick={() => onSelect(person)}
      className={`group relative w-[240px] bg-white rounded-2xl p-3 shadow-md hover:shadow-2xl transition-all duration-200 border-2 select-none cursor-pointer flex flex-col justify-between ${borderTone} ${
        isSelected ? 'ring-4 ring-emerald-600 shadow-2xl scale-[1.03]' : ''
      }`}
    >
      <div>
        {/* Top Tag Bar */}
        <div className="flex items-center justify-between text-[10px] mb-1.5">
          <span
            className={`font-bold px-2 py-0.5 rounded-full border text-[9px] uppercase tracking-wider ${
              isPatriarch
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : isImmigrantChild
                ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-extrabold'
                : person.generation === 3
                ? 'bg-teal-50 text-teal-900 border-teal-200'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}
          >
            {isImmigrantChild
              ? '2ª Geração • Imigrante'
              : person.generation === 3
              ? '3ª Geração • Neto'
              : person.generation === 4
              ? '4ª Geração • Bisneto'
              : `${person.generation}ª Geração`}
          </span>

          {person.branchId !== 'all' && (
            <span className="text-[9px] text-stone-500 font-semibold truncate max-w-[85px]">
              {person.branchShortName || branch.shortName || branch.patriarch.split(' ')[0]}
            </span>
          )}
        </div>

        {/* Main Row: Circular Photo & Identity */}
        <div className="flex items-center gap-2.5">
          {/* Circular Photo */}
          <div className="relative shrink-0 w-12 h-12 rounded-full border-2 border-amber-500 shadow-md overflow-hidden bg-stone-100 flex items-center justify-center">
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-[#1b4d3e]/10 text-[#1b4d3e] font-serif font-bold text-base flex items-center justify-center">
                {person.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}

            {/* Living indicator dot */}
            <span
              className={`absolute bottom-0 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                person.isLiving ? 'bg-emerald-500' : 'bg-stone-400'
              }`}
              title={person.isLiving ? 'Vivo' : 'Em Memória'}
            />
          </div>

          {/* Name and Dates */}
          <div className="flex-1 min-w-0">
            <h4 className="font-heading font-bold text-stone-900 text-xs leading-snug tracking-wide truncate group-hover:text-emerald-900 transition">
              {person.name}
            </h4>
            {person.maidenName && (
              <p className="text-[9px] text-stone-500 italic truncate font-serif-vintage">
                (n. {person.maidenName})
              </p>
            )}

            <div className="flex items-center gap-1 text-[10px] text-stone-600 mt-0.5">
              <Calendar size={11} className="text-emerald-800 shrink-0" />
              <span className="truncate font-medium">
                {person.birthDate || '?'} {person.deathDate ? `— ${person.deathDate}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Spouse if present */}
        {person.spouseName && (
          <div className="mt-1.5 pt-1 border-t border-stone-100 flex items-center gap-1 text-[10px] text-stone-600 truncate">
            <Heart size={10} className="text-rose-500 shrink-0" />
            <span className="truncate">c/c {person.spouseName}</span>
          </div>
        )}
      </div>

      {/* Bottom Row Actions & Children Expand Toggle */}
      <div className="flex items-center justify-between pt-1.5 border-t border-stone-100 mt-1.5">
        <div className="flex items-center gap-1">
          {/* Quick birth order reorder arrows (◀ ▶) */}
          {onMoveSibling && !person.isCouple && (
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveSibling(person.id, 'left');
                }}
                className="text-[9px] text-stone-600 hover:text-emerald-950 hover:bg-white px-1 py-0.5 rounded transition font-bold"
                title="Mover antes na ordem de nascimento (para a esquerda)"
              >
                ◀
              </button>
              {person.order && (
                <span className="text-[9px] font-bold text-stone-600 px-0.5 select-none" title={`Posição de nascimento: ${person.order}º`}>
                  {person.order}º
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveSibling(person.id, 'right');
                }}
                className="text-[9px] text-stone-600 hover:text-emerald-950 hover:bg-white px-1 py-0.5 rounded transition font-bold"
                title="Mover depois na ordem de nascimento (para a direita)"
              >
                ▶
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(person);
            }}
            className="text-[10px] text-stone-500 hover:text-emerald-800 font-semibold flex items-center gap-0.5 py-0.5 px-1 rounded hover:bg-stone-100"
          >
            <Edit2 size={10} /> Editar
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(person);
            }}
            className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-0.5 py-0.5 px-1.5 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
            title="Adicionar Filho(a)"
          >
            <Plus size={10} /> Filho
          </button>

          {hasChildren && onToggleCollapse && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(person.id);
              }}
              className={`text-[10px] font-bold flex items-center gap-1 py-0.5 px-2 rounded-full border transition ${
                isCollapsed
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={isCollapsed ? 'Expandir descendentes' : 'Recolher descendentes'}
            >
              {isCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
              <span>{isCollapsed ? `+${childrenCount}` : `${childrenCount}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
