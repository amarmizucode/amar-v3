"use client";

import { useState } from "react";
import { CtaPill } from "@/components/CtaPill";

/**
 * The copy document's enquiry form — Name, Email, Organisation (optional),
 * Project Type and Message — shared by the home page's Contact section and
 * the contact modal the CTAs open.
 *
 * The fields are works-list rows: a small label over the entry line in
 * text-large, on dotted rules. The submit is the CTA pill. Styles are the
 * `contact_*` rules in globals.css, which read the `works` variables, so
 * the form sits inside a `works` ancestor wherever it is rendered.
 *
 * Email rather than a POST, for the reason PrintRequestDock gives: the site
 * prerenders and has no server to receive a form. Send composes a mailto:
 * draft, so nothing leaves the visitor's machine until they send it from
 * their own mail app, and Copy covers the machines where no mail client ever
 * opens.
 */

export const CONTACT_EMAIL = "hello@amarramesh.com";

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

/** A field's label, in the small reference type at full ink. */
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="contact_label">
      <span className="contact_label_text">{children}</span>
    </label>
  );
}

/**
 * `idPrefix` keeps the field ids unique: on the home page the section's form
 * and the modal's are in the document together.
 */
export function ContactForm({ idPrefix }: { idPrefix: string }) {
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
    const subject = projectType ? `Enquiry - ${projectType}` : "Enquiry";
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

  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <form onSubmit={send} className="flex flex-col">
      <div className="contact_grid">
        {/* Name and email share a row from 30rem: both are short. */}
        <div className="contact_field">
          <FieldLabel htmlFor={id("name")}>Name</FieldLabel>
          <input
            id={id("name")}
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="contact_field">
          <FieldLabel htmlFor={id("email")}>Email</FieldLabel>
          <input
            id={id("email")}
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="contact_field">
          <FieldLabel htmlFor={id("org")}>Organisation (optional)</FieldLabel>
          <input
            id={id("org")}
            type="text"
            autoComplete="organization"
            placeholder="Studio, brand or institution"
            value={organisation}
            onChange={(e) => setOrganisation(e.target.value)}
          />
        </div>
        <div className="contact_field">
          <FieldLabel htmlFor={id("type")}>Project type</FieldLabel>
          {/* A select rather than a free text field: it spares the
              visitor the typing and keeps the subject line tidy. */}
          <select
            id={id("type")}
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
          <FieldLabel htmlFor={id("message")}>Your message</FieldLabel>
          <textarea
            id={id("message")}
            rows={4}
            required
            placeholder="A little about what you have in mind."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      <div className="contact_actions">
        <CtaPill type="submit" label={sent ? "Reopen the email draft" : "Send Enquiry"} />
        <button type="button" onClick={copy} className="contact_aux">
          {copied ? "Copied" : "Copy as text"}
        </button>
      </div>

      {/* Said once the draft is open: a mail client opening is not the
          same as the message being sent, and on a machine with none
          nothing visible happens at all. */}
      {sent && (
        <p role="status" className="contact_hint">
          Your mail app should have opened with the enquiry ready to send. If nothing
          happened, use Copy as text and email {CONTACT_EMAIL} directly.
        </p>
      )}
    </form>
  );
}
