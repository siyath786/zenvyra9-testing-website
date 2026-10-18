function initializeMotion(reduced, signal) {
  if (!window.gsap || !window.ScrollTrigger) return () => {};
  gsap.registerPlugin(ScrollTrigger);
  const context = gsap.context(() => {
    const reveals = gsap.utils.toArray('.reveal, .section-label, .section-title, .section-description, .about-text, .studio-footer-lead, .work-project');
    const revealRoots = reveals.filter(el => !el.parentElement?.closest('.reveal, .work-project'));
    reveals.forEach(el => el.classList.remove('reveal'));
    if (reduced) return;
    // Clear scroll-linked reveals, preserving layout and reduced-motion preferences.
    revealRoots.forEach(el => {
      const isHeading = el.matches('.section-label, .section-title, .section-description');
      const trigger = isHeading ? el.closest('section') || el : el;
      if (el.closest('#home')) return;
      gsap.fromTo(el, { translate: '0px 80px', opacity: .08 },
        { translate: '0px 0px', opacity: 1, ease: 'none', immediateRender: true,
          scrollTrigger: { trigger, start: 'top 90%', end: 'top 48%', scrub: .45,
            invalidateOnRefresh: true } });
    });
    loopChart();
    function loopChart() {
      const line = document.querySelector('#home .chart polyline');
      if (!line) return;
      const points = line.getAttribute('points').trim().split(/\s+/).map(pair => pair.split(',').map(Number));
      const motion = { time: 0 };
      // Fixed endpoints and x coordinates; each interior point has its own phase and rhythm.
      gsap.to(motion, {
        time: 60, duration: 60, repeat: -1, ease: 'none',
        onUpdate: () => {
          line.setAttribute('points', points.map(([x, y], i) => {
            if (i === 0 || i === points.length - 1) return `${x},${y}`;
            const amplitude = [0, 7, 10, 8, 11, 9, 12, 8, 10, 6][i];
            const phase = i * 1.7;
            const frequency = 2 * Math.PI * (12 + i % 5) / 60;
            const offset = amplitude * (Math.sin(motion.time * frequency + phase) - Math.sin(phase));
            return `${x},${(y + offset).toFixed(3)}`;
          }).join(' '));
        }
      });
    }
    const loop = (target, vars, trigger) => {
      const tween = gsap.to(target, { ...vars, paused: true });
      ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', onToggle: self => self.isActive ? tween.play() : tween.pause(), onRefresh: self => self.isActive ? tween.play() : tween.pause() });
    };
    loop('.phone', { rotationY: 12, rotationX: -5, y: -16, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' }, '#content');
    const posts = gsap.utils.toArray('.phone-post');
    gsap.set(posts, { yPercent: 110, autoAlpha: 0 });
    const feed = gsap.timeline({ repeat: -1, paused: true });
    posts.forEach(post => {
      feed.to(post, { yPercent: 0, autoAlpha: 1, duration: .8, ease: 'power3.out' })
        .fromTo(post.querySelector('.post-art'), { scale: .65, rotation: -35 }, { scale: 1, rotation: 0, duration: .9, ease: 'back.out(1.5)' }, '<')
        .to(post, { yPercent: -110, autoAlpha: 0, duration: .6, ease: 'power2.in' }, '+=2.4');
    });
    ScrollTrigger.create({ trigger: '#content', start: 'top bottom', end: 'bottom top', onToggle: self => self.isActive ? feed.play() : feed.pause(), onRefresh: self => self.isActive ? feed.play() : feed.pause() });
    gsap.utils.toArray('#performance .bar').forEach((bar, i) => {
      loop(bar, { scaleY: [.52, .85, .42, .68, .38, .74][i], transformOrigin: 'bottom center', duration: 1.2 + i * .17, delay: i * .13, repeat: -1, yoyo: true, ease: 'sine.inOut' }, '#performance');
    });
    loop('.zen-contact-core', { rotationY: 18, rotationX: -8, y: -12, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 'body');
    document.querySelectorAll('.service-photo').forEach(frame => {
      frame.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const rect = frame.getBoundingClientRect();
        gsap.to(frame.querySelector('img'), { rotationY: ((event.clientX - rect.left) / rect.width - .5) * 14, rotationX: -((event.clientY - rect.top) / rect.height - .5) * 12, scale: 1.045, duration: .5, ease: 'power2.out' });
      }, { signal });
      frame.addEventListener('pointerleave', () => gsap.to(frame.querySelector('img'), { rotationX: 0, rotationY: 0, scale: 1, duration: .65 }), { signal });
    });
  });
  const refresh = () => ScrollTrigger.refresh();
  document.querySelectorAll('img').forEach(img => img.addEventListener('load', refresh, { signal, once: true }));
  const timer = window.setTimeout(refresh, 500);
  return () => { clearTimeout(timer); context.revert(); };
}
function initializeZenvyra() {
  var _a;
  const controller = new AbortController();
  const signal = controller.signal;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = [];
  const frames = /* @__PURE__ */ new Set();
  const later = (fn, ms) => timers.push(window.setTimeout(fn, ms));
  const frame = (fn) => {
    const id = requestAnimationFrame((time) => {
      frames.delete(id);
      fn(time);
    });
    frames.add(id);
  };
  const loader = document.getElementById("zenLoader");
  const fill = document.getElementById("zenLoaderFill");
  function setProgress(value) {
    if (fill) fill.style.width = `${value}%`;
  }
  if (reduced) {
    setProgress(100);
    if (loader) loader.hidden = true;
  } else {
    const start = performance.now();
    const tick = (time) => {
      const value = Math.min(100, Math.floor((time - start) / 22));
      setProgress(value);
      if (value < 100) frame(tick);
      else later(() => {
        loader == null ? void 0 : loader.classList.add("zen-loader-exit");
        later(() => {
          if (loader) loader.hidden = true;
        }, 700);
      }, 220);
    };
    frame(tick);
  }
  const nav = document.getElementById("primaryNav");
  const toggle = document.querySelector(".nav-toggle");
  const modal = document.getElementById("zenContactModal");
  let previousFocus = null;
  function updateLock() {
    document.body.classList.toggle("is-locked", Boolean((nav == null ? void 0 : nav.classList.contains("is-open")) || (modal == null ? void 0 : modal.classList.contains("is-open"))));
  }
  function setMenu(open) {
    nav == null ? void 0 : nav.classList.toggle("is-open", open);
    toggle == null ? void 0 : toggle.setAttribute("aria-expanded", String(open));
    toggle == null ? void 0 : toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    updateLock();
  }
  function setModal(open) {
    var _a2;
    if (open) {
      previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setMenu(false);
    }
    modal == null ? void 0 : modal.classList.toggle("is-open", open);
    modal == null ? void 0 : modal.setAttribute("aria-hidden", String(!open));
    if (modal) modal.inert = !open;
    updateLock();
    if (open) (_a2 = modal == null ? void 0 : modal.querySelector("button, input")) == null ? void 0 : _a2.focus();
    else previousFocus == null ? void 0 : previousFocus.focus();
  }
  if (modal) modal.inert = true;
  toggle == null ? void 0 : toggle.addEventListener("click", () => setMenu(!(nav == null ? void 0 : nav.classList.contains("is-open"))), { signal });
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-open-contact], a[href="#zenContactModal"]')) {
      event.preventDefault();
      setModal(true);
    } else if (event.target.closest(".zen-contact-close") || event.target === modal) setModal(false);
    else if (event.target.closest("#primaryNav a")) setMenu(false);
  }, { signal });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setModal(false);
      setMenu(false);
    }
    const container = (modal == null ? void 0 : modal.classList.contains("is-open")) ? modal : (nav == null ? void 0 : nav.classList.contains("is-open")) ? nav : null;
    if (event.key !== "Tab" || !container) return;
    const items = Array.from(container.querySelectorAll("a[href],button,input,textarea,select"));
    if (container === nav && toggle) items.push(toggle);
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last == null ? void 0 : last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first == null ? void 0 : first.focus();
    }
  }, { signal });
  const desktop = window.matchMedia("(min-width: 901px)");
  desktop.addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  }, { signal });
  if (location.hash === "#zenContactModal") setModal(true);
  const form = document.querySelector("#zenContactForm");
  form == null ? void 0 : form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const message = `Hi Zenvyra! I'm ${data.get("name") || ""} (${data.get("email") || ""})
Brand: ${data.get("brand") || ""}
Need: ${data.get("need") || ""}

${data.get("message") || ""}`;
    window.open(`https://wa.me/917339548648?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }, { signal });
  (_a = document.querySelector(".footer-email-form")) == null ? void 0 : _a.addEventListener("submit", (event) => event.preventDefault(), { signal });
  const links = Array.from((nav == null ? void 0 : nav.querySelectorAll('a[href^="#"]')) || []);
  const targets = links.map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) })).filter((item) => item.section);
  const services = document.getElementById("services");
  const details = /* @__PURE__ */ new Set(["social", "content", "seo", "performance", "website", "branding", "design"]);
  let scheduled = false;
  const parallaxItems = Array.from(document.querySelectorAll("[data-parallax]"));
  const updateScroll = () => {
    var _a2, _b, _c, _d, _e, _f;
    scheduled = false;
    if (!reduced) parallaxItems.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const speed = Number(el.dataset.parallax) || .1;
      const distance = (window.innerHeight / 2 - rect.top - rect.height / 2) * speed;
      const limit = rect.height * .09;
      el.style.setProperty("--parallax-y", `${Math.max(-limit, Math.min(limit, distance))}px`);
    });
    const marker = (((_a2 = document.querySelector("header")) == null ? void 0 : _a2.getBoundingClientRect().height) || 80) + 120;
    let active = (_b = targets[0]) == null ? void 0 : _b.link;
    for (const item of targets) {
      if (item.section && item.section.getBoundingClientRect().top <= marker) active = item.link;
    }
    for (const detail of details) {
      const rect = (_c = document.getElementById(detail)) == null ? void 0 : _c.getBoundingClientRect();
      if (rect && rect.top <= marker && rect.bottom > marker) active = (_d = targets.find((item) => item.section === services)) == null ? void 0 : _d.link;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) active = (_e = targets.at(-1)) == null ? void 0 : _e.link;
    for (const link of links) {
      link.classList.toggle("active", link === active);
      if (link === active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    (_f = document.querySelector("header")) == null ? void 0 : _f.classList.toggle("is-scrolled", window.scrollY > 20);
    const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = document.querySelector(".scroll-progress");
    if (progress) progress.style.transform = `scaleX(${Math.min(1, window.scrollY / range)})`;
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      frame(updateScroll);
    }
  };
  window.addEventListener("scroll", schedule, { passive: true, signal });
  window.addEventListener("resize", schedule, { passive: true, signal });
  updateScroll();
  let motionCleanup = () => {};
  try { motionCleanup = initializeMotion(reduced, signal); }
  catch (error) {
    // A failed effect must never make the website unreadable.
    window.ScrollTrigger?.getAll().forEach(trigger => trigger.kill());
    document.querySelectorAll('.reveal, .section-label, .section-title, .section-description, .about-text, .studio-footer-lead, .work-project').forEach(el => {
      el.classList.remove('reveal');
      el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.transform = 'none';
    });
    console.warn('Scroll effects unavailable; content remains visible.');
  }
  return () => {
    controller.abort();
    motionCleanup();
    timers.forEach(clearTimeout);
    frames.forEach(cancelAnimationFrame);
    document.body.classList.remove("is-locked");
  };
}
initializeZenvyra();
