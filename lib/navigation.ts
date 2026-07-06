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
          { label: "Attars", href: "/shop/attars" },
          { label: "Perfumes", href: "/shop/perfumes" },
          { label: "Incense", href: "/shop/incense" },
          { label: "Solid Perfumes", href: "/shop/solid-perfumes" },
        ],
      },
    ],
  },
  { type: "link", label: "Collections", href: "/collections" },
  { type: "link", label: "About", href: "/about" },
  { type: "link", label: "Contact", href: "/contact" },
  { type: "link", label: "Track Order", href: "/track-order" },
];
