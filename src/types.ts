import { ClientRectObject } from '@popperjs/core'
import type { RAW_TOWER_OPTIONS } from './towers'

export type towerTypes = keyof typeof RAW_TOWER_OPTIONS

export type Map = {
    field: FieldDiv[]
    name: string
    creator: string
}

export type Field = [FieldDiv[]]

export type FieldDiv = {
    color: string
    type: TileOption['type']
    indices: Vector
    tower?: Tower
    start?: boolean
    finish?: boolean
    rect: ClientRectObject
}

export type Enemy = {
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

export type RawTower = {
    atk: number
    atkspeed: number
    range: number
    price: number
    totalValue: number
    color: string
    indices: Vector
    target: string | null
    filter: 'first' | 'last' | 'closest' | 'mostHealthy' | 'mostWounded' | 'slowest' | 'fastest'
    buildingFields: TileOption['type'][]
    level: number
    shortcut: string
    dmgDealt: number
}

export type Tower = RawTower & { type: towerTypes }

export type Player = {
    gold: number
    hp: number
}

export type Rect = {
    left: number
    right: number
    top: number
    bottom: number
    height: number
    width: number
}
export type ShopOption = {
    color: string
}
export type TileOption = ShopOption & {
    type: 'path' | 'water' | 'hill' | 'grass' | 'forest'
}
export type TowerOption = ShopOption & {
    type: towerTypes
}

export type Vector = [number, number]
export type Vector2 = [number, number]

export const five = 5
