import RewardZoom from "@/components/RewardZoom";
import { rewardIcon } from "@/lib/rankIcons";

// The picture of a rank's reward: the photo the admin uploaded, or, without one, a small
// icon that fits the reward. Fills the box it sits in (the box sets size and shape).
// Tapping a photo shows it big; pass zoom={false} when the box around it already does that.
export default function RewardPic({ image, icon, alt = "", iconClassName = "h-5 w-5", strokeWidth = 1.7, zoom = true }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    const photo = <img src={image} alt={alt} loading="lazy" className="h-full w-full bg-white object-contain" />; // whole photo, never cropped
    if (!zoom) return photo;
    return (
      <RewardZoom image={image} alt={alt} className="block h-full w-full">
        {photo}
      </RewardZoom>
    );
  }
  const Icon = rewardIcon(icon);
  return <Icon className={iconClassName} strokeWidth={strokeWidth} aria-hidden />;
}
