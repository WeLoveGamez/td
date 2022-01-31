<template>
  <div>gold: {{ Math.round(player.gold) }}</div>
  <div class="d-flex justify-content-center mt-5">
    <div v-for="(fieldDivWidth, index) in fields" :key="fieldDivWidth" :style="{ marginTop: index % 2 == 0 ? `${20}px` : 0 + 'px' }">
      <div
        v-for="(fieldDivHeight, index2) in fieldDivWidth"
        :key="fieldDivHeight"
        :style="{
          color: fieldDivHeight.color,
          fontSize: `${hexagonSize}px`,
        }"
        class="hex"
        :id="index + '|' + index2 + ''"
        @click="openBuildMenu(index, index2, $event)"
      ></div>
    </div>
    <div
      v-for="enemy of enemies"
      :key="enemy"
      style="position: absolute; background-color: blue; border-radius: 50%"
      :style="{
        left: enemy.vector[0] + 'px',
        top: enemy.vector[1] + 'px',
        height: enemy.size * percent(enemy.maxHP - enemy.HP, 'de') + 'px',
        width: enemy.size * percent(enemy.maxHP - enemy.HP, 'de') + 'px',
      }"
    ></div>
  </div>
  <div
    style="background-color: blueviolet; position: absolute"
    :style="{
      left: shop1.left + 'px',
      top: shop1.top + 'px',
      height: shopSize + 'px',
      width: shopSize + 'px',
    }"
    @click="buildTower(shop1.position, 1)"
    v-if="shopShow"
  ></div>
  <div
    style="background-color: darkorange; position: absolute"
    :style="{
      left: shop2.left + 'px',
      top: shop2.top + 'px',
      height: shopSize + 'px',
      width: shopSize + 'px',
    }"
    @click="buildTower(shop2.position, 2)"
    v-if="shopShow"
  ></div>
  <div
    style="background-color: aquamarine; position: absolute"
    :style="{
      left: shop3.left + 'px',
      top: shop3.top + 'px',
      height: shopSize + 'px',
      width: shopSize + 'px',
    }"
    @click="buildTower(shop3.position, 3)"
    v-if="shopShow"
  ></div>
  <button class="btn btn-primary shadow-none me-1" @click="startGame()">gameLoop</button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import * as API from "@/API";
import * as type from "@/types";

export default defineComponent({
  data() {
    return {
      player: {
        gold: 100,
      } as type.Player,
      mouse: {
        vector: [0, 0] as type.Vector,
      },
      hexagonSize: 50,
      fieldWidthAmout: 30,
      fieldHeightAmout: 15,
      fields: [] as unknown as type.Fields,
      fieldHeight: [] as type.FieldDivs[],
      enemies: [] as type.Enemy[],
      gameStarted: false,
      gamelooptick: 0,
      shopSize: 20,
      shopShow: false,
      shop1: {
        left: 0,
        top: 0,
        position: [0, 0],
      },
      shop2: {
        left: 0,
        top: 0,
        position: [0, 0],
      },
      shop3: {
        left: 0,
        top: 0,
        position: [0, 0],
      },
    };
  },
  async mounted() {
    this.createField();
    setInterval(() => {
      if (this.gameStarted) this.gameLoop();
    }, 1000 / 60);
  },
  components: {},
  methods: {
    createField() {
      let type = "";
      let color = "";
      for (let i = 0; i <= this.fieldWidthAmout; i++) {
        this.fieldHeight = [];
        for (let fieldHeighti = 0; fieldHeighti < this.fieldHeightAmout; fieldHeighti++) {
          type = "empty";
          color = "green";
          this.fieldHeight.push({
            color: color,
            type: type,
            id: `${i}|${fieldHeighti}`,
          });
        }
        this.fields.push(this.fieldHeight);
      }
      let pointer = [0, 7];
      this.fields[pointer[0]][pointer[1]] = this.wayField(`${pointer[0]}|${pointer[1]}`);
      while (pointer[0] < this.fieldWidthAmout - 1) {
        switch (this.getRandomInt(2)) {
          case 0:
            if (pointer[0] % 2 == 0) pointer[1]++;
            if (pointer[1] > 14) pointer[1]--;
            break;
          case 1:
            if (pointer[0] % 2 != 0) pointer[1]--;
            if (pointer[1] < 0) pointer[1]++;
            break;
        }
        pointer[0]++;
        this.fields[pointer[0]][pointer[1]] = this.wayField(`${pointer[0]}|${pointer[1]}`);
      }
      this.fields[pointer[0] + 1][pointer[1]] = this.wayField(`${pointer[0]}|${pointer[1]}`);
    },
    gameLoop() {
      this.moveEnemy();
      this.checkEnemyLife();
      if (this.gamelooptick % 60 == 0) this.towerAttack();
      this.gamelooptick++;
    },
    startGame() {
      this.gameStarted = true;
      this.createEnemy();
    },
    //enemy
    createEnemy() {
      let enemy = {
        vector: [428, 422],
        maxHP: 100,
        HP: 100,
        size: 20,
        movement: {
          nextField: 0,
          fieldVec: [0, 0],
          moveVec: [] as any as type.Vector,
          counter: 0,
          rect: document.getElementById(`0|7`)!.getBoundingClientRect() as any as type.Rect,
        },
      } as type.Enemy;
      enemy.vector = this.positionEnemeny(enemy);
      this.enemies.push(enemy);
    },
    checkEnemyLife() {
      for (let enemy of this.enemies) {
        if (enemy.HP < 0) {
          this.enemies.splice(
            this.enemies.findIndex(e => e == enemy),
            1
          );
          this.player.gold += enemy.maxHP / 10;
          this.createEnemy();
        }
      }
    },
    moveEnemy() {
      for (let enemy of this.enemies) {
        if (enemy.movement.counter < this.fieldWidthAmout) {
          enemy.movement.nextField = this.fields[enemy.movement.counter + 1].findIndex((f: any) => f.type == "way");

          enemy.movement.rect = document.getElementById(`${enemy.movement.counter + 1}|${enemy.movement.nextField}`)!.getBoundingClientRect();

          enemy.movement.fieldVec = this.positionEnemeny(enemy);

          if (!enemy.movement.moveVec.length) {
            enemy.movement.moveVec = this.mulVec(this.dirVec(enemy.movement.fieldVec, enemy.vector), 0.05);
          }
          enemy.vector = this.addVec(enemy.vector, enemy.movement.moveVec);

          if (this.lenVec(this.dirVec(enemy.vector, enemy.movement.fieldVec)) < 1) {
            enemy.movement.counter++;
            enemy.movement.moveVec = [] as any as type.Vector;
          }
        }
      }
    },
    //tower
    buildTower(position: type.Vector, type: number) {
      this.shopShow = false;
      if (!this.checkPrice(20)) return;
      switch (type) {
        case 1:
          this.fields[position[0]][position[1]] = this.tower1(`${position[0]}|${position[1]}`);
          break;
        case 2:
          this.fields[position[0]][position[1]] = this.tower2(`${position[0]}|${position[1]}`);
          break;
        case 3:
          this.fields[position[0]][position[1]] = this.tower3(`${position[0]}|${position[1]}`);
          break;
      }
    },

    towerAttack() {
      for (let field of this.fields) {
        for (let tower of field.filter(f => f.type == "tower")) {
          let rect = document.getElementById(tower.id)!.getBoundingClientRect();
          this.enemies.sort((a, b) =>
            this.lenVec(this.subVec(this.middlePointRect(rect), this.subVec(a.vector, b.size / 2))) <
            this.lenVec(this.subVec(this.middlePointRect(rect), this.subVec(b.vector, b.size / 2)))
              ? 1
              : -1
          );
          for (let enemy of this.enemies) {
            if (this.lenVec(this.subVec(this.middlePointRect(rect), this.subVec(enemy.vector, enemy.size / 2))) < tower.tower!.range) {
              enemy.HP -= tower.tower!.atk;
              break;
            }
          }
        }
      }
    },
    //buildMenu
    openBuildMenu(index: number, index2: number, e: any) {
      this.shopShow = true;
      this.mouse.vector = [e.pageX, e.pageY];
      let clickedField = this.checkClickedField(index, index2) as type.Vector;
      let rect = document.getElementById(`${clickedField[0]}|${clickedField[1]}`)!.getBoundingClientRect();
      let shopArray = this.middlePointRect(rect);
      shopArray[0] -= this.shopSize / 2 + 2;
      shopArray[1] -= this.hexagonSize - this.shopSize / 2;
      this.shop1.left = shopArray[0] - 25;
      this.shop1.top = shopArray[1] + 10;
      this.shop1.position = clickedField;
      this.shop2.left = shopArray[0];
      this.shop2.top = shopArray[1];
      this.shop2.position = clickedField;
      this.shop3.left = shopArray[0] + 25;
      this.shop3.top = shopArray[1] + 10;
      this.shop3.position = clickedField;
    },
    //clickField
    checkClickedField(index: number, index2: number) {
      if (this.checkField(index, index2)) {
        return [index, index2];
      }
      if (index % 2 != 0) {
        if (this.checkField(index, index2 - 1)) {
          return [index, index2 - 1];
        }
        if (this.checkField(index - 1, index2 - 1)) {
          return [index - 1, index2 - 1];
        }
      } else {
        if (this.checkField(index - 1, index2)) {
          return [index - 1, index2];
        }
        if (this.checkField(index, index2 - 1)) {
          return [index, index2 - 1];
        }
      }
    },
    checkField(index: number, index2: number) {
      if (index2 < 0) return;
      let rect = document.getElementById(`${index}|${index2}`)!.getBoundingClientRect();
      if (this.collisionsCheck(this.mouse.vector, this.middlePointRect(rect), 22, 22))
        if (this.fields[index][index2].type != "way") return [index, index2];
      return false;
    },
    //general
    checkPrice(price: number) {
      if (price <= this.player.gold) {
        this.player.gold -= price;
        return true;
      }
      return false;
    },
    wayField(id: string) {
      return { color: "grey", type: "way", id: id };
    },
    tower1(id: string) {
      return {
        color: "blueviolet",
        type: "tower",
        id: id,
        tower: { atk: 10, range: 150, atkspeed: 1, atkrdy: true },
      };
    },
    tower2(id: string) {
      return {
        color: "darkorange",
        type: "tower",
        id: id,
        tower: { atk: 10, range: 150, atkspeed: 1, atkrdy: true },
      };
    },
    tower3(id: string) {
      return {
        color: "aquamarine",
        type: "tower",
        id: id,
        tower: { atk: 10, range: 150, atkspeed: 1, atkrdy: true },
      };
    },
    middlePointRect(rect: type.Rect) {
      return [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5] as type.Vector;
    },
    middlePointHexagon(enemy: type.Enemy) {
      return [enemy.movement.rect.left + enemy.movement.rect.width * 0.5, enemy.movement.rect.top + enemy.movement.rect.height * 0.5] as type.Vector;
    },
    positionEnemeny(enemy: type.Enemy) {
      return this.subVec(this.middlePointHexagon(enemy), enemy.size * 0.5 + 2);
    },
    percent(number: number, change: "in" | "de") {
      if (change == "in") {
        return (number + 100) / 100;
      }
      if (change == "de") {
        return number < 100 ? (100 - number) / 100 : 0;
      }
      return 1;
    },
    collisionsCheck(vector1: type.Vector, vector2: type.Vector, size1: number, size2: number) {
      return this.lenVec(this.subVec(vector1, vector2)) < size1 / 2 + size2 / 2;
    },
    //rnd
    getRandomInt(max: number) {
      return Math.floor(Math.random() * max);
    },

    //Vector calculate
    addVec(vec1: type.Vector, vec2: type.Vector | number) {
      if (typeof vec2 == "number") {
        return [vec1[0] + vec2, vec1[1] + vec2] as type.Vector;
      } else {
        return [vec1[0] + vec2[0], vec1[1] + vec2[1]] as type.Vector;
      }
    },
    subVec(vec1: type.Vector, vec2: type.Vector | number) {
      if (typeof vec2 == "number") {
        return [vec1[0] - vec2, vec1[1] - vec2] as type.Vector;
      } else {
        return [vec1[0] - vec2[0], vec1[1] - vec2[1]] as type.Vector;
      }
    },
    dirVec(vec1: type.Vector, vec2: type.Vector) {
      let deltaArray = this.subVec(vec1, vec2) as type.Vector;
      return deltaArray;
    },
    mulVec(vec1: type.Vector, vec2: type.Vector | number) {
      if (typeof vec2 == "number") {
        return [vec1[0] * vec2, vec1[1] * vec2] as type.Vector;
      } else {
        return [vec1[0] * vec2[0], vec1[1] * vec2[1]] as type.Vector;
      }
    },
    difVec(vec1: type.Vector, vec2: type.Vector | number) {
      if (typeof vec2 == "number") {
        return [vec1[0] / vec2, vec1[1] / vec2] as type.Vector;
      } else {
        return [vec1[0] / vec2[0], vec1[1] / vec2[1]] as type.Vector;
      }
    },
    lenVec(vec: type.Vector) {
      return Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
    },
  },
});
</script>
<style lang="css" scoped>
.hex::before {
  content: "\2B22";
  display: flex;
  margin-top: -35px;
  margin-left: -5px;
  -webkit-transform: rotate(-30deg);
  -moz-transform: rotate(-30deg);
  -o-transform: rotate(-30deg);
  transform: rotate(-30deg);
}
</style>
