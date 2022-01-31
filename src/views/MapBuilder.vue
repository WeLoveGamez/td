<template>
  <div @click="shopShow = false">
    <div class="d-flex mx-5 justify-content-around">
      <div>
        gold:
        <input type="number" v-model="player.gold" />
      </div>
      <div>
        FieldWidth:
        <input type="number" v-model="fieldWidth" max="50" @change="renderField()" />
      </div>
      <div>
        FieldHeight:
        <input type="number" v-model="fieldHeight" max="20" @change="renderField()" />
      </div>
      <div class="d-flex align-items-center justify-content-center">
        <label class="">Auto Generate Path</label>
        <input
          class="btn btn-info mb-1 ms-2"
          type="checkbox"
          @change="
            autoPath = !autoPath;
            generatePath();
          "
        />
      </div>
    </div>
    <div class="row col-12">
      <div class="d-flex flex-column mt-5 p-0" style="width: 7%">
        <ul style="list-style-type: none" class="ms-4 p-0">
          <li class="d-flex">
            <div style="width: 30px; height: 20px; background-color: #555555"></div>
            <p class="ms-3">Path</p>
          </li>
          <li class="d-flex">
            <div style="width: 30px; height: 20px; background-color: green"></div>
            <p class="ms-3">Gras</p>
          </li>
          <li class="d-flex">
            <div style="width: 30px; height: 20px; background-color: blue"></div>
            <p class="ms-3">Water</p>
          </li>
          <li class="d-flex">
            <div style="width: 30px; height: 20px; background-color: rgb(117, 76, 0)"></div>
            <p class="ms-3">Hill</p>
          </li>
          <li class="d-flex">
            <div style="width: 30px; height: 20px; background-color: black"></div>
            <p class="ms-3">Fill</p>
          </li>
          <li class="d-flex">
            <div style="width: 30px; height: 20px; background-color: black"></div>
            <p class="ms-3">Fill</p>
          </li>
        </ul>
      </div>
      <div class="d-flex mt-5" style="width: 93%">
        <div v-for="(row, xIndex) in field" :key="JSON.stringify(row)" :style="{ marginTop: xIndex % 2 == 0 ? `${20}px` : 0 + 'px' }">
          <div
            v-for="(hex, yIndex) in row"
            :key="JSON.stringify(hex)"
            :style="{
              color: hex.color,
              fontSize: `${hexagonSize}px`,
            }"
            class="hex"
            :id="xIndex + '|' + yIndex + ''"
            @click.stop="openBuildMenu(xIndex, yIndex, $event)"
          ></div>
        </div>
      </div>
    </div>
    <div>
      <div v-for="option in Options" :key="option.type">
        <div
          v-if="shopShow"
          @click.stop="changeHex(shopPosition.position[0], shopPosition.position[1], option.type)"
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as type from "@/types";

export default defineComponent({
  data() {
    return {
      //startingConditions
      mouse: {
        vector: [0, 0] as type.Vector,
      },
      player: {
        gold: 100,
      } as type.Player,
      field: [] as unknown as type.Fields,

      hexagonSize: 50,
      fieldWidth: 30,
      fieldHeight: 15,

      autoPath: false,

      //shop
      shopSize: 20,
      shopShow: false,
      shopPosition: {
        left: 0,
        top: 0,
        position: [0, 0] as type.Vector,
      },
      Options: [
        { type: "path", color: "#555555", top: 7, left: -25 },
        { type: "gras", color: "#008000", top: -2, left: 0 },
        { type: "water", color: "#0000FF", top: 7, left: 25 },
        { type: "hill", color: "#754c00", top: 46, left: -25 },
        // { type: "", color: "#00DD00", top: 56, left: 0 },
        // { type: "", color: "#0000FF", top: 46, left: 25 },
      ] as type.ShopOption[],
    };
  },
  async mounted() {
    this.renderField();
  },
  components: {},
  methods: {
    rerenderField(action: "clear" | "pathClear") {
      for (let row = 0; row < this.fieldWidth; row++) {
        let fieldRows = [] as type.FieldDivs[];
        for (let hex = 0; hex < this.fieldHeight; hex++) {
          switch (action) {
            case "clear":
              console.log("test");
              fieldRows.push({
                color: this.Options.find(o => o.type == "gras")!.color,
                type: "gras",
                id: `${row}|${hex}`,
              });
              this.field.push(fieldRows);
              break;
            case "pathClear":
              break;
          }
        }
      }
    },
    renderField() {
      this.field = [] as unknown as type.Fields;
      let type = "";
      let color = "";
      for (let i = 0; i <= this.fieldWidth; i++) {
        let fieldRows = [];
        for (let fieldHeighti = 0; fieldHeighti < this.fieldHeight; fieldHeighti++) {
          type = "empty";
          color = "green";
          fieldRows.push({
            color: color,
            type: type,
            id: `${i}|${fieldHeighti}`,
          });
        }
        this.field.push(fieldRows);
      }
      if (this.autoPath) this.generatePath();
    },
    generatePath() {
      if (!this.autoPath) return;
      let pointer = [0, 7];
      this.field[pointer[0]][pointer[1]] = this.wayField(`${pointer[0]}|${pointer[1]}`);
      while (pointer[0] < this.fieldWidth - 1) {
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
        this.field[pointer[0]][pointer[1]] = this.wayField(`${pointer[0]}|${pointer[1]}`);
      }
      this.field[pointer[0] + 1][pointer[1]] = this.wayField(`${pointer[0]}|${pointer[1]}`);
    },
    clearPath() {
      this.field.forEach(row =>
        row.forEach(hex => {
          if (hex.type == "path") hex = { id: hex.id, type: "gras", color: "#008000" };
        })
      );
    },
    //buildMenu
    openBuildMenu(xIndex: number, yIndex: number, e: any) {
      this.shopShow = true;
      this.mouse.vector = [e.pageX, e.pageY];
      let clickedField = this.checkClickedField(xIndex, yIndex) as type.Vector;
      let rect = document.getElementById(`${clickedField[0]}|${clickedField[1]}`)!.getBoundingClientRect();
      let shopArray = this.middlePointRect(rect);
      shopArray[0] -= this.shopSize / 2 + 3;
      shopArray[1] -= this.hexagonSize - this.shopSize / 2 - 2;
      this.shopPosition.left = shopArray[0];
      this.shopPosition.top = shopArray[1];
      this.shopPosition.position = clickedField;
    },
    //mapEditing
    changeHex(xIndex: number, yIndex: number, type: "path" | "gras" | "water" | "hill") {
      console.log("changeHexType:", { hex: xIndex, yIndex }, { type });
      this.field[xIndex][yIndex].type = type;
      this.field[xIndex][yIndex].color = this.Options.find(o => o.type == type)!.color;
    },
    //clickField
    checkClickedField(xIndex: number, yIndex: number) {
      if (this.checkField(xIndex, yIndex)) {
        return [xIndex, yIndex];
      }
      if (xIndex % 2 != 0) {
        if (this.checkField(xIndex, yIndex - 1)) {
          return [xIndex, yIndex - 1];
        }
        if (this.checkField(xIndex - 1, yIndex - 1)) {
          return [xIndex - 1, yIndex - 1];
        }
      } else {
        if (this.checkField(xIndex - 1, yIndex)) {
          return [xIndex - 1, yIndex];
        }
        if (this.checkField(xIndex, yIndex - 1)) {
          return [xIndex, yIndex - 1];
        }
      }
    },
    checkField(xIndex: number, yIndex: number) {
      if (yIndex < 0) return;
      if (xIndex < 0) return;
      let rect = document.getElementById(`${xIndex}|${yIndex}`)!.getBoundingClientRect();
      if (this.collisionsCheck(this.mouse.vector, this.middlePointRect(rect), 22, 22))
        if (this.field[xIndex][yIndex].type != "path") return [xIndex, yIndex];
      return false;
    },
    //general
    wayField(id: string) {
      return { color: this.Options[0].color, type: "path", id: id };
    },
    middlePointRect(rect: type.Rect) {
      return [rect.left + rect.width * 0.5, rect.top + rect.height * 0.5] as type.Vector;
    },
    middlePointHexagon(enemy: type.Enemy) {
      return [enemy.movement.rect.left + enemy.movement.rect.width * 0.5, enemy.movement.rect.top + enemy.movement.rect.height * 0.5] as type.Vector;
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
  -webkit-transform: rotate(-29deg);
  -moz-transform: rotate(-29deg);
  -o-transform: rotate(-29deg);
  transform: rotate(-29deg);
}
</style>
