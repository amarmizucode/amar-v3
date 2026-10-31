import { Reveal } from "@/components/Reveal";
import { CornerArrow } from "@/components/Arrows";
import { Eyebrow } from "@/components/Eyebrow";
import { ContactForm, CONTACT_EMAIL } from "@/components/ContactForm";

/**
 * The copy document's CONTACT section: the invitation, where Amar is based,
 * and the enquiry form (ContactForm, shared with the contact modal).
 *
 * Set on the reference system like the rest of the home page: the header
 * column is Selected work's (eyebrow, heading, `works_p` intro), the email a
 * footer-style inline hover row, and the form a ruled works list. Styles are
 * the `contact_*` rules in globals.css.
 */
export function ContactSection() {
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
            <Eyebrow>Contact</Eyebrow>
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
          <ContactForm idPrefix="contact" />
        </Reveal>
      </div>
    </section>
  );
}
