"use client";

import { useState } from "react";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { Preloader } from "@/components/Preloader";
import { HighlightText } from "@/components/HighlightText";
import { Services } from "@/components/Services";
import { Testimonials } from "@/components/Testimonials";
import { Reveal } from "@/components/Reveal";
import { MediaFrame } from "@/components/MediaFrame";
import { Faq } from "@/components/Faq";
import { GapSection } from "@/components/GapSection";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CornerArrow, RightArrow } from "@/components/Arrows";
import { ClosingCta } from "@/components/ClosingCta";
import { CtaPill } from "@/components/CtaPill";
import { Logomark } from "@/components/Logomark";
import { AI_SERVICES, AiIcon, aiHref } from "@/components/AiIcons";
import { MEDIA } from "@/lib/media";

const WORKS = [
  {
    index: "01/40",
    title: "Culture of India",
    blurb: "Documenting the people, traditions and crafts keeping India's living culture alive.",
    stat: "500+",
    statLabel: "stories & cultural records",
    image: MEDIA.work1,
  },
  {
    index: "02/40",
    title: "Inspiring Women",
    blurb: "Stories of women whose journeys, courage and work create impact around them.",
    stat: "150+",
    statLabel: "Stories documented",
    image: MEDIA.work2,
  },
  {
    index: "03/40",
    title: "The Chettinad Project",
    blurb: "Exploring the architecture, craft, people and visual heritage of Chettinad.",
    stat: "XX+",
    statLabel: "locations documented",
    image: MEDIA.work3,
  },
  {
    index: "04/40",
    title: "Temples of India",
    blurb: "Documenting India's temples, architecture, traditions and the people who keep them alive.",
    stat: "1,000+",
    statLabel: "temples documented",
    image: MEDIA.work4,
  },
];

const VENTURES = [
  {
    kicker: "01. Photography",
    title: "Studio A",
    blurb: "Commercial photography studio. Over seven hundred weddings across twenty-two countries.",
    image: MEDIA.venture1,
  },
  {
    kicker: "02. Film",
    title: "Big Short Films",
    blurb: "Documentary filmmaking. Jamakkaalam led to the Centre for Weavers.",
    image: MEDIA.venture2,
  },
  {
    kicker: "03. Publishing",
    title: "Mara Labs",
    blurb: "Publishing house. Three pictorial monographs on South Indian heritage.",
    image: MEDIA.venture3,
  },
  {
    kicker: "04. Mentorship",
    title: "Kanavu Fellowship",
    blurb: "A year-long programme training women photographers from small Tamil Nadu towns.",
    image: MEDIA.venture4,
  },
  {
    kicker: "05. Product",
    title: "MIZU",
    blurb: "Hand-made backdrops for photographers and studios.",
    image: MEDIA.venture5,
  },
];

const SERVICES = [
  "Photography",
  "Films",
  "Campaign",
  "Mentorship",
  "Documentary",
  "Publishing",
];

const FAQS = [
  {
    q: "Who do you work with?",
    a: "Founders, institutions and brands building something with cultural weight — organizations that want the story behind the work told properly.",
  },
  {
    q: "What kind of projects do you take on?",
    a: "Photography, documentary film, campaigns and long-form cultural documentation. Projects where the narrative matters as much as the image.",
  },
  {
    q: "Do you work internationally?",
    a: "Yes. Based in Chennai, India and working worldwide — over seven hundred projects across twenty-two countries.",
  },
  {
    q: "Can you work on a project from concept to completion?",
    a: "That is the preferred way to work: research, narrative, production and final delivery handled end to end.",
  },
  {
    q: "Can we collaborate with one of your ventures?",
    a: "Studio A, Big Short Films, Mara Labs, Kanavu Fellowship and MIZU all take on collaborations. Tell me what you have in mind.",
  },
];

const NAV_FOOTER = ["Works", "Books", "Initiatives", "About", "Contact"];
const TESTIMONIALS = [
  {
    quote:
      "Weddings, classical dance, folk art, musicians, storytellers — Amar found the thread that tied all of it together and gave our work a voice we could finally share.",
    name: "K. R. Nagarajan",
    role: "Founder, Ramrajcotton",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "He spent three days simply watching the weavers before lifting a camera. What came back was not a shoot — it was our history, told properly for the first time.",
    name: "Lakshmi Venkatesh",
    role: "Director, Kanchi Silk Trust",
    avatar: MEDIA.avatar1,
  },
  {
    quote:
      "We had thirty years of work and nothing that explained it. Amar built the story we now open every conversation with.",
    name: "Dr. S. Raghunathan",
    role: "Trustee, Chettinad Heritage",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "The film travelled to four festivals, but the part that mattered was watching the artisans see themselves on screen with that much dignity.",
    name: "Meera Krishnan",
    role: "Programme Lead, Craft Council",
    avatar: MEDIA.avatar1,
  },
  {
    quote:
      "Amar asks the questions nobody thinks to ask. By the end our own team understood the work better than when we started.",
    name: "Arjun Subramanian",
    role: "Co-founder, Maatram Foundation",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "Six hundred temples, four years, and a consistency of eye across every single frame. That archive is now the reference nobody else has.",
    name: "Prof. Kamala Iyer",
    role: "Head of Archives, Temple Studies",
    avatar: MEDIA.avatar1,
  },
  {
    quote:
      "The mentorship changed how fifteen young photographers in our cohort see their own communities. That outlasts any single commission.",
    name: "Divya Raman",
    role: "Programme Director, Kanavu",
    avatar: MEDIA.avatar2,
  },
  {
    quote:
      "We came for photographs and left with a way of talking about ourselves. Our funding conversations have not been the same since.",
    name: "Vikram Anand",
    role: "CEO, Inspiring Women India",
    avatar: MEDIA.avatar1,
  },
];

/*
 * Footer socials. Facebook and Linkedin are confirmed; the Instagram handle is
 * still a placeholder awaiting the real profile URL.
 */
const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/amarramesh/" },
  { label: "Linkedin", href: "https://in.linkedin.com/in/amarramesh" },
  { label: "Facebook", href: "https://www.facebook.com/amarramesh.me/" },
];

export default function Home() {
  // The preloader gates the hero intro, exactly as the reference sequences it.
  const [introReady, setIntroReady] = useState(false);

  return (
    <>
      <SmoothScroll />
      <Preloader onDone={() => setIntroReady(true)} />
      <SiteHeader />

      <main className="flex-1">
        {/* ── Hero ───────────────────────────────────────────────── */}
        <Hero start={introReady} />

        {/* ── About ──────────────────────────────────────────────── */}
        <section
          id="about"
          className="shell"
          // Reference: space--5 above, section-space--large below.
          style={{ paddingTop: "var(--space-5)", paddingBottom: "var(--section-space-large)" }}
        >
          <div className="grid-12 gap-y-10">
            <Reveal className="col-span-6 md:col-span-3">
              <Image
                src="/assets/amar-ramesh.jpg"
                alt="Amar Ramesh"
                width={313}
                height={313}
                sizes="(max-width: 768px) 50vw, 313px"
                className="w-full max-w-[313px] aspect-square object-cover object-top bg-foreground"
              />
            </Reveal>

            <Reveal className="col-span-6 md:col-start-4 md:col-span-2" delay={80}>
              <ul className="text-[16px] leading-[1.25] font-medium">
                <li>Photographer</li>
                <li>Change Maker</li>
                <li>Author &amp; Mentor</li>
              </ul>
            </Reveal>

            <div className="col-span-12 md:col-start-6 md:col-span-6 flex flex-col gap-6">
              {/* All three set alike: statement size, 600 weight, 120%
                  leading, -3% tracking. The column sets the measure. */}
              <HighlightText className="text-statement font-semibold">
                Meaningful work deserves a story as powerful as the work itself.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                The organizations I work with have built something worth talking about. A culture
                worth preserving. An idea worth sharing. A community worth understanding.
              </HighlightText>
              <HighlightText className="text-statement font-semibold">
                My work is to find that story — and give it a form people can see, feel and remember.
              </HighlightText>

              {/* Byline, matching `gap_home_testimonial`: 2.5rem round
                  headshot, 0.6em beside it, name and role stacked at 0.5em. */}
              <div className="flex items-center gap-[0.6em]">
                <img
                  src={MEDIA.avatar1}
                  alt=""
                  className="size-10 shrink-0 rounded-full bg-chip object-cover [object-position:50%_20%]"
                />
                <div className="flex flex-col gap-[0.5em] text-[15px] leading-[1.3]">
                  <p className="font-medium text-muted">Amar Ramesh</p>
                  <p className="text-muted">Founder, Photographer, Author &amp; Mentor</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Showreel ─────────────────────────────────────────────────
             Portrait on mobile, letterboxed from md up. Inset to the page
             gutter at both sizes. */}
        <section className="shell">
          <Reveal>
            <MediaFrame
              ratio="1472 / 631"
              ratioMobile="3 / 4"
              src={MEDIA.showreel}
              label="Showreel"
            />
          </Reveal>
        </section>

        {/* ── Trusted by ─────────────────────────────────────────── */}
        <section className="shell pt-12 md:pt-16">
          <div className="grid-12 gap-y-12">
            <Reveal className="col-span-12 md:col-span-4">
              <SectionLabel>Brands I&rsquo;ve helped</SectionLabel>
            </Reveal>

            <div className="col-span-12 md:col-start-6 md:col-span-7 grid grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-8 sm:gap-y-12">
              {Array.from({ length: 9 }).map((_, i) => (
                <Reveal
                  key={i}
                  delay={i * 60}
                  className="flex flex-col items-center justify-center gap-3 sm:gap-5"
                >
                  <Logomark className="h-auto w-[52px] opacity-60 transition-opacity duration-500 hover:opacity-100 sm:h-[59px] sm:w-[75.641px]" />
                  <span className="text-center text-[13px] font-medium tracking-[-0.03em] text-muted sm:text-[16px]">
                    Company Name
                  </span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── I close that gap ───────────────────────────────────── */}
        <GapSection />

        {/* ── Works / Success stories ────────────────────────────── */}
        <section id="works" className="shell py-20 md:py-28">
          <div className="grid-12 gap-y-10">
            <Reveal className="col-span-12 md:col-span-3">
              <SectionLabel>Success Stories</SectionLabel>
            </Reveal>

            <div className="col-span-12 flex flex-col gap-10 md:gap-6">
              {WORKS.map((work, i) => (
                <Reveal key={work.title} delay={i * 80}>
                  <div className="grid-12 gap-y-6 items-start">
                    <div className="col-span-12 md:col-start-4 md:col-span-6">
                      <MediaFrame ratio="726 / 415" src={work.image} parallax={48} />
                    </div>

                    <div className="col-span-12 md:col-start-10 md:col-span-3 flex flex-col gap-4">
                      <span className="text-[13px] font-medium text-muted">{work.index}</span>
                      <h3 className="text-[22px] font-semibold tracking-[-0.03em]">
                        {work.title}
                      </h3>
                      <p className="text-[15px] leading-[1.55] text-muted">
                        {work.blurb}
                      </p>
                      <div className="pt-2">
                        <span className="inline-block bg-chip px-3 py-1.5 text-[22px] font-semibold tracking-[-0.03em]">
                          {work.stat}
                        </span>
                        <p className="pt-3 text-[15px] font-medium">{work.statLabel}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal className="mt-4">
            {/* The anchor is the row itself, so the fill wipes across the whole
                line rather than one cell of it. Same row interaction as the
                footer and FAQ: label slides +10px, marker counters -10px. */}
            <a
              href="#works"
              className="footer_hover_row grid-12 items-center py-3"
            >
              <span className="footer_hover_label col-span-3 text-statement font-semibold md:col-span-3">
                [10]
              </span>
              <span className="footer_hover_label col-span-6 text-statement font-semibold md:col-start-4 md:col-span-6">
                View All Works
              </span>
              <span className="footer_hover_marker col-span-3 flex items-center text-statement md:col-start-10 md:col-span-3">
                <CornerArrow className="w-[0.85em]" />
              </span>
            </a>
          </Reveal>
        </section>

        {/* ── Services + testimonial ─────────────────────────────── */}
        <section className="shell py-20 md:py-28">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 md:col-span-3">
              <Testimonials items={TESTIMONIALS} />
            </div>

            {/* Sits to the right of the testimonial. Hover a row to reveal
                its image. */}
            <div className="col-span-12 md:col-start-6 md:col-span-7">
              <Reveal className="mb-8">
                <SectionLabel>What I do</SectionLabel>
              </Reveal>
              <Services items={SERVICES} />
            </div>
          </div>
        </section>

        {/* ── Notable ventures ───────────────────────────────────── */}
        <section id="ventures" className="shell py-20 md:py-28">
          <Reveal>
            {/* Scaled to fill the section's width. 9.914 is the measured
                width-to-font-size ratio of this string at .display, so
                dividing the available width by it fills the measure exactly.
                The gutter differs by breakpoint (16px, then 36px from md), so
                the subtrahend has to track it or the line stops short. */}
            <h2 className="display !leading-[0.9] whitespace-nowrap !text-[min(var(--grid-content)/9.914,186px)]">
              Notable Ventures
            </h2>
          </Reveal>

          <div className="mt-16 border-t border-rule">
            {VENTURES.map((venture) => (
              <div
                key={venture.title}
                className="grid-12 gap-y-6 border-b border-rule bg-background"
              >
                <p className="col-span-12 pt-8 md:col-span-2 text-[13px] font-medium text-muted">
                  {venture.kicker}
                </p>
                <div className="col-span-12 pt-8 md:col-start-3 md:col-span-3 flex flex-col gap-2">
                  <h3 className="text-[19px] font-semibold tracking-[-0.03em]">{venture.title}</h3>
                  <p className="text-[15px] leading-[1.55] text-muted max-w-[38ch]">
                    {venture.blurb}
                  </p>
                </div>
                <div className="col-span-12 md:col-start-7 md:col-span-6">
                  <MediaFrame ratio="722 / 415" src={venture.image} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────────────────────── */}
        <section className="shell py-20 md:py-28">
          <div className="grid-12 gap-y-12">
            <div className="col-span-12 md:col-span-3 flex flex-col gap-8">
              <Reveal>
                <SectionLabel>FAQ&apos;s</SectionLabel>
              </Reveal>
              {/* mt-auto pins this group to the bottom of the section, level
                  with the end of the accordion beside it. */}
              <Reveal delay={80} className="mt-auto flex flex-col gap-6">
                {/* Two columns of the 12-col page grid. */}
                <div className="w-full md:w-[var(--column-width-2)]">
                  <MediaFrame ratio="1 / 1" src={MEDIA.faq} />
                </div>
                <p className="text-[17px] font-semibold leading-[1.3] tracking-[-0.03em]">
                  Got more questions?
                  <br />
                  Chat with Amar.
                </p>
                <CtaPill label="Book a Call" className="self-start" />
              </Reveal>
            </div>

            <div className="col-span-12 md:col-start-6 md:col-span-7 flex flex-col gap-10">
              <Reveal>
                <h2 className="text-[clamp(2rem,3.4vw,3.25rem)] font-semibold leading-[1.15] tracking-[-0.03em]">
                  Here is what you need to consider before partnering with me.
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <Faq items={FAQS} />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ────────────────────────────────────────── */}
        <ClosingCta>
          <Reveal className="mt-auto w-full px-[var(--grid-margin)]">
            <h2 className="sr-only">Let&apos;s create something worth being remembered.</h2>
            {/* Alternating indents, measured from the reference: odd lines sit
                near the left, even lines are pushed in. Those percentage
                indents need room to read — at mobile widths they would push
                the type off-screen, so the block centres instead and the
                indents only apply from md up. */}
            <div
              aria-hidden
              className="flex flex-col gap-1 text-center md:gap-2 md:text-left"
            >
              <div className="display md:ml-[17%]">Let&apos;s create</div>
              <div className="display md:ml-[34%]">something</div>
              <div className="display md:ml-[18%]">Worth being</div>
              {/* A flex row, so it centres via justify rather than text-align. */}
              <div
                data-cta-drift
                className="display flex items-center justify-center gap-[0.22em] md:justify-start md:ml-[35%]"
              >
                <RightArrow className="inline-arrow" />
                Remembered
              </div>
            </div>
          </Reveal>

          <Reveal className="mt-10 flex justify-center md:mt-16" delay={120}>
            <CtaPill
              label="Tell me your story"
              href="mailto:hello@amarramesh.com"
              size="text-[22px]"
            />
          </Reveal>

          <Reveal
            className="mt-24 flex flex-col items-center gap-10 md:mt-40"
            delay={160}
          >
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-8 sm:gap-x-[90px]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-5">
                  <Logomark className="h-[59px] w-[75.641px]" />
                  <span className="text-[16px] font-medium tracking-[-0.03em] text-muted">
                    Company Name
                  </span>
                </div>
              ))}
            </div>
            <HighlightText className="text-lede font-semibold text-center max-w-[600px]">
              I uncover the people, purpose and stories behind the work — and turn them into
              photography, films, documentaries and experiences that make your impact understood,
              felt and remembered.
            </HighlightText>
          </Reveal>
        </ClosingCta>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────
           Sizing ported from the reference `footer_*` blocks: padded by
           --site-margin rather than the page shell, top row split 6 / 5 of
           12 columns at a 1rem gutter, nav rows full-width on a dotted
           rule. See the footer section in globals.css. */}
      <footer className="footer_wrap_main relative">
        <div className="footer_wrap">
          <div className="footer_top">
            {/* 6 columns: eyebrow above the nav list. */}
            <div className="footer_eyebrow">
              <SectionLabel>Navigation</SectionLabel>

              <nav>
                <ul className="footer_nav_ul">
                  {NAV_FOOTER.map((item) => (
                    <li key={item} className="footer_nav_li">
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="footer_nav_text footer_hover_row"
                      >
                        <span className="footer_hover_label">{item}</span>
                        <span aria-hidden className="footer_nav_arrow">
                          <RightArrow className="inline-arrow" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* 5 columns, offset by one. Holds three flex:1 sibling
                blocks that wrap: details and socials share the first line,
                the AI chips wrap onto a second beneath the details. */}
            <div className="footer_aside_contain">
              <div className="footer_aside_details">
                <p className="footer_top_text">(Personal details)</p>

                <div className="footer_middle_wrap">
                  <a
                    href="mailto:hello@amarramesh.com"
                    className="footer_email footer_hover_row is-inline-row flex w-fit items-center gap-[0.3em] self-start"
                  >
                    <span className="footer_hover_label">⮡ hello@amarramesh.com</span>
                    <span className="footer_hover_marker flex items-center">
                      <CornerArrow className="inline-arrow" />
                    </span>
                  </a>
                  <p className="footer_address text-muted">
                    Based in Chennai, India and Working Worldwide.
                  </p>
                </div>
              </div>

              <div className="footer_aside_details">
                <p className="footer_top_text">(Socials)</p>
                <ul className="footer_socials_ul">
                  {SOCIALS.map((social) => (
                    <li
                      key={social.label}
                      className="footer_socials_li footer_hover_row is-inline-row"
                    >
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer_lead flex items-center gap-[0.3em]"
                      >
                        <span className="footer_hover_label">{social.label}</span>
                        <span className="footer_hover_marker flex items-center">
                          <CornerArrow className="inline-arrow" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer_aside_details">
                <p className="footer_top_text">(Ask AI About Me)</p>
{/* 2.5em squares on their own font size, laid out at space--1. The
                    glyph fills the chip edge-to-edge, as the reference sets it. */}
                <div className="footer_middle_wrap is-ai text-[16px]">
                  {AI_SERVICES.map((service) => (
                    <a
                      key={service.name}
                      href={aiHref(service.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Ask ${service.label} about Amar Ramesh`}
                      className="footer_ai_link"
                    >
                      <span className="sr-only">
                        Ask {service.label} about Amar Ramesh
                      </span>
                      <AiIcon name={service.name} className="h-full w-full" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar, section-space--main below the top row. */}
          <div className="footer_bottom">
            <div className="grid-12 border-t border-rule py-6 text-[15px]">
              <span className="col-span-12 md:col-span-4">Chennai, IN</span>
              <a
                href="#top"
                className="link-wipe col-span-6 md:col-start-6 md:col-span-3 justify-self-start"
              >
                Back to top ↑
              </a>
              <span className="col-span-6 md:col-start-10 md:col-span-3 justify-self-end md:justify-self-start">
                © 2026, AMAR RAMESH
              </span>
            </div>

            <div className="grid-12">
              <span className="display optical-A col-span-12 md:col-span-5">Amar</span>
              <span className="display optical-R col-span-12 md:col-start-6 md:col-span-7">
                Ramesh
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[17px] font-semibold tracking-[-0.03em]">
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-foreground" />
      {children}
    </p>
  );
}
