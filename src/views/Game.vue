<template>
    <div style="height: 100vh; position: relative" @click="selectedTileIndices = null">
        <!-- <Navbar></Navbar> -->
        <div class="flex-1">
            <div class="row col-12 py-2">
                <div class="col-1 offset-1">gold:</div>
                <div class="col-3 text-start">
                    {{ Math.round(player.gold) }}
                    <i class="fas fa-coins"></i>
                </div>
                <div class="col-1">HP:</div>
                <div class="col-3 text-start">{{ player.hp }}</div>
                <div class="col-1">wave:</div>
                <div class="col-2 text-start">{{ wave }}</div>
            </div>

            <div class="d-flex justify-content-center">
                <div class="offsetRow" v-for="(row, xIndex) in field" :key="JSON.stringify(row)">
                    <div v-for="(hex, yIndex) in row" :key="hex.indices.join('|')" @click.stop="selectedTileIndices = [xIndex, yIndex]">
                        <div
                            v-if="field[xIndex][yIndex].tower"
                            :style="{
                                '--range': hex.tower?.range + 'px',
                                '--color': hex.tower?.color,
                            }"
                            class="hex"
                            :id="xIndex + '|' + yIndex + ''"
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
                                    fill="none"
                                    :stroke="hex.tower?.color"
                                />
                            </Teleport>
                        </div>
                        <div
                            v-else
                            :style="{
                                '--color': hex.color,
                            }"
                            class="hex"
                            :id="xIndex + '|' + yIndex + ''"
                        ></div>

                        <!-- <div v-else :style="{ backgroundImage: hex.color }" class="hex" :id="xIndex + '|' + yIndex + ''"></div> -->
                    </div>
                </div>
            </div>
            <div v-if="selectedTileIndices && !selectedTower">
                <div class="d-flex justify-content-center my-3">
                    <div v-for="option in TOWER_OPTIONS" :key="option.type">
                        <div v-if="tower([0, 0], option).buildingFields.some(f => f == selectedTile?.type)" @click.stop="buildTower(selectedTileIndices!, option)">
                            <div id="shop">
                                <div class="card w-100 text-dark">
                                    <div class="card card-header p-0">{{ option.type }}</div>
                                    <div class="card card-body py-1 px-3">
                                        <div>hotKey:{{ option.shortcut }}</div>
                                        <div>price:{{ tower([0, 0], option).price }}</div>
                                        <div>range:{{ tower([0, 0], option).range }}</div>
                                        <div>attackspeed:{{ tower([0, 0], option).atkspeed }}</div>
                                        <div>atk:{{ tower([0, 0], option).atk }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="selectedTower" class="d-flex justify-content-center">
                <div id="towermenu">
                    <div class="card text-dark mt-2">
                        <div class="card card-header p-0">{{ selectedTower.type }}</div>
                        <div class="card card-body pb-1">
                            <div>
                                <div class="d-flex justify-content-between">
                                    <button class="btn btn-danger w-50 me-2 d-flex justify-content-center" type="button" @click.stop="sell(selectedTower!)">
                                        sell Tower
                                        <div style="color: rgb(0, 230, 0)">
                                            &nbsp;{{ Math.floor(selectedTower.totalValue / 2) }}
                                            <i class="fas fa-coins"></i>
                                        </div>
                                    </button>
                                    <button
                                        class="btn btn-success w-50 ms-2 d-flex justify-content-center"
                                        type="button"
                                        @click.stop="upgrade(selectedTower!,selectedTower!.totalValue*0.3,1.04)"
                                    >
                                        upgrade Tower
                                        <div style="color: rgb(255, 0, 21)">
                                            &nbsp;{{ Math.floor(selectedTower!.totalValue*0.3) }}
                                            <i class="fas fa-coins"></i>
                                        </div>
                                    </button>
                                </div>
                                <div class="row col-12">
                                    <div class="col-6">dmg/atttack: {{ selectedTower.atk.toFixed(2) }}</div>
                                    <div class="col-6" style="color: rgb(0, 230, 0)">+{{ (selectedTower.atk * 0.04).toFixed(2) }}</div>
                                    <div class="col-6">attacks/s: {{ selectedTower.atkspeed.toFixed(2) }}</div>
                                    <div class="col-6" style="color: rgb(0, 230, 0)">+{{ (selectedTower.atkspeed * 0.04).toFixed(2) }}</div>
                                    <div class="col-6">range: {{ selectedTower.range.toFixed(2) }}</div>
                                    <div class="col-6" style="color: rgb(0, 230, 0)">+{{ (selectedTower.range * 0.04).toFixed(2) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="d-flex justify-content-center" style="position: absolute; bottom: 0; width: 100%">
                <button class="btn btn-primary shadow-none m-2" :disabled="gameStarted" @click="reset()">reset</button>
                <!-- <button class="btn btn-primary shadow-none m-2" :disabled="gameStarted" @click="testSetup()">setup</button> -->
                <button class="btn btn-primary shadow-none m-2" :disabled="gameStarted" @click="gameLoop()">step</button>
                <button class="btn btn-primary shadow-none m-2" @click="gameStarted = !gameStarted">
                    {{ gameStarted ? 'pause' : 'play' }}
                </button>
                <button class="btn btn-primary shadow-none m-2" :disabled="waveSpawn" @click="waveSpawn = true">Next Wave</button>
            </div>
        </div>

        <svg id="polylineContainer" style="position: absolute; left: 0; top: 0; pointer-events: none; width: 100%; height: 100%">
            <!-- enemy  -->
            <circle v-for="enemy of enemies" :key="JSON.stringify(enemy)" :cx="enemy.cords[0]" :cy="enemy.cords[1]" :r="enemy.size / 2" :fill="enemy.color" />

            <polyline
                v-for="enemy of enemies"
                :key="JSON.stringify(enemy)"
                :points="`${enemy.cords[0] - enemy.size},${enemy.cords[1] - enemy.size} ${enemy.cords[0] + enemy.size},${enemy.cords[1] - enemy.size}`"
                fill="none"
                stroke="black"
                stroke-width="3px"
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
import { add, subtract, length, lengthSquared, divide } from '@/calc'
// import Navbar from '@/components/Navbar.vue'

const TOWER_OPTIONS = {
    sniper: {
        atk: 30,
        range: 500,
        atkspeed: 1,
        price: 20,
        totalValue: 20,
        buildingFields: ['forest', 'hill', 'grass'],
        color: '#FF0000',
        type: 'sniper',
        shortcut: '1',
    } as type.Tower,
    ballista: {
        atk: 15,
        range: 150,
        atkspeed: 3,
        price: 25,
        totalValue: 25,
        buildingFields: ['forest', 'hill', 'grass'],
        color: '#00FF00',
        type: 'ballista',
        shortcut: '2',
    } as type.Tower,
    laser: {
        atk: 3,
        range: 150,
        atkspeed: 10,
        price: 30,
        totalValue: 30,
        buildingFields: ['forest', 'hill', 'grass'],
        color: '#AA00FF',
        type: 'laser',
        shortcut: '3',
    } as type.Tower,
    canonship: {
        atk: 15,
        range: 250,
        atkspeed: 2,
        price: 40,
        totalValue: 40,
        buildingFields: ['water'],
        color: '#754c33',
        type: 'canonship',
        shortcut: '4',
    } as type.Tower,
}
const TERRAIN = {
    hill: { atk: 1, atkspeed: 1, range: 1.2 },
    water: { atk: 1, atkspeed: 1, range: 1 },
    forest: { atk: 1, atkspeed: 0.8, range: 0.9 },
    grass: { atk: 1, atkspeed: 1, range: 1 },
} as Record<type.TileOption['type'], Pick<type.Tower, 'atk' | 'atkspeed' | 'range'>>
export default defineComponent({
    // components: { Navbar },
    setup() {
        return { TOWER_OPTIONS }
    },
    data() {
        return {
            player: {
                gold: 100,
                hp: 100,
            } as type.Player,

            hexagonSize: 50,
            fieldWidth: 50,
            fieldHeight: 15,
            field: [] as unknown as type.Field,

            counter: 0,

            path: [] as type.FieldDiv[],

            enemies: [] as type.Enemy[],

            gameStarted: false,
            gamelooptick: 0,
            wave: 1,
            waveSpawn: true,
            spawned: 0,

            selectedTileIndices: null as type.Vector | null,

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
    },
    methods: {
        //reset
        reset() {
            this.gameStarted = false
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
        createField() {
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
                        })
                    }
                    if (i == 1 || i == 2) {
                        fieldRow.push({
                            color: '#0000CC',
                            type: 'water',
                            indices: [row, hex],
                        })
                    }
                    if (i == 3 || i == 4) {
                        fieldRow.push({
                            color: '#754c00',
                            type: 'hill',
                            indices: [row, hex],
                        })
                    }
                    if (i > 4) {
                        fieldRow.push({
                            color: '#008000',
                            type: 'grass',
                            indices: [row, hex],
                        })
                    }
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
                    if (hex.type == 'path') this.field[x][y] = { indices: hex.indices, type: 'grass', color: '#008000' }
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
        testSetup() {
            this.clearPath()
            this.wave = 100
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
            }, 1000 / 60)
        },
        gameLoop() {
            this.gamelooptick++
            this.checkEntities()
            this.movement()
            this.towerAction()
            this.spawnWave()
        },
        spawnWave() {
            if (!this.waveSpawn) return
            let toSpawn = Math.floor(5 * this.wave ** 0.5)

            if (this.gamelooptick % (60 / this.wave ** 0.5) < 1) {
                switch (this.getRandomInt(2)) {
                    case 0:
                        this.createEnemy('blue')
                        this.spawned++
                        break
                    case 1:
                        this.createEnemy('yellow')
                        this.spawned += 1.5
                        break
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
            for (let t of this.towers.filter(t => this.gamelooptick % (60 / t.atkspeed) < 1)) {
                this.getTowerTarget(t)
                this.towerAttack(t)
            }
        },
        //enemy
        createEnemy(type: string) {
            switch (type) {
                case 'blue':
                    {
                        let hp = 75 * this.wave ** 0.5
                        let enemy = {
                            cords: this.getPosition(...this.path[0].indices),
                            id: JSON.stringify(Math.random()),
                            maxHP: hp,
                            HP: hp,
                            size: 16,
                            nextPathNumber: 1,
                            speed: 1.5,
                            distanceTravelled: 0,
                            color: 'blue',
                        } as type.Enemy
                        this.enemies.push(enemy)
                    }
                    break
                case 'yellow':
                    {
                        let hp = 150 * this.wave ** 0.5
                        let enemy = {
                            cords: this.getPosition(...this.path[0].indices),
                            id: JSON.stringify(Math.random()),
                            maxHP: hp,
                            HP: hp,
                            size: 16,
                            nextPathNumber: 1,
                            speed: 0.8,
                            distanceTravelled: 0,
                            color: 'yellow',
                        } as type.Enemy
                        this.enemies.push(enemy)
                    }
                    break
            }
        },
        checkEnemyLife() {
            this.player.gold += this.enemies.filter(e => e.HP <= 0).reduce((a, c) => a + c.maxHP / 10, 0)
            this.enemies = this.enemies.filter(e => e.HP > 0)

            if (this.enemies.length == 0) {
                if (!this.waveSpawn) this.wave++
                this.waveSpawn = true
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
        //towers
        buildTower(position: type.Vector, tower: type.Tower) {
            this.selectedTileIndices = null
            if (!tower) return
            if (this.player.gold - TOWER_OPTIONS[tower.type].price < 0) return
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
            for (let prop of ['atk', 'atkspeed', 'range'] as const) tower[prop] *= statIncrease
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
            }
        },
        getTowerTarget(t: type.Tower) {
            let rect = document.getElementById(`${t.indices[0]}|${t.indices[1]}`)!.getBoundingClientRect()
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
            let Index = this.enemies.findIndex(e => e.id == tower.target)
            if (Index != -1) this.enemies[Index].HP -= tower.atk
            if (Index != -1 && this.enemies[Index].HP < 0) this.enemies[Index].HP = 0
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
            return { color: '#555555', type: 'path', indices: indices, start: start, finish: finish }
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
<style lang="scss" scoped>
$hex-width: 18px;
$hex-height: floor(calc(1.732 * $hex-width));

.offsetRow:nth-child(2n + 1) {
    margin-top: round(calc($hex-width - round(calc($hex-width * 0.1))));
}

.hex {
    color: var(--color);
    position: relative;
    width: $hex-width;
    height: $hex-height;
    background-color: var(--color);
    margin: 2px round(calc(($hex-width/2) / 2) + 1);
}
.hex:before,
.hex:after {
    content: '';
    position: absolute;
    width: 0;
    border-top: floor(calc($hex-height/2)) solid transparent;
    border-bottom: floor(calc($hex-height/2)) solid transparent;
}
.hex:before {
    left: 100%;
    border-left: floor(calc($hex-width/2)) solid var(--color);
}
.hex:after {
    right: 100%;
    width: 0;
    border-right: floor(calc($hex-width/2)) solid var(--color);
}
</style>
