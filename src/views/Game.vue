<template>
    <Navbar></Navbar>
    <div @click="shopShow = false" class="flex-1">
        <div>gold: {{ Math.round(player.gold) }}</div>
        <div class="d-flex justify-content-center mt-3">
            <div v-for="(row, xIndex) in field" :key="JSON.stringify(row)" :style="{ marginTop: xIndex % 2 == 0 ? `${20}px` : 0 + 'px' }">
                <div
                    v-for="(hex, yIndex) in row"
                    :key="hex.id"
                    :style="{
                        color: hex.color,
                        fontSize: `${hexagonSize}px`,
                    }"
                    class="hex"
                    :id="xIndex + '|' + yIndex + ''"
                    @click.stop="openBuildMenu(xIndex, yIndex, $event)"
                ></div>
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
        <div v-for="(option, index) in Options" :key="option.type">
            <div
                v-if="shopShow"
                @click.stop="buildTower(shopPosition.position, index + 1)"
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
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import * as API from '@/API'
import * as type from '@/types'
import { add, subtract, multiply, divide, length, percent } from '@/calc'
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
            gameStarted: false,
            gamelooptick: 0,

            shopSize: 20,
            shopShow: false,
            shopPosition: {
                left: 0,
                top: 0,
                position: [0, 0] as type.Vector,
            },

            Options: [
                { type: '1', color: 'blueviolet', top: 7, left: -25 },
                { type: '2', color: 'darkorange', top: 7, left: 25 },
                { type: '3', color: 'aquamarine', top: -2, left: 0 },
                // { type: "hill", color: "#754c00", top: 46, left: -25 },
                // { type: "", color: "#008000", top: 56, left: 0 },
                // { type: "gras", color: "#008000", top: 46, left: 25 },
            ] as type.towerOption[],

            placedTurrets: [] as type.Tower[],
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
                let hex = this.pathfield(`${this.getPathIndeces(h)[0]}|${this.getPathIndeces(h)[1]}`, true, false)
                this.field[this.getPathIndeces(h)[0]][this.getPathIndeces(h)[1]] = hex
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
                if (
                    !(targetX < 0 || targetY < 0 || targetX > this.fieldWidth - 1 || targetY > this.fieldHeight - 1) &&
                    this.field[targetX][targetY].type == type
                )
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
            this.checkEnemyLife
        },
        towerAction() {
            if (this.gamelooptick % 60 == 0) this.towerAttack()
        },
        //enemy
        createEnemy() {
            let enemy = {
                vector: [0, 0],
                maxHP: 100,
                HP: 100,
                size: 20,
                movement: {
                    nextField: 0,
                    fieldVec: [0, 0],
                    moveVec: [] as any as type.Vector,
                    counter: 0,
                    rect: document.getElementById(this.path[0].id)!.getBoundingClientRect() as any as type.Rect,
                },
            } as type.Enemy
            enemy.vector = this.positionEnemeny(enemy)
            this.enemies.push(enemy)
        },
        checkEnemyLife() {
            for (let enemy of [...this.enemies]) {
                if (enemy.HP < 0) {
                    this.enemies = this.enemies.filter(e => e !== enemy)
                    this.player.gold += enemy.maxHP / 10
                    this.createEnemy()
                }
            }
        },
        moveEnemy() {
            for (let enemy of this.enemies) {
                if (enemy.movement.counter < this.fieldWidth) {
                    enemy.movement.nextField = this.field[enemy.movement.counter + 1].findIndex(f => f.type == 'path')
                    enemy.movement.rect = document
                        .getElementById(`${enemy.movement.counter + 1}|${enemy.movement.nextField}`)!
                        .getBoundingClientRect()
                    enemy.movement.fieldVec = this.positionEnemeny(enemy)
                    if (!enemy.movement.moveVec.length) {
                        enemy.movement.moveVec = multiply(subtract(enemy.movement.fieldVec, enemy.vector), 0.05)
                    }
                    enemy.vector = add(enemy.vector, enemy.movement.moveVec)
                    if (length(subtract(enemy.vector, enemy.movement.fieldVec)) < 1) {
                        enemy.movement.counter++
                        enemy.movement.moveVec = [] as any as type.Vector
                    }
                }
            }
        },
        //tower
        buildTower(position: type.Vector, type: string) {
            this.shopShow = false
            this.placedTurrets.push(this.tower(`${position[0]}|${position[1]}`, type))

            // if (!this.checkPrice(20)) return
            // switch (type) {
            //     case 1:
            //         this.field[position[0]][position[1]] = this.tower1(`${position[0]}|${position[1]}`)
            //         break
            //     case 2:
            //         this.field[position[0]][position[1]] = this.tower2(`${position[0]}|${position[1]}`)
            //         break
            //     case 3:
            //         this.field[position[0]][position[1]] = this.tower3(`${position[0]}|${position[1]}`)
            //         break
            // }
        },
        tower(id: string, type: string) {
            switch (type) {
                case '1':
                    return { atk: 10, range: 150, atkspeed: 1, atkrdy: true, price: 20 }
                case '2':
                    return { atk: 10, range: 150, atkspeed: 1, atkrdy: true, price: 20 }
                case '3':
                    return { atk: 10, range: 150, atkspeed: 1, atkrdy: true, price: 20 }
            }
        },
        towerAttack() {
            for (let field of this.field) {
                for (let towerfield of field.filter(f => f.tower)) {
                    let rect = document.getElementById(towerfield.id)!.getBoundingClientRect()
                    this.enemies.sort((a, b) =>
                        length(subtract(this.middlePointRect(rect), subtract(a.vector, b.size / 2))) <
                        length(subtract(this.middlePointRect(rect), subtract(b.vector, b.size / 2)))
                            ? 1
                            : -1
                    )
                    for (let enemy of this.enemies) {
                        if (length(subtract(this.middlePointRect(rect), subtract(enemy.vector, enemy.size / 2))) < towerfield.tower!.range) {
                            enemy.HP -= towerfield.tower!.atk
                            break
                        }
                    }
                }
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
            if (this.collisionsCheck(this.mouse.vector, this.middlePointRect(rect), 22, 22))
                if (this.field[index][index2].type != 'path') return [index, index2]
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
            return [
                enemy.movement.rect.left + enemy.movement.rect.width * 0.5,
                enemy.movement.rect.top + enemy.movement.rect.height * 0.5,
            ] as type.Vector
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
