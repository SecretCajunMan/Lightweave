/* ============================================================================
   lw-site.js — Lightweave shared site infrastructure
   Single source of truth for: the room manifest, the grouped <lw-rail> nav,
   and a tiny shared ledger store (localStorage) that rooms can read.
   Plain JS. Loaded once per page via <script src="./lw-site.js"></script>.
   Truth rule: this file is projection plumbing only. It never edits canon.
   ========================================================================== */
(function () {
  "use strict";
  if (window.LW_SITE_LOADED) return;
  window.LW_SITE_LOADED = true;

  /* ---- the eight groups (mirrors Start Here) ----------------------------- */
  var GROUPS = [
    { key: "capture", title: "Get it in",          sub: "capture & keep",                 color: "#34e1b4" },
    { key: "pattern", title: "See the patterns",   sub: "meaning & connection",           color: "#9b8cff" },
    { key: "trust",   title: "Trust it & fix it",  sub: "proof, provenance, repair",      color: "#46c8ff" },
    { key: "decide",  title: "Decide & plan",      sub: "what-if and forward",            color: "#ffce5a" },
    { key: "daily",   title: "Live with it",       sub: "daily life, memory & care",      color: "#ff7ad0" },
    { key: "money",   title: "Money & value",      sub: "what you have, what drains it",  color: "#46e08a" },
    { key: "control", title: "Control & share",    sub: "visibility, authority, people",  color: "#7fb0ff" },
    { key: "fun",     title: "For the joy of it",  sub: "the ledger, off the clock",      color: "#ff5db1" }
  ];

  /* ---- the canonical room manifest --------------------------------------
     slug      : hyphenated file basename (served as <slug>.dc.html)
     name      : display name
     group     : one of the GROUPS keys
     blurb     : one line, for landing cards / tooltips
     exp       : experimental flag (badged, never hidden)
     ------------------------------------------------------------------------ */
  var ROOMS = [
    // capture
    { slug: "prism",                 name: "Prism",                 group: "capture", blurb: "The flagship lens — import a raw ledger and watch it refract into sourced, proof-backed projections.", exp: false },
    { slug: "prism-intake",          name: "Prism Intake",          group: "capture", blurb: "Where everything starts — drop a note, file, or thought and it becomes a sourced record." },
    { slug: "delia",                 name: "Delia",                 group: "capture", blurb: "The night desk. Say it plain and she keeps it — exactly, nothing added." },
    { slug: "rosetta",               name: "Rosetta",               group: "capture", blurb: "The transmuter — old ledger formats in, current spec out. Nothing lost in translation." },
    // pattern
    { slug: "constellation-recall",  name: "Constellation Recall",  group: "pattern", blurb: "Your recurring patterns as a star map; bright named stars are strong, red dwarfs are distortions." },
    { slug: "resonance-atlas",       name: "Resonance Atlas",       group: "pattern", blurb: "How your domains push and pull each other — sleep → mood, work → sleep." },
    { slug: "weatherglass-flux",     name: "Weatherglass Flux",     group: "pattern", blurb: "Your patterns rendered as weather — fronts, pressure, and gathering storms." },
    { slug: "spectrum-recall",       name: "Spectrum Recall",       group: "pattern", blurb: "Ask the ledger a question; get sourced, ranked answers back." },
    { slug: "dream-cartographer",    name: "Dream Cartographer",    group: "pattern", blurb: "Your ideas as an explorable atlas — every island charted from real notes." },
    { slug: "thread-loom",           name: "Thread Loom",           group: "pattern", blurb: "Your relationships and connections woven as living threads." },
    // trust
    { slug: "aurora-proof",          name: "Aurora Proof",          group: "trust",   blurb: "The show-your-work room — ribbons flow raw sources → records → insight → projection." },
    { slug: "engine-room",           name: "Engine Room",           group: "trust",   blurb: "Under the hood — watch records validate, transform, and render; debug what fails." },
    { slug: "distortion-clinic",     name: "Distortion Clinic",     group: "trust",   blurb: "The repair bay where ambiguous data confesses — triaged, never silently edited." },
    { slug: "the-case-file",         name: "The Case File",         group: "trust",   blurb: "An evidence-only dossier. The file doesn't do hunches." },
    { slug: "source-aquarium",       name: "Source Aquarium",       group: "trust",   blurb: "Your sources as living creatures in tanks — integrity and health at a glance." },
    { slug: "signal-menagerie",      name: "Signal Menagerie",      group: "trust",   blurb: "The little creatures that flag data states — low quality, contradiction, coverage gaps." },
    // decide
    { slug: "signal-forge",          name: "Signal Forge",          group: "decide",  blurb: "What-if simulation — change an input, see projected outcomes with their confidence." },
    { slug: "the-long-game",         name: "The Long Game",         group: "decide",  blurb: "Long-horizon planning across career and network." },
    { slug: "archive-mine",          name: "Archive Mine",          group: "decide",  blurb: "Old chats and files into structured decisions — ore → gems → ingots → stamped canon." },
    // daily
    { slug: "lantern-desk",          name: "Lantern Desk",          group: "daily",   blurb: "A calm daily home base — today, gently, at a glance." },
    { slug: "tide-room",             name: "Tide Room",             group: "daily",   blurb: "Your day's rhythms as tides coming in and going out." },
    { slug: "memory-conservatory",   name: "Memory Conservatory",   group: "daily",   blurb: "Memories as glowing terrariums by season; reconstructed ones mist over." },
    { slug: "the-illuminary",        name: "The Illuminary",        group: "daily",   blurb: "Your year as a stained-glass window — brightness is confidence, redactions are leaded over." },
    { slug: "shelf-life",            name: "Shelf Life",            group: "daily",   blurb: "Your pantry as glowing jars — stock, expiry, gaps, plus a meal & glucose storyboard." },
    { slug: "lumen-apothecary",      name: "Lumen Apothecary",      group: "daily",   blurb: "Health-adjacent symptoms and patterns on an apothecary shelf — observation only." },
    { slug: "carbs-and-consequences",name: "Carbs & Consequences",  group: "daily",   blurb: "The food-and-body desk — dry, honest, observation-only, never advice." },
    { slug: "the-potting-shed",      name: "The Potting Shed",      group: "daily",   blurb: "The tending bench — habits as care, not compliance." },
    { slug: "the-yield-garden",      name: "The Yield Garden",      group: "daily",   blurb: "Goals and habits as a garden that yields over time." },
    { slug: "verdant-harmonics",     name: "Verdant Harmonics",     group: "daily",   blurb: "Your routines as a living garden kept in harmony — walk the rows and tend them." },
    { slug: "ritual-circle",         name: "Ritual Circle",         group: "daily",   blurb: "Your routines and rituals drawn as a circle you can see and keep." },
    { slug: "mirror-hall",           name: "Mirror Hall",           group: "daily",   blurb: "Your data reflected back — yourself across time and lenses, honestly." },
    // money
    { slug: "the-counting-house",    name: "The Counting House",    group: "money",   blurb: "Money and finances, every figure sourced and traceable." },
    { slug: "lattice-vault",         name: "Lattice Vault",         group: "money",   blurb: "Your high-value canonical records, kept in a vault." },
    { slug: "leeches",               name: "Leeches",               group: "money",   blurb: "The quiet drains — subscriptions, time-sinks, and creeping costs, each one sourced." },
    // control
    { slug: "iris",                  name: "Iris",                  group: "control", blurb: "The visibility aperture — you decide who sees what, and it shows." },
    { slug: "the-governor",          name: "The Governor",          group: "control", blurb: "The authority regulator — you decide what the system may do on its own." },
    { slug: "family-lantern-wall",   name: "Family Lantern Wall",   group: "control", blurb: "A shared wall for the people you choose, scoped so nothing sensitive leaks." },
    { slug: "projection-wardrobe",   name: "Projection Wardrobe",   group: "control", blurb: "Try on themes and lenses — change the look, never the facts." },
    // fun
    { slug: "levity-lens",           name: "Levity Lens",           group: "fun",     blurb: "The meme machine — your records through a bounded humor lens, provenance baked in." },
    { slug: "brass-tacks",           name: "Brass Tacks",           group: "fun",     blurb: "The snarky news desk — straight fact beside the joke, with a firewall." },
    { slug: "bounty-constellarium",  name: "Bounty Constellarium",  group: "fun",     blurb: "Your open loops and tasks as a reward sky of bounties to claim." }
  ];

  var GROUP_BY = {};
  GROUPS.forEach(function (g) { GROUP_BY[g.key] = g; });
  ROOMS.forEach(function (r) { r.color = (GROUP_BY[r.group] || {}).color || "#9b8cff"; });

  window.LW_GROUPS = GROUPS;
  window.LW_ROOMS = ROOMS;
  window.LW_ROOM_BY_SLUG = {};
  ROOMS.forEach(function (r) { window.LW_ROOM_BY_SLUG[r.slug] = r; });
  window.LW_roomHref = function (slug) { return "./" + slug + ".dc.html"; };
  window.LW_homeHref = "./Home.dc.html";

  /* ---- shared ledger store (read-mostly projection cache) ----------------
     Rooms read window.LWLedger.records(). The Import Ledger modal writes here
     (an annotation of what the analyst chose to view — never canon itself).
     ------------------------------------------------------------------------ */
  var LS_KEY = "lw_ledger_v1";
  var subs = [];
  function readLS() {
    try { var raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }
  window.LWLedger = {
    records: function () { var d = readLS(); return (d && Array.isArray(d.records)) ? d.records : []; },
    meta: function () { var d = readLS(); return (d && d.meta) || null; },
    set: function (records, meta) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ records: records || [], meta: meta || { importedAt: Date.now() } }));
      } catch (e) {}
      subs.forEach(function (fn) { try { fn(); } catch (e) {} });
    },
    clear: function () { try { localStorage.removeItem(LS_KEY); } catch (e) {} subs.forEach(function (fn) { try { fn(); } catch (e) {} }); },
    subscribe: function (fn) { subs.push(fn); return function () { subs = subs.filter(function (f) { return f !== fn; }); }; }
  };

  /* ======================================================================
     UNIVERSAL LEDGER INSPECTOR
     Every room loads this file and renders <lw-rail>, so every room gets a
     "Ledger" button that opens this portable inspector: import JSON, refract
     records into facets, open proof drawers, see warnings + canonical
     fallback. Reads the same shared store. Never writes to canon.
     ====================================================================== */
  var LW_FACETS = [
    { kind: "insight", label: "Insights", sub: "derived patterns",        color: "#9b8cff" },
    { kind: "score",   label: "Scores",   sub: "resolved aggregates",     color: "#34e1b4" },
    { kind: "bloom",   label: "Blooms",   sub: "habits & goals growing",  color: "#ff7ad0" },
    { kind: "storm",   label: "Storms",   sub: "distortions & conflicts", color: "#ff6b5e" },
    { kind: "thread",  label: "Threads",  sub: "people & connections",    color: "#46c8ff" },
    { kind: "reward",  label: "Rewards",  sub: "claimable loops",         color: "#ffce5a" }
  ];
  var LW_FMETA = {}; LW_FACETS.forEach(function (f) { LW_FMETA[f.kind] = f; });
  function lwConf(c) { return c >= 0.8 ? "#39e0a6" : c >= 0.65 ? "#7fd99a" : c >= 0.55 ? "#e8c75a" : c >= 0.45 ? "#ff9e57" : "#ff6b5e"; }
  function lwLife(l) { return l === "Confirmed" ? "#39e0a6" : l === "Watching" ? "#e8c75a" : l === "Contested" ? "#ff6b5e" : l === "Simulated" ? "#b18cff" : "#9aa6c0"; }
  function lwKind(k) { return ({ HUM: "#f0d8a8", DEV: "#66c7ff", DOC: "#d9a441", EXT: "#34e1b4", SYS: "#9b8cff", AI: "#ff7ad0" })[k] || "#9aa6c0"; }
  function lwA(hex, a) { var c = (hex || "#888").replace("#", ""); return "rgba(" + parseInt(c.slice(0, 2), 16) + "," + parseInt(c.slice(2, 4), 16) + "," + parseInt(c.slice(4, 6), 16) + "," + a + ")"; }
  function lwE(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  window.LW_SAMPLE = [
    { id: "rec_lm_204", kind: "insight", subject: "Short sleep \u2192 next-day focus dip", value: "Holds across 9 nights", confidence: 0.81, lifecycle: "Confirmed", visibility: "public", window: "May 18 \u2013 Jun 15",
      sources: [{ kind: "DEV", name: "Sleep band export", integrity: 0.94 }, { kind: "DEV", name: "Focus timer log", integrity: 0.86 }, { kind: "HUM", name: "Journal entries", integrity: 0.62 }],
      reasoning: ["Pairs nightly sleep against next-day focus duration across 9 nights.", "Holds across band and timer; the self-report adds and partly disputes it.", "Directional only \u2014 causation is not asserted."],
      contradiction: { a: { label: "Self-report", val: "5.0 h", conf: "conf 0.60", color: "#ff9e57" }, b: { label: "Device band", val: "6.2 h", conf: "conf 0.92", color: "#56b8ff" }, note: "Two of nine nights disagree. The conflict is surfaced, never silently resolved." },
      truthMode: "PATTERN", resolver: "HIGHEST_CONF", recordsUsed: 14, schema: "contract_v1.5", fields: { domain: "sleep\u00d7focus", nights: 9, method: "paired-delta", r: "-0.58" } },
    { id: "rec_sq_31", kind: "score", subject: "Sleep quality", value: "0.74 \u00b7 trending flat", confidence: 0.74, lifecycle: "Watching", visibility: "public", window: "last 30 nights",
      sources: [{ kind: "DEV", name: "Sleep band export", integrity: 0.94 }],
      reasoning: ["Confidence-weighted mean of 30 nightly band records.", "Single high-integrity source \u2014 no corroboration needed."],
      truthMode: "AGGREGATE", resolver: "LATEST_VERIFIED", recordsUsed: 30, schema: "contract_v1.5", fields: { unit: "index_0_1", mean: 0.74, sd: 0.08, n: 30 } },
    { id: "rec_mood_sealed", kind: "score", subject: "Mood baseline", value: "\u2014 sealed \u2014", confidence: 0.7, lifecycle: "Confirmed", visibility: "sealed", window: "private",
      sources: [{ kind: "HUM", name: "Private journal", integrity: 0.6 }],
      reasoning: ["This record is sealed by an Iris visibility policy.", "The projection can show that it exists \u2014 not its value."],
      truthMode: "AGGREGATE", resolver: "HIGHEST_CONF", recordsUsed: 21, schema: "contract_v1.5", fields: { visibility: "sealed by Iris", value: "withheld", policy: "self-only" } },
    { id: "rec_pages_88", kind: "bloom", subject: "Morning pages habit", value: "17-day streak", confidence: 0.91, lifecycle: "Confirmed", visibility: "public", window: "May 31 \u2013 Jun 16",
      sources: [{ kind: "DEV", name: "Writing app log", integrity: 0.88 }],
      reasoning: ["Each entry is an app-logged event with a timestamp.", "Streak read by LATEST resolver \u2014 no gaps in 17 days."],
      truthMode: "STREAK", resolver: "LATEST", recordsUsed: 17, schema: "contract_v1.5", fields: { streak: 17, longest: 24, unit: "days" } },
    { id: "rec_budget_storm", kind: "storm", subject: "Spending vs budget conflict", value: "2 sources disagree", confidence: 0.48, lifecycle: "Contested", visibility: "public", window: "June",
      sources: [{ kind: "EXT", name: "Bank feed (OAuth)", integrity: 0.9 }, { kind: "HUM", name: "Manual budget note", integrity: 0.55 }],
      reasoning: ["Bank-derived spend exceeds the self-set budget figure.", "The two cannot both be canonical \u2014 held as contested.", "Confidence capped at 0.48 until reconciled."],
      contradiction: { a: { label: "Bank feed", val: "$2,140", conf: "conf 0.90", color: "#56b8ff" }, b: { label: "Budget note", val: "$1,600", conf: "conf 0.55", color: "#ff9e57" }, note: "The pretty number does not win. Both are kept until you reconcile them." },
      truthMode: "CONTESTED", resolver: "NONE", recordsUsed: 2, schema: "contract_v1.5", fields: { bank: "$2,140", note: "$1,600", delta: "$540" } },
    { id: "rec_caf_sim", kind: "insight", subject: "Caffeine after 2pm \u2192 worse sleep", value: "Simulated what-if", confidence: 0.66, lifecycle: "Simulated", visibility: "public", window: "projected \u00b7 14 nights",
      sources: [{ kind: "SYS", name: "Signal Forge scenario", integrity: 0.7 }],
      reasoning: ["A what-if run, not an observation \u2014 lifecycle is SIMULATED.", "Projects band data forward under a cutoff rule.", "Must never be read as a confirmed pattern."],
      truthMode: "SIMULATED", resolver: "SCENARIO", recordsUsed: 0, schema: "contract_v1.5", fields: { scenario: "caffeine_cutoff_14h", basis: "band", status: "hypothetical" } },
    { id: "rec_ws_60", kind: "insight", subject: "Meeting density \u2192 sleep strain", value: "Thin evidence", confidence: 0.6, lifecycle: "Watching", visibility: "public", window: "Jun 2 \u2013 Jun 16",
      sources: [],
      reasoning: ["Suggested by calendar load but the supporting records did not normalize.", "Surfaced with NO source attached \u2014 corroborate before trusting."],
      truthMode: "PATTERN", resolver: "LATEST", recordsUsed: 0, schema: "contract_v1.5", fields: { basis: "calendar(unnormalized)", sources: 0, status: "unsupported" } },
    { id: "rec_maya_thr", kind: "thread", subject: "A friend \u2014 time to reconnect", value: "34 days since contact", confidence: 0.83, lifecycle: "Confirmed", visibility: "public", window: "rolling",
      sources: [{ kind: "EXT", name: "Calendar", integrity: 0.9 }, { kind: "DEV", name: "Messages metadata", integrity: 0.82 }],
      reasoning: ["Days-since-contact read from real interaction records.", "A reminder, never a scorecard \u2014 nothing is graded."],
      truthMode: "LATEST", resolver: "LATEST", recordsUsed: 8, schema: "contract_v1.5", fields: { last_contact: "May 13", days: 34, channel: "message" } },
    { id: "rec_ship_rwd", kind: "reward", subject: "Ship the Lightweave demo", value: "Claimable on attestation", confidence: 0.95, lifecycle: "Confirmed", visibility: "public", window: "goal",
      sources: [{ kind: "DEV", name: "Repo activity", integrity: 0.92 }, { kind: "HUM", name: "Self-marked done", integrity: 0.6 }],
      reasoning: ["Repo activity attests the work; self-mark alone would not release it.", "Reward unlocks only on attested completion \u2014 never a self-tick."],
      truthMode: "GATED", resolver: "HIGHEST_CONF", recordsUsed: 6, schema: "contract_v1.5", fields: { goal: "demo_v1", attested: true, release: "ready" } }
  ];

  function lwNormalize(rec, i) {
    var r = {}; for (var k in rec) r[k] = rec[k];
    r.id = r.id || ("rec_" + i);
    r.kind = String(r.kind || "insight").toLowerCase();
    if (!LW_FMETA[r.kind]) r.kind = "insight";
    r.subject = r.subject || r.title || r.name || "(untitled record)";
    r.value = r.value != null ? r.value : "";
    r.lifecycle = r.lifecycle || "Watching";
    r.visibility = r.visibility || "public";
    r.sources = Array.isArray(r.sources) ? r.sources : [];
    r.reasoning = Array.isArray(r.reasoning) ? r.reasoning : [];
    r.fields = (r.fields && typeof r.fields === "object") ? r.fields : {};
    var conf = (typeof r.confidence === "number") ? r.confidence : null;
    var sealed = r.visibility === "sealed" || r.visibility === "private";
    var w = [];
    if (sealed) w.push({ label: "Hidden by visibility policy", color: "#7fb0ff", note: "An Iris policy seals this record. Its existence shows; its value does not." });
    if (!r.sources.length) w.push({ label: "Sources missing", color: "#ff9e57", note: "No source is attached. Shown but uncorroborated \u2014 none was invented to fill the gap." });
    if (r.lifecycle === "Simulated") w.push({ label: "Lifecycle is SIMULATED", color: "#b18cff", note: "A what-if projection, not an observation. Never read it as a confirmed fact." });
    if (conf != null && conf < 0.55) w.push({ label: "Low confidence", color: "#ff6b5e", note: "Confidence is below 0.55. The signal is weak and may be contested." });
    r._conf = conf; r._sealed = sealed; r._warn = w;
    return r;
  }
  window.LW_adapter = function (records) { return (records || []).map(lwNormalize); };
  function lwRecords() { var r = window.LWLedger.records(); return window.LW_adapter((r && r.length) ? r : window.LW_SAMPLE); }
  function lwImported() { var r = window.LWLedger.records(); return !!(r && r.length); }

  var PANEL_CSS =
    '*{box-sizing:border-box}' +
    '.bk{position:fixed;inset:0;background:rgba(4,5,11,0.74);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:28px;font-family:"IBM Plex Sans",system-ui,sans-serif;}' +
    '.cd{width:min(1160px,95vw);height:min(86vh,880px);display:flex;flex-direction:column;background:linear-gradient(180deg,rgba(18,20,32,0.97),rgba(10,11,20,0.99));border:1px solid rgba(255,255,255,0.12);border-radius:18px;box-shadow:0 36px 90px rgba(0,0,0,0.6);overflow:hidden;color:rgba(238,241,251,0.92);}' +
    '.ph{flex:0 0 auto;display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.08);}' +
    '.ph .ti{font-family:"Space Grotesk",sans-serif;font-weight:600;font-size:16px;letter-spacing:0.02em;}' +
    '.ph .su{font-family:"IBM Plex Mono",monospace;font-size:10px;color:rgba(238,241,251,0.45);}' +
    '.pill{font-family:"IBM Plex Mono",monospace;font-size:10px;display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:7px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.02);}' +
    '.pill .d{width:6px;height:6px;border-radius:50%;}' +
    '.tb{font-family:inherit;font-size:12px;font-weight:600;padding:7px 13px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.14);background:transparent;color:rgba(238,241,251,0.7);}' +
    '.tb.on{color:#0b0d16;background:linear-gradient(135deg,#9b8cff,#34e1b4);border-color:transparent;}' +
    '.x{cursor:pointer;font-size:19px;color:rgba(238,241,251,0.5);line-height:1;padding:2px 4px;}' +
    '.x:hover{color:#fff;}' +
    '.pb{flex:1;display:flex;min-height:0;}' +
    '.pl{flex:1;min-width:0;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:16px;}' +
    '.gh{display:flex;align-items:center;gap:9px;margin-bottom:9px;}' +
    '.gh .sq{width:11px;height:11px;border-radius:3px;}' +
    '.gh .gt{font-family:"Space Grotesk",sans-serif;font-size:14px;font-weight:600;}' +
    '.gh .gs{font-family:"IBM Plex Mono",monospace;font-size:9.5px;color:rgba(238,241,251,0.42);}' +
    '.rows{display:flex;flex-direction:column;gap:7px;}' +
    '.row{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:11px;cursor:pointer;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.08);transition:background .1s,border-color .1s;}' +
    '.row:hover{background:rgba(255,255,255,0.05);}' +
    '.row.sel{border-color:var(--rc);background:var(--rcb);}' +
    '.row .rk{font-family:"IBM Plex Mono",monospace;font-size:7.5px;letter-spacing:0.06em;padding:2px 5px;border-radius:5px;flex:0 0 auto;}' +
    '.row .rs{font-family:"Space Grotesk",sans-serif;font-size:13px;font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.row .rv{font-size:11px;color:rgba(238,241,251,0.5);flex:0 0 auto;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.row .ch{font-family:"IBM Plex Mono",monospace;font-size:9px;padding:2px 6px;border-radius:5px;flex:0 0 auto;}' +
    '.row .wd{width:8px;height:8px;border-radius:50%;flex:0 0 auto;}' +
    '.pf{font-family:"IBM Plex Mono",monospace;font-size:10px;color:#0b0d16;background:var(--rc);border:none;border-radius:6px;padding:4px 8px;cursor:pointer;font-weight:600;flex:0 0 auto;}' +
    '.row:not(.sel) .pf{color:rgba(238,241,251,0.8);background:rgba(255,255,255,0.08);}' +
    '.pd{flex:0 0 380px;border-left:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.015);display:flex;flex-direction:column;min-height:0;}' +
    '.pdh{flex:0 0 auto;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,0.07);}' +
    '.pdb{flex:1;overflow-y:auto;padding:13px 16px 16px;display:flex;flex-direction:column;gap:13px;}' +
    '.sec .sl{font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:0.13em;color:rgba(238,241,251,0.4);margin-bottom:8px;}' +
    '.box{border-radius:11px;padding:11px 12px;}' +
    '.src{display:flex;align-items:center;gap:9px;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.07);border-radius:9px;padding:7px 10px;margin-bottom:6px;}' +
    '.src .sk{font-family:"IBM Plex Mono",monospace;font-size:8.5px;font-weight:600;border-radius:5px;padding:2px 5px;}' +
    '.src .sn{font-size:11px;flex:1;color:rgba(238,241,251,0.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.src .si{font-family:"IBM Plex Mono",monospace;font-size:9.5px;}' +
    '.step{display:flex;gap:9px;align-items:flex-start;margin-bottom:7px;}' +
    '.step .dt{flex:0 0 auto;width:6px;height:6px;border-radius:50%;margin-top:6px;}' +
    '.step .tx{font-size:11.5px;line-height:1.5;color:rgba(238,241,251,0.72);}' +
    '.kv{display:flex;justify-content:space-between;font-family:"IBM Plex Mono",monospace;font-size:10.5px;gap:10px;margin-bottom:4px;}' +
    '.kv .k{color:rgba(238,241,251,0.45);} .kv .v{color:rgba(238,241,251,0.85);text-align:right;}' +
    '.ta{width:100%;height:100%;resize:none;background:rgba(0,0,0,0.34);border:1px solid rgba(255,255,255,0.12);border-radius:11px;padding:12px 13px;color:rgba(238,241,251,0.92);font-family:"IBM Plex Mono",monospace;font-size:11.5px;line-height:1.5;outline:none;}' +
    '.imp{flex:1;display:flex;flex-direction:column;gap:11px;padding:16px 18px;min-height:0;}' +
    '.msg{font-size:11.5px;border-radius:9px;padding:9px 11px;}' +
    '.pf2{flex:0 0 auto;display:flex;align-items:center;gap:10px;padding:12px 18px;border-top:1px solid rgba(255,255,255,0.08);}' +
    '.lnk{font-family:"IBM Plex Mono",monospace;font-size:11px;cursor:pointer;color:rgba(238,241,251,0.7);}' +
    '.lnk:hover{color:#fff;}' +
    '.btn{font-family:inherit;font-size:12.5px;font-weight:600;border-radius:9px;padding:9px 17px;cursor:pointer;border:none;}' +
    '.btn.g{color:#0b0d16;background:linear-gradient(135deg,#9b8cff,#34e1b4);}' +
    '.btn.o{color:rgba(238,241,251,0.8);background:transparent;border:1px solid rgba(255,255,255,0.14);}' +
    '.foot{flex:0 0 auto;display:flex;align-items:center;justify-content:center;gap:10px;padding:9px;border-top:1px solid rgba(255,255,255,0.06);background:rgba(0,0,0,0.18);font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:0.08em;color:rgba(238,241,251,0.5);}';

  var P = { sel: null, view: "inspect", txt: "", err: "", ok: "", raw: false, host: null, root: null };

  function lwHeader(imported, n, srcN) {
    var col = imported ? "#34e1b4" : "rgba(238,241,251,0.6)";
    return '<div class="ph">' +
      '<svg width="22" height="22" viewBox="0 0 28 28"><polygon points="14,3 25,23 3,23" fill="none" stroke="#9b8cff" stroke-width="1.6"></polygon><line x1="2" y1="14" x2="14" y2="13" stroke="#fff" stroke-width="1.4"></line><line x1="14" y1="13" x2="26" y2="8" stroke="#34e1b4" stroke-width="1.2"></line><line x1="14" y1="13" x2="26" y2="14" stroke="#ff9e57" stroke-width="1.2"></line><line x1="14" y1="13" x2="26" y2="20" stroke="#ff7ad0" stroke-width="1.2"></line></svg>' +
      '<span class="ti">Ledger</span><span class="su">refract \u00b7 prove \u00b7 read-only</span>' +
      '<span class="pill"><span class="d" style="background:' + col + ';box-shadow:0 0 7px ' + col + '"></span>' + (imported ? "imported" : "sample") + ' \u00b7 ' + n + ' records \u00b7 ' + srcN + ' sources</span>' +
      '<span style="flex:1"></span>' +
      '<button class="tb ' + (P.view === "inspect" ? "on" : "") + '" data-act="view-inspect">Inspect</button>' +
      '<button class="tb ' + (P.view === "import" ? "on" : "") + '" data-act="view-import">Import JSON</button>' +
      '<span class="x" data-act="close" title="Close">\u2715</span></div>';
  }
  function lwList(groups, recs, selId) {
    var html = '<div class="pl">';
    groups.forEach(function (f) {
      var items = recs.filter(function (r) { return r.kind === f.kind; });
      html += '<div><div class="gh"><span class="sq" style="background:' + f.color + ';box-shadow:0 0 8px ' + f.color + '"></span><span class="gt">' + f.label + '</span><span class="gs">' + f.sub + ' \u00b7 ' + items.length + '</span></div><div class="rows">';
      items.forEach(function (r) {
        var sealed = r._sealed, conf = r._conf, on = r.id === selId;
        var dots = r._warn.map(function (w) { return '<span class="wd" title="' + lwE(w.label) + '" style="background:' + w.color + ';box-shadow:0 0 6px ' + w.color + '"></span>'; }).join("");
        html += '<div class="row' + (on ? " sel" : "") + '" data-act="select" data-id="' + r.id + '" style="--rc:' + f.color + ';--rcb:' + lwA(f.color, 0.1) + '">' +
          '<span class="rk" style="color:' + f.color + ';border:1px solid ' + lwA(f.color, 0.4) + '">' + f.label.replace(/s$/, "").toUpperCase() + '</span>' +
          '<span class="rs"' + (sealed ? ' style="color:rgba(238,241,251,0.5)"' : "") + '>' + lwE(sealed ? "\u2014 sealed \u2014" : r.subject) + '</span>' +
          (conf != null && !sealed ? '<span class="ch" style="background:rgba(255,255,255,0.05);color:' + lwConf(conf) + '">conf ' + conf.toFixed(2) + '</span>' : "") +
          '<span class="ch" style="background:' + lwA(lwLife(r.lifecycle), 0.16) + ';color:' + lwLife(r.lifecycle) + '">' + r.lifecycle + '</span>' +
          dots +
          '<button class="pf" data-act="select" data-id="' + r.id + '">Proof</button>' +
          '</div>';
      });
      html += '</div></div>';
    });
    html += '</div>';
    return html;
  }
  function lwDrawer(r) {
    if (!r) return '<div class="pd"></div>';
    var fm = LW_FMETA[r.kind], sealed = r._sealed, conf = r._conf;
    var h = '<div class="pd"><div class="pdh" style="background:' + lwA(fm.color, 0.07) + '">' +
      '<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:3px;background:' + fm.color + ';box-shadow:0 0 9px ' + fm.color + '"></span>' +
      '<span style="font-family:\'Space Grotesk\',sans-serif;font-weight:600;font-size:14.5px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + lwE(r.subject) + '</span>' +
      '<span class="ch" style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;padding:2px 7px;border-radius:5px;background:' + lwA(lwLife(r.lifecycle), 0.16) + ';color:' + lwLife(r.lifecycle) + '">' + r.lifecycle + '</span></div>' +
      '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:10.5px;color:rgba(238,241,251,0.5);margin-top:5px">' + fm.label.replace(/s$/, "").toUpperCase() + ' \u00b7 ' + lwE(r.id) + '</div></div><div class="pdb">';
    // warnings
    if (r._warn.length) {
      h += '<div class="box" style="background:rgba(255,158,87,0.05);border:1px solid rgba(255,158,87,0.3)"><div style="font-size:10.5px;font-weight:600;color:#ffb27a;margin-bottom:8px">\u26a0 PROJECTION WARNINGS</div>';
      r._warn.forEach(function (w) { h += '<div class="step"><span class="dt" style="background:' + w.color + ';box-shadow:0 0 6px ' + w.color + '"></span><div><div style="font-size:11.5px;font-weight:600;color:' + w.color + '">' + lwE(w.label) + '</div><div style="font-size:11px;line-height:1.45;color:rgba(238,241,251,0.6)">' + lwE(w.note) + '</div></div></div>'; });
      h += '</div>';
    }
    // confidence
    if (conf != null) {
      h += '<div class="sec"><div style="display:flex;align-items:center;gap:9px"><span style="font-size:9.5px;color:rgba(238,241,251,0.45)">canonical confidence</span><div style="flex:1;height:6px;border-radius:4px;background:rgba(255,255,255,0.08);overflow:hidden"><div style="height:100%;width:' + Math.round(conf * 100) + '%;background:' + lwConf(conf) + ';box-shadow:0 0 8px ' + lwConf(conf) + '"></div></div><span style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:' + lwConf(conf) + '">' + conf.toFixed(2) + '</span></div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9.5px;color:rgba(238,241,251,0.4);margin-top:6px">time window \u00b7 ' + lwE(r.window || "\u2014") + '</div></div>';
    }
    // contradiction
    if (r.contradiction) {
      var a = r.contradiction.a, b = r.contradiction.b;
      h += '<div class="box" style="background:rgba(255,107,94,0.06);border:1px solid rgba(255,107,94,0.3)"><div style="font-size:10.5px;font-weight:600;margin-bottom:9px">\u25c8 CONTRADICTORY SIGNALS</div><div style="display:flex;gap:9px">' +
        '<div style="flex:1;border-radius:9px;border:1px solid ' + a.color + ';padding:8px"><div style="font-size:9.5px;color:rgba(238,241,251,0.55)">' + lwE(a.label) + '</div><div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;font-weight:600;color:' + a.color + '">' + lwE(a.val) + '</div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;color:rgba(238,241,251,0.4)">' + lwE(a.conf) + '</div></div>' +
        '<div style="flex:1;border-radius:9px;border:1px solid ' + b.color + ';padding:8px"><div style="font-size:9.5px;color:rgba(238,241,251,0.55)">' + lwE(b.label) + '</div><div style="font-family:\'Space Grotesk\',sans-serif;font-size:15px;font-weight:600;color:' + b.color + '">' + lwE(b.val) + '</div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;color:rgba(238,241,251,0.4)">' + lwE(b.conf) + '</div></div>' +
        '</div><div style="font-size:10.5px;color:rgba(238,241,251,0.55);margin-top:8px;line-height:1.45">' + lwE(r.contradiction.note) + '</div></div>';
    }
    // sources
    h += '<div class="sec"><div class="sl">SOURCE TRACE</div>';
    if (r.sources.length) { r.sources.forEach(function (s) { var kc = lwKind(s.kind); h += '<div class="src"><span class="sk" style="color:' + kc + ';border:1px solid ' + lwA(kc, 0.4) + '">' + lwE(s.kind) + '</span><span class="sn">' + lwE(s.name) + '</span><span class="si" style="color:' + (s.integrity != null ? lwConf(s.integrity) : "#888") + '">intg ' + (s.integrity != null ? s.integrity.toFixed(2) : "\u2014") + '</span></div>'; }); }
    else { h += '<div style="font-size:11px;line-height:1.45;color:rgba(255,158,87,0.85);background:rgba(255,158,87,0.06);border:1px solid rgba(255,158,87,0.28);border-radius:9px;padding:9px 11px">No source is attached. Shown \u2014 flagged \u2014 but uncorroborated. Lightweave never invents one to fill the gap.</div>'; }
    h += '</div>';
    // reasoning
    if (r.reasoning.length) { h += '<div class="sec"><div class="sl">REASONING PATH</div>'; r.reasoning.forEach(function (s) { h += '<div class="step"><span class="dt" style="background:#9b8cff;box-shadow:0 0 7px #9b8cff"></span><span class="tx">' + lwE(s) + '</span></div>'; }); h += '</div>'; }
    // canonical fallback
    h += '<div class="box" style="background:rgba(0,0,0,0.24);border:1px solid rgba(255,255,255,0.09)"><div data-act="toggle-raw" style="display:flex;align-items:center;gap:8px;cursor:pointer"><span style="font-family:\'IBM Plex Mono\',monospace;font-size:9.5px;letter-spacing:0.13em;color:rgba(238,241,251,0.42)">CANONICAL FALLBACK</span><span style="flex:1"></span><span style="font-family:\'IBM Plex Mono\',monospace;font-size:10px;color:#34e1b4">' + (P.raw ? "\u2212 hide fields" : "+ show fields") + '</span></div><div style="margin-top:10px">' +
      '<div class="kv"><span class="k">truth.mode</span><span class="v" style="color:' + fm.color + '">' + lwE(r.truthMode || "\u2014") + '</span></div>' +
      '<div class="kv"><span class="k">resolver</span><span class="v">' + lwE(r.resolver || "\u2014") + '</span></div>' +
      '<div class="kv"><span class="k">records used</span><span class="v">' + lwE(r.recordsUsed != null ? r.recordsUsed : "\u2014") + '</span></div>' +
      '<div class="kv"><span class="k">schema</span><span class="v">' + lwE(r.schema || "contract_v1.5") + '</span></div>' +
      '<div class="kv"><span class="k">visibility</span><span class="v" style="color:' + (sealed ? "#7fb0ff" : "rgba(238,241,251,0.85)") + '">' + lwE(r.visibility) + '</span></div></div>';
    if (P.raw) {
      h += '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.12)"><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:0.1em;color:rgba(238,241,251,0.38);margin-bottom:7px">RECORD FIELDS</div>';
      var ks = Object.keys(r.fields); if (!ks.length) h += '<div style="font-size:10.5px;color:rgba(238,241,251,0.4)">no raw fields on this record</div>';
      ks.forEach(function (k) { h += '<div class="kv"><span class="k">' + lwE(k) + '</span><span class="v">' + lwE(String(r.fields[k])) + '</span></div>'; });
      h += '</div>';
    }
    h += '</div></div></div>';
    return h;
  }
  function lwImport() {
    var ph = '[ { "id": "rec_01", "kind": "score", "subject": "Sleep quality", "value": "0.74", "confidence": 0.74, "lifecycle": "Watching", "sources": [{ "kind": "DEV", "name": "Sleep band", "integrity": 0.94 }] } ]';
    var h = '<div class="imp"><div style="font-size:12.5px;line-height:1.5;color:rgba(238,241,251,0.6)">Paste an array of records, or <span style="font-family:\'IBM Plex Mono\',monospace;color:#34e1b4">{ "records": [...] }</span>. The adapter maps what it can and flags what it can\'t \u2014 stored locally and <b style="color:rgba(238,241,251,0.85)">shared with every room</b>, never written to canon.</div>' +
      '<textarea class="ta" data-act="txt" spellcheck="false" placeholder="' + lwE(ph) + '">' + lwE(P.txt) + '</textarea>';
    if (P.err) h += '<div class="msg" style="color:#ff8a7e;background:rgba(255,107,94,0.08);border:1px solid rgba(255,107,94,0.3)">' + lwE(P.err) + '</div>';
    if (P.ok) h += '<div class="msg" style="color:#7fe0b0;background:rgba(57,224,166,0.08);border:1px solid rgba(57,224,166,0.3)">' + lwE(P.ok) + '</div>';
    h += '</div>';
    return h;
  }
  function lwRender() {
    if (!P.root) return;
    var recs = lwRecords(), imported = lwImported();
    var present = {}; recs.forEach(function (r) { present[r.kind] = true; });
    var groups = LW_FACETS.filter(function (f) { return present[f.kind]; });
    var selId = P.sel; if (!selId || !recs.some(function (r) { return r.id === selId; })) selId = recs[0] && recs[0].id;
    var sel = null; recs.forEach(function (r) { if (r.id === selId) sel = r; });
    var srcN = recs.reduce(function (a, r) { return a + r.sources.length; }, 0);
    var html = '<style>' + PANEL_CSS + '</style><div class="bk" data-act="close"><div class="cd" data-act="stop">';
    html += lwHeader(imported, recs.length, srcN);
    if (P.view === "import") {
      html += lwImport();
      html += '<div class="pf2"><span class="lnk" data-act="load-sample">paste the sample</span>' + (imported ? '<span class="lnk" data-act="restore" style="color:#ff9e87">restore sample ledger</span>' : "") + '<span style="flex:1"></span><button class="btn o" data-act="view-inspect">Cancel</button><button class="btn g" data-act="do-import">Refract it \u2192</button></div>';
    } else {
      html += '<div class="pb">' + lwList(groups, recs, selId) + lwDrawer(sel) + '</div>';
    }
    html += '<div class="foot"><span style="width:5px;height:5px;border-radius:50%;background:#39e0a6;box-shadow:0 0 7px #39e0a6"></span>this is a lens, not the ledger \u00b7 shared across every room \u00b7 records edited: 0</div>';
    html += '</div></div>';
    P.root.innerHTML = html;
  }
  function lwDoImport() {
    var txt = (P.txt || "").trim();
    if (!txt) { P.err = 'Nothing to import. Paste a JSON array or { "records": [...] }.'; P.ok = ""; lwRender(); return; }
    var data; try { data = JSON.parse(txt); } catch (e) { P.err = "That is not valid JSON: " + e.message; P.ok = ""; lwRender(); return; }
    var recs = Array.isArray(data) ? data : (data && Array.isArray(data.records) ? data.records : null);
    if (!recs) { P.err = 'Expected an array of records, or { "records": [...] }.'; P.ok = ""; lwRender(); return; }
    if (!recs.length) { P.err = "The ledger is empty \u2014 no records to refract."; P.ok = ""; lwRender(); return; }
    var bad = -1; for (var i = 0; i < recs.length; i++) { if (!recs[i] || typeof recs[i] !== "object") { bad = i; break; } }
    if (bad >= 0) { P.err = "Record at index " + bad + " is not an object."; P.ok = ""; lwRender(); return; }
    window.LWLedger.set(recs, { importedAt: Date.now(), count: recs.length });
    P.err = ""; P.ok = "Imported " + recs.length + " records \u2014 now shared with every room."; P.view = "inspect"; P.sel = null; lwRender();
  }
  function lwPanelClick(e) {
    var t = e.target.closest("[data-act]"); if (!t) return;
    var act = t.getAttribute("data-act");
    if (act === "stop") return;
    if (act === "close") { lwCloseLedger(); return; }
    if (act === "view-import") { P.view = "import"; P.err = ""; P.ok = ""; lwRender(); return; }
    if (act === "view-inspect") { P.view = "inspect"; lwRender(); return; }
    if (act === "select") { P.sel = t.getAttribute("data-id"); lwRender(); return; }
    if (act === "toggle-raw") { P.raw = !P.raw; lwRender(); return; }
    if (act === "do-import") { lwDoImport(); return; }
    if (act === "load-sample") { P.txt = JSON.stringify({ records: window.LW_SAMPLE }, null, 2); P.err = ""; P.ok = ""; lwRender(); return; }
    if (act === "restore") { window.LWLedger.clear(); P.txt = ""; P.err = ""; P.ok = ""; P.view = "inspect"; P.sel = null; lwRender(); return; }
  }
  function lwPanelInput(e) { var t = e.target.closest("[data-act='txt']"); if (t) P.txt = t.value; }
  function lwOpenLedger() {
    if (!P.host) {
      P.host = document.createElement("div"); P.host.id = "lw-ledger-host";
      document.body.appendChild(P.host); P.root = P.host.attachShadow({ mode: "open" });
      P.root.addEventListener("click", lwPanelClick);
      P.root.addEventListener("input", lwPanelInput);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && P.host && P.host.style.display !== "none") lwCloseLedger(); });
    }
    P.host.style.display = "block"; P.view = "inspect"; P.err = ""; P.ok = ""; lwRender();
  }
  function lwCloseLedger() { if (P.host) P.host.style.display = "none"; }
  window.LW_openLedger = lwOpenLedger;

  /* ---- <lw-rail active="slug" accent="#hex"> ----------------------------- */
  var MARK = '<svg width="22" height="22" viewBox="0 0 28 28" aria-hidden="true">' +
    '<polygon points="14,3 25,23 3,23" fill="none" stroke="var(--rail-accent)" stroke-width="1.6"></polygon>' +
    '<line x1="2" y1="14" x2="14" y2="13" stroke="#fff" stroke-width="1.4"></line>' +
    '<line x1="14" y1="13" x2="26" y2="8" stroke="#34e1b4" stroke-width="1.2"></line>' +
    '<line x1="14" y1="13" x2="26" y2="14" stroke="#ff9e57" stroke-width="1.2"></line>' +
    '<line x1="14" y1="13" x2="26" y2="20" stroke="#ff7ad0" stroke-width="1.2"></line></svg>';

  var RAIL_CSS =
    ':host{display:flex;flex-direction:column;height:100%;min-height:0;font-family:"IBM Plex Sans",system-ui,sans-serif;--rail-accent:#9b8cff;}' +
    '.hd{flex:0 0 auto;display:flex;align-items:center;gap:9px;padding:13px 13px 11px;border-bottom:1px solid rgba(255,255,255,0.06);text-decoration:none;color:inherit;}' +
    '.hd:hover .wm{color:#fff;}' +
    '.wm{font-family:"Space Grotesk",sans-serif;font-weight:600;letter-spacing:0.14em;font-size:12px;color:rgba(238,241,251,0.86);transition:color .12s;}' +
    '.wm small{display:block;font-family:"IBM Plex Mono",monospace;font-weight:400;letter-spacing:0.04em;font-size:8.5px;color:rgba(238,241,251,0.4);margin-top:2px;}' +
    '.lbl{font-family:"IBM Plex Mono",monospace;font-size:9.5px;letter-spacing:0.16em;color:rgba(238,241,251,0.34);padding:11px 14px 6px;}' +
    '.list{flex:1;min-height:0;overflow-y:auto;padding:0 8px 8px;}' +
    '.list::-webkit-scrollbar{width:8px;}' +
    '.list::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:8px;}' +
    '.grp{display:flex;align-items:center;gap:7px;padding:11px 6px 5px;}' +
    '.grp .sq{width:8px;height:8px;border-radius:2px;}' +
    '.grp .gt{font-family:"Space Grotesk",sans-serif;font-size:10.5px;font-weight:600;color:rgba(238,241,251,0.62);}' +
    'a.rm{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:9px;text-decoration:none;color:rgba(238,241,251,0.6);transition:background .1s,color .1s;}' +
    'a.rm:hover{background:rgba(255,255,255,0.045);color:rgba(238,241,251,0.92);}' +
    'a.rm .dot{width:7px;height:7px;border-radius:2px;background:rgba(238,241,251,0.3);flex:0 0 auto;}' +
    'a.rm .nm{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    'a.rm .ex{margin-left:auto;font-family:"IBM Plex Mono",monospace;font-size:7.5px;letter-spacing:0.08em;color:#ffce5a;border:1px solid rgba(255,206,90,0.4);border-radius:4px;padding:1px 4px;}' +
    'a.rm.active{background:rgba(255,255,255,0.06);color:#fff;box-shadow:inset 2px 0 0 var(--rail-accent);}' +
    'a.rm.active .dot{background:var(--rail-accent);box-shadow:0 0 7px var(--rail-accent);}' +
    'a.rm.active .nm{font-weight:600;}' +
    '.note{flex:0 0 auto;margin:8px;padding:10px 12px;border-radius:11px;background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);}' +
    '.note .nt{font-family:"IBM Plex Mono",monospace;font-size:8.5px;letter-spacing:0.14em;color:rgba(238,241,251,0.4);margin-bottom:5px;}' +
    '.note .nb{font-size:10.5px;line-height:1.45;color:rgba(238,241,251,0.62);}' +
    '.note .nb b{color:var(--rail-accent);font-weight:600;}' +
    '.ldg{flex:0 0 auto;display:flex;align-items:center;gap:9px;margin:8px 8px 4px;padding:9px 11px;border-radius:11px;cursor:pointer;background:linear-gradient(135deg,rgba(155,140,255,0.16),rgba(52,225,180,0.09));border:1px solid var(--rail-accent);color:rgba(238,241,251,0.92);font-family:inherit;text-align:left;transition:transform .1s,background .12s;}' +
    '.ldg:hover{background:linear-gradient(135deg,rgba(155,140,255,0.26),rgba(52,225,180,0.15));}' +
    '.ldg:active{transform:translateY(1px);}' +
    '.ldg .li{display:flex;align-items:center;}' +
    '.ldg .lt{font-family:"Space Grotesk",sans-serif;font-size:12px;font-weight:600;flex:1;}' +
    '.ldg .lc{font-family:"IBM Plex Mono",monospace;font-size:8.5px;color:var(--rail-accent);white-space:nowrap;}';

  function buildRail(host) {
    var active = host.getAttribute("active") || "";
    var accent = host.getAttribute("accent");
    var root = host.shadowRoot || host.attachShadow({ mode: "open" });
    var actRoom = window.LW_ROOM_BY_SLUG[active];
    var railAccent = accent || (actRoom && actRoom.color) || "#9b8cff";

    var html = '<style>' + RAIL_CSS + '</style>';
    html += '<a class="hd" href="' + window.LW_homeHref + '" title="Back to the front door">' + MARK +
      '<span class="wm">LIGHTWEAVE<small>one truth · many windows</small></span></a>';
    html += '<div class="lbl">PROJECTIONS</div>';
    html += '<div class="list">';
    GROUPS.forEach(function (g) {
      var rooms = ROOMS.filter(function (r) { return r.group === g.key; });
      if (!rooms.length) return;
      html += '<div class="grp"><span class="sq" style="background:' + g.color + ';box-shadow:0 0 7px ' + g.color + '"></span>' +
        '<span class="gt">' + g.title + '</span></div>';
      rooms.forEach(function (r) {
        var isAct = r.slug === active;
        html += '<a class="rm' + (isAct ? " active" : "") + '" href="' + window.LW_roomHref(r.slug) + '"' +
          (isAct ? ' style="--rail-accent:' + railAccent + '"' : "") + ' title="' + (r.blurb || r.name).replace(/"/g, "&quot;") + '">' +
          '<span class="dot"' + (isAct ? "" : ' style="background:' + g.color + ';opacity:.55"') + '></span>' +
          '<span class="nm">' + r.name + '</span>' +
          (r.exp ? '<span class="ex">EXP</span>' : "") + '</a>';
      });
    });
    html += '</div>';
    var led = window.LWLedger.records();
    var imp = led && led.length;
    var lcnt = imp ? led.length : (window.LW_SAMPLE ? window.LW_SAMPLE.length : 0);
    html += '<button class="ldg" data-lw-ledger style="--rail-accent:' + railAccent + '" title="Import &amp; refract a ledger \u2014 shared with every room">' +
      '<span class="li"><svg width="16" height="16" viewBox="0 0 24 24"><polygon points="11,5 19,18 3,18" fill="none" stroke="var(--rail-accent)" stroke-width="1.5"></polygon><line x1="1" y1="12" x2="11" y2="12" stroke="#fff" stroke-width="1.3"></line><line x1="11" y1="12" x2="22" y2="8" stroke="#34e1b4" stroke-width="1.1"></line><line x1="11" y1="12" x2="22" y2="15" stroke="#ff9e57" stroke-width="1.1"></line></svg></span>' +
      '<span class="lt">Open ledger</span>' +
      '<span class="lc">' + lcnt + ' ' + (imp ? 'imported' : 'sample') + '</span></button>';
    html += '<div class="note" style="--rail-accent:' + railAccent + '"><div class="nt">DOWNSTREAM OF TRUTH</div>' +
      '<div class="nb">Every room reads one ledger. A lens changes the <b>view</b>, never the facts. ' +
      'Records edited: <b>0</b>.</div></div>';
    root.innerHTML = html;
    var lb = root.querySelector('[data-lw-ledger]');
    if (lb) lb.addEventListener('click', function () { if (window.LW_openLedger) window.LW_openLedger(); });
  }

  var LWRail = (function () {
    function defineRail() {
      if (customElements.get("lw-rail")) return;
      class LWRail extends HTMLElement {
        connectedCallback() {
          buildRail(this);
          var self = this;
          if (window.LWLedger && window.LWLedger.subscribe) this._un = window.LWLedger.subscribe(function () { buildRail(self); });
        }
        disconnectedCallback() { if (this._un) this._un(); }
        attributeChangedCallback() { if (this.shadowRoot) buildRail(this); }
        static get observedAttributes() { return ["active", "accent"]; }
      }
      customElements.define("lw-rail", LWRail);
    }
    defineRail();
    return defineRail;
  })();
})();
