import Phaser from "phaser";
import "./style.css";

import { MapScene } from "./game/scenes/MapScene";

import { setupTranslations } from "./game/translation/translation";

setupTranslations();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 960,
  height: 720,

  backgroundColor: "#1e1e1e",

  parent: "game",

  scene: MapScene,
};

new Phaser.Game(config);
