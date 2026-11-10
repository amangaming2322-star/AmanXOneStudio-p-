(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  root.classList.add("js");

  // Loader
  const done = () => document.body.classList.add("loaded");
  window.addEventListener("load", () => setTimeout(done, 450));
  setTimeout(done, 2500); // safety net

  // Nav: scrolled state + active link
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const links = $$("[data-link]");
  const spy = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (e.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.dataset.link === e.target.id));
    }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("main section[id]").forEach((s) => spy.observe(s));

  // Mobile menu
  const burger = $("#burger"), drawer = $("#drawer");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.setAttribute("aria-hidden", !open);
  };
  burger.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$("a", drawer).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  window.matchMedia("(min-width:961px)").addEventListener("change", (m) => m.matches && setMenu(false));

  // Scroll reveal
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  // Hero parallax (pointer devices only)
  const art = $("#heroArt");
  if (art && window.matchMedia("(hover:hover) and (min-width:961px) and (prefers-reduced-motion:no-preference)").matches) {
    $(".hero").addEventListener("pointermove", (e) => {
      const x = (e.clientX / innerWidth - 0.5) * 14, y = (e.clientY / innerHeight - 0.5) * 14;
      art.style.transform = `translate(${x}px,${y}px)`;
    });
  }

  // Work filters
  const btns = $$(".filters button"), works = $$(".work");
  btns.forEach((b) => b.addEventListener("click", () => {
    btns.forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    works.forEach((w) => {
      const show = b.dataset.filter === "all" || w.dataset.cat === b.dataset.filter;
      w.classList.toggle("hide", !show);
      if (show) w.classList.add("in");
    });
  }));

  // Video modal
  const modal = $("#modal"), frame = $("#frame"), mt = $("#modalTitle");
  let opener = null;
  $$("[data-video]").forEach((b) => b.addEventListener("click", () => {
    opener = b;
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.video)}?autoplay=1&rel=0&playsinline=1" title="${b.dataset.title.replace(/"/g, "&quot;")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    mt.textContent = b.dataset.title;
    modal.showModal();
  }));
  const close = () => modal.open && modal.close();
  $("#modalX").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  modal.addEventListener("close", () => { frame.innerHTML = ""; opener && opener.focus(); });

  // Contact form → mailto (static site, no backend needed)
  const form = $("#form"), note = $("#formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get("name") || "").trim(), email = (f.get("email") || "").trim(), msg = (f.get("message") || "").trim();
    let ok = true;
    $$("input,textarea", form).forEach((el) => {
      const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
      el.classList.toggle("invalid", bad);
      if (bad) ok = false;
    });
    if (!ok) { note.textContent = "Please fill in all fields with a valid email."; return; }
    const body = `${msg}\n\n— ${name} (${email})`;
    location.href = `mailto:${window.__CONTACT__.email}?subject=${encodeURIComponent("Editing project enquiry from " + name)}&body=${encodeURIComponent(body)}`;
    note.textContent = "Opening your email app… if nothing happens, email me directly at " + window.__CONTACT__.email;
  });
})();
