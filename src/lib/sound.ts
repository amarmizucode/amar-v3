/*
 * UI sound, ported from the reference's sound module.
 *
 * Five short taps play on pointer-over of anything interactive and a
 * "select" plays on click, at 0.15 volume. The whole thing is one pair of
 * capturing document listeners, so no element needs wiring of its own; the
 * nav's sound button is matched by class and toggles the state (persisted),
 * and the first click anywhere else switches sound on for the visit unless
 * the visitor has explicitly muted before — that preference wins.
 *
 * Every load starts muted. The stored value is only consulted to decide
 * whether that first click may un-mute, never to start playing unasked.
 *
 * Samples are expected at /sounds/{tap_01..tap_05,select}.mp3 — the
 * reference serves its own from a CDN. Missing files fail silently: a
 * rejected play() is swallowed, so the toggle still works without them.
 */

/*
 * Sound is off for now: the samples are not in `public/sounds/` yet, so the
 * nav toggle is not rendered and nothing binds. Set this back to true once
 * the six files are there.
 */
export const SOUND_AVAILABLE = false;

const STORAGE_KEY = "amar:sound-enabled";
const VOLUME = 0.15;
const BASE = "/sounds";
const TOGGLE = ".navbar_left_sound_btn";
const TAPS = ["tap_01", "tap_02", "tap_03", "tap_04", "tap_05"] as const;
const CLIPS = [...TAPS, "select"] as const;
type Clip = (typeof CLIPS)[number];

/* What counts as interactive, as the reference lists it. */
const INTERACTIVE = [
  "button",
  "a[href]",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "summary",
  "[role='button']",
  "[role='link']",
  "[data-sound-interactive]",
].join(",");

type Listener = (enabled: boolean) => void;

let enabled = false;
let bound = false;
let preference: boolean | null = null;
const listeners = new Set<Listener>();
let clips: Record<Clip, HTMLAudioElement> | null = null;

function readPreference(): boolean | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "true") return true;
    if (value === "false") return false;
    return null;
  } catch {
    return null;
  }
}

function audio(): Record<Clip, HTMLAudioElement> {
  if (clips) return clips;
  clips = Object.fromEntries(
    CLIPS.map((name) => {
      const el = new Audio(`${BASE}/${name}.mp3`);
      el.preload = "auto";
      el.volume = VOLUME;
      el.muted = !enabled;
      return [name, el];
    }),
  ) as Record<Clip, HTMLAudioElement>;
  return clips;
}

function play(name: Clip) {
  if (!enabled || document.hidden) return;
  const el = audio()[name];
  el.currentTime = 0;
  el.play().catch(() => {});
}

function stopAll() {
  if (!clips) return;
  Object.values(clips).forEach((el) => {
    el.pause();
    el.currentTime = 0;
  });
}

const playTap = () => play(TAPS[Math.floor(Math.random() * TAPS.length)]);
const playSelect = () => play("select");

export function isSoundEnabled() {
  return enabled;
}

export function subscribeSound(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function setSoundEnabled(next: boolean, persist = false) {
  enabled = next;
  if (persist) {
    preference = next;
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  }
  if (clips) {
    Object.values(clips).forEach((el) => {
      el.muted = !next;
    });
    if (!next) stopAll();
  }
  listeners.forEach((fn) => fn(next));
}

/* The interactive ancestor of an event target, or null if it is disabled. */
function resolve(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest(`${TOGGLE},${INTERACTIVE}`);
  if (!el) return null;
  if (el.closest('[inert], [aria-disabled="true"]') || el.matches(":disabled")) return null;
  return el;
}

function onClick(e: MouseEvent) {
  if (!e.isTrusted) return;
  const el = resolve(e.target);
  if (!el) return;
  if (el.matches(TOGGLE)) {
    e.preventDefault();
    setSoundEnabled(!enabled, true);
    if (enabled) playSelect();
    return;
  }
  if (!enabled && preference !== false) setSoundEnabled(true);
  playSelect();
}

function onPointerOver(e: PointerEvent) {
  if (e.pointerType === "touch") return;
  const el = resolve(e.target);
  if (!el) return;
  // Moving between children of the same control is not a new hover.
  if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
  playTap();
}

/* Idempotent; the first toggle to mount binds the listeners for the page. */
export function initSound() {
  if (bound || typeof window === "undefined") return;
  bound = true;
  preference = readPreference();
  document.addEventListener("click", onClick, true);
  document.addEventListener("pointerover", onPointerOver, true);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAll();
  });
}
