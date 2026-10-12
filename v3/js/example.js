/*
 * WORKED EXAMPLE — a complete plan for the spectacled flying-fox.
 * Shown on the Overview tab, downloadable as Word/PDF, and loadable into the tool.
 * It uses the same structure as a saved plan file, so it can be edited the same way.
 * Site details and scores are illustrative. Species facts:
 *   - Endangered under the EPBC Act (uplisted Feb 2019) and Qld Nature Conservation Act 1992.
 *   - ~23,000 died in the Cairns region heatwave of 26–27 Nov 2018 (>42°C two days in a row),
 *     about one third of the Australian population.
 */
window.EXAMPLE_PLAN = {
  version: 1,
  start: {
    planTitle: "Spectacled flying-fox climate adaptation plan – example roost, Cairns region",
    planFocus: "Single species",
    purpose: "Worked example showing how to plan for heatwave and cyclone impacts on an urban spectacled flying-fox roost, and how to agree actions between council, wildlife carers, rangers and Traditional Owners.",
    preparedBy: "Worked example (illustrative)",
    organisation: "Adaptation Planning Tool",
    date: "2026-10-01"
  },
  species: {
    name: "Spectacled flying-fox (Pteropus conspicillatus)",
    habitat: "Roosts in large colonies (camps) in rainforest, mangroves, paperbark and eucalypt forest, including several urban camps in the Cairns region. Feeds at night on the nectar, pollen and fruit of rainforest, eucalypt and melaleuca trees, travelling long distances between roosts and feeding areas. Females usually raise one young a year; pups are born in late spring and depend on their mothers for several months.",
    importance: "Endangered species. Key pollinator and long-distance seed disperser for Wet Tropics rainforest. Cultural values to be confirmed with Traditional Owners.",
    epbc: "Endangered",
    qld: "Endangered",
    monitoring: "Population counts at roosts across the Wet Tropics. Wildlife carers record animals rescued during heat and food-shortage events."
  },
  site: {
    placeName: "Example urban roost, Cairns region (illustrative)",
    gps: "",
    propertyName: "Council reserve (illustrative)",
    propertyContact: "Council environment officer (illustrative)",
    environment: "Remnant paperbark and mangrove-edge vegetation of about 3 ha, surrounded by roads and houses. Canopy is patchy on the western edge, which is exposed to afternoon sun.",
    sightings: "Occupied most of the year, with numbers peaking in the wet season.",
    mgmtPlans: "Council flying-fox roost management plan. Any works in the roost need approval under Queensland flying-fox roost management rules.",
    monitoring: "Quarterly roost counts. No temperature monitoring at the roost yet.",
    photoPoints: "PP1 – western edge, bearing 90° – exposed canopy\nPP2 – roost centre, bearing 0° – main roost trees",
    reason: "Heat-stress deaths at roosts in the region in 2018, and concern that hotter summers will make extreme heat events more frequent.",
    people: "Council environment officer, wildlife carers, ranger group, Traditional Owner representative (illustrative)",
    seasonal: "Births: late spring; dependent young through summer, the hottest period.\nCyclone season: November–April.\nFood shortages possible for months after a severe cyclone."
  },
  risk: {
    hazards: [
      { id: "ex-h1", label: "Increased temperature", custom: false,
        exposure: "Yes. Average temperatures are rising and projected to keep rising.",
        impact: "Raises the baseline, so heatwaves push roost temperatures past dangerous levels more often.",
        adapt: "Limited; see Heatwaves.", priority: "High" },
      { id: "ex-h2", label: "Cyclones", custom: false,
        exposure: "Yes. The site is in the cyclone zone. Severe cyclones are projected to become more intense.",
        impact: "Severe cyclones strip flowers and fruit over large areas. After Cyclone Larry (2006), food shortages forced flying-foxes into towns and orchards in search of food, with starvation and more human–wildlife conflict. Roost trees can be damaged.",
        adapt: "Moderate. Highly mobile and can travel long distances to find food, but needs food sources that survive or recover quickly across the landscape.",
        priority: "High" },
      { id: "ex-h3", label: "Heatwaves", custom: false,
        exposure: "Yes, already present. In late November 2018, temperatures above 42°C on two consecutive days in the Cairns region killed about 23,000 spectacled flying-foxes, about one third of the Australian population. Heatwaves are projected to become more frequent and intense.",
        impact: "Flying-foxes suffer heat stress above about 42°C and can die within hours. Dependent young are most at risk, and heatwaves in late spring and summer coincide with this period. Mass deaths cut the population quickly.",
        adapt: "Low. Animals move to shaded, lower parts of trees and fan themselves, but in an exposed urban roost there are few cooler places to go. Slow breeding (one young a year) means the population recovers slowly.",
        priority: "Very high" },
      { id: "ex-h4", label: "Hot days (number of days above 35°C)", custom: false,
        exposure: "Yes. Projected to increase.", impact: "Sustained hot days add stress and lead into heatwave conditions.",
        adapt: "Low; see Heatwaves.", priority: "High" },
      { id: "ex-h5", label: "Hot nights (number of nights above 20°C)", custom: false,
        exposure: "Yes. Warm nights are already common and projected to increase.", impact: "Less relief from daytime heat.",
        adapt: "Low.", priority: "Medium" },
      { id: "ex-h6", label: "Drought (time with no rain)", custom: false,
        exposure: "Yes. Dry seasons may become longer or more variable.", impact: "Reduced flowering and fruiting can cause food stress.",
        adapt: "Moderate. Mobile, so can follow food.", priority: "Medium" },
      { id: "ex-h7", label: "Sea level rise", custom: false,
        exposure: "Partly. Mangrove-edge roost trees could be affected over the long term.", impact: "Gradual loss of some roost and feeding habitat.",
        adapt: "Moderate.", priority: "Low" },
      { id: "ex-h8", label: "Flood", custom: false,
        exposure: "Low.", impact: "Minor.", adapt: "", priority: "Very low" },
      { id: "ex-h9", label: "Fire", custom: false,
        exposure: "Low at this urban site.", impact: "Could damage feeding habitat elsewhere in the landscape.", adapt: "", priority: "Low" },
      { id: "ex-h10", label: "Other", custom: true }
    ]
  },
  actions: {
    existing: [
      { id: "ex-a1", text: "Heat-stress response protocol: council, wildlife carers and rangers monitor the roost on forecast hot days and rescue affected animals under an approved plan.",
        how: "Heatwaves: reduces deaths and rescues dependent young during extreme heat." },
      { id: "ex-a2", text: "Protect existing roost vegetation under the roost management plan (no clearing; weed control).",
        how: "Heatwaves and cyclones: keeps shade and roost structure in place." }
    ],
    potential: [
      { id: "ex-a3", text: "Plant and extend native canopy and understorey around the roost, especially on the exposed western edge, to create a cooler microclimate.",
        how: "Heatwaves: more shade and cooler roost temperatures give animals somewhere to retreat to." },
      { id: "ex-a4", text: "Restore and protect food trees across the landscape, choosing species that flower and fruit at different times of year.",
        how: "Cyclones and drought: provides food when local flowers and fruit are lost." },
      { id: "ex-a5", text: "Install temperature loggers at the roost and link them to Bureau of Meteorology heatwave forecasts as an early warning.",
        how: "Heatwaves: earlier, better-targeted response." },
      { id: "ex-a6", text: "Install sprinklers or misting in the roost during heatwaves.",
        how: "Heatwaves: intended to cool animals; evidence is mixed." }
    ]
  },
  scores: {
    "ex-a1": { cultural: "Y", implement: "3", cost: "2", feasible: "3", effective: "2", social: "3", risk: "2", cobenefits: "2" },
    "ex-a2": { cultural: "Y", implement: "3", cost: "3", feasible: "3", effective: "1", social: "2", risk: "3", cobenefits: "2" },
    "ex-a3": { cultural: "Y", implement: "2", cost: "2", feasible: "2", effective: "2", social: "2", risk: "3", cobenefits: "3" },
    "ex-a4": { cultural: "Y", implement: "2", cost: "1", feasible: "2", effective: "3", social: "3", risk: "3", cobenefits: "3" },
    "ex-a5": { cultural: "Y", implement: "3", cost: "3", feasible: "3", effective: "2", social: "3", risk: "3", cobenefits: "1" },
    "ex-a6": { cultural: "Y", implement: "2", cost: "2", feasible: "2", effective: "1", social: "2", risk: "0", cobenefits: "0" }
  },
  pathway: [
    { id: "ex-p1", actionId: "ex-a1", timing: "Now",
      shortGoal: "Response team trained and ready before each summer; no unmanaged mass-death events.",
      longGoal: "The roost population persists through hotter summers.",
      trigger: "Action already started. Activate when the forecast is 40°C or more, or when a severe heatwave warning is issued.",
      turning: "Deaths above about 5% of the roost in any summer despite the response, or hot days becoming noticeably more frequent.",
      improved: "Add roost microclimate planting (action 3) and early-warning loggers (action 5).",
      stopping: "Not expected to stop; review after each summer." },
    { id: "ex-p2", actionId: "ex-a5", timing: "Now",
      shortGoal: "Loggers installed and reporting before the next summer.",
      longGoal: "A local heat early-warning system for all major roosts.",
      trigger: "Start now; low cost and useful in any future.",
      turning: "Logger data show roost temperatures regularly approaching 40°C.",
      improved: "Share data with neighbouring councils and expand to other roosts.",
      stopping: "Replace if a regional early-warning service covers this roost." },
    { id: "ex-p3", actionId: "ex-a3", timing: "Now",
      shortGoal: "2 ha planted around the roost by 2028, with 80% seedling survival.",
      longGoal: "A shaded, cooler roost with continuous canopy.",
      trigger: "Start in the next wet-season planting window.",
      turning: "Seedling survival below 50% after two wet seasons.",
      improved: "Switch to more heat-tolerant local species and water seedlings through the first dry season.",
      stopping: "Canopy closed and self-sustaining." },
    { id: "ex-p4", actionId: "ex-a4", timing: "Later",
      shortGoal: "Food-tree planting plan agreed with landholders and the NRM body.",
      longGoal: "Food available all year round across the landscape.",
      trigger: "After the next severe cyclone (category 3+) within 50 km, or when funding is secured.",
      turning: "Two consecutive years of food-shortage events (starving or orphaned animals coming into care).",
      improved: "Coordinate a regional food-tree program with councils and NRM groups.",
      stopping: "Food plantings mature and flowering reliably." }
  ],
  summary: {
    photo: null,
    hazards: "• Heatwaves (Very high)\n• Cyclones (High)\n• Increased temperature and hot days (High)",
    impacts: "• Heatwaves: heat stress above about 42°C; mass deaths, especially of dependent young\n• Cyclones: loss of flowers and fruit for months, causing starvation and movement into towns",
    triggers: "• Forecast of 40°C or more, or a severe heatwave warning\n• Severe cyclone (category 3+) within 50 km",
    turning: "• Heat deaths above about 5% of the roost → add microclimate planting and loggers\n• Seedling survival below 50% → change species and water\n• Canopy closed → stop planting",
    longGoals: "• Roost population persists through hotter summers\n• Food available all year round across the landscape",
    shortGoals: "• Response team ready before each summer\n• Loggers reporting before next summer\n• 2 ha of canopy planted by 2028",
    cultural: "• Consult Traditional Owners on all works at the roost\n• Cultural values of the species to be confirmed with Traditional Owners",
    now: "• Heat-stress response protocol (ongoing)\n• Temperature loggers and early warning\n• Canopy planting around the roost",
    later: "• Landscape food-tree program (after the next severe cyclone, or when funded)"
  }
};
