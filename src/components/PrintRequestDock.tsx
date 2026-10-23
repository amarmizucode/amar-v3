"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePrintRequest, type PrintItem } from "@/components/PrintRequest";

/**
 * The print-request surface: a pill pinned to the bottom-left corner that
 * carries the running count, and the drawer it opens — the selection reviewed,
 * a short form, and a Send that composes the email.
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
        `${i + 1}. [${it.index}] ${it.gallery} — frame ${String(it.frame).padStart(3, "0")} (${it.file})\n   ${absolute(it.ref)}`,
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

export function PrintRequestDock() {
  const { items, count, remove, clear, isOpen, openDrawer, closeDrawer } = usePrintRequest();
  const panel = useRef<HTMLElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  /* Send and Copy state their result ("draft ready", "copied") only for the
   * list they were pressed on: the store hands out a new `items` reference on
   * every change, so holding the acted-on reference and comparing is enough —
   * any edit to the selection makes it a new request again. */
  const [sentFor, setSentFor] = useState<PrintItem[] | null>(null);
  const [copiedFor, setCopiedFor] = useState<PrintItem[] | null>(null);
  const sent = sentFor === items;
  const copied = copiedFor === items;

  /* Escape closes the drawer — in the capture phase with its propagation
   * stopped, so the gallery viewer's own document-level Escape handler does
   * not also close the photograph underneath. */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      closeDrawer();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [isOpen, closeDrawer]);

  /* The page behind the drawer must not scroll. The lock sits on <body>
   * because the gallery canvas already owns <html>'s overflow and restores it
   * on its own schedule; two owners of one property would fight. */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Print request — ${count} ${count === 1 ? "photograph" : "photographs"}`;
    const body = requestBody(items, name, email, notes);
    window.location.href = `mailto:${REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSentFor(items);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `To: ${REQUEST_EMAIL}\n\n${requestBody(items, name, email, notes)}`,
      );
      setCopiedFor(items);
    } catch {
      /* Clipboard blocked: the Send path is still there. */
    }
  };

  return (
    <>
      <button
        type="button"
        className={`preq-pill text-[15px] font-medium tracking-[-0.03em]${count > 0 ? " is-on" : ""}`}
        onClick={openDrawer}
        aria-label={`Open print requests (${count} selected)`}
        aria-hidden={count === 0}
        tabIndex={count === 0 ? -1 : 0}
      >
        Print requests{" "}
        <span key={count} className="preq-pill_count">
          [{pad(count)}]
        </span>
      </button>

      <div
        className={`preq-scrim${isOpen ? " is-open" : ""}`}
        onClick={closeDrawer}
        aria-hidden
      />

      <aside
        ref={panel}
        className={`preq-panel${isOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Print requests"
        tabIndex={-1}
      >
        {/* A div, not <header>: the gallery pages hide every `header` element
            while a frame is open (body.pg-viewing), and this row must not go
            down with the site's. */}
        <div className="preq-head">
          <p className="text-[15px] font-semibold uppercase tracking-[-0.01em]">
            Print requests [{pad(count)}]
          </p>
          <button
            type="button"
            className="preq-close text-[15px] font-medium tracking-[-0.03em]"
            onClick={closeDrawer}
          >
            Close
          </button>
        </div>

        {count === 0 ? (
          <div className="preq-empty">
            <p>
              Nothing here yet. Open any photograph in a gallery and choose
              &ldquo;Request a print&rdquo; — it will be saved to this list.
            </p>
            <Link
              href="/photography"
              className="link-wipe text-[13px] font-medium uppercase tracking-[0.04em]"
              onClick={closeDrawer}
            >
              Browse the galleries
            </Link>
          </div>
        ) : (
          <>
            <ul className="preq-list">
              {items.map((it) => (
                <li key={it.id} className="preq-row">
                  <img src={it.thumb} alt="" loading="lazy" decoding="async" />
                  <div className="preq-row_meta">
                    <p className="text-[15px] font-medium tracking-[-0.01em]">
                      [{it.index}] {it.gallery}
                    </p>
                    <p className="preq-row_sub text-[13px]">
                      Frame {String(it.frame).padStart(3, "0")} · {it.file}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="preq-remove text-[13px] font-medium uppercase tracking-[0.04em]"
                    onClick={() => remove(it.id)}
                    aria-label={`Remove ${it.gallery} frame ${it.frame} from print requests`}
                  >
                    Remove
                  </button>
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
                  placeholder="Preferred sizes, framing, quantities — anything useful."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button type="submit" className="preq-send">
                {sent ? "Reopen the email draft" : "Send request"}
              </button>

              <p className="preq-hint">
                {sent
                  ? "Your email draft is ready — press send in your mail app to finish."
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
          </>
        )}
      </aside>
    </>
  );
}
