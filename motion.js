/* =========================================================
   motion.js — everything that reacts to the mouse.
   1. Custom cursor (dot + ring that follows with a soft delay)
   2. Magnetic buttons      [data-magnetic]
   3. 3D tilt + light glare  [data-tilt]
   4. Parallax layers        [data-parallax] > [data-depth]
   5. Spotlight backgrounds  [data-spotlight]
   6. Awning that waves under the mouse  .awning
   7. Letters that move away from the cursor  [data-letters]
   8. Steam that leans toward the mouse  .steam
   9. Sections that appear on scroll  .reveal
   Turned off on touch screens and for "reduce motion" users.
   ========================================================= */
(function () {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 9. reveal on scroll (works everywhere) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  if (!finePointer || reduceMotion) return; // no mouse effects on phones

  document.documentElement.classList.add("has-motion");

  /* mouse position, shared by all effects */
  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, moved: false };
  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.moved = true;
  }, { passive: true });

  /* ---------- 1. custom cursor ---------- */
  const dot = document.createElement("div");
  const ring = document.createElement("div");
  dot.className = "cursor-dot";
  ring.className = "cursor-ring";
  ring.innerHTML = "<span></span>";
  document.body.appendChild(ring);
  document.body.appendChild(dot);
  const ringPos = { x: mouse.x, y: mouse.y };

  document.addEventListener("mouseover", function (e) {
    const target = e.target.closest("a, button, [data-cursor], label, select, .table-btn, summary");
    ring.classList.toggle("is-hover", !!target);
    const label = target && target.getAttribute("data-cursor");
    ring.classList.toggle("has-label", !!label);
    ring.querySelector("span").textContent = label || "";
  });
  document.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
  document.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });
  document.addEventListener("mouseleave", function () { dot.style.opacity = 0; ring.style.opacity = 0; });
  document.addEventListener("mouseenter", function () { dot.style.opacity = 1; ring.style.opacity = 1; });

  /* ---------- 2. magnetic buttons ---------- */
  document.querySelectorAll("[data-magnetic]").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = "translate(" + dx * 0.25 + "px," + dy * 0.35 + "px)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  });

  /* ---------- 3. 3D tilt + glare ---------- */
  function addTilt(el) {
    if (el.dataset.tiltReady) return;
    el.dataset.tiltReady = "1";
    const max = parseFloat(el.getAttribute("data-tilt")) || 8;
    const glare = document.createElement("span");
    glare.className = "tilt-glare";
    el.appendChild(glare);
    el.addEventListener("mousemove", function (e) {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 … 1
      const py = (e.clientY - r.top) / r.height;
      el.style.transform = "perspective(900px) rotateX(" + (0.5 - py) * max + "deg) rotateY(" + (px - 0.5) * max + "deg) translateY(-4px)";
      glare.style.background = "radial-gradient(circle at " + px * 100 + "% " + py * 100 + "%, rgba(255,255,255,.35), transparent 55%)";
      glare.style.opacity = 1;
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "";
      glare.style.opacity = 0;
    });
  }
  document.querySelectorAll("[data-tilt]").forEach(addTilt);
  /* cards made later by JavaScript can call this too */
  window.ccAddTilt = function (root) {
    (root || document).querySelectorAll("[data-tilt]").forEach(addTilt);
  };

  /* ---------- 5. spotlight ---------- */
  document.querySelectorAll("[data-spotlight]").forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- 7. letters move away from the cursor ---------- */
  const letters = [];
  document.querySelectorAll("[data-letters]").forEach(function (title) {
    /* wrap every letter in a span, but keep words and <em> together */
    function splitNode(node) {
      Array.from(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (word) {
            if (/^\s+$/.test(word) || word === "") { frag.appendChild(document.createTextNode(word)); return; }
            const w = document.createElement("span");
            w.className = "word";
            word.split("").forEach(function (ch) {
              const s = document.createElement("span");
              s.className = "char";
              s.textContent = ch;
              w.appendChild(s);
              letters.push({ el: s, x: 0, y: 0, cx: 0, cy: 0 });
            });
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          splitNode(child);
        }
      });
    }
    title.setAttribute("aria-label", title.textContent.replace(/\s+/g, " ").trim());
    splitNode(title);
    title.querySelectorAll(".word").forEach(function (w) { w.setAttribute("aria-hidden", "true"); });
  });
  function measureLetters() {
    letters.forEach(function (l) {
      const r = l.el.getBoundingClientRect();
      l.cx = r.left + r.width / 2 - l.x;
      l.cy = r.top + r.height / 2 - l.y;
    });
  }

  /* ---------- 4. parallax, 6. awning, 8. steam, 1. cursor — one animation loop ---------- */
  const parallaxBoxes = document.querySelectorAll("[data-parallax]");
  const scallops = document.querySelectorAll(".awning span");
  const steams = document.querySelectorAll(".steam");
  const lerp = function (a, b, t) { return a + (b - a) * t; };
  const scallopState = Array.from(scallops).map(function () { return 0; });

  function frame() {
    /* cursor */
    dot.style.transform = "translate(" + mouse.x + "px," + mouse.y + "px)";
    ringPos.x = lerp(ringPos.x, mouse.x, 0.18);
    ringPos.y = lerp(ringPos.y, mouse.y, 0.18);
    ring.style.transform = "translate(" + ringPos.x + "px," + ringPos.y + "px)";

    /* parallax layers */
    parallaxBoxes.forEach(function (box) {
      const r = box.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const nx = (mouse.x - (r.left + r.width / 2)) / r.width;   // about -0.5 … 0.5
      const ny = (mouse.y - (r.top + r.height / 2)) / r.height;
      box.querySelectorAll("[data-depth]").forEach(function (layer) {
        const d = parseFloat(layer.getAttribute("data-depth"));
        const cur = layer._p || { x: 0, y: 0, rx: 0, ry: 0 };
        cur.x = lerp(cur.x, nx * d * 60, 0.08);
        cur.y = lerp(cur.y, ny * d * 60, 0.08);
        cur.rx = lerp(cur.rx, -ny * d * 14, 0.08);
        cur.ry = lerp(cur.ry, nx * d * 14, 0.08);
        layer._p = cur;
        const rot = layer.hasAttribute("data-rotate") ? " rotateX(" + cur.rx + "deg) rotateY(" + cur.ry + "deg)" : "";
        layer.style.transform = "translate3d(" + cur.x + "px," + cur.y + "px,0)" + rot;
      });
    });

    /* awning: scallops near the cursor drop and swing a little */
    scallops.forEach(function (s, i) {
      const r = s.getBoundingClientRect();
      const dist = Math.abs(mouse.x - (r.left + r.width / 2));
      const near = mouse.y < r.bottom + 160 ? Math.max(0, 1 - dist / 160) : 0;
      scallopState[i] = lerp(scallopState[i], near, 0.12);
      const swing = Math.sin(Date.now() / 260 + i) * 3 * scallopState[i];
      s.style.transform = "scaleY(" + (1 + scallopState[i] * 0.35) + ") rotate(" + swing + "deg)";
    });

    /* steam leans toward the mouse */
    steams.forEach(function (st) {
      const r = st.getBoundingClientRect();
      const lean = Math.max(-1, Math.min(1, (mouse.x - (r.left + r.width / 2)) / 400));
      st._lean = lerp(st._lean || 0, lean, 0.05);
      st.style.transform = "skewX(" + (st._lean * -22).toFixed(2) + "deg)";
    });

    /* letters */
    letters.forEach(function (l) {
      const dx = l.cx - mouse.x;
      const dy = l.cy - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 1 - dist / 140);
      const tx = dist ? (dx / dist) * force * 16 : 0;
      const ty = dist ? (dy / dist) * force * 16 : 0;
      l.x = lerp(l.x, tx, 0.15);
      l.y = lerp(l.y, ty, 0.15);
      l.el.style.transform = "translate(" + l.x.toFixed(2) + "px," + l.y.toFixed(2) + "px) rotate(" + (l.x * 0.6).toFixed(2) + "deg)";
    });

    requestAnimationFrame(frame);
  }

  window.addEventListener("load", measureLetters);
  window.addEventListener("resize", measureLetters);
  window.addEventListener("scroll", measureLetters, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureLetters);
  measureLetters();
  requestAnimationFrame(frame);
})();
