// Shown only if the database cannot be reached or the tables are empty.
export const FALLBACK_PROPERTIES = [
  {
    id: "p1",
    title: "Residential Plots",
    category: "Residential",
    image_url: "/images/plots.png",
    badge: null,
    details: [
      { icon: "MapPin", text: "Lucknow, Uttar Pradesh" },
      { icon: "Ruler", text: "1200 - 2400 Sq. Yards" },
      { icon: "ShieldCheck", text: "Gated Community" },
      { icon: "Trees", text: "Wide Roads & Parks" },
    ],
    price: "₹18,00,000",
    unit: "Starting price",
  },
  {
    id: "p2",
    title: "Premium Villas",
    category: "Villa",
    image_url: "/images/villa.png",
    badge: "New Launch",
    details: [
      { icon: "MapPin", text: "Noida, Uttar Pradesh" },
      { icon: "BedDouble", text: "3 & 4 BHK" },
      { icon: "Sparkles", text: "Modern Facilities" },
      { icon: "Gem", text: "Best Location" },
    ],
    price: "₹1.25 Cr",
    unit: "Starting price",
  },
  {
    id: "p3",
    title: "Farm Land",
    category: "Farm Land",
    image_url: "/images/farm.png",
    badge: null,
    details: [
      { icon: "MapPin", text: "Sanand, Gujarat" },
      { icon: "Ruler", text: "5 - 50 Acres" },
      { icon: "TrendingUp", text: "Fast Growing Area" },
      { icon: "Landmark", text: "Best for Investment" },
    ],
    price: "₹12,00,000",
    unit: "Per Acre",
  },
  {
    id: "p4",
    title: "Commercial Plots",
    category: "Commercial",
    image_url: "/images/commercial.png",
    badge: "Hot Deal",
    details: [
      { icon: "MapPin", text: "Yamuna Expressway" },
      { icon: "Ruler", text: "500 - 5000 Sq. Yards" },
      { icon: "Store", text: "Business Area" },
      { icon: "TrendingUp", text: "Good Returns" },
    ],
    price: "₹45,00,000",
    unit: "Starting price",
  },
];

export const FALLBACK_TESTIMONIALS = [
  { id: "t1", name: "Amit Sharma", role: "Plot Buyer, Lucknow", rating: 5, text: "From the first site visit to registration, everything was clear. The team was helpful at every step." },
  { id: "t2", name: "Priya Verma", role: "Villa Owner, Noida", rating: 5, text: "All the papers were checked and explained to me before I decided. I felt safe with my choice. Highly recommended!" },
  { id: "t3", name: "Rahul Mehta", role: "Farm Land Investor", rating: 5, text: "Good land in a fast growing area at a fair price. The team kept me informed till the end." },
];

export const FALLBACK_FAQS = [
  { id: "f1", question: "How do I become a partner?", answer: "Create your account on the Become a Partner page. Our team activates it once your one-time joining payment is received, and then you can start right away." },
  { id: "f2", question: "How much do partners earn?", answer: "Partners earn 2% to 4% commission on sales, based on their rank, plus a monthly bonus and a reward for every rank." },
  { id: "f3", question: "Are the property papers checked?", answer: "Yes. All papers are checked and clear before a property is listed." },
  { id: "f4", question: "Can I see a property before I decide?", answer: "Yes. We help you from the first site visit all the way to registration." },
];
