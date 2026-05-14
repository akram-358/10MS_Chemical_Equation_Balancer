import React, { useState, Suspense, useMemo, useEffect, useRef, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import {
  FlaskConical, RotateCw, ChevronRight, ChevronLeft, Search,
  CheckCircle2, LayoutDashboard, Library, User, Scale, Calculator,
  Info, Plus, Minus, ArrowRight, TrendingUp,
  Lightbulb, Sparkles, BookOpen, X, ChevronDown,
  Atom, Beaker, Zap, ZoomIn, ZoomOut, RefreshCw,
  Link2, TableProperties, Trophy, Target,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MolecularCluster } from "./components/Molecule3D";
import { REACTIONS } from "./MoleculeLibrary";
import { BalancerSimulation } from "./components/BalancerSimulation";
import TenCard from "./components/ui/TenCard";
import TenInput from "./components/ui/TenInput";

// ─────────────────────────────────────────────────────────────────────────────
// Periodic Element Data
// ─────────────────────────────────────────────────────────────────────────────
const ELEMENTS: Record<string, {
  number: number; name: string; nameBn: string;
  mass: number; color: string; bg: string; category: string;
}> = {
  H:  { number: 1,  name: "Hydrogen",   nameBn: "হাইড্রোজেন",   mass: 1.008,   color: "#1D4ED8", bg: "#DBEAFE", category: "Nonmetal" },
  He: { number: 2,  name: "Helium",     nameBn: "হিলিয়াম",      mass: 4.003,   color: "#6D28D9", bg: "#EDE9FE", category: "Noble Gas" },
  C:  { number: 6,  name: "Carbon",     nameBn: "কার্বন",        mass: 12.011,  color: "#111827", bg: "#F3F4F6", category: "Nonmetal" },
  N:  { number: 7,  name: "Nitrogen",   nameBn: "নাইট্রোজেন",   mass: 14.007,  color: "#1E40AF", bg: "#EFF6FF", category: "Nonmetal" },
  O:  { number: 8,  name: "Oxygen",     nameBn: "অক্সিজেন",     mass: 15.999,  color: "#B91C1C", bg: "#FEF2F2", category: "Nonmetal" },
  Na: { number: 11, name: "Sodium",     nameBn: "সোডিয়াম",     mass: 22.990,  color: "#5B21B6", bg: "#F5F3FF", category: "Alkali Metal" },
  Mg: { number: 12, name: "Magnesium",  nameBn: "ম্যাগনেসিয়াম", mass: 24.305,  color: "#065F46", bg: "#ECFDF5", category: "Alkaline" },
  S:  { number: 16, name: "Sulfur",     nameBn: "সালফার",       mass: 32.06,   color: "#92400E", bg: "#FFFBEB", category: "Nonmetal" },
  Cl: { number: 17, name: "Chlorine",   nameBn: "ক্লোরিন",      mass: 35.45,   color: "#166534", bg: "#F0FDF4", category: "Halogen" },
  K:  { number: 19, name: "Potassium",  nameBn: "পটাসিয়াম",    mass: 39.098,  color: "#7C3AED", bg: "#F5F3FF", category: "Alkali Metal" },
  Ca: { number: 20, name: "Calcium",    nameBn: "ক্যালসিয়াম",   mass: 40.078,  color: "#374151", bg: "#F9FAFB", category: "Alkaline" },
  Fe: { number: 26, name: "Iron",       nameBn: "লোহা",         mass: 55.845,  color: "#78350F", bg: "#FEF3C7", category: "Transition" },
  Cu: { number: 29, name: "Copper",     nameBn: "তামা",         mass: 63.546,  color: "#B45309", bg: "#FFFBEB", category: "Transition" },
  Zn: { number: 30, name: "Zinc",       nameBn: "জিঙ্ক",        mass: 65.38,   color: "#155E75", bg: "#ECFEFF", category: "Transition" },
  Ag: { number: 47, name: "Silver",     nameBn: "রুপা",         mass: 107.87,  color: "#4B5563", bg: "#F9FAFB", category: "Transition" },
};

const getEl = (sym: string) =>
  ELEMENTS[sym] ?? { number: 0, name: sym, nameBn: sym, mass: 0, color: "#6B7280", bg: "#F3F4F6", category: "Unknown" };

// ─────────────────────────────────────────────────────────────────────────────
// CameraController — inside Canvas, imperative zoom
// ─────────────────────────────────────────────────────────────────────────────
const CameraController = ({ zoom, controlsRef }: { zoom: number; controlsRef: React.MutableRefObject<any> }) => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.setLength(Math.max(3, zoom));
    camera.updateProjectionMatrix();
    controlsRef.current?.update();
  }, [zoom]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip
// ─────────────────────────────────────────────────────────────────────────────
const Tooltip = ({
  content, children, side = "top",
}: { content: React.ReactNode; children: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) => {
  const [visible, setVisible] = useState(false);

  const getPositionStyles = () => {
    switch (side) {
      case "top":
        return { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
      case "bottom":
        return { top: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
      case "left":
        return { right: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" };
      case "right":
        return { left: "calc(100% + 6px)", top: "50%", transform: "translateY(-50%)" };
      default:
        return {};
    }
  };

  const getAnimationProps = () => {
    switch (side) {
      case "top":
        return { y: 4 };
      case "bottom":
        return { y: -4 };
      case "left":
        return { x: 4 };
      case "right":
        return { x: -4 };
      default:
        return {};
    }
  };

  return (
    <div className="relative inline-flex isolate"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible((v) => !v)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, ...getAnimationProps() }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, ...getAnimationProps() }}
            transition={{ duration: 0.15 }}
            className="tooltip-card absolute z-[500] pointer-events-none"
            style={getPositionStyles() as React.CSSProperties}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PeriodicAtomCard
// ─────────────────────────────────────────────────────────────────────────────
const PeriodicAtomCard = ({
  symbol, count, size = "md", isHighlighted, onSelect, onDeselect,
}: {
  symbol: string; count?: number; size?: "sm" | "md" | "lg";
  isHighlighted?: boolean; onSelect?: () => void; onDeselect?: () => void;
}) => {
  const el = getEl(symbol);
  const s = {
    sm: { card: "w-11 h-[60px]", num: "text-[7px]", sym: "text-sm",  name: "text-[6px]", mass: "text-[6px]" },
    md: { card: "w-14 h-[72px]", num: "text-[8px]", sym: "text-lg",  name: "text-[7px]", mass: "text-[7px]" },
    lg: { card: "w-18 h-[86px]", num: "text-[9px]", sym: "text-2xl", name: "text-[8px]", mass: "text-[8px]" },
  }[size];
  return (
    <Tooltip side="bottom" content={
      <div>
        <p className={`font-bold dynamic-color [--dynamic-color:${el.color}]`}>{el.nameBn} / {el.name}</p>
        <p className="text-[var(--gray-500)]">#{el.number} · {el.mass} g/mol</p>
        <p className="text-[var(--gray-400)]">{el.category}</p>
      </div>
    }>
      <div
        className={`${s.card} relative rounded-xl border-2 flex flex-col items-center justify-center pt-1 pb-1.5 px-0.5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 dynamic-border dynamic-bg [--dynamic-border:${el.color}] [--dynamic-bg:${el.bg}] ${isHighlighted ? `[box-shadow:0_0_0_3px_${el.color}55,0_0_16px_${el.color}44] [transform:scale(1.08)_translateY(-2px)]` : ""}`}
        onMouseEnter={onSelect}
        onMouseLeave={onDeselect}
      >
        <span className={`absolute top-0.5 left-1 ${s.num} font-bold opacity-60 dynamic-color [--dynamic-color:${el.color}]`}>{el.number}</span>
        {count !== undefined && (
          <span className={`absolute top-0.5 right-1 ${s.num} font-black dynamic-color [--dynamic-color:${el.color}]`}>×{count}</span>
        )}
        <span className={`${s.sym} font-black leading-none mt-2 dynamic-color [--dynamic-color:${el.color}]`}>{symbol}</span>
        <span className={`${s.name} font-semibold text-center leading-tight mt-0.5 opacity-70 dynamic-color [--dynamic-color:${el.color}]`}>{el.nameBn}</span>
        <span className={`${s.mass} font-medium opacity-50 mt-0.5 dynamic-color [--dynamic-color:${el.color}]`}>{el.mass.toFixed(el.mass < 10 ? 3 : 2)}</span>
      </div>
    </Tooltip>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Atom Tracker
// ─────────────────────────────────────────────────────────────────────────────
const AtomTracker = ({ atomCounts }: { atomCounts: { left: Record<string, number>; right: Record<string, number> } }) => {
  const elements = useMemo(
    () => Array.from(new Set([...Object.keys(atomCounts.left), ...Object.keys(atomCounts.right)])),
    [atomCounts]
  );
  const maxCount = useMemo(
    () => Math.max(1, ...elements.map((e) => Math.max(atomCounts.left[e] || 0, atomCounts.right[e] || 0))),
    [atomCounts, elements]
  );
  return (
    <div className="space-y-2">
      {elements.map((e) => {
        const L = atomCounts.left[e] || 0;
        const R = atomCounts.right[e] || 0;
        const ok = L === R;
        const el = getEl(e);
        return (
          <Tooltip key={e} side="bottom" content={
            <div>
              <p className={`font-bold dynamic-color [--dynamic-color:${el.color}]`}>{el.nameBn} ({e})</p>
              <p>বাম (Reactants): <strong>{L}</strong></p>
              <p>ডান (Products): <strong>{R}</strong></p>
              <p className={ok ? "text-[#15803D] font-bold" : "text-[#DC2626] font-bold"}>
                {ok ? "✓ সমতা আছে" : `${Math.abs(L - R)} টি ফারাক`}
              </p>
            </div>
          }>
            <div className={`rounded-xl p-2.5 border transition-all ${ok ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-[#FFF8F8] border-[#FECACA]"}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black shrink-0 dynamic-bg [--dynamic-bg:${el.color}]`}>{e}</div>
                <span className={`text-[9px] font-bold flex-1 dynamic-color [--dynamic-color:${el.color}]`}>{el.nameBn}</span>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${ok ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#B91C1C]"}`}>
                  {ok ? "✓" : `${L}≠${R}`}
                </span>
              </div>
              <div className="space-y-1">
                {[["বাম", L, el.color], ["ডান", R, ok ? "#16A34A" : "#EF4444"]].map(([label, val, clr]) => (
                  <div key={label as string} className="flex items-center gap-1.5">
                    <span className="text-[7px] font-bold text-[var(--gray-400)] w-8 shrink-0 text-right">{label} ({val})</span>
                    <div className="flex-1 h-3 bg-[var(--gray-100)] rounded-full overflow-hidden">
                      <motion.div className={`h-full rounded-full dynamic-bg [--dynamic-bg:${clr as string}]`}
                        animate={{ width: `${((val as number) / maxCount) * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Balancer Table
// ─────────────────────────────────────────────────────────────────────────────
const BalancerTable = ({
  reaction, coeffs, atomCounts, showMolarMass, onToggleMolarMass,
}: {
  reaction: typeof REACTIONS[0];
  coeffs: Record<string, number>;
  atomCounts: { left: Record<string, number>; right: Record<string, number> };
  showMolarMass: boolean;
  onToggleMolarMass: () => void;
}) => {
  const elements = useMemo(() =>
    Array.from(new Set([
      ...reaction.reactants.flatMap((r) => Object.keys(r.atoms)),
      ...reaction.products.flatMap((p) => Object.keys(p.atoms)),
    ])),
    [reaction]
  );
  const allMols = [...reaction.reactants, ...reaction.products];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--gray-400)] flex items-center gap-1">
          <TableProperties size={10} /> ব্যালান্সার টেবিল
        </span>
        <button onClick={onToggleMolarMass}
          className="text-[8px] font-bold text-[var(--gray-400)] hover:text-[var(--ten-red)] flex items-center gap-0.5 transition-all"
        >
          {showMolarMass ? "ভর লুকাও" : "ভর দেখাও"}
        </button>
      </div>
      <div className="overflow-x-auto no-scrollbar rounded-xl border border-[var(--border)]">
        <table className="balancer-table w-full text-left">
          <thead>
            <tr className="bg-[var(--gray-50)]">
              <th className="text-left text-[var(--gray-500)] px-3 py-2 rounded-tl-xl bn">অণু</th>
              <th className="text-center text-[var(--gray-500)] bn">সহগ</th>
              {elements.map((e) => {
                const el = getEl(e);
                return (
                  <th key={e} className={`text-center dynamic-bg dynamic-color [--dynamic-bg:${el.bg}] [--dynamic-color:${el.color}]`}>
                    {e}
                  </th>
                );
              })}
              {showMolarMass && <th className="text-center text-[var(--gray-500)] bn">আ.ভর</th>}
              <th className="text-center text-[var(--gray-500)] bn rounded-tr-xl">মোট ভর</th>
            </tr>
          </thead>
          <tbody>
            {/* Reactants header */}
            <tr className="bg-[#EFF6FF]">
              <td colSpan={3 + elements.length + (showMolarMass ? 1 : 0)}
                className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-[#1D4ED8]"
              >
                বিক্রিয়ক — Reactants
              </td>
            </tr>
            {reaction.reactants.map((m) => {
              const c = coeffs[m.id] || 1;
              return (
                <tr key={m.id} className="hover:bg-[var(--gray-50)] transition-colors">
                  <td className="px-3 py-2 font-mono font-bold text-[var(--ten-ink)] text-left">{m.id}</td>
                  <td className="font-black text-[var(--ten-red)]">{c}</td>
                  {elements.map((e) => {
                    const cnt = (m.atoms[e] || 0) * c;
                    const el = getEl(e);
                    return (
                      <td key={e}
                        className={`${cnt > 0 ? "font-bold dynamic-color" : "text-[var(--gray-300)]"} ${cnt > 0 ? `[--dynamic-color:${el.color}]` : ""}`}>
                        {cnt > 0 ? cnt : "—"}
                      </td>
                    );
                  })}
                  {showMolarMass && <td className="text-[var(--gray-500)]">{m.molarMass.toFixed(2)}</td>}
                  <td className="font-bold text-[var(--ten-red)]">{(m.molarMass * c).toFixed(2)}</td>
                </tr>
              );
            })}
            {/* Reactant totals */}
            <tr className="bg-[#EFF6FF] border-t-2 border-[#BFDBFE]">
              <td className="px-3 py-1.5 text-[8px] font-bold uppercase text-[#1D4ED8] bn" colSpan={2}>বিক্রিয়ক মোট</td>
              {elements.map((e) => {
                const tot = atomCounts.left[e] || 0;
                const ok  = tot === (atomCounts.right[e] || 0);
                return (
                  <td key={e} className={`font-black ${ok ? "text-[#15803D]" : "text-[#DC2626]"}`}>{tot}</td>
                );
              })}
              {showMolarMass && <td />}
              <td />
            </tr>

            {/* Products header */}
            <tr className="bg-[#F0FDF4]">
              <td colSpan={3 + elements.length + (showMolarMass ? 1 : 0)}
                className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest text-[#166534]"
              >
                উৎপাদ — Products
              </td>
            </tr>
            {reaction.products.map((m) => {
              const c = coeffs[m.id] || 1;
              return (
                <tr key={m.id} className="hover:bg-[var(--gray-50)] transition-colors">
                  <td className="px-3 py-2 font-mono font-bold text-[var(--ten-ink)] text-left">{m.id}</td>
                  <td className="font-black text-[var(--ten-red)]">{c}</td>
                  {elements.map((e) => {
                    const cnt = (m.atoms[e] || 0) * c;
                    const el = getEl(e);
                    return (
                      <td key={e}
                        className={`${cnt > 0 ? "font-bold dynamic-color" : "text-[var(--gray-300)]"} ${cnt > 0 ? `[--dynamic-color:${el.color}]` : ""}`}>
                        {cnt > 0 ? cnt : "—"}
                      </td>
                    );
                  })}
                  {showMolarMass && <td className="text-[var(--gray-500)]">{m.molarMass.toFixed(2)}</td>}
                  <td className="font-bold text-[#16A34A]">{(m.molarMass * c).toFixed(2)}</td>
                </tr>
              );
            })}
            {/* Product totals */}
            <tr className="bg-[#F0FDF4] border-t-2 border-[#86EFAC]">
              <td className="px-3 py-1.5 text-[8px] font-bold uppercase text-[#166534] bn" colSpan={2}>উৎপাদ মোট</td>
              {elements.map((e) => {
                const tot = atomCounts.right[e] || 0;
                const ok  = tot === (atomCounts.left[e] || 0);
                return (
                  <td key={e} className={`font-black ${ok ? "text-[#15803D]" : "text-[#DC2626]"}`}>{tot}</td>
                );
              })}
              {showMolarMass && <td />}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress Journey Bar
// ─────────────────────────────────────────────────────────────────────────────
const ProgressJourneyBar = ({
  reactions, solvedReactions, currentIdx, onSelect,
}: {
  reactions: typeof REACTIONS;
  solvedReactions: Set<string>;
  currentIdx: number;
  onSelect: (i: number) => void;
}) => (
  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2.5">
    {reactions.map((r, i) => {
      const solved  = solvedReactions.has(r.id);
      const current = i === currentIdx;
      return (
        <React.Fragment key={r.id}>
          <Tooltip side="bottom" content={
            <div>
              <p className="font-bold bn text-[var(--ten-ink)] text-xs">{r.name}</p>
              <p className="text-[var(--gray-400)] text-[10px]">{solved ? "✓ সমাধান · Solved" : current ? "সক্রিয় · Active" : "অসমাধান · Unsolved"}</p>
            </div>
          }>
            <button
              onClick={() => onSelect(i)}
              className={`journey-dot shrink-0 transition-all ${
                solved   ? "bg-[var(--ten-red)] border-[var(--ten-red)] text-white"
                : current ? "bg-white border-[var(--ten-red)] text-[var(--ten-red)]"
                :           "bg-[var(--gray-100)] border-[var(--gray-300)] text-[var(--gray-400)]"
              }`}
            >
              {solved
                ? <CheckCircle2 size={16} />
                : <span className="text-[11px] font-black">{i + 1}</span>
              }
            </button>
          </Tooltip>
          {i < reactions.length - 1 && (
            <div className={`h-1.5 flex-1 min-w-[8px] rounded-full transition-all ${
              solvedReactions.has(r.id) ? "bg-[var(--ten-red)]" : "bg-[var(--gray-200)]"
            }`} />
          )}
        </React.Fragment>
      );
    })}
    <span className="text-xs font-bold text-[var(--gray-400)] shrink-0 ml-2">
      {solvedReactions.size}/{reactions.length}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Completion Modal
// ─────────────────────────────────────────────────────────────────────────────
const CompletionModal = ({
  reaction, solvedCount, totalCount, onNext, onLibrary, onClose,
}: {
  reaction: typeof REACTIONS[0];
  solvedCount: number; totalCount: number;
  onNext: () => void; onLibrary: () => void; onClose: () => void;
}) => (
  <div className="modal-overlay" onClick={onClose}>
    <motion.div
      initial={{ scale: 0.85, y: 24, opacity: 0 }}
      animate={{ scale: 1,    y: 0,  opacity: 1 }}
      exit={{    scale: 0.85, y: 24, opacity: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="bg-white rounded-[24px] p-6 max-w-[360px] w-full mx-4 shadow-[var(--sh-float)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <div>
          <h3 className="text-xl font-bold bn text-[var(--ten-ink)]">অভিনন্দন!</h3>
          <p className="text-xs text-[var(--gray-400)] mt-1">তুমি সফলভাবে সমতা করেছ</p>
        </div>
        <div className="bg-[var(--gray-50)] rounded-xl p-3 border border-[var(--border)]">
          <p className="font-bold bn text-sm text-[var(--ten-ink)]">{reaction.name}</p>
          <p className="font-mono text-xs text-[var(--gray-400)] mt-0.5">{reaction.formula}</p>
        </div>
        <div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--gray-500)] mb-1.5">
            <span className="bn">অগ্রগতি</span>
            <span>{solvedCount} / {totalCount} বিক্রিয়া</span>
          </div>
          <div className="h-2 bg-[var(--gray-100)] rounded-full overflow-hidden">
            <motion.div className="h-full bg-[var(--ten-red)] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(solvedCount / totalCount) * 100}%` }}
              transition={{ delay: 0.3, duration: 0.7 }}
            />
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button className="btn-pill flex-1 text-xs bn py-2.5"
            onClick={onLibrary}>লাইব্রেরি</button>
          <button className="btn-red flex-1 text-xs gap-1 bn py-2.5 rounded-xl"
            onClick={onNext}>পরবর্তী <ChevronRight size={13} /></button>
        </div>
      </div>
    </motion.div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tutorial Dropdown content
// ─────────────────────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  { title: "বিক্রিয়া বেছে নাও · Choose a Reaction", body: "বাম সাইডবার বা প্রগ্রেস বার থেকে যেকোনো বিক্রিয়া বেছে নাও। / Select any reaction from the left sidebar or the progress bar." },
  { title: "সহগ পরিবর্তন করো · Adjust Coefficients", body: "+ ও − বাটন দিয়ে প্রতিটি অণুর সহগ পরিবর্তন করো। / Use + and − buttons to change each molecule's coefficient." },
  { title: "পরমাণু ট্র্যাকার দেখো · Watch Atom Tracker", body: "ডানদিকের লাইভ ট্র্যাকারে দেখো কোন পরমাণু এখনো অসমান। / Watch the live tracker to see which atoms are still unbalanced." },
  { title: "সিমুলেশন ও টেবিল · Simulation & Table", body: "ব্যালান্সার সিমুলেশনে ভিজুয়ালি দেখো, টেবিলে সব সংখ্যা মিলাও। / Visualise in the Balancer Simulation, then confirm numbers in the table." },
];

const TutorialDropdownPanel = ({
  stepsSeen, onStepSeen, onClose,
}: {
  stepsSeen: Set<number>; onStepSeen: (n: number) => void; onClose: () => void;
}) => (
  <div className="tutorial-dropdown">
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
      <div>
        <p className="text-sm font-bold bn text-[var(--ten-ink)]">কীভাবে ব্যবহার করবে?</p>
        <p className="text-[9px] text-[var(--gray-400)] font-bold mt-0.5">{stepsSeen.size}/4 ধাপ সম্পন্ন</p>
      </div>
      <button onClick={onClose} className="p-1 rounded-full hover:bg-[var(--gray-100)] transition-all" title="বন্ধ করুন · Close">
        <X size={14} className="text-[var(--gray-500)]" />
      </button>
    </div>
    {/* Progress bar */}
    <div className="h-1 bg-[var(--gray-100)]">
      <div className={`h-full bg-[var(--ten-red)] transition-all progress-bar-fill [--progress:${(stepsSeen.size / 4) * 100}%]`} />
    </div>
    <div className="px-4 py-2 space-y-0">
      {TUTORIAL_STEPS.map((s, i) => (
        <div key={i}
          className={`flex gap-3 py-3 cursor-pointer ${i < TUTORIAL_STEPS.length - 1 ? "border-b border-[var(--border)]" : ""}`}
          onClick={() => onStepSeen(i)}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            stepsSeen.has(i) ? "bg-[var(--ten-red)] border-[var(--ten-red)]" : "border-[var(--gray-300)]"
          }`}>
            {stepsSeen.has(i) && <CheckCircle2 size={11} className="text-white" />}
          </div>
          <div className="flex-1">
            <p className={`text-xs font-bold bn ${stepsSeen.has(i) ? "text-[var(--gray-400)] line-through" : "text-[var(--ten-ink)]"}`}>{s.title}</p>
            <p className="text-[10px] text-[var(--gray-400)] bn mt-0.5 leading-relaxed">{s.body}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--gray-50)]">
      {stepsSeen.size === 4
        ? <p className="text-[10px] font-bold text-[#15803D] bn text-center">✓ সব ধাপ শেষ! এখন নিজে চেষ্টা করো।</p>
        : <p className="text-[9px] text-[var(--gray-400)] text-center">{4 - stepsSeen.size}টি ধাপ বাকি আছে।</p>
      }
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────────────────
const Navbar = ({
  onSearchClick, showTutorial, onTutorialToggle,
  tutorialStepsSeen, onStepSeen, solvedCount, totalCount,
  lang, onLangToggle,
}: {
  onSearchClick: () => void;
  showTutorial: boolean; onTutorialToggle: () => void;
  tutorialStepsSeen: Set<number>; onStepSeen: (n: number) => void;
  solvedCount: number; totalCount: number;
  lang: "bn" | "en"; onLangToggle: () => void;
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTutorial) return;
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) onTutorialToggle();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTutorial]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-white/95 backdrop-blur-[40px] border-b border-[var(--border)] z-[200] px-4 lg:px-8 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <img src="https://cdn.10minuteschool.com/images/svg/Origin%20Labs%20Black.svg" alt="10MS Logo" className="h-9 w-auto object-contain shrink-0" />
        <div>
          <h1 className="text-[14px] font-bold leading-none text-[var(--ten-ink)] bn">রসায়ন ল্যাব</h1>
          <p className="text-[8px] font-bold text-[var(--ten-red)] uppercase tracking-widest mt-0.5">Chemical Equation Balancer</p>
        </div>
      </div>
      <div className="flex items-center gap-1 relative" ref={dropdownRef}>
        <button onClick={onSearchClick} className="p-2 rounded-xl text-[var(--gray-500)] hover:text-[var(--ten-red)] hover:bg-[#FFF0F1] transition-all" title="খুঁজুন · Search">
          <Search size={17} />
        </button>
        {/* Language toggle */}
        <button onClick={onLangToggle}
          className="px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all hover:border-[var(--ten-red)] hover:text-[var(--ten-red)]"
          title="Toggle language"
        >
          {lang === "bn" ? "English" : "বাংলা"}
        </button>
        {/* Tutorial button */}
        <button onClick={onTutorialToggle}
          className={`relative p-2 rounded-xl transition-all ${showTutorial ? "bg-[var(--ten-red)] text-white" : "text-[var(--gray-500)] hover:text-[var(--ten-red)] hover:bg-[#FFF0F1]"}`}
        >
          <BookOpen size={17} />
          {solvedCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#16A34A] text-white text-[7px] font-black rounded-full flex items-center justify-center">
              {solvedCount}
            </span>
          )}
        </button>
        {/* Tutorial dropdown */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{    opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="tutorial-dropdown-container"
            >
              <TutorialDropdownPanel
                stepsSeen={tutorialStepsSeen}
                onStepSeen={onStepSeen}
                onClose={onTutorialToggle}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--ten-red)] ml-1 shrink-0">
          <img src="https://ui-avatars.com/api/?name=Student&background=E8001D&color=fff" alt="Profile" />
        </div>
      </div>
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Nav
// ─────────────────────────────────────────────────────────────────────────────
const BottomNav = ({ activeTab, setActiveTab, lang }: { activeTab: string; setActiveTab: (t: string) => void; lang: "bn" | "en" }) => (
  <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-white/95 backdrop-blur-[40px] border-t border-[var(--border)] z-[200] flex items-center justify-around px-2 shadow-[var(--sh-nav)]">
    {[
      { id: "home",    icon: LayoutDashboard, bn: "হোম",       en: "Home" },
      { id: "lab",     icon: FlaskConical,    bn: "ল্যাব",     en: "Lab" },
      { id: "library", icon: Library,         bn: "লাইব্রেরি", en: "Library" },
      { id: "profile", icon: User,            bn: "প্রোফাইল", en: "Profile" },
    ].map((tab) => (
      <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-all ${
          activeTab === tab.id ? "text-[var(--ten-red)] bg-[#FFF0F1]" : "text-[var(--gray-400)]"
        }`}
      >
        <tab.icon size={19} fill={activeTab === tab.id ? "currentColor" : "none"} />
        <span className="text-[9px] font-bold bn">{lang === "bn" ? tab.bn : tab.en}</span>
      </button>
    ))}
  </nav>
);

// ─────────────────────────────────────────────────────────────────────────────
// Accordion
// ─────────────────────────────────────────────────────────────────────────────
const Accordion = ({
  title, icon, children, defaultOpen = false, badge,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
  defaultOpen?: boolean; badge?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-white">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[var(--gray-50)] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--ten-red)]">{icon}</span>
          <span className="font-bold text-base text-[var(--ten-ink)] bn leading-tight">{title}</span>
          {badge}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} className="text-[var(--gray-400)]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="c" initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Coefficient Control (with tooltip)
// ─────────────────────────────────────────────────────────────────────────────
const CoefficientControl = ({
  value, onChange, moleculeId, reaction, checkLevel,
}: {
  value: number; onChange: (v: number) => void; moleculeId: string;
  reaction: typeof REACTIONS[0]; checkLevel: number;
}) => {
  const mol = [...reaction.reactants, ...reaction.products].find((m) => m.id === moleculeId)!;
  const isCorrect = checkLevel >= 3 ? value === reaction.correctCoeffs[moleculeId] : null;
  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
      isCorrect === true  ? "border-[#86EFAC] bg-[#F0FDF4]"
      : isCorrect === false ? "border-[#FECACA] bg-[#FFF8F8]"
      : "border-[var(--border)] bg-[var(--gray-50)] hover:border-[var(--ten-red)]/40"
    }`}>
      {/* Atom chips */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {Object.keys(mol.atoms).map((a) => {
          const el = getEl(a);
          return (
            <Tooltip key={a} side="top" content={
              <div>
                <span className={`font-bold dynamic-color [--dynamic-color:${el.color}]`}>{el.nameBn} ({a})</span>
                <p className="text-[var(--gray-400)]">#{el.number} · {el.mass} g/mol</p>
              </div>
            }>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[8px] font-black shadow-sm cursor-help dynamic-bg [--dynamic-bg:${el.color}]`}
              >{a}</div>
            </Tooltip>
          );
        })}
      </div>
      {/* Label */}
      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg border ${
        isCorrect === true ? "bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]" : "bg-white text-[var(--ten-ink)] border-[var(--border)]"
      }`}>
        {moleculeId.split(/([0-9]+)/).map((p, i) =>
          /^[0-9]+$/.test(p) ? <sub key={i} className="text-[8px]">{p}</sub> : p
        )}
      </span>
      {/* Counter */}
      <div className="flex items-center gap-1.5">
        <Tooltip side="top" content={<span>সহগ কমাও</span>}>
          <button className="coeff-btn-minus" onClick={() => onChange(Math.max(1, value - 1))} title="সহগ কমাও · Decrease coefficient">
            <Minus size={10} />
          </button>
        </Tooltip>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg transition-all ${
          isCorrect === true ? "bg-[#16A34A] text-white shadow-sm" : "bg-white border-2 border-[var(--ten-red)] text-[var(--ten-red)]"
        }`}>
          {value}
        </div>
        <Tooltip side="top" content={<span>সহগ বাড়াও</span>}>
          <button className="coeff-btn-plus" onClick={() => onChange(value + 1)} title="সহগ বাড়াও · Increase coefficient">
            <Plus size={10} />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Equation Display
// ─────────────────────────────────────────────────────────────────────────────
const EquationDisplay = ({
  reaction, coeffs, isBalanced,
}: { reaction: typeof REACTIONS[0]; coeffs: Record<string, number>; isBalanced: boolean }) => {
  const mol = (id: string) => {
    const c = coeffs[id] || 1;
    const ok = c === reaction.correctCoeffs[id];
    return (
      <span key={id} className="inline-flex items-baseline gap-0.5">
        <span className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded-md text-xs font-black ${
          ok ? "bg-[#DCFCE7] text-[#15803D]" : "bg-[#FEE2E2] text-[#DC2626]"
        }`}>{c}</span>
        <span className="font-mono font-bold text-sm text-[var(--ten-ink)]">
          {id.split(/([0-9]+)/).map((p, i) => /^[0-9]+$/.test(p) ? <sub key={i} className="text-[9px]">{p}</sub> : p)}
        </span>
      </span>
    );
  };
  return (
    <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 p-3 rounded-xl border text-sm transition-all ${
      isBalanced ? "bg-[#F0FDF4] border-[#86EFAC]" : "bg-[var(--gray-50)] border-[var(--border)]"
    }`}>
      {reaction.reactants.map((r, i) => (
        <React.Fragment key={r.id}>
          {mol(r.id)}
          {i < reaction.reactants.length - 1 && <span className="font-bold text-[var(--gray-300)] text-base">+</span>}
        </React.Fragment>
      ))}
      <span className="text-[var(--ten-red)]"><ArrowRight size={15} /></span>
      {reaction.products.map((p, i) => (
        <React.Fragment key={p.id}>
          {mol(p.id)}
          {i < reaction.products.length - 1 && <span className="font-bold text-[var(--gray-300)] text-base">+</span>}
        </React.Fragment>
      ))}
      {isBalanced && <CheckCircle2 size={15} className="text-[#16A34A] ml-1" />}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Check Solution Panel
// ─────────────────────────────────────────────────────────────────────────────
const CheckSolutionPanel = ({
  level, onNextHint, onReveal, onClose, atomCounts, reaction, coeffs,
}: {
  level: number; onNextHint: () => void; onReveal: () => void; onClose: () => void;
  atomCounts: { left: Record<string, number>; right: Record<string, number> };
  reaction: typeof REACTIONS[0]; coeffs: Record<string, number>;
}) => {
  const unbalanced = Object.keys(atomCounts.left).filter(
    (e) => (atomCounts.left[e] || 0) !== (atomCounts.right[e] || 0)
  );
  return (
    <AnimatePresence>
      {level > 0 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }} className="space-y-2.5 mt-2"
        >
          {level >= 1 && (
            <div className="hint-box-1 border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={13} />
                <span className="text-[9px] font-bold uppercase tracking-widest">ইঙ্গিত ১ — অসমান পরমাণু</span>
              </div>
              {unbalanced.length === 0
                ? <p className="text-sm font-bold bn">সব সমান! 🎉</p>
                : <div className="flex flex-wrap gap-1.5">
                    {unbalanced.map((e) => {
                      const el = getEl(e);
                      return (
                        <span key={e} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-white/60 border border-current">
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-white text-[7px] font-black dynamic-bg [--dynamic-bg:${el.color}]`}>{e}</span>
                          {atomCounts.left[e]||0} ≠ {atomCounts.right[e]||0}
                        </span>
                      );
                    })}
                  </div>
              }
            </div>
          )}
          {level >= 2 && (() => {
            const first = reaction.reactants[0];
            const correct = reaction.correctCoeffs[first.id];
            return (
              <div className="hint-box-2 border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={13} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">ইঙ্গিত ২ — প্রথম সহগ</span>
                </div>
                <p className="text-sm font-bold bn">
                  <span className="font-mono">{first.id}</span> → সহগ = <span className="text-lg font-black">{correct}</span>
                  {coeffs[first.id] === correct
                    ? <span className="text-[#15803D] ml-2">✓</span>
                    : <span className="text-[#DC2626] ml-2">→ ঠিক করো</span>
                  }
                </p>
              </div>
            );
          })()}
          {level >= 3 && (
            <div className="hint-box-3 border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={13} />
                <span className="text-[9px] font-bold uppercase tracking-widest">সম্পূর্ণ সমাধান</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(reaction.correctCoeffs).map(([id, coeff]) => (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/60 border border-current">
                    <span className="font-black text-sm">{coeff}</span>
                    <span className="font-mono">{id}</span>
                    {coeffs[id] === coeff && <CheckCircle2 size={10} />}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {level < 3 && (
              <button onClick={onNextHint} className="btn-pill text-xs gap-1 py-1.5 px-3">
                <Lightbulb size={11} /> পরবর্তী
              </button>
            )}
            {level < 3 && (
              <button onClick={onReveal} className="btn-pill text-xs gap-1 py-1.5 px-3">
                সব দেখাও
              </button>
            )}
            <button onClick={onClose} className="btn-pill text-xs gap-1 py-1.5 px-3 border-[var(--ten-red)] text-[var(--ten-red)]">
              <X size={11} /> বন্ধ
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Molecule Info Card
// ─────────────────────────────────────────────────────────────────────────────
const MoleculeInfoCard = ({ molecule, coeff, role }: {
  molecule: typeof REACTIONS[0]["reactants"][0]; coeff: number; role: "reactant" | "product";
}) => (
  <div className={`rounded-2xl p-3 border-2 space-y-2 ${
    role === "reactant" ? "border-[#BFDBFE] bg-[#EFF6FF]" : "border-[#BBF7D0] bg-[#F0FDF4]"
  }`}>
    <div className="flex items-center justify-between">
      <span className="font-mono font-black text-sm text-[var(--ten-ink)]">{molecule.id}</span>
      <span className={`text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
        role === "reactant" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#DCFCE7] text-[#166534]"
      }`}>{role === "reactant" ? "বিক্রিয়ক · Reactant" : "উৎপাদ · Product"}</span>
    </div>
    <div className="flex flex-wrap gap-1">
      {Object.entries(molecule.atoms).map(([a, c]) => (
        <PeriodicAtomCard key={a} symbol={a} count={c * coeff} size="sm" />
      ))}
    </div>
    <div className="flex items-center justify-between text-[9px] font-bold text-[var(--gray-500)]">
      <span>{molecule.name}</span>
      <span>{(molecule.molarMass * coeff).toFixed(2)} g</span>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // Core state
  const [activeTab, setActiveTab]   = useState("lab");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [coeffs, setCoeffs]         = useState<Record<string, number>>({});
  const [search, setSearch]         = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [checkLevel, setCheckLevel] = useState(0);

  // New feature state
  const [simMode, setSimMode]     = useState<"3d" | "balancer">("3d");
  const [zoom3D, setZoom3D]       = useState(8);
  const [showBonds, setShowBonds] = useState(true);
  const [showMolarMass, setShowMolarMass] = useState(true);
  const [solvedReactions, setSolvedReactions] = useState<Set<string>>(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showTutorialDropdown, setShowTutorialDropdown] = useState(false);
  const [tutorialStepsSeen, setTutorialStepsSeen] = useState<Set<number>>(new Set());
  const [showOnlyUnsolved, setShowOnlyUnsolved] = useState(false);
  const [hoveredAtom, setHoveredAtom] = useState<{ symbol: string; x: number; y: number } | null>(null);
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [segmentFilter, setSegmentFilter] = useState<"All" | "SSC" | "HSC">("All");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const controlsRef = useRef<any>(null);
  const prevBalanced = useRef(false);

  const reaction = REACTIONS[currentIdx];

  // ── Reset on reaction change ─────────────────────────────────────────────
  const handleReset = useCallback(() => {
    const init: Record<string, number> = {};
    reaction.reactants.forEach((r) => (init[r.id] = 1));
    reaction.products.forEach((p)  => (init[p.id] = 1));
    setCoeffs(init);
    setCheckLevel(0);
  }, [reaction]);

  useEffect(() => {
    handleReset();
    setShowSummary(false);
    prevBalanced.current = false;
  }, [currentIdx]);

  // ── Derived state ────────────────────────────────────────────────────────
  const atomCounts = useMemo(() => {
    const c = { left: {} as Record<string, number>, right: {} as Record<string, number> };
    reaction.reactants.forEach((r) =>
      Object.entries(r.atoms).forEach(([a, n]) => (c.left[a] = (c.left[a] || 0) + n * (coeffs[r.id] || 1)))
    );
    reaction.products.forEach((p) =>
      Object.entries(p.atoms).forEach(([a, n]) => (c.right[a] = (c.right[a] || 0) + n * (coeffs[p.id] || 1)))
    );
    return c;
  }, [coeffs, currentIdx]);

  const isBalanced = useMemo(() => {
    const els = new Set([...Object.keys(atomCounts.left), ...Object.keys(atomCounts.right)]);
    return Array.from(els).every((e) => atomCounts.left[e] === atomCounts.right[e]);
  }, [atomCounts]);

  const reactionElements = useMemo(() =>
    Array.from(new Set([
      ...reaction.reactants.flatMap((r) => Object.keys(r.atoms)),
      ...reaction.products.flatMap((p)  => Object.keys(p.atoms)),
    ])),
    [currentIdx]
  );

  // ── Completion tracking ──────────────────────────────────────────────────
  useEffect(() => {
    if (isBalanced && !prevBalanced.current) {
      setSolvedReactions((prev) => {
        if (prev.has(reaction.id)) return prev;
        const next = new Set(prev);
        next.add(reaction.id);
        setShowCompletionModal(true);
        return next;
      });
    }
    prevBalanced.current = isBalanced;
  }, [isBalanced, reaction.id]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setCoeff = (id: string, v: number) => setCoeffs((p) => ({ ...p, [id]: v }));
  const prevReaction = () => setCurrentIdx((i) => (i - 1 + REACTIONS.length) % REACTIONS.length);
  const nextReaction = () => setCurrentIdx((i) => (i + 1) % REACTIONS.length);

  const filtered = REACTIONS.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.nameEn ?? "").toLowerCase().includes(search.toLowerCase()) ||
      r.formula.toLowerCase().includes(search.toLowerCase());
    const matchSolved = showOnlyUnsolved ? !solvedReactions.has(r.id) : true;
    const matchSegment = segmentFilter === "All" || r.segment === segmentFilter || r.segment === "Both";
    return matchSearch && matchSolved && matchSegment;
  });

  const handleStepSeen = (n: number) =>
    setTutorialStepsSeen((prev) => {
      const s = new Set(prev);
      s.has(n) ? s.delete(n) : s.add(n);
      return s;
    });

  const handleResetZoom = () => {
    setZoom3D(8);
    controlsRef.current?.reset?.();
  };

  // ── 3D Canvas block ───────────────────────────────────────────────────────
  const canvas3D = (
    <div className="aspect-square w-full max-h-[480px] relative">
      {/* Canvas */}
      <div className="absolute inset-0 rounded-xl overflow-hidden bg-black/25 border border-white/5">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <Suspense fallback={null}>
            <CameraController zoom={zoom3D} controlsRef={controlsRef} />
            <Stage environment="city" intensity={0.4}>
              <group position={[-2.5, 0, 0]}>
                {reaction.reactants.map((r, i) => (
                  <group key={r.id} position={[0, (i - (reaction.reactants.length - 1) / 2) * 1.8, 0]}>
                    <MolecularCluster atoms={r.atoms} position={[0, 0, 0]} bondLength={0.8} />
                  </group>
                ))}
              </group>
              <group position={[2.5, 0, 0]}>
                {reaction.products.map((p, i) => (
                  <group key={p.id} position={[0, (i - (reaction.products.length - 1) / 2) * 1.8, 0]}>
                    <MolecularCluster atoms={p.atoms} position={[0, 0, 0]} bondLength={0.8} />
                  </group>
                ))}
              </group>
            </Stage>
          </Suspense>
          <OrbitControls ref={controlsRef} enableZoom={true} minDistance={3} maxDistance={20}
            autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </div>
      {/* Zoom overlay */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 pointer-events-auto">
        <Tooltip side="left" content="Zoom In (+)">
          <button onClick={() => setZoom3D((z) => Math.max(3, z - 1.5))} className="zoom-overlay-btn" title="জুম ইন · Zoom In">
            <ZoomIn size={11} />
          </button>
        </Tooltip>
        <Tooltip side="left" content="Zoom Out (−)">
          <button onClick={() => setZoom3D((z) => Math.min(20, z + 1.5))} className="zoom-overlay-btn" title="জুম আউট · Zoom Out">
            <ZoomOut size={11} />
          </button>
        </Tooltip>
        <Tooltip side="left" content="Reset View">
          <button onClick={handleResetZoom} className="zoom-overlay-btn" title="ভিউ রিসেট · Reset View">
            <RefreshCw size={10} />
          </button>
        </Tooltip>
      </div>
      {/* Labels */}
      <div className="absolute inset-x-0 bottom-2 flex justify-between px-3 pointer-events-none">
        <span className="text-[7px] font-bold text-white/35 uppercase tracking-widest bg-black/25 px-2 py-0.5 rounded-full">⟵ বিক্রিয়ক</span>
        <span className="text-[7px] font-bold text-white/35 uppercase tracking-widest bg-black/25 px-2 py-0.5 rounded-full">উৎপাদ ⟶</span>
      </div>
    </div>
  );

  // ── Balancer sim block ────────────────────────────────────────────────────
  const balancerSimBlock = (
    <div className="space-y-2">
      <BalancerSimulation
        reaction={reaction}
        coeffs={coeffs}
        isBalanced={isBalanced}
        showBonds={showBonds}
        elements={ELEMENTS}
        onAtomHover={setHoveredAtom}
        selectedElement={selectedElement}
      />
      {/* Bond toggle */}
      <div className="flex items-center gap-2 justify-end">
        <button onClick={() => setShowBonds((v) => !v)}
          className={`flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1.5 rounded-full border transition-all ${
            showBonds ? "bg-[var(--ten-red)] text-white border-[var(--ten-red-dark)]" : "bg-white border-[var(--border)] text-[var(--gray-500)]"
          }`}
        >
          <Link2 size={10} /> {showBonds ? "বন্ড দেখাচ্ছে" : "বন্ড লুকানো"}
        </button>
      </div>
    </div>
  );

  // ── Hover tooltip for atom in balancer sim ───────────────────────────────
  const atomHoverTooltip = hoveredAtom && (() => {
    const el = getEl(hoveredAtom.symbol);
    return (
      <div className={`tooltip-card fixed z-[600] pointer-events-none [--left:${hoveredAtom.x + 12}px] [--top:${hoveredAtom.y - 40}px] [left:var(--left)] [top:var(--top)]`}
      >
        <p className={`font-black dynamic-color [--dynamic-color:${el.color}]`}>{hoveredAtom.symbol} · #{el.number}</p>
        <p className="font-bold bn text-[var(--ten-ink)]">{el.nameBn}</p>
        <p className="text-[var(--gray-400)]">{el.mass} g/mol · {el.category}</p>
      </div>
    );
  })();

  // ── Mobile accordion sections ─────────────────────────────────────────────
  const mobileAccordions = (
    <div className="space-y-3 xl:hidden">
      <Accordion title="পরমাণু ট্র্যাকার · Atom Tracker" icon={<Atom size={14} />} defaultOpen={true}
        badge={
          isBalanced
            ? <span className="text-[7px] font-bold bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.5 rounded-full">✓ সমতা</span>
            : <span className="text-[7px] font-bold bg-[#FEE2E2] text-[#DC2626] px-1.5 py-0.5 rounded-full">অসমতা</span>
        }
      >
        <AtomTracker atomCounts={atomCounts} />
      </Accordion>

      <Accordion title="ব্যালান্সার সিমুলেশন · Balancer Simulation" icon={<FlaskConical size={14} />} defaultOpen={false}>
        {balancerSimBlock}
      </Accordion>

      <Accordion title="ব্যালান্সার টেবিল · Balancer Table" icon={<TableProperties size={14} />} defaultOpen={false}>
        <BalancerTable
          reaction={reaction} coeffs={coeffs} atomCounts={atomCounts}
          showMolarMass={showMolarMass} onToggleMolarMass={() => setShowMolarMass((v) => !v)}
        />
      </Accordion>

      <Accordion title="অণু বিশ্লেষণ · Molecule Analysis" icon={<Beaker size={14} />} defaultOpen={false}>
        <div className="space-y-2">
          {reaction.reactants.map((m) => <MoleculeInfoCard key={m.id} molecule={m} coeff={coeffs[m.id] || 1} role="reactant" />)}
          {reaction.products.map((m)  => <MoleculeInfoCard key={m.id} molecule={m} coeff={coeffs[m.id] || 1} role="product" />)}
        </div>
      </Accordion>

      <Accordion title="হিসাব-নিকাশ · Calculations" icon={<Calculator size={14} />} defaultOpen={false}>
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--gray-50)]">
              <tr>
                {["অণু", "আ. ভর", "মোট"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-[8px] font-bold uppercase tracking-widest text-[var(--gray-500)] bn">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[...reaction.reactants, ...reaction.products].map((m) => (
                <tr key={m.id} className="hover:bg-[var(--gray-50)]">
                  <td className="px-3 py-2 font-mono font-bold text-[var(--ten-ink)]">{m.id}</td>
                  <td className="px-3 py-2 text-[var(--gray-500)]">{m.molarMass.toFixed(2)}</td>
                  <td className="px-3 py-2 font-bold text-[var(--ten-red)]">{(m.molarMass * (coeffs[m.id] || 1)).toFixed(2)} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 bg-[var(--info-soft)] rounded-xl border border-[#BFDBFE] flex gap-2 items-start">
          <Zap size={12} className="text-[var(--info)] shrink-0 mt-0.5" />
          <p className="text-[9px] text-[var(--fg-2)] bn leading-relaxed">সমতাকৃত সমীকরণে বাম ও ডান পাশের মোট ভর সমান — ভরের নিত্যতা সূত্র।</p>
        </div>
      </Accordion>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[var(--gray-50)] font-sans pt-[60px] pb-[68px]">
      <Navbar
        onSearchClick={() => setActiveTab("library")}
        showTutorial={showTutorialDropdown}
        onTutorialToggle={() => setShowTutorialDropdown((v) => !v)}
        tutorialStepsSeen={tutorialStepsSeen}
        onStepSeen={handleStepSeen}
        solvedCount={solvedReactions.size}
        totalCount={REACTIONS.length}
        lang={lang}
        onLangToggle={() => setLang((l) => l === "bn" ? "en" : "bn")}
      />

      {/* Fixed atom hover tooltip */}
      {atomHoverTooltip}

      <AnimatePresence mode="wait">

        {/* ================================================================ */}
        {/* LAB TAB                                                          */}
        {/* ================================================================ */}
        {activeTab === "lab" && (
          <motion.div key="lab" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>

            {/* Progress Journey Bar — sticky below navbar */}
            <div className="sticky top-[60px] z-[100] bg-[var(--gray-50)] border-b border-[var(--border)] px-4 lg:px-6 py-3">
              <ProgressJourneyBar
                reactions={REACTIONS}
                solvedReactions={solvedReactions}
                currentIdx={currentIdx}
                onSelect={setCurrentIdx}
              />
            </div>

            {/* 3-column layout */}
            <div className="flex min-h-[calc(100vh-152px)]">

              {/* ── LEFT SIDEBAR (xl+) ─────────────────────────────────── */}
              <aside className="hidden xl:flex flex-col w-[220px] shrink-0 border-r border-[var(--border)] bg-white sticky top-[108px] h-[calc(100vh-168px)] overflow-y-auto no-scrollbar p-3 gap-4">
                <div>
                  <p className="text-[7px] font-bold uppercase tracking-widest text-[var(--gray-400)] mb-2">বিক্রিয়া বেছে নাও</p>
                  <div className="space-y-1">
                    {REACTIONS.map((r, i) => {
                      const solved = solvedReactions.has(r.id);
                      return (
                        <button key={r.id} onClick={() => setCurrentIdx(i)}
                          className={`w-full text-left px-2.5 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                            currentIdx === i
                              ? "bg-[var(--ten-red)] text-white shadow-sm"
                              : "hover:bg-[var(--gray-100)] text-[var(--gray-700)]"
                          }`}
                        >
                          {solved && <CheckCircle2 size={10} className={currentIdx === i ? "text-white" : "text-[#16A34A]"} />}
                          <span className="bn leading-tight flex-1 truncate">{r.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-[var(--border)] pt-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gray-400)] mb-2">পর্যায় সারণী · Periodic Table</p>
                  <div className="flex flex-wrap gap-1">
                    {reactionElements.map((e) => (
                      <PeriodicAtomCard key={e} symbol={e} size="sm"
                        isHighlighted={selectedElement === e}
                        onSelect={() => setSelectedElement(e)}
                        onDeselect={() => setSelectedElement(null)}
                      />
                    ))}
                  </div>
                </div>
              </aside>

              {/* ── CENTER ──────────────────────────────────────────────── */}
              <main className="flex-1 min-w-0 p-4 lg:p-5 space-y-4">

                {/* Reaction navigator */}
                <div className="flex items-center gap-2 bg-white border border-[var(--border)] rounded-2xl px-3 py-2 shadow-sm">
                  <button onClick={prevReaction}
                    className="p-1.5 rounded-xl border border-[var(--border)] hover:border-[var(--ten-red)] hover:text-[var(--ten-red)] transition-all bg-white shrink-0"
                    title="পূর্ববর্তী · Previous"
                  ><ChevronLeft size={15} /></button>
                  <div className="flex-1 min-w-0 text-center">
                    <p className="text-[7px] font-bold uppercase tracking-widest text-[var(--gray-400)]">{currentIdx + 1} / {REACTIONS.length}</p>
                    <p className="text-sm font-bold bn text-[var(--ten-ink)] truncate">{lang === "bn" ? reaction.name : reaction.nameEn}</p>
                  </div>
                  <button onClick={nextReaction}
                    className="p-1.5 rounded-xl border border-[var(--border)] hover:border-[var(--ten-red)] hover:text-[var(--ten-red)] transition-all bg-white shrink-0"
                    title="পরবর্তী · Next"
                  ><ChevronRight size={15} /></button>
                </div>

                {/* Hero dark card */}
                <div className="premium rounded-[20px] overflow-hidden">
                  <div className="p-4 space-y-3">
                    {/* Title + controls */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 bg-[var(--ten-red)]/20 text-[var(--ten-red-soft)] px-2 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border border-[var(--ten-red)]/20">
                          <FlaskConical size={8} /> Active Lab
                        </span>
                        <h2 className="text-lg font-bold bn text-white leading-tight">{lang === "bn" ? reaction.name : reaction.nameEn}</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white/50 font-mono text-xs">{reaction.formula}</p>
                          <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full border ${
                            reaction.segment === "SSC"
                              ? "bg-[#1D4ED8]/20 text-blue-300 border-blue-500/30"
                              : "bg-[var(--ten-red)]/20 text-red-300 border-red-500/30"
                          }`}>{reaction.segment}</span>
                          <span className="text-white/30 text-[7px] truncate max-w-[120px]">
                            {lang === "bn" ? reaction.chapter : reaction.chapterEn}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <Tooltip side="bottom" content="বিক্রিয়ার বিবরণ">
                          <button onClick={() => setShowSummary((v) => !v)}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                            title="বিস্তারিত · Details"
                          ><Info size={15} /></button>
                        </Tooltip>
                        <Tooltip side="bottom" content="রিসেট">
                          <button onClick={handleReset}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                            title="রিসেট · Reset"
                          ><RotateCw size={15} /></button>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Summary */}
                    <AnimatePresence>
                      {showSummary && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                        >
                          <div className="bg-white/10 rounded-xl p-3 border border-white/10 space-y-1.5">
                            <p className="text-xs text-white/85 leading-relaxed">{lang === "bn" ? reaction.summary : reaction.summaryEn}</p>
                            <div className="flex items-start gap-1.5 text-[8px] text-white/40 font-bold border-t border-white/10 pt-2">
                              <TrendingUp size={9} className="shrink-0 mt-0.5" />
                              <span>{lang === "bn" ? reaction.useCase : reaction.useCaseEn}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[7px] text-white/30 pt-1 border-t border-white/10">
                              <BookOpen size={8} />
                              <span>{lang === "bn" ? reaction.chapter : reaction.chapterEn}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Sim mode toggle */}
                    <div className="flex bg-black/20 p-1 rounded-xl gap-1">
                      {[
                        { id: "3d",       label: "3D অণু · Molecule", icon: <Atom size={12} /> },
                        { id: "balancer", label: "ব্যালান্সার · Balancer", icon: <Scale size={12} /> },
                      ].map((m) => (
                        <button key={m.id} onClick={() => setSimMode(m.id as any)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                            simMode === m.id ? "bg-white text-[var(--ten-ink)] shadow-sm" : "text-white/60 hover:text-white/90"
                          }`}
                        >
                          {m.icon}
                          <span className="bn">{m.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Canvas or Sim */}
                    <AnimatePresence mode="wait">
                      <motion.div key={simMode} initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                      >
                        {simMode === "3d" ? canvas3D : balancerSimBlock}
                      </motion.div>
                    </AnimatePresence>

                    {/* Element chips */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {reactionElements.map((e) => {
                        const el = getEl(e);
                        const isHighlit = selectedElement === e;
                        return (
                          <div key={e}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-white cursor-pointer transition-all dynamic-border dynamic-bg [--dynamic-border:${isHighlit ? el.color : "rgba(255,255,255,0.15)"}] [--dynamic-bg:${isHighlit ? `${el.color}55` : "rgba(255,255,255,0.1)"}] ${isHighlit ? `[box-shadow:0_0_10px_${el.color}88]` : ""}`}
                            onMouseEnter={() => setSelectedElement(e)}
                            onMouseLeave={() => setSelectedElement(null)}
                          >
                            <span className="text-[7px] font-bold opacity-50">#{el.number}</span>
                            <span className="text-xs font-black">{e}</span>
                            <span className="text-[7px] opacity-50">{el.nameBn}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live equation */}
                <EquationDisplay reaction={reaction} coeffs={coeffs} isBalanced={isBalanced} />

                {/* Coefficient controls */}
                <div className="bg-white border border-[var(--border)] rounded-2xl p-4 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[9px] font-bold uppercase tracking-widest text-[var(--gray-500)] flex items-center gap-1.5">
                      <Scale size={12} className="text-[var(--ten-red)]" /> সহগ সমতাকরণ · Coefficient Balancing
                    </h3>
                    <button onClick={handleReset}
                      className="text-[9px] font-bold text-[var(--gray-400)] hover:text-[var(--ten-red)] flex items-center gap-1 transition-all"
                    ><RotateCw size={10} /> রিসেট</button>
                  </div>

                  {/* Reactants */}
                  <div>
                    <p className="text-[7px] font-bold uppercase tracking-widest text-[#1D4ED8] mb-2.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#1D4ED8] inline-block" />
                      বিক্রিয়ক — Reactants
                    </p>
                    <div className="flex flex-wrap gap-3 items-center">
                      {reaction.reactants.map((r, i) => (
                        <React.Fragment key={r.id}>
                          <CoefficientControl
                            value={coeffs[r.id] || 1}
                            onChange={(v) => setCoeff(r.id, v)}
                            moleculeId={r.id}
                            reaction={reaction}
                            checkLevel={checkLevel}
                          />
                          {i < reaction.reactants.length - 1 && (
                            <span className="text-2xl font-bold text-[var(--gray-200)]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Arrow divider */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[var(--border)]" />
                    <div className="flex items-center gap-1 px-3 py-1 bg-[#FFF0F1] border border-[#FECACA] rounded-full">
                      <ArrowRight size={13} className="text-[var(--ten-red)]" />
                      <span className="text-[7px] font-bold uppercase tracking-widest text-[var(--ten-red)]">বিক্রিয়া</span>
                    </div>
                    <div className="flex-1 h-px bg-[var(--border)]" />
                  </div>

                  {/* Products */}
                  <div>
                    <p className="text-[7px] font-bold uppercase tracking-widest text-[#166534] mb-2.5 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A] inline-block" />
                      উৎপাদ — Products
                    </p>
                    <div className="flex flex-wrap gap-3 items-center">
                      {reaction.products.map((p, i) => (
                        <React.Fragment key={p.id}>
                          <CoefficientControl
                            value={coeffs[p.id] || 1}
                            onChange={(v) => setCoeff(p.id, v)}
                            moleculeId={p.id}
                            reaction={reaction}
                            checkLevel={checkLevel}
                          />
                          {i < reaction.products.length - 1 && (
                            <span className="text-2xl font-bold text-[var(--gray-200)]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Balance status */}
                  <Tooltip side="top" content={
                    <div>
                      <p className="font-bold bn">ভরের নিত্যতা সূত্র</p>
                      <p className="text-[var(--gray-400)]">বিক্রিয়ায় পরমাণু তৈরি বা ধ্বংস হয় না, শুধু পুনর্বিন্যস্ত হয়।</p>
                    </div>
                  }>
                    <div className={`rounded-xl p-3.5 flex items-center gap-3 transition-all w-full ${
                      isBalanced ? "bg-[#F0FDF4] border border-[#86EFAC]" : "bg-[var(--gray-50)] border border-[var(--border)]"
                    }`}>
                      {isBalanced
                        ? <CheckCircle2 size={19} className="text-[#16A34A] shrink-0" />
                        : <Info size={19} className="text-[var(--gray-400)] shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm bn ${isBalanced ? "text-[#15803D]" : "text-[var(--gray-600)]"}`}>
                          {isBalanced ? "অভিনন্দন! সমীকরণটি সমতাকৃত। · Balanced!" : "পরমাণুর সংখ্যা সমান করো। · Balance the atoms."}
                        </p>
                        {!isBalanced && (
                          <p className="text-[9px] text-[var(--gray-400)] mt-0.5">বাম ও ডান পাশে প্রতিটি মৌলের পরমাণু সংখ্যা সমান হতে হবে। / Both sides must have equal atom counts.</p>
                        )}
                      </div>
                      {isBalanced && <span className="text-xl">🎉</span>}
                    </div>
                  </Tooltip>

                  {/* Hint button */}
                  {!isBalanced && (
                    <>
                      <button
                        onClick={() => setCheckLevel((l) => Math.min(l + 1, 3))}
                        className="w-full btn-red rounded-xl py-3 text-sm gap-2 font-bold"
                      >
                        <Lightbulb size={14} />
                        <span className="bn">সমাধান যাচাই করো</span>
                        {checkLevel > 0 && (
                          <span className="ml-auto px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-black">{checkLevel}/3</span>
                        )}
                      </button>
                      <CheckSolutionPanel
                        level={checkLevel}
                        onNextHint={() => setCheckLevel((l) => Math.min(l + 1, 3))}
                        onReveal={() => setCheckLevel(3)}
                        onClose={() => setCheckLevel(0)}
                        atomCounts={atomCounts}
                        reaction={reaction}
                        coeffs={coeffs}
                      />
                    </>
                  )}
                </div>

                {/* Balancer Table (xl: inline) */}
                <div className="hidden xl:block bg-white border border-[var(--border)] rounded-2xl p-4 shadow-sm">
                  <BalancerTable
                    reaction={reaction} coeffs={coeffs} atomCounts={atomCounts}
                    showMolarMass={showMolarMass} onToggleMolarMass={() => setShowMolarMass((v) => !v)}
                  />
                </div>

                {/* Mobile accordions */}
                {mobileAccordions}
              </main>

              {/* ── RIGHT SIDEBAR (xl+) ──────────────────────────────────── */}
              <aside className="hidden xl:flex flex-col w-[280px] shrink-0 border-l border-[var(--border)] bg-white sticky top-[108px] h-[calc(100vh-168px)] overflow-y-auto no-scrollbar p-4 gap-5">

                {/* Atom tracker */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gray-400)] flex items-center gap-1">
                      <Atom size={11} /> পরমাণু ট্র্যাকার · Atom Tracker
                    </p>
                    {isBalanced
                      ? <span className="text-[7px] font-bold bg-[#DCFCE7] text-[#15803D] px-1.5 py-0.5 rounded-full">✓ সমতা</span>
                      : <span className="text-[7px] font-bold bg-[#FEE2E2] text-[#DC2626] px-1.5 py-0.5 rounded-full">অসমতা</span>
                    }
                  </div>
                  <AtomTracker atomCounts={atomCounts} />
                </div>

                {/* Periodic cards */}
                <div className="border-t border-[var(--border)] pt-4">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gray-400)] mb-2">মৌলসমূহ · Elements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {reactionElements.map((e) => (
                      <PeriodicAtomCard key={e} symbol={e} size="md"
                        isHighlighted={selectedElement === e}
                        onSelect={() => setSelectedElement(e)}
                        onDeselect={() => setSelectedElement(null)}
                      />
                    ))}
                  </div>
                </div>

                {/* Molecule cards */}
                <div className="border-t border-[var(--border)] pt-4 space-y-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gray-400)] mb-2">অণু বিশ্লেষণ · Molecule Analysis</p>
                  {reaction.reactants.map((m) => <MoleculeInfoCard key={m.id} molecule={m} coeff={coeffs[m.id] || 1} role="reactant" />)}
                  {reaction.products.map((m)  => <MoleculeInfoCard key={m.id} molecule={m} coeff={coeffs[m.id] || 1} role="product" />)}
                </div>

              </aside>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* LIBRARY TAB                                                      */}
        {/* ================================================================ */}
        {activeTab === "library" && (
          <motion.div key="library" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            className="px-4 py-5 max-w-[680px] mx-auto space-y-4"
          >
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab("lab")}
                className="p-2 rounded-xl hover:bg-[var(--gray-100)] transition-colors shrink-0"
                title="ল্যাবে ফিরে যান · Back to Lab"
              ><ChevronLeft size={17} /></button>
              <div>
                <h2 className="text-base font-bold bn text-[var(--ten-ink)]">বিক্রিয়া লাইব্রেরি</h2>
                <p className="text-[9px] text-[var(--gray-400)] font-bold">{filtered.length} টি বিক্রিয়া · {solvedReactions.size} সমাধান</p>
              </div>
            </div>

            <TenInput placeholder="বিক্রিয়া বা ফর্মুলা দিয়ে খুঁজুন..." className="bn"
              value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search size={14} />}
            />

            {/* Segment filter: SSC / HSC / All */}
            <div className="flex gap-1.5">
              {(["All", "SSC", "HSC"] as const).map((seg) => (
                <button key={seg} onClick={() => setSegmentFilter(seg)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    segmentFilter === seg
                      ? seg === "SSC" ? "bg-[#1D4ED8] text-white border-[#1D4ED8]"
                        : seg === "HSC" ? "bg-[var(--ten-red)] text-white border-[var(--ten-red-dark)]"
                        : "bg-[var(--ten-ink)] text-white border-[var(--ten-ink)]"
                      : "bg-white border-[var(--border)] text-[var(--gray-500)]"
                  }`}
                >
                  {seg === "All" ? (lang === "bn" ? "সব" : "All") : seg}
                </button>
              ))}
              {/* Solved/unsolved toggle */}
              <button onClick={() => setShowOnlyUnsolved((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  showOnlyUnsolved
                    ? "bg-[#15803D] text-white border-[#15803D]"
                    : "bg-white border-[var(--border)] text-[var(--gray-500)]"
                }`}
              >
                {lang === "bn" ? "অসমাধান" : "Unsolved"}
              </button>
            </div>

            <div className="space-y-2">
              {filtered.map((r) => {
                const solved = solvedReactions.has(r.id);
                const segColor = r.segment === "SSC"
                  ? "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]"
                  : r.segment === "HSC"
                  ? "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]"
                  : "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]";
                return (
                  <div key={r.id}
                    onClick={() => { setCurrentIdx(REACTIONS.indexOf(r)); setActiveTab("lab"); }}
                    className={`subject-tile cursor-pointer ${reaction.id === r.id ? "is-today" : ""}`}
                  >
                    <div className="date-chip">
                      <div className="d-day">{r.formula.split(" ")[0].slice(0, 4)}</div>
                      <div className="d-mon">CHEM</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold bn text-[var(--ten-ink)] truncate">
                        {lang === "bn" ? r.name : r.nameEn}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full border ${segColor}`}>{r.segment}</span>
                        <span className="text-[8px] text-[var(--gray-400)] font-mono truncate">{r.formula}</span>
                      </div>
                    </div>
                    {solved && <span className="text-[8px] font-bold text-[#15803D] bg-[#DCFCE7] border border-[#86EFAC] px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"><CheckCircle2 size={10} /> {lang === "bn" ? "সমাধান" : "Solved"}</span>}
                    {reaction.id === r.id && !solved && <span className="text-[8px] font-bold text-[#1D4ED8] bg-[#DBEAFE] border border-[#BFDBFE] px-2 py-0.5 rounded-full shrink-0 bn">{lang === "bn" ? "সক্রিয়" : "Active"}</span>}
                    <ChevronRight size={14} className="text-[var(--gray-300)] shrink-0" />
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-[var(--gray-400)]">
                  <Target size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm bn font-bold">{lang === "bn" ? "কোনো বিক্রিয়া পাওয়া যায়নি।" : "No reactions found."}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* HOME TAB                                                         */}
        {/* ================================================================ */}
        {activeTab === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 py-12 max-w-[520px] mx-auto flex flex-col items-center text-center gap-6"
          >
            <img src="https://cdn.10minuteschool.com/images/svg/Origin%20Labs%20Black.svg" alt="10MS Logo" className="h-16 w-auto object-contain" />
            <div>
              <h2 className="text-2xl font-bold bn text-[var(--ten-ink)] mb-2">স্বাগতম!</h2>
              <p className="text-sm text-[var(--gray-500)] bn leading-relaxed">ইন্টারেক্টিভ রসায়ন ল্যাবে রাসায়নিক বিক্রিয়া সমতাকরণ শিখুন।</p>
            </div>
            {/* Progress */}
            <div className="w-full max-w-[360px] bg-white border border-[var(--border)] rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between text-[10px] font-bold text-[var(--gray-500)] mb-2">
                <span className="bn">অগ্রগতি</span>
                <span>{solvedReactions.size} / {REACTIONS.length}</span>
              </div>
              <div className="h-2 bg-[var(--gray-100)] rounded-full overflow-hidden">
                <div className={`h-full bg-[var(--ten-red)] rounded-full transition-all progress-bar-fill [--progress:${(solvedReactions.size / REACTIONS.length) * 100}%]`} />
              </div>
              {solvedReactions.size === REACTIONS.length && (
                <p className="text-xs font-bold text-[#15803D] bn mt-2 text-center">🏆 সব বিক্রিয়া সমাধান হয়েছে!</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-[360px]">
              {[
                { label: "বিক্রিয়া",  value: REACTIONS.length,         color: "text-[var(--ten-red)]" },
                { label: "সমাধান",    value: solvedReactions.size,      color: "text-[#16A34A]" },
                { label: "মৌল",      value: Object.keys(ELEMENTS).length, color: "text-[#1D4ED8]" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[var(--border)] rounded-2xl p-4 text-center shadow-sm">
                  <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[8px] font-bold bn text-[var(--gray-400)] uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab("lab")} className="btn-red px-8 py-3 rounded-xl text-sm gap-2">
              <FlaskConical size={14} /> ল্যাবে যাও
            </button>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* PROFILE TAB                                                      */}
        {/* ================================================================ */}
        {activeTab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 py-10 max-w-[400px] mx-auto flex flex-col items-center gap-5 text-center"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[var(--ten-red)] shadow-lg">
              <img src="https://ui-avatars.com/api/?name=Student&background=E8001D&color=fff&size=80" alt="Profile" />
            </div>
            <div>
              <h2 className="text-lg font-bold bn text-[var(--ten-ink)]">শিক্ষার্থী</h2>
              <p className="text-xs text-[var(--gray-400)] mt-1">student@10minuteschool.com</p>
            </div>
            {solvedReactions.size > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-[#DCFCE7] border border-[#86EFAC] rounded-full">
                <Trophy size={14} className="text-[#15803D]" />
                <span className="text-xs font-bold text-[#15803D] bn">{solvedReactions.size}টি বিক্রিয়া সমাধান করেছ!</span>
              </div>
            )}
            <div className="w-full grid grid-cols-3 gap-3">
              {[
                { label: "বিক্রিয়া",  value: REACTIONS.length },
                { label: "সমাধান",    value: solvedReactions.size },
                { label: "স্তর",      value: solvedReactions.size >= 5 ? "২" : "১" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-[var(--border)] rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xl font-black text-[var(--ten-red)]">{s.value}</p>
                  <p className="text-[8px] font-bold bn text-[var(--gray-400)] uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <CompletionModal
            reaction={reaction}
            solvedCount={solvedReactions.size}
            totalCount={REACTIONS.length}
            onNext={() => { setShowCompletionModal(false); nextReaction(); }}
            onLibrary={() => { setShowCompletionModal(false); setActiveTab("library"); }}
            onClose={() => setShowCompletionModal(false)}
          />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} lang={lang} />
    </div>
  );
}
