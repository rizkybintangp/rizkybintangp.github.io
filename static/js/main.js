
/* =========================================
   RIZKY BINTANG PORTFOLIO
   NAVBAR + SCROLL REVEAL
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------
     1. FLOATING NAVBAR
  --------------------------------------- */

  const header = document.getElementById("siteHeader");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (header) {

    const updateNavbar = () => {
      header.classList.toggle(
        "is-scrolled",
        window.scrollY > 40
      );
    };

    updateNavbar();

    window.addEventListener("scroll", updateNavbar, {
      passive: true
    });

  }

  /* ---------------------------------------
     2. MOBILE NAVIGATION
  --------------------------------------- */

  if (menuToggle && mainNav) {

    const closeMenu = () => {
      document.body.classList.remove("menu-open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );
    };

    menuToggle.addEventListener("click", () => {

      const isOpen = document.body.classList.toggle("menu-open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );

    });

    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", event => {

      if (
        document.body.classList.contains("menu-open") &&
        !header.contains(event.target)
      ) {
        closeMenu();
      }

    });

    document.addEventListener("keydown", event => {

      if (event.key === "Escape") {
        closeMenu();
      }

    });

    window.addEventListener("resize", () => {

      if (window.innerWidth > 760) {
        closeMenu();
      }

    });

  }

  /* ---------------------------------------
     3. SCROLL REVEAL
  --------------------------------------- */

  const revealElements = document.querySelectorAll(".reveal");

  // Aktifkan progressive enhancement.
  // Tanpa JavaScript, konten tetap terlihat.

  document.documentElement.classList.add("js");

  const showAllReveal = () => {
    revealElements.forEach(element => {
      element.classList.add("is-visible");
    });
  };

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    reducedMotion ||
    !("IntersectionObserver" in window)
  ) {
    showAllReveal();
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("is-visible");

          observer.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px -20px 0px"
    }
  );

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

});

/* =========================================
   PROJECT CARD - MOUSE LIGHT INTERACTION
========================================= */

document.querySelectorAll(".project-card").forEach(card => {

  card.addEventListener("pointermove", event => {

    if (event.pointerType !== "mouse") return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const mouseX = (x / rect.width) * 100;
    const mouseY = (y / rect.height) * 100;

    const art = card.querySelector(".project-art");

    if (art) {
      art.style.setProperty("--mouse-x", `${mouseX}%`);
      art.style.setProperty("--mouse-y", `${mouseY}%`);
    }

  });

  card.addEventListener("pointerleave", () => {

    const art = card.querySelector(".project-art");

    if (art) {
      art.style.setProperty("--mouse-x", "50%");
      art.style.setProperty("--mouse-y", "50%");
    }

  });

});
