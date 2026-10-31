import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight,
  Maximize2,
  LayoutGrid,
  GitBranch,
  Compass
} from 'lucide-react';
import PersonCard from './PersonCard';
import FamilyBoardView from './FamilyBoardView';
import { BRANCHES, GENERATION_LABELS, sortMembersByOrder } from '../data/initialFamilyData';

export default function TreeCanvas({
  members = [],
  branches = BRANCHES,
  activeBranch = 'all',
  selectedPerson = null,
  onSelectPerson,
  onAddChild,
  onEditPerson,
  onExportPng,
  onFocusBranch,
  onMoveSibling
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 100, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // View mode: 'canvas' (interactive tree) or 'board' (5 branches columns)
  const [viewMode, setViewMode] = useState('canvas');

  // Track collapsed person IDs
  // By default in 'all', collapse at generation 3 (netos) so bisnetos don't explode width
  const [collapsedNodes, setCollapsedNodes] = useState(() => {
    const initial = new Set();
    members.forEach((m) => {
      if (m.generation === 3) {
        initial.add(m.id);
      }
    });
    return initial;
  });

  // Toggle single node collapse
  const handleToggleCollapse = (nodeId) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Depth presets
  const setDepthPreset = (depth) => {
    const nextCollapsed = new Set();
    members.forEach((m) => {
      if (m.generation >= depth) {
        nextCollapsed.add(m.id);
      }
    });
    setCollapsedNodes(nextCollapsed);
  };

  const expandAll = () => setCollapsedNodes(new Set());

  // Zoom controls
  const handleZoomIn = () => setScale((s) => Math.min(2.0, Number((s + 0.15).toFixed(2))));
  const handleZoomOut = () => setScale((s) => Math.max(0.2, Number((s - 0.15).toFixed(2))));

  // Pan handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('.person-card-node') || e.target.closest('.canvas-control')) {
      return;
    }
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.001;
    setScale((s) => Math.min(2.0, Math.max(0.2, Number((s + zoomDelta).toFixed(2)))));
  };

  // Build hierarchical layout with unified couple root
  const layout = useMemo(() => {
    const CARD_W = 240;
    const CARD_H = 135;
    const COUPLE_W = 320;
    const COUPLE_H = 165;
    const GAP_X = 28;
    const GAP_Y = 85;

    // Filter relevant members
    let relevantMembers = members;
    if (activeBranch !== 'all') {
      relevantMembers = members.filter(
        (m) =>
          m.branchId === activeBranch ||
          m.branchId === 'all' ||
          m.id === `p-${activeBranch}`
      );
    }

    const branchMap = new Map();
    (branches || BRANCHES).forEach((b) => branchMap.set(b.id, b));

    const memberMap = new Map();
    relevantMembers.forEach((m) => {
      const bObj = branchMap.get(m.branchId);
      memberMap.set(m.id, {
        ...m,
        childrenList: [],
        width: CARD_W,
        height: CARD_H,
        branchName: bObj ? bObj.name : '',
        branchShortName: bObj ? bObj.shortName : '',
        x: 0,
        y: 0
      });
    });

    // Populate children lists (using generation progression to avoid loops)
    relevantMembers.forEach((m) => {
      (m.parents || []).forEach((pid) => {
        if (memberMap.has(pid)) {
          const parentNode = memberMap.get(pid);
          if (!parentNode.childrenList.includes(m.id)) {
            parentNode.childrenList.push(m.id);
          }
        }
      });
    });

    // Sort every childrenList by manual birth order!
    memberMap.forEach((node) => {
      if (node.childrenList && node.childrenList.length > 1) {
        const sortedObjects = sortMembersByOrder(
          node.childrenList.map((id) => memberMap.get(id)).filter(Boolean)
        );
        node.childrenList = sortedObjects.map((o) => o.id);
      }
    });

    let rootNodes = [];

    if (activeBranch === 'all') {
      // Create unified Patriarchs Couple node (Giuseppe & Catarina)
      const giuseppe = members.find((m) => m.id === 'p-giuseppe') || members.find((m) => m.generation === 1);
      const catarina = members.find((m) => m.id === 'p-catarina') || members.filter((m) => m.generation === 1)[1];

      // Immigrant children are Generation 2, sorted by manual birth order!
      const immigrantChildren = sortMembersByOrder(
        relevantMembers.filter((m) => m.generation === 2)
      );

      const coupleNode = {
        id: 'couple-patriarchs',
        name: `${giuseppe?.name || 'Giuseppe'} & ${catarina?.name || 'Catterina'} Visentin`,
        isCouple: true,
        husband: giuseppe,
        wife: catarina,
        generation: 1,
        branchId: 'all',
        width: COUPLE_W,
        height: COUPLE_H,
        childrenList: immigrantChildren.map((c) => c.id),
        x: 0,
        y: 0
      };

      memberMap.set(coupleNode.id, coupleNode);
      rootNodes = [coupleNode];
    } else {
      // In branch view, root is the immigrant child (G2)
      const branchChild = relevantMembers.find(
        (m) => m.branchId === activeBranch && m.generation === 2
      );
      if (branchChild && memberMap.has(branchChild.id)) {
        rootNodes = [memberMap.get(branchChild.id)];
      } else {
        // Fallback to top-level members in this branch, sorted by order
        rootNodes = sortMembersByOrder(
          relevantMembers
            .filter((m) => (m.parents || []).length === 0 && memberMap.has(m.id))
            .map((m) => memberMap.get(m.id))
        );
      }
    }

    // Measure subtree widths bottom-up
    const subtreeWidths = new Map();
    function measureSubtree(nodeId) {
      const node = memberMap.get(nodeId);
      if (!node) return 0;

      const selfW = node.width || CARD_W;

      // If collapsed or no children
      if (collapsedNodes.has(nodeId) || !node.childrenList || node.childrenList.length === 0) {
        subtreeWidths.set(nodeId, selfW);
        return selfW;
      }

      let totalChildrenW = 0;
      node.childrenList.forEach((childId, idx) => {
        const childW = measureSubtree(childId);
        totalChildrenW += childW + (idx > 0 ? GAP_X : 0);
      });

      const finalW = Math.max(selfW, totalChildrenW);
      subtreeWidths.set(nodeId, finalW);
      return finalW;
    }

    rootNodes.forEach((r) => measureSubtree(r.id));

    // Assign positions top-down
    const positionedNodes = [];
    const links = [];
    const visitedSet = new Set();

    function positionSubtree(nodeId, startX, currentY) {
      if (visitedSet.has(nodeId)) return;
      visitedSet.add(nodeId);

      const node = memberMap.get(nodeId);
      if (!node) return;

      const subW = subtreeWidths.get(nodeId) || node.width;
      const nodeX = startX + (subW - node.width) / 2;
      const nodeY = currentY;

      node.x = nodeX;
      node.y = nodeY;
      positionedNodes.push(node);

      if (collapsedNodes.has(nodeId)) {
        return;
      }

      let curChildX = startX;
      node.childrenList.forEach((childId) => {
        const childNode = memberMap.get(childId);
        if (!childNode) return;

        const childW = subtreeWidths.get(childId) || childNode.width;
        const childY = currentY + node.height + GAP_Y;

        positionSubtree(childId, curChildX, childY);

        links.push({
          id: `${node.id}->${childNode.id}`,
          sourceX: nodeX + node.width / 2,
          sourceY: nodeY + node.height,
          targetX: childNode.x + childNode.width / 2,
          targetY: childNode.y,
          branchId: childNode.branchId
        });

        curChildX += childW + GAP_X;
      });
    }

    let curRootX = 60;
    rootNodes.forEach((r) => {
      const rw = subtreeWidths.get(r.id) || r.width;
      positionSubtree(r.id, curRootX, 40);
      curRootX += rw + GAP_X * 2;
    });

    // Compute bounding box
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;

    positionedNodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x + n.width > maxX) maxX = n.x + n.width;
      if (n.y < minY) minY = n.y;
      if (n.y + n.height > maxY) maxY = n.y + n.height;
    });

    if (minX === Infinity) {
      minX = 0;
      maxX = 1000;
      minY = 0;
      maxY = 800;
    }

    return {
      nodes: positionedNodes,
      links,
      bounds: {
        minX,
        maxX,
        minY,
        maxY,
        width: Math.max(1200, maxX - minX + 200),
        height: Math.max(800, maxY - minY + 200)
      }
    };
  }, [members, activeBranch, collapsedNodes]);

  // Fit to screen helper
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || layout.nodes.length === 0) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const { minX, maxX, minY, maxY } = layout.bounds;

    const treeW = maxX - minX + 100;
    const treeH = maxY - minY + 150;

    const scaleX = (clientWidth - 80) / treeW;
    const scaleY = (clientHeight - 130) / treeH;
    const targetScale = Math.min(1.0, Math.max(0.25, Math.min(scaleX, scaleY)));

    const targetPanX = (clientWidth - treeW * targetScale) / 2 - minX * targetScale;
    const targetPanY = 40;

    setScale(Number(targetScale.toFixed(2)));
    setPan({ x: Math.max(20, targetPanX), y: targetPanY });
  }, [layout]);

  // Auto-fit on branch change or when switching view mode
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeBranch, fitToScreen]);

  const activeBranchObj = (branches || BRANCHES).find((b) => b.id === activeBranch) || (branches || BRANCHES)[0];

  return (
    <div className="relative w-full h-full overflow-hidden bg-tree-paper select-none flex flex-col">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Active Branch Title + View Switcher */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-stone-200 pointer-events-auto">
          <span className="text-xl">🌿</span>
          <div className="pr-2 border-r border-stone-200">
            <h3 className="text-xs font-bold font-heading text-stone-900 tracking-wider">
              {activeBranchObj.name}
            </h3>
            <p className="text-[10px] text-stone-500 font-serif-vintage">
              {layout.nodes.length} pessoas visíveis
            </p>
          </div>

          {/* Toggle Canvas vs Board */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'canvas'
                  ? 'bg-[#1b4d3e] text-white shadow'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
              title="Árvore Genealógica Gráfica"
            >
              <GitBranch size={13} /> Árvore
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'board'
                  ? 'bg-[#1b4d3e] text-white shadow'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
              title="Quadro Geral dos 5 Ramos (Fácil Leitura)"
            >
              <LayoutGrid size={13} /> Quadro dos Ramos
            </button>
          </div>
        </div>

        {/* Right: Depth Presets + Zoom Controls (Only when in canvas mode) */}
        {viewMode === 'canvas' && (
          <div className="flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-stone-200 pointer-events-auto canvas-control">
            {/* Depth Selector Buttons */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-stone-500 px-1 hidden sm:inline">
                Nível:
              </span>
              <button
                onClick={() => setDepthPreset(2)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg hover:bg-white text-stone-700 transition"
                title="Mostrar apenas Giuseppe & Catterina e os 5 Filhos"
              >
                5 Filhos (G2)
              </button>
              <button
                onClick={() => setDepthPreset(3)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg hover:bg-white text-stone-700 transition"
                title="Mostrar até os Netos (Padrão)"
              >
                Netos (G3)
              </button>
              <button
                onClick={() => setDepthPreset(4)}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg hover:bg-white text-stone-700 transition"
                title="Mostrar até os Bisnetos"
              >
                Bisnetos (G4)
              </button>
              <button
                onClick={expandAll}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg hover:bg-white text-emerald-900 font-bold transition"
                title="Expandir todas as 6 gerações"
              >
                Tudo (G6)
              </button>
            </div>

            <div className="h-4 w-px bg-stone-300 mx-0.5" />

            {/* Zoom Controls */}
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-emerald-50 transition"
              title="Aumentar Zoom"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-stone-700 hover:bg-emerald-50 transition"
              title="Diminuir Zoom"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[11px] font-bold text-stone-800 px-1 min-w-[36px] text-center">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={fitToScreen}
              className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 px-2 py-1 rounded-lg transition"
              title="Centralizar e Enquadrar Árvore na Tela"
            >
              <Maximize2 size={13} />
              <span>Enquadrar</span>
            </button>

            {onExportPng && (
              <button
                onClick={onExportPng}
                className="flex items-center gap-1 text-[11px] font-bold bg-[#1b4d3e] hover:bg-[#133926] text-white px-2.5 py-1 rounded-lg shadow-sm transition"
                title="Baixar imagem em alta resolução"
              >
                <Download size={13} /> Imagem
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main View Render */}
      {viewMode === 'board' ? (
        <FamilyBoardView
          members={members}
          branches={branches}
          onSelectPerson={onSelectPerson}
          onMoveSibling={onMoveSibling}
          onFocusBranch={(branchId) => {
            onFocusBranch(branchId);
            setViewMode('canvas');
          }}
        />
      ) : (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className={`relative w-full h-full overflow-hidden ${
            isPanning ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Transformable Canvas Workspace */}
          <div
            id="tree-export-viewport"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isPanning ? 'none' : 'transform 0.1s ease-out'
            }}
            className="absolute top-0 left-0"
          >
            {/* SVG Connectors Layer */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: `${layout.bounds.width + 1000}px`,
                height: `${layout.bounds.height + 1000}px`
              }}
            >
              <defs>
                <linearGradient id="tree-branch-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1b4d3e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#3d7249" stopOpacity="0.7" />
                </linearGradient>
              </defs>

              {layout.links.map((link) => {
                const { id, sourceX, sourceY, targetX, targetY } = link;
                const midY = (sourceY + targetY) / 2;
                const pathData = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;

                return (
                  <g key={id}>
                    {/* White halo */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="5"
                      strokeOpacity="0.9"
                    />
                    {/* Main green curve */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="url(#tree-branch-gradient)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx={sourceX} cy={sourceY} r="3" fill="#1b4d3e" />
                    <circle cx={targetX} cy={targetY} r="3.5" fill="#c89f56" stroke="#1b4d3e" strokeWidth="1.5" />
                  </g>
                );
              })}
            </svg>

            {/* HTML Person Cards Nodes */}
            {layout.nodes.map((node) => {
              const isCollapsed = collapsedNodes.has(node.id);
              const hasChildren = node.childrenList && node.childrenList.length > 0;
              const isSelected = selectedPerson && selectedPerson.id === node.id;

              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`
                  }}
                  className="person-card-node"
                >
                  <PersonCard
                    person={node}
                    isCollapsed={isCollapsed}
                    hasChildren={hasChildren}
                    childrenCount={node.childrenList.length}
                    isSelected={isSelected}
                    onSelect={onSelectPerson}
                    onToggleCollapse={handleToggleCollapse}
                    onAddChild={onAddChild}
                    onEdit={onEditPerson}
                    onMoveSibling={onMoveSibling}
                  />
                </div>
              );
            })}
          </div>

          {/* Bottom Hint Banner */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-200 hidden sm:flex items-center gap-3 text-[11px] text-stone-600 pointer-events-none">
            <span className="font-bold text-emerald-950 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" /> Árvore Genealógica
            </span>
            <span className="text-stone-400">|</span>
            <span>💡 Arraste para navegar • Roda do mouse para zoom • Botão Enquadrar centraliza tudo</span>
          </div>
        </div>
      )}
    </div>
  );
}
