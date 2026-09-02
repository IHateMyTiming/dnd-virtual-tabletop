export type Language = "en" | "pt";

export const translations = {
  en: {
    //GRID
    map: "Map size",
    //Terrain
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

    //Character
    addCharacter: "Add Character",
    selectCharacter: "Select Character",
    eraseCharacter: "Erase Character",
    eraseAllCharacters: "Erase All Characters",

    //Props
    boulder: "Boulder",
    tree: "Tree",
    settings: "Settings",
    select: "Select",
    width: "Width",
    height: "Height",
    apply: "Apply",
    cancel: "Cancel",

    //Error Handling
    invalidObjectSize:
      "Object overlaps another object or extends outside the map.",
    invalidDimensions: "Width and height must be between 1 and 100.",
    maxObjectSize: "Maximum size is 100.",
    minObjectSize: "Minimum object size is 1.",
    invalidObjectShape: "This object cannot have these proportions.",
    invalidObjectDimensions:
      "The {objectName} cannot be larger than {maxSize} tiles in either dimension.",
    invalidObjectProportions:
      "The {objectName} cannot have these proportions. Its width and height can only differ by up to {maxDifference} tiles.",

    //Map Size
    invalidMapDimensions:
      "Map width and height must be whole numbers of at least 5 and must end in 0 or 5.",
    confirmMapResize:
      "Changing the grid size will clear the current map. Any unsaved changes will be lost. Do you want to continue?",
  },

  pt: {
    //MAPA
    map: "Tamanho do Mapa",

    //Terreno
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

    //Personagem
    addCharacter: "Adicionar Personagem",
    selectCharacter: "Selecionar Personagem",
    eraseCharacter: "Apagar Personagem",
    eraseAllCharacters: "Apagar todos os Personagens",

    //Objetos
    boulder: "Pedra",
    tree: "Árvore",
    settings: "Configurações",
    select: "Selecionar",
    width: "Largura",
    height: "Altura",
    apply: "Aplicar",
    cancel: "Cancelar",

    //Mensagem de Erro
    invalidObjectSize:
      "O objeto sobrepõe outro objeto ou ultrapassa os limites do mapa.",
    invalidDimensions: "Largura e altura devem estar entre 1 e 100.",
    maxObjectSize: "O tamanho máximo é 100.",
    minObjectSize: "O tamanho mínimo do objeto é 1.",
    invalidObjectShape: "Este objeto não pode ter essas proporções.",
    invalidObjectDimensions:
      "O {objectName} não pode ser maior que {maxSize} quadrados em nenhuma das dimensões.",
    invalidObjectProportions:
      "O {objectName} não pode ter essas proporções. A largura e a altura só podem diferir em até {maxDifference} quadrados.",

    //Tamanho do Mapa
    invalidMapDimensions:
      "A largura e a altura do mapa devem ser números inteiros de no mínimo 5 e devem terminar em 0 ou 5.",
    confirmMapResize:
      "Alterar o tamanho do mapa apagará o mapa atual. Quaisquer alterações não salvas serão perdidas. Deseja continuar?",
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

export function getCurrentLanguage(): Language {
  const languageSelect = document.querySelector<HTMLSelectElement>("#language");

  return (languageSelect?.value as Language) ?? "en";
}
