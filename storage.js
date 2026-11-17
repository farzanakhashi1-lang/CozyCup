/* =========================================================
   storage.js — safe helpers for localStorage.
   Everything is saved as JSON. If storage is empty or broken,
   we return a default value, so pages never crash.
   ========================================================= */

const KEYS = {
  theme: "cc_theme",       // "light" | "dark"
  users: "cc_users",       // [ {name, email, password, joined} ]
  session: "cc_session",   // email of the logged-in user, or null
  cart: "cc_cart",         // [ {key, id, name, price, qty, note} ]
  favs: "cc_favs",         // [ "croissant", "matcha", ... ]
  recipes: "cc_recipes",   // [ {name, parts, price, kcal, caffeine} ]
  bookings: "cc_bookings", // [ {id, email, date, time, guests, table, name} ]
  orders: "cc_orders"      // [ {id, email, items, total, date} ]
};

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value = JSON.parse(raw);
    return value === null ? fallback : value;
  } catch (error) {
    return fallback; // broken JSON or storage blocked
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Could not save", key);
  }
}

function removeData(key) {
  try { localStorage.removeItem(key); } catch (error) { /* ignore */ }
}
