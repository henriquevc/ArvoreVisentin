import { BRANCHES, sortMembersByOrder } from '../data/initialFamilyData.js';

export function computeTreeLayout({
  members = [],
  branches = BRANCHES,
  activeBranch = 'all',
  collapsedNodes = new Set()
}) {
  const CARD_W = 240;
  const CARD_H = 135;
  const COUPLE_W = 320;
  const COUPLE_H = 165;
  const GAP_X = 28;
  const GAP_Y = 85;

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
    const giuseppe =
      members.find((m) => m.id === 'p-giuseppe') ||
      members.find((m) => m.generation === 1);
    const catarina =
      members.find((m) => m.id === 'p-catarina') ||
      members.filter((m) => m.generation === 1)[1];

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
    const branchChild = relevantMembers.find(
      (m) => m.branchId === activeBranch && m.generation === 2
    );
    if (branchChild && memberMap.has(branchChild.id)) {
      rootNodes = [memberMap.get(branchChild.id)];
    } else {
      rootNodes = sortMembersByOrder(
        relevantMembers
          .filter((m) => (m.parents || []).length === 0 && memberMap.has(m.id))
          .map((m) => memberMap.get(m.id))
      );
    }
  }

  const subtreeWidths = new Map();
  function measureSubtree(nodeId) {
    const node = memberMap.get(nodeId);
    if (!node) return 0;

    const selfW = node.width || CARD_W;
    if (
      collapsedNodes.has(nodeId) ||
      !node.childrenList ||
      node.childrenList.length === 0
    ) {
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
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function truncateText(ctx, text, maxWidth) {
  if (!text) return '';
  if (ctx.measureText(text).width <= maxWidth) return text;
  let str = text;
  while (str.length > 1 && ctx.measureText(`${str}…`).width > maxWidth) {
    str = str.slice(0, -1);
  }
  return `${str}…`;
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function loadImageSafe(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    if (!src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    const timeout = setTimeout(() => resolve(null), 4000);
    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };
    img.src = src;
  });
}

function drawCircularAvatar(ctx, img, cx, cy, radius, fallbackInitials, darkTheme = false) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (img && img.width > 0 && img.height > 0) {
    // Cover crop
    const imgRatio = img.width / img.height;
    const size = radius * 2;
    let drawW = size;
    let drawH = size;
    if (imgRatio > 1) {
      drawW = size * imgRatio;
    } else {
      drawH = size / imgRatio;
    }
    ctx.fillStyle = darkTheme ? '#1c1917' : '#f5f5f4';
    ctx.fillRect(cx - radius, cy - radius, size, size);
    ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH);
  } else {
    ctx.fillStyle = darkTheme ? '#1c1917' : '#e6efea';
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.fillStyle = darkTheme ? '#fcd34d' : '#1b4d3e';
    ctx.font = `700 ${Math.round(radius * 0.72)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackInitials || '?', cx, cy + 1);
  }

  ctx.restore();

  // Gold ring border
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = darkTheme ? '#fbbf24' : '#f59e0b';
  ctx.stroke();
}

function renderTreeOnCanvas(canvas, layout, activeBranchTitle, imageMap, collapsedNodes, scale) {
  const PAD_X = 60;
  const PAD_TOP = 45;
  const PAD_BOTTOM = 55;
  const HEADER_H = 84;

  const contentW = layout.bounds.maxX - layout.bounds.minX;
  const contentH = layout.bounds.maxY - layout.bounds.minY;

  const logicalW = Math.max(900, contentW + PAD_X * 2);
  const logicalH = HEADER_H + PAD_TOP + contentH + PAD_BOTTOM;

  canvas.width = Math.max(1, Math.round(logicalW * scale));
  canvas.height = Math.max(1, Math.round(logicalH * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Contexto gráfico indisponível.');

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Paper Background
  ctx.fillStyle = '#f7f9f6';
  ctx.fillRect(0, 0, logicalW, logicalH);

  // Subtle botanical dot pattern
  ctx.fillStyle = 'rgba(45, 90, 55, 0.08)';
  for (let gx = 16; gx < logicalW; gx += 28) {
    for (let gy = HEADER_H + 16; gy < logicalH; gy += 28) {
      ctx.beginPath();
      ctx.arc(gx, gy, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Top Poster Banner
  const headerGrad = ctx.createLinearGradient(0, 0, logicalW, 0);
  headerGrad.addColorStop(0, '#133926');
  headerGrad.addColorStop(0.5, '#1b4d3e');
  headerGrad.addColorStop(1, '#133926');
  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, logicalW, HEADER_H);

  // Italian tricolor top ribbon
  const thirdW = logicalW / 3;
  ctx.fillStyle = '#009246';
  ctx.fillRect(0, 0, thirdW, 5);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(thirdW, 0, thirdW, 5);
  ctx.fillStyle = '#ce2b37';
  ctx.fillRect(thirdW * 2, 0, thirdW, 5);

  // Gold bottom border of header
  ctx.fillStyle = '#c89f56';
  ctx.fillRect(0, HEADER_H - 2, logicalW, 2);

  // Title text centered
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fef3c7';
  ctx.font = '700 22px Cinzel, Georgia, serif';
  ctx.fillText('FAMÍLIA VISENTIN — ÁRVORE GENEALÓGICA', logicalW / 2, 34);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = '500 13px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(
    `${activeBranchTitle} • Raízes Italianas (Giuseppe & Catterina Visentin)`,
    logicalW / 2,
    60
  );

  // Offset so tree is centered horizontally under the banner
  const treeStartX = (logicalW - contentW) / 2 - layout.bounds.minX;
  const treeStartY = HEADER_H + PAD_TOP - layout.bounds.minY;

  ctx.translate(treeStartX, treeStartY);

  // 3. Connector Curved Lines
  for (const link of layout.links) {
    const { sourceX, sourceY, targetX, targetY } = link;
    const midY = (sourceY + targetY) / 2;

    ctx.beginPath();
    ctx.moveTo(sourceX, sourceY);
    ctx.bezierCurveTo(sourceX, midY, targetX, midY, targetX, targetY);
    ctx.strokeStyle = '#1b4d3e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sourceX, sourceY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#1b4d3e';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(targetX, targetY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#c89f56';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#1b4d3e';
    ctx.stroke();
  }

  // 4. Cards
  for (const node of layout.nodes) {
    const x = node.x;
    const y = node.y;
    const w = node.width;
    const h = node.height;

    if (node.isCouple) {
      // Couple Patriarch Root Card
      ctx.save();
      ctx.shadowColor = 'rgba(19, 57, 38, 0.22)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;

      roundRectPath(ctx, x, y, w, h, 16);
      const cardGrad = ctx.createLinearGradient(x, y, x, y + h);
      cardGrad.addColorStop(0, '#133926');
      cardGrad.addColorStop(1, '#1a4a33');
      ctx.fillStyle = cardGrad;
      ctx.fill();
      ctx.restore();

      roundRectPath(ctx, x, y, w, h, 16);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#eab308';
      ctx.stroke();

      // Top Ribbon Badge
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fcd34d';
      ctx.font = '700 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('1ª GERAÇÃO • PATRIARCAS IMIGRANTES', x + 14, y + 18);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#fde68a';
      ctx.font = 'italic 11px Georgia, serif';
      ctx.fillText('Itália 1924', x + w - 14, y + 18);

      // Two Avatars (Giuseppe & Catterina)
      const giuseppe = node.husband;
      const catarina = node.wife;
      const gImg = giuseppe?.photo ? imageMap.get(giuseppe.photo) : null;
      const cImg = catarina?.photo ? imageMap.get(catarina.photo) : null;

      const leftCx = x + w * 0.32;
      const rightCx = x + w * 0.68;
      const avatarCy = y + 66;

      drawCircularAvatar(ctx, gImg, leftCx, avatarCy, 25, 'G', true);
      drawCircularAvatar(ctx, cImg, rightCx, avatarCy, 25, 'C', true);

      // Heart in middle
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fbbf24';
      ctx.font = '14px sans-serif';
      ctx.fillText('♥', x + w / 2, avatarCy);

      // Couple Full Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12.5px Cinzel, Georgia, serif';
      const coupleTitle = `${giuseppe?.name?.split(' ')[0] || 'Giuseppe'} & ${catarina?.name || 'Catterina Visentin'}`;
      ctx.fillText(truncateText(ctx, coupleTitle, w - 24), x + w / 2, y + 116);

      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'italic 10.5px "Cormorant Garamond", Georgia, serif';
      ctx.fillText('Vindos de Treviso, Vêneto com os 5 filhos', x + w / 2, y + 135);

      ctx.fillStyle = '#fcd34d';
      ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Origem dos 5 Ramos Familiares', x + w / 2, y + 152);
      continue;
    }

    // Regular Member Card
    const isImmigrantChild = node.generation === 2;
    const isNeto = node.generation === 3;

    ctx.save();
    ctx.shadowColor = 'rgba(22, 60, 36, 0.12)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    roundRectPath(ctx, x, y, w, h, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();

    roundRectPath(ctx, x, y, w, h, 15);
    ctx.lineWidth = isImmigrantChild ? 2.2 : 1.6;
    ctx.strokeStyle = isImmigrantChild
      ? '#059669'
      : isNeto
      ? '#047857'
      : '#d6d3d1';
    ctx.stroke();

    // Generation Tag Pill
    const genText = isImmigrantChild
      ? '2ª GERAÇÃO • IMIGRANTE'
      : isNeto
      ? '3ª GERAÇÃO • NETO'
      : node.generation === 4
      ? '4ª GERAÇÃO • BISNETO'
      : `${node.generation}ª GERAÇÃO`;

    ctx.font = '700 8.5px "Plus Jakarta Sans", sans-serif';
    const pillPadX = 7;
    const pillW = ctx.measureText(genText).width + pillPadX * 2;
    const pillH = 16;
    const pillX = x + 11;
    const pillY = y + 10;

    roundRectPath(ctx, pillX, pillY, pillW, pillH, 8);
    ctx.fillStyle = isImmigrantChild
      ? '#d1fae5'
      : isNeto
      ? '#f0fdfa'
      : '#f5f5f4';
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isImmigrantChild
      ? '#064e3b'
      : isNeto
      ? '#134e4a'
      : '#44403c';
    ctx.fillText(genText, pillX + pillPadX, pillY + pillH / 2 + 0.5);

    // Branch short name on right
    if (node.branchId !== 'all' && node.branchShortName) {
      ctx.textAlign = 'right';
      ctx.fillStyle = '#78716c';
      ctx.font = '600 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        truncateText(ctx, node.branchShortName, 70),
        x + w - 12,
        pillY + pillH / 2
      );
    }

    // Avatar circle
    const avatarCx = x + 34;
    const avatarCy = y + 60;
    const avatarR = 22;
    const img = node.photo ? imageMap.get(node.photo) : null;
    drawCircularAvatar(ctx, img, avatarCx, avatarCy, avatarR, getInitials(node.name), false);

    // Living indicator dot
    ctx.beginPath();
    ctx.arc(avatarCx + 15, avatarCy + 16, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = node.isLiving ? '#10b981' : '#a8a29e';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Name, Maiden Name & Dates
    const textX = x + 66;
    const maxTextW = w - 78;

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1c1917';
    ctx.font = '700 12px Cinzel, Georgia, serif';
    ctx.fillText(truncateText(ctx, node.name, maxTextW), textX, y + 48);

    let dateY = y + 66;
    if (node.maidenName) {
      ctx.fillStyle = '#78716c';
      ctx.font = 'italic 9.5px Georgia, serif';
      ctx.fillText(truncateText(ctx, `(n. ${node.maidenName})`, maxTextW), textX, y + 62);
      dateY = y + 76;
    }

    ctx.fillStyle = '#57534e';
    ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
    const dateLabel = `${node.birthDate || '?'}${node.deathDate ? ` — ${node.deathDate}` : ''}`;
    ctx.fillText(truncateText(ctx, dateLabel, maxTextW), textX, dateY);

    // Bottom Divider: Spouse & Order / Collapsed Children Badge
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 96);
    ctx.lineTo(x + w - 12, y + 96);
    ctx.strokeStyle = '#f5f5f4';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (node.spouseName) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f43f5e';
      ctx.font = '10px sans-serif';
      ctx.fillText('♥', x + 12, y + 114);

      ctx.fillStyle = '#57534e';
      ctx.font = '500 10px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        truncateText(ctx, `c/c ${node.spouseName}`, w - 80),
        x + 24,
        y + 114
      );
    } else if (node.order) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#78716c';
      ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${node.order}º filho(a)`, x + 12, y + 114);
    }

    const isCollapsed = collapsedNodes.has(node.id);
    const childCount = node.childrenList ? node.childrenList.length : 0;
    if (isCollapsed && childCount > 0) {
      const badgeLabel = `+${childCount}`;
      ctx.font = '700 9.5px "Plus Jakarta Sans", sans-serif';
      const bw = ctx.measureText(badgeLabel).width + 14;
      roundRectPath(ctx, x + w - bw - 12, y + 105, bw, 18, 9);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#78350f';
      ctx.fillText(badgeLabel, x + w - bw / 2 - 12, y + 114.5);
    }
  }

  ctx.restore();
}

function canvasToBlobAsync(canvas) {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    } catch {
      resolve(null);
    }
  });
}

export async function downloadTreePosterPng({
  members = [],
  branches = BRANCHES,
  activeBranch = 'all',
  collapsedNodes = new Set(),
  filename = 'arvore_visentin.png'
}) {
  const layout = computeTreeLayout({
    members,
    branches,
    activeBranch,
    collapsedNodes
  });

  const activeBranchObj =
    (branches || BRANCHES).find((b) => b.id === activeBranch) ||
    (branches || BRANCHES)[0];

  // Collect unique photo URLs visible in layout
  const photoSources = new Set();
  for (const node of layout.nodes) {
    if (node.isCouple) {
      if (node.husband?.photo) photoSources.add(node.husband.photo);
      if (node.wife?.photo) photoSources.add(node.wife.photo);
    } else if (node.photo) {
      photoSources.add(node.photo);
    }
  }

  const imageMap = new Map();
  await Promise.all(
    Array.from(photoSources).map(async (src) => {
      const img = await loadImageSafe(src);
      if (img) imageMap.set(src, img);
    })
  );

  // Wait briefly for web fonts if already loading (non-blocking)
  if (document.fonts && document.fonts.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 500))
    ]);
  }

  const contentW = Math.max(900, layout.bounds.maxX - layout.bounds.minX + 120);
  const contentH = layout.bounds.maxY - layout.bounds.minY + 184;

  // Progressive resolution tiers to guarantee 0-byte canvas overflow never happens
  const tiers = [
    { maxDim: 14000, maxPixels: 90_000_000, desiredScale: 2.0 },
    { maxDim: 8192, maxPixels: 42_000_000, desiredScale: 1.5 },
    { maxDim: 4096, maxPixels: 14_000_000, desiredScale: 1.0 }
  ];

  let validBlob = null;

  for (const tier of tiers) {
    const scaleByDim = Math.min(tier.maxDim / contentW, tier.maxDim / contentH);
    const scaleByArea = Math.sqrt(tier.maxPixels / (contentW * contentH));
    const finalScale = Math.max(0.05, Math.min(tier.desiredScale, scaleByDim, scaleByArea));

    const canvas = document.createElement('canvas');
    renderTreeOnCanvas(
      canvas,
      layout,
      activeBranchObj?.name || 'Família Visentin',
      imageMap,
      collapsedNodes,
      finalScale
    );

    const blob = await canvasToBlobAsync(canvas);
    // Release GPU backing store if retrying
    if (!blob || blob.size < 100) {
      canvas.width = 1;
      canvas.height = 1;
      continue;
    }

    validBlob = blob;
    break;
  }

  if (!validBlob) {
    throw new Error('Não foi possível gerar o arquivo PNG neste dispositivo.');
  }

  const url = URL.createObjectURL(validBlob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
