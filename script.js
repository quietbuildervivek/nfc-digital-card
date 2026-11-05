(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ------------------------------------------------------------------
     1. Mobile menu (your original behavior)
     ------------------------------------------------------------------ */
  const toggle = document.querySelector(".navbar__toggle");
  const menu = document.getElementById("menu");
  const desktop = window.matchMedia("(min-width: 768px)");

  if (toggle && menu) {
    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    desktop.addEventListener("change", (e) => { if (e.matches) setMenu(false); });
  }

  /* ------------------------------------------------------------------
     2. Scroll reveal (your original behavior)
     ------------------------------------------------------------------ */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ------------------------------------------------------------------
     3. Typing animation in the hero
     Uses <p id="typed"> if you add one, otherwise inserts it under the title.
     ------------------------------------------------------------------ */
  const PHRASES = [
    "Aspiring Software Developer",
    "AI/ML Student",
    "Python Developer",
    "Problem Solver",
  ];
  const TYPE_MS = 70;
  const DELETE_MS = 38;
  const HOLD_MS = 1700;
  const GAP_MS = 350;

  let typedBox = document.getElementById("typed");
  if (!typedBox) {
    const title = document.querySelector(".hero__title");
    if (title) {
      typedBox = document.createElement("p");
      typedBox.id = "typed";
      typedBox.className = "hero__typed";
      title.insertAdjacentElement("afterend", typedBox);
    }
  }

  if (typedBox) {
    // Screen readers get the full list once; the animated text is hidden from them.
    typedBox.innerHTML =
      '<span class="sr-only">' + PHRASES.join(", ") + "</span>" +
      '<span class="typed__text" aria-hidden="true"></span>' +
      '<span class="typed__cursor" aria-hidden="true"></span>';
    const textEl = typedBox.querySelector(".typed__text");

    if (reduceMotion.matches) {
      textEl.textContent = PHRASES[0];
    } else {
      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const phrase = PHRASES[phraseIndex];
        charIndex += deleting ? -1 : 1;
        textEl.textContent = phrase.slice(0, charIndex);

        let delay = deleting ? DELETE_MS : TYPE_MS;
        if (!deleting && charIndex === phrase.length) {
          deleting = true;
          delay = HOLD_MS;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % PHRASES.length;
          delay = GAP_MS;
        }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 600);
    }
  }

  /* ------------------------------------------------------------------
     4. Active navigation highlighting
     The current section's link gets .is-active and aria-current="true".
     ------------------------------------------------------------------ */
  const navLinks = Array.from(document.querySelectorAll(".navbar__link"));
  const navTargets = navLinks
    .map((link) => {
      const id = (link.getAttribute("href") || "").replace("#", "");
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  const setActive = (activeLink) => {
    navLinks.forEach((link) => {
      const on = link === activeLink;
      link.classList.toggle("is-active", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  const updateActiveNav = () => {
    if (!navTargets.length) return;
    const line = window.innerHeight * 0.35; // a section is "current" once it passes this line
    let current = navTargets[0];

    for (const item of navTargets) {
      if (item.section.getBoundingClientRect().top <= line) current = item;
    }
    // At the very bottom of the page, the last section wins even if it is short.
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = navTargets[navTargets.length - 1];

    setActive(current.link);
  };

  /* ------------------------------------------------------------------
     5. Back-to-top button
     Created here, so no HTML change is needed.
     ------------------------------------------------------------------ */
  let toTop = document.querySelector(".to-top");
  if (!toTop) {
    toTop = document.createElement("button");
    toTop.type = "button";
    toTop.className = "to-top";
    toTop.setAttribute("aria-label", "Back to top");
    toTop.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(toTop);
  }

  const SHOW_AFTER = 500; // px scrolled before the button appears

  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
    // Keep keyboard focus somewhere visible once the button hides.
    const logo = document.querySelector(".navbar__logo");
    if (logo) logo.focus({ preventScroll: true });
  });

  /* ------------------------------------------------------------------
     6. Shared scroll handler (one rAF-throttled listener)
     ------------------------------------------------------------------ */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      toTop.classList.toggle("is-visible", window.scrollY > SHOW_AFTER);
      updateActiveNav();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ------------------------------------------------------------------
     7. Project interactions
     a) Cursor-following spotlight on project cards (mouse and pen only)
     b) Placeholder links (href="#") become clearly disabled "Coming soon"
     ------------------------------------------------------------------ */
  const cards = document.querySelectorAll(".project-card");

  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - rect.left + "px");
      card.style.setProperty("--my", e.clientY - rect.top + "px");
    });
  });

  document.querySelectorAll('.project-card__actions a[href="#"]').forEach((link) => {
    link.classList.add("is-disabled");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("title", "Coming soon");
    link.removeAttribute("target");
    link.addEventListener("click", (e) => e.preventDefault());
  });
})();