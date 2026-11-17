/* =========================================================
   common.js — code shared by every page:
   theme toggle, navbar counters, login state, cart & favourites,
   toast messages, "open now" status, back-to-top button.
   ========================================================= */

/* ---------- small helpers ---------- */
function formatPrice(n) {
  return Math.round(n).toLocaleString("ru-RU").replace(/ /g, " ") + " ₸";
}
function findItem(id) {
  return MENU.find(function (item) { return item.id === id; });
}
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/* ---------- user / session ---------- */
function getUsers() { return loadData(KEYS.users, []); }
function getCurrentUser() {
  const email = loadData(KEYS.session, null);
  if (!email) return null;
  return getUsers().find(function (u) { return u.email === email; }) || null;
}
function logOut() {
  removeData(KEYS.session);
  window.location.href = "account.html";
}

/* ---------- cart ---------- */
function getCart() { return loadData(KEYS.cart, []); }
function saveCart(cart) { saveData(KEYS.cart, cart); updateNavCounters(); }

/* key = what makes a line unique (the same item with different options is a new line) */
function addToCart(entry) {
  const cart = getCart();
  const key = entry.key || entry.id;
  const line = cart.find(function (l) { return l.key === key; });
  if (line) {
    line.qty += 1;
  } else {
    cart.push({ key: key, id: entry.id, name: entry.name, price: entry.price, qty: 1, note: entry.note || "", img: entry.img || "cup.svg" });
  }
  saveCart(cart);
  bumpBadge("#cartCount");
  showToast(entry.name + " added to your order", "cart.html", "View order");
}
function cartCount() {
  return getCart().reduce(function (sum, l) { return sum + l.qty; }, 0);
}

/* ---------- favourites ---------- */
function getFavs() { return loadData(KEYS.favs, []); }
function isFav(id) { return getFavs().indexOf(id) !== -1; }
function toggleFav(id) {
  let favs = getFavs();
  if (favs.indexOf(id) === -1) {
    favs.push(id);
    showToast("Saved to your favourites ♥", "profile.html#favourites", "See all");
  } else {
    favs = favs.filter(function (f) { return f !== id; });
  }
  saveData(KEYS.favs, favs);
  updateNavCounters();
  bumpBadge("#favCount");
  return favs.indexOf(id) !== -1;
}

/* ---------- navbar ---------- */
function updateNavCounters() {
  const c = cartCount();
  const f = getFavs().length;
  $("#cartCount").text(c).toggleClass("is-empty", c === 0);
  $("#favCount").text(f).toggleClass("is-empty", f === 0);
}

function updateNavUser() {
  const user = getCurrentUser();
  const $link = $("#accountLink");
  if (user) {
    const initials = user.name.split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2).toUpperCase();
    $link.attr("href", "profile.html").attr("aria-label", "My profile").addClass("is-user")
         .html('<span class="avatar">' + escapeHtml(initials) + '</span><span class="d-lg-none ms-2">My profile</span>');
  } else {
    $link.attr("href", "account.html").removeClass("is-user").text("Se connecter");
  }
}

/* small jQuery bounce on a badge when its number changes */
function bumpBadge(selector) {
  $(selector).stop(true, true).animate({ top: "-14px" }, 120).animate({ top: "-8px" }, 160);
}

/* ---------- light / dark mode ---------- */
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  saveData(KEYS.theme, theme);
  $(".theme-toggle").attr("aria-pressed", theme === "dark")
    .attr("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
}

/* ---------- toast message (jQuery fadeIn / fadeOut) ---------- */
let toastTimer = null;
function showToast(text, link, linkText) {
  let $toast = $("#ccToast");
  if (!$toast.length) {
    $toast = $('<div id="ccToast" class="cc-toast" role="status" aria-live="polite"></div>').appendTo("body");
  }
  let html = "<span>" + escapeHtml(text) + "</span>";
  if (link) html += ' <a href="' + link + '">' + escapeHtml(linkText) + " →</a>";
  clearTimeout(toastTimer);
  $toast.html(html).stop(true, true).fadeIn(250);
  toastTimer = setTimeout(function () { $toast.stop(true, true).fadeOut(400); }, 2600);
}

/* ---------- "open now" status (calculated from the real clock) ---------- */
function openStatus(now) {
  now = now || new Date();
  const today = HOURS[now.getDay()];
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openM = today.open * 60;
  const closeM = today.close * 60;
  if (minutes >= openM && minutes < closeM) {
    const left = closeM - minutes;
    const h = Math.floor(left / 60);
    const m = left % 60;
    return { open: true, text: "Open now · closes in " + (h > 0 ? h + " h " : "") + m + " min" };
  }
  if (minutes < openM) {
    return { open: false, text: "Closed · opens today at " + String(today.open).padStart(2, "0") + ":00" };
  }
  const tomorrow = HOURS[(now.getDay() + 1) % 7];
  return { open: false, text: "Closed · opens tomorrow at " + String(tomorrow.open).padStart(2, "0") + ":00" };
}

/* ---------- start ---------- */
$(function () {
  updateNavCounters();
  updateNavUser();
  setTheme(document.documentElement.getAttribute("data-theme") || "light");

  $(".theme-toggle").on("click", function () {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next);
  });

  $(".js-open-status").each(function () {
    const s = openStatus();
    $(this).text(s.text).toggleClass("is-closed", !s.open);
    $(this).closest(".open-chip").toggleClass("closed", !s.open);
  });

  $(".js-year").text(new Date().getFullYear());

  /* back-to-top button: jQuery fadeIn / fadeOut */
  const $top = $('<button type="button" class="to-top" aria-label="Back to top">↑</button>').appendTo("body").hide();
  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 500) { $top.stop(true, true).fadeIn(200); } else { $top.stop(true, true).fadeOut(200); }
  });
  $top.on("click", function () { $("html, body").stop().animate({ scrollTop: 0 }, 500); });

  /* keep counters in sync if another tab changes the data */
  window.addEventListener("storage", function () { updateNavCounters(); updateNavUser(); });
});

