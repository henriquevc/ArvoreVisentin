import React from 'react';
import { X, Edit3, UserPlus, Heart, Calendar, MapPin, Layers, Award, Sparkles, Compass, ArrowUpDown } from 'lucide-react';
import { BRANCHES, GENERATION_LABELS, sortMembersByOrder } from '../data/initialFamilyData';

export default function PersonDetailDrawer({
  person,
  allMembers = [],
  branches = BRANCHES,
  onClose,
  onEdit,
  onAddChild,
  onAddSpouse,
  onSelectPerson,
  onFocusBranch,
  onMoveSibling
}) {
  if (!person) return null;

  const branch = (branches || BRANCHES).find((b) => b.id === person.branchId) || (branches || BRANCHES)[0];

  // Find parents
  const parents = (person.parents || [])
    .map((pid) => allMembers.find((m) => m.id === pid))
    .filter(Boolean);

  // Find children
  const children = allMembers.filter((m) => (m.parents || []).includes(person.id));

  // Build Lineage Trail (Ancestry up to G1)
  const getLineagePath = (curr) => {
    const path = [curr];
    let step = curr;
    while (step && step.parents && step.parents.length > 0) {
      const parent = allMembers.find((m) => m.id === step.parents[0]);
      if (parent && !path.some((p) => p.id === parent.id)) {
        path.unshift(parent);
        step = parent;
      } else {
        break;
      }
    }
    return path;
  };

  const lineage = getLineagePath(person);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-[#FAF9F5] shadow-2xl border-l-2 border-[#1e4d2b]/30 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Top Banner with Italian Crest & Branch Accent */}
      <div className="relative bg-gradient-to-r from-[#133926] via-[#1b4d3e] to-[#255734] text-amber-50 p-6 pt-7 border-b border-amber-600/30 overflow-hidden">
        <div className="absolute top-2 right-2">
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Small subtle Italian tricolor accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-[#009246]" />
          <div className="flex-1 bg-[#ffffff]" />
          <div className="flex-1 bg-[#ce2b37]" />
        </div>

        <div className="flex items-center gap-4 mt-2">
          {/* Circular Photo with Gold/Emerald Border */}
          <div className="relative shrink-0 w-24 h-24 rounded-full border-4 border-amber-500 shadow-xl overflow-hidden bg-stone-800 flex items-center justify-center">
            {person.photo ? (
              <img
                src={person.photo}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-3xl text-amber-200/90 font-serif font-bold">
                {person.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}
            {/* Laurel badge for immigrants */}
            {person.generation === 1 && (
              <div
                className="absolute bottom-0 inset-x-0 bg-amber-600 text-amber-50 text-[9px] font-bold text-center py-0.5"
                title="Patriarca Imigrante"
              >
                PATRIARCA
              </div>
            )}
            {person.generation === 2 && (
              <div
                className="absolute bottom-0 inset-x-0 bg-emerald-700 text-emerald-50 text-[9px] font-bold text-center py-0.5"
                title="Filho Imigrante"
              >
                IMIGRANTE
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-amber-300 mb-0.5">
              {GENERATION_LABELS[person.generation] || `${person.generation}ª Geração`}
            </span>
            <h2 className="text-xl font-heading font-bold text-white tracking-wide truncate">
              {person.name}
            </h2>
            {person.maidenName && (
              <p className="text-xs text-amber-200/80 font-serif-vintage italic">
                (nascida {person.maidenName})
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${branch.bgBadge}`}>
                {branch.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Lineage Trail */}
        {lineage.length > 1 && (
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2">
              <Compass size={14} /> Linhagem Direta
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-700">
              {lineage.map((anc, idx) => (
                <React.Fragment key={anc.id}>
                  <button
                    onClick={() => onSelectPerson(anc)}
                    className={`px-2 py-0.5 rounded-md transition ${
                      anc.id === person.id
                        ? 'bg-emerald-800 text-white font-bold'
                        : 'bg-stone-100 hover:bg-emerald-100 text-stone-800 hover:text-emerald-900 font-medium'
                    }`}
                  >
                    {anc.name}
                  </button>
                  {idx < lineage.length - 1 && <span className="text-stone-400">›</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Vital Info: Birth, Death, Origin */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm space-y-2.5 text-xs text-stone-700">
          <div className="flex items-start gap-2.5">
            <Calendar size={15} className="text-emerald-800 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900">Nascimento: </span>
              <span>{person.birthDate || 'Data desconhecida'}</span>
              {person.birthPlace && (
                <span className="text-stone-500"> ({person.birthPlace})</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin size={15} className="text-stone-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900">Falecimento: </span>
              {person.isLiving ? (
                <span className="text-emerald-700 font-semibold">● Vivo(a)</span>
              ) : (
                <>
                  <span>{person.deathDate || 'Em memória'}</span>
                  {person.deathPlace && (
                    <span className="text-stone-500"> ({person.deathPlace})</span>
                  )}
                </>
              )}
            </div>
          </div>

          {person.spouseName && (
            <div className="flex items-start gap-2.5 pt-1 border-t border-stone-100">
              <Heart size={15} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Cônjuge: </span>
                <span className="font-medium text-stone-800">{person.spouseName}</span>
              </div>
            </div>
          )}

          {/* Birth Order Controls */}
          {person.generation > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div>
                <span className="font-semibold text-stone-900">Ordem de Nascimento: </span>
                <span className="font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {person.order ? `${person.order}º filho(a)` : 'Livre'}
                </span>
              </div>
              {onMoveSibling && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveSibling(person.id, 'left')}
                    className="px-2 py-1 bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-950 rounded-lg text-xs font-bold transition border border-stone-200"
                    title="Mover antes na ordem de nascimento"
                  >
                    ◀ Antes
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSibling(person.id, 'right')}
                    className="px-2 py-1 bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-950 rounded-lg text-xs font-bold transition border border-stone-200"
                    title="Mover depois na ordem de nascimento"
                  >
                    Depois ▶
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Parents & Children */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Parents */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
              Pais
            </span>
            {parents.length > 0 ? (
              <div className="space-y-1.5">
                {parents.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectPerson(p)}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-emerald-50 text-xs font-semibold text-emerald-950 truncate transition block"
                  >
                    👤 {p.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">Patriarcas da linhagem</p>
            )}
          </div>

          {/* Children with Reorder Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Filhos ({children.length})
              </span>
              <button
                onClick={() => onAddChild(person)}
                className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 px-2 py-0.5 rounded-md"
              >
                + Adicionar
              </button>
            </div>
            {children.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1">
                {sortMembersByOrder(children).map((c, idx) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-1 rounded hover:bg-emerald-50 text-xs text-stone-800 transition group/child"
                  >
                    <button
                      onClick={() => onSelectPerson(c)}
                      className="flex-1 text-left truncate hover:text-emerald-900 font-medium"
                    >
                      <span className="text-stone-400 font-bold mr-1 text-[10px]">
                        {c.order ? `${c.order}º` : `${idx + 1}º`}
                      </span>
                      {c.name}
                    </button>
                    {onMoveSibling && (
                      <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover/child:opacity-100">
                        <button
                          type="button"
                          onClick={() => onMoveSibling(c.id, 'left')}
                          className="p-1 hover:bg-emerald-200 rounded text-[9px] text-stone-600 hover:text-stone-900 font-bold"
                          title="Mover para cima/antes"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => onMoveSibling(c.id, 'right')}
                          className="p-1 hover:bg-emerald-200 rounded text-[9px] text-stone-600 hover:text-stone-900 font-bold"
                          title="Mover para baixo/depois"
                        >
                          ▼
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">Nenhum filho cadastrado</p>
            )}
          </div>
        </div>

        {/* Bio / Anecdotes / History */}
        {person.bio && (
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-2">
              <Sparkles size={14} /> Memórias & História
            </span>
            <p className="text-xs text-stone-700 leading-relaxed font-serif-vintage whitespace-pre-line text-justify">
              "{person.bio}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="bg-stone-100 p-4 border-t border-stone-200 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(person)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1b4d3e] hover:bg-[#133926] text-amber-50 py-2.5 px-4 rounded-xl font-medium text-xs shadow-sm transition"
          >
            <Edit3 size={15} /> Editar Dados & Foto
          </button>
          <button
            onClick={() => onAddChild(person)}
            className="flex items-center justify-center gap-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 py-2.5 px-3 rounded-xl font-medium text-xs transition shadow-sm"
            title="Adicionar Filho(a)"
          >
            <UserPlus size={15} /> + Filho
          </button>
        </div>

        {person.branchId !== 'all' && (
          <button
            onClick={() => {
              onFocusBranch(person.branchId);
              onClose();
            }}
            className="w-full text-center text-xs text-emerald-900 hover:text-emerald-950 font-semibold py-1.5 rounded-lg hover:bg-emerald-100/60 transition"
          >
            🌿 Filtrar Árvore pelo {branch.name}
          </button>
        )}
      </div>
    </div>
  );
}
