(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year in footer
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Toast helper
  const toast = (msg) => {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 2200);
  };

  // Back-to-top
  (() => {
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
  })();

  // Copy-to-clipboard
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    } catch {
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

  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.getAttribute('data-copy') || '';
      if (value) await copyText(value);
    });
  });

  // CV: per-item show/hide details (auto-wrap bullet lists)
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
      btn.className = "button secondary";
      btn.textContent = "Show details";

      wrapper.parentNode.insertBefore(btn, wrapper);

      btn.addEventListener("click", () => {
        const isHidden = wrapper.classList.contains("hidden");
        wrapper.classList.toggle("hidden", !isHidden);
        btn.textContent = isHidden ? "Hide details" : "Show details";
      });
    });
  }

  // Skills filter
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

  // Projects search
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

  // Project category chips
  const chips = $$(".chip");
  if (chips.length) {
    let active = "";
    const apply = () => {
      const cards = $$(".cards .card");
      cards.forEach((c) => {
        const tags = (c.getAttribute("data-tags") || "").toLowerCase();
        const hit = !active || tags.includes(active);
        c.classList.toggle("hidden", !hit);
      });
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const key = (chip.getAttribute("data-filter") || "").toLowerCase();
        const isActive = active === key;

        active = isActive ? "" : key;

        chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
        chip.setAttribute("aria-pressed", isActive ? "false" : "true");

        // Clear search when using chips (keeps UX predictable)
        if (projectSearch) projectSearch.value = "";

        apply();
      });
    });
  }
})();
