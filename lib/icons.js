import {
  BedDouble,
  Building,
  Building2,
  Car,
  Castle,
  Dumbbell,
  Droplet,
  Fence,
  Factory,
  Gem,
  Home,
  Hospital,
  Hotel,
  Lamp,
  LandPlot,
  Landmark,
  Leaf,
  MapPin,
  Mountain,
  ParkingCircle,
  Route,
  Ruler,
  School,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  Tent,
  Tractor,
  TreePine,
  TrendingUp,
  Trees,
  Warehouse,
  Waves,
  Wheat,
  Wifi,
} from "lucide-react";

// Icons an admin can pick for a property detail line.
export const DETAIL_ICONS = {
  MapPin,
  Ruler,
  ShieldCheck,
  Trees,
  BedDouble,
  Sparkles,
  Gem,
  TrendingUp,
  Landmark,
  Store,
  Home,
  Building2,
};

// Icons an admin can pick for a property type (Admin > Properties > Types).
export const CATEGORY_ICON_CHOICES = {
  Home,
  Building2,
  Building,
  Castle,
  Hotel,
  Warehouse,
  Factory,
  Store,
  Landmark,
  LandPlot,
  Wheat,
  Tractor,
  Sprout,
  Trees,
  TreePine,
  Mountain,
  Tent,
};

// The types the site starts with. They are only used until the database has its own list.
export const DEFAULT_CATEGORIES = [
  { name: "Residential", label: "", icon: "Home" },
  { name: "Villa", label: "Villas", icon: "Castle" },
  { name: "Farm Land", label: "", icon: "Wheat" },
  { name: "Commercial", label: "", icon: "Building2" },
];

// The picture of a type, by its icon name.
export const categoryIconOf = (name) => CATEGORY_ICON_CHOICES[name] ?? Home;

// The icon of a property's type. getProperties() adds `category_icon` to each property.
export function categoryIcon(p) {
  return (
    CATEGORY_ICON_CHOICES[p.category_icon] ??
    categoryIconOf(DEFAULT_CATEGORIES.find((c) => c.name === p.category)?.icon)
  );
}

// Filter tabs built from the properties that are really in the database, so a
// tab never shows for a type that has no property. The types come in the order
// the admin set; a type found only on a property (not in the list) follows.
// `categories`: [{ name, label, icon }]
export function categoryTabs(properties, categories = DEFAULT_CATEGORIES) {
  const found = [...new Set(properties.map((p) => p.category).filter(Boolean))];
  const listed = categories.map((c) => c.name);
  const ordered = [
    ...listed.filter((name) => found.includes(name)),
    ...found.filter((name) => !listed.includes(name)),
  ];
  return ordered.map((name) => {
    const cat = categories.find((c) => c.name === name);
    return {
      id: name,
      label: cat?.label || name,
      icon: categoryIconOf(cat?.icon),
      count: properties.filter((p) => p.category === name).length,
    };
  });
}

// A picture for a facility, chosen from its name ("Street lights" -> a lamp).
// The first matching rule wins; anything else gets a sparkle.
const AMENITY_ICONS = [
  [/access|car\b|drive/, Car],
  [/green|nature|surround|garden|farm|orchard/, Leaf],
  [/road|street|highway|expressway/, Route],
  [/light|lamp|electric|power/, Lamp],
  [/drain|sewer|sewage|pool|swim/, Waves],
  [/water|supply|borewell|well|irrigation/, Droplet],
  [/secur|gated|cctv|guard|boundary|wall|fenc/, Fence],
  [/safe|clear|paper|legal/, ShieldCheck],
  [/gym|fitness|sport|play|club/, Dumbbell],
  [/school|college|educat/, School],
  [/hospital|clinic|medical|health/, Hospital],
  [/market|shop|mall|store|retail/, Store],
  [/wifi|internet|fibre|fiber/, Wifi],
  [/parking/, ParkingCircle],
  [/park|tree|plant/, Trees],
];

export function amenityIcon(name = "") {
  const text = String(name).toLowerCase();
  return AMENITY_ICONS.find(([re]) => re.test(text))?.[1] ?? Sparkles;
}
