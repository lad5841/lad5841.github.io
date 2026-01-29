(() => {
  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Improve keyboard focus for skip link target
  const main = document.getElementById("main");
  if (main) main.setAttribute("tabindex", "-1");
})();
