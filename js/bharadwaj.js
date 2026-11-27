/* ============================================================
   BHARADWAJ'S AUTOGRAPH — The Symphony of Light
   Premium 3D Event Page JavaScript  v2.0 (4-step modal + QR)
   ============================================================ */

'use strict';

/* ================================================================
   1. CONSTANTS
   ================================================================ */
const EVENT_SLUG = 'bharadwaj-autograph';

const BH_PASSES = [
  {
    name: 'Early Bird Pass',
    icon: '🌅',
    desc: 'Priority gate access · Event souvenir included',
    badge: null
  },
  {
    name: 'General Admission',
    icon: '🎵',
    desc: 'Full concert access · Standard seating',
    badge: 'Popular'
  },
  {
    name: 'VIP Pass',
    icon: '👑',
    desc: 'Premium seating · Priority entry · Exclusive area',
    badge: null
  }
];

/* ================================================================
   2. UTILITY
   ================================================================ */
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return [...(ctx || document).querySelectorAll(sel)]; }

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ================================================================
   3. PAGE LOADER
   ================================================================ */
function hideLoader() {
  const loader = $('#bh-loader');
  if (!loader) return;
  loader.classList.add('hidden');
  setTimeout(() => { loader.style.display = 'none'; }, 600);
}

/* ================================================================
   4. NAVIGATION
   ================================================================ */
function initNav() {
  const nav = $('#bh-nav');
  const hamburger = $('#bh-hamburger');
  const navLinks = $('#bh-nav-links');

  window.addEventListener('scroll', () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = navLinks.classList.toggle('mobile-open');
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  $$('.bh-nav-links a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = $(a.getAttribute('href'));
      if (target) {
        if (navLinks) navLinks.classList.remove('mobile-open');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ================================================================
   5. THREE.JS CONCERT STAGE HERO SCENE
   ================================================================ */
function initThreeScene() {
  const canvas = $('#bh-canvas');
  if (!canvas) return;

  if (typeof THREE === 'undefined') {
    console.warn('[Bharadwaj] Three.js not loaded — static fallback');
    canvas.style.background = 'radial-gradient(ellipse at center, #1a0533 0%, #020008 100%)';
    return;
  }

  if (prefersReducedMotion()) {
    canvas.style.background = 'radial-gradient(ellipse at center, #1a0533 0%, #020008 100%)';
    return;
  }

  const W = canvas.clientWidth || window.innerWidth;
  const H = canvas.clientHeight || window.innerHeight;

  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020008, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ---- Scene & Camera ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  camera.position.set(0, 0, 18);

  // ---- Fog ----
  scene.fog = new THREE.FogExp2(0x08021a, 0.025);

  // ---- Lighting ----
  const ambientLight = new THREE.AmbientLight(0x1a0533, 0.8);
  scene.add(ambientLight);

  const spotViolet = new THREE.PointLight(0x7c3aed, 3, 40);
  spotViolet.position.set(0, 8, 5);
  scene.add(spotViolet);

  const spotCyan = new THREE.PointLight(0x06b6d4, 2, 35);
  spotCyan.position.set(-10, -4, 8);
  scene.add(spotCyan);

  const spotMagenta = new THREE.PointLight(0xe879f9, 1.5, 30);
  spotMagenta.position.set(10, 4, 6);
  scene.add(spotMagenta);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  // Warm stage floor light
  const stageLight = new THREE.PointLight(0xd946ef, 1.2, 25);
  stageLight.position.set(0, -6, 3);
  scene.add(stageLight);

  // ---- Materials ----
  const matViolet = new THREE.MeshStandardMaterial({
    color: 0x7c3aed, metalness: 0.9, roughness: 0.1,
    emissive: 0x3b0764, emissiveIntensity: 0.4
  });
  const matCyan = new THREE.MeshStandardMaterial({
    color: 0x06b6d4, metalness: 0.8, roughness: 0.15,
    emissive: 0x083344, emissiveIntensity: 0.3
  });
  const matMagenta = new THREE.MeshStandardMaterial({
    color: 0xe879f9, metalness: 0.85, roughness: 0.1,
    emissive: 0x701a75, emissiveIntensity: 0.3
  });
  const matGold = new THREE.MeshStandardMaterial({
    color: 0xc084fc, metalness: 1.0, roughness: 0.05,
    emissive: 0x4a044e, emissiveIntensity: 0.2
  });
  const matWire = new THREE.MeshStandardMaterial({
    color: 0xa78bfa, wireframe: true, opacity: 0.3,
    transparent: true
  });
  const matFloor = new THREE.MeshStandardMaterial({
    color: 0x1a0030, metalness: 0.95, roughness: 0.05,
    emissive: 0x0d0018, emissiveIntensity: 0.2
  });

  // ---- Stage Floor ----
  const floorGeo = new THREE.BoxGeometry(16, 0.3, 8);
  const floor = new THREE.Mesh(floorGeo, matFloor);
  floor.position.set(0, -8, 0);
  floor.receiveShadow = true;
  scene.add(floor);

  // ---- Stage Spotlight Cones ----
  const spotConeMat = new THREE.MeshStandardMaterial({
    color: 0x7c3aed, transparent: true, opacity: 0.15,
    emissive: 0x7c3aed, emissiveIntensity: 0.5, side: THREE.DoubleSide
  });
  const spotPositions = [[-5, 2, 0], [5, 2, 0], [-3, 3, -2], [3, 3, -2]];
  spotPositions.forEach(pos => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 6, 16), spotConeMat);
    cone.position.set(...pos);
    cone.rotation.z = (pos[0] < 0 ? 1 : -1) * 0.3;
    scene.add(cone);
  });

  // ---- Central Torus Knot (main sculpture) ----
  const torusKnotGeo = new THREE.TorusKnotGeometry(3.2, 0.55, 220, 20, 3, 5);
  const torusKnot = new THREE.Mesh(torusKnotGeo, matViolet);
  torusKnot.castShadow = true;
  scene.add(torusKnot);

  const torusKnotWire = new THREE.Mesh(
    new THREE.TorusKnotGeometry(3.3, 0.57, 100, 16, 3, 5),
    matWire
  );
  scene.add(torusKnotWire);

  // ---- Orbiting Octahedra ----
  const orbiters = [];
  const orbiterGeos = [
    new THREE.OctahedronGeometry(0.5, 0),
    new THREE.TetrahedronGeometry(0.4, 0),
    new THREE.IcosahedronGeometry(0.35, 0),
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TetrahedronGeometry(0.5, 0),
    new THREE.IcosahedronGeometry(0.45, 0),
  ];
  const orbiterMats = [matCyan, matMagenta, matGold];

  for (let i = 0; i < 6; i++) {
    const geo = orbiterGeos[i];
    const mat = orbiterMats[i % orbiterMats.length];
    const mesh = new THREE.Mesh(geo, mat);
    const angle = (i / 6) * Math.PI * 2;
    const radius = 6.5 + Math.random() * 1.5;
    mesh.userData = {
      orbitRadius: radius,
      orbitSpeed: 0.3 + Math.random() * 0.3,
      orbitAngle: angle,
      orbitTilt: (Math.random() - 0.5) * 0.8,
      spinX: (Math.random() - 0.5) * 2,
      spinY: (Math.random() - 0.5) * 2,
      floatOffset: Math.random() * Math.PI * 2,
      floatAmp: 0.5 + Math.random() * 0.5
    };
    mesh.castShadow = true;
    scene.add(mesh);
    orbiters.push(mesh);
  }

  // ---- Floating Ring Geometries ----
  const rings = [];
  [
    { r: 4.5, tube: 0.04, mat: matCyan, tilt: 0.4, speed: 0.5 },
    { r: 6.0, tube: 0.03, mat: matMagenta, tilt: -0.6, speed: -0.3 },
    { r: 7.5, tube: 0.025, mat: matGold, tilt: 0.8, speed: 0.2 },
  ].forEach(p => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(p.r, p.tube, 16, 120),
      p.mat
    );
    mesh.rotation.x = p.tilt;
    mesh.userData = { speed: p.speed };
    scene.add(mesh);
    rings.push(mesh);
  });

  // ---- Sound Wave Ribbon ----
  const waveSegments = 120;
  const waveWidth = 24;
  function buildWaveGeo(t) {
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    for (let i = 0; i <= waveSegments; i++) {
      const x = (i / waveSegments) * waveWidth - waveWidth / 2;
      const phase = (i / waveSegments) * Math.PI * 6;
      const y = Math.sin(phase + t) * 0.6 + Math.sin(phase * 0.5 + t * 0.7) * 0.3;
      const z = -5 + Math.cos(phase * 0.3 + t * 0.4) * 0.3;
      positions.push(x, y, z);
      const c = new THREE.Color();
      c.setHSL(0.76 + (i / waveSegments) * 0.15, 1, 0.65);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }
  let waveGeo = buildWaveGeo(0);
  const waveLine = new THREE.Line(waveGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2, transparent: true, opacity: 0.7 })
  );
  scene.add(waveLine);

  // ---- Second Wave (offset) ----
  let waveGeo2 = buildWaveGeo(Math.PI);
  const waveLine2 = new THREE.Line(waveGeo2,
    new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 2, transparent: true, opacity: 0.4 })
  );
  waveLine2.position.y = -3;
  scene.add(waveLine2);

  // ---- Particles (500+) ----
  const particleCount = 500;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleColors = new Float32Array(particleCount * 3);
  const palette = [
    new THREE.Color(0x7c3aed),
    new THREE.Color(0x06b6d4),
    new THREE.Color(0xe879f9),
    new THREE.Color(0xc084fc),
    new THREE.Color(0xffffff),
    new THREE.Color(0x818cf8),
  ];
  for (let i = 0; i < particleCount; i++) {
    const r = 8 + Math.random() * 14;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = r * Math.cos(phi);
    const c = palette[Math.floor(Math.random() * palette.length)];
    particleColors[i * 3] = c.r;
    particleColors[i * 3 + 1] = c.g;
    particleColors[i * 3 + 2] = c.b;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
  const particles = new THREE.Points(particleGeo,
    new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.75 })
  );
  scene.add(particles);

  // ---- Mouse Parallax ----
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ---- Resize ----
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // ---- Animation Loop ----
  let time = 0;
  let animRunning = true;

  function animate() {
    if (!animRunning) return;
    requestAnimationFrame(animate);
    time += 0.008;

    targetX += (mouseX - targetX) * 0.03;
    targetY += (mouseY - targetY) * 0.03;
    camera.position.x += (targetX * 2 - camera.position.x) * 0.05;
    camera.position.y += (targetY * 1.5 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    torusKnot.rotation.x = time * 0.3;
    torusKnot.rotation.y = time * 0.5;
    torusKnot.rotation.z = time * 0.1;
    torusKnotWire.rotation.x = -time * 0.2;
    torusKnotWire.rotation.y = time * 0.4;

    orbiters.forEach(m => {
      const d = m.userData;
      d.orbitAngle += d.orbitSpeed * 0.012;
      m.position.x = Math.cos(d.orbitAngle) * d.orbitRadius;
      m.position.y = Math.sin(d.orbitAngle * 0.7 + d.orbitTilt) * (d.orbitRadius * 0.5)
        + Math.sin(time + d.floatOffset) * d.floatAmp;
      m.position.z = Math.sin(d.orbitAngle) * (d.orbitRadius * 0.5);
      m.rotation.x += d.spinX * 0.012;
      m.rotation.y += d.spinY * 0.012;
    });

    rings.forEach(r => {
      r.rotation.y += r.userData.speed * 0.008;
      r.rotation.z += r.userData.speed * 0.004;
    });

    // Update sound waves
    waveLine.geometry.dispose();
    waveLine.geometry = buildWaveGeo(time * 1.5);
    waveLine.position.y = -4 + Math.sin(time * 0.5) * 0.3;

    waveLine2.geometry.dispose();
    waveLine2.geometry = buildWaveGeo(time * 1.2 + Math.PI);
    waveLine2.position.y = -5 + Math.sin(time * 0.4) * 0.2;

    particles.rotation.y = time * 0.04;
    particles.rotation.x = time * 0.02;

    // Animated lights
    spotViolet.position.x = Math.sin(time * 0.7) * 5;
    spotViolet.position.z = 5 + Math.cos(time * 0.5) * 3;
    spotCyan.position.x = -10 + Math.cos(time * 0.4) * 4;
    spotCyan.position.y = -4 + Math.sin(time * 0.6) * 2;
    spotMagenta.position.x = 10 + Math.sin(time * 0.35) * 3;
    stageLight.intensity = 1.2 + Math.sin(time * 2) * 0.3;

    renderer.render(scene, camera);
  }

  animate();

  document.addEventListener('visibilitychange', () => {
    animRunning = !document.hidden;
    if (animRunning) animate();
  });
}

/* ================================================================
   6. GSAP + SCROLL ANIMATIONS
   ================================================================ */
function initScrollAnimations() {
  if (prefersReducedMotion()) {
    $$('.reveal, .reveal-left, .reveal-right').forEach(el => el.classList.add('in-view'));
    return;
  }

  // Try GSAP ScrollTrigger first
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    $$('.reveal, .reveal-left, .reveal-right').forEach(el => {
      gsap.fromTo(el,
        {
          opacity: 0,
          y: el.classList.contains('reveal-left') ? 0 : (el.classList.contains('reveal-right') ? 0 : 30),
          x: el.classList.contains('reveal-left') ? -40 : (el.classList.contains('reveal-right') ? 40 : 0)
        },
        {
          opacity: 1, y: 0, x: 0, duration: 0.75, ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          onComplete: () => el.classList.add('in-view')
        }
      );
    });

    // Section entrance stagger for detail cards
    $$('.bh-detail-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 25, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.6, delay: i * 0.08, ease: 'back.out(1.3)',
          scrollTrigger: { trigger: card, start: 'top 90%' }
        }
      );
    });

    $$('.bh-highlight-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.65, delay: i * 0.12, ease: 'power2.out',
          scrollTrigger: { trigger: card, start: 'top 90%' }
        }
      );
    });

  } else {
    // IntersectionObserver fallback
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal, .reveal-left, .reveal-right').forEach(el => observer.observe(el));
  }
}

/* ================================================================
   7. HERO CHARACTER ANIMATION
   ================================================================ */
function initHeroCharAnim() {
  if (prefersReducedMotion()) return;
  const title = $('#bh-hero-title');
  if (!title) return;

  if (typeof gsap !== 'undefined') {
    gsap.from($$('.char-span', title), {
      opacity: 0, y: 32, stagger: 0.04, delay: 0.5, duration: 0.5, ease: 'back.out(1.5)'
    });
  } else {
    $$('.char-span', title).forEach((span, i) => {
      span.style.opacity = '0';
      span.style.transform = 'translateY(30px)';
      span.style.display = 'inline-block';
      span.style.transition = `opacity 0.5s ${0.5 + i * 0.04}s ease, transform 0.5s ${0.5 + i * 0.04}s ease`;
      requestAnimationFrame(() => {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      });
    });
  }
}

/* ================================================================
   8. STAT COUNTER ANIMATION
   ================================================================ */
function initCounters() {
  if (prefersReducedMotion()) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1500;
      const start = performance.now();
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString() + (el.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  $$('[data-count]').forEach(el => observer.observe(el));
}

/* ================================================================
   9. PARALLAX
   ================================================================ */
function initParallax() {
  if (prefersReducedMotion()) return;
  const parallaxEls = $$('[data-parallax]');
  if (!parallaxEls.length) return;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
}

/* ================================================================
   10. AMBIENT ORBS
   ================================================================ */
function initAmbientOrbs() {
  if (prefersReducedMotion()) return;
  $$('.bh-particle-hint').forEach((orb, i) => {
    const delay = i * 1.5;
    const duration = 6 + i * 2;
    orb.style.animation = `float ${duration}s ${delay}s ease-in-out infinite`;
  });
}

/* ================================================================
   11. 4-STEP BOOKING MODAL
   ================================================================ */
let currentStep = 1;
let selectedPassType = '';
let isSubmitting = false;

/* --- Render ticket cards in Step 1 --- */
function renderTicketCards() {
  const container = $('#bh-tix-cards');
  if (!container) return;
  container.innerHTML = BH_PASSES.map(p => `
    <div class="bh-tix-card${p.name === selectedPassType ? ' selected' : ''}"
         data-pass="${p.name}"
         role="radio"
         aria-checked="${p.name === selectedPassType}"
         tabindex="0"
         aria-label="${p.name}">
      <div class="bh-tix-radio" aria-hidden="true"></div>
      <div class="bh-tix-icon" aria-hidden="true">${p.icon}</div>
      <div class="bh-tix-info">
        <div class="bh-tix-name">${p.name}</div>
        <div class="bh-tix-desc">${p.desc}</div>
      </div>
      ${p.badge ? `<div class="bh-tix-badge">${p.badge}</div>` : ''}
    </div>
  `).join('');

  // Attach click + keyboard + 3D tilt handlers
  $$('.bh-tix-card', container).forEach(card => {
    const select = () => {
      $$('.bh-tix-card', container).forEach(c => {
        c.classList.remove('selected');
        c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
      selectedPassType = card.dataset.pass;
      clearModalError();
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); select(); }
    });
    if (!prefersReducedMotion()) {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-3px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    }
  });
}

/* --- Step navigation & rendering --- */
function renderStep(step) {
  currentStep = step;

  // Show/hide steps
  $$('.bh-modal-step').forEach(s => s.classList.remove('active'));
  const stepEl = $(`#bh-step-${step}`);
  if (stepEl) stepEl.classList.add('active');

  // Update step nodes
  $$('.bh-step-node').forEach(node => {
    const n = parseInt(node.dataset.step, 10);
    node.classList.remove('active', 'done');
    if (n < step) node.classList.add('done');
    else if (n === step) node.classList.add('active');
  });

  // Update connectors
  $$('.bh-step-connector').forEach((conn, i) => {
    conn.classList.toggle('done', i + 1 < step);
  });

  // Update action buttons
  const backBtn = $('#bh-back-btn');
  const nextBtn = $('#bh-next-btn');
  const actionsDiv = $('#bh-modal-actions');

  if (backBtn) backBtn.style.display = step === 1 ? 'none' : 'inline-flex';

  if (step === 4) {
    // Confirmation step — hide actions
    if (actionsDiv) actionsDiv.style.display = 'none';
  } else {
    if (actionsDiv) actionsDiv.style.display = '';
    if (nextBtn) {
      nextBtn.textContent = step === 3 ? 'Confirm Registration →' : 'Next →';
      nextBtn.disabled = false;
    }
  }

  // If entering step 1, render cards
  if (step === 1) renderTicketCards();

  // If entering step 3, populate review
  if (step === 3) populateReview();
}

/* --- Populate step 3 review --- */
function populateReview() {
  const setVal = (id, val) => {
    const el = $(`#${id}`);
    if (el) el.textContent = val || '—';
  };
  setVal('bh-rv-event', "Bharadwaj's Autograph");
  setVal('bh-rv-ticket', selectedPassType);
  setVal('bh-rv-name', ($('#bh-fname') || {}).value || '—');
  setVal('bh-rv-email', ($('#bh-email') || {}).value || '—');
  const att = ($('#bh-attendees') || {}).value || '1';
  setVal('bh-rv-attendees', att + ' ' + (att === '1' ? 'person' : 'people'));
  setVal('bh-rv-date', 'Saturday, January 16, 2027 · 5:30 PM IST');
  setVal('bh-rv-venue', "Vel's Vidhyalaya CBSE School, Tenkasi");
}

/* --- Validation --- */
function validateStep(step) {
  if (step === 1) {
    if (!selectedPassType) {
      showModalError('Please select a ticket type to continue.');
      return false;
    }
    return true;
  }
  if (step === 2) {
    clearModalError();
    const required = [
      { id: 'bh-fname', label: 'Full name' },
      { id: 'bh-email', label: 'Email address' },
      { id: 'bh-phone', label: 'Phone number' }
    ];
    for (const f of required) {
      const el = $(`#${f.id}`);
      if (!el || !el.value.trim()) {
        showModalError(`Please enter your ${f.label}.`);
        if (el) el.focus();
        return false;
      }
    }
    const email = $('#bh-email');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showModalError('Please enter a valid email address.');
      email.focus();
      return false;
    }
    return true;
  }
  return true;
}

/* --- Error helpers --- */
function showModalError(msg) {
  const el = $('#bh-modal-err');
  if (el) { el.textContent = msg; el.classList.add('show'); }
}
function clearModalError() {
  const el = $('#bh-modal-err');
  if (el) { el.textContent = ''; el.classList.remove('show'); }
}

/* --- Submit registration (step 3 → step 4) --- */
async function submitRegistration() {
  if (isSubmitting) return;
  clearModalError();

  const val = id => ($(`#${id}`) || {}).value?.trim() || '';
  const fullName = val('bh-fname');
  const email = val('bh-email');
  const phone = val('bh-phone');
  const organization = val('bh-org');
  const role = ($('#bh-role') || {}).value?.trim() || 'Attendee';
  const attendees = parseInt(($('#bh-attendees') || {}).value || '1', 10) || 1;
  const notes = val('bh-notes');

  if (!fullName || !email || !phone) {
    showModalError('Please complete all required fields.');
    return;
  }

  isSubmitting = true;
  const nextBtn = $('#bh-next-btn');
  if (nextBtn) {
    nextBtn.disabled = true;
    nextBtn.textContent = 'Registering…';
  }

  try {
    const res = await fetch('/api/public/registrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventSlug: EVENT_SLUG,
        fullName, email, phone, organization, role, attendees, notes,
        passType: selectedPassType
      })
    });

    const data = await res.json();
    const code = (data.registration && data.registration.confirmationCode) || data.aramCode || null;

    if (res.ok && code) {
      showConfirmation(code, fullName, selectedPassType);
    } else if (res.status === 409) {
      showModalError('You have already registered with this email address for this event.');
    } else {
      showModalError(data.message || data.error || 'Registration failed. Please try again.');
    }
  } catch (err) {
    console.error('[Bharadwaj] Registration error:', err);
    showModalError('Network error. Please check your connection and try again.');
  } finally {
    isSubmitting = false;
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Confirm Registration →';
    }
  }
}

/* --- Show confirmation (step 4) with QR code --- */
function showConfirmation(code, name, passType) {
  // Advance to step 4
  renderStep(4);

  // Populate values
  const codeEl = $('#bh-confirm-code-val');
  if (codeEl) codeEl.textContent = code;

  const passEl = $('#bh-confirm-pass-val');
  if (passEl) passEl.textContent = passType || selectedPassType;

  // Generate QR code
  const qrEl = $('#bh-qr-code');
  if (qrEl) {
    qrEl.innerHTML = '';
    if (typeof QRCode !== 'undefined') {
      new QRCode(qrEl, {
        text: code,
        width: 124,
        height: 124,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      // Fallback: show code text
      qrEl.innerHTML = `<div style="font-size:1.1rem;font-weight:700;letter-spacing:.1em;padding:1rem;color:#020008;background:#fff;border-radius:8px;">${code}</div>`;
    }
  }
}

/* --- Modal open / close --- */
function openModal(passType) {
  const overlay = $('#bh-modal-overlay');
  if (!overlay) return;

  // Reset state
  clearModalError();
  if (passType) selectedPassType = passType;
  currentStep = 1;

  // Reset form fields
  $$('.bh-form-input, .bh-form-textarea').forEach(f => f.value = '');
  $$('.bh-form-select').forEach(f => f.selectedIndex = 0);

  // Reset actions visibility
  const actionsDiv = $('#bh-modal-actions');
  if (actionsDiv) actionsDiv.style.display = '';

  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  renderStep(1);
}

function closeModal() {
  const overlay = $('#bh-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* --- Modal init --- */
function initModal() {
  // Open triggers
  $$('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      openModal(btn.dataset.pass || '');
    });
  });

  // Close button
  const closeBtn = $('#bh-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Overlay backdrop
  const overlay = $('#bh-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });
  }

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Back button
  const backBtn = $('#bh-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (currentStep > 1) { clearModalError(); renderStep(currentStep - 1); }
    });
  }

  // Next / submit button
  const nextBtn = $('#bh-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', async () => {
      if (!validateStep(currentStep)) return;
      if (currentStep < 3) {
        clearModalError();
        renderStep(currentStep + 1);
      } else if (currentStep === 3) {
        await submitRegistration();
      }
    });
  }

  // Confirmation close
  const confirmClose = $('#bh-confirm-close');
  if (confirmClose) {
    confirmClose.addEventListener('click', () => {
      closeModal();
      // Reset QR for reuse
      setTimeout(() => {
        const qrEl = $('#bh-qr-code');
        if (qrEl) qrEl.innerHTML = '';
        selectedPassType = '';
      }, 300);
    });
  }
}

/* ================================================================
   12. INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initThreeScene();
  initScrollAnimations();
  initHeroCharAnim();
  initCounters();
  initModal();
  initParallax();
  initAmbientOrbs();

  // Fade in body, then hide loader
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
    setTimeout(hideLoader, 400);
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get('register') === '1' || window.location.hash === '#register') {
    setTimeout(() => openModal(), 450);
  }
});
