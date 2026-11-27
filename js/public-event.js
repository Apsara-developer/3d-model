(() => {
    const modal = document.getElementById("registrationModal");
    const form = document.getElementById("registrationForm");
    const formAlert = document.getElementById("formAlert");
    const submitBtn = document.getElementById("submitRegistrationBtn");
    const successPanel = document.getElementById("registrationSuccess");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelModalBtn");
    const doneSuccessBtn = document.getElementById("doneSuccessBtn");
    const registerAnotherBtn = document.getElementById("registerAnotherBtn");
    const openTriggers = document.querySelectorAll("[data-open-register]");

    let lastFocusedElement = null;
    let currentEventSlug = "";

    function resolveRequestedSlug() {
        const params = new URLSearchParams(window.location.search);
        const querySlug = params.get("slug");
        if (querySlug) return querySlug.trim();
        const pathMatch = window.location.pathname.match(/^\/events\/([^/]+)\/?$/i);
        return pathMatch ? decodeURIComponent(pathMatch[1]) : "";
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[ch]));
    }

    function showAlert(message, type = "error") {
        formAlert.textContent = message;
        formAlert.className = `form-alert ${type}`;
        formAlert.hidden = false;
    }

    function clearAlert() {
        formAlert.textContent = "";
        formAlert.hidden = true;
    }

    function showFormView() {
        form.hidden = false;
        successPanel.hidden = true;
        clearAlert();
    }

    function openModal(trigger) {
        lastFocusedElement = trigger || document.activeElement;
        modal.hidden = false;
        document.body.classList.add("modal-open");
        clearAlert();

        const firstInput = form.hidden ? doneSuccessBtn : document.getElementById("fullName");
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 20);
        }
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("modal-open");
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    openTriggers.forEach(button => {
        button.addEventListener("click", () => openModal(button));
    });

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);
    doneSuccessBtn.addEventListener("click", closeModal);

    registerAnotherBtn.addEventListener("click", () => {
        form.reset();
        showFormView();
        document.getElementById("fullName").focus();
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    function renderEventDetails(eventData) {
        if (!eventData) return;

        currentEventSlug = eventData.slug || currentEventSlug;

        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el && value) el.textContent = value;
        };

        if (eventData.name) {
            document.title = `${eventData.name} | ${eventData.organizer || "Aram Events"}`;
        }

        setText("eventCategory", eventData.category);
        setText("eventName", eventData.name);
        setText("eventTagline", eventData.tagline);
        setText("eventDescription", eventData.description);
        setText("eventDate", eventData.date);
        setText("eventTime", eventData.time);
        setText("eventVenue", [eventData.venue, eventData.city].filter(Boolean).join(" · "));
        setText("doorsOpenNote", eventData.doorsOpen);
        setText("venueTitle", eventData.venue);
        setText("venueAddress", eventData.address);
        setText("ctaDateTime", [eventData.date, eventData.time].filter(Boolean).join(" · "));
        setText("ctaOrganizer", eventData.organizer);
        setText(
            "modalEventSubtitle",
            [eventData.date, eventData.venue, eventData.city].filter(Boolean).join(" · ")
        );

        const banner = document.getElementById("eventBanner");
        if (banner && eventData.bannerImage) {
            const src = String(eventData.bannerImage);
            banner.src = /^https?:\/\/|^\//i.test(src) ? src : `/${src}`;
            if (eventData.bannerAlt) {
                banner.alt = eventData.bannerAlt;
            }
        }

        const passTagsEl = document.getElementById("eventPassTags");
        if (passTagsEl && Array.isArray(eventData.passTypes) && eventData.passTypes.length) {
            passTagsEl.innerHTML = eventData.passTypes
                .map(pass => `<span class="pass-tag">${escapeHtml(pass)}</span>`)
                .join("");
        }

        if (typeof eventData.spotsRemaining === "number") {
            const spotsNote = document.getElementById("spotsNote");
            if (spotsNote) {
                spotsNote.textContent = eventData.spotsRemaining > 0
                    ? `${eventData.spotsRemaining} spots available · No account or sign-in required.`
                    : "Registration capacity reached.";
            }
        }

        if (Array.isArray(eventData.highlights) && eventData.highlights.length) {
            const grid = document.getElementById("highlightsGrid");
            if (grid) {
                grid.innerHTML = eventData.highlights.map(item => `
                    <article class="info-card">
                        <span class="card-kicker">${escapeHtml(item.label)}</span>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.detail)}</p>
                    </article>
                `).join("");
            }
        }

        if (Array.isArray(eventData.schedule) && eventData.schedule.length) {
            const list = document.getElementById("scheduleList");
            if (list) {
                list.innerHTML = eventData.schedule.map(slot => `
                    <li class="schedule-item">
                        <span class="schedule-time">${escapeHtml(slot.time)}</span>
                        <div class="schedule-content">
                            <h3>${escapeHtml(slot.title)}</h3>
                            <p>${escapeHtml(slot.description)}</p>
                        </div>
                    </li>
                `).join("");
            }
        }

        if (Array.isArray(eventData.passTypes) && eventData.passTypes.length) {
            const passSelect = document.getElementById("passType");
            if (passSelect) {
                passSelect.innerHTML = eventData.passTypes
                    .map(pass => `<option value="${escapeHtml(pass)}">${escapeHtml(pass)}</option>`)
                    .join("");
            }
        }
    }

    async function loadPublicEvent() {
        try {
            const slug = resolveRequestedSlug();
            const endpoint = slug
                ? `/api/public/event?slug=${encodeURIComponent(slug)}`
                : "/api/public/event";
            const response = await fetch(endpoint);
            if (!response.ok) return;
            const payload = await response.json();
            if (payload && payload.success && payload.event) {
                renderEventDetails(payload.event);
            }
        } catch (_) {
            // Static HTML defaults remain visible if API cannot be reached.
        }
    }

    function validateClient(data) {
        if (!data.fullName || data.fullName.trim().length < 2) {
            return "Please enter your full name.";
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            return "Please enter a valid email address.";
        }
        const digits = data.phone.replace(/\D/g, "");
        if (digits.length < 7 || digits.length > 15 || !/^[+\d\s().-]+$/.test(data.phone)) {
            return "Please enter a valid phone number (7 to 15 digits).";
        }
        return null;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();
        clearAlert();

        const payload = {
            eventSlug: currentEventSlug || resolveRequestedSlug(),
            fullName: document.getElementById("fullName").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            organization: document.getElementById("organization").value.trim(),
            role: document.getElementById("role").value.trim(),
            passType: document.getElementById("passType").value,
            attendees: Number.parseInt(document.getElementById("attendees").value, 10) || 1,
            notes: document.getElementById("notes").value.trim()
        };

        const clientError = validateClient(payload);
        if (clientError) {
            showAlert(clientError, "error");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {
            const response = await fetch("/api/public/registrations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Could not submit your registration. Please try again.");
            }

            const reg = result.registration || {};
            document.getElementById("successMessage").textContent =
                result.message || "Registration confirmed!";
            document.getElementById("confirmCode").textContent = reg.confirmationCode || "Confirmed";
            document.getElementById("confirmName").textContent = reg.fullName || payload.fullName;
            document.getElementById("confirmPass").textContent =
                `${reg.passType || payload.passType} (${reg.attendees || payload.attendees})`;
            document.getElementById("confirmEmail").textContent = reg.email || payload.email;

            form.hidden = true;
            successPanel.hidden = false;
            loadPublicEvent();
        } catch (error) {
            showAlert(error.message || "Unable to submit registration right now.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Complete Registration";
        }
    });

    loadPublicEvent();
})();
