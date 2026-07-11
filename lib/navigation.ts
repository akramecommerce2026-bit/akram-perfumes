export interface NavSubLink {
  label: string;
  href: string;
}

export interface NavSection {
  title: string;
  links: NavSubLink[];
}

export interface NavLinkItem {
  type: "link";
  label: string;
  href: string;
}

export interface NavMegaItem {
  type: "mega";
  label: string;
  href: string;
  sections: NavSection[];
}

export type NavItem = NavLinkItem | NavMegaItem;

export const navItems: NavItem[] = [
  { type: "link", label: "Home", href: "/" },
  {
    type: "mega",
    label: "Shop",
    href: "/shop",
    sections: [
      {
        title: "Shop by Type",
        links: [
          { label: "Attars", href: "/collections/attars" },
          { label: "Perfumes", href: "/collections/perfumes" },
          { label: "Incense", href: "/collections/incense" },
          { label: "Solid Perfumes", href: "/collections/solid-perfumes" },
        ],
      },
      {
        title: "Discover",
        links: [
          { label: "All Products", href: "/shop" },
          { label: "New Arrivals", href: "/new-arrivals" },
          { label: "Best Sellers", href: "/best-sellers" },
          { label: "Collections", href: "/collections" },
        ],
      },
    ],
  },
  { type: "link", label: "Collections", href: "/collections" },
  { type: "link", label: "New Arrivals", href: "/new-arrivals" },
  { type: "link", label: "Best Sellers", href: "/best-sellers" },
  { type: "link", label: "Contact", href: "/contact" },
];
