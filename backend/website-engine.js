
"use strict";

/* =========================================================
   ARAM EVENTS - CATEGORY AWARE WEBSITE GENERATION ENGINE
   Features:
   1. Accurate category detection
   2. Category-specific website structures
   3. Relevant images for every category
   4. Unique design variations
   5. Prompt-based content
   6. Responsive layouts
   7. Healthcare, fashion, restaurant, travel, technology,
      wedding, fitness, education, portfolio and business
========================================================= */

function esc(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function text(value, fallback = "") {
  return String(value || fallback).trim();
}

function getInputText(input = {}) {
  return [
    input.prompt,
    input.projectName,
    input.eventName,
    input.description,
    input.businessType
  ].filter(Boolean).join(" ").toLowerCase();
}

/* =========================================================
   CATEGORY DETECTION
========================================================= */

function detectCategory(input = {}) {
  const value = getInputText(input);

  const rules = [
    {
      category: "healthcare",
      keywords: [
        "hospital", "healthcare", "medical center",
        "medical centre", "clinic", "doctor",
        "patient", "physician", "dental",
        "diagnostic", "health center", "health centre",
        "medical services", "emergency care",
        "nursing", "pharmacy", "healthcare website"
      ]
    },
    {
      category: "fashion",
      keywords: [
        "fashion", "clothing", "boutique",
        "apparel", "garments", "fashion brand",
        "designer wear", "menswear", "womenswear",
        "collection", "runway", "lookbook",
        "luxury brand", "streetwear"
      ]
    },
    {
      category: "restaurant",
      keywords: [
        "restaurant", "cafe", "café",
        "food", "dining", "chef",
        "menu", "bakery", "bistro",
        "fine dining", "pizza", "hotel restaurant"
      ]
    },
    {
      category: "technology",
      keywords: [
        "technology", "tech", "software",
        "saas", "artificial intelligence",
        "ai platform", "app development",
        "startup", "digital product",
        "cloud computing", "cybersecurity",
        "developer tools", "analytics platform"
      ]
    },
    {
      category: "travel",
      keywords: [
        "travel", "tourism", "destination",
        "holiday", "vacation", "tour",
        "resort", "travel agency",
        "travel packages", "adventure travel"
      ]
    },
    {
      category: "wedding",
      keywords: [
        "wedding", "bride", "groom",
        "marriage", "wedding planner",
        "wedding photography", "engagement",
        "bridal", "ceremony"
      ]
    },
    {
      category: "fitness",
      keywords: [
        "fitness", "gym", "yoga",
        "workout", "personal training",
        "wellness", "sports club",
        "fitness studio", "nutrition"
      ]
    },
    {
      category: "education",
      keywords: [
        "education", "school", "university",
        "college", "academy", "online course",
        "learning platform", "training institute",
        "student", "tutoring"
      ]
    },
    {
      category: "portfolio",
      keywords: [
        "portfolio", "photographer",
        "photography studio", "artist",
        "creative studio", "graphic design",
        "illustrator", "videographer"
      ]
    }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(keyword => value.includes(keyword))) {
      return rule.category;
    }
  }

  return "business";
}

/* =========================================================
   CATEGORY CONTENT AND WEBSITE STRUCTURES
========================================================= */

const CATEGORY_CONFIG = {

  healthcare: {
    label: "Healthcare",

    tagline: "Care that puts you first.",

    description:
      "Compassionate healthcare, experienced medical professionals and modern facilities dedicated to your wellbeing.",

    introTitle: "Your health. Our priority.",

    intro:
      "We combine medical expertise, modern technology and personalized attention to provide quality healthcare for every patient.",

    sections: [
      {
        label: "OUR HOSPITAL",
        title: "Healthcare built around you",
        description:
          "Discover a welcoming medical environment where experienced professionals work together to deliver attentive and reliable care.",
        image: 1
      },
      {
        label: "MEDICAL DEPARTMENTS",
        title: "Complete care under one roof",
        description:
          "Explore our medical specialties, diagnostic services and personalized treatment options.",
        cards: [
          ["Cardiology", "Heart health assessments, cardiac consultations and preventive care.", "♥"],
          ["Neurology", "Specialist consultations for neurological health and wellbeing.", "✚"],
          ["Orthopedics", "Bone, joint and mobility care with personalized treatment.", "✚"],
          ["Pediatrics", "Dedicated healthcare and wellness support for children.", "♡"],
          ["Diagnostics", "Modern diagnostic services and medical investigations.", "⌕"],
          ["Emergency Care", "Emergency medical assistance and coordinated patient care.", "+"]
        ]
      },
      {
        label: "MEET OUR TEAM",
        title: "Experienced hands. Caring hearts.",
        description:
          "Our medical team is committed to supporting patients with professional expertise and compassionate attention.",
        cards: [
          ["Dr. Sarah Mitchell", "Senior Medical Consultant", "01"],
          ["Dr. James Wilson", "Cardiology Specialist", "02"],
          ["Dr. Emily Carter", "Pediatric Specialist", "03"]
        ]
      },
      {
        label: "PATIENT STORIES",
        title: "Trusted by our community",
        description:
          "Our commitment to attentive service and patient-focused care makes every healthcare journey matter."
      },
      {
        label: "APPOINTMENTS",
        title: "Your journey to better health starts here.",
        description:
          "Request an appointment with our medical team."
      }
    ],

    imageKeywords: [
      "modern hospital interior doctor healthcare professional",
      "doctor talking with patient in bright modern hospital",
      "modern medical examination room",
      "medical doctors healthcare team",
      "modern hospital reception interior"
    ],

    images: [
      "photo-1551076805-e1869033e561",
      "photo-1576091160399-112ba8d25d1d",
      "photo-1629909613654-28e377c37b09",
      "photo-1612349317150-e413f6a5b16d",
      "photo-1516549655169-df83a0774514"
    ],

    primary: "#176B87",
    secondary: "#E9F5F1",
    background: "#F5FAFC",
    surface: "#FFFFFF",
    ink: "#173247",
    muted: "#687F8D",
    accent: "#3A9D80",

    font: "sans"
  },

  fashion: {
    label: "Fashion",
    tagline: "Style beyond the ordinary.",
    description:
      "Discover considered collections, expressive silhouettes and timeless designs created for modern individuality.",
    introTitle: "A new expression of style.",
    intro:
      "Explore a world of thoughtful design, carefully selected materials and collections that celebrate individual expression.",
    sections: [
      {
        label: "NEW COLLECTION",
        title: "Discover the latest arrivals",
        description:
          "Explore contemporary silhouettes and carefully curated pieces.",
        image: 1
      },
      {
        label: "SHOP THE COLLECTION",
        title: "Designed to be remembered.",
        cards: [
          ["Women's Collection", "Contemporary essentials and statement pieces.", "₹2,499"],
          ["Men's Collection", "Modern tailoring and everyday sophistication.", "₹3,299"],
          ["Accessories", "Finishing touches for every occasion.", "₹999"]
        ]
      },
      {
        label: "OUR STORY",
        title: "The art of individual style",
        description:
          "We believe fashion should express personality, creativity and confidence."
      },
      {
        label: "LOOKBOOK",
        title: "A visual story of modern fashion",
        image: 2
      },
      {
        label: "CUSTOMER STORIES",
        title: "Style that speaks for itself"
      }
    ],
    imageKeywords: [
      "luxury fashion editorial model beige clothing campaign",
      "fashion woman designer clothing studio editorial",
      "luxury fashion accessories product photography",
      "fashion runway editorial photography",
      "premium clothing collection flat lay"
    ],
    images: [
      "photo-1529139574466-a303027c1d8b",
      "photo-1483985988355-763728e1935b",
      "photo-1490481651871-ab68de25d43d",
      "photo-1539109136881-3be0616acf4b",
      "photo-1525507119028-ed4c629a60a3"
    ],
    primary: "#27211D",
    secondary: "#E9DFD1",
    background: "#F5F0E8",
    surface: "#FFFFFF",
    ink: "#241F1B",
    muted: "#81766C",
    accent: "#A47A50",
    font: "editorial"
  },

  restaurant: {
    label: "Restaurant",
    tagline: "An unforgettable taste of excellence.",
    description:
      "Discover exceptional flavours, thoughtful ingredients and memorable dining experiences.",
    introTitle: "Where every dish tells a story.",
    intro:
      "Our kitchen celebrates seasonal ingredients, creative preparation and the pleasure of sharing exceptional food.",
    sections: [
      {
        label: "OUR STORY",
        title: "Passion served on every plate",
        description:
          "Discover our culinary philosophy and the people behind every memorable dining experience.",
        image: 1
      },
      {
        label: "SIGNATURE MENU",
        title: "Made to be savoured",
        cards: [
          ["Truffle Mushroom Risotto", "Creamy arborio rice, wild mushrooms and parmesan.", "₹650"],
          ["Herb-Crusted Salmon", "Fresh salmon, seasonal greens and lemon butter.", "₹890"],
          ["Chocolate Fondant", "Warm chocolate centre with vanilla cream.", "₹420"]
        ]
      },
      {
        label: "MEET THE CHEF",
        title: "Crafted with creativity",
        description:
          "Our culinary team combines traditional techniques with contemporary inspiration."
      },
      {
        label: "DINING EXPERIENCE",
        title: "A place to slow down and savour",
        image: 2
      }
    ],
    imageKeywords: [
      "luxury fine dining restaurant plated gourmet food photography",
      "elegant restaurant interior warm ambient lighting",
      "professional chef preparing gourmet cuisine",
      "fine dining signature dessert food photography",
      "luxury restaurant table setting"
    ],
    images: [
      "photo-1517248135467-4c7edcad34c4",
      "photo-1414235077428-338989a2e8c0",
      "photo-1559339352-11d035aa65de",
      "photo-1547592180-85f173990554",
      "photo-1515003197210-e0cd7184f8b5"
    ],
    primary: "#68452E",
    secondary: "#E9D9BD",
    background: "#F8F2E9",
    surface: "#FFFFFF",
    ink: "#34251C",
    muted: "#857465",
    accent: "#B48A4A",
    font: "editorial"
  },

  technology: {
    label: "Technology",
    tagline: "Build what comes next.",
    description:
      "Powerful digital experiences, intelligent technology and practical solutions for ambitious teams.",
    introTitle: "Technology with purpose.",
    intro:
      "We transform complex ideas into useful digital experiences through thoughtful engineering and innovation.",
    sections: [
      {
        label: "THE PLATFORM",
        title: "A smarter way to work",
        description:
          "Discover tools designed to help teams work better, move faster and achieve more.",
        image: 1
      },
      {
        label: "CAPABILITIES",
        title: "Everything connected",
        cards: [
          ["Artificial Intelligence", "Intelligent tools designed to simplify complex workflows.", "AI"],
          ["Automation", "Reduce repetitive work with efficient automation.", "01"],
          ["Analytics", "Turn information into meaningful insights.", "02"]
        ]
      },
      {
        label: "HOW IT WORKS",
        title: "From idea to impact",
        description:
          "A connected workflow designed around your business needs."
      },
      {
        label: "GET STARTED",
        title: "Build your next big idea"
      }
    ],
    imageKeywords: [
      "futuristic technology digital interface computer workspace",
      "modern software developer workspace",
      "abstract artificial intelligence data visualization",
      "technology team working in modern office",
      "modern SaaS dashboard laptop"
    ],
    images: [
      "photo-1518770660439-4636190af475",
      "photo-1519389950473-47ba0277781c",
      "photo-1451187580459-43490279c0fa",
      "photo-1498050108023-c5249f4df085",
      "photo-1551288049-bebda4e38f71"
    ],
    primary: "#6555E8",
    secondary: "#E6E4FF",
    background: "#F5F5FC",
    surface: "#FFFFFF",
    ink: "#17182F",
    muted: "#777991",
    accent: "#7564EE",
    font: "sans"
  },

  travel: {
    label: "Travel",
    tagline: "The world is waiting for you.",
    description:
      "Discover remarkable destinations, inspiring journeys and unforgettable experiences.",
    introTitle: "Every journey has a story.",
    intro:
      "From peaceful escapes to extraordinary adventures, discover destinations that stay with you.",
    sections: [
      {
        label: "EXPLORE DESTINATIONS",
        title: "Find your next escape",
        image: 1
      },
      {
        label: "TRAVEL EXPERIENCES",
        title: "Journeys worth remembering",
        cards: [
          ["Mountain Adventures", "Explore beautiful mountain landscapes.", "01"],
          ["Island Escapes", "Discover tropical beaches and peaceful stays.", "02"],
          ["Cultural Journeys", "Experience local traditions and culture.", "03"]
        ]
      },
      {
        label: "TRAVEL STORIES",
        title: "See the world differently",
        image: 2
      }
    ],
    imageKeywords: [
      "cinematic tropical beach travel photography",
      "mountain landscape luxury travel photography",
      "beautiful tropical island resort",
      "travel adventure destination landscape",
      "luxury hotel pool ocean view"
    ],
    images: [
      "photo-1470770841072-f978cf4d019e",
      "photo-1464822759023-fed622ff2c3b",
      "photo-1500530855697-b586d89ba3ee",
      "photo-1507525428034-b723cf961d3e",
      "photo-1518837695005-2083093ee35b"
    ],
    primary: "#176B66",
    secondary: "#DFEDE4",
    background: "#F5F6EF",
    surface: "#FFFFFF",
    ink: "#203B35",
    muted: "#72827A",
    accent: "#C18A54",
    font: "editorial"
  },

  wedding: {
    label: "Wedding",
    tagline: "Moments that last forever.",
    description:
      "Celebrate love through beautiful details, meaningful moments and unforgettable memories.",
    introTitle: "Your story, beautifully told.",
    intro:
      "Every celebration is unique. We help create meaningful experiences filled with beautiful memories.",
    sections: [
      {
        label: "OUR STORY",
        title: "A celebration of your love",
        image: 1
      },
      {
        label: "OUR SERVICES",
        title: "Every detail matters",
        cards: [
          ["Wedding Photography", "Capture the moments you will treasure forever.", "01"],
          ["Wedding Planning", "Beautifully organized celebrations.", "02"],
          ["Floral Design", "Thoughtful details and stunning arrangements.", "03"]
        ]
      },
      {
        label: "GALLERY",
        title: "Love in every frame",
        image: 2
      }
    ],
    imageKeywords: [
      "luxury wedding photography bride groom romantic",
      "elegant wedding ceremony floral decoration",
      "beautiful wedding reception table setting",
      "romantic bridal portrait",
      "wedding bouquet fine art photography"
    ],
    images: [
      "photo-1519741497674-611481863552",
      "photo-1519225421980-715cb0215aed",
      "photo-1464366400600-7168b8af9bc3",
      "photo-1537633552985-df8429e8048b",
      "photo-1511285560929-80b456fea0bc"
    ],
    primary: "#795E52",
    secondary: "#F0E5DC",
    background: "#FAF5F0",
    surface: "#FFFFFF",
    ink: "#3C302C",
    muted: "#8B7A70",
    accent: "#B68A75",
    font: "editorial"
  },

  fitness: {
    label: "Fitness",
    tagline: "Stronger starts here.",
    description:
      "Build strength, improve your wellbeing and discover a fitness routine that works for you.",
    introTitle: "Your progress starts today.",
    intro:
      "We help you build healthy habits through supportive coaching and thoughtfully designed fitness programs.",
    sections: [
      {
        label: "OUR STUDIO",
        title: "Move with purpose",
        image: 1
      },
      {
        label: "OUR PROGRAMS",
        title: "Training for every goal",
        cards: [
          ["Strength Training", "Build strength with structured training.", "01"],
          ["Personal Coaching", "Personalized guidance for your goals.", "02"],
          ["Yoga & Mobility", "Improve flexibility and balance.", "03"]
        ]
      }
    ],
    imageKeywords: [
      "premium modern fitness gym interior",
      "athlete strength training photography",
      "yoga wellness studio natural light",
      "personal trainer coaching fitness",
      "modern gym workout equipment"
    ],
    images: [
      "photo-1534438327276-14e5300c3a48",
      "photo-1517836357463-d25dfeac3438",
      "photo-1544367567-0f2fcb009e0b",
      "photo-1571019613454-1cb2f99b2d8b",
      "photo-1518611012118-696072aa579a"
    ],
    primary: "#1F6658",
    secondary: "#DFEDE5",
    background: "#F4F7F3",
    surface: "#FFFFFF",
    ink: "#20352D",
    muted: "#78867D",
    accent: "#91B65B",
    font: "sans"
  },

  education: {
    label: "Education",
    tagline: "Learn today. Lead tomorrow.",
    description:
      "Discover opportunities to learn, grow and develop skills for a changing world.",
    introTitle: "Knowledge creates possibilities.",
    intro:
      "We believe in accessible learning, practical education and helping every learner achieve their potential.",
    sections: [
      {
        label: "ABOUT US",
        title: "Learning that moves you forward",
        image: 1
      },
      {
        label: "OUR PROGRAMS",
        title: "Explore learning opportunities",
        cards: [
          ["Professional Courses", "Develop practical industry skills.", "01"],
          ["Online Learning", "Learn at your own pace.", "02"],
          ["Career Development", "Prepare for your next opportunity.", "03"]
        ]
      }
    ],
    imageKeywords: [
      "modern university students learning classroom",
      "university campus architecture",
      "students studying together library",
      "modern educational classroom",
      "professional online learning laptop"
    ],
    images: [
      "photo-1523580494863-6f3031224c94",
      "photo-1524178232363-1fb2b075b655",
      "photo-1509062522246-3755977927d7",
      "photo-1427504494785-3a9ca7044f45",
      "photo-1503676260728-1c00da094a0b"
    ],
    primary: "#245E9B",
    secondary: "#E2ECF8",
    background: "#F4F7FB",
    surface: "#FFFFFF",
    ink: "#1C3550",
    muted: "#71839A",
    accent: "#D59A45",
    font: "sans"
  },

  portfolio: {
    label: "Portfolio",
    tagline: "Creative work. Distinctive vision.",
    description:
      "A visual collection of creative ideas, thoughtful projects and meaningful stories.",
    introTitle: "Ideas brought to life.",
    intro:
      "Explore a curated selection of work that combines creativity, craft and a distinctive perspective.",
    sections: [
      {
        label: "SELECTED WORK",
        title: "A collection of creative stories",
        image: 1
      },
      {
        label: "WHAT I DO",
        title: "Creative services",
        cards: [
          ["Photography", "Visual storytelling and professional imagery.", "01"],
          ["Art Direction", "Creative concepts and visual identities.", "02"],
          ["Design", "Distinctive digital and visual experiences.", "03"]
        ]
      }
    ],
    imageKeywords: [
      "professional photography creative portfolio",
      "editorial photography studio",
      "creative design workspace",
      "artistic architectural photography",
      "professional camera photography"
    ],
    images: [
      "photo-1492684223066-81342ee5ff30",
      "photo-1516035069371-29a1b244cc32",
      "photo-1500534623283-312aade485b7",
      "photo-1470225620780-dba8ba36b745",
      "photo-1517841905240-472988babdf9"
    ],
    primary: "#34313E",
    secondary: "#E8E4EF",
    background: "#F6F4F8",
    surface: "#FFFFFF",
    ink: "#252330",
    muted: "#777384",
    accent: "#9874C9",
    font: "editorial"
  },

  business: {
    label: "Business",
    tagline: "A better way forward.",
    description:
      "Discover professional services and thoughtful solutions designed around your business.",
    introTitle: "Built around your ambitions.",
    intro:
      "We combine experience, expertise and practical thinking to help businesses move forward.",
    sections: [
      {
        label: "ABOUT US",
        title: "A different approach to business",
        image: 1
      },
      {
        label: "OUR SERVICES",
        title: "Solutions designed for you",
        cards: [
          ["Consulting", "Practical guidance for business growth.", "01"],
          ["Strategy", "Clear direction and thoughtful planning.", "02"],
          ["Innovation", "Ideas transformed into meaningful results.", "03"]
        ]
      }
    ],
    imageKeywords: [
      "modern professional business office interior",
      "business team meeting office",
      "professional consulting workspace",
      "modern corporate office architecture",
      "business collaboration team"
    ],
    images: [
      "photo-1497366754035-f200968a6e72",
      "photo-1497366216548-37526070297c",
      "photo-1497366811353-6870744d04b2",
      "photo-1521737711867-e3b97375f902",
      "photo-1497366754035-f200968a6e72"
    ],
    primary: "#243E59",
    secondary: "#E4ECF3",
    background: "#F4F7FA",
    surface: "#FFFFFF",
    ink: "#192F44",
    muted: "#728294",
    accent: "#327E9D",
    font: "sans"
  }
};

/* =========================================================
   DESIGN VARIATIONS
========================================================= */

const LAYOUTS = [
  "editorial",
  "minimal",
  "bold",
  "dark",
  "split",
  "asymmetric"
];

function chooseLayout(design, seed = 1) {
  const value = String(design || "").toLowerCase();

  if (value.includes("minimal")) return "minimal";
  if (value.includes("bold")) return "bold";
  if (value.includes("dark")) return "dark";
  if (value.includes("editorial")) return "editorial";
  if (value.includes("corporate")) return "split";
  if (value.includes("experimental")) return "asymmetric";

  return LAYOUTS[Math.abs(seed) % LAYOUTS.length];
}

function getSeed(input) {
  const value = getInputText(input);

  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

/* =========================================================
   FALLBACK PLAN
========================================================= */

function fallbackPlan(input = {}) {
  const category = detectCategory(input);
  const config = CATEGORY_CONFIG[category];

  return {
    category,
    title: text(
      input.projectName || input.eventName,
      "Your Website"
    ),
    tagline: config.tagline,
    description: config.description,
    intro: config.intro,
    sectionHeading: config.introTitle,
    cards: config.sections
      .filter(section => section.cards)
      .flatMap(section => section.cards)
      .slice(0, 6)
      .map(card => ({
        title: card[0],
        description: card[1]
      })),
    visualKeywords: config.imageKeywords.join(", ")
  };
}

/* =========================================================
   IMAGE GENERATION
========================================================= */

function getImageUrl(category, index, seed) {
  const config = CATEGORY_CONFIG[category];
  const imageId = config.images[index % config.images.length];

  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1400&q=85`;
}

function getAIImageUrl(prompt, seed, width = 1400, height = 1000) {
  const encoded = encodeURIComponent(
    `${prompt}, professional commercial photography, realistic high quality, natural lighting, beautiful composition, no text, no watermark`
  );

  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
}

/* =========================================================
   CARD RENDERING
========================================================= */

function renderCards(cards = []) {
  return cards.map((card, index) => `
    <article class="service-card">
      <div class="card-number">0${index + 1}</div>
      <div class="card-icon">${esc(card[2] || "✦")}</div>
      <h3>${esc(card[0])}</h3>
      <p>${esc(card[1])}</p>
      ${card[2] && card[2].startsWith("₹")
        ? `<strong class="price">${esc(card[2])}</strong>`
        : ""}
    </article>
  `).join("");
}

/* =========================================================
   CATEGORY SPECIFIC EXTRA CONTENT
========================================================= */

function renderCategoryExtra(category, title) {

  if (category === "healthcare") {
    return `
      <section class="appointment-section" id="appointment">
        <div class="section-label">BOOK AN APPOINTMENT</div>
        <h2>We're here when you need us.</h2>
        <p>Request an appointment with our healthcare team.</p>

        <form class="contact-form" onsubmit="event.preventDefault();alert('Your appointment request has been prepared. Please connect a booking backend to submit it.');">
          <input required placeholder="Your full name">
          <input required type="email" placeholder="Email address">
          <input type="tel" placeholder="Phone number">
          <select required>
            <option value="">Choose a department</option>
            <option>Cardiology</option>
            <option>Neurology</option>
            <option>Orthopedics</option>
            <option>Pediatrics</option>
            <option>Diagnostics</option>
          </select>
          <input required type="date">
          <button type="submit">REQUEST APPOINTMENT ↗</button>
        </form>

        <div class="emergency">
          <span>EMERGENCY ASSISTANCE</span>
          <h3>Need urgent medical attention?</h3>
          <a href="tel:112">Call emergency services: 112</a>
        </div>
      </section>
    `;
  }

  if (category === "fashion") {
    return `
      <section class="fashion-cta" id="shop">
        <div class="section-label">THE NEW COLLECTION</div>
        <h2>Find your own expression.</h2>
        <p>Explore the collection and discover pieces made to become your favourites.</p>
        <a href="#collections" class="primary-button">EXPLORE COLLECTION ↗</a>
      </section>
    `;
  }

  if (category === "restaurant") {
    return `
      <section class="appointment-section" id="reservation">
        <div class="section-label">RESERVE YOUR TABLE</div>
        <h2>An evening worth remembering.</h2>
        <p>Join us for a memorable dining experience.</p>

        <form class="contact-form" onsubmit="event.preventDefault();alert('Reservation request prepared. Connect a booking backend to confirm your table.');">
          <input required placeholder="Your name">
          <input required type="email" placeholder="Email address">
          <input required type="date">
          <input required type="time">
          <select>
            <option>2 Guests</option>
            <option>3 Guests</option>
            <option>4 Guests</option>
            <option>5 Guests</option>
            <option>6 Guests</option>
          </select>
          <button type="submit">RESERVE A TABLE ↗</button>
        </form>
      </section>
    `;
  }

  if (category === "travel") {
    return `
      <section class="appointment-section" id="booking">
        <div class="section-label">PLAN YOUR JOURNEY</div>
        <h2>Where will your next story begin?</h2>
        <form class="contact-form" onsubmit="event.preventDefault();alert('Travel enquiry prepared. Connect a booking backend to submit it.');">
          <input required placeholder="Your name">
          <input required type="email" placeholder="Email address">
          <input required placeholder="Preferred destination">
          <input type="date">
          <button type="submit">SEND TRAVEL ENQUIRY ↗</button>
        </form>
      </section>
    `;
  }

  if (category === "technology") {
    return `
      <section class="appointment-section" id="demo">
        <div class="section-label">LET'S BUILD SOMETHING</div>
        <h2>Ready to explore what's possible?</h2>
        <p>Connect with our team and discover the platform.</p>
        <a href="mailto:hello@example.com?subject=${encodeURIComponent(title)}" class="primary-button">REQUEST A DEMO ↗</a>
      </section>
    `;
  }

  if (category === "wedding") {
    return `
      <section class="appointment-section" id="enquiry">
        <div class="section-label">LET'S CELEBRATE</div>
        <h2>Tell us about your special day.</h2>
        <form class="contact-form" onsubmit="event.preventDefault();alert('Wedding enquiry prepared. Connect a backend to submit it.');">
          <input required placeholder="Your names">
          <input required type="email" placeholder="Email address">
          <input type="date">
          <input placeholder="Wedding venue">
          <button type="submit">SEND AN ENQUIRY ↗</button>
        </form>
      </section>
    `;
  }

  return `
    <section class="appointment-section" id="contact">
      <div class="section-label">GET IN TOUCH</div>
      <h2>Let's make something happen.</h2>
      <a href="mailto:hello@example.com" class="primary-button">CONTACT US ↗</a>
    </section>
  `;
}

/* =========================================================
   MAIN WEBSITE RENDERER
========================================================= */

function renderWebsite(input = {}, plan = {}, seed = null) {

  const category = detectCategory(input);
  const config = CATEGORY_CONFIG[category];

  const actualSeed = seed === null ? getSeed(input) : Math.abs(seed);
  const layout = chooseLayout(input.design, actualSeed);

  const title = text(
    input.projectName || input.eventName || plan.title,
    "Your Website"
  );

  // Keep the user-selected category as the source of truth.
  // Do not allow a generic AI plan to change the business type.

  const description = text(
    input.description,
    text(input.prompt, config.description)
  );

  const heroTitle = text(plan.tagline, config.tagline);
  const introTitle = config.introTitle;
  const intro = config.intro;

  const photos = config.images.map((id, index) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`
  );

  const sections = config.sections;

  const sectionsHTML = sections.map((section, index) => {

    const cards = section.cards
      ? `<div class="card-grid">${renderCards(section.cards)}</div>`
      : "";

    const image = section.image
      ? `
        <div class="section-image">
          <img
            src="${esc(photos[section.image])}"
            alt="${esc(title)} - ${esc(section.title)}"
            loading="lazy"
          >
        </div>
      `
      : "";

    return `
      <section class="content-section section-${index + 1}"
        id="${index === 0 ? "about" : index === 1 ? "services" : "highlights"}">

        <div class="section-copy">
          <span class="section-label">${esc(section.label)}</span>
          <h2>${esc(section.title)}</h2>
          <p>${esc(section.description || config.description)}</p>
        </div>

        ${image}
        ${cards}

      </section>
    `;
  }).join("");

  const categoryExtra = renderCategoryExtra(category, title);

  const fontFamily = config.font === "editorial"
    ? "'Playfair Display', Georgia, serif"
    : "'DM Sans', Arial, sans-serif";

  const isDark = layout === "dark";

  const background = isDark ? "#151719" : config.background;
  const surface = isDark ? "#222629" : config.surface;
  const ink = isDark ? "#F8F5EF" : config.ink;
  const muted = isDark ? "#B5B8B8" : config.muted;
  const accent = config.accent;

  const heroImage = photos[0];

  const navLinks = category === "healthcare"
    ? ["About", "Departments", "Doctors", "Appointment"]
    : category === "fashion"
    ? ["Collections", "Our Story", "Lookbook", "Shop"]
    : category === "restaurant"
    ? ["Our Story", "Menu", "Chef", "Reservation"]
    : category === "technology"
    ? ["Platform", "Features", "Solutions", "Demo"]
    : category === "travel"
    ? ["Destinations", "Experiences", "Stories", "Booking"]
    : ["About", "Services", "Highlights", "Contact"];

  const navHTML = navLinks.map((label, index) => `
    <a href="#${["about", "services", "highlights", "contact"][index]}">
      ${esc(label)}
    </a>
  `).join("");

  const galleryHTML = photos.slice(1, 5).map((url, index) => `
    <div class="gallery-item gallery-${index + 1}">
      <img src="${esc(url)}" alt="${esc(config.label)} visual ${index + 1}" loading="lazy">
    </div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(description.slice(0, 155))}">
<meta name="theme-color" content="${esc(background)}">

<title>${esc(title)}</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>

:root {
  --background: ${background};
  --surface: ${surface};
  --ink: ${ink};
  --muted: ${muted};
  --accent: ${accent};
  --font: ${fontFamily};
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--ink);
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

button, input, select {
  font: inherit;
}

/* NAVIGATION */

.navbar {
  min-height: 82px;
  padding: 0 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 13%, transparent);
}

.brand {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 12px;
  font-weight: 700;
}

.nav-links a:hover {
  color: var(--accent);
}

.nav-cta, .primary-button {
  background: var(--accent);
  color: white;
  padding: 15px 23px;
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  transition: transform .3s, opacity .3s;
}

.nav-cta:hover, .primary-button:hover {
  transform: translateY(-3px);
  opacity: .9;
}

/* HERO */

.hero {
  min-height: 660px;
  padding: 75px 7%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5%;
  align-items: center;
}

.hero-content {
  position: relative;
  z-index: 2;
}

.eyebrow, .section-label {
  color: var(--accent);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
}

.hero h1 {
  font-family: var(--font);
  font-size: clamp(48px, 6.5vw, 91px);
  line-height: 1.02;
  letter-spacing: -2px;
  margin: 25px 0;
}

.hero p {
  color: var(--muted);
  max-width: 520px;
  font-size: 15px;
  line-height: 1.9;
}

.hero-actions {
  margin-top: 32px;
  display: flex;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
}

.hero-image {
  height: 530px;
  overflow: hidden;
  background: var(--surface);
  position: relative;
}

.hero-image img {
  transition: transform 1s;
}

.hero-image:hover img {
  transform: scale(1.06);
}

/* UNIQUE LAYOUTS */

.layout-bold .hero {
  grid-template-columns: 1fr 1fr;
  background: var(--accent);
  color: white;
}

.layout-bold .hero p,
.layout-bold .eyebrow {
  color: white;
}

.layout-bold .hero h1 {
  font-family: 'DM Sans', sans-serif;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: -5px;
}

.layout-bold .hero-image {
  border-radius: 0 150px 0 0;
}

.layout-minimal .hero {
  grid-template-columns: 1.2fr .8fr;
}

.layout-minimal .hero-image {
  height: 420px;
}

.layout-dark .hero {
  grid-template-columns: 1fr 1fr;
}

.layout-dark .hero-image {
  border: 1px solid #ffffff30;
}

.layout-asymmetric .hero {
  grid-template-columns: .85fr 1.15fr;
}

.layout-asymmetric .hero-image {
  height: 570px;
  border-radius: 45% 0 45% 0;
}

.layout-editorial .hero-image {
  height: 560px;
}

.layout-split .hero {
  grid-template-columns: 1fr 1fr;
}

.layout-split .hero-image {
  height: 490px;
}

/* INTRO */

.intro {
  padding: 100px 10%;
  display: grid;
  grid-template-columns: .8fr 1.2fr;
  gap: 8%;
  align-items: start;
  border-top: 1px solid color-mix(in srgb, var(--ink) 12%, transparent);
}

.intro h2 {
  font-family: var(--font);
  font-size: clamp(32px, 4vw, 55px);
  font-weight: 500;
  line-height: 1.15;
  margin-top: 18px;
}

.intro p {
  color: var(--muted);
  font-size: 15px;
  line-height: 2;
}

/* CATEGORY SECTIONS */

.content-section {
  padding: 85px 7%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 55px;
  border-top: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
}

.content-section:nth-child(even) .section-copy {
  order: 2;
}

.content-section:nth-child(even) .section-image {
  order: 1;
}

.section-copy h2 {
  font-family: var(--font);
  font-size: clamp(34px, 4vw, 58px);
  font-weight: 500;
  line-height: 1.15;
  margin: 20px 0;
}

.section-copy p {
  color: var(--muted);
  font-size: 14px;
  line-height: 2;
  max-width: 510px;
}

.section-image {
  height: 410px;
  overflow: hidden;
}

.section-image img {
  transition: transform .8s;
}

.section-image:hover img {
  transform: scale(1.05);
}

/* CARDS */

.card-grid {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  width: 100%;
}

.service-card {
  background: var(--surface);
  padding: 32px;
  min-height: 220px;
  border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
  transition: transform .3s, box-shadow .3s;
}

.service-card:hover {
  transform: translateY(-7px);
  box-shadow: 0 18px 40px #00000012;
}

.card-number {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
}

.card-icon {
  color: var(--accent);
  font-size: 25px;
  margin-top: 25px;
}

.service-card h3 {
  font-family: var(--font);
  font-size: 23px;
  margin: 20px 0 12px;
}

.service-card p {
  color: var(--muted);
  font-size: 13px;
  line-height: 1.8;
}

.price {
  display: block;
  color: var(--accent);
  margin-top: 16px;
  font-size: 16px;
}

/* GALLERY */

.gallery-section {
  padding: 85px 7%;
}

.gallery-heading {
  font-family: var(--font);
  font-size: clamp(35px, 5vw, 60px);
  font-weight: 500;
  margin: 18px 0 35px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 1.2fr .8fr 1fr;
  grid-template-rows: 300px;
  gap: 15px;
}

.gallery-item {
  overflow: hidden;
}

.gallery-item img {
  transition: transform .8s;
}

.gallery-item:hover img {
  transform: scale(1.07);
}

/* APPOINTMENT / CONTACT */

.appointment-section {
  background: var(--surface);
  padding: 90px 10%;
  text-align: center;
}

.appointment-section h2 {
  font-family: var(--font);
  font-size: clamp(34px, 5vw, 58px);
  font-weight: 500;
  margin: 20px 0;
}

.appointment-section > p {
  color: var(--muted);
  margin-bottom: 30px;
}

.contact-form {
  max-width: 750px;
  margin: 35px auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  text-align: left;
}

.contact-form input,
.contact-form select {
  width: 100%;
  min-height: 53px;
  border: 1px solid #d9dce0;
  padding: 14px;
  background: var(--background);
  color: var(--ink);
  outline-color: var(--accent);
}

.contact-form button {
  background: var(--accent);
  color: white;
  border: 0;
  padding: 17px;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  grid-column: 1 / -1;
}

.emergency {
  margin: 50px auto 0;
  padding: 28px;
  background: var(--background);
  max-width: 600px;
}

.emergency span {
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 2px;
}

.emergency h3 {
  margin: 15px 0;
}

.emergency a {
  color: var(--accent);
  font-weight: 800;
}

/* FINAL CTA */

.final-cta {
  background: var(--ink);
  color: var(--background);
  padding: 85px 7%;
  text-align: center;
}

.final-cta h2 {
  font-family: var(--font);
  font-size: clamp(36px, 5vw, 65px);
  font-weight: 500;
  margin: 20px auto 30px;
  max-width: 750px;
}

/* FOOTER */

.footer {
  padding: 35px 7%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  color: var(--muted);
  font-size: 12px;
}

/* ANIMATIONS */

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  animation: fadeUp .8s ease both;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}

/* MOBILE */

@media(max-width: 760px) {

  .navbar {
    padding: 20px 5%;
    flex-wrap: wrap;
  }

  .nav-links {
    width: 100%;
    gap: 16px;
    flex-wrap: wrap;
  }

  .hero,
  .layout-bold .hero,
  .layout-dark .hero,
  .layout-minimal .hero,
  .layout-asymmetric .hero,
  .layout-editorial .hero,
  .layout-split .hero {
    grid-template-columns: 1fr;
    padding: 55px 6%;
    gap: 30px;
  }

  .hero h1 {
    font-size: 52px;
  }

  .hero-image,
  .layout-asymmetric .hero-image {
    height: 340px;
    border-radius: 0;
  }

  .intro {
    grid-template-columns: 1fr;
    padding: 65px 7%;
    gap: 25px;
  }

  .content-section {
    grid-template-columns: 1fr;
    padding: 65px 6%;
    gap: 30px;
  }

  .content-section:nth-child(even) .section-copy,
  .content-section:nth-child(even) .section-image {
    order: initial;
  }

  .section-image {
    height: 300px;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 220px 220px;
  }

  .gallery-item:first-child {
    grid-column: 1 / -1;
  }

  .appointment-section {
    padding: 65px 6%;
  }

  .contact-form {
    grid-template-columns: 1fr;
  }

  .contact-form button {
    grid-column: auto;
  }

  .footer {
    padding: 30px 6%;
  }
}

</style>
</head>

<body class="layout-${layout}">

<nav class="navbar">
  <a href="#top" class="brand">${esc(title)}</a>

  <div class="nav-links">
    ${navHTML}
    <a href="#contact" class="nav-cta">EXPLORE ↗</a>
  </div>
</nav>

<main id="top">

<header class="hero">

  <div class="hero-content">
    <div class="eyebrow">${esc(config.label)} / DISCOVER MORE</div>

    <h1>${esc(heroTitle)}</h1>

    <p>${esc(description)}</p>

    <div class="hero-actions">
      <a href="#services" class="primary-button">
        EXPLORE NOW ↗
      </a>

      <a href="#about">
        Discover more →
      </a>
    </div>
  </div>

  <div class="hero-image">
    <img
      src="${esc(heroImage)}"
      alt="${esc(config.label)} photography for ${esc(title)}"
      fetchpriority="high"
    >
  </div>

</header>

<section class="intro" id="about">
  <div>
    <div class="section-label">${esc(config.label)} / OUR STORY</div>
    <h2>${esc(introTitle)}</h2>
  </div>

  <p>${esc(intro)}</p>
</section>

${sectionsHTML}

<section class="gallery-section" id="highlights">
  <div class="section-label">VISUAL EXPERIENCE</div>
  <h2 class="gallery-heading">Discover every detail.</h2>

  <div class="gallery-grid">
    ${galleryHTML}
  </div>
</section>

${categoryExtra}

<section class="final-cta" id="contact">
  <div class="section-label">LET'S CONNECT</div>

  <h2>
    ${esc(
      category === "healthcare"
        ? "Your wellbeing matters. Let us help."
        : category === "fashion"
        ? "Discover a style that feels like you."
        : category === "restaurant"
        ? "Your table is waiting."
        : category === "travel"
        ? "Your next adventure starts here."
        : category === "technology"
        ? "Let's create something extraordinary."
        : "Let's make something memorable."
    )}
  </h2>

  <a href="mailto:hello@example.com" class="primary-button">
    CONTACT US ↗
  </a>
</section>

</main>

<footer class="footer">
  <strong>${esc(title)}</strong>
  <span>© ${new Date().getFullYear()} ${esc(title)}. All rights reserved.</span>
  <a href="#top">Back to top ↑</a>
</footer>

</body>
</html>`;
}

/* =========================================================
   EXPORTS - KEEP COMPATIBLE WITH EXISTING SERVER.JS
========================================================= */

module.exports = {
  renderWebsite,
  fallbackPlan,
  detectCategory,
  CATEGORY_CONFIG,
  chooseLayout,
  getImageUrl,
  getAIImageUrl
};
