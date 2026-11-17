/* =========================================================
   theme.js — loaded in <head> BEFORE the page is drawn,
   so the saved mode is applied with no white flash.
   ========================================================= */
(function () {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem("cc_theme")); } catch (e) { saved = null; }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved === "dark" || saved === "light" ? saved : (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();
