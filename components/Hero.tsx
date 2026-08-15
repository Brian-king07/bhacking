import Image from "next/image";
import Link from "next/link";
import type { HeroContent } from "@/lib/content/types";
import { shopHref } from "@/lib/content/hrefs";

export function Hero({ content }: { content: HeroContent }) {
  const desktopImage = content.imageDesktop || content.image;

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden bg-[#2a2a2a]">
      <Image
        src={content.image}
        alt={`Campaña ${content.brand}`}
        fill
        priority
        className="animate-soft-zoom object-cover object-[center_20%] md:hidden"
        sizes="100vw"
      />
      <Image
        src={desktopImage}
        alt={`Campaña ${content.brand}`}
        fill
        priority
        className="animate-soft-zoom hidden object-cover object-[center_20%] md:block"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25" />

      <div className="relative px-5 md:px-8">
        <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end pb-16 pt-32 md:justify-center md:pb-24 md:pt-28">
          <p className="animate-fade-up font-display text-xs font-semibold tracking-[0.35em] text-white/80 uppercase md:text-sm">
            {content.brand}
          </p>
          <h1 className="animate-fade-up delay-1 mt-4 max-w-2xl font-display text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {content.headline}
          </h1>
          <p className="animate-fade-up delay-2 mt-5 max-w-md text-base leading-relaxed text-white/80 md:text-lg">
            {content.subheadline}
          </p>
          <div className="animate-fade-up delay-3 mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={shopHref()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold tracking-wide text-foreground transition-transform duration-300 hover:scale-[1.03]"
            >
              {content.primaryCta}
              <ArrowIcon />
            </Link>
            <Link
              href={shopHref()}
              className="text-sm tracking-wide text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {content.secondaryCta}
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 md:px-8">
        <p className="animate-fade-in delay-4 mx-auto hidden max-w-7xl pb-8 text-right text-xs leading-relaxed text-white/70 md:block">
          <span className="inline-block max-w-[10rem]">{content.sideNote}</span>
        </p>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
