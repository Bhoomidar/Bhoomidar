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
      f("hero_badge", "Small badge text", "Trusted Real Estate"),
      f("hero_title_1", "Heading - line 1", "Invest Today"),
      f("hero_title_2", "Heading - line 2 (orange)", "Build a Brighter"),
      f("hero_title_3", "Heading - line 3 (orange)", "Tomorrow"),
      f("hero_lead", "Big text under the heading", "Great properties. Clear deals.\nTrusted service.", "textarea"),
      f("hero_text", "Small text", "Bhoomidar helps you find good land and property in fast growing places. Clear prices, clear papers, and help at every step.", "textarea"),
      f("hero_btn1", "Button 1 text", "Explore Properties", "text", { hint: "Leave empty to hide the button." }),
      f("hero_btn1_link", "Button 1 link", "#properties", "text", { hint: "A page like /properties, a section like #properties, or a full https:// link." }),
      f("hero_btn2", "Button 2 text", "Talk to Us", "text", { hint: "Leave empty to hide the button." }),
      f("hero_btn2_link", "Button 2 link", "/contact"),
      f("hero_tagline", "Handwritten text (top right)", "Trusted Land,\nBrighter Tomorrow", "textarea"),
      f("hero_card1_label", "Floating card - line 1 label", "Featured Location"),
      f("hero_card1_value", "Floating card - line 1 value", "Noida, Uttar Pradesh"),
      f("hero_card2_label", "Floating card - line 2 label", "Premium Villas"),
      f("hero_card2_value", "Floating card - line 2 value", "Starting from ₹1.25 Cr"),
      ...[
        ["100+", "Top Locations"],
        ["5000+", "Happy Investors"],
        ["Clear", "Papers"],
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
      toggle("show_props_help", "Properties page - \"Cannot find what you need?\" box"),
      toggle("show_why", "Section - Why Choose Us"),
      toggle("show_testimonials", "Section - Testimonials"),
      toggle("show_home_faq", "Section - Questions (FAQ)"),
      toggle("show_cta", "Section - Bottom Banner"),
    ],
  },
  {
    id: "properties",
    label: "Properties Section",
    note: "The property cards themselves are managed on the Properties page.",
    fields: [
      f("props_hero_image_mobile", "Properties page - phone banner", "/images/propertymobilehero.png", "image", {
        phone: true,
        optional: true,
        hint: "Tall photo, about 850 x 1850: sky on top for the words, the house below. Shown at the top of the Properties page on phones. Clear it to use the Hero phone banner.",
      }),
      f("props_label", "Small label", "Featured Properties"),
      f("props_title_1", "Heading - line 1", "Explore Our"),
      f("props_title_2", "Heading - line 2", "Premium"),
      f("props_title_accent", "Heading - orange word", "Properties"),
      f("props_text", "Text under the heading", "Choose from land and property in the best locations. A safe choice for your future.", "textarea"),
      f("props_button", "Button text", "View All Properties"),
      f("props_help_label", "\"Cannot find\" box - small label", "Still Confused?"),
      f("props_help_title_1", "\"Cannot find\" box - heading", "Cannot find what you"),
      f("props_help_title_accent", "\"Cannot find\" box - orange word", "need?"),
      f("props_help_text", "\"Cannot find\" box - text", "Tell us what you are looking for and our team will help you find it.", "textarea"),
      f("props_help_pt1", "\"Cannot find\" box - point 1", "Get Expert Guidance"),
      f("props_help_pt2", "\"Cannot find\" box - point 2", "Personalized Property Suggestions"),
      f("props_help_pt3", "\"Cannot find\" box - point 3", "Quick & Hassle-Free Support"),
      f("props_help_btn", "\"Cannot find\" box - button text", "Talk to Us", "text", { hint: "Leave empty to hide the button." }),
      f("props_help_link", "\"Cannot find\" box - button link", "/contact"),
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
      f("why_text", "Text", "We have real estate experience and a strong local network. Together, we help investors and families grow their money over time.", "textarea"),
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
    id: "testimonials",
    label: "Testimonials Section",
    note: "The testimonials themselves are managed on the Testimonials page.",
    fields: [
      f("testi_label", "Small label", "Testimonials"),
      f("testi_title_1", "Heading - start", "What Our"),
      f("testi_title_accent", "Heading - orange word", "Customers"),
      f("testi_title_2", "Heading - end", "Say"),
      f("testi_text", "Text under the heading", "Real stories. Real growth. Real success."),
    ],
  },
  {
    id: "home_faq",
    label: "Questions Section (FAQ)",
    note: "The questions and answers themselves are managed on the FAQs page.",
    fields: [
      f("homefaq_image", "Picture at the bottom left", "/images/Faqbg.png", "image", {
        optional: true,
        hint: "Best as a PNG with a transparent background (a house cut out), about 1500 x 1000. Clear it to show no picture.",
      }),
      f("homefaq_label", "Small label", "FAQ"),
      f("homefaq_title_1", "Heading - start", "Questions?"),
      f("homefaq_title_accent", "Heading - orange word", "We Have Answers"),
      f("homefaq_text", "Text under the heading", "Everything you may want to know before you join or buy.", "textarea"),
      f("homefaq_help_title", "Help card - heading", "Still have a question?"),
      f("homefaq_help_text", "Help card - text", "Talk to our team. We are happy to help you from the first call."),
      f("homefaq_help_button", "Help card - button text", "Contact Us"),
    ],
  },
  {
    id: "cta",
    label: "Bottom Banner",
    note: "Shown at the bottom of the Home, About and Properties pages.",
    fields: [
      f("cta_image", "Laptop banner", "/images/cta.png", "image", { hint: "Wide photo, about 1920 x 600." }),
      f("cta_image_mobile", "Phone banner (optional)", "", "image", {
        phone: true,
        optional: true,
        hint: "Taller photo for phones. Leave empty to use the laptop banner.",
      }),
      f("enq_title_1", "Heading - line 1", "Ready to Find Your"),
      f("enq_title_accent", "Heading - orange line", "Perfect Land?"),
      f("enq_text", "Text", "Talk to our team. We will help you from the first site visit all the way to registration.", "textarea"),
      f("enq_card_label", "Card - small text", "Free Site Visit"),
      f("enq_card_value", "Card - big text", "Book Today"),
      f("enq_button", "Card - button text", "Talk to Us"),
    ],
  },
];

/* ─────────────────────────── PARTNER PAGE ─────────────────────────── */

// Only the partner page (/opportunities) uses these. The public website does not.
export const PARTNER_TABS = [
  {
    id: "top",
    label: "Top Banner",
    note: "The top of the partner page: heading, buttons, the three small points under them, and the four boxes on the dark strip at the bottom of the banner.",
    fields: [
      f("partner_label", "Small label", "Partner Opportunities"),
      f("partner_title_1", "Heading - line 1", "Grow Your Income"),
      f("partner_title_2", "Heading - line 2", "With"),
      f("partner_title_accent", "Heading - orange word", "Bhoomidar"),
      f(
        "partner_text",
        "Text",
        "Join our partner program, help people find good land, and earn commission and rewards on every sale. Build long-term growth with a trusted real estate brand.",
        "textarea",
      ),
      f("partner_btn1", "Button 1 text", "Join as Partner", "text", { hint: "Leave empty to hide the button." }),
      f("partner_btn1_link", "Button 1 link", "/register", "text", { hint: "A page like /register, a section like #rewards, or a full https:// link." }),
      f("partner_btn2", "Button 2 text", "Talk to Us", "text", { hint: "Leave empty to hide the button." }),
      f("partner_btn2_link", "Button 2 link", "/contact"),
      ...[
        ["500+", "Active Partners"],
        ["100%", "Transparent Process"],
        ["High", "Commission Rewards"],
      ].flatMap(([v, l], i) => [
        f(`partner_stat${i + 1}_value`, `Small point ${i + 1} - big text`, v),
        f(`partner_stat${i + 1}_label`, `Small point ${i + 1} - small text`, l),
      ]),
      ...[
        ["Trusted Partnership", "Work with a reliable and growing brand."],
        ["Transparent Earnings", "Clear commission structure with no hidden fees."],
        ["Long Term Growth", "Build a sustainable income source."],
        ["Secure Future", "Be a part of a trusted real estate ecosystem."],
      ].flatMap(([t, d], i) => [
        f(`partner_feat${i + 1}_title`, `Strip box ${i + 1} - title`, t),
        f(`partner_feat${i + 1}_text`, `Strip box ${i + 1} - text`, d),
      ]),
    ],
  },
  {
    id: "top_photos",
    label: "Banner Photos",
    note: "Laptop and phone have their own banner. The phone banner is optional: if you leave it empty, phones use the laptop photo.",
    fields: bannerFields("partner", "/images/partner.png"),
  },
  {
    id: "benefits",
    label: "What You Get",
    note: "The four cards under the dark strip.",
    fields: [
      f("partner_get_label", "Small label", "Why Join"),
      f("partner_get_title_1", "Heading - start", "What You"),
      f("partner_get_title_accent", "Heading - orange word", "Get"),
      f("partner_why_text", "Text under the heading", "Attractive earnings, exciting rewards and a long-term growth opportunity with a trusted real estate brand.", "textarea"),
      ...[
        ["Registration Fee", "₹10,000/-", "Pay once to join and get started.", "Get Started", "/register"],
        ["Partner Bonus", "1%", "Earn 1% C.T.O. bonus as an active partner (max 48 months).", "Know More", "#rewards"],
        ["Sales Commission", "2% – 4%", "Earn commission on every sale, based on your rank.", "View Details", "#rewards"],
        ["Monthly Rewards", "Upto 4%", "Gifts like gadgets, vehicles, gold and more.", "Explore Rewards", "#rewards"],
      ].flatMap(([t, v, d, b, l], i) => [
        f(`benefit${i + 1}_title`, `Benefit ${i + 1} - title`, t),
        f(`benefit${i + 1}_value`, `Benefit ${i + 1} - big value`, v),
        f(`benefit${i + 1}_text`, `Benefit ${i + 1} - text`, d),
        f(`benefit${i + 1}_btn`, `Benefit ${i + 1} - button text`, b, "text", { hint: "Leave empty to hide the button." }),
        f(`benefit${i + 1}_link`, `Benefit ${i + 1} - button link`, l, "text", { hint: "#rewards goes down to the rank chart." }),
      ]),
    ],
  },
  {
    id: "ranks",
    label: "Rank & Rewards",
    note: "The words around the rank chart. The chart itself (ranks, percentages, bonus and rewards) follows the commission plan in the system, so it is not edited here.",
    fields: [
      f("partner_rank_label", "Small label", "Partner Rank & Rewards"),
      f("partner_rank_title_1", "Heading - first part", "Grow Higher."),
      f("partner_rank_title_accent", "Heading - orange part", "Earn Bigger."),
      f(
        "partner_rank_text",
        "Text under the heading",
        "The more land you sell, the higher your rank. A higher rank means more commission, a monthly bonus and a bigger reward.",
        "textarea",
      ),
      f("partner_rank_card_title_1", "Small card - line 1", "Higher Rank"),
      f("partner_rank_card_title_2", "Small card - line 2", "Bigger Rewards"),
      f("partner_rank_card_text", "Small card - text", "Build your network. Unlock higher commission and premium rewards.", "textarea"),
      f("partner_rank_cto", "Bonus strip - big text", "C.T.O. Bonus 1%"),
      f(
        "partner_rank_notes",
        "Bonus strip - notes (one per line)",
        "C.T.O. Bonus 1% for an active partner (48 months maximum).\nReward condition: Power 50% BV, Rest 50% BV.",
        "textarea",
      ),
    ],
  },
  {
    id: "start",
    label: "How To Start",
    fields: [
      f("partner_start_label", "Small label", "How To Start"),
      f("partner_start_title_1", "Heading - start", "Three Easy"),
      f("partner_start_title_accent", "Heading - orange word", "Steps"),
      f("partner_start_text", "Text under the heading", "Start your partner journey with Bhoomidar and unlock unlimited earning opportunities.", "textarea"),
      ...[
        ["Register", "Create your partner account. It takes only a few minutes.", "Get Started", "/register"],
        ["Share", "Show our properties to people you know.", "Share Now", "/properties"],
        ["Earn", "Get commission when a sale is done through you.", "Know Earnings", "#rewards"],
      ].flatMap(([t, d, b, l], i) => [
        f(`partner_step${i + 1}_title`, `Step ${i + 1} - title`, t),
        f(`partner_step${i + 1}_text`, `Step ${i + 1} - text`, d),
        f(`partner_step${i + 1}_btn`, `Step ${i + 1} - button text`, b, "text", { hint: "Leave empty to hide the button." }),
        f(`partner_step${i + 1}_link`, `Step ${i + 1} - button link`, l),
      ]),
      f("partner_join_btn", "Big button text", "Join as Partner", "text", { hint: "Leave empty to hide the button." }),
      f("partner_join_link", "Big button link", "/register"),
      f("partner_login_text", "Line under the big button", "Already a partner?"),
      f("partner_login_link_text", "Login link text", "Login here"),
      f("partner_login_link", "Login link", "/login"),
    ],
  },
  {
    id: "cta",
    label: "Bottom Banner",
    note: "The banner at the bottom of the partner page. Its photo is the one set under Home Page > Bottom Banner.",
    fields: [
      f("cta_title_1", "Heading - line 1", "Be a Part of a"),
      f("cta_title_accent", "Heading - orange line", "Brighter Tomorrow"),
      f("cta_text", "Text", "Join Bhoomidar today. Get access to great property deals and grow your income over time.", "textarea"),
      f("cta_fee_label", "Card - small text", "One Time Registration Fee"),
      f("cta_fee", "Card - big text", "₹10,000/-"),
      f("cta_button", "Card - button text", "Register as Partner"),
    ],
  },
  {
    id: "visibility",
    label: "Show / Hide",
    note: "Switch off anything you do not want on the partner page. Your text and images are kept, so you can switch it back on later.",
    fields: [
      toggle("partner_show_trust", "Top banner - three small points"),
      toggle("partner_show_strip", "Dark strip - four boxes"),
      toggle("partner_show_get", "Section - What You Get"),
      toggle("partner_show_ranks", "Section - Rank & Rewards chart"),
      toggle("partner_show_start", "Section - How To Start"),
      toggle("partner_show_cta", "Section - Bottom Banner"),
    ],
  },
  {
    id: "seo",
    label: "Browser Title",
    note: "What shows on the browser tab and in Google for this page.",
    fields: [
      f("partner_seo_title", "Page title", "Partner Opportunities | Bhoomidar"),
      f("partner_seo_text", "Short description", "Join the Bhoomidar partner program. Earn commission and rewards on every sale.", "textarea"),
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
      f("about_text", "Text", "Bhoomidar is a trusted real estate company. We make it easy to invest in good land and property.", "textarea"),
      ...[
        ["Verified Properties", "100% Legal & Genuine"],
        ["Expert Guidance", "From Site Visit to Registration"],
        ["End-to-End Support", "Till Ownership"],
      ].flatMap(([t, d], i) => [
        f(`about_trust${i + 1}_title`, `Trust point ${i + 1} - title`, t),
        f(`about_trust${i + 1}_text`, `Trust point ${i + 1} - text`, d),
      ]),
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
      f("story_p3", "Paragraph 3", "Our team stays with you after the deal too, so you always have someone to ask.", "textarea"),
      f(
        "story_points",
        "Points (one per line)",
        "Clear prices and clear papers | Transparent deals with verified documents\nGood land in growing places | Carefully selected locations with high potential\nHelp from the first visit to registration | Full support at every step",
        "textarea",
        { hint: "Write the point, then | and a small line under it. The small line is optional." },
      ),
      f("story_chip1_title", "Photo chip 1 - title", "Prime Locations"),
      f("story_chip1_text", "Photo chip 1 - small text", "Across Growing Regions"),
      f("story_chip2_title", "Photo chip 2 - title", "Verified Land"),
      f("story_chip2_text", "Photo chip 2 - small text", "Clear Documents"),
      ...[
        ["5000+", "Happy Investors"],
        ["100+", "Prime Locations"],
        ["100%", "Verified Documents"],
        ["24/7", "Investor Support"],
      ].flatMap(([v, l], i) => [
        f(`story_stat${i + 1}_value`, `Strip number ${i + 1} - big text`, v),
        f(`story_stat${i + 1}_label`, `Strip number ${i + 1} - small text`, l),
      ]),
    ],
  },
  {
    id: "numbers",
    label: "Numbers",
    fields: [
      ["100+", "Top Locations"],
      ["5000+", "Happy Investors"],
      ["Clear", "Prices & Papers"],
      ["Full", "Support till Registration"],
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
      f("vision_text", "Vision card - text", "To be the most trusted name in land and property, and to help every family and investor grow.", "textarea"),
      f("mv_text", "Text under the heading", "At Bhoomidar, we are committed to making land and property investment simple, transparent and accessible for everyone.", "textarea"),
      f("mission_image", "Mission card - photo", "/images/farm.png", "image", {
        hint: "A landscape photo, about 900 x 1000. It shows on the right of the Mission card.",
      }),
      f("vision_image", "Vision card - photo", "/images/plots.png", "image", {
        hint: "A landscape photo, about 900 x 1000. It shows on the right of the Vision card.",
      }),
      ...[
        ["Transparent Process", "Clear prices and verified papers"],
        ["Safe Investments", "Trusted and legally verified properties"],
        ["For Everyone", "Easy and simple experience"],
      ].flatMap(([t, d], i) => [
        f(`mission_pt${i + 1}_title`, `Mission point ${i + 1} - title`, t),
        f(`mission_pt${i + 1}_text`, `Mission point ${i + 1} - small text`, d),
      ]),
      ...[
        ["Trusted Brand", "A name people can always rely on"],
        ["Grow Together", "Helping families and investors build a better future"],
        ["Sustainable Development", "Contributing to stronger communities"],
      ].flatMap(([t, d], i) => [
        f(`vision_pt${i + 1}_title`, `Vision point ${i + 1} - title`, t),
        f(`vision_pt${i + 1}_text`, `Vision point ${i + 1} - small text`, d),
      ]),
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
        ["Grow Together", "When our customers and investors grow, we grow too."],
        ["Think Long Term", "Good land gives good returns over the years."],
      ].flatMap(([t, d], i) => [
        f(`value${i + 1}_title`, `Value ${i + 1} - title`, t),
        f(`value${i + 1}_text`, `Value ${i + 1} - text`, d),
      ]),
      f("values_text", "Text under the heading", "These values guide everything we do at Bhoomidar, from how we work with our clients to how we build a better tomorrow.", "textarea"),
      f("values_btn", "Small button on each card", "Learn more", "text", { hint: "Leave empty to hide the button." }),
      f("values_btn_link", "Small button link", "/contact", "text", { hint: "A page like /contact, or a full https:// link." }),
      ...["/images/ourvalues1.png", "/images/ourvalues2.png", "/images/ourvalues3.png", "/images/ourvalues4.png"].map((img, i) =>
        f(`value${i + 1}_image`, `Value ${i + 1} - photo`, img, "image", {
          optional: true,
          hint: "A landscape photo. It fades in at the bottom of the card. Clear it to show no photo.",
        }),
      ),
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
      toggle("about_show_chips", "Who We Are - two small chips on the photo"),
      toggle("about_show_story_stats", "Who We Are - numbers strip"),
      toggle("about_show_trust", "Top banner - three trust points"),
      toggle("about_show_numbers", "Top banner - four number cards"),
      toggle("about_show_mission", "Section - Mission & Vision"),
      toggle("about_show_values", "Section - Our Values"),
      toggle("about_show_steps", "Section - How It Works"),
      toggle("about_show_cta", "Section - Bottom Banner"),
    ],
  },
  {
    id: "seo",
    label: "Browser Title",
    note: "What shows on the browser tab and in Google for this page.",
    fields: [
      f("about_seo_title", "Page title", "About Us | Bhoomidar"),
      f("about_seo_text", "Short description", "Bhoomidar is a trusted real estate company. We help people invest in good land and property in simple and clear ways.", "textarea"),
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
      f("contact_text", "Text", "Have a question about a property or a site visit? Send us a message or give us a call. We are happy to help you.", "textarea"),
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
        ["How do I book a site visit?", "Send us a message or call us. Our team will plan a visit at a time that suits you."],
        ["Can I see a property before I decide?", "Yes. We help you from the first site visit all the way to registration."],
        ["Are the property papers checked?", "Yes. All papers are checked and clear before a property is listed."],
        ["Do you help with the registration?", "Yes. Our team stays with you until the registration is complete."],
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
      f("footer_text", "Text under the logo", "Building a brighter tomorrow with trusted land and clear deals.", "textarea"),
      f("footer_newsletter", "Newsletter text", "Get the latest property news and new launches.", "textarea"),
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

export const ALL_FIELDS = [
  ...HOME_TABS,
  ...PARTNER_TABS,
  ...ABOUT_TABS,
  ...CONTACT_TABS,
  ...PAYMENT_TABS,
].flatMap((tab) => tab.fields);

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
