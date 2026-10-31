"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useGSAP } from "@gsap/react";
import { gsap, DUR } from "@/lib/gsap";
import { CtaPill } from "@/components/CtaPill";
import { Eyebrow } from "@/components/Eyebrow";
import { ContactForm, CONTACT_EMAIL } from "@/components/ContactForm";

/**
 * The contact modal — the enquiry form opened in place by the site's CTAs
 * (Get in Touch, Start a Conversation) rather than scrolling to the home
 * page's Contact section, so it works from every page without a route
 * change. The provider sits in the root layout; `ContactCta` is the pill
 * that opens it.
 *
 * The stage is FilmModal's: a blurred scrim, Escape / scrim / Close all
 * fade it out, focus moves in and returns to the trigger, the page behind
 * is locked on <body>. The panel scrolls on its own when the form outgrows
 * the viewport (ScrollSmoother's normalizeScroll allows nested scroll).
 * Portals to <body> so `position: fixed` means the viewport, not
 * ScrollSmoother's transformed content.
 */

type ContactModalApi = { open: () => void };

const ContactModalContext = createContext<ContactModalApi | null>(null);

export function useContactModal() {
  const api = useContext(ContactModalContext);
  if (!api) throw new Error("useContactModal must be used inside ContactModalProvider");
  return api;
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <ContactModalContext.Provider value={value}>
      {children}
      {isOpen && <ContactModal onClose={close} />}
    </ContactModalContext.Provider>
  );
}

/** The CTA pill, as a button that opens the modal. */
export function ContactCta({ label, className }: { label: string; className?: string }) {
  const { open } = useContactModal();
  return <CtaPill type="button" label={label} onClick={open} className={className} />;
}

function ContactModal({ onClose }: { onClose: () => void }) {
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

  // Escape closes; focus moves to the first field and back to the CTA after.
  // Capture phase with propagation stopped, as the print drawer does, so a
  // gallery's own Escape handler does not also fire underneath.
  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    overlay.current?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
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

  // Lock the page behind the modal, restoring what was there before.
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
        el.querySelector("[data-contact-panel]"),
        { scale: 0.96 },
        { scale: 1, duration: DUR.normal },
        "<",
      );
  });

  return createPortal(
    <div
      ref={overlay}
      role="dialog"
      aria-modal
      aria-labelledby="contact-modal-title"
      className="invisible fixed inset-0 z-[1200] text-foreground"
    >
      {/* The scrim is the inverted ground, not the page's: the panel is on
          the page's, so the two always part — dark behind on the light
          stops, light behind on the dark ones. */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 cursor-pointer bg-[color-mix(in_srgb,var(--invert-ground)_75%,transparent)] backdrop-blur-sm"
      />

      {/* Full screen on a phone; a centred panel from md. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:p-8">
        <div
          data-contact-panel
          className="works pointer-events-auto relative h-full w-full overflow-y-auto overscroll-contain bg-background px-5 py-6 md:h-auto md:max-h-full md:max-w-[46rem] md:rounded-[0.15rem] md:px-10 md:py-10"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex flex-col gap-4">
              <Eyebrow>Contact</Eyebrow>
              <h2 id="contact-modal-title" className="section_heading">
                Let&rsquo;s talk
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

          <p className="works_p mt-4 max-w-[44ch]">
            Have a project in mind, an interesting idea or something you think I&rsquo;d enjoy
            exploring? I&rsquo;d love to hear about it. Or write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link-wipe text-foreground">
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <div className="mt-8 md:mt-10">
            <ContactForm idPrefix="contact-modal" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
