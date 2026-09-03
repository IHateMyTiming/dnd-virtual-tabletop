import type { CharacterDirection } from "./Character";

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

  top: {
    front: string;
    back: string;
    left: string;
    right: string;
  };

  bottom: {
    front: string;
    back: string;
    left: string;
    right: string;
  };
}

export const CHARACTER_HEADS: CharacterSpritePart[] = [
  {
    id: "human-head-white-brown",
    name: "Human White Brown",
    front: "character-head-human-white-brown",
    back: "character-head-human-white-brown",
    left: "character-head-human-white-brown",
    right: "character-head-human-white-brown",
  },
];

export const CHARACTER_BODIES: CharacterSpritePart[] = [
  {
    id: "human-green-tunic",
    name: "Green Tunic",
    front: "character-body-human-green-tunic",
    back: "character-body-human-green-tunic",
    left: "character-body-human-green-tunic",
    right: "character-body-human-green-tunic",
  },
];

export const CHARACTER_CAPES: CharacterCape[] = [
  {
    id: "human-white-red",
    name: "White & Red Cape",

    top: {
      front: "character-cape-human-white-red-top",
      back: "character-cape-human-white-red-top",
      left: "character-cape-human-white-red-top",
      right: "character-cape-human-white-red-top",
    },

    bottom: {
      front: "character-cape-human-white-red-bottom",
      back: "character-cape-human-white-red-bottom",
      left: "character-cape-human-white-red-bottom",
      right: "character-cape-human-white-red-bottom",
    },
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
