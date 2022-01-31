import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Game from "../views/Game.vue";
import MapBuilder from "@/views/MapBuilder.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/game",
    name: "Game",
    component: Game,
  },
  {
    path: "/MapBuilder",
    name: "MapBuilder",
    component: MapBuilder,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
