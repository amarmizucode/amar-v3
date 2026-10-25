"use client";

import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/SectionLabel";

/**
 * The copy document's CONTACT section: the invitation, where Amar is based,
 * and the enquiry form it specifies — Name, Email, Organisation (optional),
 * Project Type and Message.
 *
 * Email rather than a POST, for the reason PrintRequestDock gives: the site
 * prerenders and has no server to receive a form. Send composes a mailto:
 * draft, so nothing leaves the visitor's machine until they send it from
 * their own mail app, and Copy covers the machines where no mail client ever
 * opens. The fields reuse `.preq-field` from the print-request drawer, so the
 * two forms on the site look like one.
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
    <section id="contact" className="shell pb-20 md:pb-28">
      <div className="grid-12 gap-y-10">
        {/* The invitation, in the label column. */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          <Reveal>
            <SectionLabel>Contact</SectionLabel>
          </Reveal>
          <Reveal>
            <h2 className="text-[clamp(2rem,3.4vw,3.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
              Let&rsquo;s talk
            </h2>
          </Reveal>
          <Reveal className="flex flex-col gap-4 text-[17px] leading-[1.5] text-muted">
            <p>
              Have a project in mind, an interesting idea or something you think I&rsquo;d enjoy
              exploring? I&rsquo;d love to hear about it.
            </p>
            <p className="font-medium text-foreground">Based in Chennai, India</p>
            <p>
              <a href={`mailto:${CONTACT_EMAIL}`} className="link-wipe font-medium text-foreground">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Reveal>
        </div>

        {/* The form the doc specifies. */}
        <Reveal className="col-span-12 md:col-start-6 md:col-span-7">
          <h3 className="text-[17px] font-semibold leading-[1.3] tracking-[-0.03em]">
            Tell me a little about your idea
          </h3>

          <form onSubmit={send} className="mt-6 flex flex-col gap-5">
            {/* Name and email share a row from sm: both are short. */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="preq-field">
                <label htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="preq-field">
                <label htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="preq-field">
                <label htmlFor="contact-org">Organisation (optional)</label>
                <input
                  id="contact-org"
                  type="text"
                  autoComplete="organization"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                />
              </div>
              <div className="preq-field">
                <label htmlFor="contact-type">Project type</label>
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
            </div>

            <div className="preq-field">
              <label htmlFor="contact-message">Your message</label>
              <textarea
                id="contact-message"
                rows={4}
                required
                placeholder="A little about what you have in mind."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
              <button type="submit" className="preq-send">
                {sent ? "Reopen the email draft" : "Send Enquiry"}
              </button>
              <button
                type="button"
                onClick={copy}
                className="text-[13px] font-medium text-muted underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                {copied ? "Copied" : "Copy as text"}
              </button>
            </div>

            {/* Said once the draft is open: a mail client opening is not the
                same as the message being sent, and on a machine with none
                nothing visible happens at all. */}
            {sent && (
              <p className="text-[13px] leading-[1.5] text-muted">
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
