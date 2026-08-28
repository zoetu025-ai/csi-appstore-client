// 共用版型層：讀 window.CLIENT 排出頁面。三種設計方向共用這一份。
(function () {
  "use strict";

  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };

  var root = document.getElementById("app");
  var data = window.CLIENT;

  if (!data) {
    root.innerHTML = '<p class="fatal">找不到資料：請確認 client.js 有正確載入。</p>';
    return;
  }

  // ?n=3 只顯示前 3 個 APP，用來測試不同數量
  var n = parseInt(new URLSearchParams(location.search).get("n") || "0", 10);
  var apps = data.APP列表 || [];
  if (n > 0) apps = apps.slice(0, n);

  // 必填檢查：缺東西直接在頁面上顯示，不要默默產生壞頁
  var problems = [];
  if (!data.客戶名稱) problems.push("客戶名稱沒有填");
  if (!apps.length) problems.push("APP列表是空的");
  apps.forEach(function (a, i) {
    var no = "第 " + (i + 1) + " 個 APP";
    if (!a.名稱) problems.push(no + "：名稱沒有填");
    if (!a.icon) problems.push(no + "：icon 沒有填");
    if (!a.手機圖) problems.push(no + "：手機圖沒有填");
    if (!a.iOS連結 && !a.Android連結 && !a.GooglePlay連結) {
      problems.push(no + "（" + (a.名稱 || "?") + "）：三個下載連結都沒有填");
    }
  });

  var storeBtn = function (href, cls, img, alt) {
    // 連結沒填就不輸出這顆按鈕
    if (!href) return "";
    return (
      '<a class="store ' + cls + '" href="' + esc(href) + '" target="_blank" rel="noopener">' +
      '<img src="' + img + '" alt="' + alt + '"></a>'
    );
  };

  var appHtml = function (a) {
    var feats = (a.功能 || [])
      .map(function (f) { return "<li>" + esc(f) + "</li>"; })
      .join("");

    var androidBtn = a.Android連結
      ? '<a class="store store--apk" href="' + esc(a.Android連結) + '">' +
        '<img src="../img/img_andriod.png" alt="Android">' +
        '<span><small>Download</small><strong>Android</strong></span></a>'
      : "";

    var guide = a.說明書
      ? '<a class="guide" href="' + esc(a.說明書) + '" target="_blank" rel="noopener">' +
        "<span>Download User Guide</span>" +
        '<span class="material-symbols-outlined">download</span></a>'
      : "";

    return (
      '<article class="app">' +
        '<div class="app-shot"><img src="' + esc(a.手機圖) + '" alt="' + esc(a.名稱) + ' screen"></div>' +
        '<div class="app-main">' +
          '<header class="app-head">' +
            '<img class="app-icon" src="' + esc(a.icon) + '" alt="">' +
            "<div><h2>" + esc(a.名稱) + "</h2><p>" + esc(a.介紹) + "</p></div>" +
          "</header>" +
          (feats ? '<ul class="app-features">' + feats + "</ul>" : "") +
          '<div class="app-actions">' +
            storeBtn(a.iOS連結, "store--ios", "../img/btn_ios.png", "App Store") +
            androidBtn +
            storeBtn(a.GooglePlay連結, "store--google", "../img/btn_google.png", "Google Play") +
          "</div>" +
          guide +
        "</div>" +
      "</article>"
    );
  };

  root.innerHTML =
    (problems.length
      ? '<div class="problems"><strong>這一頁還缺東西：</strong><ul><li>' +
        problems.map(esc).join("</li><li>") + "</li></ul></div>"
      : "") +
    '<header class="site-head">' +
      '<img class="brand" src="../img/Logo.png" alt="infoshare">' +
      '<span class="client">' + esc(data.客戶名稱) + "</span>" +
    "</header>" +
    '<main class="apps" data-count="' + apps.length + '">' +
      (data.系統需求 ? '<p class="req">' + esc(data.系統需求) + "</p>" : "") +
      apps.map(appHtml).join("") +
    "</main>" +
    '<footer class="site-foot">' +
      '<div class="qr"><img src="../img/QRcode.png" alt="QR">' +
      "<p>Use a mobile phone to scan and open the page</p></div>" +
      "<small>&copy; " + new Date().getFullYear() + " by CSI Technology Group</small>" +
    "</footer>";
})();
