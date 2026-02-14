export type CategoryId =
  | "vpn"
  | "security"
  | "creative"
  | "microsoft"
  | "utilities"
  | "writing"
  | "media"
  | "specials";

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  iconName:
    | "Globe"
    | "Shield"
    | "Palette"
    | "KeyRound"
    | "Wrench"
    | "PenTool"
    | "Film"
    | "Sparkles";
};

export type Product = {
  id: string;
  name: string;
  categoryId: CategoryId;
  // Stored in /public. Used as a background watermark.
  logo: string;
  isActive: boolean;
};

export const categories: Category[] = [
  {
    id: "vpn",
    name: "VPN Services",
    description: "Privacy, secure browsing, and fast servers.",
    iconName: "Globe",
  },
  {
    id: "security",
    name: "Antivirus & Security",
    description: "Protection, security suites, and device safety.",
    iconName: "Shield",
  },
  {
    id: "creative",
    name: "Design & Creative",
    description: "Creative tools for editing, design, and productivity.",
    iconName: "Palette",
  },
  {
    id: "microsoft",
    name: "Microsoft Tools",
    description: "Office tools and Windows essentials.",
    iconName: "KeyRound",
  },
  {
    id: "utilities",
    name: "Utility Tools",
    description: "Everyday utilities that speed up workflows.",
    iconName: "Wrench",
  },
  {
    id: "writing",
    name: "Writing Tools",
    description: "Writing assistance and polishing tools.",
    iconName: "PenTool",
  },
  {
    id: "media",
    name: "Entertainment & Media",
    description: "Streaming and subscription essentials.",
    iconName: "Film",
  },
  {
    id: "specials",
    name: "Special Offers",
    description: "Limited promos and premium upgrades.",
    iconName: "Sparkles",
  },
];

export const products: Product[] = [
  // VPNs
  { id: "vpn-nord", name: "NordVPN", categoryId: "vpn", logo: "/logos/nordvpn.svg", isActive: true },
  { id: "vpn-surfshark", name: "Surfshark", categoryId: "vpn", logo: "/logos/surfshark.svg", isActive: true },
  { id: "vpn-pia", name: "Private Internet Access", categoryId: "vpn", logo: "/logos/pia.svg", isActive: true },
  { id: "vpn-ipvanish", name: "IPVanish", categoryId: "vpn", logo: "/logos/ipvanish.svg", isActive: true },
  { id: "vpn-hma", name: "HMA", categoryId: "vpn", logo: "/logos/hma.svg", isActive: true },
  { id: "vpn-avast-secureline", name: "Avast SecureLine", categoryId: "vpn", logo: "/logos/avast-secureline.svg", isActive: true },
  { id: "vpn-avira-phantom", name: "Avira Phantom", categoryId: "vpn", logo: "/logos/avira-phantom.svg", isActive: true },
  { id: "vpn-cyberghost", name: "CyberGhost", categoryId: "vpn", logo: "/logos/cyberghost.svg", isActive: true },

  // Security
  { id: "sec-avast-premium", name: "Avast Premium", categoryId: "security", logo: "/logos/avast-premium.svg", isActive: true },
  { id: "sec-kaspersky", name: "Kaspersky", categoryId: "security", logo: "/logos/kaspersky.svg", isActive: true },

  // Creative
  { id: "cr-adobe", name: "Adobe", categoryId: "creative", logo: "/logos/adobe.svg", isActive: true },
  { id: "cr-autocad", name: "AutoCAD", categoryId: "creative", logo: "/logos/autocad.svg", isActive: true },
  { id: "cr-canva", name: "Canva", categoryId: "creative", logo: "/logos/canva.svg", isActive: true },
  { id: "cr-coreldraw", name: "Corel Draw", categoryId: "creative", logo: "/logos/coreldraw.svg", isActive: true },

  // Microsoft tools
  { id: "ms-m365", name: "Microsoft 365", categoryId: "microsoft", logo: "/logos/microsoft-365.svg", isActive: true },
  { id: "ms-windows-keys", name: "Windows Keys", categoryId: "microsoft", logo: "/logos/windows.svg", isActive: true },

  // Utilities
  { id: "ut-idm", name: "Internet Download Manager", categoryId: "utilities", logo: "/logos/idm.svg", isActive: true },
  { id: "ut-wise-care-365", name: "Wise Care 365", categoryId: "utilities", logo: "/logos/wise-care-365.svg", isActive: true },
  { id: "ut-action-screen-recorder", name: "Action Screen Recorder", categoryId: "utilities", logo: "/logos/action-screen-recorder.svg", isActive: true },

  // Writing
  { id: "wr-grammarly", name: "Grammarly", categoryId: "writing", logo: "/logos/grammarly.svg", isActive: true },

  // Media
  { id: "md-spotify", name: "Spotify", categoryId: "media", logo: "/logos/spotify.svg", isActive: true },
  { id: "md-netflix", name: "Netflix", categoryId: "media", logo: "/logos/netflix.svg", isActive: true },

  // Specials
  { id: "sp-linkedin-premium-career", name: "LinkedIn Premium Career", categoryId: "specials", logo: "/logos/linkedin-premium.svg", isActive: true },
];

export function activeProductsByCategory(categoryId: CategoryId) {
  return products.filter((p) => p.isActive && p.categoryId === categoryId);
}
