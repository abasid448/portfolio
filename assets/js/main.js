/* =============================================================
   Abdul Basid — Portfolio interactions
   Vanilla JS. No external dependencies.
   ============================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Header shadow + scroll progress + back-to-top (rAF-throttled) ---------- */
  const header = $("#header");
  const progress = $("#scroll-progress");
  const backToTop = $("#back-to-top");

  let docHeight = 0;
  const measure = () => { docHeight = document.documentElement.scrollHeight - window.innerHeight; };
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure, { passive: true });
  measure();

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 40);
    if (backToTop) backToTop.classList.toggle("show", y > 500);
    if (progress) progress.style.width = (docHeight > 0 ? (y / docHeight) * 100 : 0) + "%";
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  update();

  /* ---------- Mobile nav ---------- */
  const navToggle = $(".nav-toggle");
  const navLinks = $(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.innerHTML = open ? "&times;" : "&#9776;";
    });
    $$(".nav-links a").forEach((a) =>
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.innerHTML = "&#9776;";
      })
    );
  }

  /* ---------- Back to top ---------- */
  if (backToTop) {
    backToTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })
    );
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$(".reveal");
  if (revealEls.length) {
    if (prefersReduced || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Scroll spy ---------- */
  const sections = $$("section[id], div[id].hero");
  const navMap = new Map();
  $$(".nav-links a").forEach((a) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#")) navMap.set(id.slice(1), a);
  });
  if ("IntersectionObserver" in window && navMap.size) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navMap.forEach((a) => a.classList.remove("active"));
            const link = navMap.get(entry.target.id);
            if (link) link.classList.add("active");
          }
        });
      },
      { threshold: 0.5, rootMargin: "-20% 0px -40% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Count-up stats ---------- */
  const counters = $$("[data-count]");
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    if (prefersReduced) { el.textContent = target + suffix; return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target % 1 === 0 ? Math.round(eased * target) : (eased * target).toFixed(1);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length && "IntersectionObserver" in window) {
    const cObs = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cObs.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || "")));
  }

  /* ---------- Skills tabs (click, and hover-preview on desktop) ---------- */
  const stTabs = $$(".st-tab");
  if (stTabs.length) {
    const activate = (tab) => {
      if (tab.classList.contains("is-active")) return;
      stTabs.forEach((t) => t.classList.remove("is-active"));
      $$(".st-panel").forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      const panel = document.getElementById(tab.dataset.target);
      if (panel) panel.classList.add("is-active");
    };
    stTabs.forEach((tab) => {
      tab.addEventListener("click", () => activate(tab));
      if (finePointer) tab.addEventListener("mouseenter", () => activate(tab));
    });
  }

  /* ---------- Typed role effect ---------- */
  const typedEl = $("[data-typed]");
  if (typedEl && !prefersReduced) {
    const words = JSON.parse(typedEl.dataset.typed);
    const out = typedEl.querySelector(".typed-text");
    let wi = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = words[wi];
      out.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) { ci++; setTimeout(tick, 85); }
      else if (!deleting && ci === word.length) { deleting = true; setTimeout(tick, 1600); }
      else if (deleting && ci > 0) { ci--; setTimeout(tick, 40); }
      else { deleting = false; wi = (wi + 1) % words.length; setTimeout(tick, 250); }
    };
    tick();
  } else if (typedEl) {
    const words = JSON.parse(typedEl.dataset.typed);
    typedEl.querySelector(".typed-text").textContent = words[0];
  }

  /* ---------- Hero portrait parallax ---------- */
  const portrait = $(".portrait");
  if (portrait && !prefersReduced && finePointer) {
    const visual = $(".hero-visual");
    let pRaf = null, lastEvt = null;
    visual.addEventListener("mousemove", (e) => {
      lastEvt = e;
      if (pRaf) return;
      pRaf = requestAnimationFrame(() => {
        pRaf = null;
        const r = visual.getBoundingClientRect();
        const dx = (lastEvt.clientX - r.left - r.width / 2) / r.width;
        const dy = (lastEvt.clientY - r.top - r.height / 2) / r.height;
        portrait.style.transform = `rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg)`;
      });
    });
    visual.addEventListener("mouseleave", () => {
      if (pRaf) { cancelAnimationFrame(pRaf); pRaf = null; }
      portrait.style.transform = "";
    });
  }

  /* ---------- 3D tilt on cards (fine pointer, motion allowed) ---------- */
  if (finePointer && !prefersReduced) {
    $$(".tilt").forEach((card) => {
      let raf = null, ev = null;
      card.addEventListener("mousemove", (e) => {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const r = card.getBoundingClientRect();
          const dx = (ev.clientX - r.left - r.width / 2) / r.width;
          const dy = (ev.clientY - r.top - r.height / 2) / r.height;
          card.style.transform = `perspective(900px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateY(-6px)`;
        });
      });
      card.addEventListener("mouseleave", () => {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        card.style.transform = "";
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !prefersReduced) {
    $$("[data-magnetic]").forEach((el) => {
      let raf = null, ev = null;
      el.addEventListener("mousemove", (e) => {
        ev = e;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const r = el.getBoundingClientRect();
          const dx = (ev.clientX - r.left - r.width / 2) * 0.25;
          const dy = (ev.clientY - r.top - r.height / 2) * 0.35;
          el.style.transform = `translate(${dx}px, ${dy}px)`;
        });
      });
      el.addEventListener("mouseleave", () => {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
        el.style.transform = "";
      });
    });
  }

  /* ---------- Custom cursor (dot + trailing ring), modality-aware ---------- */
  if (finePointer) {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    dot.className = "cursor-dot";
    ring.className = "cursor-ring";
    dot.style.opacity = ring.style.opacity = "0";
    document.body.append(dot, ring);

    const smooth = !prefersReduced; // reduced motion → ring follows instantly (no trailing)
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let active = false;

    // Only switch OFF the native cursor once the mouse actually moves,
    // so there is never a "no cursor" gap; switch back to native on touch.
    const enable = () => { if (active) return; active = true; document.body.classList.add("has-cursor"); };
    const disable = () => {
      if (!active) return;
      active = false;
      document.body.classList.remove("has-cursor");
      dot.style.opacity = ring.style.opacity = "0";
    };

    window.addEventListener("mousemove", (e) => {
      enable();
      dot.style.opacity = ring.style.opacity = "1";
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      if (!smooth) ring.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    if (smooth) {
      const loop = () => {
        rx += (mx - rx) * 0.2;
        ry += (my - ry) * 0.2;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    const hoverSel = "a, button, input, textarea, .tilt, .skill-tag, .hero-socials a, .footer-socials a";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(hoverSel)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(hoverSel)) ring.classList.remove("is-hover");
    });
    document.addEventListener("mousedown", () => ring.classList.add("is-down"));
    document.addEventListener("mouseup", () => ring.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => { dot.style.opacity = ring.style.opacity = "0"; });
    window.addEventListener("blur", disable);
    window.addEventListener("touchstart", disable, { passive: true });
  }

  /* ---------- Contact form (EmailJS, with mailto fallback) ---------- */
  const form = $("#contact-form");
  if (form) {
    const note = form.querySelector(".form-note");
    const submitBtn = form.querySelector('button[type="submit"]');
    const GOLD = "#c6a15b", RED = "#e0736b", OK = "#9ec7a0";
    const setNote = (msg, color) => { if (note) { note.textContent = msg; note.style.color = color; } };
    const emailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    const mailtoFallback = (name, email, message) => {
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:theabdulbasid@gmail.com?subject=${subject}&body=${body}`;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();
      const trap = (data.get("company") || "").toString().trim(); // honeypot

      if (trap) return; // silently ignore bots
      if (!name || !email || !message) { setNote("Please fill in your name, email and message.", RED); return; }
      if (!emailValid(email)) { setNote("Please enter a valid email address.", RED); return; }

      const cfg = window.EMAILJS_CONFIG || {};
      const isSet = (v) => v && !/^YOUR_/.test(v);
      const hasNotif = isSet(cfg.templateId);
      const hasAutoReply = isSet(cfg.autoReplyTemplateId);
      const ready = window.emailjs && isSet(cfg.publicKey) && isSet(cfg.serviceId) && (hasNotif || hasAutoReply);

      // Not configured yet → fall back to opening the user's mail client
      if (!ready) {
        setNote("Opening your email app…", GOLD);
        mailtoFallback(name, email, message);
        return;
      }

      const params = {
        name: name,
        email: email,
        message: message,
        reply_to: email,
        to_email: "theabdulbasid@gmail.com",
        title: `Portfolio enquiry from ${name}`
      };

      try {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = "0.7"; }
        setNote("Sending…", GOLD);
        window.emailjs.init({ publicKey: cfg.publicKey });

        const sends = [];
        if (hasNotif) sends.push(window.emailjs.send(cfg.serviceId, cfg.templateId, params));         // to you
        if (hasAutoReply) sends.push(window.emailjs.send(cfg.serviceId, cfg.autoReplyTemplateId, params)); // to visitor
        await Promise.all(sends);

        form.reset();
        setNote("Message sent — thank you! Check your inbox for a reply.", OK);
      } catch (err) {
        setNote("Couldn't send right now — opening your email app instead…", RED);
        mailtoFallback(name, email, message);
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ""; }
      }
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
