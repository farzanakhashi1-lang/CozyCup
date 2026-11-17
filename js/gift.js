/* =========================================================
   gift.js — gift card designer
   Live preview, message counter, validation, wax seal.
   ========================================================= */
$(function () {
  const MAX = 120;
  let sealing = false;

  function amountValue() {
    const v = $('input[name="gAmount"]:checked').val();
    return v === "other" ? Number($("#gOther").val()) : Number(v);
  }

  /* live preview of the card */
  function preview() {
    const color = $('input[name="gColor"]:checked').val();
    const amount = amountValue();
    const msg = $("#gMsg").val().trim();
    const to = $("#gTo").val().trim();
    const from = $("#gFrom").val().trim();

    $("#giftCard").css("background-color", color);
    $("#gcAmount").text(amount > 0 ? formatPrice(amount) : "— ₸");
    $("#gcMsg").text(msg ? "“" + msg + "”" : "“Your message will appear here.”");
    $("#gcTo").text("For: " + (to || "—"));
    $("#gcFrom").text("From: " + (from || "—"));

    const len = $("#gMsg").val().length;
    $("#gCount").text(len + " / " + MAX).css("color", len > MAX ? "var(--error)" : "");
  }

  $('input[name="gAmount"]').on("change", function () {
    const other = $(this).val() === "other";
    $("#otherWrap").prop("hidden", !other);
    if (other) $("#gOther").trigger("focus");
    preview();
  });
  $("#giftForm").on("input change", "input, textarea", preview);

  $("#giftForm").on("submit", function (e) {
    e.preventDefault();
    if (sealing) return; // fast double clicks do nothing
    $("#giftOk").hide();

    const rules = [
      { el: "#gTo", test: RULES.name, msg: "Who is the card for? (2–40 letters)" },
      { el: "#gFrom", test: RULES.name, msg: "Write your name (2–40 letters)." },
      { el: "#gMsg", test: function (v) { return v.trim().length >= 5 && v.length <= MAX; }, msg: "Write a message of 5 to " + MAX + " characters." }
    ];
    if ($('input[name="gAmount"]:checked').val() === "other") {
      rules.unshift({ el: "#gOther", test: function (v) { const n = Number(v); return n >= 3000 && n <= 100000; }, msg: "Choose an amount between 3 000 and 100 000 ₸." });
    }
    if (!checkFields(rules)) return;

    /* the wax seal animation, then add to the order */
    sealing = true;
    $("#sealBtn").prop("disabled", true);
    $("#giftCard").addClass("is-sealed");
    setTimeout(function () { $("#seal").addClass("is-on"); }, 450);

    setTimeout(function () {
      const to = $("#gTo").val().trim();
      const amount = amountValue();
      addToCart({ id: "gift", key: "gift-" + Date.now(), name: "Gift card for " + to, price: amount, note: "“" + $("#gMsg").val().trim() + "”", img: "logo.svg" });
      showSuccess($("#giftOk"), "Sealed! The gift card for " + escapeHtml(to) + " is in your order.");
      clearState($("#giftForm"));
    }, 1100);

    /* open the envelope again for the next card */
    setTimeout(function () {
      $("#seal").removeClass("is-on");
      $("#giftCard").removeClass("is-sealed");
      $("#giftForm")[0].reset();
      $("#otherWrap").prop("hidden", true);
      preview();
      $("#sealBtn").prop("disabled", false);
      sealing = false;
    }, 3600);
  });

  preview();
});
