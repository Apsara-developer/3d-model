const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");

const router = express.Router();

const FRONTEND_DIR = path.resolve(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const PUBLIC_EVENT_FILE = path.join(DATA_DIR, "public-event.json");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const PUBLIC_REGISTRATIONS_FILE = path.join(DATA_DIR, "public-registrations.json");
const BANNER_UPLOAD_DIR = path.join(FRONTEND_DIR, "uploads", "banners");

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(BANNER_UPLOAD_DIR, { recursive: true });

const DEFAULT_EVENT = {
    id: "evt-aram-summit-2026",
    slug: "aram-innovation-summit-2026",
    name: "Aram Innovation & Experience Summit 2026",
    tagline: "Designing Memorable Live Experiences, Community & Event Craft",
    category: "Tech Summit",
    bannerImage: "assets/event-banner.svg",
    bannerAlt: "Aram Innovation & Experience Summit 2026 banner",
    description:
        "Join creators, event producers, community builders, and technology leaders for a full-day gathering focused on modern event design, attendee experience, and live production workflows.",
    date: "Saturday, December 19, 2026",
    time: "9:30 AM – 5:30 PM IST",
    doorsOpen: "Registration & Coffee Desk opens at 8:45 AM",
    venue: "The Grand Pavilion, Residency Road",
    city: "Bengaluru, India",
    address: "142 Residency Road, Ashok Nagar, Bengaluru 560025",
    capacity: 250,
    organizer: "Aram Events",
    contactEmail: "events@aramevents.local",
    featured: true,
    status: "Published",
    createdAt: "2026-11-20T09:00:00.000Z",
    highlights: [
        {
            label: "Keynotes & Panels",
            title: "6 Curated Sessions",
            detail: "Practical talks from stage directors, hospitality leads, and experience designers."
        },
        {
            label: "Hands-On Labs",
            title: "Live Production Clinics",
            detail: "Interactive walkthroughs on event run-of-show planning, guest check-in, and pacing."
        },
        {
            label: "Networking",
            title: "250+ Peers & Creators",
            detail: "Structured roundtable lunches and an evening reception in the courtyard."
        }
    ],
    schedule: [
        {
            time: "08:45 AM",
            title: "Doors Open & Badge Check-In",
            description: "Welcome coffee, pastries, and attendee badge pickup at the main foyer."
        },
        {
            time: "09:30 AM",
            title: "Opening Keynote: Designing Calm, High-Impact Gatherings",
            description: "How thoughtful scheduling, spatial flow, and hospitality shape unforgettable events."
        },
        {
            time: "11:15 AM",
            title: "Interactive Workshop: From Concept Brief to Run-of-Show",
            description: "A step-by-step framework for aligning vendors, venues, and audience touchpoints."
        },
        {
            time: "01:00 PM",
            title: "Curated Networking Lunch",
            description: "Hosted dining tables grouped by event format: conferences, culture, and community."
        },
        {
            time: "02:30 PM",
            title: "Panel: Seamless Guest Journeys Without Friction",
            description: "Eliminating check-in bottlenecks, clear wayfinding, and accessible venue setups."
        },
        {
            time: "04:15 PM",
            title: "Closing Showcase & Courtyard Reception",
            description: "Lightning case studies followed by informal refreshments and open networking."
        }
    ],
    passTypes: [
        "General Admission",
        "Workshop & Networking Pass",
        "Student Pass",
        "Partner / Guest Pass"
    ]
};

const SEED_EXTRA_EVENTS = [
    {
        id: "evt-design-ux-lab-2026",
        slug: "design-systems-live-ux-lab",
        name: "Design Systems & Live UX Craft Lab",
        tagline: "Practical component architecture and interactive attendee flows",
        category: "Workshop",
        bannerImage: "assets/banner-workshop.svg",
        bannerAlt: "Design Systems and Live UX Craft Lab banner",
        description:
            "A focused half-day studio workshop for product designers, frontend engineers, and event builders looking to ship crisp, accessible digital experiences.",
        date: "Saturday, January 16, 2027",
        time: "10:00 AM – 2:30 PM IST",
        doorsOpen: "Studio doors open at 9:30 AM with espresso bar",
        venue: "Indiranagar Creative Loft",
        city: "Bengaluru, India",
        address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
        capacity: 80,
        organizer: "Aram Design Guild",
        contactEmail: "workshops@aramevents.local",
        featured: false,
        status: "Published",
        createdAt: "2026-11-22T10:30:00.000Z",
        highlights: [
            {
                label: "Studio Lab",
                title: "Hands-On Critiques",
                detail: "Live UI audits and responsive layout drills with senior design leads."
            },
            {
                label: "Token Kit",
                title: "Design System Starter",
                detail: "Take home reusable typography, spacing, and accessible modal patterns."
            },
            {
                label: "Small Cohort",
                title: "80 Seats Maximum",
                detail: "Intimate table format ensuring direct Q&A and peer feedback."
            }
        ],
        schedule: [
            {
                time: "09:30 AM",
                title: "Welcome Coffee & Table Setup",
                description: "Grab breakfast bites and join your studio table."
            },
            {
                time: "10:00 AM",
                title: "Session 1: Visual Hierarchy & Token Discipline",
                description: "Structuring type scales, surface contrast, and fluid grids."
            },
            {
                time: "12:00 PM",
                title: "Session 2: Frictionless Forms & Micro-interactions",
                description: "Designing registration flows that convert without account walls."
            }
        ],
        passTypes: [
            "Workshop Seat",
            "Student Pass",
            "Team Bundle Pass"
        ]
    },
    {
        id: "evt-courtyard-sound-2026",
        slug: "courtyard-sound-creator-night",
        name: "Courtyard Sound & Creator Night",
        tagline: "Acoustic sets, lighting art, and open community gathering",
        category: "Music & Culture",
        bannerImage: "assets/banner-culture.svg",
        bannerAlt: "Courtyard Sound and Creator Night banner",
        description:
            "An evening showcase celebrating independent acoustic musicians, visual storytellers, and local event creators under open skies.",
        date: "Friday, January 29, 2027",
        time: "6:00 PM – 10:00 PM IST",
        doorsOpen: "Gates & Courtyard Bar open at 5:30 PM",
        venue: "Lotus Heritage Courtyard",
        city: "Chennai, India",
        address: "48 Cathedral Garden Road, Nungambakkam, Chennai 600034",
        capacity: 160,
        organizer: "Aram Culture Collective",
        contactEmail: "culture@aramevents.local",
        featured: false,
        status: "Published",
        createdAt: "2026-11-24T14:00:00.000Z",
        highlights: [
            {
                label: "Live Stage",
                title: "3 Acoustic Performances",
                detail: "Intimate sets with warm spatial lighting in the heritage courtyard."
            },
            {
                label: "Installations",
                title: "Interactive Visual Wall",
                detail: "Projection artwork curated by independent regional studios."
            },
            {
                label: "Community",
                title: "Open Mixer",
                detail: "Connect with festival organizers, artists, and venue curators."
            }
        ],
        schedule: [
            {
                time: "05:30 PM",
                title: "Courtyard Doors & Art Walkthrough",
                description: "Explore visual installations and meet fellow attendees."
            },
            {
                time: "06:30 PM",
                title: "Acoustic Opening Set",
                description: "Live instrumental showcase on the main courtyard deck."
            },
            {
                time: "08:15 PM",
                title: "Headliner Set & Closing Social",
                description: "Feature performance followed by open networking."
            }
        ],
        passTypes: [
            "General Entry",
            "VIP Lounge Pass",
            "Creator Community Pass"
        ]
    }
];

function readJsonSafe(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return parsed ?? fallback;
    } catch (error) {
        console.error(`PUBLIC EVENT READ ERROR (${path.basename(filePath)}):`, error.message);
        return fallback;
    }
}

function writeJsonAtomic(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempFile = filePath + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(tempFile, filePath);
}

function ensureEventsSeeded() {
    if (fs.existsSync(EVENTS_FILE)) {
        const existing = readJsonSafe(EVENTS_FILE, []);
        if (Array.isArray(existing) && existing.length > 0) {
            return existing;
        }
    }

    const legacyEvent = readJsonSafe(PUBLIC_EVENT_FILE, null);
    const primaryEvent =
        legacyEvent && typeof legacyEvent === "object" && !Array.isArray(legacyEvent)
            ? { ...DEFAULT_EVENT, ...legacyEvent, id: legacyEvent.id || DEFAULT_EVENT.id, status: "Published", featured: true }
            : DEFAULT_EVENT;

    const seeded = [primaryEvent, ...SEED_EXTRA_EVENTS];
    writeJsonAtomic(EVENTS_FILE, seeded);
    return seeded;
}

function readEvents() {
    const events = ensureEventsSeeded();
    return Array.isArray(events) ? events : [DEFAULT_EVENT];
}

function writeEvents(events) {
    writeJsonAtomic(EVENTS_FILE, events);
}

function readPublicRegistrations() {
    const data = readJsonSafe(PUBLIC_REGISTRATIONS_FILE, []);
    return Array.isArray(data) ? data : [];
}

function writePublicRegistrations(records) {
    writeJsonAtomic(PUBLIC_REGISTRATIONS_FILE, records);
}

function getEventBySlugOrId(slugOrId) {
    const events = readEvents();
    const target = String(slugOrId || "").trim().toLowerCase();
    if (!target) {
        return events.find(e => e.featured) || events[0] || DEFAULT_EVENT;
    }
    return events.find(
        e => String(e.slug || "").toLowerCase() === target || String(e.id || "").toLowerCase() === target
    ) || null;
}

function enrichEventWithAvailability(event, registrations) {
    const regs = registrations || readPublicRegistrations();
    const registeredCount = regs
        .filter(item => item.eventSlug === event.slug)
        .reduce((total, item) => total + Math.max(1, Number.parseInt(item.attendees, 10) || 1), 0);
    const capacity = Math.max(1, Number.parseInt(event.capacity, 10) || 250);
    return {
        ...DEFAULT_EVENT,
        ...event,
        capacity,
        registeredCount,
        spotsRemaining: Math.max(0, capacity - registeredCount)
    };
}

function makeUniqueSlug(name, existingEvents) {
    const base = String(name || "event")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 56) || "event";
    let candidate = base;
    let counter = 2;
    const slugs = new Set(existingEvents.map(e => String(e.slug || "").toLowerCase()));
    while (slugs.has(candidate)) {
        candidate = `${base}-${counter++}`;
    }
    return candidate;
}

function formatReadableDate(dateValue) {
    const raw = String(dateValue || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const parsed = new Date(`${raw}T12:00:00Z`);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC"
            });
        }
    }
    return raw;
}

const bannerUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            fs.mkdirSync(BANNER_UPLOAD_DIR, { recursive: true });
            cb(null, BANNER_UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
            const extMap = {
                "image/jpeg": ".jpg",
                "image/png": ".png",
                "image/webp": ".webp",
                "image/svg+xml": ".svg"
            };
            const ext = extMap[file.mimetype] || ".png";
            cb(null, `banner-${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
        if (allowed.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error("Banner must be a JPG, PNG, WEBP, or SVG image (max 5 MB)."));
    }
});

function handleBannerUpload(req, res, next) {
    const contentType = String(req.headers["content-type"] || "");
    if (!contentType.includes("multipart/form-data")) {
        return next();
    }
    bannerUpload.single("banner")(req, res, error => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not upload banner image."
            });
        }
        next();
    });
}

/**
 * GET /api/events
 * Lists published events for Explore Events discovery (no login required).
 */
router.get("/api/events", (req, res) => {
    const category = String(req.query?.category || "").trim().toLowerCase();
    const query = String(req.query?.q || "").trim().toLowerCase();
    const registrations = readPublicRegistrations();

    let events = readEvents()
        .filter(item => (item.status || "Published") === "Published")
        .map(item => enrichEventWithAvailability(item, registrations));

    if (category && category !== "all") {
        events = events.filter(item => String(item.category || "").toLowerCase() === category);
    }

    if (query) {
        events = events.filter(item =>
            [item.name, item.tagline, item.description, item.venue, item.city, item.category, item.organizer]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }

    events.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

    res.json({
        success: true,
        events
    });
});

/**
 * GET /api/events/:slug
 * Returns a single published event by slug or id (no login required).
 */
router.get("/api/events/:slug", (req, res) => {
    const event = getEventBySlugOrId(req.params.slug);
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found."
        });
    }

    res.json({
        success: true,
        event: enrichEventWithAvailability(event)
    });
});

/**
 * POST /api/events
 * Creates and publishes a new event persistently in backend/data/events.json.
 * Supports optional banner upload via multipart/form-data.
 */
router.post("/api/events", handleBannerUpload, (req, res) => {
    try {
        const body = req.body || {};

        const name = String(body.name || body.eventName || "").trim().slice(0, 140);
        const tagline = String(body.tagline || "").trim().slice(0, 180);
        const category = String(body.category || "Conference").trim().slice(0, 60) || "Conference";
        const description = String(body.description || "").trim().slice(0, 2000);
        const date = formatReadableDate(String(body.date || body.eventDate || "").trim().slice(0, 80));
        const time = String(body.time || body.eventTime || "").trim().slice(0, 80);
        const doorsOpen = String(body.doorsOpen || "").trim().slice(0, 160);
        const venue = String(body.venue || "").trim().slice(0, 160);
        const city = String(body.city || "").trim().slice(0, 100);
        const address = String(body.address || "").trim().slice(0, 220);
        const organizer = String(body.organizer || "Aram Event Organizer").trim().slice(0, 120) || "Aram Event Organizer";
        const contactEmail = String(body.contactEmail || "").trim().toLowerCase().slice(0, 160);
        const capacityRaw = Number.parseInt(body.capacity, 10);
        const capacity = Number.isFinite(capacityRaw) ? capacityRaw : 100;

        if (name.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please enter an event name (at least 3 characters)."
            });
        }

        if (description.length < 15) {
            return res.status(400).json({
                success: false,
                message: "Please provide an event description (at least 15 characters)."
            });
        }

        if (!date || !time || !venue) {
            return res.status(400).json({
                success: false,
                message: "Event date, time, and venue are required."
            });
        }

        if (capacity < 1 || capacity > 50000) {
            return res.status(400).json({
                success: false,
                message: "Event capacity must be between 1 and 50,000."
            });
        }

        let rawPassTypes = body.passTypes;
        if (typeof rawPassTypes === "string") {
            const trimmed = rawPassTypes.trim();
            if (trimmed.startsWith("[")) {
                try {
                    rawPassTypes = JSON.parse(trimmed);
                } catch (_) {
                    rawPassTypes = trimmed.split(",");
                }
            } else {
                rawPassTypes = trimmed.split(",");
            }
        }
        const passTypes = Array.isArray(rawPassTypes)
            ? [...new Set(rawPassTypes.map(item => String(item || "").trim().slice(0, 60)).filter(Boolean))].slice(0, 8)
            : [];

        const finalPassTypes = passTypes.length ? passTypes : ["General Admission"];

        const allowedPresetBanners = [
            "assets/event-banner.svg",
            "assets/banner-workshop.svg",
            "assets/banner-culture.svg"
        ];
        let bannerImage = allowedPresetBanners.includes(String(body.presetBanner || ""))
            ? String(body.presetBanner)
            : "assets/event-banner.svg";

        if (req.file) {
            bannerImage = `uploads/banners/${req.file.filename}`;
        }

        const events = readEvents();
        const slug = makeUniqueSlug(name, events);

        const newEvent = {
            id: "evt-" + crypto.randomUUID(),
            slug,
            name,
            tagline: tagline || `${category} hosted by ${organizer}`,
            category,
            bannerImage,
            bannerAlt: `${name} event banner`,
            description,
            date,
            time,
            doorsOpen: doorsOpen || "Check-in opens 30 minutes prior to start time.",
            venue,
            city: city || "India",
            address: address || [venue, city].filter(Boolean).join(", "),
            capacity,
            organizer,
            contactEmail: contactEmail || "events@aramevents.local",
            featured: false,
            status: "Published",
            createdAt: new Date().toISOString(),
            highlights: [
                {
                    label: "Event Format",
                    title: category,
                    detail: tagline || `Curated ${category.toLowerCase()} experience hosted by ${organizer}.`
                },
                {
                    label: "Pass Options",
                    title: `${finalPassTypes.length} Ticket ${finalPassTypes.length === 1 ? "Type" : "Types"}`,
                    detail: `Available options: ${finalPassTypes.join(", ")}.`
                },
                {
                    label: "Guest Capacity",
                    title: `${capacity} Total Spots`,
                    detail: "Instant online registration with no visitor login required."
                }
            ],
            schedule: [
                {
                    time,
                    title: name,
                    description: `${venue}${city ? `, ${city}` : ""} — Main event program.`
                }
            ],
            passTypes: finalPassTypes
        };

        events.unshift(newEvent);
        writeEvents(events);

        const enriched = enrichEventWithAvailability(newEvent);

        return res.status(201).json({
            success: true,
            message: "Event created and published successfully!",
            event: enriched,
            publicUrl: `/event?slug=${encodeURIComponent(slug)}`
        });
    } catch (error) {
        console.error("CREATE EVENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to save event right now. Please try again."
        });
    }
});

/**
 * GET /api/public/event
 * Backward-compatible endpoint supporting optional ?slug=<slug>.
 */
router.get("/api/public/event", (req, res) => {
    const requestedSlug = String(req.query?.slug || "").trim();
    const event = getEventBySlugOrId(requestedSlug);
    if (!event) {
        return res.status(404).json({
            success: false,
            message: "Event not found."
        });
    }

    res.json({
        success: true,
        event: enrichEventWithAvailability(event)
    });
});

/**
 * POST /api/public/registrations
 * Separate unauthenticated public registration endpoint.
 * Saves visitor details into backend/data/public-registrations.json.
 */
router.post("/api/public/registrations", (req, res) => {
    try {
        const body = req.body || {};
        const requestedSlug = String(body.eventSlug || body.slug || "").trim();
        const event = getEventBySlugOrId(requestedSlug);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "The selected event could not be found."
            });
        }

        const fullName = String(body.fullName || "").trim().slice(0, 100);
        const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
        const phone = String(body.phone || "").trim().slice(0, 30);
        const organization = String(body.organization || "").trim().slice(0, 120);
        const role = String(body.role || "").trim().slice(0, 100);
        const passTypeRaw = String(body.passType || "").trim().slice(0, 80);
        const notes = String(body.notes || "").trim().slice(0, 500);
        const attendeesRaw = Number.parseInt(body.attendees, 10);
        const attendees = Number.isFinite(attendeesRaw) ? attendeesRaw : 1;

        if (fullName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter your full name (at least 2 characters)."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        const phoneDigits = phone.replace(/\D/g, "");
        if (phoneDigits.length < 7 || phoneDigits.length > 15 || !/^[+\d\s().-]+$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid phone number (7 to 15 digits)."
            });
        }

        if (attendees < 1 || attendees > 5) {
            return res.status(400).json({
                success: false,
                message: "Number of attendees must be between 1 and 5."
            });
        }

        const allowedPasses = Array.isArray(event.passTypes) && event.passTypes.length
            ? event.passTypes
            : DEFAULT_EVENT.passTypes;
        const passType = allowedPasses.includes(passTypeRaw) ? passTypeRaw : allowedPasses[0];

        const registrations = readPublicRegistrations();

        const alreadyRegistered = registrations.some(
            item => item.email === email && item.eventSlug === event.slug
        );
        if (alreadyRegistered) {
            return res.status(409).json({
                success: false,
                message: "This email address is already registered for this event."
            });
        }

        const capacity = Math.max(1, Number.parseInt(event.capacity, 10) || 250);
        const currentCount = registrations
            .filter(item => item.eventSlug === event.slug)
            .reduce((total, item) => total + Math.max(1, Number.parseInt(item.attendees, 10) || 1), 0);

        if (currentCount + attendees > capacity) {
            return res.status(409).json({
                success: false,
                message: "Sorry, there are not enough spots remaining for this registration."
            });
        }

        const registration = {
            id: crypto.randomUUID(),
            confirmationCode: "ARAM-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
            eventSlug: event.slug,
            eventName: event.name,
            fullName,
            email,
            phone,
            organization,
            role,
            passType,
            attendees,
            notes,
            status: "Registered",
            createdAt: new Date().toISOString()
        };

        registrations.push(registration);
        writePublicRegistrations(registrations);

        return res.status(201).json({
            success: true,
            message: "Registration confirmed! We look forward to welcoming you.",
            registration: {
                id: registration.id,
                confirmationCode: registration.confirmationCode,
                eventSlug: registration.eventSlug,
                eventName: registration.eventName,
                fullName: registration.fullName,
                email: registration.email,
                phone: registration.phone,
                passType: registration.passType,
                attendees: registration.attendees,
                createdAt: registration.createdAt
            }
        });
    } catch (error) {
        console.error("PUBLIC REGISTRATION ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to complete registration right now. Please try again."
        });
    }
});

module.exports = router;
