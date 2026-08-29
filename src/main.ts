import Phaser from "phaser";
import { MapScene } from "./game/MapScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 960,
  height: 960,
  backgroundColor: "#1e1e1e",
  scene: MapScene,
};

new Phaser.Game(config);
