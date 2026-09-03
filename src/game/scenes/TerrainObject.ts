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
    //GRASS

    id: "short-grass",
    category: "grass",
    name: "Short Grass",
    width: 1,
    height: 1,
    imageKey: "short-grass",
    assetPath: "assets/terrain/grass/shortGrass.png",
  },
  {
    id: "tall-grass",
    category: "grass",
    name: "Tall Grass",
    width: 1,
    height: 2,
    imageKey: "tall-grass",
    assetPath: "assets/terrain/grass/tallGrass.png",
  },

  //WATER

  {
    id: "water-center",
    category: "water",
    name: "Water",
    width: 1,
    height: 1,
    imageKey: "water-center",
    assetPath: "assets/terrain/water/waterCenter.png",
  },
  {
    id: "water-top",
    category: "water",
    name: "Water Top",
    width: 1,
    height: 1,
    imageKey: "water-top",
    assetPath: "assets/terrain/water/waterTop.png",
  },
  {
    id: "water-bottom",
    category: "water",
    name: "Water Bottom",
    width: 1,
    height: 1,
    imageKey: "water-bottom",
    assetPath: "assets/terrain/water/waterBottom.png",
  },
  {
    id: "water-right",
    category: "water",
    name: "Water Right",
    width: 1,
    height: 1,
    imageKey: "water-right",
    assetPath: "assets/terrain/water/waterRight.png",
  },
  {
    id: "water-left",
    category: "water",
    name: "Water Left",
    width: 1,
    height: 1,
    imageKey: "water-left",
    assetPath: "assets/terrain/water/waterLeft.png",
  },
  {
    id: "water-top-right",
    category: "water",
    name: "Water Top Right",
    width: 1,
    height: 1,
    imageKey: "water-top-right",
    assetPath: "assets/terrain/water/waterTopRight.png",
  },
  {
    id: "water-top-left",
    category: "water",
    name: "Water Top Left",
    width: 1,
    height: 1,
    imageKey: "water-top-left",
    assetPath: "assets/terrain/water/waterTopLeft.png",
  },
  {
    id: "water-bottom-right",
    category: "water",
    name: "Water Bottom Right",
    width: 1,
    height: 1,
    imageKey: "water-bottom-right",
    assetPath: "assets/terrain/water/waterBottomRight.png",
  },
  {
    id: "water-bottom-left",
    category: "water",
    name: "Water Bottom Left",
    width: 1,
    height: 1,
    imageKey: "water-bottom-left",
    assetPath: "assets/terrain/water/waterBottomLeft.png",
  },
  {
    id: "water-river-vertical",
    category: "water",
    name: "Water River Vertical",
    width: 1,
    height: 1,
    imageKey: "water-river-vertical",
    assetPath: "assets/terrain/water/waterRiverVertical.png",
  },
  {
    id: "water-river-horizontal",
    category: "water",
    name: "Water River Horizontal",
    width: 1,
    height: 1,
    imageKey: "water-river-horizontal",
    assetPath: "assets/terrain/water/waterRiverHorizontal.png",
  },
  {
    id: "water-curve-bottom-right",
    category: "water",
    name: "Water Curve Bottom Right",
    width: 1,
    height: 1,
    imageKey: "water-curve-bottom-right",
    assetPath: "assets/terrain/water/waterCurveBottomRight.png",
  },
  {
    id: "water-curve-bottom-left",
    category: "water",
    name: "Water Curve Bottom Left",
    width: 1,
    height: 1,
    imageKey: "water-curve-bottom-left",
    assetPath: "assets/terrain/water/waterCurveBottomLeft.png",
  },
  {
    id: "water-curve-top-right",
    category: "water",
    name: "Water Curve Top Right",
    width: 1,
    height: 1,
    imageKey: "water-curve-top-right",
    assetPath: "assets/terrain/water/waterCurveTopRight.png",
  },
  {
    id: "water-curve-top-left",
    category: "water",
    name: "Water Curve Top Left",
    width: 1,
    height: 1,
    imageKey: "water-curve-top-left",
    assetPath: "assets/terrain/water/waterCurveTopLeft.png",
  },

  //SAND

  {
    id: "sand-center",
    category: "sand",
    name: "Sand",
    width: 1,
    height: 1,
    imageKey: "sand-center",
    assetPath: "assets/terrain/sand/sandCenter.png",
  },
  {
    id: "sand-top",
    category: "sand",
    name: "Sand Top",
    width: 1,
    height: 1,
    imageKey: "sand-top",
    assetPath: "assets/terrain/sand/sandTop.png",
  },
  {
    id: "sand-bottom",
    category: "sand",
    name: "Sand Bottom",
    width: 1,
    height: 1,
    imageKey: "sand-bottom",
    assetPath: "assets/terrain/sand/sandBottom.png",
  },
  {
    id: "sand-left",
    category: "sand",
    name: "Sand Left",
    width: 1,
    height: 1,
    imageKey: "sand-left",
    assetPath: "assets/terrain/sand/sandLeft.png",
  },
  {
    id: "sand-right",
    category: "sand",
    name: "Sand Right",
    width: 1,
    height: 1,
    imageKey: "sand-right",
    assetPath: "assets/terrain/sand/sandRight.png",
  },
  {
    id: "sand-top-left",
    category: "sand",
    name: "Sand Top Left",
    width: 1,
    height: 1,
    imageKey: "sand-top-left",
    assetPath: "assets/terrain/sand/sandTopLeft.png",
  },
  {
    id: "sand-top-right",
    category: "sand",
    name: "Sand Top Right",
    width: 1,
    height: 1,
    imageKey: "sand-top-right",
    assetPath: "assets/terrain/sand/sandTopRight.png",
  },
  {
    id: "sand-bottom-left",
    category: "sand",
    name: "Sand Bottom Left",
    width: 1,
    height: 1,
    imageKey: "sand-bottom-left",
    assetPath: "assets/terrain/sand/sandBottomLeft.png",
  },
  {
    id: "sand-bottom-right",
    category: "sand",
    name: "Sand Bottom Right",
    width: 1,
    height: 1,
    imageKey: "sand-bottom-right",
    assetPath: "assets/terrain/sand/sandBottomRight.png",
  },
  {
    id: "sand-vertical",
    category: "sand",
    name: "Sand Vertical",
    width: 1,
    height: 1,
    imageKey: "sand-vertical",
    assetPath: "assets/terrain/sand/sandVertical.png",
  },
  {
    id: "sand-horizontal",
    category: "sand",
    name: "Sand Horizontal",
    width: 1,
    height: 1,
    imageKey: "sand-horizontal",
    assetPath: "assets/terrain/sand/sandHorizontal.png",
  },
];
