(() => {
  const year = document.querySelector("#year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const showToast = (message) => {
    const existing = document.querySelector(".toast");
    if (existing) {
      existing.remove();
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 1800);
  };

  const fallbackCopy = (value) => {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.getAttribute("data-copy");
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
      } catch {
        fallbackCopy(value);
      }

      showToast("Copied");
    });
  });

  document.querySelectorAll("[data-print-cv]").forEach((button) => {
    button.addEventListener("click", () => {
      window.print();
    });
  });

  document.querySelectorAll("[data-expand-card]").forEach((card) => {
    const toggle = card.querySelector("[data-expand-toggle]");
    const extra = card.querySelector(".feature-extra");
    if (!toggle || !extra) return;

    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      extra.hidden = isExpanded;
    });
  });

  const revealItems = document.querySelectorAll(
    ".feature-card, .work-item, .project-detail, .cv-section, .contact-panel, .highlight-strip > div"
  );
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16 });

    revealItems.forEach((item) => {
      item.classList.add("reveal");
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.type = "button";
  backToTop.textContent = "^";
  backToTop.setAttribute("aria-label", "Back to top");
  document.body.appendChild(backToTop);

  const updateBackToTop = () => {
    const isVisible = window.scrollY > 520;
    backToTop.classList.toggle("is-visible", isVisible);
    backToTop.setAttribute("aria-hidden", String(!isVisible));
    backToTop.tabIndex = isVisible ? 0 : -1;
  };

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  updateBackToTop();
  window.addEventListener("scroll", updateBackToTop, { passive: true });

  const galleryImages = document.querySelectorAll("[data-gallery-image]");
  if (galleryImages.length) {
    const lightbox = document.createElement("div");
    lightbox.className = "image-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Expanded screenshot");
    lightbox.hidden = true;
    lightbox.innerHTML = `
      <div class="image-lightbox-bar">
        <span data-lightbox-caption></span>
        <button class="image-lightbox-close" type="button" data-lightbox-close>Close</button>
      </div>
      <figure class="image-lightbox-figure">
        <img alt="" data-lightbox-img />
      </figure>
    `;
    document.body.appendChild(lightbox);

    const expandedImage = lightbox.querySelector("[data-lightbox-img]");
    const caption = lightbox.querySelector("[data-lightbox-caption]");
    const closeButton = lightbox.querySelector("[data-lightbox-close]");
    let activeImage = null;

    const closeLightbox = () => {
      lightbox.hidden = true;
      expandedImage.removeAttribute("src");
      document.body.style.overflow = "";
      if (activeImage) {
        activeImage.focus();
      }
    };

    const openLightbox = (image) => {
      activeImage = image;
      const figure = image.closest("figure");
      const label = figure?.querySelector("figcaption")?.textContent || image.alt || "Screenshot";
      expandedImage.src = image.currentSrc || image.src;
      expandedImage.alt = image.alt;
      caption.textContent = label;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      closeButton.focus();
    };

    galleryImages.forEach((image) => {
      image.addEventListener("click", () => openLightbox(image));
      image.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    closeButton.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
      }
    });
  }
})();
