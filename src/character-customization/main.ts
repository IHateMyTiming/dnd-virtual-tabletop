interface HairOption {
  id: string;
  name: string;
  type: string;
  none?: boolean;
}

interface BodyOption {
  id: string;
  name: string;
  folder: string;
}

interface CapeOption {
  id: string;
  name: string;
  folder: string;
  none?: boolean;
}

// OPTIONS

const colors = ["white", "black"] as const;
const hairColors = ["brown", "black", "blonde", "red"] as const;

const hairs: HairOption[] = [
  {
    id: "none",
    name: "Bald",
    type: "none",
    none: true,
  },

  {
    id: "straight",
    name: "Straight",
    type: "straight",
  },

  {
    id: "curly",
    name: "Curly",
    type: "curly",
  },

  {
    id: "wavy",
    name: "Wavy",
    type: "wavy",
  },

  {
    id: "afro",
    name: "Afro",
    type: "afro",
  },

  {
    id: "female-straight",
    name: "Female Straight",
    type: "female-straight",
  },

  {
    id: "female-goated-hair",
    name: "Female Goated Hair",
    type: "female-goated-hair",
  },
];

const bodies: BodyOption[] = [
  {
    id: "human-green-tunic",
    name: "Green Tunic",
    folder: "greenTunic",
  },
];

const capes: CapeOption[] = [
  {
    id: "none",
    name: "No Cape",
    folder: "",
    none: true,
  },

  {
    id: "human-white-red",
    name: "White & Red Cape",
    folder: "redCape",
  },
];

// CURRENT SELECTION

let selectedColor: (typeof colors)[number] = "white";
let selectedHair = 0;
let selectedHairColor = 0;
let selectedBody = 0;
let selectedCape = 0;

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

// COLOR

function renderColorOptions(): void {
  colorOptions.innerHTML = "";

  for (const color of colors) {
    const button = document.createElement("button");

    button.className = "color-option";

    if (color === selectedColor) {
      button.classList.add("selected");
    }

    button.textContent = color.charAt(0).toUpperCase() + color.slice(1);

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

  hairName.textContent = hair.name;

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

  hairColorName.textContent = hairColors[selectedHairColor];

  updateCharacterPreview();
}

// BODY

function updateBody(): void {
  const body = bodies[selectedBody];

  bodyName.textContent = body.name;

  bodyImage.src = `/assets/characters/bodies/${body.folder}/bodyFront.png`;

  updateCharacterPreview();
}

// CAPE

const capeImage = document.getElementById(
  "cape-option-image",
) as HTMLImageElement;

function updateCape(): void {
  const cape = capes[selectedCape];

  capeName.textContent = cape.name;

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

// CREATE CHARACTER

document.getElementById("create-character")!.addEventListener("click", () => {
  const customization = {
    headId: `human-head-${selectedColor}`,
    hairId: hairs[selectedHair].id,
    hairColor: hairColors[selectedHairColor],
    skinId: `human-${selectedColor}`,
    bodyId: bodies[selectedBody].id,
    capeId: capes[selectedCape].id,
  };

  console.log("Character customization:", customization);
});

document.getElementById("back-to-map")?.addEventListener("click", () => {
  window.location.href = "/";
});

// INITIALIZE

renderColorOptions();
updateHair();
updateBody();
updateCape();
updateCharacterPreview();
