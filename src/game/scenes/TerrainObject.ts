export type TerrainCategory =
  | "floor"
  | "wall"
  | "water"
  | "grass"
  | "mud"
  | "lava"
  | "sand";

export interface TerrainVariant {
  id: string;
  category: TerrainCategory;
  name: string;
  width: number;
  height: number;
  imageKey: string;
  assetPath: string;
}

export const TERRAIN_VARIANTS: TerrainVariant[] = [
  {
    id: "short-grass",
    category: "grass",
    name: "Short Grass",
    width: 1,
    height: 1,
    imageKey: "short-grass",
    assetPath: "assets/terrain/shortGrass.png",
  },
  {
    id: "tall-grass",
    category: "grass",
    name: "Tall Grass",
    width: 1,
    height: 2,
    imageKey: "tall-grass",
    assetPath: "assets/terrain/tallGrass.png",
  },

  {
    id: "water-center",
    category: "water",
    name: "Water",
    width: 1,
    height: 1,
    imageKey: "water-center",
    assetPath: "assets/terrain/waterCenter.png",
  },
  {
    id: "water-top",
    category: "water",
    name: "Water Top",
    width: 1,
    height: 1,
    imageKey: "water-top",
    assetPath: "assets/terrain/waterTop.png",
  },
  {
    id: "water-bottom",
    category: "water",
    name: "Water Bottom",
    width: 1,
    height: 1,
    imageKey: "water-bottom",
    assetPath: "assets/terrain/waterBottom.png",
  },
  {
    id: "water-right",
    category: "water",
    name: "Water Right",
    width: 1,
    height: 1,
    imageKey: "water-right",
    assetPath: "assets/terrain/waterRight.png",
  },
  {
    id: "water-left",
    category: "water",
    name: "Water Left",
    width: 1,
    height: 1,
    imageKey: "water-left",
    assetPath: "assets/terrain/waterLeft.png",
  },
  {
    id: "water-top-right",
    category: "water",
    name: "Water Top Right",
    width: 1,
    height: 1,
    imageKey: "water-top-right",
    assetPath: "assets/terrain/waterTopRight.png",
  },
  {
    id: "water-top-left",
    category: "water",
    name: "Water Top Left",
    width: 1,
    height: 1,
    imageKey: "water-top-left",
    assetPath: "assets/terrain/waterTopLeft.png",
  },
  {
    id: "water-bottom-right",
    category: "water",
    name: "Water Bottom Right",
    width: 1,
    height: 1,
    imageKey: "water-bottom-right",
    assetPath: "assets/terrain/waterBottomRight.png",
  },
  {
    id: "water-bottom-left",
    category: "water",
    name: "Water Bottom Left",
    width: 1,
    height: 1,
    imageKey: "water-bottom-left",
    assetPath: "assets/terrain/waterBottomLeft.png",
  },
  {
    id: "water-river-vertical",
    category: "water",
    name: "Water River Vertical",
    width: 1,
    height: 1,
    imageKey: "water-river-vertical",
    assetPath: "assets/terrain/waterRiverVertical.png",
  },
  {
    id: "water-river-horizontal",
    category: "water",
    name: "Water River Horizontal",
    width: 1,
    height: 1,
    imageKey: "water-river-horizontal",
    assetPath: "assets/terrain/waterRiverHorizontal.png",
  },
  {
    id: "water-inner-top-right",
    category: "water",
    name: "Water Inner Top Right",
    width: 1,
    height: 1,
    imageKey: "water-inner-top-right",
    assetPath: "assets/terrain/waterInnerTopRight.png",
  },
  {
    id: "water-inner-top-left",
    category: "water",
    name: "Water Inner Top Left",
    width: 1,
    height: 1,
    imageKey: "water-inner-top-left",
    assetPath: "assets/terrain/waterInnerTopLeft.png",
  },
  {
    id: "water-inner-bottom-right",
    category: "water",
    name: "Water Inner Bottom Right",
    width: 1,
    height: 1,
    imageKey: "water-inner-bottom-right",
    assetPath: "assets/terrain/waterInnerBottomRight.png",
  },
  {
    id: "water-inner-bottom-left",
    category: "water",
    name: "Water Inner Bottom Left",
    width: 1,
    height: 1,
    imageKey: "water-inner-bottom-left",
    assetPath: "assets/terrain/waterInnerBottomLeft.png",
  },
];
