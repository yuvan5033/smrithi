export type Side = "left" | "right";
export type FitMode = "cover" | "contain";

export type Asset = {
  id: string;
  src: string;
  name: string;
  aspect: number;
  width: number;
  height: number;
  ts: number;
  isImpact?: boolean;
  step?: string;
};

export type EditorText = {
  id: string;
  content: string;
  x: number;
  y: number;
  className?: string;
  zIndex?: number;
  color?: string;
  bgColor?: string;
  fontFamily?: string;
  fontWeight?: string | number;
  fontSize?: number;
  rotation?: number;
};

export type EditorSlot = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  assetId?: string | null;
  fitMode?: FitMode;
  objectPosition?: string;
  borderRadius?: number;
  imageZoom?: number;
  imageX?: number;
  imageY?: number;
  zIndex?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
};

export type EditorPage = {
  texts: EditorText[];
  slots: EditorSlot[];
};

export type EditorSpread = {
  id: string;
  phase: string;
  category: string;
  purpose: string;
  left: EditorPage;
  right: EditorPage;
  bgColor?: string;
};