<template>
    <div id="game" style="height: 100vh; position: relative" @click.stop="selectedTileIndices = null">
        <div class="d-flex justify-content-center pt-2" style="position: relative; width: 100%">
            <div class="button" @click="reset()">reset</div>
            <div class="button" @click="gameLoop()">step</div>
            <!-- <div class="button" @click="testSetup()">setup</div> -->
            <div class="button" @click="visible = !visible">visibility</div>
            <div class="button" @click="gameStarted = !gameStarted">
                {{ gameStarted ? 'pause' : 'play' }}
            </div>
            <div class="button" @click="autospawn = !autospawn">
                {{ autospawn ? 'autospawn' : 'no autospawn' }}
            </div>
            <div class="button" @click=";(gamelooptick = 0), (waveSpawn = true)">Next Wave</div>
        </div>
        <!-- game -->
        <div>
            <div class="mt-4" v-if="visible">
                <div class="d-flex justify-content-center">
                    <div class="offsetRow" v-for="(row, xIndex) in field" :key="JSON.stringify(row)">
                        <div v-for="(hex, yIndex) in row" :key="hex.indices.join('|')" @click.stop="selectedTileIndices = [xIndex, yIndex]">
                            <div class="hex field" :style="{ '--hex-color': TERRAIN[hex.type].color }" :class="hex.type" :id="xIndex + '|' + yIndex + ''" tabindex="0">
                                <div
                                    class="hex tower"
                                    :style="{ '--hex-color': hex.tower?.color }"
                                    v-if="field[xIndex][yIndex].tower"
                                    :class="hex.tower?.type"
                                    :id="xIndex + '|' + yIndex + ''"
                                    tabindex="0"
                                >
                                    <Teleport to="#polylineContainer"></Teleport>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <svg id="polylineContainer" style="position: absolute; left: 0; top: 0; pointer-events: none; width: 100%; height: 100%">
                <!-- enemy  -->
                <circle v-for="enemy of enemies" :key="JSON.stringify(enemy)" :cx="enemy.cords[0]" :cy="enemy.cords[1]" :r="enemy.size / 2" :fill="enemy.color" />
                <template v-if="visible">
                    <polyline
                        v-for="enemy of enemies"
                        :key="JSON.stringify(enemy)"
                        :points="`${enemy.cords[0] - enemy.size - 1},${enemy.cords[1] - enemy.size} ${enemy.cords[0] + enemy.size + 1},${enemy.cords[1] - enemy.size}`"
                        fill="none"
                        stroke="black"
                        stroke-width="5px"
                    />
                    <polyline
                        v-for="enemy of enemies"
                        :key="JSON.stringify(enemy)"
                        :points="`${enemy.cords[0] - enemy.size},${enemy.cords[1] - enemy.size} ${
                            enemy.cords[0] - enemy.size + (enemy.size * 2 * enemy.HP) / enemy.maxHP
                        },${enemy.cords[1] - enemy.size}`"
                        fill="none"
                        stroke="red"
                        stroke-width="3px"
                    />
                </template>
                <!-- targetLaser -->
                <template v-for="tower of towers" :key="tower.indices">
                    <polyline
                        v-if="tower.target"
                        :points="`${getPosition(tower.indices[0], tower.indices[1]).join(', ')} ${getEnemyPosition(tower.target)?.join(', ')}`"
                        fill="none"
                        stroke="red"
                    />
                </template>
                <circle
                    v-if="selectedTileIndices && selectedTower"
                    :cx="getPosition(selectedTileIndices[0], selectedTileIndices[1])[0]"
                    :cy="getPosition(selectedTileIndices[0], selectedTileIndices[1])[1]"
                    :r="selectedTower.range"
                    fill="rgba(255, 0, 30, 0.13)"
                    :stroke="selectedTower.color"
                />
            </svg>
        </div>
        <!--  -->
        <!-- player´s menu -->
        <div id="playMenu" class="card w-100 shadow-none" style="position: absolute; bottom: 0px; height: 25%">
            <div class="card-body d-flex row col-12">
                <div class="col-1">
                    <div class="m-4">
                        {{ Math.round(player.gold) }}
                        <i class="fas fa-coins" style="color: rgb(214, 188, 38)"></i>
                    </div>
                    <div class="m-4">
                        {{ player.hp }}
                        <i class="fas fa-heart" style="color: rgb(187, 19, 19)"></i>
                    </div>
                    <div class="m-4">
                        {{ wave }}
                        <i class="fas fa-bullseye"></i>
                    </div>
                </div>
                <div class="col-8">
                    <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel" data-bs-interval="false">
                        <div style="position: fixed; margin-bottom: 0px; width: 51%" class="carousel-indicators">
                            <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"></button>
                            <button
                                v-for="index in Math.ceil((Object.values(TOWER_OPTIONS).length - 4) / 4)"
                                :key="JSON.stringify(index)"
                                type="button"
                                data-interval="false"
                                data-bs-target="#carouselExampleIndicators"
                                :data-bs-slide-to="index"
                            ></button>
                        </div>
                        <div class="carousel-inner">
                            <div
                                class="carousel-item"
                                :class="{ active: chunkIndex == 0 }"
                                v-for="(towerChunk, chunkIndex) of Object.values(TOWER_OPTIONS).chunk(4)"
                                :key="chunkIndex"
                            >
                                <div class="row col-12">
                                    <div v-for="towerOption in towerChunk" :key="towerOption.type" class="col-3">
                                        <div @click.stop="buildTower(selectedTileIndices!, towerOption)">
                                            <div id="shop">
                                                <div class="card text-dark">
                                                    <div class="card card-header text-center">{{ towerOption.type }}</div>
                                                    <div class="card card-body">
                                                        <div
                                                            class="hex tower"
                                                            :style="{ '--hex-color': towerOption.color }"
                                                            style="margin-left: 47%"
                                                            :class="towerOption.type"
                                                        ></div>
                                                        <div class="text-center mt-5">hotKey: {{ towerOption.shortcut }}</div>
                                                        <div class="row">
                                                            <div class="col-6">price: {{ towerOption.price }}</div>
                                                            <div class="col-6">range: {{ towerOption.range }}</div>
                                                        </div>
                                                        <div class="row">
                                                            <div class="col-6 text-center p-0">attackspeed:{{ towerOption.atkspeed }}</div>
                                                            <div class="col-6 text-center p-0">atk:{{ towerOption.atk }}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button style="margin-left: -110px" class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button style="margin-right: -90px" class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                    </div>
                </div>
                <div class="d-flex justify-content-center col-3">
                    <div id="towermenu">
                        <div v-if="selectedTower" class="card text-dark">
                            <div class="card card-header text-center">{{ selectedTower.type }}</div>
                            <div class="card card-body pb-1">
                                <div>
                                    <div class="d-flex justify-content-between">
                                        <div class="button w-50 p-1 me-3 d-flex justify-content-center" type="button" @click.stop="sell(selectedTower!)">
                                            sell Tower
                                            <div style="color: rgb(0, 230, 0)">
                                                &nbsp;{{ Math.floor(selectedTower.totalValue / 2) }}
                                                <i class="fas fa-coins"></i>
                                            </div>
                                        </div>
                                        <button
                                            v-if="selectedTower.type !== 'bank'"
                                            class="btn btn-success w-50 ms-2 d-flex justify-content-center"
                                            type="button"
                                            @click.stop="upgrade(selectedTower!, Math.floor(selectedTower!.totalValue*0.3),1.04)"
                                        >
                                            upgrade Tower
                                            <div :style=" {color: player.gold >= Math.floor(selectedTower!.totalValue*0.3) ?  'rgb(0, 230, 0)' :  'rgb(255, 0, 21)'} ">
                                                &nbsp;{{ Math.floor(selectedTower!.totalValue*0.3) }}
                                                <i class="fas fa-coins"></i>
                                            </div>
                                        </button>
                                        <button
                                            v-else
                                            class="btn btn-success w-50 ms-2 d-flex justify-content-center"
                                            type="button"
                                            @click.stop="upgrade(selectedTower!, Math.floor(selectedTower!.totalValue*0.3),0.05)"
                                        >
                                            upgrade Tower
                                            <div :style=" {color: player.gold >= Math.floor(selectedTower!.totalValue*0.3) ?  'rgb(0, 230, 0)' :  'rgb(255, 0, 21)'} ">
                                                &nbsp;{{ Math.floor(selectedTower!.totalValue*0.3) }}
                                                <i class="fas fa-coins"></i>
                                            </div>
                                        </button>
                                    </div>
                                    <div class="row col-12" v-if="selectedTower.type !== 'bank'">
                                        <div class="col-6">dmg/atttack: {{ selectedTower.atk.toFixed(2) }}</div>
                                        <div class="col-6" style="color: rgb(0, 230, 0)">+{{ (selectedTower.atk * 0.04).toFixed(2) }}</div>
                                        <div class="col-6">attacks/s: {{ selectedTower.atkspeed.toFixed(2) }}</div>
                                        <div class="col-6" style="color: rgb(0, 230, 0)">+{{ (selectedTower.atkspeed * 0.04).toFixed(2) }}</div>
                                        <div class="col-6">range: {{ selectedTower.range.toFixed(2) }}</div>
                                        <div class="col-6" style="color: rgb(0, 230, 0)">+{{ (selectedTower.range * 0.04).toFixed(2) }}</div>
                                    </div>
                                    <div class="row col-12" v-else>
                                        <div class="col-6">interest: {{ selectedTower.atk }}%</div>
                                        <div class="col-6" style="color: rgb(0, 230, 0)">+0.05</div>
                                        <div class="col-6">maxInterest: {{ 100 * selectedTower.atk }}</div>
                                    </div>

                                    <div v-if="selectedTower.type !== 'bank'">
                                        <div>dmg dealt: {{ Math.floor(selectedTower.dmgDealt) }}</div>
                                        <div class="d-flex justify-content-center">
                                            target:
                                            <div @click.stop="">
                                                <select v-model="selectedTower.filter">
                                                    <option
                                                        v-for="prop in ['first', 'last', 'closest', 'mostHealthy', 'mostWounded', 'slowest', 'fastest']"
                                                        :key="prop"
                                                        :value="prop"
                                                    >
                                                        {{ prop }}
                                                    </option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <div>gold earned: {{ Math.floor(selectedTower.dmgDealt) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as type from '@/types'
import { TOWER_OPTIONS } from '@/towers'

import { add, subtract, length, lengthSquared, divide } from '@/calc'
import { thisExpression } from '@babel/types'

console.log(type.debug)

declare global {
    interface Array<T> {
        chunk(chunkSize: number): T[][]
    }
}
Object.defineProperty(Array.prototype, 'chunk', {
    value: function (chunkSize: number) {
        var R = []
        for (var i = 0; i < this.length; i += chunkSize) R.push(this.slice(i, i + chunkSize))
        return R
    },
})

const TERRAIN = {
    hill: { atk: 1, atkspeed: 1, range: 1.2, color: 'hsl(93, 22%, 67%)' },
    water: { atk: 1, atkspeed: 1, range: 1, color: 'hsl(202, 50%, 60%)' },
    forest: { atk: 1, atkspeed: 0.8, range: 0.9, color: 'hsl(125, 36%, 35%)' },
    grass: { atk: 1, atkspeed: 1, range: 1, color: 'hsl(135, 50%, 60%)' },
    path: { atk: 0, atkspeed: 0, range: 0, color: 'hsl(39, 50%, 60%) ' },
} as Record<type.TileOption['type'], Pick<type.Tower, 'atk' | 'atkspeed' | 'range'>>
const ENEMIES = {
    red: {
        maxHP: 75,
        HP: 75,
        baseSpeed: 1,
        speed: 1,
    } as type.Enemy,
    orange: {
        maxHP: 200,
        HP: 200,
        baseSpeed: 1,
        speed: 1,
    } as type.Enemy,
    yellow: {
        maxHP: 500,
        HP: 500,
        baseSpeed: 1,
        speed: 1,
    } as type.Enemy,
    green: {
        maxHP: 1000,
        HP: 1000,
        baseSpeed: 1,
        speed: 1,
    } as type.Enemy,
    blue: {
        maxHP: 2000,
        HP: 2000,
        baseSpeed: 1,
        speed: 1,
    } as type.Enemy,
    purple: {
        maxHP: 5000,
        HP: 5000,
        baseSpeed: 1,
        speed: 1,
    } as type.Enemy,
}
export default defineComponent({
    // components: { Navbar },
    setup() {
        return { TOWER_OPTIONS, TERRAIN }
    },
    data() {
        return {
            ticks: 60,
            visible: true,
            player: {
                gold: 100,
                hp: 100,
            } as type.Player,

            hexagonSize: 50,
            fieldWidth: 32,
            fieldHeight: 12,
            field: [] as unknown as type.Field,
            counter: 0,
            path: [] as type.FieldDiv[],
            enemies: [] as type.Enemy[],
            gameStarted: false,
            gamelooptick: 0,
            wave: 0,
            waveSpawn: true,
            autospawn: false,
            spawned: 0,

            selectedTileIndices: null as type.Vector | null,

            bonus: false,

            shopSize: 20,
            shopPosition: {
                left: 0,
                top: 0,
                position: [0, 0] as type.Vector,
            },

            pressedKeys: {} as Record<string, boolean>,
        }
    },
    mounted() {
        this.createField()
        this.startGame()
        document.addEventListener('keyup', e => e.code == 'Space' && (this.gameStarted = !this.gameStarted))
    },
    computed: {
        selectedTile(): type.FieldDiv | null {
            if (!this.selectedTileIndices) return null
            return this.field[this.selectedTileIndices[0]][this.selectedTileIndices[1]]
        },
        towers(): type.Tower[] {
            return this.field
                .flat()
                .filter(f => f.tower)
                .map(e => e.tower!)
        },
        selectedTower(): type.Tower | null {
            return this.selectedTile?.tower ?? null
        },
        banks(): type.Tower[] | null {
            return this.towers.filter(t => t.type == 'bank')
        },
    },
    methods: {
        //reset
        reset() {
            this.gameStarted = false
            this.autospawn = false
            this.gamelooptick = 0
            this.wave = 0
            this.player.gold = 100
            this.player.hp = 100
            this.field = [] as unknown as type.Field
            this.enemies = []
            this.path = []
            this.createField()
        },
        //map
        async createField() {
            this.field = [] as unknown as type.Field
            for (let row = 0; row < this.fieldWidth; row++) {
                let fieldRow = [] as type.FieldDiv[]
                for (let hex = 0; hex < this.fieldHeight; hex++) {
                    let i = this.getRandomInt(50)
                    if (i == 0) {
                        fieldRow.push({
                            color: '#005000',
                            type: 'forest',
                            indices: [row, hex],
                            rect: { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
                        })
                    }
                    if (i == 1 || i == 2) {
                        fieldRow.push({
                            color: '#0000CC',
                            type: 'water',
                            indices: [row, hex],
                            rect: { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
                        })
                    }
                    if (i == 3 || i == 4) {
                        fieldRow.push({
                            color: '#754c00',
                            type: 'hill',
                            indices: [row, hex],
                            rect: { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
                        })
                    }
                    if (i > 4) {
                        fieldRow.push({
                            color: '#008000',
                            type: 'grass',
                            indices: [row, hex],
                            rect: { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
                        })
                    }
                }
                this.field.push(fieldRow)
            }
            await this.generatePath('complex')
            for (let row of this.field) {
                for (let hex of row) {
                    hex.rect = document.getElementById(`${hex.indices[0]}|${hex.indices[1]}`)!.getBoundingClientRect()
                }
            }
        },
        generatePath(type: 'basic' | 'complex') {
            this.clearPath()
            let [x, y] = [0, this.getRandomInt(this.fieldHeight - 1)] as type.Vector
            this.path = [] as type.FieldDiv[]
            this.path.push(this.pathfield([x, y], true, false))
            let pointerNeighbours = []

            switch (type) {
                case 'basic':
                    this.field[x][y] = this.pathfield([x, y], true, false)
                    while (x < this.fieldWidth - 2) {
                        switch (this.getRandomInt(2)) {
                            case 0:
                                if (x % 2 == 0) y++
                                if (y == this.fieldHeight) y--
                                break
                            case 1:
                                if (x % 2 != 0) y--
                                if (y < 0) y++
                                break
                        }
                        x++
                        this.field[x][y] = this.pathfield([x, y], false, false)
                        this.path.push(this.pathfield([x, y], false, false))
                    }

                    this.field[x + 1][y] = this.pathfield([x + 1, y], false, true)
                    this.path.push(this.pathfield([x + 1, y], false, true))
                    break

                case 'complex':
                    this.field[x][y] = this.pathfield([x, y], true, false)
                    while (x < this.fieldWidth - 1) {
                        let validPointerNeighbours = []
                        pointerNeighbours = this.findNeighbourFields(x, y, false) //get all near fields of type grass
                        for (let neighbour of pointerNeighbours) {
                            let cords = neighbour.indices
                            let neighboursPaths = this.findNeighbourFields(cords[0], cords[1], true)
                            //alex dont look
                            if (neighboursPaths.length == 1) {
                                if (x % 2 == 0 && x == neighbour.indices[0]) {
                                    if (neighbour.indices[1] != this.fieldHeight - 1) {
                                        validPointerNeighbours.push(neighbour)
                                    }
                                } else {
                                    if (x % 2 == 1 && x == neighbour.indices[0]) {
                                        if (neighbour.indices[1] != 0) {
                                            validPointerNeighbours.push(neighbour)
                                        }
                                    } else {
                                        validPointerNeighbours.push(neighbour)
                                    }
                                }
                            }
                        }
                        if (validPointerNeighbours.length == 0) break
                        let random = this.getRandomInt(validPointerNeighbours.length - 1)
                        let nextPath = validPointerNeighbours[random]
                        let nextCords = nextPath.indices
                        this.field[nextCords[0]][nextCords[1]] = this.pathfield(nextCords, false, false)
                        this.path.push(this.pathfield(nextCords, false, false))
                        ;[x, y] = nextCords
                    }
                    if (this.path[this.path.length - 1].indices[0] != this.fieldWidth - 1) {
                        console.log('new')
                        this.generatePath('complex')
                    }
                    break
            }
        },
        clearPath() {
            this.path = []
            this.field.forEach((row, x) =>
                row.forEach((hex, y) => {
                    if (hex.type == 'path') this.field[x][y] = { indices: hex.indices, type: 'grass', color: '135, 50%, 60%', rect: hex.rect }
                })
            )
        },
        findNeighbourFields(x: number, y: number, is_path: boolean) {
            let neighbours0 = [
                { dir: 'up', x: 0, y: -1 },
                { dir: 'down', x: 0, y: 1 },
                { dir: 'upright', x: 1, y: 0 },
                { dir: 'downright', x: 1, y: 1 },
                { dir: 'upleft', x: -1, y: 0 },
                { dir: 'downleft', x: -1, y: 1 },
            ]
            let neighbours1 = [
                { dir: 'up', x: 0, y: -1 },
                { dir: 'down', x: 0, y: 1 },
                { dir: 'upright', x: 1, y: -1 },
                { dir: 'downright', x: 1, y: 0 },
                { dir: 'upleft', x: -1, y: -1 },
                { dir: 'downleft', x: -1, y: 0 },
            ]
            let neighbours = []
            neighbours = x % 2 == 0 ? neighbours0 : neighbours1
            let found = []
            for (let neighbour of neighbours) {
                let targetX = x + neighbour.x
                let targetY = y + neighbour.y
                if (!(targetX < 0 || targetY < 0 || targetX > this.fieldWidth - 1 || targetY > this.fieldHeight - 1))
                    if (is_path ? this.field[targetX][targetY].type == 'path' : this.field[targetX][targetY].type != 'path') found.push(this.field[targetX][targetY])
            }
            return found
        },
        testSetup() {
            this.clearPath()
            this.wave = 10000
            let gold = 0
            for (let i = 0; i < this.wave; i++) {
                gold += 10 * i ** 0.5 * i
            }
            this.player.gold = gold
            for (let i = 0; i < this.fieldWidth; i++) {
                this.field[i][7] = this.pathfield([i, 7], false, false)
                this.path.push(this.pathfield([i, 7], false, false))
            }
            for (let i = 0; i < this.fieldWidth; i++) {
                this.buildTower([i, 8], TOWER_OPTIONS['laser'])
            }
            for (let i = 0; i < this.fieldWidth; i++) {
                this.buildTower([i, 6], TOWER_OPTIONS['laser'])
            }
            for (let row of this.field) {
                for (let hex of row) {
                    hex.rect = document.getElementById(`${hex.indices[0]}|${hex.indices[1]}`)!.getBoundingClientRect()
                }
            }
        },
        //game
        startGame() {
            window.onkeyup = (e: any) => {
                this.pressedKeys[e.key] = false
            }
            window.onkeydown = (e: any) => {
                this.pressedKeys[e.key] = true
            }
            setInterval(() => {
                if (this.gameStarted) {
                    this.gameLoop()
                }
                if (this.selectedTile) this.building()
            }, 1000 / this.ticks)
        },
        gameLoop() {
            this.checkEntities()
            this.movement()
            this.towerAction()
            this.spawnWave()
            this.gamelooptick++
        },
        spawnWave() {
            if (!this.waveSpawn) return
            let toSpawn = Math.floor(5 * this.wave ** 0.5)

            if (this.gamelooptick % (this.ticks / this.wave ** 0.5) < 1) {
                let i = this.getRandomInt(this.wave)
                if (i < 5) {
                    this.createEnemy('red')
                    this.spawned++
                }
                if (5 <= i && i < 10) {
                    this.createEnemy('orange')
                    this.spawned += 1.5
                }
                if (10 <= i && i < 20) {
                    this.createEnemy('yellow')
                    this.spawned += 2.5
                }
                if (20 <= i && i < 50) {
                    this.createEnemy('green')
                    this.spawned += 5
                }
                if (50 <= i && i < 100) {
                    this.createEnemy('blue')
                    this.spawned += 10
                }
                if (100 <= i && i < 250) {
                    this.createEnemy('purple')
                    this.spawned += 15
                }
            }

            if (toSpawn <= this.spawned) {
                this.waveSpawn = false
                this.spawned = 0
            }
        },
        building() {
            if (this.selectedTile?.tower == undefined) {
                for (let tower of Object.values(TOWER_OPTIONS)) {
                    if (this.pressedKeys[tower.shortcut]) this.buildTower(this.selectedTileIndices!, tower)
                }
            }
        },
        //controls
        movement() {
            this.moveEnemy()
        },
        checkEntities() {
            this.checkEnemyLife()
        },
        towerAction() {
            for (let t of this.towers.filter(t => this.gamelooptick % (this.ticks / t.atkspeed) < 1)) {
                this.getTowerTarget(t)
                this.towerAttack(t)
            }
        },
        //enemy
        createEnemy(type: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple') {
            let enemy = {
                ...ENEMIES[type],
                cords: this.getPosition(...this.path[0].indices),
                id: JSON.stringify(Math.random()),
                slowduration: 0,
                distanceTravelled: 0,
                size: 16,
                nextPathNumber: 1,
                color: type,
            }
            this.enemies.push(enemy)
        },
        checkEnemyLife() {
            this.player.gold += this.enemies.filter(e => e.HP <= 0).reduce((a, c) => a + c.maxHP / 75, 0)
            this.enemies = this.enemies.filter(e => e.HP > 0)

            if (this.enemies.length == 0 && (this.autospawn || this.waveSpawn)) {
                this.gamelooptick = 0
                this.waveSpawn = true
                this.wave++
                this.bankBonus()
            }
        },
        moveEnemy() {
            for (let enemy of this.enemies) {
                if (enemy.nextPathNumber < this.path.length) {
                    let targetPosition = this.getPosition(...this.path[enemy.nextPathNumber].indices)
                    let movement = subtract(targetPosition, enemy.cords)
                    if (enemy.slowduration > 0) {
                        enemy.slowduration--
                        enemy.speed = 0.4 * enemy.baseSpeed
                    } else {
                        enemy.speed = enemy.baseSpeed
                    }
                    enemy.cords = add(enemy.cords, divide(movement, length(movement) / enemy.speed))
                    enemy.distanceTravelled += length(divide(movement, length(movement) / enemy.speed))
                    if (lengthSquared(subtract(enemy.cords, targetPosition)) < enemy.speed ** 2) {
                        enemy.nextPathNumber++
                    }
                } else {
                    this.survivedEnemy(enemy)
                }
            }
        },
        survivedEnemy(enemy: type.Enemy) {
            this.player.hp--
            this.enemies = this.enemies.filter(e => e !== enemy)
        },
        //utility
        bankBonus() {
            if (this.banks?.length) {
                let output = 0
                let bonus = 0
                bonus = this.player.gold * 0.01
                for (let b of this.banks) {
                    if (bonus > 100 * b.atk) bonus = 100 * b.atk
                    b.dmgDealt += bonus
                    output += bonus
                }
                this.player.gold += output
            }
        },
        //towers
        buildTower(position: type.Vector, tower: type.Tower) {
            if (!tower) return
            if (this.player.gold - TOWER_OPTIONS[tower.type].price < 0) return
            if (!tower.buildingFields.some(f => f == this.field[position[0]][position[1]].type)) return
            let buffs = TERRAIN[this.field[position[0]][position[1]].type]
            let newTower = this.tower([position[0], position[1]], tower)
            newTower.atk *= buffs.atk
            newTower.atkspeed *= buffs.atkspeed
            newTower.range *= buffs.range
            this.field[position[0]][position[1]].tower = newTower
            this.player.gold -= newTower.price
        },
        sell(tower: type.Tower) {
            this.player.gold += Math.floor(tower.totalValue / 2)
            this.field[tower.indices[0]][tower.indices[1]].tower = undefined
        },
        upgrade(tower: type.Tower, upgradeCost: number, statIncrease: number) {
            if (this.player.gold - upgradeCost < 0) return
            if (tower.type !== 'bank') for (let prop of ['atk', 'atkspeed', 'range'] as const) tower[prop] *= statIncrease
            else tower.atk += statIncrease
            tower.level++
            tower.totalValue += upgradeCost
            this.player.gold -= upgradeCost
        },
        tower(indices: type.Vector, tower: type.TowerOption): type.Tower {
            return {
                ...TOWER_OPTIONS[tower.type],
                indices: indices,
                target: null,
                filter: 'first',
                level: 1,
                dmgDealt: 0,
            }
        },
        getTowerTarget(t: type.Tower) {
            let rect = this.field[t.indices[0]][t.indices[1]].rect
            let target = null as type.Enemy | null
            let towerposition = this.middlePointRect(rect)
            for (let enemy of this.enemies.filter(e => e.HP > 0)) {
                let enemyPosition = subtract(enemy.cords, enemy.size / 2)
                if (lengthSquared(subtract(towerposition, enemyPosition)) < t.range ** 2) {
                    switch (t.filter as type.Tower['filter']) {
                        default:
                        case 'first': {
                            if (target == null || enemy.distanceTravelled > target.distanceTravelled) {
                                target = enemy
                            }
                            break
                        }
                        case 'last': {
                            if (target == null || enemy.distanceTravelled < target.distanceTravelled) {
                                target = enemy
                            }
                            break
                        }
                        case 'closest': {
                            if (
                                target == null ||
                                lengthSquared(subtract(towerposition, enemyPosition)) < lengthSquared(subtract(towerposition, subtract(target.cords, target.size / 2)))
                            ) {
                                target = enemy
                            }
                            break
                        }
                        case 'mostHealthy':
                            if (target == null || enemy.HP > target.HP) {
                                target = enemy
                            }
                            break
                        case 'mostWounded':
                            if (target == null || enemy.HP < target.HP) {
                                target = enemy
                            }
                            break
                        case 'slowest':
                            if (target == null || enemy.speed < target.speed) {
                                target = enemy
                            }
                            break
                        case 'fastest':
                            if (target == null || enemy.speed > target.speed) {
                                target = enemy
                            }
                            break
                    }
                }
            }
            this.field[t.indices[0]][t.indices[1]].tower!.target = target?.id ?? null
        },
        towerAttack(tower: type.Tower) {
            let target = this.enemies[this.enemies.findIndex(e => e.id == tower.target)]
            if (target) {
                target.HP -= tower.atk
                tower.dmgDealt += tower.atk

                if (target.HP < 0) target.HP = 0

                if (tower.type == 'canonship') {
                    this.enemies
                        .filter(e => lengthSquared(subtract(e.cords, target.cords)) < 100 ** 2)
                        .forEach(e => {
                            e.HP -= tower.atk * 0.4
                            if (e.HP < 0) e.HP = 0
                        })
                } else if (tower.type == 'freezer') target.slowduration += 45 //duration in ticks'
            }
        },

        //general
        getPosition(xIndex: number, yIndex: number) {
            return this.middlePointRect(this.field[xIndex][yIndex].rect)
        },
        getEnemyPosition(id: string) {
            let enemy = this.enemies.find(e => e.id == id)
            if (!enemy) return
            return enemy.cords
        },
        pathfield(indices: type.Vector, start: boolean, finish: boolean): type.FieldDiv {
            return {
                color: '39, 50%, 60%',
                type: 'path',
                indices: indices,
                start: start,
                finish: finish,
                rect: { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 },
            }
        },

        middlePointRect(rect: type.Rect) {
            return [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5] as type.Vector
        },
        //rnd
        getRandomInt(max: number) {
            return Math.floor(Math.random() * max)
        },
    },
})
</script>
<style lang="scss" scoped>
.card-body {
    border-radius: 0rem !important;
}
</style>
