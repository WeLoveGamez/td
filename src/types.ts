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
    cords: Vector
    maxHP: number
    HP: number
    id: string
    nextPathNumber: number
    speed: number
}

export interface Tower {
    atk: number
    atkspeed: number
    atkrdy: boolean
    range: number
    price: number
    color: string
    type: '1' | '2' | '3'
    id: string
    target: string | null
}
export interface Player {
    gold: number
    hp: number
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
export interface TowerOption extends ShopOption {
    type: '1' | '2' | '3'
}

export type Vector = [number, number]
