export interface CharacterSpritePart {
  id: string;
  name: string;

  front: string;
  back: string;
  left: string;
  right: string;
}

export interface CharacterCape {
  id: string;
  name: string;

  front: {
    top: string;
    bottom: string;
  };

  back: string;
  left: string;
  right: string;
}

// HEADS

export const CHARACTER_HEADS: CharacterSpritePart[] = [
  {
    id: "human-head-white",
    name: "Human White",

    front: "character-head-human-white-front",
    back: "character-head-human-white-back",
    left: "character-head-human-white-left",
    right: "character-head-human-white-right",
  },

  {
    id: "human-head-black",
    name: "Human Black",

    front: "character-head-human-black-front",
    back: "character-head-human-black-back",
    left: "character-head-human-black-left",
    right: "character-head-human-black-right",
  },
];

// HAIR

export const CHARACTER_HAIR: CharacterSpritePart[] = [
  // STRAIGHT

  {
    id: "brown-straight",
    name: "Brown Straight",

    front: "character-hair-brown-straight-front",
    back: "character-hair-brown-straight-back",
    left: "character-hair-brown-straight-left",
    right: "character-hair-brown-straight-right",
  },

  {
    id: "black-straight",
    name: "Black Straight",

    front: "character-hair-black-straight-front",
    back: "character-hair-black-straight-back",
    left: "character-hair-black-straight-left",
    right: "character-hair-black-straight-right",
  },

  {
    id: "blonde-straight",
    name: "Blonde Straight",

    front: "character-hair-blonde-straight-front",
    back: "character-hair-blonde-straight-back",
    left: "character-hair-blonde-straight-left",
    right: "character-hair-blonde-straight-right",
  },

  {
    id: "red-straight",
    name: "Red Straight",

    front: "character-hair-red-straight-front",
    back: "character-hair-red-straight-back",
    left: "character-hair-red-straight-left",
    right: "character-hair-red-straight-right",
  },

  // CURLY

  {
    id: "brown-curly",
    name: "Brown Curly",

    front: "character-hair-brown-curly-front",
    back: "character-hair-brown-curly-back",
    left: "character-hair-brown-curly-left",
    right: "character-hair-brown-curly-right",
  },

  {
    id: "black-curly",
    name: "Black Curly",

    front: "character-hair-black-curly-front",
    back: "character-hair-black-curly-back",
    left: "character-hair-black-curly-left",
    right: "character-hair-black-curly-right",
  },

  {
    id: "blonde-curly",
    name: "Blonde Curly",

    front: "character-hair-blonde-curly-front",
    back: "character-hair-blonde-curly-back",
    left: "character-hair-blonde-curly-left",
    right: "character-hair-blonde-curly-right",
  },

  {
    id: "red-curly",
    name: "Red Curly",

    front: "character-hair-red-curly-front",
    back: "character-hair-red-curly-back",
    left: "character-hair-red-curly-left",
    right: "character-hair-red-curly-right",
  },

  // WAVY

  {
    id: "brown-wavy",
    name: "Brown Wavy",

    front: "character-hair-brown-wavy-front",
    back: "character-hair-brown-wavy-back",
    left: "character-hair-brown-wavy-left",
    right: "character-hair-brown-wavy-right",
  },

  {
    id: "black-wavy",
    name: "Black Wavy",

    front: "character-hair-black-wavy-front",
    back: "character-hair-black-wavy-back",
    left: "character-hair-black-wavy-left",
    right: "character-hair-black-wavy-right",
  },

  {
    id: "blonde-wavy",
    name: "Blonde Wavy",

    front: "character-hair-blonde-wavy-front",
    back: "character-hair-blonde-wavy-back",
    left: "character-hair-blonde-wavy-left",
    right: "character-hair-blonde-wavy-right",
  },

  {
    id: "red-wavy",
    name: "Red Wavy",

    front: "character-hair-red-wavy-front",
    back: "character-hair-red-wavy-back",
    left: "character-hair-red-wavy-left",
    right: "character-hair-red-wavy-right",
  },

  // AFRO

  {
    id: "brown-afro",
    name: "Brown Afro",

    front: "character-hair-brown-afro-front",
    back: "character-hair-brown-afro-back",
    left: "character-hair-brown-afro-left",
    right: "character-hair-brown-afro-right",
  },

  {
    id: "black-afro",
    name: "Black Afro",

    front: "character-hair-black-afro-front",
    back: "character-hair-black-afro-back",
    left: "character-hair-black-afro-left",
    right: "character-hair-black-afro-right",
  },

  {
    id: "blonde-afro",
    name: "Blonde Afro",

    front: "character-hair-blonde-afro-front",
    back: "character-hair-blonde-afro-back",
    left: "character-hair-blonde-afro-left",
    right: "character-hair-blonde-afro-right",
  },

  {
    id: "red-afro",
    name: "Red Afro",

    front: "character-hair-red-afro-front",
    back: "character-hair-red-afro-back",
    left: "character-hair-red-afro-left",
    right: "character-hair-red-afro-right",
  },

  // FEMALE STRAIGHT

  {
    id: "brown-female-straight",
    name: "Brown Female Straight",

    front: "character-hair-brown-female-straight-front",
    back: "character-hair-brown-female-straight-back",
    left: "character-hair-brown-female-straight-left",
    right: "character-hair-brown-female-straight-right",
  },

  {
    id: "black-female-straight",
    name: "Black Female Straight",

    front: "character-hair-black-female-straight-front",
    back: "character-hair-black-female-straight-back",
    left: "character-hair-black-female-straight-left",
    right: "character-hair-black-female-straight-right",
  },

  {
    id: "blonde-female-straight",
    name: "Blonde Female Straight",

    front: "character-hair-blonde-female-straight-front",
    back: "character-hair-blonde-female-straight-back",
    left: "character-hair-blonde-female-straight-left",
    right: "character-hair-blonde-female-straight-right",
  },

  {
    id: "red-female-straight",
    name: "Red Female Straight",

    front: "character-hair-red-female-straight-front",
    back: "character-hair-red-female-straight-back",
    left: "character-hair-red-female-straight-left",
    right: "character-hair-red-female-straight-right",
  },

  // FEMALE GOATED HAIR

  {
    id: "brown-female-goated-hair",
    name: "Brown Female goated-hair",

    front: "character-hair-brown-female-goated-hair-front",
    back: "character-hair-brown-female-goated-hair-back",
    left: "character-hair-brown-female-goated-hair-left",
    right: "character-hair-brown-female-goated-hair-right",
  },

  {
    id: "black-female-goated-hair",
    name: "Black Female goated-hair",

    front: "character-hair-black-female-goated-hair-front",
    back: "character-hair-black-female-goated-hair-back",
    left: "character-hair-black-female-goated-hair-left",
    right: "character-hair-black-female-goated-hair-right",
  },

  {
    id: "blonde-female-goated-hair",
    name: "Blonde Female goated-hair",

    front: "character-hair-blonde-female-goated-hair-front",
    back: "character-hair-blonde-female-goated-hair-back",
    left: "character-hair-blonde-female-goated-hair-left",
    right: "character-hair-blonde-female-goated-hair-right",
  },

  {
    id: "red-female-goated-hair",
    name: "Red Female goated-hair",

    front: "character-hair-red-female-goated-hair-front",
    back: "character-hair-red-female-goated-hair-back",
    left: "character-hair-red-female-goated-hair-left",
    right: "character-hair-red-female-goated-hair-right",
  },
];

// SKIN

export const CHARACTER_SKINS: CharacterSpritePart[] = [
  {
    id: "human-white",
    name: "White",

    front: "character-skin-human-white-front",
    back: "character-skin-human-white-back",
    left: "character-skin-human-white-left",
    right: "character-skin-human-white-right",
  },

  {
    id: "human-black",
    name: "Black",

    front: "character-skin-human-black-front",
    back: "character-skin-human-black-back",
    left: "character-skin-human-black-left",
    right: "character-skin-human-black-right",
  },
];

// BODY

export const CHARACTER_BODIES: CharacterSpritePart[] = [
  {
    id: "human-green-tunic",
    name: "Green Tunic",

    front: "character-body-human-green-tunic-front",
    back: "character-body-human-green-tunic-back",
    left: "character-body-human-green-tunic-left",
    right: "character-body-human-green-tunic-right",
  },
];

// CAPES

export const CHARACTER_CAPES: CharacterCape[] = [
  {
    id: "human-white-red",
    name: "White & Red Cape",

    front: {
      top: "character-cape-human-white-red-top",
      bottom: "character-cape-human-white-red-bottom",
    },

    back: "character-cape-human-white-red-back",
    left: "character-cape-human-white-red-left",
    right: "character-cape-human-white-red-right",
  },
];
