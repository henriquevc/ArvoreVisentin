import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Cloud } from 'lucide-react';
import Navbar from './components/Navbar';
import TreeCanvas from './components/TreeCanvas';
import DirectoryView from './components/DirectoryView';
import StatsView from './components/StatsView';
import PersonEditModal from './components/PersonEditModal';
import PersonDetailDrawer from './components/PersonDetailDrawer';
import PartyPresentationModal from './components/PartyPresentationModal';
import PasswordUnlockModal from './components/PasswordUnlockModal';
import { sampleFamilyMembers, getBranches, sortMembersByOrder } from './data/initialFamilyData';
import { loadTreeData, saveTreeData, exportToJson, importFromJson } from './services/storage';
import {
  fetchCloudTree,
  verifyEditPassword,
  cloudReplaceAllMembers,
  cloudSyncDiff,
  getSavedSessionPassword,
  saveSessionPassword
} from './services/cloudApi';

function applyMigrations(rawMembers) {
  let hasMigration = false;
  const migrated = rawMembers.map((m) => {
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
  return { migrated, hasMigration };
}

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

  // Cloud & Password Protection State
  const [cloudConfigured, setCloudConfigured] = useState(false);
  const [isCloudSeeded, setIsCloudSeeded] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [syncState, setSyncState] = useState('idle'); // 'idle' | 'syncing' | 'saved' | 'error'

  // Refs to avoid stale closures in async sync helpers
  const membersRef = useRef(members);
  const cloudConfiguredRef = useRef(cloudConfigured);
  const isCloudSeededRef = useRef(isCloudSeeded);
  const editPasswordRef = useRef(editPassword);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  useEffect(() => {
    cloudConfiguredRef.current = cloudConfigured;
  }, [cloudConfigured]);

  useEffect(() => {
    isCloudSeededRef.current = isCloudSeeded;
  }, [isCloudSeeded]);

  useEffect(() => {
    editPasswordRef.current = editPassword;
  }, [editPassword]);

  const canEdit = !isPasswordProtected || isUnlocked;

  // Compute branches dynamically based on current members
  const branches = useMemo(() => getBranches(members), [members]);

  // Load persisted data (Cloud Turso first, falling back to local IndexedDB)
  useEffect(() => {
    async function init() {
      try {
        const [localSavedData, cloudRes] = await Promise.all([
          loadTreeData().catch(() => null),
          fetchCloudTree().catch(() => ({ configured: false }))
        ]);

        if (cloudRes && cloudRes.configured) {
          setCloudConfigured(true);
          cloudConfiguredRef.current = true;
          setIsPasswordProtected(Boolean(cloudRes.passwordProtected));

          // Restore active admin session if previously unlocked in this tab
          const savedPw = getSavedSessionPassword();
          if (savedPw) {
            try {
              await verifyEditPassword(savedPw);
              setEditPassword(savedPw);
              editPasswordRef.current = savedPw;
              setIsUnlocked(true);
            } catch {
              saveSessionPassword('');
            }
          }

          if (!cloudRes.empty && Array.isArray(cloudRes.members) && cloudRes.members.length > 0) {
            // Cloud has official tree data — use it on all devices
            const { migrated } = applyMigrations(cloudRes.members);
            setMembers(migrated);
            membersRef.current = migrated;
            setIsCloudSeeded(true);
            isCloudSeededRef.current = true;
            setSyncState('saved');
            saveTreeData(migrated);
          } else {
            // Cloud database is brand new (empty) — preserve any local tree built on this browser
            setIsCloudSeeded(false);
            isCloudSeededRef.current = false;
            if (localSavedData && Array.isArray(localSavedData) && localSavedData.length > 0) {
              const { migrated } = applyMigrations(localSavedData);
              setMembers(migrated);
              membersRef.current = migrated;
            }
          }
        } else {
          // Offline / Local-only mode (Turso env vars not configured)
          if (localSavedData && Array.isArray(localSavedData) && localSavedData.length > 0) {
            const { migrated, hasMigration } = applyMigrations(localSavedData);
            setMembers(migrated);
            membersRef.current = migrated;
            if (hasMigration) {
              saveTreeData(migrated);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize tree data', err);
      } finally {
        setIsLoaded(true);
      }
    }
    init();
  }, []);

  // Save changes locally AND sync to Turso Cloud
  const persistMembers = useCallback(async (updatedMembers, options = {}) => {
    const { forceFullReplace = false, passwordOverride } = options;
    const prevMembers = membersRef.current;

    setMembers(updatedMembers);
    membersRef.current = updatedMembers;
    saveTreeData(updatedMembers);

    if (!cloudConfiguredRef.current) {
      return;
    }

    const pw = passwordOverride !== undefined ? passwordOverride : editPasswordRef.current;
    setSyncState('syncing');

    try {
      if (!isCloudSeededRef.current || forceFullReplace) {
        await cloudReplaceAllMembers(updatedMembers, pw);
        isCloudSeededRef.current = true;
        setIsCloudSeeded(true);
      } else {
        await cloudSyncDiff(prevMembers, updatedMembers, pw);
      }
      setSyncState('saved');
    } catch (err) {
      console.error('Cloud sync failed:', err);
      setSyncState('error');
      if (err?.status === 401) {
        setIsUnlocked(false);
        saveSessionPassword('');
        setIsUnlockModalOpen(true);
        alert('Sessão expirada ou senha inválida. Digite a senha novamente para salvar na nuvem.');
      } else {
        alert(`Erro ao sincronizar com a nuvem: ${err?.message || 'Verifique sua conexão.'}`);
      }
    }
  }, []);

  // Handle unlocking edit mode with password
  const handleUnlock = async (password) => {
    await verifyEditPassword(password);
    saveSessionPassword(password);
    setEditPassword(password);
    editPasswordRef.current = password;
    setIsUnlocked(true);

    // If cloud database is still empty, offer 1-click upload of current tree
    if (cloudConfiguredRef.current && !isCloudSeededRef.current) {
      const count = membersRef.current.length;
      if (
        confirm(
          `O banco na nuvem ainda está vazio.\n\nDeseja enviar a árvore exibida neste aparelho (${count} pessoas) para a nuvem agora, deixando igual em todos os dispositivos?`
        )
      ) {
        await persistMembers(membersRef.current, {
          forceFullReplace: true,
          passwordOverride: password
        });
      }
    }
  };

  const handleLockEditing = () => {
    setIsUnlocked(false);
    setEditPassword('');
    editPasswordRef.current = '';
    saveSessionPassword('');
    setIsEditModalOpen(false);
  };

  const handlePushToCloud = async () => {
    if (!canEdit) {
      setIsUnlockModalOpen(true);
      return;
    }
    if (
      confirm(
        `Deseja enviar todos os ${membersRef.current.length} membros exibidos neste aparelho como a versão oficial na nuvem?`
      )
    ) {
      await persistMembers(membersRef.current, { forceFullReplace: true });
      alert('Árvore sincronizada na nuvem com sucesso! Todos os dispositivos já verão esta versão.');
    }
  };

  // Open Edit Modal for a specific member
  const handleEditPerson = (person) => {
    if (!canEdit) {
      setIsUnlockModalOpen(true);
      return;
    }
    setEditingPerson(person);
    setInitialRelation(null);
    setIsEditModalOpen(true);
  };

  // Add a new child to a member
  const handleAddChild = (parentPerson) => {
    if (!canEdit) {
      setIsUnlockModalOpen(true);
      return;
    }
    setEditingPerson(null);
    setInitialRelation({ type: 'child', relativeId: parentPerson.id });
    setIsEditModalOpen(true);
  };

  // Add brand new standalone or immigrant member
  const handleAddNewMember = () => {
    if (!canEdit) {
      setIsUnlockModalOpen(true);
      return;
    }
    setEditingPerson(null);
    setInitialRelation(null);
    setIsEditModalOpen(true);
  };

  // Save or update person in state
  const handleSavePerson = (personData) => {
    let updated = [...membersRef.current];
    const index = updated.findIndex((m) => m.id === personData.id);

    if (index >= 0) {
      updated[index] = personData;
    } else {
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

  // Helper to find all recursive descendant IDs for a given person
  const getDescendantIds = useCallback((personId, allMembers) => {
    const descendantIds = new Set();
    const queue = [personId];

    while (queue.length > 0) {
      const currentParentId = queue.shift();
      const children = allMembers.filter((m) => (m.parents || []).includes(currentParentId));
      for (const child of children) {
        if (!descendantIds.has(child.id)) {
          descendantIds.add(child.id);
          queue.push(child.id);
        }
      }
    }

    return Array.from(descendantIds);
  }, []);

  // Delete person and all their descendants with confirmation
  const handleDeletePerson = useCallback((personId) => {
    if (!canEdit) {
      setIsUnlockModalOpen(true);
      return;
    }

    const currentMembers = membersRef.current;
    const target = currentMembers.find((m) => m.id === personId);
    if (!target) return;

    const descendantIds = getDescendantIds(personId, currentMembers);
    const descendantCount = descendantIds.length;

    let confirmMsg = '';
    if (descendantCount > 0) {
      confirmMsg = `⚠️ ATENÇÃO: Deseja realmente excluir "${target.name}" e todos os seus ${descendantCount} descendente(s) (filhos, netos, etc.) da árvore?\n\nEsta ação excluirá um total de ${descendantCount + 1} pessoas e não pode ser desfeita.`;
    } else {
      confirmMsg = `Deseja realmente remover "${target.name}" da árvore genealógica?`;
    }

    if (!confirm(confirmMsg)) {
      return;
    }

    const idsToRemove = new Set([personId, ...descendantIds]);

    const updated = currentMembers
      .filter((m) => !idsToRemove.has(m.id))
      .map((m) => ({
        ...m,
        parents: (m.parents || []).filter((id) => !idsToRemove.has(id)),
        children: (m.children || []).filter((id) => !idsToRemove.has(id))
      }));

    persistMembers(updated);
    if (selectedPerson && idsToRemove.has(selectedPerson.id)) {
      setSelectedPerson(null);
    }
  }, [canEdit, getDescendantIds, persistMembers, selectedPerson]);

  // Global keyboard shortcut: Delete or Backspace key deletes selected person (only when unlocked)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!canEdit) return;
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;

      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInputFocused =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        document.activeElement?.isContentEditable;

      if (isInputFocused) return;
      if (isEditModalOpen || isPartyModeOpen || isUnlockModalOpen) return;

      if (selectedPerson) {
        e.preventDefault();
        handleDeletePerson(selectedPerson.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, selectedPerson, isEditModalOpen, isPartyModeOpen, isUnlockModalOpen, handleDeletePerson]);

  // Reorder siblings left/right (or up/down) in birth order
  const handleMoveSibling = useCallback((personId, direction) => {
    if (!canEdit) return;

    const prevMembers = membersRef.current;
    const target = prevMembers.find((m) => m.id === personId);
    if (!target) return;

    let siblings = [];
    if (target.generation === 2) {
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

    if (siblings.length <= 1) return;

    const sorted = sortMembersByOrder(siblings);
    const currentIndex = sorted.findIndex((m) => m.id === personId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const swapped = [...sorted];
    const temp = swapped[currentIndex];
    swapped[currentIndex] = swapped[targetIndex];
    swapped[targetIndex] = temp;

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

    persistMembers(updated);

    if (selectedPerson) {
      const updatedSelected = updated.find((m) => m.id === selectedPerson.id);
      if (updatedSelected) {
        setSelectedPerson(updatedSelected);
      }
    }
  }, [canEdit, persistMembers, selectedPerson]);

  // Export JSON backup
  const handleExportBackup = () => {
    exportToJson(members, `arvore_familia_visentin_${new Date().toISOString().slice(0, 10)}.json`);
  };

  // Import JSON backup
  const handleImportBackup = async (event) => {
    if (!canEdit) {
      setIsUnlockModalOpen(true);
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importFromJson(file);
      if (Array.isArray(importedData) && importedData.length > 0) {
        await persistMembers(importedData, { forceFullReplace: true });
        alert(`Backup carregado e salvo na nuvem com sucesso! ${importedData.length} membros importados.`);
      } else {
        alert('O arquivo selecionado não contém um formato de árvore genealógica reconhecido.');
      }
    } catch (err) {
      alert(err.message || 'Erro ao carregar o arquivo de backup.');
    }
  };

  // Reset to original dataset
  const handleResetData = async () => {
    if (!canEdit) {
      setIsUnlockModalOpen(true);
      return;
    }

    if (
      confirm(
        'Deseja realmente restaurar os dados originais da Família Visentin? As alterações atuais serão substituídas em todos os dispositivos.'
      )
    ) {
      await persistMembers(sampleFamilyMembers, { forceFullReplace: true });
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
        canEdit={canEdit}
        isPasswordProtected={isPasswordProtected}
        cloudConfigured={cloudConfigured}
        syncState={syncState}
        onOpenUnlockModal={() => setIsUnlockModalOpen(true)}
        onLockEditing={handleLockEditing}
        onPushToCloud={handlePushToCloud}
        onAddNewMember={canEdit ? handleAddNewMember : null}
        onOpenPartyMode={() => setIsPartyModeOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        onExportPng={currentView === 'tree' ? handleExportPng : null}
      />

      {/* First-time Cloud Sync Prompt Banner (only shown to unlocked admin when cloud DB is still empty) */}
      {cloudConfigured && !isCloudSeeded && canEdit && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950 z-20">
          <div className="flex items-center gap-2 font-medium">
            <Cloud size={15} className="text-amber-700 shrink-0" />
            <span>
              O banco na nuvem ainda está vazio. Clique ao lado para publicar a árvore deste aparelho ({members.length} pessoas) para todos os dispositivos.
            </span>
          </div>
          <button
            onClick={handlePushToCloud}
            className="bg-[#1b4d3e] hover:bg-[#133926] text-amber-50 font-semibold px-3 py-1 rounded-lg shadow-sm transition"
          >
            Publicar na Nuvem Agora
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 relative overflow-hidden">
        {currentView === 'tree' && (
          <TreeCanvas
            members={members}
            branches={branches}
            activeBranch={activeBranch}
            selectedPerson={selectedPerson}
            onSelectPerson={setSelectedPerson}
            onAddChild={canEdit ? handleAddChild : null}
            onEditPerson={canEdit ? handleEditPerson : null}
            onExportPng={handleExportPng}
            onFocusBranch={(branchId) => setActiveBranch(branchId)}
            onMoveSibling={canEdit ? handleMoveSibling : null}
          />
        )}

        {currentView === 'directory' && (
          <DirectoryView
            members={members}
            branches={branches}
            onSelectPerson={setSelectedPerson}
            onEditPerson={canEdit ? handleEditPerson : null}
            onAddChild={canEdit ? handleAddChild : null}
            onAddNewMember={canEdit ? handleAddNewMember : null}
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
        onEdit={canEdit ? handleEditPerson : null}
        onAddChild={canEdit ? handleAddChild : null}
        onDelete={canEdit ? handleDeletePerson : null}
        onRequestUnlock={isPasswordProtected && !canEdit ? () => setIsUnlockModalOpen(true) : null}
        onSelectPerson={setSelectedPerson}
        onMoveSibling={canEdit ? handleMoveSibling : null}
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

      {/* Password Unlock Modal */}
      <PasswordUnlockModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
        onUnlock={handleUnlock}
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
