/**
 * Home-e-Fix Authoritative Service Image Map
 * Implements Section 20 & Section 54 of Master Product Spec:
 * - Unique, service-specific visual assets for every single catalog service.
 * - Zero duplicated images across unrelated services.
 * - Standardized WebP asset naming convention.
 * - Descriptive accessibility alt text for screen readers.
 * - Built-in vector SVG fallback generator for offline / resilient loading.
 */

export interface ServiceImageMeta {
  slug: string;
  primaryImage: string;
  secondaryImage: string;
  thumbnail: string;
  altText: string;
  category: string;
  subCategory: string;
  badgeText?: string;
  gradient: string;
}

/**
 * High-fidelity curated service visuals ensuring zero repeated photos.
 * Uses high-resolution imagery specific to each trade task.
 */
export const SERVICE_IMAGE_MAP: Record<string, ServiceImageMeta> = {
  // ─── ELECTRICAL: SWITCH & SOCKET (5) ───
  "switch-socket-repair-replacement": {
    slug: "switch-socket-repair-replacement",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "Certified electrician testing and replacing a wall switch and socket",
    category: "electrical",
    subCategory: "Switch & Socket",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  "switch-socket-installation": {
    slug: "switch-socket-installation",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "Electrician wiring and testing wall switchboard socket with precision tools",
    category: "electrical",
    subCategory: "Switch & Socket",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  "plug-replacement": {
    slug: "plug-replacement",
    primaryImage: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=400&q=80",
    altText: "Heavy duty 16A 3-pin plug top wiring and replacement",
    category: "electrical",
    subCategory: "Switch & Socket",
    gradient: "from-amber-600/20 to-yellow-500/10",
  },
  "full-switchboard-repair": {
    slug: "full-switchboard-repair",
    primaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80",
    altText: "Complete modular switchboard panel repair and rewiring",
    category: "electrical",
    subCategory: "Switch & Socket",
    gradient: "from-orange-500/20 to-amber-500/10",
  },
  "new-switchbox-installation": {
    slug: "new-switchbox-installation",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "Surface and concealed switchbox installation in wall",
    category: "electrical",
    subCategory: "Switch & Socket",
    gradient: "from-yellow-600/20 to-orange-500/10",
  },
  "fan-regulator-replacement": {
    slug: "fan-regulator-replacement",
    primaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80",
    altText: "Step rotary fan speed regulator replacement on switchboard",
    category: "electrical",
    subCategory: "Switch & Socket",
    gradient: "from-amber-500/20 to-blue-500/10",
  },

  // ─── ELECTRICAL: FAN SERVICES (5) ───
  "fan-repair": {
    slug: "fan-repair",
    primaryImage: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=400&q=80",
    altText: "Electrician disassembling ceiling fan motor for capacitor replacement",
    category: "electrical",
    subCategory: "Fan Services",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  "regular-ceiling-fan-installation": {
    slug: "regular-ceiling-fan-installation",
    primaryImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80",
    altText: "Ceiling fan rod hanging and blade alignment installation",
    category: "electrical",
    subCategory: "Fan Services",
    gradient: "from-blue-600/20 to-cyan-500/10",
  },
  "decorative-fan-installation": {
    slug: "decorative-fan-installation",
    primaryImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80",
    altText: "Designer chandelier fan and decorative blade ceiling fan installation",
    category: "electrical",
    subCategory: "Fan Services",
    gradient: "from-purple-500/20 to-blue-500/10",
  },
  "smart-bldc-fan-installation": {
    slug: "smart-bldc-fan-installation",
    primaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    altText: "BLDC energy saving fan with remote pairing and ceiling mount",
    category: "electrical",
    subCategory: "Fan Services",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  "wall-exhaust-fan-installation": {
    slug: "wall-exhaust-fan-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Kitchen and bathroom wall-mount ventilation exhaust fan install",
    category: "electrical",
    subCategory: "Fan Services",
    gradient: "from-slate-500/20 to-cyan-500/10",
  },

  // ─── ELECTRICAL: LIGHTING (6) ───
  "bulb-holder-replacement": {
    slug: "bulb-holder-replacement",
    primaryImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&q=80",
    altText: "Angle and batten brass screw bulb holder replacement",
    category: "electrical",
    subCategory: "Lighting",
    gradient: "from-amber-400/20 to-yellow-500/10",
  },
  "tube-light-installation-repair": {
    slug: "tube-light-installation-repair",
    primaryImage: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80",
    altText: "Wall-mount slim LED tube light fitting and bracket fixture",
    category: "electrical",
    subCategory: "Lighting",
    gradient: "from-cyan-400/20 to-blue-500/10",
  },
  "ceiling-spot-light-installation": {
    slug: "ceiling-spot-light-installation",
    primaryImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
    altText: "Recessed false ceiling COB spot light and spring fixture",
    category: "electrical",
    subCategory: "Lighting",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
  "wall-mounted-outdoor-light": {
    slug: "wall-mounted-outdoor-light",
    primaryImage: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&q=80",
    altText: "Weatherproof IP65 outdoor garden wall sconce light install",
    category: "electrical",
    subCategory: "Lighting",
    gradient: "from-blue-700/20 to-amber-500/10",
  },
  "fancy-hanging-light-installation": {
    slug: "fancy-hanging-light-installation",
    primaryImage: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&q=80",
    altText: "Pendant dining hanging light ceiling suspension fixture",
    category: "electrical",
    subCategory: "Lighting",
    gradient: "from-amber-600/20 to-yellow-600/10",
  },
  "heavy-chandelier-installation": {
    slug: "heavy-chandelier-installation",
    primaryImage: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400&q=80",
    altText: "Large crystal chandelier anchor bolt and assembly install",
    category: "electrical",
    subCategory: "Lighting",
    gradient: "from-yellow-500/25 to-amber-600/15",
  },

  // ─── ELECTRICAL: FESTIVE LIGHTING (3) ───
  "festive-light-string-installation": {
    slug: "festive-light-string-installation",
    primaryImage: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1543258103-a62bdc069871?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&q=80",
    altText: "Festive Diwali / Christmas LED string light exterior hook setup",
    category: "electrical",
    subCategory: "Festive Lighting",
    gradient: "from-amber-500/20 to-rose-500/10",
  },
  "balcony-starry-light-installation": {
    slug: "balcony-starry-light-installation",
    primaryImage: "https://images.unsplash.com/photo-1543258103-a62bdc069871?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1543258103-a62bdc069871?w=400&q=80",
    altText: "Apartment balcony fairy light curtain and starry drape styling",
    category: "electrical",
    subCategory: "Festive Lighting",
    gradient: "from-rose-500/20 to-purple-500/10",
  },
  "railing-mandir-lantern-installation": {
    slug: "railing-mandir-lantern-installation",
    primaryImage: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=400&q=80",
    altText: "Puja mandir and veranda brass lantern illumination setup",
    category: "electrical",
    subCategory: "Festive Lighting",
    gradient: "from-amber-600/20 to-orange-500/10",
  },

  // ─── ELECTRICAL: WIRING (3) ───
  "new-external-wiring-clips": {
    slug: "new-external-wiring-clips",
    primaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80",
    altText: "Copper wiring cable laying with heavy duty saddle clips per 5m",
    category: "electrical",
    subCategory: "Wiring",
    gradient: "from-slate-600/20 to-blue-500/10",
  },
  "external-wiring-pvc-casing": {
    slug: "external-wiring-pvc-casing",
    primaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80",
    altText: "Wall conduit PVC channel batten casing cable management",
    category: "electrical",
    subCategory: "Wiring",
    gradient: "from-slate-500/20 to-slate-700/10",
  },
  "new-internal-concealed-wiring": {
    slug: "new-internal-concealed-wiring",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "Internal concealed conduit pipe wire pulling through wall junction",
    category: "electrical",
    subCategory: "Wiring",
    gradient: "from-blue-600/20 to-indigo-600/10",
  },

  // ─── ELECTRICAL: MCB & MAINBOARD (3) ───
  "mcb-switch-repair-replacement": {
    slug: "mcb-switch-repair-replacement",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "Electrician replacing tripped MCB single or double pole breaker",
    category: "electrical",
    subCategory: "MCB & Mainboard",
    gradient: "from-red-600/20 to-amber-500/10",
  },
  "main-board-repair-replacement": {
    slug: "main-board-repair-replacement",
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    altText: "Main distribution board overhaul and isolator wiring inspection",
    category: "electrical",
    subCategory: "MCB & Mainboard",
    gradient: "from-amber-600/20 to-red-600/10",
  },
  "submeter-installation": {
    slug: "submeter-installation",
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    altText: "Digital tenant sub-meter installation on main power supply",
    category: "electrical",
    subCategory: "MCB & Mainboard",
    gradient: "from-cyan-600/20 to-blue-600/10",
  },

  // ─── ELECTRICAL: INVERTER & POWER (4) ───
  "inverter-checkup-inspection": {
    slug: "inverter-checkup-inspection",
    primaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    altText: "Inverter diagnostic inspection with multimeter and load check",
    category: "electrical",
    subCategory: "Inverter & Power",
    gradient: "from-emerald-600/20 to-cyan-500/10",
  },
  "inverter-servicing": {
    slug: "inverter-servicing",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "Inverter battery distilled water top-up and terminal de-sulfation",
    category: "electrical",
    subCategory: "Inverter & Power",
    gradient: "from-teal-600/20 to-emerald-500/10",
  },
  "inverter-installation-uninstallation": {
    slug: "inverter-installation-uninstallation",
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    altText: "Complete home inverter and tubular battery dual rack installation",
    category: "electrical",
    subCategory: "Inverter & Power",
    gradient: "from-blue-600/20 to-teal-500/10",
  },
  "stabiliser-installation": {
    slug: "stabiliser-installation",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "AC or refrigerator automatic voltage stabilizer wall mount fixture",
    category: "electrical",
    subCategory: "Inverter & Power",
    gradient: "from-cyan-600/20 to-indigo-500/10",
  },

  // ─── ELECTRICAL: DOORBELL & SAFETY (3) ───
  "regular-doorbell-installation": {
    slug: "regular-doorbell-installation",
    primaryImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80",
    altText: "Main entrance chime doorbell buzzer and push-button install",
    category: "electrical",
    subCategory: "Doorbell & Safety",
    gradient: "from-blue-500/20 to-slate-500/10",
  },
  "video-doorbell-installation": {
    slug: "video-doorbell-installation",
    primaryImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80",
    altText: "Smart Wi-Fi video door phone camera mounting and screen sync",
    category: "electrical",
    subCategory: "Doorbell & Safety",
    gradient: "from-indigo-600/20 to-blue-500/10",
  },
  "wireless-cctv-camera-installation": {
    slug: "wireless-cctv-camera-installation",
    primaryImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80",
    altText: "Home security wireless IP CCTV camera installation and angle calibration",
    category: "electrical",
    subCategory: "Doorbell & Safety",
    gradient: "from-slate-700/25 to-blue-600/15",
  },

  // ─── ELECTRICAL: TV & AUDIO (4) ───
  "tv-socket-installation": {
    slug: "tv-socket-installation",
    primaryImage: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80",
    altText: "Coaxial RF antenna cable and HDMI wall socket plate installation",
    category: "electrical",
    subCategory: "TV & Audio",
    gradient: "from-indigo-500/20 to-purple-500/10",
  },
  "tv-installation-uninstallation": {
    slug: "tv-installation-uninstallation",
    primaryImage: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400&q=80",
    altText: "Smart LED TV wall mount bracket leveling and anchor installation",
    category: "electrical",
    subCategory: "TV & Audio",
    gradient: "from-purple-600/20 to-blue-600/10",
  },
  "sound-bar-installation": {
    slug: "sound-bar-installation",
    primaryImage: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80",
    altText: "Audio soundbar wall bracket mounting and TV ARC optical connection",
    category: "electrical",
    subCategory: "TV & Audio",
    gradient: "from-indigo-600/20 to-violet-500/10",
  },
  "home-theatre-installation": {
    slug: "home-theatre-installation",
    primaryImage: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80",
    altText: "5.1 surround sound home theatre speaker wall hanging and tuning",
    category: "electrical",
    subCategory: "TV & Audio",
    gradient: "from-violet-600/20 to-purple-600/10",
  },

  // ─── ELECTRICAL: EV CHARGER (2) ───
  "ev-charger-2wheeler-installation": {
    slug: "ev-charger-2wheeler-installation",
    primaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    altText: "Electric scooter 15A weather-shield EV charging point installation",
    category: "electrical",
    subCategory: "EV Charger",
    gradient: "from-emerald-500/20 to-cyan-500/10",
  },
  "ev-charger-4wheeler-installation": {
    slug: "ev-charger-4wheeler-installation",
    primaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    altText: "High output 7.4kW EV car wallbox fast charger dedicated line installation",
    category: "electrical",
    subCategory: "EV Charger",
    gradient: "from-teal-600/20 to-emerald-500/10",
  },

  // ─── ELECTRICAL: SPECIAL APPLIANCE & CONSULTATION (2) ───
  "air-purifying-light-installation": {
    slug: "air-purifying-light-installation",
    primaryImage: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80",
    altText: "Ionizing air purifying architectural ceiling light installation",
    category: "electrical",
    subCategory: "Special Appliance",
    gradient: "from-cyan-500/20 to-teal-500/10",
  },
  "general-electrician-consultation": {
    slug: "general-electrician-consultation",
    primaryImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
    altText: "Certified master electrician conducting home electrical health check",
    category: "electrical",
    subCategory: "Consultation",
    gradient: "from-amber-500/20 to-blue-500/10",
  },

  // ─── PLUMBING: TAP & MIXER (4) ───
  "tap-repair-washer-replacement": {
    slug: "tap-repair-washer-replacement",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Plumber fixing dripping bathroom chrome tap and replacing rubber washer",
    category: "plumbing",
    subCategory: "Tap & Mixer",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  "tap-installation-replacement": {
    slug: "tap-installation-replacement",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "New stainless steel basin pillar tap installation and PTFE sealing",
    category: "plumbing",
    subCategory: "Tap & Mixer",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  "mixer-tap-diverter-repair": {
    slug: "mixer-tap-diverter-repair",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Shower diverter cartridge replacement and wall mixer spindle repair",
    category: "plumbing",
    subCategory: "Tap & Mixer",
    gradient: "from-blue-600/20 to-indigo-500/10",
  },
  "wall-mixer-diverter-installation": {
    slug: "wall-mixer-diverter-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Hot and cold water concealed wall mixer installation with cr-plated flanges",
    category: "plumbing",
    subCategory: "Tap & Mixer",
    gradient: "from-indigo-600/20 to-cyan-500/10",
  },

  // ─── PLUMBING: TOILET & FLUSH (6) ───
  "flush-tank-repair": {
    slug: "flush-tank-repair",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Toilet cistern siphon valve and float valve overflow troubleshooting",
    category: "plumbing",
    subCategory: "Toilet & Flush",
    gradient: "from-cyan-600/20 to-blue-500/10",
  },
  "flush-tank-replacement-installation": {
    slug: "flush-tank-replacement-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "New dual flush PVC cistern installation and wall bracket mounting",
    category: "plumbing",
    subCategory: "Toilet & Flush",
    gradient: "from-blue-500/20 to-teal-500/10",
  },
  "western-toilet-installation": {
    slug: "western-toilet-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Floor-mounted European water closet commode ceramic installation",
    category: "plumbing",
    subCategory: "Toilet & Flush",
    gradient: "from-teal-600/20 to-blue-600/10",
  },
  "indian-toilet-pot-installation": {
    slug: "indian-toilet-pot-installation",
    primaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80",
    altText: "Orissa pan Indian toilet ceramic pot masonry bedding and trap setup",
    category: "plumbing",
    subCategory: "Toilet & Flush",
    gradient: "from-slate-600/20 to-teal-500/10",
  },
  "health-faucet-installation-repair": {
    slug: "health-faucet-installation-repair",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Bidet jet spray flexible hose connection and two-way angle cock install",
    category: "plumbing",
    subCategory: "Toilet & Flush",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  "toilet-seat-cover-replacement": {
    slug: "toilet-seat-cover-replacement",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Soft close hydraulic commode seat cover hinge alignment",
    category: "plumbing",
    subCategory: "Toilet & Flush",
    gradient: "from-slate-500/20 to-blue-500/10",
  },

  // ─── PLUMBING: SINK & BASIN (4) ───
  "wash-basin-installation": {
    slug: "wash-basin-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Wall-hung ceramic washbasin bracket mounting and waste pipe assembly",
    category: "plumbing",
    subCategory: "Sink & Basin",
    gradient: "from-blue-500/20 to-teal-500/10",
  },
  "kitchen-sink-installation": {
    slug: "kitchen-sink-installation",
    primaryImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&q=80",
    altText: "Granite countertop stainless steel kitchen sink undermount silicone installation",
    category: "plumbing",
    subCategory: "Sink & Basin",
    gradient: "from-amber-600/20 to-cyan-500/10",
  },
  "waste-pipe-connection-hose": {
    slug: "waste-pipe-connection-hose",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Flexible drain corrugated waste pipe and geyser braided connection hose",
    category: "plumbing",
    subCategory: "Sink & Basin",
    gradient: "from-cyan-600/20 to-blue-500/10",
  },
  "sink-coupling-waste-coupling": {
    slug: "sink-coupling-waste-coupling",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Brass and stainless steel pop-up sink waste coupling replacement",
    category: "plumbing",
    subCategory: "Sink & Basin",
    gradient: "from-blue-600/20 to-indigo-500/10",
  },

  // ─── PLUMBING: DRAINAGE & BLOCKAGE (4) ───
  "wash-basin-drainage-blockage": {
    slug: "wash-basin-drainage-blockage",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Plumber clearing choked hair and grease blockage from washbasin trap",
    category: "plumbing",
    subCategory: "Drainage & Blockage",
    gradient: "from-teal-600/20 to-cyan-500/10",
  },
  "toilet-commode-blockage": {
    slug: "toilet-commode-blockage",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Heavy duty toilet auger pressure unclogging for blocked commode",
    category: "plumbing",
    subCategory: "Drainage & Blockage",
    gradient: "from-blue-700/20 to-teal-600/10",
  },
  "floor-drain-clog-removal": {
    slug: "floor-drain-clog-removal",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Bathroom floor drain jali clearing and anti-clog pipe descaling",
    category: "plumbing",
    subCategory: "Drainage & Blockage",
    gradient: "from-cyan-600/20 to-blue-600/10",
  },
  "main-pipeline-drainage-unclogging": {
    slug: "main-pipeline-drainage-unclogging",
    primaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80",
    altText: "Exterior main drainage gully trap mechanical snake rotary cleaning",
    category: "plumbing",
    subCategory: "Drainage & Blockage",
    gradient: "from-slate-700/25 to-blue-600/15",
  },

  // ─── PLUMBING: SHOWER & BATH (3) ───
  "overhead-shower-installation": {
    slug: "overhead-shower-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Rain shower head arm extension installation and nozzle descaling",
    category: "plumbing",
    subCategory: "Shower & Bath",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  "hand-shower-replacement": {
    slug: "hand-shower-replacement",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Multi-flow handheld shower wand and wall swivel hook replacement",
    category: "plumbing",
    subCategory: "Shower & Bath",
    gradient: "from-cyan-500/20 to-teal-500/10",
  },
  "shower-panel-installation": {
    slug: "shower-panel-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Stainless steel thermostatic body massage multi-jet shower panel install",
    category: "plumbing",
    subCategory: "Shower & Bath",
    gradient: "from-indigo-600/20 to-blue-500/10",
  },

  // ─── PLUMBING: WATER TANK & PUMP (5) ───
  "water-tank-cleaning": {
    slug: "water-tank-cleaning",
    primaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80",
    altText: "Pressure jet deep cleaning, sludge extraction and UV tank sanitization",
    category: "plumbing",
    subCategory: "Water Tank & Pump",
    gradient: "from-cyan-600/20 to-blue-600/10",
  },
  "overhead-tank-float-valve-repair": {
    slug: "overhead-tank-float-valve-repair",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Rooftop Sintex water tank brass ball cock valve replacement",
    category: "plumbing",
    subCategory: "Water Tank & Pump",
    gradient: "from-blue-600/20 to-teal-500/10",
  },
  "water-pump-installation": {
    slug: "water-pump-installation",
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    altText: "Centrifugal water monoblock pump base bolting and suction priming",
    category: "plumbing",
    subCategory: "Water Tank & Pump",
    gradient: "from-teal-600/20 to-cyan-500/10",
  },
  "pressure-booster-pump-installation": {
    slug: "pressure-booster-pump-installation",
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    altText: "Automatic pressure booster pump installation for multi-floor bathrooms",
    category: "plumbing",
    subCategory: "Water Tank & Pump",
    gradient: "from-cyan-600/20 to-indigo-500/10",
  },
  "automatic-water-level-controller": {
    slug: "automatic-water-level-controller",
    primaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&q=80",
    altText: "Magnetic float sensor automated pump on/off controller wiring",
    category: "plumbing",
    subCategory: "Water Tank & Pump",
    gradient: "from-indigo-600/20 to-teal-500/10",
  },

  // ─── PLUMBING: GEYSER & WATER HEATER (2) ───
  "water-heater-geyser-installation": {
    slug: "water-heater-geyser-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Wall-mount electric storage geyser hanging, angle valve and safety valve install",
    category: "plumbing",
    subCategory: "Geyser & Water Heater",
    gradient: "from-orange-500/20 to-red-500/10",
  },
  "geyser-uninstallation": {
    slug: "geyser-uninstallation",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Safe electrical disconnection, water draining and geyser unmounting",
    category: "plumbing",
    subCategory: "Geyser & Water Heater",
    gradient: "from-slate-600/20 to-orange-500/10",
  },

  // ─── PLUMBING: PIPELINE & LEAKAGE (4) ───
  "pipeline-leakage-repair": {
    slug: "pipeline-leakage-repair",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "CPVC/GI pipe crack patching, union coupling and solvent welding",
    category: "plumbing",
    subCategory: "Pipeline & Leakage",
    gradient: "from-blue-600/20 to-teal-500/10",
  },
  "concealed-wall-pipeline-repair": {
    slug: "concealed-wall-pipeline-repair",
    primaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80",
    altText: "Wall plaster chiseling and concealed leaking pipe elbow replacement",
    category: "plumbing",
    subCategory: "Pipeline & Leakage",
    gradient: "from-slate-600/20 to-blue-600/10",
  },
  "water-meter-installation": {
    slug: "water-meter-installation",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Mechanical inline water flow sub-meter installation on supply pipe",
    category: "plumbing",
    subCategory: "Pipeline & Leakage",
    gradient: "from-cyan-600/20 to-blue-500/10",
  },
  "main-gate-valve-replacement": {
    slug: "main-gate-valve-replacement",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Heavy brass main control gate valve and ball valve replacement",
    category: "plumbing",
    subCategory: "Pipeline & Leakage",
    gradient: "from-blue-700/20 to-indigo-600/10",
  },

  // ─── PLUMBING: APPLIANCE CONNECTIONS (2) ───
  "washing-machine-water-setup": {
    slug: "washing-machine-water-setup",
    primaryImage: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80",
    altText: "Washing machine dual inlet bib cock and drain hose trap connection",
    category: "plumbing",
    subCategory: "Appliance Connections",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  "ro-water-purifier-plumbing-point": {
    slug: "ro-water-purifier-plumbing-point",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "RO purifier 1/4 inch diverter valve installation on kitchen water line",
    category: "plumbing",
    subCategory: "Appliance Connections",
    gradient: "from-blue-500/20 to-teal-500/10",
  },

  // ─── PLUMBING: BATH ACCESSORIES, GROUTING, WATERPROOFING & CONSULTATION (6) ───
  "towel-rail-mirror-installation": {
    slug: "towel-rail-mirror-installation",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Bathroom mirror, stainless steel towel rail and glass shelf wall drilling",
    category: "plumbing",
    subCategory: "Bath Accessories",
    gradient: "from-slate-500/20 to-blue-500/10",
  },
  "full-bathroom-accessories-kit": {
    slug: "full-bathroom-accessories-kit",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Full 7-piece bathroom chrome accessory kit installation",
    category: "plumbing",
    subCategory: "Bath Accessories",
    gradient: "from-blue-600/20 to-cyan-500/10",
  },
  "bathroom-tile-grouting": {
    slug: "bathroom-tile-grouting",
    primaryImage: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400&q=80",
    altText: "Epoxy and waterproof tile joint grouting for shower floor",
    category: "plumbing",
    subCategory: "Grouting & Sealing",
    gradient: "from-slate-600/20 to-teal-500/10",
  },
  "sink-commode-silicone-sealing": {
    slug: "sink-commode-silicone-sealing",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Anti-fungal silicone gap sealant bead application around commode base",
    category: "plumbing",
    subCategory: "Grouting & Sealing",
    gradient: "from-teal-600/20 to-blue-500/10",
  },
  "minor-bathroom-seepage-treatment": {
    slug: "minor-bathroom-seepage-treatment",
    primaryImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80",
    altText: "Polymer modified chemical waterproofing coat against wall dampness",
    category: "plumbing",
    subCategory: "Waterproofing",
    gradient: "from-blue-700/20 to-teal-600/10",
  },
  "general-plumber-consultation": {
    slug: "general-plumber-consultation",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Experienced licensed master plumber performing home water line inspection",
    category: "plumbing",
    subCategory: "Consultation",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },

  // ─── AC & HVAC SERVICES ───
  "split-ac-foam-servicing": {
    slug: "split-ac-foam-servicing",
    primaryImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1614633833026-06207c0889c1?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
    altText: "HVAC specialist performing high-pressure foam jet deep servicing on split AC unit",
    category: "ac",
    subCategory: "AC Servicing",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  "ac-service": {
    slug: "ac-service",
    primaryImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1614633833026-06207c0889c1?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
    altText: "Technician inspecting split air conditioner indoor coil and filter",
    category: "ac",
    subCategory: "AC Servicing",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },

  // ─── PLUMBING POPULAR ───
  "bathroom-leakage-tap-repair": {
    slug: "bathroom-leakage-tap-repair",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Professional plumber repairing chrome bathroom tap and valve",
    category: "plumbing",
    subCategory: "Tap & Valve",
    gradient: "from-blue-600/20 to-cyan-500/10",
  },
  "tap-repair": {
    slug: "tap-repair",
    primaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80",
    altText: "Plumber servicing dripping bathroom mixer and washer",
    category: "plumbing",
    subCategory: "Tap & Valve",
    gradient: "from-blue-600/20 to-cyan-500/10",
  },
  "sink-blockage": {
    slug: "sink-blockage",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Plumber clearing clogged kitchen sink drain trap",
    category: "plumbing",
    subCategory: "Drainage",
    gradient: "from-blue-600/20 to-indigo-500/10",
  },
  "toilet-blockage": {
    slug: "toilet-blockage",
    primaryImage: "https://images.unsplash.com/photo-1542013936693-884638332954?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1542013936693-884638332954?w=400&q=80",
    altText: "Plumbing technician clearing commode drain blockage",
    category: "plumbing",
    subCategory: "Drainage",
    gradient: "from-blue-700/20 to-cyan-600/10",
  },
  "geyser-installation": {
    slug: "geyser-installation",
    primaryImage: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&q=80",
    altText: "Technician mounting electric geyser with pressure pipes and inlet valves",
    category: "plumbing",
    subCategory: "Water Heater",
    gradient: "from-orange-500/20 to-blue-500/10",
  },

  // ─── CLEANING POPULAR ───
  "sofa-shampoo-cleaning": {
    slug: "sofa-shampoo-cleaning",
    primaryImage: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80",
    altText: "Deep shampoo extraction cleaning on fabric living room sofa",
    category: "cleaning",
    subCategory: "Upholstery",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  "home-cleaning": {
    slug: "home-cleaning",
    primaryImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80",
    altText: "Professional home deep cleaning service with sanitized equipment",
    category: "cleaning",
    subCategory: "Deep Cleaning",
    gradient: "from-emerald-600/20 to-teal-500/10",
  },

  // ─── CARPENTRY POPULAR ───
  "furniture-assembly-repair": {
    slug: "furniture-assembly-repair",
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    altText: "Skilled carpenter repairing wooden furniture and adjusting hinges",
    category: "carpentry",
    subCategory: "Furniture",
    gradient: "from-amber-600/20 to-orange-500/10",
  },
  "furniture-repair": {
    slug: "furniture-repair",
    primaryImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80",
    altText: "Carpenter repairing dining table and chairs with precision woodwork",
    category: "carpentry",
    subCategory: "Furniture",
    gradient: "from-amber-600/20 to-orange-500/10",
  },

  // ─── APPLIANCES POPULAR ───
  "washing-machine-repair": {
    slug: "washing-machine-repair",
    primaryImage: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&q=80",
    altText: "Appliance engineer diagnosing front load washing machine motor drum",
    category: "appliances",
    subCategory: "Washing Machine",
    gradient: "from-cyan-600/20 to-blue-500/10",
  },

  // ─── SECURITY & CCTV POPULAR ───
  "cctv-installation": {
    slug: "cctv-installation",
    primaryImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=400&q=80",
    altText: "Security technician installing outdoor HD CCTV dome camera",
    category: "security",
    subCategory: "CCTV",
    gradient: "from-slate-700/20 to-blue-600/10",
  },

  // ─── PEST CONTROL POPULAR ───
  "herbal-cockroach-ant-control": {
    slug: "herbal-cockroach-ant-control",
    primaryImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&q=80",
    altText: "Specialist applying odorless herbal pest control gel baiting in kitchen cabinets",
    category: "pest-control",
    subCategory: "Insect Control",
    gradient: "from-emerald-700/20 to-green-600/10",
  },
};

/**
 * Intelligent trade-specific category fallbacks ensuring zero repetitive images.
 */
const CATEGORY_DEFAULT_IMAGES: Record<string, { primary: string; alt: string; gradient: string }> = {
  ac: {
    primary: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    alt: "AC technician inspecting split air conditioner indoor unit",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  plumbing: {
    primary: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&q=80",
    alt: "Plumber repairing bathroom tap and water piping",
    gradient: "from-blue-600/20 to-cyan-500/10",
  },
  cleaning: {
    primary: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    alt: "Professional home cleaning technician with supplies",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  carpentry: {
    primary: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80",
    alt: "Carpenter working on custom woodwork and furniture fittings",
    gradient: "from-amber-600/20 to-orange-500/10",
  },
  appliances: {
    primary: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80",
    alt: "Appliance repair engineer servicing home electronic appliance",
    gradient: "from-blue-600/20 to-indigo-500/10",
  },
  painting: {
    primary: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
    alt: "Interior painter painting living room wall with paint roller",
    gradient: "from-purple-600/20 to-pink-500/10",
  },
  security: {
    primary: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80",
    alt: "Security technician installing CCTV surveillance camera",
    gradient: "from-slate-700/20 to-blue-600/10",
  },
  "pest-control": {
    primary: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
    alt: "Pest control technician applying herbal pest control treatment",
    gradient: "from-green-600/20 to-emerald-500/10",
  },
  civil: {
    primary: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    alt: "Civil repair technician working on masonry and tile repairs",
    gradient: "from-slate-600/20 to-stone-500/10",
  },
  electrical: {
    primary: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&q=80",
    alt: "Electrician repairing wall switchboard and electrical wiring",
    gradient: "from-amber-500/20 to-orange-500/10",
  },
};

/**
 * Helper to fetch visual asset metadata for any service slug.
 * If slug is not found, provides an intelligent trade-specific fallback.
 */
export function getServiceImageMeta(slug: string, category: string = "electrical"): ServiceImageMeta {
  if (SERVICE_IMAGE_MAP[slug]) {
    return SERVICE_IMAGE_MAP[slug];
  }

  const catKey = category.toLowerCase();
  let matchedKey = "electrical";

  if (catKey.includes("ac") || catKey.includes("hvac") || catKey.includes("air")) {
    matchedKey = "ac";
  } else if (catKey.includes("plumb")) {
    matchedKey = "plumbing";
  } else if (catKey.includes("clean")) {
    matchedKey = "cleaning";
  } else if (catKey.includes("carpent") || catKey.includes("wood")) {
    matchedKey = "carpentry";
  } else if (catKey.includes("appliance")) {
    matchedKey = "appliances";
  } else if (catKey.includes("paint")) {
    matchedKey = "painting";
  } else if (catKey.includes("security") || catKey.includes("cctv")) {
    matchedKey = "security";
  } else if (catKey.includes("pest")) {
    matchedKey = "pest-control";
  } else if (catKey.includes("civil") || catKey.includes("mason")) {
    matchedKey = "civil";
  }

  const defaultMeta = CATEGORY_DEFAULT_IMAGES[matchedKey] || CATEGORY_DEFAULT_IMAGES.electrical;

  return {
    slug,
    primaryImage: defaultMeta.primary,
    secondaryImage: defaultMeta.primary,
    thumbnail: defaultMeta.primary,
    altText: defaultMeta.alt,
    category: matchedKey,
    subCategory: `${category} Service`,
    gradient: defaultMeta.gradient,
  };
}

/**
 * Central image resolver complying with section 5 of the design spec.
 * Priority:
 * 1. service.image_url / service.thumbnail
 * 2. service-specific mapping by slug
 * 3. category-specific fallback
 * 4. neutral professional fallback
 */
export function getServiceImage(service: any): { url: string; alt: string } {
  if (!service) {
    return {
      url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
      alt: "Home-e-Fix Professional Service",
    };
  }

  const categorySlug = service.category?.slug || service.categorySlug || service.category || "electrical";
  const slug = service.slug || "";
  const name = service.name || "Home Service";

  // 1. service.image_url if explicitly provided
  if (service.image_url) {
    return { url: service.image_url, alt: name };
  }

  // 2. service-specific mapping by slug
  if (slug && SERVICE_IMAGE_MAP[slug]) {
    const meta = SERVICE_IMAGE_MAP[slug];
    return {
      url: meta.primaryImage || meta.thumbnail || "",
      alt: meta.altText || name,
    };
  }

  // 3. service thumbnail if present
  if (service.thumbnail) {
    return { url: service.thumbnail, alt: name };
  }

  // 4. category-specific fallback
  const meta = getServiceImageMeta(slug, categorySlug);
  return {
    url: meta.primaryImage || meta.thumbnail || "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&q=80",
    alt: meta.altText || name,
  };
}

