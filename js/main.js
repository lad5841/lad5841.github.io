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
