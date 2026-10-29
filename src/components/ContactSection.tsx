"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { CornerArrow } from "@/components/Arrows";

/**
 * The copy document's CONTACT section: the invitation, where Amar is based,
 * and the enquiry form it specifies — Name, Email, Organisation (optional),
 * Project Type and Message.
 *
 * Set on the reference system like the rest of the home page: the header
 * column is Selected work's (eyebrow, heading, `works_p` intro), the email a
 * footer-style inline hover row, and the fields works-list rows — a muted
 * small label over the entry line in text-large — on the same dotted rules.
 * The submit is the CTA pill. Styles are the `contact_*` rules in
 * globals.css.
 *
 * Email rather than a POST, for the reason PrintRequestDock gives: the site
 * prerenders and has no server to receive a form. Send composes a mailto:
 * draft, so nothing leaves the visitor's machine until they send it from
 * their own mail app, and Copy covers the machines where no mail client ever
 * opens.
 */

const CONTACT_EMAIL = "hello@amarramesh.com";

/* The doc lists no options for Project Type, so these follow its own "What I
   do" sections, with a catch-all last. */
const PROJECT_TYPES = [
  "Wedding photography",
  "Portrait photography",
  "Films & documentaries",
  "Commercial photography & campaigns",
  "Books & publishing",
  "Mentorship",
  "Something else",
];

const enquiryBody = (
  name: string,
  email: string,
  organisation: string,
  projectType: string,
  message: string,
) =>
  [
    `Name: ${name}`,
    `Email: ${email}`,
    organisation.trim() ? `Organisation: ${organisation}` : null,
    projectType ? `Project type: ${projectType}` : null,
    "",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

/** A field's label, in the muted small reference type. */
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="contact_label">
      <span className="contact_label_text">{children}</span>
    </label>
  );
}

export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [projectType, setProjectType] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const compose = () => enquiryBody(name, email, organisation, projectType, message);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = projectType ? `Enquiry — ${projectType}` : "Enquiry";
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(compose())}`;
    setSent(true);
    setCopied(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\n\n${compose()}`);
      setCopied(true);
    } catch {
      /* Clipboard blocked: Send is still there. */
    }
  };

  return (
    /* `works` for the eyebrow marker and rule colours, as every reference
       section takes it. */
    <section id="contact" className="works shell py-20 md:py-28">
      <div className="grid-12 gap-y-12">
        {/* The invitation — Selected work's header column, on the About
            band's column plan: the left block over the portrait's three
            columns, the form over the copy's 5–10, so the two sections
            align rail for rail. The details pin to the foot of the column,
            as the FAQ's left block pins its CTA. */}
        <div className="col-span-12 flex flex-col gap-6 md:col-span-3">
          <Reveal>
            <p className="works_eyebrow">
              <span aria-hidden className="works_eyebrow_marker" />
              <span className="works_eyebrow_text">Contact</span>
            </p>
          </Reveal>
          <Reveal>
            <h2 className="section_heading">Let&rsquo;s talk</h2>
          </Reveal>
          <Reveal>
            <p className="works_p max-w-[36ch]">
              Have a project in mind, an interesting idea or something you think I&rsquo;d enjoy
              exploring? I&rsquo;d love to hear about it.
            </p>
          </Reveal>

          <Reveal className="flex flex-col items-start gap-3 md:mt-auto md:pt-10">
            {/* The footer's inline email row, verbatim interaction: label
                slides, the corner arrow travels with it. */}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="footer_hover_row is-inline-row contact_email flex w-fit items-center gap-[0.3em]"
            >
              <span className="footer_hover_label">{CONTACT_EMAIL}</span>
              <span className="footer_hover_marker flex items-center">
                <CornerArrow className="inline-arrow" />
              </span>
            </a>
            <p className="works_p">Based in Chennai, India</p>
          </Reveal>
        </div>

        {/* The form the doc specifies, as a ruled works list. */}
        <Reveal className="col-span-12 md:col-start-5 md:col-span-6">
          <form onSubmit={send} className="flex flex-col">
            <p className="contact_descriptor pb-[var(--ref-space-3)]">
              (Tell me a little about your idea)
            </p>

            <div className="contact_grid">
              {/* Name and email share a row from 30rem: both are short. */}
              <div className="contact_field">
                <FieldLabel htmlFor="contact-name">
                  Name
                </FieldLabel>
                <input
                  id="contact-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="contact_field">
                <FieldLabel htmlFor="contact-email">
                  Email
                </FieldLabel>
                <input
                  id="contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="contact_field">
                <FieldLabel htmlFor="contact-org">
                  Organisation (optional)
                </FieldLabel>
                <input
                  id="contact-org"
                  type="text"
                  autoComplete="organization"
                  placeholder="Studio, brand or institution"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                />
              </div>
              <div className="contact_field">
                <FieldLabel htmlFor="contact-type">
                  Project type
                </FieldLabel>
                {/* A select rather than a free text field: it spares the
                    visitor the typing and keeps the subject line tidy. */}
                <select
                  id="contact-type"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                >
                  <option value="">Select one</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="contact_field contact_span">
                <FieldLabel htmlFor="contact-message">
                  Your message
                </FieldLabel>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  placeholder="A little about what you have in mind."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="contact_actions">
              {/* The CTA pill, on a real submit button: the same markup
                  CtaPill renders, which the `.btn-pill` rules animate. */}
              <button type="submit" className="btn-pill cursor-pointer">
                <span className="btn-pill_text_contain">
                  <span className="btn-pill_text">
                    {sent ? "Reopen the email draft" : "Send Enquiry"}
                  </span>
                </span>
                <span className="btn-pill_aside" aria-hidden>
                  <span className="btn-pill_aside_bg" />
                  <CornerArrow className="btn-pill_icon" />
                  <CornerArrow className="btn-pill_icon is-absolute" />
                </span>
              </button>
              <button type="button" onClick={copy} className="contact_aux">
                {copied ? "Copied" : "Copy as text"}
              </button>
            </div>

            {/* Said once the draft is open: a mail client opening is not the
                same as the message being sent, and on a machine with none
                nothing visible happens at all. */}
            {sent && (
              <p className="contact_hint">
                Your mail app should have opened with the enquiry ready to send. If nothing
                happened, use Copy as text and email {CONTACT_EMAIL} directly.
              </p>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
