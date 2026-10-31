// IndexedDB storage service for Familia Visentin tree data
const DB_NAME = 'VisentinGenealogyDB';
const DB_VERSION = 1;
const STORE_NAME = 'tree_data';
const LOCAL_STORAGE_KEY = 'visentin_family_tree_backup';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => resolve(null);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveTreeData(data) {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: 'current_tree', data, updatedAt: new Date().toISOString() });
    }
  } catch (err) {
    console.warn('IndexedDB save failed, using fallback', err);
  }

  // Also save lightweight backup to localStorage
  try {
    // Save to localStorage as a safety net
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save quota exceeded (common if storing many high-res photos). IndexedDB holds full data.');
  }
}

export async function loadTreeData() {
  try {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get('current_tree');
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            resolve(req.result.data);
          } else {
            resolve(loadFromLocalStorage());
          }
        };
        req.onerror = () => resolve(loadFromLocalStorage());
      });
    }
  } catch (err) {
    console.warn('IndexedDB load failed', err);
  }
  return loadFromLocalStorage();
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading localStorage', e);
  }
  return null;
}

export function exportToJson(data, filename = 'arvore_familia_visentin.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importFromJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Arquivo JSON inválido. Certifique-se de selecionar um backup válido da árvore.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsText(file);
  });
}
