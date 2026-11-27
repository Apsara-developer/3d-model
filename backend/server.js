
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { createWorker } = require("tesseract.js");
const crypto = require("crypto");

const {
    renderWebsite,
    fallbackPlan
} = require("./website-engine");

const publicRegistrationsRouter = require("./public-registrations");

const app = express();

// ==================================================
// CONFIGURATION
// ==================================================

const PORT = Number(process.env.PORT || 5000);

const FRONTEND = path.resolve(__dirname, "..");

const AI_PROVIDER = (
    process.env.AI_PROVIDER ||
    (process.env.NODE_ENV === "production" ? "groq" : "ollama")
).toLowerCase();

const OLLAMA_URL = (
    process.env.OLLAMA_URL || "http://127.0.0.1:11434"
).replace(/\/$/, "");

const OLLAMA_MODEL =
    process.env.OLLAMA_MODEL || "qwen2.5:0.5b";

const GROQ_API_URL =
    "https://api.groq.com/openai/v1/chat/completions";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

const GROQ_MODEL = process.env.GROQ_MODEL || "";

const DATA_DIR = path.join(__dirname, "data");

const USERS_FILE = path.join(DATA_DIR, "users.json");

const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

const sessions = new Map();

fs.mkdirSync(DATA_DIR, { recursive: true });

// ==================================================
// DATABASE
// ==================================================

function readJSON(file) {
    try {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, "[]", "utf8");
        }

        const data = JSON.parse(
            fs.readFileSync(file, "utf8")
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {
        console.error("DATABASE READ ERROR:", error.message);
        return [];
    }
}

function writeJSON(file, data) {
    fs.mkdirSync(DATA_DIR, { recursive: true });

    const tempFile = file + ".tmp";

    fs.writeFileSync(
        tempFile,
        JSON.stringify(data, null, 2),
        "utf8"
    );

    fs.renameSync(tempFile, file);
}

const readUsers = () => readJSON(USERS_FILE);

const readProjects = () => readJSON(PROJECTS_FILE);

const writeUsers = data => writeJSON(USERS_FILE, data);

const writeProjects = data => writeJSON(PROJECTS_FILE, data);

function makeProjectTitle(html, fallback = "My Website") {
    const match = String(html || "").match(
        /<title[^>]*>([\s\S]*?)<\/title>/i
    );

    return (
        match?.[1]?.replace(/<[^>]*>/g, "").trim() ||
        fallback
    ).slice(0, 120);
}

// ==================================================
// SHARED AI FUNCTION
// Supports Ollama and Groq
// ==================================================

async function generateAIResponse(
    prompt,
    {
        json = false,
        temperature = 0.5,
        maxTokens = 400,
        timeout = 60000
    } = {}
) {
    const cleanPrompt = String(prompt || "").trim();

    if (!cleanPrompt) {
        throw new Error("AI prompt cannot be empty.");
    }

    // ----------------------------------------------
    // LOCAL OLLAMA
    // ----------------------------------------------

    if (AI_PROVIDER === "ollama") {

        const response = await fetch(
            `${OLLAMA_URL}/api/generate`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                signal: AbortSignal.timeout(timeout),

                body: JSON.stringify({
                    model: OLLAMA_MODEL,
                    prompt: cleanPrompt,
                    stream: false,
                    keep_alive: "30m",

                    ...(json ? { format: "json" } : {}),

                    options: {
                        temperature,
                        top_p: 0.85,
                        num_ctx: json ? 2048 : 4096,
                        num_predict: maxTokens
                    }
                })
            }
        );

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                payload.error || "Ollama request failed."
            );
        }

        const result = String(
            payload.response || ""
        ).trim();

        if (!result) {
            throw new Error("Ollama returned an empty response.");
        }

        return result;
    }

    // ----------------------------------------------
    // GROQ CLOUD AI
    // ----------------------------------------------

    if (AI_PROVIDER === "groq") {

        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is missing.");
        }

        if (!GROQ_MODEL) {
            throw new Error("GROQ_MODEL is missing.");
        }

        const response = await fetch(
            GROQ_API_URL,
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },

                signal: AbortSignal.timeout(timeout),

                body: JSON.stringify({
                    model: GROQ_MODEL,

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are a helpful AI assistant. Follow instructions carefully. Return only the requested format."
                        },
                        {
                            role: "user",
                            content: cleanPrompt
                        }
                    ],

                    temperature,
                    max_tokens: maxTokens,

                    ...(json
                        ? {
                            response_format: {
                                type: "json_object"
                            }
                        }
                        : {})
                })
            }
        );

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage =
                payload.error?.message ||
                payload.error ||
                "Groq API request failed.";

            console.error("GROQ ERROR:", errorMessage);

            throw new Error(String(errorMessage));
        }

        const result = String(
            payload.choices?.[0]?.message?.content || ""
        ).trim();

        if (!result) {
            throw new Error("Groq returned an empty response.");
        }

        return result;
    }

    throw new Error(
        `Unsupported AI_PROVIDER: ${AI_PROVIDER}`
    );
}

// ==================================================
// AUTHENTICATION
// ==================================================

function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, 64, (error, key) => {
            if (error) return reject(error);

            resolve(key.toString("hex"));
        });
    });
}

function getCookie(req, name) {
    const header = req.headers.cookie || "";

    const part = header
        .split(";")
        .map(item => item.trim())
        .find(item => item.startsWith(name + "="));

    if (!part) return "";

    try {
        return decodeURIComponent(
            part.slice(name.length + 1)
        );
    } catch (_) {
        return "";
    }
}

function requireLogin(req, res, next) {
    const sid = getCookie(req, "aram_sid");

    const user = sessions.get(sid);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Please log in to continue."
        });
    }

    req.user = user;

    next();
}

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({
    limit: "20mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "20mb"
}));

app.use(express.static(FRONTEND, {
    index: false
}));

// ==================================================
// HOMEPAGE & PUBLIC EVENT PAGE
// ==================================================

app.get("/", (req, res) => {
    res.sendFile(
        path.join(FRONTEND, "home.html")
    );
});

app.get("/event", (req, res) => {
    res.sendFile(
        path.join(FRONTEND, "event.html")
    );
});

app.get("/events/:slug", (req, res) => {
    res.sendFile(
        path.join(FRONTEND, "event.html")
    );
});

app.use(publicRegistrationsRouter);

// ==================================================
// REGISTER
// ==================================================

app.post("/api/auth/register", async (req, res) => {
    try {
        const name = String(
            req.body?.name || ""
        ).trim().slice(0, 80);

        const email = String(
            req.body?.email || ""
        ).trim().toLowerCase();

        const password = String(
            req.body?.password || ""
        );

        if (
            !name ||
            !/^\S+@\S+\.\S+$/.test(email) ||
            password.length < 6
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter your name, a valid email and a password with at least 6 characters."
            });
        }

        const users = readUsers();

        if (users.some(user => user.email === email)) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const salt = crypto.randomBytes(16).toString("hex");

        const passwordHash = await hashPassword(
            password,
            salt
        );

        users.push({
            id: crypto.randomUUID(),
            name,
            email,
            salt,
            passwordHash,
            createdAt: new Date().toISOString()
        });

        writeUsers(users);

        res.json({
            success: true,
            message: "Account created. You can now log in."
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Could not create account."
        });
    }
});

// ==================================================
// LOGIN
// ==================================================

app.post("/api/auth/login", async (req, res) => {
    try {
        const email = String(
            req.body?.email || ""
        ).trim().toLowerCase();

        const password = String(
            req.body?.password || ""
        );

        const user = readUsers().find(
            item => item.email === email
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const supplied = Buffer.from(
            await hashPassword(password, user.salt),
            "hex"
        );

        const stored = Buffer.from(
            user.passwordHash,
            "hex"
        );

        if (
            supplied.length !== stored.length ||
            !crypto.timingSafeEqual(supplied, stored)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const sid = crypto.randomBytes(32).toString("hex");

        sessions.set(sid, {
            id: user.id,
            name: user.name,
            email: user.email
        });

        const production =
            process.env.NODE_ENV === "production";

        const cookie = [
            `aram_sid=${sid}`,
            "HttpOnly",
            "SameSite=Lax",
            "Path=/",
            "Max-Age=86400",
            ...(production ? ["Secure"] : [])
        ].join("; ");

        res.setHeader("Set-Cookie", cookie);

        res.json({
            success: true,

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
});

// ==================================================
// LOGOUT
// ==================================================

app.post("/api/auth/logout", (req, res) => {
    const sid = getCookie(req, "aram_sid");

    sessions.delete(sid);

    const production =
        process.env.NODE_ENV === "production";

    res.setHeader(
        "Set-Cookie",
        `aram_sid=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${production ? "; Secure" : ""}`
    );

    res.json({
        success: true,
        message: "Logged out successfully."
    });
});

// ==================================================
// CURRENT USER
// ==================================================

app.get("/api/auth/me", requireLogin, (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
});

// ==================================================
// FLYER UPLOAD
// ==================================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        const allowed = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
        ];

        if (allowed.includes(file.mimetype)) {
            return cb(null, true);
        }

        cb(new Error(
            "Only JPG, PNG, WEBP and PDF files are supported."
        ));
    }
});

function uploadMiddleware(req, res, next) {
    upload.single("flyer")(req, res, error => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        next();
    });
}

// ==================================================
// EXTRACT TEXT FROM FLYER
// ==================================================

async function extractFlyerText(file) {
    if (!file) return "";

    if (file.mimetype === "application/pdf") {
        const result = await pdfParse(file.buffer);

        return (result.text || "").trim();
    }

    if (file.mimetype.startsWith("image/")) {
        const worker = await createWorker("eng");

        try {
            const result = await worker.recognize(file.buffer);

            return (result.data.text || "").trim();

        } finally {
            await worker.terminate();
        }
    }

    return "";
}

// ==================================================
// EXTRACT EVENT DETAILS
// ==================================================

function extractEventDetails(value) {
    const lines = String(value || "")
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const full = lines.join(" ");

    const months =
        "January|February|March|April|May|June|July|August|September|October|November|December";

    const date = full.match(
        new RegExp(
            `\\b(?:\\d{1,2}[/.\\-]\\d{1,2}[/.\\-]\\d{2,4}|\\d{1,2}\\s+(?:${months})\\s+\\d{4}|(?:${months})\\s+\\d{1,2},?\\s+\\d{4})\\b`,
            "i"
        )
    );

    const time = full.match(
        /\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|A\.M\.|P\.M\.)\b/i
    );

    const venue = full.match(
        /\b(?:venue|location|address|held at)\s*[:\-]?\s*([^,\n]+(?:,\s*[^,\n]+)?)/i
    );

    const eventName = lines.find(line =>
        line.length >= 4 &&
        !/^(date|time|venue|location|register|contact|email)\b/i.test(line)
    ) || "";

    const description = lines
        .filter(line => line.length > 35)
        .slice(0, 5)
        .join(" ");

    return {
        eventName,
        eventDate: date?.[0] || "",
        eventTime: time?.[0] || "",
        venue: venue?.[1]?.trim() || "",
        description
    };
}

// ==================================================
// EXTRACT FLYER API
// ==================================================

app.post(
    "/api/extract-flyer",
    requireLogin,
    uploadMiddleware,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload an event flyer."
                });
            }

            const extractedText = await extractFlyerText(
                req.file
            );

            if (!extractedText) {
                return res.status(422).json({
                    success: false,
                    message: "No readable text found in the flyer."
                });
            }

            res.json({
                success: true,
                message: "Flyer details extracted.",
                data: extractEventDetails(extractedText),
                extractedText
            });

        } catch (error) {
            console.error("FLYER ERROR:", error);

            res.status(500).json({
                success: false,
                message: error.message ||
                    "Flyer extraction failed."
            });
        }
    }
);

// ==================================================
// AI WEBSITE CONTENT PLAN
// ==================================================

async function generateAIPlan(input) {
    const fallback = fallbackPlan(input);

    const prompt = `
You are an expert website art director and content strategist.

Create a short JSON website content plan.

USER IDEA:
${input.prompt || input.projectName || input.eventName || "Professional website"}

PROJECT NAME:
${input.projectName || ""}

EVENT INFORMATION:
${JSON.stringify({
    eventName: input.eventName,
    eventDate: input.eventDate,
    eventTime: input.eventTime,
    venue: input.venue,
    description: input.description,
    flyerText: String(input.flyerText || "").slice(0, 1800)
})}

DESIGN DIRECTION:
${input.design || "Choose a distinctive design based on the idea."}

Return ONLY valid JSON:

{
  "title": "short website title",
  "tagline": "original hero headline",
  "description": "short introduction",
  "sectionHeading": "interesting section heading",
  "intro": "supporting paragraph",
  "visualKeywords": "specific visual direction",
  "cta": "call to action",
  "cards": [
    {"title":"First feature","description":"short description"},
    {"title":"Second feature","description":"short description"},
    {"title":"Third feature","description":"short description"}
  ]
}

RULES:
- Use actual supplied details.
- Do not invent dates, addresses, speakers, sponsors or phone numbers.
- Keep descriptions short.
- Match the website category.
- Make the content distinctive.
- Do not return HTML or Markdown.
`;

    try {
        const rawResponse = await generateAIResponse(
            prompt,
            {
                json: true,
                temperature: 0.5,
                maxTokens: 500,
                timeout: 60000
            }
        );

        let raw = rawResponse
            .replace(/^```json/i, "")
            .replace(/```$/i, "")
            .trim();

        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");

        if (start === -1 || end <= start) {
            throw new Error("AI returned invalid JSON.");
        }

        const plan = JSON.parse(
            raw.slice(start, end + 1)
        );

        return {
            ...fallback,
            ...plan,

            cards:
                Array.isArray(plan.cards) && plan.cards.length
                    ? plan.cards.slice(0, 3)
                    : fallback.cards
        };

    } catch (error) {
        console.warn(
            "AI PLAN FALLBACK:",
            error.message
        );

        return fallback;
    }
}

// ==================================================
// HEALTH CHECK
// ==================================================

app.get("/api/health", async (req, res) => {
    let aiConnected = false;
    let aiMessage = "";

    if (AI_PROVIDER === "ollama") {
        try {
            const response = await fetch(
                `${OLLAMA_URL}/api/tags`,
                {
                    signal: AbortSignal.timeout(4000)
                }
            );

            aiConnected = response.ok;

            aiMessage = aiConnected
                ? "Ollama is reachable."
                : "Ollama is not responding.";

        } catch (_) {
            aiMessage =
                "Ollama is not reachable from this server.";
        }

    } else if (AI_PROVIDER === "groq") {

        aiConnected = Boolean(
            GROQ_API_KEY && GROQ_MODEL
        );

        aiMessage = aiConnected
            ? "Groq configuration is present."
            : "Configure GROQ_API_KEY and GROQ_MODEL.";
    }

    res.json({
        success: true,
        message: "Aram Events backend is running",
        provider: AI_PROVIDER,

        model:
            AI_PROVIDER === "groq"
                ? GROQ_MODEL
                : OLLAMA_MODEL,

        aiConnected,
        aiMessage,

        generationMode: "AI plan + Aram Website Engine"
    });
});

// ==================================================
// TEMPLATE LIBRARY
// ==================================================

app.get("/api/templates", (req, res) => {
    const root = path.join(
        FRONTEND,
        "templates"
    );

    const categories = [];

    if (!fs.existsSync(root)) {
        return res.json({
            success: true,
            categories
        });
    }

    for (const folder of fs.readdirSync(root, {
        withFileTypes: true
    })) {
        if (
            !folder.isDirectory() ||
            folder.name === "event-builder"
        ) {
            continue;
        }

        const dir = path.join(root, folder.name);

        const templates = fs.readdirSync(dir)
            .filter(file => /^\d.*\.html$/i.test(file))
            .map(file => ({
                name: file
                    .replace(/\.html$/i, "")
                    .replace(/^\d+[-_]?/, "")
                    .replace(/[-_]/g, " ")
                    .replace(/\b\w/g, c => c.toUpperCase()),

                file,

                path: `templates/${folder.name}/${file}`
            }));

        categories.push({
            name: folder.name
                .replace(/[-_]/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase()),

            folder: folder.name,
            templates
        });
    }

    res.json({
        success: true,
        categories
    });
});

// ==================================================
// WEBSITE GENERATION
// ==================================================

app.post(
    "/api/generate-website",
    requireLogin,
    uploadMiddleware,
    async (req, res) => {
        const startedAt = Date.now();

        try {
            const prompt = String(
                req.body?.prompt ||
                req.body?.idea ||
                ""
            ).trim();

            const projectName = String(
                req.body?.projectName ||
                req.body?.websiteName ||
                req.body?.eventName ||
                "My Website"
            ).trim();

            const design = String(
                req.body?.design ||
                req.body?.designStyle ||
                req.body?.style ||
                "Choose a distinctive design based on the website idea"
            ).trim();

            const eventName = String(
                req.body?.eventName || ""
            ).trim();

            const eventDate = String(
                req.body?.eventDate || ""
            ).trim();

            const eventTime = String(
                req.body?.eventTime || ""
            ).trim();

            const venue = String(
                req.body?.venue || ""
            ).trim();

            const description = String(
                req.body?.description || ""
            ).trim();

            const extractedText = String(
                req.body?.extractedText || ""
            );

            if (!prompt && !projectName && !req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Enter a website idea or upload a flyer."
                });
            }

            console.log("\n==================================");
            console.log("ARAM WEBSITE GENERATION");
            console.log("==================================");
            console.log("Idea:", prompt || projectName);
            console.log("Design:", design);
            console.log("Provider:", AI_PROVIDER);

            let flyerText = extractedText;

            if (req.file) {
                console.log("Reading uploaded flyer...");

                const uploadedText = await extractFlyerText(
                    req.file
                );

                flyerText = [
                    flyerText,
                    uploadedText
                ].filter(Boolean).join("\n");
            }

            const extracted = extractEventDetails(
                flyerText
            );

            const input = {
                prompt,
                projectName,
                design,

                eventName: eventName || extracted.eventName,
                eventDate: eventDate || extracted.eventDate,
                eventTime: eventTime || extracted.eventTime,
                venue: venue || extracted.venue,
                description: description || extracted.description,

                flyerText
            };

            console.log("Creating AI design plan...");

            const plan = await generateAIPlan(input);

            console.log("Rendering website...");

            const seed = crypto.randomInt(100000, 999999);

            const html = renderWebsite(
                input,
                plan,
                seed
            );

            const title = makeProjectTitle(
                html,
                projectName || "AI Website"
            );

            const project = {
                id: crypto.randomUUID(),
                userId: req.user.id,
                title,
                prompt: prompt.slice(0, 4000),
                design: design.slice(0, 120),
                html,
                layout: design,
                status: "Draft",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                publishedUrl: ""
            };

            const projects = readProjects();

            projects.unshift(project);

            writeProjects(projects);

            const duration = Date.now() - startedAt;

            console.log("Website created:", title);
            console.log("Generation time:", duration, "ms");
            console.log("==================================\n");

            res.json({
                success: true,

                message:
                    "Your website is ready. Custom AI images are loading in the background.",

                html,
                projectId: project.id,
                title,
                eventData: input,
                layout: plan,
                provider: AI_PROVIDER,

                model:
                    AI_PROVIDER === "groq"
                        ? GROQ_MODEL
                        : OLLAMA_MODEL,

                generationTime: duration
            });

        } catch (error) {
            console.error(
                "WEBSITE GENERATION ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to generate website."
            });
        }
    }
);

// ==================================================
// MY PROJECTS
// ==================================================

app.get("/api/projects", requireLogin, (req, res) => {
    const projects = readProjects()
        .filter(project => project.userId === req.user.id)
        .map(({ html, ...project }) => project);

    res.json({
        success: true,
        projects
    });
});

// ==================================================
// GET SINGLE PROJECT
// ==================================================

app.get("/api/projects/:id", requireLogin, (req, res) => {
    const project = readProjects().find(
        item =>
            item.id === req.params.id &&
            item.userId === req.user.id
    );

    if (!project) {
        return res.status(404).json({
            success: false,
            message: "Website project not found."
        });
    }

    res.json({
        success: true,
        project
    });
});

// ==================================================
// UPDATE PROJECT
// ==================================================

app.put("/api/projects/:id", requireLogin, (req, res) => {
    try {
        const projects = readProjects();

        const project = projects.find(
            item =>
                item.id === req.params.id &&
                item.userId === req.user.id
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Website project not found."
            });
        }

        const html = String(req.body?.html || "");

        if (
            !/<html\b/i.test(html) ||
            !/<body\b/i.test(html)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid website HTML is required."
            });
        }

        project.html = html;

        project.title = makeProjectTitle(
            html,
            project.title
        );

        project.updatedAt = new Date().toISOString();

        writeProjects(projects);

        res.json({
            success: true,

            message:
                "Your website has been saved to your account.",

            project: {
                id: project.id,
                title: project.title,
                updatedAt: project.updatedAt
            }
        });

    } catch (error) {
        console.error("PROJECT UPDATE ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Unable to save project."
        });
    }
});

// ==================================================
// EVENT BOOKINGS (persistent per-account booking management)
// ==================================================
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const readBookings = () => readJSON(BOOKINGS_FILE);
const writeBookings = data => writeJSON(BOOKINGS_FILE, data);

app.get("/api/bookings", requireLogin, (req, res) => {
    const bookings = readBookings()
        .filter(item => item.userId === req.user.id)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json({ success: true, bookings });
});

app.post("/api/bookings", requireLogin, (req, res) => {
    try {
        const body = req.body || {};
        const eventName = String(body.eventName || "").trim().slice(0, 140);
        const customerName = String(body.customerName || "").trim().slice(0, 100);
        const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
        const phone = String(body.phone || "").trim().slice(0, 30);
        const eventDate = String(body.eventDate || "").trim().slice(0, 30);
        const ticketType = String(body.ticketType || "General Admission").trim().slice(0, 80);
        const quantity = Math.max(1, Math.min(50, Number.parseInt(body.quantity, 10) || 1));
        const amount = Math.max(0, Math.min(10000000, Number(body.amount) || 0));
        const notes = String(body.notes || "").trim().slice(0, 1000);
        if (!eventName || !customerName || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, message: "Event, customer name and a valid email are required." });
        }
        const booking = {
            id: crypto.randomUUID(), userId: req.user.id,
            reference: "ARAM-" + crypto.randomBytes(3).toString("hex").toUpperCase(),
            eventName, customerName, email, phone, eventDate, ticketType, quantity,
            amount: Math.round(amount * 100) / 100, notes,
            status: "Confirmed", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
        };
        const bookings = readBookings();
        bookings.push(booking);
        writeBookings(bookings);
        res.status(201).json({ success: true, message: "Booking created successfully.", booking });
    } catch (error) {
        console.error("BOOKING CREATE ERROR:", error);
        res.status(500).json({ success: false, message: "Unable to create booking." });
    }
});

app.put("/api/bookings/:id", requireLogin, (req, res) => {
    const bookings = readBookings();
    const booking = bookings.find(item => item.id === req.params.id && item.userId === req.user.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    const allowed = ["eventName", "customerName", "email", "phone", "eventDate", "ticketType", "quantity", "amount", "notes", "status"];
    for (const key of allowed) {
        if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) {
            if (key === "quantity") booking[key] = Math.max(1, Math.min(50, Number.parseInt(req.body[key], 10) || 1));
            else if (key === "amount") booking[key] = Math.max(0, Number(req.body[key]) || 0);
            else booking[key] = String(req.body[key] ?? "").trim().slice(0, key === "notes" ? 1000 : 160);
        }
    }
    if (!/^\S+@\S+\.\S+$/.test(booking.email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });
    booking.updatedAt = new Date().toISOString();
    writeBookings(bookings);
    res.json({ success: true, booking });
});

app.delete("/api/bookings/:id", requireLogin, (req, res) => {
    const bookings = readBookings();
    const index = bookings.findIndex(item => item.id === req.params.id && item.userId === req.user.id);
    if (index < 0) return res.status(404).json({ success: false, message: "Booking not found." });
    const [booking] = bookings.splice(index, 1);
    writeBookings(bookings);
    res.json({ success: true, message: "Booking removed.", booking });
});

// ==================================================
// PRICING INFORMATION
// ==================================================

const ARAM_PRICING = {
    subscriptions: {
        Free: null,
        Basic: null,
        Premium: null
    },

    eventCategories: []
};

app.get("/api/pricing", (req, res) => {
    res.json({
        success: true,
        currency: "INR",
        pricing: ARAM_PRICING
    });
});

// ==================================================
// PUBLIC CHATBOT - ARAM ASSISTANT
// ==================================================

// This endpoint does not require login.
// Visitors can use the chatbot without registering.

const ARAM_FAQ = [
    {
        keywords: [
            "what subscription plans are available",
            "which subscription plans",
            "available subscription plans",
            "subscription plans",
            "pricing plans",
            "what plans are available"
        ],

        reply:
            "Aram Events offers three subscription plans:\n\n" +
            "1. Free Plan\n" +
            "2. Basic Plan\n" +
            "3. Premium Plan\n\n" +
            "For confirmed subscription prices and detailed plan information, please contact the Aram Events team."
    },

    {
        keywords: [
            "free plan",
            "basic plan",
            "premium plan"
        ],

        reply:
            "Aram Events offers Free, Basic and Premium subscription plans. " +
            "Please contact the Aram Events team for confirmed pricing and the exact features included in each plan."
    },

    {
        keywords: [
            "what is aram events",
            "about aram events",
            "what does aram events do",
            "tell me about aram"
        ],

        reply:
            "Aram Events is an AI-powered website creation platform. " +
            "You can generate event websites, create websites from posters, " +
            "explore templates, edit websites and manage your projects."
    },

    {
        keywords: [
            "create a website",
            "how to create website",
            "how can i create a website",
            "generate a website",
            "website generator"
        ],

        reply:
            "You can create a website using Aram Events:\n\n" +
            "1. Open AI Website Generator.\n" +
            "2. Enter your website or event idea.\n" +
            "3. Select your preferred design.\n" +
            "4. Add your event details if required.\n" +
            "5. Generate your website.\n" +
            "6. Edit and publish your website."
    },

    {
        keywords: [
            "upload poster",
            "upload a poster",
            "event poster",
            "flyer",
            "generate from poster"
        ],

        reply:
            "You can use the Generate from Poster feature to upload an event poster. " +
            "Aram Events supports JPG, PNG, WEBP and PDF files. " +
            "The platform extracts readable information to help create your event website."
    },

    {
        keywords: [
            "template",
            "templates",
            "template library"
        ],

        reply:
            "Aram Events provides a Template Library where you can explore available website designs and select a suitable template for your event."
    },

    {
        keywords: [
            "publish website",
            "how to publish",
            "publishing"
        ],

        reply:
            "After generating and editing your website, use the Publish option to publish it. You can also manage your saved websites through My Projects."
    },

    {
        keywords: [
            "login",
            "log in",
            "sign in"
        ],

        reply:
            "Open the Aram Events login page and enter your registered email address and password. If you do not have an account, select Register."
    },

    {
        keywords: [
            "register",
            "registration",
            "sign up",
            "create account"
        ],

        reply:
            "To register, open the Aram Events registration page. Enter your name, email address and password, and create your account."
    },

    {
        keywords: [
            "payment",
            "how to pay",
            "payment method",
            "upi",
            "bank details"
        ],

        reply:
            "Event website charges and AI website builder subscription charges are separate. Please contact the Aram Events team for confirmed payment details. I cannot confirm an online payment method or payment status."
    },

    {
        keywords: [
            "contact",
            "contact details",
            "customer support",
            "help"
        ],

        reply:
            "I can help you with Aram Events features, website creation, design ideas, templates and general platform guidance. For confirmed pricing or account-related assistance, please contact the Aram Events team."
    }
];

function getAramFAQAnswer(message) {
    const question = String(message || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    for (const item of ARAM_FAQ) {
        if (
            item.keywords.some(keyword =>
                question.includes(keyword.toLowerCase())
            )
        ) {
            return item.reply;
        }
    }

    return null;
}

// ==================================================
// CHATBOT API
// ==================================================

app.post("/api/chat", async (req, res) => {
    try {
        const message = String(
            req.body?.message || ""
        ).trim().slice(0, 3000);

        const history = Array.isArray(req.body?.history)
            ? req.body.history.slice(-8)
            : [];

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Type a message first."
            });
        }

        console.log("\n---------- ARAM CHATBOT ----------");
        console.log("Question:", message);

        // ------------------------------------------
        // 1. CHECK INSTANT FAQ
        // ------------------------------------------

        const faqAnswer = getAramFAQAnswer(message);

        if (faqAnswer) {
            console.log("Response: Instant FAQ");

            return res.json({
                success: true,
                reply: faqAnswer,
                source: "faq"
            });
        }

        // ------------------------------------------
        // 2. PREPARE CHAT HISTORY
        // ------------------------------------------

        const conversation = history
            .filter(item =>
                item &&
                ["user", "assistant"].includes(item.role)
            )
            .map(item => {
                const role =
                    item.role === "assistant"
                        ? "Assistant"
                        : "User";

                const content = String(
                    item.content || item.message || ""
                ).slice(0, 800);

                return `${role}: ${content}`;
            })
            .join("\n");

        // ------------------------------------------
        // 3. AI PROMPT
        // ------------------------------------------

        const prompt = `
You are Aram Assistant, the official AI assistant
inside the Aram Events platform.

ABOUT ARAM EVENTS:

Aram Events is an AI-powered event website creation platform.

AVAILABLE FEATURES:

1. AI Website Generator.
2. Generate Website from Poster.
3. Upload and extract event details from PDF and images.
4. Template Library.
5. Visual Website Editing.
6. My Projects.
7. Website Publishing.

SUBSCRIPTION PLANS:

- Free
- Basic
- Premium

PRICING RULES:

- Never invent subscription prices.
- Never invent event website prices.
- Never invent attendee limits.
- Never invent payment methods or UPI IDs.
- Subscription charges and event website charges are separate.
- If asked about pricing, explain that confirmed pricing
  must be obtained from the Aram Events team.
- Never claim that a payment has succeeded.

YOUR RESPONSIBILITIES:

Help visitors with:

- Aram Events platform information.
- Website creation.
- Event website ideas.
- Website prompts.
- Design concepts.
- Colour combinations.
- Typography.
- Website sections and layouts.
- Template selection.
- Flyer uploads.
- Website editing.
- Website publishing.
- Login and registration guidance.
- General troubleshooting.

RESPONSE STYLE:

- Use simple, friendly English.
- Be professional.
- Give short and useful answers.
- Provide numbered steps when needed.
- If asked for a website prompt, give a detailed ready-to-copy prompt.
- Do not invent company contact information.
- Do not claim to edit or publish a website yourself.
- If you do not know something, say so honestly.

PREVIOUS CONVERSATION:

${conversation || "No previous conversation."}

CURRENT USER QUESTION:

${message}

Write your response:
`;

        // ------------------------------------------
        // 4. CALL LOCAL OLLAMA OR GROQ
        // ------------------------------------------

        const reply = await generateAIResponse(
            prompt,
            {
                temperature: 0.4,
                maxTokens: 350,
                timeout: 60000
            }
        );

        console.log("Response: AI");
        console.log("----------------------------------\n");

        return res.json({
            success: true,
            reply,
            source: AI_PROVIDER
        });

    } catch (error) {
        console.error(
            "CHAT ERROR:",
            error.name,
            error.message
        );

        if (
            error.name === "TimeoutError" ||
            error.name === "AbortError"
        ) {
            return res.status(504).json({
                success: false,
                message:
                    "Aram Assistant is taking longer than expected. Please try again."
            });
        }

        return res.status(503).json({
            success: false,
            message:
                "Sorry, Aram Assistant is temporarily unavailable. Please try again in a moment."
        });
    }
});

// ==================================================
// PUBLISH WEBSITE
// ==================================================

app.post(
    "/api/publish",
    requireLogin,
    (req, res) => {
        try {
            const html = String(
                req.body?.html || ""
            );

            const raw = String(
                req.body?.slug || "my-website"
            ).toLowerCase();

            const slug = raw
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 50) || "my-website";

            if (
                !/<html\b/i.test(html) ||
                !/<body\b/i.test(html)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Valid website HTML is required."
                });
            }

            const publishRoot = path.join(
                FRONTEND,
                "published"
            );

            const dir = path.join(
                publishRoot,
                slug
            );

            fs.mkdirSync(dir, {
                recursive: true
            });

            fs.writeFileSync(
                path.join(dir, "index.html"),
                html,
                "utf8"
            );

            const projectId = String(
                req.body?.projectId || ""
            );

            if (projectId) {
                const projects = readProjects();

                const project = projects.find(
                    item =>
                        item.id === projectId &&
                        item.userId === req.user.id
                );

                if (project) {
                    project.status = "Published";

                    project.publishedUrl =
                        `/published/${slug}/`;

                    project.updatedAt =
                        new Date().toISOString();

                    writeProjects(projects);
                }
            }

            res.json({
                success: true,
                message: "Website published.",
                url: `/published/${slug}/`
            });

        } catch (error) {
            console.error("PUBLISH ERROR:", error);

            res.status(500).json({
                success: false,
                message: "Unable to publish website."
            });
        }
    }
);

// ==================================================
// API 404
// ==================================================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message:
            `API route not found: ${req.method} ${req.originalUrl}`
    });
});

// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use((error, req, res, next) => {
    console.error("SERVER ERROR:", error);

    if (res.headersSent) {
        return next(error);
    }

    res.status(500).json({
        success: false,
        message:
            error.message || "Internal server error."
    });
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {
    console.log("\n======================================");
    console.log(" ARAM EVENTS - AI WEBSITE BUILDER");
    console.log("======================================");

    console.log(`Website:   http://localhost:${PORT}`);
    console.log(`Event:     http://localhost:${PORT}/event`);
    console.log(`Homepage:  http://localhost:${PORT}/home.html`);
    console.log(`Dashboard: http://localhost:${PORT}/index.html`);
    console.log(`Create:    http://localhost:${PORT}/create-website.html`);
    console.log(`Editor:    http://localhost:${PORT}/editor.html`);
    console.log(`Projects:  http://localhost:${PORT}/projects.html`);

    console.log("--------------------------------------");

    console.log(`Health:    http://localhost:${PORT}/api/health`);
    console.log(`Pricing:   http://localhost:${PORT}/api/pricing`);

    console.log("--------------------------------------");

    console.log("AI Provider:", AI_PROVIDER);

    if (AI_PROVIDER === "ollama") {
        console.log("AI Model:", OLLAMA_MODEL);
        console.log("Ollama URL:", OLLAMA_URL);
    }

    if (AI_PROVIDER === "groq") {
        console.log("AI Model:", GROQ_MODEL || "NOT CONFIGURED");

        console.log(
            "Groq API Key:",
            GROQ_API_KEY ? "Configured" : "MISSING"
        );
    }

    console.log("--------------------------------------");

    console.log("Website Generator: AI + Website Engine");
    console.log("Chatbot: Public Aram Assistant");
    console.log("FAQ: Instant responses enabled");

    console.log("======================================\n");
});
