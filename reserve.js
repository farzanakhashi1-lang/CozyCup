/* =========================================================
   reserve.js — seating plan + booking form
   Tables come from TABLES (data.js). Bookings are saved as JSON.
   ========================================================= */
$(function () {
  const $room = $("#room");
  const $tip = $("#waiterTip");
  let pickedTable = null;

  /* ---------- dates & times ---------- */
  function pad(n) { return String(n).padStart(2, "0"); }
  function isoDate(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  const todayIso = isoDate(new Date());
  $("#bDate").attr("min", todayIso).val(todayIso);

  /* time options: every 30 min, inside opening hours, and not in the past */
  function fillTimes() {
    const value = $("#bDate").val();
    const $time = $("#bTime");
    const old = $time.val();
    $time.empty();
    if (!value) return;
    const date = new Date(value + "T00:00");
    const hours = HOURS[date.getDay()];
    const now = new Date();
    for (let m = hours.open * 60; m <= hours.close * 60 - 60; m += 30) {
      if (value === todayIso && m <= now.getHours() * 60 + now.getMinutes() + 30) continue;
      const t = pad(Math.floor(m / 60)) + ":" + pad(m % 60);
      $time.append('<option value="' + t + '">' + t + "</option>");
    }
    if ($time.children().length === 0) {
      $time.append('<option value="">No times left today</option>');
    } else if (old && $time.find('option[value="' + old + '"]').length) {
      $time.val(old);
    }
  }

  /* ---------- which tables are taken? ---------- */
  /* other guests: a fixed "random" set for every date + time, so it looks real */
  function otherGuests(date, time) {
    const text = date + time;
    let hash = 0;
    for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 9973;
    return [TABLES[hash % TABLES.length].id, TABLES[(hash * 7 + 3) % TABLES.length].id];
  }
  function takenTables(date, time) {
    const mine = loadData(KEYS.bookings, [])
      .filter(function (b) { return b.date === date && b.time === time; })
      .map(function (b) { return b.table; });
    return otherGuests(date, time).concat(mine);
  }

  function zoneName(zone) {
    return { window: "by the window", salon: "in the salon", corner: "the big corner table" }[zone];
  }

  /* ---------- draw the plan ---------- */
  function drawTables() {
    const date = $("#bDate").val();
    const time = $("#bTime").val();
    const guests = Number($("#bGuests").val());
    const taken = takenTables(date, time);
    $room.find(".table-btn").remove();

    TABLES.forEach(function (t) {
      const isTaken = taken.indexOf(t.id) !== -1 || !time;
      const tooSmall = t.seats < guests;
      const free = !isTaken && !tooSmall;
      let label = "Table " + t.id + ", " + t.seats + " seats, " + zoneName(t.zone);
      label += isTaken ? " — already booked" : (tooSmall ? " — too small for your group" : " — free");
      const $btn = $('<button type="button" class="table-btn' + (t.wide ? " wide" : "") + '"></button>')
        .css({ left: t.x + "%", top: t.y + "%" })
        .attr({ "data-id": t.id, "aria-label": label, "aria-pressed": "false", "data-tip": label })
        .html("<b>" + t.id + "</b><span>" + t.seats + " pers.</span>")
        .prop("disabled", !free);
      if (free) $btn.attr("data-cursor", "Choisir");
      $room.append($btn);
    });

    /* keep the choice if it is still free */
    if (pickedTable) {
      const $still = $room.find('.table-btn[data-id="' + pickedTable + '"]');
      if ($still.prop("disabled")) {
        pickedTable = null;
      } else {
        $still.addClass("is-picked").attr("aria-pressed", "true");
      }
    }
    updatePicked();
  }

  function updatePicked() {
    if (!pickedTable) {
      $("#pickedTitle").text("No table chosen yet");
      $("#pickedSub").text("Choose a free table on the plan.");
      $("#bTable").val("");
      return;
    }
    const t = TABLES.find(function (x) { return x.id === pickedTable; });
    $("#pickedTitle").html("Table " + t.id + " · <em>" + zoneName(t.zone) + "</em>");
    const d = new Date($("#bDate").val() + "T00:00");
    $("#pickedSub").text(d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + " · " + $("#bTime").val() + " · " + $("#bGuests").val() + " guest(s)");
    $("#bTable").val(t.id);
    $("#tableField").removeClass("is-error").find(".field-msg").text("");
  }

  $room.on("click", ".table-btn", function () {
    pickedTable = String($(this).data("id"));
    $room.find(".table-btn").removeClass("is-picked").attr("aria-pressed", "false");
    $(this).addClass("is-picked").attr("aria-pressed", "true");
    updatePicked();
  });

  /* the little "waiter" note that follows the mouse over a table */
  $room.on("mousemove", ".table-btn", function (e) {
    const r = $room[0].getBoundingClientRect();
    $tip.text($(this).attr("data-tip")).css({ left: e.clientX - r.left, top: e.clientY - r.top, opacity: 1 });
  });
  $room.on("mouseleave", ".table-btn", function () { $tip.css("opacity", 0); });

  $("#bDate").on("change", function () { fillTimes(); drawTables(); });
  $("#bTime, #bGuests").on("change", drawTables);

  /* ---------- the form ---------- */
  $("#bookingForm").on("submit", function (e) {
    e.preventDefault();
    $("#bookingOk").hide();
    const okFields = checkFields([
      { el: "#bDate", test: function (v) { return v !== "" && v >= todayIso; }, msg: "Choose today or a later date." },
      { el: "#bTime", test: RULES.required, msg: "Choose a time (we are open " + HOURS[1].open + ":00 – " + HOURS[1].close + ":00)." },
      { el: "#bName", test: RULES.name, msg: "Write your name (2–40 letters)." },
      { el: "#bPhone", test: RULES.phone, msg: "Enter 11 digits, e.g. 8 701 234 56 78." }
    ]);
    let okTable = true;
    if (!pickedTable) {
      $("#tableField").addClass("is-error").find(".field-msg").text("Click a free table on the plan.");
      okTable = false;
    }
    if (!okFields || !okTable) return;

    const user = getCurrentUser();
    const booking = {
      id: Date.now(),
      email: user ? user.email : null,
      name: $("#bName").val().trim(),
      phone: $("#bPhone").val().trim(),
      date: $("#bDate").val(),
      time: $("#bTime").val(),
      guests: Number($("#bGuests").val()),
      table: pickedTable
    };
    const all = loadData(KEYS.bookings, []);
    all.push(booking);
    saveData(KEYS.bookings, all);

    showSuccess($("#bookingOk"), "Merci, " + escapeHtml(booking.name.split(" ")[0]) + "! Table " + booking.table + " is yours on " + booking.date.split("-").reverse().join(".") + " at " + booking.time + ".");
    clearState($("#bookingForm"));
    $("#bName, #bPhone").val("");
    pickedTable = null;
    drawTables();
    drawBookings();
  });

  /* ---------- my reservations ---------- */
  function myBookings() {
    const user = getCurrentUser();
    const email = user ? user.email : null;
    return loadData(KEYS.bookings, []).filter(function (b) { return b.email === email; })
      .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
  }

  function drawBookings() {
    const list = myBookings();
    $("#bookingCount").text(list.length ? "(" + list.length + ")" : "");
    $("#clearBookings").prop("hidden", list.length === 0);
    if (list.length === 0) {
      $("#bookingList").html('<li class="muted-empty">No reservations yet.</li>');
      return;
    }
    $("#bookingList").html(list.map(function (b) {
      return '<li><div><b>' + b.date.split("-").reverse().join(".") + " · " + b.time + "</b>" +
        "<span>Table " + b.table + " · " + b.guests + " guest(s) · " + escapeHtml(b.name) + "</span></div>" +
        '<button type="button" class="btn-cc-outline btn-small js-cancel" data-id="' + b.id + '">Cancel</button></li>';
    }).join(""));
  }

  $("#bookingList").on("click", ".js-cancel", function () {
    const id = Number($(this).data("id"));
    $(this).closest("li").slideUp(300, function () {
      saveData(KEYS.bookings, loadData(KEYS.bookings, []).filter(function (b) { return b.id !== id; }));
      drawBookings();
      drawTables();
    });
  });

  $("#clearBookings").on("click", function () {
    const mineIds = myBookings().map(function (b) { return b.id; });
    $("#bookingList li").slideUp(300).promise().done(function () {
      saveData(KEYS.bookings, loadData(KEYS.bookings, []).filter(function (b) { return mineIds.indexOf(b.id) === -1; }));
      drawBookings();
      drawTables();
    });
  });

  /* fill the name if the user is logged in */
  const user = getCurrentUser();
  if (user) $("#bName").val(user.name);

  fillTimes();
  if ($("#bTime").val() === "") {
    /* nothing left today: jump to tomorrow */
    const t = new Date();
    t.setDate(t.getDate() + 1);
    $("#bDate").val(isoDate(t));
    fillTimes();
  }
  drawTables();
  drawBookings();
});
