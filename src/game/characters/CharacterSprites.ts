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

export const CHARACTER_HEADS: CharacterSpritePart[] = [
  {
    id: "human-head-white-straight-brown",
    name: "Human White Straight Brown",

    front: "character-head-human-white-brown-straight-front",
    back: "character-head-human-white-brown-straight-back",
    left: "character-head-human-white-brown-straight-left",
    right: "character-head-human-white-brown-straight-right",
  },
];

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

export const CHARACTER_EQUIPMENT: CharacterSpritePart[] = [
  {
    id: "sword",
    name: "Sword",

    front: "character-equipment-sword",
    back: "character-equipment-sword",
    left: "character-equipment-sword",
    right: "character-equipment-sword",
  },
];
