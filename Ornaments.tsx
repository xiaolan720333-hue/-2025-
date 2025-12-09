import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentProps, TreeState } from '../types';
import { TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS, TRANSITION_SPEED } from '../constants';

const tempObject = new THREE.Object3D();
const tempVec3 = new THREE.Vector3();

const Ornaments: React.FC<OrnamentProps> = ({ 
  count, 
  type, 
  color, 
  scale, 
  treeState,
  emissive = '#000000',
  emissiveIntensity = 0,
  roughness = 0.2,
  metalness = 1.0
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Store target state locally to interpolate
  const progress = useRef(0); 

  // Generate Data
  const data = useMemo(() => {
    const treeData = new Float32Array(count * 3);
    const scatterData = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // --- Tree Position (Surface only) ---
      const hNorm = Math.random();
      const y = (hNorm - 0.5) * TREE_HEIGHT;
      // Slightly different radius logic than foliage to sit "on top"
      // If 'box' (gift), put at bottom mostly. If 'sphere' (bauble), all over.
      
      let radiusAtH = (1.0 - hNorm) * TREE_RADIUS;
      let effectiveRadius = radiusAtH;

      if (type === 'box') {
         // Gifts cluster at the bottom
         const giftY = -TREE_HEIGHT/2 + Math.random() * 2; // Bottom 2 units
         treeData[i3 + 1] = giftY;
         // Gifts spread out a bit more around the base
         effectiveRadius = (1.0 - (giftY / TREE_HEIGHT + 0.5)) * TREE_RADIUS * (0.8 + Math.random() * 0.5); 
      } else {
         treeData[i3 + 1] = y;
         // Ornaments sit slightly outside foliage
         effectiveRadius = radiusAtH + 0.2; 
      }

      const theta = Math.random() * Math.PI * 2;
      treeData[i3] = Math.cos(theta) * effectiveRadius;
      if (type !== 'box') {
        treeData[i3 + 2] = Math.sin(theta) * effectiveRadius;
      } else {
         treeData[i3 + 2] = Math.sin(theta) * effectiveRadius;
      }


      // --- Scatter Position ---
      const rScatter = SCATTER_RADIUS * 1.5; // Scatter wider
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * v - 1);
      const th = 2 * Math.PI * u;
      
      scatterData[i3] = rScatter * Math.sin(phi) * Math.cos(th);
      scatterData[i3 + 1] = rScatter * Math.sin(phi) * Math.sin(th);
      scatterData[i3 + 2] = rScatter * Math.cos(phi);

      // Random Rotation
      rotations[i3] = Math.random() * Math.PI;
      rotations[i3 + 1] = Math.random() * Math.PI;
      rotations[i3 + 2] = Math.random() * Math.PI;

      // Random Scale variance
      scales[i] = scale * (0.8 + Math.random() * 0.4);
    }

    return { treeData, scatterData, rotations, scales };
  }, [count, scale, type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const target = treeState === TreeState.TREE_SHAPE ? 1 : 0;
    
    // Interpolate progress
    const diff = target - progress.current;
    if (Math.abs(diff) > 0.001) {
        progress.current += diff * TRANSITION_SPEED * delta;
    } else {
        progress.current = target;
    }

    const t = progress.current;
    
    // Ease function
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Update Instances
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Lerp Position
      const sx = data.scatterData[i3];
      const sy = data.scatterData[i3+1];
      const sz = data.scatterData[i3+2];
      
      const tx = data.treeData[i3];
      const ty = data.treeData[i3+1];
      const tz = data.treeData[i3+2];

      tempObject.position.set(
        THREE.MathUtils.lerp(sx, tx, ease),
        THREE.MathUtils.lerp(sy, ty, ease),
        THREE.MathUtils.lerp(sz, tz, ease)
      );

      // Floating animation when scattered
      if (t < 0.9) {
          tempObject.position.y += Math.sin(state.clock.elapsedTime + i) * (1 - t) * 0.5;
      }

      // Rotation
      tempObject.rotation.set(
        data.rotations[i3] + state.clock.elapsedTime * 0.1 * (1 - t), // Spin more when scattered
        data.rotations[i3+1] + state.clock.elapsedTime * 0.1,
        data.rotations[i3+2]
      );

      // Scale (Grows slightly when forming tree)
      const s = data.scales[i] * (0.5 + 0.5 * ease);
      tempObject.scale.set(s, s, s);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      {type === 'sphere' ? (
        <sphereGeometry args={[1, 32, 32]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial 
        color={color} 
        roughness={roughness} 
        metalness={metalness}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />
    </instancedMesh>
  );
};

export default Ornaments;
