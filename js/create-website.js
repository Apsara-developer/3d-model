
(() => {
    "use strict";

    const $ = id => document.getElementById(id);

    const tabs = document.querySelectorAll(".tab");

    // ================================================
    // AUTHENTICATION CHECK
    // ================================================

    async function checkAccount() {
        try {
            const response = await fetch("/api/auth/me", {
                credentials: "include"
            });

            if (response.status === 401) {
                location.href = "login.html";
                return false;
            }

            if (!response.ok) {
                throw new Error("Unable to verify account.");
            }

            const data = await response.json();

            const account = document.querySelector(".account");

            if (account && data.user) {
                account.textContent = data.user.name;
            }

            return true;

        } catch (error) {
            console.error("ACCOUNT ERROR:", error);
            $("generationStatus").textContent =
                "Unable to connect to the account server.";
            return false;
        }
    }

    // ================================================
    // TABS
    // ================================================

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {

            tabs.forEach(x => {
                x.classList.toggle("active", x === tab);
            });

            $("aiPanel").classList.toggle(
                "hidden",
                tab.dataset.tab !== "ai"
            );

            $("templatesPanel").classList.toggle(
                "hidden",
                tab.dataset.tab !== "templates"
            );
        });
    });

    // ================================================
    // PROMPT SUGGESTIONS
    // ================================================

    document.querySelectorAll("[data-prompt]").forEach(btn => {
        btn.addEventListener("click", () => {
            $("websitePrompt").value = btn.dataset.prompt;
            $("websitePrompt").focus();
        });
    });

    // ================================================
    // ESCAPE HTML
    // ================================================

    function escapeText(value) {
        return String(value).replace(/[&<>"']/g, c => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[c]);
    }

    // ================================================
    // TEMPLATE LOADING
    // ================================================

    let templateData = [];

    async function loadTemplates() {
        const grid = $("templateGrid");

        try {
            const response = await fetch("/api/templates", {
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to load templates.");
            }

            templateData = data.categories || [];

            renderTemplates();

        } catch (error) {
            grid.textContent = error.message;
        }
    }

    function renderTemplates() {

        const query = $("templateSearch").value
            .trim()
            .toLowerCase();

        const categories = templateData
            .map(category => ({
                ...category,

                templates: category.templates.filter(template =>
                    `${category.name} ${template.name} ${template.file}`
                        .toLowerCase()
                        .includes(query)
                )
            }))
            .filter(category => category.templates.length);

        if (!categories.length) {
            $("templateGrid").textContent =
                "No matching templates found.";
            return;
        }

        $("templateGrid").innerHTML = categories.map(category => `
            <article class="category-card">
                <h3>${escapeText(category.name)}</h3>

                ${category.templates.map(template => `
                    <a class="template-link"
                       href="editor.html?template=${encodeURIComponent(template.path)}">

                        <span>${escapeText(template.name)}</span>
                        <b>EDIT →</b>

                    </a>
                `).join("")}

            </article>
        `).join("");
    }

    $("templateSearch").addEventListener(
        "input",
        renderTemplates
    );

    // ================================================
    // GENERATE WEBSITE
    // ================================================

    $("generateBtn").addEventListener("click", async () => {

        const prompt = $("websitePrompt").value.trim();

        const file = $("flyerFile").files[0];

        const projectName = $("projectName").value.trim();

        const selectedDesign = document.querySelector(
            'input[name="designStyle"]:checked'
        );

        const design = selectedDesign
            ? selectedDesign.value
            : "Choose a unique design based on the idea";

        const btn = $("generateBtn");

        const status = $("generationStatus");

        if (!prompt) {
            status.textContent =
                "Please describe your website idea.";

            $("websitePrompt").focus();

            return;
        }

        if (file && file.size > 10 * 1024 * 1024) {
            status.textContent =
                "Please choose a file smaller than 10 MB.";

            return;
        }

        btn.disabled = true;

        btn.textContent = "✦ Creating your website...";

        status.textContent =
            "Preparing your idea and connecting to the local AI model...";

        try {

            // Confirm the account first.
            const authenticated = await checkAccount();

            if (!authenticated) {
                throw new Error("Please log in before generating a website.");
            }

            const form = new FormData();

            form.append("prompt", prompt);

            form.append("eventName", projectName);

            form.append("design", design);

            if (file) {
                form.append("flyer", file);
            }

            status.textContent =
                "AI is designing your website. This may take a few minutes for complex designs.";

            const response = await fetch(
                "/api/generate-website",
                {
                    method: "POST",

                    credentials: "include",

                    body: form
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Website generation failed."
                );
            }

            if (
                !result.html ||
                !/<html\b/i.test(result.html) ||
                !/<body\b/i.test(result.html)
            ) {
                throw new Error("AI returned incomplete website HTML.");
            }

            // Save generated website for the editor.
            localStorage.setItem(
                "aram-generated-website",
                result.html
            );

            localStorage.setItem(
                "aram-generated-title",
                result.title || projectName || "AI Website"
            );

            localStorage.setItem(
                "aram-current-project-id",
                result.projectId
            );

            localStorage.setItem(
                "aram-last-prompt",
                prompt
            );

            status.textContent =
                "Your unique website is ready! Opening editor...";

            location.href =
                "editor.html?generated=1&projectId=" +
                encodeURIComponent(result.projectId);

        } catch (error) {

            console.error("GENERATION ERROR:", error);

            status.textContent = error.message;

        } finally {

            btn.disabled = false;

            btn.innerHTML =
                "✦ Generate my unique website →";
        }

    });

    // ================================================
    // INITIALIZATION
    // ================================================

    async function initialize() {
        const authenticated = await checkAccount();

        if (!authenticated) return;

        await loadTemplates();
    }

    initialize();

})();
