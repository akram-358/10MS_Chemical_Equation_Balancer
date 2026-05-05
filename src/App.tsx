/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, useRef, useMemo, useEffect } from "react";
import { Joyride, Step, CallBackProps, STATUS } from "react-joyride";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Stage,
  Sphere,
  Float,
  Text,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Minus,
  Info,
  FlaskConical,
  Atom,
  ChevronRight,
  HelpCircle,
  Search,
  X,
  ArrowRight,
  Edit3,
  Settings,
  RotateCw,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as THREE from "three";
import {
  AtomModel,
  BondModel,
  H2Molecule,
  O2Molecule,
  H2OMolecule,
  N2Molecule,
  NH3Molecule,
  CH4Molecule,
  CO2Molecule,
  Cl2Molecule,
  HClMolecule,
  MolecularCluster,
} from "./components/Molecule3D";
import { REACTIONS, ReactionDef, MoleculeDef } from "./MoleculeLibrary";

// --- Constants & Data ---

const TOKENS = {
  tenRed: "#E8001D",
  tenGreen: "#1CAB55",
  tenInk: "#111827",
  surfaceDark: "#0B1117",
  border: "#E5E7EB",
  surfaceCard: "#FFFFFF",
  textSecondary: "#6B7280",
};

// --- Types ---

interface MoleculeProps {
  type: "H2" | "O2" | "H2O" | "N2" | "H2_single" | "N2_single";
  position: [number, number, number];
  count: number;
}

// --- 3D Molecular Components ---

// --- Components ---

const Tooltip = ({
  children,
  text,
  title,
  visual,
}: {
  children: React.ReactNode;
  text: string;
  title?: string;
  visual?: React.ReactNode;
}) => {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-black text-white rounded-lg z-[100] shadow-xl pointer-events-none"
          >
            {title && (
              <h5 className="font-bold text-xs mb-1 text-white">{title}</h5>
            )}
            <p className="text-[10px] text-gray-300 font-medium leading-relaxed">
              {text}
            </p>
            {visual && (
              <div className="mt-2 text-center p-2 bg-gray-800 rounded">
                {visual}
              </div>
            )}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GroupedMolecules = ({
  type,
  count,
  basePosition,
  atoms,
}: {
  type: string;
  count: number;
  basePosition: [number, number, number];
  atoms?: Record<string, number>;
}) => {
  const elements = [];
  const spacing = 3.5; // Increased spacing for larger clusters
  const jitter = 0.3;

  for (let i = 0; i < count; i++) {
    // 3x3 Grid layout for better organization of many molecules
    const row = Math.floor(i / 3);
    const col = i % 3;
    const layer = Math.floor(i / 9);

    // adding stable pseudo-random jitter based on index
    const offsetX = Math.sin(i * 1.5) * jitter;
    const offsetY = Math.cos(i * 1.5) * jitter;
    const offsetZ = Math.sin(i * 0.7) * jitter + layer * -spacing;

    const pos: [number, number, number] = [
      basePosition[0] + (col - 1) * spacing + offsetX,
      basePosition[1] + (row - 1) * spacing + offsetY,
      basePosition[2] + offsetZ,
    ];

    if (type === "H2")
      elements.push(<H2Molecule key={`h2-${i}`} position={pos} />);
    else if (type === "O2")
      elements.push(<O2Molecule key={`o2-${i}`} position={pos} />);
    else if (type === "H2O")
      elements.push(<H2OMolecule key={`h2o-${i}`} position={pos} />);
    else if (type === "N2")
      elements.push(<N2Molecule key={`n2-${i}`} position={pos} />);
    else if (type === "NH3")
      elements.push(<NH3Molecule key={`nh3-${i}`} position={pos} />);
    else if (type === "CH4")
      elements.push(<CH4Molecule key={`ch4-${i}`} position={pos} />);
    else if (type === "CO2")
      elements.push(<CO2Molecule key={`co2-${i}`} position={pos} />);
    else if (type === "Cl2")
      elements.push(<Cl2Molecule key={`cl2-${i}`} position={pos} />);
    else if (type === "HCl")
      elements.push(<HClMolecule key={`hcl-${i}`} position={pos} />);
    else if (atoms)
      elements.push(
        <MolecularCluster key={`${type}-${i}`} atoms={atoms} position={pos} />,
      );
  }

  const translations: Record<string, string> = {
    H2: "হাইড্রোজেন",
    O2: "অক্সিজেন",
    H2O: "পানি",
    N2: "নাইট্রোজেন",
    NH3: "অ্যামোনিয়া",
    CH4: "মিথেন",
    CO2: "কার্বন ডাইঅক্সাইড",
    C6H12O6: "গ্লুকোজ",
    Cu: "কপার",
    HNO3: "নাইট্রিক এসিড",
    "Cu(NO3)2": "কপার নাইট্রেট",
    NO: "নাইট্রিক অক্সাইড",
    C6H5C2H5: "ইথাইলবেনজিন",
    KMnO4: "পটাশিয়াম পারম্যাঙ্গানেট",
    HCl: "হাইড্রোক্লোরিক এসিড",
    KCl: "পটাশিয়াম ক্লোরাইড",
    MnCl2: "ম্যাঙ্গানিজ ক্লোরাইড",
    Cl2: "ক্লোরিন",
  };

  return (
    <group>
      {elements}
      <Text
        position={[basePosition[0] + 0.5, basePosition[1] - 1.2, 0]}
        fontSize={0.4}
        color="white"
        font="https://fonts.gstatic.com/s/hindsiliguri/v12/ijwb8z7C9ZNoYk2090uG3C7S6Z6_.woff"
        anchorX="center"
        anchorY="middle"
      >
        {translations[type] || type}
      </Text>
    </group>
  );
};

// --- UI Components ---

const CoefficientControl = ({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
}) => {
  // Parse sub-scripts for formula display
  const parts = label.split(/([0-9]+)/);
  const formattedLabel = parts.map((part, i) =>
    /^[0-9]+$/.test(part) ? (
      <sub key={i} className="text-xs">
        {part}
      </sub>
    ) : (
      part
    ),
  );

  return (
    <div className="flex flex-col items-center gap-2 group/coeff">
      <div className="flex items-center border-2 rounded-2xl overflow-hidden bg-white transition-all border-[#E5E7EB] hover:border-gray-400">
        <button
          onClick={() => onChange(Math.max(0.5, value - 0.5))}
          className="px-3 h-14 border-r border-[#E5E7EB] hover:bg-gray-50 transition-colors text-gray-400 hover:text-[#E8001D]"
        >
          <Minus size={16} />
        </button>
        <input
          type="number"
          step="0.5"
          min="0.5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 1)}
          className="w-16 h-14 text-center text-xl font-black font-['Inter'] text-[#E8001D] outline-none bg-transparent m-0 p-0"
          style={{
            appearance: "textfield",
            WebkitAppearance: "none",
            MozAppearance: "textfield",
          }}
        />
        <button
          onClick={() => onChange(value + 0.5)}
          className="px-3 h-14 border-l border-[#E5E7EB] bg-[#1CAB55]/5 text-[#1CAB55] hover:bg-[#1CAB55]/10 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <span className="font-bold text-xl font-['Inter'] text-[#111827]">
        {formattedLabel}
      </span>
    </div>
  );
};

const BalanceSeesaw = ({
  element,
  countLeft,
  countRight,
}: {
  element: string;
  countLeft: number;
  countRight: number;
}) => {
  const rotation = Math.max(-15, Math.min(15, (countLeft - countRight) * 5));
  const colors: Record<string, string> = {
    H: "#60A5FA",
    O: "#EF4444",
    N: "#3B82F6",
    C: "#1F2937",
    Cu: "#B45309",
    K: "#8B5CF6",
    Mn: "#EC4899",
    Cl: "#4ADE80",
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 border border-[#E5E7EB] rounded-2xl w-full shadow-sm">
      <div className="flex justify-between w-full text-xs font-bold text-gray-400 mb-2 px-4">
        <span>{countLeft}</span>
        <span>{countRight}</span>
      </div>
      <motion.div
        animate={{ rotate: rotation }}
        transition={{ type: "spring", stiffness: 100 }}
        className="w-full h-1 bg-gray-800 relative rounded-full"
      >
        <div className="absolute left-1/2 -top-1 w-2 h-2 rounded-full transform -translate-x-1/2 bg-gray-800" />
      </motion.div>
      <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-gray-400 mt-[-2px] flex items-end justify-center">
        <span className="text-[10px] font-bold text-white mb-[-25px] z-10">
          {element}
        </span>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [currentReactionIdx, setCurrentReactionIdx] = useState(0);
  const currentReaction = REACTIONS[currentReactionIdx];

  const [coeffs, setCoeffs] = useState<Record<string, number>>({});
  const [view, setView] = useState<
    "balance" | "stoichiometry" | "molecules" | "ratios"
  >("molecules");
  const [selectedMolecule, setSelectedMolecule] = useState<string | null>(null);
  const [showBonds, setShowBonds] = useState(true);
  const [bondLength, setBondLength] = useState(1);
  const [result, setResult] = useState<{
    balanced: boolean;
    msg: string;
    subMsg: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingReactionIdx, setPendingReactionIdx] = useState<number | null>(
    null,
  );

  const [simSpeed, setSimSpeed] = useState(1);
  const [rotateSpeed, setRotateSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [runTutorial, setRunTutorial] = useState(false);
  const tutorialSteps: Step[] = [
    {
      target: ".tour-step-reaction",
      content:
        "Click here to select a reaction to balance. We have many examples to choose from!",
      disableBeacon: true,
    },
    {
      target: ".tour-step-balancer",
      content:
        "Here you can adjust the coefficients. Try changing the numbers to balance the atoms on both sides of the equation.",
    },
    {
      target: ".tour-step-tracking",
      content:
        "Watch this dashboard! It tells you how many atoms of each element are on the left and right sides. Your goal is to make them match.",
    },
    {
      target: ".tour-step-exam",
      content:
        'If you are stuck, you can use the hints or "Show Answer" button that appears when the balance is incorrect. First examine to check!',
    },
    {
      target: ".tour-step-views",
      content:
        "Switch between 3D Molecules, Balance Verification, and Stoichiometry calculations to learn more about the reaction!",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTutorial(false);
      localStorage.setItem("tutorialCompleted", "true");
    }
  };

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem("tutorialCompleted");
    if (!tutorialCompleted) {
      setTimeout(() => setRunTutorial(true), 1000);
    }
  }, []);

  const filteredReactions = useMemo(() => {
    if (!searchQuery) return REACTIONS;
    return REACTIONS.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.formula.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const handleReset = () => {
    const initialCoeffs: Record<string, number> = {};
    currentReaction.reactants.forEach((r) => (initialCoeffs[r.id] = 1));
    currentReaction.products.forEach((p) => (initialCoeffs[p.id] = 1));
    setCoeffs(initialCoeffs);
    setResult(null);
    setShowHint(false);
  };

  // Initialize coefficients when reaction changes
  useEffect(() => {
    handleReset();
  }, [currentReactionIdx]);

  const updateCoeff = (id: string, val: number) => {
    setCoeffs((prev) => ({ ...prev, [id]: val }));
    setResult(null);
  };

  const atomCounts = useMemo(() => {
    const left: Record<string, number> = {};
    const right: Record<string, number> = {};

    currentReaction.reactants.forEach((r) => {
      const c = Number(coeffs[r.id] || 1);
      Object.entries(r.atoms).forEach(([atom, count]) => {
        left[atom] = (left[atom] || 0) + Number(count) * c;
      });
    });

    currentReaction.products.forEach((p) => {
      const c = Number(coeffs[p.id] || 1);
      Object.entries(p.atoms).forEach(([atom, count]) => {
        right[atom] = (right[atom] || 0) + Number(count) * c;
      });
    });

    return { left, right };
  }, [coeffs, currentReactionIdx]);

  const allElements = useMemo(() => {
    const elements = new Set<string>();
    currentReaction.reactants.forEach((r) =>
      Object.keys(r.atoms).forEach((e) => elements.add(e)),
    );
    return Array.from(elements);
  }, [currentReactionIdx]);

  const checkBalance = () => {
    let balanced = true;
    allElements.forEach((e) => {
      if (atomCounts.left[e] !== atomCounts.right[e]) balanced = false;
    });

    if (balanced) {
      setResult({
        balanced: true,
        msg: "অভিনন্দন! সমীকরণটি সঠিক হয়েছে।",
        subMsg: "তুমি পরমাণুর সমতা করতে পেরেছো।",
      });
      setShowHint(false);
    } else {
      setResult({
        balanced: false,
        msg: "চেষ্টা চালিয়ে যাও!",
        subMsg: "পরমাণুর সংখ্যা মেলাতে আরও কিছু সহগ নিয়ে পরীক্ষা করো।",
      });
      setShowHint(true);
    }
  };

  const confirmReactionChange = (idx: number) => {
    // Always prompt for confirmation when searching/selecting another reaction, unless it's the current one
    if (idx !== currentReactionIdx) {
      setPendingReactionIdx(idx);
    } else {
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] font-['Hind_Siliguri'] overflow-hidden">
      <Joyride
        steps={tutorialSteps}
        run={runTutorial}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: "#E8001D",
            zIndex: 1000,
          },
        }}
      />
      {/* 10MS Top Navigation Bar */}
      <nav className="h-16 shrink-0 border-b border-[#E5E7EB] px-4 md:px-6 flex items-center justify-between bg-white z-50 shadow-sm">
        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#E8001D] rounded-lg flex items-center justify-center text-white font-black text-lg italic shrink-0">
            10
          </div>
          <div className="truncate">
            <h1 className="text-sm md:text-lg font-bold leading-none text-[#111827] truncate">
              Stoichiometry Lab • রাসায়নিক সমতাকরণ
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 bg-gray-50 border border-[#E5E7EB] rounded-xl px-0 w-[320px] ml-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="tour-step-reaction w-[319px] py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 shadow-sm"
          >
            <Search size={14} />
            বিক্রিয়া নির্বাচন (Select Reaction)
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-gray-500 hover:text-[#E8001D] transition-colors"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setRunTutorial(true)}
            className="hidden md:flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold text-white bg-[#E8001D] rounded-full hover:bg-[#c10018] shadow-sm transition-all whitespace-nowrap"
          >
            <Info size={14} className="md:w-4 md:h-4" />
            Tutorial
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold text-[#E8001D] border border-[#E5E7EB] rounded-full hover:border-[#E8001D] transition-all whitespace-nowrap"
          >
            <RefreshCw size={14} className="md:w-4 md:h-4" />
            রিসেট (Reset)
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* VIEWPORT AREA */}
        <section className="flex-[2.5] bg-[#020617] relative border-b lg:border-r border-white/5 flex flex-col overflow-hidden min-h-[300px] md:min-h-[400px]">
          {/* Lab Grid Background - Pattern of dots */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle, #475569 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Top Left View Selection Dropdown */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-50">
            <div className="relative">
              <select
                value={view}
                onChange={(e) => setView(e.target.value as any)}
                className="tour-step-views bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 text-[#f11010] w-[431px] max-w-[90vw] rounded-[16px] md:rounded-[20px] px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-black uppercase tracking-widest focus:outline-none focus:border-[#E8001D] appearance-none cursor-pointer shadow-2xl hover:bg-white/10 transition-colors pr-10"
              >
                <option value="molecules">Molecules</option>
                <option value="balance">Scale</option>
                <option value="stoichiometry">Calculations</option>
                <option value="ratios">Mole Ratios</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          {/* Molecule Info Overlay */}
          <div className="absolute top-20 left-4 md:top-24 md:left-6 z-10 w-[calc(100%-32px)] md:w-auto pointer-events-none">
            <motion.div
              key={currentReaction.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-4 md:p-5 rounded-[20px] md:rounded-[24px] shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#10b981] shadow-[0_0_10px_#10b981]" />
                  <span className="text-white/60 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                    Active Reaction
                  </span>
                </div>
                <button
                  onClick={() => setShowSummary(true)}
                  className="bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 flex items-center gap-1 rounded"
                >
                  <Info size={12} />
                  Summary
                </button>
              </div>
              <h3 className="text-white text-base md:text-xl font-black tracking-tight mb-1 truncate max-w-[280px] md:max-w-none">
                {currentReaction.name}
              </h3>
              <p className="text-[#94a3b8] text-xs md:text-sm font-semibold font-['Inter']">
                {currentReaction.formula}
              </p>
            </motion.div>
          </div>

          <div className="flex-1 relative flex flex-col">
            {view === "molecules" && (
              <div className="h-full flex flex-col items-center justify-center relative pb-24 md:pb-0">
                {/* 10MS Top Right Panel Style */}
                <div className="absolute top-32 md:top-6 right-4 md:right-6 z-10 flex flex-col gap-3 max-w-[calc(100%-32px)] md:max-w-[200px]">
                  <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 w-[214px] h-[243px] pl-3 pt-[14px] pb-5 pr-[14px] ml-0.5 -mt-5 rounded-[20px] md:rounded-[24px] shadow-2xl">
                    <div className="flex flex-col gap-3 md:gap-4">
                      <div>
                        <label className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-widest block mb-1 md:mb-2">
                          Molecule
                        </label>
                        <select
                          value={selectedMolecule || ""}
                          onChange={(e) => setSelectedMolecule(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-lg md:rounded-xl px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-bold focus:outline-none focus:border-[#E8001D] appearance-none cursor-pointer"
                        >
                          <option value="" disabled className="bg-[#0f172a]">
                            Select Molecule
                          </option>
                          {[
                            ...currentReaction.reactants,
                            ...currentReaction.products,
                          ].map((m) => (
                            <option
                              key={m.id}
                              value={m.id}
                              className="bg-[#0f172a]"
                            >
                              {m.id} ({m.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-white/5 w-[188px] h-[146px] pl-[3px] ml-0">
                        <label className="text-white/40 text-[8px] md:text-[10px] font-black uppercase tracking-widest block font-['Inter']">
                          Options
                        </label>
                        <button
                          onClick={() => setShowBonds(!showBonds)}
                          className="w-[180px] py-2 md:py-3 bg-white/5 text-white text-[9px] md:text-[11px] font-black uppercase tracking-widest rounded-lg md:rounded-xl hover:bg-white/10 transition-all flex items-center justify-between px-3 md:px-4"
                        >
                          <span className="font-['Inter']">Show Bonds</span>
                          <div
                            className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded border-2 flex items-center justify-center transition-all ${showBonds ? "bg-[#E8001D] border-[#E8001D]" : "border-white/20"}`}
                          >
                            {showBonds && (
                              <Plus size={10} className="text-white" />
                            )}
                          </div>
                        </button>

                        <div className="space-y-1.5 md:space-y-2">
                          <div className="flex justify-between text-white/40 text-[8px] md:text-[9px] font-black uppercase tracking-widest font-['Inter']">
                            <span>Bond Length</span>
                            <span className="text-white">
                              {bondLength.toFixed(1)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={bondLength}
                            onChange={(e) =>
                              setBondLength(parseFloat(e.target.value))
                            }
                            className="w-full accent-[#E8001D]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Canvas shadows dpr={[1, 2]}>
                  <PerspectiveCamera
                    makeDefault
                    position={[0, 0, 8]}
                    fov={45}
                  />
                  <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.6}>
                      <Float
                        speed={2}
                        rotationIntensity={0.5}
                        floatIntensity={0.5}
                      >
                        {selectedMolecule ? (
                          <group scale={1.2}>
                            {/* Render detailed molecule based on ID */}
                            {selectedMolecule === "H2O" && (
                              <H2OMolecule
                                position={[0, 0, 0]}
                                showBonds={showBonds}
                                bondLength={bondLength}
                              />
                            )}
                            {selectedMolecule === "CO2" && (
                              <CO2Molecule position={[0, 0, 0]} />
                            )}
                            {selectedMolecule === "CH4" && (
                              <CH4Molecule position={[0, 0, 0]} />
                            )}
                            {selectedMolecule === "NH3" && (
                              <NH3Molecule position={[0, 0, 0]} />
                            )}
                            {selectedMolecule === "O2" && (
                              <O2Molecule
                                position={[0, 0, 0]}
                                showBonds={showBonds}
                                bondLength={bondLength}
                              />
                            )}
                            {selectedMolecule === "N2" && (
                              <N2Molecule position={[0, 0, 0]} />
                            )}
                            {selectedMolecule === "H2" && (
                              <H2Molecule
                                position={[0, 0, 0]}
                                showBonds={showBonds}
                                bondLength={bondLength}
                              />
                            )}
                            {selectedMolecule === "HCl" && (
                              <HClMolecule position={[0, 0, 0]} />
                            )}
                            {selectedMolecule === "Cl2" && (
                              <Cl2Molecule position={[0, 0, 0]} />
                            )}
                            {![
                              "H2O",
                              "CO2",
                              "CH4",
                              "NH3",
                              "O2",
                              "N2",
                              "H2",
                              "HCl",
                              "Cl2",
                            ].includes(selectedMolecule) && (
                              <MolecularCluster
                                atoms={
                                  [
                                    ...currentReaction.reactants,
                                    ...currentReaction.products,
                                  ].find((m) => m.id === selectedMolecule)
                                    ?.atoms || {}
                                }
                                position={[0, 0, 0]}
                              />
                            )}
                          </group>
                        ) : (
                          <group>
                            <Text
                              color="white"
                              fontSize={0.25}
                              font="https://fonts.gstatic.com/s/hindsiliguri/v12/ijwb8z7C9ZNoYk2090uG3C7S6Z6_.woff"
                            >
                              ডানপাশের প্যানেল থেকে একটি অণু নির্বাচন করো
                            </Text>
                            <Text
                              color="white/40"
                              position={[0, -0.4, 0]}
                              fontSize={0.15}
                              font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGkyMZhrib2Bg-4.woff"
                            >
                              (Select a molecule from the right panel to view)
                            </Text>
                          </group>
                        )}
                      </Float>
                    </Stage>
                  </Suspense>
                  <OrbitControls enableZoom={true} />
                </Canvas>
              </div>
            )}

            {view === "balance" && (
              <div className="h-full flex flex-col items-center justify-center p-4 md:p-12 pt-32 md:pt-36 pb-24 md:pb-12 gap-6 md:gap-12 overflow-y-auto no-scrollbar">
                <h3 className="text-white/40 text-[10px] md:text-sm font-bold uppercase tracking-widest font-['Inter']">
                  Balance Verification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-8 w-full max-w-2xl px-4">
                  {allElements.map((e) => {
                    const isBalanced =
                      atomCounts.left[e] === atomCounts.right[e];
                    return (
                      <motion.div
                        key={e}
                        animate={{ scale: isBalanced ? 1 : 1.05 }}
                        className={`w-full ${isBalanced ? "opacity-100" : "opacity-80"}`}
                      >
                        <BalanceSeesaw
                          element={e}
                          countLeft={atomCounts.left[e] || 0}
                          countRight={atomCounts.right[e] || 0}
                        />
                        {!isBalanced && (
                          <div className="text-[10px] text-center mt-2 text-[#E8001D] font-bold uppercase tracking-widest font-['Inter']">
                            Unbalanced • অসমতাকৃত
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "stoichiometry" && (
              <div className="h-full flex flex-col items-center justify-start p-4 md:p-8 pt-32 md:pt-36 overflow-y-auto w-full max-w-4xl mx-auto space-y-6 md:space-y-8 pb-24 no-scrollbar">
                {/* Table Part */}
                <div className="w-[calc(100%+63px)] -ml-[36px] -mr-[27px] bg-white rounded-2xl md:rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col mt-[100px] p-0">
                  <div className="h-[48.6px] pl-[24px] pr-4 md:pr-6 border-b border-[#E5E7EB] bg-gray-50 flex items-center gap-3">
                    <FlaskConical className="text-[#E8001D]" size={20} />
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-['Inter']">
                      Molar Quantities Table
                    </h3>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[600px] md:min-w-0">
                      <thead className="bg-[#111827] text-white text-[9px] md:text-[10px] uppercase font-bold tracking-widest font-['Inter']">
                        <tr>
                          <th className="px-6 py-4">
                            <Tooltip
                              title="Compounds (যৌগ)"
                              text="বিক্রিয়ায় অংশ নেওয়া বা উৎপন্ন প্রতিটি মৌলিক বা যৌগিক পদার্থ।"
                              visual={
                                <div className="flex gap-2 justify-center">
                                  <FlaskConical
                                    size={16}
                                    className="text-red-400"
                                  />
                                  <FlaskConical
                                    size={16}
                                    className="text-blue-400"
                                  />
                                </div>
                              }
                            >
                              <div className="flex items-center gap-2">
                                <FlaskConical
                                  size={14}
                                  className="text-[#E8001D]"
                                />
                                যৌগ (Compound)
                              </div>
                            </Tooltip>
                          </th>
                          <th className="px-6 py-4">
                            <Tooltip
                              title="Coefficient (সহগ)"
                              text="সমতাকৃত সমীকরণের অণুর সংখ্যা। এটি বিক্রিয়ায় কত মোল অংশ নিয়েছে তা নির্দেশ করে।"
                              visual={
                                <div className="text-xs font-bold font-mono bg-gray-900 rounded px-2 py-1">
                                  <span className="text-green-400">2</span> H₂O
                                </div>
                              }
                            >
                              <div className="flex items-center gap-2 w-[72px]">
                                <Edit3 size={14} className="text-[#1CAB55]" />
                                সহগ (Coeff)
                              </div>
                            </Tooltip>
                          </th>
                          <th className="px-6 py-4">
                            <Tooltip
                              title="Molar Mass (মোলার ভর)"
                              text="কোনো পদার্থের ১ মোলের ভর গ্রাম এককে। পর্যায় সারণি থেকে মৌলের পারমাণবিক ভর যোগ করে এটি নির্ণয় করা হয়।"
                              visual={
                                <div className="text-xs font-mono">
                                  H₂O = (1×2) + 16 ={" "}
                                  <span className="text-blue-400">
                                    18 g/mol
                                  </span>
                                </div>
                              }
                            >
                              <div className="flex items-center gap-2 w-[70px]">
                                <Atom size={14} className="text-blue-500" />
                                মোলার ভর (M)
                              </div>
                            </Tooltip>
                          </th>
                          <th className="px-6 py-4">
                            <Tooltip
                              title="Mole (মোল)"
                              text="পদার্থের পরিমাণের একক। ১ মোল = 6.023×10²³ টি অণু বা পরমাণু।"
                              visual={
                                <div className="flex flex-col items-center gap-1">
                                  <Search
                                    size={16}
                                    className="text-purple-400"
                                  />
                                  <span className="text-[9px]">n = w / M</span>
                                </div>
                              }
                            >
                              <div className="flex items-center gap-2 w-[82px]">
                                <Search size={14} className="text-purple-500" />
                                মোল (n)
                              </div>
                            </Tooltip>
                          </th>
                          <th className="px-6 py-4">
                            <Tooltip
                              title="Total Mass (মোট ভর)"
                              text="বিক্রিয়ায় ওই পদার্থের মোট ভর। সূত্র: n × M"
                              visual={
                                <div className="text-xs font-mono">
                                  2 মোল × 18 ={" "}
                                  <span className="text-orange-400">36 g</span>
                                </div>
                              }
                            >
                              <div className="flex items-center gap-2 w-[94px]">
                                <HelpCircle
                                  size={14}
                                  className="text-orange-500"
                                />
                                ভর (Weight g)
                              </div>
                            </Tooltip>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        <tr className="bg-orange-50/50">
                          <td
                            colSpan={5}
                            className="px-6 py-2 text-[10px] font-black text-orange-600 uppercase tracking-tighter"
                          >
                            Reactants • বিক্রিয়ক
                          </td>
                        </tr>
                        {currentReaction.reactants.map((r) => {
                          const coeff = coeffs[r.id] || 1;
                          return (
                            <tr key={r.id} className="text-sm">
                              <td className="px-6 py-4 font-bold font-['Inter']">
                                {r.id}
                              </td>
                              <td className="px-6 py-4 font-['Inter']">
                                {coeff}
                              </td>
                              <td className="px-6 py-4 text-gray-500 font-['Inter']">
                                {r.molarMass.toFixed(3)}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  readOnly
                                  value={coeff.toFixed(2)}
                                  className="bg-gray-50 border border-[#E5E7EB] rounded-lg px-3 py-1 w-20 text-center font-['Inter'] text-gray-700"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  readOnly
                                  value={(coeff * r.molarMass).toFixed(2)}
                                  className="bg-gray-50 border border-[#E5E7EB] rounded-lg px-3 py-1 w-24 text-center font-['Inter'] text-gray-700 font-bold"
                                />
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-blue-50/50">
                          <td
                            colSpan={5}
                            className="px-6 py-2 text-[10px] font-black text-blue-600 uppercase tracking-tighter"
                          >
                            Products • উৎপাদ
                          </td>
                        </tr>
                        {currentReaction.products.map((p) => {
                          const coeff = coeffs[p.id] || 1;
                          return (
                            <tr key={p.id} className="text-sm">
                              <td className="px-6 py-4 font-bold font-['Inter']">
                                {p.id}
                              </td>
                              <td className="px-6 py-4 font-['Inter']">
                                {coeff}
                              </td>
                              <td className="px-6 py-4 text-gray-500 font-['Inter']">
                                {p.molarMass.toFixed(3)}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  readOnly
                                  value={coeff.toFixed(2)}
                                  className="bg-gray-50 border border-[#E5E7EB] rounded-lg px-3 py-1 w-20 text-center font-['Inter'] text-gray-700"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  readOnly
                                  value={(coeff * p.molarMass).toFixed(2)}
                                  className="bg-gray-50 border border-[#E5E7EB] rounded-lg px-3 py-1 w-24 text-center font-['Inter'] text-gray-700 font-bold"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {view === "ratios" && (
              <div className="h-full flex flex-col items-center justify-start p-4 md:p-8 pt-32 md:pt-36 overflow-y-auto w-full max-w-4xl mx-auto space-y-6 md:space-y-8 pb-24 no-scrollbar border-none">
                {/* Mole Ratios Section - Third Segment */}
                <div className="w-full bg-[#111827] text-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden relative mt-[90px]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8001D] opacity-10 blur-[100px] pointer-events-none" />

                  <div className="pl-6 pb-[15px] pr-[15px] h-[55.6px] ml-0 mt-0 flex items-center border-b border-gray-800">
                    <h4 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-[#E8001D] flex items-center gap-2 font-['Inter'] h-[35px] -mt-2 mr-[50px]">
                      <Edit3 size={16} />
                      Mole Ratios • মোল অনুপাত
                    </h4>
                  </div>

                  <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-0 h-[300px]">
                    <div className="flex flex-col gap-4">
                      <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed font-medium">
                        বিক্রিয়ক এবং উৎপাদের মধ্যে মোলের অনুপাত। এটি ব্যবহার করে
                        আমরা অজান যৌগের উৎপন্ন পরিমাণ নির্ণয় করতে পারি।
                      </p>

                      <div className="p-5 md:p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm shadow-inner flex flex-col items-center justify-center h-full">
                        <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase block mb-2 font-['Inter']">
                          Core Reaction Ratio
                        </span>
                        <div className="flex flex-wrap items-baseline justify-center gap-3">
                          {currentReaction.reactants.map((r) => (
                            <div key={r.id} className="flex gap-2 items-center">
                              <span className="text-xl md:text-2xl font-black text-white font-['Inter']">
                                {coeffs[r.id] || 0}
                              </span>
                              <span className="text-xs text-gray-400">
                                {r.id}
                              </span>
                            </div>
                          ))}
                          <ArrowRight className="text-white/40" size={16} />
                          {currentReaction.products.map((p) => (
                            <div key={p.id} className="flex gap-2 items-center">
                              <span className="text-xl md:text-2xl font-black text-[#10b981] font-['Inter']">
                                {coeffs[p.id] || 0}
                              </span>
                              <span className="text-xs text-[#10b981]/80">
                                {p.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {currentReaction.reactants.length > 1 && (
                        <div className="text-[8px] font-black text-white/40 uppercase mb-2 font-['Inter']">
                          Reactant : Reactant
                        </div>
                      )}
                      {currentReaction.reactants.map((r, idx) => {
                        if (idx === currentReaction.reactants.length - 1)
                          return null;
                        const nextR = currentReaction.reactants[idx + 1];
                        const ratioValue = coeffs[r.id] / coeffs[nextR.id];
                        const ratio = isFinite(ratioValue)
                          ? ratioValue.toFixed(2)
                          : "0.00";
                        return (
                          <div
                            key={`rr-${r.id}-${nextR.id}`}
                            className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10"
                          >
                            <span className="font-bold text-xs md:text-sm font-['Inter']">
                              {r.id} : {nextR.id}
                            </span>
                            <span className="text-[#1CAB55] font-black text-xs md:text-sm font-['Inter']">
                              {coeffs[r.id]} : {coeffs[nextR.id]} ({ratio})
                            </span>
                          </div>
                        );
                      })}

                      <div className="text-[8px] font-black text-white/40 uppercase mt-4 mb-2 font-['Inter']">
                        Reactant : Product
                      </div>
                      {currentReaction.reactants.map((r) =>
                        currentReaction.products.map((p) => {
                          const ratioValue = coeffs[r.id] / coeffs[p.id];
                          const ratio = isFinite(ratioValue)
                            ? ratioValue.toFixed(ratioValue < 100 ? 2 : 0)
                            : "0.00";
                          return (
                            <div
                              key={`rp-${r.id}-${p.id}`}
                              className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-xl border border-white/10"
                            >
                              <span className="font-bold text-xs md:text-sm font-['Inter']">
                                {r.id} : {p.id}
                              </span>
                              <span className="text-[#10b981] font-black text-xs md:text-sm font-['Inter']">
                                {coeffs[r.id] || 0} : {coeffs[p.id] || 0} (
                                {ratio})
                              </span>
                            </div>
                          );
                        }),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CONTROLS AREA - Fixed sequence and mobile layout */}
        <section className="flex-[1.8] bg-white flex flex-col border-t lg:border-t-0 lg:border-l border-[#E5E7EB] overflow-y-auto no-scrollbar">
          <div className="p-4 md:p-8 flex-1">
            <header className="mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1CAB55]/10 text-[#1CAB55] rounded-full text-[10px] md:text-xs font-bold mb-3 uppercase tracking-widest font-['Inter']">
                Learning Mode
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-[#111827] mb-2 leading-tight">
                তুমি কি এই সমীকরণটি মেলাতে পারবে?
              </h2>
              <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                ভরের সংরক্ষণশীলতা নীতি বজায় রাখার জন্য বিক্রিয়ক (Reactant) এবং
                উৎপাদ (Product) উভয় পাশের পরমাণুর সংখ্যা সমান হওয়া প্রয়োজন।
              </p>
            </header>

            {/* Balancer UI - Layout adjustment for proper visibility */}
            <div className="space-y-6 md:space-y-10">
              <div className="tour-step-balancer p-6 md:p-8 border-t border-b lg:border border-[#E5E7EB] lg:rounded-3xl relative bg-gray-50/30">
                <div className="flex flex-col items-center gap-6 md:gap-10 p-4 border-[0.5px] border-solid border-[#E5E7EB] rounded-[20px]">
                  {/* Reactants Row - Stacked as per image if many */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center w-full">
                    {currentReaction.reactants.map((r, i) => (
                      <React.Fragment key={r.id}>
                        <CoefficientControl
                          label={r.id}
                          value={coeffs[r.id] || 1}
                          onChange={(v) => updateCoeff(r.id, v)}
                        />
                        {i < currentReaction.reactants.length - 1 && (
                          <Plus size={18} className="text-gray-300" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Arrow Separator */}
                  <div className="flex flex-col items-center gap-0">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-[#E8001D] flex items-center justify-center text-[#E8001D] shadow-lg shadow-red-500/10 shrink-0">
                      <ChevronRight
                        size={20}
                        className="md:w-6 md:h-6 rotate-90 lg:rotate-0"
                      />
                    </div>
                  </div>

                  {/* Products Row - Stacked as per image if many */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center w-full">
                    {currentReaction.products.map((p, i) => (
                      <React.Fragment key={p.id}>
                        <CoefficientControl
                          label={p.id}
                          value={coeffs[p.id] || 1}
                          onChange={(v) => updateCoeff(p.id, v)}
                        />
                        {i < currentReaction.products.length - 1 && (
                          <Plus size={18} className="text-gray-300" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-1 md:px-2">
                <button
                  onClick={() => checkBalance()}
                  className={`tour-step-exam group relative w-full h-14 md:h-16 rounded-xl md:rounded-2xl font-black text-base md:text-xl transition-all flex justify-center items-center gap-3 shadow-xl overflow-hidden
                    ${result?.balanced ? "bg-[#1CAB55] hover:bg-[#15803d] shadow-[#1CAB55]/20" : "bg-[#E8001D] hover:bg-[#be0018] shadow-[#E8001D]/20"}
                  `}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CheckCircle2 size={24} className="w-5 h-5 md:w-6 md:h-6" />
                  <span>সমতা পরীক্ষা করো (Examine Balance)</span>
                </button>
              </div>

              {/* Examine Balance Result / Feedback Box */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-5 md:p-6 border rounded-2xl mx-1 md:mx-2 shadow-sm ${
                      result.balanced
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white shadow-lg ${
                          result.balanced ? "bg-green-500" : "bg-[#E8001D]"
                        }`}
                      >
                        {result.balanced ? (
                          <CheckCircle2 size={24} />
                        ) : (
                          <Info size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`text-lg font-black ${
                            result.balanced
                              ? "text-green-800"
                              : "text-[#E8001D]"
                          }`}
                        >
                          {result.balanced
                            ? "সঠিক হয়েছে! (Correct!)"
                            : "ভুল হয়েছে! (Incorrect!)"}
                        </h4>
                        <p
                          className={`text-sm mt-1 mb-4 font-medium ${
                            result.balanced ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {result.msg}
                        </p>

                        {!result.balanced && (
                          <div className="mt-4 pt-4 border-t border-red-200">
                            <p className="text-red-700 text-xs md:text-sm mb-4 font-semibold leading-relaxed">
                              পিছনে গিয়ে 'Atoms Tracking' বক্সটি দেখো। যেসব মৌল
                              'Unbalanced' দেখাচ্ছে, সেগুলোর সংখ্যা সমান করার
                              জন্য সহগ (Coefficient) পরিবর্তন করো।
                            </p>
                            <button
                              onClick={() => {
                                // Apply Correct Balance
                                if (currentReaction.correctCoeffs) {
                                  setCoeffs(currentReaction.correctCoeffs);
                                  setResult(null);
                                }
                              }}
                              className="w-full bg-[#E8001D]/10 text-[#E8001D] hover:bg-[#E8001D]/20 font-bold py-3 px-6 rounded-xl text-sm transition-colors text-center"
                            >
                              Show Answer • সঠিক উত্তর বসাও
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Atoms Tracking Dashboard */}
              <div className="tour-step-tracking bg-gray-50 border border-[#E5E7EB] rounded-[24px] md:rounded-3xl p-4 md:p-6 mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest font-['Inter']">
                    Atoms Tracking • পরমাণু পর্যবেক্ষণ
                  </h4>
                  <Tooltip
                    title="Atoms Tracking (পরমাণু পর্যবেক্ষণ)"
                    text="বিক্রিয়ক এবং উৎপাদে প্রতিটি মৌলের পরমাণুর সংখ্যা সমান হতে হবে (ভরের নিত্যতা সূত্র)।"
                    visual={
                      <div className="flex gap-2 justify-center items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full" />{" "}
                        <span className="font-bold">+</span>{" "}
                        <div className="w-4 h-4 bg-red-500 rounded-full" />{" "}
                        <span className="font-bold">=</span>{" "}
                        <div className="w-6 h-4 bg-gradient-to-r from-blue-500 to-red-500 rounded-full" />
                      </div>
                    }
                  >
                    <Info
                      size={14}
                      className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                    />
                  </Tooltip>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {allElements.map((e) => {
                    const isBalanced =
                      atomCounts.left[e] === atomCounts.right[e];
                    const elementColors: Record<string, string> = {
                      H: "bg-blue-400",
                      O: "bg-red-400",
                      N: "bg-indigo-400",
                      C: "bg-gray-800",
                      Cu: "bg-orange-700",
                      K: "bg-purple-500",
                      Mn: "bg-pink-500",
                      Cl: "bg-green-500",
                    };
                    return (
                      <div
                        key={e}
                        className={`
                          flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl transition-all border-2
                          ${isBalanced ? "bg-white border-[#1CAB55]/20 shadow-sm" : "bg-red-50/10 border-[#E8001D]/20 shadow-inner"}
                        `}
                      >
                        <div className="flex items-center gap-2 md:gap-3">
                          <div
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm text-white shadow-lg ${elementColors[e] || "bg-gray-700"}`}
                          >
                            {e}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider font-['Inter'] ${isBalanced ? 'text-[#1CAB55]' : 'text-[#E8001D]'}">
                              {isBalanced ? "Balanced" : "Unbalanced"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase font-bold text-gray-400 mb-0.5 font-['Inter']">
                              React.
                            </span>
                            <div
                              className={`px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg text-sm md:text-lg font-black font-['Inter'] ${isBalanced ? "text-gray-700" : "text-red-600"}`}
                            >
                              {atomCounts.left[e] || 0}
                            </div>
                          </div>
                          <ArrowRight
                            size={12}
                            className="text-gray-300 mt-2"
                          />
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase font-bold text-gray-400 mb-0.5 font-['Inter']">
                              Prod.
                            </span>
                            <div
                              className={`px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg text-sm md:text-lg font-black font-['Inter'] ${isBalanced ? "text-gray-700" : "text-red-600"}`}
                            >
                              {atomCounts.right[e] || 0}
                            </div>
                          </div>
                          <div
                            className={`p-1 md:p-1.5 rounded-full ${isBalanced ? "text-[#1CAB55]" : "text-[#E8001D]"}`}
                          >
                            {isBalanced ? (
                              <CheckCircle2
                                size={18}
                                className="md:w-6 md:h-6"
                              />
                            ) : (
                              <XCircle size={18} className="md:w-6 md:h-6" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="h-20 lg:hidden"></div>{" "}
          {/* Mobile spacer for bottom nav */}
        </section>
      </main>

      {/* SUMMARY MODAL */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0B1117]/80 backdrop-blur-sm z-[150] flex items-center justify-center p-4 md:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 bg-[#111827] text-white flex justify-between items-start relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
                  <BookOpen size={150} />
                </div>
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                    {currentReaction.name}
                  </h2>
                  <p className="text-[#94a3b8] font-bold font-['Inter'] text-lg">
                    {currentReaction.formula}
                  </p>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="h-10 w-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors relative z-10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-black text-[#E8001D] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info size={18} />
                    Reaction Summary • বিক্রিয়ার সারসংক্ষেপ
                  </h4>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium bg-gray-50 border border-[#E5E7EB] p-4 rounded-xl">
                    {currentReaction.summary}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-black text-[#1CAB55] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    Use Case • ব্যবহারিক ক্ষেত্র
                  </h4>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed font-medium bg-[#1CAB55]/5 border border-[#1CAB55]/20 p-4 rounded-xl">
                    {currentReaction.useCase}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-[#E5E7EB] flex justify-end">
                <button
                  onClick={() => setShowSummary(false)}
                  className="px-6 py-3 bg-[#111827] text-white font-bold rounded-xl hover:bg-[#111827]/90 transition-colors"
                >
                  Close (বন্ধ করো)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH MODAL */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-10 pb-6">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-4xl font-black text-[#111827] tracking-tighter uppercase mb-2">
                      Select Reaction
                    </h2>
                    <p className="text-[#6B7280] font-medium">
                      Enter compounds like H2O, CuSO4, or KMnO4
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="h-12 w-12 rounded-full border border-[#E5E7EB] flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E8001D] transition-colors">
                    <Search size={24} />
                  </div>
                  <input
                    autoFocus
                    placeholder="Search reactions (e.g. photosynthesis, titration...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-xl font-medium focus:outline-none focus:border-[#E8001D] focus:ring-4 focus:ring-[#E8001D]/5 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-10 pb-10">
                <div className="flex items-center justify-between py-4 border-b border-[#E5E7EB] mb-6">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Matching Reactions
                  </span>
                  <span className="px-3 py-1 bg-[#111827] text-white text-[10px] font-black rounded-lg">
                    {filteredReactions.length} Found
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredReactions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        const idx = REACTIONS.findIndex(
                          (rec) => rec.id === r.id,
                        );
                        confirmReactionChange(idx);
                        setIsSearchOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-6 bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl hover:border-[#E8001D] hover:bg-gray-50 group transition-all text-left"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-xl md:text-2xl font-black text-[#111827] tracking-tight">
                          {r.name}
                        </span>
                        <h3 className="text-sm font-bold text-gray-500 tracking-wider font-['Inter'] mt-1">
                          {r.formula}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Select Equation
                        </span>
                        <div className="w-10 h-10 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#E8001D]">
                          <ArrowRight size={20} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REACTION CHANGE CONFIRMATION POPUP */}
      <AnimatePresence>
        {pendingReactionIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw size={40} className="animate-spin-slow" />
              </div>
              <h3 className="text-2xl font-black text-[#111827] mb-2 leading-tight">
                Reset Simulation?
                <br />
                <span className="text-[20px] text-[#E8001D]">
                  সিমুলেশন রিসেট করবেন?
                </span>
              </h3>
              <p className="text-[#6B7280] font-medium mb-1 mt-4">
                Are you sure you want to change the reaction? Your current
                progress will be reset.
              </p>
              <p className="text-[#6B7280] font-medium mb-8">
                আপনি কি বিক্রিয়াটি পরিবর্তন করতে চান? আপনার বর্তমান কাজগুলো
                রিসেট হয়ে যাবে।
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setPendingReactionIdx(null)}
                  className="flex-1 h-14 rounded-2xl border border-[#E5E7EB] text-gray-500 font-bold hover:bg-gray-50 hover:text-gray-700 transition-all font-['Inter']"
                >
                  Cancel • বাতিল
                </button>
                <button
                  onClick={() => {
                    setCurrentReactionIdx(pendingReactionIdx);
                    setPendingReactionIdx(null);
                    setIsSearchOpen(false);
                  }}
                  className="flex-1 h-14 rounded-2xl bg-[#E8001D] text-white font-bold hover:bg-[#be0018] shadow-lg shadow-red-500/20 transition-all font-['Inter']"
                >
                  Confirm • নিশ্চিত
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
