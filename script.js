
(() => {
  const toggle = document.querySelector(".navbar__toggle");
  const menu = document.getElementById("menu");
  const desktop = window.matchMedia("(min-width: 768px)");

  const setMenu = (open) => {
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  desktop.addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
})();