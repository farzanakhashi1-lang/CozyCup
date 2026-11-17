/* =========================================================
   home.js — the home page:
   "La carte du matin" list and the special of the day.
   ========================================================= */
$(function () {
  /* 1. morning menu: built from the MENU array */
  const morningIds = ["creme", "aulait", "chocolat", "croissant", "painchoc", "tarte"];
  const columns = [morningIds.slice(0, 3), morningIds.slice(3)];
  let html = "";
  columns.forEach(function (ids, colIndex) {
    html += '<div class="col-md-6 reveal' + (colIndex ? " delay-1" : "") + '">';
    ids.forEach(function (id) {
      const item = findItem(id);
      html += '<div class="item-line">' +
        '<span class="name">' + item.name + "<small>" + item.desc + "</small></span>" +
        '<span class="leader" aria-hidden="true"></span>' +
        '<span class="price">' + formatPrice(item.price) + "</span>" +
        '<button type="button" class="mini-btn add js-add" data-id="' + item.id + '" aria-label="Add ' + item.name + ' to order" data-cursor="+">+</button>' +
        "</div>";
    });
    html += "</div>";
  });
  $("#morningMenu").html(html);

  $("#morningMenu").on("click", ".js-add", function () {
    const item = findItem($(this).data("id"));
    addToCart(item);
  });

  /* 2. special of the day: chosen by the weekday */
  const now = new Date();
  const special = findItem(SPECIALS[now.getDay()]);
  const dateText = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  $("#specialDate").text(dateText);
  $("#specialName").text(special.name);
  $("#specialDesc").text(special.desc);
  $("#specialPrice").text(formatPrice(special.price));
  $("#specialImg").attr("src", "images/" + special.img).attr("alt", special.name);
  $("#specialAdd").on("click", function () { addToCart(special); });

  /* 3. today's opening hours on the round tag */
  const today = HOURS[now.getDay()];
  $("#todayHours").text(String(today.open).padStart(2, "0") + " – " + today.close);

  /* re-check reveal for the new elements */
  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll("#morningMenu .reveal").forEach(function (el) { io.observe(el); });
  } else {
    $("#morningMenu .reveal").addClass("is-visible");
  }
});
