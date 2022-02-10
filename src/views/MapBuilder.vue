<template>
  <Navbar></Navbar>
  <div @click="shopShow = false" class="flex-1">
    <div class="d-flex mx-5 justify-content-around">
      <div>
        gold:
        <input type="number" v-model="player.gold" />
      </div>
      <div>
        FieldWidth:
        <input type="number" v-model="fieldWidth" max="50" min="3" @change="renderField('clear')" />
      </div>
      <div>
        FieldHeight:
        <input type="number" v-model="fieldHeight" max="20" min="3" @change="renderField('clear')" />
      </div>
      <div>
        MinPathLength:
        <input type="number" v-model="pathLength" :max="(fieldHeight * fieldWidth) / 3" min="0" @change="generatePath('complex')" />
      </div>
      <button class="btn btn-info mb-1 ms-2" type="button" @click.stop="generatePath('basic')">Auto generate basic path</button>
      <button class="btn btn-info mb-1 ms-2" type="button" @click.stop="generatePath('complex')">Auto generate complex path</button>
      <button class="btn btn-info mb-1 ms-2" @click.stop="renderField('clear')">clear</button>
      <button class="btn btn-info mb-1 ms-2" @click.stop="renderField('pathClear')">pathClear</button>
      <form @submit.prevent="saveMap()">
        <input type="text" required v-model="mapName" placeholder="mapName" />
        <button class="btn btn-success ms-1" type="submit">save map</button>
      </form>
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
              color: hex?.color,
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
import Navbar from "@/components/Navbar.vue";
import * as type from "@/types";
import * as API from "@/API";

export default defineComponent({
  components: { Navbar },
  data() {
    return {
      //startingConditions
      mouse: {
        vector: [0, 0] as type.Vector,
      },
      player: {
        gold: 100,
      } as type.Player,
      field: [] as unknown as type.Field,

      mapName: "",

      hexagonSize: 50,
      fieldWidth: 30,
      fieldHeight: 15,

      path: [] as type.FieldDiv[],
      pathLength: 30,
      counter: 0,

      generating: false,

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
        // { type: "", color: "#008000", top: -2, left: 0 },
        { type: "water", color: "#0000FF", top: 7, left: 25 },
        { type: "hill", color: "#754c00", top: 46, left: -25 },
        // { type: "", color: "#008000", top: 56, left: 0 },
        { type: "gras", color: "#008000", top: 46, left: 25 },
      ] as type.ShopOption[],
    };
  },
  async mounted() {
    this.renderField("clear");
    this.counter = 0;
  },
  methods: {
    renderField(action: "clear" | "pathClear") {
      switch (action) {
        case "clear":
          this.field = [] as unknown as type.Field;
          for (let row = 0; row < this.fieldWidth; row++) {
            let fieldRow = [];
            for (let hex = 0; hex < this.fieldHeight; hex++) {
              fieldRow.push({
                color: "#008000",
                type: "gras",
                id: `${row}|${hex}`,
              });
            }
            this.field.push(fieldRow);
          }
          break;
        case "pathClear":
          for (let row = 0; row < this.fieldWidth; row++) {
            for (let hex = 0; hex < this.fieldHeight; hex++) {
              if (this.field[row][hex].type == "path") this.field[row][hex] = { id: `${row}|${hex}`, type: "gras", color: "#008000" };
            }
          }
          break;
      }
    },
    massGenerate() {
      for (let i = 0; i < 50; i++) {
        this.generatePath("basic", false);
      }
    },
    async generatePath(type: "basic" | "complex", clear?: boolean) {
      let pointer = [0, this.getRandomInt(this.fieldHeight - 1)];
      this.path = [];
      this.path.push(this.pathfield(`${pointer[0]}|${pointer[1]}`, true, false));
      let pointerNeighbours = [];

      switch (type) {
        case "basic":
          if (clear !== false) this.renderField("pathClear");
          this.field[pointer[0]][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, true, false);
          while (pointer[0] < this.fieldWidth - 2) {
            switch (this.getRandomInt(2)) {
              case 0:
                if (pointer[0] % 2 == 0) pointer[1]++;
                if (pointer[1] == this.fieldHeight) pointer[1]--;
                break;
              case 1:
                if (pointer[0] % 2 != 0) pointer[1]--;
                if (pointer[1] < 0) pointer[1]++;
                break;
            }
            pointer[0]++;
            this.field[pointer[0]][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, false, false);
          }
          this.field[pointer[0] + 1][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, false, true);
          break;

        case "complex":
          this.renderField("pathClear");
          this.field[pointer[0]][pointer[1]] = this.pathfield(`${pointer[0]}|${pointer[1]}`, true, false);
          console.log({ field: this.field });
          while (pointer[0] < this.fieldWidth - 1) {
            let validPointerNeighbours = [];
            pointerNeighbours = this.findNeighbourFields(pointer[0], pointer[1], "gras"); //get all near fields of type gras
            console.log({ gras: pointerNeighbours });
            for (let neighbour of pointerNeighbours) {
              let cords = this.getPathIndeces(neighbour);
              let neighboursPaths = this.findNeighbourFields(cords[0], cords[1], "path");
              console.log({ cords, path: neighboursPaths });

              if (neighboursPaths.length == 1) validPointerNeighbours.push(neighbour);
            }
            console.log({ validPointerNeighbours });
            if (validPointerNeighbours.length == 0) break;
            let random = this.getRandomInt(validPointerNeighbours.length - 1);
            let nextPath = validPointerNeighbours[random];
            let nextCords = this.getPathIndeces(nextPath);
            this.field[nextCords[0]][nextCords[1]] = this.pathfield(`${nextCords[0]}|${nextCords[1]}`, false, false);
            this.path.push(this.pathfield(`${nextCords[0]}|${nextCords[1]}`, false, false));
            pointer = nextCords;
          }
          if (this.path.length < this.pathLength && this.counter < 1000) {
            console.log("newPath");
            this.counter++;
            this.generatePath("complex");
          }
      }
    },
    applyPath() {
      this.path.forEach(h => {
        let hex = this.pathfield(`${this.getPathIndeces(h)[0]}|${this.getPathIndeces(h)[1]}`, true, false);
        this.field[this.getPathIndeces(h)[0]][this.getPathIndeces(h)[1]] = hex;
      });
    },
    findNeighbourFields(x: number, y: number, type: string) {
      let neighbours0 = [
        { dir: "up", x: 0, y: -1 },
        { dir: "down", x: 0, y: 1 },
        { dir: "upright", x: 1, y: 0 },
        { dir: "downright", x: 1, y: 1 },
        { dir: "upleft", x: -1, y: 0 },
        { dir: "downleft", x: -1, y: 1 },
      ];
      let neighbours1 = [
        { dir: "up", x: 0, y: -1 },
        { dir: "down", x: 0, y: 1 },
        { dir: "upright", x: 1, y: -1 },
        { dir: "downright", x: 1, y: 0 },
        { dir: "upleft", x: -1, y: -1 },
        { dir: "downleft", x: -1, y: 0 },
      ];
      let neighbours = [];
      neighbours = x % 2 == 0 ? neighbours0 : neighbours1;
      let found = [];
      for (let neighbour of neighbours) {
        let targetX = x + neighbour.x;
        let targetY = y + neighbour.y;
        console.log({ targetX, targetY });
        if (
          !(targetX < 0 || targetY < 0 || targetX > this.fieldWidth - 1 || targetY > this.fieldHeight - 1) &&
          this.field[targetX][targetY].type == type
        )
          found.push(this.field[targetX][targetY]);
        console.log({ x, y, neighbour });
      }
      return found;
    },
    getPathIndeces(pathTile: type.FieldDiv): number[] {
      return pathTile?.id.split("|").map(n => parseInt(n));
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
      if (this.collisionsCheck(this.mouse.vector, this.middlePointRect(rect), 22, 22)) return [xIndex, yIndex];
    },
    //general
    async saveMap() {
      let field = [];
      for (let row of this.field) {
        for (let hex of row) {
          field.push(hex);
        }
      }
      console.log({ field });
      let newMap = {
        name: this.mapName,
        field: field,
        creator: "",
      };
      try {
        await API.saveMap(newMap);
      } catch (e) {
        this.error(`couldn't save map:${e}`);
      }
    },
    error(msg: string) {
      console.error(msg);
    },
    pathfield(id: string, start: boolean, finish: boolean): type.FieldDiv {
      return { color: this.Options[0].color, type: "path", id: id, start: start, finish: finish };
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
      return Math.round(Math.random() * max);
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
