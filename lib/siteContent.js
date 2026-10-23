// Every piece of site text and every image the admin can change.
// Each field: { key, label, type, default }. The defaults are what the site
// shows until the admin saves something different.
//   type: "text" (default) | "textarea" | "image" | "range" | "toggle"
//   extra: hint (help text), range -> { min, max, unit }, image -> { phone, optional }
//   Toggles store "1" (shown) or "0" (hidden); ranges store the number as text.

const f = (key, label, def, type = "text", extra = {}) => ({
  key,
  label,
  type,
  default: def,
  ...extra,
});

const toggle = (key, label, hint) => f(key, label, "1", "toggle", { hint });

// Laptop + phone banner for a page: photo, focus point and extra darkness for
// each. Pair with bannerProps(c, prefix) in the page. Keys: <p>_image,
// <p>_image_pos_x/y, <p>_overlay, <p>_image_mobile, <p>_image_mobile_pos_x/y,
// <p>_overlay_mobile.
const bannerFields = (p, defImage, { x = "50", mx = "50" } = {}) => {
  const focus = { min: 0, max: 100, unit: "%" };
  const dark = {
    min: 0,
    max: 80,
    unit: "%",
    hint: "Raise this if the heading is hard to read on a bright photo. 0 = no extra darkness.",
  };
  return [
    f(`${p}_image`, "Laptop banner", defImage, "image", {
      hint: "Wide photo, about 1920 x 1080. Shown on laptops, desktops and tablets in landscape.",
    }),
    f(`${p}_image_pos_x`, "Laptop - photo focus, left to right", x, "range", {
      ...focus,
      hint: "Which part of the photo stays in view when the screen is narrower than the photo.",
    }),
    f(`${p}_image_pos_y`, "Laptop - photo focus, top to bottom", "50", "range", focus),
    f(`${p}_overlay`, "Laptop - extra darkness", "0", "range", dark),
    f(`${p}_image_mobile`, "Phone banner (optional)", "", "image", {
      phone: true,
      optional: true,
      hint: "Tall photo, about 1080 x 1920. Shown on phones only. Leave empty to use the laptop banner.",
    }),
    f(`${p}_image_mobile_pos_x`, "Phone - photo focus, left to right", mx, "range", focus),
    f(`${p}_image_mobile_pos_y`, "Phone - photo focus, top to bottom", "50", "range", focus),
    f(`${p}_overlay_mobile`, "Phone - extra darkness", "0", "range", dark),
  ];
};

// Repeated groups: group(4, (n) => [ ...fields ]) -> fields for items 1..4
const group = (count, make) =>
  Array.from({ length: count }, (_, i) => make(i + 1)).flat();

/* ───────────────────────────── HOME ───────────────────────────── */

export const HOME_TABS = [
  {
    id: "hero",
    label: "Hero",
    fields: [
      f("hero_badge", "Small badge text", "Real Estate Partner Network"),
      f("hero_title_1", "Heading - line 1", "Invest Today"),
      f("hero_title_2", "Heading - line 2 (orange)", "Build a Brighter"),
      f("hero_title_3", "Heading - line 3 (orange)", "Tomorrow"),
      f("hero_lead", "Big text under the heading", "Great properties. Clear deals.\nRewarding partnership.", "textarea"),
      f("hero_text", "Small text", "Join Bhoomidar, a trusted real estate network. Invest in good land and earn rewards as our partner.", "textarea"),
      f("hero_btn1", "Button 1 text", "Explore Properties", "text", { hint: "Leave empty to hide the button." }),
      f("hero_btn1_link", "Button 1 link", "#properties", "text", { hint: "A page like /properties, a section like #properties, or a full https:// link." }),
      f("hero_btn2", "Button 2 text", "Join as Partner", "text", { hint: "Leave empty to hide the button." }),
      f("hero_btn2_link", "Button 2 link", "/register"),
      f("hero_tagline", "Handwritten text (top right)", "Trusted Land,\nBrighter Tomorrow", "textarea"),
      f("hero_card1_label", "Floating card - line 1 label", "Featured Location"),
      f("hero_card1_value", "Floating card - line 1 value", "Noida, Uttar Pradesh"),
      f("hero_card2_label", "Floating card - line 2 label", "Premium Villas"),
      f("hero_card2_value", "Floating card - line 2 value", "Starting from ₹1.25 Cr"),
      ...[
        ["100+", "Top Locations"],
        ["5000+", "Happy Investors"],
        ["Clear", "Earnings"],
        ["Long Term", "Growth"],
      ].flatMap(([v, l], i) => [
        f(`hero_stat${i + 1}_value`, `Stat ${i + 1} - big text`, v),
        f(`hero_stat${i + 1}_label`, `Stat ${i + 1} - small text`, l),
      ]),
    ],
  },
  {
    id: "hero_banner",
    label: "Hero Banners",
    note: "Laptop and phone have their own banner. The phone banner is optional: if you leave it empty, phones show the laptop photo as a band across the page.",
    fields: [
      f("hero_image", "Laptop banner", "/images/hero.png", "image", {
        hint: "Wide photo, about 1920 x 1080. Shown on laptops, desktops and tablets in landscape.",
      }),
      f("hero_image_pos_x", "Laptop - photo focus, left to right", "100", "range", {
        min: 0, max: 100, unit: "%",
        hint: "Which part of the photo stays in view when the screen is narrower than the photo.",
      }),
      f("hero_image_pos_y", "Laptop - photo focus, top to bottom", "50", "range", { min: 0, max: 100, unit: "%" }),
      f("hero_overlay", "Laptop - extra darkness", "0", "range", {
        min: 0, max: 80, unit: "%",
        hint: "Raise this if the heading is hard to read on a bright photo. 0 = no extra darkness.",
      }),
      f("hero_image_mobile", "Phone banner (optional)", "", "image", {
        phone: true,
        optional: true,
        hint: "Tall photo, about 1080 x 1920. Shown on phones only.",
      }),
      f("hero_image_mobile_pos_x", "Phone - photo focus, left to right", "78", "range", {
        min: 0, max: 100, unit: "%",
        hint: "Applies to the phone banner, or to the laptop photo when no phone banner is set.",
      }),
      f("hero_image_mobile_pos_y", "Phone - photo focus, top to bottom", "50", "range", { min: 0, max: 100, unit: "%" }),
      f("hero_overlay_mobile", "Phone - extra darkness", "0", "range", {
        min: 0, max: 80, unit: "%",
        hint: "Raise this if the heading is hard to read on a bright photo. 0 = no extra darkness.",
      }),
    ],
  },
  {
    id: "visibility",
    label: "Show / Hide",
    note: "Switch off anything you do not want on the home page. Your text and images are kept, so you can switch it back on later.",
    fields: [
      toggle("hero_show_badge", "Hero - small badge"),
      toggle("hero_show_tagline", "Hero - handwritten text (laptop only)"),
      toggle("hero_show_card", "Hero - floating card"),
      toggle("hero_show_stats", "Hero - four numbers row"),
      toggle("show_properties", "Section - Properties"),
      toggle("show_why", "Section - Why Choose Us"),
      toggle("show_partner", "Section - Partner Program"),
      toggle("show_testimonials", "Section - Testimonials"),
      toggle("show_cta", "Section - Bottom Banner"),
    ],
  },
  {
    id: "properties",
    label: "Properties Section",
    note: "The property cards themselves are managed on the Properties page.",
    fields: [
      f("props_label", "Small label", "Featured Properties"),
      f("props_title_1", "Heading - line 1", "Explore Our"),
      f("props_title_2", "Heading - line 2", "Premium"),
      f("props_title_accent", "Heading - orange word", "Properties"),
      f("props_text", "Text under the heading", "Choose from land and property in the best locations. A safe choice for your future.", "textarea"),
      f("props_button", "Button text", "View All Properties"),
    ],
  },
  {
    id: "why",
    label: "Why Choose Us",
    fields: [
      f("why_label", "Small label", "Why Choose Bhoomidar"),
      f("why_title_1", "Heading - line 1", "More Than"),
      f("why_title_2", "Heading - line 2", "Just"),
      f("why_title_accent", "Heading - orange word", "Properties"),
      f("why_text", "Text", "We have real estate experience and a strong partner network. Together, we help investors and partners grow their money over time.", "textarea"),
      f("why_button", "Button text", "Know More"),
      ...[
        ["Verified Properties", "All papers are checked and clear."],
        ["Best Locations", "Fast growing areas with high demand."],
        ["Good Returns", "Smart ways to grow your money."],
        ["Full Support", "Help from site visit to registration."],
      ].flatMap(([t, d], i) => [
        f(`why${i + 1}_title`, `Card ${i + 1} - title`, t),
        f(`why${i + 1}_text`, `Card ${i + 1} - text`, d),
      ]),
    ],
  },
  {
    id: "partner",
    label: "Partner Program",
    fields: [
      f("partner_image", "Left side image", "/images/partner.png", "image"),
      f("partner_card_label", "Dark card - small label", "For a Better Tomorrow"),
      f("partner_card_1", "Dark card heading - line 1", "Invest In"),
      f("partner_card_2", "Dark card heading - line 2", "Land, Grow"),
      f("partner_card_accent", "Dark card heading - orange line", "Your Wealth"),
      f("partner_points", "Dark card tick points (one per line)", "Good Returns\nSafe Investment\nGrowing Areas\nTrusted Brand", "textarea"),
      f("partner_label", "Small label", "Partner Program"),
      f("partner_title_1", "Heading - line 1", "Turn Your Network"),
      f("partner_title_2", "Heading - line 2", "Into"),
      f("partner_title_accent", "Heading - orange word", "Opportunities"),
      f("partner_text", "Text", "Join the Bhoomidar partner network. Earn good commission with clear rules and great rewards.", "textarea"),
      f("partner_button", "Button text", "Join as Partner"),
      ...[
        ["Registration Fee", "₹10,000/-", "Pay once to join and get started."],
        ["Partner Bonus", "1%", "Earn 1% C.T.O. bonus as an active partner (max 48 months)."],
        ["Sales Commission", "2% – 4%", "Earn commission on every sale, based on your rank."],
        ["Monthly Rewards", "Upto 4%", "Gifts like gadgets, vehicles, gold and more."],
      ].flatMap(([t, v, d], i) => [
        f(`benefit${i + 1}_title`, `Benefit ${i + 1} - title`, t),
        f(`benefit${i + 1}_value`, `Benefit ${i + 1} - big value`, v),
        f(`benefit${i + 1}_text`, `Benefit ${i + 1} - text`, d),
      ]),
    ],
  },
  {
    id: "testimonials",
    label: "Testimonials Section",
    note: "The testimonials themselves are managed on the Testimonials page.",
    fields: [
      f("testi_label", "Small label", "Testimonials"),
      f("testi_title_1", "Heading - start", "What Our"),
      f("testi_title_accent", "Heading - orange word", "Partners"),
      f("testi_title_2", "Heading - end", "Say"),
      f("testi_text", "Text under the heading", "Real stories. Real growth. Real success."),
    ],
  },
  {
    id: "cta",
    label: "Bottom Banner",
    fields: [
      f("cta_image", "Laptop banner", "/images/cta.png", "image", { hint: "Wide photo, about 1920 x 600." }),
      f("cta_image_mobile", "Phone banner (optional)", "", "image", {
        phone: true,
        optional: true,
        hint: "Taller photo for phones. Leave empty to use the laptop banner.",
      }),
      f("cta_title_1", "Heading - line 1", "Be a Part of a"),
      f("cta_title_accent", "Heading - orange line", "Brighter Tomorrow"),
      f("cta_text", "Text", "Join Bhoomidar today. Get access to great property deals and grow your income over time.", "textarea"),
      f("cta_fee_label", "Card - small text", "One Time Registration Fee"),
      f("cta_fee", "Card - big text", "₹10,000/-"),
      f("cta_button", "Card - button text", "Register as Partner"),
    ],
  },
];

/* ───────────────────────────── ABOUT ───────────────────────────── */

export const ABOUT_TABS = [
  {
    id: "banner",
    label: "Top Banner",
    fields: [
      f("about_label", "Small label", "About Us"),
      f("about_title_1", "Heading - line 1", "We Help You Grow"),
      f("about_title_2", "Heading - line 2", "With"),
      f("about_title_accent", "Heading - orange words", "Trusted Land"),
      f("about_text", "Text", "Bhoomidar is a real estate partner network. We make it easy to invest in good land and property.", "textarea"),
    ],
  },
  {
    id: "banner_photos",
    label: "Banner Photos",
    note: "Laptop and phone have their own banner. The phone banner is optional: if you leave it empty, phones use the laptop photo.",
    fields: bannerFields("about", "/images/partner.png"),
  },
  {
    id: "story",
    label: "Who We Are",
    fields: [
      f("story_image", "Image", "/images/plots.png", "image"),
      f("story_badge_value", "Floating card - big text", "5000+"),
      f("story_badge_label", "Floating card - small text", "Happy Investors"),
      f("story_label", "Small label", "Who We Are"),
      f("story_title_1", "Heading", "Real Estate Made"),
      f("story_title_accent", "Heading - orange word", "Simple"),
      f("story_p1", "Paragraph 1", "Bhoomidar helps people invest in good land and property in places that are growing fast.", "textarea"),
      f("story_p2", "Paragraph 2", "We keep things clear. You see the price, the papers and the plan before you decide.", "textarea"),
      f("story_p3", "Paragraph 3", "We also have a partner program. Partners earn commission and rewards when they help others find the right property.", "textarea"),
      f("story_points", "Tick points (one per line)", "Clear prices and clear papers\nGood land in growing places\nHelp from the first visit to registration", "textarea"),
    ],
  },
  {
    id: "numbers",
    label: "Numbers",
    fields: [
      ["100+", "Top Locations"],
      ["5000+", "Happy Investors"],
      ["2% – 4%", "Partner Commission"],
      ["₹10,000", "One-time Partner Fee"],
    ].flatMap(([v, l], i) => [
      f(`num${i + 1}_value`, `Number ${i + 1} - big text`, v),
      f(`num${i + 1}_label`, `Number ${i + 1} - small text`, l),
    ]),
  },
  {
    id: "mission",
    label: "Mission & Vision",
    fields: [
      f("mv_label", "Small label", "What We Stand For"),
      f("mv_title_1", "Heading - start", "Our"),
      f("mv_title_accent", "Heading - orange word", "Mission"),
      f("mv_title_2", "Heading - end", "and Vision"),
      f("mission_title", "Mission card - title", "Our Mission"),
      f("mission_text", "Mission card - text", "To make land investment simple, safe and clear for everyone.", "textarea"),
      f("vision_title", "Vision card - title", "Our Vision"),
      f("vision_text", "Vision card - text", "To be the most trusted name in land and property, and to help every partner grow.", "textarea"),
    ],
  },
  {
    id: "values",
    label: "Our Values",
    fields: [
      f("values_label", "Small label", "Our Values"),
      f("values_title_1", "Heading - start", "What We"),
      f("values_title_accent", "Heading - orange words", "Believe In"),
      ...[
        ["Be Honest", "We tell you the full story about every property."],
        ["Be Clear", "Simple words, simple steps, and no confusion."],
        ["Grow Together", "When our partners and investors grow, we grow too."],
        ["Think Long Term", "Good land gives good returns over the years."],
      ].flatMap(([t, d], i) => [
        f(`value${i + 1}_title`, `Value ${i + 1} - title`, t),
        f(`value${i + 1}_text`, `Value ${i + 1} - text`, d),
      ]),
    ],
  },
  {
    id: "steps",
    label: "How It Works",
    fields: [
      f("steps_label", "Small label", "How It Works"),
      f("steps_title_1", "Heading - start", "Four Easy"),
      f("steps_title_accent", "Heading - orange word", "Steps"),
      f("steps_text", "Text under the heading", "From your first visit to registration, we are with you."),
      ...[
        ["Choose", "Pick the land or property you like."],
        ["Visit", "See the place with our team."],
        ["Check", "Look at all the papers with us."],
        ["Register", "Finish the registration with our help."],
      ].flatMap(([t, d], i) => [
        f(`step${i + 1}_title`, `Step ${i + 1} - title`, t),
        f(`step${i + 1}_text`, `Step ${i + 1} - text`, d),
      ]),
    ],
  },
  {
    id: "buttons",
    label: "Bottom Buttons",
    note: "The two buttons under How It Works. Leave a button's text empty to hide it.",
    fields: [
      f("about_btn1", "Button 1 text", "See Properties"),
      f("about_btn1_link", "Button 1 link", "/properties", "text", { hint: "A page like /properties, or a full https:// link." }),
      f("about_btn2", "Button 2 text", "Talk to Us"),
      f("about_btn2_link", "Button 2 link", "/contact"),
    ],
  },
  {
    id: "visibility",
    label: "Show / Hide",
    note: "Switch off anything you do not want on the About page. Your text and images are kept, so you can switch it back on later.",
    fields: [
      toggle("about_show_story", "Section - Who We Are"),
      toggle("about_show_badge", "Who We Are - floating card on the photo"),
      toggle("about_show_numbers", "Section - Numbers"),
      toggle("about_show_mission", "Section - Mission & Vision"),
      toggle("about_show_values", "Section - Our Values"),
      toggle("about_show_steps", "Section - How It Works"),
      toggle("about_show_cta", "Section - Bottom Banner"),
    ],
  },
];

/* ──────────────────────── CONTACT & FOOTER ──────────────────────── */

export const CONTACT_TABS = [
  {
    id: "info",
    label: "Contact Info",
    note: "Shown on the Contact page and in the website footer.",
    fields: [
      f("contact_phone", "Phone number", "+91 98765 43210"),
      f("contact_email", "Email", "info@bhoomidar.com"),
      f("contact_address", "Address", "Your Address, City, State"),
      f("contact_website", "Website", "www.bhoomidar.com"),
    ],
  },
  {
    id: "social",
    label: "Social Links",
    note: "Paste the full link (starting with https://). Use # to keep a link empty.",
    fields: [
      f("social_facebook", "Facebook link", "#"),
      f("social_instagram", "Instagram link", "#"),
      f("social_youtube", "YouTube link", "#"),
      f("social_linkedin", "LinkedIn link", "#"),
    ],
  },
  {
    id: "page",
    label: "Contact Page",
    fields: [
      f("contact_image", "Top banner image", "/images/hero.png", "image"),
      f("contact_label", "Small label", "Contact Us"),
      f("contact_title_1", "Heading - line 1", "We Are Here"),
      f("contact_title_2", "Heading - line 2", "To"),
      f("contact_title_accent", "Heading - orange words", "Help You"),
      f("contact_text", "Text", "Have a question about a property or the partner program? Send us a message or give us a call.", "textarea"),
      f("form_title_1", "Form heading - start", "Send us a"),
      f("form_title_accent", "Form heading - orange word", "message"),
      f("form_text", "Text under the form heading", "Fill in the form and our team will get back to you."),
    ],
  },
  {
    id: "faq",
    label: "FAQs",
    fields: [
      f("faq_label", "Small label", "Quick Answers"),
      f("faq_title_1", "Heading - start", "Common"),
      f("faq_title_accent", "Heading - orange word", "Questions"),
      ...[
        ["How do I become a partner?", "Send us a message or call us. You pay a one-time registration fee of ₹10,000 and you can start right away."],
        ["Can I see a property before I decide?", "Yes. We help you from the first site visit all the way to registration."],
        ["Are the property papers checked?", "Yes. All papers are checked and clear before a property is listed."],
        ["How much do partners earn?", "Partners earn 2% to 4% commission on sales, based on their rank, plus a bonus and monthly rewards."],
      ].flatMap(([q, a], i) => [
        f(`faq${i + 1}_q`, `Question ${i + 1}`, q),
        f(`faq${i + 1}_a`, `Answer ${i + 1}`, a, "textarea"),
      ]),
    ],
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      f("footer_text", "Text under the logo", "Building a brighter tomorrow with trusted land and strong partnerships.", "textarea"),
      f("footer_newsletter", "Newsletter text", "Get the latest property news and partner updates.", "textarea"),
      f("footer_copyright", "Copyright line", "© 2026 Bhoomidar. All rights reserved."),
    ],
  },
];

/* ───────────────────────────── PAYMENT ───────────────────────────── */

// The joining payment shown to a partner whose account is not active yet.
// The bank, UPI and contact fields start empty on purpose: money must never go
// to details nobody typed in. Anything left empty is simply not shown.
export const PAYMENT_TABS = [
  {
    id: "amount",
    label: "Amount",
    note: "What a new partner pays before the account is activated.",
    fields: [
      f("pay_amount", "Joining payment (in rupees)", "10000", "text", {
        hint: "Numbers only, for example 10000.",
      }),
      f(
        "pay_note",
        "Message for the partner",
        "Pay our team and share the payment details. We mark it as received and your account goes live.",
        "textarea",
      ),
    ],
  },
  {
    id: "pay",
    label: "UPI and Bank",
    note: "Where the partner sends the money. Leave a field empty to hide it.",
    fields: [
      f("pay_upi_id", "UPI ID", "", "text", { hint: "For example name@bank" }),
      f("pay_bank_holder", "Account holder name", ""),
      f("pay_bank_name", "Bank name", ""),
      f("pay_bank_account", "Account number", ""),
      f("pay_bank_ifsc", "IFSC code", ""),
      f("pay_bank_branch", "Branch (optional)", ""),
    ],
  },
  {
    id: "team",
    label: "Team Contact",
    note: "Who the partner talks to about the payment. If the phone or email is empty, the one from Contact Info is used.",
    fields: [
      f("pay_contact_name", "Contact person", "", "text", { hint: "For example Rahul, Accounts team" }),
      f("pay_contact_phone", "Phone number", ""),
      f("pay_contact_whatsapp", "WhatsApp number", "", "text", {
        hint: "With country code, for example 919876543210. Empty = use the phone number.",
      }),
      f("pay_contact_email", "Email", ""),
      f("pay_contact_hours", "Available hours", "", "text", { hint: "For example Mon to Sat, 10 AM to 6 PM" }),
    ],
  },
];

/* ───────────────────────────── helpers ───────────────────────────── */

export const ALL_FIELDS = [...HOME_TABS, ...ABOUT_TABS, ...CONTACT_TABS, ...PAYMENT_TABS].flatMap(
  (tab) => tab.fields,
);

export const DEFAULTS = Object.fromEntries(ALL_FIELDS.map((x) => [x.key, x.default]));

// Toggles are stored as "1" / "0"; anything but "0" counts as shown.
export const isOn = (value) => String(value ?? "1") !== "0";

// Range values are stored as text. Falls back to `fallback` for empty / bad input.
export const num = (value, fallback = 0) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

// Props for <PageBanner> from the bannerFields(prefix, ...) settings.
export const bannerProps = (c, p) => ({
  image: c[`${p}_image`],
  imageMobile: c[`${p}_image_mobile`],
  position: `${num(c[`${p}_image_pos_x`], 50)}% ${num(c[`${p}_image_pos_y`], 50)}%`,
  positionMobile: `${num(c[`${p}_image_mobile_pos_x`], 50)}% ${num(c[`${p}_image_mobile_pos_y`], 50)}%`,
  darkness: num(c[`${p}_overlay`], 0) / 100,
  darknessMobile: num(c[`${p}_overlay_mobile`], 0) / 100,
});

// Splits a textarea value into clean, non-empty lines.
export const lines = (text) =>
  String(text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// "+91 98765 43210" -> "+919876543210" for tel: links.
export const phoneHref = (phone) => `tel:${String(phone ?? "").replace(/[^\d+]/g, "")}`;

export { group };
