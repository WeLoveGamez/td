<template>
    <Navbar></Navbar>
    <div @click="shopShow = false" class="flex-1">
        <div>gold: {{ Math.round(player.gold) }}</div>
        <div>HP: {{ Math.round(player.hp) }}</div>

        <div class="d-flex justify-content-center mt-3">
            <div v-for="(row, xIndex) in field" :key="JSON.stringify(row)" :style="{ marginTop: xIndex % 2 == 0 ? `${20}px` : 0 + 'px' }">
                <div v-for="(hex, yIndex) in row" :key="hex.id" @click.stop="openBuildMenu(xIndex, yIndex, $event)" :style="{ fontSize: `${hexagonSize}px` }">
                    <div
                        v-if="towers.findIndex(t => getPathIndeces(t)[0] == xIndex && getPathIndeces(t)[1] == yIndex) != -1"
                        :style="{
                            color: towers[towers.findIndex(t => getPathIndeces(t)[0] == xIndex && getPathIndeces(t)[1] == yIndex)].color,
                        }"
                        class="hex"
                        :id="xIndex + '|' + yIndex + ''"
                    ></div>
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
                    left: enemy.vector[0] + 'px',
                    top: enemy.vector[1] + 'px',
                    height: enemy.size * percent(enemy.maxHP - enemy.HP, 'de') + 'px',
                    width: enemy.size * percent(enemy.maxHP - enemy.HP, 'de') + 'px',
                }"
            ></div>
        </div>
        <div v-for="option in towerOptions" :key="option.type">
            <div
                v-if="shopShow"
                @click.stop="buildTower(shopPosition.position, option)"
                style="position: absolute; border: 2px solid rgb(0, 0, 0)"
                :style="{
                    left: shopPosition.left + option.left + 'px',
                    top: shopPosition.top + option.top + 'px',
                    height: shopSize + 'px',
                    width: shopSize + 'px',
                    backgroundColor: option.color,
                }"
            ></div>
        </div>
        <button class="btn btn-primary shadow-none me-1" @click="startGame()">gameLoop</button>
    </div>
    <!-- <svg>
        <polyline points="100,100 150,25 " fill="none" stroke="black" />
    </svg> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as type from '@/types'
import { add, subtract, multiply, length, percent } from '@/calc'
import Navbar from '@/components/Navbar.vue'

export default defineComponent({
    components: { Navbar },
    setup() {
        return { percent }
    },
    data() {
        return {
            player: {
                gold: 100,
                hp: 150,
            } as type.Player,
            mouse: {
                vector: [0, 0] as type.Vector,
            },
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

            shopSize: 20,
            shopShow: false,
            shopPosition: {
                left: 0,
                top: 0,
                position: [0, 0] as type.Vector,
            },

            towerOptions: [
                { atk: 10, range: 150, atkspeed: 1, atkrdy: true, price: 20, color: 'blueviolet', type: '1', id: '', top: 7, left: -25 },
                { atk: 10, range: 150, atkspeed: 1, atkrdy: true, price: 20, color: 'darkorange', type: '2', id: '', top: 7, left: 25 },
                { atk: 10, range: 150, atkspeed: 1, atkrdy: true, price: 20, color: 'aquamarine', type: '3', id: '', top: -2, left: 0 },
                // { type: "hill", color: "#754c00", top: 46, left: -25 },
                // { type: "", color: "#008000", top: 56, left: 0 },
                // { type: "gras", color: "#008000", top: 46, left: 25 },
            ] as type.Tower[],
        }
    },
    async mounted() {
        this.createField()
    },
    methods: {
        //map
        createField() {
            this.field = [] as unknown as type.Field
            for (let row = 0; row < this.fieldWidth; row++) {
                let fieldRow = []
                for (let hex = 0; hex < this.fieldHeight; hex++) {
                    fieldRow.push({
                        color: '#008000',
                        type: 'gras',
                        id: `${row}|${hex}`,
                    })
                }
                this.field.push(fieldRow)
            }
            this.generatePath('basic')
        },
        async generatePath(type: 'basic' | 'complex', clear?: boolean) {
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
                    }
                    this.field[pointer[0] + 1][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, false, true)
                    break

                case 'complex':
                    this.clearPath()
                    this.field[pointer[0]][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, true, false)
                    console.log({ field: this.field })
                    while (pointer[0] < this.fieldWidth - 1) {
                        let validPointerNeighbours = []
                        pointerNeighbours = this.findNeighbourFields(pointer[0], pointer[1], 'gras') //get all near fields of type gras
                        console.log({ gras: pointerNeighbours })
                        for (let neighbour of pointerNeighbours) {
                            let cords = this.getPathIndeces(neighbour)
                            let neighboursPaths = this.findNeighbourFields(cords[0], cords[1], 'path')
                            console.log({ cords, path: neighboursPaths })

                            if (neighboursPaths.length == 1) validPointerNeighbours.push(neighbour)
                        }
                        console.log({ validPointerNeighbours })
                        if (validPointerNeighbours.length == 0) break
                        let random = this.getRandomInt(validPointerNeighbours.length - 1)
                        let nextPath = validPointerNeighbours[random]
                        let nextCords = this.getPathIndeces(nextPath)
                        this.field[nextCords[0]][nextCords[1]] = this.pathfield(`${nextCords[0]}|${nextCords[1]}`, false, false)
                        this.path.push(this.pathfield(`${nextCords[0]}|${nextCords[1]}`, false, false))
                        pointer = nextCords
                    }
            }
        },
        applyPath() {
            this.path.forEach(h => {
                this.field[this.getPathIndeces(h)[0]][this.getPathIndeces(h)[1]] = this.pathfield(
                    `${this.getPathIndeces(h)[0]}|${this.getPathIndeces(h)[1]}`,
                    true,
                    false
                )
            })
        },
        clearPath() {
            this.field.forEach(row =>
                row.forEach(hex => {
                    if (hex.type == 'path') hex = { id: hex.id, type: 'gras', color: '#008000' }
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
        getPathIndeces(pathTile: type.FieldDiv): number[] {
            return pathTile?.id.split('|').map(n => parseInt(n))
        },
        //game
        startGame() {
            this.gameStarted = true
            this.gameLoop()
        },
        gameLoop() {
            this.createEnemy()
            if (this.gameStarted) {
                setInterval(() => {
                    this.gamelooptick++
                    this.movement()
                    this.checkEntities()
                    this.towerAction()
                }, 1000 / 60)
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
        createEnemy() {
            let enemy = {
                vector: [0, 0],
                id: JSON.stringify(this.gamelooptick),
                maxHP: 100,
                HP: 100,
                size: 20,
                movement: {
                    nextField: 0,
                    fieldVec: [0, 0],
                    moveVec: [] as unknown as type.Vector,
                    counter: 0,
                    rect: document.getElementById(this.path[0].id)!.getBoundingClientRect() as unknown as type.Rect,
                },
            } as type.Enemy
            enemy.vector = this.positionEnemeny(enemy)
            this.enemies.push(enemy)
        },
        checkEnemyLife() {
            for (let enemy of [...this.enemies]) {
                if (enemy.HP <= 0) {
                    this.enemies = this.enemies.filter(e => e.id !== enemy.id)
                    this.player.gold += enemy.maxHP / 10
                    this.createEnemy()
                }
            }
        },
        moveEnemy() {
            for (let enemy of this.enemies) {
                if (enemy.movement.counter < this.fieldWidth - 1) {
                    enemy.movement.nextField = this.field[enemy.movement.counter + 1].findIndex(f => f.type == 'path')
                    enemy.movement.rect = document.getElementById(`${enemy.movement.counter + 1}|${enemy.movement.nextField}`)!.getBoundingClientRect()
                    enemy.movement.fieldVec = this.positionEnemeny(enemy)
                    if (!enemy.movement.moveVec.length) {
                        enemy.movement.moveVec = multiply(subtract(enemy.movement.fieldVec, enemy.vector), 0.05)
                    }
                    enemy.vector = add(enemy.vector, enemy.movement.moveVec)
                    if (length(subtract(enemy.vector, enemy.movement.fieldVec)) < 1) {
                        enemy.movement.counter++
                        enemy.movement.moveVec = [] as unknown as type.Vector
                    }
                } else {
                    this.survivedEnemy(enemy)
                }
            }
        },
        survivedEnemy(enemy: type.Enemy) {
            this.player.hp -= enemy.HP
            this.enemies.find(e => e == enemy)!.HP = 0
        },
        //tower
        buildTower(position: type.Vector, tower: type.Tower) {
            this.shopShow = false
            if (!tower) return
            this.towers.push(this.tower(`${position[0]}|${position[1]}`, tower)!)
            this.player.gold -= this.towers.find(t => t.id == `${position[0]}|${position[1]}`)!.price
        },
        tower(id: string, tower: type.Tower) {
            switch (tower.type) {
                case '1':
                    return {
                        atk: 10,
                        range: 150,
                        atkspeed: 1,
                        atkrdy: true,
                        price: 20,
                        color: tower.color,
                        type: 'tower',
                        id: id,
                        top: 0,
                        left: 0,
                        target: '',
                    }
                case '2':
                    return {
                        atk: 10,
                        range: 150,
                        atkspeed: 3,
                        atkrdy: true,
                        price: 20,
                        color: tower.color,
                        type: 'tower',
                        id: id,
                        top: 0,
                        left: 0,
                        target: '',
                    }
                case '3':
                    return {
                        atk: 10,
                        range: 150,
                        atkspeed: 10,
                        atkrdy: true,
                        price: 20,
                        color: tower.color,
                        type: 'tower',
                        id: id,
                        top: 0,
                        left: 0,
                        target: '',
                    }
            }
        },
        getTowerTargets() {
            this.towers.forEach(t => {
                let rect = document.getElementById(t.id)!.getBoundingClientRect()
                this.enemies.sort((a, b) =>
                    length(subtract(this.middlePointRect(rect), subtract(a.vector, b.size / 2))) <
                    length(subtract(this.middlePointRect(rect), subtract(b.vector, b.size / 2)))
                        ? 1
                        : -1
                )
                for (let enemy of this.enemies) {
                    if (length(subtract(this.middlePointRect(rect), subtract(enemy.vector, enemy.size / 2))) < t.range) {
                        t.target = JSON.stringify(this.enemies[0].id)
                        break
                    } else {
                        t.target = ''
                    }
                }
            })
        },
        towerAttack() {
            for (let tower of this.towers) {
                if (this.gamelooptick % (60 / tower.atkspeed) !== 0) return
                if (!tower.target || !this.enemies.find(e => e.id == tower.target)) return
                this.enemies.find(e => e.id == tower.target)!.HP -= tower.atk
            }
        },
        //buildMenu
        openBuildMenu(xIndex: number, yIndex: number, e: any) {
            this.shopShow = true
            this.mouse.vector = [e.pageX, e.pageY]
            let clickedField = this.checkClickedField(xIndex, yIndex) as type.Vector
            let rect = document.getElementById(`${clickedField[0]}|${clickedField[1]}`)!.getBoundingClientRect()
            let shopArray = this.middlePointRect(rect)
            shopArray[0] -= this.shopSize / 2 + 3
            shopArray[1] -= this.hexagonSize - this.shopSize / 2 - 2
            this.shopPosition.left = shopArray[0]
            this.shopPosition.top = shopArray[1]
            this.shopPosition.position = clickedField
        },
        //clickField
        checkClickedField(index: number, index2: number) {
            if (this.checkField(index, index2)) {
                return [index, index2]
            }
            if (index % 2 != 0) {
                if (this.checkField(index, index2 - 1)) {
                    return [index, index2 - 1]
                }
                if (this.checkField(index - 1, index2 - 1)) {
                    return [index - 1, index2 - 1]
                }
            } else {
                if (this.checkField(index - 1, index2)) {
                    return [index - 1, index2]
                }
                if (this.checkField(index, index2 - 1)) {
                    return [index, index2 - 1]
                }
            }
        },
        checkField(index: number, index2: number) {
            if (index2 < 0) return
            let rect = document.getElementById(`${index}|${index2}`)!.getBoundingClientRect()
            if (this.collisionsCheck(this.mouse.vector, this.middlePointRect(rect), 22, 22)) if (this.field[index][index2].type != 'path') return [index, index2]
            return false
        },
        //general
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

        // tower2(id: string) {
        //     return {
        //         color: 'darkorange',
        //         type: 'tower',
        //         id: id,
        //         tower: { atk: 10, range: 150, atkspeed: 1, atkrdy: true },
        //     }
        // },
        // tower3(id: string) {
        //     return {
        //         color: 'aquamarine',
        //         type: 'tower',
        //         id: id,
        //         tower: { atk: 10, range: 150, atkspeed: 1, atkrdy: true },
        //     }
        // },
        middlePointRect(rect: type.Rect) {
            return [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5] as type.Vector
        },
        middlePointHexagon(enemy: type.Enemy) {
            return [enemy.movement.rect.left + enemy.movement.rect.width * 0.5, enemy.movement.rect.top + enemy.movement.rect.height * 0.5] as type.Vector
        },
        positionEnemeny(enemy: type.Enemy) {
            return subtract(this.middlePointHexagon(enemy), enemy.size * 0.5 + 2)
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
<style lang="css" scoped>
.hex::before {
    content: '\2B22';
    display: flex;
    margin-top: -35px;
    margin-left: -5px;
    -webkit-transform: rotate(-30deg);
    -moz-transform: rotate(-30deg);
    -o-transform: rotate(-30deg);
    transform: rotate(-30deg);
}
</style>
