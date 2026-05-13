import React from "react";
import { Sphere, Cylinder } from "@react-three/drei";
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
    <meshStandardMaterial 
      color={color} 
      roughness={0.3} 
      metalness={0.2} 
      envMapIntensity={0.5} 
    />
  </Sphere>
);

export const BondModel = ({
  start,
  end,
  visible = true,
  bondLength = 1,
  type = "single",
}: {
  start: [number, number, number];
  end: [number, number, number];
  visible?: boolean;
  bondLength?: number;
  type?: "single" | "double" | "triple";
}) => {
  if (!visible) return null;
  
  const startVec = new THREE.Vector3(...start).multiplyScalar(bondLength);
  const endVec = new THREE.Vector3(...end).multiplyScalar(bondLength);
  const direction = endVec.clone().sub(startVec);
  const length = direction.length();
  const midPoint = startVec.clone().add(direction.clone().multiplyScalar(0.5));
  
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  const renderBondLine = (offset: number, radius: number) => {
    const up = Math.abs(direction.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const right = new THREE.Vector3().crossVectors(direction, up).normalize();
    const shiftedPos = midPoint.clone().add(right.multiplyScalar(offset));

    return (
      <mesh position={shiftedPos as any} quaternion={quaternion}>
        <cylinderGeometry args={[radius, radius, length, 12]} />
        <meshStandardMaterial color="#E5E7EB" roughness={0.4} metalness={0.1} />
      </mesh>
    );
  };

  if (type === "double") {
    return (
      <group>
        {renderBondLine(0.12, 0.06)}
        {renderBondLine(-0.12, 0.06)}
      </group>
    );
  } else if (type === "triple") {
    return (
      <group>
        {renderBondLine(0.18, 0.05)}
        {renderBondLine(0, 0.05)}
        {renderBondLine(-0.18, 0.05)}
      </group>
    );
  }

  return renderBondLine(0, 0.1);
};

export const LonePair = ({
  position,
  rotation = [0, 0, 0],
  bondLength = 1
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  bondLength?: number;
}) => {
  const pos = new THREE.Vector3(...position).multiplyScalar(bondLength);
  return (
    <group position={pos as any} rotation={rotation as any}>
      {/* Visual cue for lone pair - two small glowing spheres */}
      <Sphere args={[0.08, 16, 16]} position={[-0.1, 0, 0]}>
        <meshStandardMaterial 
          color="#FDE68A" 
          emissive="#F59E0B" 
          emissiveIntensity={2} 
          transparent 
          opacity={0.8} 
        />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.1, 0, 0]}>
        <meshStandardMaterial 
          color="#FDE68A" 
          emissive="#F59E0B" 
          emissiveIntensity={2} 
          transparent 
          opacity={0.8} 
        />
      </Sphere>
    </group>
  );
};

export const MolecularCluster = ({
  atoms,
  position,
  bondLength = 1,
  showLonePairs = true
}: {
  atoms: Record<string, number>;
  position: [number, number, number];
  bondLength?: number;
  showLonePairs?: boolean;
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
    Ca: "#9CA3AF",
    Fe: "#B45309"
  };

  const atomSizes: Record<string, number> = {
    H: 0.3,
    O: 0.45,
    C: 0.5,
    N: 0.45,
    Cl: 0.5,
    default: 0.45
  };

  for (const [atom, count] of elements) {
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (index + 0.5)) / 20);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
      const radius = (0.7 + Math.floor(index / 8) * 0.4) * bondLength;

      const pos: [number, number, number] = [
        Math.cos(theta) * Math.sin(phi) * radius,
        Math.sin(theta) * Math.sin(phi) * radius,
        Math.cos(phi) * radius,
      ];
      
      models.push(
        <AtomModel
          key={`${atom}-${i}`}
          color={atomColors[atom] || atomColors.default}
          size={(atomSizes[atom] || atomSizes.default) * (bondLength > 1 ? 0.8 : 1)}
          position={pos}
        />
      );

      // Add visual cues for lone pairs for N and O
      if (showLonePairs && (atom === 'N' || atom === 'O')) {
         const lonePairPos: [number, number, number] = [
            pos[0] * 1.3,
            pos[1] * 1.3,
            pos[2] * 1.3
         ];
         models.push(
            <LonePair 
               key={`lp-${atom}-${i}`} 
               position={lonePairPos} 
               bondLength={1} 
            />
         );
      }
      
      index++;
    }
  }

  return <group position={position}>{models}</group>;
};
