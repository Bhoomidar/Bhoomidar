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

// A picture that fits what the admin typed as the reward ("Smart Watch" -> a watch),
// or "" when nothing fits. The admin can still pick any picture by hand.
const KEYWORDS = [
  [/watch/i, "Watch"],
  [/phone|mobile|iphone/i, "Smartphone"],
  [/laptop|notebook|macbook|computer/i, "Laptop"],
  [/scooter|scooty|activa|bike|motorcycle|moped/i, "Bike"],
  [/scorpio|suv|thar|fortuner|innova|xuv|creta|jeep/i, "CarFront"],
  [/\bcar\b|wagon|swift|alto|baleno|sedan|hatchback|\bi20\b/i, "Car"],
  [/\bhouse\b|\bhome\b|\bflat\b|villa|\bplot\b|apartment|property|bungalow/i, "Home"],
  [/gold|silver|coin|bullion/i, "Coins"],
  [/diamond|jewel|\bgems?\b|\bring\b|necklace/i, "Gem"],
  [/\btrip\b|\btour\b|travel|flight|vacation|holiday|\bgoa\b|dubai|\bbali\b|thailand|abroad/i, "Plane"],
  [/\btv\b|television/i, "Tv"],
  [/camera/i, "Camera"],
  [/headphone|earbud|earphone|airpod|\bspeaker\b/i, "Headphones"],
  [/cash|money|rupee|bonus|cheque/i, "Banknote"],
  [/ticket/i, "Ticket"],
  [/shirt|jacket|blazer|uniform/i, "Shirt"],
  [/trophy|shield/i, "Trophy"],
  [/crown/i, "Crown"],
  [/medal/i, "Medal"],
  [/award|certificate/i, "Award"],
  [/\bstars?\b/i, "Star"],
  [/\bkit\b|\bbag\b|briefcase/i, "Briefcase"],
  [/gift|voucher|hamper|coupon/i, "Gift"],
];

export function iconForReward(text) {
  const t = String(text ?? "");
  for (const [re, name] of KEYWORDS) if (re.test(t)) return name;
  return "";
}
