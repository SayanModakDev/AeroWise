import {
  ActionCategory,
  ActionPriority,
  CostTier,
  EffortLevel,
  TimeContext,
} from '@/types/recommendations';

export interface ActionDefinition {
  id: string;
  baseTitle: string;
  category: ActionCategory;
  defaultPriority: ActionPriority;
  defaultTimeContext: TimeContext;
  costTier: CostTier;
  estimatedEffort: EffortLevel;
  evidenceSource: string;
  limitations: string;
  whatToDoTemplate: string;
  whyRelevantNowTemplate: string;
  exposureProtectionImpact: string;
  emissionsReductionImpact: string;
  expectedBenefit: string;
}

export const ACTION_CATALOG: ActionDefinition[] = [
  // 1. PROTECT YOUR HOUSEHOLD
  {
    id: 'reschedule_outdoor_errands',
    baseTitle: 'Shift Outdoor Errands to Lower-Pollution Afternoon Hours',
    category: 'protect_household',
    defaultPriority: 'high',
    defaultTimeContext: 'afternoon',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'WHO Air Quality Guidelines (2021) & Urban Inversion Dynamics',
    limitations:
      'Afternoon trough hours still carry elevated pollutant loads in severe smog; lower does not mean harmless.',
    whatToDoTemplate:
      'Postpone non-essential outdoor errands and exercise away from early morning (06:00–09:00) and late evening (19:00–22:00) when winter temperature inversion traps particulate matter at ground level. Carry out essential tasks between 12:00 and 15:30.',
    whyRelevantNowTemplate:
      'Current forecast indicates diurnal temperature inversion and nocturnal calm conditions that concentrate PM2.5 in morning and evening hours.',
    exposureProtectionImpact:
      'Avoids breathing air during peak diurnal surface pollution spikes, lowering total daily particulate inhalation volume.',
    emissionsReductionImpact:
      'Zero direct emissions impact, but reduces vehicle trips during peak morning traffic gridlock.',
    expectedBenefit:
      'Significantly lowers personal intake of coarse and fine respirable particulates without financial cost.',
  },
  {
    id: 'well_fitted_n95_protection',
    baseTitle: 'Wear a Certified N95/FFP2 Particulate Respirator for Transit',
    category: 'protect_household',
    defaultPriority: 'critical',
    defaultTimeContext: 'commuting',
    costTier: 'low_cost',
    estimatedEffort: 'low',
    evidenceSource: 'NIOSH / BIS (IS 9473) Particulate Filtering Standards',
    limitations:
      'Cloth and surgical masks do not filter sub-micron PM2.5. Requires proper seal around nose and chin; facial hair reduces seal efficiency.',
    whatToDoTemplate:
      'Use a well-fitted certified N95 or FFP2 particulate respirator during outdoor walking, motorcycle riding, or public transit. Ensure a snug seal across the nose bridge and jaw line. Store in a clean paper bag between uses.',
    whyRelevantNowTemplate:
      'Modelled ambient PM2.5 concentration substantially exceeds healthy thresholds, posing immediate airway inflammation risks during active transit.',
    exposureProtectionImpact:
      'Certified electrostatic micro-fiber media filters at least 95% of non-oily fine airborne particulates (0.3 µm) when properly fitted.',
    emissionsReductionImpact:
      'Personal protective measure; produces no direct ambient emissions reduction.',
    expectedBenefit:
      'Substantially attenuates deep alveolar deposition of toxic combustion soot and fine dust particles.',
  },
  {
    id: 'vulnerable_exposure_restriction',
    baseTitle: 'Restrict Strenuous Physical Exertion for Vulnerable Family Members',
    category: 'protect_household',
    defaultPriority: 'critical',
    defaultTimeContext: 'morning',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'Indian CPCB Health Advisories & WHO Child Health Guidelines',
    limitations:
      'Requires cooperative indoor engagement for young children; ensure indoor air sources are simultaneously controlled.',
    whatToDoTemplate:
      'Keep children under 5, senior citizens, pregnant members, and anyone with asthma or cardiovascular conditions indoors during peak smog hours. Replace outdoor sports or walking with gentle indoor activities.',
    whyRelevantNowTemplate:
      'Vulnerable household profiles have higher minute-ventilation relative to lung surface area and higher susceptibility to microvascular inflammation.',
    exposureProtectionImpact:
      'Reduces pulmonary ventilation rate by up to 500% compared to vigorous outdoor exercise, drastically cutting inhaled dose.',
    emissionsReductionImpact:
      'No direct environmental emissions reduction; focused entirely on biological protection.',
    expectedBenefit:
      'Mitigates acute bronchial spasms, asthma flare-ups, and cardiovascular strain during extreme pollution events.',
  },

  // 2. IMPROVE INDOOR AIR
  {
    id: 'eliminate_incense_mosquito_coils',
    baseTitle: 'Extinguish Incense Sticks & Smouldering Mosquito Coils',
    category: 'indoor_air',
    defaultPriority: 'critical',
    defaultTimeContext: 'at_home',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'EPA Indoor Air Quality Guidelines & WHO Indoor Particulate Studies',
    limitations:
      'Requires switching to non-combustion pest prevention such as bed nets or window wire mesh.',
    whatToDoTemplate:
      'Discontinue burning agarbatti (incense sticks), dhoop, scented candles, and smouldering mosquito coils inside living areas. Switch to non-burning mosquito nets, liquid vaporizers, or physical window mesh screens.',
    whyRelevantNowTemplate:
      'A single smouldering mosquito coil produces particulate emissions equivalent to 75–100 cigarettes, creating extreme indoor PM2.5 spikes.',
    exposureProtectionImpact:
      'Eliminates an intense, continuous indoor combustion point-source right in breathing zones.',
    emissionsReductionImpact:
      'Stops indoor smoke generation completely, removing polycyclic aromatic hydrocarbons (PAHs) from room air.',
    expectedBenefit:
      'Immediate, dramatic drop in indoor PM2.5 and benzene concentrations without spending extra money.',
  },
  {
    id: 'biomass_fuel_transition',
    baseTitle: 'Transition Biomass/Wood/Coal Cooking to LPG or Induction',
    category: 'indoor_air',
    defaultPriority: 'critical',
    defaultTimeContext: 'at_home',
    costTier: 'optional_purchase',
    estimatedEffort: 'high',
    evidenceSource: 'WHO Guidelines for Indoor Air Quality: Household Fuel Combustion (2014)',
    limitations:
      'Fuel transitions depend on local fuel affordability and reliable electrical supply.',
    whatToDoTemplate:
      'Shift cooking away from solid fuels (chulhas, firewood, dung cakes, raw coal) toward LPG cylinders or induction cooktops. If solid fuel is unavoidable, cook in an open or well-ventilated outhouse, never in an enclosed family room.',
    whyRelevantNowTemplate:
      'Solid biomass combustion releases massive concentrations of PM2.5, carbon monoxide, and toxic volatile organics directly into living quarters.',
    exposureProtectionImpact:
      'Reduces household particulate exposure by orders of magnitude for cooks and young children nearby.',
    emissionsReductionImpact:
      'Cuts black carbon and carbon monoxide emissions that also contribute heavily to localized neighbourhood smog.',
    expectedBenefit:
      'Protects against chronic obstructive pulmonary disease (COPD), cataracts, and childhood acute respiratory infections.',
  },
  {
    id: 'kitchen_exhaust_protocol',
    baseTitle: 'Operate Kitchen Exhaust Fan During & 15 Minutes After Cooking',
    category: 'indoor_air',
    defaultPriority: 'high',
    defaultTimeContext: 'at_home',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'Lawrence Berkeley National Laboratory Kitchen Ventilation Research',
    limitations:
      'Exhaust creates slight negative pressure; ensure make-up air comes from clean interior rooms rather than smoggy street.',
    whatToDoTemplate:
      'Turn on your kitchen exhaust fan or chimney on high speed before igniting burners and keep it running for at least 15 minutes after cooking completes. Keep kitchen doors closed to living and sleeping spaces while cooking.',
    whyRelevantNowTemplate:
      'Deep frying, tadka/tempering, and oil vaporisation release high ultrafine particulate and nitrogen dioxide bursts.',
    exposureProtectionImpact:
      'Expels cooking aerosols and combustion byproducts at the source before they disperse across bedrooms and living spaces.',
    emissionsReductionImpact:
      'Prevents indoor accumulation; does not alter total ambient outdoor load.',
    expectedBenefit:
      'Reduces indoor particulate accumulation from culinary oils and gas burners by 60–80%.',
  },
  {
    id: 'conditional_natural_ventilation',
    baseTitle: 'Practice Timed Cross-Ventilation During Midday Trough',
    category: 'indoor_air',
    defaultPriority: 'medium',
    defaultTimeContext: 'afternoon',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'CIBSE Indoor Air Quality & Natural Ventilation Standards',
    limitations:
      'Never open windows during morning traffic rush hours or when outdoor PM2.5 exceeds 200 µg/m³.',
    whatToDoTemplate:
      'Keep windows and doors securely closed during morning and evening rush hours when outdoor pollution peaks. Open windows on the leeward (sheltered) side of the home for 15–20 minutes between 13:00 and 15:00 to refresh stale air and flush indoor CO2, then re-seal.',
    whyRelevantNowTemplate:
      'Homes sealed 24/7 accumulate dangerous levels of indoor CO2, moisture, and VOCs if not selectively ventilated.',
    exposureProtectionImpact:
      'Prevents outdoor peak smog penetration while preventing severe indoor carbon dioxide build-up.',
    emissionsReductionImpact:
      'Zero energy consumption; avoids continuous mechanical ventilation when outdoor air is clean enough.',
    expectedBenefit:
      'Maintains healthy indoor oxygen and moisture levels without flooding the home with traffic exhaust.',
  },
  {
    id: 'wet_mopping_dust_control',
    baseTitle: 'Switch from Dry Broom Sweeping to Microfiber Wet Mopping',
    category: 'indoor_air',
    defaultPriority: 'high',
    defaultTimeContext: 'morning',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'EPA Cleaning Guidelines for Indoor Particulate Control',
    limitations:
      'Must use clean water and wring mop damp, not soaking wet, to prevent fungal moisture build-up.',
    whatToDoTemplate:
      'Do not use dry straw brooms (jhadu) or dry feather dusters inside the home during high pollution days, as they resuspend settled fine dust into the breathing zone. Clean floors and surfaces using a damp microfiber cloth or wet mop.',
    whyRelevantNowTemplate:
      'Dry sweeping aerosolizes settled heavy particulate matter and toxic road dust tracked in on shoes.',
    exposureProtectionImpact:
      'Traps fine dust in liquid media rather than projecting respirable particles back into household room air.',
    emissionsReductionImpact:
      'Household source mitigation; eliminates re-suspension of settled urban dust.',
    expectedBenefit:
      'Drastically reduces resuspension of toxic heavy metals, soil dust, and micro-particles in indoor living spaces.',
  },
  {
    id: 'purifier_hepa_optimization',
    baseTitle: 'Optimize Air Purifier Placement & Avoid Ozone-Generating Devices',
    category: 'indoor_air',
    defaultPriority: 'high',
    defaultTimeContext: 'at_home',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'AHAM AC-1 Clean Air Delivery Rate (CADR) Standard & US EPA',
    limitations:
      'Effective only for enclosed rooms; opening windows while running an air purifier wastes filter capacity.',
    whatToDoTemplate:
      'Position your mechanical HEPA air purifier away from walls and corners, ideally near the center of your primary bedroom or where family gathers. Keep room doors and windows closed. Check that pre-filters are vacuumed. Never use ionizers, plasma clusters, or ozone-generating sanitizers, as ozone is a severe lung irritant.',
    whyRelevantNowTemplate:
      'Elevated outdoor particulate requires maintaining at least one clean air refuge room for restorative sleep.',
    exposureProtectionImpact:
      'True HEPA (H13/H14) captures 99.97% of fine particles through mechanical impaction, interception, and diffusion.',
    emissionsReductionImpact:
      'Zero emission reduction; electricity consumption should be balanced by running on low/auto once room air clears.',
    expectedBenefit:
      'Creates a low-particulate micro-environment that reduces nocturnal airway irritation and promotes restorative rest.',
  },
  {
    id: 'ac_recirculation_protocol',
    baseTitle: 'Set Split AC to Recirculation Mode with Clean Mesh Filters',
    category: 'indoor_air',
    defaultPriority: 'medium',
    defaultTimeContext: 'at_home',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'ASHRAE Epidemic & Air Quality Task Force Guidance',
    limitations:
      'Standard split AC mesh filters remove only coarse dust and hair, not fine PM2.5, unless fitted with specialized PM2.5 filter inserts.',
    whatToDoTemplate:
      'Ensure your split AC or car climate control is switched to internal recirculation mode (loop arrow icon) rather than fresh air intake. Wash coarse dust mesh filters under running water and dry completely before reinserting.',
    whyRelevantNowTemplate:
      'Fresh-air intake modes continuously draw untreated outdoor smog and traffic fumes directly into the room.',
    exposureProtectionImpact:
      'Blocks direct motorized induction of polluted outdoor air into climate-controlled indoor spaces.',
    emissionsReductionImpact:
      'Maintains cooling efficiency with reduced thermodynamic load.',
    expectedBenefit:
      'Prevents forced draft introduction of ambient vehicle exhaust into living and sleeping quarters.',
  },

  // 3. PLAN OUTDOOR ACTIVITIES
  {
    id: 'indoor_exercise_substitution',
    baseTitle: 'Substitute Outdoor Running/Cycling with Low-Impact Indoor Workouts',
    category: 'outdoor_planning',
    defaultPriority: 'high',
    defaultTimeContext: 'morning',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'European Heart Journal & WHO Physical Activity in Polluted Air Guidelines',
    limitations:
      'Keep indoor exercise room ventilated with filtered or dust-controlled air; do not exercise near kitchen smoke.',
    whatToDoTemplate:
      'Cancel outdoor marathons, morning jogging, and cycling along major roads during elevated smog. Substitute with indoor yoga, bodyweight strength workouts, stretching, or resistance exercises in an enclosed room.',
    whyRelevantNowTemplate:
      'Strenuous aerobic exercise triggers mouth breathing, bypassing nasal filtration and increasing deep alveolar lung deposition of combustion soot by 400–600%.',
    exposureProtectionImpact:
      'Maintains normal resting tidal volume instead of hyper-ventilating toxic outdoor air.',
    emissionsReductionImpact:
      'Eliminates vehicle travel to outdoor parks and running tracks.',
    expectedBenefit:
      'Prevents exercise-induced bronchoconstriction, exercise-triggered asthma attacks, and microvascular stress.',
  },
  {
    id: 'avoid_busy_transit_corridors',
    baseTitle: 'Reroute Walking & Cycling to Tree-Lined Residential By-Lanes',
    category: 'outdoor_planning',
    defaultPriority: 'medium',
    defaultTimeContext: 'afternoon',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'Atmospheric Environment Corridors & Roadside Dispersion Studies',
    limitations:
      'Only applicable for essential local trips; in severe smog, outdoor transit should be minimized regardless of route.',
    whatToDoTemplate:
      'If you must walk or cycle for local errands, avoid multi-lane arterial roads, diesel truck corridors, and congested signal intersections. Choose parallel residential service lanes situated at least 50–100 meters away from bumper-to-bumper traffic.',
    whyRelevantNowTemplate:
      'Black carbon and ultrafine particle concentrations drop steeply (by 40–70%) within 50 to 100 meters away from congested tailpipes.',
    exposureProtectionImpact:
      'Avoids hyper-local concentration spikes from fresh vehicle tailpipe emissions and resuspended brake dust.',
    emissionsReductionImpact:
      'Active walking or cycling for local errands avoids short, cold-start vehicular trips.',
    expectedBenefit:
      'Substantially cuts peak inhalation of carcinogenic polycyclic aromatic hydrocarbons and heavy metals.',
  },

  // 4. CHOOSE CLEANER MOBILITY
  {
    id: 'trip_chaining_consolidation',
    baseTitle: 'Combine Multiple Errand Drives into a Single Consolidated Trip',
    category: 'cleaner_mobility',
    defaultPriority: 'medium',
    defaultTimeContext: 'afternoon',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'EPA Emission Factors for Cold Starts & Urban Fleet Modeling',
    limitations:
      'Requires planning family needs in advance across groceries, banking, and pickups.',
    whatToDoTemplate:
      'Group your grocery, medical, and delivery errands into one planned afternoon circuit rather than making 3–4 individual spontaneous outings. Plan routes in a loop to eliminate backtracking.',
    whyRelevantNowTemplate:
      'Vehicles emit up to 80% of their trip emissions during the first 5 minutes of cold start before the catalytic converter reaches operating temperature.',
    exposureProtectionImpact:
      'Reduces the total duration and frequency of personal exposure to roadside traffic exhaust.',
    emissionsReductionImpact:
      'Prevents multiple cold-engine starts and reduces overall vehicle kilometers travelled in the community.',
    expectedBenefit:
      'Saves fuel, cuts local tailpipe emissions, and reduces time spent sitting in traffic pollution.',
  },
  {
    id: 'prefer_electric_metro_rail',
    baseTitle: 'Opt for Grade-Separated Metro Rail or Shared Public Transit',
    category: 'cleaner_mobility',
    defaultPriority: 'high',
    defaultTimeContext: 'commuting',
    costTier: 'low_cost',
    estimatedEffort: 'medium',
    evidenceSource: 'IPCC Working Group III Urban Transport Mitigation & CSE India',
    limitations:
      'Subject to local transit network coverage and station proximity.',
    whatToDoTemplate:
      'Replace solo automobile or two-wheeler commutes with underground/elevated electric metro rail or suburban trains. If using feeder buses, prefer non-peak connections with contactless ticketing.',
    whyRelevantNowTemplate:
      'Two-wheeler riders and pedestrians on congested roadways face 3× higher peak particulate exposure than riders inside filtered underground metro systems.',
    exposureProtectionImpact:
      'Protects commuters from street-level tailpipe exhaust plumes and toxic diesel soot concentrations.',
    emissionsReductionImpact:
      'Per-passenger-kilometer emissions on electric rail are 70–85% lower than single-occupancy private motor vehicles.',
    expectedBenefit:
      'Reduces your carbon and particulate footprint while keeping your commute out of bumper-to-bumper traffic smog.',
  },
  {
    id: 'two_wheeler_commute_mitigation',
    baseTitle: 'Upgrade Two-Wheeler Commute with Sealed Mask & Visor',
    category: 'cleaner_mobility',
    defaultPriority: 'critical',
    defaultTimeContext: 'commuting',
    costTier: 'low_cost',
    estimatedEffort: 'low',
    evidenceSource: 'Occupational Roadway Exposure Studies & IIT Delhi Commuter Aerosol Profiling',
    limitations:
      'Visors block coarse dust and wind but do not filter airborne gases or sub-micron PM2.5; mask is essential.',
    whatToDoTemplate:
      'If motorcycle or scooter transit is unavoidable, wear a snug-fitting N95 respirator beneath a full-face helmet with the visor closed. Keep distance from diesel exhaust tailpipes of trucks and buses at red lights.',
    whyRelevantNowTemplate:
      'Open two-wheeler riders suffer the highest direct aerosol and toxic gas doses of any commuter category in urban traffic.',
    exposureProtectionImpact:
      'Prevents direct aerodynamic impingement of coarse road gravel, tire micro-plastics, and hot tailpipe soot into eyes, nose, and trachea.',
    emissionsReductionImpact:
      'Protective commuter protocol; ensure motorcycle carburetor/fuel injectors are serviced to avoid smoky exhaust.',
    expectedBenefit:
      'Protects the respiratory tract against severe roadside smog and toxic black carbon plumes.',
  },

  // 5. REDUCE HOUSEHOLD EMISSIONS
  {
    id: 'anti_idling_switch_off',
    baseTitle: 'Switch Off Engine at Traffic Signals Exceeding 20 Seconds',
    category: 'reduce_emissions',
    defaultPriority: 'medium',
    defaultTimeContext: 'commuting',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'Petroleum Conservation Research Association (PCRA) & US DOE',
    limitations:
      'Ensure vehicle battery and starter motor are in good condition.',
    whatToDoTemplate:
      'Turn off your car or motorcycle ignition whenever stopped at traffic signals with red timers longer than 20 seconds or while waiting outside school gates and railway crossings.',
    whyRelevantNowTemplate:
      'Idling vehicles produce incomplete combustion, releasing higher toxic carbon monoxide, unburnt hydrocarbons, and fine soot right into pedestrian breathing zones.',
    exposureProtectionImpact:
      'Reduces tailpipe exhaust accumulating immediately around your own vehicle and following commuters.',
    emissionsReductionImpact:
      'Eliminates 100% of fuel combustion and greenhouse gas emissions during prolonged standstill intervals.',
    expectedBenefit:
      'Saves fuel, reduces localized toxic street-level concentration spikes, and prolongs engine oil life.',
  },
  {
    id: 'servicing_tire_pressure_efficiency',
    baseTitle: 'Inspect Tire Pressure & Clean Engine Air Filters',
    category: 'reduce_emissions',
    defaultPriority: 'medium',
    defaultTimeContext: 'at_home',
    costTier: 'low_cost',
    estimatedEffort: 'medium',
    evidenceSource: 'Bureau of Energy Efficiency (BEE) Automotive Standards',
    limitations:
      'Maintenance should be performed according to manufacturer specification.',
    whatToDoTemplate:
      'Check vehicle tire pressures monthly to recommended cold PSI ratings and have your engine air filter inspected. An under-inflated tire increases rolling resistance and tailpipe emissions.',
    whyRelevantNowTemplate:
      'Proper rolling resistance and optimal fuel-air stoichiometry minimize soot formation in urban stop-and-go driving.',
    exposureProtectionImpact:
      'Reduces engine strain and toxic unburnt hydrocarbon emissions in your immediate neighbourhood.',
    emissionsReductionImpact:
      'Improves fuel economy by 3–5%, cutting both CO2 and particulate emissions proportionally.',
    expectedBenefit:
      'Maximizes fuel mileage, lowers operating costs, and keeps vehicular exhaust within specified emission norms.',
  },

  // 6. COMMUNITY ACTION
  {
    id: 'school_idle_free_zone',
    baseTitle: 'Organize an "Idle-Free School Gate" Parent Initiative',
    category: 'community_action',
    defaultPriority: 'high',
    defaultTimeContext: 'morning',
    costTier: 'free',
    estimatedEffort: 'medium',
    evidenceSource: 'UNEP Clean Air for Children & EPA Clean School Bus Program',
    limitations:
      'Requires cooperative coordination with school parent-teacher associations (PTAs) and security guards.',
    whatToDoTemplate:
      'Collaborate with your school administration or parent WhatsApp group to establish an "Idle-Free Zone" at student pickup and drop-off gates. Request parents and van drivers to turn off vehicle engines while parked and waiting.',
    whyRelevantNowTemplate:
      'School pickup zones frequently record particulate spikes 300–500% higher than surrounding urban areas due to dozens of idling family cars and vans.',
    exposureProtectionImpact:
      'Directly safeguards young children whose developing lungs are located at the exact height of vehicle exhaust pipes.',
    emissionsReductionImpact:
      'Cuts localized tailpipe emissions during the concentrated 30-minute school dismissal window.',
    expectedBenefit:
      'Creates a clean air sanctuary zone where children embark and disembark safely without breathing dense exhaust fumes.',
  },
  {
    id: 'report_stop_open_waste_burning',
    baseTitle: 'Report & Prevent Open Garbage and Leaf Burning in Your Sector',
    category: 'community_action',
    defaultPriority: 'high',
    defaultTimeContext: 'evening',
    costTier: 'free',
    estimatedEffort: 'low',
    evidenceSource: 'National Green Tribunal (NGT) Directives & CPCB Waste Management Rules',
    limitations:
      'Report through municipal apps (e.g. Sameer, MCD 311) without confronting aggressive violators directly.',
    whatToDoTemplate:
      'Never burn dry garden leaves, packaging plastic, or municipal solid waste. If you spot smouldering waste or leaf burning in your neighbourhood, log a geo-tagged report on your local municipal app (e.g. Sameer / 311) and notify the resident welfare association (RWA).',
    whyRelevantNowTemplate:
      'Low-temperature smouldering of plastics, leaves, and trash generates extremely toxic dioxins, furans, and dense fine particulate matter at ground level.',
    exposureProtectionImpact:
      'Stops localized plumes from entering residential balconies, bedrooms, and street corridors.',
    emissionsReductionImpact:
      'Prevents massive episodic emissions of carcinogenic organics and black carbon directly into your community airshed.',
    expectedBenefit:
      'Eliminates an illegal, acute source of hazardous ground-level toxic smoke right where families live and sleep.',
  },
  {
    id: 'neighbourhood_dust_suppression',
    baseTitle: 'Encourage Water Sprinkling on Unpaved Neighbourhood Paths',
    category: 'community_action',
    defaultPriority: 'medium',
    defaultTimeContext: 'afternoon',
    costTier: 'free',
    estimatedEffort: 'medium',
    evidenceSource: 'CPCB Guidelines on Environmental Management for Construction & Dust Mitigation',
    limitations:
      'Use recycled water or runoff where water scarcity is a factor; avoid flooding roads.',
    whatToDoTemplate:
      'Work with your Resident Welfare Association (RWA) or building maintenance to sprinkle misted water on unpaved driveways, dusty parking lots, and construction verges. Keep construction debris covered with tarpaulins.',
    whyRelevantNowTemplate:
      'Fugitive road and construction dust accounts for up to 30–40% of coarse PM10 in urban winter airsheds.',
    exposureProtectionImpact:
      'Prevents wind and moving vehicle tires from resuspending heavy mineral particles into ground-level breathing air.',
    emissionsReductionImpact:
      'Suppresses mechanical re-entrainment of settled particulate matter.',
    expectedBenefit:
      'Noticeably drops ambient PM10 and gritty dust levels across residential lanes and walking paths.',
  },
  {
    id: 'carpooling_shared_school_transport',
    baseTitle: 'Form a Neighbourhood Carpool or Shared School Van Roster',
    category: 'community_action',
    defaultPriority: 'medium',
    defaultTimeContext: 'morning',
    costTier: 'free',
    estimatedEffort: 'medium',
    evidenceSource: 'Centre for Science and Environment (CSE) Urban Mobility Analysis',
    limitations:
      'Requires alignment on daily timings and pickup routes with neighbouring families.',
    whatToDoTemplate:
      'Connect with 2–3 neighbouring families whose children attend the same school or colleagues working in the same commercial hub. Alternate driving duties or subscribe to a registered shared CNG/electric school bus.',
    whyRelevantNowTemplate:
      'Replacing 3 private passenger vehicles with 1 shared vehicle directly removes two tailpipes from peak morning traffic jams.',
    exposureProtectionImpact:
      'Reduces the number of family members exposed to vehicle queues during peak commute periods.',
    emissionsReductionImpact:
      'Cuts individual household vehicular travel distances and carbon emissions by 50–66%.',
    expectedBenefit:
      'Saves fuel costs, reduces parking congestion, and directly lowers community traffic density.',
  },
];
