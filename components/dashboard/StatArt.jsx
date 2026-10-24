// Small illustrations for the background of the dashboard number cards.
// They take their colour from the text colour (currentColor), so a card only
// has to set something like `text-copper`. Each one sits fully inside its box.

const svg = { viewBox: "0 0 120 100", fill: "none", "aria-hidden": true };

// Three partners, the middle one in front.
export function PeopleArt({ className = "" }) {
  return (
    <svg {...svg} className={className}>
      <g fill="currentColor">
        <circle cx="26" cy="42" r="9" opacity="0.22" />
        <path d="M8 88c0-14 7-24 18-24s18 10 18 24Z" opacity="0.22" />
        <circle cx="94" cy="42" r="9" opacity="0.22" />
        <path d="M76 88c0-14 7-24 18-24s18 10 18 24Z" opacity="0.22" />
        <circle cx="60" cy="34" r="13" opacity="0.38" />
        <path d="M34 92c0-20 11-32 26-32s26 12 26 32Z" opacity="0.38" />
      </g>
      <circle cx="60" cy="34" r="13" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
    </svg>
  );
}

// An hourglass with the sand running.
export function HourglassArt({ className = "" }) {
  return (
    <svg {...svg} className={className}>
      <g fill="currentColor">
        <rect x="30" y="6" width="60" height="7" rx="3.5" opacity="0.45" />
        <rect x="30" y="87" width="60" height="7" rx="3.5" opacity="0.45" />
        <path d="M36 15h48c0 22-14 30-24 35 10 5 24 13 24 35H36c0-22 14-30 24-35-10-5-24-13-24-35Z" opacity="0.14" />
        <path d="M42 19h36c-1 13-9 20-18 25-9-5-17-12-18-25Z" opacity="0.4" />
        <rect x="59" y="46" width="2" height="22" rx="1" opacity="0.4" />
        <path d="M43 84c4-11 10-17 17-21 7 4 13 10 17 21Z" opacity="0.4" />
      </g>
      <path
        d="M36 15h48c0 22-14 30-24 35 10 5 24 13 24 35H36c0-22 14-30 24-35-10-5-24-13-24-35Z"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Bars that keep growing, with a rising trend line and an arrow head.
export function BarsArt({ className = "" }) {
  return (
    <svg {...svg} className={className}>
      <g fill="currentColor">
        <rect x="10" y="64" width="19" height="30" rx="5" opacity="0.2" />
        <rect x="36" y="50" width="19" height="44" rx="5" opacity="0.28" />
        <rect x="62" y="34" width="19" height="60" rx="5" opacity="0.36" />
        <rect x="88" y="16" width="19" height="78" rx="5" opacity="0.46" />
      </g>
      <path
        d="M16 52 42 38 68 26 98 8"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 7"
      />
      <path d="M90 7h10v10" stroke="currentColor" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A little team for the "latest referrals" card: five partners under an arch,
// with a few sparkles. Colours are fixed (copper tones), it does not use currentColor.
export function TeamArt({ className = "" }) {
  return (
    <svg viewBox="0 0 160 110" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="team-arch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d9bd" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fbeedd" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="team-main" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d98b52" />
          <stop offset="1" stopColor="#a8531f" />
        </linearGradient>
        <linearGradient id="team-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9b88c" />
          <stop offset="1" stopColor="#d28a58" />
        </linearGradient>
      </defs>
      <path d="M40 104V60a40 40 0 0 1 80 0v44Z" fill="url(#team-arch)" />
      {/* the two at the back */}
      <circle cx="30" cy="62" r="9" fill="#efc9a6" />
      <path d="M12 106c0-16 8-27 18-27s18 11 18 27Z" fill="#efc9a6" />
      <circle cx="130" cy="62" r="9" fill="#efc9a6" />
      <path d="M112 106c0-16 8-27 18-27s18 11 18 27Z" fill="#efc9a6" />
      {/* the two beside the leader */}
      <circle cx="50" cy="56" r="10.5" fill="url(#team-soft)" />
      <path d="M29 106c0-19 9-31 21-31s21 12 21 31Z" fill="url(#team-soft)" />
      <circle cx="110" cy="56" r="10.5" fill="url(#team-soft)" />
      <path d="M89 106c0-19 9-31 21-31s21 12 21 31Z" fill="url(#team-soft)" />
      {/* the leader */}
      <circle cx="80" cy="40" r="13" fill="url(#team-main)" />
      <path d="M54 106c0-23 11-37 26-37s26 14 26 37Z" fill="url(#team-main)" />
      {/* sparkles */}
      <g stroke="#d98b52" strokeWidth="1.6" strokeLinecap="round" opacity="0.8">
        <path d="M140 22v8M136 26h8" />
        <path d="M22 28v6M19 31h6" />
        <path d="M108 6v5M105.5 8.5h5" />
      </g>
    </svg>
  );
}

// A gift box with a bow, soft peach and copper, for the back of "How it works".
export function GiftArt({ className = "" }) {
  return (
    <svg viewBox="0 0 130 100" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="gift-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6cfa9" />
          <stop offset="1" stopColor="#e6a877" />
        </linearGradient>
        <linearGradient id="gift-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3bf91" />
          <stop offset="1" stopColor="#dc9560" />
        </linearGradient>
        <linearGradient id="gift-ribbon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d98b52" />
          <stop offset="1" stopColor="#b5622f" />
        </linearGradient>
      </defs>
      <g opacity="0.85">
        {/* the big box */}
        <rect x="52" y="46" width="68" height="48" rx="6" fill="url(#gift-body)" />
        <rect x="47" y="35" width="78" height="16" rx="5" fill="url(#gift-lid)" />
        <rect x="83" y="35" width="10" height="59" fill="url(#gift-ribbon)" />
        <path d="M88 35C80 10 58 14 66 28c4 7 15 7 22 7Zm0 0c8-25 30-21 22-7-4 7-15 7-22 7Z" fill="url(#gift-ribbon)" />
        <circle cx="88" cy="35" r="5" fill="#a8531f" />
      </g>
      <g stroke="#d98b52" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <path d="M118 12v7M114.5 15.5h7" />
      </g>
    </svg>
  );
}

// A rosette with ribbons, for the "whole team" card.
export function AwardArt({ className = "" }) {
  return (
    <svg viewBox="0 0 100 110" fill="none" aria-hidden className={className}>
      <g fill="currentColor">
        <path d="M34 62 24 104l16-8 10 10 4-42Z" opacity="0.22" />
        <path d="M66 62l10 42-16-8-10 10-4-42Z" opacity="0.22" />
        <circle cx="50" cy="38" r="33" opacity="0.18" />
        <circle cx="50" cy="38" r="24" opacity="0.28" />
      </g>
      <circle cx="50" cy="38" r="33" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2.5" strokeDasharray="3 5" />
      <path
        d="m50 24 4.4 9 9.8 1.4-7.1 6.9 1.7 9.8L50 46.5l-8.8 4.6 1.7-9.8-7.1-6.9 9.8-1.4Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

// A little org chart: one box over two.
export function OrgChartArt({ className = "" }) {
  return (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden className={className}>
      <g fill="currentColor">
        <rect x="42" y="6" width="36" height="26" rx="6" opacity="0.3" />
        <rect x="8" y="64" width="36" height="26" rx="6" opacity="0.22" />
        <rect x="76" y="64" width="36" height="26" rx="6" opacity="0.22" />
      </g>
      <path d="M60 32v16M26 64V48h68v16" stroke="currentColor" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Stacks of coins.
export function CoinsArt({ className = "" }) {
  return (
    <svg viewBox="0 0 120 100" fill="none" aria-hidden className={className}>
      <g fill="currentColor">
        <ellipse cx="38" cy="82" rx="28" ry="9" opacity="0.3" />
        <ellipse cx="38" cy="68" rx="28" ry="9" opacity="0.26" />
        <ellipse cx="38" cy="54" rx="28" ry="9" opacity="0.36" />
        <ellipse cx="86" cy="86" rx="24" ry="8" opacity="0.3" />
        <ellipse cx="86" cy="73" rx="24" ry="8" opacity="0.26" />
        <ellipse cx="86" cy="60" rx="24" ry="8" opacity="0.2" />
        <ellipse cx="86" cy="47" rx="24" ry="8" opacity="0.34" />
      </g>
    </svg>
  );
}

// A pile of gold coins with a big rupee coin in front, for the balance card.
export function CoinPileArt({ className = "" }) {
  const stack = (cx, rx, count, base) =>
    Array.from({ length: count }, (_, i) => {
      const cy = base - i * 11;
      return (
        <g key={`${cx}-${i}`}>
          <path d={`M${cx - rx} ${cy}v10a${rx} 10 0 0 0 ${rx * 2} 0v-10Z`} fill="url(#pile-side)" />
          <ellipse cx={cx} cy={cy} rx={rx} ry="10" fill="url(#pile-top)" />
          <ellipse cx={cx} cy={cy} rx={rx - 6} ry="6" stroke="#c98d2a" strokeOpacity="0.35" strokeWidth="1" />
        </g>
      );
    });

  return (
    <svg viewBox="0 0 200 150" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="pile-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe3a0" />
          <stop offset="1" stopColor="#e5ad45" />
        </linearGradient>
        <linearGradient id="pile-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9a03c" />
          <stop offset="0.5" stopColor="#e9bb5a" />
          <stop offset="1" stopColor="#b9801f" />
        </linearGradient>
        <radialGradient id="pile-face" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#fff0bd" />
          <stop offset="1" stopColor="#dca23a" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="136" rx="92" ry="10" fill="#c98d2a" opacity="0.16" />
      {stack(150, 36, 7, 124)}
      {stack(52, 28, 3, 128)}
      <circle cx="98" cy="100" r="34" fill="#b9801f" opacity="0.5" transform="translate(3 4)" />
      <circle cx="98" cy="100" r="34" fill="url(#pile-face)" />
      <circle cx="98" cy="100" r="27" stroke="#b9801f" strokeOpacity="0.5" strokeWidth="2.5" />
      <text x="98" y="112" textAnchor="middle" fontSize="34" fontWeight="700" fill="#9a6414" fontFamily="Inter, system-ui, sans-serif">
        ₹
      </text>
    </svg>
  );
}

// A clipboard with a report badge, for an empty "where your points came from".
export function ClipboardArt({ className = "" }) {
  return (
    <svg viewBox="0 0 160 150" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="clip-board" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fdeedd" />
          <stop offset="1" stopColor="#f6d9bc" />
        </linearGradient>
        <linearGradient id="clip-badge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d98b52" />
          <stop offset="1" stopColor="#a8531f" />
        </linearGradient>
      </defs>
      <g transform="rotate(7 80 80)">
        <rect x="34" y="22" width="88" height="112" rx="12" fill="url(#clip-board)" stroke="#efc9a3" strokeWidth="2" />
        <rect x="60" y="12" width="36" height="18" rx="7" fill="#e6b183" />
        <rect x="46" y="48" width="64" height="7" rx="3.5" fill="#f2cfae" />
        <rect x="46" y="66" width="50" height="7" rx="3.5" fill="#f2cfae" />
        <rect x="46" y="84" width="58" height="7" rx="3.5" fill="#f2cfae" />
        <rect x="46" y="102" width="40" height="7" rx="3.5" fill="#f2cfae" />
      </g>
      <circle cx="122" cy="112" r="24" fill="url(#clip-badge)" />
      <g fill="#fff">
        <rect x="111" y="116" width="7" height="12" rx="2" />
        <rect x="120.5" y="108" width="7" height="20" rx="2" />
        <rect x="130" y="101" width="7" height="27" rx="2" />
      </g>
    </svg>
  );
}

// Cream gift boxes with gold ribbons, for the monthly bonus card.
export function GiftStackArt({ className = "" }) {
  return (
    <svg viewBox="0 0 160 150" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="gs-box" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f1e4d4" />
        </linearGradient>
        <linearGradient id="gs-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3c565" />
          <stop offset="1" stopColor="#c98d2a" />
        </linearGradient>
        <linearGradient id="gs-kraft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2b27c" />
          <stop offset="1" stopColor="#bf8650" />
        </linearGradient>
      </defs>
      {/* the kraft box on the right */}
      <rect x="104" y="84" width="52" height="58" rx="5" fill="url(#gs-kraft)" />
      <rect x="100" y="76" width="60" height="14" rx="4" fill="#cf9a62" />
      <rect x="126" y="76" width="8" height="66" fill="url(#gs-gold)" />
      {/* the big white box */}
      <rect x="26" y="70" width="80" height="72" rx="6" fill="url(#gs-box)" stroke="#ead9c4" />
      <rect x="20" y="58" width="92" height="18" rx="5" fill="url(#gs-box)" stroke="#ead9c4" />
      <rect x="62" y="58" width="10" height="84" fill="url(#gs-gold)" />
      <path d="M67 58C58 30 34 34 42 48c4 8 16 10 25 10Zm0 0c9-28 33-24 25-10-4 8-16 10-25 10Z" fill="url(#gs-gold)" />
      <circle cx="67" cy="58" r="5.5" fill="#b8791d" />
      {/* the small white box on top */}
      <rect x="64" y="22" width="40" height="30" rx="4" fill="url(#gs-box)" stroke="#ead9c4" />
      <rect x="82" y="22" width="5" height="30" fill="url(#gs-gold)" />
      <path d="M84.5 22c-4-12-16-10-12-3 2 3 8 3 12 3Zm0 0c4-12 16-10 12-3-2 3-8 3-12 3Z" fill="url(#gs-gold)" />
    </svg>
  );
}

// A violet gift box, for the "monthly bonus" example card.
export function VioletGiftArt({ className = "" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="vg-box" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b79bf2" />
          <stop offset="1" stopColor="#7d52d6" />
        </linearGradient>
        <linearGradient id="vg-lid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c7b0f6" />
          <stop offset="1" stopColor="#9168e0" />
        </linearGradient>
        <linearGradient id="vg-rib" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece2ff" />
          <stop offset="1" stopColor="#c9b3f5" />
        </linearGradient>
      </defs>
      <rect x="18" y="46" width="64" height="46" rx="6" fill="url(#vg-box)" />
      <rect x="12" y="34" width="76" height="16" rx="5" fill="url(#vg-lid)" />
      <rect x="45" y="34" width="10" height="58" fill="url(#vg-rib)" />
      <path d="M50 34C42 10 22 14 29 26c4 7 14 8 21 8Zm0 0c8-24 28-20 21-8-4 7-14 8-21 8Z" fill="url(#vg-rib)" />
      <circle cx="50" cy="34" r="5" fill="#a98beb" />
    </svg>
  );
}

// A leafy branch, for the corners of an empty card. Peach tones, fixed colours.
export function LeafArt({ className = "" }) {
  const leaves = [
    [58, 120, -38, 0.55],
    [78, 96, 34, 0.5],
    [50, 86, -42, 0.6],
    [74, 64, 30, 0.5],
    [48, 50, -34, 0.55],
    [66, 28, 18, 0.45],
  ];
  return (
    <svg viewBox="0 0 120 160" fill="none" aria-hidden className={className}>
      <path d="M60 156C58 110 62 70 64 14" stroke="#d98b52" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      {leaves.map(([x, y, r, o], i) => (
        <path
          key={i}
          d="M0 0C10-8 24-8 30 0 24 8 10 8 0 0Z"
          fill="#e3a874"
          opacity={o}
          transform={`translate(${x} ${y}) rotate(${r})`}
        />
      ))}
    </svg>
  );
}

// A small house with two trees and a cloud, for "no sales yet".
export function HouseArt({ className = "" }) {
  return (
    <svg viewBox="0 0 160 110" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id="house-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d7b8" />
          <stop offset="1" stopColor="#ecbf93" />
        </linearGradient>
        <linearGradient id="house-roof" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7a773" />
          <stop offset="1" stopColor="#c9743a" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="102" rx="70" ry="6" fill="#d98b52" opacity="0.14" />
      <path d="M112 30c-6 0-9-5-5-8 1-5 9-6 12-2 6-1 10 6 5 10Z" fill="#f3d9bf" />
      <rect x="50" y="52" width="60" height="46" rx="3" fill="url(#house-wall)" />
      <path d="M44 55 80 22l36 33Z" fill="url(#house-roof)" />
      <rect x="72" y="70" width="16" height="28" rx="2" fill="#c9743a" opacity="0.85" />
      <rect x="56" y="62" width="11" height="11" rx="2" fill="#fff6ea" opacity="0.9" />
      <rect x="93" y="62" width="11" height="11" rx="2" fill="#fff6ea" opacity="0.9" />
      <g>
        <rect x="26" y="70" width="3.5" height="28" rx="1.5" fill="#b87a47" opacity="0.7" />
        <circle cx="27.7" cy="62" r="13" fill="#e9b98f" />
        <circle cx="33" cy="68" r="9" fill="#e0a877" opacity="0.8" />
        <rect x="130" y="76" width="3.5" height="22" rx="1.5" fill="#b87a47" opacity="0.7" />
        <circle cx="131.7" cy="70" r="10" fill="#e9b98f" />
      </g>
    </svg>
  );
}

// A faded skyline with palm trees, for the foot of the login page. It stretches to
// the width it is given and takes its colour from the text colour.
export function SkylineArt({ className = "" }) {
  const palm = (x, h) => (
    <g key={x} transform={`translate(${x} 0)`}>
      <path d={`M0 126C2 ${126 - h * 0.45} 5 ${126 - h * 0.75} 12 ${126 - h}`} stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.28" />
      {[-70, -35, 0, 35, 70, 105].map((r) => (
        <ellipse key={r} cx="12" cy={126 - h - 3} rx="17" ry="4" fill="currentColor" opacity="0.26" transform={`rotate(${r - 90} 12 ${126 - h})`} />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 400 130" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden className={className}>
      <path d="M0 130V104C60 90 120 108 190 96S320 84 400 100V130Z" fill="currentColor" opacity="0.14" />
      <g fill="currentColor" opacity="0.16">
        <rect x="268" y="74" width="26" height="52" rx="2" />
        <rect x="296" y="62" width="30" height="64" rx="2" />
        <rect x="328" y="80" width="24" height="46" rx="2" />
        <rect x="82" y="86" width="30" height="40" rx="2" />
        <rect x="114" y="76" width="24" height="50" rx="2" />
      </g>
      {palm(26, 52)}
      {palm(364, 62)}
      {palm(344, 36)}
    </svg>
  );
}
