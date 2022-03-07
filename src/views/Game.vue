<template>
    <div id="game" style="height: 100vh; position: relative" @click="selectedTileIndices = null">
        <!-- <Navbar></Navbar> -->
        <div class="flex-1">
            <div class="d-flex justify-content-around">
                <div>gold: {{ Math.round(player.gold) }}</div>
                <div>HP: {{ player.hp }}</div>
                <div>wave: {{ wave }}</div>
            </div>

            <div class="d-flex justify-content-center mt-3">
                <div class="offsetRow" v-for="(row, xIndex) in field" :key="JSON.stringify(row)">
                    <div v-for="(hex, yIndex) in row" :key="hex.indices.join('|')" @click.stop="selectedTileIndices = [xIndex, yIndex]">
                        <div
                            v-if="field[xIndex][yIndex].tower"
                            :style="{
                                '--range': hex.tower?.range + 'px',
                                '--color': hex.tower?.color,
                            }"
                            class="hex attackrange"
                            :id="xIndex + '|' + yIndex + ''"
                            tabindex="0"
                        >
                            <Teleport to="#polylineContainer">
                                <polyline
                                    v-if="hex.tower?.target"
                                    :points="`${getPosition(xIndex, yIndex).join(', ')} ${getEnemyPosition(hex.tower.target)?.join(', ')}`"
                                    fill="none"
                                    stroke="red"
                                />
                                <circle
                                    v-if="selectedTile"
                                    :cx="getPosition(xIndex, yIndex)[0]"
                                    :cy="getPosition(xIndex, yIndex)[1]"
                                    :r="hex.tower?.range"
                                    fill="rgba(255, 0, 30, 0.13)"
                                    :stroke="hex.tower?.color"
                                />
                            </Teleport>
                        </div>
                        <div v-else class="hex" :class="hex.type" :id="xIndex + '|' + yIndex + ''" tabindex="0"></div>
                    </div>
                </div>
            </div>
            <div id="shop" class="d-flex justify-content-center my-3">
                <div v-for="option in towerOptions" :key="option.type" class="mx-4">
                    <div
                        v-if="selectedTile?.type == 'grass'"
                        @click.stop="buildTower(selectedTileIndices!, option)"
                        :style="{
                            backgroundColor: option.color,
                        }"
                    >
                        <div class="card text-dark">
                            <div class="card card-header">{{ option.type }}</div>
                            <div class="card card-body">
                                <div class="hex mx-auto" :style="{ '--color': option.color }"></div>
                                <div>price:{{ tower([0, 0], option).price }}</div>
                                <div>range:{{ tower([0, 0], option).range }}</div>
                                <div>attackspeed:{{ tower([0, 0], option).atkspeed }}</div>
                                <div>atk:{{ tower([0, 0], option).atk }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center" style="position: absolute; bottom: 0; width: 100%">
                <div class="button" :disabled="gameStarted" @click="reset()">reset</div>
                <div class="button" :disabled="gameStarted" @click="testSetup()">setup</div>
                <div class="button" :disabled="gameStarted" @click="gameLoop()">step</div>
                <div class="button" @click="gameStarted = !gameStarted">
                    {{ gameStarted ? 'pause' : 'play' }}
                </div>
            </div>
        </div>

        <svg id="polylineContainer" style="position: absolute; left: 0; top: 0; pointer-events: none; width: 100%; height: 100%">
            <!-- enemy  -->
            <circle v-for="enemy of enemies" :key="JSON.stringify(enemy)" :cx="enemy.cords[0]" :cy="enemy.cords[1]" :r="enemy.size / 2" fill="blue" />

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
                :points="`${enemy.cords[0] - enemy.size},${enemy.cords[1] - enemy.size} ${enemy.cords[0] - enemy.size + (enemy.size * 2 * enemy.HP) / enemy.maxHP},${
                    enemy.cords[1] - enemy.size
                }`"
                fill="none"
                stroke="red"
                stroke-width="3px"
            />
            <!--  -->
        </svg>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as type from '@/types'
import { add, subtract, multiply, length, percent, lengthSquared, divide } from '@/calc'
// import Navbar from '@/components/Navbar.vue'

export default defineComponent({
    // components: { Navbar },
    setup() {
        return { percent, add }
    },
    data() {
        return {
            player: {
                gold: 100,
                hp: 10,
            } as type.Player,

            hexagonSize: 50,
            fieldWidth: 50,
            fieldHeight: 20,
            field: [] as unknown as type.Field,

            counter: 0,

            path: [] as type.FieldDiv[],

            enemies: [] as type.Enemy[],

            gameStarted: false,
            gamelooptick: 0,
            wave: 0,
            nextWaveSpawning: false,

            selectedTileIndices: null as type.Vector | null,

            shopSize: 20,
            shopPosition: {
                left: 0,
                top: 0,
                position: [0, 0] as type.Vector,
            },

            towerOptions: [
                { color: '0, 50%, 60%', type: 'sniper' },
                { color: '244, 50%, 60%', type: 'ballista' },
                { color: '303, 50%, 60%', type: 'laser' },
            ] as type.TowerOption[],
        }
    },
    mounted() {
        this.createField()
        this.startGame()
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
    },
    methods: {
        //reset
        reset() {
            this.gameStarted = false
            this.gamelooptick = 0
            this.wave = 0
            this.field = [] as unknown as type.Field
            this.enemies = []
            this.path = []
            this.createField()
        },
        //map
        createField() {
            this.field = [] as unknown as type.Field
            for (let row = 0; row < this.fieldWidth; row++) {
                let fieldRow = [] as type.FieldDiv[]
                for (let hex = 0; hex < this.fieldHeight; hex++) {
                    fieldRow.push({
                        color: '135, 50%, 60%',
                        type: 'grass',
                        indices: [row, hex],
                    })
                }
                this.field.push(fieldRow)
            }
            this.generatePath('basic')
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
                        pointerNeighbours = this.findNeighbourFields(x, y, 'grass') //get all near fields of type grass
                        for (let neighbour of pointerNeighbours) {
                            let cords = neighbour.indices
                            let neighboursPaths = this.findNeighbourFields(cords[0], cords[1], 'path')

                            if (neighboursPaths.length == 1) validPointerNeighbours.push(neighbour)
                        }
                        if (validPointerNeighbours.length == 0) break
                        let random = this.getRandomInt(validPointerNeighbours.length - 1)
                        let nextPath = validPointerNeighbours[random]
                        let nextCords = nextPath.indices
                        this.field[nextCords[0]][nextCords[1]] = this.pathfield(nextCords, false, false)
                        this.path.push(this.pathfield(nextCords, false, false))
                        ;[x, y] = nextCords
                    }
            }
        },
        clearPath() {
            this.path = []
            this.field.forEach((row, x) =>
                row.forEach((hex, y) => {
                    if (hex.type == 'path') this.field[x][y] = { indices: hex.indices, type: 'grass', color: '135, 50%, 60%' }
                })
            )
        },
        findNeighbourFields(x: number, y: number, type: string) {
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
                if (!(targetX < 0 || targetY < 0 || targetX > this.fieldWidth - 1 || targetY > this.fieldHeight - 1) && this.field[targetX][targetY].type == type)
                    found.push(this.field[targetX][targetY])
            }
            return found
        },
        //game
        startGame() {
            setInterval(() => {
                if (this.gameStarted) {
                    this.gameLoop()
                }
            }, 1000 / 60)
        },
        gameLoop() {
            this.checkEntities()
            this.movement()
            this.towerAction()
            this.gamelooptick++
        },
        testSetup() {
            this.clearPath()
            this.wave = 100
            for (let i = 0; i < this.fieldWidth; i++) {
                this.field[i][7] = this.pathfield([i, 7], false, false)
                this.path.push(this.pathfield([i, 7], false, false))
            }
            for (let i = 0; i < this.fieldWidth; i++) {
                this.buildTower([i, 8], this.towerOptions[2])
            }
            for (let i = 0; i < this.fieldWidth; i++) {
                this.buildTower([i, 6], this.towerOptions[2])
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
            this.getTowerTargets()
            this.towerAttack()
        },
        //enemy
        spawnWave() {
            if (this.nextWaveSpawning == true) return
            this.nextWaveSpawning = true
            this.wave++
            let enemies = 0
            let interval = setInterval(() => {
                this.createEnemy()
                enemies++
                if (enemies == this.wave) {
                    clearInterval(interval)
                    this.nextWaveSpawning = false
                }
            }, 5)
        },
        createEnemy() {
            let enemy = {
                cords: this.getPosition(...this.path[0].indices),
                id: JSON.stringify(Math.random()),
                maxHP: 100 * this.wave ** 0.5,
                HP: 100 * this.wave ** 0.5,
                size: 16,
                nextPathNumber: 1,
                speed: 1.5,
                distanceTravelled: 0,
            } as type.Enemy
            this.enemies.push(enemy)
        },
        checkEnemyLife() {
            this.player.gold += this.enemies.filter(e => e.HP <= 0).reduce((a, c) => a + c.maxHP / 10, 0)
            this.enemies = this.enemies.filter(e => e.HP > 0)

            if (this.enemies.length == 0) {
                this.spawnWave()
            }
        },
        moveEnemy() {
            for (let enemy of this.enemies) {
                if (enemy.nextPathNumber < this.path.length) {
                    let targetPosition = this.getPosition(...this.path[enemy.nextPathNumber].indices)
                    let movement = subtract(targetPosition, enemy.cords)
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
        //tower
        buildTower(position: type.Vector, tower: type.TowerOption) {
            this.selectedTileIndices = null
            if (!tower) return
            let newTower = this.tower([position[0], position[1]], tower)
            this.field[position[0]][position[1]].tower = newTower
            this.player.gold -= newTower.price
        },
        tower(indices: type.Vector, tower: type.TowerOption): type.Tower {
            return {
                ...{
                    sniper: {
                        atk: 30,
                        range: 500,
                        atkspeed: 1,
                        price: 20,
                    },
                    ballista: {
                        atk: 15,
                        range: 150,
                        atkspeed: 3,
                        price: 25,
                    },
                    laser: {
                        atk: 5,
                        range: 150,
                        atkspeed: 10,
                        price: 30,
                    },
                }[tower.type],

                atkrdy: true,
                color: tower.color,
                type: tower.type,
                indices: indices,
                target: null,
                filter: 'closest',
            }
        },
        getTowerTargets() {
            for (let t of this.towers) {
                let rect = document.getElementById(`${t.indices[0]}|${t.indices[1]}`)!.getBoundingClientRect()
                let target = this.enemies[0] as type.Enemy | null
                if (!target) return
                let towerposition = this.middlePointRect(rect)
                for (let enemy of this.enemies) {
                    let enemyPosition = subtract(enemy.cords, enemy.size / 2)
                    if (lengthSquared(subtract(towerposition, enemyPosition)) < t.range ** 2) {
                        switch (t.filter as type.Tower['filter']) {
                            default:
                            case 'first': {
                                if (enemy.distanceTravelled > target.distanceTravelled) {
                                    target = enemy
                                }
                                break
                            }
                            case 'last': {
                                if (enemy.distanceTravelled < target.distanceTravelled) {
                                    target = enemy
                                }
                                break
                            }
                            case 'closest': {
                                if (
                                    lengthSquared(subtract(towerposition, enemyPosition)) <
                                    lengthSquared(subtract(towerposition, subtract(target.cords, target.size / 2)))
                                ) {
                                    target = enemy
                                }
                                break
                            }
                            case 'mostHealthy':
                                if (enemy.HP > target.HP) {
                                    target = enemy
                                }
                                break
                            case 'mostWounded':
                                if (enemy.HP < target.HP) {
                                    target = enemy
                                }
                                break
                            case 'slowest':
                                if (enemy.speed < target.speed) {
                                    target = enemy
                                }
                                break
                            case 'fastest':
                                if (enemy.speed > target.speed) {
                                    target = enemy
                                }
                                break
                        }
                        this.field[t.indices[0]][t.indices[1]].tower!.target = target?.id ?? null
                    }
                }
            }
        },
        towerAttack() {
            for (let tower of this.towers.filter(t => this.gamelooptick % (60 / t.atkspeed) == 0)) {
                let Index = this.enemies.findIndex(e => e.id == tower.target)
                if (Index != -1) this.enemies[Index].HP -= tower.atk
                if (this.enemies[Index].HP < 0) this.enemies[Index].HP = 0
            }
        },

        //general
        checkClickedField(xIndex: number, yIndex: number) {
            if (this.field[xIndex][yIndex].type != 'path') {
                return [xIndex, yIndex]
            } else {
                return false
            }
        },
        getPosition(xIndex: number, yIndex: number) {
            let rect = document.getElementById(`${xIndex}|${yIndex}`)!.getBoundingClientRect()
            return this.middlePointRect(rect)
        },
        getEnemyPosition(id: string) {
            let enemy = this.enemies.find(e => e.id == id)
            if (!enemy) return
            return enemy.cords
        },
        checkPrice(price: number) {
            if (price <= this.player.gold) {
                this.player.gold -= price
                return true
            }
            return false
        },
        pathfield(indices: type.Vector, start: boolean, finish: boolean): type.FieldDiv {
            return { color: '39, 50%, 60%', type: 'path', indices: indices, start: start, finish: finish }
        },

        middlePointRect(rect: type.Rect) {
            return [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5] as type.Vector
        },
        collisionsCheck(vector1: type.Vector, vector2: type.Vector, size1: number, size2: number) {
            return length(subtract(vector1, vector2)) < size1 / 2 + size2 / 2
        },
        //rnd
        getRandomInt(max: number) {
            return Math.floor(Math.random() * max)
        },
    },
})
</script>
<style lang="scss" scoped></style>
