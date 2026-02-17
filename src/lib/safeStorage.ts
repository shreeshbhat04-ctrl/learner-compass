interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear?: () => void;
}

const inMemoryStore = new Map<string, string>();

const memoryStorage: StorageLike = {
  getItem: (key) => inMemoryStore.get(key) ?? null,
  setItem: (key, value) => {
    inMemoryStore.set(key, value);
  },
  removeItem: (key) => {
    inMemoryStore.delete(key);
  },
  clear: () => {
    inMemoryStore.clear();
  },
};

const isStorageLike = (candidate: unknown): candidate is StorageLike => {
  if (!candidate || typeof candidate !== "object") return false;
  return (
    typeof (candidate as StorageLike).getItem === "function" &&
    typeof (candidate as StorageLike).setItem === "function" &&
    typeof (candidate as StorageLike).removeItem === "function"
  );
};

const resolveStorage = (): StorageLike => {
  if (typeof window !== "undefined" && isStorageLike(window.localStorage)) {
    return window.localStorage;
  }

  if (typeof globalThis !== "undefined" && isStorageLike((globalThis as { localStorage?: unknown }).localStorage)) {
    return (globalThis as { localStorage: StorageLike }).localStorage;
  }

  return memoryStorage;
};

export const safeStorage = {
  getItem: (key: string): string | null => resolveStorage().getItem(key),
  setItem: (key: string, value: string): void => resolveStorage().setItem(key, value),
  removeItem: (key: string): void => resolveStorage().removeItem(key),
  clear: (): void => {
    const storage = resolveStorage();
    if (typeof storage.clear === "function") {
      storage.clear();
      return;
    }

    inMemoryStore.clear();
  },
};
