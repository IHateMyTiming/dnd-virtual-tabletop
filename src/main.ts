import Phaser from "phaser";
import "./style.css";

//import { MapScene } from "./game/scenes/MapScene";
import { CombatTestScene } from "./game/CombatTestScene";

import { setupTranslations } from "./translation/translation";

setupTranslations();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: 960,
  height: 1200,

  backgroundColor: "#1e1e1e",

  parent: "game",

  //scene: MapScene,
  scene: CombatTestScene,
};

document
  .getElementById("character-customization")
  ?.addEventListener("click", () => {
    window.location.href = "/src/character-customization/index.html";
  });

new Phaser.Game(config);
