export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE'
}

export interface DualPosition {
  scatter: [number, number, number];
  tree: [number, number, number];
}

export interface OrnamentProps {
  count: number;
  type: 'sphere' | 'box';
  color: string;
  scale: number;
  treeState: TreeState;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
}