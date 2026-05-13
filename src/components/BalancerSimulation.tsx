import React, { useMemo } from "react";
import type { ReactionDef } from "../MoleculeLibrary";

export interface ElementInfo {
  number: number; name: string; nameBn: string;
  mass: number; color: string; bg: string; category: string;
}

export interface BalancerSimulationProps {
  reaction: ReactionDef;
  coeffs: Record<string, number>;
  isBalanced: boolean;
  showBonds: boolean;
  elements: Record<string, ElementInfo>;
  onAtomHover: (info: { symbol: string; x: number; y: number } | null) => void;
  selectedElement?: string | null;
}

// ── Layout constants ─────────────────────────────────────────────────────────
const SVG_W = 600;
const SVG_H = 600;
const ATOM_R = 15;
const ATOM_GAP = 36;
const MOL_GAP_X = 160;       // horizontal gap between molecules on same row
const REACTANT_CY = 145;     // center y for reactants zone
const PRODUCT_CY = 455;      // center y for products zone
const ARROW_Y1 = 260;
const ARROW_Y2 = 340;
const CENTER_X = SVG_W / 2;

function elColor(symbol: string, elements: Record<string, ElementInfo>): string {
  return elements[symbol]?.color ?? "#6B7280";
}

function expandAtoms(atoms: Record<string, number>): string[] {
  return Object.entries(atoms).flatMap(([sym, n]) => Array(n).fill(sym));
}

function layoutAtomPositions(
  atoms: Record<string, number>,
  cx: number,
  cy: number,
): { symbol: string; x: number; y: number }[] {
  const list = expandAtoms(atoms);
  const total = list.length;
  if (total === 0) return [];

  const COLS = total <= 4 ? total : Math.ceil(total / 2);
  const ROWS = Math.ceil(total / COLS);
  const totalW = (COLS - 1) * ATOM_GAP;
  const totalH = (ROWS - 1) * ATOM_GAP;

  return list.map((symbol, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      symbol,
      x: cx - totalW / 2 + col * ATOM_GAP,
      y: cy - totalH / 2 + row * ATOM_GAP,
    };
  });
}

interface MolBlock {
  id: string;
  coeff: number;
  correctCoeff: number;
  atomPositions: { symbol: string; x: number; y: number }[];
  cx: number;
  cy: number;
}

// Vertical layout: molecules spread horizontally within their zone row
function buildBlocks(
  molecules: ReactionDef["reactants"],
  correctCoeffs: Record<string, number>,
  coeffs: Record<string, number>,
  cy: number,
): MolBlock[] {
  const n = molecules.length;
  return molecules.map((mol, i) => {
    const cx = CENTER_X + (i - (n - 1) / 2) * MOL_GAP_X;
    return {
      id: mol.id,
      coeff: coeffs[mol.id] ?? 1,
      correctCoeff: correctCoeffs[mol.id] ?? 1,
      atomPositions: layoutAtomPositions(mol.atoms, cx, cy),
      cx,
      cy,
    };
  });
}

// ── Main Component ────────────────────────────────────────────────────────────
export const BalancerSimulation: React.FC<BalancerSimulationProps> = ({
  reaction, coeffs, isBalanced, showBonds, elements, onAtomHover, selectedElement,
}) => {
  const reactantBlocks = useMemo(
    () => buildBlocks(reaction.reactants, reaction.correctCoeffs, coeffs, REACTANT_CY),
    [reaction, coeffs]
  );
  const productBlocks = useMemo(
    () => buildBlocks(reaction.products, reaction.correctCoeffs, coeffs, PRODUCT_CY),
    [reaction, coeffs]
  );

  const renderBlock = (block: MolBlock, role: "reactant" | "product") => {
    const isCoeffCorrect = block.coeff === block.correctCoeff;
    const coeffColor = isCoeffCorrect ? "#16A34A" : "#DC2626";
    const coeffBg   = isCoeffCorrect ? "#DCFCE7" : "#FEE2E2";
    const atoms = block.atomPositions;

    if (atoms.length === 0) return null;

    const xs = atoms.map((a) => a.x);
    const ys = atoms.map((a) => a.y);
    const minX = Math.min(...xs) - ATOM_R - 10;
    const maxX = Math.max(...xs) + ATOM_R + 10;
    const minY = Math.min(...ys) - ATOM_R - 10;
    const maxY = Math.max(...ys) + ATOM_R + 10;
    const bgW = maxX - minX;
    const bgH = maxY - minY;

    return (
      <g key={block.id}>
        {/* Molecule background bubble */}
        <rect
          x={minX} y={minY} width={bgW} height={bgH}
          rx="14" ry="14"
          fill={role === "reactant" ? "#EFF6FF" : "#F0FDF4"}
          stroke={role === "reactant" ? "#BFDBFE" : "#BBF7D0"}
          strokeWidth="1.5"
        />

        {/* Bonds — visible lines between adjacent atoms */}
        {showBonds && atoms.length > 1 && atoms.slice(0, -1).map((a, i) => {
          const b = atoms[i + 1];
          const colorA = elColor(a.symbol, elements);
          const colorB = elColor(b.symbol, elements);
          const gradId = `bond-${block.id}-${i}`;
          return (
            <g key={`bond-${i}`}>
              <defs>
                <linearGradient id={gradId} x1={a.x} y1={a.y} x2={b.x} y2={b.y} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={colorA} stopOpacity="0.7" />
                  <stop offset="100%" stopColor={colorB} stopOpacity="0.7" />
                </linearGradient>
              </defs>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={`url(#${gradId})`}
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Atom circles */}
        {atoms.map((a, i) => {
          const color = elColor(a.symbol, elements);
          const isHighlighted = selectedElement === a.symbol;
          return (
            <g key={`${a.symbol}-${i}`}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => onAtomHover({ symbol: a.symbol, x: e.clientX, y: e.clientY })}
              onMouseLeave={() => onAtomHover(null)}
            >
              {/* Highlight ring when element is selected */}
              {isHighlighted && (
                <circle
                  cx={a.x} cy={a.y} r={ATOM_R + 8}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  className="atom-highlight"
                />
              )}
              <circle cx={a.x} cy={a.y} r={ATOM_R}
                fill={color}
                stroke={isHighlighted ? "white" : "white"}
                strokeWidth={isHighlighted ? 3 : 2}
                style={{ filter: isHighlighted
                  ? `drop-shadow(0 0 8px ${color})`
                  : "drop-shadow(0 1px 3px rgba(0,0,0,0.25))"
                }}
              />
              <text
                x={a.x} y={a.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize="10" fontWeight="800"
                fontFamily="Inter, system-ui, sans-serif"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {a.symbol.length > 2 ? a.symbol.slice(0, 2) : a.symbol}
              </text>
            </g>
          );
        })}

        {/* Coefficient badge */}
        <rect
          x={block.cx - 18} y={minY - 28} width={36} height={22}
          rx="7" ry="7" fill={coeffBg} stroke={coeffColor} strokeWidth="1.5"
        />
        <text
          x={block.cx} y={minY - 12}
          textAnchor="middle" dominantBaseline="middle"
          fill={coeffColor} fontSize="12" fontWeight="800"
          fontFamily="Inter, system-ui, sans-serif"
          style={{ userSelect: "none" }}
        >
          {block.coeff}
        </text>

        {/* Molecule formula label */}
        <text
          x={block.cx} y={maxY + 20}
          textAnchor="middle" dominantBaseline="middle"
          fill="#374151" fontSize="11" fontWeight="700"
          fontFamily="monospace"
          style={{ userSelect: "none" }}
        >
          {block.id}
        </text>
      </g>
    );
  };

  // Plus signs between molecules on each side (horizontal)
  const renderPlusSigns = (blocks: MolBlock[]) =>
    blocks.slice(0, -1).map((b, i) => {
      const nextB = blocks[i + 1];
      const px = (b.cx + nextB.cx) / 2;
      return (
        <text key={`plus-${i}`}
          x={px} y={b.cy}
          textAnchor="middle" dominantBaseline="middle"
          fill="#9CA3AF" fontSize="22" fontWeight="700"
          fontFamily="Inter, system-ui, sans-serif"
          style={{ userSelect: "none" }}
        >
          +
        </text>
      );
    });

  // Zone labels
  const reactantLabel = (
    <text x={CENTER_X} y={16}
      textAnchor="middle" dominantBaseline="middle"
      fill="#1D4ED8" fontSize="9" fontWeight="700" letterSpacing="0.12em"
      fontFamily="Inter, system-ui, sans-serif"
      style={{ userSelect: "none" }}
    >
      REACTANTS · বিক্রিয়ক
    </text>
  );
  const productLabel = (
    <text x={CENTER_X} y={SVG_H - 12}
      textAnchor="middle" dominantBaseline="middle"
      fill="#166534" fontSize="9" fontWeight="700" letterSpacing="0.12em"
      fontFamily="Inter, system-ui, sans-serif"
      style={{ userSelect: "none" }}
    >
      PRODUCTS · উৎপাদ
    </text>
  );

  // Horizontal divider
  const divider = (
    <line x1={20} y1={SVG_H / 2} x2={SVG_W - 20} y2={SVG_H / 2}
      stroke="#E5E7EB" strokeWidth="1" strokeDasharray="5 5"
    />
  );

  // Vertical arrow (center)
  const arrowId = "sim-arrowhead";
  const arrowPath = `M ${CENTER_X} ${ARROW_Y1} L ${CENTER_X} ${ARROW_Y2 - 14}`;
  const arrowColor = isBalanced ? "#16A34A" : "#E8001D";
  const arrow = (
    <g>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8"
          refX="4" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={arrowColor} />
        </marker>
      </defs>
      <path d={arrowPath}
        stroke={arrowColor}
        strokeWidth="3"
        fill="none"
        markerEnd={`url(#${arrowId})`}
        className={isBalanced ? "balanced-arrow" : ""}
      />
      {/* Arrow label */}
      <text x={CENTER_X + 14} y={(ARROW_Y1 + ARROW_Y2) / 2}
        textAnchor="start" dominantBaseline="middle"
        fill={isBalanced ? "#16A34A" : "#9CA3AF"} fontSize="8" fontWeight="700"
        letterSpacing="0.1em" fontFamily="Inter, system-ui, sans-serif"
        style={{ userSelect: "none" }}
      >
        {isBalanced ? "✓ সমতা · Balanced" : "বিক্রিয়া · Reaction"}
      </text>
    </g>
  );

  // Balanced glow overlay
  const balancedGlow = isBalanced && (
    <rect x={0} y={0} width={SVG_W} height={SVG_H} rx="14"
      fill="none" stroke="#16A34A" strokeWidth="3"
      style={{ animation: "balanced-border-pulse 1.8s ease-in-out infinite" }}
    />
  );

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        height="auto"
        className="overflow-visible"
        style={{ borderRadius: "14px" }}
      >
        {/* Background */}
        <rect x={0} y={0} width={SVG_W} height={SVG_H} rx="14"
          fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1"
        />

        {/* Zone backgrounds */}
        <rect x={2} y={2} width={SVG_W - 4} height={SVG_H / 2 - 4} rx="12"
          fill="#EFF6FF" opacity={0.4}
        />
        <rect x={2} y={SVG_H / 2 + 2} width={SVG_W - 4} height={SVG_H / 2 - 4} rx="12"
          fill="#F0FDF4" opacity={0.4}
        />

        {divider}
        {reactantLabel}
        {productLabel}

        {reactantBlocks.map((b) => renderBlock(b, "reactant"))}
        {productBlocks.map((b) => renderBlock(b, "product"))}
        {renderPlusSigns(reactantBlocks)}
        {renderPlusSigns(productBlocks)}
        {arrow}
        {balancedGlow}
      </svg>
    </div>
  );
};

export default BalancerSimulation;
