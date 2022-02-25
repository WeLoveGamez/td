export interface Map {
    field: FieldDiv[]
    name: string
    creator: string
}

export type Field = [FieldDiv[]]

export interface FieldDiv {
    color: string
    type: TileOption['type']
    indices: Vector
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
    distanceTravelled: number
}

export interface Tower {
    atk: number
    atkspeed: number
    atkrdy: boolean
    range: number
    price: number
    color: string
    type: 'sniper' | 'ballista' | 'laser'
    indices: Vector
    target: string | null
    filter: 'first' | 'last' | 'closest' | 'mostHealthy' | 'mostWounded' | 'slowest' | 'fastest'
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
    type: 'sniper' | 'ballista' | 'laser'
}

export type Vector = [number, number]
