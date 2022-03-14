import { ClientRectObject } from '@popperjs/core'

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
    rect: ClientRectObject
}

export interface Enemy {
    size: number
    cords: Vector
    maxHP: number
    HP: number
    id: string
    nextPathNumber: number
    baseSpeed: number
    speed: number
    distanceTravelled: number
    color: string
    slowduration: number
}

export interface Tower {
    atk: number
    atkspeed: number
    range: number
    price: number
    totalValue: number
    color: string
    type: 'sniper' | 'ballista' | 'laser' | 'canonship' | 'bank' | 'freezer'
    indices: Vector
    target: string | null
    filter: 'first' | 'last' | 'closest' | 'mostHealthy' | 'mostWounded' | 'slowest' | 'fastest'
    buildingFields: TileOption['type'][]
    level: number
    shortcut: string
    dmgDealt: number
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
    color: string
}
export interface TileOption extends ShopOption {
    type: 'path' | 'water' | 'hill' | 'grass' | 'forest'
}
export interface TowerOption extends ShopOption {
    type: 'sniper' | 'ballista' | 'laser' | 'canonship' | 'bank' | 'freezer'
}

export type Vector = [number, number]
