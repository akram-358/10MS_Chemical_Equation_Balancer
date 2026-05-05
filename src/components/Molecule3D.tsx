import React from "react";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

export const AtomModel = ({
  color,
  size,
  position,
}: {
  color: string;
  size: number;
  position: [number, number, number];
}) => (
  <Sphere args={[size, 32, 32]} position={position}>
    <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
  </Sphere>
);

export const BondModel = ({
  start,
  end,
  visible = true,
  lengthScale = 1,
  type = "single",
}: {
  start: [number, number, number];
  end: [number, number, number];
  visible?: boolean;
  lengthScale?: number;
  type?: "single" | "double" | "triple";
}) => {
  if (!visible) return null;
  const startVec = new THREE.Vector3(...start);
  const endVec = new THREE.Vector3(...end);
  const direction = endVec.clone().sub(startVec);
  const length = direction.length() * lengthScale;
  const midPoint = startVec.clone().add(direction.clone().multiplyScalar(0.5));
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );

  // Helper to render bonds with specific offsets and thickness
  const renderBondLine = (offset: number, radius: number) => {
    // Determine local X axis to shift parallel lines
    const up =
      direction.lengthSq() > 0.1 && Math.abs(direction.y) < 0.99
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);
    const right = new THREE.Vector3().crossVectors(direction, up).normalize();
    const shiftedPos = midPoint.clone().add(right.multiplyScalar(offset));

    return (
      <mesh position={shiftedPos} quaternion={quaternion}>
        <cylinderGeometry args={[radius, radius, length, 12]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.4} metalness={0.1} />
      </mesh>
    );
  };

  if (type === "double") {
    return (
      <group>
        {renderBondLine(0.14, 0.05)}
        {renderBondLine(-0.14, 0.05)}
      </group>
    );
  } else if (type === "triple") {
    return (
      <group>
        {renderBondLine(0.2, 0.04)}
        {renderBondLine(0, 0.04)}
        {renderBondLine(-0.2, 0.04)}
      </group>
    );
  }

  // Single bond
  return renderBondLine(0, 0.09);
};

export const LonePair = ({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) => (
  <group position={position} rotation={rotation || [0, 0, 0]}>
    <Sphere args={[0.12, 16, 16]} position={[-0.08, 0.08, 0]}>
      <meshStandardMaterial
        color="#FDE68A"
        emissive="#F59E0B"
        emissiveIntensity={0.6}
        transparent
        opacity={0.7}
      />
    </Sphere>
    <Sphere args={[0.12, 16, 16]} position={[0.08, 0.08, 0]}>
      <meshStandardMaterial
        color="#FDE68A"
        emissive="#F59E0B"
        emissiveIntensity={0.6}
        transparent
        opacity={0.7}
      />
    </Sphere>
  </group>
);

export const H2Molecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[-0.35 * bondLength, 0, 0]}
    />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[0.35 * bondLength, 0, 0]}
    />
    <BondModel
      start={[-0.35 * bondLength, 0, 0]}
      end={[0.35 * bondLength, 0, 0]}
      visible={showBonds}
    />
  </group>
);

export const O2Molecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel
      color="#EF4444"
      size={0.5}
      position={[-0.45 * bondLength, 0, 0]}
    />
    <AtomModel
      color="#EF4444"
      size={0.5}
      position={[0.45 * bondLength, 0, 0]}
    />
    {/* Use new double bond type instead of two single bonds */}
    <BondModel
      start={[-0.45 * bondLength, 0, 0]}
      end={[0.45 * bondLength, 0, 0]}
      visible={showBonds}
      type="double"
    />
    <LonePair
      position={[-0.45 * bondLength, 0.45 * bondLength, 0]}
      rotation={[0, 0, 0]}
    />
    <LonePair
      position={[-0.45 * bondLength, -0.45 * bondLength, 0]}
      rotation={[0, 0, Math.PI]}
    />
    <LonePair
      position={[0.45 * bondLength, 0.45 * bondLength, 0]}
      rotation={[0, 0, 0]}
    />
    <LonePair
      position={[0.45 * bondLength, -0.45 * bondLength, 0]}
      rotation={[0, 0, Math.PI]}
    />
  </group>
);

export const H2OMolecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel color="#EF4444" size={0.5} position={[0, 0.2 * bondLength, 0]} />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[-0.45 * bondLength, -0.2 * bondLength, 0]}
    />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[0.45 * bondLength, -0.2 * bondLength, 0]}
    />
    <BondModel
      start={[0, 0.2 * bondLength, 0]}
      end={[-0.45 * bondLength, -0.2 * bondLength, 0]}
      visible={showBonds}
    />
    <BondModel
      start={[0, 0.2 * bondLength, 0]}
      end={[0.45 * bondLength, -0.2 * bondLength, 0]}
      visible={showBonds}
    />
    <LonePair position={[0, 0.6 * bondLength, 0.2]} />
    <LonePair position={[0, 0.6 * bondLength, -0.2]} />
  </group>
);

export const N2Molecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel
      color="#3B82F6"
      size={0.5}
      position={[-0.45 * bondLength, 0, 0]}
    />
    <AtomModel
      color="#3B82F6"
      size={0.5}
      position={[0.45 * bondLength, 0, 0]}
    />
    <BondModel
      start={[-0.45 * bondLength, 0, 0]}
      end={[0.45 * bondLength, 0, 0]}
      visible={showBonds}
      type="triple"
    />
    <LonePair
      position={[-0.8 * bondLength, 0, 0]}
      rotation={[0, 0, Math.PI / 2]}
    />
    <LonePair
      position={[0.8 * bondLength, 0, 0]}
      rotation={[0, 0, -Math.PI / 2]}
    />
  </group>
);

export const NH3Molecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel color="#3B82F6" size={0.5} position={[0, 0.2 * bondLength, 0]} />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[-0.5 * bondLength, -0.3 * bondLength, 0.3 * bondLength]}
    />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[0.5 * bondLength, -0.3 * bondLength, 0.3 * bondLength]}
    />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[0, -0.3 * bondLength, -0.5 * bondLength]}
    />
    <BondModel
      start={[0, 0.2 * bondLength, 0]}
      end={[-0.5 * bondLength, -0.3 * bondLength, 0.3 * bondLength]}
      visible={showBonds}
    />
    <BondModel
      start={[0, 0.2 * bondLength, 0]}
      end={[0.5 * bondLength, -0.3 * bondLength, 0.3 * bondLength]}
      visible={showBonds}
    />
    <BondModel
      start={[0, 0.2 * bondLength, 0]}
      end={[0, -0.3 * bondLength, -0.5 * bondLength]}
      visible={showBonds}
    />
    <LonePair position={[0, 0.6 * bondLength, 0]} />
  </group>
);

export const CH4Molecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel color="#1F2937" size={0.5} position={[0, 0, 0]} />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[0.6 * bondLength, 0.6 * bondLength, 0.6 * bondLength]}
    />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[-0.6 * bondLength, -0.6 * bondLength, 0.6 * bondLength]}
    />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[0.6 * bondLength, -0.6 * bondLength, -0.6 * bondLength]}
    />
    <AtomModel
      color="#FFFFFF"
      size={0.35}
      position={[-0.6 * bondLength, 0.6 * bondLength, -0.6 * bondLength]}
    />
    <BondModel
      start={[0, 0, 0]}
      end={[0.6 * bondLength, 0.6 * bondLength, 0.6 * bondLength]}
      visible={showBonds}
    />
    <BondModel
      start={[0, 0, 0]}
      end={[-0.6 * bondLength, -0.6 * bondLength, 0.6 * bondLength]}
      visible={showBonds}
    />
    <BondModel
      start={[0, 0, 0]}
      end={[0.6 * bondLength, -0.6 * bondLength, -0.6 * bondLength]}
      visible={showBonds}
    />
    <BondModel
      start={[0, 0, 0]}
      end={[-0.6 * bondLength, 0.6 * bondLength, -0.6 * bondLength]}
      visible={showBonds}
    />
  </group>
);

export const CO2Molecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel color="#1F2937" size={0.5} position={[0, 0, 0]} />
    <AtomModel
      color="#EF4444"
      size={0.5}
      position={[-0.8 * bondLength, 0, 0]}
    />
    <AtomModel color="#EF4444" size={0.5} position={[0.8 * bondLength, 0, 0]} />
    <BondModel
      start={[0, 0, 0]}
      end={[-0.8 * bondLength, 0, 0]}
      visible={showBonds}
      type="double"
    />
    <BondModel
      start={[0, 0, 0]}
      end={[0.8 * bondLength, 0, 0]}
      visible={showBonds}
      type="double"
    />
    <LonePair position={[-0.8 * bondLength, 0.45 * bondLength, 0]} />
    <LonePair
      position={[-0.8 * bondLength, -0.45 * bondLength, 0]}
      rotation={[0, 0, Math.PI]}
    />
    <LonePair position={[0.8 * bondLength, 0.45 * bondLength, 0]} />
    <LonePair
      position={[0.8 * bondLength, -0.45 * bondLength, 0]}
      rotation={[0, 0, Math.PI]}
    />
  </group>
);

export const Cl2Molecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel
      color="#4ADE80"
      size={0.5}
      position={[-0.45 * bondLength, 0, 0]}
    />
    <AtomModel
      color="#4ADE80"
      size={0.5}
      position={[0.45 * bondLength, 0, 0]}
    />
    <BondModel
      start={[-0.45 * bondLength, 0, 0]}
      end={[0.45 * bondLength, 0, 0]}
      visible={showBonds}
    />
    <LonePair position={[-0.45 * bondLength, 0.5 * bondLength, 0]} />
    <LonePair
      position={[-0.45 * bondLength, -0.5 * bondLength, 0]}
      rotation={[0, 0, Math.PI]}
    />
    <LonePair
      position={[-0.95 * bondLength, 0, 0]}
      rotation={[0, 0, Math.PI / 2]}
    />
    <LonePair position={[0.45 * bondLength, 0.5 * bondLength, 0]} />
    <LonePair
      position={[0.45 * bondLength, -0.5 * bondLength, 0]}
      rotation={[0, 0, Math.PI]}
    />
    <LonePair
      position={[0.95 * bondLength, 0, 0]}
      rotation={[0, 0, -Math.PI / 2]}
    />
  </group>
);

export const HClMolecule = ({
  position,
  showBonds = true,
  bondLength = 1,
}: {
  position: [number, number, number];
  showBonds?: boolean;
  bondLength?: number;
}) => (
  <group position={position}>
    <AtomModel
      color="#FFFFFF"
      size={0.3}
      position={[-0.35 * bondLength, 0, 0]}
    />
    <AtomModel
      color="#4ADE80"
      size={0.5}
      position={[0.35 * bondLength, 0, 0]}
    />
    <BondModel
      start={[-0.35 * bondLength, 0, 0]}
      end={[0.35 * bondLength, 0, 0]}
      visible={showBonds}
    />
    <LonePair position={[0.35 * bondLength, 0.5 * bondLength, 0]} />
    <LonePair
      position={[0.35 * bondLength, -0.5 * bondLength, 0]}
      rotation={[0, 0, Math.PI]}
    />
    <LonePair
      position={[0.85 * bondLength, 0, 0]}
      rotation={[0, 0, -Math.PI / 2]}
    />
  </group>
);

export const MolecularCluster = ({
  atoms,
  position,
}: {
  atoms: Record<string, number>;
  position: [number, number, number];
}) => {
  const elements = Object.entries(atoms);
  const models = [];
  let index = 0;

  const atomColors: Record<string, string> = {
    H: "#60A5FA",
    O: "#EF4444",
    N: "#3B82F6",
    C: "#1F2937",
    Cu: "#B45309",
    K: "#8B5CF6",
    Mn: "#EC4899",
    Cl: "#4ADE80",
    Na: "#A78BFA",
    S: "#FBBF24",
    Ag: "#D1D5DB",
  };

  for (const [atom, count] of elements) {
    for (let i = 0; i < count; i++) {
      // Using Fibonacci Sphere algorithm for more even distribution of many atoms
      const phi = Math.acos(1 - (2 * (index + 0.5)) / 20); // Normalized over a reasonable max atoms
      const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);

      const radius = 0.6 + Math.floor(index / 8) * 0.4; // Multi-layered shells

      const pos: [number, number, number] = [
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
      ];
      models.push(
        <AtomModel
          key={`${atom}-${i}`}
          color={atomColors[atom] || "#9CA3AF"}
          size={atom === "H" ? 0.3 : 0.45}
          position={pos}
        />,
      );
      index++;
    }
  }

  return <group position={position}>{models}</group>;
};
