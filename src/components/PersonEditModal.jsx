import React, { useState, useEffect } from 'react';
import { X, Camera, Trash2, Save, User, Calendar, MapPin, Heart, BookOpen, Layers } from 'lucide-react';
import PhotoCropModal from './PhotoCropModal';
import { BRANCHES, GENERATION_LABELS } from '../data/initialFamilyData';

export default function PersonEditModal({
  isOpen,
  person,
  allMembers = [],
  branches = BRANCHES,
  onSave,
  onDelete,
  onClose,
  initialRelation = null // { type: 'child' | 'spouse' | 'parent', relativeId: string }
}) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    maidenName: '',
    gender: 'M',
    order: '',
    generation: 2,
    branchId: 'antonio',
    parents: [],
    spouseName: '',
    spouseId: '',
    children: [],
    birthDate: '',
    birthPlace: '',
    deathDate: '',
    deathPlace: '',
    isLiving: false,
    photo: null,
    bio: ''
  });

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (person) {
      // Editing existing member
      setFormData({
        ...person,
        order: person.order !== undefined && person.order !== null ? person.order : '',
        parents: person.parents || [],
        children: person.children || [],
        isLiving: person.isLiving !== undefined ? person.isLiving : !person.deathDate
      });
    } else {
      // Adding new member
      const newId = `p-${Date.now()}`;
      let defaultBranch = 'antonio';
      let defaultGen = 3;
      let defaultParents = [];
      let defaultSpouseName = '';
      let defaultOrder = '';

      if (initialRelation && initialRelation.relativeId) {
        const relative = allMembers.find((m) => m.id === initialRelation.relativeId);
        if (relative) {
          if (initialRelation.type === 'child') {
            defaultBranch = relative.branchId === 'all' ? 'antonio' : relative.branchId;
            defaultGen = Math.min(6, relative.generation + 1);
            defaultParents = [relative.id];
            // Assign next child order
            const existingChildren = allMembers.filter((m) => (m.parents || []).includes(relative.id));
            defaultOrder = existingChildren.length + 1;
          } else if (initialRelation.type === 'spouse') {
            defaultBranch = relative.branchId;
            defaultGen = relative.generation;
            defaultSpouseName = relative.name;
          } else if (initialRelation.type === 'parent') {
            defaultBranch = relative.branchId;
            defaultGen = Math.max(1, relative.generation - 1);
          }
        }
      }

      setFormData({
        id: newId,
        name: '',
        maidenName: '',
        gender: 'M',
        order: defaultOrder,
        generation: defaultGen,
        branchId: defaultBranch,
        parents: defaultParents,
        spouseName: defaultSpouseName,
        spouseId: '',
        children: [],
        birthDate: '',
        birthPlace: '',
        deathDate: '',
        deathPlace: '',
        isLiving: true,
        photo: null,
        bio: ''
      });
    }
  }, [isOpen, person, initialRelation, allMembers]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSaved = (croppedPhoto) => {
    setFormData((prev) => ({ ...prev, photo: croppedPhoto }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor, informe o nome do membro da família.');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = Boolean(person);
  const potentialParents = allMembers.filter((m) => m.id !== formData.id);

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-[#FAF9F5] border-2 border-[#1e4d2b]/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#133926] via-[#1b4d3e] to-[#255734] text-amber-50 px-6 py-4 flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌳</span>
              <div>
                <h3 className="text-lg font-heading tracking-wider font-semibold">
                  {isEditing ? `Editar: ${formData.name || 'Membro'}` : 'Adicionar Novo Membro da Família'}
                </h3>
                <p className="text-xs text-amber-200/80 font-serif-vintage italic">
                  Família Visentin • Registro Genealógico
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-6">
            {/* Photo & Basic Identity */}
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              {/* Photo Circular Preview + Edit Button */}
              <div className="flex flex-col items-center gap-2">
                <div
                  onClick={() => setIsCropModalOpen(true)}
                  className="relative group w-28 h-28 rounded-full border-4 border-amber-600/70 shadow-md overflow-hidden bg-stone-100 cursor-pointer flex items-center justify-center hover:ring-4 hover:ring-emerald-700/30 transition"
                  title="Clique para carregar ou recortar a foto"
                >
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-stone-400 flex flex-col items-center">
                      <User size={38} />
                      <span className="text-[10px] text-stone-500">Sem Foto</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition text-xs font-medium">
                    <Camera size={20} />
                    <span>Ajustar Foto</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCropModalOpen(true)}
                  className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition"
                >
                  <Camera size={13} /> {formData.photo ? 'Mudar / Zoom' : 'Adicionar Foto'}
                </button>
              </div>

              {/* Name, Maiden Name, Gender */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Antonio Visentin"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full text-sm font-medium px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20 outline-none bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Sobrenome de Solteira / Apelido
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Sartori / 'Tonin'"
                    value={formData.maidenName || ''}
                    onChange={(e) => handleChange('maidenName', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">
                    Gênero
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Ordem de Nascimento entre Irmãos (1º, 2º, 3º...)
                    </label>
                    <span className="text-[10px] text-stone-400">Opcional / Livre</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="ex: 1 (primogênito), 2 (segundo), 3..."
                    value={formData.order || ''}
                    onChange={(e) => handleChange('order', e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                  />
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Define a posição na árvore da esquerda para a direita, sem precisar saber o ano exato de nascimento.
                  </p>
                </div>
              </div>
            </div>

            {/* Branch and Generation Classification */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Layers size={14} className="text-emerald-800" /> Ramo Familiar (Filho de Origem)
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => handleChange('branchId', e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                >
                  {(branches || BRANCHES).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id === 'all' ? 'Patriarcas Originais (Giuseppe & Catterina)' : b.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Permite filtrar a visualização por família na árvore.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Geração (1 a 6)
                </label>
                <select
                  value={formData.generation}
                  onChange={(e) => handleChange('generation', parseInt(e.target.value, 10))}
                  className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                >
                  <option value="1">1ª Geração • Giuseppe e Catterina (Patriarcas)</option>
                  <option value="2">2ª Geração • Filhos Imigrantes (5 filhos)</option>
                  <option value="3">3ª Geração • Netos</option>
                  <option value="4">4ª Geração • Bisnetos</option>
                  <option value="5">5ª Geração • Trinetos</option>
                  <option value="6">6ª Geração • Tetranetos</option>
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Posiciona o membro no nível correspondente na árvore.
                </p>
              </div>
            </div>

            {/* Kinship / Parents and Spouse */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <User size={14} className="text-emerald-800" /> Pai / Mãe (Vínculo na Árvore)
                </label>
                <select
                  value={formData.parents[0] || ''}
                  onChange={(e) => handleChange('parents', e.target.value ? [e.target.value] : [])}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                >
                  <option value="">(Nenhum / Patriarca Raiz)</option>
                  {potentialParents.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (G{m.generation} - {m.birthDate || 's/data'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Define de quem este membro descende na árvore.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Heart size={14} className="text-rose-700" /> Cônjuge (Esposo/Esposa)
                </label>
                <input
                  type="text"
                  placeholder="ex: Rosa Moretti"
                  value={formData.spouseName || ''}
                  onChange={(e) => handleChange('spouseName', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                />
              </div>
            </div>

            {/* Dates & Places */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                  <Calendar size={14} className="text-stone-500" /> Nascimento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ano ou Data (ex: 1878)"
                    value={formData.birthDate || ''}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    className="text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                  />
                  <input
                    type="text"
                    placeholder="Local (ex: Treviso, Itália)"
                    value={formData.birthPlace || ''}
                    onChange={(e) => handleChange('birthPlace', e.target.value)}
                    className="text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <MapPin size={14} className="text-stone-500" /> Falecimento / Status
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-emerald-800">
                    <input
                      type="checkbox"
                      checked={formData.isLiving}
                      onChange={(e) => {
                        const isLive = e.target.checked;
                        handleChange('isLiving', isLive);
                        if (isLive) {
                          handleChange('deathDate', '');
                          handleChange('deathPlace', '');
                        }
                      }}
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>Pessoa Viva</span>
                  </label>
                </div>

                {!formData.isLiving && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Ano / Data de Falecimento"
                      value={formData.deathDate || ''}
                      onChange={(e) => handleChange('deathDate', e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                    />
                    <input
                      type="text"
                      placeholder="Local de Falecimento"
                      value={formData.deathPlace || ''}
                      onChange={(e) => handleChange('deathPlace', e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Bio / Historical anecdotes */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-800" /> Histórias, Memórias e Profissão
              </label>
              <textarea
                rows={3}
                placeholder="Histórico na colônia, profissão, navio de imigração, relatos para exibir na festa..."
                value={formData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-700 outline-none bg-stone-50/50 resize-y"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja remover ${formData.name} da árvore?`)) {
                      onDelete(formData.id);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-medium py-2 px-3 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 size={15} /> Excluir Membro
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-200 text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-[#1b4d3e] hover:bg-[#133926] text-amber-50 px-6 py-2.5 rounded-xl font-medium text-sm shadow-md transition"
                >
                  <Save size={16} /> Salvar Membro
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Embedded Crop Modal */}
      <PhotoCropModal
        isOpen={isCropModalOpen}
        initialImage={formData.photo}
        onSave={handlePhotoSaved}
        onClose={() => setIsCropModalOpen(false)}
      />
    </>
  );
}
