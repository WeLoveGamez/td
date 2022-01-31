export interface FieldDivs {
  color: string;
  type: string;
  id: string;
  tower?: Tower;
  pathNumber?: number;
}
export interface Tower {
  atk: number;
  atkspeed: number;
  atkrdy: boolean;
  range: number;
}
export type Fields = [FieldDivs[]];
export type Vector = [number, number];

export interface Enemy {
  size: number;
  vector: Vector;
  maxHP: number;
  HP: number;
  movement: Movement;
}
export interface Player {
  gold: number;
}
export interface Movement {
  nextField: number;
  rect: Rect;
  fieldVec: Vector;
  moveVec: Vector;
  counter: number;
}
export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  height: number;
  width: number;
}
export interface ShopOption {
  type: "path" | "water" | "gras";
  top: number;
  left: number;
  color: string;
}
export interface path {}
