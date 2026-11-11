(function () {
  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
    });
  }

  // Day band: Austin (CT) on the axis, India working hours mapped onto it
  function minutesIn(tz, d) {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(d);
    var h = 0, m = 0;
    parts.forEach(function (p) { if (p.type === "hour") h = +p.value; if (p.type === "minute") m = +p.value; });
    return h * 60 + m;
  }
  function label(tz, d) {
    return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit" }).format(d);
  }
  var band = document.querySelector("[data-band]");
  if (band) {
    var US = "America/Chicago", IN = "Asia/Kolkata";
    var place = function (el, startMin, endMin) {
      el.style.left = (startMin / 1440) * 100 + "%";
      el.style.width = ((endMin - startMin) / 1440) * 100 + "%";
    };
    var draw = function () {
      var now = new Date();
      var us = minutesIn(US, now), ind = minutesIn(IN, now);
      var diff = ((ind - us) % 1440 + 1440) % 1440; // India ahead of CT, in minutes
      // Your team: 9:00–18:00 CT
      place(band.querySelector("[data-us]"), 9 * 60, 18 * 60);
      // Lumvik: 10:00–19:00 IST, shown in CT (may wrap past midnight)
      var s = ((10 * 60 - diff) % 1440 + 1440) % 1440, e = s + 9 * 60;
      var a = band.querySelector("[data-in-a]"), b = band.querySelector("[data-in-b]");
      if (e <= 1440) { place(a, s, e); b.hidden = true; }
      else { place(a, s, 1440); place(b, 0, e - 1440); b.hidden = false; }
      var longA = b.hidden || (1440 - s) >= (e - 1440);
      a.textContent = longA ? "We build" : ""; b.textContent = longA ? "" : "We build";
      Array.prototype.forEach.call(band.querySelectorAll("[data-now]"),function (n) { n.style.left = (us / 1440) * 100 + "%"; });
      band.querySelector("[data-clock-us]").textContent = label(US, now);
      band.querySelector("[data-clock-in]").textContent = label(IN, now);
    };
    draw();
    setInterval(draw, 60000);
  }

  // Copy email
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy"), msg = btn.parentElement.querySelector("[data-copied]");
      var done = function () { if (msg) { msg.hidden = false; setTimeout(function () { msg.hidden = true; }, 1800); } };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });


  // Preselect project type from ?type= (links from the homepage finder)
  var typeSel = document.getElementById("type");
  if (typeSel && window.URLSearchParams) {
    var t = new URLSearchParams(window.location.search).get("type");
    if (t) Array.prototype.forEach.call(typeSel.options, function (o) { if (o.text === t) typeSel.value = o.value; });
  }


  // Cost estimator
  var est = document.getElementById("estimator");
  if (est) {
    var count = 5;
    var out = document.getElementById("count");
    var money = function (n) { return "$" + Math.round(n).toLocaleString("en-US"); };
    var val = function (name) { var el = est.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; };
    var calc = function () {
      var type = val("ptype"), lines = [], total = 0;
      var unit = type === "landing" ? "sections" : "pages";
      document.getElementById("count-label").textContent = type === "landing" ? "How many sections?" : "How many pages?";
      var max = type === "landing" ? 16 : 20; if (count > max) count = max; out.textContent = count;
      if (type === "landing") { total = 249; lines.push(["Landing page, up to 8 sections", 249]); if (count > 8) { total += (count - 8) * 30; lines.push([(count - 8) + " extra sections", (count - 8) * 30]); } }
      if (type === "website") { total = 599; lines.push(["Business website, up to 5 pages", 599]); if (count > 5) { total += (count - 5) * 90; lines.push([(count - 5) + " extra pages", (count - 5) * 90]); } }
      if (type === "redesign") { total = 499 + count * 60; lines.push(["Redesign set-up", 499]); lines.push([count + " pages rebuilt", count * 60]); }
      var forms = +val("forms"); if (forms) { total += forms * 50; lines.push([forms + " form or integration" + (forms > 1 ? "s" : ""), forms * 50]); }
      if (val("blog") === "yes") { total += 200; lines.push(["Blog or editable content area", 200]); }
      var langs = +val("langs"); if (langs) { total += langs * 120; lines.push([langs + " extra language" + (langs > 1 ? "s" : ""), langs * 120]); }
      if (val("rush") === "yes") { var r = total * 0.25; total += r; lines.push(["Rush delivery (+25%)", r]); }
      var high = Math.ceil(total * 1.2 / 10) * 10;
      document.getElementById("range").textContent = money(total) + " to " + money(high);
      document.getElementById("lines").innerHTML = lines.map(function (l) { return "<li><span>" + l[0] + "</span><span>" + money(l[1]) + "</span></li>"; }).join("");
      var design = val("design") === "no";
      document.getElementById("design-note").hidden = !design;
      var body = "Hi Lumvik,\n\nI used your cost estimator:\n\n" + lines.map(function (l) { return "- " + l[0] + ": " + money(l[1]); }).join("\n") + "\n\nEstimate: " + money(total) + " to " + money(high) + (design ? "\nDesign: not ready yet, need help with layout" : "\nDesign: ready") + "\n\nProject details:\n";
      document.getElementById("est-mail").href = "mailto:lumvik.solutions@gmail.com?subject=" + encodeURIComponent("Quote request from the estimator") + "&body=" + encodeURIComponent(body);
    };
    est.addEventListener("change", calc);
    document.getElementById("minus").addEventListener("click", function () { if (count > 1) { count--; calc(); } });
    document.getElementById("plus").addEventListener("click", function () { count++; calc(); });
    calc();
  }

  // Contact form: validate, then open the visitor's email app with the brief filled in
  var form = document.getElementById("brief");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(form), ok = true;
      var need = { name: "Enter your name.", email: "Enter a work email we can reply to.", details: "Tell us a little about the project." };
      Object.keys(need).forEach(function (k) {
        var v = String(f.get(k) || "").trim(), err = document.getElementById(k + "-err"), input = form.elements[k];
        var bad = !v || (k === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v));
        err.textContent = bad ? need[k] : "";
        input.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (!ok) return;
      var body = [
        "Name: " + f.get("name"),
        "Agency / company: " + (f.get("company") || "-"),
        "Email: " + f.get("email"),
        "Website: " + (f.get("website") || "-"),
        "Project type: " + f.get("type"),
        "Budget: " + f.get("budget"),
        "Timeline: " + f.get("timeline"),
        "",
        String(f.get("details"))
      ].join("\n");
      var subject = "Project brief: " + f.get("type") + " (" + (f.get("company") || f.get("name")) + ")";
      window.location.href = "mailto:lumvik.solutions@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      document.getElementById("sent-note").hidden = false;
    });
  }
})();
