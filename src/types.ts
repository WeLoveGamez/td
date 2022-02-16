export interface Map {
    field: FieldDiv[]
    name: string
    creator: string
}

export type Field = [FieldDiv[]]

export interface FieldDiv {
    color: string
    type: string
    id: string
    tower?: Tower
    start?: boolean
    finish?: boolean
}

export interface Enemy {
    size: number
    vector: Vector
    maxHP: number
    HP: number
    movement: Movement
    id: string
}
export interface Tower {
    atk: number
    atkspeed: number
    atkrdy: boolean
    range: number
    price: number
    color: string
    type: string
    id: string
    top: number
    left: number
    target: string
}
export interface Player {
    gold: number
    hp: number
}
export interface Movement {
    nextField: number
    rect: Rect
    fieldVec: Vector
    moveVec: Vector
    counter: number
}
export interface Rect {
    left: number
    right: number
    top: number
    bottom: number
    height: number
    width: number
}
export interface ShopOption {
    top: number
    left: number
    color: string
}
export interface TileOption extends ShopOption {
    type: 'path' | 'water' | 'hill' | 'grass'
}
export interface towerOption extends ShopOption {
    type: '1' | '2' | '3'
}

export type Vector = [number, number]
