/* =========================================================
   about.js — hours table, FAQ (jQuery slideToggle), contact form
   ========================================================= */
$(function () {
  /* 1. opening hours table, built from HOURS. Today is highlighted. */
  const today = new Date().getDay();
  const order = [1, 2, 3, 4, 5, 6, 0]; // Monday first
  let rows = "";
  order.forEach(function (d) {
    const h = HOURS[d];
    const cls = d === today ? ' class="is-today"' : "";
    rows += "<tr" + cls + "><td>" + h.day + (d === today ? " · today" : "") + "</td>" +
      "<td>" + String(h.open).padStart(2, "0") + ":00 – " + h.close + ":00</td>" +
      "<td>" + String(h.open - 1).padStart(2, "0") + ":00</td></tr>";
  });
  $("#hoursTable tbody").html(rows);

  /* 2. FAQ accordion: only one answer open at a time */
  $(".faq-q").on("click", function () {
    const $q = $(this);
    const open = $q.attr("aria-expanded") === "true";
    $(".faq-q").not($q).attr("aria-expanded", "false").next(".faq-a").stop(true, true).slideUp(250);
    $q.attr("aria-expanded", String(!open)).next(".faq-a").stop(true, true).slideToggle(250);
  });

  /* 3. contact form */
  const MAX = 300;
  $("#mText").on("input", function () {
    const len = $(this).val().length;
    $("#mCount").text(len + " / " + MAX).css("color", len > MAX ? "var(--error)" : "");
  });

  const user = getCurrentUser();
  if (user) {
    $("#mName").val(user.name);
    $("#mEmail").val(user.email);
  }

  $("#contactForm").on("submit", function (e) {
    e.preventDefault();
    $("#contactOk").hide();
    const ok = checkFields([
      { el: "#mName", test: RULES.name, msg: "Write your name (2–40 letters)." },
      { el: "#mEmail", test: RULES.email, msg: "Email must look like name@mail.com." },
      { el: "#mTopic", test: RULES.required, msg: "Choose a topic." },
      { el: "#mText", test: function (v) { return v.trim().length >= 10 && v.length <= MAX; }, msg: "Write 10 to " + MAX + " characters." }
    ]);
    if (!ok) return;
    const name = $("#mName").val().trim().split(" ")[0];
    showSuccess($("#contactOk"), "Merci, " + escapeHtml(name) + "! We will answer within one day.");
    $("#mTopic, #mText").val("");
    $("#mCount").text("0 / " + MAX);
    clearState($("#contactForm"));
  });
});
