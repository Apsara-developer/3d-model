(() => {
    const exploreGrid = document.getElementById("exploreEventsGrid");
    const searchInput = document.getElementById("exploreSearch");
    const categoryButtons = document.querySelectorAll("#categoryFilters .cat-pill");
    const heroEventCount = document.getElementById("heroEventCount");

    const createForm = document.getElementById("createEventForm");
    const createAlert = document.getElementById("createEventAlert");
    const createSuccess = document.getElementById("createEventSuccess");
    const createdEventMessage = document.getElementById("createdEventMessage");
    const createdEventUrl = document.getElementById("createdEventUrl");
    const createAnotherBtn = document.getElementById("createAnotherEventBtn");
    const publishBtn = document.getElementById("publishEventBtn");

    const ceName = document.getElementById("ceName");
    const ceCategory = document.getElementById("ceCategory");
    const ceOrganizer = document.getElementById("ceOrganizer");
    const ceDescription = document.getElementById("ceDescription");
    const ceDate = document.getElementById("ceDate");
    const ceTime = document.getElementById("ceTime");
    const ceVenue = document.getElementById("ceVenue");
    const ceCity = document.getElementById("ceCity");
    const ceCapacity = document.getElementById("ceCapacity");
    const cePresetBanner = document.getElementById("cePresetBanner");
    const ceBannerFile = document.getElementById("ceBannerFile");
    const bannerDropzone = document.getElementById("bannerDropzone");
    const bannerFileName = document.getElementById("bannerFileName");

    const passChipsContainer = document.getElementById("passChips");
    const cePassInput = document.getElementById("cePassInput");
    const addPassBtn = document.getElementById("addPassBtn");
    const presetPassButtons = document.querySelectorAll("[data-preset-pass]");

    const previewBannerImg = document.getElementById("previewBannerImg");
    const previewCategory = document.getElementById("previewCategory");
    const previewDate = document.getElementById("previewDate");
    const previewTime = document.getElementById("previewTime");
    const previewTitle = document.getElementById("previewTitle");
    const previewDescription = document.getElementById("previewDescription");
    const previewVenue = document.getElementById("previewVenue");
    const previewPasses = document.getElementById("previewPasses");
    const previewCapacity = document.getElementById("previewCapacity");

    let allEvents = [];
    let activeCategory = "all";
    let passTypes = ["General Admission", "VIP Pass"];
    let customBannerObjectUrl = "";

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, ch => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[ch]));
    }

    function formatDatePreview(raw) {
        if (!raw) return "Select a date";
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            const parsed = new Date(`${raw}T12:00:00Z`);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    timeZone: "UTC"
                });
            }
        }
        return raw;
    }

    function renderPassChips() {
        passChipsContainer.innerHTML = passTypes.map(pass => `
            <span class="pass-chip">
                ${escapeHtml(pass)}
                <button type="button" data-remove-pass="${escapeHtml(pass)}" aria-label="Remove ${escapeHtml(pass)}">&times;</button>
            </span>
        `).join("");

        previewPasses.innerHTML = passTypes.slice(0, 3).map(pass => `
            <span class="mini-pass">${escapeHtml(pass)}</span>
        `).join("");
    }

    function addPassType(label) {
        const clean = String(label || "").trim().slice(0, 60);
        if (!clean) return;
        if (!passTypes.some(p => p.toLowerCase() === clean.toLowerCase())) {
            passTypes.push(clean);
            renderPassChips();
        }
    }

    passChipsContainer.addEventListener("click", event => {
        const removeBtn = event.target.closest("[data-remove-pass]");
        if (!removeBtn) return;
        const target = removeBtn.dataset.removePass;
        if (passTypes.length <= 1) return;
        passTypes = passTypes.filter(item => item !== target);
        renderPassChips();
    });

    addPassBtn.addEventListener("click", () => {
        addPassType(cePassInput.value);
        cePassInput.value = "";
        cePassInput.focus();
    });

    cePassInput.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            addPassType(cePassInput.value);
            cePassInput.value = "";
        }
    });

    presetPassButtons.forEach(btn => {
        btn.addEventListener("click", () => addPassType(btn.dataset.presetPass));
    });

    function syncLivePreview() {
        previewCategory.textContent = ceCategory.value || "Conference";
        previewDate.textContent = formatDatePreview(ceDate.value);
        previewTime.textContent = ceTime.value.trim() || "10:00 AM – 4:00 PM IST";
        previewTitle.textContent = ceName.value.trim() || "Your Event Title";
        previewDescription.textContent = ceDescription.value.trim() ||
            "Your event description will appear here so visitors can quickly understand what makes your gathering unmissable.";

        const venueParts = [ceVenue.value.trim(), ceCity.value.trim()].filter(Boolean);
        previewVenue.textContent = venueParts.length ? venueParts.join(" · ") : "Venue & City";

        const cap = Math.max(1, Number.parseInt(ceCapacity.value, 10) || 120);
        previewCapacity.textContent = `${cap} seats available`;

        if (!customBannerObjectUrl) {
            previewBannerImg.src = cePresetBanner.value || "assets/event-banner.svg";
        }
    }

    [ceName, ceCategory, ceDescription, ceDate, ceTime, ceVenue, ceCity, ceCapacity, cePresetBanner]
        .forEach(el => {
            el.addEventListener("input", syncLivePreview);
            el.addEventListener("change", syncLivePreview);
        });

    function handleBannerSelection(file) {
        if (customBannerObjectUrl) {
            URL.revokeObjectURL(customBannerObjectUrl);
            customBannerObjectUrl = "";
        }
        if (!file) {
            bannerFileName.textContent = "Click to choose a banner image or drag and drop here";
            syncLivePreview();
            return;
        }
        customBannerObjectUrl = URL.createObjectURL(file);
        previewBannerImg.src = customBannerObjectUrl;
        bannerFileName.textContent = `Selected: ${file.name}`;
    }

    ceBannerFile.addEventListener("change", () => {
        handleBannerSelection(ceBannerFile.files && ceBannerFile.files[0]);
    });

    bannerDropzone.addEventListener("dragover", event => {
        event.preventDefault();
        bannerDropzone.classList.add("drag-active");
    });

    bannerDropzone.addEventListener("dragleave", () => {
        bannerDropzone.classList.remove("drag-active");
    });

    bannerDropzone.addEventListener("drop", event => {
        event.preventDefault();
        bannerDropzone.classList.remove("drag-active");
        const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        if (!file) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        ceBannerFile.files = dt.files;
        handleBannerSelection(file);
    });

    function renderExploreGrid() {
        const query = (searchInput.value || "").trim().toLowerCase();

        const filtered = allEvents.filter(ev => {
            const catLower = String(ev.category || "").toLowerCase();
            const activeLower = activeCategory.toLowerCase();
            const catMatch = activeCategory === "all" ||
                catLower === activeLower ||
                (activeLower === "conference" && catLower.includes("conference"));
            if (!catMatch) return false;
            if (!query) return true;
            return [ev.name, ev.tagline, ev.description, ev.venue, ev.city, ev.category, ev.organizer]
                .join(" ")
                .toLowerCase()
                .includes(query);
        });

        if (!filtered.length) {
            exploreGrid.innerHTML = `
                <div class="events-empty">
                    <h3>No matching events found</h3>
                    <p>Try clearing your search or create a new event below to publish it here.</p>
                </div>
            `;
            return;
        }

        exploreGrid.innerHTML = filtered.map(ev => {
            const spots = Number(ev.spotsRemaining ?? ev.capacity ?? 0);
            const isFull = spots <= 0;
            const passes = Array.isArray(ev.passTypes) ? ev.passTypes.slice(0, 3) : [];
            const detailUrl = `/event?slug=${encodeURIComponent(ev.slug)}`;
            const registerUrl = `/event?slug=${encodeURIComponent(ev.slug)}&register=1`;

            return `
                <article class="event-card">
                    <a href="${detailUrl}" class="event-card-media" aria-label="View ${escapeHtml(ev.name)}">
                        <img src="${escapeHtml(ev.bannerImage || "assets/event-banner.svg")}" alt="${escapeHtml(ev.bannerAlt || ev.name)}" loading="lazy">
                        <span class="event-cat-badge">${escapeHtml(ev.category || "Event")}</span>
                    </a>
                    <div class="event-card-body">
                        <div class="event-card-meta">
                            <span>${escapeHtml(ev.date)}</span>
                            <span aria-hidden="true">·</span>
                            <span>${escapeHtml(ev.time)}</span>
                        </div>
                        <h3><a href="${detailUrl}">${escapeHtml(ev.name)}</a></h3>
                        <p>${escapeHtml(ev.description)}</p>
                        <div class="event-card-venue">${escapeHtml([ev.venue, ev.city].filter(Boolean).join(" · "))}</div>
                        <div class="event-card-passes">
                            ${passes.map(p => `<span class="mini-pass">${escapeHtml(p)}</span>`).join("")}
                        </div>
                        <div class="event-card-footer">
                            <span class="spots-pill ${isFull ? "sold-out" : ""}">
                                ${isFull ? "Capacity reached" : `${spots} spots left`}
                            </span>
                            <div class="event-card-actions">
                                <a href="${detailUrl}" class="event-view-btn">
                                    View Website →
                                </a>
                                <a href="${registerUrl}" class="event-card-cta">
                                    Register
                                </a>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    }

    function updateHeroShowcase(events) {
        if (!Array.isArray(events) || !events.length) return;
        if (heroEventCount) {
            heroEventCount.textContent = String(events.length);
        }
        const featured = events.find(e => e.featured) || events[0];
        const titleEl = document.getElementById("showcaseTitle");
        const metaEl = document.getElementById("showcaseMeta");
        const spotsEl = document.getElementById("showcaseSpots");
        const linkEl = document.getElementById("showcaseLink");

        if (titleEl) titleEl.textContent = featured.name;
        if (metaEl) metaEl.textContent = [featured.date, featured.city || featured.venue].filter(Boolean).join(" · ");
        if (spotsEl) spotsEl.textContent = `${featured.spotsRemaining} of ${featured.capacity} spots open`;
        if (linkEl) linkEl.href = `/event?slug=${encodeURIComponent(featured.slug)}`;
    }

    async function loadEvents() {
        try {
            const response = await fetch("/api/events");
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Could not load events.");
            }
            allEvents = Array.isArray(data.events) ? data.events : [];
            updateHeroShowcase(allEvents);
            renderExploreGrid();
        } catch (error) {
            exploreGrid.innerHTML = `<div class="events-empty"><p>${escapeHtml(error.message)}</p></div>`;
        }
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryButtons.forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            activeCategory = button.dataset.category || "all";
            renderExploreGrid();
        });
    });

    searchInput.addEventListener("input", renderExploreGrid);

    function showCreateError(message) {
        createAlert.textContent = message;
        createAlert.hidden = false;
    }

    function clearCreateError() {
        createAlert.textContent = "";
        createAlert.hidden = true;
    }

    createForm.addEventListener("submit", async event => {
        event.preventDefault();
        clearCreateError();
        createSuccess.hidden = true;

        const name = ceName.value.trim();
        const organizer = ceOrganizer.value.trim();
        const description = ceDescription.value.trim();
        const date = ceDate.value.trim();
        const time = ceTime.value.trim();
        const venue = ceVenue.value.trim();
        const city = ceCity.value.trim();
        const capacity = Number.parseInt(ceCapacity.value, 10);

        if (name.length < 3) {
            return showCreateError("Please enter an event name (at least 3 characters).");
        }
        if (!organizer) {
            return showCreateError("Please enter the organizer name.");
        }
        if (description.length < 15) {
            return showCreateError("Please enter an event description (at least 15 characters).");
        }
        if (!date || !time || !venue) {
            return showCreateError("Please fill in the event date, time, and venue.");
        }
        if (!Number.isFinite(capacity) || capacity < 1) {
            return showCreateError("Please enter a valid seat capacity (at least 1).");
        }
        if (!passTypes.length) {
            return showCreateError("Please include at least one ticket or pass type.");
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("category", ceCategory.value);
        formData.append("organizer", organizer);
        formData.append("tagline", document.getElementById("ceTagline").value.trim());
        formData.append("description", description);
        formData.append("date", date);
        formData.append("time", time);
        formData.append("venue", venue);
        formData.append("city", city);
        formData.append("address", document.getElementById("ceAddress").value.trim());
        formData.append("capacity", String(capacity));
        formData.append("presetBanner", cePresetBanner.value);
        formData.append("passTypes", JSON.stringify(passTypes));

        if (ceBannerFile.files && ceBannerFile.files[0]) {
            formData.append("banner", ceBannerFile.files[0]);
        }

        publishBtn.disabled = true;
        publishBtn.textContent = "Publishing Event...";

        try {
            const response = await fetch("/api/events", {
                method: "POST",
                body: formData
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Could not publish event. Please try again.");
            }

            createdEventMessage.textContent =
                `"${result.event.name}" is now live in Explore Events and ready for public registration.`;
            createdEventUrl.href = result.publicUrl || `/event?slug=${encodeURIComponent(result.event.slug)}`;
            createSuccess.hidden = false;

            await loadEvents();
            createSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } catch (error) {
            showCreateError(error.message || "Could not publish event.");
        } finally {
            publishBtn.disabled = false;
            publishBtn.textContent = "Create & Publish Event →";
        }
    });

    createAnotherBtn.addEventListener("click", () => {
        createForm.reset();
        passTypes = ["General Admission", "VIP Pass"];
        renderPassChips();
        handleBannerSelection(null);
        createSuccess.hidden = true;
        clearCreateError();
        syncLivePreview();
        ceName.focus();
    });

    // Initialize default date to 2 weeks out for smoother demo UX
    if (ceDate && !ceDate.value) {
        const upcoming = new Date(Date.now() + 14 * 86400000);
        ceDate.value = upcoming.toISOString().slice(0, 10);
    }

    renderPassChips();
    syncLivePreview();
    loadEvents();
})();
