/* =========================================================
   profile.js — the member page (only for logged-in users)
   ========================================================= */
$(function () {
  const user = getCurrentUser();
  if (!user) {
    window.location.replace("account.html");
    return;
  }

  /* greeting changes with the time of day */
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Bonjour" : (hour < 18 ? "Bon après-midi" : "Bonsoir");
  const first = user.name.split(" ")[0];
  $("#hello").html(hello + ", <em>" + escapeHtml(first) + "</em>.");
  const joined = new Date(user.joined);
  $("#memberSince").text("Member since " + joined.toLocaleDateString("en-GB", { month: "long", year: "numeric" }));

  /* the gold card */
  const orders = loadData(KEYS.orders, []).filter(function (o) { return o.email === user.email; });
  const level = orders.length >= 10 ? "GOLD" : (orders.length >= 3 ? "SILVER" : "MEMBER");
  const fav = findItem(user.fav);
  $("#mcLevel").text(level);
  $("#mcNo").text(user.number + " · " + joined.getFullYear());
  $("#mcName").text(user.name);
  $("#mcEmail").text(user.email);
  $("#mcFav").text(fav ? "♥ " + fav.name : "");

  /* stamp card: 10 orders = 1 free cup */
  const stamps = orders.length % 10;
  const free = Math.floor(orders.length / 10);
  let html = "";
  for (let i = 0; i < 10; i++) {
    html += '<span class="stamp' + (i < stamps ? " is-on" : "") + '">' + (i < stamps ? '<img src="images/cup.svg" alt="">' : "") + "</span>";
  }
  $("#stamps").html(html).attr("aria-label", stamps + " of 10 stamps");
  $("#stampText").text(free > 0
    ? "You have " + free + " free cup(s) waiting! " + (10 - stamps) + " more orders for the next one."
    : (10 - stamps) + " more orders and your next cup is on us.");

  /* favourites (saved on the menu page, shown here) */
  function drawFavs() {
    const favs = getFavs().map(findItem).filter(Boolean);
    $("#clearFavs").prop("hidden", favs.length === 0);
    if (favs.length === 0) {
      $("#favList").html('<li class="muted-empty">No favourites yet — tap ♡ in <a href="menu.html">La Carte</a>.</li>');
      return;
    }
    $("#favList").html(favs.map(function (item) {
      return '<li><div><b>' + item.name + "</b><small>" + formatPrice(item.price) + "</small></div>" +
        '<button type="button" class="mini-btn js-add" data-id="' + item.id + '" aria-label="Add ' + item.name + ' to order">+</button>' +
        '<button type="button" class="mini-btn js-unfav" data-id="' + item.id + '" aria-label="Remove ' + item.name + ' from favourites">×</button></li>';
    }).join(""));
  }
  $("#favList").on("click", ".js-add", function () { addToCart(findItem($(this).data("id"))); });
  $("#favList").on("click", ".js-unfav", function () {
    const id = $(this).data("id");
    $(this).closest("li").slideUp(250, function () { toggleFav(id); drawFavs(); });
  });
  $("#clearFavs").on("click", function () {
    $("#favList li").slideUp(250).promise().done(function () {
      saveData(KEYS.favs, []);
      updateNavCounters();
      drawFavs();
    });
  });

  /* saved recipes from L'Atelier */
  const recipes = loadData(KEYS.recipes, []);
  $("#recipeList").html(recipes.length === 0
    ? '<li class="muted-empty">No recipes yet — compose one in <a href="atelier.html">L’Atelier</a>.</li>'
    : recipes.map(function (r) {
      return "<li><div><b>" + escapeHtml(r.name) + "</b><small>" + escapeHtml(r.note) + "</small></div><span>" + formatPrice(r.price) + "</span></li>";
    }).join(""));

  /* reservations */
  const bookings = loadData(KEYS.bookings, []).filter(function (b) { return b.email === user.email; });
  $("#bookList").html(bookings.length === 0
    ? '<li class="muted-empty">No reservations — <a href="reserve.html">choose a table</a>.</li>'
    : bookings.map(function (b) {
      return "<li><div><b>Table " + b.table + "</b><small>" + b.date.split("-").reverse().join(".") + " · " + b.time + " · " + b.guests + " guest(s)</small></div></li>";
    }).join(""));

  /* past orders (newest first) */
  $("#orderList").html(orders.length === 0
    ? '<li class="muted-empty">No orders yet.</li>'
    : orders.slice().reverse().slice(0, 5).map(function (o) {
      return "<li><div><b>Order #" + o.id + "</b><small>" + o.count + " item(s) · " + new Date(o.date).toLocaleDateString("en-GB") + "</small></div><span>" + formatPrice(o.total) + "</span></li>";
    }).join(""));

  $("#logoutBtn").on("click", logOut);

  drawFavs();
});
