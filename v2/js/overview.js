/*
 * OVERVIEW PAGE CONTENT — edit the text here to change the Overview tab.
 * Each topic opens and closes when clicked. `body` items can be:
 *   "a paragraph of text"
 *   { list: ["item", "item"] }
 *   { def: "Term", text: "definition", source: "where it comes from" }
 *   { links: [["Label", "https://..."], ...] }
 * The scenarios, risk diagram and process steps are drawn from the data further down.
 */
window.OVERVIEW = {
  title: "Overview: climate change and adaptation planning",
  intro: "This page explains the key ideas behind the tool and shows a worked example. Open any topic to read more, or go straight to the Start tab to begin your own plan.",

  /* Photos: put image files in the app/photos folder using these names.
     Until a file exists, a placeholder is shown in its place. Landscape photos work best (about 1600 x 900). */
  photos: {
    hero: "photos/hero.jpg",
    "climate-change": "photos/topic-climate-change.jpg",
    hazards: "photos/topic-hazards.jpg",
    risk: "photos/topic-risk.jpg",
    scenarios: "photos/topic-scenarios.jpg",
    process: "photos/topic-process.jpg",
    example: "photos/example-flying-fox.jpg"
  },
  // Drawn illustrations shown until the matching photo above is added.
  illustrations: {
    hero: "illustrations/hero.svg",
    "climate-change": "illustrations/topic-climate-change.svg",
    hazards: "illustrations/topic-hazards.svg",
    risk: "illustrations/topic-risk.svg",
    scenarios: "illustrations/topic-scenarios.svg",
    example: "illustrations/example-flying-fox.svg"
  },

  hero: {
    title: "Planning for a changing climate",
    subtitle: "A step-by-step tool to help land managers, rangers and communities plan climate adaptation for the species and places they care for.",
    primary: "Start your plan",
    secondary: "See a worked example"
  },

  band: {
    title: "Climate science informing adaptation for species and places",
    paragraphs: [
      "Climate change is already affecting plants and animals across Australia, through heatwaves, drought, more intense storms and cyclones, rising seas, changing rainfall and fire.",
      "This tool helps you assess the climate risks for a species at your site, compare actions, and build a plan that says what to do now, what to do later, and when to change course."
    ]
  },


  /* "Where to get climate data" guide.
     The image (photos/data-portal-guide-v2.jpg) shows global -> national -> regional projections.
     Pins: Global on the globe, Australia on the national map, and each state/territory on the regional map.
     x and y are the pin position as a percentage of the image width and height. */
  dataSources: {
    heading: "Where to get climate data for your site",
    intro: "Climate projections start from global climate models, which are refined to national and then regional scale. Click a pin to open a data portal: the globe for global models, Australia for national projections, or a state or territory on the regional map.",
    image: "photos/data-portal-guide-v2.jpg",
    alt: "Data portal guide: global climate models are refined to national-scale and then regional-scale projections for Australia.",
    pins: [
      { code: "Global", name: "IPCC Interactive Atlas (global climate models)", url: "https://interactive-atlas.ipcc.ch/", x: 17.08, y: 70.76, kind: "global" },
      { code: "Australia", name: "Climate Change in Australia (CSIRO and Bureau of Meteorology)", url: "https://www.climatechangeinaustralia.gov.au/en/", x: 50.07, y: 67.78, kind: "national" },
      { code: "WA", name: "WA Climate Projections", url: "https://www.wa.gov.au/government/publications/climate-risk-assessment-tool", x: 75.73, y: 69.09 },
      { code: "NT", name: "Northern Territory: no territory-specific portal – use Climate Change in Australia", url: "https://www.climatechangeinaustralia.gov.au/en/", x: 82.27, y: 59.03 },
      { code: "SA", name: "SA Climate Projections Viewer", url: "https://www.environment.sa.gov.au/climate-viewer/details/", x: 83.21, y: 71.69 },
      { code: "QLD", name: "Queensland Future Climate Dashboard (Long Paddock)", url: "https://longpaddock.qld.gov.au/qld-future-climate/dashboard/", x: 88.23, y: 62.94 },
      { code: "NSW", name: "NSW climate data – NARCliM through AdaptNSW", url: "https://www.climatechange.environment.nsw.gov.au/narclim/narclim-products-and-data", x: 89.15, y: 76.16 },
      { code: "ACT", name: "ACT climate data – NARCliM through AdaptNSW", url: "https://www.climatechange.environment.nsw.gov.au/narclim/narclim-products-and-data", x: 90.75, y: 81.56, small: true },
      { code: "VIC", name: "Victoria’s Future Climate Tool", url: "https://vicfutureclimatetool.indraweb.io/cmip6/", x: 87.75, y: 85.85 },
      { code: "TAS", name: "Tasmania climate projections (new release due 2027)", url: "https://www.recfit.tas.gov.au/what_is_recfit/climate_change/adapting/projected_impacts", x: 89.61, y: 94.04 }
    ],
    // Listed under the image as cards (also the accessible / mobile-friendly version of the pins)
    groups: [
      { title: "Global", text: "Global climate models (CMIP) used by all Australian projections.", links: [
        ["IPCC Interactive Atlas", "https://interactive-atlas.ipcc.ch/"] ] },
      { title: "National", text: "Australia-wide projections and hazard information.", links: [
        ["Climate Change in Australia", "https://www.climatechangeinaustralia.gov.au/en/"],
        ["Australian Climate Service – National Hazards Viewer and NCRA reports", "https://www.acs.gov.au/pages/data-explorer"],
        ["MyClimateView (for farm businesses)", "https://myclimateview.com.au/"] ] },
      { title: "States and territories", text: "Regional (downscaled) projections at 4–5 km resolution.", links: [
        ["Queensland – Future Climate Dashboard", "https://longpaddock.qld.gov.au/qld-future-climate/dashboard/"],
        ["NSW and ACT – NARCliM (AdaptNSW)", "https://www.climatechange.environment.nsw.gov.au/narclim/narclim-products-and-data"],
        ["Victoria – Future Climate Tool", "https://vicfutureclimatetool.indraweb.io/cmip6/"],
        ["South Australia – Climate Projections Viewer", "https://www.environment.sa.gov.au/climate-viewer/details/"],
        ["Western Australia – Climate Projections", "https://www.wa.gov.au/government/publications/climate-risk-assessment-tool"],
        ["Tasmania – climate projections (release 2027)", "https://www.recfit.tas.gov.au/what_is_recfit/climate_change/adapting/projected_impacts"],
        ["Northern Territory – use national data (Climate Change in Australia)", "https://www.climatechangeinaustralia.gov.au/en/"] ] }
    ],
    credit: "Portal list based on “Where did my climate projections come from?” (National Partnership for Climate Projections and NESP Climate Systems Hub, May 2026). Map pins are approximate."
  },

  topicsHeading: "Understanding climate change",
  topicsIntro: "Choose a topic to learn the key ideas used in the tool.",
  processHeading: "How adaptation planning works",
  processIntro: "The tool follows eight steps. Click a step to find out what it involves.",
  exampleHeading: "Worked example",
  resourcesHeading: "Resources",

  resources: [
    { title: "IPCC Sixth Assessment Report – Synthesis Report", text: "The most comprehensive summary of global climate change science, impacts and responses.", url: "https://www.ipcc.ch/report/ar6/syr/" },
    { title: "IPCC AR6 Working Group II, Chapter 11 – Australasia", text: "Climate impacts, adaptation and vulnerability for Australia and New Zealand.", url: "https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-11/" },
    { title: "State of the Climate (CSIRO and Bureau of Meteorology)", text: "How Australia’s climate has changed and is projected to change.", url: "https://www.csiro.au/en/research/environmental-impacts/climate-change/state-of-the-climate" },
    { title: "Climate Change in Australia", text: "National climate projections, data and guidance for regions across Australia.", url: "https://www.climatechangeinaustralia.gov.au/en/" },
    { title: "Australian Climate Service \u2013 data explorer", text: "National hazard information and climate data.", url: "https://www.acs.gov.au/pages/data-explorer" },
    { title: "IPCC glossary", text: "Definitions of climate terms, including vulnerability and adaptive capacity.", url: "https://apps.ipcc.ch/glossary/" }
  ],

  // Shown in the footer band. Please confirm the wording with partners.
  acknowledgement: "We acknowledge the Traditional Owners of the lands, waters and sea Country across Australia, and pay our respects to Elders past and present. We recognise their continuing connection to Country and their knowledge of caring for it through changing times.",
  footerNote: "",

  topics: [
    {
      id: "climate-change",
      title: "What is climate change?",
      blurb: "Why the climate is changing and what it means for species and places.",
      body: [
        "Climate change is a long-term shift in temperature and weather patterns. Since the industrial revolution, burning fossil fuels and clearing land have increased greenhouse gases in the atmosphere, which trap heat and warm the planet.",
        { list: [
          "Global surface temperature in 2011–2020 was about 1.1°C warmer than in 1850–1900 (IPCC AR6).",
          "Australia has warmed by about 1.5°C since national records began in 1910 (CSIRO and Bureau of Meteorology, State of the Climate 2024).",
          "Warming brings more frequent and intense hot extremes, changes in rainfall, rising seas, and more dangerous fire weather."
        ] },
        "These changes hit hardest for species that live within narrow temperature ranges, depend on seasonal food or reliable water, or roost and breed in exposed places.",
        { links: [
          ["IPCC Sixth Assessment Report – Synthesis Report", "https://www.ipcc.ch/report/ar6/syr/"],
          ["State of the Climate (CSIRO and Bureau of Meteorology)", "https://www.csiro.au/en/research/environmental-impacts/climate-change/state-of-the-climate"],
          ["Climate Change in Australia", "https://www.climatechangeinaustralia.gov.au/en/"]
        ] }
      ]
    },
    {
      id: "hazards",
      title: "What are climate hazards?",
      blurb: "Heatwaves, cyclones, drought, flood, fire and rising seas.",
      body: [
        "A climate hazard is a climate-related event or trend that could cause harm. The tool asks you to consider these hazards:",
        { def: "Increased temperature", icon: true, text: "A gradual rise in average temperatures. Species may lose cool habitat, especially at lower elevations." },
        { def: "Heatwaves, hot days and hot nights", icon: true, text: "Periods of unusually high temperatures. Hot nights matter because animals cannot cool down and recover overnight." },
        { def: "Cyclones", icon: true, text: "Severe tropical cyclones are expected to become more intense, even if not more frequent. They strip canopies, fruit and flowers." },
        { def: "Drought", icon: true, text: "Long periods with little rain, reducing water, food and habitat condition." },
        { def: "Flood", icon: true, text: "More intense heavy rainfall can flood habitat, drown nests and burrows, and spread weeds." },
        { def: "Sea level rise", icon: true, text: "Rising seas and higher storm surges affect mangroves, coastal wetlands and low-lying habitat." },
        { def: "Fire", icon: true, text: "Hotter, drier conditions extend the fire season and allow fire to reach fire-sensitive vegetation, such as rainforest and alpine areas, that rarely burned before." },
        { links: [
          ["Hazard maps – Queensland Future Climate Dashboard (Long Paddock)", "https://www.longpaddock.qld.gov.au/qld-future-climate/dashboard-cmip6/"],
          ["Interactive climate map", "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30"],
          ["Bureau of Meteorology heatwave service", "http://www.bom.gov.au/australia/heatwave/"]
        ] }
      ]
    },
    {
      id: "risk",
      title: "Risk, exposure, vulnerability and adaptive capacity",
      blurb: "The building blocks of a climate risk assessment.",
      riskDiagram: true,
      body: [
        "The IPCC describes climate risk as coming from three things together: the hazard, exposure to it, and vulnerability.",
        { figure: "illustrations/risk-infographic.svg", alt: "Infographic: climate risk comes from hazard, exposure and vulnerability. Vulnerability combines sensitivity and adaptive capacity. Adaptation reduces risk by reducing exposure, reducing sensitivity or building adaptive capacity." },
        { def: "Vulnerability", text: "The tendency to be harmed. It includes sensitivity (how strongly the species is affected) and a lack of capacity to cope and adapt.", source: "Based on the IPCC AR6 glossary" },
        { def: "Adaptive capacity", text: "The ability of a species, ecosystem or community to adjust to change, cope with the consequences, or take advantage of opportunities. For a species this includes moving to cooler places, switching food, or recovering numbers quickly.", source: "Based on the IPCC AR6 glossary" },
        "In this tool, exposure is recorded in the Exposure column of the Risk assessment, sensitivity in “How is the species impacted”, and adaptive capacity in “Ability to adapt”.",
        { links: [
          ["IPCC glossary", "https://apps.ipcc.ch/glossary/"],
          ["IPCC AR6 Working Group II – Impacts, Adaptation and Vulnerability", "https://www.ipcc.ch/report/ar6/wg2/"],
          ["IPCC AR6 WGII Chapter 11 – Australasia", "https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-11/"]
        ] }
      ]
    },
    {
      id: "scenarios",
      title: "Climate scenarios: SSPs and future pathways",
      blurb: "How much warming different emission futures bring.",
      scenarioExplorer: true,
      body: [
        "Nobody knows exactly how much greenhouse gas the world will emit, so scientists use scenarios. The latest IPCC scenarios are called Shared Socioeconomic Pathways (SSPs). Each name combines a story about how society develops (SSP1–5) with how much extra heat is trapped by 2100 (e.g. 2.6 or 8.5 watts per square metre).",
        "Click a scenario below to see the warming it leads to. Hazard maps let you choose a scenario and a time period (e.g. 2030, 2050, 2070). For planning, it is good practice to look at a middle scenario and a high one, so your plan holds up across a range of futures.",
        { links: [
          ["IPCC AR6 Working Group I – Summary for Policymakers", "https://www.ipcc.ch/report/ar6/wg1/chapter/summary-for-policymakers/"],
          ["IPCC AR6 Working Group I – The Physical Science Basis", "https://www.ipcc.ch/report/ar6/wg1/"]
        ] }
      ]
    },
    {
      id: "process",
      title: "The adaptation planning process",
      blurb: "The eight steps this tool walks you through.",
      processSteps: true,
      body: [
        "Adaptation planning works through a set of steps, from understanding the species and site to deciding what to do now and what to do later. Each step below is a tab in this tool; click a step to go there."
      ]
    }
  ],

  // Warming for 2081–2100 relative to 1850–1900: best estimate and very likely range (IPCC AR6 WGI SPM, Table SPM.1)
  scenarios: [
    { id: "SSP1-1.9", name: "Very low emissions", best: 1.4, low: 1.0, high: 1.8,
      text: "Emissions fall rapidly to net zero around 2050. Warming peaks then declines slightly. Consistent with the Paris Agreement 1.5°C goal." },
    { id: "SSP1-2.6", name: "Low emissions", best: 1.8, low: 1.3, high: 2.4,
      text: "Emissions decline to net zero after 2050. Warming stays well below 2°C." },
    { id: "SSP2-4.5", name: "Intermediate emissions", best: 2.7, low: 2.1, high: 3.5,
      text: "Emissions stay around current levels until mid-century, then fall. Often used as a “middle of the road” planning scenario." },
    { id: "SSP3-7.0", name: "High emissions", best: 3.6, low: 2.8, high: 4.6,
      text: "Emissions roughly double by 2100. Useful for testing whether a plan still works under strong warming." },
    { id: "SSP5-8.5", name: "Very high emissions", best: 4.4, low: 3.3, high: 5.7,
      text: "Emissions roughly double by 2050. A high-end scenario for stress-testing plans." }
  ],
  scenarioSource: "Warming in 2081–2100 compared with 1850–1900. Best estimate, with the very likely range in brackets. Source: IPCC AR6 Working Group I, Summary for Policymakers, Table SPM.1.",

  riskParts: [
    { id: "hazard", label: "Hazard", text: "A climate event or trend that could cause harm, e.g. a heatwave or severe cyclone." },
    { id: "exposure", label: "Exposure", text: "Whether the species or its habitat is in a place where the hazard occurs, e.g. a roost in a location that reaches 42°C." },
    { id: "vulnerability", label: "Vulnerability", text: "How easily the species is harmed: its sensitivity, minus its ability to cope and adapt (adaptive capacity)." }
  ],

  /* Steps of the planning process. Clicking a step card opens its details below the cards.
     about = what the step is for; doing = what you will do; tip = practical advice. */
  steps: [
    { tab: "species", label: "Understand the species", text: "What it needs, why it matters, its conservation status.",
      about: "Everything else in the plan builds on a clear picture of the species. Knowing what it needs to survive (food, water, shelter, breeding sites and a suitable temperature range) shows where climate change is likely to hurt it.",
      doing: ["Record the common and scientific name, and the population if relevant.", "Describe its habitat, diet, home range and breeding needs.", "Note why it matters: ecologically, culturally and to the community.", "Check its federal and state or territory conservation status.", "List any existing monitoring."],
      tip: "Recovery plans and conservation advice are the best starting point. Traditional Owners and long-term landholders often hold knowledge that is not written down anywhere." },
    { tab: "site", label: "Describe the site", text: "Location, environment, people and existing plans.",
      about: "Climate risk depends on place. The same species can be safe in a cool, well-connected gully and highly exposed on a cleared, sunny edge. Describing the site also records who is involved and what is already planned.",
      doing: ["Record the location, property and contact details.", "Describe the vegetation, landform, water and surrounding land use.", "List sightings, existing plans and monitoring.", "Set up photo monitoring points.", "Note seasonal events that affect timing."],
      tip: "Look for features that could buffer climate impacts, such as cool refuges, permanent water and connected habitat, as well as features that increase risk." },
    { tab: "risk", label: "Assess climate risk", text: "Exposure, sensitivity and ability to adapt for each hazard; set priorities.",
      about: "This is the core of the plan. For each climate hazard, you work out whether the site is exposed, how badly the species would be affected, and how well it can cope. Together these give a priority for each hazard.",
      doing: ["Check the hazard maps and climate data for your site, now and in future.", "Describe how each hazard affects the species (sensitivity).", "Describe how well the species can cope or move (adaptive capacity).", "Rate each hazard from Very low to Very high."],
      tip: "Look at a middle and a high emissions scenario, and a near and a more distant time period, so the plan holds up across a range of futures." },
    { tab: "actions", label: "Identify actions", text: "What is already happening and what else could be done.",
      about: "With the priority hazards known, list what is already being done that helps, and what else could reduce the risk. Good adaptation actions reduce exposure, reduce sensitivity, or help the species adapt, for example by protecting cool refuges or reconnecting habitat.",
      doing: ["List existing actions and how each one helps.", "Brainstorm potential new actions for the High and Very high hazards.", "Say which hazard each action addresses."],
      tip: "Include actions for other threats (weeds, predators, clearing) where they make the species more resilient to climate hazards. List options even if they seem hard; the next step compares them." },
    { tab: "scoring", label: "Compare actions", text: "Culturally acceptable first, then score feasibility, cost, effectiveness and more.",
      about: "Not every action is equally useful, affordable or appropriate. Scoring gives a structured way to compare options and talk them through as a group.",
      doing: ["Check with Traditional Owners whether each action is culturally acceptable. Only acceptable actions go on to be scored.", "Score each action 0–3 on ability to implement, cost, feasibility, effectiveness, social acceptability, risk of negative consequences and co-benefits.", "Compare the totals out of 21."],
      tip: "Scores guide the discussion; they do not make the decision. Watch for maladaptation: actions that seem helpful now but increase risk later." },
    { tab: "pathway", label: "Plan pathways", text: "Decide what to do now and later, with triggers, turning points and stopping points.",
      about: "Climate change is uncertain, so a good plan does not lock in one course of action. Adaptation pathways set out what to do now, what to keep ready for later, and the signals that tell you when to start, change or stop each action.",
      doing: ["Choose which actions to carry forward and whether each starts Now or Later.", "Set short-term and long-term goals.", "Define the trigger to start, the turning point to improve or add an action, and the stopping point."],
      tip: "Triggers and turning points work best when someone is already monitoring them, for example a heatwave warning or an annual survey count." },
    { tab: "summary", label: "Summarise", text: "A one-page summary poster with a species photo.",
      about: "The summary page is often the only page people read. It brings the key hazards, impacts, goals, triggers and actions together on one page with a photo of the species.",
      doing: ["Use “Draft from earlier tabs” to fill the boxes automatically.", "Edit the text into short, clear points.", "Upload a species photo and add a credit."],
      tip: "Write for landholders, rangers and funders who have not seen the rest of the plan. Two to four bullet points per box is usually enough." },
    { tab: "export", label: "Share and review", text: "Download Word and PDF reports. Monitor, and review the plan every 3–5 years or after major events.",
      about: "A plan is only useful if it is shared, used and kept up to date. Export the report, agree responsibilities, and come back to it as conditions change.",
      doing: ["Download the report as Word (to keep editing) or PDF (to share).", "Save the plan file so it can be reopened and updated.", "Monitor the triggers and turning points you set.", "Review the plan every 3–5 years, or after a major event such as a severe heatwave, cyclone, fire or flood."],
      tip: "Store the plan file somewhere shared, so the next person can pick it up and update it." }
  ],

  example: {
    title: "Worked example: Spectacled flying-fox",
    intro: "This case study shows a completed plan for an illustrative spectacled flying-fox roost in the Cairns region of north Queensland. It covers two priority hazards (heatwaves and cyclones), existing and planned actions, and pathways. The site and scores are illustrative; species facts come from published sources.",
    sources: [
      ["NESP Resilient Landscapes Hub – Predicting dangerous heat events for spectacled flying-foxes", "https://nesplandscapes.edu.au/projects/nesp-rlh/spectacled-flying-foxes/"],
      ["Bureau of Meteorology heatwave service", "http://www.bom.gov.au/australia/heatwave/"]
    ]
  }
};
