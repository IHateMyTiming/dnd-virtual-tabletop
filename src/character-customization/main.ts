import { translations } from "../translation/translation";

type TranslationKey = keyof typeof translations.en;

const savedLanguage = localStorage.getItem("language");

const language =
  savedLanguage === "pt" || savedLanguage === "en" ? savedLanguage : "en";

const t = translations[language];

interface HairOption {
  id: string;
  name: TranslationKey;
  type: string;
  none?: boolean;
}

interface BodyOption {
  id: string;
  name: TranslationKey;
  folder: string;
}

interface CapeOption {
  id: string;
  name: TranslationKey;
  folder: string;
  none?: boolean;
}

interface AccessoryOption {
  id: string;
  name: TranslationKey;
  folder: string;
  none?: boolean;
}

// OPTIONS

const colors = ["white", "black"] as const;
const hairColors = ["brown", "black", "blonde", "red"] as const;

const hairs: HairOption[] = [
  {
    id: "none",
    name: "bald",
    type: "none",
    none: true,
  },
  {
    id: "straight",
    name: "straight",
    type: "straight",
  },
  {
    id: "curly",
    name: "curly",
    type: "curly",
  },
  {
    id: "wavy",
    name: "wavy",
    type: "wavy",
  },
  {
    id: "afro",
    name: "afro",
    type: "afro",
  },
  {
    id: "female-straight",
    name: "femaleStraight",
    type: "female-straight",
  },
  {
    id: "female-goated-hair",
    name: "femaleGoatedHair",
    type: "female-goated-hair",
  },
];

const bodies: BodyOption[] = [
  {
    id: "human-green-tunic",
    name: "greenTunic",
    folder: "greenTunic",
  },
];

const capes: CapeOption[] = [
  {
    id: "none",
    name: "noCape",
    folder: "",
    none: true,
  },

  {
    id: "human-white-red",
    name: "whiteRedCape",
    folder: "redCape",
  },
];

const accessories: AccessoryOption[] = [
  {
    id: "none",
    name: "noAccessory",
    folder: "",
    none: true,
  },
  {
    id: "wizard-hat",
    name: "wizardHat",
    folder: "hat",
  },
];

// CURRENT SELECTION

let selectedColor: (typeof colors)[number] = "white";
let selectedHair = 0;
let selectedHairColor = 0;
let selectedBody = 0;
let selectedCape = 0;
let selectedAccessory = 0;

// ELEMENTS

const colorOptions = document.getElementById("color-options")!;

const hairImage = document.getElementById(
  "hair-option-image",
) as HTMLImageElement;

const hairName = document.getElementById("hair-option-name")!;

const hairColorPrevious = document.getElementById(
  "hair-color-previous",
) as HTMLButtonElement;

const hairColorNext = document.getElementById(
  "hair-color-next",
) as HTMLButtonElement;

const hairColorName = document.getElementById(
  "hair-color-name",
) as HTMLSpanElement;

const bodyImage = document.getElementById(
  "body-option-image",
) as HTMLImageElement;

const bodyName = document.getElementById("body-option-name")!;

const capeName = document.getElementById("cape-option-name")!;

const previewHead = document.getElementById("preview-head") as HTMLImageElement;

const previewSkin = document.getElementById("preview-skin") as HTMLImageElement;

const previewBody = document.getElementById("preview-body") as HTMLImageElement;

const hairNone = document.getElementById("hair-option-none")!;
const capeNone = document.getElementById("cape-option-none")!;

const previewCapeBottom = document.getElementById(
  "preview-cape-bottom",
) as HTMLImageElement;

const previewCapeTop = document.getElementById(
  "preview-cape-top",
) as HTMLImageElement;

const previewHair = document.getElementById("preview-hair") as HTMLImageElement;
const previewAccessory = document.getElementById(
  "preview-accessory",
) as HTMLImageElement;

const accessoryImage = document.getElementById(
  "accessory-option-image",
) as HTMLImageElement;

const accessoryName = document.getElementById("accessory-option-name")!;

const accessoryNone = document.getElementById("accessory-option-none")!;

const accessory = accessories[selectedAccessory];

if (accessory.none) {
  previewAccessory.style.display = "none";
} else {
  previewAccessory.style.display = "block";

  previewAccessory.src = `/assets/characters/accessories/${accessory.folder}/front.png`;

  previewAccessory.style.width = "120px";
  previewAccessory.style.height = "auto";
  previewAccessory.style.left = "100px";
  previewAccessory.style.top = "45px";
}

// COLOR

function renderColorOptions(): void {
  colorOptions.innerHTML = "";

  for (const color of colors) {
    const button = document.createElement("button");

    button.className = "color-option";

    if (color === selectedColor) {
      button.classList.add("selected");
    }

    button.textContent = t[color];
    button.addEventListener("click", () => {
      selectedColor = color;

      renderColorOptions();
      updateCharacterPreview();
    });

    colorOptions.appendChild(button);
  }
}

//HEAD

const headPreviewSettings = {
  white: {
    width: 77,
    height: 38,
    x: 100,
    y: 96,
  },

  black: {
    width: 87,
    height: 37,
    x: 105,
    y: 96,
  },
};

const skinPreviewSettings = {
  white: {
    width: 96,
    height: 48,
    x: 100,
    y: 139,
  },

  black: {
    width: 102,
    height: 30,
    x: 97,
    y: 129,
  },
};

// HAIR

const hairPreviewSettings = {
  straight: {
    width: 96,
    height: 48,
    x: 100,
    y: 86,
  },

  curly: {
    width: 100,
    height: 55,
    x: 100,
    y: 83,
  },

  wavy: {
    width: 96,
    height: 63,
    x: 97,
    y: 97,
  },

  afro: {
    width: 105,
    height: 60,
    x: 100,
    y: 84,
  },

  "female-straight": {
    width: 100,
    height: 65,
    x: 100,
    y: 96,
  },

  "female-goated-hair": {
    width: 100,
    height: 60,
    x: 102,
    y: 88,
  },
};

function updateHair(): void {
  const hair = hairs[selectedHair];

  hairName.textContent = t[hair.name];

  if (hair.none) {
    hairNone.style.display = "flex";
    hairImage.style.display = "none";
    previewHair.style.display = "none";
  } else {
    hairNone.style.display = "none";
    hairImage.style.display = "block";
    previewHair.style.display = "block";

    const hairSettings =
      hairPreviewSettings[hair.type as keyof typeof hairPreviewSettings];

    const hairColor = hairColors[selectedHairColor];

    const hairSrc = `/assets/characters/hairs/${hair.type}/${hairColor}/front.png`;

    // HAIR SELECTOR
    hairImage.src = hairSrc;

    // CHARACTER PREVIEW
    previewHair.src = hairSrc;
    previewHair.style.width = `${hairSettings.width}px`;
    previewHair.style.height = `${hairSettings.height}px`;
    previewHair.style.left = `${hairSettings.x}px`;
    previewHair.style.top = `${hairSettings.y}px`;
  }

  hairColorName.textContent = t[hairColors[selectedHairColor]];
  updateCharacterPreview();
}

// BODY

function updateBody(): void {
  const body = bodies[selectedBody];

  hairName.textContent = t[body.name];

  bodyImage.src = `/assets/characters/bodies/${body.folder}/bodyFront.png`;

  updateCharacterPreview();
}

// CAPE

const capeImage = document.getElementById(
  "cape-option-image",
) as HTMLImageElement;

function updateCape(): void {
  const cape = capes[selectedCape];

  capeName.textContent = t[cape.name];

  if (cape.none) {
    capeNone.style.display = "flex";
    capeImage.style.display = "none";
  } else {
    capeNone.style.display = "none";
    capeImage.style.display = "block";

    capeImage.src = `/assets/characters/capes/${cape.folder}/whole.png`;
  }

  updateCharacterPreview();
}

//ACCESSORIES

function updateAccessory(): void {
  const accessory = accessories[selectedAccessory];

  accessoryName.textContent = t[accessory.name];

  if (accessory.none) {
    accessoryNone.style.display = "flex";
    accessoryImage.style.display = "none";
  } else {
    accessoryNone.style.display = "none";
    accessoryImage.style.display = "block";

    accessoryImage.src = `/assets/characters/accessories/${accessory.folder}/front.png`;
  }

  updateCharacterPreview();
}

// CHARACTER PREVIEW

function updateCharacterPreview(): void {
  // HEAD
  previewHead.src = `/assets/characters/heads/${selectedColor}/front.png`;

  const headSettings = headPreviewSettings[selectedColor];

  previewHead.style.width = `${headSettings.width}px`;
  previewHead.style.height = `${headSettings.height}px`;
  previewHead.style.left = `${headSettings.x}px`;
  previewHead.style.top = `${headSettings.y}px`;

  // SKIN
  previewSkin.src = `/assets/characters/skins/${selectedColor}/front.png`;

  const skinSettings = skinPreviewSettings[selectedColor];

  previewSkin.style.width = `${skinSettings.width}px`;
  previewSkin.style.height = `${skinSettings.height}px`;
  previewSkin.style.left = `${skinSettings.x}px`;
  previewSkin.style.top = `${skinSettings.y}px`;

  // BODY
  const body = bodies[selectedBody];

  previewBody.src = `/assets/characters/bodies/${body.folder}/bodyFront.png`;

  // CAPE
  const cape = capes[selectedCape];

  if (cape.none) {
    previewCapeBottom.style.display = "none";
    previewCapeTop.style.display = "none";
  } else {
    previewCapeBottom.style.display = "block";
    previewCapeTop.style.display = "block";

    previewCapeBottom.src = `/assets/characters/capes/${cape.folder}/bottom.png`;

    previewCapeTop.src = `/assets/characters/capes/${cape.folder}/top.png`;
  }

  const accessory = accessories[selectedAccessory];

  if (accessory.none) {
    previewAccessory.style.display = "none";
  } else {
    previewAccessory.style.display = "block";

    previewAccessory.src = `/assets/characters/accessories/${accessory.folder}/front.png`;

    previewAccessory.style.width = "117px";
    previewAccessory.style.height = "auto";
    previewAccessory.style.left = "101px";
    previewAccessory.style.top = "62px";

    previewAccessory.style.position = "absolute";
    previewAccessory.style.zIndex = "10";
  }
}

// HAIR BUTTONS

document.getElementById("hair-previous")!.addEventListener("click", () => {
  selectedHair--;

  if (selectedHair < 0) {
    selectedHair = hairs.length - 1;
  }

  updateHair();
});

document.getElementById("hair-next")!.addEventListener("click", () => {
  selectedHair++;

  if (selectedHair >= hairs.length) {
    selectedHair = 0;
  }

  updateHair();
});

hairColorPrevious.addEventListener("click", () => {
  selectedHairColor =
    (selectedHairColor - 1 + hairColors.length) % hairColors.length;

  updateHair();
});

hairColorNext.addEventListener("click", () => {
  selectedHairColor = (selectedHairColor + 1) % hairColors.length;

  updateHair();
});

// BODY BUTTONS

document.getElementById("body-previous")!.addEventListener("click", () => {
  selectedBody--;

  if (selectedBody < 0) {
    selectedBody = bodies.length - 1;
  }

  updateBody();
});

document.getElementById("body-next")!.addEventListener("click", () => {
  selectedBody++;

  if (selectedBody >= bodies.length) {
    selectedBody = 0;
  }

  updateBody();
});

// CAPE BUTTONS

document.getElementById("cape-previous")!.addEventListener("click", () => {
  selectedCape--;

  if (selectedCape < 0) {
    selectedCape = capes.length - 1;
  }

  updateCape();
});

document.getElementById("cape-next")!.addEventListener("click", () => {
  selectedCape++;

  if (selectedCape >= capes.length) {
    selectedCape = 0;
  }

  updateCape();
});

//ACCESSORIES
document.getElementById("accessory-previous")!.addEventListener("click", () => {
  selectedAccessory--;

  if (selectedAccessory < 0) {
    selectedAccessory = accessories.length - 1;
  }

  updateAccessory();
});

document.getElementById("accessory-next")!.addEventListener("click", () => {
  selectedAccessory++;

  if (selectedAccessory >= accessories.length) {
    selectedAccessory = 0;
  }

  updateAccessory();
});

// CREATE CHARACTER

document.getElementById("create-character")!.addEventListener("click", () => {
  const customization = {
    headId: `human-head-${selectedColor}`,
    hairId: hairs[selectedHair].id,
    hairColor: hairColors[selectedHairColor],
    skinId: `human-${selectedColor}`,
    bodyId: bodies[selectedBody].id,
    capeId: capes[selectedCape].id,
    accessoryIds: accessories[selectedAccessory].none
      ? []
      : [accessories[selectedAccessory].id],
  };

  const encodedCustomization = encodeURIComponent(
    JSON.stringify(customization),
  );

  window.location.href = `/?character=${encodedCustomization}`;
});

document.getElementById("back-to-map")?.addEventListener("click", () => {
  window.location.href = "/";
});

function translatePage(): void {
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n as keyof typeof translations.en;

    element.textContent = t[key];
  });
}

// INITIALIZE

renderColorOptions();
updateHair();
updateBody();
updateCape();
updateCharacterPreview();
translatePage();
