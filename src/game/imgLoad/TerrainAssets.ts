export function preloadTerrainAssets(scene: Phaser.Scene) {
  //GRASS

  scene.load.image("short-grass", "assets/terrain/grass/shortGrass.png");
  scene.load.image("tall-grass", "assets/terrain/grass/tallGrass.png");

  //WATER

  scene.load.image("water-center", "assets/terrain/water/waterCenter.png");
  scene.load.image("water-top", "assets/terrain/water/waterTop.png");
  scene.load.image("water-left", "assets/terrain/water/waterLeft.png");
  scene.load.image("water-right", "assets/terrain/water/waterRight.png");
  scene.load.image("water-bottom", "assets/terrain/water/waterBottom.png");
  scene.load.image("water-top-right", "assets/terrain/water/waterTopRight.png");
  scene.load.image("water-top-left", "assets/terrain/water/waterTopLeft.png");
  scene.load.image(
    "water-bottom-right",
    "assets/terrain/water/waterBottomRight.png",
  );
  scene.load.image(
    "water-bottom-left",
    "assets/terrain/water/waterBottomLeft.png",
  );
  scene.load.image(
    "water-river-horizontal",
    "assets/terrain/water/waterRiverHorizontal.png",
  );
  scene.load.image(
    "water-river-vertical",
    "assets/terrain/water/waterRiverVertical.png",
  );

  //SAND

  scene.load.image("sand-center", "assets/terrain/sand/sandCenter.png");
  scene.load.image("sand-top", "assets/terrain/sand/sandTop.png");
  scene.load.image("sand-bottom", "assets/terrain/sand/sandBottom.png");
  scene.load.image("sand-left", "assets/terrain/sand/sandLeft.png");
  scene.load.image("sand-right", "assets/terrain/sand/sandRight.png");
  scene.load.image("sand-top-left", "assets/terrain/sand/sandTopLeft.png");
  scene.load.image("sand-top-right", "assets/terrain/sand/sandTopRight.png");
  scene.load.image(
    "sand-bottom-left",
    "assets/terrain/sand/sandBottomLeft.png",
  );
  scene.load.image(
    "sand-bottom-right",
    "assets/terrain/sand/sandBottomRight.png",
  );
  scene.load.image("sand-vertical", "assets/terrain/sand/sandVertical.png");
  scene.load.image("sand-horizontal", "assets/terrain/sand/sandHorizontal.png");
  scene.load.image(
    "sand-inner-bottom-left",
    "assets/terrain/sand/sandPitBottom.png",
  );
  scene.load.image(
    "sand-inner-bottom-right",
    "assets/terrain/sand/sandPitTop.png",
  );

  //MUD
  scene.load.image("mud", "assets/terrain/mud/mud.png");

  //LAVA
  scene.load.image("lava-center", "assets/terrain/lava/lavaCenter.png");
  scene.load.image("lava-top", "assets/terrain/lava/lavaTop.png");
  scene.load.image("lava-bottom", "assets/terrain/lava/lavaBottom.png");
  scene.load.image("lava-left", "assets/terrain/lava/lavaLeft.png");
  scene.load.image("lava-right", "assets/terrain/lava/lavaRight.png");
  scene.load.image("lava-top-left", "assets/terrain/lava/lavaTopLeft.png");
  scene.load.image("lava-top-right", "assets/terrain/lava/lavaTopRight.png");
  scene.load.image(
    "lava-bottom-right",
    "assets/terrain/lava/lavaBottomRight.png",
  );
  scene.load.image(
    "lava-bottom-left",
    "assets/terrain/lava/lavaBottomLeft.png",
  );

  //FLOOR
  scene.load.image("floor-brick", "assets/terrain/floor/brick.png");
  scene.load.image("floor-bridge", "assets/terrain/floor/bridge.png");
  scene.load.image("floor-concrete", "assets/terrain/floor/concrete.png");
  scene.load.image("floor-japanese", "assets/terrain/floor/japanese.png");
  scene.load.image("floor-rock", "assets/terrain/floor/rock.png");
  scene.load.image("floor-rock2", "assets/terrain/floor/rock2.png");
  scene.load.image("floor-rock3", "assets/terrain/floor/rock3.png");
  scene.load.image("floor-rock4", "assets/terrain/floor/rock4.png");
  scene.load.image("floor-rock5", "assets/terrain/floor/rock5.png");
  scene.load.image("floor-wood1", "assets/terrain/floor/wood1.png");
  scene.load.image("floor-wood2", "assets/terrain/floor/wood2.png");
  scene.load.image("floor-dungeon1", "assets/terrain/floor/dungeon1.png");
  scene.load.image("floor-dungeon2", "assets/terrain/floor/dungeon2.png");
}
