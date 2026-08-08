import Link from "next/link";
import { buildInstagramUrl, buildWhatsAppUrl } from "@/lib/contact/whatsapp";

type Props = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  external?: boolean;
};

const variants = {
  primary:
    "bg-[#25D366] text-white hover:brightness-95",
  secondary:
    "bg-foreground text-white hover:opacity-90",
  ghost:
    "border border-line bg-transparent text-foreground hover:bg-soft",
};

export function ContactButton({
  href,
  label,
  variant = "primary",
  className = "",
  external = true,
}: Props) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] ${variants[variant]} ${className}`}
    >
      {variant === "primary" ? <WhatsAppGlyph /> : null}
      {label}
    </Link>
  );
}

export function WhatsAppConsultButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return <ContactButton href={href} label={label} variant="primary" />;
}

export function InstagramButton({
  handle,
  label,
}: {
  handle: string;
  label: string;
}) {
  return (
    <ContactButton
      href={buildInstagramUrl(handle)}
      label={label}
      variant="ghost"
    />
  );
}

export function GeneralWhatsAppButton({
  phone,
  message,
  label,
}: {
  phone: string;
  message: string;
  label: string;
}) {
  return (
    <ContactButton
      href={buildWhatsAppUrl(phone, message)}
      label={label}
      variant="primary"
    />
  );
}

function WhatsAppGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      <path d="M12.04 2C6.58 2 2.15 6.42 2.15 11.88c0 1.75.46 3.45 1.34 4.95L2 22l5.3-1.39c1.44.79 3.06 1.2 4.74 1.2h.01c5.46 0 9.89-4.42 9.89-9.88C21.94 6.42 17.5 2 12.04 2zm0 18.06h-.01c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.15.82.84-3.07-.2-.31a8.2 8.2 0 01-1.26-4.39c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.24 3.69 8.24 8.23 0 4.55-3.7 8.28-8.21 8.28z" />
    </svg>
  );
}
