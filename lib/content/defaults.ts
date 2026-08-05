import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  brand: "BHACKING",
  navLinks: [
    { href: "#home", label: "Inicio" },
    { href: "#shop", label: "Tienda" },
    { href: "#history", label: "Historia" },
    { href: "#news", label: "Novedades" },
  ],
  hero: {
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=80",
    brand: "BHACKING",
    headline: "Donde lo digital encuentra la moda",
    subheadline:
      "Experiencias únicas pensadas para que comprar sea más simple y elegante.",
    primaryCta: "Ver colección",
    secondaryCta: "Explorar categorías",
    sideNote: "atrévete a empezar un nuevo estilo",
  },
  categories: {
    title: "Categorías para ti",
    description:
      "Selecciones curadas en moda, accesorios y calzado — pensadas para un guardarropa diario más limpio.",
    viewAllLabel: "Ver todas las categorías",
    items: [
      {
        id: "fashion",
        title: "Moda",
        cta: "Comprar",
        image:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
        alt: "Look de moda en negro sastre",
        large: true,
      },
      {
        id: "accessories",
        title: "Accesorios",
        cta: "Comprar",
        image:
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
        alt: "Bolso de cuero y accesorios",
        large: false,
      },
      {
        id: "shoes",
        title: "Calzado",
        cta: "Comprar",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
        alt: "Sneaker moderno en exhibición",
        large: false,
      },
    ],
  },
  products: {
    title: "Nuestros productos nuevos",
    description:
      "Llegadas frescas con líneas limpias, neutros suaves y piezas ideales para el día a día.",
    items: [
      {
        id: "1",
        name: "Camisa Clásica",
        price: "$26.00",
        category: "men",
        image:
          "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80",
        alt: "Modelo con camisa clásica beige",
      },
      {
        id: "2",
        name: "Hoodie Suave",
        price: "$18.00",
        category: "women",
        image:
          "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80",
        alt: "Modelo con hoodie crema",
      },
      {
        id: "3",
        name: "Chaqueta Urbana",
        price: "$42.00",
        category: "men",
        image:
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        alt: "Modelo con chaqueta urbana",
      },
      {
        id: "4",
        name: "Blusa de Lino",
        price: "$29.00",
        category: "women",
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        alt: "Mujer con blusa de lino clara",
      },
      {
        id: "5",
        name: "Abrigo Studio",
        price: "$58.00",
        category: "men",
        image:
          "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80",
        alt: "Abrigo sastre de estudio",
      },
      {
        id: "6",
        name: "Punto Diario",
        price: "$32.00",
        category: "women",
        image:
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
        alt: "Mujer con conjunto de punto",
      },
    ],
  },
  featured: {
    title: "Colección destacada",
    description:
      "Looks de la comunidad: declaraciones silenciosas, siluetas fuertes y piezas para cualquier temporada.",
    viewAllLabel: "Ver toda la colección",
    items: [
      {
        id: "f1",
        handle: "@scelesta",
        image:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        alt: "Look destacado de @scelesta",
      },
      {
        id: "f2",
        handle: "@prenvce",
        image:
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        alt: "Look destacado de @prenvce",
      },
      {
        id: "f3",
        handle: "@senhelaba",
        image:
          "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80",
        alt: "Look destacado de @senhelaba",
      },
    ],
  },
  popular: {
    title: "Popular este año",
    portraitImage:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1200&q=80",
    portraitAlt: "Look popular — blazer blanco con detalle floral",
    items: [
      {
        id: "p1",
        name: "Pantalón con Chaleco",
        price: "$120.00",
        description:
          "Una silueta refinada para la temporada: chaleco estructurado con pantalón sastre en tonos arena.",
        image:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=700&q=80",
        alt: "Conjunto de pantalón y chaleco en arena",
      },
      {
        id: "p2",
        name: "Sobrecamisa de Algodón",
        price: "$78.00",
        description:
          "Capa ligera con costuras limpias y caída relajada — ideal para el día a día y el clima de transición.",
        image:
          "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=700&q=80",
        alt: "Detalle de sobrecamisa de algodón",
      },
      {
        id: "p3",
        name: "Blazer Studio",
        price: "$145.00",
        description:
          "Líneas nítidas y lana suave. Un básico elevado para ir del día a la noche con naturalidad.",
        image:
          "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=700&q=80",
        alt: "Look con blazer de estudio",
      },
    ],
  },
  footer: {
    newsletterTitle: "Mantente inspirado y elegante",
    copyright: "© 2024 bhacking. Todos los derechos reservados",
    sitemapTitle: "Mapa del sitio",
    availableTitle: "Disponible",
    termsTitle: "Términos y privacidad",
    sitemapLinks: [
      { href: "#home", label: "Inicio" },
      { href: "#shop", label: "Tienda" },
      { href: "#history", label: "Historia" },
      { href: "#news", label: "Novedades" },
    ],
    availableLinks: [
      { href: "#shop", label: "Pantalones" },
      { href: "#shop", label: "Chalecos" },
      { href: "#shop", label: "Camisas" },
      { href: "#shop", label: "Sneakers" },
    ],
    termsLinks: [
      { href: "#", label: "Términos y condiciones" },
      { href: "#", label: "Política de privacidad" },
      { href: "#", label: "Política de cookies" },
    ],
  },
  sections: [
    { id: "hero", type: "hero", label: "Hero", visible: true, order: 0 },
    {
      id: "categories",
      type: "categories",
      label: "Categorías para ti",
      visible: true,
      order: 1,
    },
    {
      id: "products",
      type: "products",
      label: "Productos nuevos",
      visible: true,
      order: 2,
    },
    {
      id: "featured",
      type: "featured",
      label: "Colección destacada",
      visible: true,
      order: 3,
    },
    {
      id: "popular",
      type: "popular",
      label: "Popular este año",
      visible: true,
      order: 4,
    },
  ],
};
