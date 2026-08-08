export type ProductCategory = "all" | "men" | "women";

export type CategoryItem = {
  id: string;
  title: string;
  cta: string;
  image: string;
  alt: string;
  large: boolean;
};

export type ProductItem = {
  id: string;
  name: string;
  price: string;
  category: Exclude<ProductCategory, "all">;
  image: string;
  alt: string;
};

export type FeaturedItem = {
  id: string;
  handle: string;
  image: string;
  alt: string;
};

export type PopularItem = {
  id: string;
  name: string;
  price: string;
  description: string;
  image: string;
  alt: string;
};

export type HeroContent = {
  /** Imagen vertical / mobile */
  image: string;
  /** Imagen horizontal / desktop (si está vacía, usa `image`) */
  imageDesktop: string;
  brand: string;
  headline: string;
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  sideNote: string;
};

export type CategoriesSection = {
  title: string;
  description: string;
  viewAllLabel: string;
  items: CategoryItem[];
};

export type ProductsSection = {
  title: string;
  description: string;
  items: ProductItem[];
};

export type FeaturedSection = {
  title: string;
  description: string;
  viewAllLabel: string;
  items: FeaturedItem[];
};

export type PopularSection = {
  title: string;
  portraitImage: string;
  portraitAlt: string;
  items: PopularItem[];
};

export type FooterContent = {
  newsletterTitle: string;
  copyright: string;
  sitemapTitle: string;
  availableTitle: string;
  termsTitle: string;
  sitemapLinks: { href: string; label: string }[];
  availableLinks: { href: string; label: string }[];
  termsLinks: { href: string; label: string }[];
};

export type NavLink = {
  href: string;
  label: string;
};

export type BuiltinSectionKey =
  | "hero"
  | "categories"
  | "products"
  | "featured"
  | "popular";

export type SectionConfig = {
  id: string;
  /** Built-in keys or "custom" */
  type: BuiltinSectionKey | "custom";
  label: string;
  visible: boolean;
  order: number;
  /** Only for custom sections */
  custom?: {
    title: string;
    description: string;
    image: string;
    ctaLabel: string;
    ctaHref: string;
  };
};

export type SiteContent = {
  brand: string;
  navLinks: NavLink[];
  hero: HeroContent;
  categories: CategoriesSection;
  products: ProductsSection;
  featured: FeaturedSection;
  popular: PopularSection;
  footer: FooterContent;
  sections: SectionConfig[];
};

export const MIN_CATEGORIES = 3;
