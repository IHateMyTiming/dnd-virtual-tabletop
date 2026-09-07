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
    lava: "Lava",
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

    //BUTTONS
    saveMap: "Save Map",
    loadMap: "Load Map",
    customize: "Customize Character",

    //CHARACTERS FEATURES
    characterCustomization: "Character Customization",
    head: "Head",
    hair: "Hair",
    hairColor: "Hair Color",
    body: "Body",
    cape: "Cape",
    accessory: "Accessory",

    previous: "Previous",
    next: "Next",

    createCharacter: "Create Character",
    backToMap: "Back to Map",

    bald: "Bald",
    noCape: "No Cape",
    noAccessory: "No Accessory",

    straight: "Straight",
    curly: "Curly",
    wavy: "Wavy",
    afro: "Afro",
    femaleStraight: "Female Straight",
    femaleGoatedHair: "Female Goated Hair",

    white: "White",
    black: "Black",
    brown: "Brown",
    blonde: "Blonde",
    red: "Red",

    greenTunic: "Green Tunic",
    whiteRedCape: "White & Red Cape",
    wizardHat: "Wizard Hat",

    color: "Color",
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
    lava: "Lava",
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

    //BOTÕES
    saveMap: "Salve o Mapa",
    loadMap: "Carregue o Mapa",
    customize: "Customise o Personagem",

    // CARACTERISTICAS DE PERSONAGENS

    characterCustomization: "Personalização do Personagem",
    head: "Cabeça",
    hair: "Cabelo",
    hairColor: "Cor do Cabelo",
    body: "Corpo",
    cape: "Capa",
    accessory: "Acessório",

    previous: "Anterior",
    next: "Próximo",

    createCharacter: "Criar Personagem",
    backToMap: "Voltar para o Mapa",

    bald: "Careca",
    noCape: "Sem Capa",
    noAccessory: "Sem Acessório",

    straight: "Liso",
    curly: "Cacheado",
    wavy: "Ondulado",
    afro: "Afro",
    femaleStraight: "Liso Feminino",
    femaleGoatedHair: "Cabelo Feminino",

    white: "Branco",
    black: "Preto",
    brown: "Castanho",
    blonde: "Loiro",
    red: "Ruivo",

    greenTunic: "Túnica Verde",
    whiteRedCape: "Capa Branca e Vermelha",
    wizardHat: "Chapéu de Mago",

    color: "Cor",
  },
};

export function setupTranslations() {
  const languageSelect = document.querySelector<HTMLSelectElement>("#language");

  const savedLanguage = (localStorage.getItem("language") as Language) ?? "en";

  if (!languageSelect) {
    return;
  }

  // Use saved language
  languageSelect.value = savedLanguage;

  languageSelect.addEventListener("change", () => {
    const language = languageSelect.value as Language;

    localStorage.setItem("language", language);

    translatePage(language);
  });

  translatePage(savedLanguage);
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
