import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Game from "../views/Game.vue";
import MapBuilder from "@/views/MapBuilder.vue";
import Register from "@/views/Register.vue";
import Login from "@/views/Login.vue";
import Main from "@/views/Main.vue";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { ref } from "vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/main",
    name: "Main",
    component: Main,
  },
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
})

export const currentUser = ref<User | null>(null)

const getCurrentUser = () => {
    const auth = getAuth()
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            user => {
                currentUser.value = user
                unsubscribe()
                resolve(user)
            },
            reject
        )
    })
}

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    if (!(await getCurrentUser()) && requiresAuth) {
        next('/login')
    } else {
        next()
    }
})

export default router
