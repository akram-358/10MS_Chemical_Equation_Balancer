export interface MoleculeDef {
  id: string;
  name: string;
  atoms: Record<string, number>;
  molarMass: number;
}

export interface ReactionDef {
  id: string;
  name: string;
  formula: string;
  correctCoeffs: Record<string, number>;
  reactants: MoleculeDef[];
  products: MoleculeDef[];
  summary: string;
  useCase: string;
}

export const REACTIONS: ReactionDef[] = [
  {
    id: "water",
    name: "পানি তৈরি (Water Synthesis)",
    formula: "H2 + O2 → H2O",
    correctCoeffs: { H2: 2, O2: 1, H2O: 2 },
    reactants: [
      { id: "H2", name: "Hydrogen", atoms: { H: 2 }, molarMass: 2.016 },
      { id: "O2", name: "Oxygen", atoms: { O: 2 }, molarMass: 31.998 },
    ],
    products: [
      { id: "H2O", name: "Water", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary:
      "হাইড্রোজেন এবং অক্সিজেন গ্যাস একত্রে বিক্রিয়া করে পানি উৎপন্ন করে। এটি একটি সংযোজন বিক্রিয়া বা সংশ্লেষণ বিক্রিয়া।",
    useCase:
      "মহাকাশযানে জ্বালানি হিসেবে তরল হাইড্রোজেন ও অক্সিজেন ব্যবহার করা হয়, যার ফলে শক্তি এবং উপজাত হিসেবে পানীয় জল পাওয়া যায়।",
  },
  {
    id: "methane",
    name: "মিথেন দহন (Methane Combustion)",
    formula: "CH4 + O2 → CO2 + H2O",
    correctCoeffs: { CH4: 1, O2: 2, CO2: 1, H2O: 2 },
    reactants: [
      { id: "CH4", name: "Methane", atoms: { C: 1, H: 4 }, molarMass: 16.043 },
      { id: "O2", name: "Oxygen", atoms: { O: 2 }, molarMass: 31.998 },
    ],
    products: [
      {
        id: "CO2",
        name: "Carbon Dioxide",
        atoms: { C: 1, O: 2 },
        molarMass: 44.009,
      },
      { id: "H2O", name: "Water", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary:
      "মিথেন (প্রাকৃতিক গ্যাস) অক্সিজেনের উপস্থিতিতে পুড়ে কার্বন ডাইঅক্সাইড, পানি এবং প্রচুর তাপশক্তি উৎপন্ন করে।",
    useCase:
      "বাসা-বাড়িতে রান্নার কাজে এবং গ্যাস চালিত বিদ্যুৎ কেন্দ্রে জ্বালানি হিসেবে মিথেন দহন করা হয়।",
  },
  {
    id: "ammonia",
    name: "অ্যামোনিয়া তৈরি (Haber Process)",
    formula: "N2 + H2 → NH3",
    correctCoeffs: { N2: 1, H2: 3, NH3: 2 },
    reactants: [
      { id: "N2", name: "Nitrogen", atoms: { N: 2 }, molarMass: 28.014 },
      { id: "H2", name: "Hydrogen", atoms: { H: 2 }, molarMass: 2.016 },
    ],
    products: [
      { id: "NH3", name: "Ammonia", atoms: { N: 1, H: 3 }, molarMass: 17.031 },
    ],
    summary:
      "হেবার-বস প্রণালীতে উচ্চ তাপ ও চাপে নাইট্রোজেন ও হাইড্রোজেন থেকে অ্যামোনিয়া গ্যাস প্রস্তুত করা হয়।",
    useCase:
      "অ্যামোনিয়া সর্বাধিক ব্যবহৃত হয় জমিতে ব্যবহারের জন্য ইউরিয়া এবং অন্যান্য নাইট্রোজেন ঘটিত সার তৈরিতে।",
  },
  {
    id: "photosynthesis",
    name: "সালোকসংশ্লেষণ (Photosynthesis)",
    formula: "CO2 + H2O → C6H12O6 + O2",
    correctCoeffs: { CO2: 6, H2O: 6, C6H12O6: 1, O2: 6 },
    reactants: [
      {
        id: "CO2",
        name: "Carbon Dioxide",
        atoms: { C: 1, O: 2 },
        molarMass: 44.009,
      },
      { id: "H2O", name: "Water", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    products: [
      {
        id: "C6H12O6",
        name: "Glucose",
        atoms: { C: 6, H: 12, O: 6 },
        molarMass: 180.156,
      },
      { id: "O2", name: "Oxygen", atoms: { O: 2 }, molarMass: 31.998 },
    ],
    summary:
      "উদ্ভিদ সূর্যালোকের সাহায্যে কার্বন ডাইঅক্সাইড ও পানি ব্যবহার করে শর্করা বা গ্লুকোজ উৎপন্ন করে, যা সালোকসংশ্লেষণ হিসেবে পরিচিত।",
    useCase:
      "এটি পৃথিবীর সমস্ত প্রাণীর খাদ্যের প্রাথমিক উৎস এবং বায়ুমণ্ডলে অক্সিজেন তৈরিতে প্রধান ভূমিকা রাখে।",
  },
  {
    id: "neutralization_hcl_naoh",
    name: "অ্যাসিড-ক্ষার প্রসমন (HCl + NaOH)",
    formula: "HCl + NaOH → NaCl + H2O",
    correctCoeffs: { HCl: 1, NaOH: 1, NaCl: 1, H2O: 1 },
    reactants: [
      {
        id: "HCl",
        name: "Hydrochloric Acid",
        atoms: { H: 1, Cl: 1 },
        molarMass: 36.46,
      },
      {
        id: "NaOH",
        name: "Sodium Hydroxide",
        atoms: { Na: 1, O: 1, H: 1 },
        molarMass: 39.997,
      },
    ],
    products: [
      {
        id: "NaCl",
        name: "Sodium Chloride",
        atoms: { Na: 1, Cl: 1 },
        molarMass: 58.44,
      },
      { id: "H2O", name: "Water", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary:
      "একটি তীব্র অ্যাসিড (হাইড্রোক্লোরিক অ্যাসিড) ও একটি তীব্র ক্ষারের (সোডিয়াম হাইড্রোক্সাইড) বিক্রিয়ায় লবণ (খাদ্য লবণ) এবং পানি উৎপন্ন হয়।",
    useCase:
      "রাসায়নিক শিল্পে অ্যাসিডিক বর্জ্য নিরাপদ করতে এবং সাধারণ খাবার লবণ তৈরিতে এই নীতি ব্যবহৃত হয়।",
  },
  {
    id: "precipitation_agcl",
    name: "অধঃক্ষেপণ বিক্রিয়া (Precipitation)",
    formula: "AgNO3 + NaCl → AgCl + NaNO3",
    correctCoeffs: { AgNO3: 1, NaCl: 1, AgCl: 1, NaNO3: 1 },
    reactants: [
      {
        id: "AgNO3",
        name: "Silver Nitrate",
        atoms: { Ag: 1, N: 1, O: 3 },
        molarMass: 169.87,
      },
      {
        id: "NaCl",
        name: "Sodium Chloride",
        atoms: { Na: 1, Cl: 1 },
        molarMass: 58.44,
      },
    ],
    products: [
      {
        id: "AgCl",
        name: "Silver Chloride",
        atoms: { Ag: 1, Cl: 1 },
        molarMass: 143.32,
      },
      {
        id: "NaNO3",
        name: "Sodium Nitrate",
        atoms: { Na: 1, N: 1, O: 3 },
        molarMass: 84.99,
      },
    ],
    summary:
      "সিলভার নাইট্রেট ও সোডিয়াম ক্লোরাইডের জলীয় দ্রবণের বিক্রিয়ায় সিলভার ক্লোরাইডের অদ্রবণীয় সাদা অধঃক্ষেপ তৈরি হয়।",
    useCase:
      "ল্যাবরেটরিতে হ্যালাইড আয়ন (যেমন ক্লোরাইড) শনাক্ত করতে এবং ফটোগ্রাফিতে সিলভার যৌগের ব্যবহারে এই বিক্রিয়া গুরুত্বপূর্ণ।",
  },
  {
    id: "organic_esterification",
    name: "এস্টারিফিকেশন (Organic Synthesis)",
    formula: "CH3COOH + C2H5OH → CH3COOC2H5 + H2O",
    correctCoeffs: { CH3COOH: 1, C2H5OH: 1, CH3COOC2H5: 1, H2O: 1 },
    reactants: [
      {
        id: "CH3COOH",
        name: "Acetic Acid",
        atoms: { C: 2, H: 4, O: 2 },
        molarMass: 60.052,
      },
      {
        id: "C2H5OH",
        name: "Ethanol",
        atoms: { C: 2, H: 6, O: 1 },
        molarMass: 46.068,
      },
    ],
    products: [
      {
        id: "CH3COOC2H5",
        name: "Ethyl Acetate",
        atoms: { C: 4, H: 8, O: 2 },
        molarMass: 88.105,
      },
      { id: "H2O", name: "Water", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary:
      "অর্গানিক সিন্থেসিস বা জৈব সংশ্লেষণে অ্যাসিড ও অ্যালকোহলের বিক্রিয়ায় সুগন্ধি এস্টার এবং পানি উৎপন্ন হয়।",
    useCase:
      "কৃত্রিম সুগন্ধি, ফ্লেভারিং এজেন্ট এবং দ্রাবক হিসেবে ইথাইল অ্যাসিটেট শিল্পক্ষেত্রে ব্যাপকভাবে ব্যবহৃত হয়।",
  },
  {
    id: "kmno4_reaction",
    name: "জারণ-বিজারণ (Redox with KMnO4)",
    formula: "KMnO4 + HCl → KCl + MnCl2 + Cl2 + H2O",
    correctCoeffs: { KMnO4: 2, HCl: 16, KCl: 2, MnCl2: 2, Cl2: 5, H2O: 8 },
    reactants: [
      {
        id: "KMnO4",
        name: "Potassium Permanganate",
        atoms: { K: 1, Mn: 1, O: 4 },
        molarMass: 158.034,
      },
      {
        id: "HCl",
        name: "Hydrochloric Acid",
        atoms: { H: 1, Cl: 1 },
        molarMass: 36.46,
      },
    ],
    products: [
      {
        id: "KCl",
        name: "Potassium Chloride",
        atoms: { K: 1, Cl: 1 },
        molarMass: 74.551,
      },
      {
        id: "MnCl2",
        name: "Manganese Chloride",
        atoms: { Mn: 1, Cl: 2 },
        molarMass: 125.844,
      },
      { id: "Cl2", name: "Chlorine", atoms: { Cl: 2 }, molarMass: 70.906 },
      { id: "H2O", name: "Water", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary:
      "তীব্র জারক পটাশিয়াম পারম্যাঙ্গানেট হাইড্রোক্লোরিক অ্যাসিডকে জারিত করে ক্লোরিন গ্যাস এবং পানি উৎপন্ন করে।",
    useCase:
      "ল্যাবরেটরিতে দ্রুত ক্লোরিন গ্যাস প্রস্তুত করতে এবং টাইট্রেশনে জারণ-বিজারণের মাত্রা নির্ণয় করতে এটি ব্যবহৃত হয়।",
  },
  {
    id: "ethylbenzene",
    name: "ইথাইলবেনজিন দহন (Complex Combustion)",
    formula: "C6H5C2H5 + O2 → CO2 + H2O",
    correctCoeffs: { C6H5C2H5: 2, O2: 21, CO2: 16, H2O: 10 },
    reactants: [
      {
        id: "C6H5C2H5",
        name: "Ethylbenzene",
        atoms: { C: 8, H: 10 },
        molarMass: 106.16,
      },
      { id: "O2", name: "Oxygen", atoms: { O: 2 }, molarMass: 31.998 },
    ],
    products: [
      {
        id: "CO2",
        name: "Carbon Dioxide",
        atoms: { C: 1, O: 2 },
        molarMass: 44.009,
      },
      { id: "H2O", name: "Water", atoms: { H: 2, O: 1 }, molarMass: 18.015 },
    ],
    summary:
      "জটিল জৈব যৌগ ইথাইলবেনজিন অক্সিজেনের উপস্থিতিতে পুড়ে কার্বন ডাইঅক্সাইড ও পানি উৎপন্ন করে, যা সমতাকরণের জন্য বেশ সময়সাপেক্ষ।",
    useCase:
      "পেট্রোকেমিক্যাল শিল্পে এবং স্টাইরিন উৎপাদনের কাঁচামাল হিসেবে ইথাইলবেনজিনের দহন বা জারণের হিসাব রাখা অত্যন্ত গুরুত্বপূর্ণ।",
  },
];
