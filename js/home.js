/* =========================================================
   home.js — the home page:
   "La carte du matin" list and the special of the day.
   ========================================================= */
$(function () {
  /* 1. morning menu: picture cards built from the MENU array.
        The description is hidden and slides up when the mouse is over the card. */
  const morningIds = ["creme", "aulait", "chocolat", "croissant", "painchoc", "tarte"];
  let html = "";
  morningIds.forEach(function (id, i) {
    const item = findItem(id);
    html += '<article class="treat reveal delay-' + (i % 3) + '" data-tilt="10" tabindex="0">' +
      '<img src="images/' + item.img + '" alt="' + item.name + '" width="150" height="150">' +
      '<div class="treat-info"><h3>' + item.name + '</h3><span class="price">' + formatPrice(item.price) + "</span></div>" +
      '<p class="treat-desc">' + item.desc + "</p>" +
      '<button type="button" class="treat-add js-add" data-id="' + item.id + '" aria-label="Add ' + item.name + ' to order" data-cursor="+">+</button>' +
      "</article>";
  });
  $("#morningMenu").html(html);
  if (window.ccAddTilt) window.ccAddTilt(document.getElementById("morningMenu"));

  $("#morningMenu").on("click", ".js-add", function () {
    const $btn = $(this);
    addToCart(findItem($btn.data("id")));
    /* small jQuery "jump" so the visitor sees it worked */
    $btn.stop(true, true).animate({ top: "-=8" }, 120).animate({ top: "+=8" }, 160);
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
