<template>
    <div style="height: 100vh; position: relative" @click="selectedTileIndices = null">
        <Navbar></Navbar>
        <div class="flex-1">
            <div class="d-flex justify-content-around">
                <div>gold: {{ Math.round(player.gold) }}</div>
                <div>HP: {{ player.hp }}</div>
                <div>wave: {{ wave }}</div>
            </div>

            <div class="d-flex justify-content-center mt-3">
                <div v-for="(row, xIndex) in field" :key="JSON.stringify(row)" :style="{ marginTop: xIndex % 2 == 0 ? `${18}px` : 0 + 'px' }">
                    <div v-for="(hex, yIndex) in row" :key="hex.id" @click.stop="selectedTileIndices = [xIndex, yIndex]">
                        <div
                            v-if="getTower(xIndex, yIndex)"
                            :style="{
                                '--range': getTower(xIndex, yIndex)?.range + 'px',
                                '--color': getTower(xIndex, yIndex)?.color,
                            }"
                            class="hex attackrange"
                            :class="{ active: selectedTileIndices }"
                            :id="xIndex + '|' + yIndex + ''"
                        >
                            <Teleport to="#polylineContainer">
                                <polyline
                                    v-if="getTower(xIndex, yIndex)?.target"
                                    :points="`${getPosition(...getFieldIndices(getTower(xIndex, yIndex)!)).join(', ')} ${getEnemyPosition(getTower(xIndex, yIndex)!.target!)?.join(', ')}`"
                                    fill="none"
                                    stroke="red"
                                />
                            </Teleport>
                        </div>
                        <div
                            v-else
                            :style="{
                                color: hex.color,
                            }"
                            class="hex"
                            :id="xIndex + '|' + yIndex + ''"
                        ></div>
                    </div>
                </div>
                <div
                    v-for="enemy of enemies"
                    :key="JSON.stringify(enemy)"
                    style="position: absolute; background-color: blue; border-radius: 50%"
                    :style="{
                        left: enemy.cords[0] - enemy.size / 2 + 'px',
                        top: enemy.cords[1] - enemy.size / 2 + 'px',
                        height: enemy.size + 'px',
                        width: enemy.size + 'px',
                    }"
                >
                    <Teleport to="#polylineContainer">
                        <!-- enemy hp bar -->
                        <polyline
                            :points="`${enemy.cords[0] - enemy.size},${enemy.cords[1] - enemy.size} ${enemy.cords[0] + enemy.size},${enemy.cords[1] - enemy.size}`"
                            fill="none"
                            stroke="black"
                            stroke-width="3px"
                        />
                        <polyline
                            :points="`${enemy.cords[0] - enemy.size},${enemy.cords[1] - enemy.size} ${
                                enemy.cords[0] - enemy.size + (enemy.size * 2 * enemy.HP) / enemy.maxHP
                            },${enemy.cords[1] - enemy.size}`"
                            fill="none"
                            stroke="red"
                            stroke-width="3px"
                        />
                        <!--  -->
                    </Teleport>
                </div>
            </div>
            <div class="d-flex mx-auto">
                <div v-for="option in towerOptions" :key="option.type">
                    <div v-if="selectedTileIndices">
                        <div
                            v-if="selectedTile?.type == 'grass'"
                            @click.stop="buildTower(selectedTileIndices!, option)"
                            :style="{
                                // left: getPosition(...selectedTileIndices!)[0] + option.left -12 + 'px',
                                // top: getPosition(...selectedTileIndices!)[1] + option.top -37+  'px',
                                // height: shopSize + 'px',
                                // width: shopSize + 'px',
                                backgroundColor: option.color,
                            }"
                        >
                            <div id="shop">
                                <div class="card w-100">
                                    <div class="card card-header"></div>
                                    <div class="card card-body"></div>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="getTower(...selectedTileIndices)"
                            @click.stop="buildTower(selectedTileIndices!, option)"
                            style="position: absolute; border: 2px solid rgb(0, 0, 0); z-index: 1000"
                            :style="{
                                left: getPosition(...selectedTileIndices!)[0] + option.left -12 + 'px',
                                top: getPosition(...selectedTileIndices!)[1] + option.top -37+  'px',
                                height: shopSize + 'px',
                                width: shopSize + 'px',
                                backgroundColor: option.color,
                            }"
                        ></div>
                    </div>
                </div>
            </div>
            <div class="mx-auto">
                <button class="btn btn-primary shadow-none me-1" :disabled="gameStarted" @click="gameLoop()">step</button>
                <button class="btn btn-primary shadow-none me-1" @click="gameStarted = !gameStarted">
                    {{ gameStarted ? 'pause' : 'play' }}
                </button>
            </div>
        </div>

        <svg id="polylineContainer" style="position: absolute; left: 0; top: 0; pointer-events: none; width: 100%; height: 100%"></svg>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as type from '@/types'
import { add, subtract, multiply, length, percent, lengthSquared, divide } from '@/calc'
import Navbar from '@/components/Navbar.vue'

export default defineComponent({
    components: { Navbar },
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
            fieldWidth: 30,
            fieldHeight: 15,
            field: [] as unknown as type.Field,

            counter: 0,

            path: [] as type.FieldDiv[],

            enemies: [] as type.Enemy[],
            towers: [] as type.Tower[],

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
                { color: 'blueviolet', type: '1', top: 7, left: -23 },
                { color: 'darkorange', type: '2', top: 7, left: 27 },
                { color: 'aquamarine', type: '3', top: -2, left: 2 },
                // { type: 'hill', color: '#754c00', top: 46, left: -23 },
                // { type: '', color: '#008000', top: 56, left: 2 },
                // { type: 'grass', color: '#008000', top: 46, left: 27 },
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
    },
    methods: {
        //map
        createField() {
            this.field = [] as unknown as type.Field
            for (let row = 0; row < this.fieldWidth; row++) {
                let fieldRow = [] as type.FieldDiv[]
                for (let hex = 0; hex < this.fieldHeight; hex++) {
                    fieldRow.push({
                        color: '#008000',
                        type: 'grass',
                        id: `${row}|${hex}`,
                    })
                }
                this.field.push(fieldRow)
            }
            this.generatePath('basic')
        },
        generatePath(type: 'basic' | 'complex', clear?: boolean) {
            let pointer = [0, this.getRandomInt(this.fieldHeight - 1)]
            this.path = []
            this.path.push(this.pathfield(`${pointer[0]}|${pointer[1]}`, true, false))
            let pointerNeighbours = []

            switch (type) {
                case 'basic':
                    if (clear !== false) this.clearPath()
                    this.field[pointer[0]][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, true, false)
                    while (pointer[0] < this.fieldWidth - 2) {
                        switch (this.getRandomInt(2)) {
                            case 0:
                                if (pointer[0] % 2 == 0) pointer[1]++
                                if (pointer[1] == this.fieldHeight) pointer[1]--
                                break
                            case 1:
                                if (pointer[0] % 2 != 0) pointer[1]--
                                if (pointer[1] < 0) pointer[1]++
                                break
                        }
                        pointer[0]++
                        this.field[pointer[0]][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, false, false)
                        this.path.push(this.pathfield(`${pointer[0]}|${pointer[1]}`, false, false))
                    }
                    this.field[pointer[0] + 1][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, false, true)
                    this.path.push(this.pathfield(`${pointer[0] + 1}|${pointer[1]}`, false, true))

                    break

                case 'complex':
                    this.clearPath()
                    this.field[pointer[0]][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, true, false)
                    console.log({ field: this.field })
                    while (pointer[0] < this.fieldWidth - 1) {
                        let validPointerNeighbours = []
                        pointerNeighbours = this.findNeighbourFields(pointer[0], pointer[1], 'grass') //get all near fields of type grass
                        console.log({ grass: pointerNeighbours })
                        for (let neighbour of pointerNeighbours) {
                            let cords = this.getFieldIndices(neighbour)
                            let neighboursPaths = this.findNeighbourFields(cords[0], cords[1], 'path')
                            console.log({ cords, path: neighboursPaths })

                            if (neighboursPaths.length == 1) validPointerNeighbours.push(neighbour)
                        }
                        console.log({ validPointerNeighbours })
                        if (validPointerNeighbours.length == 0) break
                        let random = this.getRandomInt(validPointerNeighbours.length - 1)
                        let nextPath = validPointerNeighbours[random]
                        let nextCords = this.getFieldIndices(nextPath)
                        this.field[nextCords[0]][nextCords[1]] = this.pathfield(`${nextCords[0]}|${nextCords[1]}`, false, false)
                        this.path.push(this.pathfield(`${nextCords[0]}|${nextCords[1]}`, false, false))
                        pointer = nextCords
                    }
            }
        },
        applyPath() {
            this.path.forEach(h => {
                this.field[this.getFieldIndices(h)[0]][this.getFieldIndices(h)[1]] = this.pathfield(
                    `${this.getFieldIndices(h)[0]}|${this.getFieldIndices(h)[1]}`,
                    true,
                    false
                )
            })
        },
        clearPath() {
            this.field.forEach(row =>
                row.forEach(hex => {
                    if (hex.type == 'path') hex = { id: hex.id, type: 'grass', color: '#008000' }
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
                console.log({ targetX, targetY })
                if (!(targetX < 0 || targetY < 0 || targetX > this.fieldWidth - 1 || targetY > this.fieldHeight - 1) && this.field[targetX][targetY].type == type)
                    found.push(this.field[targetX][targetY])
                console.log({ x, y, neighbour })
            }
            return found
        },
        getFieldIndices(pathTile: type.FieldDiv | type.Tower): type.Vector {
            return pathTile?.id.split('|').map(n => parseInt(n)) as type.Vector
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
            }, 500)
        },
        createEnemy() {
            let enemy = {
                cords: this.getPosition(...this.getFieldIndices(this.path[0])),
                id: JSON.stringify(Math.random()),
                maxHP: 100 * this.wave ** 0.5,
                HP: 100 * this.wave ** 0.5,
                size: 16,
                nextPathNumber: 1,
                speed: 1.5,
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
                    let targetPosition = this.getPosition(...this.getFieldIndices(this.path[enemy.nextPathNumber]))
                    let movement = subtract(targetPosition, enemy.cords)
                    enemy.cords = add(enemy.cords, divide(movement, length(movement) / enemy.speed))
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
            this.towers.push(this.tower(`${position[0]}|${position[1]}`, tower)!)
            this.player.gold -= this.towers.find(t => t.id == `${position[0]}|${position[1]}`)!.price
        },
        tower(id: string, tower: type.TowerOption): type.Tower {
            return {
                ...{
                    '1': {
                        atk: 10,
                        range: 150,
                        atkspeed: 1,
                        price: 20,
                    },
                    '2': {
                        atk: 10,
                        range: 150,
                        atkspeed: 3,
                        price: 20,
                    },
                    '3': {
                        atk: 10,
                        range: 150,
                        atkspeed: 10,
                        price: 20,
                    },
                }[tower.type],

                atkrdy: true,
                color: tower.color,
                type: tower.type,
                id: id,
                target: null,
            }
        },
        getTowerTargets() {
            for (let t of this.towers) {
                let rect = document.getElementById(t.id)!.getBoundingClientRect()
                let newTarget = this.enemies
                    .sort((a, b) =>
                        lengthSquared(subtract(this.middlePointRect(rect), subtract(a.cords, b.size / 2))) <
                        lengthSquared(subtract(this.middlePointRect(rect), subtract(b.cords, b.size / 2)))
                            ? -1
                            : 1
                    )
                    .filter(enemy => lengthSquared(subtract(this.middlePointRect(rect), subtract(enemy.cords, enemy.size / 2))) < t.range ** 2)[0]
                t.target = newTarget?.id ?? null
            }
        },
        towerAttack() {
            for (let tower of this.towers.filter(t => t.target).filter(t => this.gamelooptick % (60 / t.atkspeed) == 0)) {
                this.enemies.find(e => e.id == tower.target)!.HP -= tower.atk
            }
        },
        //buildMenu
        // openBuildMenu(xIndex: number, yIndex: number) {
        //     let clickedField = this.checkClickedField(xIndex, yIndex) as type.Vector
        //     let shopArray = this.getPosition(...clickedField)
        //     shopArray[0] -= this.shopSize / 2 + 3
        //     shopArray[1] -= this.hexagonSize - this.shopSize / 2 - 2
        //     this.shopPosition.left = shopArray[0]
        //     this.shopPosition.top = shopArray[1]
        //     this.shopPosition.position = clickedField
        // },
        // openTowerMenu(xIndex: number, yIndex: number, e: any) {
        //     // this.upgradingShopShow = true
        //     // let clickedField = this.checkClickedField(xIndex, yIndex) as type.Vector
        // },
        //clickField
        checkClickedField(xIndex: number, yIndex: number) {
            if (this.field[xIndex][yIndex].type != 'path') {
                return [xIndex, yIndex]
            } else {
                return false
            }
        },
        //general
        getTower(x: number, y: number): type.Tower | undefined {
            return this.towers.find(t => this.getFieldIndices(t)[0] == x && this.getFieldIndices(t)[1] == y)
        },
        getPosition(xIndex: number, yIndex: number) {
            let rect = document.getElementById(`${xIndex}|${yIndex}`)!.getBoundingClientRect()
            return this.middlePointRect(rect)
        },
        getEnemyPosition(id: string) {
            let enemy = this.enemies.find(e => e.id == id)
            if (!enemy) return
            return enemy?.cords
        },
        checkPrice(price: number) {
            if (price <= this.player.gold) {
                this.player.gold -= price
                return true
            }
            return false
        },
        pathfield(id: string, start: boolean, finish: boolean): type.FieldDiv {
            return { color: '#555555', type: 'path', id: id, start: start, finish: finish }
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
.hex {
    color: var(--color);
    overflow: hidden;
    position: relative;
    width: 39px;
    margin-left: -3px;
    margin-right: -3px;
    height: 37px;
    font-size: 50px;
    &::before {
        content: '\2B22';
        display: flex;
        -webkit-transform: rotate(-30deg);
        -moz-transform: rotate(-30deg);
        -o-transform: rotate(-30deg);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        position: absolute;
    }
}
.attackrange.active::after {
    content: '';

    width: calc(2 * var(--range));
    height: calc(2 * var(--range));
    position: absolute;
    border-radius: 50%;
    border: 3px solid var(--color);
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    z-index: 2;
}
</style>
