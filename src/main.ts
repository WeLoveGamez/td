import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/js/all.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEPp1rKaHb8KgBYiaelwkhViARw9SCymo",
  authDomain: "towerdefence-c7b47.firebaseapp.com",
  projectId: "towerdefence-c7b47",
  storageBucket: "towerdefence-c7b47.appspot.com",
  messagingSenderId: "688852858765",
  appId: "1:688852858765:web:e89c44b45973472b34efc4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

createApp(App).use(router).mount("#app");
