// Every piece of site text and every image the admin can change.
// Each field: { key, label, type, default }. The defaults are what the site
// shows until the admin saves something different.
//   type: "text" (default) | "textarea" | "image"

const f = (key, label, def, type = "text") => ({ key, label, type, default: def });

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
      f("hero_btn1", "Button 1 text", "Explore Properties"),
      f("hero_btn2", "Button 2 text", "Join as Partner"),
      f("hero_image", "Background image", "/images/hero.png", "image"),
      f("hero_image_mobile", "Background image on phones (optional, tall photo works best)", "", "image"),
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
      f("cta_image", "Background image", "/images/cta.png", "image"),
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
      f("about_image", "Background image", "/images/partner.png", "image"),
      f("about_label", "Small label", "About Us"),
      f("about_title_1", "Heading - line 1", "We Help You Grow"),
      f("about_title_2", "Heading - line 2", "With"),
      f("about_title_accent", "Heading - orange words", "Trusted Land"),
      f("about_text", "Text", "Bhoomidar is a real estate partner network. We make it easy to invest in good land and property.", "textarea"),
    ],
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

/* ───────────────────────────── helpers ───────────────────────────── */

export const ALL_FIELDS = [...HOME_TABS, ...ABOUT_TABS, ...CONTACT_TABS].flatMap(
  (tab) => tab.fields,
);

export const DEFAULTS = Object.fromEntries(ALL_FIELDS.map((x) => [x.key, x.default]));

// Splits a textarea value into clean, non-empty lines.
export const lines = (text) =>
  String(text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

// "+91 98765 43210" -> "+919876543210" for tel: links.
export const phoneHref = (phone) => `tel:${String(phone ?? "").replace(/[^\d+]/g, "")}`;

export { group };
