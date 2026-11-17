const SESSION_PW_KEY = 'visentin_edit_password_session';

export function getSavedSessionPassword() {
  try {
    return sessionStorage.getItem(SESSION_PW_KEY) || '';
  } catch {
    return '';
  }
}

export function saveSessionPassword(password) {
  try {
    if (password) {
      sessionStorage.setItem(SESSION_PW_KEY, password);
    } else {
      sessionStorage.removeItem(SESSION_PW_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

async function postTreeApi(body, password) {
  const res = await fetch('/api/tree', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(password ? { 'x-edit-password': password } : {})
    },
    body: JSON.stringify(body)
  });

  let payload = {};
  try {
    payload = await res.json();
  } catch {
    // non-json error fallback
  }

  if (!res.ok) {
    const err = new Error(payload.error || `Erro na sincronização (${res.status}).`);
    err.status = res.status;
    throw err;
  }

  return payload;
}

export async function fetchCloudTree() {
  const res = await fetch('/api/tree', {
    method: 'GET',
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`Falha ao consultar árvore na nuvem (${res.status}).`);
  }

  return res.json();
}

export async function verifyEditPassword(password) {
  return postTreeApi({ action: 'verify' }, password);
}

// Split member items into safe chunks (< 1.8 MB and <= 20 records per request)
// to stay well within Vercel Serverless Function 4.5 MB body limits.
function chunkMemberItems(items, maxBytes = 1800000, maxItems = 20) {
  const chunks = [];
  let current = [];
  let currentBytes = 0;

  for (const item of items) {
    const serialized = JSON.stringify(item);
    const itemBytes = serialized.length;

    if (
      current.length > 0 &&
      (current.length >= maxItems || currentBytes + itemBytes > maxBytes)
    ) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }

    current.push(item);
    currentBytes += itemBytes;
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

export async function cloudReplaceAllMembers(allMembers, password) {
  const items = allMembers.map((m, idx) => ({
    sortIdx: idx,
    data: m
  }));

  if (items.length === 0) {
    await postTreeApi({ action: 'clear' }, password);
    return;
  }

  const chunks = chunkMemberItems(items);
  for (let i = 0; i < chunks.length; i++) {
    await postTreeApi(
      {
        action: 'upsert',
        clearFirst: i === 0,
        members: chunks[i]
      },
      password
    );
  }
}

export async function cloudSyncDiff(prevMembers, nextMembers, password) {
  const prevMap = new Map();
  prevMembers.forEach((m, idx) => {
    prevMap.set(m.id, { member: m, sortIdx: idx });
  });

  const nextIds = new Set(nextMembers.map((m) => m.id));
  const deletedIds = prevMembers
    .filter((m) => !nextIds.has(m.id))
    .map((m) => m.id);

  const changedItems = [];
  nextMembers.forEach((m, idx) => {
    const prev = prevMap.get(m.id);
    if (!prev) {
      changedItems.push({ sortIdx: idx, data: m });
      return;
    }
    if (
      prev.sortIdx !== idx ||
      (prev.member !== m && JSON.stringify(prev.member) !== JSON.stringify(m))
    ) {
      changedItems.push({ sortIdx: idx, data: m });
    }
  });

  if (deletedIds.length > 0) {
    await postTreeApi({ action: 'delete', ids: deletedIds }, password);
  }

  if (changedItems.length > 0) {
    const chunks = chunkMemberItems(changedItems);
    for (const chunk of chunks) {
      await postTreeApi(
        {
          action: 'upsert',
          clearFirst: false,
          members: chunk
        },
        password
      );
    }
  }
}
