/* =========================================================
   data.js — all the café data lives here (arrays of objects).
   Other scripts read these arrays to build the pages.
   ========================================================= */

/* Menu: every dish and drink.
   notes = flavour notes (used by the Aroma Wheel)
   caffeine = mg per cup (0 for food) */
const MENU = [
  { id: "espresso",    name: "Espresso",          chapter: "cafes",    desc: "Short, dark and intense",          price: 800,  img: "cup.svg",       notes: ["chocolate", "nutty"],    caffeine: 75,  kcal: 5 },
  { id: "creme",       name: "Café crème",        chapter: "cafes",    desc: "Espresso with warm milk",           price: 1300, img: "cup.svg",       notes: ["creamy", "caramel"],     caffeine: 75,  kcal: 120 },
  { id: "aulait",      name: "Café au lait",      chapter: "cafes",    desc: "In a big bowl, like in Paris",      price: 1400, img: "bowl.svg",      notes: ["creamy", "nutty"],       caffeine: 90,  kcal: 150 },
  { id: "noisette",    name: "Noisette",          chapter: "cafes",    desc: "Espresso with a drop of milk",      price: 1000, img: "cup.svg",       notes: ["nutty", "caramel"],      caffeine: 75,  kcal: 25 },
  { id: "viennois",    name: "Café viennois",     chapter: "cafes",    desc: "Topped with whipped cream",         price: 1500, img: "cup.svg",       notes: ["creamy", "chocolate"],   caffeine: 75,  kcal: 210 },
  { id: "coldbrew",    name: "Cold brew orange",  chapter: "cafes",    desc: "18-hour brew, orange peel, ice",    price: 1500, img: "coldbrew.svg",  notes: ["citrus", "fruity"],      caffeine: 160, kcal: 10 },
  { id: "chocolat",    name: "Chocolat chaud",    chapter: "boissons", desc: "70 % cocoa, thick and slow",        price: 1500, img: "mug.svg",       notes: ["chocolate", "creamy"],   caffeine: 20,  kcal: 290 },
  { id: "earlgrey",    name: "Thé Earl Grey",     chapter: "boissons", desc: "Black tea with bergamot",           price: 900,  img: "teacup.svg",    notes: ["citrus", "floral"],      caffeine: 40,  kcal: 0 },
  { id: "matcha",      name: "Matcha au lait",    chapter: "boissons", desc: "Japanese matcha, oat milk",         price: 1600, img: "teacup.svg",    notes: ["floral", "creamy"],      caffeine: 70,  kcal: 140 },
  { id: "chai",        name: "Chai latte",        chapter: "boissons", desc: "Black tea, cardamom, cinnamon",     price: 1400, img: "mug.svg",       notes: ["spicy", "creamy"],       caffeine: 45,  kcal: 180 },
  { id: "croissant",   name: "Croissant",         chapter: "douceurs", desc: "French butter, 27 layers",          price: 900,  img: "croissant.svg", notes: [], caffeine: 0, kcal: 230 },
  { id: "painchoc",    name: "Pain au chocolat",  chapter: "douceurs", desc: "Two bars of dark chocolate",        price: 1000, img: "painchoc.svg",  notes: [], caffeine: 0, kcal: 280 },
  { id: "tarte",       name: "Tarte au citron",   chapter: "douceurs", desc: "Lemon cream and soft meringue",     price: 1400, img: "tart.svg",      notes: [], caffeine: 0, kcal: 320 },
  { id: "madeleines",  name: "Madeleines ×3",     chapter: "douceurs", desc: "Honey and orange, still warm",      price: 800,  img: "madeleine.svg", notes: [], caffeine: 0, kcal: 260 },
  { id: "macarons",    name: "Macarons ×4",       chapter: "douceurs", desc: "Pistachio, rose, coffee, lemon",    price: 1600, img: "macaron.svg",   notes: [], caffeine: 0, kcal: 300 },
  { id: "eclair",      name: "Éclair au café",    chapter: "douceurs", desc: "Choux pastry, coffee cream",        price: 1300, img: "eclair.svg",    notes: [], caffeine: 10, kcal: 260 },
  { id: "croque",      name: "Croque-monsieur",   chapter: "sale",     desc: "Ham, gruyère, béchamel",            price: 2200, img: "croque.svg",    notes: [], caffeine: 0, kcal: 520 },
  { id: "quiche",      name: "Quiche lorraine",   chapter: "sale",     desc: "With a small green salad",          price: 2100, img: "quiche.svg",    notes: [], caffeine: 0, kcal: 480 }
];

/* Chapters of the Menu Book (one spread = one chapter) */
const CHAPTERS = [
  { id: "cafes",    title: "Les Cafés",               en: "Coffee",           img: "cup.svg",       story: "Our beans are roasted every Monday in small batches. We pull every espresso by hand — slowly, the French way." },
  { id: "boissons", title: "Thés & Chocolats",        en: "Tea & chocolate",  img: "mug.svg",       story: "For the afternoon: a pot of tea, a thick hot chocolate, or a chai that smells like a winter market." },
  { id: "douceurs", title: "Les Douceurs",            en: "Pastries",         img: "croissant.svg", story: "Baked every morning at seven. When they are gone, they are gone — come early for the croissants." },
  { id: "sale",     title: "Le Salé",                 en: "Savoury",          img: "quiche.svg",    story: "A real lunch, not just a snack: warm, cheesy and served with a little salad." }
];

/* Flavour notes for the Aroma Wheel */
const NOTES = [
  { id: "chocolate", label: "Chocolate", color: "#6B4430" },
  { id: "nutty",     label: "Nutty",     color: "#9C6B3F" },
  { id: "caramel",   label: "Caramel",   color: "#C98B3E" },
  { id: "creamy",    label: "Creamy",    color: "#D9B98A" },
  { id: "floral",    label: "Floral",    color: "#C98A9B" },
  { id: "fruity",    label: "Fruity",    color: "#B9473E" },
  { id: "citrus",    label: "Citrus",    color: "#D8A43C" },
  { id: "spicy",     label: "Spicy",     color: "#8E3B2A" }
];

/* Atelier (build your own drink) options.
   price = extra cost, kcal / caffeine = what it adds, color = layer colour in the cup */
const ATELIER = {
  size:   [ { id: "petit", label: "Petit · 250 ml", price: 0,   factor: 0.8 },
            { id: "moyen", label: "Moyen · 350 ml", price: 300, factor: 1 },
            { id: "grand", label: "Grand · 450 ml", price: 550, factor: 1.25 } ],
  base:   [ { id: "espresso", label: "Espresso",   price: 900,  kcal: 5,  caffeine: 75, color: "#3B2216", word: "Noir" },
            { id: "double",   label: "Double espresso", price: 1150, kcal: 10, caffeine: 150, color: "#2A170E", word: "Fort" },
            { id: "matcha",   label: "Matcha",     price: 1200, kcal: 30, caffeine: 70, color: "#7FA05A", word: "Vert" },
            { id: "cacao",    label: "Cacao",      price: 1000, kcal: 120, caffeine: 15, color: "#5A3524", word: "Doux" } ],
  milk:   [ { id: "none",   label: "No milk",     price: 0,   kcal: 0,   color: null,      word: "" },
            { id: "whole",  label: "Whole milk",  price: 0,   kcal: 110, color: "#F3E8D6", word: "Velours" },
            { id: "oat",    label: "Oat milk",    price: 200, kcal: 90,  color: "#E8D6B4", word: "Avoine" },
            { id: "almond", label: "Almond milk", price: 200, kcal: 60,  color: "#EFE2CC", word: "Amande" } ],
  syrup:  [ { id: "none",     label: "No syrup",  price: 0,   kcal: 0,  color: null,      word: "" },
            { id: "vanille",  label: "Vanilla",   price: 150, kcal: 60, color: "#E9C77B", word: "Vanille" },
            { id: "caramel",  label: "Caramel",   price: 150, kcal: 70, color: "#C27B33", word: "Caramel" },
            { id: "lavande",  label: "Lavender",  price: 200, kcal: 50, color: "#B49AC9", word: "Lavande" } ],
  extras: [ { id: "creme",  label: "Whipped cream", price: 200, kcal: 100, color: "#FFFDF8" },
            { id: "shot",   label: "Extra shot",    price: 300, kcal: 5,   caffeine: 75 },
            { id: "cannelle", label: "Cinnamon",    price: 0,   kcal: 0 } ]
};

/* Tables on the seating plan (x / y are % of the room) */
const TABLES = [
  { id: "1", seats: 2, x: 8,  y: 14, zone: "window" },
  { id: "2", seats: 2, x: 27, y: 14, zone: "window" },
  { id: "3", seats: 2, x: 46, y: 14, zone: "window" },
  { id: "4", seats: 4, x: 10, y: 52, zone: "salon" },
  { id: "5", seats: 4, x: 33, y: 55, zone: "salon" },
  { id: "6", seats: 2, x: 56, y: 50, zone: "salon" },
  { id: "7", seats: 6, x: 70, y: 16, zone: "corner", wide: true },
  { id: "8", seats: 2, x: 8,  y: 76, zone: "salon" }
];

/* Opening hours: index 0 = Sunday … 6 = Saturday */
const HOURS = [
  { day: "Sunday",    open: 9, close: 20 },
  { day: "Monday",    open: 8, close: 21 },
  { day: "Tuesday",   open: 8, close: 21 },
  { day: "Wednesday", open: 8, close: 21 },
  { day: "Thursday",  open: 8, close: 21 },
  { day: "Friday",    open: 8, close: 21 },
  { day: "Saturday",  open: 9, close: 22 }
];

/* "Le Journal" — the special of the day changes with the weekday */
const SPECIALS = ["madeleines", "croissant", "tarte", "eclair", "painchoc", "macarons", "quiche"];
