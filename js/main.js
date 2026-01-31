(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const toast = (() => {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    let t;
    return (msg) => {
      el.textContent = msg;
      el.classList.add("is-showing");
      clearTimeout(t);
      t = setTimeout(() => el.classList.remove("is-showing"), 1600);
    };
  })();

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Improve keyboard focus for skip link target
  const main = $("#main");
  if (main) main.setAttribute("tabindex", "-1");

  // -------------------------
  // Active tab highlighting
  // -------------------------
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$(".tabs a.tab").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href && href === current) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });

  // -------------------------
  // Theme toggle (persisted)
  // -------------------------
  const getPreferredTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const label = $("#themeLabel");
    if (label) label.textContent = theme === "light" ? "Light" : "Dark";
    const icon = $("#themeIcon");
    if (icon) {
      icon.classList.toggle("sun", theme === "light");
      icon.classList.toggle("moon", theme !== "light");
    }
  };

  setTheme(getPreferredTheme());

  const ensureThemeButton = () => {
    if ($("#themeToggle")) return;
    const tabsContainer = $(".tabs .container");
    if (!tabsContainer) return;

    const spacer = document.createElement("div");
    spacer.className = "spacer";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "themeToggle";
    btn.className = "icon-button";
    btn.setAttribute("aria-label", "Toggle theme");

    const icon = document.createElement("span");
    icon.id = "themeIcon";
    icon.className = "icon";

    const label = document.createElement("span");
    label.id = "themeLabel";

    btn.appendChild(icon);
    btn.appendChild(label);

    tabsContainer.appendChild(spacer);
    tabsContainer.appendChild(btn);

    // Sync to current theme
    setTheme(getPreferredTheme());

    btn.addEventListener("click", () => {
      const next = (document.documentElement.getAttribute("data-theme") || "dark") === "dark" ? "light" : "dark";
      setTheme(next);
      toast(`Switched to ${next} theme`);
    });
  };

  ensureThemeButton();

  // -------------------------
  // Smooth in-page scroll for anchors
  // -------------------------
  document.addEventListener("click", (e) => {
    const link = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  });

  // -------------------------
  // Back-to-top button
  // -------------------------
  const backToTop = (() => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "button back-to-top hidden";
    btn.textContent = "Back to top";
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.body.appendChild(btn);

    const onScroll = () => {
      const show = window.scrollY > 520;
      btn.classList.toggle("hidden", !show);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return btn;
  })();

  // -------------------------
  // Copy to clipboard buttons
  // -------------------------
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("Copied to clipboard");
    }
  };

  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy") || "";
      if (value) await copyText(value);
    });
  });

  // -------------------------
  // CV: per-item show/hide details
  // -------------------------
  const cvItems = $$(".cv-item");
  if (cvItems.length) {
    cvItems.forEach((item) => {
      const list = $("ul.bullets", item);
      if (!list) return;

      const wrapper = document.createElement("div");
      wrapper.className = "cv-more hidden";

      list.parentNode.insertBefore(wrapper, list);
      wrapper.appendChild(list);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "button cv-toggle";
      btn.textContent = "Show details";

      wrapper.parentNode.insertBefore(btn, wrapper);

      btn.addEventListener("click", () => {
        const isHidden = wrapper.classList.contains("hidden");
        wrapper.classList.toggle("hidden", !isHidden);
        btn.textContent = isHidden ? "Hide details" : "Show details";
      });
    });

    // Global expand/collapse buttons (if a container exists)
    const actions = $("#cvActions");
    if (actions) {
      const showAll = $("#cvShowAll");
      const hideAll = $("#cvHideAll");

      const setAll = (open) => {
        $$(".cv-more").forEach((w) => w.classList.toggle("hidden", !open));
        $$(".cv-toggle").forEach((b) => (b.textContent = open ? "Hide details" : "Show details"));
      };

      if (showAll) showAll.addEventListener("click", () => setAll(true));
      if (hideAll) hideAll.addEventListener("click", () => setAll(false));
    }
  }

  // -------------------------
  // Filters: skills + projects search
  // -------------------------
  const skillSearch = $("#skillSearch");
  if (skillSearch) {
    const tags = $$(".tags li");
    const filter = () => {
      const q = skillSearch.value.trim().toLowerCase();
      tags.forEach((li) => {
        const hit = !q || li.textContent.toLowerCase().includes(q);
        li.classList.toggle("hidden", !hit);
      });
    };
    skillSearch.addEventListener("input", filter);
    filter();
  }

  const projectSearch = $("#projectSearch");
  if (projectSearch) {
    const cards = $$(".cards .card");
    const filter = () => {
      const q = projectSearch.value.trim().toLowerCase();
      cards.forEach((c) => {
        const hit = !q || c.textContent.toLowerCase().includes(q);
        c.classList.toggle("hidden", !hit);
      });
    };
    projectSearch.addEventListener("input", filter);
    filter();
  }

  // -------------------------
  // Overview: quick filter buttons (optional)
  // -------------------------
  $$(".pill").forEach((pill) => {
    pill.addEventListener("click", () => {
      const pressed = pill.getAttribute("aria-pressed") === "true";
      pill.setAttribute("aria-pressed", pressed ? "false" : "true");
      const targetId = pill.getAttribute("data-scroll");
      if (targetId) {
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
})();
