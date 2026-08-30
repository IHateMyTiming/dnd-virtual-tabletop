type Language = "en" | "pt";

const translations = {
  en: {
    layer: "Layer",
    brush: "Brush",
    rectangle: "Rectangle",
    fill: "Fill",
    floor: "Floor",
    wall: "Wall",
    water: "Water",
    grass: "Grass",
    mud: "Mud",
    fire: "Fire",
    sand: "Sand",
    erase: "Erase",
    eraseAll: "Erase All",
  },

  pt: {
    layer: "Pisos",
    brush: "Pincel",
    rectangle: "Retângulo",
    fill: "Preencher",
    floor: "Chão",
    wall: "Parede",
    water: "Água",
    grass: "Grama",
    mud: "Lama",
    fire: "Fogo",
    sand: "Areia",
    erase: "Apagar",
    eraseAll: "Apagar Tudo",
  },
};

export function setupTranslations() {
  const languageSelect = document.querySelector<HTMLSelectElement>("#language");

  if (!languageSelect) {
    return;
  }

  languageSelect.addEventListener("change", () => {
    const language = languageSelect.value as Language;

    translatePage(language);
  });

  translatePage(languageSelect.value as Language);
}

function translatePage(language: Language) {
  const elements = document.querySelectorAll<HTMLElement>("[data-i18n]");

  elements.forEach((element) => {
    const key = element.dataset.i18n as keyof typeof translations.en;

    element.textContent = translations[language][key];
  });
}
