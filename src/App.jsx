import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toPng } from 'html-to-image';
import Navbar from './components/Navbar';
import TreeCanvas from './components/TreeCanvas';
import DirectoryView from './components/DirectoryView';
import StatsView from './components/StatsView';
import PersonEditModal from './components/PersonEditModal';
import PersonDetailDrawer from './components/PersonDetailDrawer';
import PartyPresentationModal from './components/PartyPresentationModal';
import { sampleFamilyMembers, getBranches, sortMembersByOrder } from './data/initialFamilyData';
import { loadTreeData, saveTreeData, exportToJson, importFromJson } from './services/storage';

export default function App() {
  const [members, setMembers] = useState(sampleFamilyMembers);
  const [currentView, setCurrentView] = useState('tree'); // 'tree' | 'directory' | 'stats'
  const [activeBranch, setActiveBranch] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [editingPerson, setEditingPerson] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [initialRelation, setInitialRelation] = useState(null);
  const [isPartyModeOpen, setIsPartyModeOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Compute branches dynamically based on current members
  const branches = useMemo(() => getBranches(members), [members]);

  // Load persisted data on mount
  useEffect(() => {
    async function init() {
      try {
        const savedData = await loadTreeData();
        if (savedData && Array.isArray(savedData) && savedData.length > 0) {
          // Migration: Ensure Catterina's name is spelled with double 'tt'
          let hasMigration = false;
          const migrated = savedData.map((m) => {
            if (m.id === 'p-catarina' && m.name === 'Catarina Visentin') {
              hasMigration = true;
              return { ...m, name: 'Catterina Visentin' };
            }
            if (m.id === 'p-giuseppe' && m.spouseName && m.spouseName.includes('Catarina')) {
              hasMigration = true;
              return { ...m, spouseName: m.spouseName.replace('Catarina', 'Catterina') };
            }
            return m;
          });
          setMembers(migrated);
          if (hasMigration) {
            saveTreeData(migrated);
          }
        }
      } catch (err) {
        console.error('Failed to load tree data', err);
      } finally {
        setIsLoaded(true);
      }
    }
    init();
  }, []);

  // Save changes to IndexedDB / localStorage whenever members update
  const persistMembers = useCallback((updatedMembers) => {
    setMembers(updatedMembers);
    saveTreeData(updatedMembers);
  }, []);

  // Open Edit Modal for a specific member
  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setInitialRelation(null);
    setIsEditModalOpen(true);
  };

  // Add a new child to a member
  const handleAddChild = (parentPerson) => {
    setEditingPerson(null);
    setInitialRelation({ type: 'child', relativeId: parentPerson.id });
    setIsEditModalOpen(true);
  };

  // Add brand new standalone or immigrant member
  const handleAddNewMember = () => {
    setEditingPerson(null);
    setInitialRelation(null);
    setIsEditModalOpen(true);
  };

  // Save or update person in state
  const handleSavePerson = (personData) => {
    let updated = [...members];
    const index = updated.findIndex((m) => m.id === personData.id);

    if (index >= 0) {
      // Update existing
      updated[index] = personData;
    } else {
      // Add new
      updated.push(personData);
    }

    // Bi-directionally synchronize parent-child links
    (personData.parents || []).forEach((parentId) => {
      const pIdx = updated.findIndex((m) => m.id === parentId);
      if (pIdx >= 0) {
        const parent = updated[pIdx];
        const children = parent.children || [];
        if (!children.includes(personData.id)) {
          updated[pIdx] = { ...parent, children: [...children, personData.id] };
        }
      }
    });

    persistMembers(updated);

    // Keep drawer up to date if currently open
    if (selectedPerson && selectedPerson.id === personData.id) {
      setSelectedPerson(personData);
    }
  };

  // Delete person
  const handleDeletePerson = (personId) => {
    const updated = members
      .filter((m) => m.id !== personId)
      .map((m) => ({
        ...m,
        parents: (m.parents || []).filter((id) => id !== personId),
        children: (m.children || []).filter((id) => id !== personId)
      }));

    persistMembers(updated);
    if (selectedPerson && selectedPerson.id === personId) {
      setSelectedPerson(null);
    }
  };

  // Reorder siblings left/right (or up/down) in birth order
  const handleMoveSibling = useCallback((personId, direction) => {
    setMembers((prevMembers) => {
      const target = prevMembers.find((m) => m.id === personId);
      if (!target) return prevMembers;

      let siblings = [];
      if (target.generation === 2) {
        // All Generation 2 children are peers under Giuseppe & Catterina
        siblings = prevMembers.filter((m) => m.generation === 2);
      } else if (target.parents && target.parents.length > 0) {
        const parentId = target.parents[0];
        siblings = prevMembers.filter(
          (m) => m.generation === target.generation && (m.parents || []).includes(parentId)
        );
      } else {
        siblings = prevMembers.filter(
          (m) => m.generation === target.generation && m.branchId === target.branchId
        );
      }

      if (siblings.length <= 1) return prevMembers;

      const sorted = sortMembersByOrder(siblings);
      const currentIndex = sorted.findIndex((m) => m.id === personId);
      if (currentIndex === -1) return prevMembers;

      const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= sorted.length) return prevMembers;

      // Swap positions
      const swapped = [...sorted];
      const temp = swapped[currentIndex];
      swapped[currentIndex] = swapped[targetIndex];
      swapped[targetIndex] = temp;

      // Assign sequential integer order numbers: 1, 2, 3...
      const orderMap = new Map();
      swapped.forEach((m, idx) => {
        orderMap.set(m.id, idx + 1);
      });

      const updated = prevMembers.map((m) => {
        if (orderMap.has(m.id)) {
          return { ...m, order: orderMap.get(m.id) };
        }
        return m;
      });

      saveTreeData(updated);

      // Keep selectedPerson updated if currently selected
      if (selectedPerson) {
        const updatedSelected = updated.find((m) => m.id === selectedPerson.id);
        if (updatedSelected) {
          setSelectedPerson(updatedSelected);
        }
      }

      return updated;
    });
  }, [selectedPerson]);

  // Export JSON backup
  const handleExportBackup = () => {
    exportToJson(members, `arvore_familia_visentin_${new Date().toISOString().slice(0, 10)}.json`);
  };

  // Import JSON backup
  const handleImportBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromJson(file);
      if (Array.isArray(importedData) && importedData.length > 0) {
        persistMembers(importedData);
        alert(`Backup carregado com sucesso! ${importedData.length} membros da família importados.`);
      } else {
        alert('O arquivo selecionado não contém um formato de árvore genealógica reconhecido.');
      }
    } catch (err) {
      alert(err.message || 'Erro ao carregar o arquivo de backup.');
    }
  };

  // Reset to original dataset
  const handleResetData = () => {
    if (
      confirm(
        'Deseja realmente restaurar os dados originais da Família Visentin? Quaisquer alterações locais não salvas em backup serão perdidas.'
      )
    ) {
      persistMembers(sampleFamilyMembers);
      setSelectedPerson(null);
      alert('Dados originais restaurados com sucesso!');
    }
  };

  // Export high-res PNG image of the tree canvas
  const handleExportPng = async () => {
    const node = document.getElementById('tree-export-viewport');
    if (!node) {
      alert('Visualização da árvore não encontrada.');
      return;
    }

    try {
      const dataUrl = await toPng(node, {
        backgroundColor: '#f7f9f6',
        quality: 0.95,
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `arvore_visentin_${activeBranch}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image', err);
      alert('Não foi possível exportar a imagem. Tente reduzir o zoom da árvore e tente novamente.');
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#133926] text-amber-50">
        <span className="text-5xl animate-bounce">🌳</span>
        <h2 className="text-xl font-heading font-bold mt-4">Família Visentin</h2>
        <p className="text-xs text-emerald-200 mt-1">Carregando árvore genealógica...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F7F9F6] text-stone-800">
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeBranch={activeBranch}
        setActiveBranch={setActiveBranch}
        branches={branches}
        onAddNewMember={handleAddNewMember}
        onOpenPartyMode={() => setIsPartyModeOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        onExportPng={currentView === 'tree' ? handleExportPng : null}
      />

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden">
        {currentView === 'tree' && (
          <TreeCanvas
            members={members}
            branches={branches}
            activeBranch={activeBranch}
            selectedPerson={selectedPerson}
            onSelectPerson={setSelectedPerson}
            onAddChild={handleAddChild}
            onEditPerson={handleEditPerson}
            onExportPng={handleExportPng}
            onFocusBranch={(branchId) => setActiveBranch(branchId)}
            onMoveSibling={handleMoveSibling}
          />
        )}

        {currentView === 'directory' && (
          <DirectoryView
            members={members}
            branches={branches}
            onSelectPerson={setSelectedPerson}
            onEditPerson={handleEditPerson}
            onAddChild={handleAddChild}
            onAddNewMember={handleAddNewMember}
          />
        )}

        {currentView === 'stats' && (
          <StatsView
            members={members}
            branches={branches}
            onFocusBranch={(branchId) => {
              setActiveBranch(branchId);
              setCurrentView('tree');
            }}
          />
        )}
      </main>

      {/* Slide-out Person Detail Drawer */}
      <PersonDetailDrawer
        person={selectedPerson}
        allMembers={members}
        branches={branches}
        onClose={() => setSelectedPerson(null)}
        onEdit={handleEditPerson}
        onAddChild={handleAddChild}
        onSelectPerson={setSelectedPerson}
        onMoveSibling={handleMoveSibling}
        onFocusBranch={(branchId) => {
          setActiveBranch(branchId);
          setCurrentView('tree');
        }}
      />

      {/* Add / Edit Person Modal */}
      <PersonEditModal
        isOpen={isEditModalOpen}
        person={editingPerson}
        allMembers={members}
        branches={branches}
        initialRelation={initialRelation}
        onSave={handleSavePerson}
        onDelete={handleDeletePerson}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPerson(null);
          setInitialRelation(null);
        }}
      />

      {/* Party / Presentation Fullscreen Mode */}
      <PartyPresentationModal
        isOpen={isPartyModeOpen}
        onClose={() => setIsPartyModeOpen(false)}
        members={members}
        branches={branches}
        onSelectPerson={(person) => {
          setSelectedPerson(person);
          setIsPartyModeOpen(false);
        }}
      />
    </div>
  );
}
