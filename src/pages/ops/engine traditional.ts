import { Asset, Spread, SpreadKind, RecipeSlot, SpreadPlan, ImageKind } from './types';

export const PAGE_MIN = 1;
export const PAGE_MAX = 6;

// Allow up to 30% cropping before severely penalizing the image fit
export const MAX_CROP = 0.30; 

export const PAGE_H_UNITS = 141.4;
export const vy = (units: number) => Number(((units / PAGE_H_UNITS) * 100).toFixed(2));
export const GLOBAL_GUTTER = 4;

export const createEmptySpread = (leftCount = 3, rightCount = 3): Spread => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11),
  leftIds: [],
  rightIds: [],
  leftCount,
  rightCount,
});

export async function readAsset(file: File): Promise<Asset> {
  const src = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2, 11);
      resolve({
        id, src, name: file.name,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        aspect: (img.naturalWidth || img.width) / (img.naturalHeight || img.height),
        ts: file.lastModified || Date.now(),
        isImpact: false,
      });
    };
    img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
    img.src = src;
  });
}

export function selectSpreadPlan(images: Asset[], leftSlotCount: number, rightSlotCount: number): SpreadPlan {
  const kind = selectSpreadKind(images);
  const leftSlots = mirrorPageSlots(buildPageSlots(kind, leftSlotCount));
  const rightSlots = buildPageSlots(kind, rightSlotCount);
  return { kind, leftSlots, rightSlots };
}

export function selectSpreadKind(images: Asset[]): SpreadKind {
  if (!images.length) return "mixed";
  if (images.some(img => img.isImpact)) return "impact";

  const landscape = images.filter((img) => img.aspect >= 1.15).length;
  const portrait = images.filter((img) => img.aspect <= 0.9).length;

  // INCREASED THRESHOLD:
  // It now takes a net difference of 3 images to break the mixed layout. 
  // This allows you to drop 1 or 2 portrait images into the spread without 
  // destroying the dynamic grid.
  if (landscape >= portrait + 3) return "landscape";
  if (portrait >= landscape + 3) return "portrait";

  return "mixed"; 
}

export function buildPageSlots(kind: SpreadKind, count: number): RecipeSlot[] {
  if (kind === "impact") {
    return [{ id: "impact_hero", x: 0, y: 0, w: 100, h: 100, ratio: 100 / 141.4, kind: "hero_portrait", priority: 100 }];
  }

  switch (count) {
    case 1: return [{ id: "a", x: 4, y: vy(4), w: 92, h: vy(133.4), ratio: 92 / 133.4, kind: "hero_portrait", priority: 100 }];
    case 2:
      if (kind === "portrait") return [
        { id: "a", x: 4, y: vy(4), w: 44, h: vy(133.4), ratio: 44 / 133.4, kind: "hero_portrait", priority: 100 },
        { id: "b", x: 52, y: vy(4), w: 44, h: vy(133.4), ratio: 44 / 133.4, kind: "hero_portrait", priority: 80 }
      ];
      return [
        { id: "a", x: 4, y: vy(4), w: 92, h: vy(64.7), ratio: 92 / 64.7, kind: "hero_landscape", priority: 100 },
        { id: "b", x: 4, y: vy(72.7), w: 92, h: vy(64.7), ratio: 92 / 64.7, kind: "hero_landscape", priority: 80 }
      ];
    case 3:
      if (kind === "portrait") return [
        { id: "a", x: 4, y: vy(4), w: 44, h: vy(133.4), ratio: 44 / 133.4, kind: "hero_portrait", priority: 100 },
        { id: "b", x: 52, y: vy(4), w: 44, h: vy(64.7), ratio: 44 / 64.7, kind: "square", priority: 80 },
        { id: "c", x: 52, y: vy(72.7), w: 44, h: vy(64.7), ratio: 44 / 64.7, kind: "square", priority: 80 }
      ];
      return [
        { id: "a", x: 4, y: vy(4), w: 92, h: vy(64.7), ratio: 92 / 64.7, kind: "hero_landscape", priority: 100 },
        { id: "b", x: 4, y: vy(72.7), w: 44, h: vy(64.7), ratio: 44 / 64.7, kind: "portrait", priority: 80 },
        { id: "c", x: 52, y: vy(72.7), w: 44, h: vy(64.7), ratio: 44 / 64.7, kind: "portrait", priority: 80 }
      ];
    case 4:
      if (kind === "landscape") return [
        { id: "a", x: 4, y: vy(4), w: 92, h: vy(41.8), ratio: 92 / 41.8, kind: "hero_landscape", priority: 100 },
        { id: "b", x: 4, y: vy(49.8), w: 92, h: vy(41.8), ratio: 92 / 41.8, kind: "wide", priority: 80 },
        { id: "c", x: 4, y: vy(95.6), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 },
        { id: "d", x: 52, y: vy(95.6), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 }
      ];
      if (kind === "portrait") return [
        { id: "a", x: 4, y: vy(4), w: 44, h: vy(133.4), ratio: 44 / 133.4, kind: "hero_portrait", priority: 100 },
        { id: "b", x: 52, y: vy(4), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "square", priority: 80 },
        { id: "c", x: 52, y: vy(49.8), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "square", priority: 60 },
        { id: "d", x: 52, y: vy(95.6), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "square", priority: 60 }
      ];
      return [
        { id: "a", x: 4, y: vy(4), w: 92, h: vy(64.7), ratio: 92 / 64.7, kind: "hero_landscape", priority: 100 },
        { id: "b", x: 4, y: vy(72.7), w: 44, h: vy(64.7), ratio: 44 / 64.7, kind: "portrait", priority: 80 },
        { id: "c", x: 52, y: vy(72.7), w: 44, h: vy(30.35), ratio: 44 / 30.35, kind: "wide", priority: 60 },
        { id: "d", x: 52, y: vy(107.05), w: 44, h: vy(30.35), ratio: 44 / 30.35, kind: "wide", priority: 60 }
      ];
    case 5:
      if (kind === "landscape") return [
        { id: "a", x: 4, y: vy(4), w: 92, h: vy(41.8), ratio: 92 / 41.8, kind: "hero_landscape", priority: 100 },
        { id: "b", x: 4, y: vy(49.8), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 80 },
        { id: "c", x: 52, y: vy(49.8), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 80 },
        { id: "d", x: 4, y: vy(95.6), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 },
        { id: "e", x: 52, y: vy(95.6), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 }
      ];
      if (kind === "portrait") return [
        { id: "a", x: 4, y: vy(4), w: 44, h: vy(64.7), ratio: 44 / 64.7, kind: "hero_portrait", priority: 100 },
        { id: "b", x: 52, y: vy(4), w: 44, h: vy(64.7), ratio: 44 / 64.7, kind: "hero_portrait", priority: 100 },
        { id: "c", x: 4, y: vy(72.7), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 60 },
        { id: "d", x: 36, y: vy(72.7), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 60 },
        { id: "e", x: 68, y: vy(72.7), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 60 }
      ];
      return [
        { id: "a", x: 4, y: vy(4), w: 60, h: vy(85.4), ratio: 60 / 85.4, kind: "hero_portrait", priority: 100 },
        { id: "b", x: 68, y: vy(4), w: 28, h: vy(40.7), ratio: 28 / 40.7, kind: "square", priority: 60 },
        { id: "c", x: 68, y: vy(48.7), w: 28, h: vy(40.7), ratio: 28 / 40.7, kind: "square", priority: 60 },
        { id: "d", x: 4, y: vy(93.4), w: 44, h: vy(44), ratio: 44 / 44, kind: "wide", priority: 80 },
        { id: "e", x: 52, y: vy(93.4), w: 44, h: vy(44), ratio: 44 / 44, kind: "wide", priority: 80 }
      ];
    default: // 6 Slots
      if (kind === "landscape") return [
        { id: "a", x: 4, y: vy(4), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 80 },
        { id: "b", x: 52, y: vy(4), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 80 },
        { id: "c", x: 4, y: vy(49.8), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 },
        { id: "d", x: 52, y: vy(49.8), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 },
        { id: "e", x: 4, y: vy(95.6), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 },
        { id: "f", x: 52, y: vy(95.6), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 60 }
      ];
      if (kind === "portrait") return [
        { id: "a", x: 4, y: vy(4), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 80 },
        { id: "b", x: 36, y: vy(4), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 80 },
        { id: "c", x: 68, y: vy(4), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 80 },
        { id: "d", x: 4, y: vy(72.7), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 60 },
        { id: "e", x: 36, y: vy(72.7), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 60 },
        { id: "f", x: 68, y: vy(72.7), w: 28, h: vy(64.7), ratio: 28 / 64.7, kind: "portrait", priority: 60 }
      ];
      return [
        { id: "a", x: 4, y: vy(4), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 80 },
        { id: "b", x: 52, y: vy(4), w: 44, h: vy(41.8), ratio: 44 / 41.8, kind: "wide", priority: 80 },
        { id: "c", x: 4, y: vy(49.8), w: 28, h: vy(41.8), ratio: 28 / 41.8, kind: "portrait", priority: 60 },
        { id: "d", x: 36, y: vy(49.8), w: 28, h: vy(41.8), ratio: 28 / 41.8, kind: "portrait", priority: 60 },
        { id: "e", x: 68, y: vy(49.8), w: 28, h: vy(41.8), ratio: 28 / 41.8, kind: "portrait", priority: 60 },
        { id: "f", x: 4, y: vy(95.6), w: 92, h: vy(41.8), ratio: 92 / 41.8, kind: "hero_landscape", priority: 100 }
      ];
  }
}

export function mirrorPageSlots(slots: RecipeSlot[]) {
  return slots.map((slot) => ({ ...slot, id: `r-${slot.id}`, x: 100 - slot.x - slot.w }));
}

export function classifyImage(img: Asset): ImageKind {
  if (img.aspect >= 1.4) return "hero_landscape";
  if (img.aspect >= 1.15) return "wide";
  if (img.aspect <= 0.85) return "hero_portrait";
  if (img.aspect <= 1.05) return "square";
  return "wide";
}

export function slotAccepts(slot: RecipeSlot, img: Asset) {
  const kind = classifyImage(img);
  if (slot.kind === "hero_landscape") return kind === "hero_landscape" || kind === "wide";
  if (slot.kind === "hero_portrait") return kind === "hero_portrait" || kind === "portrait";
  if (slot.kind === "portrait") return kind === "hero_portrait" || kind === "portrait" || kind === "square";
  if (slot.kind === "wide") return kind === "hero_landscape" || kind === "wide" || kind === "square";
  if (slot.kind === "square") return kind === "square" || kind === "wide" || kind === "portrait";
  return true;
}

export function cropFraction(imageAspect: number, frameAspect: number) {
  return imageAspect >= frameAspect ? 1 - frameAspect / imageAspect : 1 - imageAspect / frameAspect;
}

export function scoreFit(image: Asset, slot: RecipeSlot) {
  const crop = cropFraction(image.aspect, slot.ratio);
  
  // 1.0 score for perfect fit (0 crop), scaling down to 0 at MAX_CROP (30%), then penalizes heavily.
  const cropScore = crop <= MAX_CROP ? 1 - (crop / MAX_CROP) : -1 - crop;
  
  const kind = classifyImage(image);
  const kindBonus = kind === slot.kind ? 1 : slotAccepts(slot, image) ? 0.68 : 0.2;
  
  const ratioMatch = 1 - Math.abs(image.aspect - slot.ratio) / Math.max(image.aspect, slot.ratio);
  
  // Size modifier is severely nerfed to act purely as a tie-breaker, preventing it from overpowering aspect ratios.
  const sizeTieBreaker = (slot.w * slot.h) * 0.001; 
  
  return (cropScore * 120) + (kindBonus * 45) + (ratioMatch * 28) + sizeTieBreaker;
}

export function assignImagesToSlots(images: Asset[], slots: RecipeSlot[]) {
  const remaining = [...images].sort((a, b) => a.ts - b.ts || a.name.localeCompare(b.name));
  const orderedSlots = [...slots].sort((a, b) => b.priority - a.priority || (b.w * b.h) - (a.w * a.h));
  const result = new Map<string, Asset>();

  for (const slot of orderedSlots) {
    if (remaining.length === 0) break;
    let best = remaining[0];
    let bestScore = scoreFit(best, slot);
    for (const img of remaining.slice(1)) {
      const s = scoreFit(img, slot);
      if (s > bestScore) {
        best = img;
        bestScore = s;
      }
    }
    const index = remaining.findIndex((x) => x.id === best.id);
    if (index >= 0) remaining.splice(index, 1);
    result.set(slot.id, best);
  }
  return result;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}