export function preloadCharacterAssets(scene: Phaser.Scene) {
  // HEADS

  scene.load.image(
    "character-head-human-white-front",
    "assets/characters/heads/white/front.png",
  );

  scene.load.image(
    "character-head-human-white-back",
    "assets/characters/heads/white/back.png",
  );

  scene.load.image(
    "character-head-human-white-left",
    "assets/characters/heads/white/left.png",
  );

  scene.load.image(
    "character-head-human-white-right",
    "assets/characters/heads/white/right.png",
  );

  scene.load.image(
    "character-head-human-black-front",
    "assets/characters/heads/black/front.png",
  );

  scene.load.image(
    "character-head-human-black-back",
    "assets/characters/heads/black/back.png",
  );

  scene.load.image(
    "character-head-human-black-left",
    "assets/characters/heads/black/left.png",
  );

  scene.load.image(
    "character-head-human-black-right",
    "assets/characters/heads/black/right.png",
  );

  // HAIR

  const hairTypes = [
    "straight",
    "curly",
    "wavy",
    "afro",
    "female-straight",
    "female-goated-hair",
  ];

  const hairColors = ["brown", "black", "blonde", "red"];

  for (const hairType of hairTypes) {
    for (const hairColor of hairColors) {
      scene.load.image(
        `character-hair-${hairColor}-${hairType}-front`,
        `assets/characters/hairs/${hairType}/${hairColor}/front.png`,
      );

      scene.load.image(
        `character-hair-${hairColor}-${hairType}-back`,
        `assets/characters/hairs/${hairType}/${hairColor}/back.png`,
      );

      scene.load.image(
        `character-hair-${hairColor}-${hairType}-left`,
        `assets/characters/hairs/${hairType}/${hairColor}/left.png`,
      );

      scene.load.image(
        `character-hair-${hairColor}-${hairType}-right`,
        `assets/characters/hairs/${hairType}/${hairColor}/right.png`,
      );
    }
  }

  // SKIN

  scene.load.image(
    "character-skin-human-white-front",
    "assets/characters/skins/white/front.png",
  );

  scene.load.image(
    "character-skin-human-white-back",
    "assets/characters/skins/white/back.png",
  );

  scene.load.image(
    "character-skin-human-white-left",
    "assets/characters/skins/white/left.png",
  );

  scene.load.image(
    "character-skin-human-white-right",
    "assets/characters/skins/white/right.png",
  );

  scene.load.image(
    "character-skin-human-black-front",
    "assets/characters/skins/black/front.png",
  );

  scene.load.image(
    "character-skin-human-black-back",
    "assets/characters/skins/black/back.png",
  );

  scene.load.image(
    "character-skin-human-black-left",
    "assets/characters/skins/black/left.png",
  );

  scene.load.image(
    "character-skin-human-black-right",
    "assets/characters/skins/black/right.png",
  );

  // BODY

  scene.load.image(
    "character-body-human-green-tunic-front",
    "assets/characters/bodies/greenTunic/bodyFront.png",
  );

  scene.load.image(
    "character-body-human-green-tunic-back",
    "assets/characters/bodies/greenTunic/bodyBack.png",
  );

  scene.load.image(
    "character-body-human-green-tunic-left",
    "assets/characters/bodies/greenTunic/bodyLeft.png",
  );

  scene.load.image(
    "character-body-human-green-tunic-right",
    "assets/characters/bodies/greenTunic/bodyRight.png",
  );

  // CAPE

  scene.load.image(
    "character-cape-human-white-red-top",
    "assets/characters/capes/redCape/top.png",
  );

  scene.load.image(
    "character-cape-human-white-red-bottom",
    "assets/characters/capes/redCape/bottom.png",
  );

  scene.load.image(
    "character-cape-human-white-red-back",
    "assets/characters/capes/redCape/back.png",
  );

  scene.load.image(
    "character-cape-human-white-red-left",
    "assets/characters/capes/redCape/left.png",
  );

  scene.load.image(
    "character-cape-human-white-red-right",
    "assets/characters/capes/redCape/right.png",
  );
}
