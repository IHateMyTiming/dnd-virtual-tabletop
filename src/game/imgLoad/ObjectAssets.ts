import Phaser from "phaser";

export function preloadObjectAssets(scene: Phaser.Scene) {
  scene.load.image("boulder", "assets/objects/boulder.webp");
}
