export interface MoleculeDef {
  id: string;
  name: string;
  nameBn: string;
  atoms: Record<string, number>;
  molarMass: number;
}

export interface ReactionDef {
  id: string;
  name: string;
  nameEn: string;
  formula: string;
  correctCoeffs: Record<string, number>;
  reactants: MoleculeDef[];
  products: MoleculeDef[];
  summary: string;
  summaryEn: string;
  useCase: string;
  useCaseEn: string;
  segment: "SSC" | "HSC" | "Both";
  chapter: string;
  chapterEn: string;
}

export const REACTIONS: ReactionDef[] = [
  // ── SSC Ch 6: Mole concept & Chemical Equations ──────────────────────────
  {
    id: "water",
    name: "পানি তৈরি (Water Synthesis)",
    nameEn: "Water Synthesis",
    formula: "H2 + O2 → H2O",
    correctCoeffs: { H2: 2, O2: 1, H2O: 2 },
    reactants: [
      { id: "H2",  name: "Hydrogen", nameBn: "হাইড্রোজেন", atoms: { H: 2 }, molarMass: 2.016 },
      { id: "O2",  name: "Oxygen",   nameBn: "অক্সিজেন",   atoms: { O: 2 }, molarMass: 31.998 },
    ],
    products: [
      { id: "H2O", name: "Water",    nameBn: "পানি",        atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary: "হাইড্রোজেন এবং অক্সিজেন গ্যাস একত্রে বিক্রিয়া করে পানি উৎপন্ন করে। এটি একটি সংযোজন বিক্রিয়া।",
    summaryEn: "Hydrogen and oxygen gases react to form water. This is a synthesis (combination) reaction.",
    useCase: "মহাকাশযানে জ্বালানি হিসেবে তরল হাইড্রোজেন ও অক্সিজেন ব্যবহার করা হয়।",
    useCaseEn: "Liquid hydrogen and oxygen are used as rocket fuel in spacecraft.",
    segment: "SSC",
    chapter: "অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক সমীকরণ",
    chapterEn: "Ch 6: Mole Concept & Chemical Equations",
  },
  {
    id: "methane",
    name: "মিথেন দহন (Methane Combustion)",
    nameEn: "Methane Combustion",
    formula: "CH4 + O2 → CO2 + H2O",
    correctCoeffs: { CH4: 1, O2: 2, CO2: 1, H2O: 2 },
    reactants: [
      { id: "CH4", name: "Methane", nameBn: "মিথেন",     atoms: { C: 1, H: 4 }, molarMass: 16.043 },
      { id: "O2",  name: "Oxygen",  nameBn: "অক্সিজেন",  atoms: { O: 2 },       molarMass: 31.998 },
    ],
    products: [
      { id: "CO2", name: "Carbon Dioxide", nameBn: "কার্বন ডাইঅক্সাইড", atoms: { C: 1, O: 2 }, molarMass: 44.009 },
      { id: "H2O", name: "Water",          nameBn: "পানি",               atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary: "প্রাকৃতিক গ্যাস বা মিথেন অক্সিজেনের উপস্থিতিতে পুড়ে তাপশক্তি উৎপন্ন করে।",
    summaryEn: "Natural gas (methane) burns in oxygen to release heat energy. A combustion reaction.",
    useCase: "বাসাবাড়িতে রান্নার কাজে এবং শিল্পকারখানায় জ্বালানি হিসেবে ব্যবহৃত হয়।",
    useCaseEn: "Used for cooking in homes and as industrial fuel.",
    segment: "SSC",
    chapter: "অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক সমীকরণ",
    chapterEn: "Ch 6: Mole Concept & Chemical Equations",
  },
  {
    id: "ammonia",
    name: "অ্যামোনিয়া তৈরি (Haber Process)",
    nameEn: "Ammonia Synthesis (Haber Process)",
    formula: "N2 + H2 → NH3",
    correctCoeffs: { N2: 1, H2: 3, NH3: 2 },
    reactants: [
      { id: "N2", name: "Nitrogen", nameBn: "নাইট্রোজেন", atoms: { N: 2 }, molarMass: 28.014 },
      { id: "H2", name: "Hydrogen", nameBn: "হাইড্রোজেন", atoms: { H: 2 }, molarMass: 2.016 },
    ],
    products: [
      { id: "NH3", name: "Ammonia", nameBn: "অ্যামোনিয়া", atoms: { N: 1, H: 3 }, molarMass: 17.031 },
    ],
    summary: "নাইট্রোজেন ও হাইড্রোজেন থেকে শিল্পক্ষেত্রে অ্যামোনিয়া তৈরি করা হয়।",
    summaryEn: "Nitrogen and hydrogen combine industrially to form ammonia (Haber-Bosch process).",
    useCase: "রাসায়নিক সার (ইউরিয়া) তৈরিতে অ্যামোনিয়া প্রধান কাঁচামাল।",
    useCaseEn: "Ammonia is the key raw material for producing urea fertilizer.",
    segment: "SSC",
    chapter: "অধ্যায় ৬: মোলের ধারণা ও রাসায়নিক সমীকরণ",
    chapterEn: "Ch 6: Mole Concept & Chemical Equations",
  },

  // ── SSC Ch 7: Chemical Reactions ─────────────────────────────────────────
  {
    id: "nacl_formation",
    name: "সোডিয়াম ক্লোরাইড গঠন (Oxidation-Reduction)",
    nameEn: "Sodium Chloride Formation (Redox)",
    formula: "Na + Cl2 → NaCl",
    correctCoeffs: { Na: 2, Cl2: 1, NaCl: 2 },
    reactants: [
      { id: "Na",  name: "Sodium",    nameBn: "সোডিয়াম", atoms: { Na: 1 }, molarMass: 22.990 },
      { id: "Cl2", name: "Chlorine",  nameBn: "ক্লোরিন",  atoms: { Cl: 2 }, molarMass: 70.906 },
    ],
    products: [
      { id: "NaCl", name: "Sodium Chloride", nameBn: "সোডিয়াম ক্লোরাইড", atoms: { Na: 1, Cl: 1 }, molarMass: 58.44 },
    ],
    summary: "সোডিয়াম ইলেকট্রন হারিয়ে (জারণ) এবং ক্লোরিন ইলেকট্রন গ্রহণ করে (বিজারণ) সোডিয়াম ক্লোরাইড তৈরি করে। এটি একটি রেডক্স বিক্রিয়া।",
    summaryEn: "Sodium loses electrons (oxidation) and chlorine gains electrons (reduction) to form sodium chloride. A classic redox reaction.",
    useCase: "এই বিক্রিয়া জারণ-বিজারণ (রেডক্স) বিক্রিয়ার মৌলিক উদাহরণ হিসেবে পড়ানো হয়।",
    useCaseEn: "Taught as the fundamental example of oxidation-reduction (redox) reactions.",
    segment: "SSC",
    chapter: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া (জারণ-বিজারণ)",
    chapterEn: "Ch 7: Chemical Reactions (Oxidation-Reduction)",
  },
  {
    id: "mg_combustion",
    name: "ম্যাগনেসিয়াম দহন (Mg Combustion)",
    nameEn: "Magnesium Combustion",
    formula: "Mg + O2 → MgO",
    correctCoeffs: { Mg: 2, O2: 1, MgO: 2 },
    reactants: [
      { id: "Mg", name: "Magnesium", nameBn: "ম্যাগনেসিয়াম", atoms: { Mg: 1 }, molarMass: 24.305 },
      { id: "O2", name: "Oxygen",    nameBn: "অক্সিজেন",       atoms: { O: 2 }, molarMass: 31.998 },
    ],
    products: [
      { id: "MgO", name: "Magnesium Oxide", nameBn: "ম্যাগনেসিয়াম অক্সাইড", atoms: { Mg: 1, O: 1 }, molarMass: 40.304 },
    ],
    summary: "ম্যাগনেসিয়াম উজ্জ্বল সাদা শিখায় অক্সিজেনের সাথে পুড়ে ম্যাগনেসিয়াম অক্সাইড তৈরি করে।",
    summaryEn: "Magnesium burns with a bright white flame in oxygen to form magnesium oxide.",
    useCase: "ল্যাবে সহজে পর্যবেক্ষণযোগ্য দহন বিক্রিয়া হিসেবে এটি ব্যবহার করা হয়।",
    useCaseEn: "Used in labs as a classic observable combustion and oxidation demonstration.",
    segment: "SSC",
    chapter: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া",
    chapterEn: "Ch 7: Chemical Reactions",
  },
  {
    id: "redox_iron",
    name: "লোহার মরিচা (Rusting of Iron)",
    nameEn: "Rusting of Iron",
    formula: "Fe + O2 + H2O → Fe(OH)3",
    correctCoeffs: { Fe: 4, O2: 3, H2O: 6, "Fe(OH)3": 4 },
    reactants: [
      { id: "Fe",  name: "Iron",    nameBn: "লোহা",     atoms: { Fe: 1 },           molarMass: 55.845 },
      { id: "O2",  name: "Oxygen",  nameBn: "অক্সিজেন", atoms: { O: 2 },            molarMass: 31.998 },
      { id: "H2O", name: "Water",   nameBn: "পানি",     atoms: { H: 2, O: 1 },      molarMass: 18.015 },
    ],
    products: [
      { id: "Fe(OH)3", name: "Iron Hydroxide", nameBn: "আয়রন হাইড্রক্সাইড", atoms: { Fe: 1, O: 3, H: 3 }, molarMass: 106.867 },
    ],
    summary: "বাতাসের জলীয় বাষ্প ও অক্সিজেনের সাথে লোহার জারণ বিক্রিয়ায় মরিচা পড়ে।",
    summaryEn: "Iron reacts with atmospheric moisture and oxygen to form rust (iron hydroxide). A slow oxidation reaction.",
    useCase: "ধাতব অবকাঠামো সুরক্ষায় গ্যালভানাইজিং বা পেইন্টিংয়ের গুরুত্ব বোঝাতে এটি ব্যবহৃত হয়।",
    useCaseEn: "Explains why galvanizing or painting metal structures is essential to prevent corrosion.",
    segment: "SSC",
    chapter: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া",
    chapterEn: "Ch 7: Chemical Reactions",
  },

  // ── SSC Ch 8: Chemistry & Energy ─────────────────────────────────────────
  {
    id: "water_electrolysis",
    name: "পানির তড়িৎ বিশ্লেষণ (Electrolysis of Water)",
    nameEn: "Electrolysis of Water",
    formula: "H2O → H2 + O2",
    correctCoeffs: { H2O: 2, H2: 2, O2: 1 },
    reactants: [
      { id: "H2O", name: "Water", nameBn: "পানি", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    products: [
      { id: "H2", name: "Hydrogen", nameBn: "হাইড্রোজেন", atoms: { H: 2 }, molarMass: 2.016 },
      { id: "O2", name: "Oxygen",   nameBn: "অক্সিজেন",   atoms: { O: 2 }, molarMass: 31.998 },
    ],
    summary: "বৈদ্যুতিক প্রবাহের মাধ্যমে পানিকে হাইড্রোজেন ও অক্সিজেনে বিভক্ত করা হয়। এটি বিয়োজন বিক্রিয়া।",
    summaryEn: "Electricity decomposes water into hydrogen and oxygen gases. This is an electrolytic decomposition reaction.",
    useCase: "তড়িৎ বিশ্লেষণ কোষে (ইলেকট্রোলাইটিক সেল) ক্যাথোডে H₂ এবং অ্যানোডে O₂ উৎপন্ন হয়।",
    useCaseEn: "In an electrolytic cell, H₂ forms at the cathode and O₂ at the anode. Key process in hydrogen fuel production.",
    segment: "SSC",
    chapter: "অধ্যায় ৮: রসায়ন ও শক্তি (তড়িৎ বিশ্লেষণ)",
    chapterEn: "Ch 8: Chemistry & Energy (Electrolysis)",
  },
  {
    id: "daniell_cell",
    name: "ড্যানিয়েল কোষ (Daniell Cell / Galvanic Cell)",
    nameEn: "Daniell Cell (Galvanic Cell)",
    formula: "Zn + CuSO4 → ZnSO4 + Cu",
    correctCoeffs: { Zn: 1, CuSO4: 1, ZnSO4: 1, Cu: 1 },
    reactants: [
      { id: "Zn",    name: "Zinc",           nameBn: "জিঙ্ক",             atoms: { Zn: 1 },            molarMass: 65.38 },
      { id: "CuSO4", name: "Copper Sulfate",  nameBn: "কপার সালফেট",       atoms: { Cu: 1, S: 1, O: 4 }, molarMass: 159.61 },
    ],
    products: [
      { id: "ZnSO4", name: "Zinc Sulfate", nameBn: "জিঙ্ক সালফেট", atoms: { Zn: 1, S: 1, O: 4 }, molarMass: 161.47 },
      { id: "Cu",    name: "Copper",       nameBn: "তামা",           atoms: { Cu: 1 },              molarMass: 63.546 },
    ],
    summary: "জিঙ্ক ইলেকট্রন হারিয়ে (জারণ) এবং কপার আয়ন ইলেকট্রন গ্রহণ করে (বিজারণ) — এই প্রক্রিয়ায় বিদ্যুৎ উৎপন্ন হয়।",
    summaryEn: "Zinc is oxidized at the anode and copper ions are reduced at the cathode, generating electrical energy.",
    useCase: "এই বিক্রিয়া গ্যালভানিক কোষের (ব্যাটারি) মৌলিক ভিত্তি — রাসায়নিক শক্তি থেকে বৈদ্যুতিক শক্তি উৎপাদন।",
    useCaseEn: "Fundamental basis of galvanic cells (batteries) — converting chemical energy to electrical energy.",
    segment: "SSC",
    chapter: "অধ্যায় ৮: রসায়ন ও শক্তি (গ্যালভানিক কোষ)",
    chapterEn: "Ch 8: Chemistry & Energy (Galvanic Cell)",
  },

  // ── SSC Ch 9: Acid-Base ──────────────────────────────────────────────────
  {
    id: "neutralization",
    name: "অ্যাসিড-ক্ষার প্রসমন (Neutralization)",
    nameEn: "Acid-Base Neutralization",
    formula: "HCl + NaOH → NaCl + H2O",
    correctCoeffs: { HCl: 1, NaOH: 1, NaCl: 1, H2O: 1 },
    reactants: [
      { id: "HCl",  name: "Hydrochloric Acid", nameBn: "হাইড্রোক্লোরিক অ্যাসিড", atoms: { H: 1, Cl: 1 },      molarMass: 36.46 },
      { id: "NaOH", name: "Sodium Hydroxide",  nameBn: "সোডিয়াম হাইড্রক্সাইড",   atoms: { Na: 1, O: 1, H: 1 }, molarMass: 39.997 },
    ],
    products: [
      { id: "NaCl", name: "Sodium Chloride", nameBn: "সোডিয়াম ক্লোরাইড", atoms: { Na: 1, Cl: 1 },      molarMass: 58.44 },
      { id: "H2O",  name: "Water",           nameBn: "পানি",               atoms: { H: 2, O: 1 },        molarMass: 18.015 },
    ],
    summary: "অ্যাসিড ও ক্ষারের বিক্রিয়ায় লবণ ও পানি উৎপন্ন হয়। এটি একটি প্রসমন বিক্রিয়া।",
    summaryEn: "An acid and a base react to form a salt and water. This is a neutralization reaction.",
    useCase: "পাকস্থলীর অ্যাসিডিটি কমাতে এন্টাসিড ঔষধ এই নীতিতে কাজ করে।",
    useCaseEn: "Antacid medicine works on this principle to neutralize excess stomach acid.",
    segment: "SSC",
    chapter: "অধ্যায় ৯: এসিড-ক্ষার সমতা",
    chapterEn: "Ch 9: Acid-Base Equilibrium",
  },

  // ── SSC Various ──────────────────────────────────────────────────────────
  {
    id: "photosynthesis",
    name: "সালোকসংশ্লেষণ (Photosynthesis)",
    nameEn: "Photosynthesis",
    formula: "CO2 + H2O → C6H12O6 + O2",
    correctCoeffs: { CO2: 6, H2O: 6, C6H12O6: 1, O2: 6 },
    reactants: [
      { id: "CO2", name: "Carbon Dioxide", nameBn: "কার্বন ডাইঅক্সাইড", atoms: { C: 1, O: 2 },           molarMass: 44.009 },
      { id: "H2O", name: "Water",          nameBn: "পানি",               atoms: { H: 2, O: 1 },           molarMass: 18.015 },
    ],
    products: [
      { id: "C6H12O6", name: "Glucose", nameBn: "গ্লুকোজ", atoms: { C: 6, H: 12, O: 6 }, molarMass: 180.156 },
      { id: "O2",      name: "Oxygen",  nameBn: "অক্সিজেন", atoms: { O: 2 },               molarMass: 31.998 },
    ],
    summary: "সূর্যালোকের উপস্থিতিতে সবুজ উদ্ভিদ কার্বন ডাইঅক্সাইড ও পানি থেকে খাদ্য তৈরি করে।",
    summaryEn: "Green plants use sunlight to convert CO₂ and water into glucose and oxygen.",
    useCase: "এটি পৃথিবীর অক্সিজেন এবং খাদ্যের প্রধান উৎস।",
    useCaseEn: "The primary source of oxygen and food energy on Earth.",
    segment: "SSC",
    chapter: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া",
    chapterEn: "Ch 7: Chemical Reactions",
  },
  {
    id: "precipitation",
    name: "অধঃক্ষেপণ বিক্রিয়া (Precipitation)",
    nameEn: "Precipitation Reaction",
    formula: "AgNO3 + NaCl → AgCl + NaNO3",
    correctCoeffs: { AgNO3: 1, NaCl: 1, AgCl: 1, NaNO3: 1 },
    reactants: [
      { id: "AgNO3", name: "Silver Nitrate",    nameBn: "সিলভার নাইট্রেট",    atoms: { Ag: 1, N: 1, O: 3 }, molarMass: 169.87 },
      { id: "NaCl",  name: "Sodium Chloride",   nameBn: "সোডিয়াম ক্লোরাইড",  atoms: { Na: 1, Cl: 1 },      molarMass: 58.44 },
    ],
    products: [
      { id: "AgCl",  name: "Silver Chloride",  nameBn: "সিলভার ক্লোরাইড",  atoms: { Ag: 1, Cl: 1 },      molarMass: 143.32 },
      { id: "NaNO3", name: "Sodium Nitrate",   nameBn: "সোডিয়াম নাইট্রেট", atoms: { Na: 1, N: 1, O: 3 }, molarMass: 84.99 },
    ],
    summary: "দুটি তরল মিশ্রণের ফলে একটি অদ্রবণীয় কঠিন পদার্থ (অধঃক্ষেপ) তৈরি হয়।",
    summaryEn: "Mixing two solutions produces an insoluble solid precipitate (AgCl — white).",
    useCase: "ল্যাবরেটরিতে হ্যালাইড আয়ন শনাক্তকরণে এটি ব্যবহৃত হয়।",
    useCaseEn: "Used in qualitative analysis to identify halide ions (Cl⁻, Br⁻, I⁻) in HSC labs.",
    segment: "SSC",
    chapter: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া",
    chapterEn: "Ch 7: Chemical Reactions",
  },
  {
    id: "limestone",
    name: "চুনাপাথর বিয়োজন (Decomposition)",
    nameEn: "Limestone Decomposition",
    formula: "CaCO3 → CaO + CO2",
    correctCoeffs: { CaCO3: 1, CaO: 1, CO2: 1 },
    reactants: [
      { id: "CaCO3", name: "Calcium Carbonate", nameBn: "ক্যালসিয়াম কার্বনেট", atoms: { Ca: 1, C: 1, O: 3 }, molarMass: 100.086 },
    ],
    products: [
      { id: "CaO", name: "Calcium Oxide",   nameBn: "ক্যালসিয়াম অক্সাইড", atoms: { Ca: 1, O: 1 },      molarMass: 56.077 },
      { id: "CO2", name: "Carbon Dioxide",  nameBn: "কার্বন ডাইঅক্সাইড",   atoms: { C: 1, O: 2 },       molarMass: 44.009 },
    ],
    summary: "চুনাপাথরকে তাপ দিলে তা বিয়োজিত হয়ে চুন ও কার্বন ডাইঅক্সাইড তৈরি করে।",
    summaryEn: "Heating limestone causes decomposition into quicklime (CaO) and carbon dioxide.",
    useCase: "সিমেন্ট শিল্পে এবং দালানের হোয়াইট ওয়াশ করতে এই বিক্রিয়া গুরুত্বপূর্ণ।",
    useCaseEn: "Critical in cement manufacturing and lime production for construction whitewashing.",
    segment: "SSC",
    chapter: "অধ্যায় ৭: রাসায়নিক বিক্রিয়া (বিয়োজন)",
    chapterEn: "Ch 7: Chemical Reactions (Decomposition)",
  },

  // ── HSC: Chemical Changes & Quantitative Chemistry ───────────────────────
  {
    id: "combustion_propane",
    name: "প্রোপেন দহন (Propane Combustion)",
    nameEn: "Propane Combustion",
    formula: "C3H8 + O2 → CO2 + H2O",
    correctCoeffs: { C3H8: 1, O2: 5, CO2: 3, H2O: 4 },
    reactants: [
      { id: "C3H8", name: "Propane", nameBn: "প্রোপেন",   atoms: { C: 3, H: 8 }, molarMass: 44.097 },
      { id: "O2",   name: "Oxygen",  nameBn: "অক্সিজেন", atoms: { O: 2 },        molarMass: 31.998 },
    ],
    products: [
      { id: "CO2", name: "Carbon Dioxide", nameBn: "কার্বন ডাইঅক্সাইড", atoms: { C: 1, O: 2 }, molarMass: 44.009 },
      { id: "H2O", name: "Water",          nameBn: "পানি",               atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary: "এলপিজি গ্যাসের প্রধান উপাদান প্রোপেন পুড়ে প্রচুর শক্তি উৎপন্ন করে।",
    summaryEn: "Propane (main component of LPG) burns to release large amounts of energy.",
    useCase: "যানবাহনের জ্বালানি এবং পোর্টেবল চুলায় রান্নার কাজে ব্যবহৃত হয়।",
    useCaseEn: "Used as vehicle fuel (autogas) and for cooking in portable LPG stoves.",
    segment: "HSC",
    chapter: "HSC 2nd Paper, অধ্যায় ২: জৈব রসায়ন",
    chapterEn: "HSC 2nd Paper, Ch 2: Organic Chemistry",
  },
  {
    id: "esterification",
    name: "এস্টারিফিকেশন (Esterification)",
    nameEn: "Esterification",
    formula: "CH3COOH + C2H5OH → CH3COOC2H5 + H2O",
    correctCoeffs: { CH3COOH: 1, C2H5OH: 1, CH3COOC2H5: 1, H2O: 1 },
    reactants: [
      { id: "CH3COOH",    name: "Acetic Acid", nameBn: "অ্যাসিটিক অ্যাসিড", atoms: { C: 2, H: 4, O: 2 }, molarMass: 60.05 },
      { id: "C2H5OH",     name: "Ethanol",     nameBn: "ইথানল",              atoms: { C: 2, H: 6, O: 1 }, molarMass: 46.07 },
    ],
    products: [
      { id: "CH3COOC2H5", name: "Ethyl Acetate", nameBn: "ইথাইল অ্যাসিটেট", atoms: { C: 4, H: 8, O: 2 }, molarMass: 88.11 },
      { id: "H2O",        name: "Water",          nameBn: "পানি",              atoms: { H: 2, O: 1 },        molarMass: 18.015 },
    ],
    summary: "জৈব অ্যাসিড ও অ্যালকোহলের বিক্রিয়ায় সুগন্ধি এস্টার তৈরি হয়।",
    summaryEn: "A carboxylic acid and alcohol react to form a fragrant ester compound.",
    useCase: "সুগন্ধি আতর এবং ফলের কৃত্রিম ফ্লেভার তৈরিতে এস্টার ব্যবহৃত হয়।",
    useCaseEn: "Esters are used in perfumes, food flavourings, and as industrial solvents.",
    segment: "HSC",
    chapter: "HSC 2nd Paper, অধ্যায় ২: জৈব রসায়ন",
    chapterEn: "HSC 2nd Paper, Ch 2: Organic Chemistry",
  },
  {
    id: "haber_hsc",
    name: "হেবার প্রক্রিয়া — বিস্তারিত (HSC)",
    nameEn: "Haber Process — Industrial Detail (HSC)",
    formula: "N2 + 3H2 ⇌ 2NH3",
    correctCoeffs: { N2: 1, H2: 3, NH3: 2 },
    reactants: [
      { id: "N2", name: "Nitrogen", nameBn: "নাইট্রোজেন", atoms: { N: 2 }, molarMass: 28.014 },
      { id: "H2", name: "Hydrogen", nameBn: "হাইড্রোজেন", atoms: { H: 2 }, molarMass: 2.016 },
    ],
    products: [
      { id: "NH3", name: "Ammonia", nameBn: "অ্যামোনিয়া", atoms: { N: 1, H: 3 }, molarMass: 17.031 },
    ],
    summary: "একটি উভয়মুখী বিক্রিয়া যেখানে লা-শাতেলিয়ার নীতি প্রয়োগে ইষ্টতম চাপ ও তাপমাত্রায় উৎপাদ সর্বোচ্চ করা হয়।",
    summaryEn: "A reversible reaction where Le Chatelier's principle is applied to optimise yield at high pressure and moderate temperature.",
    useCase: "শিল্পে নাইট্রোজেন সার উৎপাদনের ভিত্তি; লা-শাতেলিয়ার নীতির HSC পাঠ্যক্রমের গুরুত্বপূর্ণ উদাহরণ।",
    useCaseEn: "Basis of industrial nitrogen fertiliser production; key HSC example of Le Chatelier's principle.",
    segment: "HSC",
    chapter: "HSC 1st Paper, অধ্যায় ৪: রাসায়নিক পরিবর্তন",
    chapterEn: "HSC 1st Paper, Ch 4: Chemical Changes",
  },
];
