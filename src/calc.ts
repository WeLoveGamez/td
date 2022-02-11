import * as type from "@/types";

//Vector calculate
export function add(vec1: type.Vector, vec2: type.Vector | number): type.Vector {
  if (typeof vec2 == "number") {
    return [vec1[0] + vec2, vec1[1] + vec2] as type.Vector;
  } else {
    return [vec1[0] + vec2[0], vec1[1] + vec2[1]] as type.Vector;
  }
}
export function subtract(vec1: type.Vector, vec2: type.Vector | number): type.Vector {
  if (typeof vec2 == "number") {
    return [vec1[0] - vec2, vec1[1] - vec2] as type.Vector;
  } else {
    return [vec1[0] - vec2[0], vec1[1] - vec2[1]] as type.Vector;
  }
}
export function multiply(vec1: type.Vector, vec2: type.Vector | number): type.Vector {
  if (typeof vec2 == "number") {
    return [vec1[0] * vec2, vec1[1] * vec2] as type.Vector;
  } else {
    return [vec1[0] * vec2[0], vec1[1] * vec2[1]] as type.Vector;
  }
}
export function divide(vec1: type.Vector, vec2: type.Vector | number): type.Vector {
  if (typeof vec2 == "number") {
    return [vec1[0] / vec2, vec1[1] / vec2] as type.Vector;
  } else {
    return [vec1[0] / vec2[0], vec1[1] / vec2[1]] as type.Vector;
  }
}
export function length(vec: type.Vector): number {
  return Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
}
export function percent(number: number, change: "in" | "de"): number {
  if (change == "in") {
    return (number + 100) / 100;
  }
  if (change == "de") {
    return number < 100 ? (100 - number) / 100 : 0;
  }
  return 1;
}
