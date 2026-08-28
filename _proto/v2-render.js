// Layout layer: reads window.CLIENT and renders the page.
// Shared by every client — do not edit this for a single client.
(function () {
  "use strict";

  var STALE_DAYS = 180; // Warn in preview if "updated" is older than this

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  // Date format is handled here, so client files only ever use YYYY-MM-DD
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var fmtDate = function (s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return String(s || "");
    return MONTHS[+m[2] - 1] + " " + +m[3] + ", " + m[1];
  };

  var daysSince = function (s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    var then = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    var now = new Date();
    var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((today - then) / 86400000);
  };

  var root = document.getElementById("app");
  var data = window.CLIENT;

  if (!data) {
    root.innerHTML =
      '<div class="alert">No data found. Check that client.js loads before render.js ' +
      "and has no syntax errors.</div>";
    return;
  }

  // ?n=3 renders only the first 3 apps — for previewing different counts
  var n = parseInt(new URLSearchParams(location.search).get("n") || "0", 10);
  var apps = data.apps || [];
  if (n > 0) apps = apps.slice(0, n);

  // ---- Validation: show what's missing instead of rendering a broken page ----
  var problems = [];
  if (!data.clientName) problems.push("clientName is empty");
  if (!data.requirement) problems.push("requirement is empty");
  if (!apps.length) problems.push("apps list is empty");

  apps.forEach(function (a, i) {
    var who = "App " + (i + 1) + " (" + (a.name || "unnamed") + ")";
    if (!a.name) problems.push(who + ": name is empty");
    if (!a.icon) problems.push(who + ": icon is empty");
    if (!a.screenshot) problems.push(who + ": screenshot is empty");
    if (!a.version) problems.push(who + ": version is empty");
    if (!a.updated) problems.push(who + ": updated is empty");
    if (!a.ios && !a.android && !a.googlePlay) {
      problems.push(who + ": all three download links are empty");
    }
    var d = daysSince(a.updated);
    if (d != null && d > STALE_DAYS) {
      problems.push(who + ": updated " + fmtDate(a.updated) + " — over " +
        STALE_DAYS + " days ago, check whether this is still current");
    }
  });

  var storeBtn = function (href, cls, img, alt) {
    if (!href) return ""; // Empty link → button does not render
    return (
      '<a class="dl ' + cls + '" href="' + esc(href) + '" target="_blank" rel="noopener">' +
      '<img src="' + img + '" alt="' + alt + '"></a>'
    );
  };

  var appHtml = function (a) {
    var feats = (a.features || []).filter(Boolean);
    var featHtml = feats.length
      ? '<ul class="feats">' +
        feats.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") +
        "</ul>"
      : "";

    var apk = a.android
      ? '<a class="dl dl--apk" href="' + esc(a.android) + '">' +
        '<img src="../img/img_andriod.png" alt="">' +
        "<span><small>Download</small><strong>Android</strong></span></a>"
      : "";

    var guide = a.userGuide
      ? '<a class="guide" href="' + esc(a.userGuide) + '" target="_blank" rel="noopener">' +
        '<span class="material-symbols-outlined">description</span>User guide</a>'
      : "";

    return (
      '<article class="app">' +
        '<div class="app-id">' +
          '<img class="icon" src="' + esc(a.icon) + '" alt="">' +
          '<div class="app-name">' +
            "<h2>" + esc(a.name) + "</h2>" +
            '<p class="meta">' +
              (a.version ? '<span class="ver">' + esc(a.version) + "</span>" : "") +
              (a.updated ? '<span class="upd">Updated ' + fmtDate(a.updated) + "</span>" : "") +
            "</p>" +
          "</div>" +
        "</div>" +
        '<div class="app-body">' +
          featHtml +
          '<div class="dls">' +
            storeBtn(a.ios, "dl--ios", "../img/btn_ios.png", "App Store") +
            apk +
            storeBtn(a.googlePlay, "dl--play", "../img/btn_google.png", "Google Play") +
          "</div>" +
          guide +
        "</div>" +
        '<div class="app-shot"><img src="' + esc(a.screenshot) + '" alt=""></div>' +
      "</article>"
    );
  };

  root.innerHTML =
    (problems.length
      ? '<div class="alert"><strong>This page is missing something (preview only)</strong>' +
        "<ul><li>" + problems.map(esc).join("</li><li>") + "</li></ul></div>"
      : "") +
    '<header class="head">' +
      '<img class="logo" src="../img/Logo.png" alt="infoshare">' +
      '<div class="head-title">' +
        "<h1>" + esc(data.clientName) + "</h1>" +
        "<p>Choose an app to install</p>" +
      "</div>" +
    "</header>" +
    '<main class="wrap" data-count="' + apps.length + '">' +
      (data.requirement
        ? '<p class="req">Requires ' + esc(data.requirement) + "</p>" : "") +
      '<div class="list">' + apps.map(appHtml).join("") + "</div>" +
    "</main>" +
    '<footer class="foot">' +
      '<div class="qr"><img src="../img/QRcode.png" alt="">' +
      "<p>Use a mobile phone to scan and open the page</p></div>" +
      "<small>&copy; " + new Date().getFullYear() + " by CSI Technology Group</small>" +
    "</footer>";
})();
