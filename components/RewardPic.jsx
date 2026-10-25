import { rewardIcon } from "@/lib/rankIcons";

// The picture of a rank's reward: the photo the admin uploaded, or, without one, a small
// icon that fits the reward. Fills the box it sits in (the box sets size and shape).
export default function RewardPic({ image, icon, alt = "", iconClassName = "h-5 w-5", strokeWidth = 1.7 }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={alt} loading="lazy" className="h-full w-full object-cover" />;
  }
  const Icon = rewardIcon(icon);
  return <Icon className={iconClassName} strokeWidth={strokeWidth} aria-hidden />;
}
