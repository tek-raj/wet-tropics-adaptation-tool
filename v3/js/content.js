/*
 * CONTENT FILE — edit this file to change questions, guidance, examples and links.
 * No programming knowledge needed: only change the text between the quotes.
 *
 * Every question has a `help` block:
 *   instructions : what to write in this box
 *   examples     : example answers (use \n to start a new line)
 *   guidance     : tips, things to consider
 *   moreInfo     : link for "More information" (resource website page, or a trusted external page);
 *                  "" shows "link coming soon", null shows no link line at all
 * Anything left as "" shows as "To be filled" in the app, so gaps are easy to spot.
 *
 * Examples that mention real species are illustrative. Figures for a site should
 * always come from the user's own observations or the linked data sources.
 */
// State and territory link lists, used in several questions below (each is [label, url]).
// Recovery plans, action plans and conservation advice for threatened species
const STATE_RECOVERY_PLANS = [
  ["ACT – Action plans and conservation advice", "https://www.act.gov.au/environment/animals-and-plants/act-threatened-species"],
  ["NSW – Saving our Species program", "https://www.environment.nsw.gov.au/topics/animals-and-plants/threatened-species/saving-our-species-program"],
  ["NT – Threatened species information (Classification of wildlife)", "https://nt.gov.au/environment/animals/classification-of-wildlife"],
  ["Queensland – Recovery and conservation plans", "https://www.qld.gov.au/environment/plants-animals/conservation/threatened-species/our-work-and-partners/recovery-action-planning-and-programs/recoveryconservation-plans"],
  ["SA – Threatened species and recovery planning", "https://www.environment.sa.gov.au/topics/plants-and-animals/threatened-species-and-ecological-communities"],
  ["Tasmania – Threatened Species Link (listing statements and recovery plans)", "https://www.threatenedspecieslink.tas.gov.au/"],
  ["Victoria – FFG Act Action Statements", "https://www.environment.vic.gov.au/conserving-threatened-species/action-statements"],
  ["WA – Recovery plans (DBCA)", "https://www.dbca.wa.gov.au/management/threatened-species-and-communities/recovery/recovery-plans"]
];
// Species records databases (where the species has been recorded)
const STATE_SPECIES_RECORDS = [
  ["ACT – Canberra Nature Map", "https://canberra.naturemapr.org/"],
  ["NSW – BioNet Atlas", "https://www.environment.nsw.gov.au/topics/animals-and-plants/biodiversity/nsw-bionet"],
  ["NT – NR Maps (fauna and flora records)", "https://nrmaps.nt.gov.au/"],
  ["Queensland – WildNet species search", "https://apps.des.qld.gov.au/species-search/"],
  ["SA – NatureMaps (Biological Databases of SA)", "https://data.environment.sa.gov.au/NatureMaps/Pages/default.aspx"],
  ["Tasmania – Natural Values Atlas", "https://www.naturalvaluesatlas.tas.gov.au/"],
  ["Victoria – Victorian Biodiversity Atlas", "https://www.environment.vic.gov.au/biodiversity/victorian-biodiversity-atlas"],
  ["WA – Dandjoo biodiversity data", "https://dandjoo.bio.wa.gov.au/"]
];

window.APP_CONTENT = {
  title: "Biodiversity Climate Adaptation Planning",
  subtitle: "Planning Tool · Version 3 (draft)",
  // Printed at the top of every page of the exported report
  reportHeader: "Biodiversity Climate Adaptation Plan",

  // Main resource website (shown in the app header). Leave "" until ready.
  resourceSiteUrl: "",

  links: {
    epbcSearch: "https://www.environment.gov.au/cgi-bin/sprat/public/sprat.pl",
    climateMap: "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30",
    seaLevelRise: "https://coastadapt.com.au/resource-centre/tools/sea-level-rise-and-future-climate-information-for-coastal-councils/",
    // Species attribute table will be published on the NESP website; until then the recovery plan lists are shown.
    speciesAttributeTable: "",
    recoveryPlansFederal: "https://www.dcceew.gov.au/environment/biodiversity/threatened/recovery-plans",
    visualisationTool: "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30",
    ala: "https://www.ala.org.au/",
    seasonalCalendars: "https://www.csiro.au/en/research/indigenous-science/indigenous-knowledge/calendars",
    terrainClimate: "https://terrain.org.au/what-we-do/climate/",
    climateChangeAustralia: "https://www.climatechangeinaustralia.gov.au/en/"
  },

  /* ---------------- TAB 0: START ---------------- */
  start: {
    title: "Start",
    intro: "Work through each tab to build your adaptation plan. Your work is saved automatically in this browser. Use “Save plan file” to keep a copy or move it to another computer, and the Export tab to download a Word or PDF report.",
    help: {
      instructions: "Record who is preparing the plan, what it covers and why. These details appear on the cover of the report.",
      examples: "",
      guidance: "An adaptation plan works best when its scope is clear. Decide first whether it is for one species, a group of species that share threats, a particular climate hazard, or a site. Most plans in this tool focus on one species at one site; for a group of species, complete one plan per species and cross-reference them.",
      moreInfo: null },
    fields: [
      { id: "planTitle", label: "Plan title", type: "text",
        help: {
          instructions: "Give the plan a short title that says what it covers and where.",
          examples: "Koala climate adaptation plan – [property or reserve name]\nMountain pygmy-possum heat and drought adaptation plan – [alpine site]\nSea level rise adaptation plan for beach-nesting shorebirds – [estuary or beach]\nClimate adaptation plan for [property name]",
          guidance: "Use the format: [species, group, hazard or site] + “climate adaptation plan” + [location]. Keep it under about 10 words so it fits on the report cover.",
          moreInfo: null } },
      { id: "planFocus", label: "Plan focus", type: "select",
        options: ["Single species", "Group of species", "Ecosystem or ecological community", "Particular climate hazard", "Site or property", "Region or Local Government Area (LGA)", "Other"],
        help: {
          instructions: "Choose what the plan is mainly about.",
          examples: "Single species – e.g. koalas on one property\nGroup of species – e.g. beach-nesting shorebirds along a stretch of coast\nEcosystem or ecological community – e.g. a coastal saltmarsh or a threatened rainforest community\nParticular climate hazard – e.g. heatwave impacts on a flying-fox camp\nSite or property – e.g. all priority species on a nature reserve\nRegion or LGA – e.g. priority species across a council area or catchment",
          guidance: "The rest of the tool is set out for one species or ecosystem. If the focus is a group, hazard or site, use the Species / ecosystem tab for the most at-risk species or ecosystem and describe the others under “Purpose of the plan”.",
          moreInfo: null } },
      { id: "purpose", label: "Purpose of the plan", type: "textarea", rows: 3,
        help: {
          instructions: "In one to three sentences, say why the plan is being prepared and how it will be used.",
          examples: "To agree on-ground actions with the landholder and Traditional Owners to reduce heatwave and drought impacts on koalas, and to support a funding application.\nTo plan how nesting habitat for shorebirds on our beach can be protected as sea levels rise and storm surges increase.",
          guidance: "Mention who will use the plan (e.g. landholder, ranger group, council, funding body) and any decision it supports. This helps readers judge how detailed the plan needs to be.",
          moreInfo: null } },
      { id: "preparedBy", label: "Prepared by", type: "text",
        help: {
          instructions: "Name of the person (or people) who led the assessment.",
          examples: "Jane Smith (Land for Wildlife officer) with the XYZ Ranger team",
          guidance: "List the lead author first. Record everyone who took part in the site visit under “People present” on the Site tab.",
          moreInfo: null } },
      { id: "organisation", label: "Organisation / group", type: "text",
        help: {
          instructions: "The organisation, ranger group, landcare group or agency responsible for the plan.",
          examples: "[Regional] Natural Resource Management (NRM) body\nXYZ Aboriginal Corporation Ranger Program\n[Local] Landcare group\n[Local] council",
          guidance: "If the plan is a partnership, list the lead organisation first, then the partners.",
          moreInfo: null } },
      { id: "date", label: "Date of assessment", type: "date",
        help: {
          instructions: "The date of the site visit or planning workshop, in DD/MM/YYYY format. Type it in or use the calendar button.",
          examples: "14/10/2026",
          guidance: "Use the date of the field visit, not the date the report was written. Plans should be reviewed at least every 3–5 years, or after a major event such as a severe cyclone or heatwave.",
          moreInfo: null } }
    ]
  },

  /* ---------------- TAB 1: SPECIES ---------------- */
  species: {
    title: "Species or ecosystem details",
    intro: "Describe the species or ecosystem this plan is for: what it needs, why it matters and its conservation status.",
    help: {
      instructions: "Complete one plan per species or ecosystem (for example, a threatened ecological community, a vegetation type or a wetland). Draw on field knowledge, Traditional Owner knowledge, recovery plans, conservation advice and species or community profiles.",
      examples: "Species: Koala; Spectacled flying-fox; Hooded plover\nEcosystem: Mabi forest (Complex notophyll vine forest 5b); Coastal saltmarsh; Alpine sphagnum bogs and associated fens",
      guidance: "Good information about the species or ecosystem is the foundation of the risk assessment. The better you describe what it needs (for a species: food, water, shelter, breeding sites, temperature range; for an ecosystem: its extent, structure, key species, water regime and fire regime), the easier it is to see how climate hazards will affect it.",
      moreInfo: null },
    fields: [
      { id: "name", label: "Species or ecosystem name", type: "text",
        help: {
          instructions: "For a species, give the common name and scientific name, and the population or subspecies if relevant. For an ecosystem, give its name as listed, or its vegetation type or mapping code.",
          examples: "Koala (Phascolarctos cinereus)\nSpectacled flying-fox (Pteropus conspicillatus)\nMabi forest (Complex notophyll vine forest 5b) – threatened ecological community\nCoastal saltmarsh, [estuary name]\nRegional ecosystem 7.8.3 (Qld) or plant community type (NSW)",
          guidance: "Include local Aboriginal names only where Traditional Owners have agreed they can be recorded. For a species, check the scientific name against the EPBC or state/territory species search so it matches official records; ALA, iNaturalist and state databases help confirm both names. For an ecosystem, use the name in the EPBC or state list of threatened ecological communities, or the vegetation type from your state’s vegetation mapping (Site tab, Description of environment).",
          moreInfo: "",
          links: [
            ["Atlas of Living Australia (ALA) species search", "https://bie.ala.org.au/"],
            ["iNaturalist species search", "https://www.inaturalist.org/taxa"],
            ["EPBC species profiles (SPRAT)", "https://www.environment.gov.au/cgi-bin/sprat/public/sprat.pl"],
            ["EPBC threatened ecological communities (DCCEEW)", "https://www.dcceew.gov.au/environment/biodiversity/threatened/communities"]
          ].concat(STATE_SPECIES_RECORDS) } },
      { id: "habitat", label: "Habitat, ecosystem and key needs", type: "textarea", rows: 4,
        help: {
          instructions: "For a species, describe where it is found and what it needs to survive: habitat type, food (diet), water, shelter, breeding sites and home range. For an ecosystem, describe where it occurs, its structure and key species, and the conditions it depends on (water, fire, soil, temperature).",
          examples: "Species: Eucalypt forest and woodland. Feeds almost entirely on the leaves of a limited set of local eucalypt species, which also provide most of its water; drinks from the ground in hot, dry weather. Home range from a few hectares to over 100 hectares depending on habitat quality. Needs connected trees to move safely between feeding and shelter trees.\nEcosystem: Coastal saltmarsh on the upper intertidal flats of the estuary, dominated by succulent herbs and grasses. Depends on regular tidal inundation and room to move inland as sea levels rise; provides feeding habitat for migratory shorebirds and nursery habitat for fish.",
          guidance: "Focus on the needs most sensitive to climate:\n• temperature limits\n• dependence on water\n• seasonal food sources\n• specific breeding or roosting sites\n• how far the species can move, or how far the ecosystem can shift\nThe recovery plan or conservation advice is usually the best source. TERN’s threatened species literature reviews summarise published knowledge for many species.",
          moreInfo: "",
          links: [
            ["Recovery plans and conservation advice (DCCEEW)", "https://www.dcceew.gov.au/environment/biodiversity/threatened/recovery-plans"],
            ["Threatened species literature reviews (TERN EMSA)", "https://emsa.tern.org.au/threatened-species-resources#Literature-Reviews"],
            ["EPBC threatened ecological communities (DCCEEW)", "https://www.dcceew.gov.au/environment/biodiversity/threatened/communities"] ] } },
      { id: "importance", label: "Why is it important?", type: "textarea", rows: 3,
        help: {
          instructions: "Explain why this species or ecosystem matters: to Traditional Owners, to the community, to other species and ecosystems, and for conservation.",
          examples: "Culturally significant totem species for Traditional Owners; appears in stories and ceremony.\nBush tucker species or plant community.\nPollinator or seed disperser – many plants rely on it to reproduce.\nThe ecosystem provides habitat for several threatened species, filters water or protects the coast from storms.\nThreatened species or ecological community and a focus of the local community.",
          guidance: "Cultural values should be described by, or with the permission of, the Traditional Owners for this Country. Do not record culturally sensitive or restricted knowledge in the plan. Instead, note that cultural values exist and who to contact about them. If relevant, note how the plan supports national targets, such as reducing the impact of climate change on biodiversity under Australia’s Strategy for Nature (the National Biodiversity Strategy and Action Plan).",
          moreInfo: "https://www.dcceew.gov.au/environment/biodiversity/conservation/strategy" } },
      { id: "epbc", label: "Conservation status — Federal (EPBC listed)", type: "radio",
        options: ["Not listed", "Conservation dependent", "Vulnerable", "Endangered", "Critically endangered"],
        searchLink: "epbcSearch",
        help: {
          instructions: "Search for the species or threatened ecological community in the federal lists (Search list link, or More information) and select its status under the EPBC Act.",
          examples: "Species: Koala (Queensland, NSW and ACT populations) – Endangered\nEcological community: Mabi forest (Complex notophyll vine forest 5b) – Critically endangered",
          guidance: "Species status is listed for the species, subspecies or population; select the listing that applies at your site (for example, the koala is listed as Endangered only for its Queensland, New South Wales and ACT populations). Threatened ecological communities are listed as Vulnerable, Endangered or Critically endangered; check the listing’s description to confirm the patch at your site meets it. Profiles link to the recovery plan and conservation advice.",
          moreInfo: "",
          links: [["EPBC species profiles (SPRAT)", "https://www.environment.gov.au/cgi-bin/sprat/public/sprat.pl"], ["EPBC threatened ecological communities (DCCEEW)", "https://www.dcceew.gov.au/environment/biodiversity/threatened/communities"]] } },
      { id: "state", label: "State or territory", type: "select",
        options: ["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"],
        help: {
          instructions: "Choose the state or territory where the site is. Its threatened species and ecological community lists are used for the status question below.",
          examples: "",
          guidance: "If the plan covers sites in more than one state or territory, choose the main one and note the others under “Purpose of the plan” on the Start tab.",
          moreInfo: null } },
      // The id stays "qld" so plan files saved by earlier versions still load.
      { id: "qld", label: "Conservation status — State or territory (Threatened species or ecological community list)", type: "radio",
        options: ["Not listed", "Vulnerable", "Endangered", "Critically endangered"],
        searchLinks: [
          ["Australian Capital Territory – ACT threatened species (Nature Conservation Act 2014)", "https://www.act.gov.au/environment/animals-and-plants/act-threatened-species"],
          ["New South Wales – BioNet threatened biodiversity profile search (Biodiversity Conservation Act 2016)", "https://threatenedspecies.bionet.nsw.gov.au/"],
          ["Northern Territory – Classification of wildlife (Territory Parks and Wildlife Conservation Act 1976)", "https://nt.gov.au/environment/animals/classification-of-wildlife"],
          ["Queensland – Threatened species list (Nature Conservation Act 1992)", "https://app.powerbi.com/view?r=eyJrIjoiY2I3ZThmODMtNDhhNS00ZGJjLTgxZTAtZjc2ODQwMzM0Yzk2IiwidCI6ImQxNmRlNTMwLTk0ZTctNDE1OC1iN2UyLTZlZTIyMGFmNjI4ZCJ9"],
          ["South Australia – Threatened species and ecological communities (National Parks and Wildlife Act 1972)", "https://www.environment.sa.gov.au/topics/plants-and-animals/threatened-species-and-ecological-communities"],
          ["Tasmania – Lists of threatened species (Threatened Species Protection Act 1995)", "https://nre.tas.gov.au/conservation/threatened-species-and-communities/lists-of-threatened-species"],
          ["Victoria – FFG Act Threatened List (Flora and Fauna Guarantee Act 1988)", "https://www.environment.vic.gov.au/conserving-threatened-species/threatened-list"],
          ["Western Australia – Threatened species and communities (Biodiversity Conservation Act 2016)", "https://www.dbca.wa.gov.au/management/threatened-species-and-communities"] ],
        help: {
          instructions: "Search for the species or ecological community in the threatened list for your state or territory (Search lists link) and select its status under that state’s or territory’s law.",
          examples: "Queensland – Endangered (Nature Conservation Act 1992)\nNew South Wales – Vulnerable (Biodiversity Conservation Act 2016)\nVictoria – Critically endangered (Flora and Fauna Guarantee Act 1988)",
          guidance: "State/territory and federal status can differ, so check both. Most states and territories now use the same categories as the EPBC Act (the Common Assessment Method). If the species or community is in another category (e.g. Near threatened, Rare, Priority or Special least concern), select “Not listed” and note the category under “Why is it important?”. In Queensland, ecosystems are also given a biodiversity status as regional ecosystems (Endangered, Of concern, No concern at present); note this under “Why is it important?”.",
          moreInfo: "",
          links: [
            ["ACT threatened species", "https://www.act.gov.au/environment/animals-and-plants/act-threatened-species"],
            ["NSW BioNet threatened biodiversity profile search", "https://threatenedspecies.bionet.nsw.gov.au/"],
            ["NT Classification of wildlife", "https://nt.gov.au/environment/animals/classification-of-wildlife"],
            ["Queensland threatened species list", "https://app.powerbi.com/view?r=eyJrIjoiY2I3ZThmODMtNDhhNS00ZGJjLTgxZTAtZjc2ODQwMzM0Yzk2IiwidCI6ImQxNmRlNTMwLTk0ZTctNDE1OC1iN2UyLTZlZTIyMGFmNjI4ZCJ9"],
            ["SA threatened species and ecological communities", "https://www.environment.sa.gov.au/topics/plants-and-animals/threatened-species-and-ecological-communities"],
            ["Tasmania lists of threatened species", "https://nre.tas.gov.au/conservation/threatened-species-and-communities/lists-of-threatened-species"],
            ["Victoria FFG Act Threatened List", "https://www.environment.vic.gov.au/conserving-threatened-species/threatened-list"],
            ["WA threatened species and communities", "https://www.dbca.wa.gov.au/management/threatened-species-and-communities"] ] } },
      { id: "monitoring", label: "Existing monitoring of the species or ecosystem (if any)", type: "textarea", rows: 3,
        help: {
          instructions: "List any monitoring of this species or ecosystem you know about: who does it, what is measured, where, and since when.",
          examples: "Ranger group camera-trap surveys twice a year since 2019 (presence and number of individuals).\nVegetation condition plots measured every 3 years by the regional NRM body.\nUniversity or agency survey transects at nearby sites.\nCommunity sightings reported to the local council and wildlife carers.",
          guidance: "Existing monitoring can provide a baseline and help set triggers in Pathway planning. Note where the data is held and whether it can be shared. Monitoring at this particular site is recorded on the Site tab. State and territory species databases (see More information) show where the species has been recorded and by which surveys.",
          moreInfo: "",
          links: STATE_SPECIES_RECORDS } }
    ]
  },

  /* ---------------- TAB 2: SITE ---------------- */
  site: {
    title: "Site or area details",
    intro: "Where the assessment applies. This can be a single site, a property, a Local Government Area (LGA), or a region or catchment.",
    links: [["visualisationTool", "Visualisation tool"]],
    photosHelp: {
      instructions: "Upload photos of the site and the species\u2019 habitat, and give each one a short caption saying what it shows, where and when.",
      examples: "View east along the creek from photo point PP1, October 2026\nRoost trees on the exposed western edge, showing heat-damaged canopy\nFeed trees planted in 2024, now about 2 m tall",
      guidance: "Photos from your photo monitoring points are especially useful, because the same views can be retaken later to show change. Use JPG or PNG files; large photos are reduced automatically. Only include photos you have permission to use, and avoid images of culturally sensitive places unless Traditional Owners agree.",
      moreInfo: "" },
    help: {
      instructions: "Describe the site or area being assessed (a site, property, LGA or region) and the people and plans connected with it. Use the Visualisation tool to view climate information for the location.",
      examples: "",
      guidance: "Complete this tab on or soon after the site visit, while details are fresh. Where the site is on Aboriginal land or a place of cultural significance, agree with Traditional Owners what location detail can be recorded and shared.",
      moreInfo: "" },
    fields: [
      { id: "assessDate", label: "Date of site assessment", type: "date",
        help: {
          instructions: "The date of the site visit or site assessment, in DD/MM/YYYY format. Filled in automatically when a site assessment is imported.",
          examples: "14/10/2026",
          guidance: "An existing site assessment (e.g. a cultural assessment) can be used. Record its date here and add any missing details below.",
          moreInfo: null } },
      { id: "scale", label: "Scale of assessment", type: "select",
        options: ["Site", "Property", "Local Government Area (LGA)", "Region or catchment", "Other"],
        help: {
          instructions: "Choose the area the plan covers.",
          examples: "Site – one roost, wetland or patch of habitat\nProperty – a farm, reserve or Indigenous Protected Area\nLocal Government Area (LGA) – a council area\nRegion or catchment – e.g. a river catchment or bioregion",
          guidance: "Larger areas suit regional planning and council decisions; a single site suits on-ground works. For an LGA or region, give a central point under GPS and describe the boundary under Description of environment (or add a map under Site photos).",
          moreInfo: "",
          links: [["Interactive climate hazard map (Wet Tropics)", "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30"]] } },
      { id: "placeName", label: "Place name", type: "text",
        help: {
          instructions: "The name of the site or area, e.g. a locality, creek, reserve, Local Government Area (LGA) or catchment.",
          examples: "[Creek name], near [town]\n[Reserve name] Nature Reserve\n[Name] Regional Council (LGA)\n[Name] River catchment",
          guidance: "Use a name that will be recognised by others. Include the traditional place name where Traditional Owners agree.",
          moreInfo: "",
          links: [["Interactive climate hazard map (Wet Tropics)", "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30"]] } },
      { id: "gps", label: "GPS", type: "text", gps: true,
        help: {
          instructions: "Coordinates of the site, or a central point for a larger area, in decimal degrees (latitude, longitude). Use “Use my location” while on site, or copy the coordinates from a map.",
          examples: "-17.8421, 146.0987",
          guidance: "Use the GDA2020 datum (standard on most phones and GPS units). For larger sites, record the centre here and list other key points under Photo monitoring points. Take care when sharing coordinates of sensitive species or cultural sites.",
          moreInfo: "",
          links: [["Interactive climate hazard map (Wet Tropics)", "https://tek-raj.github.io/public/index_long.html#8/-17/145.7/0/30"]] } },
      { id: "propertyName", label: "Property or area name", type: "text",
        help: {
          instructions: "The property, reserve or tenure name for a site, or the name of the area for a larger assessment (e.g. the LGA, catchment or region).",
          examples: "Smith family farm (conservation covenant)\n[Name] National Park\nLot and plan number from the title, e.g. Lot 12 on RP123456",
          guidance: "Including the tenure (freehold, nature refuge, national park, Aboriginal land, council reserve) helps show who has authority to carry out actions.",
          moreInfo: null } },
      { id: "propertyContact", label: "Landholder or area contact", type: "text",
        help: {
          instructions: "The name and contact details of the landholder or land manager.",
          examples: "John Smith, 0400 000 000, john@example.com",
          guidance: "Get permission before recording personal contact details, and remove them before sharing the report more widely.",
          moreInfo: null } },
      { id: "environment", label: "Description of environment", type: "textarea", rows: 3,
        help: {
          instructions: "Describe the site or area: vegetation types and condition, landforms, elevation, water features, land use and main threats. For an LGA or region, summarise the main habitats and where the species occurs.",
          examples: "Open eucalypt woodland on a gentle slope, 300–400 m elevation. Mostly intact canopy with some weed invasion along the edges. Permanent creek on the eastern boundary with taller riparian trees. Surrounded by cleared grazing land to the west.",
          guidance: "Note features that could buffer climate impacts (cool gullies, permanent water, high elevation, dense canopy) and those that increase risk (fragmentation, weeds, roads, fire-prone edges). Record the vegetation community or mapping code if known, e.g. a regional ecosystem (Qld), plant community type (NSW), Ecological Vegetation Class (Vic) or TASVEG unit (Tas); see the national and state vegetation maps under More information.",
          moreInfo: "",
          links: [
            ["National – National Vegetation Information System (NVIS)", "https://www.dcceew.gov.au/environment/environment-information-australia/national-vegetation-information-system"],
            ["ACT – ACTmapi (vegetation communities layer)", "https://www.actmapi.act.gov.au/"],
            ["NSW – State Vegetation Type Map (plant community types)", "https://www.environment.nsw.gov.au/topics/animals-and-plants/biodiversity/nsw-bionet/state-vegetation-type-map"],
            ["NT – NR Maps (vegetation mapping)", "https://nrmaps.nt.gov.au/"],
            ["Queensland – Regional ecosystems", "https://www.qld.gov.au/environment/plants-animals/plants/ecosystems"],
            ["SA – NatureMaps (vegetation layers)", "https://data.environment.sa.gov.au/NatureMaps/Pages/default.aspx"],
            ["Tasmania – TASVEG vegetation mapping", "https://nre.tas.gov.au/conservation/development-planning-conservation-assessment/planning-tools/monitoring-and-mapping-tasmanias-vegetation-(tasveg)"],
            ["Victoria – NatureKit (Ecological Vegetation Classes)", "https://www.environment.vic.gov.au/biodiversity/naturekit"],
            ["WA – Pre-European vegetation (Beard mapping, DPIRD)", "https://catalogue.data.wa.gov.au/dataset/pre-european-dpird-006"] ] } },
      { id: "condition", label: "Current condition", type: "textarea", rows: 3,
        help: {
          instructions: "Describe the current condition of the site and the habitat or ecosystem: health of vegetation, signs of damage or stress, weeds, pests, erosion, water levels and recent disturbance. Add photos (Site photos below).",
          examples: "Canopy mostly intact; some trees on the western edge show heat scorch from last summer.\nLantana and guinea grass along the creek bank; feral pig diggings near the spring.\nCreek flowing but lower than usual for October.",
          guidance: "Describe what you see now, so later visits can show change. Photos from photo monitoring points are especially useful. Note anything that could make the site more vulnerable to climate hazards (e.g. weeds that carry fire, bare ground that erodes in floods).",
          moreInfo: null } },
      { id: "sightings", label: "Sightings or records of the species or ecosystem", type: "textarea", rows: 2,
        help: {
          instructions: "Record recent sightings or signs of the species at or near the site: date, location, what was seen, and by whom.",
          examples: "12/08/2026 – adult female with joey in a creek-side gum (landholder).\nFresh scats under feed trees near the northern fence, October 2026.\nAtlas of Living Australia: 14 records within 2 km since 2015.",
          guidance: "Include signs as well as direct sightings (scats, tracks, calls, feeding signs, camera-trap images). Search the Atlas of Living Australia (ALA) for past records. State and territory databases (e.g. BioNet in NSW, WildNet in Queensland, the Victorian Biodiversity Atlas, Tasmania’s Natural Values Atlas) may hold more location data; see More information. Consider submitting new sightings too.",
          moreInfo: "",
          links: [
            ["Atlas of Living Australia (ALA)", "https://www.ala.org.au/"],
            ["iNaturalist", "https://www.inaturalist.org/"]
          ].concat(STATE_SPECIES_RECORDS) } },
      { id: "mgmtPlans", label: "Existing management plan(s)", type: "textarea", rows: 2,
        help: {
          instructions: "List any plans that already cover the site or species.",
          examples: "Property vegetation management plan (2022)\nConservation covenant or agreement\nIndigenous Protected Area plan of management\nFire management plan\nNational recovery plan for the species",
          guidance: "Note which actions in existing plans are relevant to climate risk. The adaptation plan should build on, not duplicate, existing commitments.",
          moreInfo: null } },
      { id: "monitoring", label: "Existing monitoring at the site (if any)", type: "textarea", rows: 2,
        help: {
          instructions: "List monitoring already happening at this site, for any purpose.",
          examples: "Weather station at the homestead (rainfall and temperature)\nAnnual bird surveys by the landcare group\nWater quality sampling in the creek",
          guidance: "Weather, vegetation and water monitoring can be as useful as species surveys for setting climate triggers.",
          moreInfo: null } },
      { id: "photoPoints", label: "Photo monitoring points", type: "textarea", rows: 3,
        help: {
          instructions: "Record each photo point so the same photo can be retaken in future: an ID, GPS location, compass bearing, and what the photo shows.",
          examples: "PP1 – -17.8421, 146.0987 – bearing 45° – creek crossing and riparian canopy\nPP2 – -17.8430, 146.0975 – bearing 270° – forest edge and lantana infestation",
          guidance: "Mark each point permanently (e.g. a star picket), and photograph from the same height and bearing at the same time of year. Retake photos after major events (cyclone, fire, flood) to record damage and recovery.",
          moreInfo: null } },
      { id: "reason", label: "Reason for assessment", type: "textarea", rows: 2,
        help: {
          instructions: "Explain why this site was chosen and what prompted the assessment.",
          examples: "Landholder concerned about koala deaths during the last heatwave and drought.\nThe site is a known climate refuge for a heat-sensitive species.\nRequired as part of a revegetation grant.",
          guidance: "A clear reason helps set the scope of the plan and explains to others why the site is a priority.",
          moreInfo: null } },
      { id: "people", label: "People present", type: "textarea", rows: 2,
        help: {
          instructions: "List the people who took part in the planning (site visit or workshop) and their role or organisation.",
          examples: "Jane Smith (regional NRM body), John Smith (landholder), XYZ Ranger team (3 rangers), Dr A. Brown (university ecologist)",
          guidance: "Record Traditional Owner participation and consent. Note any key people who could not attend but should review the plan.",
          moreInfo: null } },
      { id: "seasonal", label: "Seasonal calendar notes", type: "textarea", rows: 3,
        help: {
          instructions: "Note seasonal events that matter for the species and for timing actions: breeding, flowering and fruiting, wet and dry seasons, cyclone or storm season, and fire season.",
          examples: "Breeding: [months] – young most dependent in [months].\nPeak food availability: [season].\nNorthern Australia: cyclone season November–April.\nFire season: varies by region – check your state fire authority.",
          guidance: "Traditional Owner seasonal calendars often describe these cycles in detail and may show changes already happening. Seasonal timing affects when actions can be done, e.g. planting when soils are moist and weed control before weeds set seed.",
          moreInfo: "https://www.csiro.au/en/research/indigenous-science/indigenous-knowledge/calendars" } }
    ]
  },

  /* ---------------- SITE ASSESSMENT (field app and import) ----------------
     Used by the offline Site assessment app (site-assessment/) and by "Import a site assessment" on the Site tab.
     Questions and help come from site.fields above (same ids). Order follows the site assessment template. */
  siteAssessment: {
    title: "Site assessment",
    intro: "Best done at the site. This can be an existing site assessment (e.g. a cultural assessment); if any of these details are missing, add them if possible.",
    fileFormat: "site-assessment",          // "format" value in files saved by the app
    fileExt: ".siteassess.json",
    sections: [
      { title: "Date", fields: ["assessDate"] },
      { title: "Part 1 – Site location and description",
        fields: ["placeName", "gps", "propertyName", "propertyContact", "environment", "condition", "sightings",
                 "mgmtPlans", "monitoring", "photoPoints", "reason", "people"] },
      { title: "Optional", fields: ["seasonal"] }
    ],
    // Field names (Fulcrum "data names") for the same questions, for teams using Fulcrum.
    // The record's location is used for GPS; photos come from the photo field.
    fulcrum: {
      assessDate: "assessment_date", placeName: "place_name", gps: "gps", propertyName: "property_name",
      propertyContact: "property_contact", environment: "environment_description", condition: "current_condition",
      sightings: "species_sightings", mgmtPlans: "management_plans", monitoring: "existing_monitoring",
      photoPoints: "photo_monitoring_points", reason: "assessment_reason", people: "people_present",
      seasonal: "seasonal_calendar_notes",
      photos: "condition_photos"
    }
  },

  /* ---------------- TAB 3: RISK ASSESSMENT ---------------- */
  risk: {
    title: "Risk assessment",
    intro: "For each climate hazard, describe exposure, vulnerability and priority.",
    help: {
      instructions: "Work through each hazard. First decide if the site or area is exposed to it, now or in future. If it is, describe how the species is affected and how well it can cope, then rate the priority. Skip hazards that do not apply (e.g. sea level rise at an upland site).",
      examples: "",
      guidance: "Climate risk = exposure × vulnerability. A hazard is a high priority when the site is (or will be) exposed and the species is sensitive to it with limited ability to cope. Use the hazard maps for exposure, and species information (recovery plans, local knowledge) for vulnerability.",
      moreInfo: null },
    hazards: [
      "Increased temperature",
      "Cyclones",
      "Heatwaves",
      "Hot days (number of days above 35°C)",
      "Hot nights (number of nights above 20°C)",
      "Drought (time with no rain)",
      "Sea level rise",
      "Flood",
      "Fire"
    ],
    // Extra links shown on a particular hazard card (hazard name must match the list above)
    hazardLinks: {
      "Sea level rise": [["seaLevelRise", "Sea level rise information (CoastAdapt)"]]
    },
    priorityOptions: ["Very low", "Low", "Medium", "High", "Very high"],
    // Column headings — group label is shown in the report header row
    columns: [
      { id: "exposure", group: "Exposure", label: "Is the hazard already present and likely to get worse in the future?",
        links: [["climateMap", "Interactive climate map"]],
        // "Hazard maps" pop-up: national portals, then each state and territory (same sources as the Overview)
        popups: [{ label: "Hazard maps", list: [
          ["National – Climate Change in Australia (CSIRO and Bureau of Meteorology)", "https://www.climatechangeinaustralia.gov.au/en/"],
          ["National – Australian Climate Service data explorer and hazards viewer", "https://www.acs.gov.au/pages/data-explorer"],
          ["ACT – NARCliM climate data (AdaptNSW)", "https://www.climatechange.environment.nsw.gov.au/narclim/narclim-products-and-data"],
          ["NSW – NARCliM climate data (AdaptNSW)", "https://www.climatechange.environment.nsw.gov.au/narclim/narclim-products-and-data"],
          ["NT – no territory portal; use Climate Change in Australia", "https://www.climatechangeinaustralia.gov.au/en/"],
          ["Queensland – Future Climate Dashboard (Long Paddock)", "https://www.longpaddock.qld.gov.au/qld-future-climate/dashboard-cmip6/"],
          ["SA – Climate Projections Viewer", "https://www.environment.sa.gov.au/climate-viewer/details/"],
          ["Tasmania – climate projections (new release due 2027)", "https://www.recfit.tas.gov.au/what_is_recfit/climate_change/adapting/projected_impacts"],
          ["Victoria – Future Climate Tool", "https://vicfutureclimatetool.indraweb.io/cmip6/"],
          ["WA – Climate projections and risk assessment tool", "https://www.wa.gov.au/government/publications/climate-risk-assessment-tool"] ] }],
        help: {
          instructions: "Answer two parts: (1) Is this hazard already happening at the site? Give evidence. (2) Is it projected to get worse? Give the direction and timeframe from the hazard maps for your state or territory (Hazard maps link).",
          examples: "Yes. Present: three heatwaves affected the site in the last five summers (landholder observations). Future: hazard maps show a large increase in hot days by 2050 under a high emissions scenario.\nNo. The site is at 900 m elevation, well above projected sea level rise and storm surge.",
          guidance: "Use the hazard maps for projections, and local observations and Bureau of Meteorology records for what is happening now. Note the time period (e.g. 2030, 2050) and emissions scenario you used. Upland sites may be less exposed to heat now but warming faster in relative terms.",
          moreInfo: null } },
      { id: "impact", group: "Vulnerability", label: "How is the species or ecosystem impacted / affected by the hazard?",
        links: [["speciesAttributeTable", "Species attribute table"], ["recoveryPlansFederal", "Recovery plans (Federal)"], ["ala", "Atlas of Living Australia"]],
        popups: [{ label: "State and territory recovery plans", list: STATE_RECOVERY_PLANS }],
        help: {
          instructions: "Describe how this hazard affects the species. Consider health and survival, food, water, shelter, and breeding. Include direct effects (e.g. heat stress) and indirect effects (e.g. loss of food trees).",
          examples: "Heatwaves: spectacled flying-foxes die of heat stress when temperatures exceed their tolerance. About a third of the Australian population died in the November 2018 heatwave.\nDrought and heat: koalas suffer dehydration and heat stress when eucalypt leaves dry out; many have died during severe drought and heatwaves.\nSea level rise: the Bramble Cay melomys, found only on one small Torres Strait island, was declared extinct after rising seas and storm surges destroyed its habitat.",
          guidance: "Recovery plans and conservation advice list known threats. Consider which life stage is most sensitive (eggs, young, breeding adults) and whether impacts combine, e.g. drought followed by fire, or a storm followed by a food shortage. Species records and observations (Atlas of Living Australia, state and territory databases listed on the Species tab, iNaturalist, Birdata) can show where the species occurs and whether it has declined after past extreme events.",
          moreInfo: null } },
      { id: "adapt", group: "Vulnerability", label: "Ability to adapt",
        help: {
          instructions: "Describe what the species can do by itself to cope with this hazard: move to cooler or safer places, change behaviour, switch food, or recover numbers quickly.",
          examples: "Can move short distances to cooler gullies if connected forest is present, but cannot cross large cleared areas.\nCan switch to other food plants, but relies on a few key species during dry periods.\nLow ability: slow breeding (one young per year) means populations recover slowly after losses.",
          guidance: "Low ability to adapt means greater vulnerability. Key factors are mobility and habitat connectivity, diet flexibility, breeding rate, and whether there are cooler refuges (e.g. higher elevation) within reach. Also note barriers that stop the species adapting (roads, fences, clearing).",
          moreInfo: null } },
      { id: "priority", group: "Priority", label: "How concerning is the hazard for this species or ecosystem in this area?",
        help: {
          instructions: "Rate the priority of this hazard for this species at this site, from Very low to Very high, based on your exposure and vulnerability answers.",
          examples: "Very high – hazard already causing deaths or breeding failure and getting worse\nHigh – site exposed now or soon and species clearly sensitive, with limited ability to cope\nMedium – exposed, but moderate impact or some ability to cope\nLow – minor impact expected, or exposure unlikely before 2050\nVery low – not exposed or not relevant at this site",
          guidance: "Agree the rating as a group. High and Very high hazards become the focus of the actions and the summary page. If you are unsure, rate it one level higher and note the uncertainty.",
          moreInfo: null } }
    ]
  },

  /* ---------------- TAB 4: ACTIONS ---------------- */
  actions: {
    title: "Actions",
    intro: "List existing actions already happening, then potential new actions. Scores come from the Scoring tab.",
    // Shown as a highlighted box near the top of the Actions tab
    adaptlog: {
      title: "Looking for ideas? Search AdaptLog",
      text: "AdaptLog (CSIRO) is a catalogue: an online, searchable repository of conservation interventions for climate adaptation. Search it for actions that have been used for similar species, habitats and climate hazards.",
      url: "https://adapt-log.csiro.au/",
      linkLabel: "Open AdaptLog" },
    help: {
      instructions: "List what is already being done that helps the species cope with climate hazards, then new actions that could be taken. Focus on the High and Very high priority hazards from the Risk assessment.",
      examples: "",
      guidance: "Good adaptation actions reduce exposure (e.g. protect cool refuges), reduce sensitivity (e.g. reduce other threats such as weeds, pigs and dogs so the species is healthier), or increase the ability to adapt (e.g. restore corridors so the species can move). Actions for other threats count too if they build resilience to climate hazards.",
      moreInfo: null },
    existingHelp: {
      instructions: "Describe each action already happening at the site: what is done, by whom, and how often.",
      examples: "Feral pig control – ranger group trapping program, quarterly.\nLantana control along the creek – landcare group, twice a year.\nWildlife warning signs and reduced speed zone on the access road – council.",
      guidance: "Include actions by other groups on or near the site. Existing actions can be scored and carried into Pathway planning; they may need to be expanded as the climate changes.",
      moreInfo: null },
    potentialHelp: {
      instructions: "Describe new actions that could reduce the impact of priority hazards. Be specific about what, where and at what scale.",
      examples: "Revegetate a 2 km corridor linking the creek to upland forest so the species can move to cooler areas.\nProtect and enlarge cool gully refuges by removing weeds and fencing out cattle.\nPrepare a post-cyclone response plan (food monitoring and emergency feeding, coordinated with the department).\nPlant a mix of food trees that fruit at different times of year.",
      guidance: "Draw on recovery plans, Traditional Owner knowledge, AdaptLog (CSIRO\u2019s searchable catalogue of conservation interventions for climate adaptation) and what has worked elsewhere. List options even if they seem difficult; the Scoring tab helps compare them. Avoid actions that could cause harm, such as spreading disease through artificial feeding or water points.",
      moreInfo: "https://adapt-log.csiro.au/" },
    howHelp: {
      instructions: "Explain how the action reduces the risk from one or more climate hazards. Name the hazard(s) it addresses.",
      examples: "Heatwaves and increased temperature: gives the species access to cooler upland refuges.\nCyclones and storms: provides alternative food and shelter while damaged habitat recovers.\nFire: creates buffers around fire-sensitive vegetation.",
      guidance: "Link each action to the specific impact it addresses. If an action does not clearly reduce climate risk, it may still be worthwhile, but it is not an adaptation action for this plan.",
      moreInfo: null }
  },

  /* ---------------- TAB 5: SCORING ---------------- */
  scoring: {
    title: "Scoring",
    intro: "Note: scoring is indicative only — discuss which actions are likely to be most effective, practical and appropriate. Each action is scored on seven criteria: 3 = good, 2 = OK, 1 = bad, and 0 = unknown or limited information. The scores add up to a total out of 21. Cultural acceptability is recorded in the last column; it is not scored but should be weighed in the decision.",
    help: {
      instructions: "Score each action as a group on the seven criteria. Use 0 when you don’t know or have limited information, so gaps are easy to see. Then choose the cultural acceptability of each action in the last column. The tool adds up the score out of 21 and counts any unknowns.",
      examples: "Spectacled flying-fox worked example (totals out of 21):\n• Temperature loggers and early warning – 18 (cheap and easy, few co-benefits) – Acceptable\n• Heat-stress response protocol – 17 – Acceptable\n• Plant canopy around the roost – 16 – Acceptable\n• Restore food trees across the landscape – 14, 1 unknown (landholder support not yet known) – Acceptable\n• Sprinklers or misting in the roost – 11 (little evidence it works, risk of harm) – May raise concerns",
      exampleStep: "actions",
      guidance: "Scores help compare options; they do not decide for you. Two actions with similar scores may both be worth doing, and a lower-scoring action may still be essential. An action with several “unknown” scores may need more information before a decision is made. Record the reasons for scores in your notes so the plan can be reviewed later.",
      moreInfo: null },
    // Face scale used to pick scores. The number is stored and added up; 0 means unknown / limited information.
    scale: [
      { value: "3", emoji: "😊", label: "Good", color: "1E7B34", fill: "D9F0D3" },
      { value: "2", emoji: "😐", label: "OK", color: "D49A00", fill: "FFF3C4" },
      { value: "1", emoji: "😞", label: "Bad", color: "A61B1B", fill: "F8C4C0" },
      { value: "0", emoji: "😕", label: "Unknown / limited information", short: "Unknown", color: "8A9298", fill: "E6E9EB" }
    ],
    // Cultural acceptability: chosen for every action and weighed in the decision, but not used as a filter or added to the score.
    // Options: [code, label, meaning]. Older plans may hold "D" (to be discussed), which is read as "U" (unknown).
    cultural: { id: "cultural", label: "Cultural acceptability", short: "Cultural", sub: "To consider – not scored",
      options: [
        ["Y", "Acceptable", "Fits with cultural values and practice for this Country"],
        ["C", "May raise concerns", "Could affect cultural values, places or practices – check before going ahead"],
        ["N", "Not acceptable", "Goes against cultural practice or values"],
        ["U", "Unknown", "Not yet known how it would affect cultural values or sensitivities"] ],
      help: {
        instructions: "For each action, choose whether it is culturally acceptable, may raise concerns, is not acceptable, or unknown. Base this on what you know, or what Traditional Owners with authority for this Country have told you.",
        examples: "✅ Acceptable – planting local food trees that Traditional Owners also use.\n⚠️ May raise concerns – works near a culturally significant place.\n⛔ Not acceptable – disturbing a sacred site.\n❔ Unknown – not yet discussed with Traditional Owners.",
        guidance: "This is not part of the score, but it should be weighed in the decision. Where possible, check with Traditional Owners rather than assuming; ‘Unknown’ is a prompt to have that conversation. Follow Traditional Owner protocols and the principle of free, prior and informed consent. Do not record culturally sensitive or restricted information here.",
        moreInfo: null } },
    criteria: [
      { id: "implement", label: "Ability to implement", short: "Implement",
        help: {
          instructions: "Do we have the people, skills, equipment, access and approvals to carry out this action?",
          examples: "🟢 3 Good – can start now with existing people, skills and permissions\n🟡 2 OK – possible with some extra training, equipment or permits\n🔴 1 Bad – major gaps in capacity or approvals, or no authority to act\n⚪ 0 Unknown – not enough information to judge yet",
          guidance: "Consider who would do the work, land access and tenure, and any permits (e.g. for vegetation clearing or wildlife handling).",
          moreInfo: null } },
      { id: "cost", label: "Cost", short: "Cost", note: "3 = lowest cost",
        help: {
          instructions: "How expensive is the action to set up and maintain? A higher score means a lower cost.",
          examples: "🟢 3 Good – low cost, covered by existing budgets or in-kind effort\n🟡 2 OK – moderate cost, within a typical small grant\n🔴 1 Bad – high cost, needs a major grant or has no likely funding source\n⚪ 0 Unknown – costs not yet known",
          guidance: "Include ongoing costs (maintenance, monitoring, follow-up weed control), not just set-up. Agree dollar ranges for each score within your group so scores are consistent between plans.",
          moreInfo: null } },
      { id: "feasible", label: "Feasible", short: "Feasible",
        help: {
          instructions: "Is the action practical in the conditions at this site or area?",
          examples: "🟢 3 Good – proven method that suits the site conditions and timing\n🟡 2 OK – practical with some challenges (e.g. wet-season access)\n🔴 1 Bad – difficult or not practical here\n⚪ 0 Unknown – untested or not enough information",
          guidance: "Consider terrain, access, seasonal timing, the time before benefits appear, and whether the method has worked in similar places. Check the pre-conditions the action needs (Pathway planning tab, in each action’s pathway form).",
          moreInfo: null } },
      { id: "effective", label: "Effective", short: "Effective",
        help: {
          instructions: "How much will the action reduce the risk from priority climate hazards?",
          examples: "🟢 3 Good – strong evidence it reduces risk from one or more High/Very high hazards, with lasting benefit\n🟡 2 OK – likely to give a moderate benefit\n🔴 1 Bad – small benefit, or unlikely to reduce climate risk\n⚪ 0 Unknown – little or no evidence either way",
          guidance: "Base the score on evidence where possible (recovery plans, AdaptLog, scientific studies, local experience). Consider whether the benefit will last as the climate keeps changing.",
          moreInfo: null } },
      { id: "social", label: "Socially acceptable", short: "Social",
        help: {
          instructions: "Will landholders, neighbours, the community and other stakeholders support the action?",
          examples: "🟢 3 Good – strong support from landholders and community\n🟡 2 OK – general support with some concerns\n🔴 1 Bad – mixed views or likely opposition\n⚪ 0 Unknown – not yet discussed with the people affected",
          guidance: "Consider effects on neighbours, industries (e.g. grazing, tourism), access and amenity. Early engagement can often raise this score.",
          moreInfo: null } },
      { id: "risk", label: "Risk of negative consequences", short: "Risk", note: "3 = lowest risk",
        help: {
          instructions: "Could the action cause harm to the species, other species, people or the environment? A higher score means a lower risk.",
          examples: "🟢 3 Good – negligible risk of harm\n🟡 2 OK – minor risks that can be managed\n🔴 1 Bad – significant risk of harm or maladaptation\n⚪ 0 Unknown – risks not yet understood",
          guidance: "Watch for maladaptation, i.e. actions that increase vulnerability in the long run. Examples are artificial feeding that causes dependence or disease spread, water points that attract predators or weeds, and planting species that will not suit the future climate.",
          moreInfo: null } },
      { id: "cobenefits", label: "Positive co-benefits", short: "Co-benefits",
        help: {
          instructions: "Does the action bring other benefits beyond this species?",
          examples: "🟢 3 Good – major benefits for other species, people or Country\n🟡 2 OK – some additional benefits\n🔴 1 Bad – few or no additional benefits\n⚪ 0 Unknown – not yet considered",
          guidance: "Co-benefits include habitat for other threatened species, water quality, carbon storage, cultural practice and caring for Country, ranger employment, tourism, and community wellbeing.",
          moreInfo: null } }
    ]
  },

  /* ---------------- TAB 6: PATHWAY PLANNING ---------------- */
  pathway: {
    title: "Pathway planning",
    intro: "Which actions need to happen now, which are needed as climate risk increases, and at what point do we need to change or stop an action? Draw each action as a line along increasing climate risk (light = low, dark = extreme), then click the line to fill in its pathway.",
    help: {
      instructions: "Add a line for each action you plan to carry forward, usually the higher-scoring ones. Click a line (or its name) to open its pathway form: note what must be in place first, set goals, and define the signals that tell you to start, change or stop. Then add a trigger, turning point or stopping point on the line at the level of climate risk where you would act, drag points to adjust them, and branch off a new line for an improved or additional action.",
      examples: "Spectacled flying-fox worked example:\n• Plant canopy around the roost (Now). Pre-conditions: cleared land next to the roost that is free of buildings and roads, landholder or council agreement, seedlings. Trigger: next wet-season planting window. Turning point (high risk): seedling survival below 50% after two wet seasons → switch to heat-tolerant species and water seedlings. Stop: canopy closed and self-sustaining.\n• Restore food trees across the landscape (Later). Trigger (moderate risk): a severe cyclone within 50 km, or funding secured. Turning point (very high risk): two years in a row of food shortages → regional food-tree program.\n• Heat-stress response protocol (Now). Turning point (high risk): deaths above about 5% of the roost → add shade planting and loggers; last resort at extreme risk: misting, only after talking with Traditional Owners.",
      exampleStep: "pathways",
      guidance: "An adaptation pathway is a sequence of actions linked by decision points. Instead of fixed dates, decisions are tied to the level of climate risk: do this now, watch for these signals, and switch to the next action when risk reaches a turning point. Triggers and turning points should be things you can observe or measure, ideally with existing monitoring.",
      moreInfo: "",
      links: [
        ["Adaptation Pathways: a playbook for climate change adaptation in Natural Resource Management (AdaptNRM)", "https://research-repository.rmit.edu.au/articles/report/Adaptation_Pathways_a_playbook_for_developing_robust_options_for_climate_change_adaptation_in_Natural_Resource_Management_/27350091"],
        ["Pathways to prepare for and manage global change (CSIRO)", "https://www.csiro.au/en/news/all/articles/2016/july/pathways-prepare-manage-global-change"] ] },
    // Climate risk scale used as the x-axis of the pathway maps (light = low risk, dark = extreme).
    // Positions are stored as 0-100; each band covers an equal share of the axis.
    risk: {
      axisLabel: "Climate risk",
      bands: [
        { label: "Low", color: "#fff4c2", text: "#5a4a00" },
        { label: "Moderate", color: "#fdd08a", text: "#5a3a00" },
        { label: "High", color: "#f39a4c", text: "#4a2200" },
        { label: "Very high", color: "#d4552a", text: "#ffffff" },
        { label: "Extreme", color: "#8e1f12", text: "#ffffff" } ] },
    fields: [
      { id: "timing", label: "When", type: "select", options: ["Now", "Later"],
        help: {
          instructions: "Now = start straight away (or already started). Later = start when the trigger is reached. This sorts actions into the NOW and LATER boxes on the summary page.",
          examples: "",
          guidance: "Actions that are low-cost, low-risk and useful under any future (“no regrets” actions) should usually start now.",
          moreInfo: null } },
      { id: "preconditions", label: "Pre-conditions (enabling conditions)", type: "textarea", rows: 2,
        help: {
          instructions: "What must already be in place for this action to work? List the land, approvals, people, funding, materials or partnerships it depends on.",
          examples: "Reforestation: cleared land available that is not built on or needed for other uses, and landholder agreement.\nWorks in a roost: council and state approvals, and works timed outside the breeding season.\nRevegetation: seed or seedlings of suitable local species, and follow-up watering and weed control.",
          guidance: "If a pre-condition is not yet met, getting it in place may be the first step (e.g. negotiating access or applying for a permit). An action cannot start, even when its trigger is reached, until its pre-conditions are in place.",
          moreInfo: null } },
      { id: "shortGoal", label: "Short term goal", type: "textarea", rows: 2,
        help: {
          instructions: "What should this action achieve in the next 1–5 years? Make it specific and measurable.",
          examples: "Revegetate 5 ha of corridor with 80% seedling survival by 2028.\nNo koala road deaths on the access road for two years.",
          guidance: "Use the SMART test: specific, measurable, achievable, relevant, time-bound. The short-term goal should be a step towards the long-term goal.",
          moreInfo: null } },
      { id: "longGoal", label: "Long term goal", type: "textarea", rows: 2,
        help: {
          instructions: "What outcome do you want for the species at this site in 10–30 years?",
          examples: "A stable or increasing local population with connected habitat between cool refuges.\nCool refuges on the property continue to support possums through heatwaves.",
          guidance: "Frame it as an outcome for the species, not an activity. It should stay relevant as the climate changes.",
          moreInfo: null } },
      { id: "trigger", label: "Trigger", type: "textarea", rows: 2,
        help: {
          instructions: "The level of climate risk, or the sign of it, at which to start the action. Or write \u2018action already started\u2019.",
          examples: "Action already started.\nBureau of Meteorology severe heatwave warning for the area.\nA category 3+ cyclone crosses within 50 km of the site.\nFruit counts on monitoring transects fall below the dry-season baseline.",
          guidance: "A good trigger is observable, measurable and linked to monitoring someone is already doing. Allow enough lead time to act, e.g. prepare a heat response before the hottest months.",
          moreInfo: null } },
      { id: "turning", label: "Turning point", type: "textarea", rows: 2,
        help: {
          instructions: "The level of climate risk, or the sign of it, at which this action is no longer enough and needs to be improved or added to.",
          examples: "Two consecutive annual surveys show numbers falling despite the action.\nHeatwave deaths recorded in two consecutive summers.\nPlanted corridor seedlings below 50% survival after two wet seasons.",
          guidance: "A turning point is when the current action is no longer enough. Set it early enough to prepare the next action before conditions become critical.",
          moreInfo: null } },
      { id: "improved", label: "Improved / additional action", type: "textarea", rows: 2,
        help: {
          instructions: "What will you do instead of, or as well as, this action when the turning point is reached?",
          examples: "Expand the corridor to connect with the national park.\nAdd shade planting and a heat-stress response team for the flying-fox camp.\nSwitch to more heat- and drought-tolerant local plant species for revegetation.",
          guidance: "This could be scaling up, changing the method, or a different action. It may already be listed as a potential action on the Actions tab.",
          moreInfo: null } },
      { id: "stopping", label: "Stopping point", type: "textarea", rows: 2,
        help: {
          instructions: "What to look for to know when to stop this action.",
          examples: "Corridor canopy closed and self-sustaining for three years with no weed follow-up needed.\nThe action is shown to cause harm, e.g. disease at feeding stations.\nThe species no longer uses the site despite all actions.",
          guidance: "Stop when the goal is achieved, when the action is no longer effective, or when it causes harm. Stopping points prevent effort being wasted on actions that no longer work.",
          moreInfo: null } }
    ]
  },

  /* ---------------- TAB 7: SUMMARY ---------------- */
  summary: {
    title: "Summary",
    intro: "A one-page summary of the plan. Use “Draft from earlier tabs” to fill the boxes from your answers, then edit the wording.",
    help: {
      instructions: "Press “Draft from earlier tabs” to fill each box from your answers, then edit the text into short, clear points. Upload a photo of the species.",
      examples: "",
      guidance: "The summary page is often the only page people read. It should stand alone and be understood by landholders, rangers and funders. Aim for 2–4 short bullet points per box, using plain language.",
      moreInfo: "" },
    photoHelp: {
      instructions: "Upload a photo of the species (JPG or PNG). Add a caption and a photo credit if the photo is not your own.",
      examples: "Caption: Adult koala, [location]\nCredit: J. Smith",
      guidance: "Use a clear, well-lit photo, ideally taken at or near the site. Make sure you have permission to use it. Portrait-shaped photos fit the summary layout best. Other photos are cropped to the poster’s photo box (3:4): use the crop position slider to keep the animal in view, or choose “Show the whole photo” to avoid cropping.",
      moreInfo: null },
    boxes: [
      { id: "hazards", label: "Key climate hazards",
        help: {
          instructions: "List the High and Very high priority hazards from the Risk assessment.",
          examples: "• Heatwaves (Very high)\n• Cyclones (High)",
          guidance: "Order them from highest to lowest priority. Keep to the 2–4 hazards that matter most.",
          moreInfo: "" } },
      { id: "impacts", label: "Impacts of key climate hazards",
        help: {
          instructions: "Summarise how each key hazard affects the species.",
          examples: "• Heatwaves: heat stress and deaths at the roost\n• Cyclones: loss of fruit for months, with birds moving onto roads",
          guidance: "One line per hazard, focused on the most serious effect.",
          moreInfo: "" } },
      { id: "triggers", label: "Key climate triggers",
        help: {
          instructions: "List the main signals that start actions.",
          examples: "• BoM severe heatwave warning\n• Category 3+ cyclone within 50 km",
          guidance: "Include only triggers that someone is responsible for watching.",
          moreInfo: "" } },
      { id: "turning", label: "Key turning / stopping points",
        help: {
          instructions: "List the signals that mean an action must be changed, scaled up or stopped.",
          examples: "• Numbers fall for two years in a row → add corridor expansion\n• Corridor self-sustaining → stop planting",
          guidance: "Show what happens next after each point, where possible.",
          moreInfo: "" } },
      { id: "longGoals", label: "Long term goals",
        help: {
          instructions: "State the long-term outcome(s) for the species at this site.",
          examples: "• Stable local population with connected habitat from coast to uplands",
          guidance: "One or two goals are enough.",
          moreInfo: "" } },
      { id: "shortGoals", label: "Short term goals",
        help: {
          instructions: "List the measurable goals for the next 1–5 years.",
          examples: "• 5 ha corridor planted with 80% survival by 2028\n• Zero road deaths for two years",
          guidance: "Use goals that can be checked when the plan is reviewed.",
          moreInfo: "" } },
      { id: "cultural", label: "Cultural considerations",
        help: {
          instructions: "Note cultural values, protocols and responsibilities that affect how the plan is carried out.",
          examples: "• Totem species; Traditional Owners to lead decisions on handling\n• Ranger group to be engaged for all on-ground works\n• Seasonal restrictions on access to a cultural site",
          guidance: "Agree the wording with Traditional Owners. Do not include culturally sensitive information in a report that will be shared widely.",
          moreInfo: "" } },
      { id: "now", label: "Actions — NOW",
        help: {
          instructions: "List the actions to start now or continue.",
          examples: "• Feral pig control (ongoing)\n• Begin corridor revegetation",
          guidance: "Add who is responsible, where known.",
          moreInfo: "" } },
      { id: "later", label: "Actions — LATER",
        help: {
          instructions: "List actions that will start when a trigger or turning point is reached.",
          examples: "• Emergency feeding after a severe cyclone (with the department)\n• Expand the corridor to the national park",
          guidance: "Include the trigger in brackets so readers know when each action starts.",
          moreInfo: "" } }
    ]
  }
};
