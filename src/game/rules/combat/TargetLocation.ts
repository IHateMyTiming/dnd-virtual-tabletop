export type TargetLocation =
  | "head"
  | "body"
  | "left-arm"
  | "right-arm"
  | "left-leg"
  | "right-leg";

export interface TargetLocationData {
  id: TargetLocation;
  accuracyModifier: number;
}

export const TARGET_LOCATIONS: TargetLocationData[] = [
  {
    id: "head",
    accuracyModifier: -40,
  },
  {
    id: "body",
    accuracyModifier: 0,
  },
  {
    id: "left-arm",
    accuracyModifier: -20,
  },
  {
    id: "right-arm",
    accuracyModifier: -20,
  },
  {
    id: "left-leg",
    accuracyModifier: -25,
  },
  {
    id: "right-leg",
    accuracyModifier: -25,
  },
];

export function getTargetAccuracy(target: TargetLocation): number {
  const location = TARGET_LOCATIONS.find((location) => location.id === target);

  if (!location) {
    return 0;
  }

  return 100 + location.accuracyModifier;
}
