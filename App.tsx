import React, { useState } from 'react';
import Scene from './components/Scene';
import UIOverlay from './components/UIOverlay';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  return (
    <div className="w-full h-screen bg-[#000502] relative overflow-hidden">
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Layer */}
      <UIOverlay treeState={treeState} setTreeState={setTreeState} />
    </div>
  );
};

export default App;
