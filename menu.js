/* =========================================================
   menu.js — La Carte page
   1. The Menu Book (one chapter = one spread, 3D page turn)
   2. Search (shows result cards, or an empty state)
   3. The Aroma Wheel (find your coffee by flavour)
   ========================================================= */
$(function () {
  /* ------------------------------------------------------
     helpers that build HTML
     ------------------------------------------------------ */
  function itemsOf(chapterId) {
    return MENU.filter(function (item) { return item.chapter === chapterId; });
  }

  function itemLine(item) {
    const on = isFav(item.id);
    return '<div class="item-line">' +
      '<span class="name">' + item.name + "<small>" + item.desc + "</small></span>" +
      '<span class="leader" aria-hidden="true"></span>' +
      '<span class="price">' + formatPrice(item.price) + "</span>" +
      '<button type="button" class="mini-btn js-fav' + (on ? " is-on" : "") + '" data-id="' + item.id + '" aria-pressed="' + on + '" aria-label="Save ' + item.name + ' to favourites">♡</button>' +
      '<button type="button" class="mini-btn js-add" data-id="' + item.id + '" aria-label="Add ' + item.name + ' to order" data-cursor="+">+</button>' +
      "</div>";
  }

  function leftPageHtml(index) {
    const ch = CHAPTERS[index];
    return '<span class="chap">Chapitre ' + (index + 1) + "</span>" +
      "<h2>" + ch.title + "</h2>" +
      '<p class="en">' + ch.en + "</p>" +
      '<img class="chapter-art" src="images/' + ch.img + '" alt="Drawing for ' + ch.en + '">' +
      '<p class="story">' + ch.story + "</p>" +
      '<span class="folio">— ' + (index * 2 + 1) + " —</span>";
  }

  function rightPageHtml(index) {
    const ch = CHAPTERS[index];
    let html = '<span class="chap">' + ch.en + "</span>" + "<h3 class=\"text-center fst-italic mb-3\">" + ch.title + "</h3>";
    itemsOf(ch.id).forEach(function (item) { html += itemLine(item); });
    html += '<span class="folio">— ' + (index * 2 + 2) + " —</span>";
    if (index < CHAPTERS.length - 1) {
      html += '<button type="button" class="page-corner" aria-label="Turn the page" data-cursor="Tourner"></button>';
    }
    return html;
  }

  /* ------------------------------------------------------
     1. Menu Book
     ------------------------------------------------------ */
  let current = 0;
  let flipping = false;
  const $book = $("#book");
  const $left = $("#pageLeft");
  const $right = $("#pageRight");

  /* chapter buttons */
  CHAPTERS.forEach(function (ch, i) {
    $("#chapterTabs").append('<button type="button" data-index="' + i + '">' + ch.title + "</button>");
  });

  function updateControls() {
    $("#chapterTabs button").attr("aria-current", "false").eq(current).attr("aria-current", "true");
    $("#prevPage").prop("disabled", current === 0);
    $("#nextPage").prop("disabled", current === CHAPTERS.length - 1);
  }

  function showSpread(index) {
    $left.html(leftPageHtml(index));
    $right.html(rightPageHtml(index));
    current = index;
    updateControls();
  }

  /* turn to another chapter with a 3D leaf */
  function goTo(index) {
    if (flipping || index === current || index < 0 || index >= CHAPTERS.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallScreen = window.innerWidth < 992;
    if (reduce || smallScreen) {
      /* simple jQuery fade on phones */
      flipping = true;
      $book.stop(true, true).fadeTo(150, 0, function () {
        showSpread(index);
        $book.fadeTo(200, 1, function () { flipping = false; });
      });
      return;
    }

    flipping = true;
    const forward = index > current;
    const $leaf = $('<div class="leaf ' + (forward ? "forward" : "backward") + '" aria-hidden="true">' +
      '<div class="face page front"></div><div class="face page back"></div></div>');

    if (forward) {
      $leaf.find(".front").addClass("page-right").html($right.html());
      $leaf.find(".back").addClass("page-left").html(leftPageHtml(index));
      $right.html(rightPageHtml(index));            // new right page is under the leaf
    } else {
      $leaf.find(".front").addClass("page-left").html($left.html());
      $leaf.find(".back").addClass("page-right").html(rightPageHtml(index));
      $left.html(leftPageHtml(index));              // new left page is under the leaf
    }
    $leaf.find("button").attr("tabindex", "-1");
    $book.append($leaf);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { $leaf.addClass("turn"); });
    });

    setTimeout(function () {
      showSpread(index);
      $leaf.remove();
      flipping = false;
    }, 920);
  }

  $("#nextPage").on("click", function () { goTo(current + 1); });
  $("#prevPage").on("click", function () { goTo(current - 1); });
  $("#chapterTabs").on("click", "button", function () { goTo(Number($(this).data("index"))); });
  $book.on("click", ".page-corner", function () { goTo(current + 1); });

  /* keyboard: ← and → turn the pages (not while typing) */
  $(document).on("keydown", function (e) {
    if ($(e.target).is("input, textarea, select") || $("#bookView").is(":hidden")) return;
    if (e.key === "ArrowRight") goTo(current + 1);
    if (e.key === "ArrowLeft") goTo(current - 1);
  });

  /* drag (mouse or finger): pull the page to the left or right */
  let dragStart = null;
  $book.on("pointerdown", function (e) {
    if ($(e.target).closest("button").length) return;
    dragStart = e.clientX;
  });
  $(window).on("pointerup", function (e) {
    if (dragStart === null) return;
    const dx = e.clientX - dragStart;
    dragStart = null;
    if (dx < -70) goTo(current + 1);
    if (dx > 70) goTo(current - 1);
  });

  /* add / favourite buttons (book and search results) */
  $(document).on("click", ".js-add", function () {
    addToCart(findItem($(this).data("id")));
  });
  $(document).on("click", ".js-fav", function () {
    const id = $(this).data("id");
    const on = toggleFav(id);
    $('.js-fav[data-id="' + id + '"]').toggleClass("is-on", on).attr("aria-pressed", on);
  });

  /* ------------------------------------------------------
     2. Search
     ------------------------------------------------------ */
  function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  }

  function dishCard(item) {
    const on = isFav(item.id);
    return '<article class="dish-card" data-tilt="8">' +
      '<button type="button" class="icon-btn fav-btn js-fav' + (on ? " is-on" : "") + '" data-id="' + item.id + '" aria-pressed="' + on + '" aria-label="Save ' + item.name + ' to favourites">♡</button>' +
      '<img src="images/' + item.img + '" alt="' + item.name + '" width="110" height="110">' +
      "<h3>" + item.name + "</h3><p class=\"mb-0\">" + item.desc + "</p>" +
      '<div class="row-end"><span class="price">' + formatPrice(item.price) + "</span>" +
      '<button type="button" class="btn-cc btn-small js-add" data-id="' + item.id + '">Add</button></div></article>';
  }

  function runSearch() {
    const raw = $("#menuSearch").val();
    const q = normalize(raw);
    $("#clearSearch").prop("hidden", q === "");

    if (q === "") {
      $("#resultsView").prop("hidden", true);
      $("#bookView").prop("hidden", false).hide().fadeIn(250);
      return;
    }
    if (q.length < 2) {
      $("#resultsView").prop("hidden", false);
      $("#bookView").prop("hidden", true);
      $("#resultsInfo").text("Type at least 2 letters.");
      $("#resultsGrid").empty();
      return;
    }

    const found = MENU.filter(function (item) {
      const chapter = CHAPTERS.find(function (c) { return c.id === item.chapter; });
      const text = normalize(item.name + " " + item.desc + " " + item.notes.join(" ") + " " + chapter.title + " " + chapter.en);
      return text.indexOf(q) !== -1;
    });

    $("#bookView").prop("hidden", true);
    $("#resultsView").prop("hidden", false);

    if (found.length === 0) {
      $("#resultsInfo").text("");
      $("#resultsGrid").html('<div class="empty-state" style="grid-column:1/-1">' +
        '<img src="images/teacup.svg" alt="" width="120" height="120">' +
        "<h3>Nothing for “" + escapeHtml(raw.trim()) + "”</h3>" +
        "<p>Try another word — or one of these:</p>" +
        '<div class="d-flex gap-2 justify-content-center flex-wrap">' +
        '<button type="button" class="chip js-suggest">croissant</button><button type="button" class="chip js-suggest">chocolate</button><button type="button" class="chip js-suggest">tea</button></div></div>');
      return;
    }
    $("#resultsInfo").text(found.length + (found.length === 1 ? " dish found" : " dishes found"));
    $("#resultsGrid").html(found.map(dishCard).join(""));
    $("#resultsGrid .dish-card").hide().each(function (i) { $(this).delay(i * 60).fadeIn(250); });
    if (window.ccAddTilt) window.ccAddTilt(document.getElementById("resultsGrid"));
  }

  let timer = null;
  $("#menuSearch").on("input", function () {
    clearTimeout(timer);
    timer = setTimeout(runSearch, 200);
  });
  $("#searchForm").on("submit", function (e) { e.preventDefault(); runSearch(); });
  $("#clearSearch").on("click", function () { $("#menuSearch").val("").trigger("focus"); runSearch(); });
  $(document).on("click", ".js-suggest", function () { $("#menuSearch").val($(this).text()); runSearch(); });

  /* ------------------------------------------------------
     3. Aroma Wheel
     ------------------------------------------------------ */
  let picked = [];
  const C = 200, R1 = 70, R2 = 185;

  function polar(r, angle) {
    return [C + r * Math.cos(angle), C + r * Math.sin(angle)];
  }

  function buildWheel() {
    const step = (Math.PI * 2) / NOTES.length;
    let svg = '<svg class="wheel-svg" viewBox="0 0 400 400" role="group" aria-label="Flavour wheel">';
    NOTES.forEach(function (note, i) {
      const a0 = i * step - Math.PI / 2;
      const a1 = a0 + step;
      const p1 = polar(R1, a0), p2 = polar(R2, a0), p3 = polar(R2, a1), p4 = polar(R1, a1);
      const d = "M" + p1 + " L" + p2 + " A" + R2 + " " + R2 + " 0 0 1 " + p3 + " L" + p4 + " A" + R1 + " " + R1 + " 0 0 0 " + p1 + "Z";
      const mid = a0 + step / 2;
      const t = polar((R1 + R2) / 2, mid);
      let deg = mid * 180 / Math.PI + 90;
      if (deg > 90 && deg < 270) deg += 180;
      svg += '<g class="wheel-seg" data-note="' + note.id + '" tabindex="0" role="button" aria-pressed="false" aria-label="' + note.label + '" data-cursor="Goûter">' +
        '<path d="' + d.replace(/,/g, " ") + '" fill="' + note.color + '"></path>' +
        '<text x="' + t[0].toFixed(1) + '" y="' + t[1].toFixed(1) + '" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + deg.toFixed(1) + " " + t[0].toFixed(1) + " " + t[1].toFixed(1) + ')">' + note.label + "</text></g>";
    });
    svg += '<circle class="wheel-center" cx="200" cy="200" r="64"></circle>';
    svg += '<text class="wheel-center-text" id="wheelCount" x="200" y="205" text-anchor="middle">choose</text></svg>';
    $("#wheelBox").html(svg);
  }

  function toggleNote(id) {
    if (picked.indexOf(id) !== -1) {
      picked = picked.filter(function (n) { return n !== id; });
    } else {
      if (picked.length === 3) picked.shift(); // keep only the last three
      picked.push(id);
    }
    drawPicked();
    showMatch();
  }

  function drawPicked() {
    $(".wheel-seg").each(function () {
      const on = picked.indexOf($(this).data("note")) !== -1;
      $(this).toggleClass("is-on", on).toggleClass("is-off", picked.length > 0 && !on).attr("aria-pressed", on);
    });
    $("#wheelCount").text(picked.length ? picked.length + " / 3 chosen" : "choose");
    const chips = picked.map(function (id) {
      const n = NOTES.find(function (x) { return x.id === id; });
      return '<button type="button" class="chip js-unpick" data-note="' + id + '">' + n.label + " ×</button>";
    }).join("");
    $("#pickedNotes").html(chips + (picked.length ? '<button type="button" class="btn-link-cc js-clear-notes">Clear</button>' : ""));
  }

  /* score = how many of your notes the drink has */
  function scoreDrinks() {
    return MENU.filter(function (item) { return item.notes.length > 0; })
      .map(function (item) {
        const hits = picked.filter(function (n) { return item.notes.indexOf(n) !== -1; }).length;
        const pct = Math.round((hits / picked.length) * 80 + (hits / item.notes.length) * 20);
        return { item: item, pct: pct };
      })
      .sort(function (a, b) { return b.pct - a.pct || a.item.price - b.item.price; });
  }

  function showMatch() {
    const $box = $("#matchResult");
    if (picked.length === 0) {
      $box.html('<div class="empty-state"><h3>Your perfect cup is waiting</h3><p class="mb-0">Choose one, two or three flavours on the wheel.</p></div>');
      return;
    }
    const list = scoreDrinks();
    const best = list[0];
    if (best.pct === 0) {
      $box.html('<div class="empty-state"><h3>No drink has these flavours… yet</h3><p class="mb-0">Try another note — or create it yourself in <a href="atelier.html">L’Atelier</a>.</p></div>');
      return;
    }
    const caffeine = Math.min(100, Math.round(best.item.caffeine / 1.6));
    const others = list.slice(1, 4).filter(function (x) { return x.pct > 0; });
    let html = '<article class="match-card" data-tilt="6">' +
      '<img src="images/' + best.item.img + '" alt="' + best.item.name + '" width="120" height="120">' +
      '<div class="flex-grow-1"><span class="eyebrow">Your best match</span>' +
      '<div class="d-flex align-items-baseline gap-3"><h3 class="mb-0">' + best.item.name + '</h3><span class="pct">' + best.pct + " %</span></div>" +
      '<p class="mb-2">' + best.item.desc + "</p>" +
      '<small>Caffeine · ' + best.item.caffeine + ' mg</small><div class="meter"><i style="width:' + caffeine + '%"></i></div>' +
      '<button type="button" class="btn-cc btn-small js-add" data-id="' + best.item.id + '">Add · ' + formatPrice(best.item.price) + "</button></div></article>";
    if (others.length) {
      html += '<ul class="also-list">' + others.map(function (o) {
        return "<li><span>" + o.item.name + "</span><b>" + o.pct + " %</b></li>";
      }).join("") + "</ul>";
    }
    $box.stop(true, true).hide().html(html).fadeIn(300);
    if (window.ccAddTilt) window.ccAddTilt($box[0]);
  }

  $("#wheelBox").on("click", ".wheel-seg", function () { toggleNote($(this).data("note")); });
  $("#wheelBox").on("keydown", ".wheel-seg", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleNote($(this).data("note")); }
  });
  $("#pickedNotes").on("click", ".js-unpick", function () { toggleNote($(this).data("note")); });
  $("#pickedNotes").on("click", ".js-clear-notes", function () { picked = []; drawPicked(); showMatch(); });

  /* start */
  showSpread(0);
  buildWheel();
  drawPicked();
  showMatch();
});
