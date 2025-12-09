import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { FOLIAGE_COUNT, TREE_HEIGHT, TREE_RADIUS, SCATTER_RADIUS, COLORS, TRANSITION_SPEED } from '../constants';

// --- Shader Definitions ---

const vertexShader = `
  uniform float uTime;
  uniform float uProgress;
  
  attribute vec3 aTreePos;
  attribute vec3 aScatterPos;
  attribute float aRandom;
  
  varying float vAlpha;
  varying vec3 vColor;

  // Cubic Ease In Out for smoother transition
  float easeInOutCubic(float x) {
    return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = easeInOutCubic(uProgress);
    
    // Mix positions
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // Add "Life" breathing effect
    // Noise based on time and random attribute
    float breathing = sin(uTime * 2.0 + aRandom * 10.0) * 0.1;
    
    // Wind effect logic: stronger when scattered, structured when tree
    float windStrength = mix(0.5, 0.05, t); 
    pos.x += sin(uTime * 0.5 + pos.y) * windStrength;
    pos.z += cos(uTime * 0.3 + pos.x) * windStrength;

    // Expand slightly based on breathing
    pos += normalize(pos) * breathing;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    float sizeBase = mix(8.0, 12.0, aRandom); // Bigger particles
    gl_PointSize = sizeBase * (30.0 / -mvPosition.z);
    
    // Fade alpha based on edge
    vAlpha = 0.8 + 0.2 * sin(uTime + aRandom * 10.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColorA; // Deep Emerald
  uniform vec3 uColorB; // Gold Highlight
  
  varying float vAlpha;
  
  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft edge glow
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);
    
    // Mix colors - mostly green, spark of gold in center
    vec3 finalColor = mix(uColorA, uColorB, glow * 0.3);
    
    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  treeState: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ treeState }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Target progress (0 = SCATTERED, 1 = TREE)
  const targetProgress = treeState === TreeState.TREE_SHAPE ? 1.0 : 0.0;
  
  // Uniforms ref for performance
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uColorA: { value: new THREE.Color(COLORS.emerald) },
    uColorB: { value: new THREE.Color(COLORS.gold) },
  }), []);

  // Generate Geometry Data
  const { positions, treePositions, scatterPositions, randoms } = useMemo(() => {
    const treePos = new Float32Array(FOLIAGE_COUNT * 3);
    const scatterPos = new Float32Array(FOLIAGE_COUNT * 3);
    const rands = new Float32Array(FOLIAGE_COUNT);
    const initialPos = new Float32Array(FOLIAGE_COUNT * 3); // Just for bounding box init

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      const i3 = i * 3;
      const r = Math.random();
      
      // --- Tree Shape (Cone) ---
      // Normalized height 0 to 1
      const hNorm = Math.random(); 
      // Height from bottom to top
      const y = (hNorm - 0.5) * TREE_HEIGHT; 
      // Radius at this height (wider at bottom, narrow at top)
      const radiusAtH = (1.0 - hNorm) * TREE_RADIUS;
      // Random angle
      const theta = Math.random() * Math.PI * 2;
      // Random radius offset to fill the volume, not just shell
      const rOffset = Math.sqrt(Math.random()) * radiusAtH;
      
      treePos[i3] = Math.cos(theta) * rOffset;
      treePos[i3 + 1] = y;
      treePos[i3 + 2] = Math.sin(theta) * rOffset;

      // --- Scatter Shape (Sphere/Cloud) ---
      const u = Math.random();
      const v = Math.random();
      const phi = Math.acos(2 * v - 1);
      const thetaSphere = 2 * Math.PI * u;
      const rad = Math.cbrt(Math.random()) * SCATTER_RADIUS; // Uniform sphere distribution

      scatterPos[i3] = rad * Math.sin(phi) * Math.cos(thetaSphere);
      scatterPos[i3 + 1] = rad * Math.sin(phi) * Math.sin(thetaSphere);
      scatterPos[i3 + 2] = rad * Math.cos(phi);

      // Random attributes
      rands[i] = r;
      
      // Init visible buffer (can be 0, vertex shader handles mix)
      initialPos[i3] = 0; 
      initialPos[i3+1] = 0; 
      initialPos[i3+2] = 0;
    }

    return { 
      positions: initialPos, 
      treePositions: treePos, 
      scatterPositions: scatterPos, 
      randoms: rands 
    };
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Update Time
      uniforms.uTime.value = state.clock.elapsedTime;
      
      // Smooth Transition Logic
      const current = uniforms.uProgress.value;
      // Simple lerp: current + (target - current) * speed * delta
      const step = (targetProgress - current) * TRANSITION_SPEED * delta;
      
      // Avoid overshooting due to floating point
      if (Math.abs(targetProgress - current) < 0.001) {
        uniforms.uProgress.value = targetProgress;
      } else {
        uniforms.uProgress.value += step;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={FOLIAGE_COUNT}
          array={positions} // Initial dummy positions, shader uses attributes below
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={FOLIAGE_COUNT}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={FOLIAGE_COUNT}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={FOLIAGE_COUNT}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;
