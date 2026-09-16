/**
 * HOME-E-FIX: AUTHORITATIVE SERVICE CATALOGUE ENGINE
 * Implements Two-Dimensional Architecture:
 * 1. Customer-Facing Service Missions (15 Categories)
 * 2. Internal Professional Skills/Trades (20 Trades)
 * With 11 Delivery Types, Dynamic Diagnostic Questions, and Tracking Policies.
 */

import type {
  ServiceMissionCategory,
  ProfessionalTradeSkill,
  ProfessionalSkillMeta,
  ArchitecturalService,
  ServiceDeliveryType,
  TrackingMode,
} from "@/types/service-architecture.types";

/* ─── 1. Customer Service Missions (15 Customer-Facing Categories) ─── */
export interface ServiceMissionMeta {
  id: string;
  slug: ServiceMissionCategory;
  name: string;
  shortName: string;
  icon: string;
  badge?: string;
  tagline: string;
  description: string;
  color: string;
  bannerImage: string;
  defaultTrackingMode: TrackingMode;
  startingPrice: number;
}

export const CUSTOMER_SERVICE_MISSIONS: ServiceMissionMeta[] = [
  {
    id: "mission-home-repair",
    slug: "home_repair",
    name: "Home Repair & Fixes",
    shortName: "Home Repair",
    icon: "🛠️",
    tagline: "Quick fixes & general domestic repairs",
    description: "Drilling, hanging, door repairs, lock replacements, minor tile and wall fixes",
    color: "#D97706",
    bannerImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 149,
  },
  {
    id: "mission-ac-appliances",
    slug: "ac_appliances",
    name: "AC & Appliance Care",
    shortName: "AC & Appliances",
    icon: "❄️",
    badge: "Most Popular",
    tagline: "Certified repair & servicing for all domestic appliances",
    description: "AC foam jet service, refrigerator diagnostics, washing machine repair, RO membrane replacement",
    color: "#0284C7",
    bannerImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 199,
  },
  {
    id: "mission-cleaning",
    slug: "cleaning",
    name: "Deep Cleaning & Sanitization",
    shortName: "Cleaning",
    icon: "✨",
    tagline: "Hospital-grade deep cleaning for healthy homes",
    description: "Full home deep clean, kitchen degreasing, bathroom descaling, sofa shampooing",
    color: "#059669",
    bannerImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 399,
  },
  {
    id: "mission-pest-control",
    slug: "pest_control",
    name: "Pest Control & Prevention",
    shortName: "Pest Control",
    icon: "🛡️",
    tagline: "Safe, odorless, government-approved pest eradication",
    description: "Cockroach gel treatment, anti-termite piping, bed bug eradication, rodent management",
    color: "#16A34A",
    bannerImage: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 499,
  },
  {
    id: "mission-painting-waterproofing",
    slug: "painting_waterproofing",
    name: "Painting & Waterproofing",
    shortName: "Painting",
    icon: "🎨",
    tagline: "Wall beauty with lasting seepage protection",
    description: "Interior luxury emulsion, exterior weather coat, roof damp proofing, laser measurement",
    color: "#7C3AED",
    bannerImage: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80",
    defaultTrackingMode: "ASSIGNED_ONLY",
    startingPrice: 999,
  },
  {
    id: "mission-plumbing",
    slug: "plumbing",
    name: "Plumbing Services",
    shortName: "Plumbing",
    icon: "🔧",
    tagline: "Leak-free pipes and precision fittings",
    description: "Tap replacement, concealed pipe leakage, toilet cistern fix, basin drainage, motor pump install",
    color: "#2563EB",
    bannerImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 149,
  },
  {
    id: "mission-electrical",
    slug: "electrical",
    name: "Electrical Services",
    shortName: "Electrical",
    icon: "⚡",
    tagline: "Safe, certified electrical diagnostics & installations",
    description: "Switch/socket replacement, fan installation, MCB tripping fix, inverter wiring, chandelier setup",
    color: "#EA580C",
    bannerImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 99,
  },
  {
    id: "mission-carpentry-furniture",
    slug: "carpentry_furniture",
    name: "Carpentry & Furniture Assembly",
    shortName: "Carpentry",
    icon: "🪚",
    tagline: "Precision woodwork, lock repairs & flatpack assembly",
    description: "Door hinge alignment, smart lock fitting, wardrobe drawer channels, IKEA furniture assembly",
    color: "#B45309",
    bannerImage: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 199,
  },
  {
    id: "mission-glass-windows",
    slug: "glass_windows",
    name: "Glass & Window Solutions",
    shortName: "Glass & Windows",
    icon: "🪟",
    tagline: "Window mesh, glass pane replacements & sliding fixes",
    description: "UPVC window roller track fix, mosquito net mesh installation, bathroom mirror mounting, glass partition",
    color: "#0891B2",
    bannerImage: "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?w=1200&q=80",
    defaultTrackingMode: "ASSIGNED_ONLY",
    startingPrice: 299,
  },
  {
    id: "mission-modular-kitchen",
    slug: "modular_kitchen",
    name: "Modular Kitchen & Chimney",
    shortName: "Kitchen Care",
    icon: "🍳",
    tagline: "Chimney ducting, deep degreasing & hydraulic hinge fixes",
    description: "Kitchen chimney duct cleaning, burner repair, hydraulic lift hinge replacement, wire basket alignment",
    color: "#DC2626",
    bannerImage: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 499,
  },
  {
    id: "mission-smart-home-security",
    slug: "smart_home_security",
    name: "Smart Home & Security",
    shortName: "Smart Home",
    icon: "🔒",
    tagline: "Next-gen video doorbells, smart locks & CCTV",
    description: "CCTV camera cabling & NVR setup, digital door lock installation, smart switch Wi-Fi configuration",
    color: "#4F46E5",
    bannerImage: "https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 499,
  },
  {
    id: "mission-home-inspection",
    slug: "home_inspection",
    name: "Comprehensive Home Inspection",
    shortName: "Home Inspection",
    icon: "📋",
    tagline: "Pre-possession, electrical safety & seepage audit",
    description: "120+ point pre-handover architectural check, thermal imaging for seepage, electrical grounding test",
    color: "#475569",
    bannerImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
    defaultTrackingMode: "ASSIGNED_ONLY",
    startingPrice: 1999,
  },
  {
    id: "mission-beauty-wellness",
    slug: "beauty_wellness",
    name: "Beauty & At-Home Wellness",
    shortName: "Beauty & Wellness",
    icon: "💆‍♀️",
    badge: "Salon at Home",
    tagline: "Hygienic salon, facial, manicure & spa services",
    description: "Disposable kit facials, premium waxing, therapeutic foot reflexology, at-home hair styling",
    color: "#DB2777",
    bannerImage: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1200&q=80",
    defaultTrackingMode: "ON_THE_WAY",
    startingPrice: 399,
  },
  {
    id: "mission-rapid-home-help",
    slug: "rapid_home_help",
    name: "Rapid Home Help (InstaHelp)",
    shortName: "Rapid Help",
    icon: "⚡",
    badge: "15-30 Min Dispatch",
    tagline: "Instant household assistance when you need it now",
    description: "Instant plumber, rapid fuse fix, heavy furniture shifting assistance, instant handyman",
    color: "#F59E0B",
    bannerImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
    defaultTrackingMode: "LIVE_LOCATION_AND_ETA",
    startingPrice: 249,
  },
  {
    id: "mission-emergency-services",
    slug: "emergency_services",
    name: "Emergency Breakdown Services",
    shortName: "Emergency 24/7",
    icon: "🚨",
    badge: "Urgent Dispatch",
    tagline: "Critical breakdown response within 2 hours across covered hubs",
    description: "Burst water mains, complete electrical blackout, burning smell in MCB, severe drain overflow",
    color: "#DC2626",
    bannerImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&q=80",
    defaultTrackingMode: "LIVE_LOCATION_AND_ETA",
    startingPrice: 499,
  },
];

/* ─── 2. Professional Trades & Skills (20 Standard Trades) ─── */
export const PROFESSIONAL_TRADE_SKILLS: ProfessionalSkillMeta[] = [
  { id: "trade-electrician", slug: "electrician", name: "Electrician", categoryHint: "Electrical", description: "Certified domestic electrical specialist" },
  { id: "trade-plumber", slug: "plumber", name: "Plumber", categoryHint: "Plumbing", description: "Piping, sanitaryware, and drainage technician" },
  { id: "trade-carpenter", slug: "carpenter", name: "Carpenter", categoryHint: "Carpentry & Furniture", description: "Woodworking, locks, and furniture assembly technician" },
  { id: "trade-ac-technician", slug: "ac_technician", name: "AC Technician", categoryHint: "AC & Appliances", description: "Split/Window AC servicing and gas charging specialist" },
  { id: "trade-refrigeration", slug: "refrigeration_technician", name: "Refrigeration Technician", categoryHint: "AC & Appliances", description: "Single/Double door refrigerator repair specialist" },
  { id: "trade-ro-technician", slug: "ro_technician", name: "RO Technician", categoryHint: "AC & Appliances", description: "Water purifier and membrane replacement specialist" },
  { id: "trade-appliance-technician", slug: "appliance_technician", name: "Appliance Technician", categoryHint: "AC & Appliances", description: "Washing machine and kitchen appliance technician" },
  { id: "trade-painter", slug: "painter", name: "Painter", categoryHint: "Painting & Waterproofing", description: "Wall emulsion, putty, and paint application specialist" },
  { id: "trade-waterproofing", slug: "waterproofing_technician", name: "Waterproofing Technician", categoryHint: "Painting & Waterproofing", description: "Balcony, roof, and wall seepage waterproofing specialist" },
  { id: "trade-cleaner", slug: "cleaner", name: "Professional Cleaner", categoryHint: "Cleaning", description: "Deep cleaning, degreasing, and sanitization specialist" },
  { id: "trade-pest-technician", slug: "pest_technician", name: "Pest Control Technician", categoryHint: "Pest Control", description: "Safe chemical application and pest eradication expert" },
  { id: "trade-glass-technician", slug: "glass_technician", name: "Glass Technician", categoryHint: "Glass & Windows", description: "Window glazing and glass partition technician" },
  { id: "trade-kitchen-technician", slug: "kitchen_technician", name: "Kitchen Technician", categoryHint: "Modular Kitchen", description: "Modular kitchen hardware and chimney installer" },
  { id: "trade-cctv-technician", slug: "cctv_technician", name: "CCTV Technician", categoryHint: "Smart Home & Security", description: "CCTV wiring and security camera setup specialist" },
  { id: "trade-smart-home-technician", slug: "smart_home_technician", name: "Smart Home Technician", categoryHint: "Smart Home & Security", description: "Smart locks and IoT device configuration specialist" },
  { id: "trade-home-inspector", slug: "home_inspector", name: "Home Inspector", categoryHint: "Home Inspection", description: "Structural, electrical, and plumbing pre-possession auditor" },
  { id: "trade-beautician", slug: "beautician", name: "Beautician", categoryHint: "Beauty & Wellness", description: "Hygienic salon and skincare professional" },
  { id: "trade-hair-professional", slug: "hair_professional", name: "Hair Professional", categoryHint: "Beauty & Wellness", description: "Hair stylist and treatment expert" },
  { id: "trade-spa-professional", slug: "spa_professional", name: "Spa Professional", categoryHint: "Beauty & Wellness", description: "Massage and relaxation therapist" },
  { id: "trade-rapid-help-professional", slug: "rapid_help_professional", name: "Rapid Help Professional", categoryHint: "Rapid Home Help", description: "On-demand rapid response handyman" },
];

/* ─── 3. Flagship Services with Specific Delivery Types & Dynamic Diagnostic Questions ─── */
export const ARCHITECTURAL_SERVICES: ArchitecturalService[] = [
  // A. FIXED_PRICE Service: Switch & Socket Replacement
  {
    id: "srv-switch-replacement",
    slug: "switch-socket-replacement",
    name: "Switch & Socket Replacement",
    missionCategory: "electrical",
    deliveryType: "FIXED_PRICE",
    trackingMode: "ON_THE_WAY",
    requiredSkills: ["electrician"],
    shortDescription: "Safe replacement of switch, socket, or dimmer with voltage check",
    basePrice: 99,
    strikePrice: 149,
    durationMin: 30,
    warrantyDays: 30,
    warrantyTitle: "30-Day Workmanship Warranty",
    isPopular: true,
    questions: [
      {
        id: "q-switch-type",
        code: "switch_type",
        question: "What electrical fixture needs replacement?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-switch", label: "Single Switch (5A / 15A)", priceModifier: 0 },
          { id: "opt-power-socket", label: "Power Socket (16A AC/Geyser)", priceModifier: 40 },
          { id: "opt-fan-regulator", label: "Fan Regulator Dimmer", priceModifier: 50 },
          { id: "opt-bell-push", label: "Doorbell Push Button", priceModifier: 20 },
        ],
      },
      {
        id: "q-switch-count",
        code: "switch_count",
        question: "How many fixtures need service?",
        type: "NUMBER_STEPPER",
        required: true,
        minNumber: 1,
        maxNumber: 10,
        step: 1,
        unitLabel: "fixtures",
      },
      {
        id: "q-switch-brand",
        code: "material_status",
        question: "Do you have the replacement switches ready?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-has-parts", label: "Yes, I already purchased the switch/socket", priceModifier: 0 },
          { id: "opt-need-parts", label: "No, please bring standard modular switch (billed separately)", priceModifier: 0 },
        ],
      },
    ],
  },

  // B. DIAGNOSIS_FIRST Service: AC Repair & Diagnostics
  {
    id: "srv-ac-repair",
    slug: "ac-repair-diagnostics",
    name: "AC Repair & Fault Diagnosis",
    missionCategory: "ac_appliances",
    deliveryType: "DIAGNOSIS_FIRST",
    trackingMode: "ON_THE_WAY",
    requiredSkills: ["ac_technician"],
    shortDescription: "Complete inspection of cooling, compressor, fan motor, and PCB with exact repair estimate",
    basePrice: 199,
    visitFee: 199,
    durationMin: 60,
    warrantyDays: 30,
    warrantyTitle: "30-Day Post-Repair Warranty",
    isPopular: true,
    questions: [
      {
        id: "q-ac-type",
        code: "ac_type",
        question: "What type of AC is it?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-split-ac", label: "Split AC (Inverter / Non-Inverter)" },
          { id: "opt-window-ac", label: "Window AC" },
          { id: "opt-cassette-ac", label: "Cassette / Tower AC" },
        ],
      },
      {
        id: "q-ac-brand",
        code: "ac_brand",
        question: "AC Brand",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-voltas", label: "Voltas" },
          { id: "opt-daikin", label: "Daikin" },
          { id: "opt-lg", label: "LG" },
          { id: "opt-samsung", label: "Samsung" },
          { id: "opt-hitachi", label: "Hitachi" },
          { id: "opt-carrier", label: "Carrier / Blue Star" },
          { id: "opt-other", label: "Other Brand" },
        ],
      },
      {
        id: "q-ac-symptom",
        code: "ac_issue",
        question: "What is the primary problem you are experiencing?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-no-cooling", label: "AC runs but blows warm air (No Cooling)" },
          { id: "opt-water-leak", label: "Water leaking from indoor unit" },
          { id: "opt-noise", label: "Unusual rattling or vibrating noise" },
          { id: "opt-power-trip", label: "MCB trips immediately when AC is turned on" },
          { id: "opt-error-code", label: "Display is blinking error code" },
        ],
      },
      {
        id: "q-ac-photo",
        code: "issue_photos",
        question: "Upload photo of indoor unit or error code (optional)",
        type: "PHOTO_UPLOAD",
        required: false,
        helperText: "Helps the technician bring specific spare parts",
      },
    ],
  },

  // C. QUOTATION Service: Full Home Painting
  {
    id: "srv-full-home-painting",
    slug: "full-home-painting",
    name: "Full Home Painting & Damp Treatment",
    missionCategory: "painting_waterproofing",
    deliveryType: "QUOTATION",
    trackingMode: "ASSIGNED_ONLY",
    requiredSkills: ["painter", "waterproofing_technician"],
    shortDescription: "Free site inspection with digital laser measurement and computerized shade consultation",
    basePrice: 0,
    durationMin: 90,
    warrantyDays: 365,
    warrantyTitle: "1-Year Peeling & Damp Warranty",
    questions: [
      {
        id: "q-paint-property",
        code: "property_type",
        question: "What type of property needs painting?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-apartment", label: "Apartment / Flat" },
          { id: "opt-independent-house", label: "Independent House / Villa" },
          { id: "opt-commercial-office", label: "Office / Commercial Space" },
        ],
      },
      {
        id: "q-paint-bhk",
        code: "bhk_size",
        question: "Home configuration",
        type: "BHK_SELECT",
        required: true,
        options: [
          { id: "opt-1bhk", label: "1 BHK" },
          { id: "opt-2bhk", label: "2 BHK" },
          { id: "opt-3bhk", label: "3 BHK" },
          { id: "opt-4bhk", label: "4+ BHK / Duplex" },
        ],
      },
      {
        id: "q-paint-scope",
        code: "paint_scope",
        question: "Painting scope",
        type: "MULTI_CHOICE",
        required: true,
        options: [
          { id: "opt-interior", label: "Interior Walls & Ceilings" },
          { id: "opt-exterior", label: "Exterior Facade" },
          { id: "opt-waterproofing", label: "Waterproofing / Seepage Repair" },
          { id: "opt-wood-enamel", label: "Doors & Windows Wood Polishing" },
        ],
      },
      {
        id: "q-paint-timeframe",
        code: "timeline_preference",
        question: "When do you plan to start?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-urgent", label: "Immediately (Next 3 days)" },
          { id: "opt-two-weeks", label: "Within 2 weeks" },
          { id: "opt-planning", label: "Just exploring quotes" },
        ],
      },
    ],
  },

  // D. PACKAGE Service: Full Home Deep Cleaning
  {
    id: "srv-home-deep-cleaning",
    slug: "full-home-deep-cleaning",
    name: "Full Home Deep Cleaning Package",
    missionCategory: "cleaning",
    deliveryType: "PACKAGE",
    trackingMode: "ON_THE_WAY",
    requiredSkills: ["cleaner"],
    shortDescription: "Complete mechanized floor scrubbing, kitchen degreasing, bathroom descaling & window cleaning",
    basePrice: 1999,
    strikePrice: 2499,
    durationMin: 240,
    warrantyDays: 1,
    warrantyTitle: "24-Hour Re-cleaning Guarantee",
    isPopular: true,
    questions: [
      {
        id: "q-clean-bhk",
        code: "home_configuration",
        question: "Select your home size package:",
        type: "PACKAGE_SELECT" as any,
        required: true,
        options: [
          { id: "opt-1bhk-clean", label: "1 BHK Deep Clean (up to 600 sq.ft)", priceModifier: 0, durationModifierMin: 180 },
          { id: "opt-2bhk-clean", label: "2 BHK Deep Clean (up to 1,000 sq.ft)", priceModifier: 600, durationModifierMin: 240 },
          { id: "opt-3bhk-clean", label: "3 BHK Deep Clean (up to 1,500 sq.ft)", priceModifier: 1300, durationModifierMin: 300 },
          { id: "opt-4bhk-clean", label: "4 BHK / Villa Deep Clean (up to 2,200 sq.ft)", priceModifier: 2200, durationModifierMin: 360 },
        ],
      },
      {
        id: "q-clean-furnish",
        code: "occupancy_status",
        question: "Is the house currently furnished or vacant?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-occupied", label: "Furnished & Occupied", priceModifier: 0 },
          { id: "opt-vacant", label: "Vacant / Pre-Move In (Empty rooms)", priceModifier: -200 },
        ],
      },
      {
        id: "q-clean-balcony",
        code: "balconies_count",
        question: "How many balconies to scrub?",
        type: "NUMBER_STEPPER",
        required: false,
        minNumber: 0,
        maxNumber: 5,
        step: 1,
        unitLabel: "balconies",
      },
    ],
  },

  // E. QUANTITY_BASED Service: Sofa Shampooing
  {
    id: "srv-sofa-cleaning",
    slug: "sofa-upholstery-cleaning",
    name: "Sofa Shampooing & Sanitization",
    missionCategory: "cleaning",
    deliveryType: "QUANTITY_BASED",
    trackingMode: "ON_THE_WAY",
    requiredSkills: ["cleaner"],
    shortDescription: "Dry vacuuming, foam shampoo extraction and fabric conditioning per seat",
    basePrice: 249,
    durationMin: 45,
    warrantyDays: 1,
    warrantyTitle: "Stain Removal Guarantee",
    questions: [
      {
        id: "q-sofa-seats",
        code: "seat_count",
        question: "How many sofa seats?",
        type: "NUMBER_STEPPER",
        required: true,
        minNumber: 1,
        maxNumber: 10,
        step: 1,
        unitLabel: "seats",
      },
      {
        id: "q-sofa-material",
        code: "fabric_type",
        question: "Sofa Material",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-fabric", label: "Fabric / Suede / Velvet", priceModifier: 0 },
          { id: "opt-leatherette", label: "Leather / Leatherette (Requires cream polish)", priceModifier: 50 },
        ],
      },
    ],
  },

  // F. RAPID Service: Rapid Electrician Dispatch
  {
    id: "srv-rapid-electrician",
    slug: "rapid-urgent-electrician",
    name: "Rapid Electrician (InstaHelp)",
    missionCategory: "rapid_home_help",
    deliveryType: "RAPID",
    trackingMode: "LIVE_LOCATION_AND_ETA",
    requiredSkills: ["electrician", "rapid_help_professional"],
    shortDescription: "Priority dispatch to nearest available verified electrician with live GPS tracking",
    basePrice: 249,
    strikePrice: 299,
    durationMin: 30,
    warrantyDays: 30,
    warrantyTitle: "30-Day Service Warranty",
    isPopular: true,
    questions: [
      {
        id: "q-rapid-issue",
        code: "urgent_electrical_issue",
        question: "What urgent assistance do you need?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-fuse-blown", label: "Power tripping / Fuse blown" },
          { id: "opt-sparking", label: "Sparking switch or socket" },
          { id: "opt-inverter-beep", label: "Inverter alarming or non-functional" },
          { id: "opt-quick-install", label: "Need fixture installed right now" },
        ],
      },
      {
        id: "q-floor-access",
        code: "floor_access",
        question: "Floor & Accessibility",
        type: "TEXT_INPUT",
        required: false,
        helperText: "e.g. 3rd Floor, Lift available, Flat 3B",
      },
    ],
  },

  // G. EMERGENCY Service: Emergency Water Leakage
  {
    id: "srv-emergency-plumbing",
    slug: "emergency-water-leakage",
    name: "24/7 Emergency Plumbing Breakdown",
    missionCategory: "emergency_services",
    deliveryType: "EMERGENCY",
    trackingMode: "LIVE_LOCATION_AND_ETA",
    requiredSkills: ["plumber", "rapid_help_professional"],
    shortDescription: "Immediate dispatch for burst pipes, severe drain overflows, and continuous leakage",
    basePrice: 499,
    emergencyFee: 499,
    durationMin: 45,
    warrantyDays: 30,
    warrantyTitle: "Home-e-Fix Emergency Safety Guarantee",
    isEmergencyEligible: true,
    questions: [
      {
        id: "q-emergency-type",
        code: "emergency_nature",
        question: "Type of Emergency:",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-burst-pipe", label: "Burst water supply pipe / uncontrollable flow" },
          { id: "opt-sewage-overflow", label: "Sewage / drain overflow inside home" },
          { id: "opt-overhead-tank", label: "Overhead tank float valve failed & overflowing" },
          { id: "opt-commercial-main", label: "Main building riser leak" },
        ],
      },
      {
        id: "q-main-valve",
        code: "main_valve_status",
        question: "Have you closed the main water valve?",
        type: "SINGLE_CHOICE",
        required: true,
        options: [
          { id: "opt-valve-closed", label: "Yes, main supply valve is turned off" },
          { id: "opt-valve-stuck", label: "No, main valve is stuck or cannot be found" },
        ],
      },
    ],
  },
];

/* ─── 4. Catalogue Engine Helper Methods ─── */
export const catalogueEngine = {
  /**
   * Get all 15 Customer Service Missions
   */
  getMissions(): ServiceMissionMeta[] {
    return CUSTOMER_SERVICE_MISSIONS;
  },

  /**
   * Find Mission by Slug
   */
  getMissionBySlug(slug: string): ServiceMissionMeta | undefined {
    return CUSTOMER_SERVICE_MISSIONS.find((m) => m.slug === slug);
  },

  /**
   * Get all 20 Professional Trade Skills
   */
  getTradeSkills(): ProfessionalSkillMeta[] {
    return PROFESSIONAL_TRADE_SKILLS;
  },

  /**
   * Find Trade Skill by Slug
   */
  getTradeSkillBySlug(slug: string): ProfessionalSkillMeta | undefined {
    return PROFESSIONAL_TRADE_SKILLS.find((t) => t.slug === slug);
  },

  /**
   * Get services filtered by Mission Category
   */
  getServicesByMission(missionSlug: ServiceMissionCategory): ArchitecturalService[] {
    return ARCHITECTURAL_SERVICES.filter((s) => s.missionCategory === missionSlug);
  },

  ARCHITECTURAL_SERVICES,

  /**
   * Get all architectural services
   */
  getAllServices(): ArchitecturalService[] {
    return ARCHITECTURAL_SERVICES;
  },

  /**
   * Find Service by Slug
   */
  getServiceBySlug(slug: string): ArchitecturalService | undefined {
    return ARCHITECTURAL_SERVICES.find((s) => s.slug === slug);
  },

  /**
   * Check if a service allows live GPS tracking
   */
  isLiveTrackingService(service: ArchitecturalService): boolean {
    return service.trackingMode === "LIVE_LOCATION" || service.trackingMode === "LIVE_LOCATION_AND_ETA" || service.trackingMode === "ON_THE_WAY";
  },

  /**
   * Calculate effective price for a service given dynamic diagnostic answers
   */
  calculateEffectivePrice(service: ArchitecturalService, answers: Record<string, any>): {
    basePrice: number;
    optionsTotal: number;
    totalPrice: number;
  } {
    let optionsTotal = 0;

    service.questions.forEach((q) => {
      const answerVal = answers[q.code];
      if (!answerVal) return;

      if (q.type === "SINGLE_CHOICE" && q.options) {
        const selectedOpt = q.options.find((o) => o.id === answerVal);
        if (selectedOpt?.priceModifier) {
          optionsTotal += selectedOpt.priceModifier;
        }
      } else if (q.type === "NUMBER_STEPPER" && typeof answerVal === "number") {
        if (service.deliveryType === "QUANTITY_BASED") {
          // Multiply base price by quantity above 1
          const multiplier = Math.max(1, answerVal);
          optionsTotal += (multiplier - 1) * service.basePrice;
        }
      }
    });

    return {
      basePrice: service.basePrice,
      optionsTotal,
      totalPrice: service.basePrice + optionsTotal,
    };
  },
};
