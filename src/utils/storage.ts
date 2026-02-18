import type { Writ, OfflineQueue } from '../types';

const STORAGE_KEYS = {
  WRITS: 'sheriff_writs',
  OFFLINE_QUEUE: 'sheriff_offline_queue',
  LAST_SYNC: 'sheriff_last_sync',
};

// Writ storage
export const saveWrits = (writs: Writ[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WRITS, JSON.stringify(writs));
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error saving writs:', error);
  }
};

export const loadWrits = (): Writ[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WRITS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading writs:', error);
    return null;
  }
};

export const updateWrit = (updatedWrit: Writ): void => {
  const writs = loadWrits();
  if (writs) {
    const index = writs.findIndex(w => w.id === updatedWrit.id);
    if (index !== -1) {
      writs[index] = { ...updatedWrit, lastModified: Date.now() };
      saveWrits(writs);
    }
  }
};

// Offline queue for pending sync
export const addToOfflineQueue = (action: OfflineQueue['action'], data: OfflineQueue['data']): void => {
  try {
    const queue = getOfflineQueue();
    const newItem: OfflineQueue = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
      synced: false,
    };
    queue.push(newItem);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('Error adding to offline queue:', error);
  }
};

export const getOfflineQueue = (): OfflineQueue[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading offline queue:', error);
    return [];
  }
};

export const clearOfflineQueue = (): void => {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
};

export const getLastSyncTime = (): number | null => {
  const time = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  return time ? Number.parseInt(time, 10) : null;
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Check storage size
export const getStorageUsage = (): { used: number; total: number } => {
  let used = 0;
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      used += localStorage[key].length + key.length;
    }
  }
  // Approximate total (5MB limit for most browsers)
  const total = 5 * 1024 * 1024;
  return { used, total };
};
