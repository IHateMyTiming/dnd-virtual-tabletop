import Phaser from "phaser";

import { MapScene } from "./game/MapScene";

import { setupTranslations } from "./i18n";

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
