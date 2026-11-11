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
      band.querySelectorAll("[data-now]").forEach(function (n) { n.style.left = (us / 1440) * 100 + "%"; });
      band.querySelector("[data-clock-us]").textContent = label(US, now);
      band.querySelector("[data-clock-in]").textContent = label(IN, now);
    };
    draw();
    setInterval(draw, 60000);
  }

  // Copy email
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy"), msg = btn.parentElement.querySelector("[data-copied]");
      var done = function () { if (msg) { msg.hidden = false; setTimeout(function () { msg.hidden = true; }, 1800); } };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

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
