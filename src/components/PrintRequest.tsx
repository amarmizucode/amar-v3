"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Print requests — the visitor's selection of photographs to order as prints.
 *
 * The site has no backend: the galleries prerender and the photographs come
 * off R2, so the selection lives entirely on the client, in localStorage, and
 * submitting composes an email to the same address the rest of the site uses,
 * listing every chosen frame. The provider sits in the root layout so a pick
 * made inside a gallery is still there after navigating anywhere else.
 *
 * localStorage is the store and useSyncExternalStore the reader — the same
 * shape AppControls gives `prefers-color-scheme` — so the server render and
 * the first client render agree (both empty), the stored picks appear right
 * after hydration, and a second tab stays in step through the native
 * `storage` event.
 */

export type PrintItem = {
  /** `slug#frameIndex` — stable for as long as the manifest order holds. */
  id: string;
  /** Gallery title and its "[01]" index, for the drawer list and the email. */
  gallery: string;
  index: string;
  slug: string;
  /** 1-based frame number, matching the viewer's own counter. */
  frame: number;
  /** The original filename from the manifest — how Amar finds the master. */
  file: string;
  thumb: string;
  /** The 1200px web copy; the email links it so the request is unambiguous. */
  ref: string;
};

type PrintRequestApi = {
  items: PrintItem[];
  count: number;
  has: (id: string) => boolean;
  toggle: (item: PrintItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const STORAGE_KEY = "amar:print-requests:v1";
/** Same-tab change signal — the native `storage` event only fires in other tabs. */
const CHANGE_EVENT = "amar:print-requests";

/* Mirror of the last write, read back when localStorage is unavailable
 * (private mode, blocked storage) — the selection then lives for the visit. */
let memoryRaw: string | null = null;

const readRaw = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? memoryRaw;
  } catch {
    return memoryRaw;
  }
};

const readServerRaw = () => null;

const writeItems = (items: PrintItem[]) => {
  const raw = JSON.stringify(items);
  memoryRaw = raw;
  try {
    localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* Already mirrored above. */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};

const parseItems = (raw: string | null): PrintItem[] => {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((it): it is PrintItem => typeof (it as PrintItem)?.id === "string")
      : [];
  } catch {
    return [];
  }
};

const PrintRequestContext = createContext<PrintRequestApi | null>(null);

export function PrintRequestProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readRaw, readServerRaw);
  // Memoised on the raw string, so `items` keeps its reference between writes
  // — the drawer compares references to tell a new selection from an old one.
  const items = useMemo(() => parseItems(raw), [raw]);
  const [isOpen, setIsOpen] = useState(false);

  const has = useCallback((id: string) => items.some((it) => it.id === id), [items]);
  // Mutations re-read the store rather than closing over `items`, so two
  // writes in one tick never resurrect a stale list.
  const toggle = useCallback((item: PrintItem) => {
    const cur = parseItems(readRaw());
    writeItems(
      cur.some((it) => it.id === item.id)
        ? cur.filter((it) => it.id !== item.id)
        : [...cur, item],
    );
  }, []);
  const remove = useCallback((id: string) => {
    writeItems(parseItems(readRaw()).filter((it) => it.id !== id));
  }, []);
  const clear = useCallback(() => writeItems([]), []);
  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      has,
      toggle,
      remove,
      clear,
      isOpen,
      openDrawer,
      closeDrawer,
    }),
    [items, has, toggle, remove, clear, isOpen, openDrawer, closeDrawer],
  );

  return <PrintRequestContext.Provider value={value}>{children}</PrintRequestContext.Provider>;
}

export function usePrintRequest() {
  const ctx = useContext(PrintRequestContext);
  if (!ctx) throw new Error("usePrintRequest must be used inside <PrintRequestProvider>");
  return ctx;
}
