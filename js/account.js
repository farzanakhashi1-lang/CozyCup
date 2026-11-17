/* =========================================================
   account.js — Log in and Sign up (demo, localStorage)
   ========================================================= */
$(function () {
  /* already logged in? go to the profile */
  if (getCurrentUser()) {
    window.location.replace("profile.html");
    return;
  }

  /* favourite drink list for the sign-up form */
  MENU.filter(function (i) { return i.caffeine > 0 || i.notes.length; }).forEach(function (item) {
    $("#sFav").append('<option value="' + item.id + '">' + item.name + "</option>");
  });

  /* ---------- tabs ---------- */
  function showTab(name) {
    const login = name === "login";
    $("#tabLogin").attr("aria-pressed", login);
    $("#tabSignup").attr("aria-pressed", !login);
    const $show = login ? $("#loginForm") : $("#signupForm");
    const $hide = login ? $("#signupForm") : $("#loginForm");
    $hide.prop("hidden", true);
    $show.prop("hidden", false).hide().fadeIn(250);
    $show.find("input").first().trigger("focus");
  }
  $("#tabLogin").on("click", function () { showTab("login"); });
  $("#tabSignup, #goSignup").on("click", function () { showTab("signup"); });
  if (new URLSearchParams(window.location.search).get("tab") === "signup") showTab("signup");

  /* ---------- log in ---------- */
  $("#lShow").on("change", function () {
    $("#lPass").attr("type", this.checked ? "text" : "password");
  });

  $("#loginForm").on("submit", function (e) {
    e.preventDefault();
    $("#loginError").hide();
    const ok = checkFields([
      { el: "#lEmail", test: RULES.email, msg: "Enter your email, like name@mail.com." },
      { el: "#lPass", test: RULES.required, msg: "Enter your password." }
    ]);
    if (!ok) return;

    const email = $("#lEmail").val().trim().toLowerCase();
    const user = getUsers().find(function (u) { return u.email === email; });
    if (!user) {
      setError($("#lEmail"), "There is no account with this email. Sign up first?");
      $("#lEmail").trigger("focus");
      return;
    }
    if (user.password !== $("#lPass").val()) {
      setError($("#lPass"), "Wrong password. Try again.");
      $("#lPass").val("").trigger("focus");
      return;
    }
    saveData(KEYS.session, user.email);
    showSuccess($("#loginError").removeClass("form-error-box").addClass("success-box"), "Welcome back, " + escapeHtml(user.name.split(" ")[0]) + "! Opening your profile…");
    setTimeout(function () { window.location.href = "profile.html"; }, 700);
  });

  /* ---------- password strength meter ---------- */
  $("#sPass").on("input", function () {
    const v = $(this).val();
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Za-z]/.test(v) && /\d/.test(v)) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++;
    const colors = ["#B3261E", "#D9822B", "#C8A96A", "#2E7D4F"];
    $(".pw-meter i").each(function (i) {
      $(this).css("background-color", i < score ? colors[score - 1] : "");
    });
  });

  /* ---------- sign up ---------- */
  $("#signupForm").on("submit", function (e) {
    e.preventDefault();
    const ok = checkFields([
      { el: "#sName", test: RULES.name, msg: "Write your full name (2–40 letters).", ok: "Enchanté!" },
      { el: "#sEmail", test: RULES.email, msg: "Email must look like name@mail.com." },
      { el: "#sPass", test: RULES.password, msg: "At least 8 characters, with a letter and a number." },
      { el: "#sPass2", test: function (v) { return v !== "" && v === $("#sPass").val(); }, msg: "The passwords do not match." },
      { el: "#sFav", test: RULES.required, msg: "Choose your favourite drink." },
      { el: "#sTerms", test: RULES.required, msg: "Please tick this box." }
    ]);
    if (!ok) return;

    const email = $("#sEmail").val().trim().toLowerCase();
    const users = getUsers();
    if (users.some(function (u) { return u.email === email; })) {
      setError($("#sEmail"), "This email already has an account. Log in instead.");
      $("#sEmail").trigger("focus");
      return;
    }
    const user = {
      name: $("#sName").val().trim().replace(/\s+/g, " "),
      email: email,
      password: $("#sPass").val(), // demo only — a real site never stores passwords like this
      fav: $("#sFav").val(),
      joined: new Date().toISOString(),
      number: String(Math.floor(1000 + Math.random() * 9000))
    };
    users.push(user);
    saveData(KEYS.users, users);
    saveData(KEYS.session, user.email);
    $("#signupForm button[type=submit]").prop("disabled", true);
    showSuccess($("#signupOk"), "Bienvenue, " + escapeHtml(user.name.split(" ")[0]) + "! Your account is created. Opening your profile…");
    setTimeout(function () { window.location.href = "profile.html"; }, 1200);
  });
});
