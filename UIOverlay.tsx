import React from 'react';
import { TreeState } from '../types';

interface UIOverlayProps {
  treeState: TreeState;
  setTreeState: (state: TreeState) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ treeState, setTreeState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-12 z-10">
      
      {/* Header */}
      <div className="text-center space-y-2 animate-fade-in-down">
        <h1 className="text-4xl md:text-6xl font-serif text-[#e6c98c] tracking-[0.2em] uppercase" style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}>
          Arix
        </h1>
        <p className="text-[#8fbc8f] text-xs md:text-sm tracking-[0.4em] uppercase font-light">
          Signature Collection
        </p>
      </div>

      {/* Controls */}
      <div className="pointer-events-auto flex gap-6 bg-black/20 backdrop-blur-md p-4 rounded-full border border-white/10 shadow-2xl transition-all hover:bg-black/30">
        <button
          onClick={() => setTreeState(TreeState.SCATTERED)}
          className={`
            px-6 py-2 rounded-full text-sm tracking-widest transition-all duration-500 font-serif
            ${treeState === TreeState.SCATTERED 
              ? 'bg-[#e6c98c] text-black shadow-[0_0_15px_rgba(230,201,140,0.6)]' 
              : 'text-[#e6c98c] hover:bg-white/10'}
          `}
        >
          CHAOS
        </button>
        <button
          onClick={() => setTreeState(TreeState.TREE_SHAPE)}
          className={`
            px-6 py-2 rounded-full text-sm tracking-widest transition-all duration-500 font-serif
            ${treeState === TreeState.TREE_SHAPE 
              ? 'bg-[#006b45] text-white shadow-[0_0_15px_rgba(0,107,69,0.8)]' 
              : 'text-[#8fbc8f] hover:bg-white/10'}
          `}
        >
          FORM
        </button>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-white/30 text-[10px] tracking-widest font-mono">
          INTERACTIVE 3D EXPERIENCE
        </p>
      </div>
    </div>
  );
};

export default UIOverlay;
