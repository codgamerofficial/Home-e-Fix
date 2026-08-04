/**
 * Service category definitions matching Phase 3 & 4 specs.
 */
export const SERVICE_CATEGORIES = [
  {
    id: "electrical",
    name: "Electrical",
    slug: "electrical",
    icon: "⚡",
    description: "Wiring, switches, fans, MCB, and electrical repairs",
    color: "#F59E0B",
    count: 42,
  },
  {
    id: "plumbing",
    name: "Plumbing",
    slug: "plumbing",
    icon: "🔧",
    description: "Pipe repairs, leaks, bathroom fitting, and drainage",
    color: "#3B82F6",
    count: 38,
  },
  {
    id: "ac",
    name: "AC Repair & Service",
    slug: "ac",
    icon: "❄️",
    description: "Deep clean, gas refill, installation, and repairs",
    color: "#06B6D4",
    count: 29,
  },
  {
    id: "carpentry",
    name: "Carpentry",
    slug: "carpentry",
    icon: "🪚",
    description: "Furniture repair, door locks, assembly, and woodwork",
    color: "#D97706",
    count: 35,
  },
  {
    id: "cleaning",
    name: "Deep Cleaning",
    slug: "cleaning",
    icon: "🧹",
    description: "Full home, kitchen, sofa, and bathroom deep cleaning",
    color: "#10B981",
    count: 50,
  },
  {
    id: "painting",
    name: "Painting",
    slug: "painting",
    icon: "🎨",
    description: "Interior, exterior, waterproofing, and texture paint",
    color: "#8B5CF6",
    count: 24,
  },
  {
    id: "civil",
    name: "Civil & Masonry",
    slug: "civil",
    icon: "🏗️",
    description: "Tile fixing, wall plaster, leaks, and structural repair",
    color: "#64748B",
    count: 18,
  },
  {
    id: "inspection",
    name: "Home Inspection",
    slug: "inspection",
    icon: "🔍",
    description: "Pre-purchase home audit, electrical & safety check",
    color: "#3B82F6",
    count: 12,
  },
  {
    id: "security",
    name: "Security & CCTV",
    slug: "security",
    icon: "🛡️",
    description: "CCTV installation, smart door locks, and alarms",
    color: "#143560",
    count: 16,
  },
  {
    id: "glass",
    name: "Glass & Windows",
    slug: "glass",
    icon: "🪟",
    description: "Glass door repair, window mesh, and mirror installation",
    color: "#38BDF8",
    count: 15,
  },
  {
    id: "smart-home",
    name: "Smart Home",
    slug: "smart-home",
    icon: "🏠",
    description: "Smart switches, voice automation, and WiFi setup",
    color: "#A855F7",
    count: 20,
  },
  {
    id: "pest-control",
    name: "Pest Control",
    slug: "pest-control",
    icon: "🐛",
    description: "Cockroach, termite, bed bugs, and ant treatment",
    color: "#EF4444",
    count: 27,
  },
  {
    id: "false-ceiling",
    name: "False Ceiling",
    slug: "false-ceiling",
    icon: "🪵",
    description: "POP, Gypsum ceiling design, LED trough lighting",
    color: "#EAB308",
    count: 14,
  },
  {
    id: "flooring",
    name: "Flooring & Tiling",
    slug: "flooring",
    icon: "🧱",
    description: "Wooden flooring, marble polishing, tile grouting",
    color: "#B45309",
    count: 19,
  },
  {
    id: "interior-repair",
    name: "Interior Repair",
    slug: "interior-repair",
    icon: "🔨",
    description: "Modular kitchen repair, wardrobe hinges, touch-ups",
    color: "#EC4899",
    count: 31,
  },
] as const;

/* ─── Popular Services ─── */

export const POPULAR_SERVICES = [
  {
    id: "pop-ac-clean",
    name: "Split AC Foam Deep Jet Servicing",
    slug: "split-ac-foam-servicing",
    shortDescription: "Complete indoor & outdoor unit foam cleaning with high-pressure jet spray.",
    basePrice: 699,
    discountedPrice: 499,
    duration: 45,
    rating: 4.8,
    reviewCount: 1420,
    isPopular: true,
    category: { slug: "ac", name: "AC Repair & Service" },
    thumbnail: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80",
  },
  {
    id: "pop-plumb-leak",
    name: "Bathroom Leakage & Tap Repair",
    slug: "bathroom-leakage-tap-repair",
    shortDescription: "Fix leaking taps, flush tanks, pipe joints with 30-day warranty.",
    basePrice: 349,
    discountedPrice: 199,
    duration: 30,
    rating: 4.9,
    reviewCount: 980,
    isPopular: true,
    category: { slug: "plumbing", name: "Plumbing" },
    thumbnail: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80",
  },
  {
    id: "pop-elec-mcb",
    name: "Switch & Socket Installation / Repair",
    slug: "switch-socket-installation",
    shortDescription: "Replacement of burned switches, sockets, MCB trip troubleshooting.",
    basePrice: 249,
    discountedPrice: 149,
    duration: 30,
    rating: 4.7,
    reviewCount: 760,
    isPopular: true,
    category: { slug: "electrical", name: "Electrical" },
    thumbnail: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80",
  },
  {
    id: "pop-sofa-clean",
    name: "3-Seater Fabric Sofa Shampooing",
    slug: "sofa-shampoo-cleaning",
    shortDescription: "Deep extraction shampooing to remove tough stains, dust mites & odor.",
    basePrice: 1199,
    discountedPrice: 899,
    duration: 90,
    rating: 4.8,
    reviewCount: 650,
    isPopular: true,
    category: { slug: "cleaning", name: "Deep Cleaning" },
    thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80",
  },
  {
    id: "pop-pest-cockroach",
    name: "Herbal Cockroach Control Treatment",
    slug: "herbal-cockroach-control",
    shortDescription: "Odorless gel & spray treatment for kitchen cabinets & drains.",
    basePrice: 999,
    discountedPrice: 699,
    duration: 60,
    rating: 4.9,
    reviewCount: 1100,
    isPopular: true,
    category: { slug: "pest-control", name: "Pest Control" },
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=500&q=80",
  },
  {
    id: "pop-carpenter-door",
    name: "Door Lock & Handle Fitting",
    slug: "door-lock-fitting",
    shortDescription: "Installation of mortise lock, door latch, hinges, and alignment.",
    basePrice: 449,
    discountedPrice: 299,
    duration: 45,
    rating: 4.7,
    reviewCount: 520,
    isPopular: true,
    category: { slug: "carpentry", name: "Carpentry" },
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80",
  },
];

/* ─── Emergency 24/7 Services ─── */

export const EMERGENCY_SERVICES = [
  {
    id: "emg-burst",
    title: "Major Pipe Burst & Water Overflow",
    icon: "🚨",
    arrival: "20-30 Mins",
    description: "Urgent valve shutoff and emergency pipe clamping.",
  },
  {
    id: "emg-power",
    title: "Total Power Blackout / MCB Burnout",
    icon: "⚡",
    arrival: "25-30 Mins",
    description: "Immediate emergency electrician for main line trip.",
  },
  {
    id: "emg-lock",
    title: "Locked Out / Door Lock Failure",
    icon: "🔑",
    arrival: "20 Mins",
    description: "Non-destructive emergency lock opening service.",
  },
  {
    id: "emg-gas",
    title: "Gas Pipe Smell / Stove Leakage",
    icon: "🔥",
    arrival: "15 Mins",
    description: "Priority safety technician for gas pipeline check.",
  },
];

/* ─── Why Home-e-Fix Pillars ─── */

export const WHY_HOMEEFIX = [
  {
    id: "verified-pros",
    icon: "🛡️",
    title: "100% Background Verified Pros",
    description: "Every technician undergoes rigorous police verification, skill tests, and safety training.",
    highlight: "Top 5% accepted",
  },
  {
    id: "fixed-pricing",
    icon: "💰",
    title: "Transparent Upfront Pricing",
    description: "No hidden inspection fees or surprise bills. Pay exactly what is quoted before the work starts.",
    highlight: "Zero hidden charges",
  },
  {
    id: "on-time",
    icon: "⏱️",
    title: "On-Time Arrival Guarantee",
    description: "If our pro is delayed by more than 15 minutes without notice, get ₹100 instant wallet credit.",
    highlight: "30-min window",
  },
  {
    id: "warranty",
    icon: "🔒",
    title: "30-Day Service Warranty",
    description: "If anything goes wrong after the service, we will revisit and fix it completely free of charge.",
    highlight: "100% Covered",
  },
];

/* ─── Home-e-Fix Promise Items ─── */

export const HOMEEFIX_PROMISE = [
  {
    title: "Damage Protection Cover",
    description: "Up to ₹10,000 insurance coverage against accidental damages during service.",
    icon: "🛡️",
  },
  {
    title: "Genuine Spare Parts Only",
    description: "We use 100% original, brand-certified components with manufacturer warranty.",
    icon: "📦",
  },
  {
    title: "Sanitized & Hygienic Equipment",
    description: "Tools are disinfected before & after every job. Pros wear masks & shoe covers.",
    icon: "🧼",
  },
  {
    title: "Hassle-Free Re-work Guarantee",
    description: "Not satisfied? We re-assign a senior technician at zero additional cost.",
    icon: "🔄",
  },
];

/* ─── Testimonials ─── */

export const TESTIMONIALS = [
  {
    userName: "Priya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
    rating: 5,
    date: "2026-08-01",
    comment: "The AC foam deep cleaning was unbelievable! Airflow doubled and the technician left the room spotlessly clean. Home-e-Fix is now my go-to service app.",
    serviceName: "AC Foam Deep Cleaning",
    isVerified: true,
    helpfulCount: 28,
  },
  {
    userName: "Vikram Malhotra",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5,
    date: "2026-07-28",
    comment: "Had a major pipe leak at 10 PM. Home-e-Fix emergency plumber arrived in 22 minutes! Super polite and fixed the valve quickly. Saved our wooden flooring.",
    serviceName: "24/7 Emergency Plumbing",
    isVerified: true,
    helpfulCount: 42,
  },
  {
    userName: "Sneha Reddy",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
    rating: 5,
    date: "2026-07-25",
    comment: "Booked full home deep cleaning before moving in. Team of 3 arrived with professional machines and worked non-stop for 6 hours. Worth every rupee!",
    serviceName: "Full Home Deep Cleaning",
    isVerified: true,
    helpfulCount: 19,
  },
];

/* ─── Blog Articles ─── */

export const BLOG_ARTICLES = [
  {
    id: "blog-ac-maintenance",
    title: "5 Critical Signs Your AC Needs Gas Refill & Servicing",
    category: "Appliance Care",
    date: "Aug 02, 2026",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80",
    snippet: "Is your AC blowing warm air or forming ice coils? Learn how to spot gas leakage before compressor failure.",
  },
  {
    id: "blog-monsoon-plumbing",
    title: "Essential Monsoon Plumbing Checklist for Homeowners",
    category: "Home Maintenance",
    date: "Jul 29, 2026",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80",
    snippet: "Prevent sewage backflow, terrace drain blockages, and damp walls this rainy season with these simple steps.",
  },
  {
    id: "blog-electrical-safety",
    title: "Why MCB Tripping Is Danger Warning You Shouldn't Ignore",
    category: "Safety Tips",
    date: "Jul 20, 2026",
    readTime: "3 min read",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80",
    snippet: "Frequent breaker trips indicate overloaded circuits or neutral earth faults. Here's what you need to do.",
  },
];

/* ─── FAQs ─── */

export const HOMEPAGE_FAQS = [
  {
    question: "How do I book a home service on Home-e-Fix?",
    answer: "Simply select your desired service category, pick a date & time slot that suits you, enter your address, and confirm. A background-verified professional will be assigned to your booking.",
  },
  {
    question: "Are your service professionals background checked and trained?",
    answer: "Yes, 100% of our service technicians undergo mandatory police background verification, identity check, and hands-on technical skill assessment before joining our network.",
  },
  {
    question: "What happens if I am not satisfied with the service?",
    answer: "Every service booked through Home-e-Fix comes with a 30-Day Service Warranty. If you encounter any issue, request a free re-visit via the app, and we'll fix it at zero extra cost.",
  },
  {
    question: "Can I reschedule or cancel my booking?",
    answer: "Yes, you can reschedule or cancel your booking for free up to 2 hours before your scheduled time slot directly through the app or website.",
  },
  {
    question: "How does the 24/7 Emergency Service work?",
    answer: "For urgent issues like pipe bursts, total power blackouts, or lockouts, select 'Emergency Service'. Our nearest available pro is dispatched immediately with a target 30-minute arrival window.",
  },
];

/* ─── App Config ─── */

export const APP_CONFIG = {
  name: "Home-e-Fix",
  tagline: "Fixing Homes. Earning Trust.",
  description:
    "Home-e-Fix is your trusted Urban Company–style marketplace for all home services. Book verified professionals for electrical, plumbing, AC, cleaning, painting, and 10+ categories.",
  supportEmail: "support@homeefix.com",
  supportPhone: "+91 1800 123 4567",
  socialLinks: {
    facebook: "https://facebook.com/homeefix",
    instagram: "https://instagram.com/homeefix",
    twitter: "https://twitter.com/homeefix",
    linkedin: "https://linkedin.com/company/homeefix",
    youtube: "https://youtube.com/@homeefix",
  },
  playStoreLink: "#",
  appStoreLink: "#",
} as const;

export const BOOKING_STATUSES = {
  pending: { label: "Pending", color: "warning" },
  confirmed: { label: "Confirmed", color: "info" },
  assigned: { label: "Assigned", color: "info" },
  in_progress: { label: "In Progress", color: "accent" },
  completed: { label: "Completed", color: "success" },
  cancelled: { label: "Cancelled", color: "error" },
  refunded: { label: "Refunded", color: "muted" },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
} as const;
