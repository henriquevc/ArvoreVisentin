import React, { useState, useMemo } from 'react';
import { Search, Filter, UserPlus, Heart, Calendar, MapPin, Layers, Award, Sparkles } from 'lucide-react';
import { BRANCHES, GENERATION_LABELS } from '../data/initialFamilyData';

export default function DirectoryView({
  members = [],
  branches = BRANCHES,
  onSelectPerson,
  onEditPerson,
  onAddChild,
  onAddNewMember
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedGen, setSelectedGen] = useState('all');
  const [onlyLiving, setOnlyLiving] = useState(false);
  const [hasPhotoOnly, setHasPhotoOnly] = useState(false);
  const [sortBy, setSortBy] = useState('generation'); // 'generation', 'name', 'birthYear'

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchSpouse = (m.spouseName || '').toLowerCase().includes(q);
          const matchPlace = (m.birthPlace || '').toLowerCase().includes(q);
          const matchBio = (m.bio || '').toLowerCase().includes(q);
          if (!matchName && !matchSpouse && !matchPlace && !matchBio) {
            return false;
          }
        }

        // Branch filter
        if (selectedBranch !== 'all') {
          if (m.branchId !== selectedBranch && m.generation !== 1) {
            return false;
          }
        }

        // Generation filter
        if (selectedGen !== 'all') {
          if (m.generation !== parseInt(selectedGen, 10)) {
            return false;
          }
        }

        // Living only
        if (onlyLiving && !m.isLiving) {
          return false;
        }

        // Photo only
        if (hasPhotoOnly && !m.photo) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'generation') {
          if (a.generation !== b.generation) return a.generation - b.generation;
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'birthYear') {
          const yearA = parseInt(a.birthDate, 10) || 9999;
          const yearB = parseInt(b.birthDate, 10) || 9999;
          return yearA - yearB;
        }
        return 0;
      });
  }, [members, searchTerm, selectedBranch, selectedGen, onlyLiving, hasPhotoOnly, sortBy]);

  return (
    <div className="w-full h-full overflow-y-auto bg-[#F7F9F6] p-4 sm:p-8 flex flex-col gap-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#133926] via-[#1b4d3e] to-[#255734] text-amber-50 p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-600/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📖</span>
            <span className="text-xs uppercase tracking-widest font-bold text-amber-300">
              Livro da Família Visentin
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-wide">
            Diretório de Todos os Membros
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/80 font-serif-vintage mt-1 max-w-xl">
            Consulte todas as 6 gerações, pesquise parentes pelo nome, ramo familiar ou localidade.
          </p>
        </div>

        <button
          onClick={onAddNewMember}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-5 py-3 rounded-2xl shadow-lg transition"
        >
          <UserPlus size={18} /> Adicionar Novo Membro
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome, cônjuge, cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none text-xs sm:text-sm font-medium bg-stone-50/50"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-emerald-700 outline-none"
          >
            {(branches || BRANCHES).map((b) => (
              <option key={b.id} value={b.id}>
                {b.id === 'all' ? 'Todos os Ramos' : b.name}
              </option>
            ))}
          </select>

          {/* Generation */}
          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value)}
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-emerald-700 outline-none"
          >
            <option value="all">Todas as Gerações</option>
            <option value="1">1ª Geração (Patriarcas)</option>
            <option value="2">2ª Geração (Filhos)</option>
            <option value="3">3ª Geração (Netos)</option>
            <option value="4">4ª Geração (Bisnetos)</option>
            <option value="5">5ª Geração (Trinetos)</option>
            <option value="6">6ª Geração (Tetranetos)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-300 bg-white focus:border-emerald-700 outline-none"
          >
            <option value="generation">Ordenar: Geração</option>
            <option value="name">Ordenar: Nome A-Z</option>
            <option value="birthYear">Ordenar: Nascimento</option>
          </select>

          {/* Toggles */}
          <label className="flex items-center gap-1.5 text-xs text-stone-700 font-medium px-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyLiving}
              onChange={(e) => setOnlyLiving(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-700"
            />
            <span>Apenas Vivos</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-stone-700 font-medium px-2 py-1 cursor-pointer">
            <input
              type="checkbox"
              checked={hasPhotoOnly}
              onChange={(e) => setHasPhotoOnly(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-700"
            />
            <span>Com Foto</span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>Mostrando {filteredMembers.length} de {members.length} membros familiares</span>
        {(searchTerm || selectedBranch !== 'all' || selectedGen !== 'all' || onlyLiving || hasPhotoOnly) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedBranch('all');
              setSelectedGen('all');
              setOnlyLiving(false);
              setHasPhotoOnly(false);
            }}
            className="text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Grid of Members Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((person) => {
          const branch = (branches || BRANCHES).find((b) => b.id === person.branchId) || (branches || BRANCHES)[0];
          const isPatriarch = person.generation === 1;

          return (
            <div
              key={person.id}
              onClick={() => onSelectPerson(person)}
              className="group bg-white rounded-2xl p-4 border-2 border-stone-200 hover:border-emerald-700 shadow-sm hover:shadow-xl transition flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Generation & Branch Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {GENERATION_LABELS[person.generation] || `G${person.generation}`}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${branch.bgBadge}`}>
                    {branch.patriarch.split(' ')[0]}
                  </span>
                </div>

                {/* Photo & Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0 w-14 h-14 rounded-full border-2 border-amber-600 shadow-md overflow-hidden bg-stone-100 flex items-center justify-center">
                    {person.photo ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-emerald-900 font-serif font-bold text-lg">
                        {person.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-bold text-stone-900 text-sm group-hover:text-emerald-900 transition truncate">
                      {person.name}
                    </h3>
                    {person.maidenName && (
                      <p className="text-[10px] text-stone-500 italic font-serif-vintage truncate">
                        (n. {person.maidenName})
                      </p>
                    )}
                    <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} className="text-emerald-800 shrink-0" />
                      <span>{person.birthDate || '?'} {person.deathDate ? `— ${person.deathDate}` : ''}</span>
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-1 text-[11px] text-stone-600 pt-2 border-t border-stone-100">
                  {person.spouseName && (
                    <p className="truncate flex items-center gap-1">
                      <Heart size={11} className="text-rose-500 shrink-0" />
                      <span>c/c {person.spouseName}</span>
                    </p>
                  )}
                  {person.birthPlace && (
                    <p className="truncate flex items-center gap-1">
                      <MapPin size={11} className="text-stone-400 shrink-0" />
                      <span>{person.birthPlace}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="pt-3 border-t border-stone-100 mt-3 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPerson(person);
                  }}
                  className="text-stone-500 hover:text-emerald-800 font-semibold text-[11px]"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(person);
                  }}
                  className="text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px]"
                >
                  + Adicionar Filho
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8">
          <p className="text-4xl mb-2">🔍</p>
          <h3 className="font-heading font-bold text-stone-800 text-lg">Nenhum membro encontrado</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
            Tente buscar com outros termos ou altere os filtros de ramo e geração.
          </p>
        </div>
      )}
    </div>
  );
}
