/* =========================================================
   cart.js — the order page
   Quantities, remove one, clear all, totals, member discount,
   pick-up form with validation.
   ========================================================= */
$(function () {
  const DISCOUNT = 0.05; // members get 5 %

  function totals(cart) {
    const sub = cart.reduce(function (s, l) { return s + l.price * l.qty; }, 0);
    const disc = getCurrentUser() ? Math.round(sub * DISCOUNT) : 0;
    return { sub: sub, disc: disc, total: sub - disc };
  }

  function lineHtml(l, i) {
    return '<div class="cart-line" data-i="' + i + '">' +
      '<div class="thumb"><img src="images/' + l.img + '" alt="" width="54" height="54"></div>' +
      '<div class="info"><span class="ttl">' + escapeHtml(l.name) + "</span>" +
      '<small class="text-muted">' + (l.note ? escapeHtml(l.note) : formatPrice(l.price) + " each") + "</small></div>" +
      '<div class="qty"><button type="button" class="js-minus" aria-label="One less ' + escapeHtml(l.name) + '">−</button>' +
      '<span aria-live="polite">' + l.qty + "</span>" +
      '<button type="button" class="js-plus" aria-label="One more ' + escapeHtml(l.name) + '">+</button></div>' +
      '<span class="line-total">' + formatPrice(l.price * l.qty) + "</span>" +
      '<button type="button" class="icon-btn del js-del" aria-label="Remove ' + escapeHtml(l.name) + '">×</button></div>';
  }

  function render() {
    const cart = getCart();
    const count = cartCount();
    $("#cartTitle").text(count === 0 ? "Items" : count + (count === 1 ? " item" : " items"));
    $("#clearCart").prop("hidden", cart.length === 0);

    if (cart.length === 0) {
      $("#cartLines").html('<div class="empty-state mt-4"><img src="images/cup.svg" alt="" width="120" height="120">' +
        "<h3>Your cup is empty</h3><p>Nothing in your order yet.</p>" +
        '<a class="btn-cc" href="menu.html" data-magnetic>Open the menu</a></div>');
      $("#checkoutForm").hide();
    } else {
      $("#cartLines").html(cart.map(lineHtml).join(""));
      $("#checkoutForm").show();
    }

    const t = totals(cart);
    $("#sumSub").text(formatPrice(t.sub));
    $("#sumDisc").text("− " + formatPrice(t.disc));
    $("#sumTotal").text(formatPrice(t.total));
    const user = getCurrentUser();
    $("#memberLine").toggle(!!user);
    $("#memberHint").html(user ? "Member price applied. This order adds one stamp to your card." : 'Members save 5 %. <a href="account.html">Log in or sign up</a>.');
  }

  function changeQty(i, delta) {
    const cart = getCart();
    if (!cart[i]) return;
    cart[i].qty += delta;
    if (cart[i].qty < 1) {
      removeLine(i);
      return;
    }
    if (cart[i].qty > 20) cart[i].qty = 20;
    saveCart(cart);
    render();
  }

  function removeLine(i) {
    $('.cart-line[data-i="' + i + '"]').stop(true, true).slideUp(300, function () {
      const cart = getCart();
      cart.splice(i, 1);
      saveCart(cart);
      render();
    });
  }

  $("#cartLines").on("click", ".js-plus", function () { changeQty(Number($(this).closest(".cart-line").data("i")), 1); });
  $("#cartLines").on("click", ".js-minus", function () { changeQty(Number($(this).closest(".cart-line").data("i")), -1); });
  $("#cartLines").on("click", ".js-del", function () { removeLine(Number($(this).closest(".cart-line").data("i"))); });
  $("#clearCart").on("click", function () {
    $(".cart-line").slideUp(300).promise().done(function () {
      saveCart([]);
      render();
    });
  });

  /* pick-up times: every 15 min from now + 15 until closing */
  function fillPickup() {
    const now = new Date();
    const h = HOURS[now.getDay()];
    let start = Math.ceil((now.getHours() * 60 + now.getMinutes() + 15) / 15) * 15;
    start = Math.max(start, h.open * 60);
    const $sel = $("#cTime").empty();
    for (let m = start; m <= h.close * 60 - 15; m += 15) {
      const t = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
      $sel.append('<option value="' + t + '">Today · ' + t + "</option>");
    }
    if ($sel.children().length === 0) {
      $sel.append('<option value="tomorrow">Tomorrow · ' + String(HOURS[(now.getDay() + 1) % 7].open).padStart(2, "0") + ":15</option>");
    }
  }

  $("#checkoutForm").on("submit", function (e) {
    e.preventDefault();
    $("#orderOk").hide();
    if (getCart().length === 0) return;
    const ok = checkFields([
      { el: "#cName", test: RULES.name, msg: "Write your name (2–40 letters)." },
      { el: "#cPhone", test: RULES.phone, msg: "Enter 11 digits, e.g. 8 701 234 56 78." },
      { el: "#cTime", test: RULES.required, msg: "Choose a pick-up time." }
    ]);
    if (!ok) return;

    const user = getCurrentUser();
    const cart = getCart();
    const t = totals(cart);
    const orders = loadData(KEYS.orders, []);
    const order = {
      id: 1000 + orders.length + 1,
      email: user ? user.email : null,
      items: cart.map(function (l) { return { name: l.name, qty: l.qty }; }),
      count: cartCount(),
      total: t.total,
      time: $("#cTime option:selected").text(),
      date: new Date().toISOString()
    };
    orders.push(order);
    saveData(KEYS.orders, orders);
    saveCart([]);
    render();
    clearState($("#checkoutForm"));
    showSuccess($("#orderOk"), "Merci! Order #" + order.id + " (" + formatPrice(order.total) + ") will be ready at " + escapeHtml(order.time.replace("Today · ", "")) + "." + (user ? " +1 stamp on your card." : ""));
  });

  /* fill the name if logged in */
  const user = getCurrentUser();
  if (user) $("#cName").val(user.name);

  fillPickup();
  render();
});
