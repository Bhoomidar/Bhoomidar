import {
  BedDouble,
  Building2,
  Castle,
  Gem,
  Home,
  Landmark,
  MapPin,
  Ruler,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Trees,
  Wheat,
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

export const CATEGORY_ICONS = {
  Residential: Home,
  Villa: Castle,
  "Farm Land": Wheat,
  Commercial: Building2,
};

export const CATEGORIES = Object.keys(CATEGORY_ICONS);
