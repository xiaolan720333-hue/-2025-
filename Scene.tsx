import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeState } from '../types';
import { COLORS, FOLIAGE_COUNT, BAUBLE_COUNT, GIFT_COUNT, LIGHTS_COUNT } from '../constants';
import Foliage from './Foliage';
import Ornaments from './Ornaments';

interface SceneProps {
  treeState: TreeState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: 3 }} // ACESFilmic
      shadows
      camera={{ position: [0, 0, 35], fov: 35 }}
    >
      <color attach="background" args={[COLORS.bg]} />
      
      <Suspense fallback={null}>
        {/* --- Lighting --- */}
        <ambientLight intensity={0.2} color="#001100" />
        
        {/* Main Key Light - Warm Gold */}
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.5} 
          penumbra={1} 
          intensity={1500} 
          color={COLORS.goldHot} 
          castShadow 
        />
        
        {/* Rim Light - Cool Emerald */}
        <pointLight position={[-10, 5, -10]} intensity={500} color={COLORS.emeraldLight} />
        
        {/* Internal Tree Glow */}
        <pointLight position={[0, -2, 0]} intensity={200} color="#ffaa00" distance={10} />

        {/* --- Environment Reflection --- */}
        <Environment preset="city" environmentIntensity={0.5} />

        {/* --- Content --- */}
        <group position={[0, -2, 0]}>
            {/* The Pine Needles */}
            <Foliage treeState={treeState} />

            {/* Gold Baubles */}
            <Ornaments 
                count={BAUBLE_COUNT} 
                type="sphere" 
                color={COLORS.gold} 
                scale={0.4} 
                treeState={treeState}
                roughness={0.1}
                metalness={1.0}
            />

            {/* Red Velvet Ornaments */}
            <Ornaments 
                count={BAUBLE_COUNT / 2} 
                type="sphere" 
                color={COLORS.redVelvet} 
                scale={0.5} 
                treeState={treeState}
                roughness={0.6}
                metalness={0.2}
            />

            {/* Luxury Gifts Base */}
            <Ornaments 
                count={GIFT_COUNT} 
                type="box" 
                color={COLORS.goldHot} 
                scale={0.8} 
                treeState={treeState} 
                roughness={0.2}
                metalness={0.9}
            />
            
            {/* Fairy Lights (Tiny Glowing Spheres) */}
            <Ornaments 
                count={LIGHTS_COUNT}
                type="sphere"
                color="#ffffff"
                scale={0.08}
                treeState={treeState}
                emissive="#ffddaa"
                emissiveIntensity={2.0}
            />
        </group>

        {/* --- Post Processing for Cinematic Feel --- */}
        <EffectComposer disableNormalPass>
            {/* Luxury Glow */}
            <Bloom 
                luminanceThreshold={0.8} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.6} 
            />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>

        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 2 - 0.5} 
            maxPolarAngle={Math.PI / 2 + 0.2}
            minDistance={10}
            maxDistance={50}
            autoRotate={treeState === TreeState.TREE_SHAPE}
            autoRotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  );
};

export default Scene;
