/* =========================================================
   validate.js — shared form rules.
   Errors are shown UNDER the field (never in alert()).
   ========================================================= */

const RULES = {
  required: function (v) { return v.trim() !== ""; },
  name: function (v) { return /^[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі' -]{2,40}$/.test(v.trim()); },
  email: function (v) { return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()); },
  phone: function (v) { return v.replace(/\D/g, "").length === 11; },
  password: function (v) { return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v); }
};

/* show an error message under one field */
function setError($field, message) {
  const $wrap = $field.closest(".field");
  $wrap.removeClass("is-ok").addClass("is-error");
  $field.attr("aria-invalid", "true");
  $wrap.find(".field-msg").text(message);
}

/* mark a field as correct */
function setOk($field, message) {
  const $wrap = $field.closest(".field");
  $wrap.removeClass("is-error").addClass("is-ok");
  $field.attr("aria-invalid", "false");
  $wrap.find(".field-msg").text(message || "");
}

function clearState($form) {
  $form.find(".field").removeClass("is-error is-ok");
  $form.find(".field-msg").text("");
  $form.find("[aria-invalid]").removeAttr("aria-invalid");
}

/* check a list of fields: [{ el: "#id", test: fn, msg: "..." }]
   returns true if everything is OK, and focuses the first wrong field */
function checkFields(list) {
  let firstBad = null;
  list.forEach(function (rule) {
    const $el = $(rule.el);
    const value = $el.is(":checkbox") ? ($el.is(":checked") ? "yes" : "") : String($el.val() || "");
    if (rule.test(value)) {
      setOk($el, rule.ok);
    } else {
      setError($el, rule.msg);
      if (!firstBad) firstBad = $el;
    }
  });
  if (firstBad) firstBad.trigger("focus");
  return firstBad === null;
}

/* show the green success box of a form (jQuery slideDown) */
function showSuccess($box, text) {
  $box.stop(true, true).hide().html('<span aria-hidden="true">✓</span> ' + text).slideDown(250);
}

/* live check: clear the red error as soon as the user fixes the field */
$(document).on("input change", ".field.is-error input, .field.is-error textarea, .field.is-error select", function () {
  $(this).closest(".field").removeClass("is-error");
  $(this).closest(".field").find(".field-msg").text("");
  $(this).removeAttr("aria-invalid");
});

