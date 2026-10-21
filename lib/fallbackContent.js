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
  { id: "t1", name: "Amit Sharma", role: "Sales Partner", rating: 5, text: "Bhoomidar has given me more than income. It gave me a chance to grow for the long term. The team is very helpful." },
  { id: "t2", name: "Priya Verma", role: "Relationship Manager", rating: 5, text: "The clear system and great rewards keep me motivated to do more. Highly recommended!" },
  { id: "t3", name: "Rahul Mehta", role: "Regional Sales Manager", rating: 5, text: "Great platform with real opportunities. My income and my confidence have both grown." },
];
