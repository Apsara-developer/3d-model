/* ============================================================
   ARAM EVENTS — Dynamic 3D Event Engine (event-3d.js)
   Renders category-specific Three.js worlds, GSAP transitions,
   real backend event data, and a 4-step QR registration flow.
   ============================================================ */

'use strict';

(function () {
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const THEME_PALETTES = {
    'theme-music':      { bg: 0x020008, fog: 0x08021a, primary: 0x7c3aed, secondary: 0x06b6d4, accent: 0xe879f9 },
    'theme-tech':       { bg: 0x000d1a, fog: 0x001428, primary: 0x0891b2, secondary: 0x3b82f6, accent: 0x67e8f9 },
    'theme-workshop':   { bg: 0x0d0800, fog: 0x1a1000, primary: 0xd97706, secondary: 0xf97316, accent: 0xfcd34d },
    'theme-conference': { bg: 0x03060f, fog: 0x060c1e, primary: 0x4f46e5, secondary: 0x6366f1, accent: 0xc7d2fe },
    'theme-festival':   { bg: 0x05000a, fog: 0x0a0012, primary: 0xdb2777, secondary: 0xf59e0b, accent: 0x06b6d4 }
  };

  class EventEngine {
    constructor() {
      this.eventData = null;
      this.themeName = 'theme-music';
      this.currentStep = 1;
      this.selectedPass = '';
      this.isSubmitting = false;
    }

    getSlugFromUrl() {
      const params = new URLSearchParams(window.location.search);
      const qSlug = params.get('slug');
      if (qSlug) return qSlug.trim();
      const match = window.location.pathname.match(/\/events\/([^/]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
      return 'bharadwaj-autograph';
    }

    detectTheme(category) {
      const cat = String(category || '').toLowerCase();
      if (/tech|summit|innovation|ai|software|digital|cyber/.test(cat)) return 'theme-tech';
      if (/workshop|lab|craft|design|ux|bootcamp|masterclass/.test(cat)) return 'theme-workshop';
      if (/festival|courtyard|carnival|fair|celebration/.test(cat)) return 'theme-festival';
      if (/conference|annual|symposium|forum|summit/.test(cat)) return 'theme-conference';
      if (/music|culture|concert|sound|live|night/.test(cat)) return 'theme-music';
      return 'theme-conference';
    }

    async loadEventData(slug) {
      const res = await fetch(`/api/public/event?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error(`Event not found (${res.status})`);
      const data = await res.json();
      if (!data.success || !data.event) throw new Error('Invalid event payload');
      return data.event;
    }

    applyTheme(theme) {
      this.themeName = theme;
      document.body.className = theme;
    }

    renderEventContent(ev) {
      document.title = `${ev.name} | Aram Events`;
      const loaderName = $('#e3d-loader-name');
      if (loaderName) loaderName.textContent = ev.name;

      // Hero
      const catEl = $('#e3d-event-category');
      if (catEl) catEl.textContent = ev.category || 'Aram Events Showcase';

      const nameEl = $('#e3d-event-name');
      if (nameEl) {
        const words = String(ev.name || '').split(' ');
        if (words.length >= 3) {
          const mid = Math.ceil(words.length / 2);
          nameEl.innerHTML = `<span>${escapeHtml(words.slice(0, mid).join(' '))}</span><span>${escapeHtml(words.slice(mid).join(' '))}</span>`;
        } else {
          nameEl.innerHTML = `<span>${escapeHtml(ev.name)}</span>`;
        }
      }

      const tagEl = $('#e3d-event-tagline');
      if (tagEl) tagEl.textContent = ev.tagline || '';

      const setMeta = (id, icon, text) => {
        const el = $(`#${id}`);
        if (el) el.innerHTML = text ? `<span aria-hidden="true">${icon}</span> ${escapeHtml(text)}` : '';
      };
      setMeta('e3d-hero-date', '📅', ev.date);
      setMeta('e3d-hero-time', '🕔', ev.time);
      setMeta('e3d-hero-venue', '📍', [ev.venue, ev.city].filter(Boolean).join(', '));

      // About
      const bannerImg = $('#e3d-banner-img');
      const bannerWrap = $('#e3d-banner-wrap');
      if (bannerImg && bannerWrap) {
        const src = ev.bannerImage ? (ev.bannerImage.startsWith('/') ? ev.bannerImage : `/${ev.bannerImage}`) : '/assets/event-banner.svg';
        bannerImg.src = src;
        bannerImg.alt = ev.bannerAlt || ev.name;
        bannerImg.onerror = () => {
          bannerWrap.innerHTML = `<div class="e3d-about-banner-fallback"><div class="fi">✦</div><div>${escapeHtml(ev.name)}</div></div>`;
        };
      }
      const aboutName = $('#e3d-about-name');
      if (aboutName) aboutName.textContent = ev.name;
      const descEl = $('#e3d-event-description');
      if (descEl) descEl.textContent = ev.description || '';

      // Highlights
      const hlGrid = $('#e3d-highlights-grid');
      const hlSection = $('#e3d-highlights');
      const highlights = Array.isArray(ev.highlights) ? ev.highlights : [];
      if (hlGrid && highlights.length) {
        const icons = ['✦', '⚡', '🎯', '🌟', '🔥', '💎'];
        hlGrid.innerHTML = highlights.map((item, idx) => {
          const isObj = item && typeof item === 'object';
          const title = isObj ? (item.title || `Highlight ${idx + 1}`) : String(item);
          const detail = isObj ? (item.description || '') : '';
          const icon = isObj && item.icon ? item.icon : icons[idx % icons.length];
          return `
            <div class="e3d-card erev erev-d${(idx % 3) + 1}">
              <span class="e3d-card-icon" aria-hidden="true">${escapeHtml(icon)}</span>
              <div class="e3d-card-label">Highlight 0${idx + 1}</div>
              <div class="e3d-card-title">${escapeHtml(title)}</div>
              ${detail ? `<div class="e3d-card-detail">${escapeHtml(detail)}</div>` : ''}
            </div>
          `;
        }).join('');
      } else if (hlSection) {
        hlSection.style.display = 'none';
      }

      // Details grid
      const detGrid = $('#e3d-details-grid');
      if (detGrid) {
        const spots = ev.spotsRemaining !== undefined ? `${ev.spotsRemaining} spots left` : (ev.capacity ? `${ev.capacity} Guests` : 'Open');
        const cards = [
          { icon: '📅', label: 'Date', title: ev.date || 'TBA', detail: '' },
          { icon: '🕔', label: 'Time', title: ev.time || 'TBA', detail: ev.doorsOpen ? `Doors open: ${ev.doorsOpen}` : '' },
          { icon: '📍', label: 'Venue', title: ev.venue || 'TBA', detail: ev.city || '' },
          { icon: '🏷️', label: 'Category', title: ev.category || 'Event', detail: ev.status || 'Published' },
          { icon: '🎟️', label: 'Availability', title: spots, detail: ev.capacity ? `Total capacity: ${ev.capacity}` : '' },
          { icon: '🌟', label: 'Organizer', title: ev.organizer || 'Aram Events', detail: ev.contactEmail || '' }
        ];
        detGrid.innerHTML = cards.map((c, idx) => `
          <div class="e3d-card erev erev-d${(idx % 3) + 1}">
            <span class="e3d-card-icon" aria-hidden="true">${c.icon}</span>
            <div class="e3d-card-label">${escapeHtml(c.label)}</div>
            <div class="e3d-card-title">${escapeHtml(c.title)}</div>
            ${c.detail ? `<div class="e3d-card-detail">${escapeHtml(c.detail)}</div>` : ''}
          </div>
        `).join('');
      }

      // Schedule
      const schList = $('#e3d-schedule-list');
      const schSection = $('#e3d-schedule');
      const schedule = Array.isArray(ev.schedule) ? ev.schedule : [];
      if (schList && schedule.length) {
        schList.innerHTML = schedule.map(item => `
          <div class="e3d-schedule-item erev">
            <div class="e3d-schedule-time">${escapeHtml(item.time || '')}</div>
            <div class="e3d-schedule-title">${escapeHtml(item.title || '')}</div>
            ${item.description ? `<div class="e3d-schedule-desc">${escapeHtml(item.description)}</div>` : ''}
          </div>
        `).join('');
      } else if (schSection) {
        schSection.style.display = 'none';
      }

      // Venue
      const mapQuery = encodeURIComponent([ev.venue, ev.address, ev.city].filter(Boolean).join(', '));
      const mapUrl = `https://maps.google.com/?q=${mapQuery}`;
      if ($('#e3d-venue-map-name')) $('#e3d-venue-map-name').textContent = ev.venue || 'Venue TBA';
      if ($('#e3d-venue-map-city')) $('#e3d-venue-map-city').textContent = ev.city || '';
      if ($('#e3d-venue-map-link')) $('#e3d-venue-map-link').href = mapUrl;
      if ($('#e3d-venue-dir-link')) $('#e3d-venue-dir-link').href = mapUrl;
      if ($('#e3d-venue-name')) $('#e3d-venue-name').textContent = ev.venue || 'Venue TBA';
      if ($('#e3d-venue-address')) $('#e3d-venue-address').textContent = [ev.address, ev.city].filter(Boolean).join(', ') || 'Address TBA';
      const tagsEl = $('#e3d-venue-tags');
      if (tagsEl) {
        const tags = [ev.city, ev.doorsOpen ? `Doors: ${ev.doorsOpen}` : null, ev.capacity ? `Capacity: ${ev.capacity}` : null].filter(Boolean);
        tagsEl.innerHTML = tags.map(t => `<span class="e3d-venue-tag">${escapeHtml(t)}</span>`).join('');
      }

      // Tickets section
      const tixGrid = $('#e3d-tickets-grid');
      const passes = Array.isArray(ev.passTypes) && ev.passTypes.length ? ev.passTypes : ['General Admission'];
      if (tixGrid) {
        const icons = ['🎟', '✦', '👑', '⚡'];
        tixGrid.innerHTML = passes.map((p, idx) => {
          const passName = typeof p === 'object' ? (p.name || p.label) : String(p);
          const passPrice = typeof p === 'object' && p.price ? `<div style="color:var(--e-accent);font-weight:700;margin-bottom:1rem;">${escapeHtml(p.price)}</div>` : '';
          const featured = idx === 0 && passes.length > 1 ? ' featured' : '';
          return `
            <div class="e3d-ticket-card${featured} erev erev-d${(idx % 3) + 1}">
              ${featured ? '<div class="e3d-ticket-featured-badge">Recommended</div>' : ''}
              <div class="e3d-ticket-icon" aria-hidden="true">${icons[idx % icons.length]}</div>
              <div class="e3d-ticket-name">${escapeHtml(passName)}</div>
              ${passPrice}
              <button type="button" class="e3d-ticket-btn" data-e3d-open data-pass="${escapeHtml(passName)}">
                Book ${escapeHtml(passName)}
              </button>
            </div>
          `;
        }).join('');
      }

      if ($('#e3d-spots-note') && ev.spotsRemaining !== undefined) {
        $('#e3d-spots-note').textContent = `${ev.spotsRemaining} spots remaining · Instant confirmation, no account required.`;
      }

      // CTA & Footer
      if ($('#e3d-cta-name')) $('#e3d-cta-name').textContent = ev.name;
      if ($('#e3d-cta-sub')) $('#e3d-cta-sub').textContent = `${ev.date || ''} · ${[ev.venue, ev.city].filter(Boolean).join(', ')}`;
      if ($('#e3d-footer-brand')) $('#e3d-footer-brand').textContent = ev.name;
    }

    initThreeScene(theme) {
      const canvas = $('#e3d-canvas');
      if (!canvas) return;
      const pal = THEME_PALETTES[theme] || THEME_PALETTES['theme-music'];

      if (typeof THREE === 'undefined' || prefersReducedMotion()) {
        canvas.style.background = `radial-gradient(ellipse at center, #${pal.fog.toString(16).padStart(6, '0')} 0%, #${pal.bg.toString(16).padStart(6, '0')} 100%)`;
        return;
      }

      const W = canvas.clientWidth || window.innerWidth;
      const H = canvas.clientHeight || window.innerHeight;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(pal.bg, 1);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(pal.fog, 0.028);
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
      camera.position.set(0, 0, 17);

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      const l1 = new THREE.PointLight(pal.primary, 3, 45);
      l1.position.set(4, 7, 8);
      scene.add(l1);
      const l2 = new THREE.PointLight(pal.secondary, 2.2, 40);
      l2.position.set(-8, -4, 6);
      scene.add(l2);
      const l3 = new THREE.PointLight(pal.accent, 1.8, 35);
      l3.position.set(8, -2, 6);
      scene.add(l3);

      const matPrimary = new THREE.MeshStandardMaterial({ color: pal.primary, metalness: 0.85, roughness: 0.15, emissive: pal.primary, emissiveIntensity: 0.25 });
      const matSecondary = new THREE.MeshStandardMaterial({ color: pal.secondary, metalness: 0.8, roughness: 0.2, emissive: pal.secondary, emissiveIntensity: 0.2 });
      const matWire = new THREE.MeshStandardMaterial({ color: pal.accent, wireframe: true, transparent: true, opacity: 0.35 });

      const animators = [];

      if (theme === 'theme-tech') {
        const core = new THREE.Mesh(new THREE.IcosahedronGeometry(3.2, 1), matWire);
        scene.add(core);
        const inner = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), matPrimary);
        scene.add(inner);

        // Network nodes + lines
        const nodePts = [];
        const nodes = [];
        for (let i = 0; i < 18; i++) {
          const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), i % 2 ? matSecondary : matPrimary);
          const a = (i / 18) * Math.PI * 2;
          const r = 5.5 + (i % 3) * 1.4;
          m.position.set(Math.cos(a) * r, ((i % 5) - 2) * 1.4, Math.sin(a) * r * 0.6);
          scene.add(m);
          nodes.push(m);
          nodePts.push(m.position.clone());
          if (i > 0) nodePts.push(nodes[i - 1].position.clone());
        }
        const lineGeo = new THREE.BufferGeometry().setFromPoints(nodePts);
        const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: pal.accent, transparent: true, opacity: 0.35 }));
        scene.add(lines);

        animators.push(t => {
          core.rotation.y = t * 0.25; core.rotation.x = t * 0.15;
          inner.rotation.y = -t * 0.5; inner.rotation.z = t * 0.3;
          lines.rotation.y = t * 0.12;
          nodes.forEach((n, idx) => { n.position.y += Math.sin(t * 2 + idx) * 0.004; });
        });
      } else if (theme === 'theme-workshop') {
        const center = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 0), matPrimary);
        scene.add(center);
        const geos = [new THREE.OctahedronGeometry(0.75), new THREE.TetrahedronGeometry(0.7), new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.TorusGeometry(0.6, 0.18, 12, 32)];
        const items = geos.map((g, i) => {
          const m = new THREE.Mesh(g, i % 2 ? matSecondary : matWire);
          m.userData = { angle: (i / geos.length) * Math.PI * 2, radius: 5.2 + i * 0.7 };
          scene.add(m);
          return m;
        });
        animators.push(t => {
          center.rotation.x = t * 0.25; center.rotation.y = t * 0.4;
          items.forEach((m, i) => {
            const a = m.userData.angle + t * (0.35 + i * 0.05);
            m.position.set(Math.cos(a) * m.userData.radius, Math.sin(t + i) * 1.4, Math.sin(a) * m.userData.radius * 0.5);
            m.rotation.x = t * 0.7; m.rotation.y = t * 0.5;
          });
        });
      } else if (theme === 'theme-conference') {
        const rings = [3.2, 4.6, 6.0].map((r, i) => {
          const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 16, 100), i % 2 ? matSecondary : matPrimary);
          m.rotation.x = 0.4 + i * 0.3;
          scene.add(m);
          return m;
        });
        const core = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), matWire);
        scene.add(core);
        animators.push(t => {
          core.rotation.y = t * 0.2;
          rings.forEach((r, i) => {
            r.rotation.y = t * (0.2 + i * 0.1) * (i % 2 ? -1 : 1);
            r.rotation.z = t * 0.12;
          });
        });
      } else if (theme === 'theme-festival') {
        const mats = [matPrimary, matSecondary, new THREE.MeshStandardMaterial({ color: pal.accent, metalness: 0.8, roughness: 0.2 })];
        const rings = [2.6, 3.8, 5.0, 6.2].map((r, i) => {
          const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.14, 16, 80), mats[i % mats.length]);
          m.rotation.x = i * 0.5;
          scene.add(m);
          return m;
        });
        animators.push(t => {
          rings.forEach((r, i) => {
            r.rotation.x += 0.005 * (i + 1);
            r.rotation.y += 0.008 * (i % 2 ? 1 : -1);
          });
        });
      } else {
        // theme-music
        const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(2.8, 0.48, 180, 20, 3, 5), matPrimary);
        const knotWire = new THREE.Mesh(new THREE.TorusKnotGeometry(2.9, 0.5, 90, 14, 3, 5), matWire);
        scene.add(knot, knotWire);
        animators.push(t => {
          knot.rotation.x = t * 0.3; knot.rotation.y = t * 0.5;
          knotWire.rotation.x = -t * 0.2; knotWire.rotation.y = t * 0.4;
        });
      }

      // Shared particle field
      const count = 350;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 7 + Math.random() * 14;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: pal.accent, size: 0.08, transparent: true, opacity: 0.7 }));
      scene.add(particles);

      let mx = 0, my = 0, tx = 0, ty = 0;
      document.addEventListener('mousemove', e => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = -(e.clientY / window.innerHeight - 0.5) * 2;
      }, { passive: true });

      window.addEventListener('resize', () => {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

      let time = 0;
      let running = true;
      const loop = () => {
        if (!running) return;
        requestAnimationFrame(loop);
        time += 0.008;
        tx += (mx - tx) * 0.03;
        ty += (my - ty) * 0.03;
        camera.position.x += (tx * 1.8 - camera.position.x) * 0.05;
        camera.position.y += (ty * 1.2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        animators.forEach(fn => fn(time));
        particles.rotation.y = time * 0.04;
        renderer.render(scene, camera);
      };
      loop();

      document.addEventListener('visibilitychange', () => {
        running = !document.hidden;
        if (running) loop();
      });
    }

    initScrollAnimations() {
      if (prefersReducedMotion()) {
        $$('.erev, .erev-l, .erev-r').forEach(el => el.classList.add('in'));
        return;
      }

      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        $$('.erev, .erev-l, .erev-r').forEach(el => {
          gsap.fromTo(el,
            {
              opacity: 0,
              y: el.classList.contains('erev') ? 28 : 0,
              x: el.classList.contains('erev-l') ? -36 : (el.classList.contains('erev-r') ? 36 : 0)
            },
            {
              opacity: 1, x: 0, y: 0, duration: 0.75, ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
              onComplete: () => el.classList.add('in')
            }
          );
        });
      } else {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
        }, { threshold: 0.12 });
        $$('.erev, .erev-l, .erev-r').forEach(el => io.observe(el));
      }
    }

    initNav() {
      const nav = $('#e3d-nav');
      const ham = $('#e3d-hamburger');
      const links = $('#e3d-nav-links');

      window.addEventListener('scroll', () => {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
      }, { passive: true });

      if (ham && links) {
        ham.addEventListener('click', () => {
          const open = links.classList.toggle('open');
          ham.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }

      $$('.e3d-nav-links a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const t = $(a.getAttribute('href'));
          if (t) {
            if (links) links.classList.remove('open');
            t.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }

    initRegistration() {
      const overlay = $('#e3d-modal-overlay');
      const closeBtn = $('#e3d-modal-close');
      const backBtn = $('#e3d-back-btn');
      const nextBtn = $('#e3d-next-btn');
      const confirmClose = $('#e3d-confirm-close');
      const errEl = $('#e3d-modal-err');

      const showErr = msg => { if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); } };
      const clearErr = () => { if (errEl) { errEl.textContent = ''; errEl.classList.remove('show'); } };

      const renderTickets = () => {
        const box = $('#e3d-tix-cards');
        if (!box || !this.eventData) return;
        const passes = Array.isArray(this.eventData.passTypes) && this.eventData.passTypes.length
          ? this.eventData.passTypes : ['General Admission'];
        const icons = ['🎟', '✦', '👑', '⚡'];

        box.innerHTML = passes.map((p, idx) => {
          const name = typeof p === 'object' ? (p.name || p.label) : String(p);
          const price = typeof p === 'object' && p.price ? ` · ${p.price}` : '';
          const sel = name === this.selectedPass;
          return `
            <div class="e3d-tix-card${sel ? ' selected' : ''}" data-pass="${escapeHtml(name)}" role="radio" aria-checked="${sel}" tabindex="0">
              <div class="e3d-tix-radio" aria-hidden="true"></div>
              <div class="e3d-tix-icon" aria-hidden="true">${icons[idx % icons.length]}</div>
              <div class="e3d-tix-info">
                <div class="e3d-tix-name">${escapeHtml(name)}</div>
                <div class="e3d-tix-desc">Instant digital pass${escapeHtml(price)}</div>
              </div>
              ${idx === 0 && passes.length > 1 ? '<span class="e3d-tix-badge">Popular</span>' : ''}
            </div>
          `;
        }).join('');

        $$('.e3d-tix-card', box).forEach(card => {
          const pick = () => {
            $$('.e3d-tix-card', box).forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-checked', 'false'); });
            card.classList.add('selected');
            card.setAttribute('aria-checked', 'true');
            this.selectedPass = card.dataset.pass;
            clearErr();
          };
          card.addEventListener('click', pick);
          card.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); pick(); } });
          if (!prefersReducedMotion()) {
            card.addEventListener('mousemove', e => {
              const r = card.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width - 0.5;
              const y = (e.clientY - r.top) / r.height - 0.5;
              card.style.transform = `perspective(800px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-2px)`;
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
          }
        });
      };

      const renderStep = step => {
        this.currentStep = step;
        $$('.e3d-modal-step').forEach(s => s.classList.remove('active'));
        const cur = $(`#e3d-step-${step}`);
        if (cur) cur.classList.add('active');

        $$('.e3d-step-node').forEach(n => {
          const num = parseInt(n.dataset.step, 10);
          n.classList.remove('active', 'done');
          if (num < step) n.classList.add('done');
          else if (num === step) n.classList.add('active');
        });
        $$('.e3d-step-conn').forEach((c, idx) => c.classList.toggle('done', idx + 1 < step));

        const actions = $('#e3d-modal-actions');
        if (backBtn) backBtn.style.display = step === 1 ? 'none' : 'inline-flex';
        if (step === 4) {
          if (actions) actions.style.display = 'none';
        } else {
          if (actions) actions.style.display = '';
          if (nextBtn) {
            nextBtn.textContent = step === 3 ? 'Confirm Registration →' : 'Next →';
            nextBtn.disabled = false;
          }
        }

        if (step === 1) renderTickets();
        if (step === 3 && this.eventData) {
          const ev = this.eventData;
          const setT = (id, v) => { const el = $(`#${id}`); if (el) el.textContent = v || '—'; };
          setT('e3d-rv-event', ev.name);
          setT('e3d-rv-ticket', this.selectedPass);
          setT('e3d-rv-name', ($('#e3d-fname') || {}).value);
          setT('e3d-rv-email', ($('#e3d-email') || {}).value);
          const cnt = ($('#e3d-attendees') || {}).value || '1';
          setT('e3d-rv-count', `${cnt} ${cnt === '1' ? 'person' : 'people'}`);
          setT('e3d-rv-date', [ev.date, ev.time].filter(Boolean).join(' · '));
          setT('e3d-rv-venue', [ev.venue, ev.city].filter(Boolean).join(', '));
        }
      };

      const open = (pass = '') => {
        if (!overlay) return;
        clearErr();
        if (pass) this.selectedPass = pass;
        $$('.e3d-form-input, .e3d-form-textarea').forEach(i => i.value = '');
        $$('.e3d-form-select').forEach(s => s.selectedIndex = 0);
        if ($('#e3d-modal-actions')) $('#e3d-modal-actions').style.display = '';
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        renderStep(1);
      };
      this.openRegistration = open;

      const close = () => {
        if (!overlay) return;
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };

      document.addEventListener('click', e => {
        const trigger = e.target.closest('[data-e3d-open]');
        if (trigger) {
          e.preventDefault();
          open(trigger.dataset.pass || '');
        }
      });

      if (closeBtn) closeBtn.addEventListener('click', close);
      if (confirmClose) confirmClose.addEventListener('click', () => {
        close();
        setTimeout(() => { if ($('#e3d-qr-code')) $('#e3d-qr-code').innerHTML = ''; }, 300);
      });
      if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

      if (backBtn) {
        backBtn.addEventListener('click', () => {
          if (this.currentStep > 1) { clearErr(); renderStep(this.currentStep - 1); }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', async () => {
          clearErr();
          if (this.currentStep === 1) {
            if (!this.selectedPass) return showErr('Please select a ticket pass to continue.');
            return renderStep(2);
          }
          if (this.currentStep === 2) {
            const fname = ($('#e3d-fname') || {}).value?.trim();
            const email = ($('#e3d-email') || {}).value?.trim();
            const phone = ($('#e3d-phone') || {}).value?.trim();
            if (!fname) { $('#e3d-fname')?.focus(); return showErr('Please enter your full name.'); }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { $('#e3d-email')?.focus(); return showErr('Please enter a valid email address.'); }
            if (!phone) { $('#e3d-phone')?.focus(); return showErr('Please enter your phone number.'); }
            return renderStep(3);
          }
          if (this.currentStep === 3) {
            await submit();
          }
        });
      }

      const submit = async () => {
        if (this.isSubmitting || !this.eventData) return;
        this.isSubmitting = true;
        if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = 'Registering…'; }

        const val = id => ($(`#${id}`) || {}).value?.trim() || '';
        const fullName = val('e3d-fname');
        const email = val('e3d-email');

        try {
          const res = await fetch('/api/public/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventSlug: this.eventData.slug,
              fullName,
              email,
              phone: val('e3d-phone'),
              organization: val('e3d-org'),
              role: ($('#e3d-role') || {}).value || 'Attendee',
              attendees: parseInt(($('#e3d-attendees') || {}).value || '1', 10) || 1,
              notes: val('e3d-notes'),
              passType: this.selectedPass
            })
          });
          const data = await res.json();
          const code = (data.registration && data.registration.confirmationCode) || data.aramCode || null;
          if (res.ok && code) {
            renderStep(4);
            const ev = this.eventData;
            if ($('#e3d-cf-event')) $('#e3d-cf-event').textContent = ev.name;
            if ($('#e3d-cf-date')) $('#e3d-cf-date').textContent = [ev.date, ev.time].filter(Boolean).join(' · ');
            if ($('#e3d-cf-pass')) $('#e3d-cf-pass').textContent = this.selectedPass;
            if ($('#e3d-cf-name')) $('#e3d-cf-name').textContent = fullName;
            if ($('#e3d-cf-venue')) $('#e3d-cf-venue').textContent = [ev.venue, ev.city].filter(Boolean).join(', ');
            if ($('#e3d-code-val')) $('#e3d-code-val').textContent = code;
            const qr = $('#e3d-qr-code');
            if (qr) {
              qr.innerHTML = '';
              if (typeof QRCode !== 'undefined') {
                new QRCode(qr, { text: code, width: 116, height: 116, colorDark: '#000000', colorLight: '#ffffff' });
              } else {
                qr.textContent = code;
              }
            }
          } else if (res.status === 409) {
            showErr('You have already registered with this email address for this event.');
          } else {
            showErr(data.message || data.error || 'Registration failed. Please try again.');
          }
        } catch (err) {
          console.error('[EventEngine] Registration error:', err);
          showErr('Network error. Please try again.');
        } finally {
          this.isSubmitting = false;
          if (nextBtn) { nextBtn.disabled = false; nextBtn.textContent = 'Confirm Registration →'; }
        }
      };
    }

    hideLoader() {
      const loader = $('#e3d-loader');
      if (!loader) return;
      loader.classList.add('hidden');
      setTimeout(() => { loader.style.display = 'none'; }, 600);
    }

    async init() {
      this.initNav();
      const slug = this.getSlugFromUrl();
      try {
        const ev = await this.loadEventData(slug);
        this.eventData = ev;
        const theme = this.detectTheme(ev.category);
        this.applyTheme(theme);
        this.renderEventContent(ev);
        this.initThreeScene(theme);
        this.initScrollAnimations();
        this.initRegistration();

        const params = new URLSearchParams(window.location.search);
        if (params.get('register') === '1' || window.location.hash === '#register') {
          setTimeout(() => this.openRegistration && this.openRegistration(), 420);
        }
      } catch (err) {
        console.error('[EventEngine] Failed to load event:', err);
        if ($('#e3d-event-name')) $('#e3d-event-name').innerHTML = '<span>Event Not Found</span>';
        if ($('#e3d-event-description')) $('#e3d-event-description').textContent = 'We could not find this event. Please return to Aram Events to browse published events.';
        this.initThreeScene('theme-conference');
      } finally {
        setTimeout(() => this.hideLoader(), 350);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const engine = new EventEngine();
    engine.init();
  });
})();
