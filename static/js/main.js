/* =========================================
   RIZKY BINTANG PORTFOLIO
   Motion Canvas, 3D Glass Tilt, Parallax, Lightbox, Dark Mode
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const root = document.documentElement;
  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const progressBar = document.getElementById("scrollProgress");
  const themeToggle = document.getElementById("themeToggle");
  const metaTheme = document.getElementById("metaThemeColor");
  const toastEl = document.getElementById("toast");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* 0. Toast helper */
  let toastTimer = null;
  const showToast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2600);
  };

  /* 1. Pilihan bahasa ID / EN */
  const langBtns = document.querySelectorAll(".lang-switch [data-lang]");
  const getLang = () => (root.lang === "en" ? "en" : "id");
  const syncLang = () => {
    const cur = getLang();
    langBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === cur)));
    if (menuToggle) {
      const open = document.body.classList.contains("menu-open");
      menuToggle.setAttribute("aria-label",
        cur === "en" ? (open ? "Close navigation menu" : "Open navigation menu") : (open ? "Tutup menu navigasi" : "Buka menu navigasi"));
    }
    document.dispatchEvent(new CustomEvent("langchange"));
  };
  langBtns.forEach((b) => b.addEventListener("click", () => {
    root.lang = b.dataset.lang;
    try { localStorage.setItem("rb-lang", root.lang); } catch (e) {}
    syncLang();
  }));
  syncLang();

  /* 2. Live Architectural Topographic & CAD Node Canvas */
  const initMotionCanvas = () => {
    const canvas = document.getElementById("motionCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1;
    let rafId = null;
    let t = 0;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let nodes = [];

    const buildNodes = () => {
      const count = w < 760 ? 14 : 26;
      nodes = Array.from({ length: count }, (_, i) => ({
        x: ((i * 197.3) % 100) / 100 * w,
        y: ((i * 311.7) % 100) / 100 * h,
        vx: (Math.sin(i * 4.1) * 0.18),
        vy: (Math.cos(i * 2.7) * 0.14),
        r: 1.5 + (i % 3) * 0.65,
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
      if (reducedMotion) render(0);
    };

    const render = (time) => {
      ctx.clearRect(0, 0, w, h);
      const isDark = root.dataset.theme === "dark";
      const lineRGB = isDark ? "148, 197, 255" : "28, 36, 48";
      const scrollShift = (window.scrollY || 0) * 0.08;

      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;

      /* Gelombang kontur topografi GIS */
      const contours = w < 760 ? 5 : 7;
      for (let c = 0; c < contours; c++) {
        ctx.beginPath();
        const baseY = (h / (contours + 1)) * (c + 1);
        const amp = 22 + c * 6;
        const freq = 0.0022 + c * 0.00025;
        const speed = 0.00038 + c * 0.00007;

        for (let x = -20; x <= w + 20; x += 24) {
          const wave1 = Math.sin(x * freq + time * speed + c * 1.1) * amp;
          const wave2 = Math.cos(x * freq * 1.7 - time * speed * 0.7 + scrollShift * 0.02) * (amp * 0.45);
          let y = baseY + wave1 + wave2;

          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180) {
            const push = (1 - dist / 180) * 18;
            y += dy > 0 ? push : -push;
          }

          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(${lineRGB}, ${isDark ? 0.075 : 0.052})`;
        ctx.lineWidth = c % 2 === 0 ? 1.1 : 0.75;
        ctx.stroke();
      }

      /* Jejaring titik koordinat arsitektural */
      const maxDist = w < 760 ? 130 : 185;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!reducedMotion) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -20) n.x = w + 20;
          if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20;
          if (n.y > h + 20) n.y = -20;
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${lineRGB}, ${isDark ? 0.24 : 0.14})`;
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * (isDark ? 0.12 : 0.075);
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.strokeStyle = `rgba(${lineRGB}, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const loop = (now) => {
      t = now;
      render(t);
      rafId = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    if (finePointer) {
      window.addEventListener("pointermove", (e) => {
        pointer.tx = e.clientX;
        pointer.ty = e.clientY;
      }, { passive: true });
    }

    document.addEventListener("visibilitychange", () => {
      if (reducedMotion) return;
      if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
      else if (!document.hidden && !rafId) { rafId = requestAnimationFrame(loop); }
    });

    if (!reducedMotion) rafId = requestAnimationFrame(loop);
  };
  initMotionCanvas();

  /* 3. Navbar scroll state + Scroll Progress Bar + Timeline Fill */
  const timeline = document.querySelector("[data-timeline]");
  const timelineProgress = timeline ? timeline.querySelector(".timeline-progress") : null;

  const onScroll = () => {
    const sy = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", sy > 24);
    if (progressBar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, sy / max)) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }
    if (timeline && timelineProgress) {
      const r = timeline.getBoundingClientRect();
      const total = Math.max(1, r.height - 28);
      const passed = Math.min(total, Math.max(0, window.innerHeight * 0.62 - r.top));
      timelineProgress.style.height = `${passed}px`;
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* 4. Menu HP */
  if (header && menuToggle && mainNav) {
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      syncLang();
    };

    menuToggle.addEventListener("click", () =>
      setOpen(!document.body.classList.contains("menu-open")));

    mainNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setOpen(false)));

    document.addEventListener("click", (e) => {
      if (document.body.classList.contains("menu-open") && !header.contains(e.target)) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        setOpen(false);
        menuToggle.focus();
      }
    });

    window.matchMedia("(min-width: 761px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* 5. Scroll-spy & pill penanda aktif desktop */
  const indicator = mainNav ? mainNav.querySelector(".nav-indicator") : null;
  const desktop = window.matchMedia("(min-width: 761px)");

  const placeIndicator = () => {
    if (!mainNav || !indicator) return;
    const active = mainNav.querySelector('a[aria-current="true"]:not(.nav-cta)');
    if (!active || !desktop.matches) {
      mainNav.classList.remove("has-indicator");
      indicator.style.opacity = "0";
      return;
    }
    mainNav.classList.add("has-indicator");
    indicator.style.width = active.offsetWidth + "px";
    indicator.style.transform = `translateX(${active.offsetLeft}px)`;
    indicator.style.opacity = "1";
  };

  if (mainNav && "IntersectionObserver" in window) {
    const links = new Map();
    mainNav.querySelectorAll('a[href*="#"]:not(.nav-cta)').forEach((a) => {
      const id = a.hash.slice(1);
      if (id && document.getElementById(id)) links.set(id, a);
    });

    if (links.size) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a, id) => {
            if (id === entry.target.id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
          placeIndicator();
        });
      }, { rootMargin: "-45% 0px -50% 0px" });

      links.forEach((_, id) => spy.observe(document.getElementById(id)));

      ["home", "contact"].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            links.forEach((a) => a.removeAttribute("aria-current"));
            placeIndicator();
          }
        }, { rootMargin: "-45% 0px -50% 0px" }).observe(el);
      });
    }
  }

  window.addEventListener("resize", placeIndicator, { passive: true });
  document.addEventListener("langchange", () => requestAnimationFrame(placeIndicator));
  desktop.addEventListener("change", placeIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);

  /* 6. Reveal saat scroll */
  const revealEls = document.querySelectorAll(".reveal");
  const showAll = () => revealEls.forEach((el) => el.classList.add("is-visible"));

  if (reducedMotion || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

    revealEls.forEach((el) => io.observe(el));
    setTimeout(showAll, 4000);
  }

  /* 7. Hero 3D Mouse Depth Parallax */
  const stage = document.querySelector("[data-parallax-stage]");
  if (stage && finePointer && !reducedMotion) {
    const layers = Array.from(stage.querySelectorAll("[data-depth]"));
    let tx = 0, ty = 0, cx = 0, cy = 0, active = false;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach((el) => {
        const d = parseFloat(el.dataset.depth || "0.2");
        el.style.transform = `translate3d(${(cx * d * 24).toFixed(2)}px, ${(cy * d * 18).toFixed(2)}px, 0)`;
      });
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002 || active) {
        requestAnimationFrame(tick);
      }
    };

    stage.addEventListener("pointerenter", () => { active = true; requestAnimationFrame(tick); });
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    stage.addEventListener("pointerleave", () => { active = false; tx = 0; ty = 0; });
  }

  /* 8. Interactive 3D Liquid Glass Tilt & Specular Sheen */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const max = parseFloat(card.dataset.tiltMax || "4.5");

      card.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * max * 2;
        const ry = (px - 0.5) * max * 2;
        card.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    /* Magnetic hover untuk tombol utama */
    document.querySelectorAll(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${(dy - 2).toFixed(1)}px, 0)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* 9. Kilau cahaya mengikuti kursor pada kartu proyek */
  document.querySelectorAll(".project-card").forEach((card) => {
    const art = card.querySelector(".project-art");
    if (!art) return;
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const r = art.getBoundingClientRect();
      art.style.setProperty("--mouse-x", `${((e.clientX - r.left) / r.width) * 100}%`);
      art.style.setProperty("--mouse-y", `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      art.style.setProperty("--mouse-x", "50%");
      art.style.setProperty("--mouse-y", "50%");
    });
  });

  /* 10. Kinetic Scroll-Linked Quote Highlight */
  const kQuote = document.querySelector("[data-kinetic-text]");
  if (kQuote && !reducedMotion) {
    const wrapNodes = (node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else {
            const span = document.createElement("span");
            span.className = "kinetic-word";
            span.textContent = part;
            frag.appendChild(span);
          }
        });
        node.replaceWith(frag);
      } else if (node.nodeType === 1) {
        Array.from(node.childNodes).forEach(wrapNodes);
      }
    };
    wrapNodes(kQuote);
    const activeWords = () => Array.from(kQuote.querySelectorAll(".kinetic-word")).filter((w) => {
      const l = w.closest("[data-l]");
      return !l || l.dataset.l === getLang();
    });
    const updateQuote = () => {
      const r = kQuote.getBoundingClientRect();
      const start = window.innerHeight * 0.88;
      const end = window.innerHeight * 0.35;
      const prog = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      const words = activeWords();
      const litCount = Math.round(prog * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < litCount));
    };
    updateQuote();
    window.addEventListener("scroll", updateQuote, { passive: true });
    document.addEventListener("langchange", updateQuote);
  }

  /* 12. Salin Email sekali klik */
  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const email = btn.dataset.copyEmail;
      if (!email) return;
      try {
        await navigator.clipboard.writeText(email);
        showToast(getLang() === "en" ? `Email copied: ${email}` : `Email disalin: ${email}`);
      } catch (e) {
        showToast(email);
      }
    });
  });

  /* 13. Pop-up karya desain (iOS 26) + Lightbox pratinjau penuh */
  const dm = document.getElementById("designModal");
  if (dm && typeof dm.showModal === "function") {
    const dmIcon = dm.querySelector(".dm-icon");
    const dmTitle = dm.querySelector("#dmTitle");
    const dmCat = dm.querySelector("#dmCat");
    const dmClose = dm.querySelector(".dm-close");
    const dmBody = dm.querySelector(".dm-body");
    const gallery = dm.querySelector(".gallery");
    const lightbox = document.getElementById("dmLightbox");
    const lbImg = document.getElementById("lbImg");
    const lbCaption = document.getElementById("lbCaption");
    const lbPrev = lightbox ? lightbox.querySelector(".lb-prev") : null;
    const lbNext = lightbox ? lightbox.querySelector(".lb-next") : null;
    const lbClose = lightbox ? lightbox.querySelector(".lb-close") : null;

    const ease = "cubic-bezier(.22, 1, .36, 1)";
    let closing = false;
    let currentImgs = [];
    let lbIndex = 0;

    const showLightbox = (idx) => {
      if (!lightbox || !currentImgs.length) return;
      lbIndex = (idx + currentImgs.length) % currentImgs.length;
      const item = currentImgs[lbIndex];
      lbImg.src = item.src;
      lbImg.alt = item.alt || dmTitle.textContent;
      lbCaption.textContent = `${dmTitle.textContent} · ${lbIndex + 1} / ${currentImgs.length}`;
      lightbox.hidden = false;
    };

    const closeLightbox = () => {
      if (lightbox) lightbox.hidden = true;
    };

    if (lbPrev) lbPrev.addEventListener("click", () => showLightbox(lbIndex - 1));
    if (lbNext) lbNext.addEventListener("click", () => showLightbox(lbIndex + 1));
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lightbox) {
      lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
    }

    const build = (card, seed) => {
      gallery.textContent = "";
      currentImgs = [];
      const tpl = card.querySelector(".tpl-images");
      const srcs = tpl ? Array.from(tpl.content.querySelectorAll("img")) : [];
      if (!srcs.length) {
        gallery.innerHTML = '<p class="dm-empty">Karya untuk bagian ini akan segera ditambahkan.</p>';
        return [];
      }
      return srcs.map((node, i) => {
        const fig = document.createElement("figure");
        fig.className = "thumb";
        const img = node.cloneNode(true);
        fig.appendChild(img);
        fig.addEventListener("click", () => showLightbox(i));
        gallery.appendChild(fig);
        currentImgs.push(img);
        return img;
      });
    };

    const openModal = (card, seed) => {
      closing = false;
      closeLightbox();
      dmTitle.textContent = card.dataset.title || "";
      dmCat.textContent = card.dataset.category || "";
      const ic = card.querySelector(".tpl-icon");
      dmIcon.innerHTML = ic ? ic.innerHTML : "";
      const thumbs = build(card, seed);

      root.classList.add("modal-open");
      dm.showModal();
      dmBody.scrollTop = 0;
      requestAnimationFrame(() => dm.classList.add("is-in"));

      if (reducedMotion || !dm.animate) return;

      const iconOnCard = card.querySelector(".art-icon");
      const from = (iconOnCard || card).getBoundingClientRect();
      const to = dmIcon.getBoundingClientRect();
      const dx = from.left + from.width / 2 - (to.left + to.width / 2);
      const dy = from.top + from.height / 2 - (to.top + to.height / 2);
      const sc = iconOnCard ? from.width / to.width : 1.4;

      dmIcon.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${sc})`, opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: "none", opacity: 1 },
        ],
        { duration: 820, easing: ease, fill: "backwards" }
      );
      [dmTitle, dmCat].forEach((el, i) =>
        el.animate(
          [{ opacity: 0, transform: "translateX(-22px)" }, { opacity: 1, transform: "none" }],
          { duration: 650, delay: 260 + i * 70, easing: ease, fill: "backwards" }
        )
      );
      dmClose.animate(
        [{ opacity: 0, transform: "scale(.5) rotate(-90deg)" }, { opacity: 1, transform: "none" }],
        { duration: 600, delay: 340, easing: ease, fill: "backwards" }
      );
      const cr = card.getBoundingClientRect();
      const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2;
      thumbs.forEach((img, i) => {
        const r = img.getBoundingClientRect();
        const dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
        img.animate(
          [
            { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.3)`, filter: "blur(18px)" },
            { opacity: 1, transform: "none", filter: "blur(0)" },
          ],
          { duration: 900, delay: 220 + i * 70, easing: ease, fill: "backwards" }
        );
      });
    };

    const closeModal = () => {
      if (lightbox && !lightbox.hidden) { closeLightbox(); return; }
      if (closing || !dm.open) return;
      closing = true;
      dm.classList.remove("is-in");
      setTimeout(() => dm.close(), reducedMotion ? 0 : 280);
    };

    dm.addEventListener("cancel", (e) => { e.preventDefault(); closeModal(); });
    dm.addEventListener("click", (e) => { if (e.target === dm) closeModal(); });
    dmClose.addEventListener("click", closeModal);
    dm.addEventListener("close", () => {
      root.classList.remove("modal-open");
      closeLightbox();
      gallery.textContent = "";
      closing = false;
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox || lightbox.hidden) return;
      if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
      if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
    });

    document.querySelectorAll(".work").forEach((card, i) => {
      card.addEventListener("click", () => openModal(card, i + 1));
    });
  }

});