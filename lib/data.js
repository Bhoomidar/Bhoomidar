import {
  Phone,
  Mail,
  Globe,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Handshake,
  Building2,
  Smile,
  BadgeIndianRupee,
  Sprout,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Users,
  Ruler,
  Trees,
  Home,
  BedDouble,
  Sparkles,
  Gem,
  Landmark,
  Briefcase,
  Watch,
  Smartphone,
  Laptop,
  Bike,
  Wallet,
  Gift,
  FileText,
  Percent,
  Wheat,
  Store,
  LandPlot,
  Castle,
  Car,
  CarFront,
  Coins,
} from "lucide-react";

// The public website, for customers. Partners have their own page: /opportunities.
export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// Top menu of the public website: the pages above plus one link to the partner page.
// (The footer uses navLinks only.)
export const siteNavLinks = [...navLinks, { label: "Partners", href: "/opportunities" }];

export const contactInfo = [
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
  },
  {
    icon: Mail,
    title: "Email Us",
    value: "info@bhoomidar.com",
    href: "mailto:info@bhoomidar.com",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "Your Address, City, State",
    href: "#",
  },
  {
    icon: Globe,
    title: "Website",
    value: "www.bhoomidar.com",
    href: "https://www.bhoomidar.com",
  },
];

export const faqs = [
  {
    q: "How do I become a partner?",
    a: "Registration is free. Create your account, activate your partner ID once with ₹10,000, and you can start right away.",
  },
  {
    q: "Can I see a property before I decide?",
    a: "Yes. We help you from the first site visit all the way to registration.",
  },
  {
    q: "Are the property papers checked?",
    a: "Yes. All papers are checked and clear before a property is listed.",
  },
  {
    q: "How much do partners earn?",
    a: "There are five ways to earn: a partnership bonus (1% of the company sales, shared by all active partners), a sales bonus of 2% to 4% on every sale, a monthly bonus for 12 months, lifetime rewards for every rank, and a 1% C.T.O. bonus for Vice Presidents.",
  },
];

export const heroStats = [
  { icon: Building2, value: "100+", label: "Top Locations" },
  { icon: Smile, value: "5000+", label: "Happy Investors" },
  { icon: BadgeIndianRupee, value: "Clear", label: "Earnings" },
  { icon: Sprout, value: "Long Term", label: "Growth" },
];

export const propertyTabs = [
  { label: "Residential", icon: Home },
  { label: "Commercial", icon: Building2 },
  { label: "Farm Land", icon: Wheat },
  { label: "Plots", icon: LandPlot },
  { label: "Villas", icon: Castle },
];

export const properties = [
  {
    title: "Residential Plots",
    category: "Residential",
    categoryIcon: Home,
    image: "/images/plots.png",
    badge: null,
    details: [
      { icon: MapPin, text: "Lucknow, Uttar Pradesh" },
      { icon: Ruler, text: "1200 - 2400 Sq. Yards" },
      { icon: ShieldCheck, text: "Gated Community" },
      { icon: Trees, text: "Wide Roads & Parks" },
    ],
    price: "₹18,00,000",
    unit: "Starting price",
  },
  {
    title: "Premium Villas",
    category: "Villa",
    categoryIcon: Castle,
    image: "/images/villa.png",
    badge: "New Launch",
    details: [
      { icon: MapPin, text: "Noida, Uttar Pradesh" },
      { icon: BedDouble, text: "3 & 4 BHK" },
      { icon: Sparkles, text: "Modern Facilities" },
      { icon: Gem, text: "Best Location" },
    ],
    price: "₹1.25 Cr",
    unit: "Starting price",
  },
  {
    title: "Farm Land",
    category: "Farm Land",
    categoryIcon: Wheat,
    image: "/images/farm.png",
    badge: null,
    details: [
      { icon: MapPin, text: "Sanand, Gujarat" },
      { icon: Ruler, text: "5 - 50 Acres" },
      { icon: TrendingUp, text: "Fast Growing Area" },
      { icon: Landmark, text: "Best for Investment" },
    ],
    price: "₹12,00,000",
    unit: "Per Acre",
  },
  {
    title: "Commercial Plots",
    category: "Commercial",
    categoryIcon: Building2,
    image: "/images/commercial.png",
    badge: "Hot Deal",
    details: [
      { icon: MapPin, text: "Yamuna Expressway" },
      { icon: Ruler, text: "500 - 5000 Sq. Yards" },
      { icon: Store, text: "Business Area" },
      { icon: TrendingUp, text: "Good Returns" },
    ],
    price: "₹45,00,000",
    unit: "Starting price",
  },
];

export const whyChoose = [
  {
    icon: ShieldCheck,
    title: "Verified Properties",
    text: "All papers are checked and clear.",
  },
  {
    icon: MapPin,
    title: "Best Locations",
    text: "Fast growing areas with high demand.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "Good Returns",
    text: "Smart ways to grow your money.",
  },
  {
    icon: Users,
    title: "Full Support",
    text: "Help from site visit to registration.",
  },
];

export const investPoints = [
  "Good Returns",
  "Safe Investment",
  "Growing Areas",
  "Trusted Brand",
];

export const partnerBenefits = [
  {
    icon: ClipboardList,
    title: "ID Activation",
    value: "₹10,000/-",
    text: "Registration is free. Activate your partner ID once and start earning.",
  },
  {
    icon: Handshake,
    title: "Partnership Bonus",
    value: "Profit Sharing",
    text: "A share of the company's sales every month, divided among all active partners.",
  },
  {
    icon: Users,
    title: "Sales Bonus",
    value: "On every sale",
    text: "A bonus on every sale by you and your team, based on your rank.",
  },
  {
    icon: Gift,
    title: "Monthly Bonus",
    value: "Every month",
    text: "A part of every sale by you and your team, paid to you month by month.",
  },
];

// The partner rank chart. Keep it in step with the printed plan.
//   area: eligibility in sq. yards   commission: personal sales commission (PS)
//   example: sample of that commission   team: team sales defence (TSD) rate
//   teamExample: sample of the TSD   monthly: 2% self + 0.25% for each of 8 levels, over 12 months
export const ranks = [
  {
    title: "Sales Partner",
    area: "0 - 499 Sq. Yards",
    commission: "2%",
    example: "10L BV x 2% = 20,000 Rs",
    team: "0%",
    teamExample: "",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "Starter Kit",
    icon: Briefcase,
  },
  {
    title: "Sales Associate",
    area: "500 Sq. Yards",
    commission: "2.25%",
    example: "10L BV x 2.25% = 22,500 Rs",
    team: "0.25%",
    teamExample: "10L BV x 0.25% = 2,500 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "Smart Watch",
    icon: Watch,
  },
  {
    title: "Sales Executive",
    area: "1,000 Sq. Yards",
    commission: "2.5%",
    example: "10L BV x 2.5% = 25,000 Rs",
    team: "0.25% to 0.50%",
    teamExample: "10L BV x 0.5% = 5,000 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "Smart Phone",
    icon: Smartphone,
  },
  {
    title: "Senior Sales Executive",
    area: "2,000 Sq. Yards",
    commission: "2.75%",
    example: "10L BV x 2.75% = 27,500 Rs",
    team: "0.25% to 0.75%",
    teamExample: "10L BV x 0.75% = 7,500 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "Laptop",
    icon: Laptop,
  },
  {
    title: "Relationship Manager",
    area: "4,000 Sq. Yards",
    commission: "3%",
    example: "10L BV x 3% = 30,000 Rs",
    team: "0.25% to 1%",
    teamExample: "10L BV x 1% = 10,000 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "Activa Scooter",
    icon: Bike,
  },
  {
    title: "Senior Relationship Manager",
    area: "8,000 Sq. Yards",
    commission: "3.25%",
    example: "10L BV x 3.25% = 32,500 Rs",
    team: "0.25% to 1.25%",
    teamExample: "10L BV x 1.25% = 12,500 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "10g Gold",
    icon: Coins,
  },
  {
    title: "Area Sales Manager",
    area: "16,000 Sq. Yards",
    commission: "3.5%",
    example: "10L BV x 3.5% = 35,000 Rs",
    team: "0.25% to 1.5%",
    teamExample: "10L BV x 1.5% = 15,000 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "WagonR",
    icon: Car,
  },
  {
    title: "Regional Sales Manager",
    area: "32,000 Sq. Yards",
    commission: "3.75%",
    example: "10L BV x 3.75% = 37,500 Rs",
    team: "0.25% to 1.75%",
    teamExample: "10L BV x 1.75% = 17,500 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "Scorpio N",
    icon: CarFront,
  },
  {
    title: "Vice President - Sales",
    area: "64,000 Sq. Yards",
    commission: "4%",
    example: "10L BV x 4% = 40,000 Rs",
    team: "0.25% to 2%",
    teamExample: "10L BV x 2% = 20,000 Rs",
    monthly: "2% self + 0.25% x 8 levels",
    monthlyTotal: "Paid over 12 months",
    reward: "House",
    icon: Home,
  },
];

// Badge / reward colour of each rank, in the order of `ranks` (as on the printed chart).
export const rankTiers = [
  "from-[#f3c552] to-[#c98a12]",
  "from-[#2f9e83] to-[#176650]",
  "from-[#e0533d] to-[#a82a1c]",
  "from-[#3b82f6] to-[#1e4fa8]",
  "from-[#9b5de5] to-[#5f2aa8]",
  "from-[#3a6fd8] to-[#27418f]",
  "from-[#e0533d] to-[#a82a1c]",
  "from-[#3b82f6] to-[#1e4fa8]",
  "from-[#f3c552] to-[#8e4bd1]",
];

// Notes printed under the rank chart.
export const rankNotes = [
  "C.T.O. Bonus 1% for partners who reach Vice President - Sales.",
  "Reward condition 50:50: the power leg counts for at most half, the rest comes from the weaker legs.",
];

export const testimonials = [
  {
    name: "Amit Sharma",
    role: "Sales Partner",
    text: "Bhoomidar has given me more than income. It gave me a chance to grow for the long term. The team is very helpful.",
  },
  {
    name: "Priya Verma",
    role: "Relationship Manager",
    text: "The clear system and great rewards keep me motivated to do more. Highly recommended!",
  },
  {
    name: "Rahul Mehta",
    role: "Regional Sales Manager",
    text: "Great platform with real opportunities. My income and my confidence have both grown.",
  },
  {
    name: "Sneha Gupta",
    role: "Sales Executive",
    text: "From the first site visit to registration, everything was clear and well explained. My clients trust Bhoomidar.",
  },
  {
    name: "Vikram Singh",
    role: "Senior Sales Executive",
    text: "The rewards for each rank keep the whole team motivated. I reached my targets faster than I expected.",
  },
  {
    name: "Neha Kapoor",
    role: "Investor & Partner",
    text: "I bought a plot first and then joined as a partner. Both were smooth and easy to understand.",
  },
];

export const quickLinks = navLinks;
