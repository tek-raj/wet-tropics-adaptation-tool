/*
 * ICON SET — simple line icons drawn on a 24 x 24 grid.
 * Each icon is a list of SVG elements: ["path", d], ["circle", cx, cy, r] or ["line", x1, y1, x2, y2].
 * Hazard names (from the Risk assessment list) are matched to icons in HAZARD_ICONS below.
 */
window.ICONS = {
  thermometer: [["path", "M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0z"], ["line", 12, 9, 12, 15.5], ["circle", 12, 17, 1.6]],
  heatwave: [["circle", 12, 9, 3.5], ["line", 12, 2, 12, 3.5], ["line", 5.5, 9, 4, 9], ["line", 20, 9, 18.5, 9], ["line", 7.4, 4.4, 6.4, 3.4], ["line", 16.6, 4.4, 17.6, 3.4],
    ["path", "M3 16.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"], ["path", "M3 20.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0"]],
  sun: [["circle", 12, 12, 4], ["line", 12, 2.5, 12, 4.5], ["line", 12, 19.5, 12, 21.5], ["line", 2.5, 12, 4.5, 12], ["line", 19.5, 12, 21.5, 12],
    ["line", 5.3, 5.3, 6.7, 6.7], ["line", 17.3, 17.3, 18.7, 18.7], ["line", 5.3, 18.7, 6.7, 17.3], ["line", 17.3, 6.7, 18.7, 5.3]],
  moon: [["path", "M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z"], ["line", 17, 3.5, 17, 6.5], ["line", 15.5, 5, 18.5, 5]],
  cyclone: [["circle", 12, 12, 2.6], ["path", "M15 4.6C10.3 3 5.2 5.8 4.6 11"], ["path", "M9 19.4c4.7 1.6 9.8-1.2 10.4-6.4"], ["path", "M4.6 11c0 3 2.6 5.6 6 5.6"], ["path", "M19.4 13c0-3-2.6-5.6-6-5.6"]],
  drought: [["circle", 16.5, 6.5, 3], ["path", "M2.5 14.5h19"], ["path", "M4 14.5l2 3-1.5 3"], ["path", "M11 14.5l-1.5 2.5 2 2-1 2"], ["path", "M17.5 14.5l1.5 2.5-2 3.5"], ["path", "M3 9.5h6"], ["path", "M4.5 6.5h4"]],
  sealevel: [["path", "M2.5 17c1.6-1.2 3.2-1.2 4.8 0s3.2 1.2 4.8 0 3.2-1.2 4.8 0 3.2 1.2 4.8 0"], ["path", "M2.5 21c1.6-1.2 3.2-1.2 4.8 0s3.2 1.2 4.8 0 3.2-1.2 4.8 0 3.2 1.2 4.8 0"], ["line", 12, 13, 12, 3], ["path", "M8.5 6.5L12 3l3.5 3.5"]],
  flood: [["path", "M7 12.5a3.8 3.8 0 0 1-.4-7.6A5 5 0 0 1 16.2 6a3.3 3.3 0 0 1 .8 6.5z"], ["line", 8.5, 14.5, 7.5, 16.5], ["line", 12.5, 14.5, 11.5, 16.5], ["line", 16.5, 14.5, 15.5, 16.5],
    ["path", "M2.5 20.5c1.6-1.2 3.2-1.2 4.8 0s3.2 1.2 4.8 0 3.2-1.2 4.8 0 3.2 1.2 4.8 0"]],
  fire: [["path", "M12 2.8c.9 3 5.2 5.3 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2.6 1.4-4.3 2.6-5.3.4 2 1.4 3.1 2.6 3.2-.2-3.1-1.1-5.2 0-8.1z"], ["path", "M10.3 17.5a1.9 1.9 0 0 0 3.4 0c0-1.2-.9-2-1.7-2.9-.8.9-1.7 1.7-1.7 2.9z"]],
  other: [["circle", 12, 12, 9], ["line", 12, 7.5, 12, 13], ["circle", 12, 16.5, 0.6]],
  // planning steps
  leaf: [["path", "M5 19c0-8 5-13.5 14-14-.5 9-6 14-14 14z"], ["path", "M5 19c3-4 6-6.5 9.5-8.5"]],
  pin: [["path", "M12 21s6.5-6.1 6.5-11a6.5 6.5 0 0 0-13 0c0 4.9 6.5 11 6.5 11z"], ["circle", 12, 10, 2.4]],
  alert: [["path", "M10.3 4.2L2.7 17.5a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z"], ["line", 12, 9.5, 12, 13.5], ["circle", 12, 16.8, 0.6]],
  list: [["path", "M4 6.5l1.5 1.5 2.5-2.5"], ["path", "M4 12.5l1.5 1.5 2.5-2.5"], ["path", "M4 18.5l1.5 1.5 2.5-2.5"], ["line", 11, 7, 20, 7], ["line", 11, 13, 20, 13], ["line", 11, 19, 20, 19]],
  scales: [["line", 12, 3.5, 12, 20.5], ["line", 8, 20.5, 16, 20.5], ["line", 4.5, 7, 19.5, 7], ["path", "M4.5 7l-2.5 6a3 3 0 0 0 5 0z"], ["path", "M19.5 7l-2.5 6a3 3 0 0 0 5 0z"]],
  signpost: [["line", 12, 2.5, 12, 21.5], ["path", "M12 5h6.5l2 2-2 2H12"], ["path", "M12 11.5H5.5l-2 2 2 2H12"]],
  poster: [["rect", 4, 2.5, 16, 19, 2], ["rect", 7, 5.5, 10, 6.5, 1], ["line", 7, 14.5, 17, 14.5], ["line", 7, 17.5, 13.5, 17.5]],
  share: [["path", "M20 12a8 8 0 1 1-2.3-5.7"], ["path", "M20 4.5v4.2h-4.2"], ["path", "M9 12.5l2 2 4-4.5"]]
};

// Which icon to show for each hazard (matched on the start of the hazard name, case-insensitive).
window.HAZARD_ICONS = [
  ["increased temp", "thermometer"],
  ["heatwave", "heatwave"],
  ["hot day", "sun"],
  ["hot night", "moon"],
  ["cyclone", "cyclone"],
  ["drought", "drought"],
  ["sea level", "sealevel"],
  ["flood", "flood"],
  ["fire", "fire"]
];

// Icon for each planning step (by tab id).
window.STEP_ICONS = { species: "leaf", site: "pin", risk: "alert", actions: "list", scoring: "scales", pathway: "signpost", summary: "poster", export: "share" };
