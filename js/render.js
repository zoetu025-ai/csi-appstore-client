// Shared layout. Do not edit this for a single client.
(function () {
  "use strict";

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  var root = document.getElementById("app");
  if (!root) return;

  var hugCallouts = function () {
    var nodes = root.querySelectorAll(".callout");
    var i;
    var j;
    var el;
    var p;
    var range;
    var rects;
    var line;
    var cs;
    var pad;
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      p = el.querySelector("p");
      if (!p) continue;
      el.style.width = "";
      range = document.createRange();
      range.selectNodeContents(p);
      rects = range.getClientRects();
      line = 0;
      for (j = 0; j < rects.length; j++) {
        if (rects[j].width > line) line = rects[j].width;
      }
      if (line < 1) continue;
      cs = window.getComputedStyle(el);
      pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      el.style.width = Math.ceil(line + pad + 1) + "px";
    }
  };

  if (window.matchMedia) {
    window.matchMedia("(min-width: 1200px)").addEventListener("change", function () {
      if (!root) return;
      root.classList.add("is-hug-measure");
      hugCallouts();
      root.classList.remove("is-hug-measure");
    });
  }

  var pageMsg = function (text, kind) {
    var isStatus = kind === "status";
    return (
      "<p class=\"" +
      (isStatus ? "status" : "alert") +
      "\" role=\"" +
      (isStatus ? "status" : "alert") +
      "\">" +
      esc(text) +
      "</p>"
    );
  };

  var paint = function (data) {
  if (!data) {
    root.innerHTML = pageMsg(
      "No data found. Please contact CSI Technology Group."
    );
    return;
  }

  var apps = data.apps || [];
  if (!apps.length) {
    root.innerHTML = pageMsg(
      "No apps are listed for this page. Please contact CSI Technology Group."
    );
    return;
  }

  var usable = function (s) {
    return !!(s && s !== "#");
  };

  var assetUrl = function (src) {
    if (!usable(src)) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(src)) return src;
    try {
      return encodeURI(src);
    } catch (e) {
      return src;
    }
  };

  var storeBtn = function (href, img, label) {
    if (!usable(href)) return "";
    return (
      '<a class="dl" href="' +
      esc(assetUrl(href)) +
      '" target="_blank" rel="noopener" aria-label="' +
      esc(label) +
      '">' +
      '<img src="' +
      esc(img) +
      '" alt="" width="144" height="46">' +
      "</a>"
    );
  };

  var phoneHtml = function (src) {
    return (
      '<figure class="phone">' +
      '<img src="' +
      esc(assetUrl(src)) +
      '" alt="">' +
      "</figure>"
    );
  };

  var calloutHtml = function (text, slot) {
    return (
      '<div class="callout callout--' +
      slot +
      '"><p>' +
      esc(text) +
      "</p></div>"
    );
  };

  var featureText = function (raw, key) {
    if (!raw) return "";
    if (Array.isArray(raw)) {
      var order = { left: 0, "right-top": 1, "right-bottom": 2 };
      return String(raw[order[key]] || "").trim();
    }
    var aliases = {
      left: ["left"],
      "right-top": ["rightTop", "right-top"],
      "right-bottom": ["rightBottom", "right-bottom"],
    };
    var keys = aliases[key] || [];
    for (var i = 0; i < keys.length; i++) {
      if (raw[keys[i]]) return String(raw[keys[i]]).trim();
    }
    return "";
  };

  var appHtml = function (a) {
    var leftText = featureText(a.features, "left");
    var rightTopText = featureText(a.features, "right-top");
    var rightBottomText = featureText(a.features, "right-bottom");
    var featList = [leftText, rightTopText, rightBottomText].filter(Boolean);

    var allShots = (a.screenshots || []).filter(Boolean);
    var slotShots = allShots.length >= 2 ? 2 : allShots.length === 1 ? 1 : 0;
    var shots = allShots.slice(0, slotShots);
    var shotCount = shots.length;
    var layoutClass = shotCount ? " stage--" + slotShots : "";
    var taglineLines = usable(a.tagline)
      ? String(a.tagline)
          .split(/\r?\n/)
          .map(function (line) {
            return line.trim();
          })
          .filter(Boolean)
      : [];

    var notes = [];
    if (allShots.length === 0) {
      notes.push("This app needs 1 or 2 screenshot(s).");
    } else if (allShots.length > 2) {
      notes.push("Two-phone layout uses 2 screenshots; extra images are ignored.");
    }
    var notesHtml = notes.length
      ? '<p class="alert">' + notes.map(esc).join(" ") + "</p>"
      : "";

    var taglineHtml = taglineLines.length
      ? '<div class="tagline">' +
        taglineLines
          .map(function (line) {
            return "<p>" + esc(line) + "</p>";
          })
          .join("") +
        "</div>"
      : "";

    var glowHtml = shotCount
      ? '<div class="stage-glow" aria-hidden="true"></div>'
      : "";
    var phonesHtml = shotCount
      ? '<div class="phones-col">' +
        '<div class="phones phones--' +
        slotShots +
        '">' +
        shots.map(phoneHtml).join("") +
        "</div></div>"
      : "";

    var leftFeat = leftText ? calloutHtml(leftText, "left") : "";
    var rightFeats =
      (rightTopText ? calloutHtml(rightTopText, "right-top") : "") +
      (rightBottomText ? calloutHtml(rightBottomText, "right-bottom") : "");
    var rightClass =
      "callouts callouts--r" +
      (!rightTopText && rightBottomText ? " callouts--r-bottom-only" : "");

    var checksHtml = featList.length
      ? '<ul class="feats">' +
        featList
          .map(function (f) {
            return (
              "<li>" +
              '<img src="img/ui/icon-check.svg" alt="" width="20" height="20">' +
              "<span>" +
              esc(f) +
              "</span>" +
              "</li>"
            );
          })
          .join("") +
        "</ul>"
      : "";

    var meta = [a.version, a.requirement ? "Requires " + a.requirement : ""]
      .filter(Boolean)
      .join(" | ");

    var dls =
      storeBtn(
        a.ios,
        "img/btn_ios.png",
        "Download on the App Store (opens in a new tab)"
      ) +
      storeBtn(
        a.googlePlay,
        "img/btn_google.png",
        "Get it on Google Play (opens in a new tab)"
      ) +
      storeBtn(
        a.android,
        "img/btn_android.png",
        "Download Android APK (opens in a new tab)"
      );

    var guide = usable(a.userGuide)
      ? '<a class="guide" href="' +
        esc(assetUrl(a.userGuide)) +
        '" target="_blank" rel="noopener" aria-label="Download User Guide (opens in a new tab)">Download User Guide</a>'
      : "";

    return (
      '<article class="app">' +
        '<div class="app-head">' +
          (usable(a.icon)
            ? '<img class="app-icon" src="' + esc(assetUrl(a.icon)) + '" alt="">'
            : "") +
          "<h2>" +
          esc(a.name) +
          "</h2>" +
          taglineHtml +
        "</div>" +
        (dls ? '<div class="dls">' + dls + "</div>" : "") +
        '<div class="stage' +
        layoutClass +
        '">' +
          '<div class="scene">' +
            glowHtml +
            '<div class="callouts callouts--l">' +
            leftFeat +
            "</div>" +
            phonesHtml +
            '<div class="' +
            rightClass +
            '">' +
            rightFeats +
            "</div>" +
          "</div>" +
        "</div>" +
        (meta ? '<p class="meta">' + esc(meta) + "</p>" : "") +
        checksHtml +
        guide +
        notesHtml +
      "</article>"
    );
  };

    var clientName = data.clientName || "Client Name";
    var clientTitle = esc(clientName);
    document.title = clientName + " · CSI App Store";
    var qrHtml = usable(data.qrCode)
      ? '<div class="foot-qr">' +
        '<img src="' +
        esc(assetUrl(data.qrCode)) +
        '" alt="QR code">' +
        "<p>Please use a mobile phone to download the App</p>" +
        "</div>"
      : "";

    root.innerHTML =
      '<header class="head">' +
      "<h1 class=\"head-title\" title=\"" +
      clientTitle +
      "\">" +
      clientTitle +
      "</h1>" +
      '<button type="button" class="copy-link" aria-label="Copy page URL">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<path fill="#0D63BA" d="M7.95 21C6.583 21 5.417 20.517 4.45 19.55 3.483 18.583 3 17.417 3 16.05c0-.667.125-1.3.375-1.9.25-.6.608-1.133 1.075-1.6L7.8 9.225 9.2 10.625 5.85 13.975c-.283.283-.496.604-.637.962C5.07 15.296 5 15.667 5 16.05c0 .817.288 1.513.863 2.088C6.438 18.713 7.133 19 7.95 19c.383 0 .758-.071 1.125-.213.367-.141.692-.354.975-.637L13.375 14.8 14.8 16.225 11.45 19.55c-.467.467-1 .825-1.6 1.075C9.25 20.875 8.617 21 7.95 21Zm1.975-5.5L8.5 14.075 14.075 8.5 15.5 9.925 9.925 15.5Zm6.275-.7L14.8 13.375 18.15 10.05c.283-.283.492-.6.625-.95.133-.35.2-.717.2-1.1 0-.833-.283-1.542-.85-2.125C17.558 5.292 16.858 5 16.025 5c-.383 0-.754.071-1.112.213-.359.141-.68.354-.963.637L10.625 9.2 9.2 7.8 12.55 4.45C13.017 3.983 13.55 3.625 14.15 3.375 14.75 3.125 15.383 3 16.05 3c1.367 0 2.529.483 3.487 1.45C20.496 5.417 20.975 6.592 20.975 7.975c0 .65-.121 1.275-.362 1.875-.242.6-.596 1.133-1.063 1.6L16.2 14.8Z"/>' +
        "</svg>" +
      "</button>" +
    "</header>" +
    '<main class="wrap">' +
    apps.map(appHtml).join("") +
    "</main>" +
    '<footer class="foot">' +
      qrHtml +
      "<small>&copy; CSI Technology Group. All Rights Reserved.</small>" +
    "</footer>" +
    '<div class="toast" role="status" aria-live="polite" aria-atomic="true"></div>';

  var copyBtn = root.querySelector(".copy-link");
  var toast = root.querySelector(".toast");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var url = window.location.href;
      var done = function () {
        if (!toast) return;
        toast.textContent = "Copied";
        toast.classList.add("is-on");
        window.setTimeout(function () {
          toast.classList.remove("is-on");
          toast.textContent = "";
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () {
          window.prompt("Copy this URL", url);
        });
      } else {
        window.prompt("Copy this URL", url);
      }
    });
  }

    var reduceMotion = function () {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    };

    var motionAnchor = function (article) {
      return (
        article.querySelector(".stage") ||
        article.querySelector(".app-head") ||
        article
      );
    };

    var inPlayZone = function (el) {
      var box = el.getBoundingClientRect();
      var viewH = window.innerHeight || document.documentElement.clientHeight;
      var viewW = window.innerWidth || document.documentElement.clientWidth;
      var inset = Math.round(viewH * 0.28);
      return (
        box.bottom > inset &&
        box.top < viewH - inset &&
        box.right > 0 &&
        box.left < viewW
      );
    };

    var articleFrom = function (node) {
      if (node.classList && node.classList.contains("app")) return node;
      return node.closest ? node.closest("article.app") : node;
    };

    var hugResting = function () {
      root.classList.add("is-hug-measure");
      hugCallouts();
      root.classList.remove("is-hug-measure");
    };

    var wireMotion = function () {
      hugResting();
      if (reduceMotion() || typeof IntersectionObserver === "undefined") {
        return;
      }
      var articles = root.querySelectorAll("article.app");
      var waiting = [];
      var visible = [];
      var i;
      var el;
      var anchor;
      for (i = 0; i < articles.length; i++) {
        el = articles[i];
        el.classList.add("is-pending");
        anchor = motionAnchor(el);
        if (inPlayZone(anchor)) {
          visible.push(el);
        } else {
          waiting.push(anchor);
        }
      }
      var revealVisible = function () {
        for (var j = 0; j < visible.length; j++) {
          visible[j].classList.add("is-in");
        }
      };
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(revealVisible);
        });
      } else {
        revealVisible();
      }
      if (!waiting.length) return;
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var article = articleFrom(entry.target);
            if (article) article.classList.add("is-in");
            io.unobserve(entry.target);
          });
        },
        { threshold: 0, rootMargin: "0px 0px -28% 0px" }
      );
      for (i = 0; i < waiting.length; i++) {
        io.observe(waiting[i]);
      }
    };

    var runHug = function () {
      hugResting();
    };
    wireMotion();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(runHug);
    }
    window.setTimeout(runHug, 800);
  };

  var slug = "";
  try {
    slug = new URLSearchParams(window.location.search).get("client") || "";
  } catch (e) {
    slug = "";
  }
  if (slug && /^[a-z][a-z0-9-]{0,30}$/.test(slug)) {
    root.innerHTML = pageMsg("Loading…", "status");
    fetch("clients/" + encodeURIComponent(slug) + "/client.json")
      .then(function (res) {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then(paint)
      .catch(function () {
        root.innerHTML = pageMsg(
          "This page could not be loaded. Please try again, or contact CSI Technology Group."
        );
      });
    return;
  }

  if (window.CLIENT && window.CLIENT.apps && window.CLIENT.apps.length) {
    paint(window.CLIENT);
    return;
  }

  root.innerHTML = pageMsg(
    "This App Store page needs a full link. Please open the URL you were given, or scan the QR code."
  );
})();
