// Client data. This is the ONLY file to edit per client.
// Leave a field as "" and it will not appear on the page.
window.CLIENT = {
  clientName: "Taipei City Police Department",
  requirement: "Android 4.3 / iOS 11.0 or above",

  apps: [
    {
      name: "Mobile MDT",
      version: "v2.4.1",
      updated: "2026-08-01",           // YYYY-MM-DD
      features: ["Create case", "Time event", "Link to RMS"],
      icon: "../img/apps/icon-InfoMDT.png",
      screenshot: "../img/apps/appimg-MobileMDT.png",
      ios: "https://apps.apple.com/example",
      android: "https://example.com/mdt.apk",
      googlePlay: "https://play.google.com/example",
      userGuide: "guide-mdt.pdf",
    },
    {
      // Test case: iOS only, single feature
      name: "Active Response",
      version: "v1.8.0",
      updated: "2026-07-15",
      features: ["Real-time field reporting"],
      icon: "../img/apps/icon-ActiveResponse.png",
      screenshot: "../img/apps/appimg-ActiveResponse.png",
      ios: "https://apps.apple.com/example",
      android: "",
      googlePlay: "",
      userGuide: "guide-ar.pdf",
    },
    {
      // Test case: five features, no user guide
      name: "InfoVNS",
      version: "v3.0.2",
      updated: "2026-06-20",
      features: ["Vehicle search", "Person search", "Warrant check", "Query log", "Offline cache"],
      icon: "../img/apps/icon-InfoVNS.png",
      screenshot: "../img/apps/appimg-InfoVNS.png",
      ios: "https://apps.apple.com/example",
      android: "https://example.com/vns.apk",
      googlePlay: "",
      userGuide: "",
    },
    {
      // Test case: no iOS, and an outdated date (triggers the preview warning)
      name: "MDT Fire",
      version: "v1.2.0",
      updated: "2025-09-10",
      features: ["Dispatch", "Hydrant map", "Crew status"],
      icon: "../img/apps/icon-MDTFire.png",
      screenshot: "../img/apps/appimg-MDTFire.png",
      ios: "",
      android: "https://example.com/fire.apk",
      googlePlay: "https://play.google.com/example",
      userGuide: "guide-fire.pdf",
    },
    {
      name: "Personnel",
      version: "v2.0.0",
      updated: "2026-08-18",
      features: ["Roster", "Shift swap"],
      icon: "../img/apps/icon-Personnel.png",
      screenshot: "../img/apps/appimg-Personnel.png",
      ios: "https://apps.apple.com/example",
      android: "https://example.com/hr.apk",
      googlePlay: "https://play.google.com/example",
      userGuide: "guide-hr.pdf",
    },
  ],
};
