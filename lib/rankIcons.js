import {
  Award,
  Banknote,
  Bike,
  Briefcase,
  Camera,
  Car,
  CarFront,
  Coins,
  Crown,
  Gem,
  Gift,
  Headphones,
  Home,
  Laptop,
  Medal,
  Plane,
  Shirt,
  Smartphone,
  Star,
  Ticket,
  Trophy,
  Tv,
  Watch,
} from "lucide-react";

// The pictures an admin can pick for a rank's reward (Admin > Commission Plan).
// Safe to import in the browser: it only holds icons.
export const REWARD_ICONS = {
  Briefcase,
  Watch,
  Smartphone,
  Laptop,
  Bike,
  Coins,
  Car,
  CarFront,
  Home,
  Gift,
  Gem,
  Crown,
  Trophy,
  Star,
  Medal,
  Award,
  Plane,
  Tv,
  Camera,
  Headphones,
  Banknote,
  Ticket,
  Shirt,
};

export const REWARD_ICON_NAMES = Object.keys(REWARD_ICONS);

// A reward's icon by its saved name; a gift when the name is not one we know.
export const rewardIcon = (name) => REWARD_ICONS[name] ?? Gift;
