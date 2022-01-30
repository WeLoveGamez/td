<template>
  <div>gold: {{ Math.round(gold) }}</div>
  <div class="d-flex justify-content-center mt-5">
    <div
      v-for="(fieldDivWidth, index) in fields"
      :key="fieldDivWidth"
      :style="{ marginTop: index % 2 == 0 ? `${20}px` : 0 + 'px' }"
    >
      <div
        v-for="(fieldDivHeight, index2) in fieldDivWidth"
        :key="fieldDivHeight"
        :style="{
          color: fieldDivHeight.color,
          fontSize: `${hexagonSize}px`,
        }"
        class="hex"
        :id="index + '|' + index2 + ''"
        @click="buildTower(index, index2, $event)"
      ></div>
    </div>
    <div
      style="position: absolute; background-color: blue; border-radius: 50%"
      :style="{
        left: enemy.vector[0] + 'px',
        top: enemy.vector[1] + 'px',
        height: enemy.size * percent(enemy.maxHP - enemy.HP, 'de') + 'px',
        width: enemy.size * percent(enemy.maxHP - enemy.HP, 'de') + 'px',
      }"
    ></div>
  </div>
  <button class="btn btn-primary shadow-none me-1" @click="gameStarted = true">
    gameLoop
  </button>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// import * as API from "@/API";
import * as type from "@/types";

export default defineComponent({
  data() {
    return {
      mouse: {
        vector: [0, 0] as type.Vector,
      },
      hexagonSize: 50,
      fieldWidthAmout: 30,
      fieldHeightAmout: 15,
      fields: [] as unknown as type.Fields,
      fieldHeight: [] as type.FieldDivs[],
      enemy: {
        vector: [428, 422],
        maxHP: 100,
        HP: 100,
        size: 20,
        movement: {
          nextField: 0,
          rect: "" as any as type.Rect,
          fieldVec: [0, 0],
          moveVec: [] as any as type.Vector,
          counter: 0,
        },
      } as type.Enemy,
      gameStarted: false,
      gamelooptick: 0,
      gold: 100,
    };
  },
  async mounted() {
    await this.createField();
    this.createEnemy();

    setInterval(() => {
      if (this.gameStarted) this.gameLoop();
    }, 1000 / 60);
  },
  components: {},
  methods: {
    createEnemy() {
      this.enemy.maxHP = 100;
      this.enemy.HP = 100;
      this.enemy.movement.counter = 0;
      this.enemy.movement.rect = "" as any as type.Rect;
      this.enemy.movement.moveVec = [] as any as type.Vector;
      this.enemy.movement.nextField = 0;
      this.enemy.movement.rect = document
        .getElementById(`${this.enemy.movement.counter}|7`)!
        .getBoundingClientRect();
      this.enemy.vector = this.positionEnemeny(this.enemy);
    },

    gameLoop() {
      this.moveEnemy();
      this.checkEnemyLife();
      if (this.gamelooptick % 60 == 0) this.towerAttack();
      this.gamelooptick++;
    },
    checkEnemyLife() {
      if (this.enemy.HP < 0) {
        this.gold += this.enemy.maxHP / 10;
        this.createEnemy();
      }
    },
    createField() {
      let type = "";
      let color = "";
      for (let i = 0; i <= this.fieldWidthAmout; i++) {
        this.fieldHeight = [];
        for (
          let fieldHeighti = 0;
          fieldHeighti < this.fieldHeightAmout;
          fieldHeighti++
        ) {
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
      this.fields[pointer[0]][pointer[1]] = this.wayField(
        `${pointer[0]}|${pointer[1]}`
      );
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
        this.fields[pointer[0]][pointer[1]] = this.wayField(
          `${pointer[0]}|${pointer[1]}`
        );
      }
      this.fields[pointer[0] + 1][pointer[1]] = this.wayField(
        `${pointer[0]}|${pointer[1]}`
      );
    },
    moveEnemy() {
      if (this.enemy.movement.counter < this.fieldWidthAmout) {
        this.enemy.movement.nextField = this.fields[
          this.enemy.movement.counter + 1
        ].findIndex((f: any) => f.type == "way");

        this.enemy.movement.rect = document
          .getElementById(
            `${this.enemy.movement.counter + 1}|${
              this.enemy.movement.nextField
            }`
          )!
          .getBoundingClientRect();

        this.enemy.movement.fieldVec = this.positionEnemeny(this.enemy);

        if (!this.enemy.movement.moveVec.length) {
          this.enemy.movement.moveVec = this.mulVec(
            this.dirVec(this.enemy.movement.fieldVec, this.enemy.vector),
            0.05
          );
        }
        this.enemy.vector = this.addVec(
          this.enemy.vector,
          this.enemy.movement.moveVec
        );

        if (
          this.lenVec(
            this.dirVec(this.enemy.vector, this.enemy.movement.fieldVec)
          ) < 1
        ) {
          this.enemy.movement.counter++;
          this.enemy.movement.moveVec = [] as any as type.Vector;
        }
      }
    },
    towerAttack() {
      for (let field of this.fields) {
        for (let tower of field.filter((f) => f.type == "tower")) {
          let rect = document.getElementById(tower.id)!.getBoundingClientRect();
          if (
            this.lenVec(
              this.subVec(
                this.middlePointRect(rect),
                this.subVec(this.enemy.vector, this.enemy.size / 2)
              )
            ) < 150
          ) {
            console.log(true);
            this.enemy.HP -= 10;
          }
        }
      }
    },
    checkBuildTower(index: number, index2: number) {
      if (index2 < 0) return;
      let rect = document
        .getElementById(`${index}|${index2}`)!
        .getBoundingClientRect();

      if (
        this.collisionsCheck(
          this.mouse.vector,
          this.middlePointRect(rect),
          22,
          22
        )
      )
        if (this.fields[index][index2].type != "way") {
          this.fields[index][index2] = this.towerField(`${index}|${index2}`);
          return true;
        }
      return false;
    },
    checkPrice(price: number) {
      if (price <= this.gold) {
        this.gold -= price;
        return true;
      }
      return false;
    },
    buildTower(index: number, index2: number, e: any) {
      if (!this.checkPrice(20)) return;
      this.mouse.vector = [e.pageX, e.pageY];
      if (this.checkBuildTower(index, index2)) return;
      if (index % 2 != 0) {
        if (this.checkBuildTower(index, index2 - 1)) return;
        if (this.checkBuildTower(index - 1, index2 - 1)) return;
      } else {
        if (this.checkBuildTower(index + 1, index2)) return;
        if (this.checkBuildTower(index - 1, index2)) return;
        if (this.checkBuildTower(index, index2 - 1)) return;
      }
    },
    wayField(id: string) {
      return { color: "grey", type: "way", id: id };
    },
    towerField(id: string) {
      return { color: "blueviolet", type: "tower", id: id };
    },
    middlePointRect(rect: type.Rect) {
      return [
        rect.left + rect.width * 0.5,
        rect.top + rect.height * 0.5,
      ] as type.Vector;
    },
    middlePointHexagon(enemy: type.Enemy) {
      return [
        enemy.movement.rect.left + enemy.movement.rect.width * 0.5,
        enemy.movement.rect.top + enemy.movement.rect.height * 0.5,
      ] as type.Vector;
    },
    positionEnemeny(enemy: type.Enemy) {
      return this.subVec(this.middlePointHexagon(enemy), enemy.size * 0.5 + 2);
    },
    //rnd
    getRandomInt(max: number) {
      return Math.floor(Math.random() * max);
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
    collisionsCheck(
      vector1: type.Vector,
      vector2: type.Vector,
      size1: number,
      size2: number
    ) {
      return this.lenVec(this.subVec(vector1, vector2)) < size1 / 2 + size2 / 2;
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
