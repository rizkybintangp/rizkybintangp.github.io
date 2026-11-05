/* =========================================
   RIZKY BINTANG PORTFOLIO
   Navbar, menu HP, scroll-spy, reveal, cahaya kartu
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Navbar berubah saat scroll */
  if (header) {
    const update = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* 2. Menu HP */
  if (header && menuToggle && mainNav) {
    const setOpen = (open) => {
      document.body.classList.toggle("menu-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
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

  /* 3. Tandai menu sesuai section yang sedang dilihat (hanya di beranda)
        + pill penanda yang meluncur ke menu aktif (desktop) */
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

      /* Hero & Contact: tidak ada menu teks yang aktif (Contact diwakili tombol "Let's talk") */
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
  desktop.addEventListener("change", placeIndicator);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeIndicator);

  /* 4. Muncul halus saat di-scroll */
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
    // Jaring pengaman: jangan pernah biarkan konten tersembunyi
    setTimeout(showAll, 4000);
  }

  /* 5. Kilau cahaya mengikuti kursor pada kartu proyek (mouse saja) */
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

});
