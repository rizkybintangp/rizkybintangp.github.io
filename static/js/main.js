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

  /* 5. Pop-up karya desain (kaca ala iOS 26) */
  const dm = document.getElementById("designModal");
  if (dm && typeof dm.showModal === "function") {
    const dmIcon = dm.querySelector(".dm-icon");
    const dmTitle = dm.querySelector("#dmTitle");
    const dmCat = dm.querySelector("#dmCat");
    const dmClose = dm.querySelector(".dm-close");
    const dmBody = dm.querySelector(".dm-body");
    const gallery = dm.querySelector(".gallery");
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ease = "cubic-bezier(.22, 1, .36, 1)";
    const widths = [250, 310, 370, 280, 340, 230];
    let closing = false;

    /* Acak yang tetap (tidak berubah tiap dibuka) */
    const rnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

    const build = (card, seed) => {
      gallery.textContent = "";
      const tpl = card.querySelector(".tpl-images");
      const srcs = tpl ? Array.from(tpl.content.querySelectorAll("img")) : [];
      if (!srcs.length) {
        gallery.innerHTML = '<p class="dm-empty">Karya untuk bagian ini akan segera ditambahkan.</p>';
        return [];
      }
      return srcs.map((node, i) => {
        const k = seed * 31 + i;
        const fig = document.createElement("figure");
        fig.className = "thumb";
        fig.style.setProperty("--w", widths[Math.floor(rnd(k + 1) * widths.length)] + "px");
        fig.style.setProperty("--r", ((rnd(k + 7) - 0.5) * 7).toFixed(2) + "deg");
        fig.style.setProperty("--y", Math.round((rnd(k + 13) - 0.5) * 44) + "px");
        const img = node.cloneNode(true);
        fig.appendChild(img);
        gallery.appendChild(fig);
        return img;
      });
    };

    const openModal = (card, seed) => {
      closing = false;
      dmTitle.textContent = card.dataset.title || "";
      dmCat.textContent = card.dataset.category || "";
      const ic = card.querySelector(".tpl-icon");
      dmIcon.innerHTML = ic ? ic.innerHTML : "";
      const thumbs = build(card, seed);

      root.classList.add("modal-open");
      dm.showModal();
      dmBody.scrollTop = 0;
      requestAnimationFrame(() => dm.classList.add("is-in"));

      if (reduce.matches || !dm.animate) return;

      /* Ikon "bergulir" naik dari kartu ke kepala pop-up, lalu judul menyusul */
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
      thumbs.forEach((img, i) =>
        img.animate(
          [{ opacity: 0, transform: "translateY(46px) scale(.93)" }, { opacity: 1, transform: "none" }],
          { duration: 700, delay: 380 + i * 80, easing: ease, fill: "backwards" }
        )
      );
    };

    const closeModal = () => {
      if (closing || !dm.open) return;
      closing = true;
      dm.classList.remove("is-in");
      setTimeout(() => dm.close(), reduce.matches ? 0 : 280);
    };

    dm.addEventListener("cancel", (e) => { e.preventDefault(); closeModal(); });   /* tombol Esc */
    dm.addEventListener("click", (e) => { if (e.target === dm) closeModal(); });   /* klik area luar */
    dmClose.addEventListener("click", closeModal);
    dm.addEventListener("close", () => {
      root.classList.remove("modal-open");
      gallery.textContent = "";
      closing = false;
    });

    document.querySelectorAll(".work").forEach((card, i) => {
      card.addEventListener("click", () => openModal(card, i + 1));
    });
  }

});
