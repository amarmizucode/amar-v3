"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { Eyebrow } from "@/components/Eyebrow";
import { usePrintRequest, type PrintItem } from "@/components/PrintRequest";

/**
 * The print-request surface: a pill in the floating controls that carries
 * the running count, and the modal it opens — the selection reviewed, a short
 * form, and a Send that composes the email.
 *
 * Email because that is the site's one contact channel (the footer's
 * hello@amarramesh.com); there is no server to post a form to. Send fills a
 * draft via mailto: so nothing leaves the visitor's machine until they press
 * send in their own mail app, and Copy covers the machines where no mail app
 * ever opens.
 */

const REQUEST_EMAIL = "hello@amarramesh.com";

const pad = (v: number) => String(v).padStart(2, "0");

/** Root-relative web copies become absolute so the email's links resolve. */
const absolute = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${window.location.origin}${path}`;

const requestBody = (items: PrintItem[], name: string, email: string, notes: string) => {
  const list = items
    .map(
      (it, i) =>
        `${i + 1}. [${it.index}] ${it.gallery} - frame ${String(it.frame).padStart(3, "0")} (${it.file})\n   ${absolute(it.ref)}`,
    )
    .join("\n\n");
  const one = items.length === 1;
  return [
    "Hello Amar,",
    "",
    `I would like to order ${one ? "a print of this photograph" : `prints of these ${items.length} photographs`}:`,
    "",
    list,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    ...(notes.trim() ? [`Notes: ${notes.trim()}`] : []),
    "",
    "Sent from the print request form on the website.",
  ].join("\n");
};

/**
 * The trigger, the top pill of the floating controls (AppControls), above the
 * theme pill: the photograph icon with the running count as a badge. It
 * collapses to nothing while the list is empty, so the stack reads unchanged
 * until a print is saved.
 */
export function PrintRequestTrigger() {
  const { count, openDrawer } = usePrintRequest();
  return (
    <button
      type="button"
      className={`option prints${count > 0 ? " is-on" : ""}`}
      onClick={openDrawer}
      aria-label={`Open print requests (${count} selected)`}
      aria-hidden={count === 0}
      tabIndex={count === 0 ? -1 : 0}
    >
      <svg
        className="icon prints"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        aria-hidden
      >
        <path d="M19 14a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" />
        <path d="M26 4H6a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 22H6v-6l5-5 5.59 5.59a2 2 0 0 0 2.82 0L21 19l5 5zm0-4.83-3.59-3.59a2 2 0 0 0-2.82 0L18 19.17l-5.59-5.59a2 2 0 0 0-2.82 0L6 17.17V6h20z" />
      </svg>
      {/* Remounted per count so the badge pulses when it changes. */}
      <span key={count} className="preq-badge" aria-hidden>
        {count}
      </span>
    </button>
  );
}

/**
 * The form state lives here, outside the modal, so a name typed and the modal
 * closed is still there when it opens again.
 */
export function PrintRequestDock() {
  const { items, isOpen, closeDrawer } = usePrintRequest();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  /* Send and Copy state their result ("draft ready", "copied") only for the
   * list they were pressed on: the store hands out a new `items` reference on
   * every change, so holding the acted-on reference and comparing is enough —
   * any edit to the selection makes it a new request again. */
  const [sentFor, setSentFor] = useState<PrintItem[] | null>(null);
  const [copiedFor, setCopiedFor] = useState<PrintItem[] | null>(null);

  if (!isOpen) return null;
  return (
    <PrintRequestModal
      onClose={closeDrawer}
      fields={{ name, setName, email, setEmail, notes, setNotes }}
      sent={sentFor === items}
      onSent={() => setSentFor(items)}
      copied={copiedFor === items}
      onCopied={() => setCopiedFor(items)}
    />
  );
}

type Fields = {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
};

/**
 * The stage is ContactModal's: a blurred scrim, Escape / scrim / Close all
 * fade it out, focus moves in and returns to the trigger, the page behind is
 * locked on <body>. Portals to <body> so `position: fixed` means the
 * viewport, not ScrollSmoother's transformed content.
 */
function PrintRequestModal({
  onClose,
  fields: { name, setName, email, setEmail, notes, setNotes },
  sent,
  onSent,
  copied,
  onCopied,
}: {
  onClose: () => void;
  fields: Fields;
  sent: boolean;
  onSent: () => void;
  copied: boolean;
  onCopied: () => void;
}) {
  const { items, count, remove, clear } = usePrintRequest();
  const overlay = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    const el = overlay.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduced) {
      onClose();
      return;
    }
    gsap.to(el, { autoAlpha: 0, duration: DUR.fast, ease: "ease-transition", onComplete: onClose });
  }, [onClose]);

  /* Escape closes — in the capture phase with its propagation stopped, so the
   * gallery viewer's own document-level Escape handler does not also close
   * the photograph underneath. Focus moves to the first field (or Close, on
   * an empty list) and back to the trigger after. */
  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    const panel = overlay.current;
    (panel?.querySelector<HTMLElement>("input") ?? panel?.querySelector<HTMLElement>(".close-btn"))
      ?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      close();
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      returnTo?.focus({ preventScroll: true });
    };
  }, [close]);

  /* The page behind must not scroll. The lock sits on <body> because the
   * gallery canvas already owns <html>'s overflow and restores it on its own
   * schedule; two owners of one property would fight. */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useGSAP(() => {
    const el = overlay.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }
    gsap
      .timeline({ defaults: { ease: "ease-transition" } })
      .fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.fast })
      .fromTo(
        el.querySelector("[data-preq-panel]"),
        { scale: 0.96 },
        { scale: 1, duration: DUR.normal },
        "<",
      );
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Print request - ${count} ${count === 1 ? "photograph" : "photographs"}`;
    const body = requestBody(items, name, email, notes);
    window.location.href = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    onSent();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `To: ${REQUEST_EMAIL}\n\n${requestBody(items, name, email, notes)}`,
      );
      onCopied();
    } catch {
      /* Clipboard blocked: the Send path is still there. */
    }
  };

  return createPortal(
    <div
      ref={overlay}
      role="dialog"
      aria-modal
      aria-labelledby="preq-modal-title"
      className="invisible fixed inset-0 z-[1200] text-foreground"
    >
      {/* The inverted ground, as on the contact modal, so scrim and panel
          always part. */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-pointer bg-[color-mix(in_srgb,var(--invert-ground)_75%,transparent)] backdrop-blur-sm"
      />

      {/* Full screen on a phone; from md a large panel, inset from the edges
          and full height, so the picks have room to read as photographs. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:p-8">
        <div
          data-preq-panel
          className="works pointer-events-auto relative h-full w-full overflow-y-auto overscroll-contain bg-background px-5 py-6 md:h-full md:max-w-[84rem] md:rounded-[0.15rem] md:px-10 md:py-10"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-4">
              <Eyebrow>Prints [{pad(count)}]</Eyebrow>
              <h2 id="preq-modal-title" className="section_heading">
                Print requests
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="close-kbd" aria-hidden>
                Esc
              </kbd>
              <button type="button" onClick={close} className="close-btn">
                Close
              </button>
            </div>
          </div>

          {count === 0 ? (
            <div className="preq-empty mt-8">
              <p>
                Nothing here yet. Open any photograph in a gallery and choose
                &ldquo;Request a print&rdquo; - it will be saved to this list.
              </p>
              <Link
                href="/photography"
                className="link-wipe text-[13px] font-medium uppercase tracking-[0.04em]"
                onClick={close}
              >
                Browse the galleries
              </Link>
            </div>
          ) : (
            <div className="preq-body mt-8 md:mt-10">
              <ul className="preq-grid">
                {items.map((it) => (
                  <li key={it.id} className="preq-tile">
                    <div className="preq-tile_media">
                      <img src={it.thumb} alt="" loading="lazy" decoding="async" />
                      <button
                        type="button"
                        className="preq-tile_remove"
                        onClick={() => remove(it.id)}
                        aria-label={`Remove ${it.gallery} frame ${it.frame} from print requests`}
                      >
                        <svg viewBox="0 0 32 32" width="16" height="16" aria-hidden>
                          <path d="M24 9.4 22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4-6.6-6.6L24 9.4z" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-2 text-[15px] font-medium tracking-[-0.02em]">
                      [{it.index}] {it.gallery}
                    </p>
                    <p className="preq-tile_sub text-[13px]">
                      Frame {String(it.frame).padStart(3, "0")} · {it.file}
                    </p>
                  </li>
                ))}
              </ul>

              <form className="preq-form" onSubmit={submit}>
                <div className="preq-field">
                  <label htmlFor="preq-name">Name</label>
                  <input
                    id="preq-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="preq-field">
                  <label htmlFor="preq-email">Email</label>
                  <input
                    id="preq-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="preq-field">
                  <label htmlFor="preq-notes">Notes (optional)</label>
                  <textarea
                    id="preq-notes"
                    rows={3}
                    placeholder="Preferred sizes, framing, quantities - anything useful."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button type="submit" className="preq-send">
                  {sent ? "Reopen the email draft" : "Send request"}
                </button>

                <p className="preq-hint">
                  {sent
                    ? "Your email draft is ready - press send in your mail app to finish."
                    : `Opens your email app with the request addressed to ${REQUEST_EMAIL}; sizes and pricing are confirmed there.`}
                </p>

                <div className="preq-aux text-[13px] font-medium uppercase tracking-[0.04em]">
                  <button type="button" onClick={copy}>
                    {copied ? "Copied ✓" : "Copy request instead"}
                  </button>
                  <button type="button" onClick={clear}>
                    Clear list
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
