/* =========================================================
   atelier.js — build your own drink
   Options come from the ATELIER object in data.js.
   The cup layers grow with jQuery .animate().
   ========================================================= */
$(function () {
  /* 1. build the radio buttons / checkboxes from the data */
  function buildGroup(groupName, list, type) {
    let html = "";
    list.forEach(function (opt, i) {
      const checked = type === "radio" && i === (groupName === "size" || groupName === "milk" ? 1 : 0) ? " checked" : "";
      const extra = opt.price ? "+ " + formatPrice(opt.price) : (groupName === "base" ? formatPrice(opt.price) : "");
      html += '<label class="opt"><input type="' + type + '" name="' + groupName + '" value="' + opt.id + '"' + checked + ">" +
        '<span class="label-text">' + opt.label + '</span><span class="extra">' + extra + "</span></label>";
    });
    $("#opt-" + groupName).html(html);
  }
  buildGroup("size", ATELIER.size, "radio");
  buildGroup("base", ATELIER.base, "radio");
  buildGroup("milk", ATELIER.milk, "radio");
  buildGroup("syrup", ATELIER.syrup, "radio");
  buildGroup("extras", ATELIER.extras, "checkbox");
  /* base shows its full price, not "+" */
  $("#opt-base .extra").each(function (i) { $(this).text(formatPrice(ATELIER.base[i].price)); });

  function pick(group) {
    const id = $('input[name="' + group + '"]:checked').val();
    return ATELIER[group].find(function (o) { return o.id === id; });
  }
  function pickedExtras() {
    return $('input[name="extras"]:checked').map(function () {
      const id = $(this).val();
      return ATELIER.extras.find(function (o) { return o.id === id; });
    }).get();
  }

  /* 2. the calculation: price, calories, caffeine, name */
  function compute() {
    const size = pick("size"), base = pick("base"), milk = pick("milk"), syrup = pick("syrup");
    const extras = pickedExtras();
    let price = base.price + size.price + milk.price + syrup.price;
    let kcal = base.kcal + milk.kcal + syrup.kcal;
    let caffeine = base.caffeine;
    extras.forEach(function (e) {
      price += e.price;
      kcal += e.kcal;
      caffeine += e.caffeine || 0;
    });
    kcal = Math.round(kcal * size.factor);
    const minutes = 2 + (milk.id !== "none" ? 1 : 0) + (extras.length > 0 ? 1 : 0);

    /* the name: "Le" + words from the choices */
    const words = [base.word, milk.word, syrup.word].filter(function (w) { return w !== ""; });
    let name = "Le " + words[0];
    if (words.length > 1) name += " " + words.slice(1).join(" & ");
    if (extras.some(function (e) { return e.id === "creme"; })) name += " Royal";

    return { size: size, base: base, milk: milk, syrup: syrup, extras: extras, price: price, kcal: kcal, caffeine: caffeine, minutes: minutes, name: name };
  }

  /* 3. draw the cup: one layer per ingredient */
  function drawCup(r) {
    const layers = [{ color: r.base.color, h: r.milk.color ? 34 : 70 }];
    if (r.syrup.color) layers.push({ color: r.syrup.color, h: 10 });
    if (r.milk.color) layers.push({ color: r.milk.color, h: 38 });
    const total = layers.reduce(function (s, l) { return s + l.h; }, 0);
    const scale = (60 + r.size.factor * 28) / total;   // bigger size = fuller cup

    const $body = $("#glassBody");
    while ($body.children().length < layers.length) $body.append('<div class="layer"></div>');
    $body.children().each(function (i) {
      const $layer = $(this);
      if (i < layers.length) {
        $layer.css("background", layers[i].color).stop(true).animate({ height: (layers[i].h * scale) + "%" }, 500);
      } else {
        $layer.stop(true).animate({ height: 0 }, 400, function () { $layer.remove(); });
      }
    });
    const filled = Math.min(100, total * scale);
    const hasCream = r.extras.some(function (e) { return e.id === "creme"; });
    $("#foam").css({ bottom: (filled * 2.6 - 12) + "px", opacity: hasCream ? 1 : 0 });
  }

  /* 4. show everything */
  function render() {
    const r = compute();
    drawCup(r);
    let lines = '<div class="recap-line"><span>' + r.base.label + "</span><span>" + formatPrice(r.base.price) + "</span></div>";
    lines += '<div class="recap-line"><span>' + r.size.label + "</span><span>" + (r.size.price ? "+ " + formatPrice(r.size.price) : "—") + "</span></div>";
    if (r.milk.id !== "none") lines += '<div class="recap-line"><span>' + r.milk.label + "</span><span>" + (r.milk.price ? "+ " + formatPrice(r.milk.price) : "—") + "</span></div>";
    if (r.syrup.id !== "none") lines += '<div class="recap-line"><span>' + r.syrup.label + "</span><span>+ " + formatPrice(r.syrup.price) + "</span></div>";
    r.extras.forEach(function (e) {
      lines += '<div class="recap-line"><span>' + e.label + "</span><span>" + (e.price ? "+ " + formatPrice(e.price) : "free") + "</span></div>";
    });
    $("#recapLines").html(lines);
    $("#recapTotal").text(formatPrice(r.price));
    $("#nutKcal").text(r.kcal);
    $("#nutCaf").text(r.caffeine);
    $("#nutTime").text(r.minutes);
    if ($("#cupName").text() !== r.name) {
      $("#cupName").stop(true, true).fadeOut(120, function () { $(this).text(r.name).fadeIn(200); });
    }
    return r;
  }

  function describe(r) {
    const parts = [r.size.label.split(" ·")[0], r.base.label];
    if (r.milk.id !== "none") parts.push(r.milk.label.toLowerCase());
    if (r.syrup.id !== "none") parts.push(r.syrup.label.toLowerCase());
    r.extras.forEach(function (e) { parts.push(e.label.toLowerCase()); });
    return parts.join(", ");
  }

  $("#atelierForm").on("change", "input", render);

  /* add to cart: each different recipe is its own line */
  $("#addCup").on("click", function () {
    const r = compute();
    addToCart({ id: "atelier", key: "atelier-" + describe(r), name: r.name, price: r.price, note: describe(r), img: "cup.svg" });
  });

  /* 5. saved recipes */
  function drawRecipes() {
    const recipes = loadData(KEYS.recipes, []);
    if (recipes.length === 0) {
      $("#recipeList").html('<li class="muted-empty">No recipes yet — compose a cup and press “Save recipe”.</li>');
      $("#clearRecipes").prop("hidden", true);
      return;
    }
    $("#clearRecipes").prop("hidden", false);
    $("#recipeList").html(recipes.map(function (rc, i) {
      return '<li><span><b>' + escapeHtml(rc.name) + "</b><small>" + escapeHtml(rc.note) + " · " + rc.kcal + " kcal</small></span>" +
        '<span class="text-nowrap">' + formatPrice(rc.price) + "</span>" +
        '<button type="button" class="btn-cc btn-small js-recipe-add" data-i="' + i + '">Add</button>' +
        '<button type="button" class="icon-btn js-recipe-del" data-i="' + i + '" aria-label="Delete recipe ' + escapeHtml(rc.name) + '">×</button></li>';
    }).join(""));
  }

  $("#saveCup").on("click", function () {
    const r = compute();
    const recipes = loadData(KEYS.recipes, []);
    const note = describe(r);
    if (recipes.some(function (rc) { return rc.note === note; })) {
      showToast("This recipe is already saved");
      return;
    }
    recipes.push({ name: r.name, note: note, price: r.price, kcal: r.kcal, caffeine: r.caffeine });
    saveData(KEYS.recipes, recipes);
    drawRecipes();
    showToast("Recipe saved: " + r.name, "profile.html", "Profile");
  });

  $("#recipeList").on("click", ".js-recipe-add", function () {
    const rc = loadData(KEYS.recipes, [])[$(this).data("i")];
    if (rc) addToCart({ id: "atelier", key: "atelier-" + rc.note, name: rc.name, price: rc.price, note: rc.note, img: "cup.svg" });
  });
  $("#recipeList").on("click", ".js-recipe-del", function () {
    const i = $(this).data("i");
    $(this).closest("li").slideUp(250, function () {
      const recipes = loadData(KEYS.recipes, []);
      recipes.splice(i, 1);
      saveData(KEYS.recipes, recipes);
      drawRecipes();
    });
  });
  $("#clearRecipes").on("click", function () {
    $("#recipeList li").slideUp(250).promise().done(function () {
      saveData(KEYS.recipes, []);
      drawRecipes();
    });
  });

  /* 6. surprise me: random choices */
  $("#randomCup").on("click", function () {
    ["size", "base", "milk", "syrup"].forEach(function (g) {
      const $opts = $('input[name="' + g + '"]');
      $opts.eq(Math.floor(Math.random() * $opts.length)).prop("checked", true);
    });
    $('input[name="extras"]').each(function () { $(this).prop("checked", Math.random() < 0.35); });
    render();
  });

  render();
  drawRecipes();
});
